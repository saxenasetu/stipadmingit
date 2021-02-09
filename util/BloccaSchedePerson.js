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
	var BloccaSchedePerson = {

		oData : {
			_persoSchemaVersion: "1.0",
			aColumns : [
					{
								id: "BloccaSchedePersonali-tblBloccaPiste-col7",
									order: 0,
									text: "Sel Desel",
									visible: true
								},
								{
									id: "BloccaSchedePersonali-tblBloccaPiste-col1",
									order: 1,
									text: "D",
									visible: true
								},
								{
									id: "BloccaSchedePersonali-tblBloccaPiste-col2",
									order: 2,
									text: oResource.getText("DataD"),
									visible: true
								},
								{
									id: "BloccaSchedePersonali-tblBloccaPiste-col3",
									order: 3,
									text: oResource.getText("Matricola"),
									visible: true
								},
								{
									id: "BloccaSchedePersonali-tblBloccaPiste-col4",
									order: 4,
									text: oResource.getText("Cognome"),
									visible: true
								},
								{
								id: "BloccaSchedePersonali-tblBloccaPiste-col5",
									order: 5,
									text: oResource.getText("Nome"),
									visible: true
								},
								{
									id: "BloccaSchedePersonali-tblBloccaPiste-col6",
									order: 6,
									text: oResource.getText("Count"),
									visible: true
								},
								{
									id: "BloccaSchedePersonali-tblBloccaPiste-col8",
									order: 7,
									text: "ID",
									visible: false
								},
								{
									id: "BloccaSchedePersonali-tblBloccaPiste-col9",
									order: 8,
									text: "Scheda",
									visible: false
								},
								{
									id: "BloccaSchedePersonali-tblBloccaPiste-col11",
									order: 9,
									text: oResource.getText("MeseInizio"),
									visible: false
								},
								{
								id: "BloccaSchedePersonali-tblBloccaPiste-col12",
									order: 10,
									text: oResource.getText("MeseFine"),
									visible: false
								},
								{
									id: "BloccaSchedePersonali-tblBloccaPiste-col13",
									order: 11,
									text: oResource.getText("RespDiretto"),
									visible: false
								},
								{
									id: "BloccaSchedePersonali-tblBloccaPiste-col14",
									order: 12,
									text: oResource.getText("RespHR"),
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
								id: "BloccaSchedePersonali-tblBloccaPiste-col7",
									order: 0,
									text: "Sel Desel",
									visible: true
								},
								{
									id: "BloccaSchedePersonali-tblBloccaPiste-col1",
									order: 1,
									text: "D",
									visible: true
								},
								{
									id: "BloccaSchedePersonali-tblBloccaPiste-col2",
									order: 2,
									text: oResource.getText("DataD"),
									visible: true
								},
								{
									id: "BloccaSchedePersonali-tblBloccaPiste-col3",
									order: 3,
									text: oResource.getText("Matricola"),
									visible: true
								},
								{
									id: "BloccaSchedePersonali-tblBloccaPiste-col4",
									order: 4,
									text: oResource.getText("Cognome"),
									visible: true
								},
								{
								id: "BloccaSchedePersonali-tblBloccaPiste-col5",
									order: 5,
									text: oResource.getText("Nome"),
									visible: true
								},
								{
									id: "BloccaSchedePersonali-tblBloccaPiste-col6",
									order: 6,
									text: oResource.getText("Count"),
									visible: true
								},
								{
									id: "BloccaSchedePersonali-tblBloccaPiste-col8",
									order: 7,
									text: "ID",
									visible: false
								},
								{
									id: "BloccaSchedePersonali-tblBloccaPiste-col9",
									order: 8,
									text: "Scheda",
									visible: false
								},
								{
									id: "BloccaSchedePersonali-tblBloccaPiste-col11",
									order: 9,
									text: oResource.getText("MeseInizio"),
									visible: false
								},
								{
								id: "BloccaSchedePersonali-tblBloccaPiste-col12",
									order: 10,
									text: oResource.getText("MeseFine"),
									visible: false
								},
								{
									id: "BloccaSchedePersonali-tblBloccaPiste-col13",
									order: 11,
									text: oResource.getText("RespDiretto"),
									visible: false
								},
								{
									id: "BloccaSchedePersonali-tblBloccaPiste-col14",
									order: 12,
									text: oResource.getText("RespHR"),
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

	return BloccaSchedePerson;

});
