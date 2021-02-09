sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";
	var oMainModel = new sap.ui.model.json.JSONModel();
		var idGruppi, year,selectedFYPeriodi;
	return Controller.extend("stipAdmin.stipAdmin.controller.displayGruppi_Scheda", {
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("displayGruppi_Scheda").attachPatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function (oEvent) {
			debugger
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
				this.getView().setModel(oMainModel, "displayGruppiSchedaModel");
				oMainModel.refresh();
			} else {
				oMainModel.setSizeLimit(1000);
				oMainModel.setData(data);
				this.getView().setModel(oMainModel, "displayGruppiSchedaModel");
				
				this.displayGruppoScheda();
			
			}

		},
		 
		displayGruppoScheda: function () {
			debugger
			var that = this;
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");

			var gruppiResultJson = [];
			var gruppiResultJsonData = [];
			var oFilters = [];
				console.log(idGruppi);
		//	var idGruppi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/idGruppi");
			if (idGruppi != undefined && idGruppi != "") {
				var filter1 = new sap.ui.model.Filter("ID_GRUPPOSCHEDA", sap.ui.model.FilterOperator.EQ, idGruppi);
				oFilters.push(filter1);
			}

			xsoDataModel.read("/T_GRUPPISCHEDE?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;
					console.log(oDataIn);
					for (var i = 0; i < oDataIn.results.length; ++i) {
						gruppiResultJsonData = {
							"ID": oDataIn.results[i].ID_GRUPPOSCHEDA,
							"DESC": oDataIn.results[i].DESCR_GRUPPOSCHEDA,
							"TEMPLATE_LETTERE_ID" : oDataIn.results[i].ID_TEMPLATELETTERA,
							"TEMPLATE_LETTERE" :""
						};
						gruppiResultJson.push(gruppiResultJsonData);
					}
					that.templateLettere(oDataIn.results[0].ID_TEMPLATELETTERA);
					console.log(gruppiResultJson);
					oMainModel.setData(
						gruppiResultJson
					);
					this.getView().setModel(oMainModel, "displayGruppiSchedaModel");

				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed while getting T_GRUPPISCHEDE. Please contact administrator.");
					jQuery.sap.log.getLogger().error("T_GRUPPISCHEDE fetch failed" + oError.toString());
				}.bind(this)
			});

		},
		templateLettere: function (id) {
				var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");

				var oFilters = [],
					desc;
				var filter1 = new sap.ui.model.Filter("ID_TEMPLATELETTERA", sap.ui.model.FilterOperator.EQ, id);
				oFilters.push(filter1);
				xsoDataModel.read("/TEMPLATELETTERE?$format=json", {
					filters: oFilters,
					success: function (oDataIn, oResponse) {
						debugger;
						console.log(oDataIn);
						desc = oDataIn.results[0].DESCRIZIONE;
						console.log(desc);
					}.bind(this),
					error: function (oError) {
						//Handle the error
						//MessageBox.error("Data fetch failed while getting T_GRUPPISCHEDE. Please contact administrator.");
						jQuery.sap.log.getLogger().error("TEMPLATELETTERE fetch failed" + oError.toString());
					}.bind(this)
				});

				xsoDataModel.attachRequestCompleted(function () {
					debugger;
					var path = "/0/TEMPLATE_LETTERE";
					oMainModel.setProperty(path, desc);
					oMainModel.refresh();
					//	}
				});
			},


		cancel: function () {
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/back","back");
			// selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/0/FISCAL_YEAR");
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Gruppi", {
				gruppi: "Gruppi",
				str: year
			});
		}
	});

});