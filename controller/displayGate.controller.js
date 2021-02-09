sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/BusyIndicator"], function (t, BusyIndicator) {
	"use strict";
	var oMainModel = new sap.ui.model.json.JSONModel();
	var selectedfiscalYearPeriodi, desc_aseg;
	return t.extend("stipAdmin.stipAdmin.controller.displayGate", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("displayGate").attachPatternMatched(this._onObjectMatched, this)
		},
		/******************** _onObjectMatched fetches argument values********************************************/
		_onObjectMatched: function (oEvent) {
			debugger;
			var id = oEvent.getParameter("arguments").id;
			this.getMoltiplicatoreResultTableData(id);
			//var data = sap.ui.getCore().getModel("modModel").getData();
			//this.byId("fy").setText(data.DESCR_PERIODO);
		},
		/******************* getMoltiplicatoreResultTableData function fetches the desired data from the backened********************/
		getMoltiplicatoreResultTableData: function (id) {
			BusyIndicator.show();
			var oFilters = [];
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			var
				data, data2 = [],
				MoltiplicatoreResultJson = [],
				RISULTATO = [],
				CURVE = [],
				PISTE_DATA = [],
				GRUPPI_DATA = [],
				id, that = this,
				tmp = {},
				NOME, COGNOME, MATRICOLA,
				Filter_Piste = [],
				Filter_Gruppi = [],
				Filter_Curva = [],
				Filter_Asseg = [],
				Pers = [];

			var filter1 = new sap.ui.model.Filter("ID_GATE", sap.ui.model.FilterOperator.EQ, id);
			oFilters.push(filter1);
			var that = this;

			xsoDataModel.read("/V_MOLTIPLICATORE?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;
					oFilters = [];
					data = oDataIn.results;
					console.log(data);
					if (data.length !== 0) {
						BusyIndicator.show();
						var year = data[0].DESCR_PERIODO;
						this.byId("fy").setText(year);
						if (oDataIn.results[0].NOME === null && oDataIn.results[0].COGNOME === null && oDataIn.results[0].MATRICOLA === null) {
							NOME = " ";
							COGNOME = " ";
							MATRICOLA = "";
						} else {
							NOME = oDataIn.results[0].NOME;
							COGNOME = oDataIn.results[0].COGNOME;
							MATRICOLA = oDataIn.results[0].MATRICOLA;
						}

						var MoltiplicatoreResultJsonData = {
							"FISCAL_YEAR": oDataIn.results[0].ID_PERIODO,
							"DESCR_PERIODO": year,
							"ID_GATE": oDataIn.results[0].ID_GATE,
							"DESCR_GATE": oDataIn.results[0].DESCR_GATE,
							"ID_CURVA": oDataIn.results[0].ID_CURVA,
							"DESCR_CURVA": oDataIn.results[0].DESCR_CURVA,
							"ID_GATE_MADRE": oDataIn.results[0].ID_GATE_MADRE,
							"ASSEGNATARIO": NOME + " " + COGNOME + " " + MATRICOLA,
							"RISULTATO_GRADINO": oDataIn.results[0].RISULTATO_GRADINO,
							"RISULTATO_GRADINO_SIM": oDataIn.results[0].RISULTATO_GRADINO_SIM,
							"SN_PERSONALIZZABILE": oDataIn.results[0].SN_PERSONALIZZABILE,
							"SN_VISIBILEPCO": oDataIn.results[0].SN_VISIBILEPCO,
							//"RISULTATO1": {},
							"RISULTATO": {},
							"PISTE_DATA": [],
							"GRUPPI_DATA": []
						};

						MoltiplicatoreResultJson.push(MoltiplicatoreResultJsonData);
					}

					for (var j = 0; j < oDataIn.results.length; j++) {

						if (oDataIn.results[j].ID_PISTAVIEW !== null && oDataIn.results[j].ID_PISTAVIEW !== 0) {
							tmp = {
								"idGate": oDataIn.results[j].ID_GATE,
								"desc": oDataIn.results[j].DESCR_PISTA,
								"pisteid": oDataIn.results[j].ID_PISTAVIEW,
								"gruppi_id": oDataIn.results[j].ID_GRUPPOPISTA,
								"gruppi_desc": oDataIn.results[j].DESCR_GRUPPOPISTA
							};

							PISTE_DATA.push(tmp);
						}
					}
					var data11 = PISTE_DATA,
						m = {};
					PISTE_DATA = [];

					for (var i = 0; i < data11.length; i++) {
						var vv = data11[i].pisteid;
						if (!m[vv] && vv !== "") {
							PISTE_DATA.push(data11[i]);
							m[vv] = true;
						}
					}

					MoltiplicatoreResultJson[0].PISTE_DATA = PISTE_DATA;

					BusyIndicator.hide();
					data = MoltiplicatoreResultJson[0];
					if (data.SN_PERSONALIZZABILE === "S")
						data.SN_PERSONALIZZABILE = "Si";
					else
						data.SN_PERSONALIZZABILE = "No";

					if (data.PISTE_DATA.length === 0)
						that.byId("tbl").setVisible(false);
					else
						that.byId("tbl").setVisible(true);
					oMainModel.setData(data);
					console.log(oMainModel.getData());
					selectedfiscalYearPeriodi = oMainModel.getData().FISCAL_YEAR;

					that.getView().setModel(oMainModel, "MoltiplicatoreResultTableModel");

				}.bind(this),
				error: function (oError) {
					//Handle the error
					BusyIndicator.hide();
					oFilters = [];
					MessageBox.error("Data fetch failed while getting P_GATE. Please contact administrator.");
					jQuery.sap.log.getLogger().error("P_GATE fetch failed" + oError.toString());
				}.bind(this)
			});
			return MoltiplicatoreResultJson;
		},
		/********************cancel function navigates the user to the previous Moltiplicatore page********************************************/
		cancel: function () {
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "back");
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Gate", {
				gate: "gate",
				str: selectedfiscalYearPeriodi
			});
		},
		/********************displayCurveFn function navigates the user to the displayCurvaDiscreta page 
		(for particular curveId,curveDesc,gateId and FISCAL_YEAR) ********************************************/
		displayCurve: function () {
			debugger
			var idCurve = oMainModel.getData().ID_CURVA;
			var curveDesc = oMainModel.getData().DESCR_CURVA;
			var gateId = oMainModel.getData().ID_GATE;
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", idCurve);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveDesc", curveDesc);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/gate", "S");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "dispGate");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/gateId", gateId);
			var e = sap.ui.core.UIComponent.getRouterFor(this);
			e.navTo("displayCurvaDiscreta");
		},

	});
});