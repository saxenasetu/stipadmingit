sap.ui.define(["sap/ui/core/mvc/Controller", "stipAdmin/stipAdmin/util/Formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (t, Formatter, JSONModel, MessageBox) {
	"use strict";
	var minPercMbo;
	var maxPercMbo;
	return t.extend("stipAdmin.stipAdmin.controller.displayCurvaDiscreta", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("displayCurvaDiscreta").attachPatternMatched(this._onObjectMatched, this);
		},
		/******************** _onObjectMatched function fetches the argument values ********************************************/
		_onObjectMatched: function (t) {
			var year = sap.ui.getCore().getModel("BasicAppModel").getProperty("/year");
			this.byId("fy").setText(year);
			this.displayDiscretaCurveTb();

		},
		/******************** displayDiscretaCurveTb function is used to fetch the data from the backend(T_CURVE_RIGHE) based on the filter values********************************************/
		displayDiscretaCurveTb: function () {
			debugger
			var that = this;
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			/*	xsoDataModel.attachRequestSent(function () {
				that._busyDialog.open();
			});
			xsoDataModel.attachRequestCompleted(function () {
				that._busyDialog.close();
			}); */
			var oMainModel = new sap.ui.model.json.JSONModel();
			var curveResultJson = [];
			var curveResultJsonData = [];
			var curveMBOJson = [];
			var oFilters = [];
			var idCurve = sap.ui.getCore().getModel("BasicAppModel").getProperty("/curveId");
			var curveDesc = sap.ui.getCore().getModel("BasicAppModel").getProperty("/curveDesc");
			var gate = sap.ui.getCore().getModel("BasicAppModel").getProperty("/gate");
			if (idCurve != undefined && idCurve != "") {
				var filter1 = new sap.ui.model.Filter("ID_CURVA", sap.ui.model.FilterOperator.EQ, idCurve);
				oFilters.push(filter1);
			}
			if (gate === "S")
				gate = true;
			else
				gate = false;

			xsoDataModel.read("/T_CURVE_RIGHE?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;
					console.log(oDataIn);
					for (var i = 0; i < oDataIn.results.length; ++i) {
						curveResultJsonData = {
							"PERC_MBO": oDataIn.results[i].PERC_MBO,
							//	"VALORE_CURVA": oDataIn.results[i].VALORE_CURVA,
							"S_GRADINO": oDataIn.results[i].S_GRADINO,
							"SN_GATE": gate
						};
						curveMBOJson.push(parseInt(oDataIn.results[i].PERC_MBO));
						curveResultJson.push(curveResultJsonData);
					}
					console.log(curveResultJson);
					console.log(curveMBOJson);
					minPercMbo = Math.min.apply(null, curveMBOJson);
					maxPercMbo = Math.max.apply(null, curveMBOJson);

					oMainModel.setData(
						curveResultJson
					);
					this.getView().setModel(oMainModel, "displayCurveDiscretaModel");
					//	oMainModel.destroy();
					this.createLinearCurve(curveDesc);
				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed while getting T_Curve_righe. Please contact administrator.");
					jQuery.sap.log.getLogger().error("T_Curve_righe fetch failed" + oError.toString());
				}.bind(this)
			});

		},
		/******************** createLinearCurve function is used to set the vizProperties to the DiscretaCurve********************************************/
		createLinearCurve: function (curveDesc) {
			debugger
			this.getView().byId("idcolumn").setVisible(true);
			//      1.Get the id of the VizFrame

			var oVizFrame = this.getView().byId("idcolumn");

			oVizFrame.setVizProperties({
				plotArea: {
					/*'window': {
					    start: "100",
					    end: "1000"
					},*/

					//	startValue: 10
					dataLabel: {
						visible: true,
						formatString: '0"%"'
					}
				},
				title: {
					//	text: "Margin on KPI - tipo curva Linear",
					//	text: curveDesc + " - tipo curva Discreta",
					text: curveDesc,
					visible: true
				}
			});
			/*oVizFrame.setVizScales([{
				feed: "valueAxis",
				min: minPercMbo,
				max: maxPercMbo
			}]);*/

		},
		/******************** cancel function navigates the user to the respective previous pages (modGate/gate/Piste/createPiste/modPiste
		SchedaMaster/SchedaPersonale/curvaCopy/Curve) based on the fiscal year********************************************/
		cancel: function () {
			var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/0/FISCAL_YEAR");

			var back = sap.ui.getCore().getModel("BasicAppModel").getProperty("/back");
			if (back === "gate") {
				var idMoltiplicatore = sap.ui.getCore().getModel("BasicAppModel").getProperty("/gateId");
				var idCurve = sap.ui.getCore().getModel("BasicAppModel").getProperty("/curveId");
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/discreta",idCurve);
				var n = sap.ui.core.UIComponent.getRouterFor(this);
				n.navTo("modGate", {
					gate: "modGate",
					id: idMoltiplicatore
				});
			}
			else if (back === "dispGate") {
				var idMoltiplicatore = sap.ui.getCore().getModel("BasicAppModel").getProperty("/gateId");
				var idCurve = sap.ui.getCore().getModel("BasicAppModel").getProperty("/curveId");
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/discreta",idCurve);
				var n = sap.ui.core.UIComponent.getRouterFor(this);
				n.navTo("displayGate", {
					gate: "displayGate",
					id: idMoltiplicatore
				});
			}
			else if (back === "GateMain") {
				var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/FISCAL_YEAR");
				sap.ui.core.UIComponent.getRouterFor(this).navTo("Gate", {
					gate: "gate",
					str: selectedFYPeriodi
				});
			} else if (back === "PisteMain") {
				selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/year");
				sap.ui.core.UIComponent.getRouterFor(this).navTo("Piste", {
					Piste: "Piste",
					str: selectedFYPeriodi
				});
			} else if (back === "PisteCreate") {
				selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/year");
				sap.ui.core.UIComponent.getRouterFor(this).navTo("createPiste", {
					createPiste: "createPiste",
					str: selectedFYPeriodi,
					str2: 1

				});
			} else if (back === "modPista") {
				selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/year");
				var pistaview = sap.ui.getCore().getModel("BasicAppModel").getProperty("/Pistaview");
				var idpista = sap.ui.getCore().getModel("BasicAppModel").getProperty("/IdPiste");
				sap.ui.core.UIComponent.getRouterFor(this).navTo("modPista", {
					modPista: "modPista",
					ID_PERIODO: selectedFYPeriodi,
					ID_PISTAVIEW: pistaview,
					ID_PISTE: idpista

				});
			} else if (back === "ViewPiste") {
				selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/year");
				var pistaview = sap.ui.getCore().getModel("BasicAppModel").getProperty("/Pistaview");
				var idpista = sap.ui.getCore().getModel("BasicAppModel").getProperty("/IdPiste");
				sap.ui.core.UIComponent.getRouterFor(this).navTo("ViewPiste", {
					modPista: "ViewPiste",
					ID_PERIODO: selectedFYPeriodi,
					ID_PISTAVIEW: pistaview,
					ID_PISTE: idpista

				});
			} else if (back === "SchedaMasterMain") {
				selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/year");
				sap.ui.core.UIComponent.getRouterFor(this).navTo("SchedaMaster", {
					master: "SchedaMaster",
					str: selectedFYPeriodi
				});
			} else if (back === "SchedaPersonale") {
				var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/FISCAL_YEAR");
				sap.ui.core.UIComponent.getRouterFor(this).navTo("SchedaPersonale", {
					schedaPersonale: "SchedaPersonale",
					str: selectedFYPeriodi
				});
			} else if (back === "curvaCopy") {
				debugger;
				selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/FISCAL_YEAR");
				var e = sap.ui.core.UIComponent.getRouterFor(this);
				e.navTo("Curve_Copy", {
					curve: "Curve_Copy",
					str: selectedFYPeriodi
				});
			}else if (back === "BlocaPisteMain") {// navigates to bloca piste page from display curve
				selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/year");
				var e = sap.ui.core.UIComponent.getRouterFor(this);
				e.navTo("BloccaPiste", {
					ID: "2",
					str: selectedFYPeriodi
				});
			} else if (back === "BlocaPisteMainGate") {// navigates to bloca piste page from display curve
				selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/year");
				var e = sap.ui.core.UIComponent.getRouterFor(this);
				e.navTo("BloccaPiste", {
					ID: "2",
					str: selectedFYPeriodi
				});
			}
			else {
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/change", "change");
				sap.ui.core.UIComponent.getRouterFor(this).navTo("Curve", {
					curve: "Curve",
					str: selectedFYPeriodi
				});

			}
		}

	});
});