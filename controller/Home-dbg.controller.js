sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("stipAdmin.stipAdmin.controller.Home", {
		onInit: function () {
			this.busyDialog = new sap.m.BusyDialog();
		},
		pressPiste: function (oEvent) {
			this.busyDialog.open();
			// sap.ui.core.UIComponent.getRouterFor(this).navTo("Piste", {
			// 	piste: "Piste"
			// });

			this.getOwnerComponent().getRouter().navTo("Piste", this); 

			this.busyDialog.close();
		},
		pressMaster: function (oEvent) {
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("SchedaMaster", {
				master: "SchedaMaster"
			});
			this.busyDialog.close();
		},

		pressGate: function (oEvent) {
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Gate", {
				gate: "Gate"
			});
			this.busyDialog.close();
		},
		pressGruppi: function (oEvent) {
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Gruppi", {
				gruppi: "Gruppi"
			});
			this.busyDialog.close();
		},

		pressPeriodi: function (oEvent) {
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Periodi", {
				Periodi: "Periodi"
			});
			this.busyDialog.close();
		},


		pressReport: function (oEvent) {
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Reports", {
				Reports: "Reports"
			});
			this.busyDialog.close();
		},
		
		
		pressCurve: function (oEvent) {
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Curve", {
				curve: "Curve"
			});
			this.busyDialog.close();
		}
	});
});