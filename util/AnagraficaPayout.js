sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";
      var oResource;
       oResource = new sap.ui.model.resource.ResourceModel({
        bundleName: "stipAdmin.stipAdmin.i18n.i18n"
      }).getResourceBundle();
	// Very simple page-context personalization
	// persistence service, not for productive use!
// TODO: please change all the text while development
	var AnagraficaPayout = {

		oData : {
			_persoSchemaVersion: "1.0",
			aColumns : [
					{
								id: "AnagraficaPayout-tblAnagraficaPayout-col1",
									order: 0,
									text: oResource.getText("Id"),
									visible: true
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col2",
									order: 1,
									text: oResource.getText("Desc"),
									visible: true
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col3",
									order: 2,
									text: oResource.getText("Gruppo"),
									visible: true
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col4",
									order: 3,
									text: oResource.getText("Mese_Inizio"),
									visible: true
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col5",
									order: 4,
									text: oResource.getText("Mese_Fine"),
									visible: true
								},
								{
								id: "AnagraficaPayout-tblAnagraficaPayout-col6",
									order: 5,
									text: oResource.getText("Tipo"),
									visible: true
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col7",
									order: 6,
									text: oResource.getText("Curva"),
									visible: true
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col8",
									order: 7,
									text: oResource.getText("Gate1"),
									visible: false
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col9",
									order: 8,
									text: oResource.getText("Gate2"),
									visible: false
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col10",
									order: 9,
									text: oResource.getText("nPers"),
									visible: false
								},
								{
								id: "AnagraficaPayout-tblAnagraficaPayout-col11",
									order: 10,
									text: oResource.getText("Additivo"),
									visible: false
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col12",
									order: 11,
									text: oResource.getText("Inizio_Assegn"),
									visible: false
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col13",
									order: 12,
									text: oResource.getText("Fine_Assegn"),
									visible: false
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col14",
									order: 13,
									text: oResource.getText("Identificativo_Assegnatario"),
									visible: false
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col15",
									order: 14,
									text: oResource.getText("Count"),
									visible: false
								},
							
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col16",
									order: 15,
									text: oResource.getText("Target"),
									visible: false
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col17",
									order: 16,
									text: oResource.getText("Consunt"),
									visible: false
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col18",
									order: 17,
									text: oResource.getText("Ragg_Obiett"),
									visible: false
								},
								{
								id: "AnagraficaPayout-tblAnagraficaPayout-col19",
									order: 18,
									text: oResource.getText("Ragg_Stip"),
									visible: false
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col20",
									order: 19,
									text: oResource.getText("TargetSim"),
									visible: false
								}
							]
		},

		getPersData : function () {
			var oDeferred = new jQuery.Deferred();
			if (!this._oBundle) {
				this._oBundle = this.oData;
			}
			var oBundle = this._oBundle;
			oDeferred.resolve(oBundle);
			return oDeferred.promise();
		},

		setPersData : function (oBundle) {
			var oDeferred = new jQuery.Deferred();
			this._oBundle = oBundle;
			oDeferred.resolve();
			return oDeferred.promise();
		},

		resetPersData : function () {
			var oDeferred = new jQuery.Deferred();
			var oInitialData = {
					_persoSchemaVersion: "1.0",
					aColumns : [
					{
								id: "AnagraficaPayout-tblAnagraficaPayout-col1",
									order: 0,
									text: oResource.getText("Id"),
									visible: true
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col2",
									order: 1,
									text: oResource.getText("Desc"),
									visible: true
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col3",
									order: 2,
									text: oResource.getText("Gruppo"),
									visible: true
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col4",
									order: 3,
									text: oResource.getText("Mese_Inizio"),
									visible: true
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col5",
									order: 4,
									text: oResource.getText("Mese_Fine"),
									visible: true
								},
								{
								id: "AnagraficaPayout-tblAnagraficaPayout-col6",
									order: 5,
									text: oResource.getText("Tipo"),
									visible: true
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col7",
									order: 6,
									text: oResource.getText("Curva"),
									visible: true
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col8",
									order: 7,
									text: oResource.getText("Gate1"),
									visible: false
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col9",
									order: 8,
									text: oResource.getText("Gate2"),
									visible: false
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col10",
									order: 9,
									text: oResource.getText("nPers"),
									visible: false
								},
								{
								id: "AnagraficaPayout-tblAnagraficaPayout-col11",
									order: 10,
									text: oResource.getText("Additivo"),
									visible: false
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col12",
									order: 11,
									text: oResource.getText("Inizio_Assegn"),
									visible: false
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col13",
									order: 12,
									text: oResource.getText("Fine_Assegn"),
									visible: false
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col14",
									order: 13,
									text: oResource.getText("Identificativo_Assegnatario"),
									visible: false
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col15",
									order: 14,
									text: oResource.getText("Count"),
									visible: false
								},
							
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col16",
									order: 15,
									text: oResource.getText("Target"),
									visible: false
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col17",
									order: 16,
									text: oResource.getText("Consunt"),
									visible: false
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col18",
									order: 17,
									text: oResource.getText("Ragg_Obiett"),
									visible: false
								},
								{
								id: "AnagraficaPayout-tblAnagraficaPayout-col19",
									order: 18,
									text: oResource.getText("Ragg_Stip"),
									visible: false
								},
								{
									id: "AnagraficaPayout-tblAnagraficaPayout-col20",
									order: 19,
									text: oResource.getText("TargetSim"),
									visible: false
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

	return AnagraficaPayout;

});
