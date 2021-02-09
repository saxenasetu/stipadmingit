sap.ui.define(["sap/m/MessageToast",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/Fragment",
		"sap/ui/core/BusyIndicator",
		"sap/m/MessageBox",
		"sap/ui/Device",
		"stipAdmin/stipAdmin/util/Formatter"
	],
	function (e, JSONModel, a, Fragment, BusyIndicator, MessageBox, Device, Formatter) {
		"use strict";
		var oMainModel = new JSONModel(),
			oMainModelll = new JSONModel(),
			oMainModel2 = new JSONModel(),
			id,
			pista2 = [];
		var count = {
			rows: 0,
			per: 0
		};
		var data = [],
			constData = [];
		var dataa = [];
		var list = [],
			load = 0;
		var selectedFYPeriodi;
		return a.extend("stipAdmin.stipAdmin.controller.modSchedaMaster", {
			/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
			onInit: function () {
				this.getOwnerComponent().getRouter().getRoute("modSchedaMaster").attachPatternMatched(this._onObjectMatched, this);
			},
			/******************** _onObjectMatched fetches argument values********************************************/
			_onObjectMatched: function (oEvent) {
				data = [];
				id = oEvent.getParameter("arguments").id;

				this.modSchedaMaster1(id);

			},
			/******************** getGeneric function calls generic.xsjs ,payload is ID_PERIODO and output is fiscal year
			based on the Start and End date****************************/
			getGeneric: function (selectedfiscalYearPeriodi) {
				var that = this;
				BusyIndicator.show();
				var sPayload = {
					"ID_PERIODO": selectedfiscalYearPeriodi
				};
				sPayload = JSON.stringify(sPayload);
				var url = "/HANAMDC/STIP/STIPAdmin/services/generic.xsjs";
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

						that.byId("fy").setText(data1[1].DESCR_PERIODO);
						var year = data1[1].DESCR_PERIODO;
						var curve = data1[6].CURVE;
						var gruppo = data1[13].GRUPPOSCHEDA;
						var pay = data1[7].MAXPERCPAYOUT;
						var gruppopista = data1[5].GRUPPO;

						var Periodi_start_date_main = data1[8].dates[0].VALE_DAL;
						var Periodi_end_date_main = data1[8].dates[0].VALE_AL;
						//max_id = data[21][1];
						console.log(Periodi_start_date_main);
						console.log(Periodi_end_date_main);
						var start = (new Date(Periodi_start_date_main)).getMonth() + 1;
						var end = (new Date(Periodi_end_date_main)).getMonth() + 1;
						var years = (new Date(Periodi_start_date_main)).getFullYear();
						var month = [{
							key: 0,
							month: ""
						}];

						for (var i = start; i <= 12; i++)
							month.push({
								key: i,
								month: Formatter.months(i) + " " + years
							});
						for (var i = 1; i <= end; i++)
							month.push({
								key: i,
								month: Formatter.months(i) + " " + (years + 1)
							});
						BusyIndicator.hide();

						var data111 = [];
						data111.push({
							CURVE: curve
						}, {
							GRUPPO: gruppo
						}, {
							PAY: pay
						}, {
							Month: month
						}, {
							newId: 0
						}, {
							year: year
						}, {
							GRUPPOPISTA: gruppopista
						});

						oMainModelll.setData(data111);
						that.getView().setModel(oMainModelll, "maxPayoutModel");
						sap.ui.getCore().setModel(oMainModelll, "maxPayoutModel");
						BusyIndicator.hide();
					},
					error: function (data1, textStatus1, XMLHttpRequest1) {
						BusyIndicator.hide();
					}
				});
			},
			/******************** modSchedaMaster1 function is used to fetch the data from the backend(V_SchedaMaster1) based on the filter values********************************************/
			modSchedaMaster1: function () {
				debugger;
				BusyIndicator.show();
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

						data = data[0];

						var matricola = parseInt(data.MATRICOLA,10);
						if (data.NOTE === null) // if note is null , make it ""
							data.NOTE = "";

						if (data.SN_BLOCCATA === "S") {
							that.byId("per_piste").setEditable(false);
							that.byId("agguingi").setEnabled(false);
							that.byId("remRow").setEnabled(false);
							that.byId("mat2").setVisible(true);
							that.byId("mat").setVisible(false);
							that.byId("elimina").setEnabled(false);
							that.byId("desc").setEnabled(false);
							that.byId("payout").setEnabled(false);
							that.byId("gruppo").setEnabled(false);
							that.byId("congelata").setEnabled(false);
							that.byId("note").setEnabled(false);
							that.byId("Salva").setEnabled(false);

						} else {
							that.byId("mat2").setVisible(false);
							that.byId("Salva").setEnabled(true);

							if (matricola !== 0) {
								that.byId("per_piste").setEditable(false);
								that.byId("agguingi").setEnabled(false);
								that.byId("remRow").setEnabled(false);
								that.byId("mat").setVisible(true);
								that.byId("elimina").setEnabled(false);

							} else {
								that.byId("per_piste").setEditable(true);
								that.byId("agguingi").setEnabled(true);
								//this.byId("remRow").setVisible(true);
								that.byId("remRow").setEnabled(true);
								that.byId("mat").setVisible(false);
								that.byId("elimina").setEnabled(true);
							}
						}

						that.byId("gruppo").setSelectedKey(data.ID_GRUPPOSCHEDA);
						oMainModel.setData(data);
						console.log(oMainModel.getData());
						that.getView().setModel(oMainModel, "modModel");

						var data0 = [];
						dataa = [{
							Agguingi: data0
						}, {
							PISTE: data.PISTE
						}, {
							PISTE_COUNT: count
						}];

						var pp = 0,
							rr = 0;
						for (var i = 0; i < data.PISTE.length; i++)
							pp = pp + parseInt(data.PISTE[i].PESO_PERCENTUALE.split("%")[0], 10);
						rr = data.PISTE.length;
						dataa[2].PISTE_COUNT.per = pp + "%";
						dataa[2].PISTE_COUNT.rows = rr;

						oMainModel2.setData(dataa);
						that.getView().setModel(oMainModel2, "newModel");
						//selectedfiscalYearPeriodi = data.ID_PERIODO;
						that.getGeneric(selectedFYPeriodi);

						BusyIndicator.hide();
					},
					error: function () {
						BusyIndicator.hide();
					}
				});

				/*data = sap.ui.getCore().getModel("ModificaModel").getData();
				constData = sap.ui.getCore().getModel("ModificaModel").getData();
				id = data.ID_SCHEDAMASTER;*/

			},
			/******************** modSchedaMaster function fetches the data from the backend based on the ID_PERIODO and 
			based on the start and end months, it assigns the gruppi,piste and curva values ********************************************/
			modSchedaMaster: function () {
				debugger;
				load = 1;
				var that = this;

				dataa.push(sap.ui.getCore().getModel("xsjsModel").getData());
				if (dataa.length === 0 || dataa.length === 1) {
					var sPayload = {
						"ID_PERIODO": selectedFYPeriodi
					};
					sPayload = JSON.stringify(sPayload);

					var url = "/HANAMDC/STIP/STIPAdmin/services/createSchedaMasterDisplay.xsjs";

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
							BusyIndicator.show();
							console.log("Inside success")
							console.log(data1);
							if (data1[0].NOTE === undefined) // if note is null , make it ""
								data1[0].NOTE = "";
							var yr = "";

							var data11 = data1[0].Piste,
								gruppi = [],
								curva = [],
								piste = [];
							if (data11.length !== 0)
								yr = new Date(data11[0].MESE_INIZIO).getFullYear();

							for (var i = 0; i <= 12; i++) {
								if (i === 0)
									piste.push({
										key: "",
										date: ""
									});
								else
									piste.push({
										//key: i + "-" + yr,
										key: Formatter.months(i) + " " + yr,
										date: Formatter.months(i) + " " + yr
									});
							}

							var m = {};
							for (var i = 0; i < data11.length; i++) {
								data11[i].MESE_INIZIO = Formatter.months(new Date(data11[i].MESE_INIZIO).getMonth() + 1) + " " + new Date(data11[i].MESE_INIZIO)
									.getFullYear();
								data11[i].MESE_FINE = Formatter.months(new Date(data11[i].MESE_FINE).getMonth() + 1) + " " + new Date(data11[i].MESE_FINE).getFullYear();

								//data11[i].MESE_INIZIO = new Date(data11[i].MESE_INIZIO).getMonth() + 1 + "-" + new Date(data11[i].MESE_INIZIO).getFullYear();
								//data11[i].MESE_FINE = new Date(data11[i].MESE_FINE).getMonth() + 1 + "-" + new Date(data11[i].MESE_FINE).getFullYear();
								var v = {
										id: data11[i].ID_GRUPPOPISTA,
										desc: data11[i].DESCR_GRUPPOPISTA
									},
									c = {
										id: data11[i].ID_CURVA,
										desc: data11[i].DESCR_CURVA
									},
									vv = data11[i].ID_GRUPPOPISTA,
									cc = data11[i].ID_CURVA;
								/*var p = {
										//	start_date: new Date(data11[i].MESE_INIZIO).getMonth() + 1 + " " + new Date(data11[i].MESE_INIZIO).getYear(),
										start_date: Formatter.months(data11[i].MESE_INIZIO.split("-")[0]) + " " + data11[i].MESE_INIZIO.split("-")[1],
										key_date: data11[i].MESE_INIZIO
									},
									q = {
										end_date: data11[i].MESE_FINE
									},
									pp = data11[i].MESE_INIZIO,
									qq = data11[i].MESE_FINE;*/
								if (!m[vv]) {
									gruppi.push(v);
									m[vv] = true;
								}
								if (!m[cc]) {
									curva.push(c);
									m[cc] = true;

								}
								/*	if (!m[pp] || !m[qq]) {
								if(!m[pp] && !m[qq]){
									piste.push(p);
									piste.push(q);
									m[pp] = true;
								}

								 else if(!m[qq]){
									m[qq] = true;
									piste.push(q);
								}
								else if (!m[pp]) {
									piste.push(p);
									m[pp] = true;
								}}
*/

							}

							pista2 = {
								GRUPPI: gruppi,
								CURVA: curva,
								PISTE: piste
							};
							data1.push({
								Filter_Model: pista2
							});
							data1.push({
								PISTE_COUNT: count
							});
							data1.push(data);
							oMainModel.setData(data1);

							//sap.ui.getCore().setModel(oMainModel,"BasicAppModel")
							that.getView().setModel(oMainModel, "newModel");
							console.log(oMainModel.getData());
							that.countPer();
							that.byId("gruppo").setSelectedKey(1);
							that.byId("gruppo").setSelectedKey(oMainModel.getData()[3][0].ID_GRUPPOSCHEDA);
							that.byId("congelata").setSelectedKey(oMainModel.getData()[3][0].SN_CONGELATA);
							//	that.byId("p4p").setSelectedKey(oMainModel.getData()[3][0].P4P);
							BusyIndicator.hide();
						},
						error: function (data1, textStatus1, XMLHttpRequest1) {
							//BusyIndicator.hide();
						}

					});
				} else {
					console.log("Schedamaster model")
					BusyIndicator.hide();
					dataa[0][3][0] = data;
					var neww = dataa[0];
					oMainModel.setData(neww);
					that.getView().setModel(oMainModel, "newModel");
				}

			},
			/********************countPer function is used to get the total percentage based on the PESO_PERCENTUALE********************************************/
			countPer: function () {
				var total_rows = oMainModel.getData().PISTE.length;
				oMainModel2.setProperty("/2/PISTE_COUNT/rows", total_rows);
				var total_per = 0; //oMainModel.getData()[1].PISTE.length;
				for (var i = 0; i < total_rows; i++) {
					if (typeof (oMainModel.getData().PISTE[i].PESO_PERCENTUALE) !== "number")
						var per = parseInt(oMainModel.getData().PISTE[i].PESO_PERCENTUALE.split("%")[0], 10);
					else
						per = parseInt(oMainModel.getData().PISTE[i].PESO_PERCENTUALE, 10);
					if (isNaN(per))
						per = 0;
					total_per = total_per + per;
				}
				total_per = total_per + "%";
				//oMainModel2.setProperty("/2/PISTE_COUNT/rows", total_rows);
				oMainModel2.setProperty("/2/PISTE_COUNT/per", total_per);
				oMainModel2.refresh();
			},
			/******************** AggiungiPista function is used to access the AggiungiPista fragment  and displays blank fields********************************************/
			AggiungiPista: function (oEvent) {
				debugger;
				this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.AggiungiPista", this);
				this.getView().addDependent(this._oValueHelpDialog);
				this.AgguingiTableClear();

				this._oValueHelpDialog.open();
			},
			/*selectPiste: function (oEvent) {
				debugger;
				var pisteRow = parseInt(oEvent.oSource.mProperties.text, 10);
				for (var i = 0; i < oMainModel.getData()[0].Piste.length; i++) {
					if (oMainModel.getData()[0].Piste[i].ID_PISTE === pisteRow) {
						var tmpPista = {
							ID_SCHEDAMASTER: id,
							ID_PISTA: pisteRow,
							N_ORDINE: 0,
							ID_CURVA: oMainModel.getData()[0].Piste[i].ID_CURVA,
							PESO_PERCENTUALE: "0%",
							DESCR_PISTA: oMainModel.getData()[0].Piste[i].DESCR_PISTA
						};
						break;
					}
				}
				oMainModel.getData()[3][0].PISTE.push(tmpPista);
				this.countPer();
				oMainModel.refresh();

			},*/
			/******************** selectPiste function is used to count the percentage based on the Piste row ********************************************/
			selectPiste: function (oEvent, piste) {
				debugger;
				var pisteRow = piste;
				//var pisteRow = parseInt(oEvent.oSource.mProperties.text, 10);
				for (var i = 0; i < oMainModel2.getData()[0].Agguingi.length; i++) {
					if (oMainModel2.getData()[0].Agguingi[i].ID_PISTE === pisteRow) {
						var tmpPista = {
							ID_SCHEDAMASTER: 0,
							ID_PISTA: pisteRow,
							N_ORDINE: 0,
							PESO_PERCENTUALE: "0%",
							DESCR_PISTA: oMainModel2.getData()[0].Agguingi[i].DESCR_PISTA
						};
						break;
					}
				}
				//oMainModel.getData()[3][0].PISTE.push(tmpPista);

				var f = 0;
				if (oMainModel.getData().PISTE.length !== 0) {
					for (var i = 0; i < oMainModel.getData().PISTE.length; i++) {
						if (oMainModel.getData().PISTE[i].ID_PISTA === tmpPista.ID_PISTA) {
							f = 1;
							break;
						}
					}
				} else
					f = 0;
				if (f === 0) {
					oMainModel.getData().PISTE.push(tmpPista);

					//pista.push(tmpPista);
					this.countPer();
					oMainModel.refresh();
				} else
					MessageBox.error("Pista esiste per questo schedamaster"); //Track exists for this cardmaster
				//console.log(pista);

			},
			/******************** removeRow function is used to remove the particular row based on Piste********************************************/
			removeRow: function (oEvent, pisteid) {
				debugger;

				var pisteTable = oMainModel.getData().PISTE;
				for (var i = 0; i < pisteTable.length; i++) {
					if (pisteTable[i].ID_PISTA === pisteid)
						pisteTable.splice(i, 1);
				}
				oMainModel.refresh();
				this.countPer();
			},
			/******************** AgguingiTableSearch function is used to set the table filters for AgguingiKPI********************************************/
			AgguingiTableSearch: function (oEvent) {
				debugger;
				//this.newSchedaMaster();
				var descScheda = sap.ui.getCore().byId("descNewPiste").getValue();
				var piste = sap.ui.getCore().byId("Piste").getSelectedKey();
				var gruppo = parseInt(sap.ui.getCore().byId("Gruppo").getSelectedKey(), 10);
				var sdate = sap.ui.getCore().byId("sDate").getSelectedKey();
				var edate = sap.ui.getCore().byId("eDate").getSelectedKey();
				var curva = parseInt(sap.ui.getCore().byId("curva").getSelectedKey(), 10);
				var pers = sap.ui.getCore().byId("pers").getSelectedKey();
				var tipo = sap.ui.getCore().byId("tipo").getSelectedKey();
				var idScheda = sap.ui.getCore().byId("idFilter").getValue();

				var oFilters = [];

				if (idScheda != undefined && idScheda != "" && idScheda != 0) {
					var filter1 = new sap.ui.model.Filter("ID_PISTAVIEW", sap.ui.model.FilterOperator.EQ, idScheda);
					oFilters.push(filter1);
				}
				if (descScheda != undefined && descScheda != "") {
					var filter2 = new sap.ui.model.Filter("DESCR_PISTA", sap.ui.model.FilterOperator.Contains, descScheda);
					oFilters.push(filter2);
				}
				if (gruppo != undefined && gruppo != "" && gruppo != 0 && !isNaN(gruppo)) {
					var filter6 = new sap.ui.model.Filter("ID_GRUPPOPISTA", sap.ui.model.FilterOperator.EQ, gruppo);
					oFilters.push(filter6);
				}
				if (curva != undefined && curva != "" && curva != 0 && !isNaN(curva)) {
					var filter3 = new sap.ui.model.Filter("ID_CURVA", sap.ui.model.FilterOperator.EQ, curva);
					oFilters.push(filter3);
				}
				var aFilters = [];
				if (sdate != undefined && sdate != "") {
					var filter4 = new sap.ui.model.Filter("MESE_INIZIO", sap.ui.model.FilterOperator.EQ, sdate);
					aFilters.push(filter4);
				}

				if (edate != undefined && edate != "") {
					var filter5 = new sap.ui.model.Filter("MESE_FINE", sap.ui.model.FilterOperator.EQ, edate);
					aFilters.push(filter5);
				}
				if (sap.ui.getCore().byId("Piste").getSelectedItem())
					this.onSearch();
				oFilters.push(new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, selectedFYPeriodi));
				console.log(oFilters);

				var that = this;
				BusyIndicator.show();
				var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
				oFilters.push(new sap.ui.model.Filter("ID_PISTA_MADRE", sap.ui.model.FilterOperator.EQ, 0));
				xsoDataModel.read("/V_AGGUINGI?$format=json", {
					filters: oFilters,
					success: function (oDataIn, oResponse) {
						debugger;
						var data = oDataIn.results;
						console.log(data);
						if (data.length !== 0) {
							for (var i = 0; i < data.length; i++) {
								var sdate = data[i].MESE_INIZIO,
									edate = data[i].MESE_FINE;
								if (sdate !== null && sdate !== undefined && sdate !== "" && edate !== null && edate !== undefined && edate !== "") {
									sdate = Formatter.months(sdate.getMonth() + 1) + " " + sdate.getFullYear();
									edate = Formatter.months(edate.getMonth() + 1) + " " + edate.getFullYear();
									data[i].MESE_INIZIO = sdate;
									data[i].MESE_FINE = edate;
								} else {
									data[i].MESE_INIZIO = "";
									data[i].MESE_FINE = "";
								}
							}
						}
						dataa[0].Agguingi = data;

						oMainModel2.setData(dataa);
						oMainModel2.refresh();
						//that.getView().setModel(oMainModel2, "newModel");
						BusyIndicator.hide();
						sap.ui.getCore().byId("tbl").setVisible(true);
						if (aFilters.length !== 0) {
							var oTable = sap.ui.getCore().byId("tbl");

							var aBinding = oTable.getBinding("items");
							aBinding.filter(new sap.ui.model.Filter({
								filters: aFilters,
								and: true // AND operator true will check all of the filter conditions get satisfied
							}));
						}
					},
					error: function (oDataIn, oResponse) {
						debugger;
						console.log(oDataIn);
						BusyIndicator.hide();
					}
				});

			},
			/********************onSearch function fetches the data from the backend based on the Piste ********************************************/
			onSearch: function (oEvent) {
				var oEntry = {
					ID_PERIODO: selectedFYPeriodi,
					ID_PISTAVIEW: "",
					DESCR_PISTA: "",
					PISTA: "",
					ID_GRUPPOPISTA: "",
					DESCR_GRUPPOPISTA: "",
					PISTA_VALE_DAL: "",
					PISTA_VALE_AL: "",
					ID_CURVA: "",
					DESCR_CURVA: "",
					Pers: "",
					Tipo: "",
					MATRICOLA: "",
					NOME: "",
					COGNOME: ""
				};

				if (sap.ui.getCore().byId("Piste").getSelectedItem()) {
					oEntry.PISTA = sap.ui.getCore().byId("Piste").getSelectedKey();
				} else {
					oEntry.PISTA = "";
				}
				var that = this;
				var url = "/HANAMDC/STIP/STIPAdmin/services/GetPisteHomePage.xsjs";
				$.ajax({
					url: that.sServiceUrl + "/",
					type: "GET",
					beforeSend: function (xhr) {
						xhr.setRequestHeader("X-CSRF-Token", "Fetch"); //Passing CSRF token fetch request in header of GET 
					},
					success: function (data, textStatus, XMLHttpRequest) {
						var token = XMLHttpRequest.getResponseHeader("X-CSRF-Token");
						$.ajax({
							url: url,
							type: "POST",
							contentType: "application/json",
							data: JSON.stringify(oEntry),
							//dataType: 'jsonp',
							beforeSend: function (xhr) {
								xhr.setRequestHeader("X-CSRF-Token", token);
							},
							success: function (data1, textStatus1, XMLHttpRequest1) {
								debugger;

								oMainModel.setProperty("/0/Piste", data1);
								sap.ui.getCore().byId("tbl").setVisible(true);
								//that.modSchedaMaster();

							},
							error: function (data1, textStatus1, XMLHttpRequest1) {
								//that.modSchedaMaster();
							}
						});
					}
				});

				/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			},
			/******************** AgguingiTableClear function is used to set all the fields as blank in AgguingiKPI********************************************/
			AgguingiTableClear: function (oEvent) {
				debugger;
				//this.newSchedaMaster();
				sap.ui.getCore().byId("descNewPiste").setValue("");
				sap.ui.getCore().byId("Piste").setSelectedKey("");
				sap.ui.getCore().byId("Gruppo").setSelectedKey("");
				sap.ui.getCore().byId("sDate").setSelectedKey("");
				sap.ui.getCore().byId("eDate").setSelectedKey("");
				sap.ui.getCore().byId("curva").setSelectedKey("");
				sap.ui.getCore().byId("pers").setSelectedKey("");
				sap.ui.getCore().byId("tipo").setSelectedKey("");
				sap.ui.getCore().byId("idFilter").setValue("");
				//this.AgguingiTableSearch();
				sap.ui.getCore().byId("tbl").setVisible(false);

			},
			/********************onCloseDialog function is used to close the dialog box********************************************/
			onCloseDialog: function (oEvent) {
				this.AgguingiTableClear();
				this._oValueHelpDialog.destroy();
			},
			/******************** validation function is used for validation checks and displays error in case of no KPI********************************************/
			/********************If user input is OK, then invokes SaveScheda function to save the changes ********************************************/
			validation: function () {
				debugger;
				var that = this;
				var pista = oMainModel.getData().PISTE;
				if (pista.length === 0)	//Error is displayed in case of no KPI
					MessageBox.error("Inserire almeno un KPI"); //Insert at least one KPI
				else {
					console.log(pista);
					for (var i = 0; i < pista.length; i++)
						pista[i].N_ORDINE = i + 1;

					var per = parseInt(oMainModel2.getProperty("/2/PISTE_COUNT/per").split("%")[0], 10);
					if (per !== 100)	//Confirmation message is displayed if Pista count not 100
						MessageBox.confirm("La Percentuale assegnata alle piste non risultata pari al 100% si desidera salva comunuque?", {
							//The percentage allocated to the tracks was not 100% you want to save however?
							styleClass: "sapUiSizeCompact",
							actions: ["Si", sap.m.MessageBox.Action.NO],
							emphasizedAction: "Si",
							initialFocus: sap.m.MessageBox.Action.NO,
							onClose: function (oAction) {
								if (oAction === "Si") {
									that.SaveScheda();
								}

							}
						});

					//MessageBox.error("La Percentuale assegnata alle piste non risultata pari al 100% si desidera salva comunuque?");
					else
						this.SaveScheda();
				}
			},
			/******************** SaveScheda function is used to succesfully save the changes and navigate back to the previous page********************************************/
			SaveScheda: function () {
				debugger;
				var pista = oMainModel.getData().PISTE,
					that = this;
				if (pista.length !== 0) {
					for (var i = 0; i < pista.length; i++) {
						pista[i].PESO_PERCENTUALE = parseFloat(pista[i].PESO_PERCENTUALE.split("%")[0], 10);
						pista[i].ID_SCHEDAMASTER = oMainModel.getData().ID_SCHEDAMASTER;
					}
				}

				var payout = this.byId("payout").getValue();
				if (payout !== "" && payout !== undefined && payout !== null)
					payout = parseFloat(payout, 10);
				else
					payout = 0;

				var gruppo = this.byId("gruppo").getSelectedKey();
				if (gruppo !== "" && gruppo !== undefined && gruppo !== null)
					gruppo = parseInt(gruppo, 10);
				else
					gruppo = 0;

				var data = oMainModel.getData();

				var payload = {
					ID_SCHEDAMASTER: data.ID_SCHEDAMASTER,
					ID_PERIODO: parseInt(selectedFYPeriodi, 10),
					DESCR_SCHEDA: data.DESCR_SCHEDA,
					ID_GRUPPOSCHEDA: gruppo,
					NOTE: data.NOTE,
					SN_CONGELATA: this.byId("congelata").getSelectedKey(),
					SN_BLOCCATA: "N",
					MAXPERCPAYOUT: payout,
					//	P4P: this.byId("p4p").getSelectedKey(),
					P4P: "",
					pista: pista
				};

				console.log(payload);
				var sPayload = JSON.stringify(payload);
				console.log(sPayload);

				$.ajax({
					url: "/HANAMDC/STIP/STIPAdmin/services/modificaSchedaMaster.xsjs",
					type: "POST",
					method: "GET",
					contentType: 'application/json',
					data: {
						odata: sPayload
					},
					dataType: 'text',

					success: function (data, textStatus1) {
						debugger;
						console.log(data);

						//	MessageBox.success("Scheda Master modifica con successo");

						MessageBox.success("Scheda Master modificata con successo ", { //Master tab successfully editing
							onClose: function (oEvent) {
								debugger;
								console.log("Onclose");
								that.cancel();
							}
						});

					},
					error: function (data, textStatus1) {
						debugger;
						console.log(data);
						MessageBox.error("Error while perfoming Modifica operation. Please contact administrator.");
						jQuery.sap.log.getLogger().error("Modifica operation failed" + textStatus1.toString());
					}
				});

			},
			/******************** elimina function seeks confirmation from the user to delete********************************************/
			/******************** If the user input is OK,then invokes the deleteScheda function ********************************************/
			elimina: function () {
				var that = this;
				//var ID_SCHEDAMASTER = oMainModel.getData()[3][0].ID_SCHEDAMASTER;
				sap.m.MessageBox.confirm("Sei sicuro di voler eliminare?", { //Are you sure you want to delete?
					actions: ["Si", sap.m.MessageBox.Action.NO],
					onClose: function (oAction) {
						if (oAction == "NO") {
							//that.cancel();
						} else if (oAction == "Si") {
							that.deleteScheda();
						}

					}
				});
			},
			/******************** deleteScheda function will delete the Particular record based on ID_SCHEDAMASTER and leads to the previous page********************************************/
			deleteScheda: function () {
				var payload = {
						ID_SCHEDAMASTER: oMainModel.getData().ID_SCHEDAMASTER,
						NOTE: "elimina"
					},
					that = this;

				console.log(payload);
				var sPayload = JSON.stringify(payload);
				console.log(sPayload);

				$.ajax({
					url: "/HANAMDC/STIP/STIPAdmin/services/modificaSchedaMaster.xsjs",
					type: "POST",
					method: "GET",
					contentType: 'application/json',
					data: {
						odata: sPayload
					},
					dataType: 'text',

					success: function (data, textStatus1) {
						debugger;
						console.log(data);

						MessageBox.success(
							"Scheda Master eliminata con successo", { //Master tab successfully deleted
								onClose: function (oEvent) {
									debugger;
									console.log("Onclose");
									sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "delete");
									that.cancel();

								}
							});

					},
					error: function (data, textStatus1) {
						debugger;
						console.log(data);
						MessageBox.error("Error while perfoming Modifica operation. Please contact administrator.");
						jQuery.sap.log.getLogger().error("Modifica operation failed" + textStatus1.toString());
					}
				});

			},
			/********************cancel function navigates the user to the previous SchedaMaster page after 
			setting the per_piste and remRow as enabled based on condition********************************************/
			cancel: function () {
				if (sap.ui.getCore().getModel("BasicAppModel").getProperty("/back") !== "delete")
					sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "modifica");
				this.byId("per_piste").setEditable(true);
				this.byId("remRow").setEnabled(true);
				oMainModel.setData(null);
				//var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/FISCAL_YEAR");
				console.log(selectedFYPeriodi);
				sap.ui.core.UIComponent.getRouterFor(this).navTo("SchedaMaster", {
					master: "SchedaMaster",
					str: selectedFYPeriodi
				});
			},
		})
	});