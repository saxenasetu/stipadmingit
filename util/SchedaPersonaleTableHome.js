sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";
      var oResource;
       oResource = new sap.ui.model.resource.ResourceModel({
        bundleName: "stipAdmin.stipAdmin.i18n.i18n"
      }).getResourceBundle();
	// Very simple page-context personalization
	// persistence service, not for productive use!
	var SchedaPersonaleTableHome = {

		oData : {
			_persoSchemaVersion: "1.0",
			aColumns : [
					{
								id: "SchedaPersonale-schedaPersonaleTable-col0",
									order: 0,
									text: "",
									visible: true
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col1",
									order: 1,
									text: oResource.getText("SID"),
									visible: true
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col2",
									order: 2,
									text: oResource.getText("MATRICOLA"),
									visible: true
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col3",
									order: 3,
									text: oResource.getText("Dipendente"),
									visible: true
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col4",
									order: 4,
									text: oResource.getText("StatoDipendente"),
									visible: true
								},
								{
								id: "SchedaPersonale-schedaPersonaleTable-col5",
									order: 5,
									text: "fdsdsfdsfds",
									visible: true
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col6",
									order: 6,
									text: oResource.getText("S"),
									visible: true
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col7",
									order: 7,
									text: oResource.getText("Flow"),
									visible: true
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col8",
									order: 8,
									text: oResource.getText("Protocollo"),
									visible: true
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col9",
									order: 9,
									text: oResource.getText("Id"),
									visible: true
								},
								{
								id: "SchedaPersonale-schedaPersonaleTable-col10",
									order: 10,
									text: oResource.getText("Scheda"),
									visible: true
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col11",
									order: 11,
									text: "",
									visible: true
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col12",
									order: 12,
									text: oResource.getText("MeseInizio"),
									visible: true
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col13",
									order: 13,
									text: oResource.getText("MeseFine"),
									visible: true
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col14",
									order: 14,
									text: oResource.getText("RespDiretto"),
									visible: false
								},
							
								{
									id: "SchedaPersonale-schedaPersonaleTable-col15",
									order: 15,
									text: oResource.getText("LetteraAssignazioneAutomatica"),
									visible: false
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col16",
									order: 16,
									text: oResource.getText("LetteraAssignazioneManuale"),
									visible: false
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col17",
									order: 17,
									text: oResource.getText("TemplateModificato"),
									visible: false
								},
								{
								id: "SchedaPersonale-schedaPersonaleTable-col18",
									order: 18,
									text: oResource.getText("Status"),
									visible: false
								},
								{
								id: "SchedaPersonale-schedaPersonaleTable-col19",
									order: 19,
									text: oResource.getText("datadellostato"),
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
								id: "SchedaPersonale-schedaPersonaleTable-col0",
									order: 0,
									text: "",
									visible: true
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col1",
									order: 1,
									text: oResource.getText("SID"),
									visible: true
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col2",
									order: 2,
									text: oResource.getText("MATRICOLA"),
									visible: true
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col3",
									order: 3,
									text: oResource.getText("Dipendente"),
									visible: true
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col4",
									order: 4,
									text: oResource.getText("StatoDipendente"),
									visible: true
								},
								{
								id: "SchedaPersonale-schedaPersonaleTable-col5",
									order: 5,
									text: "",
									visible: true
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col6",
									order: 6,
									text: oResource.getText("S"),
									visible: true
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col7",
									order: 7,
									text: oResource.getText("Flow"),
									visible: false
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col8",
									order: 8,
									text: oResource.getText("Protocollo"),
									visible: false
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col9",
									order: 9,
									text: oResource.getText("Id"),
									visible: false
								},
								{
								id: "SchedaPersonale-schedaPersonaleTable-col10",
									order: 10,
									text: oResource.getText("Scheda"),
									visible: false
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col11",
									order: 11,
									text: "",
									visible: false
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col12",
									order: 12,
									text: oResource.getText("MeseInizio"),
									visible: false
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col13",
									order: 13,
									text: oResource.getText("MeseFine"),
									visible: false
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col14",
									order: 14,
									text: oResource.getText("RespDiretto"),
									visible: false
								},
							
								{
									id: "SchedaPersonale-schedaPersonaleTable-col15",
									order: 15,
									text: oResource.getText("LetteraAssignazioneAutomatica"),
									visible: false
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col16",
									order: 16,
									text: oResource.getText("LetteraAssignazioneManuale"),
									visible: false
								},
								{
									id: "SchedaPersonale-schedaPersonaleTable-col17",
									order: 17,
									text: oResource.getText("TemplateModificato"),
									visible: false
								},
								{
								id: "SchedaPersonale-schedaPersonaleTable-col18",
									order: 18,
									text: oResource.getText("Status"),
									visible: false
								},
								{
								id: "SchedaPersonale-schedaPersonaleTable-col19",
									order: 19,
									text: oResource.getText("datadellostato"),
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

	return SchedaPersonaleTableHome;

});
