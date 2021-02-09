sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";
var minPercMbo;
	var maxPercMbo;
	return Controller.extend("stipAdmin.stipAdmin.controller.curvaLineare_Pdecimale", {

		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("curvaLineare_Pdecimale").attachPatternMatched(this._onObjectMatched, this);

		},
		_onObjectMatched: function (t) {
			debugger
			var curveLinearData = {
				curveData: [{
					/*Performance: "%",
					Payout: "%"*/
					Performance: "",
					Payout: ""
				}]
			};
			this.byId("desc").setEditable(true);
			this.byId("Salva").setVisible(true);
			this.byId("idDeleteCol").setVisible(true);
			this.byId("idAddRow").setVisible(true);
			this.getView().byId("desc").setValue("");

			var oMainModel = new sap.ui.model.json.JSONModel();
			oMainModel.setData(
				curveLinearData
			);
			this.getView().setModel(oMainModel, "curveResultTableModel");
			this.getView().byId("idcolumn").setVisible(false);
			//           this.createLinearCurve();
		},
		validation: function () {
			debugger;
			var f;
			console.log(this.getView().getModel("curveResultTableModel").getData().curveData);
			var desc = this.getView().byId("desc").getValue();
			if (desc === "" || desc === undefined) {
				MessageBox.error("la descrizione è obbligatoria");
				//	break;
			} else {
				var curveData = this.getView().getModel("curveResultTableModel").getData().curveData;
				var curveLength = this.getView().getModel("curveResultTableModel").getData().curveData.length;
				//	var pattern = RegExp('[0-9]+%{1}');
				var pattern = RegExp('[0-9]');
				for (var i = 0; i < curveLength; ++i) {
					if (pattern.test(curveData[i].Payout) === false || pattern.test(curveData[i].Performance) === false) {
						f = 0;
						break;
					}
					//	curveData[i].Payout = curveData[i].Payout.split("%")[0];
					//	curveData[i].Performance = curveData[i].Performance.split("%")[0];
					curveData[i].Payout = parseFloat(curveData[i].Payout);
					curveData[i].Performance = parseFloat(curveData[i].Performance);
					if (isNaN(curveData[i].Payout) || isNaN(curveData[i].Performance)) {
						//	MessageBox.error("l'input deve essere in numeri");
						f = 0;
						break;
					} else
						f = 1;
				}
				if (f === 1)
					this.saveLinearCurve(curveData);
				else {
					if (f === 0)
						MessageBox.error("E' necessario inserire i punti della curva");

					var curveLinearData = {
						curveData: [{
							/*	Performance: "%",
								Payout: "%"*/
							Performance: "",
							Payout: ""
						}]
					};

					var oMainModel = new sap.ui.model.json.JSONModel();
					oMainModel.setData(
						curveLinearData
					);
					this.getView().setModel(oMainModel, "curveResultTableModel");
				}
			}
		},
		saveLinearCurve: function (curveData) {
			debugger
			this.getView().byId("idcolumn").setVisible(true);
			var curveLength = curveData.length;
			var curveResultJson = [];
			var curveResultJsonData = [];
				var curveMBOJson = [];
			for (var i = 0; i < curveLength; ++i) {
				curveResultJsonData = {
					"PERC_MBO": curveData[i].Performance,
					"VALORE_CURVA": curveData[i].Payout,
					//"S_GRADINO": curveData[i].Performance,
				};
				curveResultJson.push(curveResultJsonData);
					curveMBOJson.push(parseInt(curveData[i].Payout));
			}
				console.log(curveMBOJson);
					minPercMbo = Math.min.apply(null, curveMBOJson);
					maxPercMbo = Math.max.apply(null, curveMBOJson);
			var desc = this.getView().byId("desc").getValue();
			var periodiId = sap.ui.getCore().getModel("BasicAppModel").getProperty("/fiscalYear");
			//           var selectedCurve=sap.ui.getCore().getModel("BasicAppModel").getProperty("/selectedCurve");
			var selectedCurve = sap.ui.getCore().getModel("BasicAppModel").getData().selectedCurve;
			console.log(curveResultJson + desc + periodiId + selectedCurve);
			this.createLinearConsuntivoCurve(curveResultJson, desc, periodiId, selectedCurve);

		},
		createLinearConsuntivoCurve: function (curveResultJson, desc, periodiId, selectedCurve) {
			debugger
			console.log(curveResultJson);
			var that = this;

			var perc_mbo = [],
				valore_curva = [],
				s_gradino = [];

			for (var i = 0; i < curveResultJson.length; i++) {
				perc_mbo.push(parseFloat(curveResultJson[i].PERC_MBO));
				valore_curva.push(parseFloat(curveResultJson[i].VALORE_CURVA));
				s_gradino.push(parseFloat(0));
			}

			var sPayload = {
				"ID_PERIODO": periodiId,
				"DESCR_CURVA": desc,
				"ID_TIPO_CURVA": selectedCurve,
				"PERC_MBO": perc_mbo,
				"VALORE_CURVA": valore_curva,
				"S_GRADINO": s_gradino
			};
			sPayload = JSON.stringify(sPayload);
			console.log(sPayload);
			console.log(JSON.stringify(sPayload));
			$.ajax({
				url: "/HANAMDC/STIP/STIPAdmin/services/crea_curva.xsjs",
				//url: "/HANAMDC/STIP/STIPAdmin/services/test.xsjs",
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
					that.byId("desc").setEditable(false);
					that.byId("Salva").setVisible(false);
					that.byId("idDeleteCol").setVisible(false);
					that.byId("idAddRow").setVisible(false);
					MessageBox.success("curva creata con successo");
					that.displayLinearConsuntivoCurve(desc);

				},
				error: function (data, textStatus1) {
					debugger;
					console.log(data);
					MessageBox.error("Error while perfoming Salva operation. Please contact administrator.");
					jQuery.sap.log.getLogger().error("Salva operation failed" + textStatus1.toString());
				}
			});
		},

		displayLinearConsuntivoCurve: function (desc) {
			debugger
			this.getView().byId("idcolumn").setVisible(true);
			//      1.Get the id of the VizFrame
			debugger
			var oVizFrame = this.getView().byId("idcolumn");

			//      2.Create a JSON Model and set the data
			var oModel = new sap.ui.model.json.JSONModel();
			var data = this.getView().getModel("curveResultTableModel").getData().curveData;
			console.log(data);

			oModel.setData(data);

			//      3. Create Viz dataset to feed to the data to the graph
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: 'Performance',
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
			oVizFrame.setVizType('line');

			//      4.Set Viz properties
			oVizFrame.setVizProperties({
				plotArea: {
					//           colorPalette: d3.scale.category20().range()
					'colorPalette': ['RED', 'GREY', , 'BLUE', '#F5A9A9', 'BROWN'],
					'isRoundCorner': true,
					'drawingEffect': "glossy"
				},
				title: {
				//	text: desc + " - tipo curva Linear_PDecimale",
				text: desc ,
					visible: true
				}
			});

			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "valueAxis",
					'type': "Measure",
					'values': ["%Payout"]
				}),
				feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "categoryAxis",
					'type': "Dimension",
					'values': ["Performance"]
				});

			oVizFrame.addFeed(feedValueAxis);
			//           oVizFrame.addFeed(feedValueAxis1);
			oVizFrame.addFeed(feedCategoryAxis);
			oVizFrame.setVizScales([{
				feed: "valueAxis",
				min: minPercMbo,
				max: maxPercMbo
			}]);
		},

		addRow: function (t) {
			debugger;
			var e = this.getView().byId("tbl");
			var o = e.getModel("curveResultTableModel").getProperty("/curveData");
			//                         var o1 =this.getView().getModel("curveResultTableModel").getData();
			var i = {
				/*Performance: "%",
				Payout: "%"*/
				Performance: "",
				Payout: ""
			};
			o.push(i);
			e.getModel("curveResultTableModel").setProperty("/curveData", o)
		},
		removeRow: function (oEvent) {
			//	debugger;
			var e = this.getView().byId("tbl");
			var o = e.getModel("curveResultTableModel").getProperty("/curveData");
			//	console.log(o);
			var context = oEvent.getSource().getBindingContext("curveResultTableModel");
			var path = context.getPath();
			var pos1 = ("/curveData/").length;
			var length = path.length;
			var index = Number(path.substring(pos1, length));
			//	console.log(index);
			o.splice(index, 1)
				//	console.log(o);
			e.getModel("curveResultTableModel").setProperty("/curveData", o);
		},
		cancel: function () {
			var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/fiscalYear");
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Curve", {
				curve: "Curve",
				str: selectedFYPeriodi
			});
		}
	})
});