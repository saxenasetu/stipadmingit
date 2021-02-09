sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	// Very simple page-context personalization
	// persistence service, not for productive use!
	var DynamicTableColumn = {

		oData : {
			_persoSchemaVersion: "1.0",
			aColumns : [
					{
								id: "xmlview0-tblBloccaPiste-col27",
									order: 0,
									text: "Seleziona/Deseleziona",
									visible: true
								},
								{
									id: "xmlview0-tblBloccaPiste-col2",
									order: 1,
									text: "Trimestri bloccati",
									visible: true
								},
								{
									id: "xmlview0-tblBloccaPiste-col3",
									order: 2,
									text: "ID",
									visible: true
								},
								{
									id: "xmlview0-tblBloccaPiste-col4",
									order: 3,
									text: "Descrizione",
									visible: true
								},
								{
									id: "xmlview0-tblBloccaPiste-col5",
									order: 4,
									text: "Gruppo",
									visible: true
								},
								{
								id: "xmlview0-tblBloccaPiste-col6",
									order: 5,
									text: "Mese Inizio",
									visible: true
								},
								{
									id: "xmlview0-tblBloccaPiste-col7",
									order: 6,
									text: "Mese Fine",
									visible: true
								},
								{
									id: "xmlview0-tblBloccaPiste-col8",
									order: 7,
									text: "",
									visible: true
								},
								{
									id: "xmlview0-tblBloccaPiste-col9",
									order: 8,
									text: "Curva",
									visible: true
								},
								{
									id: "xmlview0-tblBloccaPiste-col10",
									order: 9,
									text: "Moltiplicatore",
									visible: true
								},
								{
								id: "xmlview0-tblBloccaPiste-col11",
									order: 10,
									text: "P",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col12",
									order: 11,
									text: "Inizio Assegn",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col13",
									order: 12,
									text: "Fine Assegn",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col14",
									order: 13,
									text: "Identificativo Assegnatario",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col15",
									order: 14,
									text: "N°",
									visible: false
								},
								{
								id: "xmlview0-tblBloccaPiste-col16",
									order: 15,
									text: "Target",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col17",
									order: 16,
									text: "Consuntivo",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col18",
									order: 17,
									text: "Ragg.Obiett.",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col19",
									order: 18,
									text: "% Ragg. Payout",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col20",
									order: 19,
									text: "Payout",
									visible: false
								},
								{
								id: "xmlview0-tblBloccaPiste-col21",
									order: 20,
									text: "Obiettivo Sim.",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col22",
									order: 21,
									text: "Consuntivo Sim.",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col23",
									order: 22,
									text: "Ragg. Ob. Sim.",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col24",
									order: 23,
									text: "Ragg. Payout sim.",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col24",
									order: 24,
									text: "Ragg. Payout sim.",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col24",
									order: 25,
									text: "Ragg. Payout sim.",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col24",
									order: 26,
									text: "Ragg. Payout sim.",
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
								id: "xmlview0-tblBloccaPiste-col1",
									order: 0,
									text: "Seleziona/Deseleziona",
									visible: true
								},
								{
									id: "xmlview0-tblBloccaPiste-col2",
									order: 1,
									text: "Trimestri bloccati",
									visible: true
								},
								{
									id: "xmlview0-tblBloccaPiste-col3",
									order: 2,
									text: "ID",
									visible: true
								},
								{
									id: "xmlview0-tblBloccaPiste-col4",
									order: 3,
									text: "Descrizione",
									visible: true
								},
								{
									id: "xmlview0-tblBloccaPiste-col5",
									order: 4,
									text: "Gruppo",
									visible: true
								},
								{
								id: "xmlview0-tblBloccaPiste-col6",
									order: 5,
									text: "Mese Inizio",
									visible: true
								},
								{
									id: "xmlview0-tblBloccaPiste-col7",
									order: 6,
									text: "Mese Fine",
									visible: true
								},
								{
									id: "xmlview0-tblBloccaPiste-col8",
									order: 7,
									text: "",
									visible: true
								},
								{
									id: "xmlview0-tblBloccaPiste-col9",
									order: 8,
									text: "Curva",
									visible: true
								},
								{
									id: "xmlview0-tblBloccaPiste-col10",
									order: 9,
									text: "Moltiplicatore",
									visible: true
								},
								{
								id: "xmlview0-tblBloccaPiste-col11",
									order: 10,
									text: "P",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col12",
									order: 11,
									text: "Inizio Assegn",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col13",
									order: 12,
									text: "Fine Assegn",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col14",
									order: 13,
									text: "Identificativo Assegnatario",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col15",
									order: 14,
									text: "N°",
									visible: false
								},
								{
								id: "xmlview0-tblBloccaPiste-col16",
									order: 15,
									text: "Target",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col17",
									order: 16,
									text: "Consuntivo",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col18",
									order: 17,
									text: "Ragg.Obiett.",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col19",
									order: 18,
									text: "% Ragg. Payout",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col20",
									order: 19,
									text: "Payout",
									visible: false
								},
								{
								id: "xmlview0-tblBloccaPiste-col21",
									order: 20,
									text: "Obiettivo Sim.",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col22",
									order: 21,
									text: "Consuntivo Sim.",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col23",
									order: 22,
									text: "Ragg. Ob. Sim.",
									visible: false
								},
								{
									id: "xmlview0-tblBloccaPiste-col24",
									order: 23,
									text: "Ragg. Payout sim.",
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

	return DynamicTableColumn;

});
