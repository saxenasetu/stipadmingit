sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	'sap/ui/core/Fragment',
	"stipAdmin/stipAdmin/util/GesConsuntiviTable",
	"stipAdmin/stipAdmin/util/GesConsuntiviSimTable",
	"sap/m/TablePersoController",
	"stipAdmin/stipAdmin/util/Formatter",
	"sap/ui/core/util/Export",
	"./exportExcel",
	"sap/ui/core/util/ExportTypeCSV",
	"./xlsx",
	"./jszip",
	"stipAdmin/stipAdmin/libs/html2pdf",
], function (Controller, MessageBox, Fragment, GesConsuntiviTable, GesConsuntiviSimTable, TablePersoController, Formatter, Export, Excel,
	ExportTypeCSV, xlsx, jszip, html2pdfjs) {
	"use strict";
	return Controller.extend("stipAdmin.stipAdmin.controller.GestioneConsuntivazione", {
		Formatter: Formatter,
		onInit: function () {
			var that = this;
			that._busyDialog = new sap.m.BusyDialog();
			this.getOwnerComponent().getRouter().getRoute("GestioneConsuntivazione").attachPatternMatched(this._onObjectMatched, this);
			that._oTPC = new TablePersoController({
				table: that.byId("idTable5"),
				componentName: "GestioneConsuntivazione",
				persoService: GesConsuntiviTable
			}).activate();
			that._oTPC1 = new TablePersoController({
				table: that.byId("idTable6"),
				componentName: "GestioneConsuntivazione",
				persoService: GesConsuntiviSimTable
			}).activate();
			//that.getNConsGruppiSchData();
			//that.getNConsData();
		},
		_onObjectMatched: function (oEvent) {
			var that = this;
			var oArguments = oEvent.getParameter("arguments");
			that.selectedfiscalYearPeriodi = oArguments.str;
			// KAPIL - HARDCODED: Fisal Year
			///var fiscalYear = "Fiscal Year 2019 - 2020";
			//var fiscalYear = "Fiscal Year 2004-2005";
			that.getPerido(this.selectedfiscalYearPeriodi);
			that.getCompanySet();
			// KAPIL HARDCODED
			that.getTmpInputSet();
		},
		onHome: function () {
			//sap.ui.getCore().getModel("BasicAppModel").setProperty("/PisteChange", true);
			this.onPressPulisci();
			// this.getView().byId("idDataCons").setSelectedKey("");
			// this.getView().byId("idComp").setSelectedKey("");
			// this.getView().byId("idGrappi").setSelectedKey("");
			// Resetting all model before navigating to Landing page
			// that.getView().byId("idNCons").setModel(oGesConNConsModel, "NConsModel");
			// that.getView().byId("idDataCons").setModel(oGesConDataConsModel, "DataConsModel");

			// that.getView().setModel(PeridoModel, "PeridoModel");

			// that.getView().byId("idGrappi").setModel(oGesConGruppiModel, "GruppiModel");
			// that.getView().byId("idComp").setModel(CompanySetModel, "CompanySetModel");
			// that.getView().setModel(TmpInputSetModel, "TmpInputSetModel");
			// this.getView().byId("Tree").setModel(nodesModel, "nodeModel");
			// that.getView().setModel(oGesConRuoloDataModel, "GesConRuoloModel");
			// that.getView().byId("idTable5").setModel(ConsResultsSetModel, "ConsResultsSetModel");
			// that.getView().byId("idTable6").setModel(ConsSimResultsSetModel, "ConsSimResultsSetModel");
			// this.getView().setModel(oMainModel, "uploadModel");
			// that.getView().setModel(V_CONSUNTIVITI_RESULTS_EXPModel, "BasilIncTableModel");
			// that.getView().setModel(V_Gestione_ConsuntivieModel, "SchedaPersonaleModel");
			// that.getView().setModel(V_RESULTS_EXP_SIMModel, "SimBasilIncTableModel");
			// that.getView().setModel(CONSUNTIVIMATRICOLEModel, "ConsuntivimatricoleModel");			
			//Reset NConsModel to null
			// var NConsdataModel = that.getView().byId("idNCons").getModel("NConsModel");
			// if (NConsdataModel) {
			// 	NConsdataModel.setData(null);
			// 	NConsdataModel.updateBindings(true);
			// }
			// //Reset DataConsModel to null
			// var DataConsdata = that.getView().byId("idDataCons").getModel("DataConsModel");
			// if (DataConsdata) {
			// 	DataConsdata.setData(null);
			// 	DataConsdata.updateBindings(true);
			// }

			// //Reset GruppiModel to null
			// var DataConsdata = that.getView().byId("idGrappi").getModel("GruppiModel");
			// if (DataConsdata) {
			// 	DataConsdata.setData(null);
			// 	DataConsdata.updateBindings(true);
			// }			

			var n = sap.ui.core.UIComponent.getRouterFor(this);
			n.navTo("Home");
		},
		// To Identify Periodo based on Fiscal Year
		getPerido: function (fiscalYear) {
			var that = this;
			//var ConsuntivitiSearchJsonData = {};
			//var ConsuntivitiSearchJson = [];
			var PeridoModel = new sap.ui.model.json.JSONModel();
			var xsoBaseModel = that.getOwnerComponent().getModel("basexsoModel");
			xsoBaseModel.attachRequestSent(function () {
				that._busyDialog.open();
			});
			xsoBaseModel.attachRequestCompleted(function () {
				that._busyDialog.close();
			});
			var oFilters = [];
			var filter = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, fiscalYear);
			oFilters.push(filter);
			// PERIODI_RIFERIMENTO
			xsoBaseModel.read("/PERIODI_RIFERIMENTO", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					console.log("PERIODI_RIFERIMENTO");
					console.log(oDataIn.results);

					if (oDataIn.results[0] !== undefined) {
						that.Periodi_start_date_main = oDataIn.results[0].VALE_DAL;
						that.Periodi_end_date_main = oDataIn.results[0].VALE_AL;
						PeridoModel.setData(oDataIn.results);
						that.getView().byId("idtxtfiscalyear").setText(oDataIn.results[0].DESCR_PERIODO);
					}
					if (oDataIn.results[0] !== undefined) {
						that.getOwnerComponent().getModel("viewProperties").setProperty("/ID_PERIODO", oDataIn.results[0].ID_PERIODO);
						that.getDataCons();
						that.getGruppiScheda();
					}
					else {
						that.getOwnerComponent().getModel("viewProperties").setProperty("/ID_PERIODO", -1);
					}
					that.getView().setModel(PeridoModel, "PeridoModel");
				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed for PERIODI_RIFERIMENTO . Please contact administrator.");
					jQuery.sap.log.getLogger().error("PERIODI_RIFERIMENTO fetch failed" + oError.toString());
				}.bind(this)
			});
		},
		getDataCons: function () {
			var that = this;
			var oGesConSearchJsonData = {};
			var oGesConSearchJson = [];
			var oGesConDataConsModel = new sap.ui.model.json.JSONModel();
			var xsoBaseModel = that.getOwnerComponent().getModel("basexsoModel");
			xsoBaseModel.attachRequestSent(function () {
				that._busyDialog.open();
			});
			xsoBaseModel.attachRequestCompleted(function () {
				that._busyDialog.close();
			});
			var _IDPeriodo = that.getOwnerComponent().getModel("viewProperties").getProperty("/ID_PERIODO");
			var oFilters = [];
			var filter;
			filter = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, _IDPeriodo);
			oFilters.push(filter);
			if (_IDPeriodo !== -1) {
				// Get DISTINCTSET
				xsoBaseModel.read("/DISTINCTSET", {
					filters: oFilters,
					success: function (oDataIn, oResponse) {
						console.log("DISTINCTSET");
						console.log(oDataIn.results);
						for (var i = 0; i < oDataIn.results.length; ++i) {
							oGesConSearchJsonData = {
								//NCons: (i + 1) + "° Cons",
								MONTH_YEAR: oDataIn.results[i].MONTH_YEAR,
								//NCONS: oDataIn.results[i].NCONS
							};
							oGesConSearchJson.push(oGesConSearchJsonData);
							oGesConSearchJsonData = {};
						}
						//oGesConDataConsModel.setSizeLimit(1000);
						oGesConDataConsModel.setData(oGesConSearchJson);
						that.getView().byId("idDataCons").setModel(oGesConDataConsModel, "DataConsModel");
						that.getView().byId("idDataCons").setSelectedKey("");
						/////oGesConDataConsModel.setSizeLimit(1000);
						////////oGesConDataConsModel.setData(oDataIn.results);
						///////that.getView().byId("idDataCons").setModel(oGesConDataConsModel, "DataConsModel");
						//////that.getView().setModel(oGesConDataConsModel, "GesConSearchModel");
					}.bind(this),
					error: function (oError) {
						//Handle the error
						MessageBox.error("Data fetch failed for DISTINCTSET . Please contact administrator.");
						jQuery.sap.log.getLogger().error("DISTINCTSET fetch failed" + oError.toString());
					}.bind(this)
				});
			}
		},
		getSIMDataCons: function () {
			var that = this;
			var oGesConSIMDataConsJsonData = {};
			var oGesConSIMDataConsJson = [];
			var oGesConSIMDataConsModel = new sap.ui.model.json.JSONModel();
			var xsoBaseModel = that.getOwnerComponent().getModel("basexsoModel");
			xsoBaseModel.attachRequestSent(function () {
				that._busyDialog.open();
			});
			xsoBaseModel.attachRequestCompleted(function () {
				that._busyDialog.close();
			});
			var _IDPeriodo = that.getOwnerComponent().getModel("viewProperties").getProperty("/ID_PERIODO");
			var oFilters = [];
			var filter;
			filter = new sap.ui.model.Filter("IDPERIODO", sap.ui.model.FilterOperator.EQ, _IDPeriodo);
			oFilters.push(filter);
			if (_IDPeriodo !== -1) {
				// Get V_CONSUNTIVITI_SEARCH_SIM
				xsoBaseModel.read("/V_CONSUNTIVITI_SEARCH_SIM", {
					filters: oFilters,
					success: function (oDataIn, oResponse) {
						console.log("V_CONSUNTIVITI_SEARCH_SIM");
						console.log(oDataIn.results);
						for (var i = 0; i < oDataIn.results.length; ++i) {
							oGesConSIMDataConsJsonData = {
								ID_CONSUNTIVO: oDataIn.results[i].ID_CONSUNTIVO,
								DataConsuntivo: oDataIn.results[i].DataConsuntivo,
								MONTH_YEAR: oDataIn.results[i].MONTH_YEAR,
								NCONS: (i + 1) + "° Cons",
								//NCONS: oDataIn.results[i].NCONS,								
								IDPERIODO: oDataIn.results[i].IDPERIODO,
								A_MATRICOLA: oDataIn.results[i].A_MATRICOLA
							};
							oGesConSIMDataConsJson.push(oGesConSIMDataConsJsonData);
							oGesConSIMDataConsJsonData = {};
						}
						//oGesConSIMDataConsModel.setSizeLimit(1000);
						oGesConSIMDataConsModel.setData(oGesConSIMDataConsJson);
						that.getView().byId("idDataCons").setModel(oGesConSIMDataConsModel, "DataConsModel");
						/////oGesConSIMDataConsModel.setSizeLimit(1000);
						////////oGesConSIMDataConsModel.setData(oDataIn.results);DataConsModel
						///////that.getView().byId("idDataCons").setModel(oGesConSIMDataConsModel, "DataConsModel");
						//////that.getView().setModel(oGesConSIMDataConsModel, "GesConSearchModel");
					}.bind(this),
					error: function (oError) {
						//Handle the error
						MessageBox.error("Data fetch failed for V_CONSUNTIVITI_SEARCH_SIM. Please contact administrator.");
						jQuery.sap.log.getLogger().error("V_CONSUNTIVITI_SEARCH_SIM fetch failed" + oError.toString());
					}.bind(this)
				});
			}
		},
		getGruppiScheda: function (oEvent) {
			var that = this;
			var oGesConGruppiJsonData = {};
			var oGesConGruppiJson = [];
			var oGesConGruppiModel = new sap.ui.model.json.JSONModel();
			var xsoBaseModel = that.getOwnerComponent().getModel("basexsoModel");
			xsoBaseModel.attachRequestSent(function () {
				that._busyDialog.open();
			});
			xsoBaseModel.attachRequestCompleted(function () {
				that._busyDialog.close();
			});
			var _IDPeriodo = that.getOwnerComponent().getModel("viewProperties").getProperty("/ID_PERIODO");
			var oFilters = [];
			var filter;
			filter = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, _IDPeriodo);
			oFilters.push(filter);
			if (_IDPeriodo !== -1) {
				// GRUPPISCHEDESET
				xsoBaseModel.read("/GRUPPISCHEDESET", {
					filters: oFilters,
					success: function (oDataIn, oResponse) {
						console.log("GRUPPISCHEDESET");
						console.log(oDataIn.results);
						oGesConGruppiModel.setSizeLimit(1000);
						oGesConGruppiModel.setData(oDataIn.results);
						that.getView().byId("idGrappi").setModel(oGesConGruppiModel, "GruppiModel");
						that.getView().byId("idGrappi").setSelectedKey("");
					}.bind(this),
					error: function (oError) {
						//Handle the error
						MessageBox.error("Data fetch failed for GRUPPISCHEDESET . Please contact administrator.");
						jQuery.sap.log.getLogger().error("GRUPPISCHEDESET fetch failed" + oError.toString());
					}.bind(this)
				});
			}
		},
		getNConsData: function (selDataCons) {
			var that = this;
			var ConsuntivitiSearchJsonData = {};
			var ConsuntivitiSearchJson = [];
			////var ConsuntivitiSearchModel = new sap.ui.model.json.JSONModel();
			var oGesConNConsModel = new sap.ui.model.json.JSONModel();
			var xsoBaseModel = that.getOwnerComponent().getModel("basexsoModel");
			xsoBaseModel.attachRequestSent(function () {
				that._busyDialog.open();
			});
			xsoBaseModel.attachRequestCompleted(function () {
				that._busyDialog.close();
			});
			var oFilters = [];
			var filter;
			filter = new sap.ui.model.Filter("MONTH_YEAR", sap.ui.model.FilterOperator.EQ, selDataCons);
			oFilters.push(filter);
			// V_CONSUNTIVITI_SEARCH
			xsoBaseModel.read("/V_CONSUNTIVITI_SEARCH", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					console.log("V_CONSUNTIVITI_SEARCH");
					//console.log(oDataIn.results);
					for (var i = 0; i < oDataIn.results.length; ++i) {
						ConsuntivitiSearchJsonData = {
							NConsCount: i + 1,
							NCons: (i + 1) + "° Cons",
							A_MATRICOLA: oDataIn.results[i].A_MATRICOLA,
							DataConsuntivo: oDataIn.results[i].DataConsuntivo,
							GENID: oDataIn.results[i].GENID,
							IDPERIODO: oDataIn.results[i].IDPERIODO,
							ID_CONSUNTIVO: oDataIn.results[i].ID_CONSUNTIVO,
							NRCONSUNTIVAZIONE: oDataIn.results[i].NRCONSUNTIVAZIONE,
							MONTH_YEAR: oDataIn.results[i].MONTH_YEAR
								//	NCONS: oDataIn.results[i].NCONS
						};
						ConsuntivitiSearchJson.push(ConsuntivitiSearchJsonData);
						ConsuntivitiSearchJsonData = {};
					}
					oGesConNConsModel.setData(ConsuntivitiSearchJson);
					console.log(ConsuntivitiSearchJson);
					that.getView().byId("idNCons").setModel(oGesConNConsModel, "NConsModel");
					that.getView().byId("idNCons").setSelectedKey("");
					//////ConsuntivitiSearchModel.setData(ConsuntivitiSearchJson);
					//////that.getView().setModel(ConsuntivitiSearchModel, "ConsuntivitiSearchDataModel");
				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed for V_CONSUNTIVITI_SEARCH . Please contact administrator.");
					jQuery.sap.log.getLogger().error("V_CONSUNTIVITI_SEARCH fetch failed" + oError.toString());
				}.bind(this)
			});
		},
		getSIMNConsData: function (selDataCons) {
			var that = this;
			var ConsuntivitiSearchSIMJsonData = {};
			var ConsuntivitiSearchSIMJson = [];
			////var ConsuntivitiSearchModel = new sap.ui.model.json.JSONModel();
			var oGesConNConsModel = new sap.ui.model.json.JSONModel();
			var xsoBaseModel = that.getOwnerComponent().getModel("basexsoModel");
			xsoBaseModel.attachRequestSent(function () {
				that._busyDialog.open();
			});
			xsoBaseModel.attachRequestCompleted(function () {
				that._busyDialog.close();
			});
			var oFilters = [];
			var filter;
			filter = new sap.ui.model.Filter("MONTH_YEAR", sap.ui.model.FilterOperator.EQ, selDataCons);
			oFilters.push(filter);
			// V_CONSUNTIVITI_SEARCH
			xsoBaseModel.read("/V_CONSUNTIVITI_SEARCH", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					console.log("V_CONSUNTIVITI_SEARCH");
					//console.log(oDataIn.results);
					for (var i = 0; i < oDataIn.results.length; ++i) {
						ConsuntivitiSearchSIMJsonData = {
							NConsCount: i + 1,
							NCons: (i + 1) + "° Cons",
							A_MATRICOLA: oDataIn.results[i].A_MATRICOLA,
							DataConsuntivo: oDataIn.results[i].DataConsuntivo,
							GENID: oDataIn.results[i].GENID,
							IDPERIODO: oDataIn.results[i].IDPERIODO,
							ID_CONSUNTIVO: oDataIn.results[i].ID_CONSUNTIVO,
							MONTH_YEAR: oDataIn.results[i].MONTH_YEAR,
							NCONS: oDataIn.results[i].NCONS
						};
						ConsuntivitiSearchSIMJson.push(ConsuntivitiSearchSIMJsonData);
						ConsuntivitiSearchSIMJsonData = {};
					}
					oGesConNConsModel.setData(ConsuntivitiSearchSIMJson);
					console.log(ConsuntivitiSearchSIMJson);
					that.getView().byId("idNCons").setModel(oGesConNConsModel, "NConsModel");
					//////ConsuntivitiSearchModel.setData(ConsuntivitiSearchSIMJson);
					//////that.getView().setModel(ConsuntivitiSearchModel, "ConsuntivitiSearchDataModel");
				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed for V_CONSUNTIVITI_SEARCH . Please contact administrator.");
					jQuery.sap.log.getLogger().error("V_CONSUNTIVITI_SEARCH fetch failed" + oError.toString());
				}.bind(this)
			});
		},
		getCompanySet: function (oEvent) {
			var that = this;
			var CompanySetModel = new sap.ui.model.json.JSONModel();
			var xsoBaseModel = that.getOwnerComponent().getModel("basexsoModel");
			xsoBaseModel.attachRequestSent(function () {
				that._busyDialog.open();
			});
			xsoBaseModel.attachRequestCompleted(function () {
				that._busyDialog.close();
			});
			// COMPANYSET	
			xsoBaseModel.read("/COMPANYSET", {
				success: function (oDataIn, oResponse) {
					console.log("COMPANYSET");
					console.log(oDataIn.results);
					//////oGesConGruppiModel.setSizeLimit(1000);
					CompanySetModel.setData(oDataIn.results);
					that.getView().byId("idComp").setModel(CompanySetModel, "CompanySetModel");
					that.getView().byId("idComp").setSelectedKey("");
				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed for COMPANYSET . Please contact administrator.");
					jQuery.sap.log.getLogger().error("COMPANYSET fetch failed" + oError.toString());
				}.bind(this)
			});
		},
		// KAPIL HARDCODED
		getTmpInputSet: function (oEvent) {
			var that = this;
			var TmpInputSetModel = new sap.ui.model.json.JSONModel();
			var xsoBaseModel = that.getOwnerComponent().getModel("basexsoModel");
			xsoBaseModel.attachRequestSent(function () {
				that._busyDialog.open();
			});
			xsoBaseModel.attachRequestCompleted(function () {
				that._busyDialog.close();
			});

			// TMP_INPUT_1_SET	
			xsoBaseModel.read("/TMP_INPUT_1_SET", {
				success: function (oDataIn, oResponse) {
					console.log("TMP_INPUT_1_SET");
					console.log(oDataIn.results);
					//////oGesConGruppiModel.setSizeLimit(1000);
					TmpInputSetModel.setData(oDataIn.results);
					that.getView().setModel(TmpInputSetModel, "TmpInputSetModel");
				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed for TMP_INPUT_1_SET . Please contact administrator.");
					jQuery.sap.log.getLogger().error("TMP_INPUT_1_SET fetch failed" + oError.toString());
				}.bind(this)
			});
		},
		onSelectSim: function (oEvent) {
			console.log(oEvent);
			if (oEvent.getSource().getSelected()) {
				this.getView().byId("idTable5").setVisible(false);
				this.getView().byId("idTable6").setVisible(true);

				this.getView().byId("idSbloccaSel").setVisible(false);
				this.getView().byId("idAnnullaInvio").setVisible(false);
				this.getView().byId("idBloccaSel").setVisible(false);
				this.getView().byId("idInviaPayroll").setVisible(false);
				// //Reset DataConsModel
				// var DataConsModeldataModel = this.getView().getModel("DataConsModel");
				// if (DataConsModeldataModel) {
				// 	DataConsModeldataModel.setData(null);
				// 	DataConsModeldataModel.updateBindings(true);
				// }
				//Reset NConsModel to null
				var NConsdataModel = this.getView().byId("idNCons").getModel("NConsModel");
				if (NConsdataModel) {
					NConsdataModel.setData(null);
					NConsdataModel.updateBindings(true);
				}
				this.getSIMDataCons();
			} else {
				this.getView().byId("idTable5").setVisible(true);
				this.getView().byId("idTable6").setVisible(false);
				this.getView().byId("idSbloccaSel").setVisible(true);
				this.getView().byId("idAnnullaInvio").setVisible(true);
				this.getView().byId("idBloccaSel").setVisible(true);
				this.getView().byId("idInviaPayroll").setVisible(true);

				//Reset NConsModel to null
				var NConsdataModel = this.getView().byId("idNCons").getModel("NConsModel");
				if (NConsdataModel) {
					NConsdataModel.setData(null);
					NConsdataModel.updateBindings(true);
				}
				this.getDataCons();
			}
		},
		validateTMP_INPUT_1_SET: function () {
			var that = this;
			var TmpInputSetModelFiltereddata;
			// Cognome
			var _Cognome = that.getView().byId("idCognome").getValue();
			// Qualifica
			//var _Qualifica = that.getView().byId("idQualifica").getValue();
			var _Qualifica = that.getView().byId("idQualifica").getSelectedKey();
			// KAPIL HARDCODED
			var TmpInputSetModeldata = that.getView().getModel("TmpInputSetModel").getData();
			if (_Cognome && _Qualifica) {
				TmpInputSetModelFiltereddata = jQuery.grep(TmpInputSetModeldata, function (a) {
					return ((a.COGNOME.toLowerCase()).includes(_Cognome.toLowerCase()) && (a.QUALIFICA.toLowerCase()).includes(_Qualifica.toLowerCase()));
				});
			} else if ((!_Cognome) && _Qualifica) {
				TmpInputSetModelFiltereddata = jQuery.grep(TmpInputSetModeldata, function (a) {
					return (a.QUALIFICA.toLowerCase().includes(_Qualifica.toLowerCase()));
				});
			} else if (_Cognome && (!_Qualifica)) {
				TmpInputSetModelFiltereddata = jQuery.grep(TmpInputSetModeldata, function (a) {
					return (a.COGNOME.toLowerCase().includes(_Cognome.toLowerCase()));
				});
			} else {
				return false;
			}
			if (TmpInputSetModelFiltereddata.length === 0) {
				return false; // Implies values entered are invalid
			} else {
				return true; // Implies values entered are valid
			}
		},
		onChangeDataCons: function (oEvent) {
			console.log(oEvent);
			var that = this;
			var oGesConNConsModel = new sap.ui.model.json.JSONModel();
			var selDataCons = oEvent.getSource("selectedItem").getSelectedKey();
			// var DataConsModeldata = that.getView().byId("idDataCons").getModel("DataConsModel").getData();
			// // Filter records from DataConsModel based on selected "MONTH_YEAR" dropdown value
			// var NConsdata = jQuery.grep(DataConsModeldata, function (a) {
			// 	return (a.MONTH_YEAR === selDataCons);
			// });
			// console.log("NCons Data");
			// console.log(NConsdata);
			// oGesConNConsModel.setData(NConsdata);
			// that.getView().byId("idNCons").setModel(oGesConNConsModel, "NConsModel");
			if (false) {
				that.getSIMNConsData(selDataCons);
			} else {
				that.getNConsData(selDataCons);
			}
			// var ConSearchModeldata = that.getView().getModel("ConsuntivitiSearchDataModel").getData(); 
			// // Filter records from ConsuntivitiSearchDataModel based on selected "Data Consuntivo - MONTH_YEAR" dropdown value
			// var NConsdata = jQuery.grep(ConSearchModeldata, function (a) {
			// 	return (a.MONTH_YEAR === selDataCons);
			// });
			// console.log("NCons Data");
			// console.log(NConsdata);
			// oGesConNConsModel.setData(NConsdata);
			// that.getView().byId("idNCons").setModel(oGesConNConsModel, "NConsModel");
		},
		onPersoButtonPressed: function (e) {
			if (this.getView().byId("idTable6").getVisible()) {
				this._oTPC1.openDialog();
			} else {
				this._oTPC.openDialog();
			}
		},
		onTableGrouping: function (e) {
			if (this.getView().byId("idTable6").getVisible()) {
				this._oTPC1.setHasGrouping(e.getSource().getSelected());
			} else {
				this._oTPC.setHasGrouping(e.getSource().getSelected());
			}
		},
		onResultTableButPressed: function (oEvent) {
			this._oTPC.openDialog();
		},
		onSimResultTableButPressed: function (oEvent) {
			this._oTPC1.openDialog();
		},
		onTablePersoRefresh: function () {
			if (this.getView().byId("idTable6").getVisible()) {
				GesConsuntiviTable.resetPersData();
				this._oTPC.refresh();
			} else {
				GesConsuntiviSimTable.resetPersData();
				this._oTPC1.refresh();
			}
		},
		// onPressView: function (oEvent) {
		// 	this.secondTreebtn = false;
		// 	this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.OrgDialog", this);
		// 	this.getView().addDependent(this._oValueHelpDialog);
		// 	this.jModel1 = new JSONModel();
		// 	this.jModel1.setData(this.data1);
		// 	this.getView().setModel(this.jModel1);
		// 	this._oValueHelpDialog.open();
		// },
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
					var oModel = new sap.ui.model.json.JSONModel();
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

		// selectTreeNode: function(oEvent){
		// 	console.log(oEvent);	
		// 	this.selTreeNode=oEvent.getSource("selectedItem").getTitle();
		// },
		// onSelectDialog: function () {
		// 	// var oModel = this.getView().getModel("nodeModel");
		// 	// var nodes = oModel.getProperty("/nodeRoot");
		// 	var oInput = this.byId("idTree");
		// 	if(this.selTreeNode){
		// 		oInput.setValue(this.selTreeNode);	
		// 		if (this._oDialog) {
		// 			this._oDialog.close();
		// 		}
		// 	}
		// 	// var bHasSelected = nodes.children.some(function (node) {
		// 	// 	if (node.selected) {
		// 	// 		oInput.setValue(node.Text);
		// 	// 		return true;
		// 	// 	}
		// 	// });
		// 	// if (!bHasSelected) {
		// 	// 	oInput.setValue(null);
		// 	// }
		// },
		onCancelDialog: function (oEvent) {
			/*	if (this._oDialog) {
					this.selTreeNode = null;
					this._oDialog.close();
				}*/
			this.deptFragment.destroy();
		},
		openDialogRuolo: function (oEvent) {
			var that = this;
			var oView = that.getView();
			// Function to get 'RUOLOSET' data
			this.getRuoloData();
			if (!that._oRuoliDialog) {
				Fragment.load({
					id: oView.getId(),
					name: "stipAdmin.stipAdmin.fragment.Ruoli",
					controller: that
				}).then(function (oDialog) {
					that._oRuoliDialog = oDialog;
					that._configRuoliDialog();
					that._oRuoliDialog.open();
				}.bind(that));
			} else {
				that._configRuoliDialog();
				that._oRuoliDialog.open();
			}
		},
		_configRuoliDialog: function () {
			// Set draggable property
			this._oRuoliDialog.setDraggable(true);
			this._oRuoliDialog.setResizable(true);
			var sResponsiveStyleClasses =
				"sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer";
			this._oRuoliDialog.addStyleClass(sResponsiveStyleClasses);
			this.getView().addDependent(this._oRuoliDialog);
		},
		// Function to get 'RUOLOSET' data
		getRuoloData: function () {
			var that = this;
			var oGesConRuoloDataModel = new sap.ui.model.json.JSONModel();
			//oGesConRuoloDataModel = this.getOwnerComponent().getModel("viewProperties").getProperty("/GesConRuoloModel");
			if (this.getOwnerComponent().getModel("viewProperties").getProperty("/GesConRuoloModel") === undefined) {
				var xsoBaseModel = this.getOwnerComponent().getModel("basexsoModel");
				xsoBaseModel.attachRequestSent(function () {
					that._busyDialog.open();
				});
				xsoBaseModel.attachRequestCompleted(function () {
					that._busyDialog.close();
				});
				// Get RUOLOSET
				xsoBaseModel.read("/RUOLOSET", {
					success: function (oDataIn, oResponse) {
						console.log("RUOLOSET");
						console.log(oDataIn.results);
						oGesConRuoloDataModel.setData(oDataIn.results);
						that.getView().setModel(oGesConRuoloDataModel, "GesConRuoloModel");
						that.getOwnerComponent().getModel("viewProperties").setProperty("/GesConRuoloModel", oGesConRuoloDataModel);
					}.bind(this),
					error: function (oError) {
						//Handle the error
						MessageBox.error("Data fetch failed for RUOLOSET . Please contact administrator.");
						jQuery.sap.log.getLogger().error("RUOLOSET fetch failed" + oError.toString());
					}.bind(this)
				});
			} else {
				this.getView().setModel(this.getOwnerComponent().getModel("viewProperties").getProperty("/GesConRuoloModel"), "GesConRuoloModel");
			}
		},
		onRuoliSearch: function (oEvent) {
			var RuoloFiltereddata;
			var _oGesConRuoloModel = new sap.ui.model.json.JSONModel();
			var RuoloModeldata = this.getView().getModel("GesConRuoloModel").getData();
			var sRuoloValue = this.getView().byId("idRuoloSearch").getValue();
			var sGradeValue = this.getView().byId("idGradeSearch").getValue();
			if (sRuoloValue && sGradeValue) {
				// Filter records from GesConRuoloModel based on 'Ruolo' and 'Grade' search value
				RuoloFiltereddata = jQuery.grep(RuoloModeldata, function (a) {
					return ((a.RUOLO_PROF).includes(sRuoloValue) && (a.GRADE).includes(sGradeValue));
				});
			} else if (sRuoloValue && (!sGradeValue)) {
				// Filter records from GesConRuoloModel based on 'Ruolo' search value
				RuoloFiltereddata = jQuery.grep(RuoloModeldata, function (a) {
					return ((a.RUOLO_PROF).includes(sRuoloValue));
				});
			} else if (sGradeValue && (!sRuoloValue)) {
				// Filter records from GesConRuoloModel based on 'Grade' search value
				RuoloFiltereddata = jQuery.grep(RuoloModeldata, function (a) {
					return ((a.GRADE).includes(sGradeValue));
				});
			} else {
				MessageBox.error("Please enter either Ruolo and/or Grade value");
				return;
			}
			console.log("Ruolo Data");
			console.log(RuoloFiltereddata);
			_oGesConRuoloModel.setData(RuoloFiltereddata);
			this.getView().setModel(_oGesConRuoloModel, "GesConRuoloModel");
		},
		onRuoliReset: function (oEvent) {
			var oGesConRuoloDataModel = new sap.ui.model.json.JSONModel();
			oGesConRuoloDataModel = this.getOwnerComponent().getModel("viewProperties").getProperty("/GesConRuoloModel");
			this.getView().setModel(oGesConRuoloDataModel, "GesConRuoloModel");
			this.getView().byId("idRuoloSearch").setValue("");
			this.getView().byId("idGradeSearch").setValue("");
		},
		onSelRuoliRecord: function (oEvent) {
			console.log(oEvent);
			var Id = oEvent.getParameters("listItems").listItem.getCells()[0].getText();
			this.getView().byId("idInpRuolo1").setValue(Id);
			var Ruolo = oEvent.getParameters("listItems").listItem.getCells()[1].getText();
			this.getView().byId("idInpRuolo2").setValue(Ruolo);
		},
		onRuoliSelect: function (oEvent) {
			console.log(oEvent);
			if (this._oRuoliDialog) {
				this._oRuoliDialog.close();
			}
		},
		// 
		///handleTreeValueHelp: function (oEvent) {
		// 	var that = this;
		// 	var idPath = oEvent.getSource().sId;
		// 	// if (sap.ui.getCore().getModel("TreeStrucModel1") === undefined || sap.ui.getCore().getModel("TreeStrucModel1") ===
		// 	// 	null) {
		// 	// 	that.getTreeStrucModel1Data();
		// 	// }
		// 	if (!that._valueHelpDialog) {
		// 		that._valueHelpDialog = sap.ui.xmlfragment(
		// 			"stipAdmin.stipAdmin.fragment.TreeStruc", that);
		// 		/////that._valueHelpDialog.setModel(that.getView().byId("idRepintCambioResp").getModel("TreeStrucModel1"));
		// 		sap.ui.getCore().byId(idPath).addDependent(that._valueHelpDialog);
		// 	}
		// 	that._valueHelpDialog.open();
		// },
		// getTreeStrucModel1Data: function (empId) {
		// 	var that = this;
		// 	var TreeSETModel = new sap.ui.model.json.JSONModel();
		// 	var xsoBaseModel = this.getOwnerComponent().getModel("basexsoModel");
		// 	xsoBaseModel.attachRequestSent(function () {
		// 		that.busyDialog.open();
		// 	});
		// 	xsoBaseModel.attachRequestCompleted(function () {
		// 		that.busyDialog.close();
		// 	});
		// 	// var oFilters = [];
		// 	// var filter = new sap.ui.model.Filter("EMPLID", sap.ui.model.FilterOperator.EQ, empId);
		// 	// oFilters.push(filter);
		// 	xsoBaseModel.read("/TREESET", {
		// 		//filters: oFilters,
		// 		success: function (oDataIn, oResponse) {
		// 			//						that.empFullName = oDataIn.results; 
		// 			TreeSETModel.setData(oDataIn.results);
		// 			sap.ui.getCore().setModel(TreeSETModel, "TreeStrucModel1");
		// 		}.bind(this),
		// 		error: function (oError) {
		// 			//Handle the error
		// 			MessageBox.error("Data fetch failed for TREESET. Please contact administrator.");
		// 			jQuery.sap.log.getLogger().error("TREESET data fetch failed" + oError.toString());
		// 		}.bind(this)
		// 	});
		// },
		handleRicerca: function (oEvent) {
			// Call Search Result of Consuntiviti - Simulation data
			if (this.getView().byId("idSim").getSelected()) {
				this.getSimConsuntivitiResultData();
			} else {
				// Call Search Result of Consuntiviti - Real Time data
				this.getConsuntivitiResultData();
			}
		},
		getConsuntivitiResultData: function () {
			// var that = this;
			// var oFilters = [];
			// var _Cognome;
			// var _Qualifica;
			// // ****************** Filter criteria ************************
			// // Id Periodo
			// var _Id_Periodo = parseInt(that.getOwnerComponent().getModel("viewProperties").getProperty("/ID_PERIODO"));
			// if (_Id_Periodo !== "") {
			// 	oFilters.push(new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, _Id_Periodo));
			// }
			// // True implies that either Cognome and/or Qualifica value is valid else entered values are invalid
			// if (that.validateTMP_INPUT_1_SET()) {
			// 	// Cognome
			// 	_Cognome = that.getView().byId("idCognome").getValue();
			// 	if (_Cognome !== "") {
			// 		oFilters.push(new sap.ui.model.Filter({
			// 			path: 'COGNOME',
			// 			operator: sap.ui.model.FilterOperator.Contains,
			// 			value1: _Cognome,
			// 			caseSensitive: false
			// 		}));
			// 	}
			// 	// if(_Cognome !== undefined){
			// 	// 		oFilters.push(new sap.ui.model.Filter(
			// 	// 				{
			// 	// 						path:"COGNOME", sap.ui.model.FilterOperator.Contains, _Cognome,  caseSensitive: false)
			// 	// 				});
			// 	// }
			// 	// Qualifica
			// 	////_Qualifica = that.getView().byId("idQualifica").getValue();
			// 	_Qualifica = that.getView().byId("idQualifica").getSelectedKey();
			// 	if (_Qualifica !== "") {
			// 		///oFilters.push(new sap.ui.model.Filter("QUALIFICA", sap.ui.model.FilterOperator.Contains, _Qualifica));
			// 		if (_Qualifica === "D") {
			// 			oFilters.push(new sap.ui.model.Filter({
			// 				path: 'Q',
			// 				operator: sap.ui.model.FilterOperator.EQ,
			// 				value1: "D",
			// 				caseSensitive: false
			// 			}));
			// 		}
			// 		if (_Qualifica === "Q") {
			// 			oFilters.push(new sap.ui.model.Filter({
			// 				path: 'PAYGRADE',
			// 				operator: sap.ui.model.FilterOperator.Contains,
			// 				value1: "Q",
			// 				caseSensitive: true
			// 			}));
			// 		}
			// 		if (_Qualifica === "I") {
			// 			oFilters.push(new sap.ui.model.Filter({
			// 				path: 'Q',
			// 				operator: sap.ui.model.FilterOperator.EQ,
			// 				value1: _Qualifica,
			// 				caseSensitive: true
			// 			}));
			// 			// filter container
			// 			var oFilter = new sap.ui.model.Filter({
			// 				filters: [
			// 					new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "1"),
			// 					new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "2"),
			// 					new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "3"),
			// 					new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "4"),
			// 					new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "5"),
			// 					new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "5S"),
			// 					new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "6"),
			// 					new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "7")
			// 				],
			// 				// set the OR or AND condition between the filters
			// 				// true for AND, and false for OR
			// 				// false by default
			// 				and: false
			// 			});
			// 			oFilters.push(oFilter);
			// 		}
			// 	}
			// }
			// //var ConsResultsSetJsonData = {};
			// //var ConsResultsSetJson = [];
			// var ConsResultsSetModel = new sap.ui.model.json.JSONModel();
			// //var gskipValue=10;
			// //var gTopValue=10;
			// var xsoBaseModel = that.getOwnerComponent().getModel("basexsoModel");
			// xsoBaseModel.attachRequestSent(function () {
			// 	that._busyDialog.open();
			// });
			// xsoBaseModel.attachRequestCompleted(function () {
			// 	that._busyDialog.close();
			// });
			// // Data Consuntivo
			// var _DataConsuntivo = that.getView().byId("idDataCons").getSelectedKey();
			// if (_DataConsuntivo !== "") {
			// 	oFilters.push(new sap.ui.model.Filter("MONTH_YEAR", sap.ui.model.FilterOperator.EQ, _DataConsuntivo));
			// }
			// // N Cons
			// if (that.getView().byId("idNCons").getSelectedKey() !== "") {
			// 	var _NCons = parseInt(that.getView().byId("idNCons").getSelectedKey());
			// 	////oFilters.push(new sap.ui.model.Filter("ID_CONSUNTIVO", sap.ui.model.FilterOperator.EQ, _NCons));
			// 	oFilters.push(new sap.ui.model.Filter("NRCONSUNTIVAZIONE", sap.ui.model.FilterOperator.EQ, _NCons));
			// }
			// // Company
			// var _Company = that.getView().byId("idComp").getSelectedKey();
			// if (_Company !== "") {
			// 	oFilters.push(new sap.ui.model.Filter("COMPANY", sap.ui.model.FilterOperator.EQ, _Company));
			// }
			// //Dimessi 
			// var _Dimessi = that.getView().byId("idDimessi").getSelectedKey();
			// if (_Dimessi !== "") {
			// 	if (_Dimessi === "No") {
			// 		_Dimessi = "1";
			// 	} else if (_Dimessi === "Si") {
			// 		_Dimessi = "2";
			// 	}
			// 	oFilters.push(new sap.ui.model.Filter("D", sap.ui.model.FilterOperator.EQ, _Dimessi));
			// }
			// // Grade
			// var _Grade = that.getView().byId("idGrade").getSelectedKey();
			// if (_Grade !== "") {
			// 	oFilters.push(new sap.ui.model.Filter("BANDA", sap.ui.model.FilterOperator.EQ, _Grade));
			// }
			// // Ruolo
			// var _RuoloId = that.getView().byId("idInpRuolo1").getValue();
			// if (_RuoloId !== "") {
			// 	oFilters.push(new sap.ui.model.Filter("JOBCODECODE", sap.ui.model.FilterOperator.EQ, _RuoloId));
			// }
			// // S.G. 
			// if (that.getView().byId("idSG").getSelected()) {
			// 	oFilters.push(new sap.ui.model.Filter("GEST", sap.ui.model.FilterOperator.EQ, "Y"));
			// }
			// // else {
			// // 	oFilters.push(new sap.ui.model.Filter("GEST", sap.ui.model.FilterOperator.EQ, "N"));
			// // }
			// // Gruppi Schede
			// var _GruppiSchede = that.getView().byId("idGrappi").getSelectedKey();
			// if (_GruppiSchede !== "") {
			// 	oFilters.push(new sap.ui.model.Filter("ID_GRUPPOSCHEDA", sap.ui.model.FilterOperator.EQ, parseInt(_GruppiSchede)));
			// }
			// // Modiff.
			// var _Modiff = that.getView().byId("idModiff").getSelectedKey();
			// if (_Modiff !== "") {
			// 	if (_Modiff === "No") {
			// 		_Modiff = "N";
			// 	} else if (_Modiff === "Si") {
			// 		_Modiff = "S";
			// 	}
			// 	oFilters.push(new sap.ui.model.Filter("MODIF", sap.ui.model.FilterOperator.EQ, _Modiff));
			// }
			// // Stato Invio
			// var _StatoInvio = that.getView().byId("idStatoInvio").getSelectedKey();
			// // if (_StatoInvio === "0" || _StatoInvio === null || _StatoInvio === undefined) {
			// // 	oFilters.push(new sap.ui.model.Filter("ID_STATOINVIO", sap.ui.model.FilterOperator.EQ, 0));
			// // }else {
			// // 	oFilters.push(new sap.ui.model.Filter("ID_STATOINVIO", sap.ui.model.FilterOperator.EQ, parseInt(_StatoInvio)));
			// // } 
			// if (_StatoInvio === "0") { // Non Inviato
			// 	// "Stato Invio" filter container
			// 	var oFilter = new sap.ui.model.Filter({
			// 		filters: [
			// 			new sap.ui.model.Filter("ID_STATOINVIO", sap.ui.model.FilterOperator.EQ, 0),
			// 			new sap.ui.model.Filter("ID_STATOINVIO", sap.ui.model.FilterOperator.EQ, null)
			// 		],
			// 		// set the OR or AND condition between the filters
			// 		// true for AND, and false for OR
			// 		// false by default
			// 		and: false
			// 	});
			// 	oFilters.push(oFilter);
			// } else
			// if (_StatoInvio === "1" || _StatoInvio === "3") {
			// 	//if (_StatoInvio === "1" || _StatoInvio === "3" || _StatoInvio === "0")  {
			// 	oFilters.push(new sap.ui.model.Filter("ID_STATOINVIO", sap.ui.model.FilterOperator.EQ, parseInt(_StatoInvio)));
			// }
			// // Bloccati 
			// if (that.getView().byId("idchk5").getSelected()) {
			// 	oFilters.push(new sap.ui.model.Filter("BloccatiCheckBox", sap.ui.model.FilterOperator.EQ, "S"));
			// }
			// // else {
			// // 	oFilters.push(new sap.ui.model.Filter("BloccatiCheckBox", sap.ui.model.FilterOperator.EQ, "N"));
			// // }
			// // % stip calcolata
			// var _StipCalColataVal = that.getView().byId("idstipColVal").getValue();
			// var _StipCalColata = that.getView().byId("idstipCol").getSelectedKey();
			// if (_StipCalColata !== "" && _StipCalColata !== undefined && _StipCalColata !== null && _StipCalColataVal !== "") {
			// 	if (_StipCalColata === "=") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_CALCOLATA", sap.ui.model.FilterOperator.EQ, parseFloat(_StipCalColataVal)));
			// 	} else if (_StipCalColata === ">") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_CALCOLATA", sap.ui.model.FilterOperator.GT, parseFloat(_StipCalColataVal)));
			// 	} else if (_StipCalColata === ">=") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_CALCOLATA", sap.ui.model.FilterOperator.GE, parseFloat(_StipCalColataVal)));
			// 	} else if (_StipCalColata === "<") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_CALCOLATA", sap.ui.model.FilterOperator.LT, parseFloat(_StipCalColataVal)));
			// 	} else if (_StipCalColata === "<=") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_CALCOLATA", sap.ui.model.FilterOperator.LE, parseFloat(_StipCalColataVal)));
			// 	}
			// }
			// // Sim.	% stip manuale
			// var _StipManualeVal = that.getView().byId("idstipmanVal").getValue();
			// var _StipManuale = that.getView().byId("idstipman").getSelectedKey();
			// if (_StipManuale !== "" && _StipManuale !== undefined && _StipManuale !== null && _StipManualeVal !== "") {
			// 	if (_StipManuale === "=") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_MANUALE", sap.ui.model.FilterOperator.EQ, parseFloat(_StipManualeVal)));
			// 	} else if (_StipManuale === ">") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_MANUALE", sap.ui.model.FilterOperator.GT, parseFloat(_StipManualeVal)));
			// 	} else if (_StipManuale === ">=") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_MANUALE", sap.ui.model.FilterOperator.GE, parseFloat(_StipManualeVal)));
			// 	} else if (_StipManuale === "<") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_MANUALE", sap.ui.model.FilterOperator.LT, parseFloat(_StipManualeVal)));
			// 	} else if (_StipManuale === "<=") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_MANUALE", sap.ui.model.FilterOperator.LE, parseFloat(_StipManualeVal)));
			// 	}
			// }
			// // % stip liquidata
			// var _StipLiqVal = that.getView().byId("idstipliqVal").getValue();
			// var _StipLiq = that.getView().byId("idstipliq").getSelectedKey();
			// if (_StipLiq !== "" && _StipLiq !== undefined && _StipLiq !== null && _StipLiqVal !== "") {
			// 	if (_StipLiq === "=") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_LIQUIDATA", sap.ui.model.FilterOperator.EQ, parseFloat(_StipLiqVal)));
			// 		////oFilters.push(new sap.ui.model.Filter("PERC_STIP_LIQUIDATA", sap.ui.model.FilterOperator.EQ, parseFloat("222.2")));	
			// 	} else if (_StipLiq === ">") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_LIQUIDATA", sap.ui.model.FilterOperator.GT, parseFloat(_StipLiqVal)));
			// 	} else if (_StipLiq === ">=") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_LIQUIDATA", sap.ui.model.FilterOperator.GE, parseFloat(_StipLiqVal)));
			// 	} else if (_StipLiq === "<") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_LIQUIDATA", sap.ui.model.FilterOperator.LT, parseFloat(_StipLiqVal)));
			// 	} else if (_StipLiq === "<=") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_LIQUIDATA", sap.ui.model.FilterOperator.LE, parseFloat(_StipLiqVal)));
			// 	}
			// }
			var that = this;
			var oFilters = [];
			oFilters = that.getFilterCriteria(oFilters);
			var ConsResultsSetModel = new sap.ui.model.json.JSONModel();
			var xsoBaseModel = that.getOwnerComponent().getModel("basexsoModel");
			xsoBaseModel.attachRequestSent(function () {
				that._busyDialog.open();
			});
			xsoBaseModel.attachRequestCompleted(function () {
				that._busyDialog.close();
			});
			//	xsoBaseModel.read("/V_CONSUNTIVITI_RESULTS", {
			xsoBaseModel.read("/V_CONSUNTIVITI_RESULTS_test", {

				////filters: [oFilters],
				filters: oFilters,
				// urlParameters:{
				// 	"$top": gTopValue,
				// 	"$skip": gskipValue
				// },
				success: function (oDataIn, oResponse) {
					console.log("V_CONSUNTIVITI_RESULTS");
					console.log(oDataIn);
					if (oDataIn.results) {
						that.getView().byId("idTitleRealTimeData").setText("Real Time Data (" + oDataIn.results.length + ")");
					}

					for (var i = 0; i < oDataIn.results.length; ++i) {
						if (oDataIn.results[i].ID_STATOINVIO !== null && oDataIn.results[i].ID_STATOINVIO !== undefined) {
							oDataIn.results[i].ID_STATOINVIO = (oDataIn.results[i].ID_STATOINVIO).toString(); // Converted from Int to String to change color of row	
						}
					}
					ConsResultsSetModel.setData(oDataIn.results);
					console.log(oDataIn.results);

					that.getView().byId("idTable5").setModel(ConsResultsSetModel, "ConsResultsSetModel");
				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed for V_CONSUNTIVITI_RESULTS. Please contact administrator.");
					jQuery.sap.log.getLogger().error("V_CONSUNTIVITI_RESULTS data fetch failed" + oError.toString());
				}.bind(this)
			});
		},
		getSimConsuntivitiResultData: function () {
			// var that = this;
			// var oFilters = [];
			// var _Cognome;
			// var _Qualifica;
			// // Id Periodo
			// var _Id_Periodo = parseInt(that.getOwnerComponent().getModel("viewProperties").getProperty("/ID_PERIODO"));
			// if (_Id_Periodo !== "") {
			// 	oFilters.push(new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, _Id_Periodo));
			// }
			// // True implies that either Cognome and/or Qualifica value is valid else entered values are invalid
			// if (that.validateTMP_INPUT_1_SET()) {
			// 	// Cognome
			// 	_Cognome = that.getView().byId("idCognome").getValue();
			// 	if (_Cognome !== "") {
			// 		oFilters.push(new sap.ui.model.Filter({
			// 			path: 'COGNOME',
			// 			operator: sap.ui.model.FilterOperator.Contains,
			// 			value1: _Cognome,
			// 			caseSensitive: false
			// 		}));
			// 	}
			// 	// if(_Cognome !== undefined){
			// 	// 		oFilters.push(new sap.ui.model.Filter(
			// 	// 				{
			// 	// 						path:"COGNOME", sap.ui.model.FilterOperator.Contains, _Cognome,  caseSensitive: false)
			// 	// 				});
			// 	// }
			// 	// Qualifica
			// 	////_Qualifica = that.getView().byId("idQualifica").getValue();
			// 	_Qualifica = that.getView().byId("idQualifica").getSelectedKey();
			// 	if (_Qualifica !== "") {
			// 		///oFilters.push(new sap.ui.model.Filter("QUALIFICA", sap.ui.model.FilterOperator.Contains, _Qualifica));
			// 		if (_Qualifica === "D") {
			// 			oFilters.push(new sap.ui.model.Filter({
			// 				path: 'Q',
			// 				operator: sap.ui.model.FilterOperator.EQ,
			// 				value1: "D",
			// 				caseSensitive: false
			// 			}));
			// 		}
			// 		if (_Qualifica === "Q") {
			// 			oFilters.push(new sap.ui.model.Filter({
			// 				path: 'PAYGRADE',
			// 				operator: sap.ui.model.FilterOperator.Contains,
			// 				value1: "Q",
			// 				caseSensitive: true
			// 			}));
			// 		}
			// 		if (_Qualifica === "I") {
			// 			oFilters.push(new sap.ui.model.Filter({
			// 				path: 'Q',
			// 				operator: sap.ui.model.FilterOperator.EQ,
			// 				value1: _Qualifica,
			// 				caseSensitive: true
			// 			}));
			// 			// filter container
			// 			var oFilter = new sap.ui.model.Filter({
			// 				filters: [
			// 					new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "1"),
			// 					new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "2"),
			// 					new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "3"),
			// 					new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "4"),
			// 					new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "5"),
			// 					new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "5S"),
			// 					new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "6"),
			// 					new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "7")
			// 				],
			// 				// set the OR or AND condition between the filters
			// 				// true for AND, and false for OR
			// 				// false by default
			// 				and: false
			// 			});
			// 			oFilters.push(oFilter);
			// 		}
			// 	}
			// }
			// // ****************** Filter criteria ************************
			// // Data Consuntivo
			// var _DataConsuntivo = that.getView().byId("idDataCons").getSelectedKey();
			// if (_DataConsuntivo !== "") {
			// 	oFilters.push(new sap.ui.model.Filter("MONTH_YEAR", sap.ui.model.FilterOperator.EQ, _DataConsuntivo));
			// }
			// // N Cons
			// if (that.getView().byId("idNCons").getSelectedKey() !== "") {
			// 	var _NCons = parseInt(that.getView().byId("idNCons").getSelectedKey());
			// 	oFilters.push(new sap.ui.model.Filter("NRCONSUNTIVAZIONE", sap.ui.model.FilterOperator.EQ, _NCons));
			// }
			// // Company
			// var _Company = that.getView().byId("idComp").getSelectedKey();
			// if (_Company !== "") {
			// 	oFilters.push(new sap.ui.model.Filter("COMPANY", sap.ui.model.FilterOperator.EQ, _Company));
			// }
			// //Dimessi 
			// var _Dimessi = that.getView().byId("idDimessi").getSelectedKey();
			// if (_Dimessi !== "") {
			// 	if (_Dimessi === "No") {
			// 		_Dimessi = "1";
			// 	} else if (_Dimessi === "Si") {
			// 		_Dimessi = "2";
			// 	}
			// 	oFilters.push(new sap.ui.model.Filter("D", sap.ui.model.FilterOperator.EQ, _Dimessi));
			// }
			// // Grade
			// var _Grade = that.getView().byId("idGrade").getSelectedKey();
			// if (_Grade !== "") {
			// 	oFilters.push(new sap.ui.model.Filter("BANDA", sap.ui.model.FilterOperator.EQ, _Grade));
			// }
			// // Ruolo
			// var _RuoloId = that.getView().byId("idInpRuolo1").getValue();
			// if (_RuoloId !== "") {
			// 	oFilters.push(new sap.ui.model.Filter("JOBCODECODE", sap.ui.model.FilterOperator.EQ, _RuoloId));
			// }
			// // S.G. 
			// if (that.getView().byId("idSG").getSelected()) {
			// 	oFilters.push(new sap.ui.model.Filter("GEST", sap.ui.model.FilterOperator.EQ, "Y"));
			// }
			// // else {
			// // 	oFilters.push(new sap.ui.model.Filter("GEST", sap.ui.model.FilterOperator.EQ, "N"));
			// // }
			// // Gruppi Schede
			// var _GruppiSchede = that.getView().byId("idGrappi").getSelectedKey();
			// if (_GruppiSchede !== "") {
			// 	oFilters.push(new sap.ui.model.Filter("ID_GRUPPOSCHEDA", sap.ui.model.FilterOperator.EQ, parseInt(_GruppiSchede)));
			// }
			// // Modiff.
			// var _Modiff = that.getView().byId("idModiff").getSelectedKey();
			// if (_Modiff !== "") {
			// 	if (_Modiff === "No") {
			// 		_Modiff = "N";
			// 	} else if (_Modiff === "Si") {
			// 		_Modiff = "S";
			// 	}
			// 	oFilters.push(new sap.ui.model.Filter("MODIF", sap.ui.model.FilterOperator.EQ, _Modiff));
			// }
			// // Stato Invio
			// var _StatoInvio = that.getView().byId("idStatoInvio").getSelectedKey();
			// // if (_StatoInvio === "0" || _StatoInvio === null || _StatoInvio === undefined) {
			// // 	oFilters.push(new sap.ui.model.Filter("ID_STATOINVIO", sap.ui.model.FilterOperator.EQ, 0));
			// // }else {
			// // 	oFilters.push(new sap.ui.model.Filter("ID_STATOINVIO", sap.ui.model.FilterOperator.EQ, parseInt(_StatoInvio)));
			// // } 
			// if (_StatoInvio === "0") { // Non Inviato
			// 	// "Stato Invio" filter container
			// 	var oFilter = new sap.ui.model.Filter({
			// 		filters: [
			// 			new sap.ui.model.Filter("ID_STATOINVIO", sap.ui.model.FilterOperator.EQ, 0),
			// 			new sap.ui.model.Filter("ID_STATOINVIO", sap.ui.model.FilterOperator.EQ, null)
			// 		],
			// 		// set the OR or AND condition between the filters
			// 		// true for AND, and false for OR
			// 		// false by default
			// 		and: false
			// 	});
			// 	oFilters.push(oFilter);
			// } else
			// if (_StatoInvio === "1" || _StatoInvio === "3") {
			// 	//if (_StatoInvio === "1" || _StatoInvio === "3" || _StatoInvio === "0")  {
			// 	oFilters.push(new sap.ui.model.Filter("ID_STATOINVIO", sap.ui.model.FilterOperator.EQ, parseInt(_StatoInvio)));
			// }
			// // Bloccati 
			// if (that.getView().byId("idchk5").getSelected()) {
			// 	oFilters.push(new sap.ui.model.Filter("BloccatiCheckBox", sap.ui.model.FilterOperator.EQ, "S"));
			// }
			// // else {
			// // 	oFilters.push(new sap.ui.model.Filter("BloccatiCheckBox", sap.ui.model.FilterOperator.EQ, "N"));
			// // }
			// // % stip calcolata
			// var _StipCalColataVal = that.getView().byId("idstipColVal").getValue();
			// var _StipCalColata = that.getView().byId("idstipCol").getSelectedKey();
			// if (_StipCalColata !== "" && _StipCalColata !== undefined && _StipCalColata !== null && _StipCalColataVal !== "") {
			// 	if (_StipCalColata === "=") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_CALCOLATA", sap.ui.model.FilterOperator.EQ, parseFloat(_StipCalColataVal)));
			// 	} else if (_StipCalColata === ">") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_CALCOLATA", sap.ui.model.FilterOperator.GT, parseFloat(_StipCalColataVal)));
			// 	} else if (_StipCalColata === ">=") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_CALCOLATA", sap.ui.model.FilterOperator.GE, parseFloat(_StipCalColataVal)));
			// 	} else if (_StipCalColata === "<") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_CALCOLATA", sap.ui.model.FilterOperator.LT, parseFloat(_StipCalColataVal)));
			// 	} else if (_StipCalColata === "<=") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_CALCOLATA", sap.ui.model.FilterOperator.LE, parseFloat(_StipCalColataVal)));
			// 	}
			// }
			// // Sim.	% stip manuale
			// var _StipManualeVal = that.getView().byId("idstipmanVal").getValue();
			// var _StipManuale = that.getView().byId("idstipman").getSelectedKey();
			// if (_StipManuale !== "" && _StipManuale !== undefined && _StipManuale !== null && _StipManualeVal !== "") {
			// 	if (_StipManuale === "=") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_MANUALE", sap.ui.model.FilterOperator.EQ, parseFloat(_StipManualeVal)));
			// 	} else if (_StipManuale === ">") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_MANUALE", sap.ui.model.FilterOperator.GT, parseFloat(_StipManualeVal)));
			// 	} else if (_StipManuale === ">=") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_MANUALE", sap.ui.model.FilterOperator.GE, parseFloat(_StipManualeVal)));
			// 	} else if (_StipManuale === "<") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_MANUALE", sap.ui.model.FilterOperator.LT, parseFloat(_StipManualeVal)));
			// 	} else if (_StipManuale === "<=") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_MANUALE", sap.ui.model.FilterOperator.LE, parseFloat(_StipManualeVal)));
			// 	}
			// }
			// // % stip liquidata
			// var _StipLiqVal = that.getView().byId("idstipliqVal").getValue();
			// var _StipLiq = that.getView().byId("idstipliq").getSelectedKey();
			// if (_StipLiq !== "" && _StipLiq !== undefined && _StipLiq !== null && _StipLiqVal !== "") {
			// 	if (_StipLiq === "=") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_LIQUIDATA", sap.ui.model.FilterOperator.EQ, parseFloat(_StipLiqVal)));
			// 		////oFilters.push(new sap.ui.model.Filter("PERC_STIP_LIQUIDATA", sap.ui.model.FilterOperator.EQ, parseFloat("222.2")));	
			// 	} else if (_StipLiq === ">") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_LIQUIDATA", sap.ui.model.FilterOperator.GT, parseFloat(_StipLiqVal)));
			// 	} else if (_StipLiq === ">=") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_LIQUIDATA", sap.ui.model.FilterOperator.GE, parseFloat(_StipLiqVal)));
			// 	} else if (_StipLiq === "<") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_LIQUIDATA", sap.ui.model.FilterOperator.LT, parseFloat(_StipLiqVal)));
			// 	} else if (_StipLiq === "<=") {
			// 		oFilters.push(new sap.ui.model.Filter("PERC_STIP_LIQUIDATA", sap.ui.model.FilterOperator.LE, parseFloat(_StipLiqVal)));
			// 	}
			// }
			var that = this;
			var oFilters = [];
			oFilters = that.getFilterCriteria(oFilters);
			var ConsSimResultsSetModel = new sap.ui.model.json.JSONModel();
			var xsoBaseModel = that.getOwnerComponent().getModel("basexsoModel");
			xsoBaseModel.attachRequestSent(function () {
				that._busyDialog.open();
			});
			xsoBaseModel.attachRequestCompleted(function () {
				that._busyDialog.close();
			});
			// V_RESULTS_SIM	
			xsoBaseModel.read("/V_RESULTS_SIM", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					console.log("V_RESULTS_SIM");
					console.log(oDataIn.results);
					if (oDataIn.results) {
						that.getView().byId("idTitleSimulationData").setText("Simulation Data (" + oDataIn.results.length + ")");
					}

					ConsSimResultsSetModel.setData(oDataIn.results);
					//////that.getView().setModel(ConsSimResultsSetModel, "ConsSimResultsSetModel");
					that.getView().byId("idTable6").setModel(ConsSimResultsSetModel, "ConsSimResultsSetModel");
				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed for V_RESULTS_SIM . Please contact administrator.");
					jQuery.sap.log.getLogger().error("V_RESULTS_SIM fetch failed" + oError.toString());
				}.bind(this)
			});
		},
		getFilterCriteria: function (oFilters) {
			var that = this;
			var _Cognome;
			var _Qualifica;
			// ****************** Filter criteria ************************
			// Id Periodo
			var _Id_Periodo = parseInt(that.getOwnerComponent().getModel("viewProperties").getProperty("/ID_PERIODO"));
			if (_Id_Periodo !== "") {
				oFilters.push(new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, _Id_Periodo));
			}
			// True implies that either Cognome and/or Qualifica value is valid else entered values are invalid
			//if (that.validateTMP_INPUT_1_SET()) {
			// Cognome
			_Cognome = that.getView().byId("idCognome").getValue();
			if (_Cognome !== "") {
				oFilters.push(new sap.ui.model.Filter({
					path: 'COGNOME',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: _Cognome,
					caseSensitive: false
				}));
			}
			// if(_Cognome !== undefined){
			// 		oFilters.push(new sap.ui.model.Filter(
			// 				{
			// 						path:"COGNOME", sap.ui.model.FilterOperator.Contains, _Cognome,  caseSensitive: false)
			// 				});
			// }
			// Qualifica
			////_Qualifica = that.getView().byId("idQualifica").getValue();
			///if (_Qualifica !== "") {
			if (that.getView().byId("idQualifica").getSelectedItem()) { // Not null
				_Qualifica = that.getView().byId("idQualifica").getSelectedItem().getText();
				if (_Qualifica === "D") {
					oFilters.push(new sap.ui.model.Filter({
						path: 'D',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: _Qualifica,
						caseSensitive: false
					}));
				}
				if (_Qualifica === "Q") {
					oFilters.push(new sap.ui.model.Filter({
						path: 'PAYGRADE',
						operator: sap.ui.model.FilterOperator.Contains,
						value1: _Qualifica,
						caseSensitive: true
					}));
				}
				if (_Qualifica === "I") {
					oFilters.push(new sap.ui.model.Filter({
						path: 'Q',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: _Qualifica,
						caseSensitive: true
					}));
					// filter container
					var oFilter = new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "1"),
							new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "2"),
							new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "3"),
							new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "4"),
							new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "5"),
							new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "5S"),
							new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "6"),
							new sap.ui.model.Filter("PAYGRADE", sap.ui.model.FilterOperator.EQ, "7")
						],
						// set the OR or AND condition between the filters
						// true for AND, and false for OR
						// false by default
						and: false
					});
					oFilters.push(oFilter);
				}
			}
			//}
			// Data Consuntivo
			//var _DataConsuntivo = that.getView().byId("idDataCons").getSelectedKey();
			if (that.getView().byId("idDataCons").getSelectedItem()) {
				var _DataConsuntivo = that.getView().byId("idDataCons").getSelectedItem().getText();
				oFilters.push(new sap.ui.model.Filter("MONTH_YEAR", sap.ui.model.FilterOperator.EQ, _DataConsuntivo));
			}
			// if (_DataConsuntivo !== "") {
			// 	oFilters.push(new sap.ui.model.Filter("MONTH_YEAR", sap.ui.model.FilterOperator.EQ, _DataConsuntivo));
			// }
			// N Cons
			///if (that.getView().byId("idNCons").getSelectedKey() !== "") {
			if (that.getView().byId("idNCons").getSelectedItem()) {
				//var _NCons = parseInt(that.getView().byId("idNCons").getSelectedKey());
				var _NCons = parseInt(that.getView().byId("idNCons").getSelectedItem().getText());
				////oFilters.push(new sap.ui.model.Filter("ID_CONSUNTIVO", sap.ui.model.FilterOperator.EQ, _NCons));
				oFilters.push(new sap.ui.model.Filter("NRCONSUNTIVAZIONE", sap.ui.model.FilterOperator.EQ, _NCons));
			}
			// Company
			///var _Company = that.getView().byId("idComp").getSelectedKey();
			///if (_Company !== "") {
			if (that.getView().byId("idComp").getSelectedItem()) {
				var _Company = that.getView().byId("idComp").getSelectedItem().getText();
				oFilters.push(new sap.ui.model.Filter("COMPANY", sap.ui.model.FilterOperator.EQ, _Company));
			}
			//Dimessi 
			//var _Dimessi = that.getView().byId("idDimessi").getSelectedKey();
			//if (_Dimessi !== "") {
			if (that.getView().byId("idDimessi").getSelectedItem()) {
				var _Dimessi = that.getView().byId("idDimessi").getSelectedItem().getText();
				if (_Dimessi === "No") {
					_Dimessi = "1";
				} else if (_Dimessi === "Si") {
					_Dimessi = "2";
				}
				oFilters.push(new sap.ui.model.Filter("D", sap.ui.model.FilterOperator.EQ, _Dimessi));
			}
			// Grade
			//var _Grade = that.getView().byId("idGrade").getSelectedKey();
			///if (_Grade !== "") {
			if (that.getView().byId("idGrade").getSelectedItem()) {
				var _Grade = that.getView().byId("idGrade").getSelectedItem().getText();
				oFilters.push(new sap.ui.model.Filter("BANDA", sap.ui.model.FilterOperator.EQ, _Grade));
			}
			// Ruolo
			var _RuoloId = that.getView().byId("idInpRuolo1").getValue();
			if (_RuoloId !== "") {
				oFilters.push(new sap.ui.model.Filter("JOBCODECODE", sap.ui.model.FilterOperator.EQ, _RuoloId));
			}
			// S.G. 
			if (that.getView().byId("idSG").getSelected()) {
				oFilters.push(new sap.ui.model.Filter("GEST", sap.ui.model.FilterOperator.EQ, "Y"));
			}
			// else {
			// 	oFilters.push(new sap.ui.model.Filter("GEST", sap.ui.model.FilterOperator.EQ, "N"));
			// }
			// Gruppi Schede
			//var _GruppiSchede = that.getView().byId("idGrappi").getSelectedKey();
			//if (_GruppiSchede !== "") {
			if (that.getView().byId("idGrappi").getSelectedItem()) {
				var _GruppiSchede = that.getView().byId("idGrappi").getSelectedKey();
				oFilters.push(new sap.ui.model.Filter("ID_GRUPPOSCHEDA", sap.ui.model.FilterOperator.EQ, parseInt(_GruppiSchede)));
			}
			// Modiff.
			//var _Modiff = that.getView().byId("idModiff").getSelectedKey();
			//if (_Modiff !== "") {
			if (that.getView().byId("idModiff").getSelectedItem()) {
				var _Modiff = that.getView().byId("idModiff").getSelectedItem().getText();
				if (_Modiff === "No") {
					_Modiff = "N";
				} else if (_Modiff === "Si") {
					_Modiff = "S";
				}
				oFilters.push(new sap.ui.model.Filter("MODIF", sap.ui.model.FilterOperator.EQ, _Modiff));
			}
			// Stato Invio
			//var _StatoInvio = that.getView().byId("idStatoInvio").getSelectedKey();
			if (that.getView().byId("idStatoInvio").getSelectedItem()) {
				debugger;
				var _StatoInvio = that.getView().byId("idStatoInvio").getSelectedKey();
				if (_StatoInvio === "0") { // Non Inviato
					// "Stato Invio" filter container
					var oFilter = new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("ID_STATOINVIO", sap.ui.model.FilterOperator.EQ, 0),
							new sap.ui.model.Filter("ID_STATOINVIO", sap.ui.model.FilterOperator.EQ, null)
						],
						// set the OR or AND condition between the filters
						// true for AND, and false for OR
						// false by default
						and: false
					});
					oFilters.push(oFilter);
				} else if (_StatoInvio === "1" || _StatoInvio === "3") {
					//if (_StatoInvio === "1" || _StatoInvio === "3" || _StatoInvio === "0")  {
					oFilters.push(new sap.ui.model.Filter("ID_STATOINVIO", sap.ui.model.FilterOperator.EQ, parseInt(_StatoInvio)));
				}
			}
			// Bloccati 
			if (that.getView().byId("idchk5").getSelected()) {
				oFilters.push(new sap.ui.model.Filter("BloccatiCheckBox", sap.ui.model.FilterOperator.EQ, "S"));
			}
			// else {
			// 	oFilters.push(new sap.ui.model.Filter("BloccatiCheckBox", sap.ui.model.FilterOperator.EQ, "N"));
			// }
			// % stip calcolata
			var _StipCalColataVal = that.getView().byId("idstipColVal").getValue();
			///var _StipCalColata = that.getView().byId("idstipCol").getSelectedKey();
			//if (_StipCalColata !== "" && _StipCalColata !== undefined && _StipCalColata !== null && _StipCalColataVal !== "") {
			if (that.getView().byId("idstipCol").getSelectedItem() && _StipCalColataVal !== "") {
				var _StipCalColata = that.getView().byId("idstipCol").getSelectedItem().getText();
				if (_StipCalColata === "=") {
					oFilters.push(new sap.ui.model.Filter("PERC_STIP_CALCOLATA", sap.ui.model.FilterOperator.EQ, parseFloat(_StipCalColataVal)));
				} else if (_StipCalColata === ">") {
					oFilters.push(new sap.ui.model.Filter("PERC_STIP_CALCOLATA", sap.ui.model.FilterOperator.GT, parseFloat(_StipCalColataVal)));
				} else if (_StipCalColata === ">=") {
					oFilters.push(new sap.ui.model.Filter("PERC_STIP_CALCOLATA", sap.ui.model.FilterOperator.GE, parseFloat(_StipCalColataVal)));
				} else if (_StipCalColata === "<") {
					oFilters.push(new sap.ui.model.Filter("PERC_STIP_CALCOLATA", sap.ui.model.FilterOperator.LT, parseFloat(_StipCalColataVal)));
				} else if (_StipCalColata === "<=") {
					oFilters.push(new sap.ui.model.Filter("PERC_STIP_CALCOLATA", sap.ui.model.FilterOperator.LE, parseFloat(_StipCalColataVal)));
				}
			}
			//}
			// Sim.	% stip manuale
			var _StipManualeVal = that.getView().byId("idstipmanVal").getValue();
			//var _StipManuale = that.getView().byId("idstipman").getSelectedKey();
			//if (_StipManuale !== "" && _StipManuale !== undefined && _StipManuale !== null && _StipManualeVal !== "") {
			if (that.getView().byId("idstipman").getSelectedItem() && _StipManualeVal !== "") {
				var _StipManuale = that.getView().byId("idstipman").getSelectedItem().getText();
				if (_StipManuale === "=") {
					oFilters.push(new sap.ui.model.Filter("PERC_STIP_MANUALE", sap.ui.model.FilterOperator.EQ, parseFloat(_StipManualeVal)));
				} else if (_StipManuale === ">") {
					oFilters.push(new sap.ui.model.Filter("PERC_STIP_MANUALE", sap.ui.model.FilterOperator.GT, parseFloat(_StipManualeVal)));
				} else if (_StipManuale === ">=") {
					oFilters.push(new sap.ui.model.Filter("PERC_STIP_MANUALE", sap.ui.model.FilterOperator.GE, parseFloat(_StipManualeVal)));
				} else if (_StipManuale === "<") {
					oFilters.push(new sap.ui.model.Filter("PERC_STIP_MANUALE", sap.ui.model.FilterOperator.LT, parseFloat(_StipManualeVal)));
				} else if (_StipManuale === "<=") {
					oFilters.push(new sap.ui.model.Filter("PERC_STIP_MANUALE", sap.ui.model.FilterOperator.LE, parseFloat(_StipManualeVal)));
				}
			}
			//}
			// % stip liquidata
			var _StipLiqVal = that.getView().byId("idstipliqVal").getValue();
			//var _StipLiq = that.getView().byId("idstipliq").getSelectedKey();
			//if (_StipLiq !== "" && _StipLiq !== undefined && _StipLiq !== null && _StipLiqVal !== "") {
			if (that.getView().byId("idstipliq").getSelectedItem() && _StipLiqVal !== "") {
				var _StipLiq = that.getView().byId("idstipliq").getSelectedItem().getText();
				if (_StipLiq === "=") {
					oFilters.push(new sap.ui.model.Filter("PERC_STIP_LIQUIDATA", sap.ui.model.FilterOperator.EQ, parseFloat(_StipLiqVal)));
					////oFilters.push(new sap.ui.model.Filter("PERC_STIP_LIQUIDATA", sap.ui.model.FilterOperator.EQ, parseFloat("222.2")));	
				} else if (_StipLiq === ">") {
					oFilters.push(new sap.ui.model.Filter("PERC_STIP_LIQUIDATA", sap.ui.model.FilterOperator.GT, parseFloat(_StipLiqVal)));
				} else if (_StipLiq === ">=") {
					oFilters.push(new sap.ui.model.Filter("PERC_STIP_LIQUIDATA", sap.ui.model.FilterOperator.GE, parseFloat(_StipLiqVal)));
				} else if (_StipLiq === "<") {
					oFilters.push(new sap.ui.model.Filter("PERC_STIP_LIQUIDATA", sap.ui.model.FilterOperator.LT, parseFloat(_StipLiqVal)));
				} else if (_StipLiq === "<=") {
					oFilters.push(new sap.ui.model.Filter("PERC_STIP_LIQUIDATA", sap.ui.model.FilterOperator.LE, parseFloat(_StipLiqVal)));
				}
			}
			if (that.getView().byId("idTipoKPI").getSelectedItem()) {
				var tipoPista = that.getView().byId("idTipoKPI").getSelectedKey();

				var Periodi_start_date = that.Periodi_start_date_main;
				var Periodi_end_date = that.Periodi_end_date_main;
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
				var ofilter5 = [];
				var filter13 = new sap.ui.model.Filter("TIPO_PISTA", sap.ui.model.FilterOperator.EQ, tipoPista);
				var filter14 = new sap.ui.model.Filter("PISTA_VALE_DAL", sap.ui.model.FilterOperator.GE, piste_start_date);
				var filter15 = new sap.ui.model.Filter("PISTA_VALE_AL", sap.ui.model.FilterOperator.LE, piste_end_date);
				ofilter5 = new sap.ui.model.Filter({
					filters: [
						filter13,
						filter14,
						filter15
					],
					and: true
				});
				oFilters.push(new sap.ui.model.Filter(ofilter5, false));

			}
			console.log(oFilters);

			return oFilters;
			return oFilters;
		},
		onPressBloccaSel: function (oEvent) {
			console.log(oEvent);
			// if (this.getView().byId("idSim").getSelected()) {
			// 	this.handleSimBloccaSel();
			// } else {
			// 	// Call Search Result of Consuntiviti - Real Time data
			// 	this.handleBloccaSel();
			// }
			// Call Search Result of Consuntiviti - Real Time data and Simulation data
			//this.handleBloccaSel();		
			var that = this;
			var item;
			var obj;
			var sURL;
			var oBloccaSelDataEntry = {};
			var items;
			var ConsResultsSetModel = that.getView().byId("idTable5").getModel("ConsResultsSetModel");
			var ConsSimResultsSetModel = that.getView().byId("idTable6").getModel("ConsSimResultsSetModel");
			var xsoBaseModel = that.getOwnerComponent().getModel("basexsoModel");
			xsoBaseModel.attachRequestSent(function () {
				that._busyDialog.open();
			});
			xsoBaseModel.attachRequestCompleted(function () {
				that._busyDialog.close();
			});
			if (that.getView().byId("idSim").getSelected()) {
				items = that.getView().byId("idTable6").getSelectedItems();
				for (var i = 0; i < items.length; i++) {
					item = items[i];
					obj = item.getBindingContext("ConsSimResultsSetModel").getObject();
					oBloccaSelDataEntry = {
						SN_BLOCCATO: "S"
					};
					sURL = "/CONSUNTIVIMATRICOLE_SIM(ID_CONSUNTIVO=" + obj.ID_CONSUNTIVO + ",MATRICOLA='" + obj.MATR + "')";
					xsoBaseModel.update(sURL, oBloccaSelDataEntry, {
						success: function (odata, oResponse) {
							console.log("Update Success - CONSUNTIVIMATRICOLE_SIM");
							MessageBox.success(
								"Blocca Selezionati operation is successful for Simulation data"
							);
							ConsSimResultsSetModel.updateBindings(true);
							// Call Search Result of Consuntiviti - Simulation data
							that.getSimConsuntivitiResultData();
						},
						error: function (oError) {
							sap.m.MessageBox.error("Data update failed for CONSUNTIVIMATRICOLE_SIM. Please contact administrator.");
							jQuery.sap.log.getLogger().error("Data update failed for CONSUNTIVIMATRICOLE_SIM" + oError.toString());
						}
					});
				}
			} else {
				items = that.getView().byId("idTable5").getSelectedItems();
				for (var i = 0; i < items.length; i++) {
					item = items[i];
					obj = item.getBindingContext("ConsResultsSetModel").getObject();
					oBloccaSelDataEntry = {
						SN_BLOCCATO: "S"
					};
					sURL = "/CONSUNTIVIMATRICOLE(ID_CONSUNTIVO=" + obj.ID_CONSUNTIVO + ",MATRICOLA='" + obj.MATR + "')";
					xsoBaseModel.update(sURL, oBloccaSelDataEntry, {
						success: function (odata, oResponse) {
							console.log("Update Success - CONSUNTIVIMATRICOLE");
							MessageBox.success(
								"Blocca Selezionati operation is successful for Real Time data"
							);
							ConsResultsSetModel.updateBindings(true);
							// Call Search Result of Consuntiviti - Real Time data
							that.getConsuntivitiResultData();
						},
						error: function (oError) {
							sap.m.MessageBox.error("Data update failed for CONSUNTIVIMATRICOLE. Please contact administrator.");
							jQuery.sap.log.getLogger().error("Data update failed for CONSUNTIVIMATRICOLE" + oError.toString());
						}
					});
				}
			}
		},
		onPressInviaaPayroll: function (oEvent) {
			var that = this;
			var item;
			var obj;
			var sURL;
			var oEntry = {};
			var items;
			var _StatoInvio;
			var ConsResultsSetModel = that.getView().byId("idTable5").getModel("ConsResultsSetModel");
			var ConsSimResultsSetModel = that.getView().byId("idTable6").getModel("ConsSimResultsSetModel");
			var xsoBaseModel = that.getOwnerComponent().getModel("basexsoModel");
			xsoBaseModel.attachRequestSent(function () {
				that._busyDialog.open();
			});
			xsoBaseModel.attachRequestCompleted(function () {
				that._busyDialog.close();
			});
			_StatoInvio = that.getView().byId("idStatoInvio").getSelectedKey();
			if (_StatoInvio === "0" || _StatoInvio === "") { // If "Non Inviato" value is either 0 or null then only update "ID_STATOINVIO" with "1" else no update
				if (that.getView().byId("idSim").getSelected()) {
					items = that.getView().byId("idTable6").getSelectedItems();
					for (var i = 0; i < items.length; i++) {
						item = items[i];
						obj = item.getBindingContext("ConsSimResultsSetModel").getObject();
						oEntry = {
							ID_STATOINVIO: 1
						};
						sURL = "/CONSUNTIVIMATRICOLE_SIM(ID_CONSUNTIVO=" + obj.ID_CONSUNTIVO + ",MATRICOLA='" + obj.MATR + "')";
						xsoBaseModel.update(sURL, oEntry, {
							success: function (odata, oResponse) {
								console.log("Update Success Invia a Payroll - CONSUNTIVIMATRICOLE_SIM");
								MessageBox.success(
									"Invia a Payroll operation is successful for Simulation data"
								);
								ConsSimResultsSetModel.updateBindings(true);
								// Call Search Result of Consuntiviti - Simulation data
								that.getSimConsuntivitiResultData();
							},
							error: function (oError) {
								sap.m.MessageBox.error("Data update failed for CONSUNTIVIMATRICOLE_SIM. Please contact administrator.");
								jQuery.sap.log.getLogger().error("Data update failed for CONSUNTIVIMATRICOLE_SIM" + oError.toString());
							}
						});
					}
				} else {
					items = that.getView().byId("idTable5").getSelectedItems();
					for (var i = 0; i < items.length; i++) {
						item = items[i];
						obj = item.getBindingContext("ConsResultsSetModel").getObject();
						oEntry = {
							ID_STATOINVIO: 1
						};
						sURL = "/CONSUNTIVIMATRICOLE(ID_CONSUNTIVO=" + obj.ID_CONSUNTIVO + ",MATRICOLA='" + obj.MATR + "')";
						xsoBaseModel.update(sURL, oEntry, {
							success: function (odata, oResponse) {
								console.log("Update Success Invia a Payroll - CONSUNTIVIMATRICOLE");
								MessageBox.success(
									"Invia a Payroll operation is successful for Real Time data"
								);
								ConsResultsSetModel.updateBindings(true);
								// Call Search Result of Consuntiviti - Real Time data
								that.getConsuntivitiResultData();
							},
							error: function (oError) {
								sap.m.MessageBox.error("Data update failed for CONSUNTIVIMATRICOLE. Please contact administrator.");
								jQuery.sap.log.getLogger().error("Data update failed for CONSUNTIVIMATRICOLE" + oError.toString());
							}
						});
					}
				}
			}
		},
		onPressAnnullaInvio: function (oEvent) {
			var that = this;
			var item;
			var obj;
			var sURL;
			var oEntry = {};
			var items;
			var ConsResultsSetModel = that.getView().byId("idTable5").getModel("ConsResultsSetModel");
			var ConsSimResultsSetModel = that.getView().byId("idTable6").getModel("ConsSimResultsSetModel");
			var xsoBaseModel = that.getOwnerComponent().getModel("basexsoModel");
			xsoBaseModel.attachRequestSent(function () {
				that._busyDialog.open();
			});
			xsoBaseModel.attachRequestCompleted(function () {
				that._busyDialog.close();
			});
			if (that.getView().byId("idSim").getSelected()) {
				items = that.getView().byId("idTable6").getSelectedItems();
				for (var i = 0; i < items.length; i++) {
					item = items[i];
					obj = item.getBindingContext("ConsSimResultsSetModel").getObject();
					if (obj.ID_STATOINVIO === "1") {
						oEntry = {
							ID_STATOINVIO: "0"
						};
						sURL = "/CONSUNTIVIMATRICOLE_SIM(ID_CONSUNTIVO=" + obj.ID_CONSUNTIVO + ",MATRICOLA='" + obj.MATR + "')";
						xsoBaseModel.update(sURL, oEntry, {
							success: function (odata, oResponse) {
								console.log("Update Success Annulla Invio dei Sel. - CONSUNTIVIMATRICOLE_SIM");
								MessageBox.success(
									"Annulla Invio dei Sel. operation is successful for Simulation data"
								);
								ConsSimResultsSetModel.updateBindings(true);
								// Call Search Result of Consuntiviti - Simulation data
								that.getSimConsuntivitiResultData();
							},
							error: function (oError) {
								sap.m.MessageBox.error("Data update failed for CONSUNTIVIMATRICOLE_SIM. Please contact administrator.");
								jQuery.sap.log.getLogger().error("Data update failed for CONSUNTIVIMATRICOLE_SIM" + oError.toString());
							}
						});
					}
				}
			} else {
				items = that.getView().byId("idTable5").getSelectedItems();
				for (var i = 0; i < items.length; i++) {
					item = items[i];
					obj = item.getBindingContext("ConsResultsSetModel").getObject();
					if (obj.ID_STATOINVIO === "1") {
						oEntry = {
							ID_STATOINVIO: "0"
						};
						sURL = "/CONSUNTIVIMATRICOLE(ID_CONSUNTIVO=" + obj.ID_CONSUNTIVO + ",MATRICOLA='" + obj.MATR + "')";
						xsoBaseModel.update(sURL, oEntry, {
							success: function (odata, oResponse) {
								console.log("Update Success Annulla Invio dei Sel. - CONSUNTIVIMATRICOLE");
								MessageBox.success(
									"Annulla Invio dei Sel. operation is successful for Real Time data"
								);
								ConsResultsSetModel.updateBindings(true);
								// Call Search Result of Consuntiviti - Real Time data
								that.getConsuntivitiResultData();
							},
							error: function (oError) {
								sap.m.MessageBox.error("Data update failed for CONSUNTIVIMATRICOLE. Please contact administrator.");
								jQuery.sap.log.getLogger().error("Data update failed for CONSUNTIVIMATRICOLE" + oError.toString());
							}
						});
					}
				}
			}
		},
		onPressPulisci: function (oEvent) {
			console.log(oEvent);
			// ***** Table 1 ******
			// Select
			this.getView().byId("idDataCons").setSelectedKey("");
			this.getView().byId("idNCons").setSelectedKey("");
			this.getView().byId("idQualifica").setSelectedKey("");
			this.getView().byId("idComp").setSelectedKey("");
			this.getView().byId("idDimessi").setSelectedKey("");
			this.getView().byId("idGrade").setSelectedKey(""); // Banda
			this.getView().byId("idTree").setSelectedKey("");
			// Input
			this.getView().byId("idCognome").setValue("");
			// Checkbox
			//this.getView().byId("idSim").setSelected(false);
			// ***** Table 2 ******
			// Input
			this.getView().byId("idInpRuolo1").setValue("");
			this.getView().byId("idInpRuolo2").setValue("");
			this.getView().byId("idSchMast").setValue(""); // (Not Implemented - Pending)
			this.getView().byId("idIDKPI").setValue(""); // ( Not Implemented - Pending)
			// Checkbox
			this.getView().byId("idSG").setSelected(false);
			// Select
			this.getView().byId("idGrappi").setSelectedKey("");
			this.getView().byId("idTipoKPI").setSelectedKey("");
			this.getView().byId("idRecord").setSelectedKey(""); // (Filter Pending)
			this.getView().byId("idModiff").setSelectedKey("");
			this.getView().byId("idStatoInvio").setSelectedKey("");
			// ***** Table 4 ******
			// Checkbox
			this.getView().byId("idchk5").setSelected(false);
			// Select
			this.getView().byId("idstipCol").setSelectedKey("");
			this.getView().byId("idstipman").setSelectedKey("");
			this.getView().byId("idstipliq").setSelectedKey("");
			// Input
			this.getView().byId("idstipColVal").setValue("");
			this.getView().byId("idstipmanVal").setValue("");
			this.getView().byId("idstipliqVal").setValue("");
		},
		onPressSBloccaSel: function (oEvent) {
			var that = this;
			var item;
			var obj;
			var sURL;
			var oBloccaSelDataEntry = {};
			var items;
			var ConsResultsSetModel = that.getView().byId("idTable5").getModel("ConsResultsSetModel");
			var ConsSimResultsSetModel = that.getView().byId("idTable6").getModel("ConsSimResultsSetModel");
			var xsoBaseModel = that.getOwnerComponent().getModel("basexsoModel");
			xsoBaseModel.attachRequestSent(function () {
				that._busyDialog.open();
			});
			xsoBaseModel.attachRequestCompleted(function () {
				that._busyDialog.close();
			});
			if (that.getView().byId("idSim").getSelected()) {
				items = that.getView().byId("idTable6").getSelectedItems();
				for (var i = 0; i < items.length; i++) {
					item = items[i];
					obj = item.getBindingContext("ConsSimResultsSetModel").getObject();
					oBloccaSelDataEntry = {
						SN_BLOCCATO: "N"
					};
					sURL = "/CONSUNTIVIMATRICOLE_SIM(ID_CONSUNTIVO=" + obj.ID_CONSUNTIVO + ",MATRICOLA='" + obj.MATR + "')";
					xsoBaseModel.update(sURL, oBloccaSelDataEntry, {
						success: function (odata, oResponse) {
							console.log("Update Success - CONSUNTIVIMATRICOLE_SIM");
							MessageBox.success(
								"SBlocca Selezionati operation is successful for Simulation data"
							);
							ConsSimResultsSetModel.updateBindings(true);
							// Call Search Result of Consuntiviti - Simulation data
							that.getSimConsuntivitiResultData();
						},
						error: function (oError) {
							sap.m.MessageBox.error("Data update failed for CONSUNTIVIMATRICOLE_SIM. Please contact administrator.");
							jQuery.sap.log.getLogger().error("Data update failed for CONSUNTIVIMATRICOLE_SIM" + oError.toString());
						}
					});
				}
			} else {
				items = that.getView().byId("idTable5").getSelectedItems();
				for (var i = 0; i < items.length; i++) {
					item = items[i];
					obj = item.getBindingContext("ConsResultsSetModel").getObject();
					oBloccaSelDataEntry = {
						SN_BLOCCATO: "N"
					};
					sURL = "/CONSUNTIVIMATRICOLE(ID_CONSUNTIVO=" + obj.ID_CONSUNTIVO + ",MATRICOLA='" + obj.MATR + "')";
					xsoBaseModel.update(sURL, oBloccaSelDataEntry, {
						success: function (odata, oResponse) {
							console.log("Update Success - CONSUNTIVIMATRICOLE");
							MessageBox.success(
								"SBlocca Selezionati operation is successful for Real Time data"
							);
							ConsResultsSetModel.updateBindings(true);
							// Call Search Result of Consuntiviti - Real Time data
							that.getConsuntivitiResultData();
						},
						error: function (oError) {
							sap.m.MessageBox.error("Data update failed for CONSUNTIVIMATRICOLE. Please contact administrator.");
							jQuery.sap.log.getLogger().error("Data update failed for CONSUNTIVIMATRICOLE" + oError.toString());
						}
					});
				}
			}
		},
		onDataExport: function (oEvent) {
			var oResource = this.getView().getModel("i18n").getResourceBundle();
			//var oModel = this.getView().getModel('ConsResultsSetModel').getData();
			var GestConstArray = [];
			GestConstArray = this.getView().byId("idTable5").getModel("ConsResultsSetModel").getData();
			var columnTemplate = [
				[{
					column: 'ID_CONSUNTIVO',
					label: "ID_CONSUNTIVO"
				}, {
					column: 'D',
					label: oResource.getText("GesConD")
				}, {
					column: 'DATA_DIM',
					label: oResource.getText("DataDim")
				}, {
					column: 'INVIO_PAYROLL',
					label: oResource.getText("InvioPS")
				}, {
					column: 'CID',
					label: oResource.getText("CID")
				}, {
					column: 'MATR',
					label: oResource.getText("GesConMatr")
				}, {
					column: 'DIPENDENTE',
					label: oResource.getText("GesConDipendente")
				}, {
					column: 'DATA_ASS',
					label: oResource.getText("DataAss")
				}, {
					column: 'Q',
					label: oResource.getText("Q")
				}, {
					column: 'SCHEDE',
					label: oResource.getText("Schede")
				}, {
					column: 'GEST',
					label: oResource.getText("Gest")
				}, {
					column: 'NON_ATTIG',
					label: oResource.getText("NonAttig")
				}, {
					column: 'NCONS',
					label: oResource.getText("NCons.")
				}, {
					column: 'BASE_STIP',
					label: oResource.getText("BaseStip")
				}, {
					column: 'PERC_SCHEDA',
					label: oResource.getText("%Scheda")
				}, {
					column: 'IMP',
					label: oResource.getText("Imp")
				}, {
					column: 'PERC_STIP',
					label: oResource.getText("%Stip")
				}, {
					column: 'TETTO_PAYOUT',
					label: oResource.getText("TettoPayout")
				}, {
					column: 'IMP_MAN',
					////label: oResource.getText("ImpMan")
					label: "IMPORTO_MANUALE"
				}, {
					column: 'NOTE',
					label: "NOTE"
				}, {
					column: 'NOTE_IMPORTO_MANUALE',
					label: "NOTE_IMPORTO_MANUALE"
				}, {
					column: 'PERC_STIP_MANUALE',
					label: oResource.getText("%stipmanuale")
				}, {
					column: 'NOTE',
					label: oResource.getText("Note")
				}, {
					column: 'IMP_LIQUI',
					label: oResource.getText("ImpLiqui")
				}, {
					column: 'PERC_STIP_LIQUIDATA',
					label: oResource.getText("%Liqui")
				}, {
					column: 'MODIF',
					label: oResource.getText("Modif.")
				}, ]
			];
			var excelData = {
				GestCons: GestConstArray
			};
			tablesToExcel(excelData, ['GestCons'], columnTemplate, 'GestCons.xls', 'Excel');
		},
		onFileDataUpload: function (oEvent) {
			var that = this;
			var oView = that.getView();
			if (!that._oFileDataUploadDialog) {
				Fragment.load({
					id: oView.getId(),
					name: "stipAdmin.stipAdmin.fragment.FileDataUpload",
					controller: that
				}).then(function (oDialog) {
					that._oFileDataUploadDialog = oDialog;
					that._configFileDataUploadDialog();
					that._oFileDataUploadDialog.open();
				}.bind(that));
			} else {
				that._configFileDataUploadDialog();
				that._oFileDataUploadDialog.open();
			}
		},
		_configFileDataUploadDialog: function () {
			// Set draggable property
			this._oFileDataUploadDialog.setDraggable(true);
			this._oFileDataUploadDialog.setResizable(true);
			var sResponsiveStyleClasses =
				"sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer";
			this._oFileDataUploadDialog.addStyleClass(sResponsiveStyleClasses);
			this.getView().addDependent(this._oFileDataUploadDialog);
		},
		onPressAnnulla: function (oEvent) {
			this._oFileDataUploadDialog.close();
			this.getView().byId("fileUploader").setValue("");
			this.getView().byId("sel").setSelected(false);
		},
		onUpload: function (e) {
			this._import(e.getParameter("files") && e.getParameter("files")[0]);
		},
		_import: function (file) {
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
						var oEntry = {};
						var oEntryArr = [];
						var FileDataUploadoModel = new sap.ui.model.json.JSONModel();
						var FileDataUploadoJson = [];
						var FileDataUploadJsonData = {};
						if (excelData.length > 0) {
							that._busyDialog.open();
							//that.getView().getModel("uploadModel").setData(excelData);
							//that.getView().getModel("uploadModel").refresh(true);
							for (var i = 0; i < excelData.length; ++i) {
								//	if(excelData[i].IMPORTO_MANUALE !== undefined )
								oEntry = {
									ID_CONSUNTIVO: excelData[i].ID_CONSUNTIVO,
									Matricola: excelData[i].Matricola,
									IMPORTO_MANUALE: excelData[i].IMPORTO_MANUALE,
									NOTE: excelData[i].NOTE,
									NOTE_IMPORTO_MANUALE: excelData[i].NOTE_IMPORTO_MANUALE
								};
								oEntryArr.push(oEntry);
							}
							that.sServiceUrl = that.getOwnerComponent().getModel().sServiceUrl;
							var surl = "/HANAMDC/STIP/STIPAdmin/services/gestioneConsUpload.xsjs/";
							console.log("*** PAYLOAD ****");
							//oEntryArr.oRowsUpload//rashmi
							console.log(oEntryArr);
							debugger;
							var aPromises = [];
							var bDimension = 50;
							var promiseNumber = Math.ceil(Number(oEntryArr.length / bDimension));
							for (var i = 0; i < promiseNumber; i++) {
								var toUpdate = oEntryArr.slice(bDimension * i, bDimension * (i + 1));
								aPromises.push(that.BatchUpdatePromise(toUpdate));
							}
							Promise.all(aPromises).then(function (promiseResponse) {
								console.log("ok");
								that._busyDialog.close();
								that.onPressAnnulla();
								MessageBox.success("File Data Uploaded Successfully");
							});
							/*$.ajax({
								url: that.sServiceUrl,
								type: "GET",
								beforeSend: function (xhr) {
									xhr.setRequestHeader("X-CSRF-Token", "Fetch"); //Passing CSRF token fetch request in header of GET 
								},
								success: function (data, textStatus, XMLHttpRequest) {
									var token = XMLHttpRequest.getResponseHeader('X-CSRF-Token');
									$.ajax({
										url: surl,
										TYPE: "POST",
										contentType: 'application/json',
										//data: JSON.stringify(oEntryArr),//rashmi
										data: {
											dataobject: JSON.stringify(oEntryArr) //rashmi
										},
										method: 'GET',
										dataType: 'text',
										//dataType: 'jsonp',
										beforeSend: function (xhr) {
											xhr.setRequestHeader("X-CSRF-Token", token); //Passing actual CSRF token we got from previous GET request
										},
										success: function (data1, textStatus1, XMLHttpRequest1) {
											console.log("*********** FILE DATA UPLOAD SUCCESS ******************");
											MessageBox.success(
												"File Data Uploaded Successfully"
											);
										},
										error: function (data1, textStatus1, XMLHttpRequest1) {
											MessageBox.error("Error while perfoming Invio Bozza. Please contact administrator.");
											jQuery.sap.log.getLogger().error("Error while perfoming Invio Bozza. Please contact administrator." + textStatus1.toString());
											console.log(textStatus1);
										}
									});
								}
							});*/
							//that.submitBatch(oEntryArr); // Batch Call
						}
					});
				};
				reader.onerror = function (ex) {};
				reader.readAsBinaryString(file);
			}
		},
		BatchUpdatePromise: function (aToUpdate) {

			var oBaseModel = this.getOwnerComponent().getModel();
			return new Promise(
				function (resolve, reject) {
					oBaseModel.setDeferredBatchGroups(["UpdateMatricole"]);
					for (var h = 0; h < aToUpdate.length; h++) {
						var Up = {
							IMPORTO_MANUALE: aToUpdate[h].IMPORTO_MANUALE,
							NOTE: aToUpdate[h].NOTE,
							NOTE_IMPORTO_MANUALE: aToUpdate[h].NOTE_IMPORTO_MANUALE

						};

						oBaseModel.update("/CONSUNTIVIMATRICOLE(ID_CONSUNTIVO=" + aToUpdate[h].ID_CONSUNTIVO + ",MATRICOLA='" + aToUpdate[h].Matricola +
							"')", Up, {
								groupId: "UpdateMatricole",
							});
					}
					oBaseModel.submitChanges({
						groupId: "UpdateMatricole",
						method: "PUT",
						success: function (oData, mss) {
							resolve(200);
						},
						error: function (e) {
							reject(500);
						}
					});
				}
			);

		},
		// submitBatch: function (oEntryArr) {
		// 	console.log("*** PAYLOAD ****");
		// 	console.log(oEntryArr);
		// },
		// submitBatch: function () {
		// 	var changeOperations = [];
		// 	var that = this;
		// 	var uploadModelData = that.getView().getModel("uploadModel").getData();
		// 	that.getView().getModel("uploadModel").getData()[0].ID_CONSUNTIVO;
		// 	var _ID_CONSUNTIVO;
		// 	var _MATRICOLA;
		// 	var sPath;
		// 	var oEntry = {};
		// 	var _IMP_MAN;
		// 	var _NOTE;
		// 	var _NOTE_IMPORTO_MANUALE;
		// 	var xsoBaseModel = that.getOwnerComponent().getModel("basexsoModel");
		// 	xsoBaseModel.attachRequestSent(function () {
		// 		that._busyDialog.open();
		// 	});
		// 	xsoBaseModel.attachRequestCompleted(function () {
		// 		that._busyDialog.close();
		// 	});
		// 	for (var i = 0; i < uploadModelData.length; i++) {
		// 		_ID_CONSUNTIVO = that.getView().getModel("uploadModel").getData()[i].ID_CONSUNTIVO;
		// 		_MATRICOLA = that.getView().getModel("uploadModel").getData()[i].Matricola;
		// 		_IMP_MAN = uploadModelData[i].IMP_MAN;
		// 		_NOTE = uploadModelData[i].NOTE;
		// 		_NOTE_IMPORTO_MANUALE = uploadModelData[i].NOTE_IMPORTO_MANUALE;
		// 		if(_IMP_MAN === undefined || _IMP_MAN === "NULL" || _IMP_MAN === null){
		// 			_IMP_MAN = 0;
		// 		}				
		// 		if(_NOTE_IMPORTO_MANUALE === undefined || _NOTE_IMPORTO_MANUALE === "NULL" || _NOTE_IMPORTO_MANUALE === null){
		// 			_NOTE_IMPORTO_MANUALE = "";
		// 		}
		// 		if(_NOTE === undefined || _NOTE === "NULL" || _NOTE === null){
		// 			_NOTE = "";
		// 		}				
		// 		oEntry = {
		// 			IMP_MAN: _IMP_MAN,
		// 			NOTE: _NOTE,
		// 			NOTE_IMPORTO_MANUALE: _NOTE_IMPORTO_MANUALE
		// 		};
		// 		sPath = "/CONSUNTIVIMATRICOLE(ID_CONSUNTIVO=" + _ID_CONSUNTIVO + ",MATRICOLA='" + _MATRICOLA + "')";
		// 		//sPath = "/customer(" + v[i].ID + ")";
		// 		//changeOperations.push(oModel.createBatchOperation(sPath, "PUT", uploadModelData[i], null));
		// 		changeOperations.push(xsoBaseModel.createBatchOperation(sPath, "PUT", oEntry, null));
		// 	}
		// 	// for (var i = this.custTableLength; i < v.length; i++) {
		// 	// 	changeOperations.push(oModel.createBatchOperation("/customer", "POST", v[i], null));
		// 	// }
		// 	xsoBaseModel.addBatchChangeOperations(changeOperations);
		// 	xsoBaseModel.submitBatch(function (oData, oResponse, aErrorResponses) {
		// 		if (aErrorResponses.length > 0) {
		// 			sap.m.MessageBox.alert("Error in Creating. Please try again...");
		// 			console.log(aErrorResponses);
		// 		} else {
		// 			sap.m.MessageBox.alert("Batch Successfull", {});
		// 		}
		// 	});
		// },
		submitBatch: function (oEvent) {},
		onPressSchede: function (oEvent) {
			var that = this;
			var oFilters = [];
			var oView = that.getView();
			//var V_CONSUNTIVITI_RESULTS_EXPJsonData = {};
			//var V_CONSUNTIVITI_RESULTS_EXPJson = [];
			var V_CONSUNTIVITI_RESULTS_EXPModel = new sap.ui.model.json.JSONModel();
			//BasilIncTableModel
			var xsoBaseModel = that.getOwnerComponent().getModel("basexsoModel");
			xsoBaseModel.attachRequestSent(function () {
				that._busyDialog.open();
			});
			xsoBaseModel.attachRequestCompleted(function () {
				that._busyDialog.close();
			});
			var index = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent()); // 2
			var _MATR = that.getView().byId("idTable5").getModel("ConsResultsSetModel").getProperty("/" + index + "/MATR"); // "03236V"
			var _ID_CONSUNTIVO = that.getView().byId("idTable5").getModel("ConsResultsSetModel").getProperty("/" + index + "/ID_CONSUNTIVO"); // 132
			oFilters.push(new sap.ui.model.Filter("MATRICOLA", sap.ui.model.FilterOperator.EQ, _MATR));
			oFilters.push(new sap.ui.model.Filter("ID_CONSUNTIVO", sap.ui.model.FilterOperator.EQ, _ID_CONSUNTIVO));
			xsoBaseModel.read("/V_CONSUNTIVITI_RESULTS_EXP", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					console.log("V_CONSUNTIVITI_RESULTS_EXP");
					console.log(oDataIn);
					V_CONSUNTIVITI_RESULTS_EXPModel.setData(oDataIn.results);
					that.getView().setModel(V_CONSUNTIVITI_RESULTS_EXPModel, "BasilIncTableModel");
					if (!that._oDialogBasiIncentivo) {
						Fragment.load({
							id: oView.getId(),
							name: "stipAdmin.stipAdmin.fragment.BasiIncentivo",
							controller: that
						}).then(function (oDialog) {
							that._oDialogBasiIncentivo = oDialog;
							that.BasiIncentivo();
							that._oDialogBasiIncentivo.open();
						}.bind(that));
					} else {
						that.BasiIncentivo();
						that._oDialogBasiIncentivo.open();
					}
				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed for V_CONSUNTIVITI_RESULTS_EXP. Please contact administrator.");
					jQuery.sap.log.getLogger().error("V_CONSUNTIVITI_RESULTS_EXP data fetch failed" + oError.toString());
				}.bind(this)
			});
		},
		BasiIncentivo: function () {
			// Set draggable property
			this._oDialogBasiIncentivo.setDraggable(true);
			this._oDialogBasiIncentivo.setResizable(true);
			var sResponsiveStyleClasses =
				"sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer";
			this._oDialogBasiIncentivo.addStyleClass(sResponsiveStyleClasses);
			this.getView().addDependent(this._oDialogBasiIncentivo);
		},
		onOkBasiIncDialog: function (oEvent) {
			this._oDialogBasiIncentivo.close();
		},
		//		openPdfDetails: function (id, pers) {
		openPdfDetails: function (oEvent) {
			var that = this;
			var oFilters = [];
			var V_Gestione_ConsuntivieModel = new sap.ui.model.json.JSONModel();
			var xsoBaseModel = that.getOwnerComponent().getModel("basexsoModel");
			var oResource = this.getView().getModel("i18n").getResourceBundle();
			var i;
			var sdate;
			var edate;
			var index = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
			var _IDSCHEDAPERSONALE = that.getView().getModel("BasilIncTableModel").getProperty("/" + index + "/IDSCHEDAPERSONALE");
			xsoBaseModel.attachRequestSent(function () {
				that._busyDialog.open();
			});
			xsoBaseModel.attachRequestCompleted(function () {
				that._busyDialog.close();
			});
			oFilters.push(new sap.ui.model.Filter("ID_SCHEDAPERSONALE", sap.ui.model.FilterOperator.EQ, _IDSCHEDAPERSONALE));
			// V_GesCons_SchedaPersonale	
			xsoBaseModel.read("/V_GesCons_SchedaPersonale", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					console.log("V_GesCons_SchedaPersonale");
					console.log(oDataIn.results);
					if (oDataIn.results.length > 0) {
						V_Gestione_ConsuntivieModel.setData(oDataIn.results);
						that.getView().setModel(V_Gestione_ConsuntivieModel, "SchedaPersonaleModel");
						var header = "<head><center><h3>" + "STIP" +
							"</h3></center><br><center><caption>Scheda di Assegnazione Obiettivi</caption></center></head>" +
							"<style type='text/css'>" +
							"</style></head>";
						var table1 =
							"<table style='border-collapse:collapse;border:1px solid black;' width='100%'><tr>" +
							"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Assegnata") + "</th>" +
							"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Matricola") + "</th>" +
							"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("CDC") + "</th>" +
							"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Ruolo") + "</th></tr>";
						var table2 =
							"<table style='border-collapse:collapse;border:1px solid black;' width='100%'><tr>" +
							"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("N") + "</th>" +
							"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Peso") + "</th>" +
							"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Descrizione") + "</th>" +
							"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Target") + "</th>" +
							"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Note") + "</th>" +
							"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("RisultatoFinale") + "</th>" +
							"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("InSulTarget") + "</th>" +
							"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("TipoScalaValorizzazione") + "</th>" +
							"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Risultato") + "</th>" +
							"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("RisultatoPonderato") + "</th></tr>";
						var table4 =
							"<table><tr>" +
							"<th style='font-size: 12px;'>" + oResource.getText("da") + "</th>" +
							"<th style='font-size: 12px;'>" + oResource.getText("aa") + "</th></tr>";
						///var mgr1, mgr2;
						var SchedaPersonaleModel = that.getView().getModel("SchedaPersonaleModel").getData();
						//for (var i = 0; i < SchedaPersonaleModel.length; i++) {
						//	if (SchedaPersonaleModel[i].ID_SCHEDAPERSONALE === pers) {
						table1 += "<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" +
							SchedaPersonaleModel[0].COGNOME + " " + SchedaPersonaleModel[0].NOME +
							"</td>" +
							"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" +
							SchedaPersonaleModel[0].MATRICOLA +
							"</td>" +
							"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" +
							"" +
							"</td>" +
							"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" +
							SchedaPersonaleModel[0].PERS_RUOLO +
							"</td>";
						sdate = SchedaPersonaleModel[0].INIZIO_ASSEGNAZIONE,
							edate = SchedaPersonaleModel[0].FINE_ASSEGNAZIONE;
						if (sdate !== null && sdate !== undefined && sdate !== "" && edate !== null && edate !== undefined && edate !== "") {
							sdate = Formatter.months(sdate.getMonth() + 1) + " " + sdate.getFullYear();
							edate = Formatter.months(edate.getMonth() + 1) + " " + edate.getFullYear();
						} else {
							sdate = "";
							edate = "";
						}
						//data[0].INIZIO_ASSEGNAZIONE = sdate;
						//data[0].FINE_ASSEGNAZIONE = edate;
						table4 += "<td style='font-size: 12px;'>" + sdate + "</td>" +
							"<td style='font-size: 12px;'>" + edate + "</td></tr></table>";
						////mgr1 = SchedaPersonaleModel[i].PERS_MGR_COGNOME + " " + SchedaPersonaleModel[i].PERS_MGR_NOME;
						///var mgr2 = SchedaPersonaleModel[0].COGNOME_MGR + " " + SchedaPersonaleModel[0].NOME_MGR;
						///break;
						//}
						//}
						table1 = table1 + "</tr><tr></tr></table>";
						/*var table3 = "<p>" + oResource.getText("Note") + ":  " + "</p>" + "<p>" + oResource.getText("RespDiretto") + ":  " + mgr1 + "</p>" +
					"<p>" + oResource.getText("Accettazione") + ":  " + mgr2 + "</p>";
	*/
						var table3 = "<p>" + oResource.getText("NotePDF") + ": " + ((SchedaPersonaleModel[0].SCHEDANOTE === 'NULL') || (!(
								SchedaPersonaleModel[0].SCHEDANOTE)) ? '' : SchedaPersonaleModel[0].SCHEDANOTE) + "</p>" + "<p>" + oResource.getText(
								"RespDiretto") + ":  " +
							"</p>" +
							"<p>" + oResource.getText("GesConAccettazione") + ":  " + SchedaPersonaleModel[0].COGNOME + " " + SchedaPersonaleModel[0].NOME +
							"</p>";
						// var scheda = [];
						// for (var i = 0; i < oMainModel.getData()[2].Fragment[1].Data.length; i++) {
						// 	if (oMainModel.getData()[2].Fragment[1].Data[i].ID_SCHEDAMASTER === id)
						// 		scheda.push(oMainModel.getData()[2].Fragment[1].Data[i]);
						// }
						var j;
						var pon = 0.0;
						//for (i = 0; i < scheda.length; i++) {
						for (var i = 0; i < SchedaPersonaleModel.length; i++) {
							j = i + 1;
							pon = pon + parseFloat(SchedaPersonaleModel[i].PERC_RAGG_MBO);
							table2 += '<tr>'
							table2 += "<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + j +
								"</td>" +
								"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" +
								SchedaPersonaleModel[i].PESO +
								"%" +
								"</td>" +
								"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" +
								SchedaPersonaleModel[i].DESCR_PISTA +
								"</td>" +
								"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + parseFloat(
									SchedaPersonaleModel[i].OBIETTIVO) +
								"</td>" +
								"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + ((
									SchedaPersonaleModel[i].NOTE === "NULL") ? '' : SchedaPersonaleModel[i].NOTE) +
								"</td>" +
								"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + parseFloat(
									SchedaPersonaleModel[i].CONSUNTIVO) +
								"</td>" +
								"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + parseFloat(
									SchedaPersonaleModel[i]
									.OBIETTIVO,
									10) + "%" +
								"</td>" +
								"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" +
								SchedaPersonaleModel[i].DESCR_CURVA +
								"</td>" +
								"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + parseFloat(
									SchedaPersonaleModel[i].PERC_RAGG_OBIETTIVO) +
								"</td>" +
								"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + parseFloat(
									SchedaPersonaleModel[i].PERC_RAGG_MBO) +
								"</td>";
							table2 += '</tr>'
						}
						table2 += "</table>";
						table3 = table3 + "<p>" + oResource.getText("RaggiungimentoObiettivo") + ":  " + pon + "%" + "</p>";
						var body = header + table4 + table1 + table2 + table3;
						var opt = {
							margin: 1,
							filename: 'Scheda_di_Assegnazione_Obiettivi.pdf',
							image: {
								type: 'jpeg',
								quality: 1
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
						var pages = [body];
						var doc = html2pdf().set(opt).from(pages[0]).toPdf()
						for (var j = 1; j < pages.length; j++) {
							doc = doc.get('pdf').then(
								pdf => {
									pdf.addPage()
								}
							).from(pages[j]).toContainer().toCanvas().toPdf()
						}
						doc.save();
					} else
						MessageBox.error("Data fetch failed for V_GesCons_SchedaPersonale . Please contact administrator.");

				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed for V_GesCons_SchedaPersonale . Please contact administrator.");
					jQuery.sap.log.getLogger().error("V_GesCons_SchedaPersonale fetch failed" + oError.toString());
				}.bind(this)
			});
		},
		onPressSimSchede: function (oEvent) {
			var that = this;
			var oFilters = [];
			var oView = that.getView();
			//var V_CONSUNTIVITI_RESULTS_EXPJsonData = {};
			//var V_CONSUNTIVITI_RESULTS_EXPJson = [];
			var V_RESULTS_EXP_SIMModel = new sap.ui.model.json.JSONModel();
			var xsoBaseModel = that.getOwnerComponent().getModel("basexsoModel");
			xsoBaseModel.attachRequestSent(function () {
				that._busyDialog.open();
			});
			xsoBaseModel.attachRequestCompleted(function () {
				that._busyDialog.close();
			});
			var index = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
			var _MATR = that.getView().byId("idTable6").getModel("ConsSimResultsSetModel").getProperty("/" + index + "/MATR");
			var _ID_CONSUNTIVO = that.getView().byId("idTable6").getModel("ConsSimResultsSetModel").getProperty("/" + index + "/ID_CONSUNTIVO");
			oFilters.push(new sap.ui.model.Filter("MATRICOLA", sap.ui.model.FilterOperator.EQ, _MATR));
			oFilters.push(new sap.ui.model.Filter("ID_CONSUNTIVO", sap.ui.model.FilterOperator.EQ, _ID_CONSUNTIVO));
			xsoBaseModel.read("/V_RESULTS_EXP_SIM", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					console.log("V_RESULTS_EXP_SIM");
					console.log(oDataIn);
					V_RESULTS_EXP_SIMModel.setData(oDataIn.results);
					that.getView().setModel(V_RESULTS_EXP_SIMModel, "SimBasilIncTableModel");
					if (!that._oDialogSimBasiIncentivo) {
						Fragment.load({
							id: oView.getId(),
							name: "stipAdmin.stipAdmin.fragment.SimBasiIncentivo",
							controller: that
						}).then(function (oDialog) {
							that._oDialogSimBasiIncentivo = oDialog;
							that.SimBasiIncentivo();
							that._oDialogSimBasiIncentivo.open();
						}.bind(that));
					} else {
						that.SimBasiIncentivo();
						that._oDialogSimBasiIncentivo.open();
					}
				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed for V_RESULTS_EXP_SIM. Please contact administrator.");
					jQuery.sap.log.getLogger().error("V_RESULTS_EXP_SIM data fetch failed" + oError.toString());
				}.bind(this)
			});
		},
		SimBasiIncentivo: function () {
			// Set draggable property
			this._oDialogSimBasiIncentivo.setDraggable(true);
			this._oDialogSimBasiIncentivo.setResizable(true);
			var sResponsiveStyleClasses =
				"sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer";
			this._oDialogSimBasiIncentivo.addStyleClass(sResponsiveStyleClasses);
			this.getView().addDependent(this._oDialogSimBasiIncentivo);
		},
		onOkSimBasiIncDialog: function (oEvent) {
			this._oDialogSimBasiIncentivo.close();
		},
		// onSimDataExport: function(oEvent){
		// 		var oResource = this.getView().getModel("i18n").getResourceBundle();
		// 		var GestConstSimArray = [];
		// 		var oEntry = {};
		// 		var GestConstSimModelData = this.getView().byId("idTable6").getModel("ConsSimResultsSetModel").getData();
		// 		for(var i = 0 ; i < GestConstSimModelData.length ; ++i){
		// 			//oEntry = {
		// 				//content: "{path: 'PISTA_VALE_DAL', formatter: 'stipAdmin.stipAdmin.util.Formatter.formatDateGestCons'}"
		// 				oEntry.BloccatiCheckBox = (GestConstSimModelData[i].BloccatiCheckBox) ? GestConstSimModelData[i].BloccatiCheckBox : '',
		// 				oEntry.D = (GestConstSimModelData[i].D) ? GestConstSimModelData[i].D : '',
		// 				oEntry.DATA_DIM = (GestConstSimModelData[i].DATA_DIM) ? GestConstSimModelData[i].DATA_DIM : '',
		// 				oEntry.INVIO_PS = (GestConstSimModelData[i].INVIO_PS) ? GestConstSimModelData[i].INVIO_PS : '',
		// 				oEntry.MATR = (GestConstSimModelData[i].MATR) ? GestConstSimModelData[i].MATR : '',
		// 				oEntry.DIPENDENTE = (GestConstSimModelData[i].DIPENDENTE) ? GestConstSimModelData[i].DIPENDENTE : '',
		// 				oEntry.DATA_ASS = (GestConstSimModelData[i].DATA_ASS) ? GestConstSimModelData[i].DATA_ASS : '',
		// 				oEntry.Q = (GestConstSimModelData[i].Q) ? GestConstSimModelData[i].Q : '',
		// 				oEntry.SCHEDE = (GestConstSimModelData[i].SCHEDE) ? GestConstSimModelData[i].SCHEDE : '',
		// 				oEntry.GEST = (GestConstSimModelData[i].GEST) ? GestConstSimModelData[i].GEST : '',
		// 				oEntry.NON_ATTIG = (GestConstSimModelData[i].NON_ATTIG) ? GestConstSimModelData[i].NON_ATTIG : '',
		// 				oEntry.NCONS = (GestConstSimModelData[i].NCONS) ? GestConstSimModelData[i].NCONS : '',
		// 				oEntry.IMP = (GestConstSimModelData[i].IMP) ? GestConstSimModelData[i].IMP : '',
		// 				oEntry.PERC_STIP = (GestConstSimModelData[i].PERC_STIP) ? GestConstSimModelData[i].PERC_STIP : '',
		// 				oEntry.IMP_MAN = (GestConstSimModelData[i].IMP_MAN) ? GestConstSimModelData[i].IMP_MAN : '',
		// 				oEntry.PERC_STIP_MANUALE = (GestConstSimModelData[i].PERC_STIP_MANUALE) ? GestConstSimModelData[i].PERC_STIP_MANUALE : '',
		// 				oEntry.NOTE = (GestConstSimModelData[i].NOTE) ? GestConstSimModelData[i].NOTE : '',
		// 				oEntry.IMP_LIQUI = (GestConstSimModelData[i].IMP_LIQUI) ? GestConstSimModelData[i].IMP_LIQUI : '',
		// 				oEntry.PERC_STIP_LIQUIDATA = (GestConstSimModelData[i].PERC_STIP_LIQUIDATA) ? GestConstSimModelData[i].PERC_STIP_LIQUIDATA : '',
		// 				oEntry.MODIF = (GestConstSimModelData[i].MODIF) ? GestConstSimModelData[i].MODIF : ''
		// 				GestConstSimArray.push(oEntry);
		// 				oEntry = {};
		// 		//	};
		// 		}
		// 		var columnTemplate = [
		// 			[	{
		// 					column: 'BloccatiCheckBox',
		// 					label: oResource.getText("SelDelSel")
		// 				},{
		// 					column: 'D',
		// 					label: oResource.getText("GesConD")
		// 				}, {
		// 					column: 'DATA_DIM',
		// 					label: oResource.getText("DataDim")
		// 				},{
		// 					column: 'INVIO_PS',
		// 					label: oResource.getText("InvioPS")
		// 				},{
		// 					column: 'MATR',
		// 					label: oResource.getText("GesConMatr")
		// 				},{
		// 					column: 'DIPENDENTE',
		// 					label: oResource.getText("Dipendente")
		// 				},{
		// 					column: 'DATA_ASS',
		// 					label: oResource.getText("DataAss")
		// 				},{
		// 					column: 'Q',
		// 					label: oResource.getText("Q")
		// 				},{
		// 					column: 'SCHEDE',
		// 					label: oResource.getText("Schede")
		// 				},{
		// 					column: 'GEST',
		// 					label: oResource.getText("Gest")
		// 				},{
		// 					column: 'NON_ATTIG',
		// 					label: oResource.getText("NonAttig")
		// 				},{
		// 					column: 'NCONS',
		// 					label: oResource.getText("NCons.")
		// 				},{
		// 					column: 'IMP',
		// 					label: oResource.getText("ImpSim")
		// 				},{
		// 					column: 'PERC_STIP',
		// 					label: oResource.getText("%StipSim")
		// 				},{
		// 					column: 'IMP_MAN',
		// 					label: oResource.getText("ImpManSim")
		// 				},{
		// 					column: 'PERC_STIP_MANUALE',
		// 					label: oResource.getText("%StipManSim")
		// 				},{
		// 					column: 'NOTE',
		// 					label: oResource.getText("Note1")
		// 				},{
		// 					column: 'IMP_LIQUI',
		// 					label: oResource.getText("ImpLiqSim")
		// 				},{
		// 					column: 'PERC_STIP_LIQUIDATA',
		// 					label: oResource.getText("%LiqSim")
		// 				},{
		// 					column: 'MODIF',
		// 					label: oResource.getText("ModiffSim")
		// 				}
		// 			]
		// 		];
		// 		var excelData = {
		// 			GestConsSimulation: GestConstSimArray
		// 		};			
		// 		tablesToExcel(excelData, ['GestConsSimulation'], columnTemplate, 'GestConsSimulation.xls', 'Excel');
		// },
		onSimDataExport: function (oEvent) {
			var oResource = this.getView().getModel("i18n").getResourceBundle();
			var GestConstSimModel = this.getView().byId("idTable6").getModel("ConsSimResultsSetModel");
			var oExport = new Export({
				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType: new sap.ui.core.util.ExportTypeCSV({
					separatorChar: "\t",
					mimeType: "application / vnd.ms - excel",
					charset: "utf - 8",
					fileExtension: "xls"
				}),
				// Pass in the model created above
				//	models : this.getView().getModel(),
				models: GestConstSimModel,
				// binding information for the rows aggregation
				rows: {
					path: "/"
				},
				// column definitions with column name and binding info for the content
				columns: [
					// 	{
					// 	name: oResource.getText("SelDelSel"),
					// 	template: {
					// 		content: "{BloccatiCheckBox}"
					// 	}
					// }, 
					{
						name: oResource.getText("GesConD"),
						template: {
							content: "{D}"
						}
					}, {
						name: oResource.getText("DataDim"),
						template: {
							content: "{DATA_DIM}"
						}
					}, {
						name: oResource.getText("InvioPS"),
						template: {
							//content: "{path: 'PISTA_VALE_DAL', formatter: 'stipAdmin.stipAdmin.util.Formatter.formatDateGestCons'}"
							content: "{INVIO_PS}"
						}
					}, {
						name: oResource.getText("GesConMatr"),
						template: {
							//content: "{path: 'PISTA_VALE_AL', formatter: 'stipAdmin.stipAdmin.util.Formatter.formatDateGestCons'}"
							content: "{MATR}"
						}
					}, {
						name: oResource.getText("GesConDipendente"),
						template: {
							content: "{DIPENDENTE}"
						}
					}, {
						name: oResource.getText("Q"),
						template: {
							content: "{Q}"
						}
					}, {
						name: oResource.getText("Schede"),
						template: {
							content: "{SCHEDE}"
						}
					}, {
						name: oResource.getText("Gest"),
						template: {
							content: "{GEST}"
						}
					}, {
						name: oResource.getText("NonAttig"),
						template: {
							content: "{NON_ATTIG}"
						}
					}, {
						name: oResource.getText("NCons."),
						template: {
							content: "{NCONS}"
						}
					}, {
						name: oResource.getText("ImpSim"),
						template: {
							content: "{IMP}"
						}
					}, {
						name: oResource.getText("%StipSim"),
						template: {
							content: "{PERC_STIP}"
						}
					}, {
						name: oResource.getText("TettoPaySim"),
						template: {
							content: "{TETTO_PAYOUT}"
						}
					}, {
						name: oResource.getText("ImpLiqSim"),
						template: {
							content: "{IMP_LIQUI}"
						}
					}, {
						name: oResource.getText("%LiqSim"),
						template: {
							content: "{PERC_STIP_LIQUIDATA}"
						}
					}, {
						name: oResource.getText("ModiffSim"),
						template: {
							content: "{MODIF}"
						}
					}
				]
			});
			// download exported file
			oExport.saveFile("GestConsSimulation").catch(function (oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function () {
				oExport.destroy();
			});
		},
		onPressImportoManuale: function (oEvent) {
			var that = this;
			var _DiffPerc = 0;
			var _Diff = 0;
			var oFilters = [];
			var oView = that.getView();
			//var CONSUNTIVIMATRICOLEJsonData = {};
			//var CONSUNTIVIMATRICOLEJson = [];
			var CONSUNTIVIMATRICOLEModel = new sap.ui.model.json.JSONModel();
			var NoteDataModel = new sap.ui.model.json.JSONModel();
			//BasilIncTableModel
			var xsoBaseModel = that.getOwnerComponent().getModel("basexsoModel");
			xsoBaseModel.attachRequestSent(function () {
				that._busyDialog.open();
			});
			xsoBaseModel.attachRequestCompleted(function () {
				that._busyDialog.close();
			});
			var index = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent()); // 2
			var _MATR = that.getView().byId("idTable5").getModel("ConsResultsSetModel").getProperty("/" + index + "/MATR"); // "03236V"
			var _ID_CONSUNTIVO = that.getView().byId("idTable5").getModel("ConsResultsSetModel").getProperty("/" + index + "/ID_CONSUNTIVO"); // 132
			that.getOwnerComponent().getModel("viewProperties").setProperty("/MATRICOLA", _MATR);
			that.getOwnerComponent().getModel("viewProperties").setProperty("/ID_CONSUNTIVO", _ID_CONSUNTIVO);
			oFilters.push(new sap.ui.model.Filter("MATRICOLA", sap.ui.model.FilterOperator.EQ, _MATR));
			oFilters.push(new sap.ui.model.Filter("ID_CONSUNTIVO", sap.ui.model.FilterOperator.EQ, _ID_CONSUNTIVO));
			// KAPIL - HARDCODED
			// that.getOwnerComponent().getModel("viewProperties").setProperty("/MATRICOLA", "31407V");
			// that.getOwnerComponent().getModel("viewProperties").setProperty("/ID_CONSUNTIVO", 105);
			// oFilters.push(new sap.ui.model.Filter("MATRICOLA", sap.ui.model.FilterOperator.EQ, "31407V"));
			// oFilters.push(new sap.ui.model.Filter("ID_CONSUNTIVO", sap.ui.model.FilterOperator.EQ, 105));

			xsoBaseModel.read("/CONSUNTIVIMATRICOLE", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					console.log("CONSUNTIVIMATRICOLE");
					console.log(oDataIn);
					CONSUNTIVIMATRICOLEModel.setData(oDataIn.results);
					//oDataIn.results[0].NOTE
					if (oDataIn.results[0] && oDataIn.results[0].NOTE) {
						var ArrNote = oDataIn.results[0].NOTE.split("BR");
						var NoteJson = {};
						var ArrNoteJson = [];
						for (var i = 0; i < ArrNote.length; ++i) {
							NoteJson = {
								NOTE: ArrNote[i]
							};
							ArrNoteJson.push(NoteJson);
							NoteJson = {};
						}
						NoteDataModel.setData(ArrNoteJson);
						//NoteDataModel.setData(oDataIn.results[0].NOTE.split("BR"));	
					}
					if (oDataIn.results[0].IMPORTO_MANUALE > 0) {
						_Diff = (oDataIn.results[0].IMPORTO - oDataIn.results[0].IMPORTO_MANUALE);
						//that.getView().byId("idDiff").setValue(oDataIn.results[0].IMPORTO - oDataIn.results[0].IMPORTO_MANUALE);
						_DiffPerc = 100 - ((oDataIn.results[0].IMPORTO / oDataIn.results[0].IMPORTO_MANUALE) * 100);
						//that.getView().byId("idDIffPerc").setValue(_DiffPerc + "%");
					}
					that.getView().setModel(NoteDataModel, "NoteDataModel");
					that.getView().setModel(CONSUNTIVIMATRICOLEModel, "ConsuntivimatricoleModel");
					if (!that._oDialogImportoManuale) {
						Fragment.load({
							id: oView.getId(),
							name: "stipAdmin.stipAdmin.fragment.ImportoManuale",
							controller: that
						}).then(function (oDialog) {
							that._oDialogImportoManuale = oDialog;
							that.ImportoManuale();
							that.getView().byId("idDiff").setValue(_Diff);
							that.getView().byId("idDIffPerc").setValue(_DiffPerc);
							that._oDialogImportoManuale.open();
						}.bind(that));
					} else {
						that.ImportoManuale();
						that._oDialogImportoManuale.open();
					}
				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed for CONSUNTIVIMATRICOLE. Please contact administrator.");
					jQuery.sap.log.getLogger().error("CONSUNTIVIMATRICOLE data fetch failed" + oError.toString());
				}.bind(this)
			});
		},
		ImportoManuale: function () {
			// Set draggable property
			this._oDialogImportoManuale.setDraggable(true);
			this._oDialogImportoManuale.setResizable(true);
			var sResponsiveStyleClasses =
				"sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer";
			this._oDialogImportoManuale.addStyleClass(sResponsiveStyleClasses);
			this.getView().addDependent(this._oDialogImportoManuale);
		},
		// This function is to close "Importo Manuale" pop up either on 'Cancel' or 'Annulla'
		onPressImpManCancel: function (oEvent) {
			if (this._oDialogImportoManuale) {
				this._oDialogImportoManuale.close();
			}
		},
		onChangeImpManuale: function (oEvent) {
			var ImpCalcolatoVal = this.getView().byId("idImpCalcolato").getValue();
			var ImpManualeVal = this.getView().byId("idImpManuale").getValue();
			if (ImpCalcolatoVal !== "" && ImpCalcolatoVal !== null && ImpCalcolatoVal !== undefined) {
				if (ImpManualeVal !== 0 && ImpManualeVal !== "" && ImpManualeVal !== null && ImpManualeVal !== undefined) {
					this.getView().byId("idDiff").setValue((ImpCalcolatoVal - ImpManualeVal));
					var _DiffPerc = 100 - ((ImpCalcolatoVal / ImpManualeVal) * 100)
					this.getView().byId("idDIffPerc").setValue(_DiffPerc + "%");
				}
			}
		},
		onPressGesConSalva: function (oEvent) {
			var that = this;
			var oEntry = {};
			var _oldNote = "";
			var _Note = "";
			var xsoBaseModel = that.getOwnerComponent().getModel("basexsoModel");
			xsoBaseModel.attachRequestSent(function () {
				that._busyDialog.open();
			});
			xsoBaseModel.attachRequestCompleted(function () {
				that._busyDialog.close();
			});
			var ImpManualeVal = that.getView().byId("idImpManuale").getValue();
			var _firstName = that.getOwnerComponent().getModel("empModel").getData().firstName;
			var _lastName = that.getOwnerComponent().getModel("empModel").getData().lastName;
			var _NoteDataModel = this.getView().getModel("NoteDataModel").getData();
			var utcCreationDt = Formatter.formatDateImpMan((new Date()).toUTCString()); // Current date and time
			//oEntry.UPDATEDATE = new Date();
			//oEntry.INSERTDATE = new Date();
			_Note = this.getView().byId("idGesConNote").getValue();
			var _NoteURL = "";
			for (var i = 0; i < _NoteDataModel.length; ++i) {
				if (i === (_NoteDataModel.length - 1)) {
					_NoteURL = _NoteURL + _NoteDataModel[i].NOTE;
					break;
				}
				_NoteURL = _NoteURL + _NoteDataModel[i].NOTE + "BR";
			}
			_oldNote = _NoteURL;
			if (_Note !== "" && _Note !== null && _Note !== undefined) {
				_Note = utcCreationDt + " " + _firstName + " " + _lastName + ":" + " " + _Note;
				_NoteURL = _NoteURL + "BR" + _Note; // + "BR";
			} else {
				_NoteURL = _NoteURL;
			}
			oEntry = {
				IMPORTO_MANUALE: ImpManualeVal,
				NOTE_IMPORTO_MANUALE: _oldNote,
				NOTE: _NoteURL
			};
			var _MATR = that.getOwnerComponent().getModel("viewProperties").getProperty("/MATRICOLA");
			var _ID_CONSUNTIVO = that.getOwnerComponent().getModel("viewProperties").getProperty("/ID_CONSUNTIVO");
			var sURL = "/CONSUNTIVIMATRICOLE(ID_CONSUNTIVO=" + _ID_CONSUNTIVO + ",MATRICOLA='" + _MATR+ "')";
			xsoBaseModel.update(sURL, oEntry, {
				success: function (odata, oResponse) {
					console.log("Update Success - SALVA");
					if (that._oDialogImportoManuale) {
						that._oDialogImportoManuale.close();
					}
					that.getView().byId("idGesConNote").setValue("");
					sap.m.MessageToast.show("Salva Successful", {
						duration: 3000
					});
				},
				error: function (oError) {
					sap.m.MessageBox.error("Data update failed for CONSUNTIVIMATRICOLE. Please contact administrator.");
					jQuery.sap.log.getLogger().error("Data update failed for CONSUNTIVIMATRICOLE" + oError.toString());
				}
			});
		}
	});
});