sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./xlsx",
	"./jszip",
	"sap/m/MessageBox"
], function (Controller, xlsx, jszip, MessageBox) {
	"use strict";
	var year;
	var flagHrAdmin = sap.ui.getCore().getModel("EmpAuthoModel").getData()[0].ROLE_HR_ADMIN;
	return Controller.extend("stipAdmin.stipAdmin.controller.uploadGate", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf stipAdmin.stipAdmin.view.uploadGate
		 */
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function (oEvent) {
			this.getOwnerComponent().getRouter().getRoute("uploadGate").attachPatternMatched(this._onObjectMatched, this);
		},
		/******************** _onObjectMatched fetches argument values and depends on role and authorization checkbox visibility********************************************/
		_onObjectMatched: function (oEvent) {
			var selectedFYPeriodi= "";
			var oArguments = oEvent.getParameter("arguments");
			year = oArguments.ID_PERIODO;
			selectedFYPeriodi = oArguments.SEL_FY_PERIODI;
			if (flagHrAdmin === "X") {
				this.getView().byId("simulato").setVisible(true);
			} else {
				this.getView().byId("simulato").setVisible(false);
			}
			this.byId("fy").setText(selectedFYPeriodi);
			this.byId("fileUploader").setValue(""); //clear page data
			this.byId("sel").setSelected(false); //clear page data
		},
		/******************** onUpload,_import methods fetches excel sheet data in JSON format ********************************************/
		onUpload: function (e) {
			this._import(e.getParameter("files") && e.getParameter("files")[0]);
		},
		_import: function (file) {
			debugger;
			var that = this;
			var oMainModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oMainModel, "uploadModel");
			var excelData = {};
			if (file && window.FileReader) {
				var reader = new FileReader();
				reader.onload = function (e) {
					var data = e.target.result;
					var workbook = XLSX.read(data, {
						type: 'binary'
					});
					workbook.SheetNames.forEach(function (sheetName) {
						// Here is your object for every sheet in workbook
						excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
						if (excelData.length > 0 && excelData[0].Id_Moltiplicatore) {

							that.getView().getModel("uploadModel").setData(excelData);
							that.getView().getModel("uploadModel").refresh(true);
							that.uploadRisultati();
						}
					});
				};
				reader.onerror = function (ex) {
					console.log(ex);
				};
				reader.readAsBinaryString(file);
			}
		},
		/******************** uploadRisultati method decides success or error message and update database  ********************************************/
		uploadRisultati: function () {
			debugger;
			var that = this;
			var rows = [];
			var selSimulato = false;
			var oMainModel1 = new sap.ui.model.json.JSONModel();
			rows = this.getView().getModel("uploadModel").getData();
			if (flagHrAdmin === "X") {
				//checkbox Simulato selection
				selSimulato = this.getView().byId("sel").getSelected();
			} else {
				selSimulato = false; //If user is other than HR_ADMIN, simulato must be false
			}
			var flagSimulato = false;
			var flagDBCheck = true;
			var flagDownload = false;
			var countErrRows = 0;
			/**************************************************** Excel sheet check started *****************************/
			if (selSimulato === false) // if checkbox Simulato = false if Risultato must be filled
			{
				for (var i = 0; i < rows.length; i++) {
					if (rows[i].Risultato === "" || rows[i].Risultato === undefined) {
						flagSimulato = true;
						break
					}
				}
				if (flagSimulato == true) {
					flagDBCheck = false; //No need to check dababase checks
					this.byId("fileUploader").setValue(""); //clear page data
					this.byId("sel").setSelected(false); //clear page data
					//MessageBox.error("La Colonna Risultato  non è presente nel file");
				}
			} else if (selSimulato === true) // if checkbox Simulato = false if Risultato.SIM  must be filled 
			{
				for (var i = 0; i < rows.length; i++) {
					if (rows[i].Risultato_SIM === "" || rows[i].Risultato_SIM === undefined) {
						flagSimulato = true;
						break
					}
				}
				if (flagSimulato == true) {
					flagDBCheck = false; //No need to check dababase checks
					this.byId("fileUploader").setValue(""); //clear page data
					this.byId("sel").setSelected(false); //clear page data
				//	MessageBox.error("La Colonna RisultatoSIM  non è presente nel file");
				}
			}
			/**************************************************** Excel sheet check ended *****************************/
			/**************************************************** Database check starts *****************************/
			//if (flagDBCheck === true) {
				var payload = {
					"rows": rows,
					selSimulato: selSimulato
				};
				$.ajax({
					url: "/HANAMDC/STIP/STIPAdmin/services/uploadGate.xsjs",
					type: "POST",
					method: "GET",
					contentType: 'application/json',
					dataType: 'text',
					data: {
						odata: JSON.stringify(payload)
					},
					success: function (data, textStatus1) {
						var obj = JSON.parse(data);
						oMainModel1.setData(obj);
						that.getView().setModel(oMainModel1, "excelDownloadModel");
						for (var i = 0; i < obj.length; i++) {
							if (obj[i].Error.error != undefined) {
								if (obj[i].Error.error === true) {
									countErrRows++;
									flagDownload = true;
								}
							}
						}
						if (flagDownload === false)
						//sucess pop up
							MessageBox.success("Caricamento di " + parseInt(obj.length) + " completato"/*, {
								onClose: function (oEvent) {
									var n = sap.ui.core.UIComponent.getRouterFor(that);
									n.navTo("Gate", {
										gate: "gate",
										str: year
									});
								}
							}*/);
						if (flagDownload === true) {
							var oLink = new sap.m.Link({
								text: "Ci sono " + countErrRows + ". Apri questo link per il log di errore",
								press: [that.handleLinkPress, that]
							});
							sap.m.MessageBox.show(oLink, {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: 'ERROR'/*,
								onClose: function (oEvent) {
									var n = sap.ui.core.UIComponent.getRouterFor(that);
									n.navTo("Gate", {
										gate: "gate",
										str: year
									});
								}*/
							});
						} //end if (flagDownload === true) 
					},
					error: function (data, textStatus1) {
						console.log(data);
					}
				});
			//}
			/**************************************************** Database check ends *************************************/
		},
		/******************** handleLinkPress method downloads excel with error message ********************************************/
		handleLinkPress: function (oEvent) {
			var oResource = this.getView().getModel("i18n").getResourceBundle();
			var oModel = this.getView().getModel('excelDownloadModel').getData();
			var columnTemplate = [
				[{
					column: "Error",
					label: oResource.getText("DownloadError")
				}, {
					column: "Id_Moltiplicatore",
					label: oResource.getText("Id_Moltiplicatore")
				}, {
					column: "Id_Fiscal_Year",
					label: oResource.getText("Id_Fiscal_Year")
				}, {
					column: "Descr_Moltiplicatore",
					label: oResource.getText("Descr_Moltiplicatore")
				}, {
					column: "Risultato",
					label: oResource.getText("Risultato")
				}, {
					column: "Risultato_SIM",
					label: oResource.getText("Risultato_SIM")
				}, {
					column: "Id_Tipo_Curva",
					label: oResource.getText("Id_Tipo_Curva")
				}, {
					column: "Identificativo_Assegnatario",
					label: oResource.getText("Molti_Identificativo_Assegnatario")
				}, {
					column: "Id_Curva",
					label: oResource.getText("Id_Curva")
				}, {
					column: "Descr_Curva",
					label: oResource.getText("Descr_Curva")
				}]
			];
			var data = [];
			var data1 = {};
			for (var i = 0; i < oModel.length; i++) {
				data1 = {
					"Error": oModel[i].Error.message === undefined ? "" : oModel[i].Error.message,
					"Id_Moltiplicatore": oModel[i].Id_Moltiplicatore === undefined ? "" : oModel[i].Id_Moltiplicatore,
					"Id_Fiscal_Year": oModel[i].Id_Fiscal_Year === undefined ? "" : oModel[i].Id_Fiscal_Year,
					"Descr_Moltiplicatore": oModel[i].Descr_Moltiplicatore === undefined ? "" : oModel[i].Descr_Moltiplicatore,
					"Risultato": oModel[i].Risultato === undefined ? "" : oModel[i].Risultato,
					"Risultato_SIM": oModel[i].Risultato_SIM === undefined ? "" : oModel[i].Risultato_SIM,
					"Id_Tipo_Curva": oModel[i].Id_Tipo_Curva === undefined ? "" : oModel[i].Id_Tipo_Curva,
					"Identificativo_Assegnatario": oModel[i].Identificativo_Assegnatario === undefined ? "" : oModel[i].Identificativo_Assegnatario,
					"Id_Curva": oModel[i].Id_Curva === undefined ? "" : oModel[i].Id_Curva,
					"Descr_Curva": oModel[i].Descr_Curva === undefined ? "" : oModel[i].Descr_Curva
				};
				data.push(data1);
			}
			var obj = {};
			obj.results = data;
		//	console.log(data);
			tablesToExcel(obj, ['MoltiplocatoreError'], columnTemplate, 'MoltiplocatoreError.xls', 'Excel');
		},
		/******************** cancel method navigates to main moltiplicatore page ********************************************/
		cancel: function () {
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "back");
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Gate", {
				gate: "gate",
				str: year
			});
		}
	});
});