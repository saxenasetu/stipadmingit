sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "stipAdmin/stipAdmin/util/Formatter"], function (e, t, i) {
	"use strict";
	return e.extend("stipAdmin.stipAdmin.controller.Reports", {
		formatter: i,
		/**
		 *  Called upon initialization of view
		 * Contains data to display the list of reports
		 * Event handler when the route has a matching pattern
		 **/
		onInit: function () {
			debugger;
			this.oData = {
				ReportCollection: [{
						Key: "1",
						Name: "KPI non associati a Schede Master",
						Name1: ""
					}, {
						Key: "2",
						Name: "KPI senza curva",
						Name1: ""
					}, {
						Key: "3",
						Name: "KPI con Obiettivo mancante",
						Name1: ""
					}, {
						Key: "4",
						Name: "KPI con Consuntivo mancante",
						Name1: ""
					}, {
						Key: "5",
						Name: "Schede Master non associate ad alcun titolare",
						Name1: ""
					}, {
						Key: "6",
						Name: "Titolari di Scheda coperta parzialmente da Base STIP",
						Name1: ""
					},
					/*{
					Key: "7",
					Name: "Dip. con PERC STIP RAL coperta parzialmente da SCHEDA STIP",
					Name1: ""
				},*/
					{
						Key: "8",
						Name: "Titolari con Base STIP coperta parzialmente da Scheda",
						Name1: ""
					},
					/*{
					Key: "9",
					Name: "Dip. con scheda personale P4P con P4P disabilitato (flag P4P NO)",
					Name1: ""
				},*/
					{
						Key: "10",
						Name: "Payout liquidato per Dipendente",
						Name1: ""
					},
					/* {
										Key: "11",
										Name: "Check di Controllo su PD Rating p4p Flexing",
										Name1: ""
									},*/
					{
						Key: "12",
						Name: "KPI con sub-KPI",
						Name1: ""
					}, {
						Key: "13",
						Name: "Report analisi Curve",
						Name1: ""
					}, {
						Key: "14",
						Name: "Report analisi Schede Master",
						Name1: ""
					}, {
						Key: "15",
						Name: "Report analisi KPI",
						Name1: ""
					}, {
						Key: "16",
						Name: "Titolari di Scheda personale e/o gestionale",
						Name1: ""
					}, {
						Key: "17",
						Name: "Risultato ponderato per Scheda Master",
						Name1: ""
					}, {
						Key: "18",
						Name: "Consuntivi per Periodo",
						Name1: "n.b Importi calcolati mediante funzionalità (Effettua Consuntivazione)"
					}, {
						Key: "19",
						Name: "Consuntivi FY",
						Name1: "n.b Importi calcolati mediante funzionalità (Effettua Consuntivazione)"
					}, {
						Key: "20",
						Name: "Consuntivi Generali",
						Name1: "n.b Importi calcolati mediante funzionalità (Effettua Consuntivazione)"
					}
				]
			};

			this.busyDialog = new sap.m.BusyDialog();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var e = new t(this.oData);
			this.getView().setModel(e);
			this.oRouter.getRoute("Reports").attachPatternMatched(this._onMasterMatched, this);
		},
		/**
		 *  Navigate back to the Home page
		 **/
		onHomePage: function (oEvent) {
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
			this.busyDialog.close();
		},
		/**
		 *  Navigate back to the Home page
		 **/
		handleBack: function (oEvent) {
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
			this.busyDialog.close();
		},
		/**
		 *  Retrieve the PeriodoID and the Fiscal year
		 **/
		_onMasterMatched: function (e) {
			debugger;
			this.str = e.getParameter("arguments").str;
			this.IdPeriodo = e.getParameter("arguments").IdPeriodo;
			var t = this.getView().byId("list");
			this.getView().byId("idtxtfiscalyear").setText(this.str);
			//this.showDetail(this, t)
		},
		/**
		 *  Called on selecting a report from the report list displayed
		 **/
		onSelectionChange: function (e) {
			var t = this.getView().byId("list");
			this.showDetail(e.getParameter("listItem") || e.getSource(), t)
		},
		/**
		 *  Navigate to the selected report page from the report list displayed
		 **/
		showDetail: function (e, t) {
			debugger;
			var i;
			var z = this.byId('idtxtfiscalyear').getText();
			if (t.getSelectedItem()) {
				if (e.getTitle() == "KPI non associati a Schede Master") {
					i = "1";
					this.oRouter.navTo("KPInonAssociatiSchedeMaster", {
						str: z,
						IdPeriodo: this.IdPeriodo
					});
				}
				if (e.getTitle() == "KPI senza curva") {
					i = "2";
					this.oRouter.navTo("KPIsenzacurva", {
						str: z,
						IdPeriodo: this.IdPeriodo
					});
				}
				if (e.getTitle() == "KPI con Obiettivo mancante") {
					i = "3";
					this.oRouter.navTo("KPIconObiettivoMancante", {
						str: z,
						IdPeriodo: this.IdPeriodo
					});
				}
				if (e.getTitle() == "KPI con Consuntivo mancante") {
					i = "4";
					this.oRouter.navTo("KPIconConsuntivoMancante", {
						str: z,
						IdPeriodo: this.IdPeriodo
					});
				}
				if (e.getTitle() == "Schede Master non associate ad alcun titolare") {
					i = "5";
					this.oRouter.navTo("SchedeMasterCuiNonEAssociatoalcundipendente", {
						str: z,
						IdPeriodo: this.IdPeriodo
					});
				}
				if (e.getTitle() == "Titolari di Scheda coperta parzialmente da Base STIP") {
					i = "6";
				}
				/*	if (e.getTitle() == "Dip. con PERC STIP RAL coperta parzialmente da SCHEDA STIP") {
						i = "7";
					}*/
				if (e.getTitle() == "Titolari con Base STIP coperta parzialmente da Scheda") {
					i = "8";
				}
				/*	if (e.getTitle() == "Dip. con scheda personale P4P con P4P disabilitato (flag P4P NO)") {
						i = "9";
					}*/
				if (e.getTitle() == "Payout liquidato per Dipendente") {
					i = "10";
				}
				/*if (e.getTitle() == "Check di Controllo su PD Rating p4p Flexing") {
					i = "11";
				}*/
				if (e.getTitle() == "KPI con sub-KPI") {
					i = "12";
					this.oRouter.navTo("KpiConSubKpi", {
						str: z,
						IdPeriodo: this.IdPeriodo
					});
				}
				if (e.getTitle() == "Report analisi Curve") {
					i = "13";
					this.oRouter.navTo("ReportAnalisiCurve", {
						str: z,
						IdPeriodo: this.IdPeriodo
					});
				}
				if (e.getTitle() == "Report analisi Schede Master") {
					i = "14";
					this.oRouter.navTo("ReportIncrociSchede", {
						str: z,
						IdPeriodo: this.IdPeriodo
					});
				}
				if (e.getTitle() == "Report analisi KPI") {
					i = "15";
				}
				if (e.getTitle() == "Titolari di Scheda personale e/o gestionale") {
					i = "16";
				}
				if (e.getTitle() == "Risultato ponderato per Scheda Master") {
					i = "17";
				}
				if (e.getTitle() == "Consuntivi per Periodo") {
					i = "18";
				}
				if (e.getTitle() == "Consuntivi FY") {
					i = "19";
				}
				if (e.getTitle() == "Consuntivi Generali") {
					i = "20";
				}
			}
			/*else {
				t.setSelectedItem(t.getItems()[1]);
				i = "1";
				this.oRouter.navTo("ReportDetail", {
					str: i
				})
			}*/
		}
	});
});

/**************Comment added by Shreya - 07/01/2021*****************/