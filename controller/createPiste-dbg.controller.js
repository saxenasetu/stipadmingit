sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("stipAdmin.stipAdmin.controller.createPiste", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf stipAdmin.stipAdmin.view.createPiste
		 */
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("createPiste").attachPatternMatched(this._onObjectMatched, this);
			this._data = {
				Products: [

					{
						Peso: "",
						Curva: "",
						Gate: "",
						Descrizione: ""
					}
				]
			};
			this.jModel = new sap.ui.model.json.JSONModel();
			this.jModel.setData(this._data);
			this.getView().byId("tbl").setModel(this.jModel);
		},

		_onObjectMatched: function (oEvent) {

		},
		addRow: function (oArg) {
			var oTable = this.getView().byId("tbl");
			var oModel = oTable.getModel().getProperty("/Products");
			var oNewObject = {
				Risultato: "",
				Stip: ""
			};
			oModel.push(oNewObject);
			oTable.getModel().setProperty("/Products", oModel);
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf stipAdmin.stipAdmin.view.createPiste
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf stipAdmin.stipAdmin.view.createPiste
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf stipAdmin.stipAdmin.view.createPiste
		 */
		//	onExit: function() {
		//
		//	}

	});

});