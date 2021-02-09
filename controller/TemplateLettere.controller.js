sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/ui/richtexteditor/RichTextEditor",
	"../service/RepoService",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/BusyIndicator",
	"stipAdmin/stipAdmin/util/Formatter", "stipAdmin/stipAdmin/libs/html2pdf"
], function (Controller, RichTextEditor, RepoService, MessageBox, JSONModel, BusyIndicator, Formatter, html2pdfjs) {
	"use strict";
	var mode = "";
	var ID_TEMPLATELETTERA, max_id, edit_id;
	var user = sap.ui.getCore().getModel("EmpAuthoModel").getData()[0].user;
	var oMainModel = new JSONModel();

	return Controller.extend("stipAdmin.stipAdmin.controller.TemplateLettere", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {

			this.getOwnerComponent().getRouter().getRoute("TemplateLettere").attachPatternMatched(this._onObjectMatched, this);

		},
		/******************** _onObjectMatched fetches argument values and depends on role and authorization checkbox visibility********************************************/
		_onObjectMatched: function () {
			this.byId("templateResultTable").setVisible(false);
			this.byId("variables").setVisible(false);
			this.getFiscalYear(0);
			

			//set the empty settings for table and text editor

			if (sap.ui.getCore().oRichTextEditor1) {
				sap.ui.getCore().oRichTextEditor1.destroy();
			}
		},
		/******************** getFiscalYear function calls generic.xsjs ,payload is ID_PERIODO and output is fiscal year****************************/
		getFiscalYear: function (val) {
			debugger;
			BusyIndicator.show();
			var sPayload = {
				"ID_PERIODO": 1
			};
			sPayload = JSON.stringify(sPayload);
			var that = this;

			var url = "/HANAMDC/STIP/STIPAdmin/services/generic.xsjs";
			$.ajax({
				url: url,
				type: "GET",
				contentType: "application/json",
				data: {
					odata: sPayload
				},
				success: function (data1, textStatus1) {
					debugger;
					console.log(data1);

					max_id = data1[16].ID_TEMPLATELETTERA;
					if(val===0){
					oMainModel.setData([{
						Filter: data1[15].TIPOTEMPLATE
					}]);
					that.getView().setModel(oMainModel, "LetterModel");
					that.getTags();
					}
					//that.byId("templateResultTable").setVisible(false);
					BusyIndicator.hide();
				},
				error: function (data1, textStatus1) {
					BusyIndicator.hide();
				}
			});
		},
		/******************** home function naviagtes the user to the Home Page of the StipAdmin module********************************************/
		home: function () {
			debugger;
			this.clear();

			sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
		},
		//aditya
		clear: function () {
			/*	var data = [];
				oMainModel.setData(data);
				this.getView().setModel(oMainModel, "SchedaMasterModel");
				oMainModel.refresh();*/
		//	this.byId("vsdFilterBar").setVisible(false);
		//	this.byId("vsdFilterLabel").setText("");
			//	resetting filter
			if (sap.ui.getCore().byId("FilterDialogTemplateLettre") !== undefined) {
				var aFilterItems = sap.ui.getCore().byId("FilterDialogTemplateLettre").getFilterItems();
				aFilterItems.forEach(function (item) {
					var aItems = item.getItems();
					aItems.forEach(function (item) {
						item.setSelected(false);
					});
				});
			}
			if (this.byId("sid").getValue())
				this.byId("sid").setValue("");
			
			if (this.byId("nome").getValue())
				this.byId("nome").setValue("");

			if (this.byId("desc").getValue())
				this.byId("desc").setValue("");
			if (this.byId("tipoTemplate").getSelectedKey())
				this.byId("tipoTemplate").setSelectedKey("");
			if (this.byId("gestionali").getSelectedKey())
				this.byId("gestionali").setSelectedKey("");
			if (this.byId("modificabile").getSelectedKey())
				this.byId("modificabile").setSelectedKey("");
			if (this.byId("dismesso").getSelectedKey())
				this.byId("dismesso").setSelectedKey("");
			if (this.byId("automatici").getSelectedKey())
				this.byId("automatici").setSelectedKey("");
			/*	this.onSearch();
				var oTable = this.getView().byId("tbl");
				var aBinding = oTable.getBinding("items");
				aBinding.filter([]);*/
			/*	if (this.byId("box4").getSelectedKey())
					this.byId("box4").setSelectedKey("");*/
		},
		//aditya
		/******************** getTags function is used to fetch the data from T_TEMPLATELETTERE_TAGS and sets the LetterModel********************************************/
		getTags: function () {
			debugger;
			var that = this;
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");

			xsoDataModel.read("/T_TEMPLATELETTERE_TAGS?$format=json", {

				success: function (oDataIn, oResponse) {
					debugger;
					var data = oDataIn.results
					var filter = oMainModel.getData()[0].Filter;
					oMainModel.setData([]);
					var data1 = [{
						Filter: filter
					}, {
						Main: []
					}, {
						Tags: data
					}];
					oMainModel.setData(data1);
					oMainModel.refresh();
					that.getView().setModel(oMainModel, "LetterModel");
					//that.byId("templateResultTable").setVisible(true);

					sap.ui.core.BusyIndicator.hide(0);
				},
				error: function (oDataIn, oResponse) {
					debugger;
					sap.ui.core.BusyIndicator.hide(0);
				}
			});

		},
		/******************** onClickPulisci function restores default filter values of the filterbar as blank********************************************/

		onClickPulisci: function () {
			this._closeEditor();
			this.byId("sid").setValue(""),
				this.byId("nome").setValue(""),
				this.byId("desc").setValue(""),
				this.byId("tipoTemplate").setSelectedKey(""),
				this.byId("gestionali").setSelectedKey(""),
				this.byId("modificabile").setSelectedKey(""),
				this.byId("dismesso").setSelectedKey(""),
				this.byId("automatici").setSelectedKey("");
		},
		/******************** onClickRicerca function fetches all HANA existing templates (TEMPLATELETTERE) according to the filter values and show in the table ********************************************/

		onClickRicerca: function () {
			var oFilters = [];
			this._closeEditor();
			var sid = this.byId("sid").getValue(),
				nome = this.byId("nome").getValue(),
				desc = this.byId("desc").getValue(),
				tipoTemplate = this.byId("tipoTemplate").getSelectedKey(),
				gestionali = this.byId("gestionali").getSelectedKey(),
				modificabile = this.byId("modificabile").getSelectedKey(),
				dismesso = this.byId("dismesso").getSelectedKey(),
				automatici = this.byId("automatici").getSelectedKey();

			if (sid !== "")
				oFilters.push(new sap.ui.model.Filter("ID_TEMPLATELETTERA", sap.ui.model.FilterOperator.EQ, sid));
			if (tipoTemplate !== "")
				oFilters.push(new sap.ui.model.Filter("ID_TIPOTEMPLATE", sap.ui.model.FilterOperator.EQ, tipoTemplate));
			if (nome !== "")
				oFilters.push(new sap.ui.model.Filter({
					path: 'NOMETEMPLATE',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: nome,
					caseSensitive: false
				}));
			if (desc !== "")
				oFilters.push(new sap.ui.model.Filter({
					path: 'DESCRIZIONE',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: desc,
					caseSensitive: false
				}));
			if (gestionali !== "")
				oFilters.push(new sap.ui.model.Filter("SN_GESTIONALI", sap.ui.model.FilterOperator.EQ, gestionali));
			if (modificabile !== "")
				oFilters.push(new sap.ui.model.Filter("SN_MODIFICABILE", sap.ui.model.FilterOperator.EQ, modificabile));
			if (dismesso !== "")
				oFilters.push(new sap.ui.model.Filter("SN_DISMESSO", sap.ui.model.FilterOperator.EQ, dismesso));
			if (automatici !== "")
				oFilters.push(new sap.ui.model.Filter("SN_ASSOCIAZIONEAUTO", sap.ui.model.FilterOperator.EQ, automatici));

			this.getTemplateLetter(oFilters, 1);
		},
		/******************** getTemplateLetter function fetches the data from TEMPLATELETTERE, sets the mode to edit if match is found else reports error
		It also sets the title of the table********************************************/
		getTemplateLetter: async function (oFilters, f) {
			sap.ui.core.BusyIndicator.show(0);
			var that = this;
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");

			xsoDataModel.read("/V_TEMPLATELETTERE?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;
					var data = oDataIn.results;
					if (f === 0) {
						that.lettere = data[0].BODYTEMPLATE;
						that.edit = data[0];
						mode = "Edit";
						edit_id = data[0].ID_TEMPLATELETTERA
					} else {

						for (var i = 0; i < data.length; i++) {
							if(data[i].ID_TEMPLATELETTERA <1)
							data.splice(i,1);
						}
							for (var i = 0; i < data.length; i++) {
							if (data[i].SN_GESTIONALI === "S")
								data[i].SN_GESTIONALI = "Si";
							else
								data[i].SN_GESTIONALI = "No"

							if (data[i].SN_DISMESSO === "S")
								data[i].SN_DISMESSO = "Si";
							else
								data[i].SN_DISMESSO = "No"

							if (data[i].SN_MODIFICABILE === "S")
								data[i].SN_MODIFICABILE = "Si";
							else
								data[i].SN_MODIFICABILE = "No";
								
							
							if (data[i].DATA){
									if (typeof (data[i].DATA) === "string" && data[i].DATA.includes("Date")) {
							data[i].DATA = new Date(parseInt(data[i].DATA.substring(6, data[i].DATA.length - 2), 10));
							
								if (data[i].DATA.getFullYear()<0)
								data[i].DATA = "";
								else
								data[i].DATA = Formatter.removetime(data[i].DATA);
						}else{
							if (new Date(data[i].DATA).getFullYear().toString().includes("-"))
								data[i].DATA = "";
							else
								data[i].DATA = Formatter.removetime(data[i].DATA);
						}
							}
							

						}

						var filter = oMainModel.getData()[0].Filter;
						var tags = oMainModel.getData()[2].Tags;

						var filter = oMainModel.getData()[0].Filter;
						var tags = oMainModel.getData()[2].Tags;

						var data1 = [{
							Filter: filter
						}, {
							Main: data
						}, {
							Tags: tags
						}];
						oMainModel.setData(data1);
						oMainModel.refresh();
						that.getView().setModel(oMainModel, "LetterModel");
						that.byId("templateResultTable").setVisible(true);
						var count = that.getView().getModel("LetterModel").getData()[1].Main.length;
						var txt = that.getView().getModel("i18n").getResourceBundle().getText("HomeTemplateLettere") + " (" + count + ")";
						that.byId("title").setText(txt);
					}

					sap.ui.core.BusyIndicator.hide(0);
				},
				error: function (oDataIn, oResponse) {
					debugger;
					sap.ui.core.BusyIndicator.hide(0);
				}
			});

		},
		/******************** getTemplateLetterPromise function fetches the data from TEMPLATELETTERE; If the match is found,sets the mode to edit else reports error********************************************/
		getTemplateLetterPromise: async function (oFilters, f) {
			var that = this;
			return new Promise(
				function (resolve, reject) {
					sap.ui.core.BusyIndicator.show(0);

					var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");

					xsoDataModel.read("/TEMPLATELETTERE?$format=json", {
						filters: oFilters,
						success: function (oDataIn, oResponse) {
							debugger;
							var data = oDataIn.results;
							if (f === 0) {
								//that.lettere = data[0].BODYTEMPLATE;
								resolve(data[0].BODYTEMPLATE); //It fetches template letter body.txt file
								that.edit = data[0];
								mode = "Edit";
								edit_id = data[0].ID_TEMPLATELETTERA
							} else {

								for (var i = 0; i < data.length; i++) {
									if (data[i].SN_GESTIONALI === "S")
										data[i].SN_GESTIONALI = "Si";
									else
										data[i].SN_GESTIONALI = "No"

									if (data[i].SN_DISMESSO === "S")
										data[i].SN_DISMESSO = "Si";
									else
										data[i].SN_DISMESSO = "No"

									if (data[i].SN_MODIFICABILE === "S")
										data[i].SN_MODIFICABILE = "Si";
									else
										data[i].SN_MODIFICABILE = "No"

									if (data[i].DATA.getFullYear().toString().includes("-"))
										data[i].DATA = "";
									else
										data[i].DATA = Formatter.removetime(data[i].DATA);

								}
								var filter = oMainModel.getData()[0].Filter;
								var tags = oMainModel.getData()[2].Tags;

								var data1 = [{
									Filter: filter
								}, {
									Main: data
								}, {
									Tags: tags
								}];
								oMainModel.setData(data1);
								oMainModel.refresh();
								that.getView().setModel(oMainModel, "LetterModel");
								that.byId("templateResultTable").setVisible(true);
							}

							sap.ui.core.BusyIndicator.hide(0);
						},
						error: function (oDataIn, oResponse) {
							debugger;
							reject("error");
							sap.ui.core.BusyIndicator.hide(0);
						}
					});
				});

		},
		/******************** onClickNuovo function is used to create a new template and calls the _GenerateTextEditorNew function passing the default values********************************************/
		onClickNuovo: function (oEvent) {
			//this.byId("templateResultTable").setVisible(false);

			var htmlnew =
				'<p></p> ';
			mode = "New";
			this._GenerateTextEditorNew(htmlnew);
		},
		/******************** _GetLetteraHtml function retrieves the current file name based on ID_TEMPLATELETTERA********************************************/

		_GetLetteraHtml: async function (oEvent, sid) {
			//Get file name from DB TEMPLATELETTERE.BODYTEMPLATE
			debugger;
			var oFilters = [];
			oFilters.push(new sap.ui.model.Filter("ID_TEMPLATELETTERA", sap.ui.model.FilterOperator.EQ, sid));
			var bodyText = await this.getTemplateLetterPromise(oFilters, 0); //Body text contains template letter file name
			var result = await RepoService.getFiles(bodyText, "TEMPLATE_LETTERA"); //getFiles method of RepoService is called
			if (result === undefined)
				MessageBox.error("Scusate. File non trovato!"); //Error message displayed 'Sorry. File not found!'
			else {
				mode = "Edit";
				this._GenerateTextEditorNew(result);
			}
		},
		/******************** _GenerateTextEditorNew function generates a new template and displays Save and Cancel buttons********************************************/

		_GenerateTextEditorNew: function (valueHtml) {

			var that = this;
			this.byId("templateResultTable").setVisible(false);
			this.byId("variables").setVisible(true);

			if (sap.ui.getCore().oRichTextEditor1) {
				sap.ui.getCore().oRichTextEditor1.destroy();
			}
			//se è un taplate nuovo devo fare la chiamta
			//creates a new text editor
			sap.ui.getCore().oRichTextEditor1 = new RichTextEditor("myRTE", {
				editorType: sap.ui.richtexteditor.EditorType.TinyMCE4,
				width: "100%",
				height: "600px",
				customToolbar: true,
				showGroupFont: true,
				showGroupLink: true,
				showGroupInsert: true,
				showGroupClipboard: false,
				value: valueHtml,
				ready: function () {
					this.addButtonGroup("styleselect").addButtonGroup("table");
				}
			});
			that.getView().byId("idVerticalLayout").setVisible(true);
			that.getView().byId("idVerticalLayout").addContent(sap.ui.getCore().oRichTextEditor1);
			that.getView().byId("editorButton").setVisible(true);
			that.getView().byId("buttonSave").setVisible(true);
			that.getView().byId("cancel").setVisible(true);

		},
		/******************** _openFragment function creates a dialog that shows the values in FS; If is a New Mode data needs to be chosen; In edit mode they are already populated********************************************/

		_openFragment: function () {
			this.oDialogFragment = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.templateLetter", this.getView().getController());
			this.getView().addDependent(this.oDialogFragment);
			if (mode === "Edit") {
				sap.ui.getCore().byId("tipoTemplate").setSelectedKey(this.edit.ID_TIPOTEMPLATE);
				sap.ui.getCore().byId("desc").setValue(this.edit.DESCRIZIONE);
				sap.ui.getCore().byId("modificabile").setSelectedKey(this.edit.SN_MODIFICABILE);
				sap.ui.getCore().byId("txtNome").setValue(this.edit.NOMETEMPLATE);
				sap.ui.getCore().byId("gestionali").setSelectedKey(this.edit.SN_GESTIONALI);
				sap.ui.getCore().byId("dismesso").setSelectedKey(this.edit.SN_DISMESSO);
			}

			this.oDialogFragment.open();

			//this._saveLettera();
		},
		/******************** onCloseDialog function is used to close the templateLetter fragment********************************************/
		onCloseDialog: function () {
			this.oDialogFragment.destroy();
		},
		/******************** _saveLettera function is used to fetch the mode; If mode is New then ID_TEMPLATELETTERA is set to max_id
		 else if mode is Edit, then ID_TEMPLATELETTERA is set to edit_id********************************************/
		// : before calling this function we need to retrieve the values from the dialog
		_saveLettera: function () {
			debugger;
			sap.ui.core.BusyIndicator.show(0);
			var that = this;
			if (mode === "" || mode === undefined || mode === "New") {
				mode = "New";
				ID_TEMPLATELETTERA = max_id;
			} else if (mode === "Edit") {
				if (sap.ui.getCore().byId("txtNome").getValue() !== that.edit.NOMETEMPLATE) {
					mode = "New";
					ID_TEMPLATELETTERA = max_id;
				} else {
					mode = "Edit";
					ID_TEMPLATELETTERA = edit_id;

				}
			}

			//STRING HTML
			var textHtml = sap.ui.getCore().oRichTextEditor1.getValue();
			//CONVERSION TO PDF
			var htmlObject = document.createElement('div');
			htmlObject.innerHTML = textHtml;

			var opt = {
				margin: 1,
				filename: 'myfile.pdf',
				image: {
					type: 'jpeg',
					quality: 0.98
				},
				html2canvas: {
					scale: 2
				},
				jsPDF: {
					unit: 'in',
					format: 'letter',
					orientation: 'portrait'
				}
			};
			//html2pdf().from(htmlObject).set(opt).save();  IF YOU WANT TO DOWNLOAD THE PDF

			// : 	
			//if mode ===  "New" insert a new row in hana db with a new ID_TEMPLATELETTERA get the greatest id and +1
			// if mode === "Edit" and the name remains the same we update the exsting row of hana Db the ID_ID_TEMPLATELETTERA remains the same
			// if mode === "Edit" but the name changed insert a new row in hana db with a new ID_TEMPLATELETTERA

			html2pdf().from(htmlObject).set(opt).outputPdf('blob').then(function (blob) {
				//CREATE FILE TYPE

				var today = new Date();
				/*********Creating template letter pdf and text files*********/
				var filenamePDF = "TemplateLettere-bodytemplate-" + ID_TEMPLATELETTERA + ".pdf";
				this.filenameTXT = "TemplateLettere-bodytemplate-" + ID_TEMPLATELETTERA + ".txt";
				var fPdf = new File([blob], filenamePDF, {
					type: "application/pdf",
					lastModifiedDate: today
				});

				var blob2 = new Blob([textHtml], {
					type: "text/plain;charset=utf-8"
				});
				var fText = new File([blob2], this.filenameTXT, {
					type: "text/plain",
					lastModifiedDate: today
				});
				//var fileArray = [fPdf, fText];
				var fileArray = [fText];
				that.onSendFileDMS(fileArray); //Sending file to the DMS Server
			});
		},
		/******************** onSendFileDMS function is used to delete the existing file and upload the new one********************************************/
		onSendFileDMS: async function (fileArray) {
			var count = 0;
			var that = this;
			for (var i = 0; i < fileArray.length; i++) {
				var Errmsg = "noErr";
				try {
					await RepoService.deleteFile(fileArray[i].name, "TEMPLATE_LETTERA");
				} catch (e) {
					if (e.status === 404) {
						Errmsg = "404"
					}
				} finally {
					if (Errmsg === "noErr" || Errmsg === "404") {
						await RepoService.uploadFile(fileArray[i], "TEMPLATE_LETTERA");
						count++

					}

				}
			}
			if (count === fileArray.length) {
				// : 	
				//if mode ===  "New" insert a new row in hana db with a new ID_TEMPLATELETTERA
				// if mode === "Edit" and the name remains the same we update the exsting row of hana Db
				// if mode === "Edit" but the name changed insert a new row in hana db with a new ID_TEMPLATELETTERA
				debugger;

				var sPayload = {
					ID_TEMPLATELETTERA: ID_TEMPLATELETTERA,
					ID_TIPOTEMPLATE: sap.ui.getCore().byId("tipoTemplate").getSelectedKey(),
					DESCRIZIONE: sap.ui.getCore().byId("desc").getValue(),
					SN_MODIFICABILE: sap.ui.getCore().byId("modificabile").getSelectedKey(),
					NOMETEMPLATE: sap.ui.getCore().byId("txtNome").getValue(),
					BODYTEMPLATE: fileArray[0].name,
					INSERITODA: user.substring(0, 10),
					SN_GESTIONALI: sap.ui.getCore().byId("gestionali").getSelectedKey(),
					SN_DISMESSO: sap.ui.getCore().byId("dismesso").getSelectedKey(),
					DATA: new Date(),
					mode: mode
				};
				sPayload = JSON.stringify(sPayload);
				var that = this;
				console.log(sPayload);

				var url = "/HANAMDC/STIP/STIPAdmin/services/templateLetter.xsjs";
				$.ajax({
					url: url,
					type: "GET",
					contentType: "application/json",
					data: {
						odata: sPayload
					},
					success: function (data1, textStatus1) {
						debugger;
						console.log(data1);
						that.onCloseDialog();
						BusyIndicator.hide();

						MessageBox.success( "Documento aggiornato", { // Success message displayed 'Updated file in the document'
							onClose: function (oEvent) {
								debugger;
								console.log("Onclose");
								oMainModel.refresh();
								that.getFiscalYear(1);
								that.onClickRicerca();
							}
						});
					},
					error: function (data1, textStatus1) {
						debugger;
						that.onCloseDialog();
						BusyIndicator.hide();
						MessageBox.error("Errore aggionarmento documentale"); //Error message displayed 'Document Update Error'
					}
				});

			} else {
				that.onCloseDialog();
				BusyIndicator.hide();
				MessageBox.error("Errore aggionarmento documentale"); //Error message displayed 'Document Update Error'
			}

		},
		/******************** _closeEditor function is used to set the mode as blank ********************************************/
		_closeEditor: function () {
			if (sap.ui.getCore().oRichTextEditor1) {
				sap.ui.getCore().oRichTextEditor1.destroy();
			}
			mode = "";
			this.getView().byId("buttonSave").setVisible(false);
			this.getView().byId("cancel").setVisible(false);
			this.byId("templateResultTable").setVisible(true);
			this.byId("variables").setVisible(false);

		},
		/******************** onpressVariables function is used to retrieve from the select by fetching the token values********************************************/
		_onpressVariables: function (press) {
			if (sap.ui.getCore().oRichTextEditor1) {
				var sOldValue = sap.ui.getCore().oRichTextEditor1.getValue();
				var n = sOldValue.lastIndexOf("</p>");
				var sub0 = sOldValue.substring(0, n);
				var sub1 = sOldValue.substring(n, sOldValue.length);

				//  To retrieve from the select
				var tokenToadd = this.byId("variables").getSelectedKey();

				var finalHtml = sub0 + tokenToadd + sub1;
				sap.ui.getCore().oRichTextEditor1.setValue(finalHtml);
				this.byId("variables").setSelectedKey("");
			}
		},

	});
});