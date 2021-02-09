sap.ui.define(['jquery.sap.global'],
	function (jQuery) {
		"use strict";
		var oResource;
		oResource = new sap.ui.model.resource.ResourceModel({
			bundleName: "STIP.STIPGestioneConsuntivazione.i18n.i18n"
		}).getResourceBundle();

		var GesConsuntiviTable = {
			oData: {
				_persoSchemaVersion: "1.0",
				aColumns: [{
						id: "GestioneConsuntivazione-idTable5-col1",
						order: 0,
						text: oResource.getText("D"),
						visible: true
					}, {
						id: "GestioneConsuntivazione-idTable5-col2",
						order: 1,
						text: oResource.getText("DataDim"),
						visible: true
					}, {
						id: "GestioneConsuntivazione-idTable5-col3",
						order: 2,
						text: oResource.getText("InvioPS"),
						visible: true
					}, {
						id: "GestioneConsuntivazione-idTable5-col4",
						order: 3,
						text: oResource.getText("CID"),
						visible: true
					},
					{
						id: "GestioneConsuntivazione-idTable5-col5",
						order: 4,
						text: oResource.getText("GesConMatr"),
						visible: true
					}, {
						id: "GestioneConsuntivazione-idTable5-col6",
						order: 5,
						text: oResource.getText("GesConDipendente"),
						visible: true
					}, {
						id: "GestioneConsuntivazione-idTable5-col7",
						order: 6,
						text: oResource.getText("DataAss"),
						visible: true
					}, {
						id: "GestioneConsuntivazione-idTable5-col8",
						order: 7,
						text: oResource.getText("Q"),
						visible: true
					}, {
						id: "GestioneConsuntivazione-idTable5-col9",
						order: 8,
						text: oResource.getText("Schede"),
						visible: true
					}, {
						id: "GestioneConsuntivazione-idTable5-col10",
						order: 9,
						text: oResource.getText("Gest"),
						visible: true
					}, {
						id: "GestioneConsuntivazione-idTable5-col11",
						order: 10,
						text: oResource.getText("NonAttig"),
						visible: true
					}, {
						id: "GestioneConsuntivazione-idTable5-col12",
						order: 11,
						text: oResource.getText("NCons."),
						visible: true
					}, {
						id: "GestioneConsuntivazione-idTable5-col13",
						order: 12,
						text: oResource.getText("BaseStip"),
						visible: true
					}, {
						id: "GestioneConsuntivazione-idTable5-col14",
						order: 13,
						text: oResource.getText("%Scheda"),
						visible: true
					}, {
						id: "GestioneConsuntivazione-idTable5-col15",
						order: 14,
						text: oResource.getText("Imp"),
						visible: true
					},

					{
						id: "GestioneConsuntivazione-idTable5-col16",
						order: 15,
						text: oResource.getText("%Stip"),
						visible: true
					}, {
						id: "GestioneConsuntivazione-idTable5-col17",
						order: 16,
						text: oResource.getText("TettoPayout"),
						visible: true
					}, {
						id: "GestioneConsuntivazione-idTable5-col18",
						order: 17,
						text: oResource.getText("ImpMan"),
						visible: true
					}, {
						id: "GestioneConsuntivazione-idTable5-col19",
						order: 18,
						text: oResource.getText("%stipmanuale"),
						visible: true
					}, {
						id: "GestioneConsuntivazione-idTable5-col20",
						order: 19,
						text: oResource.getText("Note"),
						visible: true
					}, {
						id: "GestioneConsuntivazione-idTable5-col21",
						order: 20,
						text: oResource.getText("ImpLiqui"),
						visible: true
					}, {
						id: "GestioneConsuntivazione-idTable5-col22",
						order: 21,
						text: oResource.getText("%Liqui"),
						visible: true
					}, {
						id: "GestioneConsuntivazione-idTable5-col23",
						order: 22,
						text: oResource.getText("Modif."),
						visible: true
					}

					// {
					// 	id: "GestioneConsuntivazione-idTable5-col24",
					// 	order: 23,
					// 	text: oResource.getText("ImpSim"),
					// 	visible: true
					// }, {
					// 	id: "GestioneConsuntivazione-idTable5-col25",
					// 	order: 24,
					// 	text: oResource.getText("%StipSim"),
					// 	visible: true
					// }, {
					// 	id: "GestioneConsuntivazione-idTable5-col26",
					// 	order: 25,
					// 	text: oResource.getText("TettoPaySim"),
					// 	visible: true
					// }, {
					// 	id: "GestioneConsuntivazione-idTable5-col27",
					// 	order: 26,
					// 	text: oResource.getText("ImpManSim"),
					// 	visible: true
					// }, {
					// 	id: "GestioneConsuntivazione-idTable5-col28",
					// 	order: 27,
					// 	text: oResource.getText("%StipManSim"),
					// 	visible: true
					// }, {
					// 	id: "GestioneConsuntivazione-idTable5-col29",
					// 	order: 28,
					// 	text: oResource.getText("Note1"),
					// 	visible: true
					// }, {
					// 	id: "GestioneConsuntivazione-idTable5-col30",
					// 	order: 29,
					// 	text: oResource.getText("ImpLiqSim"),
					// 	visible: true
					// }, {
					// 	id: "GestioneConsuntivazione-idTable5-col31",
					// 	order: 30,
					// 	text: oResource.getText("%LiqSim"),
					// 	visible: true
					// }, {
					// 	id: "GestioneConsuntivazione-idTable5-col32",
					// 	order: 31,
					// 	text: oResource.getText("ModiffSim"),
					// 	visible: true
					// }
				]
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
					aColumns: [{
							id: "GestioneConsuntivazione-idTable5-col1",
							order: 0,
							text: oResource.getText("D"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col2",
							order: 1,
							text: oResource.getText("DataDim"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col3",
							order: 2,
							text: oResource.getText("InvioPS"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col4",
							order: 3,
							text: oResource.getText("CID"),
							visible: true
						},{
							id: "GestioneConsuntivazione-idTable5-col5",
							order: 4,
							text: oResource.getText("GesConMatr"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col6",
							order: 5,
							text: oResource.getText("GesConDipendente"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col7",
							order: 6,
							text: oResource.getText("DataAss"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col8",
							order: 7,
							text: oResource.getText("Q"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col9",
							order: 8,
							text: oResource.getText("Schede"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col10",
							order: 9,
							text: oResource.getText("Gest"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col11",
							order: 10,
							text: oResource.getText("NonAttig"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col12",
							order: 11,
							text: oResource.getText("NCons."),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col13",
							order: 12,
							text: oResource.getText("BaseStip"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col14",
							order: 13,
							text: oResource.getText("%Scheda"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col15",
							order: 14,
							text: oResource.getText("Imp"),
							visible: true
						},

						{
							id: "GestioneConsuntivazione-idTable5-col16",
							order: 15,
							text: oResource.getText("%Stip"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col17",
							order: 16,
							text: oResource.getText("TettoPayout"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col18",
							order: 17,
							text: oResource.getText("ImpMan"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col19",
							order: 18,
							text: oResource.getText("%stipmanuale"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col20",
							order: 19,
							text: oResource.getText("Note"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col21",
							order: 20,
							text: oResource.getText("ImpLiqui"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col22",
							order: 21,
							text: oResource.getText("%Liqui"),
							visible: true
						}, {
							id: "GestioneConsuntivazione-idTable5-col23",
							order: 22,
							text: oResource.getText("Modif."),
							visible: true
						}

						// {
						// 	id: "GestioneConsuntivazione-idTable5-col24",
						// 	order: 23,
						// 	text: oResource.getText("ImpSim"),
						// 	visible: true
						// }, {
						// 	id: "GestioneConsuntivazione-idTable5-col25",
						// 	order: 24,
						// 	text: oResource.getText("%StipSim"),
						// 	visible: true
						// }, {
						// 	id: "GestioneConsuntivazione-idTable5-col26",
						// 	order: 25,
						// 	text: oResource.getText("TettoPaySim"),
						// 	visible: true
						// }, {
						// 	id: "GestioneConsuntivazione-idTable5-col27",
						// 	order: 26,
						// 	text: oResource.getText("ImpManSim"),
						// 	visible: true
						// }, {
						// 	id: "GestioneConsuntivazione-idTable5-col28",
						// 	order: 27,
						// 	text: oResource.getText("%StipManSim"),
						// 	visible: true
						// }, {
						// 	id: "GestioneConsuntivazione-idTable5-col29",
						// 	order: 28,
						// 	text: oResource.getText("Note1"),
						// 	visible: true
						// }, {
						// 	id: "GestioneConsuntivazione-idTable5-col30",
						// 	order: 29,
						// 	text: oResource.getText("ImpLiqSim"),
						// 	visible: true
						// }, {
						// 	id: "GestioneConsuntivazione-idTable5-col31",
						// 	order: 30,
						// 	text: oResource.getText("%LiqSim"),
						// 	visible: true
						// }, {
						// 	id: "GestioneConsuntivazione-idTable5-col32",
						// 	order: 31,
						// 	text: oResource.getText("ModiffSim"),
						// 	visible: true
						// }

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

		return GesConsuntiviTable;

	});