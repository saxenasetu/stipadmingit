sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "sap/m/MessageBox", "stipAdmin/stipAdmin/util/Formatter",
		"sap/ui/core/BusyIndicator"
	],
	function (Controller, JSONModel, MessageBox, Formatter, BusyIndicator) {
		"use strict";
		var selectedFYPeriodi;
		return Controller.extend("stipAdmin.stipAdmin.controller.displaySchedaMaster", {
			/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
			onInit: function () {
				this.getOwnerComponent().getRouter().getRoute("displaySchedaMaster").attachPatternMatched(this._onObjectMatched, this)
			},
			/******************** cancel function navigates the user back to the previous SchedaMaster page ********************************************/
			cancel: function () {
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "back");
				//var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/FISCAL_YEAR");
				//	console.log(selectedFYPeriodi);
				sap.ui.core.UIComponent.getRouterFor(this).navTo("SchedaMaster", {
					master: "SchedaMaster",
					str: selectedFYPeriodi
				});
			},
			/******************** _onObjectMatched fetches argument values********************************************/
			_onObjectMatched: function (oEvent) {
				//	debugger
				var id = oEvent.getParameter("arguments").id;
				this.getDisplaySchedaMaster(id);
				//this.byId("fy").setText(sap.ui.getCore().getModel("BasicAppModel").getProperty("/year"));

			},
			/********************getDisplaySchedaMaster function fetches and displays the data from the backend V_SchedaMaster1 ********************************************/
			getDisplaySchedaMaster: function (id) {
				//	debugger
				BusyIndicator.show();
				var oMainModel = new sap.ui.model.json.JSONModel();
				// console.log(sap.ui.getCore().getModel("BasicAppModel").getProperty("/DISPLAY_PERIODI_VIEW_ID"));
				//	var schedaMasterIdndex = sap.ui.getCore().getModel("BasicAppModel1").getProperty("/DISPLAY_SCHEDA_VIEW_ID");
				/*var displaySchedaData = sap.ui.getCore().getModel("DisplayModel").getData();
				console.log(displaySchedaData);
				oMainModel.setData(
					displaySchedaData
				);*/
				var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");

				var data, that = this;
				var oFilters = [],
					PISTE = [],
					tmp;
				var filter1 = new sap.ui.model.Filter("ID_SCHEDAMASTER", sap.ui.model.FilterOperator.EQ, id);
				oFilters.push(filter1);
				xsoDataModel.read("/V_SchedaMaster1?$format=json", {
					filters: oFilters,
					success: function (oDataIn, oResponse) {
						debugger;

						data = oDataIn.results;

						console.log(data);
						selectedFYPeriodi = data[0].ID_PERIODO;
						for (var j = 0; j < data.length; j++) {
							if (data[j].ID_PISTA !== null) {
								tmp = {
									DESCR_PISTA: data[j].DESCR_PISTA,
									ID_CURVA: data[j].ID_CURVA,
									ID_PISTA: data[j].ID_PISTA,
									TIPO_PISTA: data[j].TIPO_PISTA,
									VALE_DAL: data[j].PISTA_VALE_DAL,
									VALE_AL: data[j].PISTA_VALE_AL,
									ID_SCHEDAMASTER: data[j].ID_SCHEDAMASTER,
									N_ORDINE: data[j].N_ORDINE,
									PESO_PERCENTUALE: data[j].PESO_PERCENTUALE + "%",
								};
								PISTE.push(tmp);
							}
						}
						var data11 = PISTE,
							m = {};
						PISTE = [];
						for (var i = 0; i < data11.length; i++) {
							var vv = data11[i].ID_PISTA;
							if (!m[vv]) {
								m[vv] = true;
								PISTE.push(data11[i]);
							}
						}
						if (data[0].NOTE === "NULL")
							data[0].NOTE = "";
						if (data[0].SN_CONGELATA === "N")
							data[0].SN_CONGELATA = "No";
						else
							data[0].SN_CONGELATA = "Si";
						data[0].PISTE = PISTE;

						oMainModel.setData(data[0]);

						that.getView().setModel(oMainModel, "displaySchedaModel");
						BusyIndicator.hide();
					},
					error: function () {
						BusyIndicator.hide();
					}
				});
			}
		});
	});