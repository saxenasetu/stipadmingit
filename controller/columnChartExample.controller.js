sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("stipAdmin.stipAdmin.controller.columnChartExample", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf stipAdmin.stipAdmin.view.columnChartExample
		 */
		onInit: function () {

			//      1.Get the id of the VizFrame		
			var oVizFrame = this.getView().byId("idcolumn");

			//      2.Create a JSON Model and set the data
			var oModel = new sap.ui.model.json.JSONModel();
			var data = {
				'stipData': [{
					"value1": "10",
					"Value": "70"
				
				}, {
					"value1": "20",
					"Value": "100"
				
				}, {
					"value1": "30",
					"Value": "120"
				
				}, {
					"value1": "40",
					"Value": "120"
				
				}, {
					"value1": "50",
					"Value": "120"
				
				}, ]
			};
			oModel.setData(data);

			//      3. Create Viz dataset to feed to the data to the graph
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: 'Achievement',
					value: "{value1}"
				}],

				measures: [{
					name: 'STIP',
					value: '{Value}'
				}
				],

				data: {
					path: "/stipData"
				}
			});
			oVizFrame.setDataset(oDataset);
			oVizFrame.setModel(oModel);
		//	oVizFrame.setVizType('column');
		//	oVizFrame.setVizType('bar');
		oVizFrame.setVizType('line');

			//      4.Set Viz properties
			oVizFrame.setVizProperties({
				plotArea: {
				//	colorPalette: d3.scale.category20().range()
				'colorPalette': ['GREY', 'RED', ,'BLUE', '#F5A9A9', 'BROWN'],
                        'isRoundCorner': true,
                        'drawingEffect': "glossy"
				},
				title: {
					text: "Margin on KPI - tipo curva Discreta",
					visible: true
				}
			});

			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "valueAxis",
					'type': "Measure",
					'values': ["STIP"]
				}),
				feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "categoryAxis",
					'type': "Dimension",
					'values': ["Achievement"]
				});
			/*	feedValueAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["Sugar"]
				}); */
			oVizFrame.addFeed(feedValueAxis);
		//	oVizFrame.addFeed(feedValueAxis1);
			oVizFrame.addFeed(feedCategoryAxis);
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf stipAdmin.stipAdmin.view.columnChartExample
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf stipAdmin.stipAdmin.view.columnChartExample
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf stipAdmin.stipAdmin.view.columnChartExample
		 */
		//	onExit: function() {
		//
		//	}

	});

});