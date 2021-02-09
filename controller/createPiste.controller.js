sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"stipAdmin/stipAdmin/util/Formatter"
], function (t, i, MessageBox, Formatter) {
	"use strict";
	var oResource;
	var PisteModel = new i();
	PisteModel.loadData("model/piste.json", false);
	var f = 0;
	return t.extend("stipAdmin.stipAdmin.controller.createPiste", {
		onInit: function () {

			this.getOwnerComponent().getRouter().getRoute("createPiste").attachPatternMatched(this._onObjectMatched, this);
			this.byId("SchedaLabel").addStyleClass("imp");

		},
		_onObjectMatched: function (oEvent) {
			oResource = this.getView().getModel("i18n").getResourceBundle();
			this.busyDialog = new sap.m.BusyDialog();
			this.getView().byId("tblEnalbeOnFirstRowPress").setVisible(false);
			this.sServiceUrl = this.getOwnerComponent().getModel().sServiceUrl;
			this.oMainOdataModel = new sap.ui.model.odata.v2.ODataModel(this.sServiceUrl);
			this.oHeaderMainModel = {
				tblEnalbeOnFirstRowPress: false,
				DESCR_PISTA: "",
				PISTA_VALE_DAL: "",
				PISTA_VALE_AL: "",
				ID_GRUPPOPISTA: "",
				SN_PERSONALIZZABILE: "",
				ID_GATE: "",
				ID_GATE2: "",
				ID_ADDITIVO: "",
				SOGLIA_ADDITIVO: "",
				Obiettivo_Complessivo: "",
				Consuntivo_Complessivo: "",
				ID_CURVA: "",
				ID_TIPOADDITIVO: ""
			};
			this._data = {
				sottopiste: [{
					PESO_PERC: "100",
					oTest1: false,
					percentage: true,
					percentageValue: "%",
					ID_CURVA: "",
					ID_GATE: "",
					DESCR_SOTTOPISTA: "",
					oButton1: true,
					oButton2: false,
					ID_TIPO_CURVA: ""
				}]
			};
			var oArguments = oEvent.getParameter("arguments");
			if (oArguments.str2 === "0") {
				this.clearFields();
			}
			this.jModel = new sap.ui.model.json.JSONModel();
			this.jModel.setData(this._data);
			this.getView().byId("idTableCreatePiste").setModel(this.jModel, "PisteModel");
			this.getView().setModel(this.jModel, "PisteModel");
			this.jModel1 = new sap.ui.model.json.JSONModel();
			this.jModel1.setData(this.oHeaderMainModel);
			this.getView().setModel(this.oHeaderMainModel, "oHeaderMainModel");
            
			this.selectedfiscalYearPeriodi = oArguments.str;
			this.getFiscalYear(this.selectedfiscalYearPeriodi);
			this.getGruppi();
			this.getGate();
			this.getAdditivo();
			this.getCurva();
		},
		handleDescGatePress3: function (oEvent) {
			/*	this.pistestopistecurvmodel = this.getView().getModel("CurvaModel").getObject(oEvent.getSource().getSelectedItem().oBindingContexts
					.CurvaModel.sPath);*/
			var data = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");
			var index = oEvent.getSource().getParent().getParent().getParent().indexOfItem(oEvent.getSource().getParent().getParent());
			if (data[index].ID_CURVA) {

				sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "PisteCreate");
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/year", this.selectedfiscalYearPeriodi);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", data[index].ID_CURVA);
				//	var curvetype = this.getView().getModel("pisteResultTableModel").getProperty(vObject.ID_TIPO_CURVA_GATE + "/ID_TIPO_CURVA_GATE1");
				//	sap.ui.getCore().getModel("BasicAppModel").setProperty("/0/FISCAL_YEAR", selectedfiscalYearPeriodi);
				var tipo_curv = this.getIdTipoCurva(data[index].ID_CURVA);
				var selectedCurve = Formatter.convertIdTipoToDesc(tipo_curv);
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

			}

		},
		handleDescGatePress: function (oEvent) {
			if (this.getView().byId("Mul1").getSelectedItem()) {
				var vObject = this.getView().getModel("GateModel").getObject(this.getView().byId("Mul1").getSelectedItem().oBindingContexts.GateModel
					.sPath);

				sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "PisteCreate");
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/year", this.selectedfiscalYearPeriodi);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", vObject.ID_CURVA);
				//	var curvetype = this.getView().getModel("pisteResultTableModel").getProperty(vObject.ID_TIPO_CURVA_GATE + "/ID_TIPO_CURVA_GATE1");
				//	sap.ui.getCore().getModel("BasicAppModel").setProperty("/0/FISCAL_YEAR", selectedfiscalYearPeriodi);
				var tipo_curv = this.getIdTipoCurva(vObject.ID_CURVA);
				var selectedCurve = Formatter.convertIdTipoToDesc(tipo_curv);
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

			}

		},
		getIdTipoCurva: function (idcurve) {
			var oModel = new sap.ui.model.odata.ODataModel(this.sServiceUrl, true);
			var id_tipo_curv;
			oModel.read("T_CURVE?$filter=ID_CURVA eq " + parseInt(idcurve), null,
				null, false,
				function (oData) {
					if (oData.results.length > 0) {
						id_tipo_curv = oData.results[0].ID_TIPO_CURVA;
					} else {
						id_tipo_curv = 0;
					}
				},
				function (oError) {
					MessageBox.error("Error while getting status for request");
				});

			return id_tipo_curv;
		},
		handleDescGate2Press: function (oEvent) {
			if (this.getView().byId("Mul2").getSelectedItem()) {
				var vObject = this.getView().getModel("GateModel").getObject(this.getView().byId("Mul2").getSelectedItem().oBindingContexts.GateModel
					.sPath);

				sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "PisteCreate");
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/year", this.selectedfiscalYearPeriodi);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", vObject.ID_CURVA);
				//	var curvetype = this.getView().getModel("pisteResultTableModel").getProperty(vObject.ID_TIPO_CURVA_GATE + "/ID_TIPO_CURVA_GATE1");
				//	sap.ui.getCore().getModel("BasicAppModel").setProperty("/0/FISCAL_YEAR", selectedfiscalYearPeriodi);
				var tipo_curv = this.getIdTipoCurva(vObject.ID_CURVA);
				var selectedCurve = Formatter.convertIdTipoToDesc(tipo_curv);
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

			}

		},
		onHomePage: function (oEvent) {
			this.busyDialog.open();
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/PisteChange", true);
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
			this.busyDialog.close();
		},
		handleBack: function (oEvent) {
			this.busyDialog.open();
			 
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
			this.busyDialog.close();
		},
		getCurva: function () {
			var that = this;
			var oFilters = [];
			if (that.selectedfiscalYearPeriodi != undefined && that.selectedfiscalYearPeriodi != "") {
				var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, that.selectedfiscalYearPeriodi);
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
					ogetCurvaModel.setSizeLimit(9999999999);
					ogetCurvaModel.setData(arrayCurva);
					that.getView().setModel(ogetCurvaModel, "CurvaModel");
				},
				error: function (oError) {
					MessageBox.error("Error in getting CURVE. Please contact administrator.");
				}
			};

			var path = "/T_CURVE?$format=json";
			this.oMainOdataModel.read(path, mParameters);
		},
		onCurveSelect: function (oEvent) {
			this.pistestopistecurvmodel = this.getView().getModel("CurvaModel").getObject(oEvent.getSource().getSelectedItem().oBindingContexts
				.CurvaModel.sPath);
			var data = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");
			var index = oEvent.getSource().getParent().getParent().getParent().indexOfItem(oEvent.getSource().getParent().getParent());
			if (data.length > 0) {

				data[index].ID_TIPO_CURVA = this.pistestopistecurvmodel.ID_TIPO_CURVA;

			}
			// setting the first selected curv of kpi from the table to the header kpi curv
			if(index === 0){
				this.getView().byId("curva2").setSelectedKey(this.pistestopistecurvmodel.ID_CURVA);
			}
			this.getView().byId("idTableCreatePiste").getModel("PisteModel").setProperty("/sottopiste", data);
		},
		getAdditivo: function () {
			var that = this;
			var mParameters = {
				success: function (oDataIn, oResponse) {
					var ogetAdditivoModel = new sap.ui.model.json.JSONModel();
					var arrayAdditivo = [];
					var oEntry = {

						ID_TIPOADDITIVO: "",
						DESCR_ADDITIVO: ""
					};
					arrayAdditivo.push(oEntry);
					oEntry = {};
					for (var i = 0; i < oResponse.data.results.length; i++) {
						oEntry.ID_TIPOADDITIVO = oResponse.data.results[i].ID_TIPOADDITIVO;
						oEntry.DESCR_ADDITIVO = oResponse.data.results[i].DESCR_ADDITIVO;
						arrayAdditivo.push(oEntry);
						oEntry = {};
					}
					ogetAdditivoModel.setSizeLimit(9999999999);
					ogetAdditivoModel.setData(arrayAdditivo);
					that.getView().setModel(ogetAdditivoModel, "AdditivoModel");
				},
				error: function (oError) {
					MessageBox.error("Error in getting Additivo. Please contact administrator.");
				}
			};

			var path = "/T_TIPIADDITIVI?$format=json";
			this.oMainOdataModel.read(path, mParameters);
		},
		getGate: function () {
			var that = this;
			var oFilters = [];
			var filter1;
			if (that.selectedfiscalYearPeriodi != undefined && that.selectedfiscalYearPeriodi != "") {
				filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, that.selectedfiscalYearPeriodi);
				oFilters.push(filter1);
			}
			filter1 = new sap.ui.model.Filter("ID_GATE_MADRE", sap.ui.model.FilterOperator.EQ, 0);
			oFilters.push(filter1);
			var mParameters = {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					var ogetGateModel = new sap.ui.model.json.JSONModel();

					var arrayGate = [];
					var oEntry = {

						ID_GATE: "",
						DESCR_GATE: "",
						ID_CURVA: ""
					};
					arrayGate.push(oEntry);
					oEntry = {};
					for (var i = 0; i < oResponse.data.results.length; i++) {
						oEntry.ID_GATE = oResponse.data.results[i].ID_GATE;
						oEntry.DESCR_GATE = oResponse.data.results[i].DESCR_GATE;
						oEntry.ID_CURVA = oResponse.data.results[i].ID_CURVA;
						arrayGate.push(oEntry);
						oEntry = {};
					}
					ogetGateModel.setSizeLimit(9999999999);
					ogetGateModel.setData(arrayGate);
					that.getView().setModel(ogetGateModel, "GateModel");
				},
				error: function (oError) {
					MessageBox.error("Error in getting Gruppo Pista. Please contact administrator.");
				}
			};

			var path = "/P_GATE?$format=json";
			this.oMainOdataModel.read(path, mParameters);
		},
		getGruppi: function () {
			var that = this;
			var oFilters = [];
			if (this.selectedfiscalYearPeriodi != undefined && this.selectedfiscalYearPeriodi != "") {
				var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, parseInt(this.selectedfiscalYearPeriodi));
				oFilters.push(filter1);
			}
			var mParameters = {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					var ogetGruppiModel = new sap.ui.model.json.JSONModel();

					var arrayGruppi = [];
					var oEntry = {

						ID_GRUPPOPISTA: "",
						DESCR_GRUPPOPISTA: ""
					};

					arrayGruppi.push(oEntry);
					oEntry = {};
					for (var i = 0; i < oResponse.data.results.length; i++) {
						oEntry.ID_GRUPPOPISTA = oResponse.data.results[i].ID_GRUPPOPISTA;
						oEntry.DESCR_GRUPPOPISTA = oResponse.data.results[i].DESCR_GRUPPOPISTA;
						arrayGruppi.push(oEntry);
						oEntry = {};
					}
					ogetGruppiModel.setSizeLimit(9999999999);
					ogetGruppiModel.setData(arrayGruppi);
					that.getView().setModel(ogetGruppiModel, "GruppiModel");
				},
				error: function (oError) {
					MessageBox.error("Error in getting Gruppo Pista. Please contact administrator.");
				}
			};

			var path = "/T_GRUPPIPISTE?$format=json";
			this.oMainOdataModel.read(path, mParameters);
		},
		getFiscalYear: function (selectedfiscalYearPeriodi) {
			var that = this;
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
						year = oResponse.data.results[0].DESCR_PERIODO;
						that.oMainJsonYear = new sap.ui.model.json.JSONModel();
						that.oMainJsonYear.setProperty("/year", year);
						that.getView().byId("idtxtfiscalyear").setText(year);
						that.getView().setModel(that.oMainJsonYear, "Years");
						that.getMonthOfYears(new Date(oResponse.data.results[0].VALE_DAL), new Date(oResponse.data.results[0].VALE_AL));
						that.getMonthOfYears1(new Date(oResponse.data.results[0].VALE_DAL), new Date(oResponse.data.results[0].VALE_AL));
					}
				},
				error: function (oError) {
					MessageBox.error("Error in getting Fiscal year. Please contact administrator.");
				}
			};

			var path = "/PERIODI_RIFERIMENTO?$format=json";
			this.oMainOdataModel.read(path, mParameters);
		},
		getMonthOfYears: function (date1, date2) {
			var monthBetweenfiscial = this.diff(date1, date2);
			this.oMainMonthJsonYear = new sap.ui.model.json.JSONModel();
			this.oMainMonthJsonYear.setData(monthBetweenfiscial);
			this.getView().setModel(this.oMainMonthJsonYear, "Months");
		},
		getMonthOfYears1: function (date1, date2) {
			var monthBetweenfiscial1 = this.diff1(date1, date2);
			this.oMainMonthJsonYear1 = new sap.ui.model.json.JSONModel();
			this.oMainMonthJsonYear1.setData(monthBetweenfiscial1);
			this.getView().setModel(this.oMainMonthJsonYear1, "Months1");
		},
		monthDiff: function (d1, d2) {
			var months,day1,day2;
			months = (d2.getFullYear() - d1.getFullYear()) * 12; //calculates months between two years
			months -= d1.getMonth() + 1;
			months += d2.getMonth(); //calculates number of complete months between two months
			day1 = 30 - d1.getDate();
			day2 = day1 + d2.getDate();
			months += parseInt(day2 / 30); //calculates no of complete months lie between two dates
			return months <= 0 ? 0 : months;
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
			var diffYear = this.monthDiff(datFrom,datTo);
			var oEntry = {
				month: "",
				key: ""
			};
			arr.push(oEntry);
			oEntry = {};
			var monthKey = datFrom.getMonth();
			var monthYear = datFrom.getMonth();
			for (var i = 0; i < diffYear; i++) {
				var actualMonth = monthKey + 1;
				oEntry.month = monthNames[monthKey % 12] + "-" + Math.floor(fromYear + (monthYear / 12));
				oEntry.key = Math.floor(fromYear + (monthYear / 12)) + "-" + ((actualMonth < 10) ? '0' + actualMonth : actualMonth) + "-" + "01";
				arr.push(oEntry);
				monthKey = monthKey + 1;
				monthYear = monthYear + 1;
				if(monthKey > 11){
				  monthKey = 0;
				}
				oEntry = {};
			}

			return arr;
		},
		diff1: function (from, to) {
			
			var monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
				"Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
			];
			var arr = [];
			var datFrom = new Date(from);
			var datTo = new Date(to);
			var fromYear = datFrom.getFullYear();
			var toYear = datTo.getFullYear();
			var diffYear = this.monthDiff(datFrom,datTo);
			var oEntry = {
				month: "",
				key: ""
			};
			arr.push(oEntry);
			oEntry = {};
			var monthKey = datFrom.getMonth();
			var monthYear = datFrom.getMonth();
			for (var i = 0; i < diffYear; i++) {
				var actualMonth = monthKey + 1;
				var lastDay = new Date(Math.floor(fromYear + (monthYear / 12)), ((actualMonth < 10) ? '0' + actualMonth : actualMonth), 0);
				oEntry.month = monthNames[monthKey % 12] + "-" + Math.floor(fromYear + (monthYear / 12));
				oEntry.key = Math.floor(fromYear + (monthYear / 12)) + "-" + ((actualMonth < 10) ? '0' + actualMonth : actualMonth) + "-" + lastDay.getDate();
				arr.push(oEntry);
				monthKey = monthKey + 1;
				monthYear = monthYear + 1;
				if(monthKey > 11){
				  monthKey = 0;
				}
				oEntry = {};
			}

			return arr;
		
		},
		onDeleteRow: function (oEvent) {

			var data = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");
			var index = oEvent.getSource().getParent().getParent().getParent().indexOfItem(oEvent.getSource().getParent().getParent());
			data.splice(index, 1);
			if (data.length < 2) {
				this.getView().byId("tblEnalbeOnFirstRowPress").setVisible(false);
				data[0].oButton2 = false;
				data[0].oTest1 = false;
			}

			this.getView().byId("idTableCreatePiste").getModel("PisteModel").setProperty("/sottopiste", data);

		},
		enablePercentage: function (oEvent) {
			var data = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");
			var index = oEvent.getSource().getParent().getParent().getParent().indexOfItem(oEvent.getSource().getParent().getParent());
			if (oEvent.getParameter("newValue") !== "") {
				if (data.length > 1) {
					//		data[index].percentage = true;
					data[index].percentageValue = "%";
				}
			} else {
				//	data[index].percentage = false;
				data[index].percentageValue = "  ";
			}

			this.getView().byId("idTableCreatePiste").getModel("PisteModel").setProperty("/sottopiste", data);

		},
		onAddItems1: function () {
			var data = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");
			this.getView().byId("tblEnalbeOnFirstRowPress").setVisible(true);
			var oEntry = {
				PESO_PERC: "",
				oTest1: true,
				percentage: false,
				percentageValue: "  ",
				ID_CURVA: "",
				ID_GATE: "",
				DESCR_SOTTOPISTA: "",
				oButton1: true,
				oButton2: true,
				ID_TIPO_CURVA: ""
			};
			data.push(oEntry);
			this.getView().byId("idTableCreatePiste").getModel("PisteModel").setProperty("/sottopiste", data);

		},
		fillDesc: function (oEvent) {

			var desc = this.byId("desc").getValue();
			var data = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");
			if (data.length > 0) {
				data[0].DESCR_SOTTOPISTA = desc;
			}
			this.getView().byId("idTableCreatePiste").getModel("PisteModel").setProperty("/sottopiste", data);
		},
		changePers: function () {
			var pers = this.byId("Pers").getSelectedButton().getText();
			if (pers === "Si") {
				this.SN_PERSONALIZZABILE = "S";
				//	this.byId("Additivo").setEnabled(true);
			} else {
				this.SN_PERSONALIZZABILE = "N";
				//	this.byId("Additivo").setEnabled(false);
			}
		},
		onSalva: function (oEvent) {
			sap.ui.core.BusyIndicator.show(1000);
			if (this.getView().byId("desc").getValue()) {
				var DESCR_PISTA = this.getView().byId("desc").getValue();
			} else {
				var DESCR_PISTA = "";
			}
			if (this.getView().byId("MI").getSelectedKey()) {
				var PISTA_VALE_DAL = this.getView().byId("MI").getSelectedKey();
			} else {
				var PISTA_VALE_DAL = null;
			}
			if (this.getView().byId("MI1").getSelectedKey()) {
				var PISTA_VALE_AL = this.getView().byId("MI1").getSelectedKey();
			} else {
				var PISTA_VALE_AL = null;
			}
			if (this.getView().byId("MI3").getSelectedKey()) {
				var ID_GRUPPOPISTA = parseInt(this.getView().byId("MI3").getSelectedKey());
			} else {
				var ID_GRUPPOPISTA = 0;
			}
			if (this.byId("Pers").getSelectedButton()) {
				var SN_PERSONALIZZABILE = this.SN_PERSONALIZZABILE;
			} else {
				var SN_PERSONALIZZABILE = "";
			}
			if (this.getView().byId("Mul1").getSelectedKey()) {
				var ID_GATE = parseInt(this.getView().byId("Mul1").getSelectedKey());
			} else {
				var ID_GATE = 0;
			}
			if (this.getView().byId("Mul2").getSelectedKey()) {
				var ID_GATE2 = parseInt(this.getView().byId("Mul2").getSelectedKey());
			} else {
				var ID_GATE2 = 0;
			}
			if (this.getView().byId("Additivo").getSelectedKey()) {
				var ID_TIPOADDITIVO = parseInt(this.getView().byId("Additivo").getSelectedKey());
			} else {
				var ID_TIPOADDITIVO = 0;
			}
			if (this.getView().byId("Soglia").getValue()) {
				var SOGLIA_ADDITIVO = parseInt(this.getView().byId("Soglia").getValue());
			} else {
				var SOGLIA_ADDITIVO = 0;
			}
			if (this.getView().byId("curva2").getSelectedKey()) {
				var ID_CURVA = parseInt(this.getView().byId("curva2").getSelectedKey());
			} else {
				var ID_CURVA = 0;
			}
			if (PISTA_VALE_DAL && PISTA_VALE_AL) {
				var TIPO_PISTA = Formatter.getTipoCalculate1(PISTA_VALE_DAL, PISTA_VALE_AL);
			} else {
				var TIPO_PISTA = "";
			}

			var tablMdls = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");
			if (tablMdls.length > 1) {
				var N_SOTTOPISTE = tablMdls.length - 1;
			} else {
				var N_SOTTOPISTE = 0;
			}
			var oYears = this.getView().byId("idtxtfiscalyear").getText();
			var SOTTOPISTE = [];
			for (var i = 0; i < tablMdls.length; i++) {
				if (!tablMdls[i].ID_CURVA) {
					MessageBox.error(oResource.getText("messageInformation4"));
					sap.ui.core.BusyIndicator.hide();
					return;
				}
				// adding the ID_CURVA of first row
				/*if(ID_CURVA === 0){
					ID_CURVA = ((!tablMdls[0].ID_CURVA || tablMdls[0].ID_CURVA === "" || tablMdls[0].ID_CURVA === null || tablMdls[0].ID_CURVA ===
						undefined) ? 0 : parseInt(tablMdls[0].ID_CURVA));
				}*/
				var oNewObject = {
					PESO_PERC: tablMdls[i].PESO_PERC,
					ID_CURVA: ((!tablMdls[i].ID_CURVA || tablMdls[i].ID_CURVA === "" || tablMdls[i].ID_CURVA === null || tablMdls[i].ID_CURVA ===
						undefined) ? 0 : parseInt(tablMdls[i].ID_CURVA)),
					ID_GATE: ((!tablMdls[i].ID_GATE || tablMdls[i].ID_GATE === "" || tablMdls[i].ID_GATE === null || tablMdls[i].ID_GATE ===
						undefined) ? 0 : parseInt(tablMdls[i].ID_GATE)),
					DESCR_SOTTOPISTA: tablMdls[i].DESCR_SOTTOPISTA.toString()
				};
				SOTTOPISTE.push(oNewObject);
				oNewObject = {};

			}
			var sPayload = {
				ID_PERIODO: parseInt(this.selectedfiscalYearPeriodi),
				DESCR_PISTA: DESCR_PISTA.toString(),
				PISTA_VALE_DAL: PISTA_VALE_DAL,
				PISTA_VALE_AL: PISTA_VALE_AL,
				ID_GRUPPOPISTA: ID_GRUPPOPISTA,
				SN_PERSONALIZZABILE: SN_PERSONALIZZABILE.toString(),
				ID_GATE: ID_GATE,
				ID_GATE2: ID_GATE2,
				ID_TIPOADDITIVO: ID_TIPOADDITIVO,
				SOGLIA_ADDITIVO: SOGLIA_ADDITIVO,
				ID_CURVA: ID_CURVA,
				N_SOTTOPISTE: parseInt(N_SOTTOPISTE),
				TIPO_PISTA: TIPO_PISTA.toString(),
				P_SOTTOPISTE: SOTTOPISTE

			};

			/// post operation
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
						url: "/HANAMDC/STIP/STIPAdmin/services/Create_Piste.xsjs",
						type: "POST",
						contentType: 'application/json',

						data: JSON.stringify(sPayload),
						beforeSend: function (xhr) {
							xhr.setRequestHeader("X-CSRF-Token", token);
						},
						success: function (data1, textStatus1, XMLHttpRequest1) {
							sap.ui.core.BusyIndicator.hide();
							MessageBox.success("Pista : " + " " + data1.ID_PISTAVIEW + " creata correttamente per il Fiscal Year " + oYears, {
								title: "Success", // default
								onClose: function (sButton) {
									if (sButton === MessageBox.Action.OK) {
                                        sap.ui.getCore().getModel("BasicAppModel").setProperty("/PisteChange", false);
										sap.ui.core.UIComponent.getRouterFor(that).navTo("Piste", {
											Piste: "Piste",
											str: that.selectedfiscalYearPeriodi
										});
									}
								},
								actions: sap.m.MessageBox.Action.OK,
								emphasizedAction: sap.m.MessageBox.Action.OK
							});

						},
						error: function (data1, textStatus1, XMLHttpRequest1) {
							sap.ui.core.BusyIndicator.hide();
							MessageBox.error("Error while perfoming Salva operation. Please contact administrator.");
							jQuery.sap.log.getLogger().error("Salva operation failed" + textStatus1.toString());

						}
					});
				}
			});

		},
		clearFields: function (oEvent) {
			if (this.getView().byId("desc").getValue()) {
				this.getView().byId("desc").setValue("");
			}

			if (this.getView().byId("MI").getSelectedItem()) {
				this.getView().byId("MI").setSelectedKey("");
			}
			if (this.getView().byId("MI1").getSelectedItem()) {
				this.getView().byId("MI1").setSelectedKey("");
			}
			if (this.getView().byId("MI3").getSelectedItem()) {
				this.getView().byId("MI3").setSelectedKey("");
			}
			if (this.getView().byId("Mul1").getSelectedItem()) {
				this.getView().byId("Mul1").setSelectedKey("");
			}
			if (this.getView().byId("Mul2").getSelectedItem()) {
				this.getView().byId("Mul2").setSelectedKey("");
			}
			if (this.getView().byId("Additivo").getSelectedItem()) {
				this.getView().byId("Additivo").setSelectedKey("");
			}
			if (this.getView().byId("Soglia").getValue()) {
				this.getView().byId("Soglia").setValue("");
			}
			if (this.getView().byId("curva2").getSelectedItem()) {
				this.getView().byId("curva2").setSelectedKey("");
			}
			if (this.getView().byId("ObiettivoComplessivo").getValue()) {
				this.getView().byId("ObiettivoComplessivo").setValue("");
			}
			if (this.getView().byId("ConsuntivoComplessivo").getValue()) {
				this.getView().byId("ConsuntivoComplessivo").setValue("");
			}
			if (this.byId("Pers").getSelectedButton()) {
				this.byId("Pers").getSelectedButton().setSelected(false);
			}
		},
		onAnnulla: function (oEvent) {
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/PisteChange", false);
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Piste", {
				Piste: "Piste",
				str: this.selectedfiscalYearPeriodi
			});
		}

	});
});