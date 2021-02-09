sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/m/MessageBox",
	"stipAdmin/stipAdmin/util/Formatter",
	"sap/ui/model/Sorter",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/Fragment"
], function (Controller, JSONModel, Device, MessageBox, Formatter, Sorter, BusyIndicator,Fragment) {
	"use strict";
	var oMainModel = new JSONModel();
	var oMainModel1 = new JSONModel();
	var oMainModel2 = new JSONModel();
	return Controller.extend("stipAdmin.stipAdmin.controller.GestioneListclusDetail", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {

			this.busyDialog = new sap.m.BusyDialog();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("GestioneListclusDetail").attachPatternMatched(this._onObjectMatched, this);
		},
		/******************** _onObjectMatched fetches argument values and depends on role and authorization checkbox visibility********************************************/
		_onObjectMatched: function (oEvent) {
			debugger;
			var oArgs = oEvent.getParameter("arguments");
			var that = this;
			//if (oArgs.ID) {
			that.ID = oArgs.ID;

			that.period = ((sap.ui.getCore().getModel("fiscalyear")) ? (sap.ui.getCore().getModel("fiscalyear").getData()) : "");
			this.getListDetail();

		},
		/******************** getListDetail fetches the data from the backend based on the ID_LISTA and 
		then calls the displayList function to display the corresponding list ********************************************/
		getListDetail: function () {
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			var oFilters = [],
				that = this;
			oFilters.push(new sap.ui.model.Filter("ID_LISTA", sap.ui.model.FilterOperator.EQ, this.ID));
			xsoDataModel.read("/V_LISTE_MAIN?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					that.oEntry = {
						ID: that.ID,
						DescrizioneLista: oDataIn.results[0].DESCR_LISTA,
						Count: oDataIn.results[0].COUNT_MATRICOLA,
						fiscal: that.period
					};
					that.displayList();
				},
				error: function () {}
			});
		},
		/******************** displayList function fetches the data from the backend(V_LISTE) and displays the list********************************************/
		displayList: function () {
			BusyIndicator.show();
			var data1 = [],
				data2 = [],
				oFilters = [],
				orig = [],
				that = this;
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			/*var filter1 = new sap.ui.model.Filter("ID_LISTA", sap.ui.model.FilterOperator.EQ, this.ID);
			oFilters.push(filter1);*/
			xsoDataModel.read("/V_LISTE?$format=json", {
				//filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;
					var data = oDataIn.results;
					var today = new Date();
					var count = 0;
					for (var i = 0; i < data.length; i++) {
						if (data[i].DATA_CESSAZIONE !== null && data[i].DATA_CESSAZIONE !== "NULL" && data[i].DATA_CESSAZIONE !== "") {
							var date = data[i].DATA_CESSAZIONE.substr(0, 4) + "-" + data[i].DATA_CESSAZIONE.substr(4, 2) + "-" + data[i].DATA_CESSAZIONE
								.substr(6, 2);
							date = new Date(date);
							if (date > today)
								date = "nolineThrough";

							else
								date = "lineThrough";
							//count = count + 1;
							data2.push({
								SUPERID: data[i].SUPERID,
								MATRICOLA: data[i].MATRICOLA,
								NOME: data[i].COGNOME + " " + data[i].NOME,
								BAND: data[i].BAND,
								DIREZIONE: data[i].DESCRIZIONE,
								DIP_DESCR: data[i].DIP_DESCR,
								DATA_CESSAZIONE: data[i].DATA_CESSAZIONE,
								date: date
							});
						} else {
							date = "nolineThrough";
							data2.push({
								SUPERID: data[i].SUPERID,
								MATRICOLA: data[i].MATRICOLA,
								NOME: data[i].COGNOME + " " + data[i].NOME,
								BAND: data[i].BAND,
								DIREZIONE: data[i].DESCRIZIONE,
								DIP_DESCR: data[i].DIP_DESCR,
								DATA_CESSAZIONE: data[i].DATA_CESSAZIONE,
								date: date
							});
						}
						if (data[i].ID_LISTA === parseInt(this.ID, 10)) {
							if (data[i].DATA_CESSAZIONE !== null && data[i].DATA_CESSAZIONE !== "NULL" && data[i].DATA_CESSAZIONE !== "") {
								var date = data[i].DATA_CESSAZIONE.substr(0, 4) + "-" + data[i].DATA_CESSAZIONE.substr(4, 2) + "-" + data[i].DATA_CESSAZIONE
									.substr(6, 2);
								date = new Date(date);
								if (date > today)
									date = "nolineThrough";
								else {
									date = "lineThrough";

								}

							} else
								date = "nolineThrough";
							data1.push({
								SUPERID: data[i].SUPERID,
								MATRICOLA: data[i].MATRICOLA,
								NOME: data[i].COGNOME + " " + data[i].NOME,
								BAND: data[i].BAND,
								DIREZIONE: data[i].DESCRIZIONE,
								DIP_DESCR: data[i].DIP_DESCR,
								DATA_CESSAZIONE: data[i].DATA_CESSAZIONE,
								date: date
							});
						}

					}
					if (data1.length === 0) {
						this.byId("tblPersonList").setVisible(false);
						this.byId("empty").setVisible(true);
					} else {
						this.byId("empty").setVisible(false);
						this.byId("tblPersonList").setVisible(true);
						this.count = data1.length;

					}
					var data11 = [],
						m = {};
					for (var i = 0; i < data2.length; i++) {
						var v = data2[i],
							vv = data2[i].MATRICOLA;
						if (!m[vv]) {
							data11.push(v);
							m[vv] = true;
						}
					}
					//const Orig_data = data1;
					this.oEntry.Count = data1.length;
					var data = [{
							"Header": this.oEntry
						}, {
							"Data": data1
						}, {
							Data2: data11
						}
						/*, {
												Original: orig
											}*/
					];
					oMainModel.setData(data);
					console.log(count);
					//oMainModel2.setData(data1);
					console.log(oMainModel.getData());
					this.getView().setModel(oMainModel, "GestioneDetailModel");
					//console.log(data2);
					debugger;
					xsoDataModel.read("/V_LISTE?$format=json", {
						//filters: oFilters,
						success: function (oDataIn, oResponse) {
							var direzioneData = "";
							var arrayDirezione = [],
								duplicateArray = [];
							for (var i = 0; i < oDataIn.results.length; i++) {

								//**********************start of removing duplicate DIREZIONE**************************
								if (oDataIn.results[i].DIREZIONE !== null && oDataIn.results[i].DIREZIONE !== "") {
									var DIREZIONE = oDataIn.results[i].DIREZIONE;
									if (!duplicateArray[DIREZIONE]) {
										direzioneData = {
											"DIREZIONE": DIREZIONE,
											"DESCRIZIONE": oDataIn.results[i].DESCRIZIONE
										};
										duplicateArray[DIREZIONE] = true;
										console.log(direzioneData);
										arrayDirezione.push(direzioneData);
									}
								}
								//**********************end of removing duplicate DIREZIONE**************************
							}
							arrayDirezione.unshift({
								DIREZIONE: ""
							});
							console.log(arrayDirezione);
							oMainModel1.setData(arrayDirezione);
							that.getView().setModel(oMainModel1, "direzioneModel");

						},
						error: function (error) {

						}
					});

					data = [];
					BusyIndicator.hide();

				}.bind(this),
				error: function (oError) {
					//Handle the error
					BusyIndicator.hide();
					this.byId("tblPersonList").setVisible(false);
					this.byId("empty").setVisible(true);
					MessageBox.error("Data fetch failed while getting Liste Details. Please contact administrator.");
				}.bind(this)
			});
		},
		/******************** onPressView function accesses the OrgDialog fragment ********************************************/

		onPressView: function (oEvent) {
			this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.OrgDialog", this);
			this.getView().addDependent(this._oValueHelpDialog);
			this.jModel1 = new JSONModel();
			this.jModel1.setData(this.data3);
			this.getView().setModel(this.jModel1);
			this._oValueHelpDialog.open();
		},
		/********************onCloseView function closes the Dialog box********************************************/
		onCloseView: function (oEvent) {
			this._oValueHelpDialog.destroy();
		},
		/******************** onPressDelete function seeks confirmation from the user for deletion********************************************/
		/******************** If user input is NO then no action taken ********************************************/
		/******************** If user input is OK then invokes elimina function********************************************/
		onPressDelete: function (oEvent, matr) {
			debugger;
			var that = this;
			this.matricola = matr;
			MessageBox.confirm("Sei sicuro di voler eliminare?", { //Confirmation message displayed 'Are you sure you want to delete?'
				actions: ["Si", sap.m.MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction == "NO") {
						//that.onBackPage();
					} else if (oAction == "Si") {
						that.elimina();
					}
				}
			});
		},
		/******************** elimina function is used to deletes the selected record********************************************/
		elimina: function () {
			debugger;
			var that = this;

			var sPayload = {
				"MATRICOLA": this.matricola,
				"ID_LISTA": this.ID
			};
			sPayload = JSON.stringify(sPayload);
			console.log(sPayload);
			console.log(JSON.stringify(sPayload));
			$.ajax({
				url: "/HANAMDC/STIP/STIPAdmin/services/delete_liste_person.xsjs",
				type: "POST",
				method: "GET",
				contentType: 'application/json',
				data: {
					odata: sPayload
				},
				dataType: 'text',
				success: function (data, textStatus1) {
					debugger;
					console.log(data);

					MessageBox.success(
						"Cancellazione avvenuta con successo", { //Success message displayed 'Deletion successful'
							onClose: function (oEvent) {
								debugger;
								console.log("Onclose");
								//that.onBackPage();
								that.displayList();
								oMainModel.getData()[0].Header.Count = oMainModel.getData()[1].Data.length;
								oMainModel.refresh();

							}
						});
				},
				error: function (data, textStatus1) {
					debugger;
					console.log(data);
					MessageBox.error("Error while perfoming delete operation. Please contact administrator.");
					jQuery.sap.log.getLogger().error("delete operation failed" + textStatus1.toString());
				}
			});
			oMainModel.refresh();
		},
		/******************** onTreeSelect TO BE DISCUSSED ********************************************/
		onTreeSelect: function (oEvent) {
			//	sap.ui.getCore().byId("empDipartimento").setValue(oEvent.getSource().getTitle());
			sap.ui.getCore().byId("empDipartimento1").setValue(oEvent.getSource().getTitle());
			this._oValueHelpDialog.destroy();
		},
		/******************** onHomePage function allows the user to navigate to the Home Page of STIPAdmin module ********************************************/
		onHomePage: function (oEvent) {
			this.getView().byId("idSearchBox").setValue("");
			var oTable = this.getView().byId("tblPersonList");
            var aBinding = oTable.getBinding("items");
            aBinding.filter([]);
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
			this.busyDialog.close();
		},
		/******************** onTableSearch function displays the table data based on the search value
		(DIP_DESCR, DIREZIONE, NOME, MATRICOLA, BAND)on the Toolbar just above the table********************************************/
		onTableSearch: function () {
			debugger;
			var idSearchBox = this.byId("idSearchBox").getValue().trim();
			var aFilters = [];
			if (idSearchBox !== "" || idSearchBox !== null) {
				var filter1 = new sap.ui.model.Filter("DIP_DESCR", sap.ui.model.FilterOperator.Contains, idSearchBox);
				aFilters.push(filter1);
				var filter2 = new sap.ui.model.Filter("DIREZIONE", sap.ui.model.FilterOperator.Contains, idSearchBox);
				aFilters.push(filter2);
				var filter3 = new sap.ui.model.Filter("NOME", sap.ui.model.FilterOperator.Contains, idSearchBox);
				aFilters.push(filter3);

				var filter5 = new sap.ui.model.Filter("MATRICOLA", sap.ui.model.FilterOperator.Contains, idSearchBox);
				aFilters.push(filter5);

				var filter4 = new sap.ui.model.Filter("BAND", sap.ui.model.FilterOperator.EQ, idSearchBox);
				aFilters.push(filter4);
				var oTable = this.byId("tblPersonList");
				var aBinding = oTable.getBinding("items");
				console.log(aBinding);
				aBinding.filter(new sap.ui.model.Filter({
					filters: aFilters,
					OR: true // AND operator true will check all of the filter conditions get satisfied
				}));
			}
		},
		/******************** onBackPage function allows the user to navigate to the previous page ********************************************/
		onBackPage: function (oEvent) {
			this.getView().byId("idSearchBox").setValue("");
			var oTable = this.getView().byId("tblPersonList");
            var aBinding = oTable.getBinding("items");
            aBinding.filter([]);
			//this.checkPerson();
			this.busyDialog.open();
			oMainModel.setData([]);
			sap.ui.core.UIComponent.getRouterFor(this).navTo("GestioneListclus");
			this.busyDialog.close();
		},
		/******************** listCount function fetches the number of lists present********************************************/
		listCount: function (count) {
			var sTitle = this.getView().getModel("i18n").getResourceBundle().getText("NumeroListe", [count]);
			this.getView().byId("titlePersonList").setText(sTitle);
		},
		/******************** onPressAggiungiPersone function accesses the AggiungiPersone fragment ********************************************/
		onPressAggiungiPersone: function (oEvent) {

			this.oDialogFragment = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.AggiungiPersone", this.getView().getController());
			this.getView().addDependent(this.oDialogFragment);

			sap.ui.getCore().byId("tblPersonList1").setVisible(false);
			this.oDialogFragment.open();
		},
		/******************** onCloseDialog function will close the current dialog box********************************************/
		onCloseDialog: function () {
			if (this.oDialogFragment) {
				this.oDialogFragment.destroy();
			}
		},
		/******************** onAvvio function fetches the data of the fields(idtxt, dept, matricola, dir, txtNome, band)
		and if they are non-empty then will be displayed********************************************/
		onAvvio: function (oEvent) {
			debugger;
			var idd = sap.ui.getCore().byId("idtxt").getValue();
			var dept = sap.ui.getCore().byId("idTree").getValue();
			var matricola = sap.ui.getCore().byId("matricola").getValue();
			var dir = sap.ui.getCore().byId("dir")._getSelectedItemText();
			var nome = sap.ui.getCore().byId("txtNome").getValue();
			var band = sap.ui.getCore().byId("band").getValue();
			// add filter for search
			var aFilters = [];
			//var sQuery = oEvent.getSource().getValue();
			if (idd !== "") {
				var filter = new sap.ui.model.Filter("SUPERID", sap.ui.model.FilterOperator.Contains, idd);
				aFilters.push(filter);
			}
			if (dept !== "") {
				var filter = new sap.ui.model.Filter("DIP_DESCR", sap.ui.model.FilterOperator.Contains, dept);
				aFilters.push(filter);
			}
			if (dir !== "") {
				var filter = new sap.ui.model.Filter("DIREZIONE", sap.ui.model.FilterOperator.Contains, dir);
				aFilters.push(filter);
			}
			if (nome !== "") {
				var filter = new sap.ui.model.Filter("NOME", sap.ui.model.FilterOperator.Contains, nome);
				aFilters.push(filter);
			}
			if (band !== "") {
				var filter = new sap.ui.model.Filter("BAND", sap.ui.model.FilterOperator.EQ, band);
				aFilters.push(filter);
			}
			if (matricola !== "") {
				var filter = new sap.ui.model.Filter("MATRICOLA", sap.ui.model.FilterOperator.Contains, matricola);
				aFilters.push(filter);
			}
			// update list binding
			var oTable = sap.ui.getCore().byId("tblPersonList1");
			oTable.setVisible(true);
			var aBinding = oTable.getBinding("items");
			console.log(aBinding);
			aBinding.filter(new sap.ui.model.Filter({
				filters: aFilters,
				and: true // AND operator true will check all of the filter conditions get satisfied
			}));
			//oMainModel.refresh(true);
		},
		/******************** onResetta function will set the fields(idtxt, dept, matricola, dir, txtNome, band) as blank ********************************************/
		onResetta: function (oEvent) {
			sap.ui.getCore().byId("idtxt").setValue("");
			sap.ui.getCore().byId("idTree").setValue("");
			sap.ui.getCore().byId("dir").setValue("");
			sap.ui.getCore().byId("txtNome").setValue("");
			sap.ui.getCore().byId("band").setValue("");
			sap.ui.getCore().byId("matricola").setValue("");
			sap.ui.getCore().byId("tblPersonList1").setVisible(false);
		},
		/******************** onInseriscileselezionate function is used to add a person to the list if the index of 
		table list1(AggiungiPersone fragment) and the MainModel data is unmatched********************************************/
		onInseriscileselezionate: function (oEvent) {
			debugger;
			var selectedIndices = sap.ui.getCore().byId("tblPersonList1").getSelectedContextPaths();
			var data = oMainModel.getData()[1].Data,
				that = this,
				f = 0,
				m = [];

			for (var i = 0; i < selectedIndices.length; i++) {
				for (var j = 0; j < oMainModel.getData()[1].Data.length; j++) {
					if (oMainModel.getData()[1].Data[j].MATRICOLA === oMainModel.getProperty(selectedIndices[i]).MATRICOLA) {
						f = 1;
						

					}
				}
				if (f !== 1)
					m.push(oMainModel.getProperty(selectedIndices[i]).MATRICOLA);
				else
				MessageBox.error("La persona scelta è già presente nella lista");
			}
			if(f===0){
			var sPayload = {
				ID_LISTA: this.ID,
				MATRICOLA: m
			};
			sPayload = JSON.stringify(sPayload);
			console.log(sPayload);
			console.log(JSON.stringify(sPayload));
			$.ajax({
				url: "/HANAMDC/STIP/STIPAdmin/services/create_liste_person.xsjs",
				type: "POST",
				method: "GET",
				contentType: 'application/json',
				data: {
					odata: sPayload
				},
				dataType: 'text',
				success: function (data, textStatus1) {
					debugger;
					MessageBox.success("la selezione è stata correttamente inserita nella lista", { //Success message displayed 'the selection has been correctly inserted in the list'
						styleClass: "sapUiSizeCompact",
						onClose: function (oAction) {
							oMainModel.getData()[0].Header.Count = oMainModel.getData()[1].Data.length;
							oMainModel.refresh();
							that.onCloseDialog();
							that.displayList();
						}
					});

					console.log(data);
				},
				error: function (data, textStatus1) {
					debugger;
					console.log(data);
				}
			});
			}
			f = 0;

			/*newdata.push({
					MATRICOLA: oMainModel.getProperty(selectedIndices[i]).MATRICOLA,
					BAND: oMainModel.getProperty(selectedIndices[i]).BAND,
					DIP_DESCR: oMainModel.getProperty(selectedIndices[i]).DIP_DESCR,
					DIREZIONE: oMainModel.getProperty(selectedIndices[i]).DIREZIONE,
					NOME: oMainModel.getProperty(selectedIndices[i]).NOME
				});
		*/ //f = 0;

			//}
			oMainModel.getData()[0].Header.Count = oMainModel.getData()[1].Data.length;
			oMainModel.refresh();
			console.log(oMainModel.getData());

			//console.log(oMainModel2.getData());
		},
		/******************* handleTreeValueHelp function fetches the data into the dialog box from the 'TreeStruc fragment' for Dipatimento ********************/
		handleTreeValueHelp: function () {
			debugger;
			var that = this;
			$.ajax({
				url: "/HANAMDC/STIP/STIPAdmin/services/department.xsjs",
				type: "POST",
				method: "GET",
				contentType: 'application/json',
				dataType: 'text',

				success: function (data, textStatus1) {
					debugger;
					data = JSON.parse(data);
					var oModel = new JSONModel();
					oModel.setSizeLimit(10000);
					oModel.setData(data);
					that.getView().setModel(oModel, "nodeModel");
					console.log(that.getView().getModel("nodeModel").getData());
					that.deptFragment = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.TreeStruc", that.getView().getController());
					that.getView().addDependent(that.deptFragment);
					that.deptFragment.open();

				},
				error: function (data, textStatus1) {
					debugger;
				}
			});

		},
		oncellClick: function (oEvent) {
			debugger;
			this.byId("idTree").setValue(oEvent.oSource.mProperties.title);
			this.onCancelDialog();
		},
		/************************onPosition function is used to access the hierarchy.xsjs only if department is non-blank
		 and opens the position_schedapers fragment on clicking the Tree icon beside Posizione********************************/
		onPosition: function () {
			var dept = this.byId("idTree").getValue();
			if (dept !== "") {
				for (var i = 0; i < oMainModel.getData()[0].Filter[12].JOB.length; i++) {
					if (oMainModel.getData()[0].Filter[12].JOB[i].name === dept) {
						dept = oMainModel.getData()[0].Filter[12].JOB[i].externalCode;
						break;
					}
				}
				var payload = {
					"DEPARTMENT": dept
				};
				var that = this;
				$.ajax({
					url: "/HANAMDC/STIP/STIPAdmin/services/hierarchy.xsjs",
					type: "POST",
					method: "GET",
					contentType: 'application/json',
					dataType: 'text',
					data: {
						odata: JSON.stringify(payload)
					},
					success: function (data, textStatus1) {

						data = JSON.parse(data);
						oMainModel.getData()[0].Filter[2].POSIZIONE = data;
						oMainModel.refresh();
						that.posFragment = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.position_schedapers", that.getView().getController());
						that.getView().addDependent(that.posFragment);
						sap.ui.getCore().byId("tblFilter2").setVisible(false);
						sap.ui.getCore().byId("tblFilter1").setVisible(true);
						that.posFragment.open();

					},
					error: function (data, textStatus1) {

					}
				});

			}
		},
		oncellClick: function (oEvent) {
			debugger;
			sap.ui.getCore().byId("idTree").setValue(oEvent.oSource.mProperties.title);
			this.onCancelDialog();
		},
		onCancelDialog: function () {
			this.deptFragment.destroy();
		},

	});
});