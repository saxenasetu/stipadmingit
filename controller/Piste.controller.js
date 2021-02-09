sap.ui.define(["sap/m/TablePersoController",
	"sap/ui/core/Fragment",
	"./DemoPersoService",
	"./Formatter",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"stipAdmin/stipAdmin/util/PisteTableHome",
	"sap/m/TablePersoController",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"stipAdmin/stipAdmin/util/Formatter",
	"sap/ui/Device",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"./exportExcel",
	"./xlsx",
	"./jszip"
], function (e, Fragment, t, o, n, i, MessageBox, PisteTableHome, TablePersoController, Export, ExportTypeCSV, Formatter, Device, Sorter,
	Filter, FilterOperator, Excel, xlsx, jszip) {
	"use strict";
	var oResource;
	var PisteModel = new i();
	PisteModel.loadData("model/piste.json", false);
	var id = 1,
		SortProp = {
			sPath: "ID_PISTAVIEW",
			bDescending: "desc"
		};

	return n.extend("stipAdmin.stipAdmin.controller.Piste", {
		onInit: function () {

			this.busyDialog = new sap.m.BusyDialog();
			this.getOwnerComponent().getRouter().getRoute("Piste").attachPatternMatched(this._onObjectMatched, this);
			//	var o = new i(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			var n = new i({
				hasGrouping: false
			});
			this.getView().byId("filterbarPiste")._oSearchButton.setText("Cerca");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/PisteChange", true);
			//	this.getView().setModel(o);
			this.getView().setModel(n, "Grouping");
			this._oTPC = new TablePersoController({
				table: this.byId("tblPiste"),
				componentName: "Piste",
				persoService: PisteTableHome
			}).activate();
		},

		onHome: function () {
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/PisteChange", true);
			var n = sap.ui.core.UIComponent.getRouterFor(this);
			n.navTo("Home");
		},
		onPersoButtonPressed: function (e) {
			this._oTPC.openDialog();
		},
		onTablePersoRefresh: function () {
			t.resetPersData();
			this._oTPC.refresh();
		},
		onTableGrouping: function (e) {
			this._oTPC.setHasGrouping(e.getSource().getSelected());
		},
		_onObjectMatched: function (oEvent) {

			oResource = this.getView().getModel("i18n").getResourceBundle();
			this.oMainJsonModel = new sap.ui.model.json.JSONModel();
			this.oMainJsonModelExport = new sap.ui.model.json.JSONModel();
			this.selectedfiscalYearPeriodi = "";
			this.sServiceUrl = this.getOwnerComponent().getModel().sServiceUrl;
			this.oMainOdataModel = new sap.ui.model.odata.v2.ODataModel(this.sServiceUrl);
			this._mViewSettingsDialogs = {};
			this.mGroupFunctions = {

				ID_PISTAVIEW: function (oContext) {
					var name = oContext.getProperty("ID_PISTAVIEW");
					return {
						key: name,
						text: name
					};
				},
				DESCR_PISTA: function (oContext) {
					var name = oContext.getProperty("DESCR_PISTA");

					return {
						key: name,
						text: Formatter.convertIdTipoToDesc(name)
					};
				},
				DESCR_GRUPPOPISTA: function (oContext) {
					var name = oContext.getProperty("DESCR_GRUPPOPISTA");

					return {
						key: name,
						text: name
					};
				}
			};

			this.count = 0;
			this.tops = 50;
			this.skip = 0;

			var oArguments = oEvent.getParameter("arguments");
			this.selectedfiscalYearPeriodi = oArguments.str;
			this.selectedfiscalYearPeriodiReassign = oArguments.str;
			this.byId("fy0").setSelectedKey(parseInt(this.selectedfiscalYearPeriodi, 10) - 1);
			this.Aggiungidaperiodiprecedenti = false;
			// first time there will be no value but inside the app when we nevigate back applied filter will get considered
			this.aFilters = [];
			if (sap.ui.getCore().getModel("BasicAppModel").getProperty("/PisteChange")) {
				var oIdJson1 = new sap.ui.model.json.JSONModel();
				oIdJson1.setData(arrayData1);
				this.getView().setModel(oIdJson1, "pisteResultTableModel");
			} else {
				this.onSearch(this.tops, this.skip);
			}

			this.getPisteId();
			this.getFiscalYear(this.selectedfiscalYearPeriodi);
			this.getCurva();
			this.getCurvaDownload();
			var arrayData1 = [];

			this.getView().byId("idTxtResult").setText("");
			var flagPCO = sap.ui.getCore().getModel("EmpAuthoModel").getData()[0].ROLE_PCO;
			var flagHrAdmin = sap.ui.getCore().getModel("EmpAuthoModel").getData()[0].ROLE_HR_ADMIN;
			if (flagPCO === "X" || flagHrAdmin === 'X') {
				this.getView().byId("btnDownloadRisultati").setVisible(true);
				this.getView().byId("btnUploadRisultati").setVisible(true);
			} else {
				this.getView().byId("btnDownloadRisultati").setVisible(false);
				this.getView().byId("btnUploadRisultati").setVisible(false);
			}
			if (oEvent.getParameter("arguments").from === 'Home') {
				SortProp = {
					sPath: "ID_PISTAVIEW",
					bDescending: "desc"
				};
			}
		},
		_next: function () {
			//this.tops = this.tops + 250;
			this.count = this.count + 1;
			this.skip = this.skip + this.tops;
			this.onSearch(this.tops, this.skip);
		},
		_prev: function () {
			this.count = this.count - 1;
			this.skip = this.skip - this.tops;
			this.onSearch(this.tops, this.skip);
		},
		onSearchResult: function (oEvent) {
			this.count = 0;
			this.tops = 50;
			this.skip = 0;
			this.byId("prev").setVisible(true);
			this.byId("next").setVisible(true);
			this.onSearch(this.tops, this.skip);
		},
		getPisteId: function () {
			var that = this;
			var oFilters = [];
			var year = "";
			if (this.selectedfiscalYearPeriodi != undefined && this.selectedfiscalYearPeriodi != "") {
				var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, parseInt(this.selectedfiscalYearPeriodi));
				oFilters.push(filter1);
			}
			var mParameters = {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					var ogetPisteModel = new sap.ui.model.json.JSONModel();
					var arrayPisteId = [];
					var oEntry = {};
					for (var i = 0; i < oResponse.data.results.length; i++) {
						oEntry.ID_PISTAVIEW = oResponse.data.results[i].ID_PISTAVIEW.toString();
						arrayPisteId.push(oEntry);
						oEntry = {};
					}
					ogetPisteModel.setSizeLimit(999999);
					ogetPisteModel.setData(arrayPisteId);
					that.getView().setModel(ogetPisteModel, "Idpistaview");
					sap.ui.getCore().setModel(ogetPisteModel, "Idpistaview");
				},
				error: function (oError) {
					//	MessageBox.error("Error in getting ID Pisteview. Please contact administrator.");
				}
			};

			var path = "/P_PISTE?$format=json";
			this.oMainOdataModel.read(path, mParameters);
		},
		handleIdCurvPress: function (oEvent) {
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "PisteMain");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/year", this.selectedfiscalYearPeriodi);

			var curveIdContext = oEvent.oSource.getBindingContext("pisteResultTableModel").sPath;
			var idCurve = this.getView().getModel("pisteResultTableModel").getProperty(curveIdContext + "/ID_CURVA");
			var curvetype = this.getView().getModel("pisteResultTableModel").getProperty(curveIdContext + "/ID_TIPO_CURVA");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", idCurve);
			//	sap.ui.getCore().getModel("BasicAppModel").setProperty("/0/FISCAL_YEAR", selectedfiscalYearPeriodi);
			var selectedCurve = Formatter.convertIdTipoToDesc(curvetype);
			/*	sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", idCurve);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveDesc", curveDesc);*/
			var e = sap.ui.core.UIComponent.getRouterFor(this);
			if (selectedCurve == "Lineare") // after getting curv type t_tipi_curv
				e.navTo("displayCurvaLineare");

			else if (selectedCurve == "Discreta") {
				//	sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "curve");
				e.navTo("displayCurvaDiscreta");
			} else if (selectedCurve == "Discreta/Rapporto Percentuale")
				e.navTo("displayDiscretaRapportoPercentuale");
			else if (selectedCurve == "Lineare/Consuntivo")
				e.navTo("displayCurvaLineare_Consuntivo");
			else if (selectedCurve == "Lineare/Pdecimale")
				e.navTo("displayCurva_Pdecimale");
			else if (selectedCurve == "Descrittiva")
				e.navTo("displayCurvaDescrittiva");

		},
		handleDescGatePress: function (oEvent) {

			sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "PisteMain");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/year", this.selectedfiscalYearPeriodi);

			var curveIdContext = oEvent.oSource.getBindingContext("pisteResultTableModel").sPath;
			var idCurve = this.getView().getModel("pisteResultTableModel").getProperty(curveIdContext + "/ID_CURVA");
			var curvetype = this.getView().getModel("pisteResultTableModel").getProperty(curveIdContext + "/ID_TIPO_CURVA_GATE1");
			//	sap.ui.getCore().getModel("BasicAppModel").setProperty("/0/FISCAL_YEAR", selectedfiscalYearPeriodi);
			var selectedCurve = Formatter.convertIdTipoToDesc(curvetype);
			/*	sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", idCurve);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveDesc", curveDesc);*/
			var e = sap.ui.core.UIComponent.getRouterFor(this);
			if (selectedCurve == "Lineare") // after getting curv type t_tipi_curv
				e.navTo("displayCurvaLineare");

			else if (selectedCurve == "Discreta") {
				//	sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "curve");
				e.navTo("displayCurvaDiscreta");
			} else if (selectedCurve == "Discreta/Rapporto Percentuale")
				e.navTo("displayDiscretaRapportoPercentuale");
			else if (selectedCurve == "Lineare/Consuntivo")
				e.navTo("displayCurvaLineare_Consuntivo");
			else if (selectedCurve == "Lineare/Pdecimale")
				e.navTo("displayCurva_Pdecimale");
			else if (selectedCurve == "Descrittiva")
				e.navTo("displayCurvaDescrittiva");

		},
		handleDescGate2Press: function (oEvent) {

			sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "PisteMain");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/year", this.selectedfiscalYearPeriodi);

			var curveIdContext = oEvent.oSource.getBindingContext("pisteResultTableModel").sPath;
			var idCurve = this.getView().getModel("pisteResultTableModel").getProperty(curveIdContext + "/ID_CURVA");
			var curvetype = this.getView().getModel("pisteResultTableModel").getProperty(curveIdContext + "/ID_TIPO_CURVA_GATE2");
			//	sap.ui.getCore().getModel("BasicAppModel").setProperty("/0/FISCAL_YEAR", selectedfiscalYearPeriodi);
			var selectedCurve = Formatter.convertIdTipoToDesc(curvetype);
			/*	sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", idCurve);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveDesc", curveDesc);*/
			var e = sap.ui.core.UIComponent.getRouterFor(this);
			if (selectedCurve == "Lineare") // after getting curv type t_tipi_curv
				e.navTo("displayCurvaLineare");

			else if (selectedCurve == "Discreta") {
				//	sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "curve");
				e.navTo("displayCurvaDiscreta");
			} else if (selectedCurve == "Discreta/Rapporto Percentuale")
				e.navTo("displayDiscretaRapportoPercentuale");
			else if (selectedCurve == "Lineare/Consuntivo")
				e.navTo("displayCurvaLineare_Consuntivo");
			else if (selectedCurve == "Lineare/Pdecimale")
				e.navTo("displayCurva_Pdecimale");
			else if (selectedCurve == "Descrittiva")
				e.navTo("displayCurvaDescrittiva");

		},
		getCurva: function () {
			var that = this;
			var oFilters = [];
			var year = "";
			if (this.selectedfiscalYearPeriodi != undefined && this.selectedfiscalYearPeriodi != "") {
				var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, parseInt(this.selectedfiscalYearPeriodi));
				oFilters.push(filter1);
			}
			var mParameters = {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					var ogetCurvaModel = new sap.ui.model.json.JSONModel();
					var arrayCurva = [];
					var oEntry = {

						ID_CURVA: "",
						ID_PERIODO: "",
						DESCR_CURVA: "",
						ID_TIPO_CURVA: ""

					};
					arrayCurva.push(oEntry);
					oEntry = {};
					for (var i = 0; i < oResponse.data.results.length; i++) {
						oEntry.ID_CURVA = oResponse.data.results[i].ID_CURVA;
						oEntry.DESCR_CURVA = oResponse.data.results[i].DESCR_CURVA;
						oEntry.ID_PERIODO = oResponse.data.results[i].ID_PERIODO;
						oEntry.ID_TIPO_CURVA = oResponse.data.results[i].ID_TIPO_CURVA;
						/*	oEntry.ID_CURVA = oResponse.data.results[i].DESCR_TIPO_CURVA;*/

						arrayCurva.push(oEntry);
						oEntry = {};
					}
					ogetCurvaModel.setSizeLimit(999999);
					ogetCurvaModel.setData(arrayCurva);

					that.getView().setModel(ogetCurvaModel, "CurvaModel");
					sap.ui.getCore().setModel(ogetCurvaModel, "CurvaModel");
				},
				error: function (oError) {
					//	MessageBox.error("Error in getting CURVE. Please contact administrator.");
				}
			};

			var path = "/T_CURVE?$format=json";
			this.oMainOdataModel.read(path, mParameters);
		},
		getCurvaDownload: function () {
			var that = this;
			var oFilters = [];
			var year = "";
			if (this.selectedfiscalYearPeriodi != undefined && this.selectedfiscalYearPeriodi != "") {
				var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, parseInt(this.selectedfiscalYearPeriodi));
				oFilters.push(filter1);
			}
			var mParameters = {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					var ogetCurvaModel1 = new sap.ui.model.json.JSONModel();
					var arrayCurva1 = [];
					var oEntry = {};
					for (var i = 0; i < oResponse.data.results.length; i++) {
						oEntry.ID_CURVA = oResponse.data.results[i].ID_CURVA;
						oEntry.DESCR_CURVA = oResponse.data.results[i].DESCR_CURVA;
						oEntry.PERC_MBO = oResponse.data.results[i].PERC_MBO;
						oEntry.PERSTIP = ((oResponse.data.results[i].ID_TIPO_CURVA === 2 || oResponse.data.results[i].ID_TIPO_CURVA === 3) ? oResponse
							.data.results[i].VALORE_CURVA : oResponse.data.results[i].S_GRADINO);
						arrayCurva1.push(oEntry);
						oEntry = {};
					}
					ogetCurvaModel1.setSizeLimit(999999);
					ogetCurvaModel1.setData(arrayCurva1);
					that.getView().setModel(ogetCurvaModel1, "CurvaModelDownload");
					sap.ui.getCore().setModel(ogetCurvaModel1, "CurvaModelDownload");
				},
				error: function (oError) {
					//	MessageBox.error("Error in getting CURVE. Please contact administrator.");
				}
			};

			var path = "/VCURVAPISTE?$format=json";
			this.oMainOdataModel.read(path, mParameters);
		},
		onExit: function () {
			var oDialogKey,
				oDialogValue;

			for (oDialogKey in this._mViewSettingsDialogs) {
				oDialogValue = this._mViewSettingsDialogs[oDialogKey];

				if (oDialogValue) {
					oDialogValue.destroy();
				}
			}
		},
		handleSortButtonPressed: function () {
			this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.Sort_Piste").open();
		},
		handleFilterButtonPressed: function () {
			this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.filter_piste").open();
			//setting filter model 
			// getting the filtered value from the table model.
			var arrayId = [],
				arrayDesc = [],
				arrayGruppo = [];
			var oFilterIdJson = new sap.ui.model.json.JSONModel();
			var oFilterDescJson = new sap.ui.model.json.JSONModel();
			var oFilterGruppoJson = new sap.ui.model.json.JSONModel();
			var oEntry = {},
				oEntry2 = {},
				oEntry3 = {};
			if (this.getView().byId("tblPiste").getModel("pisteResultTableModel").getData()) {
				var mainArray = this.getView().byId("tblPiste").getModel("pisteResultTableModel").getData();
				// creating array for filter model
				for (var i = 0; i < mainArray.length; i++) {
					oEntry.ID_PISTAVIEW = mainArray[i].ID_PISTAVIEW;
					arrayId.push(oEntry);
					oEntry = {};
					oEntry.DESCR_PISTA = mainArray[i].DESCR_PISTA;
					arrayDesc.push(oEntry);
					oEntry = {};
					oEntry.DESCR_GRUPPOPISTA = mainArray[i].DESCR_GRUPPOPISTA;
					arrayGruppo.push(oEntry);
					oEntry = {};
				}
				// removing duplicate value from array
				arrayId = this.removeDuplicates(arrayId, "ID_PISTAVIEW");
				arrayDesc = this.removeDuplicates(arrayDesc, "DESCR_PISTA");
				arrayGruppo = this.removeDuplicates(arrayGruppo, "DESCR_GRUPPOPISTA");
				var oMainModel = this.getView().getModel("pisteResultTableModel");

				oMainModel.setProperty("/FilterId", arrayId);
				oMainModel.setProperty("/FilterDesc", arrayDesc);
				oMainModel.setProperty("/FilterGruppo", arrayGruppo);
				this.getView().setModel(oMainModel, "pisteResultTableModel");
			}
			/*oFilterIdJson.setData(arrayId);
			oFilterDescJson.setData(arrayDesc);
			oFilterIdJson.setData(arrayGruppo);*/

			//oDialog.setModel(this.getView().getModel("pisteResultTableModel"), "pisteResultTableModel");
			/*	sap.ui.getCore().setModel(arrayId, "FilterId");
				sap.ui.getCore().setModel(arrayDesc, "FilterDesc");
				sap.ui.getCore().setModel(arrayGruppo, "FilterGruppo");*/
		},
		handleGroupButtonPressed: function () {
			this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.Group_Piste").open();
		},
		createViewSettingsDialog: function (sDialogFragmentName) {
			var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
				this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;
				oDialog.setModel(this.getView().getModel("pisteResultTableModel"), "pisteResultTableModel");
				if (Device.system.desktop) {
					oDialog.addStyleClass("sapUiSizeCompact");
				}
			}
			oDialog.setModel(this.getView().getModel("pisteResultTableModel"), "pisteResultTableModel");
			return oDialog;
		},
		removeDuplicates: function (originalArray, prop) {
			var newArray = [];
			var lookupObject = {};

			for (var i in originalArray) {
				lookupObject[originalArray[i][prop]] = originalArray[i];
			}

			for (i in lookupObject) {
				newArray.push(lookupObject[i]);
			}
			return newArray;
		},
		onPisteButtonPressed: function (oEvent) {
			this._oTPC.openDialog();
		},
		onTablePersoRefresh: function () {
			PisteTableHome.resetPersData();
			this._oTPC.refresh();
		},
		handleidPistaValueHelp: function (oEvent) {
			this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.Id_PistaView", this);
			this.getView().addDependent(this._oValueHelpDialog[0]);
			sap.ui.getCore().byId("idGruppoAppartenenza").setVisible(false);
			sap.ui.getCore().byId("idPistaview").setVisible(true);
			sap.ui.getCore().byId("idPisteCurvedialog").setVisible(false);
			//sap.ui.getCore().byId("SelIdentificativoAssegnatario").setVisible(false);
			this._oValueHelpDialog[0].setModel(this.getView().getModel("Idpistaview"), "Idpistaview");
			this._oValueHelpDialog[0].open();

		},
		handlePisteCurvaValueHelp: function (oEvent) {
			this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.Id_PistaView", this);
			this.getView().addDependent(this._oValueHelpDialog[2]);
			sap.ui.getCore().byId("idGruppoAppartenenza").setVisible(false);
			sap.ui.getCore().byId("idPistaview").setVisible(false);
			sap.ui.getCore().byId("idPisteCurvedialog").setVisible(true);
			//	sap.ui.getCore().byId("SelIdentificativoAssegnatario").setVisible(false);
			this._oValueHelpDialog[2].setModel(this.getView().getModel("Idpistaview"), "Idpistaview");
			this._oValueHelpDialog[2].open();

		},
		/*
		handleIdentificativoAssegnatario: function (oEvent) {
			this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.Id_PistaView", this);
			this.getView().addDependent(this._oValueHelpDialog[3]);
			sap.ui.getCore().byId("idGruppoAppartenenza").setVisible(false);
			sap.ui.getCore().byId("idPistaview").setVisible(false);
			sap.ui.getCore().byId("idPisteCurvedialog").setVisible(false);
			sap.ui.getCore().byId("SelIdentificativoAssegnatario").setVisible(true);
			/////////////////////////////////////////////////////////////////
			var that = this;

			var mParameters = {

				success: function (oDataIn, oResponse) {
					var oJsonModel = new sap.ui.model.json.JSONModel();
					oJsonModel.setSizeLimit(999999);
					oJsonModel.setData(oDataIn.results);
					that.getView().setModel(oJsonModel, "IdentificativoAssegnatario");
					sap.ui.getCore().setModel(oJsonModel, "IdentificativoAssegnatario");
				},
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed while getting P_PISTE. Please contact administrator.");
					jQuery.sap.log.getLogger().error("T_Curve fetch failed" + oError.toString());

				}
			};

			var path = "/IdentificativoAssegnatario?$format=json";
			that.oMainOdataModel.read(path, mParameters);

			///////////////////////////////////////////////////////
			this._oValueHelpDialog[3].setModel(this.getView().getModel("IdentificativoAssegnatario"), "IdentificativoAssegnatario");
			this._oValueHelpDialog[3].open();

		},*/
		handleGruppoAppartenenzaValueHelp: function (oEvent) {
			this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.Id_PistaView", this);
			this.getView().addDependent(this._oValueHelpDialog[1]);
			sap.ui.getCore().byId("idGruppoAppartenenza").setVisible(true);
			sap.ui.getCore().byId("idPistaview").setVisible(false);
			sap.ui.getCore().byId("idPisteCurvedialog").setVisible(false);
			//sap.ui.getCore().byId("SelIdentificativoAssegnatario").setVisible(false);
			///////////////////////////////////////////////////////
			var that = this;
			var oFilters = [];
			if (this.selectedfiscalYearPeriodi != undefined && this.selectedfiscalYearPeriodi != "") {
				var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, parseInt(this.selectedfiscalYearPeriodi));
				oFilters.push(filter1);
			}
			var mParameters = {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					var oJsonModel = new sap.ui.model.json.JSONModel();
					oJsonModel.setSizeLimit(999999);
					oJsonModel.setData(oDataIn.results);
					that.getView().setModel(oJsonModel, "GruppoAppartenenza");
					sap.ui.getCore().setModel(oJsonModel, "GruppoAppartenenza");
				},
				error: function (oError) {
					//Handle the error
					//	MessageBox.error("Data fetch failed while getting P_PISTE. Please contact administrator.");
					//	jQuery.sap.log.getLogger().error("T_Curve fetch failed" + oError.toString());

				}
			};

			var path = "/Gruppo_Appartenenza?$format=json";
			that.oMainOdataModel.read(path, mParameters);

			///////////////////////////////////////////////////////
			that._oValueHelpDialog[1].setModel(that.getView().getModel("GruppoAppartenenza"), "GruppoAppartenenza");
			that._oValueHelpDialog[1].open();

		},
		handleIdValueSearch: function (oEvent) {

			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("ID_PISTAVIEW", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);

		},
		handleIdentificativoAssegnatarioSearch: function (oEvent) {

			var sValue = oEvent.getParameter("value");
			var oFilter1 = new Filter("MATRICOLA", sap.ui.model.FilterOperator.Contains, sValue);
			var oFilter2 = new Filter("NOME", sap.ui.model.FilterOperator.Contains, sValue);
			var oFilter3 = new Filter("COGNOME", sap.ui.model.FilterOperator.Contains, sValue);
			var filters = new Filter([oFilter1, oFilter2, oFilter3]);

			var oBinding = oEvent.getParameter("itemsBinding");
			//	oBinding.filter([oFilter]);
			oBinding.filter(filters);
			oBinding.refresh();

		},
		/*	handleIdentificativoAssegnatarioConfirm: function (oEvent) {
				var t = oEvent.getParameter("selectedItem");
				if (t) {
					this.oIdentificativoAssegnatario = this.getView().getModel("IdentificativoAssegnatario").getObject(oEvent.getParameter(
						"selectedItem").getBindingContextPath());
					this.getView().byId("inpIdentificativoAssegnatario").setValue(t.getTitle());

					if (this._oValueHelpDialog.length > 0) {
						for (var i = 0; i < this._oValueHelpDialog.length; i++) {
							this._oValueHelpDialog[i].destroy();
						}
					}

				}
				oEvent.getSource().getBinding("items").filter([])
			},*/
		handleIdValueconfirm: function (oEvent) {
			var t = oEvent.getParameter("selectedItem");
			if (t) {
				this.getView().byId("inpPistaview").setValue(t.getTitle());

				if (this._oValueHelpDialog.length > 0) {
					for (var i = 0; i < this._oValueHelpDialog.length; i++) {
						this._oValueHelpDialog[i].destroy();
					}
				}

			}
			//	oEvent.getSource().getBinding("items").filter([])
		},
		handleGruppoAppartenenzaValueSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("DESCR_GRUPPOPISTA", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);

		},
		handleGruppoAppartenenzaValueconfirm: function (oEvent) {
			var t = oEvent.getParameter("selectedItem");
			if (t) {
				this.oGruppoAppartenenza = this.getView().getModel("GruppoAppartenenza").getObject(oEvent.getParameter("selectedItem").getBindingContextPath());
				this.getView().byId("inpGruppoAppartenenza").setValue(t.getTitle());

				if (this._oValueHelpDialog.length > 0) {
					for (var i = 0; i < this._oValueHelpDialog.length; i++) {
						this._oValueHelpDialog[i].destroy();
					}
				}

			}
			//	oEvent.getSource().getBinding("items").filter([])
		},

		handlePisteCurveValueSearch: function (oEvent) {

			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("DESCR_CURVA", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);

		},
		handlePisteCurveValueconfirm: function (oEvent) {
			var t = oEvent.getParameter("selectedItem");
			if (t) {
				this.oIdpistaview = this.getView().getModel("CurvaModel").getObject(oEvent.getParameter("selectedItem").getBindingContextPath());
				this.getView().byId("inpPisteCurva").setValue(t.getTitle());

				if (this._oValueHelpDialog.length > 0) {
					for (var i = 0; i < this._oValueHelpDialog.length; i++) {
						this._oValueHelpDialog[i].destroy();
					}
				}

			}
			//	oEvent.getSource().getBinding("items").filter([])
		},
		handleIdValueHelpClose: function (oEvent) {
			if (this._oValueHelpDialog.length > 0) {
				for (var i = 0; i < this._oValueHelpDialog.length; i++) {
					this._oValueHelpDialog[i].destroy();
				}
			}

		},
		filter: function (oEvent) {

			var oTable = this.byId("tblPiste"),
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

			// apply filter settings
			oBinding.filter(aFilters);

		},
		sort: function (oEvent) {

			var oTable = this.byId("tblPiste"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];

			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));

			// apply the selected sort and group settings
			oBinding.sort(aSorters);
			this.byId("prev").setEnabled(true);
			this.byId("next").setEnabled(false);
			this.count = 0;
			SortProp.sPath = sPath;
			if (bDescending) {
				SortProp.bDescending = 'desc';
			} else {
				SortProp.bDescending = 'asc';
			}
			this.onSearch(50, 0);

		},
		group: function (oEvent) {

			var oTable = this.byId("tblPiste"),
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
			}
		},
		onTblPisteSelect: function (oEvent) {

			var table = this.getView().byId("tblPiste").getSelectedItems();

			//Setta tutti Cliccabili e se i controlli non vanno a buon fine setta man mano a Enabled 
			if (this.Aggiungidaperiodiprecedenti) {
				this.getView().byId("btnAggiungiCopia").setEnabled(false);
			} else {
				this.getView().byId("btnCopia").setEnabled(true);
				this.getView().byId("btnDelete").setEnabled(true);
				this.getView().byId("btnNote").setEnabled(true);
			}
			//Controlla tutte le righe selezionate 
			for (var i = 0; i < table.length; i++) {
				var line = table[i].getBindingContext("pisteResultTableModel").getObject();
				if (this.Aggiungidaperiodiprecedenti) {
					if (!line.COPY_PRECEDENTI_FUNC || (!line.COPY_PRECEDENTI_FUNC.includes("C:" + this.selectedfiscalYearPeriodi))) {
						this.getView().byId("btnAggiungiCopia").setEnabled(false);
					}
				} else {
					if (line.SN_PERSONALIZZABILE === 'S') {
						this.getView().byId("btnNote").setEnabled(false);
					}
					if (line.SN_PERSONALIZZABILE !== 'S' || (line.ID_PISTA_MADRE !== null && line.ID_PISTA_MADRE !== 0)) {
						this.getView().byId("btnCopia").setEnabled(false);
						this.getView().byId("btnDelete").setEnabled(false);
					}
				}
			}

			// code for Aggiungi da periodi precedenti functionality

			/*var object = oEvent.getSource().getModel("pisteResultTableModel").getObject(oEvent.getParameter("listItem").getBindingContextPath());
			// code for Aggiungi da periodi precedenti functionality
			if (this.Aggiungidaperiodiprecedenti) {
				if (object.COPY_PRECEDENTI_FUNC) {
					if (object.COPY_PRECEDENTI_FUNC.includes("C:" + this.selectedfiscalYearPeriodi)) {
						this.getView().byId("btnAggiungiCopia").setEnabled(false);
					} else {
						this.getView().byId("btnAggiungiCopia").setEnabled(true);
					}
				} else {
					this.getView().byId("btnAggiungiCopia").setEnabled(true);
				}
			} else {
				if (object.SN_PERSONALIZZABILE === 'S' && (object.ID_PISTA_MADRE === null || object.ID_PISTA_MADRE === 0)) {
					this.getView().byId("btnCopia").setEnabled(true);
					this.getView().byId("btnDelete").setEnabled(true);
					this.getView().byId("btnNote").setEnabled(false);
				} else {
					this.getView().byId("btnCopia").setEnabled(false);
					this.getView().byId("btnDelete").setEnabled(false);
					this.getView().byId("btnNote").setEnabled(true);
					
					if (oEvent.getParameter("selected")) {
						if (object.SCHEDEMASTERPISTE === '' && object.SCHEDEMASTERPISTE === 0) {
							var SCHEDEMASTERPISTE = 0;
						} else {
							var SCHEDEMASTERPISTE = object.SCHEDEMASTERPISTE;
						}
						if (SCHEDEMASTERPISTE > 0) {
							//	MessageBox.information(oResource.getText("messageInformation1", SCHEDEMASTERPISTE));
						}
					}

				}
				
			}*/
		},
		handleDelete: function (oEvent) {
			if (this.getView().byId("tblPiste").getSelectedItems().length === 1) {

				var vObject = this.getView().byId("tblPiste").getModel("pisteResultTableModel").getProperty(this.getView().byId("tblPiste").getSelectedItem()
					.getBindingContextPath());

				var that = this;
				var sPayload = {
					"ID_PISTA": parseInt(vObject.ID_PISTE)
				};
				sPayload = JSON.stringify(sPayload);
				$.ajax({
					url: "/HANAMDC/STIP/STIPAdmin/services/DeletePiste.xsjs",
					type: "POST",
					method: "GET",
					contentType: 'application/json',
					data: {
						odata: sPayload
					},
					dataType: 'text',

					success: function (data, textStatus1) {

						MessageBox.success(
							"KPI eliminata con successo", {
								onClose: function (oEvent) {

									that.onSearch(50, 0);
								}
							});

					},
					error: function (data, textStatus1) {

						MessageBox.error("Error while perfoming delete operation. Please contact administrator.");
						//	jQuery.sap.log.getLogger().error("delete operation failed" + textStatus1.toString());
					}
				});
			} else {
				MessageBox.error("Operazione non consentita. Selezionare un unico item");
				return;
			}
		},
		onTableSearch: function (oEvent) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("ID_PISTAVIEW", FilterOperator.EQ, sQuery);
				aFilters.push(filter);
			}

			// update list binding
			var oTable = this.byId("tblPiste");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters, "Application");

		},
		handleCopia: function (oEvent) {
			if (this.getView().byId("tblPiste").getSelectedItems().length === 1) {
				var vObject = this.getView().byId("tblPiste").getModel("pisteResultTableModel").getProperty(this.getView().byId("tblPiste").getSelectedItem()
					.getBindingContextPath());
				var oYears = this.oMainJsonYear.getProperty("/year");
				var oEntry = {
					ID_PERIODO: parseInt(this.selectedfiscalYearPeriodi),
					ID_PISTAVIEW: parseInt(vObject.ID_PISTAVIEW),
					ID_PISTE: parseInt(vObject.ID_PISTE),
					copy: 1, // 1 for Normal Copia,
					ID_PERIODOORIGNAL: parseInt(this.selectedfiscalYearPeriodiReassign),
				};
				var that = this;
				var url = "/HANAMDC/STIP/STIPAdmin/services/PisteCopy.xsjs";
				$.ajax({
					url: that.sServiceUrl + "/",
					type: "GET",
					beforeSend: function (xhr) {
						xhr.setRequestHeader("X-CSRF-Token", "Fetch"); //Passing CSRF token fetch request in header of GET 
					},
					success: function (data, textStatus, XMLHttpRequest) {
						var token = XMLHttpRequest.getResponseHeader("X-CSRF-Token");
						$.ajax({
							url: url,
							type: "POST",
							contentType: "application/json",
							data: JSON.stringify(oEntry),
							//dataType: 'jsonp',
							beforeSend: function (xhr) {
								xhr.setRequestHeader("X-CSRF-Token", token);
							},
							success: function (data1, textStatus1, XMLHttpRequest1) {

								MessageBox.success("PISTA : " + " " + data1.ID_PISTAVIEW + " got created for " + oYears, {
									title: "Success", // default
									onClose: function (sButton) {
										if (sButton === MessageBox.Action.OK) {

											that.onSearch(50, 0);
										}
									},
									actions: sap.m.MessageBox.Action.OK,
									emphasizedAction: sap.m.MessageBox.Action.OK
								});

							},
							error: function (data1, textStatus1, XMLHttpRequest1) {
								sap.ui.core.BusyIndicator.hide();
								MessageBox.error("Error while perfoming Copy operation. Please contact administrator.");
								//	jQuery.sap.log.getLogger().error("Copy operation failed" + textStatus1.toString());
							}
						});
					}
				});
			} else {
				MessageBox.error("Operazione non consentita. Selezionare un unico item");
				return;
			}
		},
		getFiscalYear: function (selectedfiscalYearPeriodi) {
			var that = this;
			var oFilters = [];
			var year = "";
			/*if (selectedfiscalYearPeriodi != undefined && selectedfiscalYearPeriodi != "") {
				var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, selectedfiscalYearPeriodi);
				oFilters.push(filter1);
			}*/
			var mParameters = {

				//	filters: oFilters,
				success: function (oDataIn, oResponse) {
					// setting the model for select
					var oAllJsonYear = new sap.ui.model.json.JSONModel();
					oAllJsonYear.setData(oDataIn.results);
					that.getView().setModel(oAllJsonYear, "FiscalYears");
					// Filtering the year to display in UI
					var selectedData1 = oDataIn.results.filter(function (result) {
						return (result.ID_PERIODO === parseInt(selectedfiscalYearPeriodi));
					});
					year = selectedData1[0].DESCR_PERIODO;
					that.oMainJsonYear = new sap.ui.model.json.JSONModel();
					that.oMainJsonYear.setProperty("/year", year);
					that.getView().setModel(that.oMainJsonYear, "Years");
				},
				error: function (oError) {
					//	MessageBox.error("Error in getting Fiscal year. Please contact administrator.");
				}
			};

			var path = "/PERIODI_RIFERIMENTO?$format=json";
			this.oMainOdataModel.read(path, mParameters);
		},
		handleNuova: function () {
			var that = this;
			sap.ui.core.UIComponent.getRouterFor(that).navTo("createPiste", {
				createPiste: "createPiste",
				str: that.selectedfiscalYearPeriodi,
				str2: 0
			});
		},
		handlePistaViewNavigation: function (oEvent) {
			var vObject = this.getView().byId("tblPiste").getModel("pisteResultTableModel").getProperty(oEvent.getSource().getParent().getBindingContextPath());
			/*var oYears = this.oMainJsonYear.getProperty("/year"); */
			var oEntry = {
				ID_PERIODO: parseInt(this.selectedfiscalYearPeriodi),
				ID_PISTAVIEW: parseInt(vObject.ID_PISTAVIEW),
				ID_PISTE: parseInt(vObject.ID_PISTE),
			};
			var that = this;
			sap.ui.core.UIComponent.getRouterFor(that).navTo("ViewPiste", {
				ViewPiste: "ViewPiste",
				ID_PERIODO: oEntry.ID_PERIODO,
				ID_PISTAVIEW: oEntry.ID_PISTAVIEW,
				ID_PISTE: oEntry.ID_PISTE
			});

		},
		handleModifica: function () {
			if (this.getView().byId("tblPiste").getSelectedItems().length === 1) {
				var vObject = this.getView().byId("tblPiste").getModel("pisteResultTableModel").getProperty(this.getView().byId("tblPiste").getSelectedItem()
					.getBindingContextPath());
				var oYears = this.oMainJsonYear.getProperty("/year");
				var oEntry = {
					ID_PERIODO: parseInt(this.selectedfiscalYearPeriodi),
					ID_PISTAVIEW: parseInt(vObject.ID_PISTAVIEW),
					ID_PISTE: parseInt(vObject.ID_PISTE),
				};
				var that = this;
				sap.ui.core.UIComponent.getRouterFor(that).navTo("modPista", {
					modPista: "modPista",
					ID_PERIODO: oEntry.ID_PERIODO,
					ID_PISTAVIEW: oEntry.ID_PISTAVIEW,
					ID_PISTE: oEntry.ID_PISTE,
					from: 'Piste'
					
				});
			} else {
				MessageBox.error("Operazione non consentita. Selezionare un unico item");
				return;
			}
		},

		handleCurve: function () {
			var e = sap.ui.core.UIComponent.getRouterFor(this);
			e.navTo("columnChartExample");
		},

		idLink: function (oEvent) {

			var text = 0;
			text = parseInt(oEvent.oSource.mProperties.text, 10) - 1;

			var data = PisteModel.getProperty("/pisteData");

			var newData = {};

			newData.Id_PistaView = data[text].Id_PistaView;
			newData.Descr_Pista = data[text].Descr_Pista;
			newData.Id_GruppoPista = data[text].Id_GruppoPista;
			newData.Pista_Vale_Dal = data[text].Pista_Vale_Dal;
			newData.Pista_Vale_Al = data[text].Pista_Vale_Al;
			newData.Pista_Vale_A1 = data[text].Pista_Vale_A1;
			newData.ID_Tipo_Curva = data[text].ID_Tipo_Curva;
			newData.ID_Gate = data[text].ID_Gate;
			newData.ID_Gate2 = data[text].ID_Gate2;
			newData.SN_Personalizzabile = data[text].SN_Personalizzabile;
			newData.descr_additivo = data[text].descr_additivo;
			newData.Cognome = data[text].Cognome;
			newData.N_Sottopiste = data[text].N_Sottopiste;
			newData.obiettivo_inferiore = data[text].obiettivo_inferiore;
			newData.obiettivo_superiore = data[text].obiettivo_superiore;
			newData.Obiettivo = data[text].Obiettivo;
			newData.Consuntivo = data[text].Consuntivo;
			newData.Perc_Ragg_Obiettivo = data[text].Perc_Ragg_Obiettivo;
			newData.Perc_Ragg_MBO = data[text].Perc_Ragg_MBO;

			var newModel = new i(newData);
			this.getView().setModel(newModel, "newModel");

			var oButton = oEvent.getSource();
			if (!this._oPopover) {

				Fragment.load({
					id: "View",
					name: "stipAdmin.stipAdmin.fragment.displayPiste",
					controller: this
				}).then(function (oPopover) {
					this._oPopover = oPopover;
					this.getView().addDependent(this._oPopover);
					this._oPopover.openBy(oButton);
				}.bind(this));
			} else {
				this._oPopover.openBy(oButton);
			}
			newData = {};
			text = "";
		},
		cancel: function (oEvent) {
			if (this._oPopover) {
				//           this._oPopover.close();
				this._oPopover.destroy();
				this._oPopover = undefined;
			}

		},

		onSearch: function (top, skip, fromExcel) {
			var executionFlag = false; // this will help to know if there is any filter applied 
			var oEntry = {
				ID_PERIODO: this.selectedfiscalYearPeriodi,
				ID_PISTAVIEW: "",
				DESCR_PISTA: "",
				PISTA: "",
				ID_GRUPPOPISTA: "",
				DESCR_GRUPPOPISTA: "",
				PISTA_VALE_DALFROM: "",
				PISTA_VALE_DALTO: "",
				PISTA_VALE_ALFROM: "",
				PISTA_VALE_ALTO: "",
				ID_CURVA: "",
				DESCR_CURVA: "",
				Pers: "",
				Tipo: "",
				FULLNAME: "",
				NOME: "",
				COGNOME: ""
			};
			if (this.getView().byId("inpPistaview").getValue() && this.getView().byId("inpPistaview").getValue().trim() !== "") {
				oEntry.ID_PISTAVIEW = this.getView().byId("inpPistaview").getValue();
				executionFlag = true;
			} else {
				oEntry.ID_PISTAVIEW = "";
			}
			if (this.getView().byId("inpDescrizione").getValue() && this.getView().byId("inpDescrizione").getValue().trim() !== "") {
				oEntry.DESCR_PISTA = this.getView().byId("inpDescrizione").getValue();
				executionFlag = true;
			} else {
				oEntry.DESCR_PISTA = "";
			}
			if (this.getView().byId("box1").getSelectedItem()) {
				oEntry.PISTA = this.getView().byId("box1").getSelectedKey();
				executionFlag = true;
			} else {
				oEntry.PISTA = "";
			}
			if (this.getView().byId("inpGruppoAppartenenza").getValue() && this.getView().byId("inpGruppoAppartenenza").getValue().trim() !==
				"") {
				if (this.oGruppoAppartenenza) {
					oEntry.ID_GRUPPOPISTA = this.oGruppoAppartenenza.ID_GRUPPOPISTA;
					oEntry.DESCR_GRUPPOPISTA = this.oGruppoAppartenenza.DESCR_GRUPPOPISTA;
				}
				executionFlag = true;
			} else {
				oEntry.ID_GRUPPOPISTA = "";
				oEntry.DESCR_GRUPPOPISTA = "";
			}
			if (this.getView().byId("picker0").getValue() && this.getView().byId("picker0").getValue().trim() !== "") {
				executionFlag = true;
				oEntry.PISTA_VALE_DALFROM = this.getView().byId("picker0").getValue() + "-" + "01" + " " + "00:00:00";
				oEntry.PISTA_VALE_DALTO = this.getView().byId("picker0").getValue() + "-" + "01" + " " + "23:59:59";

			} else {

				oEntry.PISTA_VALE_DALFROM = "";
				oEntry.PISTA_VALE_DALTO = "";
			}
			if (this.getView().byId("picker1").getValue() && this.getView().byId("picker1").getValue().trim() !== "") {
				executionFlag = true;
				var datFrom = new Date(this.getView().byId("picker1").getValue());
				var fromYear = datFrom.getFullYear();
				var monthYear = datFrom.getMonth();
				var monthKey = datFrom.getMonth();
				var actualMonth = monthKey + 1;
				var lastDay = new Date(Math.floor(fromYear + (monthYear / 12)), ((actualMonth < 10) ? '0' + actualMonth : actualMonth), 0);
				oEntry.PISTA_VALE_ALFROM = this.getView().byId("picker1").getValue() + "-" + lastDay.getDate() + " " + "00:00:00";
				oEntry.PISTA_VALE_ALTO = this.getView().byId("picker1").getValue() + "-" + lastDay.getDate() + " " + "23:59:59";
				/*oEntry.PISTA_VALE_AL = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "yyyy-MM-dd HH:mm"
				}).format(new Date(this.getView().byId("picker1").getValue()));*/
			} else {
				oEntry.PISTA_VALE_ALFROM = "";
				oEntry.PISTA_VALE_ALTO = "";
			}
			if (this.getView().byId("inpPisteCurva").getValue() && this.getView().byId("inpPisteCurva").getValue().trim() !== "") {
				executionFlag = true;
				if (this.oIdpistaview) {
					oEntry.ID_CURVA = this.oIdpistaview.ID_CURVA;
					oEntry.DESCR_CURVA = this.oIdpistaview.DESCR_CURVA
				}

			} else {
				oEntry.ID_CURVA = "";
				oEntry.DESCR_CURVA = "";
			}
			if (this.getView().byId("box2").getSelectedItem()) {
				executionFlag = true;
				oEntry.Pers = this.getView().byId("box2").getSelectedKey();
			} else {
				oEntry.Pers = "";
			}

			if (this.getView().byId("box3").getSelectedItem()) {
				executionFlag = true;
				oEntry.Tipo = this.getView().byId("box3").getSelectedKey();
			} else {
				oEntry.Tipo = "";
			}

			if (this.getView().byId("inpIdentificativoAssegnatario").getValue() && this.getView().byId("inpIdentificativoAssegnatario").getValue()
				.trim() !== "") {
				oEntry.FULLNAME = this.getView().byId("inpIdentificativoAssegnatario").getValue();
				executionFlag = true;
			} else {
				oEntry.FULLNAME = "";
			}

			/*	if (this.getView().byId("inpIdentificativoAssegnatario").getValue() && this.getView().byId("inpIdentificativoAssegnatario").getValue()
					.trim() !== "") {
					executionFlag = true;
					if (this.oIdentificativoAssegnatario) {
						oEntry.MATRICOLA = this.oIdentificativoAssegnatario.MATRICOLA;
						oEntry.NOME = this.oIdentificativoAssegnatario.NOME;
						oEntry.COGNOME = this.oIdentificativoAssegnatario.COGNOME;
					}

				} else {
					oEntry.MATRICOLA = "";
					oEntry.NOME = "";
					oEntry.COGNOME = "";
				}*/
			//////////////////// sending all the filter in a body as it may be possible to have more filter which may exceed the size of the URL
			/////////////////// as per microsoft total length of the url is 2,083 characters this is the reason i am sending all the filter in payload

			//	https: //italybfmyao56da.hana.ondemand.com/STIP/STIPAdmin/services/GetPisteHomePage.xsjs
			this.busyDialog = new sap.m.BusyDialog();
			this.busyDialog.open();

			/*	var url = "/HANAMDC/STIP/STIPAdmin/services/GetPisteHomePage.xsjs";
			$.ajax({
				url: that.sServiceUrl + "/",
				type: "GET",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("X-CSRF-Token", "Fetch"); //Passing CSRF token fetch request in header of GET 
				},
				success: function (data, textStatus, XMLHttpRequest) {
					var token = XMLHttpRequest.getResponseHeader("X-CSRF-Token");
					$.ajax({
						url: url,
						type: "POST",
						contentType: "application/json",
						data: JSON.stringify(oEntry),
						//dataType: 'jsonp',
						beforeSend: function (xhr) {
							xhr.setRequestHeader("X-CSRF-Token", token);
						},
						success: function (data1, textStatus1, XMLHttpRequest1) {
 
							var oIdJson1 = new sap.ui.model.json.JSONModel();
							oIdJson1.setSizeLimit(9999999999);
							oIdJson1.setData(data1);
							that.oMainJsonModelExport.setData(data1);
							that.getView().setModel(oIdJson1, "pisteResultTableModel");
							that.oMainJsonModel.updateBindings(true);
							if (data1.length > 0) {
								var oResource = that.getView().getModel("i18n").getResourceBundle();
								that.getView().byId("idTxtResult").setText(oResource.getText("Results", data1.length));
							} else {
								that.getView().byId("idTxtResult").setText("");
							}

							//sap.ui.getCore().setModel(oIdJson1, "pisteResultTableModel");
							oEntry = {};
							that.busyDialog.close();
						},
						error: function (data1, textStatus1, XMLHttpRequest1) {
							that.busyDialog.close();
							MessageBox.error("Error while getting all the Piste for this period. Please contact administrator.");
						}
					});
				}
			});*/
			// adding code to call xsodata and removing code for xsjs

			var sPath;
			this.aFilters = [];
			this.aFilters.push(new Filter("ID_PERIODO", FilterOperator.EQ, parseInt(oEntry.ID_PERIODO)));
			sPath = "/V_Piste?$format=json";
			if (oEntry.ID_PISTAVIEW) {
				this.aFilters.push(new Filter("ID_PISTAVIEW", FilterOperator.EQ, parseInt(oEntry.ID_PISTAVIEW)));
			}
			if (oEntry.DESCR_PISTA) {

				this.aFilters.push(new Filter({
					path: 'DESCR_PISTA',
					operator: FilterOperator.Contains,
					value1: oEntry.DESCR_PISTA,
					caseSensitive: false
				}));
				//	this.aFilters.push(new Filter("DESCR_PISTA", FilterOperator.Contains, oEntry.DESCR_PISTA));	
			}
			if (oEntry.ID_GRUPPOPISTA) {
				this.aFilters.push(new Filter("ID_GRUPPOPISTA", FilterOperator.EQ, parseInt(oEntry.ID_GRUPPOPISTA)));
			}
			if (oEntry.ID_CURVA) {
				this.aFilters.push(new Filter("ID_CURVA", FilterOperator.EQ, parseInt(oEntry.ID_CURVA)));
			}
			if (oEntry.Pers) {
				this.aFilters.push(new Filter("SN_PERSONALIZZABILE", FilterOperator.EQ, oEntry.Pers));
			}
			if (oEntry.Tipo) {
				this.aFilters.push(new Filter("TIPO_PISTA", FilterOperator.EQ, oEntry.Tipo));
			}
			if (oEntry.FULLNAME) {

				this.aFilters.push(new Filter({
					path: 'FULLNAME',
					operator: FilterOperator.Contains,
					value1: oEntry.FULLNAME,
					caseSensitive: false
				}));
				//	this.aFilters.push(new Filter("DESCR_PISTA", FilterOperator.Contains, oEntry.DESCR_PISTA));	

				//	this.aFilters.push(new Filter("MATRICOLA", FilterOperator.EQ, oEntry.MATRICOLA));
			}
			if (oEntry.PISTA_VALE_DALFROM) {
				this.aFilters.push(new Filter("PISTA_VALE_DAL", FilterOperator.BT, oEntry.PISTA_VALE_DALFROM, oEntry.PISTA_VALE_DALTO));
			}
			if (oEntry.PISTA_VALE_ALFROM) {
				this.aFilters.push(new Filter("PISTA_VALE_AL", FilterOperator.BT, oEntry.PISTA_VALE_ALFROM, oEntry.PISTA_VALE_ALTO));
			}
			if (oEntry.PISTA === "Key2") {
				sPath = "/V_PisteConGateHeader?$format=json";
			} else if (oEntry.PISTA === "Key3") {
				sPath = "/V_PisteConGatePersonaleHeader?$format=json";

			} else if (oEntry.PISTA === "Key4") {
				sPath = "/V_PisteConGatenonValorizzatoHeader?$format=json";

			} else if (oEntry.PISTA === "Key5") {
				sPath = "/V_Piste?$format=json";
				this.aFilters.push(new Filter("N_SOTTOPISTE", FilterOperator.GT, 1));

			} else if (oEntry.PISTA === "Key6") {
				sPath = "/V_Piste?$format=json";
				this.aFilters.push(new Filter("PERC_RAGG_MBO", FilterOperator.GT, 0));
			} else if (oEntry.PISTA === "Key7") {
				var orFilter = [];
				sPath = "/V_Piste?$format=json";
				orFilter.push(new Filter("PERC_RAGG_MBO", FilterOperator.EQ, null));
				orFilter.push(new Filter("PERC_RAGG_MBO", FilterOperator.EQ, 0));
				this.aFilters.push(new Filter(orFilter, false));

			} else if (oEntry.PISTA === "Key8") {
				sPath = "/V_PisteConCurvaDiscretaHeader?$format=json";
			} else {
				sPath = "/V_Piste?$format=json";
			}
			if (fromExcel !== undefined) {
				top = 99999;
				skip = 0;
			}

			var Order = SortProp.sPath + ' ' + SortProp.bDescending;

			var that = this;
			var mParameters = {
				urlParameters: {
					"$top": top,
					"$skip": skip,
					"$orderby": Order,
					"$inlinecount": 'allpages'
				},
				filters: that.aFilters,
				success: function (oDataIn, oResponse) {

					if (fromExcel === undefined) {

						var oIdJson1 = new sap.ui.model.json.JSONModel();
						oIdJson1.setSizeLimit(9999999999);
						oIdJson1.setData(oDataIn.results);
						that.oMainJsonModelExport.setData(oDataIn.results);
						that.getView().setModel(oIdJson1, "pisteResultTableModel");
						that.oMainJsonModel.updateBindings(true);
						var totalCount = oDataIn.__count;
						if (oDataIn.results.length > 0) {
							var oResource = that.getView().getModel("i18n").getResourceBundle();
							that.getView().byId("idTxtResult").setText(oResource.getText("Results", totalCount));
						} else {
							that.getView().byId("idTxtResult").setText("");
						}

						if (oDataIn.results.length >= 50) {
							that.byId("next").setEnabled(true);
						} else {
							that.byId("next").setEnabled(false);
						}

						if (that.count <= 0)
							that.byId("prev").setEnabled(false);
						else
							that.byId("prev").setEnabled(true);
					} else if (fromExcel === 'Excel') {
						var oIdJson1 = new sap.ui.model.json.JSONModel();
						oIdJson1.setSizeLimit(9999999999);
						oIdJson1.setData(oDataIn.results);
						that.oMainJsonModelExport.setData(oDataIn.results);
						that.onExport();
					} else {
						var oIdJson1 = new sap.ui.model.json.JSONModel();
						oIdJson1.setSizeLimit(9999999999);
						oIdJson1.setData(oDataIn.results);
						that.oMainJsonModelExport.setData(oDataIn.results);
						that.DownloadRisultati();
					}
					that.busyDialog.close();
				}.bind(this),
				error: function (oError) {
					that.busyDialog.close();
					MessageBox.error("Error while getting all the Piste for this period. Please contact administrator.");
				}
			};

			//var path = "/sPath?$format=json";
			this.oMainOdataModel.read(sPath, mParameters);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		},

		clear: function (oEvent) {
			if (this.getView().byId("inpPistaview").getValue()) {
				this.getView().byId("inpPistaview").setValue("");
			}
			if (this.getView().byId("inpDescrizione").getValue()) {
				this.getView().byId("inpDescrizione").setValue("");
			}
			if (this.getView().byId("box1").getSelectedItem()) {
				this.getView().byId("box1").setSelectedKey("");
			}
			if (this.getView().byId("inpGruppoAppartenenza").getValue()) {
				this.getView().byId("inpGruppoAppartenenza").setValue("");
			}
			if (this.getView().byId("picker0").getValue()) {

				this.getView().byId("picker0").setValue("");
			}
			if (this.getView().byId("picker1").getValue()) {
				this.getView().byId("picker1").setValue("");
			}
			if (this.getView().byId("inpPisteCurva").getValue()) {
				this.getView().byId("inpPisteCurva").setValue("");
			}
			if (this.getView().byId("box2").getSelectedItem()) {
				this.getView().byId("box2").setSelectedKey("");
			}
			if (this.getView().byId("box3").getSelectedItem()) {
				this.getView().byId("box3").setSelectedKey("");
			}
			if (this.getView().byId("inpIdentificativoAssegnatario").getValue()) {

				this.getView().byId("inpIdentificativoAssegnatario").setValue("");
			}
		},
		onDataExport: function (oEvent) {

			this.onSearch(0, 0, 'Excel');
		},
		onExport: function (oEvent) {

			oResource = this.getView().getModel("i18n").getResourceBundle();

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
				models: this.oMainJsonModelExport,
				// binding information for the rows aggregation
				rows: {
					path: "/"
				},

				// column definitions with column name and binding info for the content

				columns: [{
						name: oResource.getText("Id"),
						template: {
							content: "{ID_PISTAVIEW}"
						}
					}, {
						name: oResource.getText("Desc"),
						template: {
							content: "{DESCR_PISTA}"
						}
					}, {
						name: oResource.getText("Gruppo"),
						template: {
							content: "{DESCR_GRUPPOPISTA}"
						}
					}, {
						name: oResource.getText("Mese_Inizio"),
						template: {
							content: "{path: 'PISTA_VALE_DAL', formatter: 'stipAdmin.stipAdmin.util.Formatter.formatDate2'}"
						}
					}, {
						name: oResource.getText("Mese_Fine"),
						template: {
							content: "{path: 'PISTA_VALE_AL', formatter: 'stipAdmin.stipAdmin.util.Formatter.formatDate2'}"
						}
					}, {
						name: oResource.getText("Tipo"),
						template: {
							content: "{TIPO_PISTA}"
						}
					}, {
						name: oResource.getText("Curva"),
						template: {
							content: "{DESCR_CURVA}"
						}
					}, {
						name: oResource.getText("Gate3"),
						template: {
							content: "{DESCR_GATE}"
						}
					}, {
						name: oResource.getText("Gate4"),
						template: {
							content: "{DESCR_GATE2}"
						}
					}, {
						name: oResource.getText("nPers"),
						template: {
							content: "{SN_PERSONALIZZABILE}"
						}
					},
					/*{
						name: oResource.getText("Additivo"),
						template: {
							content: "{ID_ADDITIVO}"
						}
					},*/
					{
						name: oResource.getText("Inizio_Assegn"),
						template: {
							content: "{path: 'PISTA_VALE_DAL', formatter: 'stipAdmin.stipAdmin.util.Formatter.formatDate2'}"
						}
					}, {
						name: oResource.getText("Fine_Assegn"),
						template: {
							content: "{path: 'PISTA_VALE_AL', formatter: 'stipAdmin.stipAdmin.util.Formatter.formatDate2'}"
						}
					}, {
						name: oResource.getText("Identificativo_Assegnatario1"),
						template: {
							content: "{FULLNAME}"
						}
					},
					// {
					// 	name: oResource.getText("Count1"),
					// 	template: {
					// 		content: "{Count}"
					// 	}
					// },
					/*{
						name: oResource.getText("Min"),
						template: {
							content: "{OBIETTIVO_INFERIORE}"
						}
					}, {
						name: oResource.getText("Max"),
						template: {
							content: "{OBIETTIVO_SUPERIORE}"
						}
					}, */
					{
						name: oResource.getText("Target"),
						template: {
							content: "{parts :[{path: 'ID_CURVA'},{path: 'OBIETTIVO'},{path: 'OBIETTIVO_GRADINO'}], formatter: 'stipAdmin.stipAdmin.util.Formatter.getTarget'}"
						}
					}, {
						name: oResource.getText("Consunt"),
						template: {
							content: "{parts :[{path: 'ID_PISTE'},{path: 'CONSUNTIVO'},{path: 'CONSUNTIVO_GRADINO'}], formatter: 'stipAdmin.stipAdmin.util.Formatter.getConsunt'}"
						}
					}, {
						name: oResource.getText("Ragg_Obiett"),
						template: {
							content: "{PERC_RAGG_OBIETTIVO}"
						}
					}, {
						name: oResource.getText("Ragg_Stip"),
						template: {
							content: "{PERC_RAGG_MBO}"
						}
					}
				]
			});

			// download exported file
			oExport.saveFile("KPI").catch(function (oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function () {
				oExport.destroy();
			});
		},
		handleDownloadRisultati: function (oEvent) {
			this.onSearch(0, 0, 'DownloadRisultati');
		},
		DownloadRisultati: function (oEvent) {
			oResource = this.getView().getModel("i18n").getResourceBundle();

			var oModel = this.oMainJsonModelExport.getData(); //this.getView().getModel('pisteResultTableModel').getData();
			var PistePCOArray = [];
			// While doing download getting column mismatch issue so trying to make an arry only for those field which are getting used in excel
			for (var i = 0; i < oModel.length; i++) {
				var oEntry = {};
				if (oModel[i].SN_PERSONALIZZABILE === "N") {
					oEntry.ID_PISTE = oModel[i].ID_PISTAVIEW;
					oEntry.ID_PERIODO = oModel[i].ID_PERIODO;
					oEntry.DESCR_PISTA = ((!oModel[i].DESCR_PISTA) ? '' : oModel[i].DESCR_PISTA);
					oEntry.ID_GRUPPOPISTA = oModel[i].ID_GRUPPOPISTA;
					oEntry.OBIETTIVO = ((!oModel[i].OBIETTIVO) ? '' : oModel[i].OBIETTIVO);
					oEntry.CONSUNTIVO = ((!oModel[i].CONSUNTIVO) ? '' : oModel[i].CONSUNTIVO);
					oEntry.SN_CONSUNTIVO_PERC = ((!oModel[i].SN_CONSUNTIVO_PERC) ? '' : oModel[i].SN_CONSUNTIVO_PERC);
					if (oEntry.SN_CONSUNTIVO_PERC === 'N')
						oEntry.SN_CONSUNTIVO_PERC = '€';
					if (oEntry.SN_CONSUNTIVO_PERC === 'N')
						oEntry.SN_CONSUNTIVO_PERC = '%';
					// oEntry.SN_OBIETTIVO_PERC = ((!oModel[i].SN_OBIETTIVO_PERC) ? '' : oModel[i].SN_OBIETTIVO_PERC);
					oEntry.OBIETTIVO_SIM = ((!oModel[i].OBIETTIVO_SIM) ? '' : oModel[i].OBIETTIVO_SIM);
					oEntry.CONSUNTIVO_SIM = ((!oModel[i].CONSUNTIVO_SIM) ? '' : oModel[i].CONSUNTIVO_SIM);
					oEntry.PISTA_VALE_DAL = ((!oModel[i].PISTA_VALE_DAL) ? '' : Formatter.formatDate2(oModel[i].PISTA_VALE_DAL));
					oEntry.PISTA_VALE_AL = ((!oModel[i].PISTA_VALE_AL) ? '' : Formatter.formatDate2(oModel[i].PISTA_VALE_AL));
					oEntry.TIPO_PISTA = ((!oModel[i].TIPO_PISTA) ? '' : oModel[i].TIPO_PISTA);
					oEntry.SN_PERSONALIZZABILE1 = ((!oModel[i].SN_PERSONALIZZABILE1) ? '' : oModel[i].SN_PERSONALIZZABILE1);
					oEntry.ID_GATE = ((!oModel[i].ID_GATE) ? '' : oModel[i].ID_GATE);
					oEntry.SN_PERSONALIZZABILE2 = ((!oModel[i].SN_PERSONALIZZABILE2) ? '' : oModel[i].SN_PERSONALIZZABILE2);
					oEntry.ID_GATE2 = ((!oModel[i].ID_GATE2) ? '' : oModel[i].ID_GATE2);
					oEntry.N_SOTTOPISTE = ((!oModel[i].N_SOTTOPISTE) ? '' : oModel[i].N_SOTTOPISTE);
					oEntry.ID_CURVA = ((!oModel[i].ID_CURVA) ? '' : oModel[i].ID_CURVA);
					oEntry.PERC_RAGG_OBIETTIVO = ((!oModel[i].PERC_RAGG_OBIETTIVO) ? '' : oModel[i].PERC_RAGG_OBIETTIVO);
					oEntry.PERC_RAGG_MBO = ((!oModel[i].PERC_RAGG_MBO) ? '' : oModel[i].PERC_RAGG_MBO);
					oEntry.PERC_RAGG_OBIETTIVO_SIM = ((!oModel[i].PERC_RAGG_OBIETTIVO_SIM) ? '' : oModel[i].PERC_RAGG_OBIETTIVO_SIM);
					oEntry.PERC_RAGG_MBO_SIM = ((!oModel[i].PERC_RAGG_MBO_SIM) ? '' : oModel[i].PERC_RAGG_MBO_SIM);
					oEntry.SN_PERSONALIZZABILE = ((!oModel[i].SN_PERSONALIZZABILE) ? '' : oModel[i].SN_PERSONALIZZABILE);
					oEntry.FULLNAME = ((!oModel[i].FULLNAME) ? '' : oModel[i].FULLNAME);

					if (oModel[i].NOTE === undefined || oModel[i].NOTE === null || oModel[i].NOTE === 'NULL') {
						oEntry.NOTE = '';
					} else {
						oEntry.NOTE = oModel[i].NOTE;
					}
					if (oModel[i].NOTE_OBIETTIVO === undefined || oModel[i].NOTE_OBIETTIVO === null || oModel[i].NOTE_OBIETTIVO === 'NULL') {
						oEntry.NOTE_OBIETTIVO = '';
					} else {
						oEntry.NOTE_OBIETTIVO = oModel[i].NOTE_OBIETTIVO;
					}
					if (oModel[i].NOTE_CONSUNTIVO === undefined || oModel[i].NOTE_CONSUNTIVO === null || oModel[i].NOTE_CONSUNTIVO === 'NULL') {
						oEntry.NOTE_CONSUNTIVO = '';
					} else {
						oEntry.NOTE_CONSUNTIVO = oModel[i].NOTE_CONSUNTIVO;
					}
					// oEntry.NOTE = ((!oModel[i].NOTE) ? '' : oModel[i].NOTE);
					// oEntry.NOTE_OBIETTIVO = ((!oModel[i].NOTE_OBIETTIVO) ? '' : oModel[i].NOTE_OBIETTIVO);
					// oEntry.NOTE_CONSUNTIVO = ((!oModel[i].NOTE_CONSUNTIVO) ? '' : oModel[i].NOTE_CONSUNTIVO);

					PistePCOArray.push(oEntry);
					oEntry = {};
				}

			}
			/*var oPisteModel = oModel.filter(function (vModel) {
				return (vModel.SN_PERSONALIZZABILE === "N");
			});*/

			var oModel1 = this.getView().getModel('CurvaModelDownload').getData();
			var CurvaePCOArray = [];
			for (var i = 0; i < oModel1.length; i++) {
				var oEntry = {};
				oEntry.ID_CURVA = ((!oModel1[i].ID_CURVA) ? '' : oModel1[i].ID_CURVA);
				oEntry.DESCR_CURVA = (!(oModel1[i].DESCR_CURVA) ? '' : oModel1[i].DESCR_CURVA);
				oEntry.PERC_MBO = ((!oModel1[i].PERC_MBO) ? '' : oModel1[i].PERC_MBO);
				oEntry.PERSTIP = ((!oModel1[i].PERSTIP) ? '' : oModel1[i].PERSTIP);
				CurvaePCOArray.push(oEntry);
				oEntry = {};

			}

			var columnTemplate1 = [
				[{
						column: 'ID_PISTE',
						label: oResource.getText("Id")
					}, {
						column: 'ID_PERIODO',
						label: oResource.getText("Periodo")
					}, {
						column: 'DESCR_PISTA',
						label: oResource.getText("Descrizione")
					}, {
						column: 'ID_GRUPPOPISTA',
						label: oResource.getText("Gruppo")
					}, {
						column: 'OBIETTIVO',
						label: oResource.getText("Obiettivo")
					}, {
						column: 'CONSUNTIVO',
						label: oResource.getText("Consuntivo")
					}, {
						column: 'SN_CONSUNTIVO_PERC',
						label: oResource.getText("UnitadiMisura")
					},
					// {
					// 	column: 'SN_CONSUNTIVO_PERC',
					// 	label: oResource.getText("SN_CONSUNTIVO_PERC")
					// }, 
					// {
					// 	column: 'SN_OBIETTIVO_PERC',
					// 	label: oResource.getText("UnitadiMisura")
					// }, 
					{
						column: 'OBIETTIVO_SIM',
						label: oResource.getText("ObiettivoSIM")
					}, {
						column: 'CONSUNTIVO_SIM',
						label: oResource.getText("ConsuntivoSIM")
					}, {
						column: 'PISTA_VALE_DAL',
						label: oResource.getText("Dal")
					}, {
						column: 'PISTA_VALE_AL',
						label: oResource.getText("Al")
					}, {
						column: 'TIPO_PISTA',
						label: oResource.getText("Tipo")
					}, {
						column: 'SN_PERSONALIZZABILE1',
						label: oResource.getText("Gate1Pers")
					}, {
						column: 'ID_GATE',
						label: oResource.getText("Gate1")
					}, {
						column: 'SN_PERSONALIZZABILE2',
						label: oResource.getText("Gate2Pers")
					}, {
						column: 'ID_GATE2',
						label: oResource.getText("Gate2")
					},
					// {
					// 	column: 'N_SOTTOPISTE',
					// 	label: oResource.getText("Nsottopiste")
					// }, 
					{
						column: 'ID_CURVA',
						label: oResource.getText("Curva")
					}, {
						column: 'PERC_RAGG_OBIETTIVO',
						label: oResource.getText("PercRaggObiettivo")
					}, {
						column: 'PERC_RAGG_MBO',
						label: oResource.getText("PercRaggMbo")
					}, {
						column: 'PERC_RAGG_OBIETTIVO_SIM',
						label: oResource.getText("PercRaggObiettivoSIM")
					}, {
						column: 'PERC_RAGG_MBO_SIM',
						label: oResource.getText("PercRaggMboSIM")
					},
					// {
					// 	column: 'SN_PERSONALIZZABILE',
					// 	label: oResource.getText("Pers")
					// },
					{
						column: 'FULLNAME',
						label: oResource.getText("Assegnatario")
					}, {
						column: 'NOTE',
						label: oResource.getText("NotaScheda")
					}, {
						column: 'NOTE_OBIETTIVO',
						label: oResource.getText("NotaObiettivo")
					}, {
						column: 'NOTE_CONSUNTIVO',
						label: oResource.getText("NotaConsuntivo")
					}

				],
				[{
					column: 'ID_CURVA',
					label: oResource.getText("IdCurva")
				}, {
					column: 'DESCR_CURVA',
					label: oResource.getText("DescCurva")
				}, {
					column: 'PERC_MBO',
					label: oResource.getText("perc_MBO")
				}, {
					column: 'PERSTIP',
					label: oResource.getText("perStip")
				}]
			];

			var excelData = {
				KPI: PistePCOArray,
				Curva: CurvaePCOArray
			};
			debugger
			tablesToExcel(excelData, ['KPI', 'Curva'], columnTemplate1, 'KPI.xls', 'Excel');

		},
		handleUploadRisultati: function (oEvent) {
			this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.UploadPiste", this);
			this.getView().addDependent(this._oValueHelpDialog);
			this.getView().setModel(this.oEmployeeModel);
			this._oValueHelpDialog.open();

		},
		onCloseFileUpload: function (oEvent) {

			this._oValueHelpDialog.destroy();

		},

		/******************** onUpload,_import methods fetches excel sheet data in JSON format ********************************************/
		onUpload: function (e) {
			if (sap.ui.getCore().byId("selTypeofUpload").getSelectedKey() !== "") {
				this._import(e.getParameter("files") && e.getParameter("files")[0]);
			} else {
				MessageBox.error(oResource.getText("uploadTypeError"));
				return;
			}
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
					if (workbook.SheetNames.length > 0) {
						workbook.SheetNames.forEach(function (sheetName) {
							if (sheetName === "KPI") {
								// Here is your object for every sheet in workbook
								excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
								if (excelData.length > 0) {

									that.getView().getModel("uploadModel").setData(excelData);
									that.getView().getModel("uploadModel").refresh(true);
									//that.uploadRisultati();
								}
							}
						});
					}
				}
			};
			reader.onerror = function (ex) {
				console.log(ex);
			};
			reader.readAsBinaryString(file);
		},
		// this method will perform check, calculate and then upload
		handleUploadPress: function (oEvent) {
			var that = this;
			var rows = [];
			var selSimulato = false;
			var oMainModel1 = new sap.ui.model.json.JSONModel();
			rows = this.getView().getModel("uploadModel").getData();
			var selectedRow = sap.ui.getCore().byId("selTypeofUpload").getSelectedKey();
			var calculationFlag = true;
			var calculationFlagSim = true;
			var countErrRows = 0;
			var payloadArray = [];
			var flagDownload = false;
			for (var i = 0; i < rows.length; i++) {
				// check for a.	Upload Obiettivo column in excel and raise error message
				if (selectedRow === "1") {

					if (rows[i].Obiettivo === "" || rows[i].Obiettivo === undefined || rows[i].Obiettivo === "null") {

						MessageBox.error(oResource.getText("uploadError1"));
						return;
					}
				}
				if (selectedRow === "2") {

					if (rows[i].Obiettivo_SIM === "" || rows[i].Obiettivo_SIM === undefined || rows[i].Obiettivo_SIM === "null") {

						MessageBox.error(oResource.getText("uploadError2"));
						return;
					}
				}
				if (selectedRow === "3") {

					if (rows[i].Consuntivo === "" || rows[i].Consuntivo === undefined || rows[i].Consuntivo === "null") {

						MessageBox.error(oResource.getText("uploadError3"));
						return;
					}
				}
				if (selectedRow === "4") {

					if (rows[i].Consuntivo_SIM === "" || rows[i].Consuntivo_SIM === undefined || rows[i].Consuntivo_SIM === "null") {

						MessageBox.error(oResource.getText("uploadError4"));
						return;
					}
				}
				if (rows[i].Unita_di_Misura === "" || rows[i].Unita_di_Misura === undefined || rows[i].Unita_di_Misura === "null") {
					MessageBox.error(oResource.getText("uploadError5"));
					return;
				}
				if (rows[i].Id === "" || rows[i].Id === undefined || rows[i].Id === "null") {
					MessageBox.error(oResource.getText("uploadError6"));
					return;
				}
				if (rows[i].Periodo === "" || rows[i].Periodo === undefined || rows[i].Periodo === "null") {
					MessageBox.error(oResource.getText("uploadError7"));
					return;
				}
				// check for key field for calculation if anyone of them in empty calculation should be avoided
				if (selectedRow === "1" || selectedRow === "3") {
					if (rows[i].Obiettivo === "" || rows[i].Obiettivo === undefined || rows[i].Obiettivo === "null") {
						calculationFlag = false;

					}
					if (rows[i].Consuntivo === "" || rows[i].Consuntivo === undefined || rows[i].Consuntivo === "null") {
						calculationFlag = false;

					}
					if (rows[i].Curva === "" || rows[i].Curva === undefined || rows[i].Curva === "null") {
						calculationFlag = false;

					}
				} else {
					calculationFlag = false;
				}
				if (selectedRow === "2" || selectedRow === "4") {
					if (rows[i].Obiettivo_SIM === "" || rows[i].Obiettivo_SIM === undefined || rows[i].Obiettivo_SIM === "null") {
						calculationFlagSim = false;

					}
					if (rows[i].Consuntivo_SIM === "" || rows[i].Consuntivo_SIM === undefined || rows[i].Consuntivo_SIM === "null") {
						calculationFlagSim = false;

					}
					if (rows[i].Curva === "" || rows[i].Curva === undefined || rows[i].Curva === "null") {
						calculationFlagSim = false;

					}
				} else {
					calculationFlagSim = false;
				}

				var curvaArray = this.getView().getModel("CurvaModel").getData();
				var curvaTyp = curvaArray.filter(function (oCurvaArray) {
					return (oCurvaArray.ID_CURVA === parseInt(rows[i].Curva));
				});
				var ID_TIPO_CURVA;
				if (curvaTyp.length > 0) {
					ID_TIPO_CURVA = curvaTyp[0].ID_TIPO_CURVA;
				} else {
					calculationFlag = false;
					calculationFlagSim = false;
				}
				var oEntryPiste = {};
				var oEntryPiste1 = {};
				var oEntryPiste2 = {};

				if (calculationFlag || calculationFlagSim) {

					var oMainModel = new sap.ui.model.json.JSONModel();
					sap.ui.getCore().setModel(oMainModel, "PercMboModel");
					sap.ui.getCore().getModel("PercMboModel").setProperty("/ID_TIPO_CURVA", ID_TIPO_CURVA);
					if (calculationFlag) {
						var oEntryForCalc = {
							ID_CURVA: parseInt(rows[i].Curva),
							Obiettivo: rows[i].Obiettivo,
							Consuntivo: rows[i].Consuntivo,
							ConsuntivoCurva2: rows[i].Consuntivo,
							ID_TIPO_CURVA: ID_TIPO_CURVA
						};
						oEntryPiste2 = sap.ui.controller("stipAdmin.stipAdmin.controller.modPista").calculate(oEntryForCalc, this.sServiceUrl, 1);
					}
					if (calculationFlagSim) {
						var oEntryForCalc = {
							ID_CURVA: parseInt(rows[i].Curva),
							ConsuntivoSimulatoCurva2: rows[i].Consuntivo_SIM,
							ObiettivoSimulato: rows[i].Obiettivo_SIM,
							ConsuntivoSimulato: rows[i].Consuntivo_SIM,
							ID_TIPO_CURVA: ID_TIPO_CURVA
						};
						oEntryPiste1 = sap.ui.controller("stipAdmin.stipAdmin.controller.modPista").calculate(oEntryForCalc, this.sServiceUrl, 2);
					}

					if (oEntryPiste2) {
						if (oEntryPiste2.OBIETTIVO) {
							oEntryPiste2.OBIETTIVO = oEntryPiste2.OBIETTIVO;
						} else {
							oEntryPiste2.OBIETTIVO = ((!rows[i].Obiettivo) ? '' : rows[i].Obiettivo);
						}
						if (oEntryPiste2.CONSUNTIVO) {
							oEntryPiste2.CONSUNTIVO = oEntryPiste2.CONSUNTIVO;
						} else {
							oEntryPiste2.CONSUNTIVO = ((!rows[i].Consuntivo) ? '' : rows[i].Consuntivo);
						}
						if (oEntryPiste2.PERC_RAGG_OBIETTIVO) {
							oEntryPiste2.PERC_RAGG_OBIETTIVO = oEntryPiste2.PERC_RAGG_OBIETTIVO;
						} else {
							oEntryPiste2.PERC_RAGG_OBIETTIVO = ((!rows[i].Perc_Ragg_Obiettivo) ? '' : rows[i].Perc_Ragg_Obiettivo);
						}
						if (oEntryPiste2.PERC_RAGG_MBO) {
							oEntryPiste2.PERC_RAGG_MBO = oEntryPiste2.PERC_RAGG_MBO;
						} else {
							oEntryPiste2.PERC_RAGG_MBO = ((!rows[i].Perc_Ragg_Mbo) ? '' : rows[i].Perc_Ragg_Mbo);
						}
					} else {
						oEntryPiste2.OBIETTIVO = ((!rows[i].Obiettivo) ? '' : rows[i].Obiettivo);
						oEntryPiste2.CONSUNTIVO = ((!rows[i].Consuntivo) ? '' : rows[i].Consuntivo);
						oEntryPiste2.PERC_RAGG_OBIETTIVO = ((!rows[i].Perc_Ragg_Obiettivo) ? '' : rows[i].Perc_Ragg_Obiettivo);
						oEntryPiste2.PERC_RAGG_MBO = ((!rows[i].Perc_Ragg_Mbo) ? '' : rows[i].Perc_Ragg_Mbo);
					}
					if (oEntryPiste1) {
						if (oEntryPiste1.OBIETTIVO_SIM) {
							oEntryPiste1.OBIETTIVO_SIM = oEntryPiste1.OBIETTIVO_SIM;
						} else {
							oEntryPiste1.OBIETTIVO_SIM = ((!rows[i].Obiettivo_SIM) ? '' : rows[i].Obiettivo_SIM);
						}
						if (oEntryPiste1.CONSUNTIVO_SIM) {
							oEntryPiste1.CONSUNTIVO_SIM = oEntryPiste1.CONSUNTIVO_SIM;
						} else {
							oEntryPiste1.CONSUNTIVO_SIM = ((!rows[i].Consuntivo_SIM) ? '' : rows[i].Consuntivo_SIM);
						}
						if (oEntryPiste1.PERC_RAGG_OBIETTIVO_SIM) {
							oEntryPiste1.PERC_RAGG_OBIETTIVO_SIM = oEntryPiste1.PERC_RAGG_OBIETTIVO_SIM;
						} else {
							oEntryPiste1.PERC_RAGG_OBIETTIVO_SIM = ((!rows[i].Perc_Ragg_Obiettivo_SIM) ? '' : rows[i].Perc_Ragg_Obiettivo_SIM);
						}
						if (oEntryPiste1.PERC_RAGG_MBO_SIM) {
							oEntryPiste1.PERC_RAGG_MBO_SIM = oEntryPiste1.PERC_RAGG_MBO_SIM;
						} else {
							oEntryPiste1.PERC_RAGG_MBO_SIM = ((!rows[i].Perc_Ragg_Mbo_SIM) ? '' : rows[i].Perc_Ragg_Mbo_SIM);
						}
					} else {
						oEntryPiste1.OBIETTIVO_SIM = ((!rows[i].Obiettivo_SIM) ? '' : rows[i].Obiettivo_SIM);
						oEntryPiste1.CONSUNTIVO_SIM = ((!rows[i].Consuntivo_SIM) ? '' : rows[i].Consuntivo_SIM);
						oEntryPiste1.PERC_RAGG_OBIETTIVO_SIM = ((!rows[i].Perc_Ragg_Obiettivo_SIM) ? '' : rows[i].Perc_Ragg_Obiettivo_SIM);
						oEntryPiste1.PERC_RAGG_MBO_SIM = ((!rows[i].Perc_Ragg_Mbo_SIM) ? '' : rows[i].Perc_Ragg_Mbo_SIM);
					}

					oEntryPiste.OBIETTIVO = oEntryPiste2.OBIETTIVO;
					oEntryPiste.CONSUNTIVO = oEntryPiste2.CONSUNTIVO;
					oEntryPiste.PERC_RAGG_OBIETTIVO = oEntryPiste2.PERC_RAGG_OBIETTIVO;
					oEntryPiste.PERC_RAGG_MBO = oEntryPiste2.PERC_RAGG_MBO;

					oEntryPiste.OBIETTIVO_SIM = oEntryPiste1.OBIETTIVO_SIM;
					oEntryPiste.CONSUNTIVO_SIM = oEntryPiste1.CONSUNTIVO_SIM;
					oEntryPiste.PERC_RAGG_OBIETTIVO_SIM = oEntryPiste1.PERC_RAGG_OBIETTIVO_SIM;
					oEntryPiste.PERC_RAGG_MBO_SIM = oEntryPiste1.PERC_RAGG_MBO_SIM;

					oEntryPiste.ID_CURVA = ((!rows[i].Curva) ? '' : rows[i].Curva);
					oEntryPiste.ID_PISTAVIEW = ((!rows[i].Id) ? '' : rows[i].Id);
					oEntryPiste.ID_PERIOD = ((!rows[i].Periodo) ? '' : rows[i].Periodo);
					// oEntryPiste.SN_CONSUNTIVO_PERC = ((!rows[i].Quantita) ? '' : rows[i].Quantita);
					oEntryPiste.SN_CONSUNTIVO_PERC = ((!rows[i].Unita_di_Misura) ? '' : rows[i].Unita_di_Misura);
					oEntryPiste.selectedRow = parseInt(selectedRow, 10);
					oEntryPiste.DESCR_PISTA = ((!rows[i].Descrizione) ? '' : rows[i].Descrizione);
					oEntryPiste.ID_GRUPPOPISTA = ((!rows[i].Gruppo) ? '' : rows[i].Gruppo);
					oEntryPiste.PISTA_VALE_DAL = ((!rows[i].Dal) ? '' : rows[i].Dal);
					oEntryPiste.PISTA_VALE_AL = ((!rows[i].Al) ? '' : rows[i].Al);
					oEntryPiste.TIPO_PISTA = ((!rows[i].Tipo) ? '' : rows[i].Tipo);
					oEntryPiste.SN_PERSONALIZZABILE1 = ((!rows[i].Gate1Pers) ? '' : rows[i].Gate1Pers);
					oEntryPiste.ID_GATE = ((!rows[i].Moltiplicatore_1) ? '' : rows[i].Moltiplicatore_1);
					oEntryPiste.SN_PERSONALIZZABILE2 = ((!rows[i].Gate2Pers) ? '' : rows[i].Gate2Pers);
					oEntryPiste.ID_GATE2 = ((!rows[i].Moltiplicatore_2) ? '' : rows[i].Moltiplicatore_2);
					oEntryPiste.N_SOTTOPISTE = ((!rows[i].N_sottopiste) ? '' : rows[i].N_sottopiste);
					oEntryPiste.SN_PERSONALIZZABILE = ((!rows[i].Pers) ? '' : rows[i].Pers);
					oEntryPiste.FULLNAME = ((!rows[i].Identificativo_Assegnatario) ? '' : rows[i].Identificativo_Assegnatario);
					oEntryPiste.NOTE = ((!rows[i].Nota_Scheda) ? '' : rows[i].Nota_Scheda);
					oEntryPiste.NOTE_OBIETTIVO = ((!rows[i].Nota_Obiettivo) ? '' : rows[i].Nota_Obiettivo);
					oEntryPiste.NOTE_CONSUNTIVO = ((!rows[i].Nota_Consuntivo) ? '' : rows[i].Nota_Consuntivo);

				} else {
					oEntryPiste.OBIETTIVO = ((!rows[i].Obiettivo) ? '' : rows[i].Obiettivo);
					oEntryPiste.CONSUNTIVO = ((!rows[i].Consuntivo) ? '' : rows[i].Consuntivo);
					oEntryPiste.PERC_RAGG_OBIETTIVO = ((!rows[i].Perc_Ragg_Obiettivo) ? '' : rows[i].Perc_Ragg_Obiettivo);
					oEntryPiste.PERC_RAGG_MBO = ((!rows[i].Perc_Ragg_Mbo) ? '' : rows[i].Perc_Ragg_Mbo);
					oEntryPiste.ID_CURVA = ((!rows[i].Curva) ? '' : rows[i].Curva);
					oEntryPiste.ID_PISTAVIEW = ((!rows[i].Id) ? '' : rows[i].Id);
					oEntryPiste.ID_PERIOD = ((!rows[i].Periodo) ? '' : rows[i].Periodo);
					// oEntryPiste.SN_CONSUNTIVO_PERC = ((!rows[i].Quantita) ? '' : rows[i].Quantita);
					oEntryPiste.SN_CONSUNTIVO_PERC = ((!rows[i].Unita_di_Misura) ? '' : rows[i].Unita_di_Misura);
					oEntryPiste.selectedRow = parseInt(selectedRow, 10);
					oEntryPiste.DESCR_PISTA = ((!rows[i].Descrizione) ? '' : rows[i].Descrizione);
					oEntryPiste.ID_GRUPPOPISTA = ((!rows[i].Gruppo) ? '' : rows[i].Gruppo);
					oEntryPiste.PISTA_VALE_DAL = ((!rows[i].Dal) ? '' : rows[i].Dal);
					oEntryPiste.PISTA_VALE_AL = ((!rows[i].Al) ? '' : rows[i].Al);
					oEntryPiste.TIPO_PISTA = ((!rows[i].Tipo) ? '' : rows[i].Tipo);
					oEntryPiste.SN_PERSONALIZZABILE1 = ((!rows[i].Gate1Pers) ? '' : rows[i].Gate1Pers);
					oEntryPiste.ID_GATE = ((!rows[i].Moltiplicatore_1) ? '' : rows[i].Moltiplicatore_1);
					oEntryPiste.SN_PERSONALIZZABILE2 = ((!rows[i].Gate2Pers) ? '' : rows[i].Gate2Pers);
					oEntryPiste.ID_GATE2 = ((!rows[i].Moltiplicatore_2) ? '' : rows[i].Moltiplicatore_2);
					oEntryPiste.N_SOTTOPISTE = ((!rows[i].N_sottopiste) ? '' : rows[i].N_sottopiste);

					oEntryPiste.OBIETTIVO_SIM = ((!rows[i].Obiettivo_SIM) ? '' : rows[i].Obiettivo_SIM);
					oEntryPiste.CONSUNTIVO_SIM = ((!rows[i].Consuntivo_SIM) ? '' : rows[i].Consuntivo_SIM);
					oEntryPiste.PERC_RAGG_OBIETTIVO_SIM = ((!rows[i].Perc_Ragg_Obiettivo_SIM) ? '' : rows[i].Perc_Ragg_Obiettivo_SIM);
					oEntryPiste.PERC_RAGG_MBO_SIM = ((!rows[i].Perc_Ragg_Mbo_SIM) ? '' : rows[i].Perc_Ragg_Mbo_SIM);
					oEntryPiste.SN_PERSONALIZZABILE = ((!rows[i].Pers) ? '' : rows[i].Pers);
					oEntryPiste.FULLNAME = ((!rows[i].Identificativo_Assegnatario) ? '' : rows[i].Identificativo_Assegnatario);
					oEntryPiste.NOTE = ((!rows[i].Nota_Scheda) ? '' : rows[i].Nota_Scheda);
					oEntryPiste.NOTE_OBIETTIVO = ((!rows[i].Nota_Obiettivo) ? '' : rows[i].Nota_Obiettivo);
					oEntryPiste.NOTE_CONSUNTIVO = ((!rows[i].Nota_Consuntivo) ? '' : rows[i].Nota_Consuntivo);

				}

				payloadArray.push(oEntryPiste);
			}

			///////////////////////////////////////////////////////

			var that = this;
			var url = "/HANAMDC/STIP/STIPAdmin/services/UploadPiste.xsjs";
			$.ajax({
				url: that.sServiceUrl + "/",
				type: "GET",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("X-CSRF-Token", "Fetch"); //Passing CSRF token fetch request in header of GET 
				},
				success: function (data, textStatus, XMLHttpRequest) {
					var token = XMLHttpRequest.getResponseHeader("X-CSRF-Token");
					$.ajax({
						url: url,
						type: "POST",
						contentType: "application/json",
						data: JSON.stringify(payloadArray),
						//dataType: 'jsonp',
						beforeSend: function (xhr) {
							xhr.setRequestHeader("X-CSRF-Token", token);
						},
						success: function (data, textStatus1) {

							//	var obj = JSON.parse(data);
							var obj = (data);
							oMainModel1.setData(obj);
							oMainModel1.setSizeLimit(9999999999);
							that.getView().setModel(oMainModel1, "excelDownloadModel");
							for (var i = 0; i < obj.length; i++) {
								if (obj[i].Error != undefined) {
									if (obj[i].Error.error === true) {
										countErrRows++;
										flagDownload = true;
									}
								}
							}
							if (flagDownload === false)
							//sucess pop up
								MessageBox.success("Caricamento di " + parseInt(obj.length) + " completato");
							if (flagDownload === true) {
								var oLink = new sap.m.Link({
									text: "Ci sono " + countErrRows + " in errore. Controllare il seguente file:",
									press: [that.handleLinkPress, that]
								});
								MessageBox.error(oLink);
							}

						},
						error: function (data1, textStatus1, XMLHttpRequest1) {
							MessageBox.error("Error in Upload");
						}
					});
				}
			});

			///////////////////////////////////////////////////////////////

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
						column: 'ID_PISTAVIEW',
						label: oResource.getText("Id")
					}, {
						column: 'ID_PERIODO',
						label: oResource.getText("Periodo")
					}, {
						column: 'DESCR_PISTA',
						label: oResource.getText("Descrizione")
					}, {
						column: 'ID_GRUPPOPISTA',
						label: oResource.getText("Gruppo")
					}, {
						column: 'OBIETTIVO',
						label: oResource.getText("Obiettivo")
					}, {
						column: 'CONSUNTIVO',
						label: oResource.getText("Consuntivo")
					}, {
						column: 'SN_CONSUNTIVO_PERC',
						label: oResource.getText("UnitadiMisura")
					},
					// {
					// 	column: 'SN_OBIETTIVO_PERC',
					// 	label: oResource.getText("UnitadiMisura")
					// }, 
					{
						column: 'OBIETTIVO_SIM',
						label: oResource.getText("ObiettivoSIM")
					}, {
						column: 'CONSUNTIVO_SIM',
						label: oResource.getText("ConsuntivoSIM")
					}, {
						column: 'PISTA_VALE_DAL',
						label: oResource.getText("Dal")
					}, {
						column: 'PISTA_VALE_AL',
						label: oResource.getText("Al")
					}, {
						column: 'TIPO_PISTA',
						label: oResource.getText("Tipo")
					}, {
						column: 'SN_PERSONALIZZABILE1',
						label: oResource.getText("Gate1Pers")
					}, {
						column: 'ID_GATE',
						label: oResource.getText("Gate1")
					}, {
						column: 'SN_PERSONALIZZABILE2',
						label: oResource.getText("Gate2Pers")
					}, {
						column: 'ID_GATE2',
						label: oResource.getText("Gate2")
					},
					// {
					// 	column: 'N_SOTTOPISTE',
					// 	label: oResource.getText("Nsottopiste")
					// }, 
					{
						column: 'ID_CURVA',
						label: oResource.getText("Curva")
					}, {
						column: 'PERC_RAGG_OBIETTIVO',
						label: oResource.getText("PercRaggObiettivo")
					}, {
						column: 'PERC_RAGG_MBO',
						label: oResource.getText("PercRaggMbo")
					}, {
						column: 'PERC_RAGG_OBIETTIVO_SIM',
						label: oResource.getText("PercRaggObiettivoSIM")
					}, {
						column: 'PERC_RAGG_MBO_SIM',
						label: oResource.getText("PercRaggMboSIM")
					},
					// {
					// 	column: 'SN_PERSONALIZZABILE',
					// 	label: oResource.getText("Pers")
					// },
					{
						column: 'FULLNAME',
						label: oResource.getText("Assegnatario")
					}, {
						column: 'NOTE',
						label: oResource.getText("NotaScheda")
					}, {
						column: 'NOTE_OBIETTIVO',
						label: oResource.getText("NotaObiettivo")
					}, {
						column: 'NOTE_CONSUNTIVO',
						label: oResource.getText("NotaConsuntivo")
					}

				]
			];
			var data = [];
			var oEntry = {};
			for (var i = 0; i < oModel.length; i++) {

				oEntry.Error = ((oModel[i].Error === undefined) ? "" : oModel[i].Error.message);
				oEntry.ID_PISTAVIEW = ((!oModel[i].ID_PISTAVIEW) ? '' : oModel[i].ID_PISTAVIEW);
				oEntry.ID_PERIODO = ((!oModel[i].ID_PERIOD) ? '' : oModel[i].ID_PERIOD);
				oEntry.DESCR_PISTA = ((!oModel[i].DESCR_PISTA) ? '' : oModel[i].DESCR_PISTA);
				oEntry.ID_GRUPPOPISTA = ((!oModel[i].ID_GRUPPOPISTA) ? '' : oModel[i].ID_GRUPPOPISTA); 
				oEntry.OBIETTIVO = ((!oModel[i].OBIETTIVO) ? '' : oModel[i].OBIETTIVO);
				oEntry.CONSUNTIVO = ((!oModel[i].CONSUNTIVO) ? '' : oModel[i].CONSUNTIVO);
				oEntry.SN_CONSUNTIVO_PERC = ((!oModel[i].SN_CONSUNTIVO_PERC) ? '' : oModel[i].SN_CONSUNTIVO_PERC);
				oEntry.OBIETTIVO_SIM = ((!oModel[i].OBIETTIVO_SIM) ? '' : oModel[i].OBIETTIVO_SIM);
				oEntry.CONSUNTIVO_SIM = ((!oModel[i].CONSUNTIVO_SIM) ? '' : oModel[i].CONSUNTIVO_SIM);
				oEntry.PISTA_VALE_DAL = ((!oModel[i].PISTA_VALE_DAL) ? '' : oModel[i].PISTA_VALE_DAL);
				oEntry.PISTA_VALE_AL = ((!oModel[i].PISTA_VALE_AL) ? '' : oModel[i].PISTA_VALE_AL);
				oEntry.TIPO_PISTA = ((!oModel[i].TIPO_PISTA) ? '' : oModel[i].TIPO_PISTA);
				oEntry.SN_PERSONALIZZABILE1 = ((!oModel[i].SN_PERSONALIZZABILE1) ? '' : oModel[i].SN_PERSONALIZZABILE1);
				oEntry.ID_GATE = ((!oModel[i].ID_GATE) ? '' : oModel[i].ID_GATE);
				oEntry.SN_PERSONALIZZABILE2 = ((!oModel[i].SN_PERSONALIZZABILE2) ? '' : oModel[i].SN_PERSONALIZZABILE2);
				oEntry.ID_GATE2 = ((!oModel[i].ID_GATE2) ? '' : oModel[i].ID_GATE2);
				oEntry.N_SOTTOPISTE = ((!oModel[i].N_SOTTOPISTE) ? '' : oModel[i].N_SOTTOPISTE);
				oEntry.ID_CURVA = ((!oModel[i].ID_CURVA) ? '' : oModel[i].ID_CURVA);
				oEntry.PERC_RAGG_OBIETTIVO = ((!oModel[i].PERC_RAGG_OBIETTIVO) ? '' : oModel[i].PERC_RAGG_OBIETTIVO);
				oEntry.PERC_RAGG_MBO = ((!oModel[i].PERC_RAGG_MBO) ? '' : oModel[i].PERC_RAGG_MBO);
				oEntry.PERC_RAGG_OBIETTIVO_SIM = ((!oModel[i].PERC_RAGG_OBIETTIVO_SIM) ? '' : oModel[i].PERC_RAGG_OBIETTIVO_SIM);
				oEntry.PERC_RAGG_MBO_SIM = ((!oModel[i].PERC_RAGG_MBO_SIM) ? '' : oModel[i].PERC_RAGG_MBO_SIM);
				oEntry.SN_PERSONALIZZABILE = ((!oModel[i].SN_PERSONALIZZABILE) ? '' : oModel[i].SN_PERSONALIZZABILE);
				oEntry.FULLNAME = ((!oModel[i].FULLNAME) ? '' : oModel[i].FULLNAME);
				oEntry.NOTE = ((!oModel[i].NOTE) ? '' : oModel[i].NOTE);
				oEntry.NOTE_OBIETTIVO = ((!oModel[i].NOTE_OBIETTIVO) ? '' : oModel[i].NOTE_OBIETTIVO);
				oEntry.NOTE_CONSUNTIVO = ((!oModel[i].NOTE_CONSUNTIVO) ? '' : oModel[i].NOTE_CONSUNTIVO);
				data.push(oEntry);
				oEntry = {};
			}
			var obj = {};
			obj.results = data;
			//	console.log(data);
			tablesToExcel(obj, ['KPI'], columnTemplate, 'KPI.xls', 'Excel');
		},
		onFIFiscalYear: function (oEvent) {
			this.selectedfiscalYearPeriodi = parseInt(oEvent.getSource().getSelectedKey());
		},
		handlePeriodiPrecedenti: function (oEvent) {

			var oResource = this.getView().getModel("i18n").getResourceBundle();

			if (oEvent.getSource().getPressed()) {
				this.getView().byId("FIFiscalYear").setVisible(true);
				this.getView().byId("btnNuovaKPI").setVisible(false);
				this.getView().byId("btnCopia").setVisible(false);
				this.getView().byId("btnNote").setVisible(false);
				this.getView().byId("btnModifica").setVisible(false);
				this.getView().byId("btnDelete").setVisible(false);
				this.getView().byId("btnDownloadRisultati").setVisible(false);
				this.getView().byId("btnUploadRisultati").setVisible(false);
				this.getView().byId("lblAggiungiSpace").setVisible(true);
				this.getView().byId("lblSpace1").setVisible(false);
				this.getView().byId("lblSpace2").setVisible(false);
				this.getView().byId("lblSpace3").setVisible(false);
				this.getView().byId("lblSpace4").setVisible(false);
				this.getView().byId("lblSpace5").setVisible(false);
				this.getView().byId("lblSpace6").setVisible(true);
				this.getView().byId("btnAggiungiCopia").setVisible(true);
				this.getView().byId("homeTitle").setText(oResource.getText("Aggiungidaperiodiprecedenti"));
				this.getView().byId("btnPeriodiPrecedenti").setText(oResource.getText("CANCEL"));
				this.Aggiungidaperiodiprecedenti = true;
				this.selectedfiscalYearPeriodi = parseInt(this.getView().byId("fy0").getSelectedKey());
				this.onSearch(50, 0);
			} else {
				this.getView().byId("FIFiscalYear").setVisible(false);
				this.getView().byId("btnNuovaKPI").setVisible(true);
				this.getView().byId("btnCopia").setVisible(true);
				this.getView().byId("btnNote").setVisible(true);
				this.getView().byId("btnModifica").setVisible(true);
				this.getView().byId("btnDelete").setVisible(true);
				this.getView().byId("btnDownloadRisultati").setVisible(true);
				this.getView().byId("btnUploadRisultati").setVisible(true);
				this.getView().byId("lblAggiungiSpace").setVisible(false);
				this.getView().byId("lblSpace1").setVisible(true);
				this.getView().byId("lblSpace2").setVisible(true);
				this.getView().byId("lblSpace3").setVisible(true);
				this.getView().byId("lblSpace4").setVisible(true);
				this.getView().byId("lblSpace5").setVisible(true);
				this.getView().byId("lblSpace6").setVisible(false);
				this.getView().byId("btnAggiungiCopia").setVisible(false);
				this.getView().byId("homeTitle").setText(oResource.getText("piste"));
				this.getView().byId("btnPeriodiPrecedenti").setText(oResource.getText("Aggiungidaperiodiprecedenti"));
				this.Aggiungidaperiodiprecedenti = false;
				this.selectedfiscalYearPeriodi = this.selectedfiscalYearPeriodiReassign;
				this.onSearch(50, 0);
			}

		},
		handleCopiaAggiungi: function (oEvent) {

			if (this.getView().byId("tblPiste").getSelectedItems().length === 1) {
				var vObject = this.getView().byId("tblPiste").getModel("pisteResultTableModel").getProperty(this.getView().byId("tblPiste").getSelectedItem()
					.getBindingContextPath());
				var oYears = this.oMainJsonYear.getProperty("/year");
				var oEntry = {
					ID_PERIODO: parseInt(this.selectedfiscalYearPeriodi),
					ID_PISTAVIEW: parseInt(vObject.ID_PISTAVIEW),
					ID_PISTE: parseInt(vObject.ID_PISTE),
					copy: 2, // 2 for CopiaAggiungi
					ID_PERIODOORIGNAL: parseInt(this.selectedfiscalYearPeriodiReassign),
				};
				var that = this;
				var url = "/HANAMDC/STIP/STIPAdmin/services/PisteCopy.xsjs";
				$.ajax({
					url: that.sServiceUrl + "/",
					type: "GET",
					beforeSend: function (xhr) {
						xhr.setRequestHeader("X-CSRF-Token", "Fetch"); //Passing CSRF token fetch request in header of GET 
					},
					success: function (data, textStatus, XMLHttpRequest) {
						var token = XMLHttpRequest.getResponseHeader("X-CSRF-Token");
						$.ajax({
							url: url,
							type: "POST",
							contentType: "application/json",
							data: JSON.stringify(oEntry),
							//dataType: 'jsonp',
							beforeSend: function (xhr) {
								xhr.setRequestHeader("X-CSRF-Token", token);
							},
							success: function (data1, textStatus1, XMLHttpRequest1) {

								MessageBox.success("PISTA : " + " " + data1.ID_PISTAVIEW + " got created for " + oYears, {
									title: "Success", // default
									onClose: function (sButton) {
										if (sButton === MessageBox.Action.OK) {

											that.onSearch(50, 0);
										}
									},
									actions: sap.m.MessageBox.Action.OK,
									emphasizedAction: sap.m.MessageBox.Action.OK
								});

							},
							error: function (data1, textStatus1, XMLHttpRequest1) {
								sap.ui.core.BusyIndicator.hide();
								MessageBox.error("Error while perfoming Copy operation. Please contact administrator.");
								jQuery.sap.log.getLogger().error("Copy operation failed" + textStatus1.toString());
							}
						});
					}
				});
			} else {
				sap.ui.core.BusyIndicator.hide();
				MessageBox.error("Selezionare una riga valida, personalizzabile = S non ammesse");
				return;
			}

		},
		handleNote: function (oEvent) {
			this.getView().byId("textNoteMassive").setValue("");
			this.byId("NoteMassive").open();
		},
		onCloseNote: function (oEvent) {
			this.byId("NoteMassive").close();
		},
		onSaveNote: function (oEvent) {
			sap.ui.core.BusyIndicator.show(1000);

			var table = this.getView().byId("tblPiste").getSelectedItems(),
				list = [];

			for (var i = 0; i < table.length; i++) {
				var line = table[i].getBindingContext("pisteResultTableModel").getObject();
				if (line.SN_PERSONALIZZABILE !== "S") {
					list.push({
						ID_PISTAVIEW: line.ID_PISTAVIEW,
						ID_PISTE: line.ID_PISTE
					});
				}
			}
			if (list.length > 0) {
				table = {
					ID_PERIODO: parseInt(this.selectedfiscalYearPeriodi),
					NOTE: this.getView().byId("textNoteMassive").getValue(),
					T_PISTE: list
				};

				// post operation
				var that = this;
				$.ajax({
					url: this.sServiceUrl + "/",
					type: "GET",
					beforeSend: function (xhr) {
						xhr.setRequestHeader("X-CSRF-Token", "Fetch");
					},
					success: function (data, textStatus, XMLHttpRequest) {
						var token = XMLHttpRequest.getResponseHeader('X-CSRF-Token');
						$.ajax({
							url: "/HANAMDC/STIP/STIPAdmin/services/ModifyNotePiste.xsjs",
							type: "POST",
							contentType: 'application/json',

							data: JSON.stringify(table),
							beforeSend: function (xhr) {
								xhr.setRequestHeader("X-CSRF-Token", token);
							},
							success: function (data1, textStatus1, XMLHttpRequest1) {
								sap.ui.core.BusyIndicator.hide();
								MessageBox.success("Note aggiornate con successo", {
									title: "Success", // default
									onClose: function (sButton) {
										if (sButton === MessageBox.Action.OK) {
											this.onSearchResult();
										}
									}.bind(this),
									actions: sap.m.MessageBox.Action.OK,
									emphasizedAction: sap.m.MessageBox.Action.OK
								});

							}.bind(this),
							error: function (data1, textStatus1, XMLHttpRequest1) {
								sap.ui.core.BusyIndicator.hide();
								MessageBox.error("Errore nel salvataggio delle note");
								jQuery.sap.log.getLogger().error("Salva note fallito" + textStatus1.toString());

							}
						});
					}.bind(this)
				});
			} else {
				sap.ui.core.BusyIndicator.hide();
				MessageBox.warning("Nessuna nota selezionata")
			}
			//salvare note call xsjs
			this.byId("NoteMassive").close();
		}
	});
});