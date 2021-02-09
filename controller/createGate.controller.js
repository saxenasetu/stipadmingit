sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/MessageBox"], function (t, MessageBox) {
	"use strict";
	var oMainModel = new sap.ui.model.json.JSONModel();
	var data = [],
		max_id;
	var selectedfiscalYearPeriodi;
	var curve = [{
		ID_CURVA: 0,
		DESCR_CURVA: ""
	}];
	return t.extend("stipAdmin.stipAdmin.controller.createGate", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("createGate").attachPatternMatched(this._onObjectMatched, this);
		},
		/******************** _onObjectMatched fetches argument values ********************************************/
		_onObjectMatched: function (oEvent) {
			//this.creteGateid(); //fetches new id
			max_id = oEvent.getParameter("arguments").id;
			selectedfiscalYearPeriodi = oEvent.getParameter("arguments").fy;

			this.getCurveDesc(); //fetches curve dropdown desc list

			this.byId("gateDesc").setValue("");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "back");
		},
		/******************** getCurveDesc function fetches the data from T_CURVE based on the ID_PERIODO and SN_GATE********************************************/
		getCurveDesc: function () {
			var oFilters = [];
			var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, selectedfiscalYearPeriodi);
			oFilters.push(filter1);
			filter1 = new sap.ui.model.Filter("SN_GATE", sap.ui.model.FilterOperator.EQ, "S");
			oFilters.push(filter1);
			var that = this;
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");

			xsoDataModel.read("/T_CURVE?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					for (var i = 0; i < oDataIn.results.length; i++)
						curve.push({
							ID_CURVA: oDataIn.results[i].ID_CURVA,
							DESCR_CURVA: oDataIn.results[i].DESCR_CURVA
						});
					data.push({
						max_id: max_id,
						CURVE: curve
					});
					/*	data[0].max_id=max_id;
					data[0].CURVE = curve;*/
					//this.displayMoltiplicatore();
					oMainModel.setData(data);
					that.getView().setModel(oMainModel, "createGateModel");
					oMainModel.refresh();
				},
				error: function (data) {}

			});

		},
		/********************saveMoltiplocatore function is used to save the added moltiplicatore after verifying that description is not blank********************************************/
		saveMoltiplocatore: function (idCurve) {
			//	debugger
			var that = this;
			var pco, pers;
			var idGate = oMainModel.getData()[0].max_id;
			var idCurva = this.byId("idCurva").getSelectedKey();
			var gateDesc = this.getView().byId("gateDesc").getValue();
			if (gateDesc === "" || gateDesc === null || gateDesc === undefined) {
				MessageBox.error("La descrizione non può essere vuota"); //Error message displayed 'The description cannot be empty'
			} else {
				//var pcoFlag = this.getView().byId("box0").getSelected();
				/*if (pcoFlag == true)
					pco = "S";
				else if (pcoFlag == false)*/
				pco = "S";
				var persCombo = this.getView().byId("gatePers")._getSelectedItemText();
				if (persCombo == "SI")
					pers = "S";
				else if (persCombo == "NO")
					pers = "N";
				var payload = {
					ID_GATE: idGate,
					ID_PERIODO: selectedfiscalYearPeriodi,
					DESCR_GATE: gateDesc,
					ID_CURVA: idCurva,
					SN_VISIBILEPCO: pco,
					SN_PERSONALIZZABILE: pers,
					RISULTATO: "0",
					RISULTATO_GRADINO: "",
					RISULTATO_GRADINO_SIM: "",
					ID_SCHEDAPERSONALE: "0",
					ID_GATE_MADRE: 0
						//	DATETIME_CR: "",
						//	DATETIME_LM: ""
				}
				console.log(payload);
				var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
				xsoDataModel.create("/P_GATE", payload, {

					success: function (oDataIn, oResponse) {
						//	debugger;
						if (oResponse.statusCode === "200" || oResponse.statusCode === "201") {
							MessageBox.success("Moltiplicatore Creato con Successo", { //Success message displayed 'Successfully Created Multiplier'
								onClose: function (oEvent) {
									//		debugger;
									sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "create");
									console.log("Onclose");
									that.cancel();
								}
							});
						} else
							MessageBox.error("Couldn't create record in P_GATE. Please contact administrator.");
					}.bind(this),
					error: function (oError) {
						//Handle the error
						//	debugger;
						MessageBox.error("Couldn't create record in P_GATE. Please contact administrator.");
						jQuery.sap.log.getLogger().error("P_GATE fetch failed" + oError.toString());
					}.bind(this)
				});

				this.byId("gateDesc").setValue("");
			}
		},
		/********************cancel function navigates the user to the previous Moltiplicatore page after setting the description and idcurva as blank ********************************************/
		cancel: function (oEvent) {
			data = [];
			curve = [{
				ID_CURVA: 0,
				DESCR_CURVA: ""
			}];
			oMainModel.setData(data);
			this.byId("gateDesc").setValue("");
			this.getView().byId("idCurva").setSelectedKey(0);
			//this.getView().byId("box0").setSelected(false);

			sap.ui.core.UIComponent.getRouterFor(this).navTo("Gate", {
				gate: "Gate",
				str: selectedfiscalYearPeriodi
			});
		},
	})
});