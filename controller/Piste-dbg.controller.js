sap.ui.define([
	"sap/m/TablePersoController",
	"./DemoPersoService",
	"./Formatter",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (TablePersoController, DemoPersoService, Formatter, Controller, JSONModel) {
	"use strict";

	return Controller.extend("stipAdmin.stipAdmin.controller.Piste", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf stipAdmin.stipAdmin.view.Piste
		 */
		onInit: function () {
			this.busyDialog = new sap.m.BusyDialog();
			this.getOwnerComponent().getRouter().getRoute("Piste").attachPatternMatched(this._onObjectMatched, this);
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			var oGroupingModel = new JSONModel({
				hasGrouping: false
			});
			this.getView().setModel(oModel);
			this.getView().setModel(oGroupingModel, "Grouping");

			// init and activate controller
			this._oTPC = new TablePersoController({
				table: this.byId("productsTable"),
				//specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
				componentName: "demoApp",
				persoService: DemoPersoService
			}).activate();
		},

		onPersoButtonPressed: function (oEvent) {
			this._oTPC.openDialog();
		},

		onTablePersoRefresh: function () {
			DemoPersoService.resetPersData();
			this._oTPC.refresh();
		},

		onTableGrouping: function (oEvent) {
			this._oTPC.setHasGrouping(oEvent.getSource().getSelected());
		},
		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {

		},

		handleAggiungi: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("createPiste");

		},
		handleModifica: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("modPista");

		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf stipAdmin.stipAdmin.view.Piste
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf stipAdmin.stipAdmin.view.Piste
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf stipAdmin.stipAdmin.view.Piste
		 */
		//	onExit: function() {
		//
		//	}

	});

});