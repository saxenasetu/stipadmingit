sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"stipAdmin/stipAdmin/model/models",
], function (Controller, JSONModel, formatter) {
	"use strict";

	return Controller.extend("stipAdmin.stipAdmin.controller.Reports", {
	formatter: formatter,
		onInit: function () {

			this.oData = {
				"ReportCollection": [{
					"Key": "1",
					"Name": "Report exHRA",
					"Name1": ""
				}, {
					"Key": "2",
					"Name": "check di controllo su PD Rating p4p Flexing",
					"Name1": ""

				}, {
					"Key": "3",
					"Name": "Piste con sottopste",
					"Name1": ""
				}, {
					"Key": "4",
					"Name": "Curve",
					"Name1": ""
				}, {
					"Key": "5",
					"Name": "Incroci Schede Master / Piste",
					"Name1": ""
				}, {
					"Key": "6",
					"Name": "Piste /  Titolari",
					"Name1": ""
				}, {
					"Key": "7",
					"Name": "Dipendenti dotati di Scheda(personale e/o gestionalte)",
					"Name1": ""
				}, {
					"Key": "8",
					"Name": "Risultati per Schede Master",
					"Name1": ""
				}, {
					"Key": "9",
					"Name": "CONSUNTIVO per periodo di consuntivazione n.b. Importi Calcolati mediante funzionalta(Effettua consuntivazione)",
					"Name1": "n.b. Importi Calcolati mediante funzionalta(Effettua consuntivazione)"
				}, {
					"Key": "10",
					"Name": "CONSUNTIVO Totale FY n.b. Importi Calcolati mediante funzionalta(Effettua consuntivazione)",
					"Name1": "n.b. Importi Calcolati mediante funzionalta(Effettua consuntivazione)"
				}, {
					"Key": "11",
					"Name": "CONSUNTIVO Generale n.b. Importi Calcolati mediante funzionalta(Effettua consuntivazione)",
					"Name1": "n.b. Importi Calcolati mediante funzionalta(Effettua consuntivazione)"
				}]
			};
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oModel = new JSONModel(this.oData);
			this.getView().setModel(oModel);
			this.oRouter.getRoute("Reports").attachPatternMatched(this._onMasterMatched, this);
		},
		_onMasterMatched: function (oEvent) {
			var Object = this.getView().byId("list");
			this.showDetail(this, Object);
		},
		onSelectionChange: function (oEvent) {
			var Object = this.getView().byId("list");
			this.showDetail(oEvent.getParameter("listItem") || oEvent.getSource(), Object);
		},
		showDetail: function (oItem, oList) {
			var oTitle;
			if (oList.getSelectedItem()) {
				if (oItem.getTitle() == "Report exHRA") {
					oTitle = "1";
				}
				if (oItem.getTitle() == "check di controllo su PD Rating p4p Flexing") {
					oTitle = "2";
				}
				if (oItem.getTitle() == "Piste con sottopste") {
					oTitle = "3";
				}
				if (oItem.getTitle() == "Curve") {
					oTitle = "4";
				}
				if (oItem.getTitle() == "Incroci Schede Master / Piste") {
					oTitle = "5";
				}
				if (oItem.getTitle() == "Piste /  Titolari") {
					oTitle = "6";
				}
				if (oItem.getTitle() == "Dipendenti dotati di Scheda(personale e/o gestionalte)") {
					oTitle = "7";
				}
				if (oItem.getTitle() == "Risultati per Schede Master") {
					oTitle = "8";
				}
				if (oItem.getTitle() == "CONSUNTIVO per periodo di consuntivazione ") {
					oTitle = "9";
				}
				if (oItem.getTitle() == "CONSUNTIVO Totale FY ") {
					oTitle = "10";
				}
				if (oItem.getTitle() == "CONSUNTIVO Generale ") {
					oTitle = "11";
				}
				this.oRouter.navTo("ReportDetail", {
					str: oTitle

				});
			} else {
				oList.setSelectedItem(oList.getItems()[1]);
				
			    oTitle = "1";
				this.oRouter.navTo("ReportDetail", {
					str: oTitle

				});
			
			}
		}
	});

});