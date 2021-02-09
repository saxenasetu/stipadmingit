sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";
	var oMainModel = new sap.ui.model.json.JSONModel();
	var idGruppi, year,selectedFYPeriodi;
	return Controller.extend("stipAdmin.stipAdmin.controller.displayGruppoPiste", {

		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("displayGruppoPiste").attachPatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function (oEvent) {
			var oArguments = oEvent.getParameter("arguments");
			year = oArguments.ID_PERIODO;
			idGruppi = oArguments.ID_GRUPPI;
			selectedFYPeriodi=oArguments.SEL_FY_PERIODI;

			sap.ui.getCore().getModel("BasicAppModel").setProperty("/backk", "back");
		//	var year1 = sap.ui.getCore().getModel("BasicAppModel").getProperty("/DESCR_PERIODO");
			this.byId("fy").setText(selectedFYPeriodi);
			var data = [];
			if (sap.ui.getCore().getModel("modModel") != undefined) {
				console.log(sap.ui.getCore().getModel("modModel").getData());
				data.push(sap.ui.getCore().getModel("modModel").getData());
				oMainModel.setSizeLimit(1000);
				oMainModel.setData(data);
				this.getView().setModel(oMainModel, "displayGruppiPisteModel");
				oMainModel.refresh();
			} else {
				oMainModel.setSizeLimit(1000);
				oMainModel.setData(data);
				this.getView().setModel(oMainModel, "displayGruppiPisteModel");
				
				this.displayGruppoPiste();
			
			}
		},
		//save 
		displayGruppoPiste: function () {
			debugger
			var that = this;
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");

			var gruppiResultJson = [];
			var gruppiResultJsonData = [];
			var oFilters = [];
			console.log(idGruppi);
			//	 idGruppi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/idGruppi");
			if (idGruppi != undefined && idGruppi != "") {
				var filter1 = new sap.ui.model.Filter("ID_GRUPPOPISTA", sap.ui.model.FilterOperator.EQ, idGruppi);
				oFilters.push(filter1);
			}

			xsoDataModel.read("/T_GRUPPIPISTE?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;
					console.log(oDataIn);
					for (var i = 0; i < oDataIn.results.length; ++i) {
						gruppiResultJsonData = {
						/*	"ID_GRUPPOPISTA": oDataIn.results[i].ID_GRUPPOPISTA,
							"DESCR_GRUPPOPISTA": oDataIn.results[i].DESCR_GRUPPOPISTA,*/
							"ID":oDataIn.results[i].ID_GRUPPOPISTA,
							"DESC":oDataIn.results[i].DESCR_GRUPPOPISTA
						};
						gruppiResultJson.push(gruppiResultJsonData);
					}
					console.log(gruppiResultJson);
					oMainModel.setData(
						gruppiResultJson
					);
					this.getView().setModel(oMainModel, "displayGruppiPisteModel");
					oMainModel.refresh();
				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed while getting T_GRUPPIPISTE. Please contact administrator.");
					jQuery.sap.log.getLogger().error("T_GRUPPIPISTE fetch failed" + oError.toString());
				}.bind(this)
			});

		},

		cancel: function () {
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "back");
			//	var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/0/FISCAL_YEAR");
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Gruppi", {
				gruppi: "Gruppi",
				str: year
			});
		}
	});

});