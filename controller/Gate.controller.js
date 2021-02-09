sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel", "sap/m/MessageBox", "sap/ui/core/BusyIndicator", "stipAdmin/stipAdmin/util/Formatter", "sap/ui/Device",
	"./exportExcel",
	"sap/ui/model/Sorter"
], function (n, JSONModel, MessageBox, BusyIndicator, Formatter, Device, exportExcel, Sorter) {
	"use strict";
	var flagPCO, year = "";
	flagPCO = sap.ui.getCore().getModel("EmpAuthoModel").getData()[0].ROLE_PCO;
	var oMainModel = new sap.ui.model.json.JSONModel();
	var oMainModel1 = new sap.ui.model.json.JSONModel();
	var oMainModel2 = new sap.ui.model.json.JSONModel();
	var selectedfiscalYearPeriodi;
	var gruppi2 = [],
		oFilters = [],
		mpm, max_id = 0,
		Main = [];
	var piste = [{
		"idGate": "",
		"desc": "",
		"pisteid": ""

	}];
	var gruppi = [{
		"idGate": "",
		"id": "",
		"desc": ""

	}];
	var persTmpData = [{

		"PERSKey": "N",
		"PERSText": "No"
	}];
	var persTmpData1 = [{
		"PERSKey": "S",
		"PERSText": "Si"
	}, {
		"PERSKey": "N",
		"PERSText": "No"
	}];
	return n.extend("stipAdmin.stipAdmin.controller.Gate", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {
			this._mViewSettingsDialogs = {};
			this.busyDialog = new sap.m.BusyDialog;

			this.getOwnerComponent().getRouter().getRoute("Gate").attachPatternMatched(this._onObjectMatched, this);
			this.getView().byId("filterbar")._oSearchButton.setText("Cerca"); // Changing filter bar button name
			var oResource = new sap.ui.model.resource.ResourceModel({
				bundleName: "stipAdmin.stipAdmin.i18n.i18n"
			}).getResourceBundle();
			//this.getView().byId("filterbar")._oSearchButton.setText("Cerca"); // Changing filter bar button name
			//this.getView().byId("filterbar")._oSearchButton.setText(oResource.getText("ok"));
			this.getView().byId("filterbar")._oHintText.setText(oResource.getText("noFilter"));
			this.mGroupFunctions = {

				ID_GATE: function (oContext) {
					var name = oContext.getProperty("ID_GATE");
					return {
						key: name,
						text: name
					};
				},
				DESCR_GATE: function (oContext) {
					var name = oContext.getProperty("DESCR_GATE");

					return {
						key: name,
						text: name
					};
				},
				DESCR_CURVA: function (oContext) {
					var name = oContext.getProperty("DESCR_CURVA");

					return {
						key: name,
						text: name
					};
				},
				SN_PERSONALIZZABILE: function (oContext) {
					var name = oContext.getProperty("SN_PERSONALIZZABILE");

					return {
						key: name,
						text: name
					};
				},
				SN_VISIBILEPCO: function (oContext) {
					var name = oContext.getProperty("SN_VISIBILEPCO");

					return {
						key: name,
						text: name
					};
				},
				ASSEGNATARIO: function (oContext) {
					var name = oContext.getProperty("ASSEGNATARIO");

					return {
						key: name,
						text: name
					};
				}
			};

			//Role and Authorization of STIP PCO moltiplocatore

			if (flagPCO === "X") {
				oMainModel1.setData(persTmpData);
				this.getView().byId("button1").setEnabled(false);

			} else {
				oMainModel1.setData(persTmpData1);
				this.getView().byId("button1").setEnabled(true);
			}
			this.getView().setModel(oMainModel1, "persModel");
		},
		/******************** _onObjectMatched fetches argument values ********************************************/
		_onObjectMatched: function (oEvent) {
			var oArguments = oEvent.getParameter("arguments");
			selectedfiscalYearPeriodi = oArguments.str;
			console.log(selectedfiscalYearPeriodi);
			max_id = 0;
			this.getFiscalYear(selectedfiscalYearPeriodi);
			//this.getMoltiplicatoreResultTableData(selectedfiscalYearPeriodi);
			if (sap.ui.getCore().getModel("BasicAppModel").getProperty("/back") === "back") {
				oMainModel.refresh();
				this.onSearch();
				this.filter();
			} else {
				this.clear();
				this.byId("tbl").setVisible(false);

			}

		},
		/******************** getFiscalYear function calls generic.xsjs ,payload is ID_PERIODO and output is fiscal year****************************/
		getFiscalYear: function (selectedfiscalYearPeriodi) {
			debugger;
			BusyIndicator.show();
			var sPayload = {
				"ID_PERIODO": selectedfiscalYearPeriodi
			};
			sPayload = JSON.stringify(sPayload);
			var that = this;
			var piste = [],
				curve = [],
				gruppi = [],
				asseg = [],
				Filter = [],
				newMod = [],
				idd = [],
				curve_tmp = [];
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
					//data1 = JSON.parse(data1);
					max_id = data1[0].ID_GATE;
					year = data1[1].DESCR_PERIODO;
					piste = data1[11].PISTE;
					for (var i = 0; i < data1[6].CURVE.length; i++) {
						if (data1[6].CURVE[i].SN_GATE === "S")
							curve.push({
								DESCR_CURVA: data1[6].CURVE[i].DESCR_CURVA,
								ID_CURVA: data1[6].CURVE[i].ID_CURVA,
								ID_TIPO_CURVA: data1[6].CURVE[i].ID_TIPO_CURVA
							});
					}

					idd = data1[12].GATE;
					var gruppitmp = data1[5].GRUPPO;
					for (var i = 0; i < gruppitmp.length; i++)
						gruppi.push({
							id: gruppitmp[i].ID_GRUPPOPISTA,
							desc: gruppitmp[i].DESCR_GRUPPOPISTA
						});

					Filter.push({
						ID: idd,
						CURVE: curve,
						GRUPPI: gruppi,
						PISTE: piste,
						Pers: [{
							pers: "Si"
						}, {
							pers: "No"
						}]
					});

					newMod.push({
						CURVE: curve,
						DESCR_PERIODO: year,
						FISCAL_YEAR: selectedfiscalYearPeriodi,
						max_id: max_id
					});

					var data0 = [];

					oMainModel2.setData({
						Filter: Filter
					});
					this.getView().setModel(oMainModel2, "filtermodel");

					that.getView().byId("fiscalYear").setText(year);
					if (sap.ui.getCore().getModel("BasicAppModel").getProperty("/back") === "back")
						oMainModel.getData().newModel[0].max_id = max_id;
					else {
						oMainModel.setData({
							Filter: Filter,
							Main: Main,
							newModel: newMod
						});
						this.getView().setModel(oMainModel, "MoltiplicatoreResultTableModel");
						sap.ui.getCore().setModel(oMainModel, "MoltiplicatoreBasicAppModel");
						console.log(this.getView().getModel("MoltiplicatoreResultTableModel").getData());
					}
					BusyIndicator.hide();

				}.bind(this),
				error: function (data1, textStatus1) {
					debugger;
					console.log("error");
					BusyIndicator.hide();
					/*max_id = data1.responseText.split("#")[0];
					year = data1.responseText.split("#")[1];
					//max_id = data1[0].ID_GATE;
					that.getView().byId("fiscalYear").setText(year);
					console.log("error");
					that.getMoltiplicatoreResultTableData(selectedfiscalYearPeriodi);*/
				}
			});
		},
		/******************* getMoltiplicatoreResultTableData function fetches the desired data from the backened as per the filters********************/

		getMoltiplicatoreResultTableData: function (oFilters) {
			BusyIndicator.show();
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			var
				data, data2 = [],
				MoltiplicatoreResultJson = [],
				RISULTATO = [],
				CURVE = [],
				PISTE_DATA = [],
				GRUPPI_DATA = [],
				id, that = this,
				tmp = {},
				NOME, COGNOME, MATRICOLA,
				Filter_Piste = [],
				Filter_Gruppi = [],
				Filter_Curva = [],
				Filter_Asseg = [],
				Pers = [];

			var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, selectedfiscalYearPeriodi);
			oFilters.push(filter1);

			xsoDataModel.read("/V_MOLTIPLICATORE?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;

					data = oDataIn.results;
					console.log(data);
					if (data.length !== 0) {
						BusyIndicator.show();
						//max_id = data[0].ID_GATE;

						for (var i = 0; i < oDataIn.results.length; i++) {

							if (oDataIn.results[i].ID_GATE > max_id)
								max_id = oDataIn.results[i].ID_GATE;

							if (oDataIn.results[i].ID_PERIODO === parseInt(selectedfiscalYearPeriodi, 10)) {
								year = data[i].DESCR_PERIODO;
								this.byId("fiscalYear").setText(year);
								if ((oDataIn.results[i].NOME === null && oDataIn.results[i].COGNOME === null && oDataIn.results[i].MATRICOLA === null) ||
									oDataIn.results[i].SN_PERSONALIZZABILE === 'S') {
									NOME = " ";
									COGNOME = " ";
									MATRICOLA = "";
								} else {
									NOME = oDataIn.results[i].NOME;
									COGNOME = oDataIn.results[i].COGNOME;
									MATRICOLA = oDataIn.results[i].MATRICOLA;
								}
								Pers.push(oDataIn.results[i].SN_PERSONALIZZABILE);
								var MoltiplicatoreResultJsonData = {
									"FISCAL_YEAR": selectedfiscalYearPeriodi,
									"DESCR_PERIODO": year,
									"ID_GATE": oDataIn.results[i].ID_GATE,
									"DESCR_GATE": oDataIn.results[i].DESCR_GATE,
									"ID_CURVA": oDataIn.results[i].ID_CURVA,
									"DESCR_CURVA": oDataIn.results[i].DESCR_CURVA,
									"ID_GATE_MADRE": oDataIn.results[i].ID_GATE_MADRE,
									"ASSEGNATARIO": NOME + " " + COGNOME + " " + MATRICOLA,
									"RISULTATO_GRADINO": oDataIn.results[i].RISULTATO_GRADINO,
									"RISULTATO_GRADINO_SIM": oDataIn.results[i].RISULTATO_GRADINO_SIM,
									"SN_PERSONALIZZABILE": oDataIn.results[i].SN_PERSONALIZZABILE,
									"SN_VISIBILEPCO": oDataIn.results[i].SN_VISIBILEPCO,
									"PERC_MBO": oDataIn.results[i].PERC_MBO,
									"S_GRADINO": oDataIn.results[i].S_GRADINO,
									//"RISULTATO1": {},
									"RISULTATO": {},
									"PISTE_DATA": [],
									"GRUPPI_DATA": []
								};

								MoltiplicatoreResultJson.push(MoltiplicatoreResultJsonData);
							}
						}
						//max_id = oDataIn.results[i - 1].ID_GATE + 1;
						console.log(MoltiplicatoreResultJson);
						/************************** download tab curva code fetching starts using filter method in javascript******************************/
						/****	removing-elements-from-an-array-of-objects-based-on-duplicate-values-of-multiple *****/
						var arr = MoltiplicatoreResultJson;
						var downloadFiltArr = [];

						for (var i = 0; i < arr.length; i++) {
							if (arr[i].SN_PERSONALIZZABILE === "N") {
								downloadFiltArr.push(arr[i]);
							}
						}
						console.log(downloadFiltArr);
						var m = {};
						var filtered = downloadFiltArr.filter(function (a) {
							var key = a.ID_CURVA + '|' + a.PERC_MBO;
							if (!m[key]) {
								m[key] = true;
								return true;
							}
						});

						console.log(filtered);
						/************************** download tab curva code fetching ends******************************/
						var data11 = MoltiplicatoreResultJson;
						MoltiplicatoreResultJson = [];
						var m = {};
						for (i = 0; i < data11.length; i++) {
							var v = data11[i],
								vv = data11[i].ID_GATE;
							if (!m[vv]) {
								MoltiplicatoreResultJson.push(v);
								m[vv] = true;
							}
						}

						for (var j = 0; j < MoltiplicatoreResultJson.length; j++) {
							if (MoltiplicatoreResultJson[j].RISULTATO_GRADINO === null || MoltiplicatoreResultJson[j].RISULTATO_GRADINO === "NULL")
								MoltiplicatoreResultJson[j].RISULTATO_GRADINO = "";
							if (MoltiplicatoreResultJson[j].RISULTATO_GRADINO_SIM === null || MoltiplicatoreResultJson[j].RISULTATO_GRADINO_SIM ===
								"NULL")
								MoltiplicatoreResultJson[j].RISULTATO_GRADINO_SIM = "";
							//debugger;
							RISULTATO = [{
								id: MoltiplicatoreResultJson[j].ID_GATE,
								Risultato: MoltiplicatoreResultJson[j].RISULTATO_GRADINO,
								Risultato_sim: MoltiplicatoreResultJson[j].RISULTATO_GRADINO_SIM
							}];
							for (i = 0; i < oDataIn.results.length; i++) {
								if (MoltiplicatoreResultJson[j].ID_GATE === oDataIn.results[i].ID_GATE) {
									if (oDataIn.results[i].S_GRADINO === null)
										oDataIn.results[i].S_GRADINO = 0;
									RISULTATO.push({
										id: oDataIn.results[i].ID_GATE,
										Risultato: oDataIn.results[i].S_GRADINO,
										Risultato_sim: oDataIn.results[i].S_GRADINO
									});

								}
							}

							MoltiplicatoreResultJson[j].RISULTATO = RISULTATO;
							RISULTATO = [];
						}
						debugger;

						for (i = 0; i < MoltiplicatoreResultJson.length; i++) {
							id = MoltiplicatoreResultJson[i].ID_GATE;
							MoltiplicatoreResultJson[i].row = i;
							for (var j = 0; j < oDataIn.results.length; j++) {
								if (oDataIn.results[j].ID_GATE === parseInt(id, 10)) {
									if (oDataIn.results[j].ID_PISTAVIEW !== null && oDataIn.results[j].ID_PISTAVIEW !== 0) {
										tmp = {
											"idGate": oDataIn.results[j].ID_GATE,
											"desc": oDataIn.results[j].DESCR_PISTA,
											"pisteid": oDataIn.results[j].ID_PISTAVIEW,
											"gruppi_id": oDataIn.results[j].ID_GRUPPOPISTA,
											"gruppi_desc": oDataIn.results[j].DESCR_GRUPPOPISTA
										};

										PISTE_DATA.push(tmp);
									}
									if (oDataIn.results[j].ID_PISTAVIEW !== "" && oDataIn.results[j].ID_PISTAVIEW !== null && oDataIn.results[j].ID_PISTAVIEW !==
										undefined && oDataIn.results[j].ID_PISTAVIEW !== 0) {
										var pistetmp = {
											"pisteid": oDataIn.results[j].ID_PISTAVIEW,
											"desc": oDataIn.results[j].DESCR_PISTA
										};
										Filter_Piste.push(pistetmp);
									}
									if (oDataIn.results[j].ID_GRUPPOPISTA !== "" && oDataIn.results[j].ID_GRUPPOPISTA !== null && oDataIn.results[j].ID_GRUPPOPISTA !==
										undefined && oDataIn.results[j].ID_GRUPPOPISTA !== 0) {
										var gruppitmp = {
											id: oDataIn.results[j].ID_GRUPPOPISTA,
											"desc": oDataIn.results[j].DESCR_GRUPPOPISTA
										};
										Filter_Gruppi.push(gruppitmp);
									}
									if (oDataIn.results[j].ID_CURVA !== "" && oDataIn.results[j].ID_CURVA !== null && oDataIn.results[j].ID_CURVA !==
										undefined && oDataIn.results[j].ID_CURVA !== 0) {
										var curvetmp = {
											ID_CURVA: oDataIn.results[j].ID_CURVA,
											DESCR_CURVA: oDataIn.results[j].DESCR_CURVA
										};
										Filter_Curva.push(curvetmp);
									}

								}
							}

							MoltiplicatoreResultJson[i].PISTE_DATA = PISTE_DATA;
							//GRUPPI_DATA = [];
							PISTE_DATA = [];
						}

						for (var j = 0; j < MoltiplicatoreResultJson.length; j++) {

							var data11 = MoltiplicatoreResultJson[j].PISTE_DATA;
							PISTE_DATA = [];
							GRUPPI_DATA = [];
							var m = {},
								mm = {};
							for (i = 0; i < data11.length; i++) {
								var xx = data11[i].gruppi_id,
									vv = data11[i].pisteid;
								if (!m[vv]) {
									PISTE_DATA.push({
										pisteid: data11[i].pisteid,
										desc: data11[i].desc
									});
									m[vv] = true;
								}
								if (!mm[xx]) {
									GRUPPI_DATA.push({
										gruppi_id: data11[i].gruppi_id,
										gruppi_desc: data11[i].gruppi_desc
									});
									mm[xx] = true;
								}
							}
							MoltiplicatoreResultJson[j].PISTE_DATA = PISTE_DATA;
							MoltiplicatoreResultJson[j].GRUPPI_DATA = GRUPPI_DATA;

							//}

							var data11 = MoltiplicatoreResultJson[j].RISULTATO;
							RISULTATO = [{
								id: MoltiplicatoreResultJson[j].ID_GATE,
								Risultato: "",
								Risultato_sim: ""
							}];
							var m = {};
							for (i = 0; i < data11.length; i++) {
								//		
								var v = data11[i],
									vv = data11[i].Risultato_sim;
								if (!m[vv]) {
									RISULTATO.push(v);
									m[vv] = true;
								}
							}
							MoltiplicatoreResultJson[j].RISULTATO = RISULTATO;
							if (MoltiplicatoreResultJson[j].ASSEGNATARIO !== "" && MoltiplicatoreResultJson[j].ASSEGNATARIO !== null &&
								MoltiplicatoreResultJson[j].ASSEGNATARIO !==
								undefined) {
								var assegtmp = {
									ASSEGNATARIO: MoltiplicatoreResultJson[j].ASSEGNATARIO
								};
								Filter_Asseg.push(assegtmp);
							}
						}

						/*for(i = 0; i < MoltiplicatoreResultJson.length; i++){
							for(var j = 0; j < MoltiplicatoreResultJson[i].PISTE_DATA.length; i++)
							var piste = MoltiplicatoreResultJson[i].PISTE_DATA[j].desc;
							var gruppi = MoltiplicatoreResultJson[i].PISTE_DATA[j].gruppi_desc;
							
							
						}*/
						var data11 = Filter_Piste;
						Filter_Piste = [{
							pisteid: 0,
							desc: ""
						}];
						var m = {};
						for (i = 0; i < data11.length; i++) {
							var v = data11[i],
								vv = data11[i].desc;
							if (!m[vv]) {
								Filter_Piste.push(v);
								m[vv] = true;
							}
						}
						var data11 = Filter_Gruppi;
						Filter_Gruppi = [{
							id: 0,
							desc: ""
						}];
						var m = {};
						for (i = 0; i < data11.length; i++) {
							var v = data11[i],
								vv = data11[i].desc;
							if (!m[vv]) {
								Filter_Gruppi.push(v);
								m[vv] = true;
							}
						}
						var data11 = Filter_Curva;
						Filter_Curva = [{
							ID_CURVA: 0,
							DESCR_CURVA: ""
						}];
						var m = {};
						for (i = 0; i < data11.length; i++) {
							var v = data11[i],
								vv = data11[i].DESCR_CURVA;
							if (!m[vv]) {
								Filter_Curva.push(v);
								m[vv] = true;
							}

						}
						debugger;
						var data11 = Filter_Asseg;
						Filter_Asseg = [{
							ASSEGNATARIO: ""
						}], m = {};

						for (i = 0; i < data11.length; i++) {
							var v = data11[i],
								vv = data11[i].ASSEGNATARIO;
							if (!m[vv] && vv !== null && vv !== "") {
								Filter_Asseg.push(v);
								m[vv] = true;
							}

						}
						debugger;
						data11 = Pers;
						Pers = [];
						m = {};

						for (i = 0; i < data11.length; i++) {
							var vv = data11[i];
							if (!m[vv] && vv !== null && vv !== "") {
								if (vv === "S")
									Pers.push({
										pers: "Si"
									});
								else
									Pers.push({
										pers: "No"
									});
								m[vv] = true;
							}

						}

						var FilterModelJson = [{
							PISTE: Filter_Piste,
							GRUPPI: Filter_Gruppi,
							CURVE: Filter_Curva,
							CURVE_DOWNLOADDATA: filtered,
							ASSEGNATARIO: Filter_Asseg,
							Pers: Pers
						}]
						console.log(Filter_Piste);

						for (var j = 0; j < MoltiplicatoreResultJson.length; j++) {
							var arr3 = [];
							if (MoltiplicatoreResultJson[j].ID_GATE_MADRE !== 0 || MoltiplicatoreResultJson[j].ID_GATE_MADRE !== null) //if its child
							{
								var madre = MoltiplicatoreResultJson[j].ID_GATE_MADRE; //this is mother
								for (var jj = 0; jj < MoltiplicatoreResultJson.length; jj++) {
									if (MoltiplicatoreResultJson[jj].ID_GATE === madre) {
										var piste = MoltiplicatoreResultJson[jj].PISTE_DATA; //piste of mother
										var childpiste = MoltiplicatoreResultJson[j].PISTE_DATA; //piste of child

										//childpiste.concat(piste);
										for (var ii = 0; ii < piste.length; ii++)
											childpiste.push(piste[ii]);
										//console.log(childpiste);
										//console.log(piste);

										MoltiplicatoreResultJson[j].PISTE_DATA = childpiste;
										MoltiplicatoreResultJson[jj].PISTE_DATA = childpiste;

										break;
									}
								}

							}
						}
					}

					/*else 
					this.getFiscalYear(selectedfiscalYearPeriodi);*/
					var newModel = [{
						max_id: max_id,
						CURVE: Filter_Curva,
						FISCAL_YEAR: selectedfiscalYearPeriodi,
						DESCR_PERIODO: year
					}];
					Main = MoltiplicatoreResultJson;
					oMainModel.setData({
						Main: MoltiplicatoreResultJson,
						Filter: FilterModelJson,
						newModel: newModel
					});
					console.log(oMainModel.getData());

					oFilters = [];

					var oMainModel2 = oMainModel;
					//this.getView().setModel(oMainModel2, "filtermodel");
					sap.ui.getCore().setModel(oMainModel, "BasicAppModel");
					var count = MoltiplicatoreResultJson.length;
					var txt = this.getView().getModel("i18n").getResourceBundle().getText("Moltiplicatore") + " (" + count + ")";
					this.byId("title").setText(txt);

					BusyIndicator.hide();

				}.bind(this),
				error: function (oError) {
					//Handle the error
					BusyIndicator.hide();
					oFilters = [];
					MessageBox.error("Data fetch failed while getting P_GATE. Please contact administrator.");
					jQuery.sap.log.getLogger().error("P_GATE fetch failed" + oError.toString());
				}.bind(this)
			});

		},
		/********************displayCurveFn function navigates the user to the displayCurvaDiscreta page 
		(for particular curveId,curveDesc,gateId and FISCAL_YEAR) ********************************************/
		displayCurveFn: function (oEvent) {
			debugger;
			var curveIdContext = oEvent.oSource.getBindingContext("MoltiplicatoreResultTableModel").sPath;
			var idCurve = oMainModel.getProperty(curveIdContext).ID_CURVA;
			var descrCurve = oMainModel.getProperty(curveIdContext).DESCR_CURVA;
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", idCurve);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveDesc", descrCurve);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/gate", "S");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/FISCAL_YEAR", selectedfiscalYearPeriodi);
			var e = sap.ui.core.UIComponent.getRouterFor(this);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "GateMain");
			e.navTo("displayCurvaDiscreta");
		},
		/******************** onHome function naviagtes the user to the Home Page of the StipAdmin module********************************************/
		onHome: function () {
			this.getView().byId("idSearchBox").setValue("");
			var n = sap.ui.core.UIComponent.getRouterFor(this);
			n.navTo("Home");
		},
		/******************** handleVisualizza method navigates the user to the modGate page (for particular gateId and FISCAL_YEAR ********************************************/
		handleVisualizza: function (oEvent) {
			debugger;
			var moltiplicatoreIdContext = oEvent.oSource.getBindingContext("MoltiplicatoreResultTableModel").sPath;
			var idMoltiplicatore = this.getView().getModel("MoltiplicatoreResultTableModel").getProperty(moltiplicatoreIdContext + "/ID_GATE");
			//var data = oMainModel.getData()
			var data = this.getView().getModel("MoltiplicatoreResultTableModel").getProperty(moltiplicatoreIdContext);
			console.log(data);
			var oModModel = new JSONModel();
			oModModel.setData(data);
			sap.ui.getCore().setModel(oModModel, "modModel")
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/gateId", idMoltiplicatore);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/FISCAL_YEAR", selectedfiscalYearPeriodi);

			var n = sap.ui.core.UIComponent.getRouterFor(this);
			n.navTo("modGate", {
				gate: "modGate",
				id: idMoltiplicatore
			});
		},
		/******************** handleAggiungi method navigates the user to the createGate page ********************************************/
		handleAggiungi: function () {
			//sap.ui.getCore().getModel("BasicAppModel").setProperty("/0/FISCAL_YEAR", selectedfiscalYearPeriodi);
			var data = oMainModel.getData().newModel;
			var oNewModel = new JSONModel();
			oNewModel.setData(data);
			sap.ui.getCore().setModel(oNewModel, "newModel");
			var n = sap.ui.core.UIComponent.getRouterFor(this);
			n.navTo("createGate", {
				gate: "createGate",
				id: max_id,
				fy: selectedfiscalYearPeriodi
			});
		},
		/******************** handleUpload method navigates to upload excel page ********************************************/
		handleUpload: function () {
			debugger
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/0/FISCAL_YEAR", selectedfiscalYearPeriodi);
			var n = sap.ui.core.UIComponent.getRouterFor(this);
			n.navTo("uploadGate", {
				uploadGate: "uploadGate",
				ID_PERIODO: selectedfiscalYearPeriodi,
				SEL_FY_PERIODI: year

			});
		},
		/******************** onDisplayMoltiPlicatore method navigates the user to the displayGate page ********************************************/
		onDisplayMoltiPlicatore: function (oEvent) {
			//debugger;
			/*var moltiplicatoreIdContext = oEvent.oSource.getBindingContext("MoltiplicatoreResultTableModel").sPath;
			var idMoltiplicatore = this.getView().getModel("MoltiplicatoreResultTableModel").getProperty(moltiplicatoreIdContext + "/ID_GATE");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/gateId", idMoltiplicatore);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/0/FISCAL_YEAR", selectedfiscalYearPeriodi);
			*/
			var moltiplicatoreIdContext = oEvent.oSource.getBindingContext("MoltiplicatoreResultTableModel").sPath;
			var idMoltiplicatore = this.getView().getModel("MoltiplicatoreResultTableModel").getProperty(moltiplicatoreIdContext + "/ID_GATE");
			//var data = oMainModel.getData()
			var data = this.getView().getModel("MoltiplicatoreResultTableModel").getProperty(moltiplicatoreIdContext);
			console.log(data);
			var oModModel = new JSONModel();
			oModModel.setData(data);
			sap.ui.getCore().setModel(oModModel, "modModel")
			var e = sap.ui.core.UIComponent.getRouterFor(this);
			e.navTo("displayGate", {
				gate: "displayGate",
				id: idMoltiplicatore
			});
		},
		/******************** clear function sets the fields (desc, idGate, curvaSearch, pistaSearch, GruppoPistaSearch, pers, Assegnatario parameters) 
		of the filter bar as blank********************************************/
		clear: function () {
			this.byId("desc").setValue("");
			this.byId("idGate").setValue("");
			this.byId("curvaSearch").setSelectedKey("");
			//this.byId("pistaSearch").setSelectedKey("");
			this.byId("pistaSearch").setValue("");
			this.byId("GruppoPistaSearch").setSelectedKey("");
			this.byId("Pers").setSelectedKey("");
			this.byId("Assegnatario").setValue("");
			this.byId("vsdFilterBar").setVisible(false);

			if (sap.ui.getCore().byId("FilterDialogGate") !== undefined) {
				var aFilterItems = sap.ui.getCore().byId("FilterDialogGate").getFilterItems();
				aFilterItems.forEach(function (item) {
					var aItems = item.getItems();
					aItems.forEach(function (item) {
						item.setSelected(false);
					});
				});
			}
		},
		/******************** onSearch function  will invoke 'filterGateData' function based on 
		desc, idGate, curvaSearch, pistaSearch, GruppoPistaSearch, pers, Assegnatario parameters********************************************/
		onSearch: function () {
			debugger;
			this.byId("tbl").setVisible(true);
			var desc = this.byId("desc").getValue();
			var idGate = this.byId("idGate").getValue();
			var curvaSearch = this.byId("curvaSearch").getSelectedKey();
			//var pistaSearch = this.byId("pistaSearch").getSelectedKey();
			var pistaSearch = this.byId("pistaSearch").getValue();

			var GruppoPistaSearch = this.byId("GruppoPistaSearch").getSelectedKey();
			var pers = this.byId("Pers").getSelectedKey();
			//var pco = this.byId("PCO").getSelectedKey();
			var Assegnatario = this.byId("Assegnatario").getValue();

			this.filterGateData(desc, idGate, curvaSearch, pistaSearch, GruppoPistaSearch, pers, Assegnatario);
			var oTable = this.getView().byId("tbl");
			var aBinding = oTable.getBinding("items");
			aBinding.filter([]);

		},
		/******************** filterGateData function  will fetch the filter values from the user********************************************/
		filterGateData: function (desc, idGate, curvaSearch, pistaSearch, GruppoPistaSearch, pers, Assegnatario) {
			debugger

			oFilters = [];
			if (desc != undefined && desc != "") {
				var filter1 = new sap.ui.model.Filter({
					path: 'DESCR_GATE',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: desc,
					caseSensitive: false
				});
				//var filter1 = new sap.ui.model.Filter("DESCR_GATE", sap.ui.model.FilterOperator.Contains, desc);
				oFilters.push(filter1);
			}
			if (idGate != undefined && idGate != "") {
				var filter2 = new sap.ui.model.Filter("ID_GATE", sap.ui.model.FilterOperator.EQ, idGate);
				oFilters.push(filter2);
			}
			if (curvaSearch != undefined && curvaSearch != "" && curvaSearch !== 0 && curvaSearch !== "0") {
				var filter3 = new sap.ui.model.Filter("ID_CURVA", sap.ui.model.FilterOperator.EQ, parseInt(curvaSearch, 10));
				oFilters.push(filter3);
			}
			if (pistaSearch !== undefined && pistaSearch !== "" && pistaSearch !== 0 && pistaSearch !== "0") {
				var oFilter1 = [];
				pistaSearch = parseInt(pistaSearch, 10);

				oFilter1.push(new sap.ui.model.Filter("ID_PISTAVIEW", sap.ui.model.FilterOperator.EQ, pistaSearch));
				oFilter1.push(new sap.ui.model.Filter("ID_PISTA_MADRE", sap.ui.model.FilterOperator.EQ, pistaSearch));
				oFilters.push(new sap.ui.model.Filter(oFilter1, false));

			}
			if (GruppoPistaSearch != undefined && GruppoPistaSearch != "" && GruppoPistaSearch !== 0 && GruppoPistaSearch !== "0") {
				var ofilter2 = [];
				GruppoPistaSearch = parseInt(GruppoPistaSearch, 10);
				var filter6 = new sap.ui.model.Filter("ID_GRUPPOPISTA", sap.ui.model.FilterOperator.EQ, GruppoPistaSearch);
				oFilters.push(filter6);
			}

			if (flagPCO === "X") //PCO pers authorization
			{
				if (pers != undefined) {
					var filter6 = new sap.ui.model.Filter("SN_PERSONALIZZABILE", sap.ui.model.FilterOperator.EQ, "N");
					oFilters.push(filter6);
				}
			} else {
				if (pers != undefined && pers != "") {
					var filter6 = new sap.ui.model.Filter("SN_PERSONALIZZABILE", sap.ui.model.FilterOperator.EQ, pers);
					oFilters.push(filter6);
				}
			}
			/*if (pco != undefined && pco != "") {
				var filter7 = new sap.ui.model.Filter("SN_VISIBILEPCO", sap.ui.model.FilterOperator.EQ, pco);
				oFilters.push(filter7);
			}*/
			if (Assegnatario != undefined && Assegnatario != "") {
				//var filter8 = new sap.ui.model.Filter("NOME", sap.ui.model.FilterOperator.Contains, Assegnatario);
				//var filter9 = new sap.ui.model.Filter("COGNOME", sap.ui.model.FilterOperator.Contains, Assegnatario);

				
				var filter10 = new sap.ui.model.Filter({
					path: 'MATRICOLA',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: Assegnatario,
					caseSensitive: false
				});
				var filter8 = new sap.ui.model.Filter({
					path: 'NOME',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: Assegnatario,
					caseSensitive: false
				});
				var filter9 = new sap.ui.model.Filter({
					path: 'COGNOME',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: Assegnatario,
					caseSensitive: false
				});

				var ofilter5 = new sap.ui.model.Filter({
					filters: [
						filter8,
						filter9,
						filter10
					],
					and: false

				});
				oFilters.push(new sap.ui.model.Filter(ofilter5, false));
				//oFilters.push(filter11);

			}

			this.getMoltiplicatoreResultTableData(oFilters);
		},

		/***************************** start of Toolbar  methods****************************************************************/
		/***************************** start of Toolbar search operation method*************************************************/
		/******************* onTableSearch function is used to search the records in the table tbl based on the search value filter
		which is present on the Toolbar just above the table based on the parameters(ID_GATE,DESCR_GATE,DESCR_CURVA,SN_PERSONALIZZABILE,SN_VISIBILEPCO,ASSEGNATARIO)********************/
		onTableSearch: function (oEvent) {
			debugger;
			var sQuery = oEvent.getParameter("query");
			sQuery = sQuery.trim();
			var aFilters = [];
			if (sQuery && sQuery.length > 0) {
				aFilters.push(new sap.ui.model.Filter("ID_GATE", sap.ui.model.FilterOperator.EQ, parseInt(sQuery, 10)));
				aFilters.push(new sap.ui.model.Filter("DESCR_GATE", sap.ui.model.FilterOperator.Contains, sQuery));
				aFilters.push(new sap.ui.model.Filter("DESCR_CURVA", sap.ui.model.FilterOperator.Contains, sQuery));
				aFilters.push(new sap.ui.model.Filter("SN_PERSONALIZZABILE", sap.ui.model.FilterOperator.Contains, sQuery));
				aFilters.push(new sap.ui.model.Filter("SN_VISIBILEPCO", sap.ui.model.FilterOperator.EQ, sQuery));
				aFilters.push(new sap.ui.model.Filter("ASSEGNATARIO", sap.ui.model.FilterOperator.Contains, sQuery));
			}
			var oTable = this.getView().byId("tbl");
			var aBinding = oTable.getBinding("items");
			console.log(aBinding);
			if (!sQuery) {
				aBinding.filter([]);
			} else {
				aBinding.filter(new sap.ui.model.Filter({
					filters: aFilters,
					OR: true // OR operator true will check any of the filter conditions get satisfied
				}));
			}
		},
		/***************************** end of Toolbar seatch operation method*************************************************/
		/************************createViewSettingsDialog function is used to create a popup dialog box for Sort, Filter and Group functions ********************************/
		createViewSettingsDialog: function (sDialogFragmentName) {
			//debugger;
			var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
				this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;
				console.log(this.getView().getModel("MoltiplicatoreResultTableModel"));
				oDialog.setModel(this.getView().getModel("MoltiplicatoreResultTableModel"));
				this.getView().addDependent(oDialog);
				if (Device.system.desktop) {
					oDialog.addStyleClass("sapUiSizeCompact");
				}
			}
			return oDialog;
		},
		/************************handleSortButtonPressed function accesses the sort_Moltiplocatore fragment 
		based on the parameters(ID_GATE,DESCR_GATE,DESCR_CURVA,SN_PERSONALIZZABILE,ASSEGNATARIO)********************************/
		handleSortButtonPressed: function () {
			debugger;
			this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.sort_Moltiplocatore").open();
		},
		/************************sort function allows the user to sort the data of the tbl as per the user 
		selected values of Id Moltiplicatore,Descrizione,Curva,Personalizzabile,Identificativo Assegnatario either in ascending or descending order********************************/
		sort: function (oEvent) {
			//	//debugger;
			var oTable = this.getView().byId("tbl"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		},
		/************************handleFilterButtonPressed function accesses the filter_Moltiplocatore fragment 
		 based on ID_GATE,DESCR_GATE,DESCR_CURVA,SN_PERSONALIZZABILE,ASSEGNATARIO********************************/
		handleFilterButtonPressed: function (oEvent) {
			var desc = [];
			for (var i = 0; i < oMainModel.getData().Main.length; i++)
				desc.push(oMainModel.getData().Main[i].DESCR_GATE);
			var m = {},
				data11 = desc;
			desc = [];
			for (var i = 0; i < data11.length; i++) {
				var vv = data11[i];
				if (!m[vv]) {
					m[vv] = true;
					desc.push(vv);
				}
			}

			oMainModel.setProperty("/desc", desc);
			oMainModel.refresh();
			this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.filter_Moltiplocatore").open();
		},
		/************************filter function allows the user to filter the data of the tbl 
		as per the user selected values of Id Moltiplicatore,Descrizione,Curva,Personalizzabile,Identificativo Assegnatario********************************/
		filter: function (oEvent) {
			//debugger;
			var that = this;
			this.byId("tbl").setVisible(true);
			var oTable = this.getView().byId("tbl");
			if (oEvent) {
				var mParams = oEvent.getParameters();
				mpm = oEvent.getParameters();
			} else
				mParams = mpm;
			var tmp = [],
				data = [];
			var oBinding = oTable.getBinding("items"),
				aFilters = [],
				oFilter;
			if (mParams !== undefined)
				mParams.filterItems.forEach(function (oItem) {
					var sPath = oItem.getKey();
					var text = oItem.getText();
					console.log(sPath + text);
					if (sPath === "SN_PERSONALIZZABILE") {
						if (text === "Si")
							text = "S";
						else if (text === "No")
							text = "N";
					}

					if (text !== "") {

						oFilter = new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.EQ, text);
						aFilters.push(oFilter);
						var oModel = that.getView().getModel("MoltiplicatoreResultTableModel").getData().Main;
						for (var i = 0; i < oModel.length; i++) {
							if (oModel[i].ID_GATE === parseInt(text, 10) || oModel[i].DESCR_GATE === text || oModel[i].DESCR_CURVA === text ||
								oModel[i].ASSEGNATARIO === text || oModel[i].SN_PERSONALIZZABILE === text) {

								tmp = oModel[i];
								//break;
								data.push(tmp);
							}
						}

					}
				});
			// apply filter settings
			oBinding.filter(aFilters);
			var tmpGate = [],
				arrGate = [],
				duplicateArray = [];

			for (var i = 0; i < data.length; i++) {
				//**********************start of removing duplicate ID_Gruppi**************************
				if (data[i].ID_GATE !== null && data[i].ID_GATE !== "") {
					var ID_GATE = data[i].ID_GATE;
					if (!duplicateArray[ID_GATE]) {
						tmpGate = data[i];
						duplicateArray[ID_GATE] = true;
						//console.log(tmpGate);
						arrGate.push(tmpGate);
					}
				}
				//**********************end of removing duplicate ID_Gruppi**************************
			}
			console.log(arrGate);
			/*data = oMainModel.getData();
			data["Main"] = arrGate;
			var oMainModelFilter = new JSONModel();
			oMainModelFilter.setData(data);
			this.getView().setModel(oMainModelFilter, "MoltiplicatoreResultTableModel");
			oMainModelFilter.refresh();
			*/

			var data1 = oMainModel.getData().newModel;
			var aItems = arrGate;

			/************************** download tab curva code fetching starts using filter method in javascript******************************/
			/****	removing-elements-from-an-array-of-objects-based-on-duplicate-values-of-multiple *****/
			var arr = aItems;
			var downloadFiltArr = [];
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].SN_PERSONALIZZABILE === "N") {
					downloadFiltArr.push(arr[i]);
				}
			}
			console.log(downloadFiltArr);

			var m = {};
			var filtered = downloadFiltArr.filter(function (a) {
				var key = a.ID_CURVA + '|' + a.PERC_MBO;
				if (!m[key]) {
					m[key] = true;
					return true;
				}
			});

			console.log(filtered);
			/************************** download tab curva code fetching ends******************************/

			var m = {},
				tmp = aItems;
			aItems = [];
			for (var i = 0; i < tmp.length; i++) {
				var v = tmp[i],
					vv = tmp[i].ID_GATE;
				if (!m[vv]) {
					aItems.push(v);
					m[vv] = true;
				}
			}

			var data0 = oMainModel.getData().Filter[0].PISTE,
				data00 = [];
			var data1 = oMainModel.getData().newModel;
			//data0["Main"] = aItems;
			var curve = [],
				gruppi = [],
				asseg = [],
				Pers = [];
			for (var i = 0; i < aItems.length; i++) {
				Pers.push(aItems[i].SN_PERSONALIZZABILE);
				asseg.push({
					ASSEGNATARIO: aItems[i].ASSEGNATARIO
				});
				curve.push({
					ID_CURVA: aItems[i].ID_CURVA,
					DESCR_CURVA: aItems[i].DESCR_CURVA
				});
				for (var j = 0; j < aItems[i].GRUPPI_DATA.length; j++) {

					gruppi.push({
						id: aItems[i].GRUPPI_DATA[j].gruppi_id,
						desc: aItems[i].GRUPPI_DATA[j].gruppi_desc
					});
				}
			}

			var m = {},
				tmp = asseg;
			asseg = [];
			for (var i = 0; i < tmp.length; i++) {
				var vv = tmp[i].ASSEGNATARIO;
				if (!m[vv]) {
					asseg.push(tmp[i]);
					m[vv] = true;
				}
			}
			var m = {},
				tmp = curve;
			curve = [];
			for (var i = 0; i < tmp.length; i++) {
				var v = tmp[i],
					vv = tmp[i].ID_CURVA;
				if (!m[vv]) {
					curve.push(v);
					m[vv] = true;
				}
			}
			var m = {},
				tmp = gruppi;
			gruppi = [];
			for (var i = 0; i < tmp.length; i++) {
				var v = tmp[i],
					vv = tmp[i].id;
				if (!m[vv]) {
					gruppi.push(v);
					m[vv] = true;
				}
			}
			var m = {},
				tmp = Pers;
			Pers = [];
			for (var i = 0; i < tmp.length; i++) {
				var vv = tmp[i];
				if (!m[vv]) {
					if (vv === "S")
						Pers.push({
							pers: "Si"
						});
					else
						Pers.push({
							pers: "No"
						});
					m[vv] = true;
				}
			}

			data00.push({
				ASSEGNATARIO: asseg,
				CURVE: curve,
				CURVE_DOWNLOADDATA: filtered,
				GRUPPI: gruppi,
				PISTE: data0,
				Pers: Pers
			});
			/*	var oMainModelFilter = new JSONModel();
				oMainModelFilter.setData({
					Main: aItems,
					Filter: data00,
					newModel: data1
				});*/

			oMainModel.setData({
				Main: aItems,
				Filter: data00,
				newModel: data1,

			});

			//data0["Main"] = aItems;

			this.getView().setModel(oMainModel, "MoltiplicatoreResultTableModel");
			oMainModel.refresh();
			console.log(this.getView().getModel("MoltiplicatoreResultTableModel").getData());
			console.log(sap.ui.getCore().getModel("MoltiplicatoreBasicAppModel").getData());
			//	debugger;

			//resetting filter
			/*var aFilterItems = sap.ui.getCore().byId("FilterDialogGate").getFilterItems();
			aFilterItems.forEach(function (item) {
				var aItems = item.getItems();
				aItems.forEach(function (item) {
					item.setSelected(false);
				});
			});*/

			// update filter bar
			this.byId("vsdFilterBar").setVisible(aFilters.length > 0);
			if (mParams !== undefined)
				this.byId("vsdFilterLabel").setText(mParams.filterString);
			var count = aItems.length;
			var txt = this.getView().getModel("i18n").getResourceBundle().getText("Moltiplicatore") + " (" + count + ")";
			this.byId("title").setText(txt);
		},
		/************************handleGroupButtonPressed function accesses the group_Moltiplocatore fragment 
		based on the parameters(ID_GATE,DESCR_GATE,DESCR_CURVA,SN_PERSONALIZZABILE,ASSEGNATARIO)********************************/
		handleGroupButtonPressed: function (oEvent) {
			this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.group_Moltiplocatore").open();
		},
		/************************group function allows the user to group the data of the tbl based on the user selected
				values of Id Moltiplicatore,Descrizione,Curva,Personalizzabile,Identificativo Assegnatario or None based on ascending or descending order********************************/
		group: function (oEvent) {
			debugger;
			var oTable = this.byId("tbl"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				vGroup,
				aGroups = [];

			if (mParams.groupItem) {
				sPath = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;

				vGroup = this.mGroupFunctions[sPath];
				aGroups.push(new Sorter(sPath, bDescending, vGroup));
				// apply the selected group settings
				oBinding.sort(aGroups);
			} else
				oBinding.sort(); // else condition is to group none
		},
		/******************* handleEmpValueHelp function fetches the data into the dialog box from the 'moltiplocatoreIdFragment' for idGate ********************/
		handleEmpValueHelp: function (oEvent) {
			var that = this;
			//	debugger
			var idPath = oEvent.getSource().sId;

			if (!that._valueHelpDialog) {
				that._valueHelpDialog = sap.ui.xmlfragment(
					"stipAdmin.stipAdmin.fragment.moltiplocatoreIdFragment", that);
				that._valueHelpDialog.setModel(that.getView().byId("idGate").getModel("MoltiplicatoreResultTableModel"));
				sap.ui.getCore().byId(idPath).addDependent(that._valueHelpDialog);
				//this.getView().addDependent(this._valueHelpDialog);
			}
			that._valueHelpDialog.open();
		},
		/*******************_handleValueHelpSearch function is used to search the ID_GATE value from the ValueHelpSearch dialog box ********************/
		_handleValueHelpSearch: function (oEvent) {
			var aFilters = [];
			var oList = sap.ui.getCore().byId("idGateSelect");
			var oBinding = oList.getBinding("items");
			if (!oEvent.getParameters("selectedItem").value) {
				oBinding.filter([]);
			} else {
				var svalue = parseInt(oEvent.getParameters("selectedItem").value);
				var oFilter1 = new sap.ui.model.Filter("ID_GATE", sap.ui.model.FilterOperator.EQ, svalue);
				aFilters.push(oFilter1);
				// filter binding
				oBinding.filter(aFilters);
			}

		},
		/******************* _handleEmployeesconfirm function fetches the selected value to the IdGate filter********************/
		_handleEmployeesconfirm: function (oEvent) {
			var t = oEvent.getParameter("selectedItem");
			if (t) {
				this.getView().byId("idGate").setValue(t.getTitle())
			}
			oEvent.getSource().getBinding("items").filter([])
		},
		/******************* _handleValueHelpClose function closes the ValueHelpSearch dialog box********************/
		_handleValueHelpClose: function (oEvent) {
			this._valueHelpDialog.close();
		},
		/******************* handleEmpValueHelp1 function fetches the data into the dialog box from the 'moltiplocatoreAssegnatarioFragment'********************/
		/*handleEmpValueHelp1: function (oEvent) {
			var that = this;
			//	debugger
			var idPath = oEvent.getSource().sId;

			if (!that._valueHelpDialog1) {
				that._valueHelpDialog1 = sap.ui.xmlfragment(
					"stipAdmin.stipAdmin.fragment.moltiplocatoreAssegnatarioFragment", that);
				that._valueHelpDialog1.setModel(that.getView().getModel("MoltiplicatoreResultTableModel"));
				//	sap.ui.getCore().byId(idPath).addDependent(that._valueHelpDialog1);
				this.getView().addDependent(this._valueHelpDialog1);
			}
			that._valueHelpDialog1.open();
		},*/
		/*******************_handleValueHelpSearch1 function is used to search the ASSEGNATARIO value from the ValueHelpSearch dialog box ********************/
		/*	_handleValueHelpSearch1: function (oEvent) {
				var aFilters = [];
				var oList = sap.ui.getCore().byId("assegnatarioGateSelect");
				var oBinding = oList.getBinding("items");
				if (!oEvent.getParameters("selectedItem").value) {
					oBinding.filter([]);
				} else {
					var svalue = oEvent.getParameters("selectedItem").value;
					var oFilter1 = new sap.ui.model.Filter("ASSEGNATARIO", sap.ui.model.FilterOperator.Contains, svalue);
					aFilters.push(oFilter1);
					// filter binding
					oBinding.filter(aFilters);
				}

			},*/
		/******************* _handleEmployeesconfirm1 function fetches the selected value to the Assegnatario filter********************/
		/*_handleEmployeesconfirm1: function (oEvent) {
			var t = oEvent.getParameter("selectedItem");
			if (t) {
				this.getView().byId("Assegnatario").setValue(t.getTitle())
			}
			oEvent.getSource().getBinding("items").filter([])
		},*/
		/******************* _handleValueHelpClose1 function closes the ValueHelpSearch dialog box********************/
		/*	_handleValueHelpClose1: function (oEvent) {
				this._valueHelpDialog1.close();
			},*/

		/*downloadCondition: function (oEvent) {
			debugger;
			var oModel = [],
				f = 0,
				l,
				columns_stip = [],
				txt = "%Stip=";
			var data = oMainModel.getData().Main;

			var result = data.filter(function (obj) {
				return obj.ASSEGNATARIO !== ""; // Or whatever value you want to use
			});
			console.log(result);

			for (var i = 0; i < result.length; i++) {
				for (var j = 0; j < result[i].RISULTATO.length; j++)
				//columns_stip.push(parseInt(result[i].RISULTATO[j].Risultato_sim.split("%")[0], 10));
					columns_stip.push(parseInt(result[i].RISULTATO[j].Risultato_sim, 10));
			}

			//sort in order
			columns_stip = columns_stip.sort(function (a, b) {
				return a - b;
			});

			//remove duplicates
			var m = {},
				stip = [],
				col_stip = [];
			for (var i = 0; i < columns_stip.length; i++) {
				var v = columns_stip[i];
				if (!m[v]) {
					stip.push(txt + v + "%");
					col_stip.push(v);
					m[v] = true;
				}
			}

			var columnTemplate = [{
					column: 'ID_GATE',
					label: 'Id Moltiplicatore'
				}, {
					column: 'FISCAL_YEAR',
					label: 'Periodo'
				}, {
					column: 'DESCR_GATE',
					label: 'Descrizone Gate'
				}, {
					column: 'ID_CURVA',
					label: 'Id Curva'
				}, {
					column: 'DESCR_CURVA',
					label: 'Descrizone Curva'
				}, {
					column: 'RISULTATO_GRADINO',
					label: 'Risultato'
				}, {
					column: 'RISULTATO_GRADINO_SIM',
					label: 'Risultato simulato'
				}, {
					column: 'ID_TIPO_CURVA',
					label: 'Id Tipo Curva'
				}, {
					column: 'SN_PERSONALIZZABILE',
					label: 'Personalizzabile'
				}, {
					column: 'ASSEGNATARIO',
					label: 'Identificativo Assegnatario'
				},

			];
			for (i = 0; i < stip.length; i++)
				columnTemplate.push({
					column: stip[i],
					label: stip[i]
				});
			var columnTemplate1 = [columnTemplate];

			console.log(col_stip);
			console.log(stip);

			var json = {};
			var jsonData = [];

			console.log(json1);

			var finalJson = [];

			for (var k = 0; k < result.length; k++) {
				var json1 = {
					"ID_GATE": result[k].ID_GATE,
					"FISCAL_YEAR": result[k].FISCAL_YEAR,
					"DESCR_GATE": result[k].DESCR_GATE,
					"ID_CURVA": result[k].ID_CURVA,
					"DESCR_CURVA": result[k].DESCR_CURVA,
					"RISULTATO_GRADINO": result[k].RISULTATO_GRADINO,
					"RISULTATO_GRADINO_SIM": result[k].RISULTATO_GRADINO_SIM,
					"ID_TIPO_CURVA": 2,
					"SN_PERSONALIZZABILE": result[k].SN_PERSONALIZZABILE,
					"ASSEGNATARIO": result[k].ASSEGNATARIO,

				};
				for (var ii = 0; ii < col_stip.length; ii++) {
					var tmp = stip[ii];
					json1[tmp] = "";
				}

				for (var j = 0; j < col_stip.length; j++) {
					for (i = 0; i < result[k].RISULTATO.length; i++) {

						var res = col_stip[j];
						var tmp = stip[j];
						if (parseInt(result[k].RISULTATO[i].Risultato_sim, 10) === res) {

							json1[tmp] = result[k].RISULTATO[i].Risultato;
						}
					}

				}
				finalJson.push(json1);
			}

			//console.log(json);
			console.log(json1);
			console.log(finalJson);
			console.log(columnTemplate1);

			var obj = {};
			obj.results = finalJson;
			tablesToExcel(obj, ['Moltiplicatore'], columnTemplate1, 'Moltiplicatore.xls', 'Excel');

		},
*/
		/*******************onDataExport function is used to download the table data in the Excel format
				  (with fields ID_GATE, FISCAL_YEAR, DESCR_GATE,ID_CURVA,DESCR_CURVA,RISULTATO_GRADINO,RISULTATO_GRADINO_SIM,
				  ID_TIPO_CURVA,SN_PERSONALIZZABILE,ASSEGNATARIO )********************/
		onDataExport: function (oEvent) {
			debugger;
			var oResource = this.getView().getModel("i18n").getResourceBundle();
			var oModel = [],
				aItems = [];
			var oModel1 = this.byId("tbl").getBinding("items").aIndices;
			var data = this.getView().getModel('MoltiplicatoreResultTableModel').getData().Main;
			for (var i = 0; i < oModel1.length; i++) {
				var val = oModel1[i];
				aItems.push(data[val]);
			}
			var f = 0,
				l,
				columns_stip = [],
				txt = "%Stip=";

			/*var aItems = this.getView().byId('tbl').getItems();

			for (var i = 0; i < aItems.length; i++) {
				var mother = aItems[i].getBindingContext("MoltiplicatoreResultTableModel").getObject().ID_GATE_MADRE,
					pers = aItems[i].getBindingContext("MoltiplicatoreResultTableModel").getObject().SN_PERSONALIZZABILE;
				for (var j = 0; j < aItems[i].getBindingContext("MoltiplicatoreResultTableModel").getObject().RISULTATO.length; j++) {
					//columns_stip.push(parseInt(oMainModel.getData().Main[i].RISULTATO[j].Risultato_sim.split("%")[0]), 10);
					if (mother === 0 && mother === null && pers === "S") {} else if (mother !== 0 || mother !== null)
						columns_stip.push(parseInt(aItems[i].getBindingContext("MoltiplicatoreResultTableModel").getObject().RISULTATO[j].Risultato_sim,
							10));
				}
			}*/

			//var aItems = this.byId("tbl").oPropagatedProperties.oModels.MoltiplicatoreResultTableModel.oData.Main;
			for (var i = 0; i < aItems.length; i++) {
				var mother = aItems[i].ID_GATE_MADRE,
					pers = aItems[i].SN_PERSONALIZZABILE;
				for (var j = 0; j < aItems[i].RISULTATO.length; j++) {
					//columns_stip.push(parseInt(oMainModel.getData().Main[i].RISULTATO[j].Risultato_sim.split("%")[0]), 10);
					if (mother === 0 && mother === null && pers === "S") {} else if (mother !== 0 || mother !== null)
						columns_stip.push(parseInt(aItems[i].RISULTATO[j].Risultato_sim,
							10));
				}
			}
			//columns_stip = columns_stip.sort();
			columns_stip = columns_stip.sort(function (a, b) {
				return a - b;
			});

			var m = {},
				stip = [],
				col_stip = [];
			for (var i = 0; i < columns_stip.length; i++) {
				var v = columns_stip[i];
				if (!m[v] && !isNaN(parseInt(v, 10))) {
					stip.push(txt + v + "%");
					col_stip.push(v);
					m[v] = true;
				}
			}

			var columnTemplate = [{
					column: 'ID_GATE',
					label: oResource.getText("Id_Moltiplicatore")
				}, {
					column: 'FISCAL_YEAR',
					label: oResource.getText("Id_Fiscal_Year")
				}, {
					column: 'DESCR_GATE',
					label: oResource.getText("Descr_Moltiplicatore")
				}, {
					column: 'ID_CURVA',
					label: 'Id_Curva'
				}, {
					column: 'DESCR_CURVA',
					label: 'Descrizione Curva'
				}, {
					column: 'RISULTATO_GRADINO',
					label: oResource.getText("Risultato")
				}, {
					column: 'RISULTATO_GRADINO_SIM',
					label: oResource.getText("Risultato_SIM")
				}, {
					column: 'ID_TIPO_CURVA',
					label: oResource.getText("Id_Tipo_Curva")
				}, {
					column: 'SN_PERSONALIZZABILE',
					label: 'Personalizzabile'
				}, {
					column: 'ASSEGNATARIO',
					label: oResource.getText("Molti_Identificativo_Assegnatario")
				},

			];
			for (i = 0; i < stip.length; i++)
				columnTemplate.push({
					column: stip[i],
					label: stip[i]
				});
			/*columnTemplate.push({
				column: 'ID_PISTA',
				label: 'Id Pista'
			}, {
				column: 'DESCR_PISTA',
				label: 'Descrizione Pista'
			}, {
				column: 'DESCR_GRUPPI',
				label: 'Descrizione Gruppi'
			});*/
			var columnTemplate1 = [columnTemplate];

			console.log(col_stip);
			console.log(stip);

			//CORRECT CODE FOR 1 RECORD. DONT DELETE

			/*var json = {};
			var jsonData = [];
			var json1 = {
					"ID_GATE": oMainModel.getData()[0].ID_GATE,
					"DESCR_GATE": oMainModel.getData()[0].DESCR_GATE,
					"DESCR_CURVA": oMainModel.getData()[0].DESCR_CURVA,
					"SN_PERSONALIZZABILE": oMainModel.getData()[0].SN_PERSONALIZZABILE,
					"SN_VISIBILEPCO": oMainModel.getData()[0].SN_VISIBILEPCO,
					"ASSEGNATARIO": oMainModel.getData()[0].ASSEGNATARIO,
					"RISULTATO_GRADINO": oMainModel.getData()[0].RISULTATO_GRADINO,
					"RISULTATO_GRADINO_SIM": oMainModel.getData()[0].RISULTATO_GRADINO_SIM
				};

			for (i = 0; i < col_stip.length; i++) {
				var tmp = stip[i];
				json1[tmp] = "";
			}
			
			console.log(json1);

			var finalJson = [];
				
				for (var j = 0; j < col_stip.length; j++) {
					for (i = 0; i < oMainModel.getData()[0].RISULTATO.length; i++) {

						var res = col_stip[j];
						var tmp = stip[j];
						if (parseInt(oMainModel.getData()[0].RISULTATO[i].Risultato_sim, 10) === res){
							json[tmp] = res;
							json1[tmp] = res;}
					}
					
				}
			
			console.log(json);
			console.log(json1);
			
*/

			var json = {};
			var jsonData = [];

			console.log(json1);

			var finalJson = [];
			//var result = oMainModel.getData().Main;
			var result = this.byId("tbl").oPropagatedProperties.oModels.MoltiplicatoreResultTableModel.oData.Main;

			for (var k = 0; k < result.length; k++) {
				if (result[k].DESCR_CURVA === null)
					result[k].DESCR_CURVA = "";
				var mother = result[k].ID_GATE_MADRE,
					pers = result[k].SN_PERSONALIZZABILE;
				if ((mother === 0 || mother === null) && pers === "S") { //mother Y 
					var json1 = {
						"ID_GATE": result[k].ID_GATE,
						"FISCAL_YEAR": result[k].FISCAL_YEAR,
						"DESCR_GATE": result[k].DESCR_GATE,
						"ID_CURVA": result[k].ID_CURVA,
						"DESCR_CURVA": result[k].DESCR_CURVA,
						"RISULTATO_GRADINO": result[k].RISULTATO_GRADINO,
						"RISULTATO_GRADINO_SIM": result[k].RISULTATO_GRADINO_SIM,
						"ID_TIPO_CURVA": 2,
						"SN_PERSONALIZZABILE": result[k].SN_PERSONALIZZABILE,
						"ASSEGNATARIO": result[k].ASSEGNATARIO
					};
				}
				//else if ((mother === 0 || mother === null) && pers === "N") {
				else if (((mother === 0 || mother === null) && pers === "N") || (mother !== 0 || mother !== null)) { //mother N or child both pers
					var json1 = {
						"ID_GATE": result[k].ID_GATE,
						"FISCAL_YEAR": result[k].FISCAL_YEAR,
						"DESCR_GATE": result[k].DESCR_GATE,
						"ID_CURVA": result[k].ID_CURVA,
						"DESCR_CURVA": result[k].DESCR_CURVA,
						"RISULTATO_GRADINO": result[k].RISULTATO_GRADINO,
						"RISULTATO_GRADINO_SIM": result[k].RISULTATO_GRADINO_SIM,
						"ID_TIPO_CURVA": 2,
						"SN_PERSONALIZZABILE": result[k].SN_PERSONALIZZABILE,
						"ASSEGNATARIO": result[k].ASSEGNATARIO
					};
					for (var ii = 0; ii < col_stip.length; ii++) {
						var tmp = stip[ii];
						json1[tmp] = "";
					}

					for (var j = 0; j < col_stip.length; j++) {
						for (i = 0; i < result[k].RISULTATO.length; i++) {

							var res = col_stip[j];
							var tmp = stip[j];
							if (parseInt(result[k].RISULTATO[i].Risultato_sim, 10) === res && !isNaN(res)) {

								json1[tmp] = result[k].RISULTATO[i].Risultato;
							}
						}

					}
				}

				/*	var idpiste = "",
						descpiste = "",
						descgruppi = "",
						res = result[k].PISTE_DATA;
					for (var kk = 0; kk < result[k].PISTE_DATA.length; kk++) {
						idpiste = idpiste + " " + res[kk].pisteid;
						descpiste = descpiste + " " + res[kk].desc;
						descgruppi = descgruppi + " " + res[kk].gruppi_desc;
					}
					json1["ID_PISTE"] = idpiste;
					json1["DESCR_PISTE"] = descpiste;
					json1["DESCR_GRUPPI"] = descgruppi;*/

				finalJson.push(json1);

			}

			var m = {},
				data11 = finalJson;
			finalJson = [];

			for (var i = 0; i < data11.length; i++) {
				var vv = data11[i].ID_GATE,
					v = data11[i];
				if (!m[vv]) {
					finalJson.push(v);
					m[vv] = true;
				}
			}

			//}

			//console.log(json);
			//console.log(json1);
			console.log(finalJson);
			console.log(columnTemplate1);

			var obj = {};
			obj.results = finalJson;
			tablesToExcel(obj, ['Moltiplicatore'], columnTemplate1, 'Moltiplicatore.xls', 'Excel');

		},

		/*	onDataExport2: function (oEvent) {
				debugger;
				var oModel = [],
					f = 0,
					l,
					columns_stip = [],
					txt = "%Stip=";

				var aItems = this.byId("tbl").oPropagatedProperties.oModels.MoltiplicatoreResultTableModel.oData.Main;

				for (var i = 0; i < aItems.length; i++) {
					var mother = aItems[i].ID_GATE_MADRE,
						pers = aItems[i].SN_PERSONALIZZABILE;
					for (var j = 0; j < aItems[i].RISULTATO.length; j++) {
						//columns_stip.push(parseInt(oMainModel.getData().Main[i].RISULTATO[j].Risultato_sim.split("%")[0]), 10);
						//if (mother !== 0 && mother !== null && pers === "S") {} else if (mother === 0 || mother === null)
						if (mother === 0 && mother === null && pers === "S") {} else if (mother !== 0 || mother !== null)
							columns_stip.push(parseInt(aItems[i].RISULTATO[j].Risultato_sim, 10));
					}
				}

				//columns_stip = columns_stip.sort();
				columns_stip = columns_stip.sort(function (a, b) {
					return a - b;
				});

				var m = {},
					stip = [],
					col_stip = [];
				for (var i = 0; i < columns_stip.length; i++) {
					var v = columns_stip[i];

					if (!m[v] && !isNaN(parseInt(v, 10))) {
						stip.push(txt + v + "%");
						col_stip.push(v);
						m[v] = true;
					}
				}

				var columnTemplate = [{
						column: 'ID_GATE',
						label: 'Id Moltiplicatore'
					}, {
						column: 'FISCAL_YEAR',
						label: 'Periodo'
					}, {
						column: 'DESCR_GATE',
						label: 'Descrizone Gate'
					}, {
						column: 'ID_CURVA',
						label: 'Id Curva'
					}, {
						column: 'DESCR_CURVA',
						label: 'Descrizone Curva'
					}, {
						column: 'RISULTATO_GRADINO',
						label: 'Risultato'
					}, {
						column: 'RISULTATO_GRADINO_SIM',
						label: 'Risultato simulato'
					}, {
						column: 'ID_TIPO_CURVA',
						label: 'Id Tipo Curva'
					}, {
						column: 'SN_PERSONALIZZABILE',
						label: 'Personalizzabile'
					}, {
						column: 'ASSEGNATARIO',
						label: 'Identificativo Assegnatario'
					},

				];
				for (i = 0; i < stip.length; i++)
					columnTemplate.push({
						column: stip[i],
						label: stip[i]
					});
				columnTemplate.push({
					column: 'ID_PISTA',
					label: 'Id Pista'
				}, {
					column: 'DESCR_PISTA',
					label: 'Descrizione Pista'
				}, {
					column: 'DESCR_GRUPPI',
					label: 'Descrizione Gruppi'
				});
				var columnTemplate1 = [columnTemplate];

				console.log(col_stip);
				console.log(stip);

				//CORRECT CODE FOR 1 RECORD. DONT DELETE

				var json = {};
				var jsonData = [];
				var json1 = {
						"ID_GATE": oMainModel.getData()[0].ID_GATE,
						"DESCR_GATE": oMainModel.getData()[0].DESCR_GATE,
						"DESCR_CURVA": oMainModel.getData()[0].DESCR_CURVA,
						"SN_PERSONALIZZABILE": oMainModel.getData()[0].SN_PERSONALIZZABILE,
						"SN_VISIBILEPCO": oMainModel.getData()[0].SN_VISIBILEPCO,
						"ASSEGNATARIO": oMainModel.getData()[0].ASSEGNATARIO,
						"RISULTATO_GRADINO": oMainModel.getData()[0].RISULTATO_GRADINO,
						"RISULTATO_GRADINO_SIM": oMainModel.getData()[0].RISULTATO_GRADINO_SIM
					};

				for (i = 0; i < col_stip.length; i++) {
					var tmp = stip[i];
					json1[tmp] = "";
				}
				
				console.log(json1);

				var finalJson = [];
					
					for (var j = 0; j < col_stip.length; j++) {
						for (i = 0; i < oMainModel.getData()[0].RISULTATO.length; i++) {

							var res = col_stip[j];
							var tmp = stip[j];
							if (parseInt(oMainModel.getData()[0].RISULTATO[i].Risultato_sim, 10) === res){
								json[tmp] = res;
								json1[tmp] = res;}
						}
						
					}
				
				console.log(json);
				console.log(json1);
				


				var json = {};
				var jsonData = [];

				console.log(json1);

				var finalJson = [];
				var result = this.byId("tbl").oPropagatedProperties.oModels.MoltiplicatoreResultTableModel.oData.Main;

				for (var k = 0; k < result.length; k++) {
					if (result[k].DESCR_CURVA === null)
						result[k].DESCR_CURVA = "";
					var mother = result[k].ID_GATE_MADRE,
						pers = result[k].SN_PERSONALIZZABILE;
					//	if (((mother === 0 || mother === null) || (mother !== 0 && mother !== null) && pers === "N")) { //mother N or child
					if (pers === "N") {
						var json1 = {
							"ID_GATE": result[k].ID_GATE,
							"FISCAL_YEAR": result[k].FISCAL_YEAR,
							"DESCR_GATE": result[k].DESCR_GATE,
							"ID_CURVA": result[k].ID_CURVA,
							"DESCR_CURVA": result[k].DESCR_CURVA,
							"RISULTATO_GRADINO": result[k].RISULTATO_GRADINO,
							"RISULTATO_GRADINO_SIM": result[k].RISULTATO_GRADINO_SIM,
							"ID_TIPO_CURVA": 2,
							"SN_PERSONALIZZABILE": result[k].SN_PERSONALIZZABILE,
							"ASSEGNATARIO": result[k].ASSEGNATARIO
						};
						for (var ii = 0; ii < col_stip.length; ii++) {
							var tmp = stip[ii];
							json1[tmp] = "";
						}

						for (var j = 0; j < col_stip.length; j++) {
							for (i = 0; i < result[k].RISULTATO.length; i++) {

								var res = col_stip[j];
								var tmp = stip[j];
								if (parseInt(result[k].RISULTATO[i].Risultato_sim, 10) === res && !isNaN(res)) {

									json1[tmp] = result[k].RISULTATO[i].Risultato;
								}
							}

						}
						finalJson.push(json1);
					}

					var idpiste = "",
							descpiste = "",
							descgruppi = "",
							res = result[k].PISTE_DATA;
						for (var kk = 0; kk < result[k].PISTE_DATA.length; kk++) {
							idpiste = idpiste + " " + res[kk].pisteid;
							descpiste = descpiste + " " + res[kk].desc;
							descgruppi = descgruppi + " " + res[kk].gruppi_desc;
						}
						json1["ID_PISTE"] = idpiste;
						json1["DESCR_PISTE"] = descpiste;
						json1["DESCR_GRUPPI"] = descgruppi;

				}

				var m = {},
					data11 = finalJson;
				finalJson = [];

				for (var i = 0; i < data11.length; i++) {
					var vv = data11[i].ID_GATE,
						v = data11[i];
					if (!m[vv]) {
						finalJson.push(v);
						m[vv] = true;
					}
				}

				//}

				//console.log(json);
				//console.log(json1);
				console.log(finalJson);
				console.log(columnTemplate1);

				var obj = {};
				obj.results = finalJson;
				tablesToExcel(obj, ['Moltiplicatore'], columnTemplate1, 'Moltiplicatore.xls', 'Excel');

			},*/
		/*******************onDataExport2 function is used to download the table data in the Excel format
		  (with fields ID_GATE, FISCAL_YEAR, DESCR_GATE,ID_CURVA,DESCR_CURVA,RISULTATO_GRADINO,RISULTATO_GRADINO_SIM,
		  ID_TIPO_CURVA,SN_PERSONALIZZABILE,ASSEGNATARIO )********************/
		onDataExport2: function (oEvent) {
			debugger;
			var oModel = this.getView().getModel('MoltiplicatoreResultTableModel').getData().Main;
			console.log(oModel);
			var oResource = this.getView().getModel("i18n").getResourceBundle();
			var oModel1 = this.getView().getModel('MoltiplicatoreResultTableModel').getData().Filter[0].CURVE_DOWNLOADDATA;
			console.log(oModel1);
			var columnTemplate1 = [
				[{
						column: 'ID_GATE',
						label: oResource.getText("Id_Moltiplicatore")
					}, {
						column: 'FISCAL_YEAR',
						label: oResource.getText("Id_Fiscal_Year")
					}, {
						column: 'DESCR_GATE',
						label: oResource.getText("Descr_Moltiplicatore")
					}, {
						column: 'RISULTATO_GRADINO',
						label: oResource.getText("Risultato")
					}, {
						column: 'RISULTATO_GRADINO_SIM',
						label: oResource.getText("Risultato_SIM")
					}, {
						column: 'ID_TIPO_CURVA',
						label: oResource.getText("Id_Tipo_Curva")
					}, {
						column: 'ASSEGNATARIO',
						label: oResource.getText("Molti_Identificativo_Assegnatario")
					}, {
						column: 'ID_CURVA',
						label: oResource.getText("Id_Curva")
					}, {
						column: 'DESCR_CURVA',
						label: oResource.getText("Descr_Curva")
					},

				],
				[{
						column: 'ID_CURVA',
						label: 'Id_Curva'
					}, {
						column: 'DESCR_CURVA',
						label: 'Descrizone Curva'
					},
					/*	{
							column: 'PERC_MBO',
							label: '% Payout'
						},*/
					{
						column: 'S_GRADINO',
						label: 'Performance'
					}
				]
			];

			var downResJsonData = {},
				downResData = [];
			if (oModel.length > 0) {
				for (var i = 0; i < oModel.length; i++) {
					if (oModel[i].SN_PERSONALIZZABILE === "N") {
						downResJsonData = {
							"ID_GATE": oModel[i].ID_GATE === undefined ? "" : oModel[i].ID_GATE,
							"FISCAL_YEAR": oModel[i].FISCAL_YEAR === undefined ? "" : oModel[i].FISCAL_YEAR,
							"DESCR_GATE": oModel[i].DESCR_GATE === undefined ? "" : oModel[i].DESCR_GATE,
							"RISULTATO_GRADINO": oModel[i].RISULTATO_GRADINO === undefined ? "" : oModel[i].RISULTATO_GRADINO,
							"RISULTATO_GRADINO_SIM": oModel[i].RISULTATO_GRADINO_SIM === undefined ? "" : oModel[i].RISULTATO_GRADINO_SIM,
							"ID_TIPO_CURVA": "2",
							"ASSEGNATARIO": oModel[i].ASSEGNATARIO === undefined ? "" : oModel[i].ASSEGNATARIO,
							"ID_CURVA": oModel[i].ID_CURVA === undefined ? "" : oModel[i].ID_CURVA,
							"DESCR_CURVA": oModel[i].DESCR_CURVA === undefined ? "" : oModel[i].DESCR_CURVA

						}
						downResData.push(downResJsonData);
					}
				}
				console.log(downResData);
			}

			var downResJsonData1 = {},
				downResData1 = [];
			if (oModel1.length > 0) {
				for (var i = 0; i < oModel1.length; i++) {
					if (oModel1[i].SN_PERSONALIZZABILE === "N") {
						downResJsonData1 = {
							"ID_CURVA": oModel1[i].ID_CURVA === undefined ? "" : oModel1[i].ID_CURVA,
							"DESCR_CURVA": oModel1[i].DESCR_CURVA === undefined ? "" : oModel1[i].DESCR_CURVA,
							// "PERC_MBO": oModel1[i].PERC_MBO === undefined ? "" : oModel1[i].PERC_MBO,
							"S_GRADINO": oModel1[i].S_GRADINO === undefined ? "" : oModel1[i].S_GRADINO

						}
						downResData1.push(downResJsonData1);
					}
				}
				console.log(downResData1);
			}
			debugger

			var obj = {},
				obj1 = {};
			//	obj.results = downResData;
			obj1.results = downResData1;
			var excelData = {
				Moltiplicatore: downResData,
				Curva: downResData1
			};

			tablesToExcel(excelData, ['Moltiplicatore', 'Curva'], columnTemplate1, 'Moltiplicatore.xls', 'Excel');
		}

	});
});