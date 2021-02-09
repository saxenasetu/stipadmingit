sap.ui.define(["sap/ui/core/mvc/Controller", "stipAdmin/stipAdmin/util/Formatter",
	"sap/ui/model/json/JSONModel", "../service/RepoService"
], function (t, Formatter, JSONModel, RepoService) {
	"use strict";
	var minPercMbo;
	var maxPercMbo;
	return t.extend("stipAdmin.stipAdmin.controller.displayCurvaLineare", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("displayCurvaLineare").attachPatternMatched(this._onObjectMatched, this);
		},
		/******************** _onObjectMatched function fetches the argument values ********************************************/
		_onObjectMatched: function () {
			var year = sap.ui.getCore().getModel("BasicAppModel").getProperty("/year");
			this.byId("fy").setText(year);
			this.displayLinearCurveTb();

		},
		/******************** displayLinearCurveTb function is used to fetch the data from the backend(T_CURVE_RIGHE)
		based on the performance and payout********************************************/
		displayLinearCurveTb: function () {
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
			var curveMBOJson = [];
			var curveResultJsonData = [];
			var oFilters = [];
			var idCurve = sap.ui.getCore().getModel("BasicAppModel").getProperty("/curveId");
			var curveDesc = sap.ui.getCore().getModel("BasicAppModel").getProperty("/curveDesc");
			if (idCurve != undefined && idCurve != "") {
				var filter1 = new sap.ui.model.Filter("ID_CURVA", sap.ui.model.FilterOperator.EQ, idCurve);
				oFilters.push(filter1);
			}

			xsoDataModel.read("/T_CURVE_RIGHE?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;
					console.log(oDataIn);
					for (var i = 0; i < oDataIn.results.length; ++i) {
						curveResultJsonData = {
							"PERC_MBO": oDataIn.results[i].PERC_MBO,
							"VALORE_CURVA": oDataIn.results[i].VALORE_CURVA,
							//	"S_GRADINO": oDataIn.results[i].S_GRADINO,
						};
						curveMBOJson.push(parseInt(oDataIn.results[i].PERC_MBO));
						curveResultJson.push(curveResultJsonData);
					}
					console.log(curveResultJson);

					/*	console.log(curveMBOJson);
						minPercMbo = Math.min.apply(null, curveMBOJson);
						maxPercMbo = Math.max.apply(null, curveMBOJson);*/
					//	debugger
					curveResultJson.sort(function (a, b) {
						if (Number(a.VALORE_CURVA) < Number(b.VALORE_CURVA)) {
							return -1;
						} else
							return 1;
					});
					console.log(curveResultJson);
					oMainModel.setData(
						curveResultJson
					);

					this.getView().setModel(oMainModel, "displayCurveLinearModel");
					//	this.getView().getModel("displayCurveLinearModel").setProperty("/curveDesc", curveDesc);
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
		/******************** createLinearCurve function is used to set the vizProperties to the LinearCurve********************************************/
		createLinearCurve: function (curveDesc) {
			//	debugger
			var that = this;
			this.getView().byId("idcolumn").setVisible(true);
			//      1.Get the id of the VizFrame

			var oVizFrame = this.getView().byId("idcolumn");

			//      2.Create a JSON Model and set the data
			/*	var oModel = new sap.ui.model.json.JSONModel();
				var data = this.getView().getModel("curveResultTableModel").getData().curveData;
				console.log(data);

				oModel.setData(data);

				//      3. Create Viz dataset to feed to the data to the graph
				var oDataset = new sap.viz.ui5.data.FlattenedDataset({
					dimensions: [{
						name: '%Performance',
						value: "{Performance}"
					}],

					measures: [{
						name: '%Payout',
						value: '{Payout}'
					}],

					data: {
						path: "/"
					}
				});
				oVizFrame.setDataset(oDataset);
				oVizFrame.setModel(oModel);
				//           oModel.destroy();
				oVizFrame.setVizType('line');*/

			//      4.Set Viz properties
			oVizFrame.setVizProperties({
				plotArea: {
					/*	window:{start: {categoryAxis: {'%Performance': 100}},
                       end: {categoryAxis: {'%Performance': 5000}}
			},
*/
					//           colorPalette: d3.scale.category20().range()
					'colorPalette': ['RED', 'GREY', 'BLUE', '#F5A9A9', 'BROWN'],
					'isRoundCorner': true,
					'drawingEffect': "glossy",
					//	startValue: 10
					dataLabel: {
						visible: true,
						formatString: '0"%"'
					}
				},
				title: {
					//	text: "Margin on KPI - tipo curva Linear",
					//	text: curveDesc + " - tipo curva Linear",
					text: curveDesc,
					visible: true
				}
			});
			/*	oVizFrame.setVizScales([{
					feed: "valueAxis",
					min: minPercMbo,
					max: maxPercMbo
				}]);*/

			/*
						var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
								'uid': "valueAxis",
								'type': "Measure",
								'values': ["%Payout"]
							}),
							feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
								'uid': "categoryAxis",
								'type': "Dimension",
								'values': ["%Performance"]
							});

						oVizFrame.addFeed(feedValueAxis);
						//           oVizFrame.addFeed(feedValueAxis1);
						oVizFrame.addFeed(feedCategoryAxis);*/
		},
		/******************** cancel function navigates the user to the respective previous pages (Piste/createPiste/modPiste
		SchedaMaster/SchedaPersonale/curvaCopy/Curve) based on the fiscal year********************************************/
		cancel: function () {
			var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/0/FISCAL_YEAR");
			/*sap.ui.core.UIComponent.getRouterFor(this).navTo("Curve", {
				curve: "Curve",
				str: selectedFYPeriodi
			});*/

			var back = sap.ui.getCore().getModel("BasicAppModel").getProperty("/back");
			if (back === "PisteMain") {
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
				selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/FISCAL_YEAR");
				sap.ui.core.UIComponent.getRouterFor(this).navTo("SchedaPersonale", {
					schedaPersonale: "SchedaPersonale",
					str: selectedFYPeriodi
				});
			} else if (back === "curvaCopy") {
				selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/FISCAL_YEAR");
				var e = sap.ui.core.UIComponent.getRouterFor(this);
				e.navTo("Curve_Copy", {
					curve: "Curve_Copy",
					str: selectedFYPeriodi
				});
			} else if (back === "BlocaPisteMain") {// navigates to bloca piste page from display curve
				selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/year");
				var e = sap.ui.core.UIComponent.getRouterFor(this);
				e.navTo("BloccaPiste", {
					ID: "2",
					str: selectedFYPeriodi
				});
			} else {
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/change", "change");
				sap.ui.core.UIComponent.getRouterFor(this).navTo("Curve", {
					curve: "Curve",
					str: selectedFYPeriodi
				});
			}

		}
	});
});