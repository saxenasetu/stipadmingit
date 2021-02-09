sap.ui.define(['jquery.sap.global'],
	function (jQuery) {
		"use strict";
		var oResource;
		oResource = new sap.ui.model.resource.ResourceModel({
			bundleName: "stipAdmin.stipAdmin.i18n.i18n"
		}).getResourceBundle();
		// Very simple page-context personalization
		// persistence service, not for productive use!
		var SchedaMasterTableHome = {

			oData: {
				_persoSchemaVersion: "1.0",
				aColumns: [{
					id: "SchedaMaster-tbl-col0",
					order: 0,
					text: "Seleziona",
					visible: true
				}, {
					id: "SchedaMaster-tbl-col1",
					order: 1,
					text: oResource.getText("Id"),
					visible: true
				}, {
					id: "SchedaMaster-tbl-col2",
					order: 2,
					text: oResource.getText("Desc"),
					visible: true
				}, {
					id: "SchedaMaster-tbl-col3",
					order: 3,
					text: oResource.getText("Max_Payout"),
					visible: true
				}, {
					id: "SchedaMaster-tbl-col4",
					order: 4,
					text: oResource.getText("Gruppo"),
					visible: true
				},
			/*	{
					id: "SchedaMaster-tbl-col5",
					order: 5,
					text: oResource.getText("Note"),
					visible: true
				}, {
					id: "SchedaMaster-tbl-col6",
					order: 6,
					text: oResource.getText("Congelata"),
					visible: true
				},*/
				{
					id: "SchedaMaster-tbl-col7",
					order: 7,
					text: oResource.getText("Peso_Percentuale"),
					visible: true
				}, {
					id: "SchedaMaster-tbl-col8",
					order: 8,
					text: oResource.getText("Scheda_KPI"),
					visible: true
				}, {
					id: "SchedaMaster-tbl-col9",
					order: 9,
					text: oResource.getText("Curve"),
					visible: true
				}, {
					id: "SchedaMaster-tbl-col10",
					order: 10,
					text: oResource.getText("Pista"),
					visible: true
				},
				{
					id: "SchedaMaster-tbl-col11",
					order: 11,
					text: oResource.getText("Gate"),
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
					aColumns: [{
						id: "SchedaMaster-tbl-col1",
						order: 0,
						text: oResource.getText("Id"),
						visible: true
					}, {
						id: "SchedaMaster-tbl-col2",
						order: 1,
						text: oResource.getText("Desc"),
						visible: true
					}, {
						id: "SchedaMaster-tbl-col3",
						order: 2,
						text: oResource.getText("Max_Payout"),
						visible: true
					}, {
						id: "SchedaMaster-tbl-col4",
						order: 3,
						text: oResource.getText("P4P"),
						visible: true
					}, {
						id: "SchedaMaster-tbl-col5",
						order: 4,
						text: oResource.getText("Gruppo"),
						visible: true
					}, 
				/*	{
						id: "SchedaMaster-tbl-col6",
						order: 5,
						text: oResource.getText("Note"),
						visible: true
					}, {
						id: "SchedaMaster-tbl-col7",
						order: 6,
						text: oResource.getText("Congelata"),
						visible: true
					}, */
					{
						id: "SchedaMaster-tbl-col8",
						order: 7,
						text: oResource.getText("Template"),
						visible: true
					}, {
						id: "SchedaMaster-tbl-col9",
						order: 8,
						text: oResource.getText("piste"),
						visible: true
					}, {
						id: "SchedaMaster-tbl-col10",
						order: 9,
						text: oResource.getText("MODIFICA"),
						visible: true
					},
					{
					id: "SchedaMaster-tbl-col11",
					order: 10,
					text: oResource.getText("Gate"),
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
			/*		getCaption : function (oColumn) {
						if (oColumn.getHeader() && oColumn.getHeader().getText) {
							if (oColumn.getHeader().getText() === "Weight") {
								return "Weight (Important!)";
							}
						}
						return null;
					},*/

			/*	getGroup : function(oColumn) {
					if ( oColumn.getId().indexOf('productCol') != -1 ||
							oColumn.getId().indexOf('supplierCol') != -1) {
						return "Primary Group";
					}
					return "Secondary Group";
				}*/
		};

		return SchedaMasterTableHome;

	});