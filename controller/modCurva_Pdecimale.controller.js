sap.ui.define(["sap/ui/core/mvc/Controller", "stipAdmin/stipAdmin/util/Formatter",
	"sap/ui/model/json/JSONModel", "sap/m/MessageBox"
], function (Controller, Formatter, JSONModel, MessageBox) {
	"use strict";
	var minPercMbo;
	var maxPercMbo;
	var oMainModel = new sap.ui.model.json.JSONModel();
	return Controller.extend("stipAdmin.stipAdmin.controller.modCurva_Pdecimale", {

		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("modCurva_Pdecimale").attachPatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function () {
			var piste = parseInt(sap.ui.getCore().getModel("BasicAppModel").getProperty("/piste"));
			console.log(piste);
			if (piste > 0) {
				this.byId("deleteCurveButton").setVisible(false); //if piste >0 dont display elimina button
				this.byId("desc").setEditable(false); //if piste >0 ,description field is non editable
			} else {
				this.byId("deleteCurveButton").setVisible(true);
				this.byId("desc").setEditable(true);
			}
			this.displayLinearCurveTb();
		},
		addRow: function (t) {
			debugger;
			var e = this.getView().byId("tbl");
			var o = this.getView().getModel("modCurveLinearModel").getData().curveData;
			var i = {
					/*PERC_MBO: "%",
				VALORE_CURVA: "%",*/
				PERC_MBO: "",
				VALORE_CURVA: ""
			};
			o.push(i);

			this.getView().getModel("modCurveLinearModel").setProperty("/curveData", o)

		},
			removeRow: function (oEvent) {
			//	debugger;
			var e = this.getView().byId("tbl");
			var o = e.getModel("modCurveLinearModel").getProperty("/curveData");
			//	console.log(o);
			var context = oEvent.getSource().getBindingContext("modCurveLinearModel");
			var path = context.getPath();
			var pos1 = ("/curveData/").length;
			var length = path.length;
			var index = Number(path.substring(pos1, length));
			//	console.log(index);
			o.splice(index, 1)
				//	console.log(o);
			e.getModel("modCurveLinearModel").setProperty("/curveData", o);
		},

		displayLinearCurveTb: function () {
			debugger
			var that = this;
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");

			var curveResultJson = [];
			var curveResultJsonData = {};
				var curveMBOJson = [];
			var oFilters = [];
			var idCurve = sap.ui.getCore().getModel("BasicAppModel").getProperty("/curveId");
			var descrCurve = sap.ui.getCore().getModel("BasicAppModel").getProperty("/descrCurve");

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
							//              "S_GRADINO": oDataIn.results[i].S_GRADINO,
						};
								curveMBOJson.push(parseInt(oDataIn.results[i].PERC_MBO));
						curveResultJson.push(curveResultJsonData);
					}
					console.log(curveResultJson);
						console.log(curveMBOJson);
					minPercMbo = Math.min.apply(null, curveMBOJson);
					maxPercMbo = Math.max.apply(null, curveMBOJson);
					/*	var curveLinearData = {
						curveData: curveResultJson
					};

					oMainModel.setData(curveLinearData);
*/

					oMainModel.setProperty("/curveData", curveResultJson);

					oMainModel.setProperty("/DESCR_CURVE", descrCurve);
					this.getView().setModel(oMainModel, "modCurveLinearModel");

					console.log(this.getView().getModel("modCurveLinearModel"));

					//           oMainModel.destroy();
					//this.createLinearCurve();
					this.showCurveTitle(descrCurve);
				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed while getting T_Curve_righe. Please contact administrator.");
					jQuery.sap.log.getLogger().error("T_Curve_righe fetch failed" + oError.toString());
				}.bind(this)
			});
			//var that = this;

		},
		validation: function () {
			debugger;
			var f;
			console.log(this.getView().getModel("modCurveLinearModel").getData().curveData);
			var curveData = this.getView().getModel("modCurveLinearModel").getData().curveData;
			var curveLength = this.getView().getModel("modCurveLinearModel").getData().curveData.length;
			var desc = this.getView().byId("desc").getValue();
			if (desc === "" || desc === undefined) {
				MessageBox.error("la descrizione è obbligatoria");
			} else {
		//	var pattern = RegExp('[0-9]+%{1}');
			for (var i = 0; i < curveLength; ++i) {
			/*	if (pattern.test(curveData[i].PERC_MBO) === false || pattern.test(curveData[i].VALORE_CURVA) === false) {
					f = 0;
					break;
				}*/
			//	curveData[i].PERC_MBO = curveData[i].PERC_MBO.split("%")[0];
				curveData[i].PERC_MBO = parseFloat(curveData[i].PERC_MBO);
			//	curveData[i].VALORE_CURVA = curveData[i].VALORE_CURVA.split("%")[0];
				curveData[i].VALORE_CURVA = parseFloat(curveData[i].VALORE_CURVA);
				if (isNaN(curveData[i].PERC_MBO) || isNaN(curveData[i].VALORE_CURVA)) {

					f = 0;
					break;
				} else
					f = 1;
			}
			if (f === 1)
				this.saveLinearCurve(curveData);
			else {
				MessageBox.error("l'input deve essere in numeri");
			}
			}
		},


		/****************************start of save functionality method****************************************/
		saveLinearCurve: function () {
			debugger
			var curveData = this.getView().getModel("modCurveLinearModel").getData().curveData;
			var curveLength = curveData.length;
			var curveResultJson = [];
			var curveResultJsonData = [];
			for (var i = 0; i < curveLength; ++i) {
				curveResultJsonData = {
					"PERC_MBO": curveData[i].PERC_MBO,
					"VALORE_CURVA": curveData[i].VALORE_CURVA
				};
				curveResultJson.push(curveResultJsonData);
			}
			var desc = this.getView().byId("desc").getValue();
			var periodiId = parseInt(sap.ui.getCore().getModel("BasicAppModel").getProperty("/0/FISCAL_YEAR"), 10);
			//           var selectedCurve=sap.ui.getCore().getModel("BasicAppModel").getProperty("/selectedCurve");
			var selectedCurve = Formatter.convertDescToIdTipo(sap.ui.getCore().getModel("BasicAppModel").getData().selectedCurve);
			if (selectedCurve === undefined)
				selectedCurve = 5;
			console.log(curveResultJson + desc + periodiId + selectedCurve);
			this.insertLinearCurve(curveResultJson, desc, periodiId, selectedCurve);
		},

		insertLinearCurve: function (curveResultJson, desc, periodiId, selectedCurve) {
			var idCurve = parseInt(sap.ui.getCore().getModel("BasicAppModel").getProperty("/curveId"), 10);
			debugger
			var that = this;
			console.log(curveResultJson);

			var perc_mbo = [],
				valore_curva = [],
				s_gradino = [];

			for (var i = 0; i < curveResultJson.length; i++) {
				perc_mbo.push(parseFloat(curveResultJson[i].PERC_MBO));
				valore_curva.push(parseFloat(curveResultJson[i].VALORE_CURVA));
				s_gradino.push(parseFloat(0));
			}

			var sPayload = {
				"ID_CURVA": idCurve,
				"ID_PERIODO": periodiId,
				"DESCR_CURVA": desc,
				"ID_TIPO_CURVA": selectedCurve,
				"PERC_MBO": perc_mbo,
				"VALORE_CURVA": valore_curva,
				"S_GRADINO": s_gradino,
				//           "SN_GATE":"",
				//           "SN_DESCRITTIVA":""
			};
			sPayload = JSON.stringify(sPayload);
			console.log(sPayload);
			console.log(JSON.stringify(sPayload));
			$.ajax({
				url: "/HANAMDC/STIP/STIPAdmin/services/modifica_curva.xsjs",
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
					//that.createLinearCurve();
					oMainModel.refresh();
					MessageBox.success("curva modificata con successo ");
					that.displayLinearCurveTb();

				},
				error: function (data, textStatus1) {
					debugger;
					console.log(data);
					MessageBox.error("Error while perfoming Salva operation. Please contact administrator.");
					jQuery.sap.log.getLogger().error("Salva operation failed" + textStatus1.toString());
				}
			});
		},
			showCurveTitle: function (curveDesc) {
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
				},
				title: {
					//	text: "Margin on KPI - tipo curva Linear",
				//	text: curveDesc + " - tipo curva Lineare/Pdecimale",
				text: curveDesc ,
					visible: true
				}
			});
				oVizFrame.setVizScales([{
				feed: "valueAxis",
				min: minPercMbo,
				max: maxPercMbo
			}]);

		},
		/****************************end of save functionality method****************************************/
		/********************************start of delete functionality methods *********************************/
		deleteCurveFn: function () {
			var that = this;
			var idCurve = sap.ui.getCore().getModel("BasicAppModel").getProperty("/curveId");
			sap.m.MessageBox.confirm("Sei sicuro di voler eliminare?", {
				actions: ["Si", sap.m.MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction == "NO") {
					//	that.cancel();
					} else if (oAction == "Si") {
						that.deleteCurve(idCurve);
					}

				}
			});
		},

		deleteCurve: function (idCurve) {
			debugger
			var that = this;
			var sPayload = {
				"ID_CURVA": idCurve
			};
			sPayload = JSON.stringify(sPayload);
			console.log(sPayload);
			console.log(JSON.stringify(sPayload));
			$.ajax({
				url: "/HANAMDC/STIP/STIPAdmin/services/delete_curve.xsjs",
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
						"Curva eliminata con successo", {
							onClose: function (oEvent) {
								debugger;
								console.log("Onclose");
								that.cancel();
								//var n = sap.ui.core.UIComponent.getRouterFor(that);
								//              n.navTo("Periodi");
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
		},
		/********************************end of delete functionality methods *********************************/
		cancel: function () {
			var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/0/FISCAL_YEAR");
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Curve", {
				curve: "Curve",
				str: selectedFYPeriodi
			});
		}
	});
});