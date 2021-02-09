sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/m/MessageBox",
	"stipAdmin/stipAdmin/util/BloccaSchedePerson",
	"sap/m/TablePersoController",
	"stipAdmin/stipAdmin/util/Formatter",
	"sap/ui/core/BusyIndicator"
], function (Controller, JSONModel, Device, MessageBox, BloccaSchedePerson, TablePersoController, Formatter, BusyIndicator) {
	"use strict";

	return Controller.extend("stipAdmin.stipAdmin.controller.BloccaSchedePersonali", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {
			this.congArr = [];
			this.tops = 100;
			this.skip = 0;
			this.count = 0;
			this.byId("cong").setEnabled(false);
			this.byId("scong").setEnabled(false);
			this.byId("tbl").setVisible(false);
			this._oTPC = new TablePersoController({

				table: this.byId("tblBloccaPiste"),
				componentName: "BloccaSchedePersonali",
				persoService: BloccaSchedePerson
			}).activate();
			this.busyDialog = new sap.m.BusyDialog();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("BloccaSchedePersonali").attachPatternMatched(this._onObjectMatched, this);
		},
		/******************** onPersoButtonPressed function opens a dialog box for user to select which columns to be visible*******************************************/
		onPersoButtonPressed: function (oEvent) {
			this._oTPC.openDialog();
		},
		/******************** onTablePersoRefresh function is used to refresh the Perso Controller********************************************/
		onTablePersoRefresh: function () {
			BloccaSchedePerson.resetPersData();
			this._oTPC.refresh();
		},
		/******************** _onObjectMatched fetches argument values ********************************************/
		_onObjectMatched: function (oEvent) {
			var oArguments = oEvent.getParameter("arguments");
			this.selectedfiscalYearPeriodi = oArguments.str;
			this.getFilterData();
		},
		/******************** getFilterData function fetches the  filter data from the backend (as per ID_PERIODO ) 
		based on the Start and End date********************************************/
		getFilterData: function () {
			BusyIndicator.show();
			var that = this;
			var payload = {
				"ID_PERIODO": this.selectedfiscalYearPeriodi
			};
			$.ajax({
				url: "/HANAMDC/STIP/STIPAdmin/services/schedapersonalifilters.xsjs",
				type: "POST",
				method: "GET",
				contentType: 'application/json',
				dataType: 'text',
				data: {
					odata: JSON.stringify(payload)
				},
				success: function (data, textStatus1) {
					debugger;
					if (data.length > 0) {
						var oMainModel = new JSONModel();
						var filterData = JSON.parse(data);

						var periodi = filterData[13].DESCR_PERIODO;
						var gruppi = filterData[6].DESCR_GRUPPOSCHEDA;
						that.byId("idtxtfiscalyear").setText(periodi);
						var Periodi_start_date_main = filterData[14].VALE_DAL;
						var Periodi_end_date_main = filterData[15].VALE_AL;
						//max_id = data[21][1];
						console.log(Periodi_start_date_main);
						console.log(Periodi_end_date_main);
						var start = (new Date(Periodi_start_date_main)).getMonth() + 1;
						var end = (new Date(Periodi_end_date_main)).getMonth() + 1;
						var year = (new Date(Periodi_start_date_main)).getFullYear();
						var month = [{
							key: 0,
							month: ""
						}];
						for (var i = start; i <= 12; i++)
							month.push({
								key: i,
								month: Formatter.months(i) + " " + year
							});
						for (var i = 1; i <= end; i++)
							month.push({
								key: i,
								month: Formatter.months(i) + " " + (year + 1)
							});
						filterData = [{
							Month: month
						}, {
							Gruppi: gruppi
						}];

						var data0 = [];
						var setData = [{
							Filter: filterData
						}, {
							Main: data0
						}];
						oMainModel.setData(setData);
						BusyIndicator.hide();
						that.getView().setModel(oMainModel, "CongelaScongela");
						console.log(oMainModel.getData());
					}
				},
				error: function () {}
			});
		},
		/******************** onAvvio fetches and displays the data from the backend based on the filter values
			(cognome,nome,pisteid,dir,idscheda,descscheda,Dimessi,tipoPista,sdate,edate,gruppo,sg)********************************************/
		onAvvio: function () {
			var oFilters = [];
			var cognome = this.byId("cognome").getValue();
			var nome = this.byId("nome").getValue();
			var pisteid = this.byId("kpi").getValue();
			var dir = this.byId("dir").getValue();
			var idscheda = this.byId("idscheda").getValue();
			var descscheda = this.byId("descscheda").getValue();
			var Dimessi = this.byId("Dimessi").getSelectedKey();
			var tipoPista = this.byId("tipoKpi").getSelectedKey();
			var sdate = this.byId("sdate").getSelectedKey();
			var edate = this.byId("edate").getSelectedKey();
			var gruppo = this.byId("gruppo").getSelectedKey();
			var sg = this.byId("sg").getSelected();

			if (sg === true) {
				var filter = new sap.ui.model.Filter("SN_SCHEDAGESTIONALE", sap.ui.model.FilterOperator.EQ, "S");
				oFilters.push(filter);
			}
			if (dir != undefined && dir != "") {
				//var filter = new sap.ui.model.Filter("COGNOME", sap.ui.model.FilterOperator.EQ, cognome);
				var filter = new sap.ui.model.Filter({
					path: 'COGNOME_MGR',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: cognome,
					caseSensitive: false
				});
				oFilters.push(filter);
				filter = new sap.ui.model.Filter({
					path: 'NOME_MGR',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: cognome,
					caseSensitive: false
				});
				oFilters.push(filter);
			}

			if (cognome != undefined && cognome != "") {
				//var filter = new sap.ui.model.Filter("COGNOME", sap.ui.model.FilterOperator.EQ, cognome);
				var filter = new sap.ui.model.Filter({
					path: 'COGNOME',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: cognome,
					caseSensitive: false
				});
				oFilters.push(filter);
			}
			if (nome != undefined && nome != "") {
				//var filter = new sap.ui.model.Filter("NOME", sap.ui.model.FilterOperator.EQ, nome);
				var filter = new sap.ui.model.Filter({
					path: 'NOME',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: nome,
					caseSensitive: false
				});
				oFilters.push(filter);
			}
			if (Dimessi != undefined && Dimessi != "") {
				var filter = new sap.ui.model.Filter("STATUS_DIPENDENTE", sap.ui.model.FilterOperator.EQ, parseInt(Dimessi, 10));
				oFilters.push(filter);
			}
			if (sdate != undefined && sdate != "" && sdate != 0) {
				debugger;

				if (edate === undefined || edate === "" || edate === 0) {
					var month = parseInt(oMainModel.getData()[0].Filter[21].Month[12].key, 10);
					var yr = parseInt(oMainModel.getData()[0].Filter[21].Month[12].month.split(" ")[1]);

					if (month === 13) {
						month = 1;
						yr = yr + 1;
					}
					var edate1 = month + "-01-" + yr;
					edate1 = new Date(edate1);
					var sdate2 = parseInt(Formatter.monthsRev(sdate.split(" ")[0]), 10) + 1 + "-01-" + sdate.split(" ")[1];
					sdate2 = new Date(sdate2);
					sdate = Formatter.monthsRev(sdate.split(" ")[0]) + "-01-" + sdate.split(" ")[1];
					sdate = new Date(sdate);
					var filter = new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("INIZIO_ASSEGNAZIONE", sap.ui.model.FilterOperator.BT, sdate, sdate2),
							new sap.ui.model.Filter("FINE_ASSEGNAZIONE", sap.ui.model.FilterOperator.LE, edate1)
						],
						and: true,
					});
				} else {
					var month = parseInt(Formatter.monthsRev(edate.split(" ")[0]), 10) + 1;
					var yr = parseInt(edate.split(" ")[1], 10);
					if (month === 13) {
						month = 1;
						yr = yr + 1;
					}
					edate1 = month + "-01-" + yr;
					edate1 = new Date(edate1);
					var sdate1 = Formatter.monthsRev(sdate.split(" ")[0]) + "-01-" + sdate.split(" ")[1];
					sdate1 = new Date(sdate1);
					sdate2 = parseInt(Formatter.monthsRev(sdate.split(" ")[0]) + 1, 10) + "-01-" + sdate.split(" ")[1];
					sdate2 = new Date(sdate2);
					var filter = new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("INIZIO_ASSEGNAZIONE", sap.ui.model.FilterOperator.BT, sdate1, sdate2),
							new sap.ui.model.Filter("FINE_ASSEGNAZIONE", sap.ui.model.FilterOperator.LE, edate1)
						],
						and: true,
					});
				}

				oFilters.push(filter);
			}
			if (edate != undefined && edate != "" && edate != 0) {

				if (sdate === undefined || sdate === "" || sdate === 0) {
					var month = parseInt(Formatter.monthsRev(edate.split(" ")[0]), 10) + 1;
					var yr = parseInt(edate.split(" ")[1], 10);
					if (month === 13) {
						month = 1;
						yr = yr + 1;
					}
					var edate2 = month + "-01-" + yr;
					edate2 = new Date(edate2);
					var edate1 = parseInt(Formatter.monthsRev(edate.split(" ")[0]), 10) + "-01-" + yr;
					edate1 = new Date(edate1);

					month = parseInt(oMainModel.getData()[0].Filter[21].Month[1].key, 10);
					yr = parseInt(oMainModel.getData()[0].Filter[21].Month[1].month.split(" ")[1]);
					var sdate = month + "-01-" + yr;
					sdate = new Date(sdate);
					var filter = new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("INIZIO_ASSEGNAZIONE", sap.ui.model.FilterOperator.GE, sdate),
							new sap.ui.model.Filter("FINE_ASSEGNAZIONE", sap.ui.model.FilterOperator.BT, edate1, edate2)
						],
						and: true,
					});
					oFilters.push(filter);
				}
			}
			if (pisteid != undefined && pisteid != "") {
				var filter = new sap.ui.model.Filter("ID_PISTAVIEW", sap.ui.model.FilterOperator.EQ, pisteid);
				oFilters.push(filter);
			}
			if (tipoPista != undefined && tipoPista != "") {
				debugger
				var Periodi_start_date = Periodi_start_date_main;
				var Periodi_end_date = Periodi_end_date_main;
				//	var tempStorageDate = "";
				var piste_start_date = new Date(Periodi_start_date),
					piste_end_date = new Date(Periodi_end_date);
				if (tipoPista == "A") //when tipoPista= "A" Annual Periodi_start_date and Periodi_end_date is same pista_val_date and pista_al_date
				{
					piste_start_date = new Date(piste_start_date);
					piste_start_date = new Date(piste_start_date.setDate(piste_start_date.getDate() - 1));
					piste_end_date = new Date(piste_end_date);
					piste_end_date = new Date(piste_end_date.setDate(piste_end_date.getDate() + 1));
					tipoPista = "A";
				} else if (tipoPista == "S1") //when tipoPista= "S1" first 6 months 
				{
					piste_start_date = new Date(piste_start_date);
					piste_start_date = new Date(piste_start_date.setDate(piste_start_date.getDate() - 1));
					piste_end_date = new Date(piste_end_date.setMonth(piste_end_date.getMonth() - 6));
					//		piste_end_date = new Date(piste_end_date.setDate(piste_end_date.getDate() - 1));
					tipoPista = "S";
				} else if (tipoPista == "S2") //when tipoPista= "S2" last 6 months
				{
					piste_start_date = new Date(piste_start_date.setMonth(piste_start_date.getMonth() + 6));
					piste_start_date = new Date(piste_start_date.setDate(piste_start_date.getDate() - 1));
					piste_end_date = new Date(piste_end_date);
					piste_end_date = new Date(piste_end_date.setDate(piste_end_date.getDate() + 1));
					tipoPista = "S";
				} else if (tipoPista == "T1") //when tipoPista= "T1" first 3 months(1,2,3)
				{
					piste_start_date = new Date(piste_start_date);
					piste_start_date = new Date(piste_start_date.setDate(piste_start_date.getDate() - 1));
					piste_end_date = new Date(piste_end_date.setMonth(piste_end_date.getMonth() - 9));
					//	piste_end_date = new Date(piste_end_date.setDate(piste_end_date.getDate() - 1));
					tipoPista = "T";
				} else if (tipoPista == "T2") //when tipoPista= "T2" next 3 months(4,5,6)
				{
					piste_start_date = new Date(piste_start_date.setMonth(piste_start_date.getMonth() + 3));
					piste_start_date = new Date(piste_start_date.setDate(piste_start_date.getDate() - 1));
					piste_end_date = new Date(piste_end_date.setMonth(piste_end_date.getMonth() - 6));
					//	piste_end_date = new Date(piste_end_date.setDate(piste_end_date.getDate() - 1));
					tipoPista = "T";
				} else if (tipoPista == "T3") //when tipoPista= "T3" From 6th Month to 9th month
				{
					piste_start_date = new Date(piste_start_date.setMonth(piste_start_date.getMonth() + 6));
					piste_start_date = new Date(piste_start_date.setDate(piste_start_date.getDate() - 1));
					piste_end_date = new Date(piste_end_date.setMonth(piste_end_date.getMonth() - 3));
					piste_end_date = new Date(piste_end_date.setDate(piste_end_date.getDate() + 1));
					tipoPista = "T";
				} else if (tipoPista == "T4") //when tipoPista= "T4" last 3 months
				{
					piste_start_date = new Date(piste_start_date.setMonth(piste_start_date.getMonth() + 9));
					piste_start_date = new Date(piste_start_date.setDate(piste_start_date.getDate() - 1));
					piste_end_date = new Date(piste_end_date);
					piste_end_date = new Date(piste_end_date.setDate(piste_end_date.getDate() + 1));
					tipoPista = "T";
				}
				console.log(tipoPista + piste_start_date + piste_end_date);
				var ofilter5 = [];
				var filter13 = new sap.ui.model.Filter("TIPO_PISTA", sap.ui.model.FilterOperator.EQ, tipoPista);
				var filter14 = new sap.ui.model.Filter("PISTA_VALE_DAL", sap.ui.model.FilterOperator.GE, piste_start_date);
				var filter15 = new sap.ui.model.Filter("PISTA_VALE_AL", sap.ui.model.FilterOperator.LE, piste_end_date);
				ofilter5 = new sap.ui.model.Filter({
					filters: [
						filter13,
						filter14,
						filter15
					],
					and: true
				});
				oFilters.push(new sap.ui.model.Filter(ofilter5, false));
				console.log(oFilters);
			}
			if (idscheda != undefined && idscheda != "") {
				var filter = new sap.ui.model.Filter("ID_SCHEDAMASTER", sap.ui.model.FilterOperator.EQ, parseInt(idscheda, 10));
				oFilters.push(filter);
			}
			if (descscheda != undefined && descscheda != "") {
				//var filter = new sap.ui.model.Filter("DESCR_SCHEDA", sap.ui.model.FilterOperator.Contains, descscheda);
				var filter = new sap.ui.model.Filter({
					path: 'DESCR_SCHEDA',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: descscheda,
					caseSensitive: false
				});
				oFilters.push(filter);
			}
			if (gruppo != undefined && gruppo != "") {
				var filter = new sap.ui.model.Filter("ID_GRUPPOSCHEDA", sap.ui.model.FilterOperator.EQ, gruppo);
				oFilters.push(filter);
			}

			this.oFilters = oFilters;
			this.getSchedaPersonale(oFilters);
		},
		/******************** getSchedaPersonale function fetches the data from the V_SchedaPersonale (as per ID_PERIODO ) 
		based on SN_BLOCCATA,SN_Inattivo,INIZIO_ASSEGNAZIONE,FINE_ASSEGNAZIONE********************************************/
		getSchedaPersonale: function (oFilters) {
			BusyIndicator.show();
			var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, this.selectedfiscalYearPeriodi);
			oFilters.push(filter1);
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			var that = this;
			xsoDataModel.read("/V_SchedaPersonale?$format=json", {
				filters: oFilters,
				urlParameters: {
					"$top": this.tops,
					"$skip": this.skip
				},
				success: function (oDataIn, oResponse) {
					debugger;
					var data = [];
					var filterData = that.getView().getModel("CongelaScongela").getData()[0].Filter;
					that.byId("prev").setVisible(true);
					that.byId("next").setVisible(true);
					that.byId("next").setEnabled(true);
					if (that.count < 1)
						that.byId("prev").setEnabled(false);
					else
						that.byId("prev").setEnabled(true);
					data = oDataIn.results;
					console.log(data);
					if (data.length !== 0) {
						var data11 = data,
							m = {},
							vv;
						data = [];
						for (var i = 0; i < data11.length; i++) {
							vv = data11[i].ID_SCHEDAPERSONALE;
							if (!m[vv]) {
								m[vv] = true;
								data.push(data11[i]);
							}
						}
						for (var i = 0; i < data.length; i++) {

							if (data[i].SN_BLOCCATA === "S")
								data[i].Blocatta = "Blocatta"
							else
								data[i].Blocatta = "";

							data[i].RespDiretto = data[i].COGNOME_MGR + " " + data[i].NOME_MGR;

							if (data[i].SN_Inattivo === "N")
								data[i].SN_Inattivo = "";
							else if (data[i].SN_Inattivo === "S")
								data[i].Inattivo = "Inattivo";

							var sdate = data[i].INIZIO_ASSEGNAZIONE,
								edate = data[i].FINE_ASSEGNAZIONE;
							if (sdate !== null && sdate !== undefined && sdate !== "" && edate !== null && edate !== undefined && edate !== "") {
								if (sdate.getFullYear() < 0)
									sdate = "";
								else
									sdate = Formatter.months(sdate.getMonth() + 1) + " " + sdate.getFullYear();
								if (edate.getFullYear() < 0)
									edate = "";
								else
									edate = Formatter.months(edate.getMonth() + 1) + " " + edate.getFullYear();
								data[i].INIZIO_ASSEGNAZIONE = sdate;
								data[i].FINE_ASSEGNAZIONE = edate;
							}

						}

						var data11 = data,
							m = {},
							vv;
						data = [];
						for (var i = 0; i < data11.length; i++) {
							vv = data11[i].MATRICOLA;
							if (!m[vv]) {
								m[vv] = true;
								data11[i].Visible_CheckBox = true;
							} else {
								data11[i].MATRICOLA = "";
								data11[i].SID = "";
								data11[i].NOME = "";
								data11[i].COGNOME = "";
								data11[i].STATUS_DIPENDENTI = "";
								data11[i].QUALIFICA = "";
								data11[i].Visible_CheckBox = false;
							}
							data.push(data11[i]);
						}

						var oMainModel = new JSONModel();
						var setData = [{
							Filter: filterData
						}, {
							Main: data
						}];
						oMainModel.setData(setData);
						console.log(oMainModel.getData());
						that.getView().setModel(oMainModel, "CongelaScongela");
						that.byId("tbl").setVisible(true);
						BusyIndicator.hide();
					} else {
						BusyIndicator.hide();
						MessageBox.error("Nessun utente trovato"); //Error message displayed 'No users found'
					}
				},
				error: function (oDataIn, oResponse) {
					BusyIndicator.hide();
				}
			});

		},
		/******************** _next function takes the user to the next page of the table********************************************/
		_next: function () {
			this.count = this.count + 1;
			this.skip = this.skip + this.tops;
			this.getSchedaPersonale(this.oFilters)
		},
		/******************** _prev function takes the user to the previous page of the table*******************************************/
		_prev: function () {
			this.count = this.count - 1;
			if (this.skip > 0)
				this.skip = this.skip - this.tops;
			else
				this.skip = 0;
			this.getSchedaPersonale(this.oFilters)
		},
		/******************** onResetta will reset all the filter fields(cognome,nome,pisteid,dir,idscheda,descscheda,Dimessi,tipoPista,sdate,edate,gruppo,sg) as blank********************************************/
		onResetta: function () {
			this.count = 0;
			this.tops = 100;
			this.skip = 100;
			this.byId("cognome").setValue("");
			this.byId("nome").setValue("");
			this.byId("kpi").setValue("");
			this.byId("dir").setValue("");
			this.byId("idscheda").setValue("");
			this.byId("descscheda").setValue("");
			this.byId("Dimessi").setSelectedKey("");
			this.byId("tipoKpi").setSelectedKey("");
			this.byId("sdate").setSelectedKey("");
			this.byId("edate").setSelectedKey("");
			this.byId("gruppo").setSelectedKey("");
			this.byId("sg").setSelected(false);
		},
		/******************** onHomePage function naviagtes the user to the Home Page of the StipAdmin module********************************************/
		onHomePage: function (oEvent) {
			this.byId("sg").setSelected(false);

			this.clear();
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
			this.busyDialog.close();
		},
		/******************** handleBack function naviagtes the user to the previous page (BloccaCongela)********************************************/
		handleBack: function (oEvent) {
			this.byId("sg").setSelected(false);

			this.clear();
			this.busyDialog.open();
				sap.ui.core.UIComponent.getRouterFor(this).navTo("BloccaCongela", {
				BloccaCongela: "BloccaCongela",
				str: this.selectedfiscalYearPeriodi
			});
			this.busyDialog.close();
		},
		clear: function () {
			/*	var data = [];
				oMainModel.setData(data);
				this.getView().setModel(oMainModel, "SchedaMasterModel");
				oMainModel.refresh();*/
			//	this.byId("vsdFilterBar").setVisible(false);
			//	this.byId("vsdFilterLabel").setText("");
			//	resetting filter
			if (sap.ui.getCore().byId("FilterDialogBloccaSchedePersonali") !== undefined) {
				var aFilterItems = sap.ui.getCore().byId("FilterDialogBloccaSchedePersonali").getFilterItems();
				aFilterItems.forEach(function (item) {
					var aItems = item.getItems();
					aItems.forEach(function (item) {
						item.setSelected(false);
					});
				});
			}
			if (this.byId("cognome").getValue())
				this.byId("cognome").setValue("");

			if (this.byId("nome").getValue())
				this.byId("nome").setValue("");

			if (this.byId("Dimessi").getSelectedKey())
				this.byId("Dimessi").setSelectedKey("");

			if (this.byId("tipoKpi").getSelectedKey())
				this.byId("tipoKpi").setSelectedKey("");

			if (this.byId("kpi").getValue())
				this.byId("kpi").setValue("");

			if (this.byId("idscheda").getValue())
				this.byId("idscheda").setValue("");

			if (this.byId("descscheda").getSelectedKey())
				this.byId("descscheda").setSelectedKey("");

			// if (this.byId("sg").getValue())
			// 	this.byId("sg").setValue("");

			if (this.byId("gruppo").getSelectedKey())
				this.byId("gruppo").setSelectedKey("");

			if (this.byId("dir").getSelectedKey())
				this.byId("dir").setSelectedKey("");

			if (this.byId("sdate").getSelectedKey())
				this.byId("sdate").setSelectedKey("");

			if (this.byId("edate").getSelectedKey())
				this.byId("edate").setSelectedKey("");

			if (this.byId("sel71").getSelectedKey())
				this.byId("sel71").setSelectedKey("");
			// if (this.byId("idSearchBox").getSelectedKey())
			// this.byId("idSearchBox").setSelectedKey("");

			/*	this.onSearch();
				var oTable = this.getView().byId("tbl");
				var aBinding = oTable.getBinding("items");
				aBinding.filter([]);*/
			/*	if (this.byId("box4").getSelectedKey())
					this.byId("box4").setSelectedKey("");*/
		},
		/******************** selectCong function fetches the ID_SCHEDAPERSONALE value
		If none is selected, then both buttons Congela Selezionati and Scongela Selezionati are disabled
		else buttons are enabled based on the ID_SCHEDAPERSONALE and SN_BLOCCATA********************************************/
		selectCong: function (oEvent, id) {
			var f1 = 0,
				f2 = 0;
			if (oEvent.mParameters.selected === true)
				this.congArr.push({
					ID_SCHEDAPERSONALE: id
				});
			else {
				for (var i = 0; i < this.congArr.length; i++) {
					if (this.congArr[i].ID_SCHEDAPERSONALE === id)
						this.congArr.splice(i, 1);
				}
			}
			if (this.congArr.length === 0) {
				this.byId("cong").setEnabled(false);
				this.byId("scong").setEnabled(false);
			} else {
				var data = this.getView().getModel("CongelaScongela").getData()[1].Main;
				for (var i = 0; i < this.congArr.length; i++) {
					for (var ii = 0; ii < data.length; ii++) {
						if (this.congArr[i].ID_SCHEDAPERSONALE === data[ii].ID_SCHEDAPERSONALE && data[ii].SN_BLOCCATA !== "S") {
							this.congArr[i].f1 = 1;
							this.congArr[i].f2 = 0;
						} else if (this.congArr[i].ID_SCHEDAPERSONALE === data[ii].ID_SCHEDAPERSONALE && data[ii].SN_BLOCCATA === "S") {
							this.congArr[i].f1 = 0;
							this.congArr[i].f2 = 1;
						}
					}
				}

				for (var i = 0; i < this.congArr.length; i++) {

					f1 = f1 + this.congArr[i].f1;
					f2 = f2 + this.congArr[i].f2;
				}

				if (f1 === this.congArr.length && f2 === 0) {
					this.byId("cong").setEnabled(true);
					this.byId("scong").setEnabled(false);
				} else if (f2 === this.congArr.length && f1 === 0) {
					this.byId("scong").setEnabled(true);
					this.byId("cong").setEnabled(false);
				} else {
					this.byId("cong").setEnabled(false);
					this.byId("scong").setEnabled(false);
				}

			}

			console.log(this.congArr);

		},
		/********************selectCongAll function will select/deselect all the checkboxes and the buttons Congela Selezionati and Scongela Selezionati
		 are enabled/disabled based on the ID_SCHEDAPERSONALE and SN_BLOCCATA********************************************/
		selectCongAll: function (oEvent) {
			if (oEvent.mParameters.selected === false) {
				this.congArr = [];
				this.byId("cong").setEnabled(false);
				this.byId("scong").setEnabled(false);

			} else {
				var data = this.getView().getModel("CongelaScongela").getData()[1].Main;
				for (var i = 0; i < data.length; i++)
					this.congArr.push(data[i].ID_SCHEDAPERSONALE);

				for (var i = 0; i < this.congArr.length; i++) {
					for (var ii = 0; ii < data.length; ii++) {
						if (this.congArr[i] === data[ii].ID_SCHEDAPERSONALE && data[ii].SN_BLOCCATA !== "S")
							this.f1 += 1;
						else if (this.congArr[i] === data[ii].ID_SCHEDAPERSONALE && data[ii].SN_BLOCCATA === "S")
							this.f2 += 1;
					}
				}
				if (f1 === 1 && f2 === 0)
					this.byId("cong").setEnabled(true);
				else if (f2 === 1 && f1 === 0)
					this.byId("scong").setEnabled(true);
				else {
					this.byId("cong").setEnabled(false);
					this.byId("scong").setEnabled(false);
				}

			}
			console.log(this.congArr);

		},
		/******************** onCongelaSelezionati function will pass the value to sPayload as S ********************************************/
		onCongelaSelezionati: function (oEvent) {
			var that = this;
			BusyIndicator.show();
			var sPayload = {
				"scheda": this.congArr,
				"type": 2,
				"value": "S"
			};
			sPayload = JSON.stringify(sPayload);
			var url = "/HANAMDC/STIP/STIPAdmin/services/bloccaScheda.xsjs";
			$.ajax({
				url: url,
				type: "GET",
				contentType: "application/json",
				data: {
					odata: sPayload
				},
				//dataType: 'jsonp',
				success: function (data1, textStatus1, XMLHttpRequest1) {
					debugger;
					that.byId("cong").setEnabled(false);
					that.byId("scong").setEnabled(true);
					that.onAvvio();
					BusyIndicator.hide();
				},
				error: function (data1, textStatus1, XMLHttpRequest1) {
					BusyIndicator.hide();
				}
			});
		},
		/******************** onScongelaSelezionati function will pass the value to sPayload as N ********************************************/
		onScongelaSelezionati: function (oEvent) {
			var that = this;
			BusyIndicator.show();
			var sPayload = {
				"scheda": this.congArr,
				"type": 2,
				"value": "N"
			};
			sPayload = JSON.stringify(sPayload);
			var url = "/HANAMDC/STIP/STIPAdmin/services/bloccaScheda.xsjs";
			$.ajax({
				url: url,
				type: "GET",
				contentType: "application/json",
				data: {
					odata: sPayload
				},
				//dataType: 'jsonp',
				success: function (data1, textStatus1, XMLHttpRequest1) {
					debugger;
					that.byId("cong").setEnabled(true);
					that.byId("scong").setEnabled(false);
					that.onAvvio();
					BusyIndicator.hide();
				},
				error: function (data1, textStatus1, XMLHttpRequest1) {
					BusyIndicator.hide();
				}
			});
		},
	});

});