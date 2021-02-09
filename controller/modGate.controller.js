sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/core/BusyIndicator"
], function (n, MessageBox, BusyIndicator) {
	"use strict";
	var flagPCO;
	flagPCO = sap.ui.getCore().getModel("EmpAuthoModel").getData()[0].ROLE_PCO;
	var hradm = sap.ui.getCore().getModel("EmpAuthoModel").getData()[0].ROLE_HR_ADMIN;
	var oMainModel = new sap.ui.model.json.JSONModel();
	var selectedfiscalYearPeriodi, desc_aseg, mom = 0;

	return n.extend("stipAdmin.stipAdmin.controller.modGate", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {
			debugger
			/*if (flagPCO === "X") {
			               this.getView().byId("del").setEnabled(false);
			              this.getView().byId("descGate").setEditable(false);
			              this.getView().byId("curve").setEditable(false);

			               //only risultato and risultato_sim can be changed for finance / role_pco
			               this.byId("risultato").setEditable(true);
			               this.byId("risultato_sim").setEditable(true);
			} else  {
			               this.getView().byId("del").setEnabled(true);
			              this.getView().byId("descGate").setEditable(true);
			               this.getView().byId("curve").setEditable(true);

			}*/

			this.getOwnerComponent().getRouter().getRoute("modGate").attachPatternMatched(this._onObjectMatched, this)
		},
		/******************** _onObjectMatched fetches argument values********************************************/
		_onObjectMatched: function (oEvent) {
			this.id = oEvent.getParameter("arguments").id;
			this.getMoltiplicatoreResultTableData(this.id);

			//console.log(oMainModel.getData());
		},
		/******************* getMoltiplicatoreResultTableData function fetches the desired data from the backened********************/
		getMoltiplicatoreResultTableData: function (id) {
			BusyIndicator.show();
			var oFilters = [];
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
				NOME, COGNOME, MATRICOLA;

			var filter1 = new sap.ui.model.Filter("ID_GATE", sap.ui.model.FilterOperator.EQ, id);
			oFilters.push(filter1);
			var that = this;

			xsoDataModel.read("/V_MOLTIPLICATORE?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;
					oFilters = [];
					data = oDataIn.results;
					console.log(data);
					if (data.length !== 0) {
						BusyIndicator.show();
						var year = data[0].DESCR_PERIODO;
						this.byId("fy").setText(year);
						if (oDataIn.results[0].NOME === null && oDataIn.results[0].COGNOME === null && oDataIn.results[0].MATRICOLA === null) {
							NOME = " ";
							COGNOME = " ";
							MATRICOLA = "";
						} else {
							NOME = oDataIn.results[0].NOME;
							COGNOME = oDataIn.results[0].COGNOME;
							MATRICOLA = oDataIn.results[0].MATRICOLA;
						}

						var MoltiplicatoreResultJsonData = {
							"FISCAL_YEAR": oDataIn.results[0].ID_PERIODO,
							"DESCR_PERIODO": year,
							"ID_GATE": oDataIn.results[0].ID_GATE,
							"DESCR_GATE": oDataIn.results[0].DESCR_GATE,
							"ID_CURVA": oDataIn.results[0].ID_CURVA,
							"DESCR_CURVA": oDataIn.results[0].DESCR_CURVA,
							"ID_GATE_MADRE": oDataIn.results[0].ID_GATE_MADRE,
							"ASSEGNATARIO": NOME + " " + COGNOME + " " + MATRICOLA,
							"RISULTATO_GRADINO": oDataIn.results[0].RISULTATO_GRADINO,
							"RISULTATO_GRADINO_SIM": oDataIn.results[0].RISULTATO_GRADINO_SIM,
							"SN_PERSONALIZZABILE": oDataIn.results[0].SN_PERSONALIZZABILE,
							"SN_VISIBILEPCO": oDataIn.results[0].SN_VISIBILEPCO,
							//"RISULTATO1": {},
							"RISULTATO": {},
							"PISTE_DATA": [],
							"GRUPPI_DATA": []
						};

						MoltiplicatoreResultJson.push(MoltiplicatoreResultJsonData);
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
							Risultato: "",
							Risultato_sim: ""
						}];
						for (var i = 0; i < oDataIn.results.length; i++) {
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

						MoltiplicatoreResultJson[0].RISULTATO = RISULTATO;
						RISULTATO = [];
					}
					var dataxx = MoltiplicatoreResultJson[0].RISULTATO,
						m = {},
						vv;
					for (var i = 0; i < dataxx.length; i++) {
						vv = dataxx[i].Risultato;
						if (!m[vv]) {
							m[vv] = true;
							RISULTATO.push(dataxx[i]);
						}
					}
					MoltiplicatoreResultJson[0].RISULTATO = RISULTATO;

					for (var j = 0; j < oDataIn.results.length; j++) {

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
					}
					var data11 = PISTE_DATA,
						m = {};
					PISTE_DATA = [];

					for (var i = 0; i < data11.length; i++) {
						var vv = data11[i].pisteid;
						if (!m[vv] && vv !== "") {
							PISTE_DATA.push(data11[i]);
							m[vv] = true;
						}
					}

					MoltiplicatoreResultJson[0].PISTE_DATA = PISTE_DATA;

					BusyIndicator.hide();
					data = MoltiplicatoreResultJson[0];
					this.byId("pers").setSelectedKey(data.SN_PERSONALIZZABILE);
					/*if (data.SN_PERSONALIZZABILE === "S")
					              data.SN_PERSONALIZZABILE = "Si";
					else
					              data.SN_PERSONALIZZABILE = "No";*/

					if (data.PISTE_DATA.length === 0)
						that.byId("tbl").setVisible(false);
					else
						that.byId("tbl").setVisible(true);
					oMainModel.setData(data);
					console.log(oMainModel.getData());
					selectedfiscalYearPeriodi = oMainModel.getData().FISCAL_YEAR;

					that.getView().setModel(oMainModel, "MoltiplicatoreResultTableModel");

					selectedfiscalYearPeriodi = oMainModel.getData().FISCAL_YEAR;

					this.byId("risultato").setSelectedKey(data.RISULTATO_GRADINO);
					this.byId("risultato_sim").setSelectedKey(data.RISULTATO_GRADINO_SIM);

					//this.byId("curve").setSelectedKey(data.ID_CURVA);
					debugger
					if ((oMainModel.getData().ID_GATE_MADRE === 0 || oMainModel.getData().ID_GATE_MADRE === null) && oMainModel.getData().SN_PERSONALIZZABILE ===
						"S") { //
						console.log("mother sn = y");
						if (hradm === "X") {
							this.byId("descGate").setEditable(true);
							this.byId("curve").setEditable(true);
							//              this.byId("pers").setEnabled(true);
							//bug 914, in change mode the “Pers field” must not be editable for any profile.
							this.byId("risultato").setEditable(false);
							this.byId("risultato_sim").setEditable(false);
						}

						mom = 1;

					} else if (oMainModel.getData().ID_GATE_MADRE !== 0 && oMainModel.getData().ID_GATE_MADRE !== null) {
						console.log("child");
						this.byId("descGate").setEditable(false);
						this.byId("curve").setEditable(false);
						this.byId("risultato").setEditable(true);
						this.byId("risultato_sim").setEditable(true);
					} else if ((oMainModel.getData().ID_GATE_MADRE === 0 || oMainModel.getData().ID_GATE_MADRE === null) && oMainModel.getData().SN_PERSONALIZZABILE ===
						"N") { //
						console.log("mother sn = n");
						if (hradm === "X") {
							this.byId("descGate").setEditable(true);
							this.byId("curve").setEditable(true);
							//              this.byId("pers").setEnabled(true);
							//bug 914, in change mode the “Pers field” must not be editable for any profile.
							this.byId("risultato").setEditable(true);
							this.byId("risultato_sim").setEditable(true);
						}

					}
					if (flagPCO === "X") {
						console.log("flagPCO ===true");
						this.byId("descGate").setEditable(false);
						this.byId("curve").setEditable(false);
						this.byId("pers").setEnabled(false);
						this.byId("risultato").setEditable(true);
						this.byId("risultato_sim").setEditable(true);
					}

					/*if ((oMainModel.getData().PISTE_DATA.length === 0 || oMainModel.getData().PISTE_DATA.length === 1) && (oMainModel.getData().PISTE_DATA[
					                             0].pisteid === 0 || oMainModel.getData().PISTE_DATA[0].pisteid === null)) {*/
					if (oMainModel.getData().PISTE_DATA.length === 0) {
						this.byId("tbl").setVisible(false);
						this.byId("del").setVisible(true);
					} else {
						this.byId("del").setVisible(false);

						this.byId("tbl").setVisible(true);
					}

					this.byId("asseg").setEditable(false);
					that.CurveData();

					sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "back");
					//year = oMainModel.getData().DESCR_PERIODO;

					this.byId("fy").setText(year);
					//this.byId("curve").setSelectedKey(oMainModel.getData().ID_CURVA + 1);

				}.bind(this),
				error: function (oError) {
					//Handle the error
					BusyIndicator.hide();
					oFilters = [];
					MessageBox.error("Data fetch failed while getting P_GATE. Please contact administrator.");
					jQuery.sap.log.getLogger().error("P_GATE fetch failed" + oError.toString());
				}.bind(this)
			});
			return MoltiplicatoreResultJson;
		},
		/********************CurveData function fetches the data from V_CURVAGATE based on SN_GATE and ID_PERIODO********************************************/
		CurveData: function () {
			debugger;
			var oFilters = [],
				curve1 = [];
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			var filter2 = new sap.ui.model.Filter("SN_GATE", sap.ui.model.FilterOperator.EQ, "S");
			oFilters.push(filter2);
			var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, selectedfiscalYearPeriodi);
			oFilters.push(filter1);
			xsoDataModel.read("/V_CURVAGATE?$format=json", {
				async: false,
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;
					console.log(oDataIn);
					for (var i = 0; i < oDataIn.results.length; i++) {
						curve1.push({
							"id": oDataIn.results[i].ID_CURVA,
							"desc": oDataIn.results[i].DESCR_CURVA,
							"Risultato": oDataIn.results[i].S_GRADINO,
							"Risultato_sim": oDataIn.results[i].S_GRADINO
						});
					}

					var m = {};
					var data11 = curve1;
					curve1 = [{
						"id": 0,
						"desc": "",
						"Risultato": "",
						"Risultato_sim": ""
					}];
					for (var i = 0; i < data11.length; i++) {
						var v = data11[i],
							vv = data11[i].id;
						if (!m[vv]) {
							curve1.push(v);
							m[vv] = true;
						}
					}
					if (sap.ui.getCore().getModel("BasicAppModel").getProperty("/discreta")) {
						var curveId = parseInt(sap.ui.getCore().getModel("BasicAppModel").getProperty("/discreta"),10);
						this.byId("curve").setSelectedKey(curveId);
					}
					else{

					for (i = 0; i < curve1.length; i++) {
						if (curve1[i].id === oMainModel.getData().ID_CURVA) {
							this.byId("curve").setSelectedKey(curve1[i].id);
							break;
						}
					}
					}

					oMainModel.setProperty("/CURVE", curve1);
					console.log(oMainModel.getData());
					oMainModel.refresh();

				}.bind(this),
				error: function (oError) {
					curve1.push({
						"id": "",
						"desc": "",
						"Risultato": "",
						"Risultato_sim": ""
					});
					//MessageBox.error("Data fetch failed while getting Numero. Please contact administrator.");
					jQuery.sap.log.getLogger().error("T_Curve fetch failed" + oError.toString());
				}
			});

		},
		/********************curveChange function fetches the data from theT_CURVE_RIGHE to change the select type of ID_CURVA********************************************/
		curveChange: function (oEvent) {
			var curveid = this.byId("curve").getSelectedKey();
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			var curve = [{
				"Risultato": "",
				"Risultato_sim": ""
			}];
			var oFilters = [];
			var filter1 = new sap.ui.model.Filter("ID_CURVA", sap.ui.model.FilterOperator.EQ, curveid);
			oFilters.push(filter1);
			xsoDataModel.read("/T_CURVE_RIGHE?$format=json", {
				async: false,
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;
					console.log(oDataIn);
					for (var i = 0; i < oDataIn.results.length; i++) {
						curve.push({
							"Risultato": oDataIn.results[i].S_GRADINO,
							"Risultato_sim": oDataIn.results[i].S_GRADINO
						});
					}

				}.bind(this),
				error: function (oError) {

					//MessageBox.error("Data fetch failed while getting Numero. Please contact administrator.");
					jQuery.sap.log.getLogger().error("T_Curve fetch failed" + oError.toString());
				}
			});

			//           }

			xsoDataModel.attachRequestCompleted(function () {
				debugger;
				var p = "/RISULTATO";
				oMainModel.setProperty(p, curve);
				oMainModel.setProperty("/ID_CURVA", curveid);

				oMainModel.refresh();
				console.log(oMainModel.getData());

			});

		},
		/********************save function is used to save the changes after verifying that description is not blank********************************************/
		save: function () {
			debugger;
			var that = this;
			var curve = this.byId("curve").getSelectedKey();
			/*var pco = this.byId("box0").getSelected();*/
			var pers = this.byId("pers").getSelectedKey();
			var gradino = this.byId("risultato").getSelectedKey();
			var gradino_sim = this.byId("risultato_sim").getSelectedKey();
			var gateDesc = oMainModel.getData().DESCR_GATE;
			if (gateDesc === "" || gateDesc === null || gateDesc === undefined) {
				MessageBox.error("La descrizione non può essere vuota"); //Error message displayed 'The description cannot be empty'
			} else {
				/*if (pco === true)
				              pco = "S";
				else*/
				var pco = "N";
				var data = {
					"ID_GATE": oMainModel.getData().ID_GATE,
					"ID_PERIODO": selectedfiscalYearPeriodi,
					"DESCR_GATE": gateDesc,
					"ID_CURVA": curve,
					//"ASSEGNATARIO": oMainModel.getData().ASSEGNATARIO,
					"RISULTATO_GRADINO": gradino,
					"RISULTATO_GRADINO_SIM": gradino_sim,
					"SN_VISIBILEPCO": pco,
					"SN_PERSONALIZZABILE": pers

				};
				if (mom === 0) { //If mother moltiplocatori is 0
					var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
					var context = "/P_GATE(" + oMainModel.getData().ID_GATE + ")";
					xsoDataModel.update(context, data, null, function (oDataIn) {
							debugger;
							console.log(oDataIn);

							MessageBox.success("Moltiplicatore Modificato con Successo", {
								onClose: function (oEvent) {
									//                             debugger;
									//sap.ui.getCore().getModel("BasicAppModel").setProperty("/back","create");
									console.log("Onclose");
									that.cancel();
								}
							});

						}.bind(this),
						function (oError) {
							//Handle the error
							MessageBox.error("Data fetch failed while updating P_GATE. Please contact administrator.");
							jQuery.sap.log.getLogger().error("P_GATE fetch failed" + oError.toString());
						}.bind(this)
					);

					xsoDataModel.attachRequestCompleted(function () {
						MessageBox.success("Moltiplicatore Modificato con Successo", { //Success message displayed 'Successfully Created Multiplier'
							onClose: function (oEvent) {
								//                         debugger;

								console.log("Onclose");
								that.cancel();
							}
						});

					});
				} else {
					console.log("mom pers = s"); //If mom pers = S
					debugger;

					var sPayload = JSON.stringify(data);
					var url = "/HANAMDC/STIP/STIPAdmin/services/modMoltiplicatore.xsjs";
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
							MessageBox.success("Moltiplicatore Modificato con Successo", { //Success message displayed 'Successfully Created Multiplier'
								onClose: function (oEvent) {
									//                             debugger;

									console.log("Onclose");
									that.cancel();
								}
							});

						},
						error: function (data, text) {
							console.log(data);
							MessageBox.error("Moltiplicatore Modificato con Errore"); //Error message displayed 'Multiplier Modified with Error'
						}
					});
				}
			}

		},
		/********************deleteGate function is used to display the confirmation message for deletion********************************************/
		/********************If user input is Si, then elimina function is invoked to delete the particular moltiplicatore********************************************/
		deleteGate: function () {
			var that = this;
			var gate_id = oMainModel.getData().ID_GATE;
			sap.m.MessageBox.confirm("Sei sicuro di voler eliminare?", { //Confirmation message displayed 'Are you sure you want to delete?'
				actions: ["Si", sap.m.MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction == "NO") {
						//that.cancel();
					} else if (oAction == "Si") {
						that.elimina();
					}

				}
			});
		},
		/********************elimina function will delete the particular moltiplicatore based on the ID_GATE
		and then naviagte to the previous moltiplicatore page********************************************/
		elimina: function () {
			var that = this;
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			var context = "/P_GATE(" + oMainModel.getData().ID_GATE + ")";
			xsoDataModel.remove(context, function (oDataIn) {
					debugger;
					console.log(oDataIn);
					MessageBox.success(
						"Moltiplicatore eliminato con successo", { //Success message displayed 'Successfully deleted multiplier'
							onClose: function (oEvent) {
								debugger;
								//sap.ui.getCore().getModel("BasicAppModel").setProperty("/back","delete");
								console.log("Onclose");
								sap.ui.core.UIComponent.getRouterFor(this).navTo("Gate", {
									gate: "gate",
									str: selectedfiscalYearPeriodi
								});
							}
						});

				}.bind(this),
				function (oError) {
					//Handle the error
					MessageBox.error("Error Occurred while deleting P_GATE. Please contact administrator.");
					jQuery.sap.log.getLogger().error("P_GATE fetch failed" + oError.toString());
				}.bind(this)
			);

			xsoDataModel.attachRequestCompleted(function () {
				MessageBox.success(
					"Moltiplicatore eliminato con successo", {
						onClose: function (oEvent) {
							debugger;
							sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "delete");
							console.log("Onclose");
							that.cancel();
						}
					});

			});
		},
		/********************displayCurve function navigates to displayCurvaDiscreta page based on curveId and curveDesc********************************************/
		displayCurve: function () {
			var idCurve = parseInt(this.byId("curve").getSelectedKey(), 10);
			for (var i = 0; i < oMainModel.getData().CURVE.length; i++) {
				if (oMainModel.getData().CURVE[i].id === idCurve)
					var curveDesc = oMainModel.getData().CURVE[i].desc;
			}

			sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", idCurve);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveDesc", curveDesc);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/gate", "S");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "gate");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/gateId", oMainModel.getData().ID_GATE)
			var e = sap.ui.core.UIComponent.getRouterFor(this);
			e.navTo("displayCurvaDiscreta");
		},
		/********************cancel function is used to navigate to the previous moltiplicatore page********************************************/
		cancel: function () {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Gate", {
				gate: "gate",
				str: selectedfiscalYearPeriodi
			});
		}

	});
});