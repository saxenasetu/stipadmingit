sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"stipAdmin/stipAdmin/util/AnagraficaPayout",
	"sap/m/TablePersoController",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/format/DateFormat",
	"sap/ui/Device",
	"sap/ui/model/Sorter",
	"stipAdmin/stipAdmin/controller/exportExcel",
	"stipAdmin/stipAdmin/util/Formatter",
	'sap/m/Token'
], function (Controller, Export, ExportTypeCSV, AnagraficaPayout, TablePersoController, FilterOperator, Filter, JSONModel, MessageToast,
	MessageBox, DateFormat, Device, Sorter, exportExcel, Formatter, Token) {
	"use strict";
	var oResource;
	return Controller.extend("stipAdmin.stipAdmin.controller.AnagraficaPayout", {
		Formatter: Formatter,

		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/

		onInit: function () {
			this.busyDialog = new sap.m.BusyDialog();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("AnagraficaPayout").attachPatternMatched(this.onObjectMatched, this);
			this.getView().byId("idsearchBarName")._oSearchButton.setText("Cerca");
			this._oTPC = new TablePersoController({
				table: this.byId("tblAnagraficaPayout"),
				componentName: "AnagraficaPayout",
				persoService: AnagraficaPayout
			}).activate();
			var year = new JSONModel({
				year: ""
			});
			this.getView().setModel(year, "oYearModel");
		},

		/******************** _onObjectMatched fetches argument values********************************************/

		onObjectMatched: function (oEvent) {
			var oResource = new sap.ui.model.resource.ResourceModel({
				bundleName: "stipAdmin.stipAdmin.i18n.i18n"
			}).getResourceBundle();
			//	this.getView().byId("filterbar")._oSearchButton.setText("Cerca"); // Changing filter bar button name
			//this.getView().byId("idsearchBarName")._oSearchButton.setText(oResource.getText("ok"));
			this.getView().byId("idsearchBarName")._oHintText.setText(oResource.getText("noFilter"));
			this.oMainModel = this.getOwnerComponent().getModel();
			this.aFilters = [];
			this.createSearchModel();
			this._mViewSettingsDialogs = {};
			this.numberofCols;
			this.morethan3Flag;
			//	this.dyanmicCallForDB();
			var oArguments = oEvent.getParameter("arguments");
			this.selectedfiscalYearPeriodi = oArguments.str;
			this.getFiscalYear(this.selectedfiscalYearPeriodi);
			this.getF4helpModel();
			//this.previousFunction();
		},
		/************************Reset the structure of result table***********************************/
		createSearchModel: function (oEvent) {
			this.getView().byId("idAnagrafica").destroyTokens();
			this.getView().byId("idMatricola").destroyTokens();
			// this.getView().byId("idQualifica").setValue("")
			if (this.byId("idQualifica").getSelectedKey())
				this.byId("idQualifica").setSelectedKey("");
			var oSearchModel = new JSONModel({
				sID: "",
				Matricola: "",
				Nome: "",
				Qualifica: "",
				Dal: "",
				PercStip: "",
				Dimessi: "",
				Company: "",
				Grade: "",
				Dipartimento: "",
				Ruolo: "",
				RespDiretto: "",
				RespHR: ""
			});
			this.getView().setModel(oSearchModel, "oSearchModel")
		},
		_onUpdateFinished: function (oEvent) {
			debugger;
		},
		/*************************getDataForTables function fills the result table with relevant data*****************************/
		getDataForTables: function (oEvent) {
			debugger;
			var year = this.getView().byId("idtxtfiscalyear").getText(),
				r = /\d+/,
				year = year.split("-"),
				from = new Date("04-01-" + year[0].match(r)[0]),
				to = new Date("03-31-" + year[1].match(r)[0]);
			var oSearchModel = this.getView().getModel("oSearchModel").getData();
			if (oSearchModel.Grade) {
				var searchFilter = new Filter([
					new Filter("DATA_CESSAZIONE", sap.ui.model.FilterOperator.EQ, 'NULL'),
					new Filter("DATA_CESSAZIONE", sap.ui.model.FilterOperator.EQ, '')
				], false);
				this.aFilters.push(searchFilter);
			}
			if (!oSearchModel.Dal)
				this.aFilters.push(new Filter("VALE_DAL_DATE", FilterOperator.BT, from, to));
			//	this.aFilters.push(new Filter("MATRICOLA", FilterOperator.EQ, '30067S'));
			this.oMainModel.read("/V_ANAGRAFICASet", {
				filters: this.aFilters,
				success: function (oData, oResponse) {
					debugger;
					console.log(oData.results);
					/*	var oANAGRAFICAModel = new JSONModel();
						this.getView().setModel(oANAGRAFICAModel, "oANAGRAFICAModel");*/
					this.jvalues = [];
					if (oData.results.length > 0) {
						var anagrafica = [];
						var group = oData.results.reduce((r, a) => {
								r[a.MATRICOLA] = [...r[a.MATRICOLA] || [], a];
								return r;
							}, {}),
							keys = Object.keys(group);
						for (var i = 0; i < keys.length; i++) {
							group[keys[i]].sort((a, b) =>
								//	a.date - b.date
								a.VALE_DAL_DATE - b.VALE_DAL_DATE //date sort defect fixed
							);
							var row = {};
							//	if (group[keys[i]].length > 3) {
							if (group[keys[i]].length > 4)
								row.cambi = "X";
							else
								row.cambi = "";
							console.log(group[keys[i]][0].VALE_DAL);
							var checkAprDate = group[keys[i]][0].VALE_DAL;
							checkAprDate = checkAprDate.substring(0, 5);
							if (checkAprDate === "01/04") { // the condition checks if checkAprDate is equal to 01/04 then it fetches the value of %Target Bonus and Data Cambio. 

								for (var j = 0; j < group[keys[i]].length; j++) {
									if (j == 0) {

										row.MATRICOLA = group[keys[i]][j].MATRICOLA;
										row.targetBonusYear = group[keys[i]][j].PERCSTIP;
										row.STATUS_DIPENDENTE = group[keys[i]][j].STATUS_DIPENDENTE;
										row.SUPERID = group[keys[i]][j].SUPERID;
										row.FULLNAME = group[keys[i]][j].FULLNAME;
										row.RUOLO_PROF = group[keys[i]][j].RUOLO_PROF;
										row.QUALIFICA = group[keys[i]][j].QUALIFICA;
										row.BAND = group[keys[i]][j].BAND;
										row.RALQ1 = group[keys[i]][j].RALQ1;
										row.RALSEMESTRALE = group[keys[i]][j].RALSEMESTRALE;
										row.RALQ3 = group[keys[i]][j].RALQ3;
										row.RALANNUALE = group[keys[i]][j].RALANNUALE;
										row.HR_MANAGER = group[keys[i]][j].HR_MANAGER;
										row.MATRICOLAMANAGER = group[keys[i]][j].MATRICOLAMANAGER;
										row.DIP_DESCR = group[keys[i]][j].DIP_DESCR;
										row.DESCR_COMPANY = group[keys[i]][j].DESCR_COMPANY;
										row.HR1_PAYGRADE = group[keys[i]][j].HR1_PAYGRADE;
									} else if (j == 1) {

										row.dataValidata1 = group[keys[i]][j].VALE_DAL;
										row.targetBonus1 = group[keys[i]][j].PERCSTIP;

									} else if (j == 2) {

										row.dataValidata2 = group[keys[i]][j].VALE_DAL;
										row.targetBonus2 = group[keys[i]][j].PERCSTIP;

									} else if (j == 3) {

										row.dataValidata3 = group[keys[i]][j].VALE_DAL;
										row.targetBonus3 = group[keys[i]][j].PERCSTIP;

									} else if (j == 4) {
										this.jvalues.push(j);
										row.dataValidata4 = group[keys[i]][j].VALE_DAL;
										row.targetBonus4 = group[keys[i]][j].PERCSTIP;
									} else if (j == 5) {
										this.jvalues.push(j);
										row.dataValidata5 = group[keys[i]][j].VALE_DAL;
										row.targetBonus5 = group[keys[i]][j].PERCSTIP;
									} else if (j == 6) {
										this.jvalues.push(j);
										row.dataValidata6 = group[keys[i]][j].VALE_DAL;
										row.targetBonus6 = group[keys[i]][j].PERCSTIP;
									} else if (j == 7) {
										this.jvalues.push(j);
										row.dataValidata7 = group[keys[i]][j].VALE_DAL;
										row.targetBonus8 = group[keys[i]][j].PERCSTIP;
									} else if (j == 8) {
										this.jvalues.push(j);
										row.dataValidata8 = group[keys[i]][j].VALE_DAL;
										row.targetBonus8 = group[keys[i]][j].PERCSTIP;
									} else if (j == 9) {
										this.jvalues.push(j);
										row.dataValidata9 = group[keys[i]][j].VALE_DAL;
										row.targetBonus9 = group[keys[i]][j].PERCSTIP;
									} else if (j == 10) {
										this.jvalues.push(j);
										row.dataValidata10 = group[keys[i]][j].VALE_DAL;
										row.targetBonus10 = group[keys[i]][j].PERCSTIP;
									} else if (j == 11) {
										this.jvalues.push(j);
										row.dataValidata11 = group[keys[i]][j].VALE_DAL;
										row.targetBonus11 = group[keys[i]][j].PERCSTIP;
									} else if (j == 12) {
										this.jvalues.push(j);
										row.dataValidata12 = group[keys[i]][j].VALE_DAL;
										row.targetBonus12 = group[keys[i]][j].PERCSTIP;
									}
									/* if (j >= 4) {
									this.morethan3Flag = 'X';
									this.numberofCols = j;
									debugger;
									var name = row.dataValidata + j;
									name = group[keys[i]][j].VALE_DAL;
									var name2 = row.targetBonus + j;
									name2 = group[keys[i]][j].PERCSTIP;
									}*/
								}
							} else // otherwise if j is less than or equal to key value then  the value of j gets decremented by 1 and fetches the %Target Bonus and Data Cambio value.

							{
								for (var j = 0; j <= group[keys[i]].length; j++) {

									if (j == 0) {

										row.MATRICOLA = group[keys[i]][j].MATRICOLA;
										row.targetBonusYear = "";
										row.STATUS_DIPENDENTE = group[keys[i]][j].STATUS_DIPENDENTE;
										row.SUPERID = group[keys[i]][j].SUPERID;
										row.FULLNAME = group[keys[i]][j].FULLNAME;
										row.RUOLO_PROF = group[keys[i]][j].RUOLO_PROF;
										row.QUALIFICA = group[keys[i]][j].QUALIFICA;
										row.BAND = group[keys[i]][j].BAND;
										row.RALQ1 = group[keys[i]][j].RALQ1;
										row.RALSEMESTRALE = group[keys[i]][j].RALSEMESTRALE;
										row.RALQ3 = group[keys[i]][j].RALQ3;
										row.RALANNUALE = group[keys[i]][j].RALANNUALE;
										row.HR_MANAGER = group[keys[i]][j].HR_MANAGER;
										row.MATRICOLAMANAGER = group[keys[i]][j].MATRICOLAMANAGER;
										row.DIP_DESCR = group[keys[i]][j].DIP_DESCR;
										row.DESCR_COMPANY = group[keys[i]][j].DESCR_COMPANY;
										row.HR1_PAYGRADE = group[keys[i]][j].HR1_PAYGRADE;
									} else if (j == 1) {

										row.dataValidata1 = group[keys[i]][j - 1].VALE_DAL;
										row.targetBonus1 = group[keys[i]][j - 1].PERCSTIP;

									} else if (j == 2) {

										row.dataValidata2 = group[keys[i]][j - 1].VALE_DAL;
										row.targetBonus2 = group[keys[i]][j - 1].PERCSTIP;

									} else if (j == 3) {

										row.dataValidata3 = group[keys[i]][j - 1].VALE_DAL;
										row.targetBonus3 = group[keys[i]][j - 1].PERCSTIP;

									} else if (j == 4) {
										this.jvalues.push(j);
										row.dataValidata4 = group[keys[i]][j - 1].VALE_DAL;
										row.targetBonus4 = group[keys[i]][j - 1].PERCSTIP;
									} else if (j == 5) {
										this.jvalues.push(j);
										row.dataValidata5 = group[keys[i]][j - 1].VALE_DAL;
										row.targetBonus5 = group[keys[i]][j - 1].PERCSTIP;
									} else if (j == 6) {
										this.jvalues.push(j);
										row.dataValidata6 = group[keys[i]][j - 1].VALE_DAL;
										row.targetBonus6 = group[keys[i]][j - 1].PERCSTIP;
									} else if (j == 7) {
										this.jvalues.push(j);
										row.dataValidata7 = group[keys[i]][j - 1].VALE_DAL;
										row.targetBonus8 = group[keys[i]][j - 1].PERCSTIP;
									} else if (j == 8) {
										this.jvalues.push(j);
										row.dataValidata8 = group[keys[i]][j - 1].VALE_DAL;
										row.targetBonus8 = group[keys[i]][j - 1].PERCSTIP;
									} else if (j == 9) {
										this.jvalues.push(j);
										row.dataValidata9 = group[keys[i]][j - 1].VALE_DAL;
										row.targetBonus9 = group[keys[i]][j - 1].PERCSTIP;
									} else if (j == 10) {
										this.jvalues.push(j);
										row.dataValidata10 = group[keys[i]][j - 1].VALE_DAL;
										row.targetBonus10 = group[keys[i]][j].PERCSTIP;
									} else if (j == 11) {
										this.jvalues.push(j);
										row.dataValidata11 = group[keys[i]][j - 1].VALE_DAL;
										row.targetBonus11 = group[keys[i]][j - 1].PERCSTIP;
									} else if (j == 12) {
										this.jvalues.push(j);
										row.dataValidata12 = group[keys[i]][j - 1].VALE_DAL;
										row.targetBonus12 = group[keys[i]][j - 1].PERCSTIP;
									}
									/* if (j >= 4) {
									this.morethan3Flag = 'X';
									this.numberofCols = j;
									debugger;
									var name = row.dataValidata + j;
									name = group[keys[i]][j].VALE_DAL;
									var name2 = row.targetBonus + j;
									name2 = group[keys[i]][j].PERCSTIP;
									}*/
								}
							}

							anagrafica.push(row);
						}
						//oANAGRAFICAModel.setData(anagrafica);
					} else {
						anagrafica = {};
					}
					var oANAGRAFICAModel = new JSONModel();
					oANAGRAFICAModel.setData(anagrafica);
					console.log(anagrafica)
					this.getView().setModel(oANAGRAFICAModel, "oANAGRAFICAModel");
					//setting counder
					var count = anagrafica.length;

					if (count > 0) {
						var txt = this.getView().getModel("i18n").getResourceBundle().getText("AnagraficaPayout") + " (" + count + ")";
					} else {
						var txt = this.getView().getModel("i18n").getResourceBundle().getText("AnagraficaPayout") + " (" + 0 + ")";
					}
					this.byId("title").setText(txt);
					this.getView().getModel("oANAGRAFICAModel").refresh();
					debugger;
					var grade = oData.results.filter((s => a => !s.has(a.BAND) && s.add(a.BAND))(new Set));
					grade = grade.map(grade => grade.BAND);
					oANAGRAFICAModel.setProperty("/grade", grade);
					var qualifica = oData.results.filter((s => a => !s.has(a.QUALIFICA) && s.add(a.QUALIFICA))(new Set));
					qualifica = qualifica.map(qualifica => qualifica.QUALIFICA);
					oANAGRAFICAModel.setProperty("/qualifica", qualifica);
					var ruolo = oData.results.filter((s => a => !s.has(a.RUOLO_PROF) && s.add(a.RUOLO_PROF))(new Set));
					ruolo = ruolo.map(ruolo => ruolo.RUOLO_PROF);
					oANAGRAFICAModel.setProperty("/ruolo", ruolo);
					var fullname = oData.results.filter((s => a => !s.has(a.FULLNAME) && s.add(a.FULLNAME))(new Set));
					fullname = fullname.map(fullname => fullname.FULLNAME);
					oANAGRAFICAModel.setProperty("/fullname", fullname);
					var matricolaManagager = oData.results.filter((s => a => !s.has(a.MATRICOLAMANAGER) && s.add(a.MATRICOLAMANAGER))(new Set));
					matricolaManagager = matricolaManagager.map(matricolaManagager => matricolaManagager.MATRICOLAMANAGER);
					oANAGRAFICAModel.setProperty("/matricolaManagager", matricolaManagager);
					var CAMBI = oData.results.filter((s => a => !s.has(a.cambi) && s.add(a.cambi))(new Set));
					CAMBI = CAMBI.map(CAMBI => CAMBI.cambi);
					oANAGRAFICAModel.setProperty("/CAMBI", CAMBI);
					this.getView().getModel("oANAGRAFICAModel").refresh();
					//	this._onAvvio();
					//settings
					/*this._oTPC = new TablePersoController({
						table: this.byId("tblAnagraficaPayout"),
						componentName: "AnagraficaPayout",
						persoService: AnagraficaPayout
					}).activate();*/
				}.bind(this),
				error: function (oError) {
					MessageToast.show("Error Displaying List");
				}.bind(this),
			});
		},
		/*********_onAvvio function called when user clicks on Cerca (search) button ************/
		_onAvvio: function (oEvent) {
			var oSearchModel = this.getView().getModel("oSearchModel").getData(),
				oTable = this.getView().byId("tblAnagraficaPayout"),
				oBinding = oTable.getBinding("items");
			this.aFilters = [];
			var tokenFiltArray = [];
			var tokenFiltArray1 = [];
			var sidToken = "";
			var matriToken = "";
			//Multiple SID filter search
			tokenFiltArray = this.getView().byId("idAnagrafica").getTokens();
			console.log(tokenFiltArray);
			for (var t = 0; t < tokenFiltArray.length; t++) {
				console.log(tokenFiltArray[t].getText());
				sidToken = tokenFiltArray[t].getText();
				this.aFilters.push(new Filter("SUPERID", FilterOperator.EQ, sidToken));
			}
			//Multiple matricola filter search
			tokenFiltArray1 = this.getView().byId("idMatricola").getTokens();
			console.log(tokenFiltArray1);
			for (var m = 0; m < tokenFiltArray1.length; m++) {
				console.log(tokenFiltArray1[m].getText());
				matriToken = tokenFiltArray1[m].getText();
				this.aFilters.push(new Filter("MATRICOLA", FilterOperator.EQ, matriToken));
			}
			debugger;
			if (oSearchModel.sID) {
				debugger
				var a = oSearchModel.sID;
				a = a.split(",");
				for (var i = 0; i < a.length; i++) {
					this.aFilters.push(new Filter("SUPERID", FilterOperator.EQ, a[i]));
				}
			}

			if (oSearchModel.Matricola)
				this.aFilters.push(new Filter({
					path: "MATRICOLA",
					operator: FilterOperator.EQ,
					value1: oSearchModel.Matricola,
					caseSensitive: false
				}));
			if (oSearchModel.Nome)
				this.aFilters.push(new Filter({
					path: "FULLNAME",
					operator: FilterOperator.Contains,
					value1: oSearchModel.Nome,
					caseSensitive: false
				}));
			var temp = this.byId("idQualifica").getSelectedKey();
			oSearchModel.Qualifica = temp;
			// if (oSearchModel.Qualifica)
			// 	this.aFilters.push(new Filter({
			// 		path: "QUALIFICA",
			// 		operator: FilterOperator.EQ,
			// 		value1: oSearchModel.Qualifica,
			// 		caseSensitive: false
			// 	}));

			/**Qualifica filter -> table for filtering: t_tmp_input_1
			 *Qualifica field with this hardcoded value: D,Q,I
			 *- If select D in UI the query has to search Qualifica = ‘D’
			 *- If select Q in UI the query has to search HR1_paygrade like ‘Q’
			 *- If select I in UI, Qualifica = I and HR1_paygrade = ( 1,2,3,4,5, 5S, 6,7)
			 **/
			if (oSearchModel.Qualifica) {
				debugger;
				var Qualifica = oSearchModel.Qualifica;
				if (Qualifica === 'D' || Qualifica === '')
					var filter = new sap.ui.model.Filter({
						path: 'QUALIFICA',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: Qualifica,
						caseSensitive: false
					});
				else if (Qualifica === 'Q')
					var filter = new sap.ui.model.Filter({
						path: 'HR1_PAYGRADE',
						operator: sap.ui.model.FilterOperator.Contains,
						value1: Qualifica,
						caseSensitive: false
					});

				else if (Qualifica === 'I') {
					var filter1 = new sap.ui.model.Filter({
						path: 'QUALIFICA',
						operator: sap.ui.model.FilterOperator.Contains,
						value1: Qualifica,
						caseSensitive: false
					});
					this.aFilters.push(filter1);
					var filter2 = new sap.ui.model.Filter({
						path: 'HR1_PAYGRADE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: '1',
						caseSensitive: false
					});
					var filter3 = new sap.ui.model.Filter({
						path: 'HR1_PAYGRADE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: '2',
						caseSensitive: false
					});
					var filter4 = new sap.ui.model.Filter({
						path: 'HR1_PAYGRADE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: '3',
						caseSensitive: false
					});
					var filter5 = new sap.ui.model.Filter({
						path: 'HR1_PAYGRADE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: '4',
						caseSensitive: false
					});
					var filter6 = new sap.ui.model.Filter({
						path: 'HR1_PAYGRADE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: '5',
						caseSensitive: false
					});
					var filter7 = new sap.ui.model.Filter({
						path: 'HR1_PAYGRADE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: '5S',
						caseSensitive: false
					});
					var filter8 = new sap.ui.model.Filter({
						path: 'HR1_PAYGRADE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: '6',
						caseSensitive: false
					});
					var filter9 = new sap.ui.model.Filter({
						path: 'HR1_PAYGRADE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: '7',
						caseSensitive: false
					});
					filter = new sap.ui.model.Filter({
						filters: [

							filter2,
							filter3,
							filter4,
							filter5,
							filter6,
							filter7,
							filter8,
							filter9

						],
						and: false
					});
				}
				this.aFilters.push(filter);
			}
			if (oSearchModel.Grade)
				this.aFilters.push(new Filter({
					path: "BAND",
					operator: FilterOperator.EQ,
					value1: oSearchModel.Grade,
					caseSensitive: false
				}));
			/*	if (oSearchModel.Dal) { //check
					var from = oSearchModel.Dal;
					from = from.split(".");
					from = from[1] + "." + from[0] + "." + from[2];
					//	var from = new Date(oSearchModel.Dal).toLocaleDateString().replaceAll("/", ".");
					var month1 = new Date(oSearchModel.Dal).getMonth() + 1;
					var month2 = ((month1 < 10) ? '0' + month1 : month1);
					var year = new Date(oSearchModel.Dal).getFullYear();
					var to;
					switch (month1) {
					case 1:
						to = 31 + "." + month2 + "." + new Date(oSearchModel.Dal).getFullYear();
						break;
					case 2:
						if ((year % 100 === 0) ? (year % 400 === 0) : (year % 4 === 0))
							to = 28 + 1 + "." + month2 + "." + new Date(oSearchModel.Dal).getFullYear();
						else((year % 100 === 0) ? (year % 400 === 0) : (year % 4 === 0))
						to = 28 + "." + month2 + "." + new Date(oSearchModel.Dal).getFullYear();
						break;
					case 3:
						to = 31 + "." + month2 + "." + new Date(oSearchModel.Dal).getFullYear();
						break;
					case 4:
						to = 30 + "." + month2 + "." + new Date(oSearchModel.Dal).getFullYear();
						break;
					case 5:
						to = 31 + "." + month2 + "." + new Date(oSearchModel.Dal).getFullYear();
						break;
					case 6:
						to = 30 + "." + month2 + "." + new Date(oSearchModel.Dal).getFullYear();
						break;
					case 7:
						to = 31 + "." + month2 + "." + new Date(oSearchModel.Dal).getFullYear();
						break;
					case 8:
						to = 31 + "." + month2 + "." + new Date(oSearchModel.Dal).getFullYear();
						break;
					case 9:
						to = 30 + "." + month2 + "." + new Date(oSearchModel.Dal).getFullYear();
						break;
					case 10:
						to = 31 + "." + month2 + "." + new Date(oSearchModel.Dal).getFullYear();
						break;
					case 11:
						to = 30 + "." + month2 + "." + new Date(oSearchModel.Dal).getFullYear();
						break;
					case 12:
						to = 31 + "." + month2 + "." + new Date(oSearchModel.Dal).getFullYear();
						break;
					default:
						to = "Invalid month";
						break;
					}
						var searchFilter = new Filter([
							new Filter("dataValidata1", FilterOperator.BT, from, to),
							new Filter("dataValidata2", FilterOperator.BT, from, to),
							new Filter("dataValidata3", FilterOperator.BT, from, to)
						], false);
				
		
				
				}*/
			debugger;
			if (oSearchModel.Dal) { //check
				/*	var from = oSearchModel.Dal;
					from = from.split(".");
					from = from[0] + "-" + from[1] + "-" + from[2];*/
				console.log(oSearchModel.Dal);
				/*****************Changing the month number for January, February and March for the next year *****************/
				var dal = oSearchModel.Dal;
				var mm = dal.split(".")[0];
				var dd = dal.split(".")[1];
				var yy = dal.split(".")[2];
				if (mm === '13')
					mm = "01" //Assigns the month number '01' to January next year
				else if (mm === '14')
					mm = "02" //Assigns the month number '02' to February next year
				else if (mm === '15')
					mm = "03" //Assigns the month number '03' to March next year

				dal = mm + "." + dd + "." + yy;
				oSearchModel.Dal = dal; //Setting the formatted months to the model
				console.log(oSearchModel.Dal);

				var year = this.getView().byId("idtxtfiscalyear").getText(),
					r = /\d+/,
					year = year.split("-"),
					from = new Date("04-01-" + year[0].match(r)[0]);
				//	var from = new Date(oSearchModel.Dal).toLocaleDateString().replaceAll("/", ".");
				var month1 = new Date(oSearchModel.Dal).getMonth() + 1;
				var month2 = ((month1 < 10) ? '0' + month1 : month1);
				var year = new Date(oSearchModel.Dal).getFullYear();
				var to;
				switch (month1) {
				case 1:
					to = month2 + "-" + 31 + "-" + new Date(oSearchModel.Dal).getFullYear();
					break;
				case 2:
					if ((year % 100 === 0) ? (year % 400 === 0) : (year % 4 === 0))
						to = month2 + "-" + 28 + 1 + "-" + new Date(oSearchModel.Dal).getFullYear();
					else((year % 100 === 0) ? (year % 400 === 0) : (year % 4 === 0))
					to = month2 + "-" + 28 + "-" + new Date(oSearchModel.Dal).getFullYear();
					break;
				case 3:
					to = month2 + "-" + 31 + "-" + new Date(oSearchModel.Dal).getFullYear();
					break;
				case 4:
					to = month2 + "-" + 30 + "-" + new Date(oSearchModel.Dal).getFullYear();
					break;
				case 5:
					to = month2 + "-" + 31 + "-" + new Date(oSearchModel.Dal).getFullYear();
					break;
				case 6:
					to = month2 + "-" + 30 + "-" + new Date(oSearchModel.Dal).getFullYear();
					break;
				case 7:
					to = month2 + "-" + 31 + "-" + new Date(oSearchModel.Dal).getFullYear();
					break;
				case 8:
					to = month2 + "-" + 31 + "-" + new Date(oSearchModel.Dal).getFullYear();
					break;
				case 9:
					to = month2 + "-" + 30 + "-" + new Date(oSearchModel.Dal).getFullYear();
					break;
				case 10:
					to = month2 + "-" + 31 + "-" + new Date(oSearchModel.Dal).getFullYear();
					break;
				case 11:
					to = month2 + "-" + 30 + "-" + new Date(oSearchModel.Dal).getFullYear();
					break;
				case 12:
					to = month2 + "-" + 31 + "-" + new Date(oSearchModel.Dal).getFullYear();
					break;
				default:
					to = "Invalid month";
					break;
				}
				/*	from = new Date("05-01-2019"),
					to = new Date("05-31-2019");*/
				from = new Date(from);
				to = new Date(to);
				this.aFilters.push(new Filter("VALE_DAL_DATE", FilterOperator.BT, from, to));
			}
			if (oSearchModel.PercStip) {
				/*	var searchFilter = new Filter([
						new Filter("RALQ1", FilterOperator.EQ, oSearchModel.PercStip),
						new Filter("RALSEMESTRALE", FilterOperator.EQ, oSearchModel.PercStip),
						new Filter("RALQ3", FilterOperator.EQ, oSearchModel.PercStip),
						new Filter("RALANNUALE", FilterOperator.EQ, oSearchModel.PercStip)
					], false);
					this.aFilters.push(searchFilter);*/
				this.aFilters.push(new Filter("PERCSTIP", FilterOperator.EQ, oSearchModel.PercStip));
			}
			if (oSearchModel.Dimessi)
				this.aFilters.push(new Filter("STATUS_DIPENDENTE", FilterOperator.EQ, oSearchModel.Dimessi));
			if (oSearchModel.Company)
				this.aFilters.push(new Filter("DESCR_COMPANY", FilterOperator.EQ, oSearchModel.Company));
			/*	if (oSearchModel.Grade)
					aFilters.push(new Filter("MATRICOLA", FilterOperator.EQ, oSearchModel.Grade)); */
			if (oSearchModel.Dipartimento)
				this.aFilters.push(new Filter("DIP_DESCR", FilterOperator.EQ, oSearchModel.Dipartimento));
			if (oSearchModel.Ruolo)
				this.aFilters.push(new Filter("RUOLO_PROF", FilterOperator.EQ, oSearchModel.Ruolo));
			if (oSearchModel.RespDiretto)
				this.aFilters.push(new Filter({
					path: "MATRICOLAMANAGER",
					operator: FilterOperator.Contains,
					value1: oSearchModel.RespDiretto,
					caseSensitive: false
				}));
			if (oSearchModel.RespHR)
				this.aFilters.push(new Filter("HR_MANAGER", FilterOperator.EQ, oSearchModel.RespHR));
			debugger;
			//oBinding.filter(aFilters);
			this.getDataForTables();
		},
		/****onReset function sets all the fields as blank*****/
		onReset: function (oEvent) {
			//this.aFilters = [];
			this.createSearchModel();
			this.getDataForTables();
		},
		getFiscalYear: function (selectedfiscalYearPeriodi) {
			//this.busyDialog.open();
			var that = this;
			that.busyDialog.open();
			var oFilters = [];
			var year = "";
			if (selectedfiscalYearPeriodi != undefined && selectedfiscalYearPeriodi != "") {
				var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, selectedfiscalYearPeriodi);
				oFilters.push(filter1);
			}
			var mParameters = {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					if (oResponse.data.results.length > 0) {
						debugger;
						year = oResponse.data.results[0].DESCR_PERIODO;
						//	that.oMainJsonYear = new sap.ui.model.json.JSONModel();
						//	that.oMainJsonYear.setProperty("/year", year);
						that.getView().byId("idtxtfiscalyear").setText(year);
						var initialYear = year.split(" ");
						initialYear = initialYear[2].split("-");
						//	var initialYear_final = "%Target Bonus Aprile " + initialYear[0];
						var initialYear_final = "%Target Bonus";
						that.getView().getModel("oYearModel").setProperty("/year", initialYear_final);
						that.busyDialog.close();
						//that.getDataForTables();
						debugger;
						//	that.getView().setModel(that.oMainJsonYear, "Years");
						that.getMonthOfYears(new Date(oResponse.data.results[0].VALE_DAL), new Date(oResponse.data.results[0].VALE_AL));
					}
				},
				error: function (oError) {
					MessageBox.error("Error in getting Fiscal year. Please contact administrator.");
					that.busyDialog.close();
				}
			};
			var path = "/PERIODI_RIFERIMENTO?$format=json";
			this.oMainModel.read(path, mParameters);
		},
		getMonthOfYears: function (date1, date2) {
			var monthBetweenfiscial = this.diff(date1, date2);
			this.oMainMonthJsonYear = new sap.ui.model.json.JSONModel();
			debugger;
			this.oMainMonthJsonYear.setData(monthBetweenfiscial);
			this.getView().setModel(this.oMainMonthJsonYear, "Months");
			this.busyDialog.close();
		},
		diff: function (from, to) {
			var monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
				"Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
			];
			var arr = [];
			var datFrom = new Date(from);
			var datTo = new Date(to);
			var fromYear = datFrom.getFullYear();
			var toYear = datTo.getFullYear();
			var diffYear = (12 * (toYear - fromYear)) + datTo.getMonth();
			var oEntry = {
				month: "",
				key: ""
			};
			arr.push(oEntry);
			oEntry = {};
			for (var i = datFrom.getMonth(); i <= diffYear; i++) {
				debugger;
				oEntry.month = monthNames[i % 12] + "-" + Math.floor(fromYear + (i / 12));
				var newi = i + 1;
				//	oEntry.key = Math.floor(fromYear + (i / 12)) + "-" + ((i < 10) ? '0' + newi : newi) + "-" + "01";
				oEntry.key = ((i < 10) ? '0' + newi : newi) + "." + "01" + "." + Math.floor(fromYear + (i / 12));
				arr.push(oEntry);
				oEntry = {};
			}
			return arr;
		},
		/*		dyanmicCallForDB: function (oEvent) {
					var setName = "/T_TMP_INPUT_1Set";
					var modelName = 'oT_TMP_INPUT_1Model';
					this.callFunction(setName, modelName);
				},
				callFunction: function (setName, modelName) {
					this.oMainModel.read(setName, {
						success: function (oData, oResponse) {
							
							modelName = new JSONModel();
							var data = oData.results.map(x => x['SUPERID']);
							modelName.setData(oData.results);
							this.getView().setModel(modelName, modelName);
							this.getView().getModel(modelName).refresh();
						}.bind(this),
						error: function (oError) {
							MessageToast.show("Error Displaying List");
							this.busyDialog.close();
						}.bind(this),
					});
				},*/

		/*********getF4helpModel is invoked from onObjectMatched function ****************/
		getF4helpModel: function (oEvent) {
			//this.busyDialog.open();
			var filter = [];
			
			//searchFilter searches for data having DATA_CESSAZIONE as NULL or blank
			var searchFilter = new Filter([
				new Filter("DATA_CESSAZIONE", sap.ui.model.FilterOperator.EQ, 'NULL'),
				new Filter("DATA_CESSAZIONE", sap.ui.model.FilterOperator.EQ, '')
			], false);
			filter.push(searchFilter);
			this.oMainModel.read("/T_TMP_INPUT_1Set", {
				filters: filter,
				success: function (oData, oResponse) {
					debugger;
					var oT_TMP_INPUT_1Model = new JSONModel();
					//var objs = oData.results;
					//var r = objs.sort((a, b) => (a.BAND > b.BAND) ? 1 : ((b.BAND > a.BAND) ? -1 : 0));
					//oRUOLOModel.setData(r);
					//	var data = oData.results.map(x => x['SUPERID']);
					oT_TMP_INPUT_1Model.setData(oData.results);
					this.getView().setModel(oT_TMP_INPUT_1Model, "oT_TMP_INPUT_1Model");
					this.getView().getModel("oT_TMP_INPUT_1Model").refresh();
					/*				var uniqueQualifica = oData.results.filter((s => a => !s.has(a.QUALIFICA) && s.add(a.QUALIFICA))(new Set));
									var objs = uniqueQualifica;
									var r = objs.sort((a, b) => (a.HR1_PAYGRADE > b.HR1_PAYGRADE) ? 1 : ((b.HR1_PAYGRADE > a.HR1_PAYGRADE) ? -1 : 0));
									uniqueQualifica.map(uniqueQualifica => uniqueQualifica.QUALIFICA);
									var oQualificaModel = new JSONModel();
									oQualificaModel.setData(objs);
									oQualificaModel.setData(uniqueQualifica);
									this.getView().setModel(oQualificaModel, "oQualificaModel");
									this.getView().getModel("oQualificaModel").refresh();*/
					var uniqueGrade = oData.results.filter((s => a => !s.has(a.BAND) && s.add(a.BAND))(new Set));
					//uniqueQualifica.map(uniqueQualifica => uniqueQualifica.QUALIFICA);
					var objs = uniqueGrade;
					var s = objs.sort((a, b) => (a.BAND > b.BAND) ? 1 : ((b.BAND > a.BAND) ? -1 : 0));
					var oGradeModel = new JSONModel();
					oGradeModel.setData(s);
					//oGradeModel.setData(uniqueGrade);
					this.getView().setModel(oGradeModel, "oGradeModel");
					this.getView().getModel("oGradeModel").refresh();
				}.bind(this),
				error: function (oError) {
					MessageToast.show("Error Displaying List");
				}.bind(this),
			});
			this.oMainModel.read("/P_INCENTIVISet", {
				success: function (oData, oResponse) {
					var oP_INCENTIVIModel = new JSONModel();
					oP_INCENTIVIModel.setData(oData.results);
					this.getView().setModel(oP_INCENTIVIModel, "oP_INCENTIVIModel");
					this.getView().getModel("oP_INCENTIVIModel").refresh();
				}.bind(this),
				error: function (oError) {
					MessageToast.show("Error Displaying List");
				}.bind(this),
			});
			this.oMainModel.read("/V_COMPANYSet", {
				success: function (oData, oResponse) {
					var oCompanyModel = new JSONModel();
					oCompanyModel.setData(oData.results);
					this.getView().setModel(oCompanyModel, "oCompanyModel");
					this.getView().getModel("oCompanyModel").refresh();
				}.bind(this),
				error: function (oError) {
					MessageToast.show("Error Displaying List");
				}.bind(this),
			});
			this.oMainModel.read("/V_DIPARTIMENTOSet", {
				success: function (oData, oResponse) {
					var oDIPARTIMENTOModel = new JSONModel();
					oDIPARTIMENTOModel.setData(oData.results);
					this.getView().setModel(oDIPARTIMENTOModel, "oDIPARTIMENTOModel");
					this.getView().getModel("oDIPARTIMENTOModel").refresh();
				}.bind(this),
				error: function (oError) {
					MessageToast.show("Error Displaying List");
				}.bind(this),
			});
			this.oMainModel.read("/V_RUOLOSet", {
				success: function (oData, oResponse) {
					var oRUOLOModel = new JSONModel();
					// var m1={},v1=[];
					var objs = oData.results;
					// for (var i = 0; i < objs.length; i++) {
					// 	var vv1 = objs[i].RUOLO_PROF ;

					// 	if (!m1[vv1] && vv1 !== "") {
					// 		m1[vv1] = true;
					// 		v1.push(vv1);
					// 	}

					// }
					// console.log(v1);
					// objs = v1;
					var r = objs.sort((a, b) => (a.RUOLO_PROF > b.RUOLO_PROF) ? 1 : ((b.RUOLO_PROF > a.RUOLO_PROF) ? -1 : 0));
					debugger;
					oRUOLOModel.setSizeLimit(1000);
					oRUOLOModel.setData(r);
					this.getView().setModel(oRUOLOModel, "oRUOLOModel");
					this.getView().getModel("oRUOLOModel").refresh();
				}.bind(this),
				error: function (oError) {
					MessageToast.show("Error Displaying List");
				}.bind(this),
			});
			this.oMainModel.read("/V_RESPDIRSet", {
				success: function (oData, oResponse) {
					var oRESPDIRModel = new JSONModel();
					oRESPDIRModel.setData(oData.results);
					this.getView().setModel(oRESPDIRModel, "oRESPDIRModel");
					this.getView().getModel("oRESPDIRModel").refresh();
				}.bind(this),
				error: function (oError) {
					MessageToast.show("Error Displaying List");
				}.bind(this),
			});
			this.oMainModel.read("/V_RESPHRSet", {
				success: function (oData, oResponse) {
					var oRESPHRModel = new JSONModel();
					oRESPHRModel.setData(oData.results);
					this.getView().setModel(oRESPHRModel, "oRESPHRModel");
					this.getView().getModel("oRESPHRModel").refresh();
				}.bind(this),
				error: function (oError) {
					MessageToast.show("Error Displaying List");
				}.bind(this),
			});
			this.oMainModel.read("/V_QUALIFICA", {
				success: function (oData, oResponse) {
					var oQualificaModel = new JSONModel();
					oQualificaModel.setData(oData.results);
					this.getView().setModel(oQualificaModel, "oQualificaModel");
					this.getView().getModel("oQualificaModel").refresh();
				}.bind(this),
				error: function (oError) {
					MessageToast.show("Error Displaying List");
				}.bind(this),
			});
		},
		/*=====================================handle f4 from Views====================================================================*/
		dynamicValueHelp: function (n, modelName) {
			debugger;
			this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.sID_anagrafica", this);
			this.getView().addDependent(this._oValueHelpDialog[n]);
			var idArr = ["idAnagraficaFragment", "idMatricolaFragment", "idNomeFragment", "idQualificaFragment", "idPercStipFragment",
				"idCompanyFragment", "idGradeFragment", "idDipartimentoFragment", "idRuoloFragment", "idRespDirettoFragment",
				"idRespHRFragment"
			];
			for (var i = 0; i < this._oValueHelpDialog.length; i++) {
				if (i == n)
					sap.ui.getCore().byId(idArr[i]).setVisible(true);
				else
					sap.ui.getCore().byId(idArr[i]).setVisible(false);
			}
			this._oValueHelpDialog[n].setModel(this.getView().getModel(modelName));
			this._oValueHelpDialog[n].open();
		},
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
		onCancelDialog: function () {
			this.deptFragment.destroy();
		},
		_onHandleIdValueHelp: function (oEvent) {
			this.dynamicValueHelp(0, "oT_TMP_INPUT_1Model");
		},
		_onHandleMatricolaValueHelp: function (oEvent) {
			this.dynamicValueHelp(1, "oT_TMP_INPUT_1Model");
		},
		_onHandleNomeValueHelp: function (oEvent) {
			this.dynamicValueHelp(2, "oT_TMP_INPUT_1Model");
		},
		_onHandleQualificaValueHelp: function (oEvent) {
			this.dynamicValueHelp(3, "oT_TMP_INPUT_1Model");
		},
		_onHandlePercStipValueHelp: function (oEvent) {
			this.dynamicValueHelp(4, "oP_INCENTIVIModel");
		},
		_onHandleCompanyValueHelp: function (oEvent) {
			this.dynamicValueHelp(5, "oCompanyModel");
		},
		_onHandleGradeValueHelp: function (oEvent) {
			this.dynamicValueHelp(6, "oT_TMP_INPUT_1Model");
		},
		/*	_onHandleDipartimentoValueHelp: function (oEvent) {
				this.dynamicValueHelp(7, "oDIPARTIMENTOModel");
			},*/
		_onHandleRuoloValueHelp: function (oEvent) {
			this.dynamicValueHelp(8, "oRUOLOModel");
		},
		_onHandleRespDirettoValueHelp: function (oEvent) {
			this.dynamicValueHelp(9, "oRESPDIRModel");
		},
		_onHandleRespHRValueHelp: function (oEvent) {
			this.dynamicValueHelp(10, "oRESPHRModel");
		},
		/*=====================================Search bars from fragments====================================================================*/
		dynamicSearchFragmentOneFilter: function (oEvent, field) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter(field, FilterOperator.Contains, sValue);
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);
			//	oEvent.getSource().getBinding("items").filter([oFilter]);
			//oBinding.refresh();
		},
		dynamicSearchFragmentTwoFilter: function (oEvent, field1, field2) {
			var sValue = oEvent.getParameter("value");
			var oFilter1 = new Filter(field1, sap.ui.model.FilterOperator.Contains, sValue);
			var oFilter2 = new Filter(field2, sap.ui.model.FilterOperator.Contains, sValue);
			var oFilter = new Filter([oFilter1, oFilter2]);
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);
			oBinding.refresh();
		},
		_onIdValueSearchFragment: function (oEvent) {
			this.dynamicSearchFragmentOneFilter(oEvent, "SUPERID");
		},
		_onMatrciolaValueSearchFragment: function (oEvent) {
			this.dynamicSearchFragmentOneFilter(oEvent, "MATRICOLA");
		},
		_onNomeValueSearchFragment: function (oEvent) {
			this.dynamicSearchFragmentTwoFilter(oEvent, "NOME", "COGNOME");
		},
		_onQualificaValueSearchFragment: function (oEvent) {
			this.dynamicSearchFragmentOneFilter(oEvent, "QUALIFICA");
		},
		_onPercStipValueSearchFragment: function (oEvent) {
			this.dynamicSearchFragmentOneFilter(oEvent, "PERCSTIP");
		},
		_onCompanyValueSearchFragment: function (oEvent) {
			this.dynamicSearchFragmentOneFilter(oEvent, "DESCR_COMPANY");
		},
		_onGradeValueSearchFragment: function (oEvent) {
			this.dynamicSearchFragmentOneFilter(oEvent, "BAND");
		},
		_onDipartimentoValueSearchFragment: function (oEvent) {
			this.dynamicSearchFragmentOneFilter(oEvent, "DIP_DESCR");
		},
		_onRuoloValueSearchFragment: function (oEvent) {
			this.dynamicSearchFragmentOneFilter(oEvent, "RUOLO_PROF");
		},
		_onRespDirettoValueSearchFragment: function (oEvent) {
			this.dynamicSearchFragmentTwoFilter(oEvent, "NOME", "COGNOME");
		},
		_onRespHRValueSearchFragment: function (oEvent) {
			this.dynamicSearchFragmentTwoFilter(oEvent, "NOME", "COGNOME");
		},
		/*=====================================choose values form fragments====================================================================*/
		dynamicValueConfirmFragment: function (oEvent, id) {
			var t = oEvent.getParameter("selectedItem");
			if (t) {
				this.getView().byId(id).setValue(t.getTitle());
				this._onIdValueCloseFragment();
			}
		},
		dynamicMultiValueConfirmFragment: function (oEvent, id) {
			debugger;
			var t = oEvent.getParameter("selectedItems");
			if (t.length) {
				debugger;
				var selected = "";
				for (var i = 0; i < t.length; i++) {
					if (selected)
						selected = selected + "," + t[i].getTitle();
					else
						selected = t[i].getTitle();
				}
				this.getView().byId(id).setValue(selected);
			} else {
				debugger;
			}
			this._onIdValueCloseFragment();
			//oEvent.getSource().getBinding("items").filter([]);
		},
		_onIdValueConfirmFragment: function (oEvent) {
			this.dynamicValueConfirmFragment(oEvent, "idAnagrafica");
		},
		_onMatricolaValueConfirmFragment: function (oEvent) {
			this.dynamicValueConfirmFragment(oEvent, "idMatricola");
		},
		_onNomeValueConfirmFragment: function (oEvent) {
			this.dynamicValueConfirmFragment(oEvent, "idNome");
		},
		_onQualificaValueConfirmFragment: function (oEvent) {
			this.dynamicValueConfirmFragment(oEvent, "idQualifica");
		},
		_onPercStipValueConfirmFragment: function (oEvent) {
			this.dynamicValueConfirmFragment(oEvent, "idPercStip");
		},
		_onCompanyValueConfirmFragment: function (oEvent) {
			this.dynamicValueConfirmFragment(oEvent, "idCompany");
		},
		_onGradeValueConfirmFragment: function (oEvent) {
			this.dynamicValueConfirmFragment(oEvent, "idGrade");
		},
		_onDipartimentoValueConfirmFragment: function (oEvent) {
			this.dynamicValueConfirmFragment(oEvent, "idDipartimento");
		},
		_onRuoloValueConfirmFragment: function (oEvent) {
			this.dynamicValueConfirmFragment(oEvent, "idRuolo");
		},
		_onRespDirettoValueConfirmFragment: function (oEvent) {
			this.dynamicValueConfirmFragment(oEvent, "idRespDiretto");
		},
		_onRespHRValueConfirmFragment: function (oEvent) {
			this.dynamicValueConfirmFragment(oEvent, "idRespHR");
		},
		oncellClick: function(oEvent){
			debugger;
			this.byId("idDipartimento").setValue(oEvent.oSource.mProperties.title);
			this.onCancelDialog();
		},
		/*=====================================Destroy fragments====================================================================*/
		_onIdValueCloseFragment: function (oEvent) {
			if (this._oValueHelpDialog.length > 0) {
				for (var i = 0; i < this._oValueHelpDialog.length; i++) {
					this._oValueHelpDialog[i].destroy();
				}
			}
		},
		previousFunction: function (oEvemt) {;
			this._data = {
				AnagraficaPayout: [{
					D: "N",
					ID: "6578493",
					Matricola: "567472",
					Nome: "XX",
					Ruolo1: "XX",
					Qualifica: "XX",
					Grade1: "XX",
					RespHR: "XX",
					RespDiretto: "XX",
					RAL3006: "90.000,04",
					RAL3009: "90.000,04",
					RAL3112: "90.000,04",
					RAL3103: "90.000,04",
					Payoutaprile2019: "14,24",
					datavalidita1: "ott 2020",
					Payout1: "20",
					datavalidita2: "DIC 2020",
					Payout2: "30",
					datavalidita3: "27/09/2012",
					Payout3: "57439",
					cambi: "X"
				}, {
					D: "N1",
					ID: "6578491",
					Matricola: "567471",
					Nome: "XX",
					Ruolo1: "XX",
					Qualifica: "XX",
					Grade1: "XX",
					RespHR: "XX",
					RespDiretto: "XX",
					RAL3006: "80.000,04",
					RAL3009: "80.000,04",
					RAL3112: "80.000,04",
					RAL3103: "80.000,04",
					Payoutaprile2019: "15,24",
					datavalidita1: "ott 20201",
					Payout1: "30",
					datavalidita2: "DIC 20201",
					Payout2: "30",
					datavalidita3: "27/09/2012",
					Payout3: "57439",
					cambi: "X"
				}, {
					D: "N2",
					ID: "6578490",
					Matricola: "567470",
					Nome: "XX",
					Ruolo1: "XX",
					Qualifica: "XX",
					Grade1: "XX",
					RespHR: "XX",
					RespDiretto: "XX",
					RAL3006: "80.000,04",
					RAL3009: "80.000,04",
					RAL3112: "80.000,04",
					RAL3103: "80.000,04",
					Payoutaprile2019: "15,24",
					datavalidita1: "ott 20201",
					Payout1: "30",
					datavalidita2: "DIC 20201",
					Payout2: "30",
					datavalidita3: "27/09/2012",
					Payout3: "57439",
					cambi: "X"
				}]
			};
			this.data1 = {
				Organization: [{
					OrgUnit: "Org1",
					Department: "Department1",
					Division: "A"
				}, {
					OrgUnit: "Org1",
					Department: "Department2",
					Division: "B"
				}, {
					OrgUnit: "Org3",
					Department: "Department3",
					Division: "C"
				}]
			};
			// adding model for tree list design for mockup 
			this.data1 = {
				Organization: [{
					"text": "Amministratore Delegato",
					"ref": "sap-icon://folder-full",
					"nodes": [{
						"text": "10011001 – Vodafone Italy Chief Executive",
						"ref": "sap-icon://folder-full",
						"nodes": [{
							"text": "10002959-Africa, Middle East & Asia Pac",
							"ref": "sap-icon://folder-full"
						}, {
							"text": "10011002-Human Resources & Organization",
							"ref": "sap-icon://folder-full"
						}, {
							"text": "10011063-Finance",
							"ref": "sap-icon://folder-full"
						}]
					}, {
						"text": "10011002 – Human Resources & organization",
						"ref": "sap-icon://folder-full"
					}, {
						"text": "10011003 – Industrial Relations & Payroll",
						"ref": "sap-icon://folder-full"
					}]
				}]
			};
			this.jModel12 = new JSONModel();
			this.jModel12.setData(this._data2);
			this.getView().setModel(this.jModel12);
			//////////////////////////////////////////////
			var n = new JSONModel({
				hasGrouping: false
			});
			this.getView().setModel(n, "Grouping");
			this._oTPC = new TablePersoController({
				table: this.byId("tblAnagraficaPayout"),
				componentName: "AnagraficaPayout",
				persoService: AnagraficaPayout
			}).activate();
			this._mViewSettingsDialogs = {};
			this.jModel = new JSONModel();
			this.jModel.setData(this._data);
			this.getView().byId('tblAnagraficaPayout').setModel(this.jModel);
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("AnagraficaPayout").attachPatternMatched(this._onObjectMatched, this);
		},
		_onAnagraficaPayoutButtonPressed: function (oEvent) {
			this._oTPC.openDialog();
		},
		_onTableSearch: function (oEvent) {
			var filter = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var searchFilter = new Filter([
					new Filter("SUPERID", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("MATRICOLA", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("FULLNAME", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("RUOLO_PROF", sap.ui.model.FilterOperator.Contains, sQuery),
					new Filter("QUALIFICA", sap.ui.model.FilterOperator.Contains, sQuery)
				], false);
				filter.push(searchFilter);
			}
			var table = this.getView().byId("tblAnagraficaPayout");
			var binding = table.getBinding("items");
			binding.filter(filter, "Application");
		},
		_onSortPress: function () {
			this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.sortAnagrafica").open();
		},
		_onFilterPress: function () {
			this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.filterAnagrafica").open();
		},
		_onGroupPress: function () {
			this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.groupAnagrafica").open();
		},
		createViewSettingsDialog: function (sDialogFragmentName) {
			debugger;
			var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];
			/*	if (oDialog)
					oDialog.destroy();*/
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
				this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;
				oDialog.setModel(this.getView().getModel("oANAGRAFICAModel"));
				this.getView().addDependent(oDialog);
				var i18nModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: "i18n/i18n.properties"
				});
				oDialog.setModel(i18nModel, "i18n");
				if (Device.system.desktop) {
					oDialog.addStyleClass("sapUiSizeCompact");
				}
			}
			return oDialog;
		},
		sort: function (oEvent) {
			var oTable = this.byId("tblAnagraficaPayout"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			oBinding.sort(aSorters);
		},
		filter: function (oEvent) {
			debugger;
			//this._onAvvio();

			var oTable = this.byId("tblAnagraficaPayout"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				aFilters = [],
				oFilter;
			mParams.filterItems.forEach(function (oItem) {
				var sPath = oItem.getKey();
				var text = oItem.getText();
				if (text !== "") {
					oFilter = new sap.ui.model.Filter(sPath, "EQ", text);
					aFilters.push(oFilter);
				}
			});
			oBinding.filter(aFilters);
			//this.getView().getModel("oANAGRAFICAModel").refresh();
			//resetting filter
			/*	var aFilterItems = sap.ui.getCore().byId("FilterDialogAnagrafica").getFilterItems();
				aFilterItems.forEach(function (item) {
					var aItems = item.getItems();
					aItems.forEach(function (item) {
						item.setSelected(false);
					});
				});*/
		},
		group: function (oEvent) {
			debugger;
			var oFunction = {
				callback: function (oContext) {
					var name = oContext.getProperty(this.pathToFilter);
					return {
						key: name,
						text: name
					};
				}.bind(this)
			};
			var oTable = this.byId("tblAnagraficaPayout"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				bDescending,
				vGroup,
				aGroups = [];
			if (mParams.groupItem) {
				this.pathToFilter = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;
				vGroup = oFunction["callback"];
				aGroups.push(new Sorter(this.pathToFilter, bDescending, vGroup));
				// apply the selected group settings
				oBinding.sort(aGroups);
			}
			/*var oTable = this.byId("tblAnagraficaPayout"),
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
				oBinding.sort(aGroups);
			}*/
		},
		/***********_onhandleBack function navigates back to home page of stipadmin *****************/
		_onhandleBack: function (oEvent) {
			debugger;
			if (this.getView().getModel("oANAGRAFICAModel") !== undefined)
				this.getView().getModel("oANAGRAFICAModel").setData({});
			this.getView().byId("idSearchBox").setValue("");
			this.clear();

			this.busyDialog.open();
			this.oRouter.navTo("Home");
			this.busyDialog.close();
		},
		/****claers all filters*****/
		clear: function () {
			/*	var data = [];
				oMainModel.setData(data);
				this.getView().setModel(oMainModel, "SchedaMasterModel");
				oMainModel.refresh();*/
			//	this.byId("vsdFilterBar").setVisible(false);
			//	this.byId("vsdFilterLabel").setText("");
			//	resetting filter
			if (sap.ui.getCore().byId("FilterDialogAnagraficaPayout") !== undefined) {
				var aFilterItems = sap.ui.getCore().byId("FilterDialogAnagraficaPayout").getFilterItems();
				aFilterItems.forEach(function (item) {
					var aItems = item.getItems();
					aItems.forEach(function (item) {
						item.setSelected(false);
					});
				});
			}
			if (this.byId("idAnagrafica").getValue())
				this.byId("idAnagrafica").setValue("");

			if (this.byId("idMatricola").getValue())
				this.byId("idMatricola").setValue("");

			if (this.byId("idNome").getValue())
				this.byId("idNome").setValue("");

			if (this.byId("idQualifica").getSelectedKey())
				this.byId("idQualifica").setSelectedKey("");

			if (this.byId("box3").getSelectedKey())
				this.byId("box3").setSelectedKey("");

			if (this.byId("idPercStip").getSelectedKey())
				this.byId("idPercStip").setSelectedKey("");

			if (this.byId("box5").getSelectedKey())
				this.byId("box5").setSelectedKey("");

			if (this.byId("idCompany").getSelectedKey())
				this.byId("idCompany").setSelectedKey("");

			if (this.byId("idGrade").getSelectedKey())
				this.byId("idGrade").setSelectedKey("");

			if (this.byId("idDipartimento").getSelectedKey())
				this.byId("idDipartimento").setSelectedKey("");

			if (this.byId("idRuolo").getSelectedKey())
				this.byId("idRuolo").setSelectedKey("");

			if (this.byId("idRespDiretto").getSelectedKey())
				this.byId("idRespDiretto").setSelectedKey("");

			/*	this.onSearch();
				var oTable = this.getView().byId("tbl");
				var aBinding = oTable.getBinding("items");
				aBinding.filter([]);*/
			/*	if (this.byId("box4").getSelectedKey())
					this.byId("box4").setSelectedKey("");*/
		},
		/******_onDataExport function exports the data to an excel sheet***********/
		_onDataExport: function (oEvent) {
			//	debugger;
			var columnTemplate = [
				[{
						column: 'STATUS_DIPENDENTE',
						label: 'Dimesso'
					}, {
						column: 'SUPERID',
						label: 'sID'
					}, {
						column: 'MATRICOLA',
						label: 'Matricola'
					}, {
						column: 'FULLNAME',
						label: 'Cognome Nome'
					}, {
						column: 'RUOLO_PROF',
						label: 'Ruolo'
					}, {
						column: 'QUALIFICA',
						label: 'Qualifica'
					}, {
						column: 'BAND',
						label: 'Banda'
					}
					/*, {
										column: 'HR_MANAGER',
										label: 'Resp. HR'
									}*/
					, {
						column: 'MATRICOLAMANAGER',
						label: 'Responsabile Diretto'
					}, {
						column: 'RALQ1',
						label: 'RAL 30/06'
					}, {
						column: 'RALSEMESTRALE',
						label: 'RAL 30/09'
					}, {
						column: 'RALQ3',
						label: 'RAL 31/12'
					}, {
						column: 'RALANNUALE',
						label: 'RAL 31/03'
					}, {
						column: 'targetBonusYear',
						label: '% Target Bonus aprile 2019'
					}, {
						column: 'dataValidata1',
						label: 'Data Cambio 1'
					}, {
						column: 'targetBonus1',
						label: '% Target Bonus 1'
					}, {
						column: 'dataValidata2',
						label: 'Data Cambio 2'
					}, {
						column: 'targetBonus2',
						label: '% Target Bonus 2'
					}, {
						column: 'dataValidata3',
						label: 'Data Cambio 3'
					}, {
						column: 'targetBonus3',
						label: '% Target Bonus 3'
					}
				]
			];
			var a = {},
				b = {};
			debugger;
			// try to remove duplicates index if any in this.jvalues
			var arr = this.jvalues;
			var sorted_arr = arr.sort(); // You can define the comparing function here. 
			// JS by default uses a crappy string compare.
			var results = [];
			for (var i = 0; i < arr.length; i++) {
				if (sorted_arr[i + 1] != sorted_arr[i]) {
					results.push(sorted_arr[i]);
				}
			}
			console.log(results);
			this.jvalues = results;
			if (this.jvalues) {
				for (var i = 0; i < this.jvalues.length; i++) {
					a = {
						column: 'dataValidata' + this.jvalues[i],
						label: 'Data Cambio ' + this.jvalues[i]
					}
					columnTemplate[0].push(a);
					b = {
						column: 'targetBonus' + this.jvalues[i],
						label: '% Target Bonus ' + this.jvalues[i]
					}
					columnTemplate[0].push(b);
				}
			}
			/*if (this.morethan3Flag == 'X') {
				for (var j = this.numberofCols; j > this.numberofCols; j--) {
					columnTemplate.push({
							column: 'dataValidata' + j,
							label: 'Data Cambio ' + j
						}*/
			/*,
									{
										column: 'targetBonus' + j,
										label: '% Target Bonus ' + j
									}*/
			/*)
				}
			}*/
			/*	for (var i = 0; i < oModel.getData().length; i++) {
					oModel.getData()[i].Nome = oModel.getData()[i].NAMEFIRST + ' ' + oModel.getData()[i].NAMELAST;
					oModel.getData()[i].Band = 'NA in MOdel';
					oModel.getData()[i].ACCIDENT_DATE = Formatter.formatDate(oModel.getData()[i].ACCIDENTDATE);
					oModel.getData()[i].RETURN_DATE = Formatter.formatDate(oModel.getData()[i].RETURNDATE);
				}*/
			//	var obj = {};
			//	obj.results = oModel.getData();
			//	var aItems = this.getView().byId('tblAnagraficaPayout').getItems();
			var aItems = this.getView().getModel("oANAGRAFICAModel").getData();
			console.log(aItems);
			var tmp = {};
			var dataExport = [];
			for (var i = 0; i < aItems.length; i++) {
				tmp = {
						STATUS_DIPENDENTE: aItems[i].STATUS_DIPENDENTE === undefined ? "" : aItems[i].STATUS_DIPENDENTE,
						SUPERID: aItems[i].SUPERID === undefined ? "" : aItems[i].SUPERID,
						MATRICOLA: aItems[i].MATRICOLA === undefined ? "" : aItems[i].MATRICOLA,
						FULLNAME: aItems[i].FULLNAME === undefined ? "" : aItems[i].FULLNAME,
						RUOLO_PROF: aItems[i].RUOLO_PROF === undefined ? "" : aItems[i].RUOLO_PROF,
						QUALIFICA: aItems[i].QUALIFICA === undefined ? "" : aItems[i].QUALIFICA,
						BAND: aItems[i].BAND === undefined ? "" : aItems[i].BAND,
						MATRICOLAMANAGER: aItems[i].MATRICOLAMANAGER === undefined ? "" : aItems[i].MATRICOLAMANAGER,
						RALQ1: aItems[i].RALQ1 === undefined ? "" : aItems[i].RALQ1,
						RALSEMESTRALE: aItems[i].RALSEMESTRALE === undefined ? "" : aItems[i].RALSEMESTRALE,
						RALQ3: aItems[i].RALQ3 === undefined ? "" : aItems[i].RALQ3,
						RALANNUALE: aItems[i].RALANNUALE === undefined ? "" : aItems[i].RALANNUALE,
						targetBonusYear: aItems[i].targetBonusYear === undefined ? "" : aItems[i].targetBonusYear,
						dataValidata1: aItems[i].dataValidata1 === undefined ? "" : aItems[i].dataValidata1,
						dataValidata2: aItems[i].dataValidata2 === undefined ? "" : aItems[i].dataValidata2,
						dataValidata3: aItems[i].dataValidata3 === undefined ? "" : aItems[i].dataValidata3,
						targetBonus1: aItems[i].targetBonus1 === undefined ? "" : aItems[i].targetBonus1,
						targetBonus2: aItems[i].targetBonus2 === undefined ? "" : aItems[i].targetBonus2,
						targetBonus3: aItems[i].targetBonus3 === undefined ? "" : aItems[i].targetBonus3,
					}
					//	debugger;
				if (this.jvalues) {
					if (aItems[i].dataValidata4) {
						//	debugger;
						if (this.jvalues[0] == 4) {
							tmp.dataValidata4 = aItems[i].dataValidata4 === undefined ? "" : aItems[i].dataValidata4;
							tmp.targetBonus4 = aItems[i].targetBonus4 === undefined ? "" : aItems[i].targetBonus4;
						}
						if (this.jvalues[1] == 5) {
							tmp.dataValidata5 = aItems[i].dataValidata5 === undefined ? "" : aItems[i].dataValidata5;
							tmp.targetBonus5 = aItems[i].targetBonus5 === undefined ? "" : aItems[i].targetBonus5;
						}
						if (this.jvalues[2] == 6) {
							tmp.dataValidata6 = aItems[i].dataValidata6 === undefined ? "" : aItems[i].dataValidata6;
							tmp.targetBonus6 = aItems[i].targetBonus6 === undefined ? "" : aItems[i].targetBonus6;
						}
						if (this.jvalues[3] == 7) {
							tmp.dataValidata7 = aItems[i].dataValidata7 === undefined ? "" : aItems[i].dataValidata7;
							tmp.targetBonus7 = aItems[i].targetBonus7 === undefined ? "" : aItems[i].targetBonus7;
						}
						if (this.jvalues[4] == 8) {
							tmp.dataValidata8 = aItems[i].dataValidata8 === undefined ? "" : aItems[i].dataValidata8;
							tmp.targetBonus8 = aItems[i].targetBonus8 === undefined ? "" : aItems[i].targetBonus8;
						}
						if (this.jvalues[5] == 9) {
							tmp.dataValidata9 = aItems[i].dataValidata9 === undefined ? "" : aItems[i].dataValidata9;
							tmp.targetBonus9 = aItems[i].targetBonus9 === undefined ? "" : aItems[i].targetBonus9;
						}
						if (this.jvalues[6] == 10) {
							tmp.dataValidata10 = aItems[i].dataValidata10 === undefined ? "" : aItems[i].dataValidata10;
							tmp.targetBonus10 = aItems[i].targetBonus10 === undefined ? "" : aItems[i].targetBonus10;
						}
						if (this.jvalues[7] == 11) {
							tmp.dataValidata11 = aItems[i].dataValidata11 === undefined ? "" : aItems[i].dataValidata11;
							tmp.targetBonus11 = aItems[i].targetBonus11 === undefined ? "" : aItems[i].targetBonus11;
						}
						if (this.jvalues[8] == 12) {
							tmp.dataValidata12 = aItems[i].dataValidata12 === undefined ? "" : aItems[i].dataValidata12;
							tmp.targetBonus12 = aItems[i].targetBonus12 === undefined ? "" : aItems[i].targetBonus12;
						}
					}
				}
				dataExport.push(tmp);
			}
			var obj = {}
			obj.results = dataExport;
			console.log(dataExport);
			tablesToExcel(obj, ['tab1'], columnTemplate, 'Anagrafica Payout.xls', 'Excel');
		},

		/***************** _onHandleIdValueHelpRequest1 function opens a multiselect dialog box for user to select sIds*************************/
		_onHandleIdValueHelpRequest1: function () {
			debugger
			var that = this;
			console.log(this.getView().getModel("oT_TMP_INPUT_1Model").getData());
			if (!that._oValueHelpDialog) {
				that._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.idAnagrafica", that);

				that._oValueHelpDialog.setModel(that.getView().getModel("oT_TMP_INPUT_1Model"));
				that.getView().addDependent(that._oValueHelpDialog);
				//this._oValueHelpDialog.setTokens(this._oMultiInput.getTokens());
			}
			that._oValueHelpDialog.open();
		},

		/***************** _onHandleIdValueHelpRequest2 function opens a multiselect dialog box for user to select Matricola*************************/

		_onHandleIdValueHelpRequest2: function () {
			debugger
			var that = this;
			console.log(this.getView().getModel("oT_TMP_INPUT_1Model"));
			if (!that._oValueHelpDialog1) {
				that._oValueHelpDialog1 = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.idMatricola", that);
				that.getView().addDependent(that._oValueHelpDialog1);
				that._oValueHelpDialog1.setModel(that.getView().getModel("oT_TMP_INPUT_1Model"));
				//this._oValueHelpDialog.setTokens(this._oMultiInput.getTokens());
			}
			that._oValueHelpDialog1.open();
		},
		/***********_handleValueHelpConfirm button displays selected sIDs in search box*******/
		_handleValueHelpConfirm: function (evt) {
			debugger
			var aContexts = evt.getParameter("selectedContexts");
			console.log(aContexts);
			if (aContexts && aContexts.length) {
				console.log(aContexts);
				debugger
				var oMultiInput1 = this.byId("idAnagrafica");
				aContexts.forEach(function (oItem) {
					oMultiInput1.addToken(new Token({
						text: oItem.getObject().SUPERID
					}));
				});

			}
		},
		/***********_handleValueHelpConfirmMat button displays selected Matricola ids in search box*******/

		_handleValueHelpConfirmMat: function (evt) {
			debugger

			var aContexts = evt.getParameter("selectedContexts");

			console.log(aContexts);
			if (aContexts && aContexts.length) {
				console.log(aContexts);
				debugger
				var oMultiInput1 = this.byId("idMatricola");
				aContexts.forEach(function (oItem) {
					oMultiInput1.addToken(new Token({
						text: oItem.getObject().MATRICOLA
					}));
				});

			}

		},
		/************_onIdValueCloseFragmentsMat button cancels the selection and closes Matricola dialog box***************/
		_onIdValueCloseFragmentsMat: function (evt) {
			debugger
			if (this._oValueHelpDialog1) {
				//           this._oValueHelpDialog1.close();
				this._oValueHelpDialog1.destroy();
				this._oValueHelpDialog1 = undefined;
			}

		},

		/************_onIdValueCloseFragmentsMat button cancels the selection and closes sID dialog box***************/

		_onIdValueCloseFragmentsId: function (evt) {
			debugger
			if (this._oValueHelpDialog) {
				//           this._oValueHelpDialog1.close();
				this._oValueHelpDialog.destroy();
				this._oValueHelpDialog = undefined;
			}
		},
		//end for matricola
		/*	onTablePersoRefresh: function () {
			AnagraficaPayout.resetPersData();
			this._oTPC.refresh();
		},
		onPressView: function (oEvent) {
			this.secondTreebtn = false;
			this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.OrgDialog", this);
			this.getView().addDependent(this._oValueHelpDialog);
			this.jModel1 = new JSONModel();
			this.jModel1.setData(this.data1);
			this.getView().setModel(this.jModel1);
			this._oValueHelpDialog.open();
		},
		onPressView1: function (oEvent) {
			this.secondTreebtn = true;
			this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.OrgDialog", this);
			this.getView().addDependent(this._oValueHelpDialog);
			this.jModel1 = new JSONModel();
			this.jModel1.setData(this.data1);
			this.getView().setModel(this.jModel1);
			this._oValueHelpDialog.open();
		},
		onTreeSelect: function (oEvent) {
			if (this.secondTreebtn === false)
				this.getView().byId("empDipartimento").setValue(oEvent.getSource().getTitle());
			else
				this.getView().byId("ruolo").setValue(oEvent.getSource().getTitle());
			this._oValueHelpDialog.destroy();
		},
		onTreeSelectAll: function (oEvent) {
			
			//var txt = this.jModel1.getData().Organization[0].nodes[0].nodes[0].text
			var text = "",
				nodes = this.jModel1.getData().Organization[0].nodes;
			for (var i = 1; i < nodes.length; i++) {
				text = text + nodes[i].text + " ";
			}
			nodes = this.jModel1.getData().Organization[0].nodes[0].nodes;
			for (i = 0; i < nodes.length; i++) {
				text = text + nodes[i].text + " ";
			}
			this.getView().byId("empDipartimento").setValue(text);
			this._oValueHelpDialog.destroy();
		},
		onCloseDialog: function (oEvent) {
			this._oValueHelpDialog.destroy();
		},
		_onObjectMatched: function (oEvent) {
			this.getView().byId("idtxtfiscalyear").setText(sap.ui.getCore().getModel("fiscalyear").getData());
		},
		onHomePage: function (oEvent) {
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
			this.busyDialog.close();
		},
		handleBack: function (oEvent) {
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
			this.busyDialog.close();
		},
		onDataExport: function (oEvent) {
			oResource = this.getView().getModel("i18n").getResourceBundle();
			var oExport = new Export({
				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType: new ExportTypeCSV({
					separatorChar: ";"
				}),
				// Pass in the model created above
				//	models : this.getView().getModel(),
				models: this.jModel,
				// binding information for the rows aggregation
				rows: {
					path: "/AnagraficaPayout"
				},
				// column definitions with column name and binding info for the content
				columns: [{
					name: oResource.getText("D"),
					template: {
						content: "{D}"
					}
				}, {
					name: oResource.getText("ID"),
					template: {
						content: "{ID}"
					}
				}, {
					name: oResource.getText("Matricola"),
					template: {
						content: "{Matricola}"
					}
				}, {
					name: oResource.getText("Nome"),
					template: {
						content: "{Nome}"
					}
				}, {
					name: oResource.getText("Ruolo1"),
					template: {
						content: "{Ruolo1}"
					}
				}, {
					name: oResource.getText("Qualifica"),
					template: {
						content: "{Qualifica}"
					}
				}, {
					name: oResource.getText("Grade1"),
					template: {
						content: "{Grade1}"
					}
				}, {
					name: oResource.getText("RespHR"),
					template: {
						content: "{RespHR}"
					}
				}, {
					name: oResource.getText("RespDiretto"),
					template: {
						content: "{RespDiretto}"
					}
				}, {
					name: oResource.getText("RAL3006"),
					template: {
						content: "{RAL3006}"
					}
				}, {
					name: oResource.getText("RAL3009"),
					template: {
						content: "{RAL3009}"
					}
				}, {
					name: oResource.getText("RAL3112"),
					template: {
						content: "{RAL3112}"
					}
				}, {
					name: oResource.getText("RAL3103"),
					template: {
						content: "{RAL3103}"
					}
				}, {
					name: oResource.getText("Payoutaprile2019"),
					template: {
						content: "{Payoutaprile2019}"
					}
				}, {
					name: oResource.getText("datavalidita1"),
					template: {
						content: "{datavalidita1}"
					}
				}, {
					name: oResource.getText("Payout1"),
					template: {
						content: "{Payout1}"
					}
				}, {
					name: oResource.getText("datavalidita2"),
					template: {
						content: "{datavalidita2}"
					}
				}, {
					name: oResource.getText("Payout2"),
					template: {
						content: "{Payout2}"
					}
				}, {
					name: oResource.getText("datavalidita3"),
					template: {
						content: "{datavalidita3}"
					}
				}, {
					name: oResource.getText("Payout3"),
					template: {
						content: "{Payout3}"
					}
				}, {
					name: oResource.getText("cambi"),
					template: {
						content: "{cambi}"
					}
				}]
			});
			// download exported file
			oExport.saveFile("Anagrafica Payout").catch(function (oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function () {
				oExport.destroy();
			});
		}*/
	});
});