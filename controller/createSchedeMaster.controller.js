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
			max_id, pista = [],
			pisteData,
			pista2 = [];
		/*	var pista = [{
				per_piste: "%",
				id_piste: "",
				desc_piste: ""
			}];*/
		var count;
		var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/FISCAL_YEAR");
		return a.extend("stipAdmin.stipAdmin.controller.createSchedeMaster", {
			/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
			onInit: function () {
				this._mViewSettingsDialogs = {};
				this.getOwnerComponent().getRouter().getRoute("createSchedeMaster").attachPatternMatched(this._onObjectMatched, this);

			},
			/******************** _onObjectMatched fetches argument values********************************************/
			_onObjectMatched: function (oEvent) {
				selectedFYPeriodi = oEvent.getParameter("arguments").fy;
				this.getGeneric(selectedFYPeriodi);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "create");
				this.byId("desc").setValue("");
				this.byId("gruppo").setSelectedKey("");
				this.byId("note").setValue("");
				//this.byId("PisteTable").setValue("");
				pisteData = [];
				count = {
					rows: 0,
					per: 0
				};

				var data0 = [];
				var dataa = [{
					Agguingi: data0
				}, {
					PISTE: pisteData
				}, {
					PISTE_COUNT: count
				}];

				oMainModel2.setData(dataa);
				oMainModel2.refresh();
				this.getView().setModel(oMainModel2, "newModel");
				this.byId("payout").setValue("200");
				/*console.log(sap.ui.getCore().getModel("maxPayoutModel").getData());
				var filterdata = sap.ui.getCore().getModel("maxPayoutModel").getData();
				oMainModelll.setData(filterdata);
				this.getView().setModel(oMainModelll, "maxPayoutModel");
				this.byId("fy").setText(filterdata[5].year);*/
				/*var dataa = sap.ui.getCore().getModel("xsjsModel").getData();
				oMainModel.setData(dataa);
				this.byId("fy").setText(dataa[0].DESCR_PERIODO);
				console.log(dataa);
				this.getView().setModel(oMainModel, "newModel");*/

				//this.newSchedaMaster();
				//this.sServiceUrl = this.getOwnerComponent().getModel().sServiceUrl;

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
						max_id = data1[4].ID_SCHEDAMASTER;
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
							newId: max_id
						}, {
							year: year
						}, {
							GRUPPOPISTA: gruppopista
						});

						oMainModelll.setData(data111);
						that.getView().setModel(oMainModelll, "maxPayoutModel");
						console.log(that.getView().getModel("maxPayoutModel").getData());
						sap.ui.getCore().setModel(oMainModelll, "maxPayoutModel");
						BusyIndicator.hide();
					},
					error: function (data1, textStatus1, XMLHttpRequest1) {
						BusyIndicator.hide();
					}
				});
			},
			/******************** newSchedaMaster function fetches the data from the backend based on the ID_PERIODO and 
			based on the start and end months, it assigns the gruppi,piste and curva values ********************************************/
			newSchedaMaster: function () {
				debugger;
				BusyIndicator.show();
				var sPayload = {
					"ID_PERIODO": selectedFYPeriodi
				};
				sPayload = JSON.stringify(sPayload);

				var that = this;
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
						console.log(data1);
						BusyIndicator.show();
						/*data1.push({
							PISTE_MODEL: pista
						});
						data1.push({
							PISTE_COUNT: count
						});
						oMainModel.setData(data1);
						//sap.ui.getCore().setModel(oMainModel,"BasicAppModel")
						that.getView().setModel(oMainModel, "newModel");*/
						var yr = "";
						var data11 = data1[0].Piste,
							data = [{
								PISTE: pista
							}],
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
								cc = data11[i].ID_CURVA
								/*,
																p = {
																	//	start_date: new Date(data11[i].MESE_INIZIO).getMonth() + 1 + " " + new Date(data11[i].MESE_INIZIO).getYear(),
																	start_date: data11[i].MESE_INIZIO,
																	end_date: data11[i].MESE_FINE
																}*/
							;
							if (!m[vv]) {
								gruppi.push(v);
								m[vv] = true;
							}
							if (!m[cc]) {
								curva.push(c);
								//piste.push(p);
								m[cc] = true;

							}

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
						//data1[3][0].ID_SCHEDAMASTER = data1[0].ID_SCHEDAMASTER;
						oMainModel.setData(data1);

						//sap.ui.getCore().setModel(oMainModel,"BasicAppModel")
						that.getView().setModel(oMainModel, "newModel");
						console.log(oMainModel.getData());
						max_id = oMainModel.getData()[0].ID_SCHEDAMASTER;
						that.countPer();
						pista2 = [];
						BusyIndicator.hide();
					},
					error: function (data1, textStatus1, XMLHttpRequest1) {
						BusyIndicator.hide();
					}

				});

			},
			/******************** AggiungiPista function is used to access the AggiungiPista fragment and displays blank fields********************************************/
			AggiungiPista: function (oEvent) {
				this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.AggiungiPista", this);
				this.getView().addDependent(this._oValueHelpDialog);
				this.AgguingiTableClear();
				this._oValueHelpDialog.open();
			},
			/******************** selectPiste function is used to count the percentage based on the Piste row ********************************************/
			selectPiste: function (oEvent, piste) {
				debugger;
				var pisteRow = piste;
				//var pisteRow = parseInt(oEvent.oSource.mProperties.text, 10);
				for (var i = 0; i < oMainModel2.getData()[0].Agguingi.length; i++) {
					if (oMainModel2.getData()[0].Agguingi[i].ID_PISTE === pisteRow) {
						var tmpPista = {
							ID_SCHEDAMASTER: max_id,
							ID_PISTA: pisteRow,
							N_ORDINE: 0,
							//ID_CURVA: oMainModel.getData()[0].Piste[i].ID_CURVA,
							PESO_PERCENTUALE: "0%",
							DESCR_PISTA: oMainModel2.getData()[0].Agguingi[i].DESCR_PISTA
						};
						break;
					}
				}
				var f = 0;
				if (oMainModel2.getData()[1].PISTE.length !== 0) {
					for (var i = 0; i < oMainModel2.getData()[1].PISTE.length; i++) {
						if (oMainModel2.getData()[1].PISTE[i].ID_PISTA === tmpPista.ID_PISTA) {
							f = 1;
							break;
						}
					}
				} else
					f = 0;
				if (f === 0) {
					oMainModel2.getData()[1].PISTE.push(tmpPista);

					//pista.push(tmpPista);
					this.countPer();
					oMainModel.refresh();
				} else
					MessageBox.error("Pista esiste per questo schedamaster");
				//console.log(pista);

			},

			/*addRow: function (t) {
				debugger;
				var pisteTable = this.getView().byId("PisteTable");
				var o = pisteTable.getModel("newModel").getProperty("/1/PISTE_MODEL");
				var i = {
					per_piste: "%",
					desc_piste: ""
				};
				o.push(i);
				pisteTable.getModel("newModel").setProperty("/1/PISTE_MODEL", o);
				this.countPer();
			},*/
			/******************** removeRow function is used to remove the particular row based on Piste********************************************/
			removeRow: function (oEvent, pisteid) {
				debugger;

				var pisteTable = oMainModel2.getData()[1].PISTE;
				for (var i = 0; i < pisteTable.length; i++) {
					if (pisteTable[i].ID_PISTA === pisteid)
						pisteTable.splice(i, 1);
				}
				oMainModel2.refresh();
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
					//	var filter2 = new sap.ui.model.Filter("DESCR_PISTA", sap.ui.model.FilterOperator.Contains, descScheda);
					var filter2 = new sap.ui.model.Filter({
						path: 'DESCR_PISTA',
						operator: sap.ui.model.FilterOperator.Contains,
						value1: descScheda,
						caseSensitive: false
					});
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
						var dataa = [{
							Agguingi: data
						}, {
							PISTE: pisteData
						}, {
							PISTE_COUNT: count
						}];

						oMainModel2.setData(dataa);
						that.getView().setModel(oMainModel2, "newModel");
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
			/********************countPer function is used to get the total percentage based on the PESO_PERCENTUALE********************************************/
			countPer: function () {
				debugger;
				//var total_rows = oMainModel.getData()[3][0].PISTE.length;
				var total_rows = oMainModel2.getData()[1].PISTE.length;
				oMainModel2.setProperty("/2/PISTE_COUNT/rows", total_rows);
				var total_per = 0; //oMainModel.getData()[1].PISTE.length;
				for (var i = 0; i < total_rows; i++) {
					//var per = parseInt(pista[i].PESO_PERCENTUALE.split("%")[0], 10);
					if (typeof (oMainModel2.getData()[1].PISTE[i].PESO_PERCENTUALE) !== "number")
						var per = parseInt(oMainModel2.getData()[1].PISTE[i].PESO_PERCENTUALE.split("%")[0], 10);
					else
						per = parseInt(oMainModel2.getData()[1].PISTE[i].PESO_PERCENTUALE, 10);
					if (isNaN(per))
						per = 0;
					total_per = total_per + per;
				}
				total_per = total_per + "%";
				//oMainModel.setProperty("/2/PISTE_COUNT/rows", total_rows);
				oMainModel2.setProperty("/2/PISTE_COUNT/per", total_per);
				oMainModel2.refresh();
			},
			/******************** validation function is used for validation checks and displays error in case of no KPI********************************************/
			/********************If user input is OK, then invokes SaveScheda function to save the changes ********************************************/
			validation: function () {
				debugger;
				/*	var that = this;
					for (var i = 0; i < pista.length; i++)
						pista[i].n_ordine = i + 1;
					console.log(pista);*/
				pista = oMainModel2.getData()[1].PISTE;
				var that = this;
				if (pista.length === 0)		//Error is displayed when Pista count is 0
					MessageBox.error("Inserire almeno un KPI");
				else {
					//var pista = oMainModel.getData()[3][0].PISTE;
					for (var i = 0; i < pista.length; i++) {
						pista[i].N_ORDINE = i + 1;
						if (typeof (pista[i].PESO_PERCENTUALE) != "number")
							pista[i].PESO_PERCENTUALE = parseFloat(pista[i].PESO_PERCENTUALE.split("%")[0], 10);

					}
					console.log(pista);

					if (oMainModel2.getData()[2].PISTE_COUNT.rows !== 0)
						var per = parseInt(oMainModel2.getProperty("/2/PISTE_COUNT/per").split("%")[0], 10);
					else
						var per = 0;
					if (per !== 100)	//displays a confirmation message when the total count is not 100
						MessageBox.confirm("La Percentuale assegnata alle piste non risultata pari al 100% si desidera salva comunuque?", {
							//The percentage allocated to the tracks was not 100% you want to save however?
							styleClass: "sapUiSizeCompact",
							actions: ["Si", sap.m.MessageBox.Action.NO],
							emphasizedAction: "Si",
							initialFocus: sap.m.MessageBox.Action.NO,
							onClose: function (oAction) {
								if (oAction === "NO") {
									//that.cancel();
								} else if (oAction === "Si") {
									that.SaveScheda();
								}

							}
						});

					//MessageBox.error("La Percentuale assegnata alle piste non risultata pari al 100% si desidera salva comunuque?");
					else
						this.SaveScheda();
				}
			},
			/******************** SaveScheda function is used to succesfully save the new entries and navigate back to the previous page********************************************/
			SaveScheda: function () {

				var SchedaMasterPiste = [],
					that = this;
				//var pista = oMainModel2.getData()[1].PISTE;
				if (pista.length !== 0) {
					for (var i = 0; i < pista.length; i++) {
						var tmp = {
							//ID_SCHEDAMASTER: oMainModel.getData()[0].ID_SCHEDAMASTER,
							ID_SCHEDAMASTER: oMainModelll.getData()[4].newId,
							ID_PISTA: pista[i].ID_PISTA,
							N_ORDINE: pista[i].N_ORDINE,
							PESO_PERCENTUALE: pista[i].PESO_PERCENTUALE
						};
						SchedaMasterPiste.push(tmp);
					}
				}
				var payout = this.byId("payout").getValue();
				//pista =  oMainModel.getData()[3][0].PISTE;
				if (payout !== "" && payout !== undefined && payout !== null)
					payout = parseFloat(payout, 10);
				else
					payout = 0;
				//var data = oMainModel.getData()[3][0];
				var gruppo = this.byId("gruppo").getSelectedKey();
				if (gruppo !== "" && gruppo !== undefined && gruppo !== null)
					gruppo = parseInt(gruppo, 10);
				else
					gruppo = 0;
				var payload = {
					ID_SCHEDAMASTER: oMainModelll.getData()[4].newId,
					ID_PERIODO: parseInt(selectedFYPeriodi, 10),
					DESCR_SCHEDA: this.byId("desc").getValue(),
					ID_GRUPPOSCHEDA: parseInt(this.byId("gruppo").getSelectedKey(), 10),
					NOTE: this.byId("note").getValue(),
					SN_CONGELATA: this.byId("congelata").getSelectedKey(),
					SN_BLOCCATA: "x",
					MAXPERCPAYOUT: parseFloat(this.byId("payout").getValue(), 10),
					//	P4P: this.byId("p4p").getSelectedKey(),
					P4P: "",
					SchedaMasterPiste: SchedaMasterPiste
				};

				/*var payload = {
					ID_SCHEDAMASTER: max_id,
					ID_PERIODO: selectedFYPeriodi,
					DESCR_SCHEDA: this.byId("desc").getValue(),
					ID_GRUPPOSCHEDA: parseInt(this.byId("gruppo").getSelectedKey(), 10),
					NOTE: this.byId("note").getValue(),
					SN_CONGELATA: this.byId("congelata").getSelectedKey(),
					SN_BLOCCATA: "x",
					MAXPERCPAYOUT: payout,
					//	P4P: this.byId("p4p").getSelectedKey(),
					P4P: "",
					SchedaMasterPiste: SchedaMasterPiste
				};*/

				console.log(payload);
				var sPayload = JSON.stringify(payload);
				console.log(sPayload);

				$.ajax({
					url: "/HANAMDC/STIP/STIPAdmin/services/createSchedaMaster.xsjs",
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

						MessageBox.success("Scheda Master creata con successo", {
							onClose: function (oEvent) {
								//		debugger;
								console.log("Onclose");
								sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "create");
								that.cancel();
							}
						});

					},
					error: function (data, textStatus1) {
						debugger;
						console.log(data);
						MessageBox.error("Error while perfoming Salva operation. Please contact administrator.");
						jQuery.sap.log.getLogger().error("Salva operation failed" + textStatus1.toString());
					}
				});

			},
			/********************onSearch function fetches the data from the backend based on the Piste ********************************************/
			onSearch: function (oEvent) {
				debugger;
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
								/*if (oEntry.PISTA_VALE_DAL) {
									var todate = oEntry.PISTA_VALE_DAL;
									for (var n = 0; n < data1.length; n++) {
										var fromdate = sap.ui.core.format.DateFormat.getDateTimeInstance({
											pattern: "yyyy-MM-dd HH:mm"
										}).format(new Date(data1[n].PISTA_VALE_DAL));
										if (fromdate !== todate) {
											data1.splice(n, 1);
											n--;
										}
									}
								}
								if (oEntry.PISTA_VALE_AL) {
									var todate = oEntry.PISTA_VALE_AL;
									for (n = 0; n < data1.length; n++) {
										var fromdate = sap.ui.core.format.DateFormat.getDateTimeInstance({
											pattern: "yyyy-MM-dd HH:mm"
										}).format(new Date(data1[n].PISTA_VALE_AL));
										if (fromdate !== todate) {
											data1.splice(n, 1);
											n--;
										}
									}
								}*/

								oMainModel.setProperty("/0/Piste", data1);
								sap.ui.getCore().byId("tbl").setVisible(true);
								//this.newSchedaMaster();

							},
							error: function (data1, textStatus1, XMLHttpRequest1) {
								this.newSchedaMaster();
							}
						});
					}
				});

				/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			},
			/********************cancel function navigates the user to the previous SchedaMaster page after 
						setting the default values********************************************/
			cancel: function () {
				this.byId("desc").setValue("");
				this.byId("gruppo").setSelectedKey(0);
				this.byId("note").setValue("");
				this.byId("congelata").setSelectedKey("N");
				this.byId("payout").setValue("");
				pista = [];
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "create");
				//var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/FISCAL_YEAR");
				console.log(selectedFYPeriodi);
				sap.ui.core.UIComponent.getRouterFor(this).navTo("SchedaMaster", {
					master: "SchedaMaster",
					str: selectedFYPeriodi
				});
			},
		})
	});