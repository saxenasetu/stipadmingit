sap.ui.define(['jquery.sap.global'],
	function (jQuery) {
		"use strict";
		var oResource;
		oResource = new sap.ui.model.resource.ResourceModel({
			bundleName: "STIP.STIPGestioneConsuntivazione.i18n.i18n"
		}).getResourceBundle();

		var GesConsuntiviSimTable = {
			oData: {
				_persoSchemaVersion: "1.0",
				aColumns: [{
					id: "GestioneConsuntivazione-idTable5-col24",
					order: 23,
					text: oResource.getText("SelDelSel"),
					visible: true
				}, {
					id: "GestioneConsuntivazione-idTable5-col25",
					order: 24,
					text: oResource.getText("GesConD"),
					visible: true
				}, {
					id: "GestioneConsuntivazione-idTable5-col26",
					order: 25,
					text: oResource.getText("DataDim"),
					visible: true
				}, {
					id: "GestioneConsuntivazione-idTable5-col27",
					order: 26,
					text: oResource.getText("InvioPS"),
					visible: true
				}, {
					id: "GestioneConsuntivazione-idTable5-col28",
					order: 27,
					text: oResource.getText("GesConMatr"),
					visible: true
				}, {
					id: "GestioneConsuntivazione-idTable5-col29",
					order: 28,
					text: oResource.getText("GesConDipendente"),
					visible: true
				}, {
					id: "GestioneConsuntivazione-idTable5-col30",
					order: 29,
					text: oResource.getText("Q"),
					visible: true
				}, {
					id: "GestioneConsuntivazione-idTable5-col31",
					order: 30,
					text: oResource.getText("Schede"),
					visible: true
				}, {
					id: "GestioneConsuntivazione-idTable5-col32",
					order: 31,
					text: oResource.getText("Gest"),
					visible: true
				}, {
					id: "GestioneConsuntivazione-idTable5-col33",
					order: 32,
					text: oResource.getText("NonAttig"),
					visible: true
				}, {
					id: "GestioneConsuntivazione-idTable5-col34",
					order: 33,
					text: oResource.getText("NCons."),
					visible: true
				}, {
					id: "GestioneConsuntivazione-idTable5-col35",
					order: 34,
					text: oResource.getText("ImpSim"),
					visible: true
				}, {
					id: "GestioneConsuntivazione-idTable5-col36",
					order: 35,
					text: oResource.getText("%StipSim"),
					visible: true
				}, {
					id: "GestioneConsuntivazione-idTable5-col37",
					order: 36,
					text: oResource.getText("TettoPaySim"),
					visible: true
				}, {
					id: "GestioneConsuntivazione-idTable5-col38",
					order: 37,
					text: oResource.getText("ImpLiqSim"),
					visible: true
				}, {
					id: "GestioneConsuntivazione-idTable5-col39",
					order: 38,
					text: oResource.getText("%LiqSim"),
					visible: true
				}, {
					id: "GestioneConsuntivazione-idTable5-col40",
					order: 39,
					text: oResource.getText("ModiffSim"),
					visible: true
				}]
			},

			getPersData: function () {
				var oDeferred = new jQuery.Deferred();
				if (!this._oBundle) {
					this._oBundle = this.oData;
				}
				var oBundle = this._oBundle;
				oDeferred.resolve(oBundle);
				return oDeferred.promise();
			},

			setPersData: function (oBundle) {
				var oDeferred = new jQuery.Deferred();
				this._oBundle = oBundle;
				oDeferred.resolve();
				return oDeferred.promise();
			},

			resetPersData: function () {
				var oDeferred = new jQuery.Deferred();
				var oInitialData = {
					_persoSchemaVersion: "1.0",
					aColumns: [

						{
							id: "GestioneConsuntivazione-idTable5-col24",
							order: 23,
							text: oResource.getText("SelDelSel"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col25",
							order: 24,
							text: oResource.getText("GesConD"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col26",
							order: 25,
							text: oResource.getText("DataDim"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col27",
							order: 26,
							text: oResource.getText("InvioPS"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col28",
							order: 27,
							text: oResource.getText("GesConMatr"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col29",
							order: 28,
							text: oResource.getText("GesConDipendente"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col30",
							order: 29,
							text: oResource.getText("Q"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col31",
							order: 30,
							text: oResource.getText("Schede"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col32",
							order: 31,
							text: oResource.getText("Gest"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col33",
							order: 32,
							text: oResource.getText("NonAttig"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col34",
							order: 33,
							text: oResource.getText("NCons."),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col35",
							order: 34,
							text: oResource.getText("ImpSim"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col36",
							order: 35,
							text: oResource.getText("%StipSim"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col37",
							order: 36,
							text: oResource.getText("TettoPaySim"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col38",
							order: 37,
							text: oResource.getText("ImpLiqSim"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col39",
							order: 38,
							text: oResource.getText("%LiqSim"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col40",
							order: 39,
							text: oResource.getText("ModiffSim"),
							visible: true
						}

					]
				};

				//set personalization
				this._oBundle = oInitialData;

				//reset personalization, i.e. display table as defined
				//		this._oBundle = null;

				oDeferred.resolve();
				return oDeferred.promise();
			},
		};

		return GesConsuntiviSimTable;

	});