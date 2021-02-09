sap.ui.define(["sap/m/TablePersoController", "sap/ui/core/Fragment",
	"sap/ui/Device", "./DemoPersoService", "./Formatter", "sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel", "sap/m/MessageBox", "stipAdmin/stipAdmin/util/Formatter", "./exportExcel", "sap/ui/model/Sorter",
], function (e, Fragment, Device, o, t, n, i, MessageBox, Formatter, Excel, Sorter) {
	"use strict";

	var oMainModel = new sap.ui.model.json.JSONModel();

	var selectedfiscalYearPeriodi;
	var year = "";
	var tops = 50,
		skip = 0;
	var oFilters = [];
	return n.extend("stipAdmin.stipAdmin.controller.TraccMod", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {
			this.count = 0;
			this._mViewSettingsDialogs = {};
			this.busyDialog = new sap.m.BusyDialog;
			//              this.getView().byId("filterbar")._oSearchButton.setText("Cerca"); // Changing filter bar button name
			this.getOwnerComponent().getRouter().getRoute("TraccMod").attachPatternMatched(this._onObjectMatched, this);
		},
		/******************** _onObjectMatched fetches argument values and depends on role and authorization checkbox visibility********************************************/
		_onObjectMatched: function (oEvent) {
			var oArguments = oEvent.getParameter("arguments");
			selectedfiscalYearPeriodi = oArguments.str;
			console.log(selectedfiscalYearPeriodi);
			this.getFiscalYear(selectedfiscalYearPeriodi);
		},
		/******************** getFiscalYear function calls generic.xsjs ,payload is ID_PERIODO and output is fiscal year****************************/
		/******************** START of getFiscalYear method*********************************/
		getFiscalYear: function (selectedfiscalYearPeriodi) {
			var sPayload = {
				"ID_PERIODO": selectedfiscalYearPeriodi
			};
			sPayload = JSON.stringify(sPayload);
			var that = this;
			var url = "/HANAMDC/STIP/STIPAdmin/services/generic.xsjs";
			$.ajax({
				url: url,
				type: "GET",
				contentType: "application/json",
				data: {
					odata: sPayload
				},
				success: function (data1, textStatus1) {
					debugger;
					console.log(data1);
					year = data1[1].DESCR_PERIODO;
					that.byId("fy").setText(year);

				}.bind(this),
				error: function (data1, textStatus1) {
					debugger;
					console.log("error");
				}
			});
		},
		/******************** END of getFiscalYear method*********************************/
		/*******************onHome method navigates user to home page of STIPAdmin module*****************************/
		onHome: function () {
			this.clear();
			var n = sap.ui.core.UIComponent.getRouterFor(this);
			n.navTo("Home");
		},
		/************************clear function clears all the upper filter values and makes it blank bydefault one********************************/
		clear: function (oEvent) {
			this.count = 0;
			this.getView().byId("tipoEntita").setSelectedKey("");
			this.getView().byId("tipoOper").setSelectedKey("");
			this.getView().byId("idEntita").setValue("");
			this.getView().byId("descrEntita").setValue("");
			this.getView().byId("inteEntita").setValue("");
			this.getView().byId("dataOperStart").setValue("");
			this.getView().byId("dataOperEnd").setValue("");
			this.getView().byId("opertator").setValue("");
			this.getView().byId("transNote").setValue("");
			this.getView().byId("limitRighe").setValue("");

		},

		/*******************onSearch function fetches the data as per the upper filter values
		In this functiona we are ready with the filters and actual back eend task is perfored ingetLogData function ********************/
		onSearch: function () {
			debugger
			this.count = 0;
			tops = 50;
			skip = 0;
			var oFilters = [];
			var tipoEntita = this.getView().byId("tipoEntita").getSelectedKey();
			if (tipoEntita != undefined && tipoEntita != "") {
				var filter1 = new sap.ui.model.Filter("ENTITA", sap.ui.model.FilterOperator.EQ, tipoEntita);
				oFilters.push(filter1);
			}
			var tipoOper = this.getView().byId("tipoOper").getSelectedKey();
			if (tipoOper != undefined && tipoOper != "") {
				var filter2 = new sap.ui.model.Filter("TIPO_OPERAZIONE", sap.ui.model.FilterOperator.EQ, tipoOper);
				oFilters.push(filter2);
			}
			var idEntita = this.getView().byId("idEntita").getValue();
			if (idEntita != undefined && idEntita != "") {
				var filter3 = new sap.ui.model.Filter("ID_ENTITA", sap.ui.model.FilterOperator.EQ, idEntita);
				oFilters.push(filter3);
			}
			var descrEntita = this.getView().byId("descrEntita").getValue();
			if (descrEntita != undefined && descrEntita != "") {
				var filter4 = new sap.ui.model.Filter("DESCR_ENTITA", sap.ui.model.FilterOperator.Contains, descrEntita);
				oFilters.push(filter4);
			}
			var inteEntita = this.getView().byId("inteEntita").getValue();
			if (inteEntita != undefined && inteEntita != "") {
				var filter5 = new sap.ui.model.Filter("INTESTATARIO_ENTITA", sap.ui.model.FilterOperator.Contains, inteEntita);
				oFilters.push(filter5);
			}
			var dataOperStart = this.getView().byId("dataOperStart").getValue();
			if (dataOperStart != undefined && dataOperStart != "") {
				var dataOperEnd = this.getView().byId("dataOperEnd").getValue();
				if (dataOperEnd === undefined || dataOperEnd === "")
					var filter6 = new sap.ui.model.Filter("DATAORA", sap.ui.model.FilterOperator.BT, new Date(dataOperStart + " 00:00:00 GMT+0100"),
						new Date(dataOperStart + " 23:59:59 GMT+0100"));
				else
					var filter6 = new sap.ui.model.Filter("DATAORA", sap.ui.model.FilterOperator.BT, new Date(dataOperStart + " 00:00:00 GMT+0100"),
						new Date(dataOperEnd + " 23:59:59 GMT+0100"));
				oFilters.push(filter6);
			}
			var dataOperEnd = this.getView().byId("dataOperEnd").getValue();
			if (dataOperEnd != undefined && dataOperEnd != "") {
				if (dataOperStart === undefined || dataOperStart === "") {
					var filter7 = new sap.ui.model.Filter("DATAORA", sap.ui.model.FilterOperator.BT, new Date(dataOperEnd + " 00:00:00 GMT+0100"),
						new Date(
							dataOperEnd + " 23:59:59 GMT+0100"));
					oFilters.push(filter7);
				}
			}
			var opertator = this.getView().byId("opertator").getValue();
			if (opertator != undefined && opertator != "") {
				var filter8 = new sap.ui.model.Filter("ENTITA", sap.ui.model.FilterOperator.EQ, opertator);
				oFilters.push(filter8);
			}

			var transNote = this.getView().byId("transNote").getValue();
			if (transNote != undefined && transNote != "") {
				var filter9 = new sap.ui.model.Filter("NOTA", sap.ui.model.FilterOperator.Contains, transNote);
				oFilters.push(filter9);
			}
			var limitRighe = this.getView().byId("limitRighe").getValue();
			if (limitRighe != undefined && limitRighe != "") {
				var filter10 = new sap.ui.model.Filter("ENTITA", sap.ui.model.FilterOperator.EQ, limitRighe);
				oFilters.push(filter10);
			}
			this.byId("prev").setVisible(true);
			this.byId("next").setVisible(true);
			oFilters.push(new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, selectedfiscalYearPeriodi));
			this.oFilters = oFilters;
			this.getLogData(oFilters);
		},
		/***********getLogData function input is filters and output is data from table P_LOG as per the input filter**/
		getLogData: function (oFilters) {
			var transModGetJson = [];

			var transModGetJsonData = {};
			var that = this;
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			xsoDataModel.read("/P_LOG", {
				filters: oFilters,
				urlParameters: {
					"$top": tops,
					"$skip": skip
				},
				success: function (oDataIn, oResponse) {
					debugger;

					if (oDataIn.results.length !== 0) {
						/*
						                                                                                       this.byId("prev").setEnabled(false);
						                                                                                       this.byId("next").setEnabled(false);
						                                                                         } else {*/

						if (that.count < 1)
							that.byId("prev").setEnabled(false);
						else
							that.byId("prev").setEnabled(true);
						that.byId("next").setEnabled(true);
						console.log(oDataIn);

						for (var i = 0; i < oDataIn.results.length; ++i) {
							if (oDataIn.results[i].COGNOME === undefined)
								oDataIn.results[i].COGNOME = '';
							if (oDataIn.results[i].NOME === undefined)
								oDataIn.results[i].NOME = '';
							if (oDataIn.results[i].ENTITA === 1)
								oDataIn.results[i].ENTITA = "KPI";
							else if (oDataIn.results[i].ENTITA === 2)
								oDataIn.results[i].ENTITA = "Schede Personali";
							else if (oDataIn.results[i].ENTITA === 3)
								oDataIn.results[i].ENTITA = "Schede Gestionali";

							transModGetJsonData = {
								"NOME": oDataIn.results[i].COGNOME + " " + oDataIn.results[i].NOME,
								"DATAORA": Formatter.removetime(oDataIn.results[i].DATAORA),
								"ENTITA": oDataIn.results[i].ENTITA,
								"DESCR_ENTITA": oDataIn.results[i].DESCR_ENTITA,
								"ID_ENTITA": oDataIn.results[i].ID_ENTITA,
								"INTESTATARIO_ENTITA": oDataIn.results[i].INTESTATARIO_ENTITA,
								"TIPO_OPERAZIONE": oDataIn.results[i].TIPO_OPERAZIONE,
								"NOTA": oDataIn.results[i].NOTA === "NULL" ? "" : oDataIn.results[i].NOTA

							};

							transModGetJson.push(transModGetJsonData);
						}
						console.log(transModGetJson);
					} else {
						this.byId("next").setEnabled(false);
						MessageBox.error("Nessun dato trovato");
					}

					oMainModel.setData(
						transModGetJson
					);

					this.getView().setModel(oMainModel, "TransModTableModel");

				}.bind(this),
				error: function (oError) {
					//Handle the error
					this.byId("prev").setEnabled(false);
					this.byId("next").setEnabled(false);
					MessageBox.error("Nessun dato trovato");
					jQuery.sap.log.getLogger().error("P_LOG fetch failed" + oError.toString());
				}.bind(this)
			});
		},
		/*******_next function calls the next 50 records as per the filtered crieteria************/
		_next: function () {
			this.count = this.count + 1;
			skip = skip + tops;

			this.getLogData(this.oFilters);
		},
		/*******_prev function calls the previous 50 records as per the filtered crieteria************/
		_prev: function () {
			this.count = this.count - 1;
			if (skip > 0)
				skip = skip - tops;
			else
				skip = 0;

			//totalmatCount = totalmatCount - this.matCount;
			//totalpckgCount = totalpckgCount - this.pckgCount;
			this.getLogData(this.oFilters);
		},

	});
});