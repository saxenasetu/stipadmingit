sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"stipAdmin/stipAdmin/util/SchedaMasterTableHome",
	"sap/m/TablePersoController",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"stipAdmin/stipAdmin/util/Formatter",
	"sap/ui/Device",
	"sap/ui/core/BusyIndicator",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/HorizontalLayout",
	"./exportExcel"
], function (e, JSONModel, Fragment, MessageBox, SchedaMasterTableHome, TablePersoController, Export, ExportTypeCSV, Formatter, Device,
	BusyIndicator,
	Sorter, Filter, FilterOperator, VerticalLayout, HorizontalLayout, exportExcel) {
	"use strict";
	var oResource;
	var load = 0,
		year = '';
	var data2 = [];
	var totalschedaCount = 0;
	var oMainModel = new JSONModel(),
		oMainModel1 = new JSONModel(),
		oMainModel2 = new JSONModel(), //to avoid maxpayout duplication in upper search 
		oMainModel3 = new JSONModel(),
		changeModel = new JSONModel(), //Gruppo schede master dropdon values
		max_id, pista = [],
		pista2 = [];
	var oFilters = [],
		curve = [],
		gruppo = [],
		pay = [],
		gruppopista = [];
	/*	var pista = [{
			per_piste: "%",
			id_piste: "",
			desc_piste: ""
		}];*/
	var count = {
		rows: 0,
		per: 0
	};
	var selectedfiscalYearPeriodi, periodi = [],
		change_id_arr = [];
	var flagSort, flagGroup, flagFilter;
	return e.extend("stipAdmin.stipAdmin.controller.SchedaMaster", {
		//formatter: Formatter,
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {
			BusyIndicator.show();
			var oResource = new sap.ui.model.resource.ResourceModel({
				bundleName: "stipAdmin.stipAdmin.i18n.i18n"
			}).getResourceBundle();
			this.getView().byId("filterbar")._oSearchButton.setText("Cerca"); // Changing filter bar button name
			//this.getView().byId("filterbar")._oSearchButton.setText(oResource.getText("ok"));
			this.getView().byId("filterbar")._oHintText.setText(oResource.getText("noFilter"));
			this._mViewSettingsDialogs = {};
			this.busyDialog = new sap.m.BusyDialog();
			this.getOwnerComponent().getRouter().getRoute("SchedaMaster").attachPatternMatched(this._onObjectMatched, this);
			var n = new JSONModel({
				hasGrouping: false
			});
			this.getView().setModel(n, "Grouping");

			this._oTPC = new TablePersoController({
				table: this.byId("tbl"),
				componentName: "SchedaMaster",
				persoService: SchedaMasterTableHome
			}).activate();
			this.mGroupFunctions = {
				ID_SCHEDAMASTER: function (oContext) {
					var name = oContext.getProperty("ID_SCHEDAMASTER");
					return {
						key: name,
						text: name
					};
				},
				DESCR_SCHEDA: function (oContext) {
					var name = oContext.getProperty("DESCR_SCHEDA");
					return {
						key: name,
						text: name
					};
				},
				MAXPERCPAYOUT: function (oContext) {
					var name = oContext.getProperty("MAXPERCPAYOUT");
					return {
						key: name,
						text: name
					};
				},
				/*	P4P: function (oContext) {
						var name = oContext.getProperty("P4P");
						return {
							key: name,
							text: name
						};
					},*/
				DESCR_GRUPPOSCHEDA: function (oContext) {
					var name = oContext.getProperty("DESCR_GRUPPOSCHEDA");
					return {
						key: name,
						text: name
					};
				},
				SN_CONGELATA: function (oContext) {
					var name = oContext.getProperty("SN_CONGELATA");
					return {
						key: name,
						text: name
					};
				},
				DESCR_CURVA: function (oContext) {
					var name = oContext.getProperty("DESCR_CURVA");
					return {
						key: name,
						text: name
					};
				},
				DESCR_PISTA: function (oContext) {
					var name = oContext.getProperty("DESCR_PISTA");
					return {
						key: name,
						text: name
					};
				},
				PESO_PERCENTUALE: function (oContext) {
					var name = oContext.getProperty("PESO_PERCENTUALE");
					return {
						key: name,
						text: name
					};
				},
			};
			/*			this.byId("cli").addEventDelegate({
							onAfterRendering: function () {
								$('.sapMListTblSelCol').each(function (index, col) {
									if ($(col).next().hasClass('sapMListTblCellDup')) {
										$(col).css('border-top-color', 'transparent')
									}
								});
							}
						});*/
		},
		/******************** _onObjectMatched fetches argument values********************************************/
		_onObjectMatched: function (oEvent) {
			debugger
			this.byId("prev").setVisible(false);

					this.byId("next").setVisible(false);
					this.byId("idSearchBox1").setValue("");
					

			//this.busyDialog.open();
			change_id_arr = [];
			this.byId("button4").setEnabled(false);
			this.byId("button5").setEnabled(false);

			if (oEvent) {
				var oArguments = oEvent.getParameter("arguments");
				selectedfiscalYearPeriodi = oArguments.str;
				console.log(selectedfiscalYearPeriodi);
			}

			//this.getSchedaMaster(selectedfiscalYearPeriodi);
			this.getGeneric(selectedfiscalYearPeriodi);
			this.byId("tbl").setVisible(false);
			//When user navigates from delete, modify, copy, create functionalities, results table structure would be restored
			if ((sap.ui.getCore().getModel("BasicAppModel").getProperty("/back") === "delete") || (sap.ui.getCore().getModel(
					"BasicAppModel").getProperty("/back") === "create") || (sap.ui.getCore().getModel("BasicAppModel").getProperty("/back") ===
					"modifica") || (sap.ui.getCore().getModel("BasicAppModel").getProperty("/back") === "back") || (sap.ui.getCore().getModel(
					"BasicAppModel").getProperty("/back") === "SchedaMasterMain")) {

				this.onSearch();

				var tmp = oMainModel.getData();
				for (var i = 0; i < tmp.length; i++)
					tmp[i].Check_CHECKBOX = false;
				oMainModel.refresh();

			}

			//this.getView().byId("idtxtfiscalyear").setText(sap.ui.getCore().getModel("fiscalyear").getData());
			//this.busyDialog.close();
			//
		},
		/******************** onSchedaMasterButtonPressed function opens a dialog box for user to select which columns to be visible*******************************************/
		onSchedaMasterButtonPressed: function (oEvent) {
			this._oTPC.openDialog();
		},
		/******************** onTablePersoRefresh function is used to refresh the Perso Controller********************************************/
		onTablePersoRefresh: function () {
			SchedaMasterTableHome.resetPersData();
			this._oTPC.refresh();
		},
		/******************** handleCopy function navigates the user to copySchedaMaster page based on ID_SCHEDAMASTER ********************************************/
		handleCopy: function (oEvent) {
			debugger;
			/*var selectedIndices = this.getView().byId("tbl").getSelectedContextPaths();
			console.log(selectedIndices);
			var message = "";
			if (selectedIndices.length !== 1) {
				message = "Seleziona una riga per aggiornare il pagamento massimo"; //Please Select a row to update Max payout
				MessageBox.error(message);
				sap.ui.core.BusyIndicator.hide();
				return false;
			} else {
				//var path = oEvent.oSource.oPropagatedProperties.oBindingContexts.SchedaMasterModel.sPath;
				var id = oMainModel.getProperty(this.change_id).ID_SCHEDAMASTER,
					data;
				for (var i = 0; i < oMainModel1.getData().length; i++) {
					if (oMainModel1.getData()[i].ID_SCHEDAMASTER === id)
						data = oMainModel1.getData()[i];
				}*/
			this.change_id = change_id_arr[0];
			for (var i = 0; i < oMainModel1.getData().length; i++) {
				if (oMainModel1.getData()[i].ID_SCHEDAMASTER === this.change_id)
					var data = oMainModel1.getData()[i];
			}
			//var data = oMainModel1.getData()[this.change_id];
			var modModel = new JSONModel();
			modModel.setData(data);
			sap.ui.getCore().setModel(modModel, "ModificaModel");
			var xsjs = oMainModel3.getData();
			var modModel2 = new JSONModel();
			modModel2.setData(xsjs);
			sap.ui.getCore().setModel(modModel2, "xsjsModel");
			var e = sap.ui.core.UIComponent.getRouterFor(this);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/FISCAL_YEAR", selectedfiscalYearPeriodi);
			e.navTo("copySchedaMaster", {
				copySchedaMaster: "copySchedaMaster",
				id: this.change_id
			});
			//this.change_id = null;
			//}
		},
		/******************** handleAggiungi function navigates the user to createSchedaMaster page ********************************************/
		handleAggiungi: function () {
			var e = sap.ui.core.UIComponent.getRouterFor(this);
			var xsjs = oMainModel3.getData();
			var modModel2 = new JSONModel();
			modModel2.setData(xsjs);
			sap.ui.getCore().setModel(modModel2, "xsjsModel");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/FISCAL_YEAR", selectedfiscalYearPeriodi);
			e.navTo("createSchedeMaster", {
				createSchedaMaster: "createSchedaMaster",
				fy: selectedfiscalYearPeriodi
			});
		},
		/******************** handleModifica function navigates the user to modSchedaMaster page ********************************************/
		handleModifica: function (oEvent) {
			debugger;
			/*var selectedIndices = this.getView().byId("tbl").getSelectedContextPaths();
			console.log(selectedIndices);
			var message = "";
			if (selectedIndices.length !== 1) {
				message = "Seleziona una riga per aggiornare il pagamento massimo"; //Please Select a row to update Max payout
				MessageBox.error(message);
				sap.ui.core.BusyIndicator.hide();
				return false;
			} else {
				//var path = oEvent.oSource.oPropagatedProperties.oBindingContexts.SchedaMasterModel.sPath;
				var id = oMainModel.getProperty(this.change_id).ID_SCHEDAMASTER,
					data;
				for (var i = 0; i < oMainModel1.getData().length; i++) {
					if (oMainModel1.getData()[i].ID_SCHEDAMASTER === id)
						data = oMainModel1.getData()[i];
				}*/
			this.change_id = change_id_arr[0];
			for (var i = 0; i < oMainModel1.getData().length; i++) {
				if (oMainModel1.getData()[i].ID_SCHEDAMASTER === this.change_id)
					var data = oMainModel1.getData()[i];
			}

			//var data = oMainModel1.getData()[this.change_id];
			var modModel = new JSONModel();
			modModel.setData(data);
			var xsjs = oMainModel3.getData();
			var modModel2 = new JSONModel();
			modModel2.setData(xsjs);
			sap.ui.getCore().setModel(modModel2, "xsjsModel");
			sap.ui.getCore().setModel(modModel, "ModificaModel");
			var e = sap.ui.core.UIComponent.getRouterFor(this);
			sap.ui.getCore().getModel("ModificaModel").setProperty("/FISCAL_YEAR", selectedfiscalYearPeriodi);
			e.navTo("modSchedaMaster", {
				modSchedaMaster: "modSchedaMaster",
				id: this.change_id
			});
			//this.change_id = null;
			//}
		},
		/******************** onHome function naviagtes the user to the Home Page of the StipAdmin module********************************************/
		onHome: function () {
			this.getView().byId("idSearchBox1").setValue("");
			this.clear();
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "home");
			var n = sap.ui.core.UIComponent.getRouterFor(this);
			n.navTo("Home");
		},
		/******************** clear function sets the fields (schedaMasterId,schedaMasterDesc,schedaMasterPiste
		 * ,pistaDesc,idGate,descGate,box1,box2,box3) of the filter bar as blank********************************************/
		clear: function () {
			/*	var data = [];
				oMainModel.setData(data);
				this.getView().setModel(oMainModel, "SchedaMasterModel");
				oMainModel.refresh();*/
			this.byId("vsdFilterBar").setVisible(false);
			this.byId("vsdFilterLabel").setText("");
			//	resetting filter
			if (sap.ui.getCore().byId("FilterDialogSchedaMaster") !== undefined) {
				var aFilterItems = sap.ui.getCore().byId("FilterDialogSchedaMaster").getFilterItems();
				aFilterItems.forEach(function (item) {
					var aItems = item.getItems();
					aItems.forEach(function (item) {
						item.setSelected(false);
					});
				});
			}
			if (this.byId("schedaMasterId").getValue())
				this.byId("schedaMasterId").setValue("");
			if (this.byId("schedaMasterDesc").getValue())
				this.byId("schedaMasterDesc").setValue("");
			/*	if (this.byId("schedaMasterNote").getValue())
					this.byId("schedaMasterNote").setValue("");*/
			if (this.byId("schedaMasterPiste").getValue())
				this.byId("schedaMasterPiste").setValue("");
			if (this.byId("pistaDesc").getValue())
				this.byId("pistaDesc").setValue("");
			if (this.byId("idGate").getValue())
				this.byId("idGate").setValue("");
			if (this.byId("descGate").getValue())
				this.byId("descGate").setValue("");
			if (this.byId("box1").getSelectedKey())
				this.byId("box1").setSelectedKey("");
			if (this.byId("box2").getSelectedKey())
				this.byId("box2").setSelectedKey("");
			if (this.byId("box3").getSelectedKey())
				this.byId("box3").setSelectedKey("");
			/*	this.onSearch();
				var oTable = this.getView().byId("tbl");
				var aBinding = oTable.getBinding("items");
				aBinding.filter([]);*/
			/*	if (this.byId("box4").getSelectedKey())
					this.byId("box4").setSelectedKey("");*/
		},
		/*	onDisplayMoltiPlicatore: function (oEvent) {
				debugger
				var schedaMasterIdndex = oEvent.oSource.getBindingContext("SchedaMasterModel").sPath;
				schedaMasterIdndex = schedaMasterIdndex.replace("/", "");
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/FISCAL_YEAR", selectedfiscalYearPeriodi);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/DISPLAY_SCHEDA_VIEW_ID", schedaMasterIdndex);
				var t = sap.ui.core.UIComponent.getRouterFor(this);
				t.navTo("displaySchedaMaster");
			},*/
		/******************** onDisplayMoltiPlicatore method navigates the user to the displaySchedaMaster page ********************************************/
		onDisplayMoltiPlicatore: function (oEvent) {
			debugger
			var path = oEvent.oSource.oPropagatedProperties.oBindingContexts.SchedaMasterModel.sPath;
			var id = oMainModel.getProperty(path).ID_SCHEDAMASTER,
				data;
			for (var i = 0; i < oMainModel1.getData().length; i++) {
				if (oMainModel1.getData()[i].ID_SCHEDAMASTER === id)
					data = oMainModel1.getData()[i];
			}
			var displayModel = new JSONModel();
			displayModel.setData(data);
			sap.ui.getCore().setModel(displayModel, "DisplayModel");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/year", year);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/FISCAL_YEAR", selectedfiscalYearPeriodi);
			var t = sap.ui.core.UIComponent.getRouterFor(this);
			t.navTo("displaySchedaMaster", {
				displaySchedaMaster: "displaySchedaMaster",
				id: id
			});
		},
		/******************** allCheck function will select/deselect all the items in the table ********************************************/
		allCheck: function () {
			debugger;
			var chmain = this.getView().byId("chmain").getSelected();
			var aItems = this.getView().byId('tbl').getItems();

			for (var i = 0; i < aItems.length; i++)
				aItems[i].getBindingContext("SchedaMasterModel").getObject().ID_SCHEDAMASTER;

			if (chmain === true) {
				/*	for (var i = 0; i < data.length; i++) {
						data[i].Check_CHECKBOX = true;
						change_id_arr.push(data[i].ID_SCHEDAMASTER);
						oMainModel.refresh();
					}*/
				for (var i = 0; i < aItems.length; i++) {
					if (aItems[i].getBindingContext("SchedaMasterModel").getObject().ID_SCHEDAMASTER !== '')
						change_id_arr.push(aItems[i].getBindingContext("SchedaMasterModel").getObject().ID_SCHEDAMASTER);
					aItems[i].getBindingContext("SchedaMasterModel").getObject().Check_CHECKBOX = true;
					oMainModel.refresh();
					//aItems[i].mAggregations.cells[0].mBindingInfos.selected.parts[0].value = true;
				}
				var m = {};
				var data11 = change_id_arr;
				change_id_arr = [];
				for (i = 0; i < data11.length; i++) {
					var v = data11[i];
					if (!m[v]) {
						change_id_arr.push(v);
						m[v] = true;
					}
				}
				console.log(change_id_arr);
			} else if (chmain == false) {
				change_id_arr = []
					/*	for (var i = 0; i < data.length; i++) {
							data[i].Check_CHECKBOX = false;*/
				for (var i = 0; i < aItems.length; i++)
				//aItems[i].mAggregations.cells[0].mBindingInfos.selected.parts[0].value = false;
					aItems[i].getBindingContext("SchedaMasterModel").getObject().Check_CHECKBOX = false;

				oMainModel.refresh();

			}
		},
		/******************** onSearch function  will invoke 'getSchedaMaster' function based on 
		schedaMasterId,schedaMasterDesc,schedaMasterPiste,pistaDesc,idGate,descGate,box1,box2,box3 parameters********************************************/
		onSearch: function (oEvent) {
			debugger;
			oFilters=[];
			var oMainModelAll = this.getView().getModel("SchedaMasterModelAll");
			var path, path1, path2;
			var idScheda = this.getView().byId("schedaMasterId").getValue();
			var descScheda = this.getView().byId("schedaMasterDesc").getValue();
			//	var noteScheda = this.getView().byId("schedaMasterNote").getValue();
			//	var congelata = this.byId("box4").getSelectedKey();
			var maxPayout = this.getView().byId("box2").getSelectedKey();
			var gruppo = this.getView().byId("box3").getSelectedKey();
			var schedaMasterPiste = this.getView().byId("schedaMasterPiste").getValue();
			var pistaDesc = this.getView().byId("pistaDesc").getValue();
			var descGate = this.getView().byId("descGate").getValue();
			var idGate = this.getView().byId("idGate").getValue();
			var tipoPista = this.getView().byId("box1").getSelectedKey();

			var ofilterSM = [],
				ofilterSM1 = [];
			if (idScheda != undefined && idScheda !== "") {
				var filter1 = new sap.ui.model.Filter("ID_SCHEDAMASTER", sap.ui.model.FilterOperator.EQ, idScheda);
				oFilters.push(filter1);
			}
			if (descScheda != undefined && descScheda !== "") {
				var filter2 = new sap.ui.model.Filter({
					path: 'DESCR_SCHEDA',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: descScheda,
					caseSensitive: false
				});
				oFilters.push(filter2);
			}
			/*	if (noteScheda != undefined && noteScheda !== "") {
					var filter3 = new sap.ui.model.Filter("NOTE", sap.ui.model.FilterOperator.EQ, noteScheda);
					oFilters.push(filter3);
				}
				if (congelata != undefined && congelata !== "") {
					var filter4 = new sap.ui.model.Filter("SN_CONGELATA", sap.ui.model.FilterOperator.EQ, congelata);
					oFilters.push(filter4);
				}*/
			if (maxPayout != undefined && maxPayout !== "") {
				var filter5 = new sap.ui.model.Filter("MAXPERCPAYOUT", sap.ui.model.FilterOperator.EQ, maxPayout);
				oFilters.push(filter5);
			}
			if (gruppo != undefined && gruppo !== "") {
				var filter6 = new sap.ui.model.Filter("ID_GRUPPOSCHEDA", sap.ui.model.FilterOperator.EQ, gruppo);
				oFilters.push(filter6);
			}
			/*	if (schedaMasterPiste != undefined && schedaMasterPiste !== "") {
				var filter6 = new sap.ui.model.Filter("ID_PISTAVIEW", sap.ui.model.FilterOperator.EQ, schedaMasterPiste);
				oFilters.push(filter6);
			}*/
			//	debugger
			/*	if (schedaMasterPiste != undefined && schedaMasterPiste !== "") {
				var ofilter1 = [];
				for (var i = 0; i < oMainModel.getData().length; i++) {
					for (var j = 0; j < oMainModel.getData()[i].PISTE.length; j++) {
						path = "PISTE/" + j + "/ID_PISTA"
						var filter7 = new sap.ui.model.Filter(path, sap.ui.model.FilterOperator.EQ, schedaMasterPiste);
						ofilter1.push(filter7);
					}
				}
				oFilters.push(new sap.ui.model.Filter(ofilter1, false));
				console.log(oFilters);
			}
			//	debugger
			if (pistaDesc != undefined && pistaDesc !== "") {
				var ofilter2 = [];
				for (var i = 0; i < oMainModel.getData().length; i++) {
					for (var j = 0; j < oMainModel.getData()[i].PISTE.length; j++) {
						path = "PISTE/" + j + "/DESCR_PISTA"
						var filter8 = new sap.ui.model.Filter(path, sap.ui.model.FilterOperator.EQ, pistaDesc);
						ofilter2.push(filter8);
					}
				}
				oFilters.push(new sap.ui.model.Filter(ofilter2, false));
				console.log(oFilters);
			}
			//	debugger
			if (idGate != undefined && idGate !== "") {
				var ofilter3 = [];
				for (var i = 0; i < oMainModel.getData().length; i++) {
					for (var j = 0; j < oMainModel.getData()[i].GATE.length; j++) {
						path = "GATE/" + j + "/ID_GATE";
						path1 = "GATE/" + j + "/ID_GATE2";
						var filter9 = new sap.ui.model.Filter(path, sap.ui.model.FilterOperator.EQ, idGate);
						var filter10 = new sap.ui.model.Filter(path1, sap.ui.model.FilterOperator.EQ, idGate);
						ofilter3.push(filter9);
						ofilter3.push(filter10);
					}
				}
				oFilters.push(new sap.ui.model.Filter(ofilter3, false));
				console.log(oFilters);
			}
			//debugger
			if (descGate != undefined && descGate !== "") {
				var ofilter4 = [];
				for (var i = 0; i < oMainModel.getData().length; i++) {
					for (var j = 0; j < oMainModel.getData()[i].GATE.length; j++) {
						path = "GATE/" + j + "/DESCR_GATE1";
						path1 = "GATE/" + j + "/DESCR_GATE2";
						var filter11 = new sap.ui.model.Filter(path, sap.ui.model.FilterOperator.EQ, descGate);
						var filter12 = new sap.ui.model.Filter(path1, sap.ui.model.FilterOperator.EQ, descGate);
						ofilter4.push(filter11);
						ofilter4.push(filter12);
					}
				}
				oFilters.push(new sap.ui.model.Filter(ofilter4, false));
				console.log(oFilters);
			}
*/
			debugger
			if (schedaMasterPiste != undefined && schedaMasterPiste !== "") {
				var pistaIdSchedaMaster = "",m={};
				console.log(oMainModelAll.getData());
				for (var i = 0; i < oMainModelAll.getData().length; i++) {
					if (oMainModelAll.getData()[i].ID_PISTAVIEW === parseInt(schedaMasterPiste, 10)) {
						pistaIdSchedaMaster = oMainModelAll.getData()[i].ID_SCHEDAMASTER2; //fetching ID_SCHEDAMASTER of ID_PISTA
						if(!m[pistaIdSchedaMaster]){
						var filter7 = new sap.ui.model.Filter("ID_SCHEDAMASTER", sap.ui.model.FilterOperator.EQ, pistaIdSchedaMaster);
						ofilterSM.push(filter7);
						}
					}
				}
				console.log(ofilterSM);
				oFilters.push(new sap.ui.model.Filter(ofilterSM, false));
			}
			if (pistaDesc != undefined && pistaDesc !== "") {
				var pistaIdSchedaMaster1 = "",m={},vv;
				console.log(oMainModelAll.getData());
				for (var i = 0; i < oMainModelAll.getData().length; i++) {
					if (oMainModelAll.getData()[i].DESCR_PISTA !== "" && oMainModelAll.getData()[i].DESCR_PISTA !== null && oMainModelAll.getData()[i].DESCR_PISTA !==
						undefined)
						if (oMainModelAll.getData()[i].DESCR_PISTA.toLowerCase().includes(pistaDesc.toLowerCase())) {
							pistaIdSchedaMaster1 = oMainModelAll.getData()[i].ID_SCHEDAMASTER2;
							if(!m[pistaIdSchedaMaster1]){
							var filter8 = new sap.ui.model.Filter("ID_SCHEDAMASTER", sap.ui.model.FilterOperator.EQ, pistaIdSchedaMaster1);
							ofilterSM1.push(filter8); //fetching ID_SCHEDAMASTER of DESCR_PISTA
							}
						}
				}
				console.log(ofilterSM1);
				oFilters.push(new sap.ui.model.Filter(ofilterSM1, false));
				/*	var filter8 = new sap.ui.model.Filter({
						path: 'DESCR_PISTA',
						operator: sap.ui.model.FilterOperator.Contains,
						value1: pistaDesc,
						caseSensitive: false
					});
					oFilters.push(filter8);*/
			}

			/*if (idGate != undefined && idGate !== "") {
				var filter9 = new sap.ui.model.Filter("ID_GATE", sap.ui.model.FilterOperator.EQ, idGate);
				var filter10 = new sap.ui.model.Filter("ID_GATE2", sap.ui.model.FilterOperator.EQ, idGate);
				var ofilter3 = [];
				ofilter3.push(filter9);
				ofilter3.push(filter10);
				oFilters.push(new sap.ui.model.Filter(ofilter3, false));
			}*/

			if (idGate != undefined && idGate !== "") {
				ofilterSM = [];
				var pistaIdSchedaMaster = "",m={};
				console.log(oMainModelAll.getData());
				for (var i = 0; i < oMainModelAll.getData().length; i++) {
					if (oMainModelAll.getData()[i].ID_GATE === parseInt(idGate, 10) || oMainModelAll.getData()[i].ID_GATE2 === parseInt(idGate, 10)) {
						pistaIdSchedaMaster = oMainModelAll.getData()[i].ID_SCHEDAMASTER2; //fetching ID_SCHEDAMASTER of ID_PISTA
						if(!m[pistaIdSchedaMaster]){
						var filter7 = new sap.ui.model.Filter("ID_SCHEDAMASTER", sap.ui.model.FilterOperator.EQ, pistaIdSchedaMaster);
						ofilterSM.push(filter7);
						}
					}
				}
				console.log(ofilterSM);
				oFilters.push(new sap.ui.model.Filter(ofilterSM, false));
			}

			/*if (descGate != undefined && descGate !== "") {
				//var filter11 = new sap.ui.model.Filter("DESCR_GATE1", sap.ui.model.FilterOperator.EQ, descGate);
				//var filter12 = new sap.ui.model.Filter("DESCR_GATE2", sap.ui.model.FilterOperator.EQ, descGate);
				var ofilter4 = [];
				var filter11 = new sap.ui.model.Filter({
					path: 'DESCR_GATE1',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: descGate,
					caseSensitive: false
				});
				var filter12 = new sap.ui.model.Filter({
					path: 'DESCR_GATE2',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: descGate,
					caseSensitive: false
				});
				ofilter4.push(filter11);
				ofilter4.push(filter12);
				oFilters.push(new sap.ui.model.Filter(ofilter4, false));
				//oFilters.push(filter11);
			}
*/
			if (descGate != undefined && descGate !== "") {
				var idGate = [],m={};
				for (var i = 0; i < oMainModel.getData().length; i++) {
					if (oMainModel.getData()[i].DESCR_GATE1 !== "" && oMainModel.getData()[i].DESCR_GATE1 !== null && oMainModel.getData()[i].DESCR_GATE1
						.toLowerCase().includes(descGate.toLowerCase()))
						idGate.push(parseInt(oMainModel.getData()[i].ID_GATE, 10));
					if (oMainModel.getData()[i].DESCR_GATE2 !== "" && oMainModel.getData()[i].DESCR_GATE2 !== null && oMainModel.getData()[i].DESCR_GATE2
						.toLowerCase().includes(descGate.toLowerCase()))
						idGate.push(parseInt(oMainModel.getData()[i].ID_GATE2, 10));
				}
				
				for (var i = 0; i < oMainModelAll.getData().length; i++) {
					for (var j = 0; j < idGate.length; j++) {
						if (oMainModelAll.getData()[i].ID_GATE === idGate[j]) {
							pistaIdSchedaMaster1 = oMainModelAll.getData()[i].ID_SCHEDAMASTER2;
							if(!m[pistaIdSchedaMaster1]){
							var filter7 = new sap.ui.model.Filter("ID_SCHEDAMASTER", sap.ui.model.FilterOperator.EQ, oMainModelAll.getData()[i].ID_SCHEDAMASTER2);
							ofilterSM.push(filter7);
							}
						}
					}
				}
				oFilters.push(new sap.ui.model.Filter(ofilterSM, false));

			}

			/***************************************************START of TIPO_PISTA filter************************************************/
			if (tipoPista != undefined && tipoPista !== "") {
				debugger
				console.log(periodi + tipoPista);
				/*var Periodi_start_date = periodi[0].Periodi_start_date;
				var Periodi_end_date = periodi[0].Periodi_end_date;*/
				var Periodi_start_date = this.getView().getModel("SchedaMasterModel").getProperty("/0/PERIODI_VALE_DAL");
				var Periodi_end_date = this.getView().getModel("SchedaMasterModel").getProperty("/0/PERIODI_VALE_AL");
				//	var tempStorageDate = "";
				var piste_start_date = new Date(Periodi_start_date),
					piste_end_date = new Date(Periodi_end_date);
				if (tipoPista == "A") //when tipoPista= "A" Annual Periodi_start_date and Periodi_end_date is same pista_val_date and pista_al_date
				{
					piste_start_date = new Date(piste_start_date);
					piste_start_date = new Date(piste_start_date.setDate(piste_start_date.getDate() - 1));
					piste_end_date = new Date(piste_end_date);
					piste_end_date = new Date(piste_end_date.setDate(piste_end_date.getDate() + 1));
					tipoPista = "A";
				} else if (tipoPista == "S1") //when tipoPista= "S1" first 6 months 
				{
					piste_start_date = new Date(piste_start_date);
					piste_start_date = new Date(piste_start_date.setDate(piste_start_date.getDate() - 1));
					piste_end_date = new Date(piste_end_date.setMonth(piste_end_date.getMonth() - 6));
					//		piste_end_date = new Date(piste_end_date.setDate(piste_end_date.getDate() - 1));
					tipoPista = "S";
				} else if (tipoPista == "S2") //when tipoPista= "S2" last 6 months
				{
					piste_start_date = new Date(piste_start_date.setMonth(piste_start_date.getMonth() + 6));
					piste_start_date = new Date(piste_start_date.setDate(piste_start_date.getDate() - 1));
					piste_end_date = new Date(piste_end_date);
					piste_end_date = new Date(piste_end_date.setDate(piste_end_date.getDate() + 1));
					tipoPista = "S";
				} else if (tipoPista == "T1") //when tipoPista= "T1" first 3 months(1,2,3)
				{
					piste_start_date = new Date(piste_start_date);
					piste_start_date = new Date(piste_start_date.setDate(piste_start_date.getDate() - 1));
					piste_end_date = new Date(piste_end_date.setMonth(piste_end_date.getMonth() - 9));
					//	piste_end_date = new Date(piste_end_date.setDate(piste_end_date.getDate() - 1));
					tipoPista = "T";
				} else if (tipoPista == "T2") //when tipoPista= "T2" next 3 months(4,5,6)
				{
					piste_start_date = new Date(piste_start_date.setMonth(piste_start_date.getMonth() + 3));
					piste_start_date = new Date(piste_start_date.setDate(piste_start_date.getDate() - 1));
					piste_end_date = new Date(piste_end_date.setMonth(piste_end_date.getMonth() - 6));
					//	piste_end_date = new Date(piste_end_date.setDate(piste_end_date.getDate() - 1));
					tipoPista = "T";
				} else if (tipoPista == "T3") //when tipoPista= "T3" From 6th Month to 9th month
				{
					piste_start_date = new Date(piste_start_date.setMonth(piste_start_date.getMonth() + 6));
					piste_start_date = new Date(piste_start_date.setDate(piste_start_date.getDate() - 1));
					piste_end_date = new Date(piste_end_date.setMonth(piste_end_date.getMonth() - 3));
					piste_end_date = new Date(piste_end_date.setDate(piste_end_date.getDate() + 1));
					tipoPista = "T";
				} else if (tipoPista == "T4") //when tipoPista= "T4" last 3 months
				{
					piste_start_date = new Date(piste_start_date.setMonth(piste_start_date.getMonth() + 9));
					piste_start_date = new Date(piste_start_date.setDate(piste_start_date.getDate() - 1));
					piste_end_date = new Date(piste_end_date);
					piste_end_date = new Date(piste_end_date.setDate(piste_end_date.getDate() + 1));
					tipoPista = "T";
				}
				console.log(tipoPista + piste_start_date + piste_end_date);
			
				//	var andCondFilter = [];
				/*	for (var i = 0; i < oMainModel.getData().length; i++) {
						for (var j = 0; j < oMainModel.getData()[i].PISTE.length; j++) {
							path = "PISTE/" + j + "/TIPO_PISTA";
							path1 = "PISTE/" + j + "/VALE_DAL";
							path2 = "PISTE/" + j + "/VALE_AL";
							var filter13 = new sap.ui.model.Filter(path, sap.ui.model.FilterOperator.EQ, tipoPista);
							var filter14 = new sap.ui.model.Filter(path1, sap.ui.model.FilterOperator.EQ, piste_start_date);
							var filter15 = new sap.ui.model.Filter(path2, sap.ui.model.FilterOperator.EQ, piste_end_date);
							ofilter5.push(filter13);
							ofilter5.push(filter14);
							ofilter5.push(filter15);
						}
					}*/
			/*	var filter13 = new sap.ui.model.Filter("TIPO_PISTA", sap.ui.model.FilterOperator.EQ, tipoPista);
				var filter14 = new sap.ui.model.Filter("PISTA_VALE_DAL", sap.ui.model.FilterOperator.GE, piste_start_date);
				var filter15 = new sap.ui.model.Filter("PISTA_VALE_AL", sap.ui.model.FilterOperator.LE, piste_end_date);
				ofilter5 = new sap.ui.model.Filter({
					filters: [
						filter13,
						filter14,
						filter15
					],
					and: true
				}); //and filter is used to check all three conditions tipopsite,piste start date,piste end date
				//	ofilter5.push(andCondFilter);
				oFilters.push(new sap.ui.model.Filter(ofilter5, false));
				console.log(oFilters);*/
			//	debugger
				var ofilter5 = [];
				var	ofilterTK = [];
				var TKSchedaMaster = "";
				console.log(oMainModel.getData());
				for (var i = 0; i < oMainModel.getData().length; i++) {
					if (oMainModel.getData()[i].TIPO_PISTA === tipoPista && oMainModel.getData()[i].PISTA_VALE_DAL >= piste_start_date && oMainModel.getData()[i].PISTA_VALE_AL <= piste_end_date) {
						TKSchedaMaster = oMainModel.getData()[i].ID_SCHEDAMASTER2; //fetching ID_SCHEDAMASTER of ID_PISTA
						var filter5 = new sap.ui.model.Filter("ID_SCHEDAMASTER", sap.ui.model.FilterOperator.EQ, TKSchedaMaster);
						ofilterTK.push(filter5);
					}
				}
				console.log(ofilterTK);
				oFilters.push(new sap.ui.model.Filter(ofilterTK, false));
			}
			/***************************************************END of TIPO_PISTA filter************************************************/
			console.log(oFilters);
			/*var oTable = this.getView().byId("tbl");
			var aBinding = oTable.getBinding("items");
			console.log(aBinding);
			aBinding.filter(new sap.ui.model.Filter({
				filters: oFilters,
				and: true // AND operator true will check all of the filter conditions get satisfied
			}));
			oMainModel.refresh(true);*/
			/*if (oFilters.length === 0)
				this.byId("tbl").setVisible(false);
			else {*/
			this.byId("tbl").setVisible(true);
			this.getSchedaMaster(oFilters);
			//this.dataCounter(oFilters);
			//}

			oFilters = [];
			//	oMainModel.destroy();
			var oTable = this.getView().byId("tbl");
			var aBinding = oTable.getBinding("items");
			aBinding.filter([]);
		},
		/********************getSchedaMaster function is used to fetch the data from the V_SchedaMaster1 based on ID_PERIODO********************************************/
		getSchedaMaster: function (oFilters) {
			debugger;
			var that = this,
				count = 0;
			this.byId("tbl").setVisible(false);
			this.oFilters=oFilters;
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");

			var data, data22 = [],
				GATE = [],
				CURVE = [],
				PISTE = [],
				arrGruppoDesc = [],
				arrGruppoDesc1 = [],
				arrGruppoDesc2 = [],
				id, that = this,
				tmp = {},
				tmpMaxPayout = [{
					"MAXPAYOUT": "-"
				}],
				maxArray = {};
			
			var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, selectedfiscalYearPeriodi);
			oFilters.push(filter1);
			xsoDataModel.read("/V_SchedaMaster1?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;
					this.byId("prev").setVisible(true);
					this.byId("next").setVisible(true);
					this.byId("prev").setEnabled(false);
					this.byId("next").setEnabled(true);

					data = oDataIn.results;

					console.log(data);
					if (data.length > 0) {
						this.byId("tbl").setVisible(true);
						var ch = [];
						var duplicateArray = [];
						var m = {};
						for (var i = 0; i < data.length; i++) {
							var a = data[i].ID_SCHEDAMASTER;

							if (!duplicateArray[a]) {
								//	var firstSchedaId = true;
								for (var j = i + 1; j < data.length; j++) {
									if (data[j].ID_SCHEDAMASTER === a) {
										data[j].DESCR_TEMPLATELETTERA = false;
										data[i].DESCR_TEMPLATELETTERA = true;
										duplicateArray[a] = true;
										//console.log(duplicateArray);
										/*data[i].DESCR_TEMPLATELETTERA = 0;
										data[j].DESCR_TEMPLATELETTERA = 1;*/
									} else
										data[i].DESCR_TEMPLATELETTERA = true; //this condition for single value

								}
							}
							//console.log(data[i].DESCR_TEMPLATELETTERA + "---" + data[i].DESCR_TEMPLATELETTERA + "------- " + data[i].ID_SCHEDAMASTER);
							//console.log();
						}

						var data11 = data;
						data = [];
						for (var i = 0; i < data11.length; i++) {
							var vv = data11[i].ID_SCHEDAMASTER + ":" + data11[i].ID_PISTA,
								v = data11[i];
							if (!m[vv]) {
								m[vv] = true;
								data.push(v);
							}
						}

						if (data.length > 0) {
							periodi.push({
								"Periodi_start_date": data[0].PERIODI_VALE_DAL,
								"Periodi_end_date": data[0].PERIODI_VALE_AL
							});
							console.log(periodi);
						}
						for (var i = 0; i < data.length; i++) {
							if (data[i].NOTE === "NULL" || data[i].NOTE === null)
								data[i].NOTE = "";
							data[i].ID_SCHEDAMASTER2 = data[i].ID_SCHEDAMASTER;
							data[i].DESCR_GRUPPOSCHEDA2 = data[i].DESCR_GRUPPOSCHEDA;
							data[i].NOTE2 = data[i].NOTE;
							data[i].DESCR_SCHEDA2 = data[i].DESCR_SCHEDA;
							data[i].MAXPERCPAYOUT2 = data[i].MAXPERCPAYOUT;
							tmp = {
								row: i,
								Check_CHECKBOX: false,
								DESCR_GRUPPOSCHEDA: data[i].DESCR_GRUPPOSCHEDA,
								DESCR_SCHEDA: data[i].DESCR_SCHEDA,
								ID_GRUPPOSCHEDA: data[i].ID_GRUPPOSCHEDA,
								ID_PERIODO: selectedfiscalYearPeriodi,
								ID_SCHEDAMASTER: data[i].ID_SCHEDAMASTER,
								MATRICOLA: data[i].MATRICOLA,
								MAXPERCPAYOUT: data[i].MAXPERCPAYOUT,
								NOTE: data[i].NOTE,
								P4P: data[i].P4P,
								SN_BLOCCATA: data[i].SN_BLOCCATA,
								SN_CONGELATA: data[i].SN_CONGELATA,
							};
							//	debugger
							//**********************start of removing duplicate maxpayout**************************

							if (data[i].MAXPERCPAYOUT !== null && data[i].MAXPERCPAYOUT !== "") {
								var maxPayOut = data[i].MAXPERCPAYOUT;
								if (!maxArray[maxPayOut]) {
									tmpMaxPayout = {
										"MAXPAYOUT": maxPayOut
									};
									maxArray[maxPayOut] = true;
									console.log(tmpMaxPayout);
									arrGruppoDesc.push(tmpMaxPayout);
								}
							} //end of 	if (data[i].MAXPERCPAYOUT !== null || data[i].MAXPERCPAYOUT == "")
							data22.push(tmp);
						}
						//arrGruppoDesc.push("_");
						//arrGruppoDesc.unshift("&nbsp;");
						arrGruppoDesc.unshift({
							MAXPAYOUT: ""
						});
						oMainModel2.setData(arrGruppoDesc);
						//this.getView().setModel(oMainModel2, "maxPayoutModel");
						console.log(oMainModel2.getData());

						//Removing duplicates
						var data11 = data22;
						this.GateFilter = [];
						data22 = [];
						var m = {};
						for (i = 0; i < data11.length; i++) {
							var v = data11[i],
								vv = data11[i].ID_SCHEDAMASTER;
							if (!m[vv]) {
								data22.push(v);
								m[vv] = true;
							}
						}
						var m = {};
						for (i = 0; i < data.length; i++) {
							var c = data[i].ID_GATE,
								c1 = data[i].ID_GATE2,
								cc = {
									id: data[i].ID_GATE,
									desc: data[i].DESCR_GATE1
								},
								cc2 = {
									id: data[i].ID_GATE2,
									desc: data[i].DESCR_GATE2
								};
							if (!m[c]) {
								this.GateFilter.push(cc);
								m[c] = true;
							} else if (!m[c1]) {
								this.GateFilter.push(cc2);
								m[c1] = true;
							}
						}
						debugger;
						for (i = 0; i < data22.length; i++) {
							id = data22[i].ID_SCHEDAMASTER;
							data22[i].row = i;
							for (var j = 0; j < data.length; j++) {
								if (data[j].ID_SCHEDAMASTER === id) {
									if (data[j].ID_GATE1 !== null && data[j].ID_GATE2 !== null) {
										tmp = {
											DESCR_GATE1: data[j].DESCR_GATE1,
											DESCR_GATE2: data[j].DESCR_GATE2,
											ID_GATE1: data[j].ID_GATE,
											ID_GATE2: data[j].ID_GATE2,
											ID_PISTE: data[j].ID_PISTA
										};
										GATE.push(tmp);
									}
									if (data[j].ID_CURVA !== null) {
										tmp = {
											DESCR_CURVA: data[j].DESCR_CURVA,
											ID_CURVA: data[j].ID_CURVA,
											ID_PISTA: data[j].ID_PISTA,
											ID_TIPO_CURVA: data[j].ID_TIPO_CURVA
										};
										CURVE.push(tmp);
									}
									if (data[j].ID_PISTA !== null) {
										tmp = {
											DESCR_PISTA: data[j].DESCR_PISTA,
											ID_CURVA: data[j].ID_CURVA,
											ID_PISTA: data[j].ID_PISTA,
											TIPO_PISTA: data[j].TIPO_PISTA,
											VALE_DAL: data[j].PISTA_VALE_DAL,
											VALE_AL: data[j].PISTA_VALE_AL,
											ID_SCHEDAMASTER: data[j].ID_SCHEDAMASTER,
											N_ORDINE: data[j].N_ORDINE,
											PESO_PERCENTUALE: data[j].PESO_PERCENTUALE + "%",
										};
										PISTE.push(tmp);
									}
								}
							}
							data22[i].CURVE = CURVE;
							CURVE = [];
							data22[i].GATE = GATE;
							GATE = [];
							data22[i].PISTE = PISTE;
							PISTE = [];
						}

						var data11 = data;
						data = [];
						for (var i = 0; i < data11.length; i++) {

							var vv = data11[i].ID_SCHEDAMASTER,
								v = data11[i];
							if (!m[vv]) {
								count += 1;
								m[vv] = true;
							} else {

								data11[i].ID_SCHEDAMASTER = "";
								data11[i].NOTE = "";
								data11[i].DESCR_SCHEDA = "";
								data11[i].DESCR_GRUPPOSCHEDA = "";
								data11[i].MAXPERCPAYOUT = "";
								data11[i].DESCR_TEMPLATELETTERA = false;

							}
							//data.push(v);
						}
						data = data11;
						oMainModel.setData(data);
						changeModel.setData(data);
						console.log(oMainModel.getData());
						//Removing duplicate filters
						var m1 = {},
							m2 = {},
							m3 = {},
							m4 = {},
							m5 = {},
							m6 = {},
							m7 = {},
							m8 = {},
							m9 = {},
							m10 = {},
							v1 = [],
							v2 = [],
							v3 = [],
							v4 = [],
							v5 = [],
							v6 = [],
							v7 = [],
							v8 = [],
							v9 = [],
							v10 = [];
						for (var i = 0; i < data.length; i++) {
							var vv1 = data[i].ID_SCHEDAMASTER,
								vv2 = data[i].DESCR_SCHEDA,
								vv3 = data[i].MAXPERCPAYOUT,
								vv4 = data[i].DESCR_GRUPPOSCHEDA,
								vv5 = data[i].NOTE,
								vv6 = data[i].SN_CONGELATA,
								vv7 = data[i].DESCR_CURVA,
								vv8 = data[i].DESCR_PISTA,
								vv9 = data[i].PESO_PERCENTUALE,
								vv10 = data[i].ID_PISTAVIEW;

							if (!m1[vv1] && vv1 !== "") {
								m1[vv1] = true;
								v1.push(vv1);
							}
							if (!m2[vv2] && vv2 !== "") {
								m2[vv2] = true;
								v2.push(vv2);
							}
							if (!m3[vv3] && vv3 !== "") {
								m3[vv3] = true;
								v3.push(vv3);
							}
							if (!m4[vv4] && vv4 !== "") {
								m4[vv4] = true;
								v4.push(vv4);
							}

							if (!m5[vv5] && vv5 !== "") {
								m5[vv5] = true;
								v5.push(vv5);
							}
							if (!m6[vv6] && vv6 !== "") {
								m6[vv6] = true;
								if (vv6 === "S")
									v6.push("Si");
								else
									v6.push("No")
							}

							if (!m7[vv7] && vv7 !== "") {
								m7[vv7] = true;
								v7.push(vv7);
							}
							if (!m8[vv8] && vv8 !== "") {
								m8[vv8] = true;
								v8.push(vv8);
							}
							if (!m9[vv9] && vv9 !== "") {
								m9[vv9] = true;
								v9.push(vv9);
							}
							if (!m10[vv10] && vv10 !== "") {
								m10[vv10] = true;
								v10.push(vv10);
							}

						}

						var Filter = [{
							ID_SCHEDAMASTER: v1
						}, {
							DESCR_SCHEDA: v2
						}, {
							MAXPERCPAYOUT: v3
						}, {
							DESCR_GRUPPOSCHEDA: v4
						}, {
							NOTE: v5
						}, {
							SN_CONGELATA: v6
						}, {
							DESCR_CURVA: v7
						}, {
							DESCR_PISTA: v8
						}, {
							PESO_PERCENTUALE: v9
						}, {
							ID_PISTA: v10
						}];

						console.log(Filter);
						var oMainModelFilter = new JSONModel();
						oMainModelFilter.setData(Filter);
						that.getView().setModel(oMainModelFilter, "FilterSchedaMasterModel");

						console.log(data22);
						oMainModel1.setData(data22);
						that.getView().setModel(oMainModel1, "SchedaMasterModel1"); //this is required for fragments setting data
						console.log(oMainModel1.getData());
						sap.ui.getCore().setModel(oMainModel, "BasicAppModel");

						var colorToSet = "G",
							page = [],
							count = 0,
							m = {};
						this.pageCount = 0;
						debugger;
						for (var i = 0; i < oMainModel.getData().length; i++) {
							if (oMainModel.getData()[i].ID_SCHEDAMASTER !== "" && colorToSet === "G") {
								colorToSet = String("W");
							} else if (oMainModel.getData()[i].ID_SCHEDAMASTER !== "" && colorToSet === "W") {
								colorToSet = String("G");
							}
							oMainModel.getData()[i].COLORSET = colorToSet;

							var vv = oMainModel.getData()[i].ID_SCHEDAMASTER2 + ":" + oMainModel.getData()[i].ID_PISTAVIEW;
							if (count < 50 && !m[vv]) {
								page.push(oMainModel.getData()[i]);
								m[vv] = true;
								if (oMainModel.getData()[i].ID_SCHEDAMASTER !== "")
									count += 1;
								this.prevEnd = i;
								this.prevStart = 0;
							}
						}
						if (count === 50) {
							for (var i = 0; i < oMainModel.getData().length; i++) {
								if (page[page.length - 1].ID_SCHEDAMASTER2 === oMainModel.getData()[i].ID_SCHEDAMASTER2 && page[page.length - 1].ID_PISTA !=
									oMainModel.getData()[i].ID_PISTA) {
									page.push(oMainModel.getData()[i]);
									this.prevEnd = i;
								}
							}
						}
						this.prevArr = [{
							prevStart: this.prevStart,
							prevEnd: this.prevEnd
						}];
						this.pageCount += count;
						totalschedaCount = data22.length;
						var totalPage = Math.ceil(totalschedaCount / 50);
						this.pageno = 1;
						if (this.pageno === totalPage)
							this.byId("next").setEnabled(false);

						var title = this.getView().getModel("i18n").getResourceBundle().getText("SchedaMaster") + " : " + this.pageCount + "/" +
							totalschedaCount + "\nPage: " + this.pageno + "/" + totalPage;
						that.byId("title").setText(title);

						oMainModel.setProperty("/page", page);
						that.getView().setModel(oMainModel, "SchedaMasterModel");
						debugger;
						if(that.oFilters.length===1)
						{
							var oMainModelAll= new JSONModel();
							oMainModelAll.setData(data);
							that.getView().setModel(oMainModelAll, "SchedaMasterModelAll");
						}
						that.getView().getModel("SchedaMasterModel").updateBindings(true);
						//that.getView().setModel(oMainModel, "SchedaMasterModel");
					} else
						MessageBox.error("Nessun dato trovato");
				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Nessun dato trovato");
				}.bind(this)
			});
			xsoDataModel.attachRequestCompleted(function () {
				//debugger;
				//	oMainModel.refresh(true);
			});
		},
		_next: function () {
			this.byId("prev").setEnabled(true);
			var colorToSet = "G",
				page = [],
				count = 0;
			this.prevStart = this.prevEnd + 1;
			for (var i = this.prevArr[this.prevArr.length - 1].prevEnd + 1; i < oMainModel.getData().length; i++) {

				if (oMainModel.getData()[i].ID_SCHEDAMASTER !== "" && colorToSet === "G") {
					colorToSet = String("W");
				} else if (oMainModel.getData()[i].ID_SCHEDAMASTER !== "" && colorToSet === "W") {
					colorToSet = String("G");
				}
				oMainModel.getData()[i].COLORSET = colorToSet;
				if (count < 50) {
					page.push(oMainModel.getData()[i]);
					if (oMainModel.getData()[i].ID_SCHEDAMASTER !== "")
						count += 1;
					this.prevEnd = i;

				}
				if (count === 50) {

					if (page[page.length - 1].ID_SCHEDAMASTER2 === oMainModel.getData()[i].ID_SCHEDAMASTER2 && page[page.length - 1].ID_PISTA !=
						oMainModel.getData()[i].ID_PISTA) {
						page.push(oMainModel.getData()[i]);
						this.prevEnd = i;

					}
				}
			}
			this.pageCount += count;

			var totalPage = Math.ceil(totalschedaCount / 50);
			this.pageno += 1;

			var title = this.getView().getModel("i18n").getResourceBundle().getText("SchedaMaster") + " : " + this.pageCount + "/" +
				totalschedaCount + "\nPage: " + this.pageno + "/" + totalPage;
			this.byId("title").setText(title);

			oMainModel.setProperty("/page", page);
			this.getView().setModel(oMainModel, "SchedaMasterModel");
			if (this.pageno === totalPage)
				this.byId("next").setEnabled(false);
			this.prevArr.push({
				prevStart: this.prevStart,
				prevEnd: this.prevEnd,
				count: count
			});

		},

		_prev: function () {
			this.pageCount-= this.prevArr[this.prevArr.length-1].count;
			this.byId("next").setEnabled(true);
			this.prevArr.pop();
			var colorToSet = "G",
				page = [],
				count = 0;
			this.prevEnd = this.prevStart;
			//	for (var i = this.prevStart-1; i >=0; i--) {
			for (var i = this.prevArr[this.prevArr.length - 1].prevStart; i < oMainModel.getData().length; i++) {

				if (oMainModel.getData()[i].ID_SCHEDAMASTER !== "" && colorToSet === "G") {
					colorToSet = String("W");
				} else if (oMainModel.getData()[i].ID_SCHEDAMASTER !== "" && colorToSet === "W") {
					colorToSet = String("G");
				}
				oMainModel.getData()[i].COLORSET = colorToSet;
				if (count < 50) {
					page.push(oMainModel.getData()[i]);
					if (oMainModel.getData()[i].ID_SCHEDAMASTER !== "")
						count += 1;
					this.prevStart = i;

				}
				if (count === 50) {

					if (page[page.length - 1].ID_SCHEDAMASTER2 === oMainModel.getData()[i].ID_SCHEDAMASTER2 && page[page.length - 1].ID_PISTA !=
						oMainModel.getData()[i].ID_PISTA) {
						page.push(oMainModel.getData()[i]);
						this.prevStart = i;

					}
				}

			}

			

			var totalPage = Math.ceil(totalschedaCount / 50);
			this.pageno -= 1;

			var title = this.getView().getModel("i18n").getResourceBundle().getText("SchedaMaster") + " : " + this.pageCount + "/" +
				totalschedaCount + "\nPage: " + this.pageno + "/" + totalPage;
			this.byId("title").setText(title);

			oMainModel.setProperty("/page", page);
			this.getView().setModel(oMainModel, "SchedaMasterModel");
			if (this.pageno <= 1)
				this.byId("prev").setEnabled(false);

		},

		//Gruppo schede master dropdown values
		/******************** getGeneric function calls generic.xsjs ,payload is ID_PERIODO and output is fiscal year
		based on the Start and End date****************************/
		getGeneric: function (selectedfiscalYearPeriodi) {
			var that = this;
			BusyIndicator.show();
			var sPayload = {
				"ID_PERIODO": selectedfiscalYearPeriodi
			};
			sPayload = JSON.stringify(sPayload);
			var url = "/HANAMDC/STIP/STIPAdmin/services/generic.xsjs";
			$.ajax({
				url: url,
				type: "GET",
				contentType: "application/json",
				data: {
					odata: sPayload
				},
				//dataType: 'jsonp',
				success: function (data1, textStatus1, XMLHttpRequest1) {
					debugger;
					max_id = data1[4].ID_SCHEDAMASTER;
					year = data1[1].DESCR_PERIODO;
					that.byId("idtxtfiscalyear").setText(year);
					curve = data1[6].CURVE;
					gruppo = data1[13].GRUPPOSCHEDA;
					pay = data1[7].MAXPERCPAYOUT;
					gruppopista = data1[5].GRUPPO;

					var Periodi_start_date_main = data1[8].dates[0].VALE_DAL;
					var Periodi_end_date_main = data1[8].dates[0].VALE_AL;
					//max_id = data[21][1];
					console.log(Periodi_start_date_main);
					console.log(Periodi_end_date_main);
					var start = (new Date(Periodi_start_date_main)).getMonth() + 1;
					var end = (new Date(Periodi_end_date_main)).getMonth() + 1;
					var years = (new Date(Periodi_start_date_main)).getFullYear();
					var month = [{
						key: 0,
						month: ""
					}];

					for (var i = start; i <= 12; i++)
						month.push({
							key: i,
							month: Formatter.months(i) + " " + years
						});
					for (var i = 1; i <= end; i++)
						month.push({
							key: i,
							month: Formatter.months(i) + " " + (years + 1)
						});
					BusyIndicator.hide();
					var data = [];
					data.push({
						CURVE: curve
					}, {
						GRUPPO: gruppo
					}, {
						PAY: pay
					}, {
						Month: month
					}, {
						newId: max_id
					}, {
						year: year
					}, {
						GRUPPOPISTA: gruppopista
					});
					var oMainModelll = new JSONModel();
					oMainModelll.setData(data);
					that.getView().setModel(oMainModelll, "maxPayoutModel");
					sap.ui.getCore().setModel(oMainModelll, "maxPayoutModel");
					that.getSchedaMaster([]);
					BusyIndicator.hide();
				},
				error: function (data1, textStatus1, XMLHttpRequest1) {
					BusyIndicator.hide();
				}
			});
		},
		/********************getGroupoSchedaMasterDescr function is used to set the Fiscal Year based on ID_PERIODO ********************************************/
		getGroupoSchedaMasterDescr: function (selectedfiscalYearPeriodi) {
			debugger;
			load = 1;
			BusyIndicator.show();
			var sPayload = {
				"ID_PERIODO": selectedfiscalYearPeriodi
			};
			sPayload = JSON.stringify(sPayload);
			var that = this;
			var url = "/HANAMDC/STIP/STIPAdmin/services/createSchedaMasterDisplay.xsjs";
			$.ajax({
				url: url,
				type: "GET",
				contentType: "application/json",
				data: {
					odata: sPayload
				},
				//dataType: 'jsonp',
				success: function (data1, textStatus1, XMLHttpRequest1) {
					debugger;
					BusyIndicator.show();
					year = data1[0].DESCR_PERIODO;
					that.getView().byId("idtxtfiscalyear").setText(year);
					console.log(data1);
					/*data1.push({
						PISTE_MODEL: pista
					});
					data1.push({
						PISTE_COUNT: count
					});
					oMainModel.setData(data1);
					//sap.ui.getCore().setModel(oMainModel,"BasicAppModel")
					that.getView().setModel(oMainModel, "newModel");*/
					var yr = "";
					var data11 = data1[0].Piste,
						data = [{
							PISTE: pista
						}],
						gruppi = [],
						curva = [],
						piste = [];
					if (data11.length !== 0)
						yr = new Date(data11[0].MESE_INIZIO).getFullYear();
					for (var i = 0; i <= 12; i++) {
						if (i === 0)
							piste.push({
								key: "",
								date: ""
							});
						else
							piste.push({
								//key: i + "-" + yr,
								key: Formatter.months(i) + " " + yr,
								date: Formatter.months(i) + " " + yr
							});
					}
					var m = {};
					for (var i = 0; i < data11.length; i++) { //Formatting dates
						data11[i].MESE_INIZIO = Formatter.months(new Date(data11[i].MESE_INIZIO).getMonth() + 1) + " " + new Date(data11[i].MESE_INIZIO)
							.getFullYear();
						data11[i].MESE_FINE = Formatter.months(new Date(data11[i].MESE_FINE).getMonth() + 1) + " " + new Date(data11[i].MESE_FINE).getFullYear();
						//data11[i].MESE_INIZIO = new Date(data11[i].MESE_INIZIO).getMonth() + 1 + "-" + new Date(data11[i].MESE_INIZIO).getFullYear();
						//data11[i].MESE_FINE = new Date(data11[i].MESE_FINE).getMonth() + 1 + "-" + new Date(data11[i].MESE_FINE).getFullYear();
						var v = {
								id: data11[i].ID_GRUPPOPISTA,
								desc: data11[i].DESCR_GRUPPOPISTA
							},
							c = {
								id: data11[i].ID_CURVA,
								desc: data11[i].DESCR_CURVA
							},
							vv = data11[i].ID_GRUPPOPISTA,
							cc = data11[i].ID_CURVA
							/*,
															p = {
																//	start_date: new Date(data11[i].MESE_INIZIO).getMonth() + 1 + " " + new Date(data11[i].MESE_INIZIO).getYear(),
																start_date: data11[i].MESE_INIZIO,
																end_date: data11[i].MESE_FINE
															}*/
						;
						if (!m[vv]) {
							gruppi.push(v);
							m[vv] = true;
						}
						if (!m[cc]) {
							curva.push(c);
							//piste.push(p);
							m[cc] = true;
						}
					}
					pista2 = {
						GRUPPI: gruppi,
						CURVA: curva,
						PISTE: piste
					};
					data1.push({
						Filter_Model: pista2
					});
					data1.push({
						PISTE_COUNT: count
					});
					data1.push(data);
					//data1[3][0].ID_SCHEDAMASTER = data1[0].ID_SCHEDAMASTER;
					oMainModel3.setData(data1);
					//sap.ui.getCore().setModel(oMainModel,"BasicAppModel")
					that.getView().setModel(oMainModel3, "newModel");
					console.log(oMainModel3.getData());
					max_id = oMainModel3.getData()[0].ID_SCHEDAMASTER;
					//that.countPer();
					pista2 = [];
					BusyIndicator.hide();
				},
				error: function (data1, textStatus1, XMLHttpRequest1) {
					BusyIndicator.hide();
				}
			});
		},
		/*filterModelfn: function(id){
			debugger;
			var maxArray = [],arrGruppoDesc1 =[];
			var data = oMainModel.getData(), idd = id;
			for(var i = 0; i< data.length; i++)
			if (data[i].idd !== null || data[i].idd == "") {
							var maxPayOut = data[i].idd;
							if (!maxArray[maxPayOut]) {
								var tmpMaxPayout = {
									idd: maxPayOut
								};
								maxArray[maxPayOut] = true;
								console.log(tmpMaxPayout);
								arrGruppoDesc1.push(tmpMaxPayout);
							}
						} 
			return {idd : arrGruppoDesc1};
		},*/
		/********************sel function is used to select the particular id********************************************/
		/********************If none is selected then buttons Modifica Scheda and Copia Scheda are disabled ********************************************/

		sel: function (oEvent, id) {
			debugger;
			if (oEvent.mParameters.selected === true) {
				//this.change_id = id;
				change_id_arr.push(id);
			} else {
				//this.change_id = null;
				if (change_id_arr.length === 1)
					change_id_arr.pop();
				else {
					for (var i = 0; i < change_id_arr.length; i++) {
						if (change_id_arr[i] === id)
							change_id_arr.splice(i, 1);
					}
				}
			}
			console.log(change_id_arr);
			if (change_id_arr.length !== 1) {
				this.byId("button4").setEnabled(false);
				this.byId("button5").setEnabled(false);
			} else {
				this.byId("button4").setEnabled(true);
				this.byId("button5").setEnabled(true);
			}
		},
		/******************* handleEmpValueHelp function fetches the data into the dialog box from the 'schedamaster_valuehelp' for idGate ********************/
		handleEmpValueHelp: function (oEvent) {
			this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.schedamaster_valuehelp", this);
			this.getView().addDependent(this._oValueHelpDialog[0]);
			sap.ui.getCore().byId("idScheda").setVisible(true);
			sap.ui.getCore().byId("idGate").setVisible(false);
			sap.ui.getCore().byId("descGate").setVisible(false);
			this._oValueHelpDialog[0].open();
		},
		/******************* handleEmpValueHelp2 function fetches the data into the dialog box from the 'schedamaster_valuehelp' for idGate ********************/
		/*	handleEmpValueHelp2: function (oEvent) {
				this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.schedamaster_valuehelp", this);
				this.getView().addDependent(this._oValueHelpDialog[1]);
				sap.ui.getCore().byId("idScheda").setVisible(false);
				sap.ui.getCore().byId("idGate").setVisible(true);
				sap.ui.getCore().byId("descGate").setVisible(false);
				var data = this.GateFilter;
				var tmpModel = new JSONModel();
				tmpModel.setData(data);
				this._oValueHelpDialog[1].setModel(tmpModel, "tmpModel");
				this._oValueHelpDialog[1].open();
			},*/
		/******************* handleEmpValueHelp3 function fetches the data into the dialog box from the 'schedamaster_valuehelp' for idGate ********************/
		/*handleEmpValueHelp3: function (oEvent) {
			this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.schedamaster_valuehelp", this);
			this.getView().addDependent(this._oValueHelpDialog[2]);
			sap.ui.getCore().byId("idScheda").setVisible(false);
			sap.ui.getCore().byId("idGate").setVisible(false);
			sap.ui.getCore().byId("descGate").setVisible(true);
			var data = this.GateFilter;
			var tmpModel = new JSONModel();
			tmpModel.setData(data);
			this._oValueHelpDialog[2].setModel(tmpModel, "tmpModel");
			this._oValueHelpDialog[2].open();
		},*/
		/******************* handleIdValueconfirm function fetches the selected value to the schedaMasterId filter********************/
		handleIdValueconfirm: function (oEvent) {
			var t = oEvent.getParameter("selectedItem");
			if (t) {
				this.getView().byId("schedaMasterId").setValue(t.getTitle());
				if (this._oValueHelpDialog.length > 0) {
					for (var i = 0; i < this._oValueHelpDialog.length; i++) {
						this._oValueHelpDialog[i].destroy();
					}
				}
			}
			//	oEvent.getSource().getBinding("items").filter([])
		},
		/******************* handleDescgateconfirm function fetches the selected value to the descGate filter********************/
		handleDescGateconfirm: function (oEvent) {
			debugger;
			var t = oEvent.getParameter("selectedItem");
			if (t) {
				this.getView().byId("descGate").setValue(t.getTitle());
				if (this._oValueHelpDialog.length > 0) {
					for (var i = 0; i < this._oValueHelpDialog.length; i++) {
						this._oValueHelpDialog[i].destroy();
					}
				}
			}
			//	oEvent.getSource().getBinding("items").filter([])
		},
		/******************* handleIdGateconfirm function fetches the selected value to the idGate filter********************/
		handleIdGateconfirm: function (oEvent) {
			debugger;
			var t = oEvent.getParameter("selectedItem");
			if (t) {
				this.getView().byId("idGate").setValue(t.getTitle());
				if (this._oValueHelpDialog.length > 0) {
					for (var i = 0; i < this._oValueHelpDialog.length; i++) {
						this._oValueHelpDialog[i].destroy();
					}
				}
			}
			//	oEvent.getSource().getBinding("items").filter([])
		},
		/******************* handleValueHelpClose function closes the ValueHelpSearch dialog box********************/
		handleIdValueHelpClose: function (oEvent) {
			if (this._oValueHelpDialog.length > 0) {
				for (var i = 0; i < this._oValueHelpDialog.length; i++) {
					this._oValueHelpDialog[i].destroy();
				}
			}
		},
		/******************* curveChange function is used to select from the Curve********************/
		/*		curveChange: function (oEvent) {
					debugger;
					//absolute path oEvent.mAggregations.picker.oParent._oList.mAggregations.items[0].oBindingContexts.SchedaMasterModel.sPath;
					var id = oEvent.mParameters.id;
					var key = this.byId(id).getSelectedKey().split(" ")[0];
					var tipo_curva = parseInt(this.byId(id).getSelectedKey().split(" ")[1], 10);
					console.log(key);
					console.log(tipo_curva);
					var p_path = oEvent.mParameters.selectedItem.oBindingContexts.SchedaMasterModel.sPath;
					p_path = p_path.split("/");
					var c_path = "/" + p_path[1] + "/PISTE/" + p_path[3] + "/";
					var curveid = c_path + "ID_PISTA";
					p_path = "/" + p_path[1] + "/row";
					var row = oMainModel.getProperty(p_path);
					curveid = oMainModel.getProperty(curveid);
					p_path = "__xmlview0--selPiste-__xmlview0--tbl-" + row;
					this.byId(p_path).setSelectedKey(curveid);
					this.byId(key, tipo_curva);
				},*/
		/******************* PistaChange function is used to select from the Piste********************/
		/*		PistaChange: function (oEvent) {
					debugger;
					//oEvent.mParameters.selectedItem.oBindingContexts.SchedaMasterModel.sPath
					//"/0/PISTE/1"
					var p_path = oEvent.mParameters.selectedItem.oBindingContexts.SchedaMasterModel.sPath;
					p_path = p_path.split("/");
					var c_path = "/" + p_path[1] + "/CURVE/" + p_path[3] + "/";
					var curveid = c_path + "ID_CURVA";
					var tipo = c_path + "ID_TIPO_CURVA";
					curveid = oMainModel.getProperty(curveid);
					tipo = oMainModel.getProperty(tipo);
					p_path = "/" + p_path[1] + "/row";
					var row = oMainModel.getProperty(p_path);
					curveid = curveid + " " + tipo;
					tipo = "__xmlview0--selCurve-__xmlview0--tbl-" + row;
					this.byId(tipo).setSelectedKey(curveid);
				},*/
		/*	displayCurve: function (key, tipo_curva) {
				debugger;
				var idCurve = parseInt(key, 10);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", idCurve);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "SchedaMasterMain");
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/year", selectedfiscalYearPeriodi);
				if (tipo_curva === 1)
					sap.ui.core.UIComponent.getRouterFor(this).navTo("displayCurvaLineare");
				else if (tipo_curva === 2)
					sap.ui.core.UIComponent.getRouterFor(this).navTo("displayCurvaDiscreta");
				else if (tipo_curva === 3)
					sap.ui.core.UIComponent.getRouterFor(this).navTo("displayDiscretaRapportoPercentuale");
				else if (tipo_curva === 4)
					sap.ui.core.UIComponent.getRouterFor(this).navTo("displayCurvaLineare_Consuntivo");
				else if (tipo_curva === 5)
					sap.ui.core.UIComponent.getRouterFor(this).navTo("displayCurva_Pdecimale");
			},*/
		/******************* displayCurve function is used to navigate to the respective displayCurva pages based on the selected curva********************/
		displayCurve: function (oEvent) {
			debugger;
			var path = oEvent.oSource.oPropagatedProperties.oBindingContexts.SchedaMasterModel.sPath;
			var idCurve = this.getView().getModel("SchedaMasterModel").getProperty(path + "/ID_CURVA");
			var curveDesc = this.getView().getModel("SchedaMasterModel").getProperty(path + "/DESCR_CURVA");
			var selectedCurve = Formatter.convertIdTipoToDesc(this.getView().getModel("SchedaMasterModel").getProperty(path +
				"/ID_TIPO_CURVA"));
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", idCurve);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveDesc", curveDesc);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "SchedaMasterMain");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/year", selectedfiscalYearPeriodi);
			var e = sap.ui.core.UIComponent.getRouterFor(this);
			if (selectedCurve == "Lineare")
				e.navTo("displayCurvaLineare");
			else if (selectedCurve == "Discreta")
				e.navTo("displayCurvaDiscreta");
			else if (selectedCurve == "Discreta/Rapporto Percentuale")
				e.navTo("displayDiscretaRapportoPercentuale");
			else if (selectedCurve == "Lineare/Consuntivo")
				e.navTo("displayCurvaLineare_Consuntivo");
			else if (selectedCurve == "Lineare/Pdecimale")
				e.navTo("displayCurva_Pdecimale");
			else if (selectedCurve == "Descrittiva")
				e.navTo("displayCurvaDescrittiva");
		},
		/***************************** start of ModificaMaxPayout functions****************************************************************/
		/******************* updateModificaMaxPayout function opens a dialog box to modify the % max payout and invokes modifyMaxPayout function ********************/
		updateModificaMaxPayout: function (oEvent) {
			debugger
			var that = this;
			var schedaMasterIdData = [];
			var schedaMasterId, maxPayout;
			/*var selectedIndices = this.getView().byId("tbl").getSelectedContextPaths();
			console.log(selectedIndices);*/
			var message = "";
			//if (selectedIndices.length == 0) {
			if (change_id_arr.length == 0) {
				message = "Seleziona una scheda per modificare % Max Payout"; //Please Select a row to update Max payout
				MessageBox.error(message);
				sap.ui.core.BusyIndicator.hide();
				return false;
			} else {
				var oDialog = new sap.m.Dialog({
					content: [
						new HorizontalLayout({
							content: [
								new VerticalLayout({
									content: [
										new sap.m.Text({
											text: "",
										}),
										new sap.m.Text({
											text: "Inserisci la percentuale massima di payout",
											textAlign: "Center"
										}),
										new sap.m.Text({
											text: "",
										}),
										new sap.m.Input("maxPayoutDialogueId", {
											width: "300px",
											value: "200"
										}),
									]
								}), //end  of verticlelayout1
								new VerticalLayout({
									content: [
										new sap.m.Text({
											text: "",
										}),
										new sap.m.Button({
											text: "OK",
											width: "80px",
											type: sap.m.ButtonType.Emphasized,
											press: function () {
												console.log(sap.ui.getCore().byId('maxPayoutDialogueId').getValue());
												maxPayout = parseInt(sap.ui.getCore().byId('maxPayoutDialogueId').getValue());
												var pattern = RegExp('[0-9]'); //This pattern checks that the entry must be numbers only
												if (!pattern.test(maxPayout)) {
													MessageBox.error("Inserisci il numero"); //Enter the number
													oDialog.close();
													oDialog.destroy();
												} else {
													for (var i = 0; i < change_id_arr.length; i++) {
														console.log(change_id_arr[i]);
														/*schedaMasterId = that.getView().getModel("SchedaMasterModel").getProperty(change_id_arr[i] +
															"/ID_SCHEDAMASTER");*/
														schedaMasterIdData.push(change_id_arr[i]);
													}
													console.log(schedaMasterIdData);
													that.getView().byId("tbl").removeSelections();
													that.modifyMaxPayout(maxPayout, schedaMasterIdData);
													oDialog.close();
													oDialog.destroy();
												}
											}
										}),
										new sap.m.Button({ //On clicking the Cancel button, checkbox selections get removed and dialog box closes
											text: "Annulla",
											width: "80px",
											press: function () {
												that.getView().byId("tbl").removeSelections();
												oDialog.close();
												oDialog.destroy();
											}
										}),
									]
								}), //VerticalLayout2 end
							]
						}), //HorizontalLayout end
					],
					contentWidth: "400px",
					contentHeight: "120px",
					afterClose: function () {
						oDialog.destroy();
					}
				});
				oDialog.setTitle("Modifica Massiva Max Payout"); //Edit Massive Max Payout
				if (oDialog != null) {
					oDialog.open();
				}
			}
		},
		/******************* modifyMaxPayout function accepts the parameters maxPayout and schedaMasterIdData modifies the % max payout********************/
		modifyMaxPayout: function (maxPayout, schedaMasterIdData) {
			debugger;
			var tmp = schedaMasterIdData,
				rej = [];
			schedaMasterIdData = [];
			for (var ii = 0; ii < tmp.length; ii++) {
				for (var i = 0; i < oMainModel.getData().length; i++) {
					if (tmp[ii] === oMainModel.getData()[i].ID_SCHEDAMASTER && oMainModel.getData()[i].SN_BLOCCATA !== 'S')
						schedaMasterIdData.push(tmp[ii]);
					else if (tmp[ii] === oMainModel.getData()[i].ID_SCHEDAMASTER && oMainModel.getData()[i].SN_BLOCCATA === 'S')
						rej.push(tmp[ii]);
				}
			}
			tmp = rej, rej = [];
			for (var ii = 0; ii < tmp.length; ii++) {
				for (var i = 0; i < oMainModel.getData().length; i++) {
					if (tmp[ii] === oMainModel.getData()[i].ID_SCHEDAMASTER)

						rej.push(oMainModel.getData()[i].DESCR_SCHEDA);
				}
			}
			var that = this;
			var sPayload = {
				"ID_SCHEDAMASTER": schedaMasterIdData,
				"MAXPERCPAYOUT": maxPayout
			};
			sPayload = JSON.stringify(sPayload);
			console.log(sPayload);
			var that = this;
			var url = "/HANAMDC/STIP/STIPAdmin/services/modificaSchedaMaster.xsjs";
			$.ajax({
				url: url,
				type: "GET",
				contentType: "application/json",
				data: {
					odata: sPayload
				},
				//dataType: 'jsonp',
				success: function (data1, textStatus1, XMLHttpRequest1) {
					debugger;
					sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "modifica");
					console.log(data1);
					if (rej.length === 0)
						var txt = "Modifica Massiva Max Payout Con Successo"; //Edit Massive Max Payout Successfully
					else {
						var txt = "Modifica Massiva Max Payout avvenuta con successo, ad esclusione di: "; //Massive Max Payout change that has been successful, excluding:
						for (var i = 0; i < rej.length; i++) {
							if (i < rej.length - 1)
								txt = txt + rej[i] + ",";
							else
								txt = txt + rej[i];
						}
					}
					MessageBox.success(txt, {
						onClose: function (oEvent) {
							//		debugger;
							that.getView().byId("chmain").setSelected(false);
							console.log("Onclose");

							that._onObjectMatched();
							//that.getSchedaMaster(selectedfiscalYearPeriodi);
						}
					});

				},
				error: function (data1, textStatus1, XMLHttpRequest1) {
					//that.getSchedaMaster(selectedfiscalYearPeriodi);
				}
			});
			change_id_arr = [];
		},
		/***************************** end  of ModificaMaxPayout functions****************************************************************/
		/***************************** start of Toolbar  methods****************************************************************/
		/***************************** start of Toolbar search operation method*************************************************/
		/******************* onTableSearch function is used to search the records in the table based on the 
		 search value filter which is present on the Toolbar just above the table ********************/
		onTableSearch: function (oEvent) {
			var sQuery = oEvent.getParameter("query");
			sQuery = sQuery.trim();

			if (sQuery && sQuery.length > 0) {

				var tmp = [],
					data = [];
				debugger
				var oModel = this.getView().getModel('SchedaMasterModel').getData().page;
				for (var i = 0; i < oModel.length; i++) {
					if (oModel[i].ID_SCHEDAMASTER2 == parseInt(sQuery) || oModel[i].DESCR_SCHEDA2.toLowerCase().includes(sQuery.toLowerCase()) ||
						oModel[i].DESCR_CURVA === sQuery ||
						oModel[i].ID_PISTA == sQuery || oModel[i].DESCR_PISTA === sQuery) {
						tmp = oModel[i];
						data.push(tmp);
					}
				}
				console.log(data);
				oMainModel.setProperty("/page", data);
				this.getView().setModel(oMainModel, "SchedaMasterModel");
				oMainModel.refresh();
			}
			if (!sQuery) {
				this.clear();
				this.onSearch();

			}

		},
		/***************************** end of Toolbar search operation method*************************************************/
		/************************createViewSettingsDialog function is used to create a popup dialog box for Sort and Group functions ********************************/
		createViewSettingsDialog: function (sDialogFragmentName) {
			//	//debugger;
			var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
				this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;
				console.log(this.getView().getModel("SchedaMasterModel"));
				oDialog.setModel(this.getView().getModel("SchedaMasterModel"));
				this.getView().addDependent(oDialog);
				if (Device.system.desktop) {
					oDialog.addStyleClass("sapUiSizeCompact");
				}
			}
			return oDialog;
		},
		/************************handleSortButtonPressed function accesses the sort_SchedaMaster fragment *******************************/
		handleSortButtonPressed: function () {
			flagSort = true;
			this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.sort_SchedaMaster").open();
		},
		/************************sort function allows the user to sort the data of the tbl as per the user 
		selected values of Id, Descrizione and %Max Payout either in ascending or descending order********************************/
		sort: function (oEvent) {

			debugger;

			var oTable = this.getView().byId("tbl"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];
			sPath = mParams.sortItem.getKey();
			sPath = sPath.split(";");
			bDescending = mParams.sortDescending;
			sPath = sPath[0];
			if (sPath === "ID_SCHEDAMASTER")
				sPath = "ID_SCHEDAMASTER2";
			if (sPath === "NOTE")
				sPath = "NOTE2";
			if (sPath === "DESCR_SCHEDA")
				sPath = "DESCR_SCHEDA2";
			if (sPath === "MAXPERCPAYOUT")
				sPath = "MAXPERCPAYOUT2";
			aSorters.push(new Sorter(sPath, bDescending));
			//aSorters.push(new Sorter(sPath[0], bDescending));
			// apply the selected sort and group settings
			oBinding.sort(aSorters);
			oBinding.refresh();
			/*oTable.getColumns()[sPath[1]].setMergeDuplicates(false);
			oTable.getModel("SchedaMasterModel").refresh(true);
			oTable.getColumns()[sPath[1]].setMergeDuplicates(true);*/
			oTable.getModel("SchedaMasterModel").refresh(true);
		},
		/***************************** end  of sort operation method*************************************************/
		/***************************** start of filter operation method*************************************************/
		/*	handleFilterButtonPressed: function (oEvent) {
				var filterModel1 = new JSONModel(), //to avoid filter duplication
					filterModel2 = new JSONModel(),
					filterModel3 = new JSONModel(),
					filterModel4 = new JSONModel(),
					filterModel5 = new JSONModel(),
					filterModel6 = new JSONModel(),
					filterModel7 = new JSONModel(),
					filterModel8 = new JSONModel(),
					filterModel9 = new JSONModel();
				if (!this._oValueHelpDialog) {
					this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.filter_SchedaMaster", this);
					this.getView().addDependent(this._oValueHelpDialog);
					var data = this.getView().getModel("SchedaMasterModel").getData();
					var duplicateArray = [],
						arrGruppoDesc = [],
						tmpMaxPayout = [];
					for (var i = 0; i < data.length; i++) {
						//**********************start of removing duplicate maxpayout**************************
						if (data[i].MAXPERCPAYOUT !== null && data[i].MAXPERCPAYOUT !== "") {
							var maxPayOut = data[i].MAXPERCPAYOUT;
							if (!duplicateArray[maxPayOut]) {
								tmpMaxPayout = {
									"MAXPERCPAYOUT": maxPayOut
								};
								duplicateArray[maxPayOut] = true;
								console.log(tmpMaxPayout);
								arrGruppoDesc.push(tmpMaxPayout);
							}
						} //**********************end of removing duplicate maxpayout**************************
					}
					console.log(arrGruppoDesc);
					filterModel1.setData(arrGruppoDesc);
					duplicateArray = [], arrGruppoDesc = [], tmpMaxPayout = [];
					this.getView().setModel(filterModel1, "filterModel1");
					for (var i = 0; i < data.length; i++) {
						//**********************start of removing duplicate schedaMasterId**************************
						if (data[i].ID_SCHEDAMASTER !== null && data[i].ID_SCHEDAMASTER !== "") {
							var idScheda = data[i].ID_SCHEDAMASTER;
							if (!duplicateArray[idScheda]) {
								tmpMaxPayout = {
									"ID_SCHEDAMASTER": idScheda
								};
								duplicateArray[idScheda] = true;
								console.log(tmpMaxPayout);
								arrGruppoDesc.push(tmpMaxPayout);
							}
						}
						//**********************end of removing duplicate schedaMasterId**************************
					}
					console.log(arrGruppoDesc);
					filterModel2.setData(arrGruppoDesc);
					duplicateArray = [], arrGruppoDesc = [], tmpMaxPayout = [];
					this.getView().setModel(filterModel2, "filterModel2");
					for (var i = 0; i < data.length; i++) {
						//**********************start of removing duplicate DESCR_SCHEDA**************************
						if (data[i].DESCR_SCHEDA !== null && data[i].DESCR_SCHEDA !== "") {
							var DESCR_SCHEDA = data[i].DESCR_SCHEDA;
							if (!duplicateArray[DESCR_SCHEDA]) {
								tmpMaxPayout = {
									"DESCR_SCHEDA": DESCR_SCHEDA
								};
								duplicateArray[DESCR_SCHEDA] = true;
								console.log(tmpMaxPayout);
								arrGruppoDesc.push(tmpMaxPayout);
							}
						}
						//**********************end of removing duplicate DESCR_SCHEDA**************************
					}
					console.log(arrGruppoDesc);
					filterModel3.setData(arrGruppoDesc);
					duplicateArray = [], arrGruppoDesc = [], tmpMaxPayout = [];
					this.getView().setModel(filterModel3, "filterModel3");
					for (var i = 0; i < data.length; i++) {
						//**********************start of removing duplicate DESCR_GRUPPOSCHEDA**************************
						if (data[i].DESCR_GRUPPOSCHEDA !== null && data[i].DESCR_GRUPPOSCHEDA !== "") {
							var DESCR_GRUPPOSCHEDA = data[i].DESCR_GRUPPOSCHEDA;
							if (!duplicateArray[DESCR_GRUPPOSCHEDA]) {
								tmpMaxPayout = {
									"DESCR_GRUPPOSCHEDA": DESCR_GRUPPOSCHEDA
								};
								duplicateArray[DESCR_GRUPPOSCHEDA] = true;
								console.log(tmpMaxPayout);
								arrGruppoDesc.push(tmpMaxPayout);
							}
						}
						//**********************end of removing duplicate DESCR_GRUPPOSCHEDA**************************
					}
					console.log(arrGruppoDesc);
					filterModel4.setData(arrGruppoDesc);
					duplicateArray = [], arrGruppoDesc = [], tmpMaxPayout = [];
					this.getView().setModel(filterModel4, "filterModel4");
					for (var i = 0; i < data.length; i++) {
						//**********************start of removing duplicate NOTE**************************
						if (data[i].NOTE !== null && data[i].NOTE !== "") {
							var NOTE = data[i].NOTE;
							if (!duplicateArray[NOTE]) {
								tmpMaxPayout = {
									"NOTE": NOTE
								};
								duplicateArray[NOTE] = true;
								console.log(tmpMaxPayout);
								arrGruppoDesc.push(tmpMaxPayout);
							}
						}
						//**********************end of removing duplicate NOTE**************************
					}
					console.log(arrGruppoDesc);
					filterModel5.setData(arrGruppoDesc);
					duplicateArray = [], arrGruppoDesc = [], tmpMaxPayout = [];
					this.getView().setModel(filterModel5, "filterModel5");
					for (var i = 0; i < data.length; i++) {
						//**********************start of removing duplicate DESCR_CURVA**************************
						if (data[i].DESCR_CURVA !== null && data[i].DESCR_CURVA !== "") {
							var DESCR_CURVA = data[i].DESCR_CURVA;
							if (!duplicateArray[DESCR_CURVA]) {
								tmpMaxPayout = {
									"DESCR_CURVA": DESCR_CURVA
								};
								duplicateArray[DESCR_CURVA] = true;
								console.log(tmpMaxPayout);
								arrGruppoDesc.push(tmpMaxPayout);
							}
						}
						//**********************end of removing duplicate DESCR_CURVA**************************
					}
					console.log(arrGruppoDesc);
					filterModel6.setData(arrGruppoDesc);
					duplicateArray = [], arrGruppoDesc = [], tmpMaxPayout = [];
					this.getView().setModel(filterModel6, "filterModel6");
					for (var i = 0; i < data.length; i++) {
						//**********************start of removing duplicate DESCR_PISTA**************************
						if (data[i].DESCR_PISTA !== null && data[i].DESCR_PISTA !== "") {
							var DESCR_PISTA = data[i].DESCR_PISTA;
							if (!duplicateArray[DESCR_PISTA]) {
								tmpMaxPayout = {
									"DESCR_PISTA": DESCR_PISTA
								};
								duplicateArray[DESCR_PISTA] = true;
								console.log(tmpMaxPayout);
								arrGruppoDesc.push(tmpMaxPayout);
							}
						}
						//**********************end of removing duplicate DESCR_PISTA**************************
					}
					console.log(arrGruppoDesc);
					filterModel7.setData(arrGruppoDesc);
					duplicateArray = [], arrGruppoDesc = [], tmpMaxPayout = [];
					this.getView().setModel(filterModel7, "filterModel7");
					for (var i = 0; i < data.length; i++) {
						//**********************start of removing duplicate PESO_PERCENTUALE**************************
						if (data[i].PESO_PERCENTUALE !== null && data[i].PESO_PERCENTUALE !== "") {
							var PESO_PERCENTUALE = data[i].PESO_PERCENTUALE;
							if (!duplicateArray[PESO_PERCENTUALE]) {
								tmpMaxPayout = {
									"PESO_PERCENTUALE": PESO_PERCENTUALE
								};
								duplicateArray[PESO_PERCENTUALE] = true;
								console.log(tmpMaxPayout);
								arrGruppoDesc.push(tmpMaxPayout);
							}
						}
						//**********************end of removing duplicate PESO_PERCENTUALE**************************
					}
					console.log(arrGruppoDesc);
					filterModel8.setData(arrGruppoDesc);
					duplicateArray = [], arrGruppoDesc = [], tmpMaxPayout = [];
					this.getView().setModel(filterModel8, "filterModel8");
					for (var i = 0; i < data.length; i++) {
						//**********************start of removing duplicate ID_PISTA**************************
						if (data[i].ID_PISTA !== null && data[i].ID_PISTA !== "") {
							var ID_PISTA = data[i].ID_PISTA;
							if (!duplicateArray[ID_PISTA]) {
								tmpMaxPayout = {
									"ID_PISTA": ID_PISTA
								};
								duplicateArray[ID_PISTA] = true;
								//console.log(tmpMaxPayout);
								arrGruppoDesc.push(tmpMaxPayout);
							}
						}
						//**********************end of removing duplicate ID_PISTA**************************
					}
					//console.log(arrGruppoDesc);
					filterModel9.setData(arrGruppoDesc);
					duplicateArray = [], arrGruppoDesc = [], tmpMaxPayout = [];
					this.getView().setModel(filterModel9, "filterModel9");
					this._oValueHelpDialog.setModel(this.getView().getModel("filterModel1"));
					this._oValueHelpDialog.setModel(this.getView().getModel("filterModel2"));
					this._oValueHelpDialog.setModel(this.getView().getModel("filterModel3"));
					this._oValueHelpDialog.setModel(this.getView().getModel("filterModel4"));
					this._oValueHelpDialog.setModel(this.getView().getModel("filterModel5"));
					this._oValueHelpDialog.setModel(this.getView().getModel("filterModel6"));
					this._oValueHelpDialog.setModel(this.getView().getModel("filterModel7"));
					this._oValueHelpDialog.setModel(this.getView().getModel("filterModel8"));
					this._oValueHelpDialog.setModel(this.getView().getModel("filterModel9"));
				}
				this._oValueHelpDialog.open();
			},*/
		/************************handleFilterButtonPressed function accesses the filter_SchedaMaster fragment ********************************/
		handleFilterButtonPressed: function (oEvent) {

			this.createViewSettingsDialog1("stipAdmin.stipAdmin.fragment.filter_SchedaMaster").open();

		},
		/************************createViewSettingsDialog1 function is used to create a popup dialog box Filter function ********************************/
		createViewSettingsDialog1: function (sDialogFragmentName) {
			//	//debugger;
			var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
				this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;
				console.log(this.getView().getModel("SchedaMasterModel"));
				var filterModel1 = new JSONModel(), //to avoid filter duplication
					filterModel2 = new JSONModel(),
					filterModel3 = new JSONModel(),
					filterModel4 = new JSONModel(),
					filterModel5 = new JSONModel(),
					filterModel6 = new JSONModel(),
					filterModel7 = new JSONModel(),
					filterModel8 = new JSONModel(),
					filterModel9 = new JSONModel();
				var data = this.getView().getModel("SchedaMasterModel").getData();
				var duplicateArray = [],
					arrGruppoDesc = [],
					tmpMaxPayout = [];
				for (var i = 0; i < data.length; i++) {
					//**********************start of removing duplicate maxpayout**************************
					if (data[i].MAXPERCPAYOUT !== null && data[i].MAXPERCPAYOUT !== "") {
						var maxPayOut = data[i].MAXPERCPAYOUT;
						if (!duplicateArray[maxPayOut]) {
							tmpMaxPayout = {
								"MAXPERCPAYOUT": maxPayOut
							};
							duplicateArray[maxPayOut] = true;
							console.log(tmpMaxPayout);
							arrGruppoDesc.push(tmpMaxPayout);
						}
					} //**********************end of removing duplicate maxpayout**************************
				}
				console.log(arrGruppoDesc);
				filterModel1.setData(arrGruppoDesc);
				duplicateArray = [], arrGruppoDesc = [], tmpMaxPayout = [];
				this.getView().setModel(filterModel1, "filterModel1");
				for (var i = 0; i < data.length; i++) {
					//**********************start of removing duplicate schedaMasterId**************************
					if (data[i].ID_SCHEDAMASTER !== null && data[i].ID_SCHEDAMASTER !== "") {
						var idScheda = data[i].ID_SCHEDAMASTER;
						if (!duplicateArray[idScheda]) {
							tmpMaxPayout = {
								"ID_SCHEDAMASTER": idScheda
							};
							duplicateArray[idScheda] = true;
							console.log(tmpMaxPayout);
							arrGruppoDesc.push(tmpMaxPayout);
						}
					}
					//**********************end of removing duplicate schedaMasterId**************************
				}
				console.log(arrGruppoDesc);
				filterModel2.setData(arrGruppoDesc);
				duplicateArray = [], arrGruppoDesc = [], tmpMaxPayout = [];
				this.getView().setModel(filterModel2, "filterModel2");
				for (var i = 0; i < data.length; i++) {
					//**********************start of removing duplicate DESCR_SCHEDA**************************
					if (data[i].DESCR_SCHEDA !== null && data[i].DESCR_SCHEDA !== "") {
						var DESCR_SCHEDA = data[i].DESCR_SCHEDA;
						if (!duplicateArray[DESCR_SCHEDA]) {
							tmpMaxPayout = {
								"DESCR_SCHEDA": DESCR_SCHEDA
							};
							duplicateArray[DESCR_SCHEDA] = true;
							console.log(tmpMaxPayout);
							arrGruppoDesc.push(tmpMaxPayout);
						}
					}
					//**********************end of removing duplicate DESCR_SCHEDA**************************
				}
				console.log(arrGruppoDesc);
				filterModel3.setData(arrGruppoDesc);
				duplicateArray = [], arrGruppoDesc = [], tmpMaxPayout = [];
				this.getView().setModel(filterModel3, "filterModel3");
				for (var i = 0; i < data.length; i++) {
					//**********************start of removing duplicate DESCR_GRUPPOSCHEDA**************************
					if (data[i].DESCR_GRUPPOSCHEDA !== null && data[i].DESCR_GRUPPOSCHEDA !== "") {
						var DESCR_GRUPPOSCHEDA = data[i].DESCR_GRUPPOSCHEDA;
						if (!duplicateArray[DESCR_GRUPPOSCHEDA]) {
							tmpMaxPayout = {
								"DESCR_GRUPPOSCHEDA": DESCR_GRUPPOSCHEDA
							};
							duplicateArray[DESCR_GRUPPOSCHEDA] = true;
							console.log(tmpMaxPayout);
							arrGruppoDesc.push(tmpMaxPayout);
						}
					}
					//**********************end of removing duplicate DESCR_GRUPPOSCHEDA**************************
				}
				console.log(arrGruppoDesc);
				filterModel4.setData(arrGruppoDesc);
				duplicateArray = [], arrGruppoDesc = [], tmpMaxPayout = [];
				this.getView().setModel(filterModel4, "filterModel4");
				for (var i = 0; i < data.length; i++) {
					//**********************start of removing duplicate NOTE**************************
					if (data[i].NOTE !== null && data[i].NOTE !== "") {
						var NOTE = data[i].NOTE;
						if (!duplicateArray[NOTE]) {
							tmpMaxPayout = {
								"NOTE": NOTE
							};
							duplicateArray[NOTE] = true;
							console.log(tmpMaxPayout);
							arrGruppoDesc.push(tmpMaxPayout);
						}
					}
					//**********************end of removing duplicate NOTE**************************
				}
				console.log(arrGruppoDesc);
				filterModel5.setData(arrGruppoDesc);
				duplicateArray = [], arrGruppoDesc = [], tmpMaxPayout = [];
				this.getView().setModel(filterModel5, "filterModel5");
				for (var i = 0; i < data.length; i++) {
					//**********************start of removing duplicate DESCR_CURVA**************************
					if (data[i].DESCR_CURVA !== null && data[i].DESCR_CURVA !== "") {
						var DESCR_CURVA = data[i].DESCR_CURVA;
						if (!duplicateArray[DESCR_CURVA]) {
							tmpMaxPayout = {
								"DESCR_CURVA": DESCR_CURVA
							};
							duplicateArray[DESCR_CURVA] = true;
							console.log(tmpMaxPayout);
							arrGruppoDesc.push(tmpMaxPayout);
						}
					}
					//**********************end of removing duplicate DESCR_CURVA**************************
				}
				console.log(arrGruppoDesc);
				filterModel6.setData(arrGruppoDesc);
				duplicateArray = [], arrGruppoDesc = [], tmpMaxPayout = [];
				this.getView().setModel(filterModel6, "filterModel6");
				for (var i = 0; i < data.length; i++) {
					//**********************start of removing duplicate DESCR_PISTA**************************
					if (data[i].DESCR_PISTA !== null && data[i].DESCR_PISTA !== "") {
						var DESCR_PISTA = data[i].DESCR_PISTA;
						if (!duplicateArray[DESCR_PISTA]) {
							tmpMaxPayout = {
								"DESCR_PISTA": DESCR_PISTA
							};
							duplicateArray[DESCR_PISTA] = true;
							console.log(tmpMaxPayout);
							arrGruppoDesc.push(tmpMaxPayout);
						}
					}
					//**********************end of removing duplicate DESCR_PISTA**************************
				}
				console.log(arrGruppoDesc);
				filterModel7.setData(arrGruppoDesc);
				duplicateArray = [], arrGruppoDesc = [], tmpMaxPayout = [];
				this.getView().setModel(filterModel7, "filterModel7");
				for (var i = 0; i < data.length; i++) {
					//**********************start of removing duplicate PESO_PERCENTUALE**************************
					if (data[i].PESO_PERCENTUALE !== null && data[i].PESO_PERCENTUALE !== "") {
						var PESO_PERCENTUALE = data[i].PESO_PERCENTUALE;
						if (!duplicateArray[PESO_PERCENTUALE]) {
							tmpMaxPayout = {
								"PESO_PERCENTUALE": PESO_PERCENTUALE
							};
							duplicateArray[PESO_PERCENTUALE] = true;
							console.log(tmpMaxPayout);
							arrGruppoDesc.push(tmpMaxPayout);
						}
					}
					//**********************end of removing duplicate PESO_PERCENTUALE**************************
				}
				console.log(arrGruppoDesc);
				filterModel8.setData(arrGruppoDesc);
				duplicateArray = [], arrGruppoDesc = [], tmpMaxPayout = [];
				this.getView().setModel(filterModel8, "filterModel8");
				for (var i = 0; i < data.length; i++) {
					//**********************start of removing duplicate ID_PISTA**************************
					if (data[i].ID_PISTA !== null && data[i].ID_PISTA !== "") {
						var ID_PISTA = data[i].ID_PISTA;
						if (!duplicateArray[ID_PISTA]) {
							tmpMaxPayout = {
								"ID_PISTA": ID_PISTA
							};
							duplicateArray[ID_PISTA] = true;
							//console.log(tmpMaxPayout);
							arrGruppoDesc.push(tmpMaxPayout);
						}
					}
					//**********************end of removing duplicate ID_PISTA**************************
				}
				//console.log(arrGruppoDesc);
				filterModel9.setData(arrGruppoDesc);
				duplicateArray = [], arrGruppoDesc = [], tmpMaxPayout = [];
				this.getView().setModel(filterModel9, "filterModel9");
				oDialog.setModel(this.getView().getModel("filterModel1"));
				oDialog.setModel(this.getView().getModel("filterModel2"));
				oDialog.setModel(this.getView().getModel("filterModel3"));
				oDialog.setModel(this.getView().getModel("filterModel4"));
				oDialog.setModel(this.getView().getModel("filterModel5"));
				oDialog.setModel(this.getView().getModel("filterModel6"));
				oDialog.setModel(this.getView().getModel("filterModel7"));
				oDialog.setModel(this.getView().getModel("filterModel8"));
				oDialog.setModel(this.getView().getModel("filterModel9"));
				this.getView().addDependent(oDialog);
				if (Device.system.desktop) {
					oDialog.addStyleClass("sapUiSizeCompact");
				}
			}
			return oDialog;
		},

		/************************filter function allows the user to filter the data of the tbl	as per the user selected values in thje dialog box********************************/
		filter: function (oEvent) {
			debugger;
			var that = this;
			var oTable = this.byId("tbl"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				aFilters = [],
				oFilter;
			mParams.filterItems.forEach(function (oItem) {
				var sPath = oItem.getKey();
				var text = oItem.getText();
				if (sPath === "SN_CONGELATA" || sPath === "SN_CONGELATA") {
					if (text === "Si")
						text = "S";
					else if (text === "No")
						text = "N";
				}
				if (sPath === "ID_SCHEDAMASTER")
					sPath = "ID_SCHEDAMASTER2";
				if (sPath === "NOTE")
					sPath = "NOTE2";
				if (sPath === "DESCR_SCHEDA")
					sPath = "DESCR_SCHEDA2";
				if (sPath === "MAXPERCPAYOUT")
					sPath = "MAXPERCPAYOUT2";
				if (sPath === "DESCR_GRUPPOSCHEDA")
					sPath = "DESCR_GRUPPOSCHEDA2";
				if (text !== "-") {
					oFilter = new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.EQ, text);
					aFilters.push(oFilter);
				}

			});
			// apply filter settings

			oBinding = this.getView().byId("tbl").getBinding("items");
			oBinding.filter(aFilters);

			// update filter bar
			this.byId("vsdFilterBar").setVisible(aFilters.length > 0);
			this.byId("vsdFilterLabel").setText(mParams.filterString);
			/*
			 */
			that.displayTab(oBinding);

		},
		/************************displayTab function displays the parameters used for selection of filters********************************/
		displayTab: function (oBinding) {
			debugger;
			var dataNew = [];
			for (var i = 0; i < oBinding.aLastContexts.length; i++)
				dataNew.push(oMainModel.getProperty(oBinding.aLastContexts[i].sPath));
			//oMainModel.setData(dataNew);
			oMainModel.refresh();
			var m = {},
				bind = [];
			var data11 = dataNew;
			for (var i = 0; i < data11.length; i++) {
				var vv = data11[i].ID_SCHEDAMASTER2,
					v = data11[i];
				if (!m[vv]) {
					data11[i].DESCR_TEMPLATELETTERA = true;
					data11[i].ID_SCHEDAMASTER = data11[i].ID_SCHEDAMASTER2;
					m[vv] = true;
				} else {
					data11[i].ID_SCHEDAMASTER = "";
					data11[i].NOTE = "";
					data11[i].DESCR_SCHEDA = "";
					data11[i].DESCR_GRUPPOSCHEDA = "";
					data11[i].MAXPERCPAYOUT = "";
					data11[i].DESCR_TEMPLATELETTERA = false;

				}
				bind.push(v);
			}
			//oMainModel.setData([]);
			//oMainModel.setData(bind);
			oMainModel.refresh();
			//Removing duplicate values
			var m1 = {},
				m2 = {},
				m3 = {},
				m4 = {},
				m5 = {},
				m6 = {},
				m7 = {},
				m8 = {},
				m9 = {},
				m10 = {},
				v1 = [],
				v2 = [],
				v3 = [],
				v4 = [],
				v5 = [],
				v6 = [],
				v7 = [],
				v8 = [],
				v9 = [],
				v10 = [],
				data = bind;
			for (var i = 0; i < data.length; i++) {
				var vv1 = data[i].ID_SCHEDAMASTER,
					vv2 = data[i].DESCR_SCHEDA,
					vv3 = data[i].MAXPERCPAYOUT,
					vv4 = data[i].DESCR_GRUPPOSCHEDA,
					vv5 = data[i].NOTE,
					vv6 = data[i].SN_CONGELATA,
					vv7 = data[i].DESCR_CURVA,
					vv8 = data[i].DESCR_PISTA,
					vv9 = data[i].PESO_PERCENTUALE,
					vv10 = data[i].ID_PISTAVIEW;

				if (!m1[vv1] && vv1 !== "") {
					m1[vv1] = true;
					v1.push(vv1);
				}
				if (!m2[vv2] && vv2 !== "") {
					m2[vv2] = true;
					v2.push(vv2);
				}
				if (!m3[vv3] && vv3 !== "") {
					m3[vv3] = true;
					v3.push(vv3);
				}
				if (!m4[vv4] && vv4 !== "") {
					m4[vv4] = true;
					v4.push(vv4);
				}

				if (!m5[vv5] && vv5 !== "") {
					m5[vv5] = true;
					v5.push(vv5);
				}
				if (!m6[vv6] && vv6 !== "") {
					m6[vv6] = true;
					if (vv6 === "S")
						v6.push("Si");
					else
						v6.push("No")
				}

				if (!m7[vv7] && vv7 !== "") {
					m7[vv7] = true;
					v7.push(vv7);
				}
				if (!m8[vv8] && vv8 !== "") {
					m8[vv8] = true;
					v8.push(vv8);
				}
				if (!m9[vv9] && vv9 !== "") {
					m9[vv9] = true;
					v9.push(vv9);
				}
				if (!m1[vv10] && vv10 !== "") {
					m10[vv10] = true;
					v10.push(vv10);
				}

			}
			var Filter = [{
				ID_SCHEDAMASTER: v1
			}, {
				DESCR_SCHEDA: v2
			}, {
				MAXPERCPAYOUT: v3
			}, {
				DESCR_GRUPPOSCHEDA: v4
			}, {
				NOTE: v5
			}, {
				SN_CONGELATA: v6
			}, {
				DESCR_CURVA: v7
			}, {
				DESCR_PISTA: v8
			}, {
				PESO_PERCENTUALE: v9
			}, {
				ID_PISTA: v10
			}];

			console.log(Filter);
			var oMainModelFilter = new JSONModel();
			oMainModelFilter.setData(Filter);
			this.getView().setModel(oMainModelFilter, "FilterSchedaMasterModel");

			//this.getView().setModel(oMainModel, "SchedaMasterModel");
			//oBinding = this.getView().byId("tbl").getBinding("items");
			//oBinding.refresh();
			console.log(oMainModel.getData());
		},
		/***************************** end  of filter operation method*************************************************/
		/***************************** start of group operation method*************************************************/
		/************************handleGroupButtonPressed function accesses the group_SchedaMaster fragment********************************/
		handleGroupButtonPressed: function (oEvent) {
			flagGroup = true;
			this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.group_SchedaMaster").open();
		},
		/************************group function allows the user to group the data of the tbl based on the user selected values in ascending or descending order********************************/
		group: function (oEvent) {
			//	debugger;
			var oTable = this.byId("tbl"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				vGroup,
				aGroups = [];
			if (mParams.groupItem) {
				sPath = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;
				vGroup = this.mGroupFunctions[sPath];
				aGroups.push(new Sorter(sPath, bDescending, vGroup));
				// apply the selected group settings
				oBinding.sort(aGroups);
			} else
				oBinding.sort(); // else condition is to group none
		},
		/***************************** end  of group operation method*************************************************/
		/***************************** start of download operation method*************************************************/
		/*******************onDataExport function is used to download the table data in the Excel format********************/
		onDataExport: function (oEvent) {
			debugger;
			var oModel = this.getView().getModel('SchedaMasterModel').getData();
			//	var oModel1 = oMainModel1.getData();
			oResource = this.getView().getModel("i18n").getResourceBundle();
			var columnTemplate = [
				[{
					column: 'ID_SCHEDAMASTER',
					label: oResource.getText("Id")
				}, {
					column: 'DESCR_SCHEDA',
					label: oResource.getText("Desc")
				}, {
					column: 'MAXPERCPAYOUT',
					label: oResource.getText("Max_Payout")
				}, {
					column: 'DESCR_GRUPPOSCHEDA',
					label: oResource.getText("Gruppo")
				}, {
					column: 'NOTE',
					label: oResource.getText("Note")
				}, {
					column: 'SN_CONGELATA',
					label: oResource.getText("Congelata")
				}]
			];
			var data = [];
			var data1 = {};

			for (var i = 0; i < oModel.length; i++) {

				data1 = {
					"ID_SCHEDAMASTER": oModel[i].ID_SCHEDAMASTER2,
					"DESCR_SCHEDA": oModel[i].DESCR_SCHEDA2,
					"MAXPERCPAYOUT": oModel[i].MAXPERCPAYOUT2,
					"DESCR_GRUPPOSCHEDA": oModel[i].DESCR_GRUPPOSCHEDA2,
					"NOTE": oModel[i].NOTE2,
					"SN_CONGELATA": oModel[i].SN_CONGELATA
				}
				data.push(data1);

			}
			var obj = {}
			obj.results = data;
			/*	var aItems = this.getView().byId('tbl').getItems();
				var tmp = {};
				var dataExport = [];
				for (var i = 0; i < aItems.length; i++) {
					tmp = {
						ID_SCHEDAMASTER: aItems[i].getBindingContext("SchedaMasterModel").getObject().ID_SCHEDAMASTER,
						DESCR_SCHEDA: aItems[i].getBindingContext("SchedaMasterModel").getObject().DESCR_SCHEDA,
						MAXPERCPAYOUT: aItems[i].getBindingContext("SchedaMasterModel").getObject().MAXPERCPAYOUT,
						DESCR_GRUPPOSCHEDA: aItems[i].getBindingContext("SchedaMasterModel").getObject().DESCR_GRUPPOSCHEDA,
						NOTE: aItems[i].getBindingContext("SchedaMasterModel").getObject().NOTE,
						SN_CONGELATA: aItems[i].getBindingContext("SchedaMasterModel").getObject().SN_CONGELATA,
					}
					dataExport.push(tmp);
				}
				var obj = {}
				obj.results = dataExport;
				console.log(dataExport); */
			tablesToExcel(obj, ['SchedaMaster'], columnTemplate, 'SchedaMaster.xls', 'Excel');
		},
		/***************************** end of download operation method*************************************************/
		/***************************** dataCounter function fetches the totalschedaCount(ID_SCHEDAMASTER) based on ID_PERIODO*************************************************/
		dataCounter: function (oFilters) {
			var cond = [],
				thiss = this;
			debugger;
			var filter = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, selectedfiscalYearPeriodi);

			oFilters.push(filter);
			if (oFilters.length > 0) {
				for (var i = 0; i < oFilters.length; i++) {
					if (oFilters[i].sPath === undefined) {
						for (var ii = 0; ii < oFilters[i].aFilters.length; ii++) {
							if (oFilters[i].aFilters[ii].sOperator === "BT")
								cond.push({
									sPath: oFilters[i].aFilters[ii].sPath,
									operator: oFilters[i].aFilters[ii].sOperator,
									value1: oFilters[i].aFilters[ii].oValue1,
									value2: oFilters[i].aFilters[ii].oValue2
								});
							else
								cond.push({
									sPath: oFilters[i].aFilters[ii].sPath,
									operator: oFilters[i].aFilters[ii].sOperator,
									value: oFilters[i].aFilters[ii].oValue1
								});
						}

					} else {
						if (oFilters[i].sOperator === "BT")
							cond.push({
								sPath: oFilters[i].sPath,
								operator: oFilters[i].sOperator,
								value1: oFilters[i].oValue1,
								value2: oFilters[i].oValue2
							});
						else
							cond.push({
								sPath: oFilters[i].sPath,
								operator: oFilters[i].sOperator,
								value: oFilters[i].oValue1
							});
					}
				}
			}
			for (var i = 0; i < cond.length; i++) {
				if (cond[i].sPath.includes("DATE") || cond[i].sPath.includes("VALE") || cond[i].sPath.includes("ASSEGNAZIONE")) {
					if (cond[i].operator === "BT") {
						cond[i].value1 = cond[i].value1.toISOString();
						cond[i].value2 = cond[i].value2.toISOString();
					} else

						cond[i].value = cond[i].value.toISOString();
				}
			}

			var obj = {
				field: ['ID_SCHEDAMASTER'],
				table: 'V_SchedaMaster1',
				condition: cond
			};
			console.log(obj);

			$.ajax({
				url: "/HANAMDC/STIP/STIPAdmin/services/counter.xsjs",
				//url: "/HANAMDC/STIP/STIPAdmin/services/test.xsjs",

				type: "POST",
				method: "GET",
				contentType: 'application/json',
				data: {
					odata: JSON.stringify(obj)
				},
				dataType: 'text',
				success: function (data, textStatus1) {
					debugger;

					data = JSON.parse(data);
					console.log(data);
					if (data.result === "Error")
						totalschedaCount = 0;
					else
						totalschedaCount = data[0].ID_SCHEDAMASTER;
					var title = thiss.getView().getModel("i18n").getResourceBundle().getText("SchedaMaster") + " (" + totalschedaCount + ")";
					thiss.byId("title").setText(title);
					thiss.getSchedaMaster(oFilters);

				},
				error: function (data, textStatus1) {
					debugger;
					console.log(data);
					totalschedaCount = 0;

					thiss.getSchedaMaster(oFilters);
				}
			});

		},

	});
});