sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/MessageBox"], function (o, MessageBox) {
	"use strict";
	var oMainModel = new sap.ui.model.json.JSONModel();
	var flagHrAdmin, flagHrBp, flagHr, flagPCO;
	flagHr = sap.ui.getCore().getModel("EmpAuthoModel").getData()[0].ROLE_HR;
	flagHrAdmin = sap.ui.getCore().getModel("EmpAuthoModel").getData()[0].ROLE_HR_ADMIN;
	flagHrBp = sap.ui.getCore().getModel("EmpAuthoModel").getData()[0].ROLE_HRBP;
	flagPCO = sap.ui.getCore().getModel("EmpAuthoModel").getData()[0].ROLE_PCO;
	return o.extend("stipAdmin.stipAdmin.controller.Home", {
		onInit: function () {
			this.busyDialog = new sap.m.BusyDialog();
			//	debugger
			//Role and Authorization of STIP
			/**********************************Start of Periodi Module******************************************/
			if (flagHrAdmin === "X")
				this.byId("periodiTile").setVisible(true);
			else
				this.byId("periodiTile").setVisible(false);
			/**********************************End of Periodi Module******************************************/
			/**********************************Start of Gruppi Module******************************************/
			if (flagHrAdmin === "X")
				this.byId("gruppiTile").setVisible(true);
			else
				this.byId("gruppiTile").setVisible(false);
			/**********************************End of Gruppi Module******************************************/
			/**********************************Start of Curve Module******************************************/
			if (flagHrAdmin === "X")
				this.byId("curveTile").setVisible(true);
			else
				this.byId("curveTile").setVisible(false);
			/**********************************End of Curve Module******************************************/
			/**********************************Start of SchedaMasterTile Module******************************************/
			if (flagHrAdmin === "X")
				this.byId("SchedaMasterTile").setVisible(true);
			else
				this.byId("SchedaMasterTile").setVisible(false);
			/**********************************End of SchedaMasterTile Module******************************************/
			/**********************************Start of gestioneListeTile Module******************************************/
			if (flagHrAdmin === "X")
				this.byId("gestioneListeTile").setVisible(true);
			else
				this.byId("gestioneListeTile").setVisible(false);
			/**********************************End of gestioneListeTile Module******************************************/
			/**********************************Start of TracciatureModifiche Module******************************************/
			if (flagHrAdmin === "X")
				this.byId("tracciatureModificheTile").setVisible(true);
			else
				this.byId("tracciatureModificheTile").setVisible(false);
			/**********************************End of TracciatureModifiche Module******************************************/
			/**********************************Start of anagraficaPayoutTile Module******************************************/
			if (flagHrAdmin === "X")
				this.byId("anagraficaPayoutTile").setVisible(true);
			else
				this.byId("anagraficaPayoutTile").setVisible(false);
			/**********************************End of anagraficaPayoutTile Module******************************************/
			/**********************************Start of moltiplocatore Module*********************************************/
			//HR this role can’t access to the moltiplicatore functionality 
			if (flagHrAdmin === "X")
				this.byId("moltiplocatoreTile").setVisible(true);
			else if (flagHr === "X")
				this.byId("moltiplocatoreTile").setVisible(false);
			else
				this.byId("moltiplocatoreTile").setVisible(true);
			/**********************************End of moltiplocatore Module******************************************/
			//finance role must not see absolutely and must not have the access to the following tiles: schede personali, gestione lettere, blocca kpi e schede, elabora Consuntivazione
			if (flagPCO === "X") {
				this.byId("schedePersonaliTile").setVisible(false);
				this.byId("gestioneLettereTile").setVisible(false);
				this.byId("bloccaCongelaTile").setVisible(false);
				this.byId("elaboraConsuntivazioneTile").setVisible(false);
			} else {

				if (flagHrAdmin === "X") {
					this.byId("schedePersonaliTile").setVisible(true);
					this.byId("gestioneLettereTile").setVisible(true);
				}
				this.byId("bloccaCongelaTile").setVisible(true);
				this.byId("elaboraConsuntivazioneTile").setVisible(true);
			}

			//Abilitazione utenze will be used by user that have role ROLE_MANAGER_SYS
			if (flagHrBp === "X")
				this.byId("UserTile").setVisible(true);
			else
				this.byId("UserTile").setVisible(false);
			//End of Role and Authorization of STIP
			this.geFiscalYear();
			//	oMainModel.refresh(true);
			//	this.byId("fiscalYear").setSelectedKey("Fiscal Year 2019 - 2020");
		},
		/******************** onHome function is used to navigate the user back to the STIPLandingPage************************/
		onHome: function () {
			//Pre-prod url
			sap.m.URLHelper.redirect("https://stiplandingpage-bfmyao56da.dispatcher.hana.ondemand.com", false);
		
			//prod url
		},
		geFiscalYear: function () {
			//	debugger
			var that = this;
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");

			xsoDataModel.attachRequestSent(function () {
				that.busyDialog.open();
			});
			xsoDataModel.attachRequestCompleted(function () {
				that.busyDialog.close();
			});

			var periodiRiferimentoGetJson = [];

			var periodiRiferimentoGetJsonData = {};
			xsoDataModel.read("/PERIODI_RIFERIMENTO?$format=json", {
				//filters: oFilters,
				success: function (oDataIn, oResponse) {
					console.log(oDataIn);
					//	debugger
					var lastIndex = oDataIn.results.length - 1;
					var defaultFiscalYear = oDataIn.results[lastIndex].ID_PERIODO;
					this.byId("fiscalYear").setSelectedKey(defaultFiscalYear);
					for (var i = 0; i < oDataIn.results.length; ++i) {
						periodiRiferimentoGetJsonData = {
							"DESCR_PERIODO": oDataIn.results[i].DESCR_PERIODO,
							"ID_PERIODO": oDataIn.results[i].ID_PERIODO,
						};
						periodiRiferimentoGetJson.push(periodiRiferimentoGetJsonData);
						console.log(periodiRiferimentoGetJson);
						//	periodiJsonData = {};
					}
					console.log(periodiRiferimentoGetJson);
					oMainModel.setData(
						periodiRiferimentoGetJson
					);
					this.getView().setModel(oMainModel, "PeriodiModel");
				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed while getting PERIODI_RIFERIMENTO. Please contact administrator.");
					jQuery.sap.log.getLogger().error("PERIODI_RIFERIMENTO fetch failed" + oError.toString());
				}.bind(this)
			});

		},
		pressPiste: function (o) {
			this.busyDialog.open();
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/PisteChange", true);
			var selectedFYPeriodi = this.getView().byId("fiscalYear").getSelectedKey();
			if (selectedFYPeriodi) {
				sap.ui.core.UIComponent.getRouterFor(this).navTo("Piste", {
					Piste: "Piste",
					str: selectedFYPeriodi,
					from: "Home"
				});
			}
			this.busyDialog.close();

		},
		pressMaster: function (o) {
			this.busyDialog.open();
			var ojsonmodel = new sap.ui.model.json.JSONModel();
			ojsonmodel.setData(this.getView().byId("fiscalYear")._getSelectedItemText());
			sap.ui.getCore().setModel(ojsonmodel, "fiscalyear");
			var selectedFYPeriodi = this.getView().byId("fiscalYear").getSelectedKey();
			console.log(selectedFYPeriodi);
			sap.ui.core.UIComponent.getRouterFor(this).navTo("SchedaMaster", {
				master: "SchedaMaster",
				str: selectedFYPeriodi
			});
			this.busyDialog.close();
		},
		pressGate: function (o) {
			this.busyDialog.open();
			var selectedFYPeriodi = this.getView().byId("fiscalYear").getSelectedKey();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Gate", {
				gate: "Gate",
				str: selectedFYPeriodi
			});
			this.busyDialog.close();
		},
		pressGruppi: function (o) {
			var selectedFYPeriodi = this.getView().byId("fiscalYear").getSelectedKey();
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Gruppi", {
				gruppi: "Gruppi",
				str: selectedFYPeriodi
			});
			this.busyDialog.close();
		},
		pressPeriodi: function (o) {
			debugger

			this.busyDialog.open();

			/*	if (flagHrBp === "X") {
					MessageBox.error(
						"Authorization check failed. Please contact Administrator"
					);
				} else {
					if (flagPCO === "X") {*/
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Periodi", {
				Periodi: "Periodi"
			});
			/*	} else
					MessageBox.error(
						"Authorization check failed. Please contact Administrator"
					);
			}*/
			this.busyDialog.close();
		},

		pressReport: function (o) {
			var ojsonmodel = new sap.ui.model.json.JSONModel();
			ojsonmodel.setData(this.getView().byId("fiscalYear")._getSelectedItemText());
			var selectedFYPeriodi = this.getView().byId("fiscalYear").getSelectedKey();
			sap.ui.getCore().setModel(ojsonmodel, "fiscalyear");
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Reports", {
				
				IdPeriodo: selectedFYPeriodi,
				str: ojsonmodel.oData
			});
			this.busyDialog.close();
		},
		pressCurve: function (o) {
			this.busyDialog.open();
			var selectedFYPeriodi = this.getView().byId("fiscalYear").getSelectedKey();
			console.log(selectedFYPeriodi);
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Curve", {
				curve: "Curve",
				str: selectedFYPeriodi
			});
			this.busyDialog.close();
		},
		pressSchedaPersonale: function (o) {
			var selectedFYPeriodi = this.getView().byId("fiscalYear").getSelectedKey();
			var ojsonmodel = new sap.ui.model.json.JSONModel();
			ojsonmodel.setData(this.getView().byId("fiscalYear")._getSelectedItemText());
			sap.ui.getCore().setModel(ojsonmodel, "fiscalyear");
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("SchedaPersonale", {
				schedaPersonale: "SchedaPersonale",
				str: selectedFYPeriodi
			});
			this.busyDialog.close();
		},
		pressTemplateLettrre: function (o) {
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("TemplateLettere", {
				TemplateLettere: "TemplateLettere"
			});
			this.busyDialog.close();
		},
		pressAnagraficaPayout: function (oEvent) {
			//var ojsonmodel = new sap.ui.model.json.JSONModel();
			//ojsonmodel.setData(this.getView().byId("fiscalYear")._getSelectedItemText());
			//sap.ui.getCore().setModel(ojsonmodel, "fiscalyear");
			this.busyDialog.open();
			var selectedFYPeriodi = this.getView().byId("fiscalYear").getSelectedKey();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("AnagraficaPayout", {
				str2: "AnagraficaPayout",
				str: selectedFYPeriodi
			});
			this.busyDialog.close();
		},
		pressGestioneListediesclusione: function (oEvent) {
			var ojsonmodel2 = new sap.ui.model.json.JSONModel();
			ojsonmodel2.setData(this.getView().byId("fiscalYear")._getSelectedItemText());
			sap.ui.getCore().setModel(ojsonmodel2, "fiscalyear");
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("GestioneListclus", {
				GestioneListclus: "GestioneListclus"
			});
			this.busyDialog.close();

		},
		pressBloccaCongela: function (oEvent) {
			var ojsonmodel2 = new sap.ui.model.json.JSONModel();
			ojsonmodel2.setData(this.getView().byId("fiscalYear")._getSelectedItemText());
			sap.ui.getCore().setModel(ojsonmodel2, "fiscalyear");
			var selectedFYPeriodi = this.getView().byId("fiscalYear").getSelectedKey();
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("BloccaCongela", {
				BloccaCongela: "BloccaCongela",
				str: selectedFYPeriodi
			});
			this.busyDialog.close();

		},
		pressEffettuaConsuntivazioneReale: function (oEvent) {
			this.busyDialog.open();
			var selectedFYPeriodi = this.getView().byId("fiscalYear").getSelectedKey();
			if (selectedFYPeriodi) {
				sap.ui.core.UIComponent.getRouterFor(this).navTo("EffettuaReale", {
					Piste: "EffettuaReale",
					ID: selectedFYPeriodi
				});
			}
			this.busyDialog.close();

		},
		pressEffettuaConsuntivazioneSim: function (oEvent) {
			this.busyDialog.open();
			var selectedFYPeriodi = this.getView().byId("fiscalYear").getSelectedKey();
			if (selectedFYPeriodi) {
				sap.ui.core.UIComponent.getRouterFor(this).navTo("EffettuaSimulata", {
					Piste: "EffettuaSimulata",
					ID: selectedFYPeriodi
				});
			}
			this.busyDialog.close();

		},
		pressUser: function (oEvent) {
			this.busyDialog.open();

			sap.ui.core.UIComponent.getRouterFor(this).navTo("User");

			this.busyDialog.close();

		},
		pressGestCons: function (oEvent) {
			this.busyDialog.open();
			var selectedFYPeriodi = this.getView().byId("fiscalYear").getSelectedKey();
			if (selectedFYPeriodi) {
				sap.ui.core.UIComponent.getRouterFor(this).navTo("GestioneConsuntivazione", {
					GestioneConsuntivazione: "GestioneConsuntivazione",
					str: selectedFYPeriodi
				});
			}
			this.busyDialog.close();

		},
		pressTraccMod: function (oEvent) {
			this.busyDialog.open();
			var selectedFYPeriodi = this.getView().byId("fiscalYear").getSelectedKey();
			if (selectedFYPeriodi) {
				sap.ui.core.UIComponent.getRouterFor(this).navTo("TraccMod", {
					TraccMod: "TraccMod",
					str: selectedFYPeriodi
				});
			}
			this.busyDialog.close();

		}
	});
});