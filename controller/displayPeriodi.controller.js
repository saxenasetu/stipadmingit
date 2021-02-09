sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "sap/m/MessageBox", "stipAdmin/stipAdmin/util/Formatter"],
	function (Controller, JSONModel, MessageBox, Formatter) {
		"use strict";
		var periodiIdInput;
		return Controller.extend("stipAdmin.stipAdmin.controller.displayPeriodi", {
			/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
			onInit: function () {
				this.getOwnerComponent().getRouter().getRoute("displayPeriodi").attachPatternMatched(this._onObjectMatched, this)
			},
			cancelPeriodiDisplay: function () {
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "back");
				var t = sap.ui.core.UIComponent.getRouterFor(this);
				t.navTo("Periodi");

			},
			/******************** _onObjectMatched fetches argument values and depends on role and authorization checkbox visibility********************************************/
			_onObjectMatched: function (oEvent) {
				periodiIdInput = oEvent.getParameter("arguments").id;
				this.getDisplayPeriodi();

			},
			/******************** getDisplayPeriodi fetches the data from the backend based on the 'periodiIdInput'********************************************/
			getDisplayPeriodi: function () {
				var oMainModel = new sap.ui.model.json.JSONModel();
				var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
				var oFilters = [];
				var that = this;

				if (periodiIdInput != undefined && periodiIdInput != "") {
					var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, periodiIdInput);
					oFilters.push(filter1);
				}
				xsoDataModel.read("/PERIODI_RIFERIMENTO?$format=json", {
					filters: oFilters,
					success: function (oDataIn, oResponse) {
						debugger;
						console.log(oDataIn);
						var modifyPeriodiData = oDataIn.results[0];
						console.log(modifyPeriodiData);
						modifyPeriodiData.VALE_DAL = Formatter.removetime(modifyPeriodiData.VALE_DAL); //removetime function in the Formatter is invoked to change the format of the Start Date to DD-MM-YYYY
						modifyPeriodiData.VALE_AL = Formatter.removetime(modifyPeriodiData.VALE_AL); //removetime function in the Formatter is invoked to change the format of the End Date to DD-MM-YYYY
						oMainModel.setData(
							modifyPeriodiData
						);
						that.getView().setModel(oMainModel, "displayPeriodiModel");
					},
					error: function (oDataIn, oResponse) {
						debugger;
						console.log(oDataIn);
					}
				});

			}
		});
	});