sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("stipAdmin.stipAdmin.controller.ReportDetail", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf stipAdmin.stipAdmin.view.ReportDetail
		 */
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("ReportDetail").attachPatternMatched(this._onObjectMatched, this);

		},

		_onObjectMatched: function (oEvent) {

			var oScreen = oEvent.getParameter("arguments").str;
			if (oScreen == "1") {
				this.getView().byId("vbx1").setVisible(true);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
			} else if (oScreen == "2") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(true);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
			} else if (oScreen == "3") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(true);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
			} else if (oScreen == "4") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(true);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
			} else if (oScreen == "5") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(true);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
			} else if (oScreen == "6") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(true);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
			} else if (oScreen == "7") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(true);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
			} else if (oScreen == "8") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(true);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
			} else if (oScreen == "9") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(true);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
			} else if (oScreen == "10") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(true);
				this.getView().byId("vbx11").setVisible(false);
			} else if (oScreen == "11") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(true);
			}
		}
	});

});