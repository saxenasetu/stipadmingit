sap.ui.define(['jquery.sap.global'],
	function (jQuery) {
		"use strict";

		// Very simple page-context personalization
		// persistence service, not for productive use!
		var DemoPersoService = {

			oData: {
				_persoSchemaVersion: "1.0",
				aColumns: [{
						id: "demoApp-productsTable-productCol",
						order: 0,
						text: "ID",
						visible: true
					}, {
						id: "demoApp-productsTable-supplierCol",
						order: 1,
						text: "Descrizione",
						visible: true
					}, {
						id: "demoApp-productsTable-dimensionsCol",
						order: 2,
						text: "Gruppo",
						visible: true
					}, {
						id: "demoApp-productsTable-weightCol",
						order: 3,
						text: "Mese inizio",
						visible: true
					}, {
						id: "demoApp-productsTable-priceCol1",
						order: 4,
						text: "Mese fine",
						visible: true
					}, {
						id: "demoApp-productsTable-priceCol2",
						order: 5,
						text: "Tipo",
						visible: false
					},
					{
						id: "demoApp-productsTable-priceCol3",
						order: 6,
						text: "Curva",
						visible: false
					}, {
						id: "demoApp-productsTable-priceCol4",
						order: 7,
						text: "Gate 1",
						visible: false
					}, {
						id: "demoApp-productsTable-priceCol5",
						order: 8,
						text: "Gate 2",
						visible: false
					}, {
						id: "demoApp-productsTable-priceCol6",
						order: 9,
						text: "nPers",
						visible: false
					}, {
						id: "demoApp-productsTable-priceCol7",
						order: 10,
						text: "Additivo",
						visible: false
					}, {
						id: "demoApp-productsTable-priceCol8",
						order: 11,
						text: "P",
						visible: false
					}, {
						id: "demoApp-productsTable-priceCol9",
						order: 12,
						text: "Inizio Assegn.",
						visible: false
					}, {
						id: "demoApp-productsTable-priceCol10",
						order: 13,
						text: "Identificativo Assegnatario",
						visible: false
					},
					{
						id: "demoApp-productsTable-priceCol11",
						order: 14,
						text: "Numero",
						visible: false
					},
										{
						id: "demoApp-productsTable-priceCol12",
						order: 15,
						text: "Modifica",
						visible: true
					},
										{
						id: "demoApp-productsTable-priceCol13",
						order: 16,
						text: "Copia",
						visible: true
					}

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
						id: "demoApp-productsTable-productCol",
						order: 0,
						text: "Product",
						visible: true
					}, {
						id: "demoApp-productsTable-supplierCol",
						order: 1,
						text: "Supplier",
						visible: false
					}, {
						id: "demoApp-productsTable-dimensionsCol",
						order: 4,
						text: "Dimensions",
						visible: false
					}, {
						id: "demoApp-productsTable-weightCol",
						order: 2,
						text: "Weight",
						visible: true
					}, {
						id: "demoApp-productsTable-priceCol",
						order: 3,
						text: "Price",
						visible: true
					}]
				};

				//set personalization
				this._oBundle = oInitialData;

				//reset personalization, i.e. display table as defined
				//		this._oBundle = null;

				oDeferred.resolve();
				return oDeferred.promise();
			},

			//this caption callback will modify the TablePersoDialog' entry for the 'Weight' column
			//to 'Weight (Important!)', but will leave all other column names as they are.
			getCaption: function (oColumn) {
				if (oColumn.getHeader() && oColumn.getHeader().getText) {
					if (oColumn.getHeader().getText() === "Weight") {
						return "Weight (Important!)";
					}
				}
				return null;
			},

			getGroup: function (oColumn) {
				if (oColumn.getId().indexOf('productCol') != -1 ||
					oColumn.getId().indexOf('supplierCol') != -1) {
					return "Primary Group";
				}
				return "Secondary Group";
			}
		};

		return DemoPersoService;

	});