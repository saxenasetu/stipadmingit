sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/Device"
], function (Controller, Device) {
	"use strict";

	return Controller.extend("stipAdmin.stipAdmin.controller.Periodi", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf stipAdmin.stipAdmin.view.Periodi
		 */
		onInit: function () {
			this.busyDialog = new sap.m.BusyDialog();
			this.getOwnerComponent().getRouter().getRoute("Periodi").attachPatternMatched(this._onObjectMatched, this);
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf stipAdmin.stipAdmin.view.Periodi
		 */
		//	onBeforeRendering: function() {
		//
		//	},
		_onObjectMatched: function (oEvent) {

		},

		handleAggiungi: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("createPeriodi");

		},
		

		handleModifica: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("modPeriodi");

		}

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf stipAdmin.stipAdmin.view.Periodi
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf stipAdmin.stipAdmin.view.Periodi
		 */
		//	onExit: function() {
		//
		//	}

	});

});