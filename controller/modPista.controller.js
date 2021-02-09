sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"stipAdmin/stipAdmin/util/Formatter"
], function (t, i, MessageBox, Formatter, JSONModel) {
	"use strict";
	var oResource;
	return t.extend("stipAdmin.stipAdmin.controller.modPista", {
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("modPista").attachPatternMatched(this._onObjectMatched, this);
			this.byId("SchedaLabel").addStyleClass("imp");

		},
		_onObjectMatched: function (oEvent) {

			var oArguments = oEvent.getParameter("arguments");
			this.selectedfiscalYearPeriodi = oArguments.ID_PERIODO;
			this.selectedPistaview = oArguments.ID_PISTAVIEW;
			this.selectedIdPiste = oArguments.ID_PISTE;
			this.from = oArguments.from;
			if (oArguments.from !== undefined) {
				oResource = this.getView().getModel("i18n").getResourceBundle();
				this.busyDialog = new sap.m.BusyDialog();
				this.getView().byId("tblEnalbeOnFirstRowPress").setVisible(false);
				this.sServiceUrl = this.getOwnerComponent().getModel().sServiceUrl;
				this.oMainOdataModel = new sap.ui.model.odata.v2.ODataModel(this.sServiceUrl);
				var oMainModel = new sap.ui.model.json.JSONModel();
				sap.ui.getCore().setModel(oMainModel, "PercMboModel");
				var oMainModel1 = new sap.ui.model.json.JSONModel();
				sap.ui.getCore().setModel(oMainModel1, "CurveType");
				this.getCurva();
				this._data = {
					sottopiste: [{
						PESO_PERC: "100",
						oTest1: false,
						percentage: true,
						percentageValue: "%",
						ID_CURVA: "",
						ID_GATE: "",
						ID_TIPO_CURVA: "",
						DESCR_SOTTOPISTA: "",
						oButton1: true,
						oButton2: false,
						Obiettivo: "",
						Consuntivo: "",
						ConsuntivoCurva2: "",
						ConsuntivoSimulato: "",
						ConsuntivoSimulatoCurva2: "",
						ObiettivoSimulato: "",
						ObiettivoEnable: false,
						ConsuntivoEnable: false,
						ConsuntivoSimulatoEnable: false,
						ObiettivoSimulatoEnable: false,
						ID_SOTTOPISTA: 0,
						ID_PISTE: "",
						ID_PERIOD: "",
						DATETIME_CR: "",
						ConsuntivoValueEnable: false,
						ID_CURVA_EDIT: false,
						DESCR_SOTTOPISTA_EDIT: false,
						Obiettivo_edit: false,
						Consuntivo_edit: false,
						ConsuntivoSimulato_edit: false,
						ObiettivoSimulato_edit: false,
						PERC_MBO5: "",
						GateInTable: false,
						PERC_RAGG_OBIETTIVO: 0,
						PERC_RAGG_MBO: 0
					}]
				};
				//	this.clearFields();
				this.jModel = new sap.ui.model.json.JSONModel();
				this.jModel.setData(this._data);
				this.getView().byId("idTableCreatePiste").setModel(this.jModel, "PisteModel");
				this.getView().setModel(this.jModel, "PisteModel");
				this.getFiscalYear(this.selectedfiscalYearPeriodi);
				this.getDetails(this.selectedfiscalYearPeriodi, this.selectedPistaview, this.selectedIdPiste);

				this.getGruppi();
				this.getGate();
				this.getAdditivo();
			}
		},
		getDetails: function (period, pistaview, pistaid) {

			var oEntry = {
				ID_PERIODO: parseInt(period),
				ID_PISTAVIEW: parseInt(pistaview),
				ID_PISTE: parseInt(pistaid)
			};
			var that = this;
			var url = "/HANAMDC/STIP/STIPAdmin/services/GetDetailPiste.xsjs";
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
							that.setValueInScreen(data1);
						},
						error: function (data1, textStatus1, XMLHttpRequest1) {
							sap.ui.core.BusyIndicator.hide();
							MessageBox.error("Error while get Detail. Please contact administrator.");
							jQuery.sap.log.getLogger().error("Detail fetching operation failed" + textStatus1.toString());
						}
					});
				}
			});
		},
		setValueInScreen: function (data1) {
			var dataArray = [];
			this.firstTime = true;
			if (data1) {

				this.getView().byId("desc").setValue(data1.DESCR_PISTA);
				var date1 = Formatter.formatDatePiste(data1.PISTA_VALE_DAL);
				var date2 = Formatter.formatDatePiste(data1.PISTA_VALE_AL);
				this.getView().byId("MI").setSelectedKey(date1);
				this.getView().byId("MI1").setSelectedKey(date2);
				this.getView().byId("MI3").setSelectedKey(data1.ID_GRUPPOPISTA);
				this.getView().byId("Mul1").setSelectedKey(data1.ID_GATE);
				this.getView().byId("Mul2").setSelectedKey(data1.ID_GATE2);
				this.getView().byId("Additivo").setSelectedKey(data1.ID_TIPOADDITIVO);
				this.getView().byId("Soglia").setValue(data1.SOGLIA_ADDITIVO);
				this.getView().byId("curva2").setSelectedKey(data1.ID_CURVA);
				this.getView().byId("ObiettivoComplessivo").setValue("");
				this.getView().byId("ConsuntivoComplessivo").setValue("");
				this.getView().byId("ObiettivoNote").setValue(data1.NOTE_OBIETTIVO);
				this.getView().byId("ConsuntivoNote").setValue(data1.NOTE_CONSUNTIVO);
				this.getView().byId("SchedaNote").setValue(data1.NOTE);
				this.getView().byId("inpResultato").setValue(data1.RISULTATO_GRADINO);
				this.getView().byId("inpRisultatoSimulato").setValue(data1.RISULTATO_GRADINO_SIM);
				this.getView().byId("inpResultato1").setValue(data1.RISULTATO_GRADINO2);
				this.getView().byId("inpRisultatoSimulato1").setValue(data1.RISULTATO_GRADINO_SIM2);
				this.getView().byId("assegnatario").setValue(data1.MATR_ASSEGNATARIO);
				sap.ui.getCore().getModel("PercMboModel").setProperty("/PERC_MBO1", data1.PERC_MBO1);
				sap.ui.getCore().getModel("PercMboModel").setProperty("/PERC_MBO2", data1.PERC_MBO2);
				sap.ui.getCore().getModel("PercMboModel").setProperty("/PERC_MBO3", data1.PERC_MBO3);
				sap.ui.getCore().getModel("PercMboModel").setProperty("/PERC_MBO4", data1.PERC_MBO4);
				sap.ui.getCore().getModel("PercMboModel").setProperty("/ID_TIPO_CURVA", data1.ID_TIPO_CURVA);
				sap.ui.getCore().getModel("PercMboModel").setProperty("/ID_PISTAVIEW", data1.ID_PISTAVIEW);
				sap.ui.getCore().getModel("PercMboModel").setProperty("/ID_PISTE", data1.ID_PISTE);
				sap.ui.getCore().getModel("PercMboModel").setProperty("/ID_PERIOD", data1.ID_PERIOD);
				sap.ui.getCore().getModel("PercMboModel").setProperty("/DATETIME_CR", data1.DATETIME_CR);
				sap.ui.getCore().getModel("PercMboModel").setProperty("/ID_PISTA_MADRE", data1.ID_PISTA_MADRE);
				if (data1.results !== undefined) {
					if (data1.results.length > 1) {
						this.getView().byId("ObiettivoComplessivo").setValue(data1.OBIETTIVO_GRADINO);
						this.getView().byId("ConsuntivoComplessivo").setValue(data1.CONSUNTIVO_GRADINO);
						this.getView().byId("tblEnalbeOnFirstRowPress").setVisible(true);
					} else {
						this.getView().byId("tblEnalbeOnFirstRowPress").setVisible(false);
					}
				} else {
					this.getView().byId("tblEnalbeOnFirstRowPress").setVisible(false);
				}
				if (data1.SN_PERSONALIZZABILE === "S") {
					this.getView().byId("Pers").setSelectedIndex(0);
					sap.ui.getCore().getModel("PercMboModel").setProperty("/SN_PERSONALIZZABILE", "S");
					this.getView().byId("tglCaricamentoobiettivoconsuntivo").setVisible(false);
					this.getView().byId("ObiettivoNote").setEnabled(false);
					this.getView().byId("ConsuntivoNote").setEnabled(false);
					this.getView().byId("SchedaNote").setEnabled(false);
				} else {
					this.getView().byId("Pers").setSelectedIndex(1);
					sap.ui.getCore().getModel("PercMboModel").setProperty("/SN_PERSONALIZZABILE", "N");
				}
				var oEntry = {};
				if (data1.results !== undefined) {
					data1.results.sort((a, b) => (a.PESO_PERC < b.PESO_PERC) ? 1 : ((b.PESO_PERC < a.PESO_PERC) ? -1 : 0));
					for (var i = 0; i < data1.results.length; i++) {
						//	var data = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");

						if (i === 0) {

							//   if(data1.results[i].ID_CURVA && data1.results[i].ID_GATE){
							oEntry.PESO_PERC = data1.results[i].PESO_PERC;
							oEntry.oTest1 = true;
							oEntry.percentage = true;
							oEntry.percentageValue = "%";
							oEntry.ID_CURVA = data1.results[i].ID_CURVA;
							sap.ui.getCore().getModel("PercMboModel").setProperty("/ID_CURVA", data1.results[i].ID_CURVA);
							oEntry.ID_GATE = data1.results[i].ID_GATE;
							oEntry.DESCR_SOTTOPISTA = data1.results[i].DESCR_SOTTOPISTA;
							oEntry.ID_TIPO_CURVA = data1.results[i].ID_TIPO_CURVA;
							oEntry.oButton1 = true;
							oEntry.oButton2 = false;
							oEntry.Obiettivo = data1.OBIETTIVO;
							oEntry.Consuntivo = data1.CONSUNTIVO;
							oEntry.SN_Consuntivo_Perc = data1.SN_CONSUNTIVO_PERC;
							oEntry.CONSUNTIVO_GRADINO = data1.CONSUNTIVO_GRADINO;
							oEntry.ObiettivoSimulato = data1.OBIETTIVO_GRADINO;
							oEntry.OBIETTIVO_GRADINO = data1.CONSUNTIVO_SIM;
							oEntry.ObiettivoSimulato = data1.OBIETTIVO_SIM;
							oEntry.ObiettivoEnable = true;
							oEntry.ConsuntivoEnable = true;
							oEntry.ConsuntivoSimulatoEnable = true;
							oEntry.ObiettivoSimulatoEnable = true;
							oEntry.ID_SOTTOPISTA = data1.results[i].ID_SOTTOPISTA;
							oEntry.ID_PISTE = data1.results[i].ID_PISTE;
							oEntry.ID_PERIOD = data1.results[i].ID_PERIOD;
							oEntry.DATETIME_CR = data1.results[i].DATETIME_CR;
							oEntry.ConsuntivoValueEnable = true;
							oEntry.ID_CURVA_EDIT = true;
							oEntry.DESCR_SOTTOPISTA_EDIT = true;
							oEntry.Obiettivo_edit = true;
							oEntry.Consuntivo_edit = true;
							oEntry.ConsuntivoSimulato_edit = true;
							oEntry.ObiettivoSimulato_edit = true;
							oEntry.PERC_MBO5 = data1.results[i].PERC_MBO5;
							oEntry.GateInTable = false;
							if (oEntry.ID_TIPO_CURVA === "2" || oEntry.ID_TIPO_CURVA === 2) {
								oEntry.ConsuntivoValueEnable = true;
								oEntry.ConsuntivoCurva2 = oEntry.Consuntivo;
								var vPESO_PERC = parseInt(parseFloat(oEntry.Consuntivo) * 100);
								// once we will have logic for Consuntivo Simulato we have to call setCurva2Model funtion again for that
								oEntry.ConsuntivoSimulatoCurva2 = oEntry.ConsuntivoSimulato;
								var PESO_PERC = this.setCurva2Model(oEntry.ID_CURVA, this.firstTime, vPESO_PERC);
								oEntry.Consuntivo = PESO_PERC;
							} else {
								oEntry.ConsuntivoValueEnable = false;
							}
							// }
							//	dataArray.push(oEntry);
							//	oEntry = {};
						} else {

							oEntry.PESO_PERC = data1.results[i].PESO_PERC;
							oEntry.oTest1 = true;
							oEntry.percentage = true;
							oEntry.percentageValue = "%";
							oEntry.ID_CURVA = data1.results[i].ID_CURVA;
							oEntry.ID_GATE = data1.results[i].ID_GATE;
							oEntry.DESCR_SOTTOPISTA = data1.results[i].DESCR_SOTTOPISTA;
							oEntry.oButton1 = true;
							oEntry.oButton2 = true;
							oEntry.ID_TIPO_CURVA = data1.results[i].ID_TIPO_CURVA;
							oEntry.Obiettivo = data1.results[i].OBIETTIVO;
							oEntry.Consuntivo = data1.results[i].CONSUNTIVO;
							oEntry.SN_Consuntivo_Perc = data1.results[i].SN_CONSUNTIVO_PERC;
							oEntry.CONSUNTIVO_GRADINO = data1.CONSUNTIVO_GRADINO;
							oEntry.ObiettivoSimulato = data1.OBIETTIVO_GRADINO;
							oEntry.OBIETTIVO_GRADINO = data1.CONSUNTIVO_SIM;
							oEntry.ObiettivoSimulato = data1.OBIETTIVO_SIM;
							oEntry.ObiettivoEnable = true;
							oEntry.ConsuntivoEnable = true;
							oEntry.ConsuntivoSimulatoEnable = true;
							oEntry.ObiettivoSimulatoEnable = true;
							oEntry.ID_SOTTOPISTA = data1.results[i].ID_SOTTOPISTA;
							oEntry.ID_PISTE = data1.results[i].ID_PISTE;
							oEntry.ID_PERIOD = data1.results[i].ID_PERIOD;
							oEntry.DATETIME_CR = data1.results[i].DATETIME_CR;
							oEntry.ID_CURVA_EDIT = true;
							oEntry.DESCR_SOTTOPISTA_EDIT = true;
							oEntry.Obiettivo_edit = true;
							oEntry.Consuntivo_edit = true;
							oEntry.ConsuntivoSimulato_edit = true;
							oEntry.ObiettivoSimulato_edit = true;
							oEntry.PERC_MBO5 = data1.results[i].PERC_MBO5;
							oEntry.GateInTable = false;
							if (oEntry.ID_TIPO_CURVA === "2" || oEntry.ID_TIPO_CURVA === 2) {
								oEntry.ConsuntivoValueEnable = true;
							} else {
								oEntry.ConsuntivoValueEnable = false;
							}

						}
						dataArray.push(oEntry);
						oEntry = {};
					}

					this.getView().byId("idTableCreatePiste").getModel("PisteModel").setProperty("/sottopiste", dataArray);
					if (data1.results.length < 1) {
						var data = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");
						var oEntry = {
							PESO_PERC: "100",
							oTest1: false,
							percentage: true,
							percentageValue: "%",
							ID_CURVA: "",
							ID_GATE: "",
							ID_TIPO_CURVA: "",
							DESCR_SOTTOPISTA: data1.DESCR_PISTA,
							oButton1: true,
							oButton2: false,
							Obiettivo: "",
							Consuntivo: "",
							ConsuntivoSimulato: "",
							ObiettivoSimulato: "",
							ObiettivoEnable: true,
							ConsuntivoEnable: true,
							ConsuntivoSimulatoEnable: true,
							ObiettivoSimulatoEnable: true,
							ID_SOTTOPISTA: 0,
							ID_PISTE: "",
							ID_PERIOD: "",
							DATETIME_CR: "",
							ConsuntivoValueEnable: false,
							ConsuntivoCurva2: "",
							ConsuntivoSimulatoCurva2: "",
							ID_CURVA_EDIT: true,
							DESCR_SOTTOPISTA_EDIT: true,
							Obiettivo_edit: true,
							Consuntivo_edit: true,
							ConsuntivoSimulato_edit: true,
							ObiettivoSimulato_edit: true,
							PERC_MBO5: "",
							GateInTable: false
						};
						data.push(oEntry);
						this.getView().byId("idTableCreatePiste").getModel("PisteModel").setProperty("/sottopiste", data);
					}
				}
			}

			//MV05022021 - init - Gestione Visible & Enabled Rifatta da 0.

			//Risetto tutti visibili e modificabili
			this.ResetVisibleField();

			//Casistiche Per HR Admin & PCO 
			var HrAdmin = sap.ui.getCore().getModel("EmpAuthoModel").getData()[0].ROLE_HR_ADMIN;
			var PCO = sap.ui.getCore().getModel("EmpAuthoModel").getData()[0].ROLE_PCO;

			if (data1.SN_BLOCCATA === 'S') {
				this.fcBloccata();
			} else if (data1.SN_PERSONALIZZABILE === "S") {
				this.fcPersSI();
			} else if (HrAdmin === 'X' && data1.SN_PERSONALIZZABILE === "N" && data1.ID_PISTA_MADRE === 0) {
				this.fcHRadminPersNOMadreSI();
			} else if (PCO === 'X' && data1.SN_PERSONALIZZABILE === "N" && data1.ID_PISTA_MADRE === 0) {
				this.fcPCOPersNOMadreSI();
			} else if (data1.SN_PERSONALIZZABILE === "N" && data1.ID_PISTA_MADRE !== 0) {
				this.fcPersNOMadreNO();
			} else { //se non entra nelle casistiche recedenti tt in visualizzazione
				this.fcBlocca();
			}
			//MV05022021 - end - Gestione Visible & Enabled Rifatta da 0.

			// function which have logic to check validation in in modify page
			// this.modifyValidation(data1);
		},
		fcPersNOMadreNO: function () {

			this.getView().byId("desc").setEnabled(false); //Descrizione
			this.getView().byId("MI").setEnabled(false); //Mese inizio
			this.getView().byId("MI1").setEnabled(false); //Mese fine
			this.getView().byId("MI3").setEnabled(false); //Gruppo pista 
			this.getView().byId("Pers").setEnabled(false); //Pers
			this.getView().byId("Mul1").setEnabled(false); //Moltiplicatore 1
			this.getView().byId("Mul2").setEnabled(false); //Moltiplicatore 2

			this.getView().byId("inpResultato").setEnabled(false); //Risultato
			this.getView().byId("inpRisultatoSimulato").setEnabled(false); //Risultato Simulato
			this.getView().byId("inpResultato1").setEnabled(false); //Risultato
			this.getView().byId("inpRisultatoSimulato1").setEnabled(false); //Risultato Simulato

			this.getView().byId("tglCaricamentoobiettivoconsuntivo").setVisible(true);

			var table = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getData().sottopiste;
			for (var i = 0; i < table.length; i++) {
				table[i].oTest1 = false; //Peso
				table[i].ID_CURVA_EDIT = false; //Curve
				table[i].GateInTable = false; // Moltiplicatore
				table[i].DESCR_SOTTOPISTA_EDIT = false;
				table[i].ObiettivoEnable = true; //Obbiettivo Visibile
				table[i].Obiettivo_edit = true; //Obbiettivo Modificabile
				table[i].ConsuntivoEnable = true; //Consuntivo Visibile
				table[i].Consuntivo_edit = true; //Consuntivo Modificabile 
				table[i].QuantityEnabled = false; //Quantità
				table[i].ObiettivoSimulatoEnable = true; //Obbiettivo Visibile
				table[i].ObiettivoSimulato_edit = true; //Obbiettivo Modificabile
				table[i].ConsuntivoSimulatoEnable = true; //Consuntivo Visibile
				table[i].ConsuntivoSimulato_edit = true; //Consuntivo Modificabile 
				table[i].oButton1 = false; //Add
				table[i].oButton2 = false; //Add
				if (i === 0) {
					table[i].PESO_PERC = '100'; //Peso Set prima riga a 100 
					table[i].oButton2 = false; //minus visible
					table[i].GateInTable = false; // Moltiplicatore
				}
			}
			this.getView().byId("idTableCreatePiste").getModel("PisteModel").refresh(true);

			this.getView().byId("ObiettivoNote").setEnabled(true);
			this.getView().byId("ConsuntivoNote").setEnabled(true);
			this.getView().byId("SchedaNote").setEnabled(true);
			this.getView().byId("ObiettivoNote").setVisible(true);
			this.getView().byId("ConsuntivoNote").setVisible(true);
			this.getView().byId("SchedaNote").setVisible(true);

			this.getView().byId("txtError").setVisible(false);
		},
		fcPCOPersNOMadreSI: function () {

			this.getView().byId("desc").setEnabled(false); //Descrizione
			this.getView().byId("MI").setEnabled(false); //Mese inizio
			this.getView().byId("MI1").setEnabled(false); //Mese fine
			this.getView().byId("MI3").setEnabled(false); //Gruppo pista 
			this.getView().byId("Pers").setEnabled(false); //Pers
			this.getView().byId("Mul1").setEnabled(false); //Moltiplicatore 1
			this.getView().byId("Mul2").setEnabled(false); //Moltiplicatore 2

			this.getView().byId("inpResultato").setEnabled(false); //Risultato
			this.getView().byId("inpRisultatoSimulato").setEnabled(false); //Risultato Simulato
			this.getView().byId("inpResultato1").setEnabled(false); //Risultato
			this.getView().byId("inpRisultatoSimulato1").setEnabled(false); //Risultato Simulato

			this.getView().byId("tglCaricamentoobiettivoconsuntivo").setVisible(true);

			var table = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getData().sottopiste;
			for (var i = 0; i < table.length; i++) {
				table[i].oTest1 = false; //Peso
				table[i].ID_CURVA_EDIT = false; //Curve
				table[i].GateInTable = false; // Moltiplicatore
				table[i].DESCR_SOTTOPISTA_EDIT = false;
				table[i].ObiettivoEnable = true; //Obbiettivo Visibile
				table[i].Obiettivo_edit = true; //Obbiettivo Modificabile
				table[i].ConsuntivoEnable = true; //Consuntivo Visibile
				table[i].Consuntivo_edit = true; //Consuntivo Modificabile 
				table[i].QuantityEnabled = false; //Quantità
				table[i].ObiettivoSimulatoEnable = true; //Obbiettivo Visibile
				table[i].ObiettivoSimulato_edit = true; //Obbiettivo Modificabile
				table[i].ConsuntivoSimulatoEnable = true; //Consuntivo Visibile
				table[i].ConsuntivoSimulato_edit = true; //Consuntivo Modificabile 
				table[i].oButton1 = false; //Add
				table[i].oButton2 = false; //Add
				if (i === 0) {
					table[i].PESO_PERC = '100'; //Peso Set prima riga a 100 
					table[i].oButton2 = false; //minus visible
					table[i].GateInTable = false; // Moltiplicatore
				}
			}
			this.getView().byId("idTableCreatePiste").getModel("PisteModel").refresh(true);

			this.getView().byId("ObiettivoNote").setEnabled(true);
			this.getView().byId("ConsuntivoNote").setEnabled(true);
			this.getView().byId("SchedaNote").setEnabled(true);
			this.getView().byId("ObiettivoNote").setVisible(true);
			this.getView().byId("ConsuntivoNote").setVisible(true);
			this.getView().byId("SchedaNote").setVisible(true);

			this.getView().byId("txtError").setVisible(false);
		},

		fcHRadminPersNOMadreSI: function () {

			this.getView().byId("desc").setEnabled(true); //Descrizione
			this.getView().byId("MI").setEnabled(true); //Mese inizio
			this.getView().byId("MI1").setEnabled(true); //Mese fine
			this.getView().byId("MI3").setEnabled(true); //Gruppo pista 
			this.getView().byId("Pers").setEnabled(false); //Pers
			this.getView().byId("Mul1").setEnabled(true); //Moltiplicatore 1
			this.getView().byId("Mul2").setEnabled(true); //Moltiplicatore 2

			this.getView().byId("inpResultato").setEnabled(true); //Risultato
			this.getView().byId("inpRisultatoSimulato").setEnabled(true); //Risultato Simulato
			this.getView().byId("inpResultato1").setEnabled(true); //Risultato
			this.getView().byId("inpRisultatoSimulato1").setEnabled(true); //Risultato Simulato

			this.getView().byId("tglCaricamentoobiettivoconsuntivo").setVisible(true);

			var table = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getData().sottopiste;
			for (var i = 0; i < table.length; i++) {
				table[i].oTest1 = true; //Peso
				table[i].ID_CURVA_EDIT = true; //Curve
				table[i].GateInTable = true; // Moltiplicatore
				table[i].DESCR_SOTTOPISTA_EDIT = true;
				table[i].ObiettivoEnable = true; //Obbiettivo Visibile
				table[i].Obiettivo_edit = true; //Obbiettivo Modificabile
				table[i].ConsuntivoEnable = true; //Consuntivo Visibile
				table[i].Consuntivo_edit = true; //Consuntivo Modificabile 
				table[i].QuantityEnabled = true; //Quantità
				table[i].ObiettivoSimulatoEnable = true; //Obbiettivo Visibile
				table[i].ObiettivoSimulato_edit = true; //Obbiettivo Modificabile
				table[i].ConsuntivoSimulatoEnable = true; //Consuntivo Visibile
				table[i].ConsuntivoSimulato_edit = true; //Consuntivo Modificabile 
				table[i].oButton1 = true; //Add
				table[i].oButton2 = true; //Add
				if (i === 0) {
					table[i].PESO_PERC = '100'; //Peso Set prima riga a 100 
					table[i].oTest1 = false; //Peso
					table[i].oButton2 = false; //minus visible
					table[i].GateInTable = false; // Moltiplicatore
				}
			}
			this.getView().byId("idTableCreatePiste").getModel("PisteModel").refresh(true);

			this.getView().byId("ObiettivoNote").setEnabled(true);
			this.getView().byId("ConsuntivoNote").setEnabled(true);
			this.getView().byId("SchedaNote").setEnabled(true);
			this.getView().byId("ObiettivoNote").setVisible(true);
			this.getView().byId("ConsuntivoNote").setVisible(true);
			this.getView().byId("SchedaNote").setVisible(true);

			this.getView().byId("txtError").setVisible(false);
		},

		fcPersSI: function () {

			this.getView().byId("desc").setEnabled(true); //Descrizione
			this.getView().byId("MI").setEnabled(true); //Mese inizio
			this.getView().byId("MI1").setEnabled(true); //Mese fine
			this.getView().byId("MI3").setEnabled(true); //Gruppo pista 
			this.getView().byId("Pers").setEnabled(false); //Pers
			this.getView().byId("Mul1").setEnabled(true); //Moltiplicatore 1
			this.getView().byId("Mul2").setEnabled(true); //Moltiplicatore 2

			this.getView().byId("inpResultato").setEnabled(true); //Risultato
			this.getView().byId("inpRisultatoSimulato").setEnabled(true); //Risultato Simulato
			this.getView().byId("inpResultato1").setEnabled(true); //Risultato
			this.getView().byId("inpRisultatoSimulato1").setEnabled(true); //Risultato Simulato

			this.getView().byId("tglCaricamentoobiettivoconsuntivo").setVisible(false);

			var table = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getData().sottopiste;
			for (var i = 0; i < table.length; i++) {
				table[i].oTest1 = true; //Peso
				table[i].ID_CURVA_EDIT = true; //Curve
				table[i].GateInTable = true; // Moltiplicatore
				table[i].DESCR_SOTTOPISTA_EDIT = true;
				table[i].ObiettivoEnable = true; //Obbiettivo Visibile
				table[i].Obiettivo_edit = false; //Obbiettivo Modificabile
				table[i].ConsuntivoEnable = true; //Consuntivo Visibile
				table[i].Consuntivo_edit = false; //Consuntivo Modificabile 
				table[i].QuantityEnabled = false; //Quantità
				table[i].ObiettivoSimulatoEnable = true; //Obbiettivo Visibile
				table[i].ObiettivoSimulato_edit = false; //Obbiettivo Modificabile
				table[i].ConsuntivoSimulatoEnable = true; //Consuntivo Visibile
				table[i].ConsuntivoSimulato_edit = false; //Consuntivo Modificabile 
				table[i].oButton1 = true; //Add
				table[i].oButton2 = true; //Add
				if (i === 0) {
					table[i].PESO_PERC = '100'; //Peso Set prima riga a 100 
					table[i].oTest1 = false; //Peso
					table[i].oButton2 = false; //minus visible
					table[i].GateInTable = false; // Moltiplicatore
				}
			}
			this.getView().byId("idTableCreatePiste").getModel("PisteModel").refresh(true);

			this.getView().byId("ObiettivoNote").setEnabled(false);
			this.getView().byId("ConsuntivoNote").setEnabled(false);
			this.getView().byId("SchedaNote").setEnabled(false);
			this.getView().byId("ObiettivoNote").setVisible(true);
			this.getView().byId("ConsuntivoNote").setVisible(true);
			this.getView().byId("SchedaNote").setVisible(true);

			this.getView().byId("txtError").setVisible(false);
		},
		fcBloccata: function () {

			this.getView().byId("desc").setEnabled(false); //Descrizione
			this.getView().byId("MI").setEnabled(false); //Mese inizio
			this.getView().byId("MI1").setEnabled(false); //Mese fine
			this.getView().byId("MI3").setEnabled(false); //Gruppo pista 
			this.getView().byId("Pers").setEnabled(false); //Pers
			this.getView().byId("Mul1").setEnabled(false); //Moltiplicatore 1
			this.getView().byId("Mul2").setEnabled(false); //Moltiplicatore 2

			this.getView().byId("inpResultato").setEnabled(false); //Risultato
			this.getView().byId("inpRisultatoSimulato").setEnabled(false); //Risultato Simulato
			this.getView().byId("inpResultato1").setEnabled(false); //Risultato
			this.getView().byId("inpRisultatoSimulato1").setEnabled(false); //Risultato Simulato

			this.getView().byId("tglCaricamentoobiettivoconsuntivo").setVisible(true);

			var table = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getData().sottopiste;
			for (var i = 0; i < table.length; i++) {
				table[i].oTest1 = false; //Peso
				table[i].ID_CURVA_EDIT = false; //Curve
				table[i].GateInTable = false; // Moltiplicatore
				table[i].DESCR_SOTTOPISTA_EDIT = false; //Descrizione
				table[i].ObiettivoEnable = true; //Obbiettivo Visibile
				table[i].Obiettivo_edit = false; //Obbiettivo Modificabile
				table[i].ConsuntivoEnable = true; //Consuntivo Visibile
				table[i].Consuntivo_edit = false; //Consuntivo Modificabile 
				table[i].QuantityEnabled = false; //Quantità
				table[i].ObiettivoSimulatoEnable = true; //Obbiettivo Visibile
				table[i].ObiettivoSimulato_edit = true; //Obbiettivo Modificabile
				table[i].ConsuntivoSimulatoEnable = true; //Consuntivo Visibile
				table[i].ConsuntivoSimulato_edit = true; //Consuntivo Modificabile 
				table[i].oButton1 = false; //Add
				table[i].oButton2 = false; //minus

			}
			this.getView().byId("idTableCreatePiste").getModel("PisteModel").refresh(true);

			this.getView().byId("ObiettivoNote").setEnabled(false);
			this.getView().byId("ConsuntivoNote").setEnabled(false);
			this.getView().byId("SchedaNote").setEnabled(false);
			this.getView().byId("ObiettivoNote").setVisible(true);
			this.getView().byId("ConsuntivoNote").setVisible(true);
			this.getView().byId("SchedaNote").setVisible(true);

			this.getView().byId("txtError").setVisible(true);
			this.getView().byId("txtError").setText(oResource.getText("messageInformation2"));

		},
		fcBlocca: function () {

			this.getView().byId("desc").setEnabled(false); //Descrizione
			this.getView().byId("MI").setEnabled(false); //Mese inizio
			this.getView().byId("MI1").setEnabled(false); //Mese fine
			this.getView().byId("MI3").setEnabled(false); //Gruppo pista 
			this.getView().byId("Pers").setEnabled(false); //Pers
			this.getView().byId("Mul1").setEnabled(false); //Moltiplicatore 1
			this.getView().byId("Mul2").setEnabled(false); //Moltiplicatore 2

			this.getView().byId("inpResultato").setEnabled(false); //Risultato
			this.getView().byId("inpRisultatoSimulato").setEnabled(false); //Risultato Simulato
			this.getView().byId("inpResultato1").setEnabled(false); //Risultato
			this.getView().byId("inpRisultatoSimulato1").setEnabled(false); //Risultato Simulato

			this.getView().byId("tglCaricamentoobiettivoconsuntivo").setVisible(true);

			var table = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getData().sottopiste;
			for (var i = 0; i < table.length; i++) {
				table[i].oTest1 = false; //Peso
				table[i].ID_CURVA_EDIT = false; //Curve
				table[i].GateInTable = false; // Moltiplicatore
				table[i].DESCR_SOTTOPISTA_EDIT = false; //Descrizione
				table[i].ObiettivoEnable = true; //Obbiettivo Visibile
				table[i].Obiettivo_edit = false; //Obbiettivo Modificabile
				table[i].ConsuntivoEnable = true; //Consuntivo Visibile
				table[i].Consuntivo_edit = false; //Consuntivo Modificabile 
				table[i].QuantityEnabled = false; //Quantità
				table[i].ObiettivoSimulatoEnable = true; //Obbiettivo Visibile
				table[i].ObiettivoSimulato_edit = true; //Obbiettivo Modificabile
				table[i].ConsuntivoSimulatoEnable = true; //Consuntivo Visibile
				table[i].ConsuntivoSimulato_edit = true; //Consuntivo Modificabile 
				table[i].oButton1 = false; //Add
				table[i].oButton2 = false; //minus

			}
			this.getView().byId("idTableCreatePiste").getModel("PisteModel").refresh(true);

			this.getView().byId("ObiettivoNote").setEnabled(false);
			this.getView().byId("ConsuntivoNote").setEnabled(false);
			this.getView().byId("SchedaNote").setEnabled(false);
			this.getView().byId("ObiettivoNote").setVisible(true);
			this.getView().byId("ConsuntivoNote").setVisible(true);
			this.getView().byId("SchedaNote").setVisible(true);

			this.getView().byId("txtError").setVisible(false);

		},
		ResetVisibleField: function () {

			this.getView().byId("desc").setEnabled(true); //Descrizione
			this.getView().byId("MI").setEnabled(true); //Mese inizio
			this.getView().byId("MI1").setEnabled(true); //Mese fine
			this.getView().byId("MI3").setEnabled(true); //Gruppo pista 
			this.getView().byId("Pers").setEnabled(false); //Pers
			this.getView().byId("Mul1").setEnabled(true); //Moltiplicatore 1
			this.getView().byId("Mul2").setEnabled(true); //Moltiplicatore 2

			this.getView().byId("inpResultato").setEnabled(true); //Risultato
			this.getView().byId("inpRisultatoSimulato").setEnabled(true); //Risultato Simulato
			this.getView().byId("inpResultato1").setEnabled(true); //Risultato
			this.getView().byId("inpRisultatoSimulato1").setEnabled(true); //Risultato Simulato

			this.getView().byId("tglCaricamentoobiettivoconsuntivo").setVisible(true);

			var table = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getData().sottopiste;
			for (var i = 0; i < table.length; i++) {
				table[i].oTest1 = true; //Peso
				table[i].ID_CURVA_EDIT = true; //Curve
				table[i].GateInTable = true; // Moltiplicatore
				table[i].DESCR_SOTTOPISTA_EDIT = true;
				table[i].ObiettivoEnable = true; //Obbiettivo Visibile
				table[i].Obiettivo_edit = true; //Obbiettivo Modificabile
				table[i].ConsuntivoEnable = true; //Consuntivo Visibile
				table[i].Consuntivo_edit = true; //Consuntivo Modificabile 
				table[i].QuantityEnabled = true; //Quantità
				table[i].ObiettivoSimulatoEnable = true; //Obbiettivo Visibile
				table[i].ObiettivoSimulato_edit = true; //Obbiettivo Modificabile
				table[i].ConsuntivoSimulatoEnable = true; //Consuntivo Visibile
				table[i].ConsuntivoSimulato_edit = true; //Consuntivo Modificabile 
				table[i].oButton1 = true; //Add
				if (i === 0) {
					table[i].oButton2 = false; //minus visible
					table[i].GateInTable = false; // Moltiplicatore
				}
			}
			this.getView().byId("idTableCreatePiste").getModel("PisteModel").refresh(true);

			this.getView().byId("ObiettivoNote").setEnabled(true);
			this.getView().byId("ConsuntivoNote").setEnabled(true);
			this.getView().byId("SchedaNote").setEnabled(true);
			this.getView().byId("ObiettivoNote").setVisible(true);
			this.getView().byId("ConsuntivoNote").setVisible(true);
			this.getView().byId("SchedaNote").setVisible(true);

			this.getView().byId("txtError").setVisible(false);
		},

		modifyValidation: function (data1) {
			// Controlling enabling on the basis of the logic written in the document 
			//  SN_Personalizzabile = ‘S’ and Id_pista_madre is null or 0 
			//  It’s not possibly change the status SN_Personalizzabile,, it is in write mode only in the creation screen. it is in read mode in the modify screen. 

			if (data1.SN_PERSONALIZZABILE === "S" && data1.ID_PISTA_MADRE === 0) {
				this.getView().byId("Pers").setEnabled(false);
			}

			// Controlling enabling on the basis of the logic written in the document 
			//  SN_Personalizzabile = ‘N’ and Id_pista_madre is null or 0 
			//  It’s not possibly change the status SN_Personalizzabile,, it is in write mode only in the creation screen. it is in read mode in the modify screen. 

			if (data1.SN_PERSONALIZZABILE === "N" && data1.ID_PISTA_MADRE === 0) {
				this.getView().byId("Pers").setEnabled(false);
			}

			// Controlling enabling on the basis of the logic written in the document 
			//  SN_Personalizzabile = ‘S’ and Id_pista_madre is null or 0 
			//  we will hide: Curva descrittiva section, sottopista table field ( Obiettivo, Consuntivo, % Obiettivo Simulato, % Consuntivo Simulato), Note section 

			if (data1.SN_PERSONALIZZABILE === "S" && (data1.ID_PISTA_MADRE === 0)) {
				this.getView().byId("tblEnalbeOnFirstRowPress").setVisible(false);
				this.getView().byId("tglCaricamentoobiettivoconsuntivo").setVisible(false);
				this.getView().byId("tblNote1").setVisible(false);
				this.getView().byId("tblNote2").setVisible(false);
				this.getView().byId("ObiettivoNote").setVisible(false);
				this.getView().byId("ConsuntivoNote").setVisible(false);
				this.getView().byId("SchedaNote").setVisible(false);
			}

			// Controlling enabling on the basis of the logic written in the document 
			//  SN_Personalizzabile = ‘N’ and Id_pista_madre is null or 0
			//  we will hide: Curva descrittiva section, sottopista table field ( Obiettivo, Consuntivo, % Obiettivo Simulato, % Consuntivo Simulato), Note section 
			if (data1.SN_PERSONALIZZABILE === "N" && (data1.ID_PISTA_MADRE === 0)) {

				this.getView().byId("tblEnalbeOnFirstRowPress").setVisible(false);
				this.getView().byId("tglCaricamentoobiettivoconsuntivo").setVisible(false);
				this.getView().byId("tblNote1").setVisible(false);
				this.getView().byId("tblNote2").setVisible(false);
				this.getView().byId("ObiettivoNote").setVisible(false);
				this.getView().byId("ConsuntivoNote").setVisible(false);
				this.getView().byId("SchedaNote").setVisible(false);
			}
			// Controlling enabling on the basis of the logic written in the document 
			//  SN_Personalizzabile = ‘N’ and Id_pista_madre is not eq 0
			//  we will hide: Curva descrittiva section, sottopista table field ( Obiettivo, Consuntivo, % Obiettivo Simulato, % Consuntivo Simulato), Note section 
			if (data1.SN_PERSONALIZZABILE === "N" && (data1.ID_PISTA_MADRE !== 0)) {
				this.getView().byId("tblEnalbeOnFirstRowPress").setVisible(true);
				this.getView().byId("tglCaricamentoobiettivoconsuntivo").setVisible(true);
				this.getView().byId("tblNote1").setVisible(true);
				this.getView().byId("tblNote2").setVisible(true);
				this.getView().byId("ObiettivoNote").setVisible(true);
				this.getView().byId("ConsuntivoNote").setVisible(true);
				this.getView().byId("SchedaNote").setVisible(true);
			}
			var data = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");
			for (var i = 0; i < data.length; i++) {

				// Controlling enabling on the basis of the logic written in the document 
				//  SN_Personalizzabile = ‘S’ and Id_pista_madre is null or 0 
				//  we will hide: Curva descrittiva section, sottopista table field ( Obiettivo, Consuntivo, % Obiettivo Simulato, % Consuntivo Simulato), Note section 

				if (data1.SN_PERSONALIZZABILE === "S" && (data1.ID_PISTA_MADRE === 0)) {
					data[i].ObiettivoEnable = false;
					data[i].ConsuntivoEnable = false;
					data[i].ConsuntivoSimulatoEnable = false;
					data[i].ObiettivoSimulatoEnable = false;
				}
				if (data1.SN_PERSONALIZZABILE === "N" && (data1.ID_PISTA_MADRE === 0)) {
					// Controlling enabling on the basis of the logic written in the document 
					//  SN_Personalizzabile = ‘N’ and Id_pista_madre is null or 0
					//  we will hide: Curva descrittiva section, sottopista table field ( Obiettivo, Consuntivo, % Obiettivo Simulato, % Consuntivo Simulato), Note section 
					data[i].ObiettivoEnable = true;
					data[i].ConsuntivoEnable = true;
					data[i].ConsuntivoSimulatoEnable = true;
					data[i].ObiettivoSimulatoEnable = true;
					data[i].oButton1 = false;
					data[i].oButton2 = false;
				}
				if (data1.SN_PERSONALIZZABILE === "N" && (data1.ID_PISTA_MADRE !== 0)) {
					// Controlling enabling on the basis of the logic written in the document 
					//  SN_Personalizzabile = ‘N’ and Id_pista_madre is not null or <> 0
					//  we will hide the sottopiste button “+” and “-“
					//We can edit:: Curva descrittiva section, sottopista table field ( Obiettivo, Consuntivo, % Obiettivo Simulato, % Consuntivo Simulato), Note section.

					data[i].ObiettivoEnable = true;
					data[i].ConsuntivoEnable = true;
					data[i].ConsuntivoSimulatoEnable = true;
					data[i].ObiettivoSimulatoEnable = true;
					data[i].oButton1 = false;
					data[i].oButton2 = false;
				}

			}
			this.getView().byId("idTableCreatePiste").getModel("PisteModel").setProperty("/sottopiste", data);

			// Blocca congela feature for the modify view
			// check Pista.SN_Bloccata is equal to “S” and SN_Personalizzabile = ‘S’ and Id_pista_madre is null or eq 0 
			// then All the fields are in read only

			if (data1.SN_BLOCCATA === 'S') {
				if (data1.SN_PERSONALIZZABILE === "S" && (data1.ID_PISTA_MADRE === 0)) {
					this.getView().byId("MI").setEnabled(false);
					this.getView().byId("MI1").setEnabled(false);
					this.getView().byId("MI3").setEnabled(false);
					this.getView().byId("Mul1").setEnabled(false);
					this.getView().byId("Mul2").setEnabled(false);
					this.getView().byId("Additivo").setEnabled(false);
					this.getView().byId("Soglia").setEnabled(false);
					this.getView().byId("curva2").setEnabled(false);
					this.getView().byId("ObiettivoComplessivo").setEnabled(false);
					this.getView().byId("ConsuntivoComplessivo").setEnabled(false);
					this.getView().byId("tblNote1").setVisible(false);
					this.getView().byId("tblNote2").setVisible(false);
					this.getView().byId("ObiettivoNote").setEnabled(false);
					this.getView().byId("ConsuntivoNote").setEnabled(false);
					this.getView().byId("SchedaNote").setEnabled(false);
					this.getView().byId("inpResultato").setEnabled(false);
					this.getView().byId("inpRisultatoSimulato").setEnabled(false);
					this.getView().byId("inpResultato1").setEnabled(false);
					this.getView().byId("inpRisultatoSimulato1").setEnabled(false);
					this.getView().byId("Pers").setEnabled(false);
					this.getView().byId("button1").setEnabled(false);
				}

				var data = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");
				for (var i = 0; i < data.length; i++) {

					// Controlling enabling on the basis of the logic written in the document 
					//  SN_Personalizzabile = ‘S’ and Id_pista_madre is null or 0 
					//  we will hide: Curva descrittiva section, sottopista table field ( Obiettivo, Consuntivo, % Obiettivo Simulato, % Consuntivo Simulato), Note section 

					if (data1.SN_PERSONALIZZABILE === "S" && (data1.ID_PISTA_MADRE === 0)) {
						data[i].ObiettivoEnable = false;
						data[i].ConsuntivoEnable = false;
						data[i].ConsuntivoSimulatoEnable = false;
						data[i].ObiettivoSimulatoEnable = false;
						data[i].ID_CURVA_EDIT = false;
						data[i].DESCR_SOTTOPISTA_EDIT = false;
						data[i].Obiettivo_edit = false;
						data[i].Consuntivo_edit = false;
						data[i].ConsuntivoSimulato_edit = false;
						data[i].ObiettivoSimulato_edit = false;
						data[i].oButton1 = false;
						data[i].oButton2 = false;
						this.getView().byId("txtError").setVisible(false);
						this.getView().byId("txtError").setText("");
					}
					if (data1.SN_PERSONALIZZABILE === "N" && (data1.ID_PISTA_MADRE === 0)) {
						// Controlling enabling on the basis of the logic written in the document 
						//  SN_Personalizzabile = ‘N’ and Id_pista_madre is null or 0
						//  we will hide: Curva descrittiva section, sottopista table field ( Obiettivo, Consuntivo, % Obiettivo Simulato, % Consuntivo Simulato), Note section 
						data[i].ObiettivoEnable = false;
						data[i].ConsuntivoEnable = false;
						data[i].ConsuntivoSimulatoEnable = true;
						data[i].ObiettivoSimulatoEnable = true;
						data[i].ID_CURVA_EDIT = false;
						data[i].DESCR_SOTTOPISTA_EDIT = false;
						data[i].Obiettivo_edit = false;
						data[i].Consuntivo_edit = false;
						data[i].ConsuntivoSimulato_edit = true;
						data[i].ObiettivoSimulato_edit = true;
						data[i].oButton1 = false;
						data[i].oButton2 = false;
						this.getView().byId("txtError").setVisible(true);
						this.getView().byId("txtError").setText(oResource.getText("messageInformation2"));
					}
					if (data1.SN_PERSONALIZZABILE === "N" && (data1.ID_PISTA_MADRE !== 0)) {
						// Controlling enabling on the basis of the logic written in the document 
						//  SN_Personalizzabile = ‘N’ and Id_pista_madre is not null or <> 0
						//  we will hide the sottopiste button “+” and “-“
						//We can edit:: Curva descrittiva section, sottopista table field ( Obiettivo, Consuntivo, % Obiettivo Simulato, % Consuntivo Simulato), Note section.

						data[i].ObiettivoEnable = false;
						data[i].ConsuntivoEnable = false;
						data[i].ConsuntivoSimulatoEnable = true;
						data[i].ObiettivoSimulatoEnable = true;
						data[i].ID_CURVA_EDIT = false;
						data[i].DESCR_SOTTOPISTA_EDIT = false;
						data[i].Obiettivo_edit = false;
						data[i].Consuntivo_edit = false;
						data[i].ConsuntivoSimulato_edit = true;
						data[i].ObiettivoSimulato_edit = true;
						data[i].oButton1 = false;
						data[i].oButton2 = false;
						this.getView().byId("txtError").setVisible(true);
						this.getView().byId("txtError").setText(oResource.getText("messageInformation2"));
					}

				}
				this.getView().byId("idTableCreatePiste").getModel("PisteModel").setProperty("/sottopiste", data);

			}
			if (data1.SN_CONGELATA === 'S') {

				if (data1.SN_PERSONALIZZABILE === "S" && (data1.ID_PISTA_MADRE === 0)) {
					this.getView().byId("MI").setEnabled(false);
					this.getView().byId("MI1").setEnabled(false);
					this.getView().byId("MI3").setEnabled(false);
					this.getView().byId("Mul1").setEnabled(false);
					this.getView().byId("Mul2").setEnabled(false);
					this.getView().byId("Additivo").setEnabled(false);
					this.getView().byId("Soglia").setEnabled(false);
					this.getView().byId("curva2").setEnabled(false);
					this.getView().byId("ObiettivoComplessivo").setEnabled(false);
					this.getView().byId("ConsuntivoComplessivo").setEnabled(false);
					this.getView().byId("tblNote1").setVisible(false);
					this.getView().byId("tblNote2").setVisible(false);
					this.getView().byId("ObiettivoNote").setEnabled(false);
					this.getView().byId("ConsuntivoNote").setEnabled(false);
					this.getView().byId("SchedaNote").setEnabled(false);
					this.getView().byId("inpResultato").setEnabled(false);
					this.getView().byId("inpRisultatoSimulato").setEnabled(false);
					this.getView().byId("inpResultato1").setEnabled(false);
					this.getView().byId("inpRisultatoSimulato1").setEnabled(false);
					this.getView().byId("Pers").setEnabled(false);
					this.getView().byId("button1").setEnabled(false);
					this.getView().byId("txtError").setVisible(false);
					this.getView().byId("txtError").setText("");
				}
				if (data1.SN_PERSONALIZZABILE === "N" && (data1.ID_PISTA_MADRE !== 0)) {
					this.getView().byId("tblEnalbeOnFirstRowPress").setVisible(true);
					this.getView().byId("tglCaricamentoobiettivoconsuntivo").setVisible(true);
					this.getView().byId("ObiettivoNote").setVisible(true);
					this.getView().byId("tblNote1").setVisible(true);
					this.getView().byId("tblNote2").setVisible(true);
					this.getView().byId("ConsuntivoNote").setVisible(true);
					this.getView().byId("SchedaNote").setVisible(true);
					this.getView().byId("txtError").setVisible(true);
					this.getView().byId("txtError").setText(oResource.getText("messageInformation3"));
				}
				if (data1.SN_PERSONALIZZABILE === "N" && (data1.ID_PISTA_MADRE === 0)) {
					this.getView().byId("tblEnalbeOnFirstRowPress").setVisible(true);
					this.getView().byId("tglCaricamentoobiettivoconsuntivo").setVisible(true);
					this.getView().byId("tblNote1").setVisible(true);
					this.getView().byId("tblNote2").setVisible(true);
					this.getView().byId("ObiettivoNote").setVisible(true);
					this.getView().byId("ConsuntivoNote").setVisible(true);
					this.getView().byId("SchedaNote").setVisible(true);
					this.getView().byId("txtError").setVisible(true);
					this.getView().byId("txtError").setText(oResource.getText("messageInformation3"));
				}

				var data = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");
				for (var i = 0; i < data.length; i++) {

					// Controlling enabling on the basis of the logic written in the document 
					//  SN_Personalizzabile = ‘S’ and Id_pista_madre is null or 0 
					//  we will hide: Curva descrittiva section, sottopista table field ( Obiettivo, Consuntivo, % Obiettivo Simulato, % Consuntivo Simulato), Note section 

					if (data1.SN_PERSONALIZZABILE === "S" && (data1.ID_PISTA_MADRE === 0)) {
						data[i].ObiettivoEnable = false;
						data[i].ConsuntivoEnable = false;
						data[i].ConsuntivoSimulatoEnable = false;
						data[i].ObiettivoSimulatoEnable = false;
						data[i].ID_CURVA_EDIT = false;
						data[i].DESCR_SOTTOPISTA_EDIT = false;
						data[i].Obiettivo_edit = false;
						data[i].Consuntivo_edit = false;
						data[i].ConsuntivoSimulato_edit = false;
						data[i].ObiettivoSimulato_edit = false;
						data[i].oButton1 = false;
						data[i].oButton2 = false;

					}
					if (data1.SN_PERSONALIZZABILE === "N" && (data1.ID_PISTA_MADRE === 0)) {
						// Controlling enabling on the basis of the logic written in the document 
						//  SN_Personalizzabile = ‘N’ and Id_pista_madre is null or 0
						//  we will hide: Curva descrittiva section, sottopista table field ( Obiettivo, Consuntivo, % Obiettivo Simulato, % Consuntivo Simulato), Note section 
						data[i].ObiettivoEnable = true;
						data[i].ConsuntivoEnable = true;
						data[i].ConsuntivoSimulatoEnable = true;
						data[i].ObiettivoSimulatoEnable = true;
						data[i].ID_CURVA_EDIT = false;
						data[i].DESCR_SOTTOPISTA_EDIT = false;
						data[i].Obiettivo_edit = true;
						data[i].Consuntivo_edit = true;
						data[i].ConsuntivoSimulato_edit = true;
						data[i].ObiettivoSimulato_edit = true;
						data[i].oButton1 = false;
						data[i].oButton2 = false;

					}
					if (data1.SN_PERSONALIZZABILE === "N" && (data1.ID_PISTA_MADRE !== 0)) {
						// Controlling enabling on the basis of the logic written in the document 
						//  SN_Personalizzabile = ‘N’ and Id_pista_madre is not null or <> 0
						//  we will hide the sottopiste button “+” and “-“
						//We can edit:: Curva descrittiva section, sottopista table field ( Obiettivo, Consuntivo, % Obiettivo Simulato, % Consuntivo Simulato), Note section.

						data[i].ObiettivoEnable = true;
						data[i].ConsuntivoEnable = true;
						data[i].ConsuntivoSimulatoEnable = true;
						data[i].ObiettivoSimulatoEnable = true;
						data[i].ID_CURVA_EDIT = false;
						data[i].DESCR_SOTTOPISTA_EDIT = false;
						data[i].Obiettivo_edit = true;
						data[i].Consuntivo_edit = true;
						data[i].ConsuntivoSimulato_edit = true;
						data[i].ObiettivoSimulato_edit = true;
						data[i].oButton1 = false;
						data[i].oButton2 = false;

					}

				}
				this.getView().byId("idTableCreatePiste").getModel("PisteModel").setProperty("/sottopiste", data);

			}

		},
		onHomePage: function (oEvent) {
			this.busyDialog.open();
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/PisteChange", true);
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
			this.busyDialog.close();
		},
		handleBack: function (oEvent) {
			this.busyDialog.open();
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/PisteChange", false);
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
			this.busyDialog.close();
		},
		getCurva: function () {
			var that = this;
			var oFilters = [];
			if (that.selectedfiscalYearPeriodi != undefined && that.selectedfiscalYearPeriodi != "") {
				var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, that.selectedfiscalYearPeriodi);
				oFilters.push(filter1);
			}
			var mParameters = {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					var ogetCurvaModel = new sap.ui.model.json.JSONModel();
					var arrayCurva = [];
					var oEntry = {

						ID_CURVA: "",
						ID_PERIODO: "",
						DESCR_CURVA: "",
						ID_TIPO_CURVA: "",
						SN_GATE: ""
					};
					arrayCurva.push(oEntry);
					oEntry = {};
					for (var i = 0; i < oResponse.data.results.length; i++) {
						oEntry.ID_CURVA = oResponse.data.results[i].ID_CURVA;
						oEntry.DESCR_CURVA = oResponse.data.results[i].DESCR_CURVA;
						oEntry.ID_PERIODO = oResponse.data.results[i].ID_PERIODO;
						oEntry.ID_TIPO_CURVA = oResponse.data.results[i].ID_TIPO_CURVA;
						oEntry.SN_GATE = oResponse.data.results[i].SN_GATE;
						arrayCurva.push(oEntry);
						oEntry = {};
					}
					ogetCurvaModel.setSizeLimit(9999999999);

					ogetCurvaModel.setData(arrayCurva);
					that.getView().setModel(ogetCurvaModel, "CurvaModel");
					sap.ui.getCore().setModel(ogetCurvaModel, "CurvaModel");
				},
				error: function (oError) {
					//	MessageBox.error("Error in getting CURVE. Please contact administrator.");
				}
			};

			var path = "/T_CURVE?$format=json";
			this.oMainOdataModel.read(path, mParameters);
		},
		getAdditivo: function () {
			var that = this;
			var mParameters = {
				success: function (oDataIn, oResponse) {
					var ogetAdditivoModel = new sap.ui.model.json.JSONModel();
					var arrayAdditivo = [];
					var oEntry = {

						ID_TIPOADDITIVO: "",
						DESCR_ADDITIVO: ""
					};
					arrayAdditivo.push(oEntry);
					oEntry = {};
					for (var i = 0; i < oResponse.data.results.length; i++) {
						oEntry.ID_TIPOADDITIVO = oResponse.data.results[i].ID_TIPOADDITIVO;
						oEntry.DESCR_ADDITIVO = oResponse.data.results[i].DESCR_ADDITIVO;
						arrayAdditivo.push(oEntry);
						oEntry = {};
					}
					ogetAdditivoModel.setSizeLimit(9999999999);
					ogetAdditivoModel.setData(arrayAdditivo);
					that.getView().setModel(ogetAdditivoModel, "AdditivoModel");
				},
				error: function (oError) {
					//	MessageBox.error("Error in getting Additivo. Please contact administrator.");
				}
			};

			var path = "/T_TIPIADDITIVI?$format=json";
			this.oMainOdataModel.read(path, mParameters);
		},
		handleDescGatePress2: function (oEvent) {
			if (this.getView().byId("Mul2").getSelectedItem()) {
				var vObject = this.getView().getModel("GateModel").getObject(this.getView().byId("Mul2").getSelectedItem().oBindingContexts.GateModel
					.sPath);

				sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "modPista");
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/year", this.selectedfiscalYearPeriodi);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/Pistaview", this.selectedPistaview);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/IdPiste", this.selectedIdPiste);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", vObject.ID_CURVA);
				//	var curvetype = this.getView().getModel("pisteResultTableModel").getProperty(vObject.ID_TIPO_CURVA_GATE + "/ID_TIPO_CURVA_GATE1");
				//	sap.ui.getCore().getModel("BasicAppModel").setProperty("/0/FISCAL_YEAR", selectedfiscalYearPeriodi);

				var tipo_curv = this.getIdTipoCurva(vObject.ID_CURVA);
				var selectedCurve = Formatter.convertIdTipoToDesc(tipo_curv);
				// sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", idCurve);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveDesc", vObject.DESCR_CURVA);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/gate", vObject.SN_GATE);
				var e = sap.ui.core.UIComponent.getRouterFor(this);
				if (selectedCurve == "Lineare") // after getting curv type t_tipi_curv
					e.navTo("displayCurvaLineare");

				else if (selectedCurve == "Discreta") {
					//	sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "curve");
					e.navTo("displayCurvaDiscreta");
				} else if (selectedCurve == "Discreta/Rapporto Percentuale")
					e.navTo("displayDiscretaRapportoPercentuale");
				else if (selectedCurve == "Lineare/Consuntivo")
					e.navTo("displayCurvaLineare_Consuntivo");
				else if (selectedCurve == "Lineare/Pdecimale")
					e.navTo("displayCurva_Pdecimale");
				else if (selectedCurve == "Descrittiva")
					e.navTo("displayCurvaDescrittiva");

			}

		},
		getIdTipoCurva: function (idcurve) {
			var oModel = new sap.ui.model.odata.ODataModel(this.sServiceUrl, true);
			var id_tipo_curv;
			oModel.read("T_CURVE?$filter=ID_CURVA eq " + parseInt(idcurve), null,
				null, false,
				function (oData) {
					if (oData.results.length > 0) {
						id_tipo_curv = oData.results[0].ID_TIPO_CURVA;
					} else {
						id_tipo_curv = 0;
					}
				},
				function (oError) {
					//	MessageBox.error("Error while getting status for request");
				});

			return id_tipo_curv;
		},
		handleDescGatePress3: function (oEvent) {
			/*	this.pistestopistecurvmodel = this.getView().getModel("CurvaModel").getObject(oEvent.getSource().getSelectedItem().oBindingContexts
					.CurvaModel.sPath);*/
			var data = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");
			var index = oEvent.getSource().getParent().getParent().getParent().indexOfItem(oEvent.getSource().getParent().getParent());
			if (data[index].ID_CURVA) {
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "modPista");
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/year", this.selectedfiscalYearPeriodi);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/Pistaview", this.selectedPistaview);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/IdPiste", this.selectedIdPiste);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", data[index].ID_CURVA);
				//	var curvetype = this.getView().getModel("pisteResultTableModel").getProperty(vObject.ID_TIPO_CURVA_GATE + "/ID_TIPO_CURVA_GATE1");
				//	sap.ui.getCore().getModel("BasicAppModel").setProperty("/0/FISCAL_YEAR", selectedfiscalYearPeriodi);
				var tipo_curv = this.getIdTipoCurva(data[index].ID_CURVA);
				var selectedCurve = Formatter.convertIdTipoToDesc(tipo_curv);
				//	sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", idCurve);
				var selectCurva = oEvent.getSource().getParent().getItems()[0].getSelectedItem().getBindingContext("CurvaModel").getObject();
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveDesc", selectCurva.DESCR_CURVA);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/gate", selectCurva.SN_GATE);
				var e = sap.ui.core.UIComponent.getRouterFor(this);
				if (selectedCurve == "Lineare") // after getting curv type t_tipi_curv
					e.navTo("displayCurvaLineare");

				else if (selectedCurve == "Discreta") {
					//	sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "curve");
					e.navTo("displayCurvaDiscreta");
				} else if (selectedCurve == "Discreta/Rapporto Percentuale")
					e.navTo("displayDiscretaRapportoPercentuale");
				else if (selectedCurve == "Lineare/Consuntivo")
					e.navTo("displayCurvaLineare_Consuntivo");
				else if (selectedCurve == "Lineare/Pdecimale")
					e.navTo("displayCurva_Pdecimale");
				else if (selectedCurve == "Descrittiva")
					e.navTo("displayCurvaDescrittiva");

			}

		},
		handleDescGatePress: function (oEvent) {
			if (this.getView().byId("Mul1").getSelectedItem()) {
				var vObject = this.getView().getModel("GateModel").getObject(this.getView().byId("Mul1").getSelectedItem().oBindingContexts.GateModel
					.sPath);

				sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "modPista");
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/year", this.selectedfiscalYearPeriodi);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/Pistaview", this.selectedPistaview);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/IdPiste", this.selectedIdPiste);
				//	var curvetype = this.getView().getModel("pisteResultTableModel").getProperty(vObject.ID_TIPO_CURVA_GATE + "/ID_TIPO_CURVA_GATE1");
				//	sap.ui.getCore().getModel("BasicAppModel").setProperty("/0/FISCAL_YEAR", selectedfiscalYearPeriodi);
				var tipo_curv = this.getIdTipoCurva(vObject.ID_CURVA);
				var selectedCurve = Formatter.convertIdTipoToDesc(tipo_curv);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", vObject.ID_CURVA);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveDesc", vObject.DESCR_CURVA);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/gate", vObject.SN_GATE);
				var e = sap.ui.core.UIComponent.getRouterFor(this);
				if (selectedCurve == "Lineare") // after getting curv type t_tipi_curv
					e.navTo("displayCurvaLineare");

				else if (selectedCurve == "Discreta") {
					//	sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "curve");
					e.navTo("displayCurvaDiscreta");
				} else if (selectedCurve == "Discreta/Rapporto Percentuale")
					e.navTo("displayDiscretaRapportoPercentuale");
				else if (selectedCurve == "Lineare/Consuntivo")
					e.navTo("displayCurvaLineare_Consuntivo");
				else if (selectedCurve == "Lineare/Pdecimale")
					e.navTo("displayCurva_Pdecimale");
				else if (selectedCurve == "Descrittiva")
					e.navTo("displayCurvaDescrittiva");

			}

		},
		getGate: function () {
			debugger
			var that = this;
			var oFilters = [];
			var filter1;
			if (that.selectedfiscalYearPeriodi != undefined && that.selectedfiscalYearPeriodi != "") {
				filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, that.selectedfiscalYearPeriodi);
				oFilters.push(filter1);
			}
			filter1 = new sap.ui.model.Filter("ID_GATE_MADRE", sap.ui.model.FilterOperator.EQ, 0);
			oFilters.push(filter1);
			var mParameters = {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					var ogetGateModel = new sap.ui.model.json.JSONModel();

					var arrayGate = [];
					var oEntry = {

						ID_GATE: "",
						DESCR_GATE: "",
						ID_CURVA: "",
						DESCR_CURVA: "",
						SN_GATE: ""
					};
					arrayGate.push(oEntry);
					oEntry = {};
					for (var i = 0; i < oResponse.data.results.length; i++) {
						oEntry.ID_GATE = oResponse.data.results[i].ID_GATE;
						oEntry.DESCR_GATE = oResponse.data.results[i].DESCR_GATE;
						oEntry.ID_CURVA = oResponse.data.results[i].ID_CURVA;
						oEntry.DESCR_CURVA = oResponse.data.results[i].DESCR_CURVA;
						oEntry.SN_GATE = oResponse.data.results[i].SN_GATE;
						arrayGate.push(oEntry);
						oEntry = {};
					}
					ogetGateModel.setSizeLimit(9999999999);
					ogetGateModel.setData(arrayGate);
					that.getView().setModel(ogetGateModel, "GateModel");
				},
				error: function (oError) {
					//MessageBox.error("Error in getting Gruppo Pista. Please contact administrator.");
				}
			};

			var path = "/V_GATE?$format=json";
			this.oMainOdataModel.read(path, mParameters);
		},
		onMoltiplicatore2Select: function (oEvent) {

			var ID_GATE = parseInt(this.getView().byId("Mul2").getSelectedKey());
			var that = this;
			var oFilters = [];
			var year = "";
			if (that.selectedfiscalYearPeriodi != undefined && that.selectedfiscalYearPeriodi != "") {
				var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, that.selectedfiscalYearPeriodi);
				oFilters.push(filter1);
			}
			if (ID_GATE != undefined && ID_GATE != "") {
				var filter2 = new sap.ui.model.Filter("ID_GATE", sap.ui.model.FilterOperator.EQ, ID_GATE);
				oFilters.push(filter2);
			}
			var mParameters = {

				filters: oFilters,
				success: function (oDataIn, oResponse) {

					var oEntry = {};
					if (oResponse.data.results.length > 0) {
						oEntry.ID_CURVA = oResponse.data.results[0].ID_CURVA;
						oEntry.RISULTATO_GRADINO = oResponse.data.results[0].RISULTATO_GRADINO;
						oEntry.RISULTATO_GRADINO_SIM = oResponse.data.results[0].RISULTATO_GRADINO_SIM;
						if (oEntry.RISULTATO_GRADINO_SIM === 'NULL') {
							oEntry.RISULTATO_GRADINO_SIM = "";
						}
						if (oEntry.RISULTATO_GRADINO === 'NULL') {
							oEntry.RISULTATO_GRADINO = "";
						}
					}
					that.getView().byId("inpResultato1").setValue(oEntry.RISULTATO_GRADINO);
					that.getView().byId("inpRisultatoSimulato1").setValue(oEntry.RISULTATO_GRADINO_SIM);
					that.setPrcMbo1(oEntry);
				},
				error: function (oError) {
					//	MessageBox.error("Error in getting Gruppo Pista. Please contact administrator.");
				}
			};

			var path = "/V_GATE?$format=json";
			this.oMainOdataModel.read(path, mParameters);

		},
		setPrcMbo1: function (oEntry1) {
			var that = this;
			var oFilters = [];
			var year = "";
			that.oEntryMultiplicore2 = {};
			if (oEntry1) {
				var filter1 = new sap.ui.model.Filter("ID_CURVA", sap.ui.model.FilterOperator.EQ, parseInt(oEntry1.ID_CURVA));
				oFilters.push(filter1);
			}
			if (oEntry1) {
				var filter2 = new sap.ui.model.Filter("S_GRADINO", sap.ui.model.FilterOperator.EQ, oEntry1.RISULTATO_GRADINO);
				oFilters.push(filter2);
			}
			var mParameters = {

				filters: oFilters,
				success: function (oDataIn, oResponse) {

					if (oResponse.data.results.length > 0) {
						that.oEntryMultiplicore2.PERC_MBO3 = oResponse.data.results[0].PERC_MBO;
						sap.ui.getCore().getModel("PercMboModel").setProperty("/PERC_MBO3", that.oEntryMultiplicore2.PERC_MBO3);

					}

				},
				error: function (oError) {
					//	MessageBox.error("Error in getting Gruppo Pista. Please contact administrator.");
				}
			};

			var path = "/T_CURVE_RIGHE?$format=json";
			this.oMainOdataModel.read(path, mParameters);

			////////////////////////////////////////////

			this.sServiceUrl = this.getOwnerComponent().getModel().sServiceUrl;
			var oModel = new sap.ui.model.odata.v2.ODataModel(this.sServiceUrl);
			var that = this;
			var oFilters = [];
			var year = "";
			if (oEntry1) {
				var filter1 = new sap.ui.model.Filter("ID_CURVA", sap.ui.model.FilterOperator.EQ, parseInt(oEntry1.ID_CURVA));
				oFilters.push(filter1);
			}
			if (oEntry1) {
				var filter2 = new sap.ui.model.Filter("S_GRADINO", sap.ui.model.FilterOperator.EQ, oEntry1.RISULTATO_GRADINO_SIM);
				oFilters.push(filter2);
			}
			var mParameters = {

				filters: oFilters,
				success: function (oDataIn, oResponse) {

					var oEntry2 = {};
					if (oResponse.data.results.length > 0) {
						that.oEntryMultiplicore2.PERC_MBO4 = oResponse.data.results[0].PERC_MBO;
						sap.ui.getCore().getModel("PercMboModel").setProperty("/PERC_MBO4", that.oEntryMultiplicore2.PERC_MBO4);
					}

				},
				error: function (oError) {
					//	MessageBox.error("Error in getting Gruppo Pista. Please contact administrator.");
				}
			};

			var path = "/T_CURVE_RIGHE?$format=json";
			oModel.read(path, mParameters);

		},
		onMoltiplicatore1Select: function (oEvent) {
			var ID_GATE = parseInt(oEvent.getParameter("selectedItem").getKey());
			var that = this;
			var oFilters = [];
			var year = "";
			if (that.selectedfiscalYearPeriodi != undefined && that.selectedfiscalYearPeriodi != "") {
				var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, that.selectedfiscalYearPeriodi);
				oFilters.push(filter1);
			}
			if (ID_GATE != undefined && ID_GATE != "") {
				var filter2 = new sap.ui.model.Filter("ID_GATE", sap.ui.model.FilterOperator.EQ, ID_GATE);
				oFilters.push(filter2);
			}
			var mParameters = {

				filters: oFilters,
				success: function (oDataIn, oResponse) {

					var oEntry = {};
					if (oResponse.data.results.length > 0) {
						oEntry.ID_CURVA = oResponse.data.results[0].ID_CURVA;
						oEntry.RISULTATO_GRADINO = oResponse.data.results[0].RISULTATO_GRADINO;
						oEntry.RISULTATO_GRADINO_SIM = oResponse.data.results[0].RISULTATO_GRADINO_SIM;
						if (oEntry.RISULTATO_GRADINO_SIM === 'NULL') {
							oEntry.RISULTATO_GRADINO_SIM = "";
						}
						if (oEntry.RISULTATO_GRADINO === 'NULL') {
							oEntry.RISULTATO_GRADINO = "";
						}
					}

					that.getView().byId("inpResultato").setValue(oEntry.RISULTATO_GRADINO);
					that.getView().byId("inpRisultatoSimulato").setValue(oEntry.RISULTATO_GRADINO_SIM);
					that.setPrcMbo(oEntry);
				},
				error: function (oError) {
					//	MessageBox.error("Error in getting Gruppo Pista. Please contact administrator.");
				}
			};

			var path = "/V_GATE?$format=json";
			this.oMainOdataModel.read(path, mParameters);

		},
		_getHanaData: function (Entity, Filters) {
			var xsoDataModelReport = this.getOwnerComponent().getModel();
			return new Promise(
				function (resolve, reject) {
					xsoDataModelReport.read(Entity, {
						filters: Filters,
						success: function (oDataIn, oResponse) {
							resolve(oDataIn.results);
						},
						error: function (error) {
							reject(console.log("error calling hana DB"))
						}
					});
				});
		},
		setPrcMbo: function (oEntry1) {
			var that = this;
			var oFilters = [];
			that.oEntryMultiplicore1 = {};
			var year = "";
			if (oEntry1) {
				var filter1 = new sap.ui.model.Filter("ID_CURVA", sap.ui.model.FilterOperator.EQ, parseInt(oEntry1.ID_CURVA));
				oFilters.push(filter1);
			}
			if (oEntry1) {
				var filter2 = new sap.ui.model.Filter("S_GRADINO", sap.ui.model.FilterOperator.EQ, oEntry1.RISULTATO_GRADINO);
				oFilters.push(filter2);
			}
			var mParameters = {

				filters: oFilters,
				success: function (oDataIn, oResponse) {

					if (oResponse.data.results.length > 0) {
						that.oEntryMultiplicore1.PERC_MBO1 = oResponse.data.results[0].PERC_MBO;
						sap.ui.getCore().getModel("PercMboModel").setProperty("/PERC_MBO1", that.oEntryMultiplicore1.PERC_MBO1);
					}

				},
				error: function (oError) {
					//	MessageBox.error("Error in getting Gruppo Pista. Please contact administrator.");
				}
			};

			var path = "/T_CURVE_RIGHE?$format=json";
			this.oMainOdataModel.read(path, mParameters);

			////////////////////////////////////////////

			this.sServiceUrl = this.getOwnerComponent().getModel().sServiceUrl;
			var oModel = new sap.ui.model.odata.v2.ODataModel(this.sServiceUrl);
			var that = this;
			var oFilters = [];
			var year = "";
			if (oEntry1) {
				var filter1 = new sap.ui.model.Filter("ID_CURVA", sap.ui.model.FilterOperator.EQ, parseInt(oEntry1.ID_CURVA));
				oFilters.push(filter1);
			}
			if (oEntry1) {
				var filter2 = new sap.ui.model.Filter("S_GRADINO", sap.ui.model.FilterOperator.EQ, oEntry1.RISULTATO_GRADINO_SIM);
				oFilters.push(filter2);
			}
			var mParameters = {

				filters: oFilters,
				success: function (oDataIn, oResponse) {

					if (oResponse.data.results.length > 0) {
						that.oEntryMultiplicore1.PERC_MBO2 = oResponse.data.results[0].PERC_MBO;
						sap.ui.getCore().getModel("PercMboModel").setProperty("/PERC_MBO2", that.oEntryMultiplicore1.PERC_MBO2);
					}

				},
				error: function (oError) {
					//	MessageBox.error("Error in getting Gruppo Pista. Please contact administrator.");
				}
			};

			var path = "/T_CURVE_RIGHE?$format=json";
			oModel.read(path, mParameters);

		},
		onMoltiplicatore3Select: function (oEvent) {
			var ID_GATE = parseInt(oEvent.getParameter("selectedItem").getKey());
			var that = this;
			var oFilters = [];
			var year = "";
			if (that.selectedfiscalYearPeriodi != undefined && that.selectedfiscalYearPeriodi != "") {
				var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, that.selectedfiscalYearPeriodi);
				oFilters.push(filter1);
			}
			if (ID_GATE != undefined && ID_GATE != "") {
				var filter2 = new sap.ui.model.Filter("ID_GATE", sap.ui.model.FilterOperator.EQ, ID_GATE);
				oFilters.push(filter2);
			}
			var mParameters = {

				filters: oFilters,
				success: function (oDataIn, oResponse) {

					var oEntry = {};
					if (oResponse.data.results.length > 0) {
						oEntry.ID_CURVA = oResponse.data.results[0].ID_CURVA;
						oEntry.RISULTATO_GRADINO = oResponse.data.results[0].RISULTATO_GRADINO;
						oEntry.RISULTATO_GRADINO_SIM = oResponse.data.results[0].RISULTATO_GRADINO_SIM;
					}
					that.setPrcMbo3(oEntry);
				},
				error: function (oError) {
					//	MessageBox.error("Error in getting Gruppo Pista. Please contact administrator.");
				}
			};

			var path = "/V_GATE?$format=json";
			this.oMainOdataModel.read(path, mParameters);

		},

		setPrcMbo3: function (oEntry1) {
			var that = this;
			var oFilters = [];
			that.oEntryMultiplicore5 = {};
			var year = "";
			if (oEntry1) {
				var filter1 = new sap.ui.model.Filter("ID_CURVA", sap.ui.model.FilterOperator.EQ, parseInt(oEntry1.ID_CURVA));
				oFilters.push(filter1);
			}
			if (oEntry1) {
				var filter2 = new sap.ui.model.Filter("S_GRADINO", sap.ui.model.FilterOperator.EQ, oEntry1.RISULTATO_GRADINO);
				oFilters.push(filter2);
			}
			var mParameters = {

				filters: oFilters,
				success: function (oDataIn, oResponse) {

					if (oResponse.data.results.length > 0) {
						that.oEntryMultiplicore5.PERC_MBO5 = oResponse.data.results[0].PERC_MBO;
						sap.ui.getCore().getModel("PercMboModel").setProperty("/PERC_MBO5", that.oEntryMultiplicore5.PERC_MBO5);
					}

				},
				error: function (oError) {
					//	MessageBox.error("Error in getting Gruppo Pista. Please contact administrator.");
				}
			};

			var path = "/T_CURVE_RIGHE?$format=json";
			this.oMainOdataModel.read(path, mParameters);

			////////////////////////////////////////////

			this.sServiceUrl = this.getOwnerComponent().getModel().sServiceUrl;
			var oModel = new sap.ui.model.odata.v2.ODataModel(this.sServiceUrl);
			var that = this;
			var oFilters = [];
			var year = "";
			if (oEntry1) {
				var filter1 = new sap.ui.model.Filter("ID_CURVA", sap.ui.model.FilterOperator.EQ, parseInt(oEntry1.ID_CURVA));
				oFilters.push(filter1);
			}
			if (oEntry1) {
				var filter2 = new sap.ui.model.Filter("S_GRADINO", sap.ui.model.FilterOperator.EQ, oEntry1.RISULTATO_GRADINO_SIM);
				oFilters.push(filter2);
			}
			var mParameters = {

				filters: oFilters,
				success: function (oDataIn, oResponse) {

					if (oResponse.data.results.length > 0) {
						that.oEntryMultiplicore1.PERC_MBO2 = oResponse.data.results[0].PERC_MBO;
						sap.ui.getCore().getModel("PercMboModel").setProperty("/PERC_MBO2", that.oEntryMultiplicore1.PERC_MBO2);
					}

				},
				error: function (oError) {
					//	MessageBox.error("Error in getting Gruppo Pista. Please contact administrator.");
				}
			};

			var path = "/T_CURVE_RIGHE?$format=json";
			oModel.read(path, mParameters);

		},
		getGruppi: function () {
			var that = this;
			var oFilters = [];
			if (that.selectedfiscalYearPeriodi != undefined && that.selectedfiscalYearPeriodi != "") {
				var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, that.selectedfiscalYearPeriodi);
				oFilters.push(filter1);
			}
			var mParameters = {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					var ogetGruppiModel = new sap.ui.model.json.JSONModel();

					var arrayGruppi = [];
					var oEntry = {

						ID_GRUPPOPISTA: "",
						DESCR_GRUPPOPISTA: ""
					};

					arrayGruppi.push(oEntry);
					oEntry = {};
					for (var i = 0; i < oResponse.data.results.length; i++) {
						oEntry.ID_GRUPPOPISTA = oResponse.data.results[i].ID_GRUPPOPISTA;
						oEntry.DESCR_GRUPPOPISTA = oResponse.data.results[i].DESCR_GRUPPOPISTA;
						arrayGruppi.push(oEntry);
						oEntry = {};
					}
					ogetGruppiModel.setSizeLimit(9999999999);
					ogetGruppiModel.setData(arrayGruppi);
					that.getView().setModel(ogetGruppiModel, "GruppiModel");
				},
				error: function (oError) {
					//	MessageBox.error("Error in getting Gruppo Pista. Please contact administrator.");
				}
			};

			var path = "/T_GRUPPIPISTE?$format=json";
			this.oMainOdataModel.read(path, mParameters);
		},
		getFiscalYear: function (selectedfiscalYearPeriodi) {
			var that = this;
			var oFilters = [];
			var year = "";
			if (selectedfiscalYearPeriodi != undefined && selectedfiscalYearPeriodi != "") {
				var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, selectedfiscalYearPeriodi);
				oFilters.push(filter1);
			}
			var mParameters = {

				filters: oFilters,
				success: function (oDataIn, oResponse) {
					if (oResponse.data.results.length > 0) {
						year = oResponse.data.results[0].DESCR_PERIODO;
						that.oMainJsonYear = new sap.ui.model.json.JSONModel();
						that.oMainJsonYear.setProperty("/year", year);
						that.getView().byId("idtxtfiscalyear").setText(year);
						that.getView().setModel(that.oMainJsonYear, "Years");
						that.getMonthOfYears(new Date(oResponse.data.results[0].VALE_DAL), new Date(oResponse.data.results[0].VALE_AL));
						that.getMonthOfYears1(new Date(oResponse.data.results[0].VALE_DAL), new Date(oResponse.data.results[0].VALE_AL));
					}
				},
				error: function (oError) {
					MessageBox.error("Error in getting Fiscal year. Please contact administrator.");
				}
			};

			var path = "/PERIODI_RIFERIMENTO?$format=json";
			this.oMainOdataModel.read(path, mParameters);
		},
		getMonthOfYears: function (date1, date2) {
			var monthBetweenfiscial = this.diff(date1, date2);
			this.oMainMonthJsonYear = new sap.ui.model.json.JSONModel();
			this.oMainMonthJsonYear.setData(monthBetweenfiscial);
			this.getView().setModel(this.oMainMonthJsonYear, "Months");
		},
		getMonthOfYears1: function (date1, date2) {
			var monthBetweenfiscial1 = this.diff1(date1, date2);
			this.oMainMonthJsonYear1 = new sap.ui.model.json.JSONModel();
			this.oMainMonthJsonYear1.setData(monthBetweenfiscial1);
			this.getView().setModel(this.oMainMonthJsonYear1, "Months1");
		},
		monthDiff: function (d1, d2) {
			var months, day1, day2;
			months = (d2.getFullYear() - d1.getFullYear()) * 12; //calculates months between two years
			months -= d1.getMonth() + 1;
			months += d2.getMonth(); //calculates number of complete months between two months
			day1 = 30 - d1.getDate();
			day2 = day1 + d2.getDate();
			months += parseInt(day2 / 30); //calculates no of complete months lie between two dates
			return months <= 0 ? 0 : months;
		},
		diff: function (from, to) {
			var monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
				"Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
			];
			var arr = [];
			var datFrom = new Date(from);
			var datTo = new Date(to);
			var fromYear = datFrom.getFullYear();
			var toYear = datTo.getFullYear();
			var diffYear = this.monthDiff(datFrom, datTo);
			var oEntry = {
				month: "",
				key: ""
			};
			arr.push(oEntry);
			oEntry = {};
			var monthKey = datFrom.getMonth();
			var monthYear = datFrom.getMonth();
			for (var i = 0; i < diffYear; i++) {
				var actualMonth = monthKey + 1;
				oEntry.month = monthNames[monthKey % 12] + "-" + Math.floor(fromYear + (monthYear / 12));
				oEntry.key = Math.floor(fromYear + (monthYear / 12)) + "-" + ((actualMonth < 10) ? '0' + actualMonth : actualMonth) + "-" + "01";
				arr.push(oEntry);
				monthKey = monthKey + 1;
				monthYear = monthYear + 1;
				if (monthKey > 11) {
					monthKey = 0;
				}
				oEntry = {};
			}

			return arr;
		},
		diff1: function (from, to) {

			var monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
				"Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
			];
			var arr = [];
			var datFrom = new Date(from);
			var datTo = new Date(to);
			var fromYear = datFrom.getFullYear();
			var toYear = datTo.getFullYear();
			var diffYear = this.monthDiff(datFrom, datTo);
			var oEntry = {
				month: "",
				key: ""
			};
			arr.push(oEntry);
			oEntry = {};
			var monthKey = datFrom.getMonth();
			var monthYear = datFrom.getMonth();
			for (var i = 0; i < diffYear; i++) {
				var actualMonth = monthKey + 1;
				var lastDay = new Date(Math.floor(fromYear + (monthYear / 12)), ((actualMonth < 10) ? '0' + actualMonth : actualMonth), 0);
				oEntry.month = monthNames[monthKey % 12] + "-" + Math.floor(fromYear + (monthYear / 12));
				oEntry.key = Math.floor(fromYear + (monthYear / 12)) + "-" + ((actualMonth < 10) ? '0' + actualMonth : actualMonth) + "-" +
					lastDay.getDate();
				arr.push(oEntry);
				monthKey = monthKey + 1;
				monthYear = monthYear + 1;
				if (monthKey > 11) {
					monthKey = 0;
				}
				oEntry = {};
			}

			return arr;

		},
		onCaricamentoobiettivoconsuntivo: function (oEvent) {

			if (oEvent.getSource().getPressed()) {
				this.getView().byId("col1").setVisible(true);
				this.getView().byId("col2").setVisible(true);
				this.getView().byId("col3").setVisible(true);
				this.getView().byId("col4").setVisible(true);
				this.getView().byId("col5").setVisible(true);
			} else {
				this.getView().byId("col1").setVisible(false);
				this.getView().byId("col2").setVisible(false);
				this.getView().byId("col3").setVisible(false);
				this.getView().byId("col4").setVisible(false);
				this.getView().byId("col5").setVisible(false);
			}

		},
		onDeleteRow: function (oEvent) {

			var data = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");
			var index = oEvent.getSource().getParent().getParent().getParent().indexOfItem(oEvent.getSource().getParent().getParent());
			data.splice(index, 1);
			if (data.length < 2) {
				this.getView().byId("tblEnalbeOnFirstRowPress").setVisible(false);
				this.getView().byId("ObiettivoComplessivo").setValue("");
				this.getView().byId("ConsuntivoComplessivo").setValue("");

				// data[0].oButton2 = false;
				// data[0].oTest1 = false;
				/*	data[0].ObiettivoEnable = false;
					data[0].ConsuntivoEnable = false;
					data[0].ConsuntivoSimulatoEnable = false;
					data[0].ObiettivoSimulatoEnable = false;*/
			}

			this.getView().byId("idTableCreatePiste").getModel("PisteModel").setProperty("/sottopiste", data);

		},
		enablePercentage: function (oEvent) {
			var data = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");
			var index = oEvent.getSource().getParent().getParent().getParent().indexOfItem(oEvent.getSource().getParent().getParent());
			if (oEvent.getParameter("newValue") !== "") {
				if (data.length > 1) {
					//		data[index].percentage = true;
					data[index].percentageValue = "%";
				}
			} else {
				//	data[index].percentage = false;
				data[index].percentageValue = "  ";
			}

			this.getView().byId("idTableCreatePiste").getModel("PisteModel").setProperty("/sottopiste", data);

		},
		onAddItems1: function () {
			var data = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");
			this.getView().byId("tblEnalbeOnFirstRowPress").setVisible(true);

			var oEntry = {
				PESO_PERC: "",
				oTest1: true,
				percentage: false,
				percentageValue: "  ",
				ID_CURVA: "",
				ID_GATE: "",
				DESCR_SOTTOPISTA: "",
				ID_TIPO_CURVA: "",
				oButton1: true,
				oButton2: true,
				Obiettivo: "",
				Consuntivo: "",
				ConsuntivoSimulato: "",
				ObiettivoSimulato: "",
				ObiettivoEnable: true,
				ConsuntivoEnable: true,
				ConsuntivoSimulatoEnable: true,
				ObiettivoSimulatoEnable: true,
				ID_SOTTOPISTA: 0,
				ID_PERIOD: "",
				DATETIME_CR: "",
				ConsuntivoValueEnable: false,
				ConsuntivoCurva2: "",
				ConsuntivoSimulatoCurva2: "",
				ID_CURVA_EDIT: true,
				DESCR_SOTTOPISTA_EDIT: true,
				Obiettivo_edit: true,
				Consuntivo_edit: true,
				ConsuntivoSimulato_edit: true,
				ObiettivoSimulato_edit: true,
				PERC_MBO5: "",
				GateInTable: true,
				PERC_RAGG_OBIETTIVO: 0,
				PERC_RAGG_MBO: 0
			};
			data.push(oEntry);
			this.getView().byId("idTableCreatePiste").getModel("PisteModel").setProperty("/sottopiste", data);

		},
		fillDesc: function (oEvent) {

			var desc = this.byId("desc").getValue();
			var data = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");
			if (data.length > 0) {
				data[0].DESCR_SOTTOPISTA = desc;
			}
			this.getView().byId("idTableCreatePiste").getModel("PisteModel").setProperty("/sottopiste", data);
		},
		changePers: function () {
			var pers = this.byId("Pers").getSelectedButton().getText();
			if (pers === "Si") {
				this.SN_PERSONALIZZABILE = "S";
				sap.ui.getCore().getModel("PercMboModel").setProperty("/SN_PERSONALIZZABILE", "S");
				this.byId("Additivo").setEnabled(true);
			} else {
				this.SN_PERSONALIZZABILE = "N";
				sap.ui.getCore().getModel("PercMboModel").setProperty("/SN_PERSONALIZZABILE", "N");
				this.byId("Additivo").setEnabled(false);
			}
		},
		onSalva: function (oEvent) {
			sap.ui.core.BusyIndicator.show(1000);
			if (this.getView().byId("desc").getValue()) {
				var DESCR_PISTA = this.getView().byId("desc").getValue();
			} else {
				var DESCR_PISTA = "";
			}
			if (this.getView().byId("MI").getSelectedKey()) {
				var PISTA_VALE_DAL = this.getView().byId("MI").getSelectedKey();
			} else {
				var PISTA_VALE_DAL = null;
			}
			if (this.getView().byId("MI1").getSelectedKey()) {
				var PISTA_VALE_AL = this.getView().byId("MI1").getSelectedKey();
			} else {
				var PISTA_VALE_AL = null;
			}
			if (this.getView().byId("MI3").getSelectedKey()) {
				var ID_GRUPPOPISTA = parseInt(this.getView().byId("MI3").getSelectedKey());
			} else {
				var ID_GRUPPOPISTA = 0;
			}
			if (this.byId("Pers").getSelectedButton()) {
				var SN_PERSONALIZZABILE = sap.ui.getCore().getModel("PercMboModel").getProperty("/SN_PERSONALIZZABILE");
			} else {
				var SN_PERSONALIZZABILE = "";
			}
			if (this.getView().byId("Mul1").getSelectedKey()) {
				var ID_GATE = parseInt(this.getView().byId("Mul1").getSelectedKey());
			} else {
				var ID_GATE = 0;
			}
			if (this.getView().byId("Mul2").getSelectedKey()) {
				var ID_GATE2 = parseInt(this.getView().byId("Mul2").getSelectedKey());
			} else {
				var ID_GATE2 = 0;
			}
			if (this.getView().byId("Additivo").getSelectedKey()) {
				var ID_TIPOADDITIVO = parseInt(this.getView().byId("Additivo").getSelectedKey());
			} else {
				var ID_TIPOADDITIVO = 0;
			}
			if (this.getView().byId("Soglia").getValue()) {
				var SOGLIA_ADDITIVO = parseInt(this.getView().byId("Soglia").getValue());
			} else {
				var SOGLIA_ADDITIVO = 0;
			}
			if (this.getView().byId("curva2").getSelectedKey()) {
				var ID_CURVA = parseInt(this.getView().byId("curva2").getSelectedKey());
			} else {
				var ID_CURVA = 0;
			}
			if (PISTA_VALE_DAL && PISTA_VALE_AL) {
				var TIPO_PISTA = Formatter.getTipoCalculate1(PISTA_VALE_DAL, PISTA_VALE_AL);
			} else {
				var TIPO_PISTA = "";
			}

			var tablMdls = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");
			if (tablMdls.length === 1) {
				var N_SOTTOPISTE = 0;
				//	var oValueCalc = this.calculate(tablMdls[0]);
			}
			if (this.getView().byId("ObiettivoNote").getValue()) {
				var NOTE_OBIETTIVO = this.getView().byId("ObiettivoNote").getValue();
			} else {
				var NOTE_OBIETTIVO = "";
			}
			if (this.getView().byId("ConsuntivoNote").getValue()) {
				var NOTE_CONSUNTIVO = this.getView().byId("ConsuntivoNote").getValue();
			} else {
				var NOTE_CONSUNTIVO = "";
			}
			if (this.getView().byId("SchedaNote").getValue()) {
				var NOTE = this.getView().byId("SchedaNote").getValue();
			} else {
				var NOTE = "";
			}

			if (tablMdls.length > 1) {
				var N_SOTTOPISTE = tablMdls.length - 1;
				//	var oValueCalc = this.calculate(tablMdls[0]);
			}
			var oYears = this.getView().byId("idtxtfiscalyear").getText();
			var SOTTOPISTE = [];
			// calculating for sottopiste row.
			var totalSottopiste = 0;
			var totalSottopisteSim = 0;
			var totalSottopisteFinal = 0;
			var totalSottopisteFinalSim = 0;
			for (var i = 0; i < tablMdls.length; i++) {
				if (!tablMdls[i].ID_CURVA) {
					MessageBox.error(oResource.getText("messageInformation4"));
					sap.ui.core.BusyIndicator.hide();
					return;
				}
				if (i > 0) {
					var ObjectSottopiste = {};
					var ObjectSottopisteSim = {};
					// calling sottopiste calculation logic 
					if (tablMdls[i].Consuntivo && tablMdls[i].Obiettivo) {
						// calling piste calcualtion logic
						ObjectSottopiste = this.calculate(tablMdls[i], this.sServiceUrl, 3);
					} else {
						var ObjectSottopiste = {
							OBIETTIVO: 0.0,
							CONSUNTIVO: 0.0,
							PERC_RAGG_OBIETTIVO: 0.0,
							PERC_RAGG_MBO: 0.0
						};
					}
					if (tablMdls[i].ObiettivoSimulato && tablMdls[i].ConsuntivoSimulato) {
						// calling piste calcualtion logic
						ObjectSottopisteSim = this.calculate(tablMdls[i], this.sServiceUrl, 4);
					} else {
						var ObjectSottopisteSim = {
							OBIETTIVO_SIM: 0.0,
							CONSUNTIVO_SIM: 0.0,
							PERC_RAGG_OBIETTIVO_SIM: 0.0,
							PERC_RAGG_MBO_SIM: 0.0
						};
					}
					tablMdls[i].PERC_RAGG_OBIETTIVO = ObjectSottopiste.PERC_RAGG_OBIETTIVO;
					tablMdls[i].PERC_RAGG_MBO = ObjectSottopiste.PERC_RAGG_OBIETTIVO;
					tablMdls[i].PERC_RAGG_OBIETTIVO_SIM = ObjectSottopisteSim.PERC_RAGG_OBIETTIVO_SIM;
					tablMdls[i].PERC_RAGG_MBO_SIM = ObjectSottopisteSim.PERC_RAGG_MBO_SIM;
					// calculating total 
					totalSottopiste = totalSottopiste + ObjectSottopisteSim.PERC_RAGG_MBO;
					totalSottopisteSim = totalSottopisteSim + ObjectSottopisteSim.PERC_RAGG_MBO_SIM;

				}
			}
			// after caculating total now we have to muliply this total to Moltiplicatore1	Moltiplicatore2 per mbo
			var tmp_perc1 = sap.ui.getCore().getModel("PercMboModel").getProperty("/PERC_MBO1");
			var tmp_perc2 = sap.ui.getCore().getModel("PercMboModel").getProperty("/PERC_MBO3");
			if (tmp_perc1 && tmp_perc2) {
				totalSottopisteFinal = ((totalSottopiste * tmp_perc1 * tmp_perc2) / 10000).toFixed(1);
				totalSottopisteFinalSim = ((totalSottopisteSim * tmp_perc1 * tmp_perc2) / 10000).toFixed(1);
			}
			for (var i = 0; i < tablMdls.length; i++) {
				if (!tablMdls[i].ID_CURVA) {
					MessageBox.error(oResource.getText("messageInformation4"));
					sap.ui.core.BusyIndicator.hide();
					return;
				}
				if (tablMdls[i].SN_Consuntivo_Perc === undefined) {
					tablMdls[i].SN_Consuntivo_Perc = "E";
				}
				var oNewObject = {
					ID_SOTTOPISTA: parseInt(tablMdls[i].ID_SOTTOPISTA),
					ID_PISTE: sap.ui.getCore().getModel("PercMboModel").getProperty("/ID_PISTE"),
					ID_PERIOD: tablMdls[i].ID_PERIOD,
					PESO_PERC: tablMdls[i].PESO_PERC,
					ID_CURVA: (tablMdls[i].ID_CURVA ? parseInt(tablMdls[i].ID_CURVA) : 0),
					ID_GATE: (tablMdls[i].ID_GATE ? parseInt(tablMdls[i].ID_GATE) : 0),
					DESCR_SOTTOPISTA: ((!tablMdls[i].DESCR_SOTTOPISTA) ? undefined : tablMdls[i].DESCR_SOTTOPISTA.toString()),
					DATETIME_CR: tablMdls[i].DATETIME_CR,
					PERC_RAGG_OBIETTIVO: ((tablMdls[i].PERC_RAGG_OBIETTIVO) ? tablMdls[i].PERC_RAGG_OBIETTIVO : 0),
					PERC_RAGG_MBO: ((tablMdls[i].PERC_RAGG_MBO) ? tablMdls[i].PERC_RAGG_MBO : 0),
					PERC_RAGG_OBIETTIVO_SIM: ((tablMdls[i].PERC_RAGG_OBIETTIVO_SIM) ? tablMdls[i].PERC_RAGG_OBIETTIVO_SIM : 0),
					PERC_RAGG_MBO_SIM: ((tablMdls[i].PERC_RAGG_MBO_SIM) ? tablMdls[i].PERC_RAGG_MBO_SIM : 0),
					OBIETTIVO_GRADINO: ((tablMdls[i].OBIETTIVO_GRADINO) ? tablMdls[i].OBIETTIVO_GRADINO : 0),
					CONSUNTIVO_GRADINO: ((tablMdls[i].CONSUNTIVO_GRADINO) ? tablMdls[i].CONSUNTIVO_GRADINO : 0),
					OBIETTIVO: tablMdls[i].Obiettivo,
					CONSUNTIVO: tablMdls[i].Consuntivo,
					SN_CONSUNTIVO_PERC: tablMdls[i].SN_Consuntivo_Perc

				};
				SOTTOPISTE.push(oNewObject);
				oNewObject = {};

			}

			var tablMdls = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");
			var oEntryPiste = {};
			var oEntryPisteSim = {};
			var Obiettivo_gandino = 0,
				Consuntivo_gandino = 0;
			if (tablMdls.length > 0) {
				var N_SOTTOPISTE = 0;
				if (tablMdls[0].Consuntivo && tablMdls[0].Obiettivo) {
					// calling piste calcualtion logic
					oEntryPiste = this.calculate(tablMdls[0], this.sServiceUrl, 1);
				} else {
					var oEntryPiste = {
						OBIETTIVO: 0.0,
						CONSUNTIVO: 0.0,
						PERC_RAGG_OBIETTIVO: 0.0,
						PERC_RAGG_MBO: 0.0
					};
				}
				if (tablMdls[0].ObiettivoSimulato && tablMdls[0].ConsuntivoSimulato) {
					// calling piste calcualtion logic
					oEntryPisteSim = this.calculate(tablMdls[0], this.sServiceUrl, 2);
				} else {
					var oEntryPisteSim = {
						OBIETTIVO_SIM: 0.0,
						CONSUNTIVO_SIM: 0.0,
						PERC_RAGG_OBIETTIVO_SIM: 0.0,
						PERC_RAGG_MBO_SIM: 0.0
					};
				}
			}

			if (oEntryPiste) {
				if (!oEntryPiste.OBIETTIVO) {
					oEntryPiste.OBIETTIVO = oEntryPiste.OBIETTIVO;
				}
				if (!oEntryPiste.CONSUNTIVO) {
					oEntryPiste.CONSUNTIVO = oEntryPiste.CONSUNTIVO;
				}
				if (!oEntryPiste.PERC_RAGG_OBIETTIVO) {
					oEntryPiste.PERC_RAGG_OBIETTIVO = oEntryPiste.PERC_RAGG_OBIETTIVO;
				}
				if (!oEntryPiste.PERC_RAGG_MBO) {
					oEntryPiste.PERC_RAGG_MBO = oEntryPiste.PERC_RAGG_MBO;
				}
				oEntryPiste.ID_CURVA = tablMdls[0].ID_CURVA;
				oEntryPiste.SN_CONSUNTIVO_PERC = tablMdls[0].SN_Consuntivo_Perc;
				// if(oEntryPiste.SN_CONSUNTIVO_PERC === undefined){oEntryPiste.SN_CONSUNTIVO_PERC = "E";}
			}
			if (oEntryPisteSim) {
				if (!oEntryPisteSim.OBIETTIVO_SIM) {
					oEntryPisteSim.OBIETTIVO_SIM = oEntryPisteSim.OBIETTIVO_SIM;
				}
				if (!oEntryPisteSim.CONSUNTIVO_SIM) {
					oEntryPisteSim.CONSUNTIVO_SIM = oEntryPisteSim.CONSUNTIVO_SIM;
				}
				if (!oEntryPisteSim.PERC_RAGG_OBIETTIVO_SIM) {
					oEntryPisteSim.PERC_RAGG_OBIETTIVO_SIM = oEntryPisteSim.PERC_RAGG_OBIETTIVO_SIM;
				}
				if (!oEntryPisteSim.PERC_RAGG_MBO_SIM) {
					oEntryPisteSim.PERC_RAGG_MBO_SIM = oEntryPisteSim.PERC_RAGG_MBO_SIM;
				}
				oEntryPisteSim.ID_CURVA = tablMdls[0].ID_CURVA;
			}
			// if the first row which is piste row then 
			// if curv type is 2 or 3 value of Obiettivo and Consuntivo should be store in Obiettivo_gandino and Consuntivo_gandino in p_piste table
			if (tablMdls.length < 1) {
				if (tablMdls[0].ID_TIPO_CURVA === 2 || tablMdls[0].ID_TIPO_CURVA === 3) {
					Obiettivo_gandino = oEntryPiste.OBIETTIVO;
					Consuntivo_gandino = oEntryPiste.CONSUNTIVO;
					oEntryPiste.OBIETTIVO = 0;
					oEntryPiste.CONSUNTIVO = 0;
				}
			} else {
				Obiettivo_gandino = this.getView().byId("ObiettivoComplessivo").getValue();
				Consuntivo_gandino = this.getView().byId("ConsuntivoComplessivo").getValue();
			}
			var sPayload = {
				ID_PERIODO: parseInt(this.selectedfiscalYearPeriodi),
				ID_PISTAVIEW: sap.ui.getCore().getModel("PercMboModel").getProperty("/ID_PISTAVIEW"),
				ID_PISTE: sap.ui.getCore().getModel("PercMboModel").getProperty("/ID_PISTE"),
				ID_PISTA_MADRE: sap.ui.getCore().getModel("PercMboModel").getProperty("/ID_PISTA_MADRE"),
				DESCR_PISTA: DESCR_PISTA.toString(),
				PISTA_VALE_DAL: PISTA_VALE_DAL,
				PISTA_VALE_AL: PISTA_VALE_AL,
				ID_GRUPPOPISTA: ID_GRUPPOPISTA,
				SN_PERSONALIZZABILE: SN_PERSONALIZZABILE,
				ID_GATE: ID_GATE,
				ID_GATE2: ID_GATE2,
				ID_TIPOADDITIVO: ID_TIPOADDITIVO,
				SOGLIA_ADDITIVO: SOGLIA_ADDITIVO,
				ID_CURVA: oEntryPiste.ID_CURVA,
				N_SOTTOPISTE: parseInt(N_SOTTOPISTE),
				TIPO_PISTA: TIPO_PISTA.toString(),
				OBIETTIVO: oEntryPiste.OBIETTIVO,
				SN_CONSUNTIVO_PERC: oEntryPiste.SN_CONSUNTIVO_PERC,
				CONSUNTIVO: oEntryPiste.CONSUNTIVO,
				OBIETTIVO_GRADINO: Obiettivo_gandino,
				CONSUNTIVO_GRADINO: Consuntivo_gandino,
				PERC_RAGG_OBIETTIVO: oEntryPiste.PERC_RAGG_OBIETTIVO,
				PERC_RAGG_MBO: oEntryPiste.PERC_RAGG_MBO,
				OBIETTIVO_SIM: oEntryPisteSim.OBIETTIVO_SIM,
				CONSUNTIVO_SIM: oEntryPisteSim.CONSUNTIVO_SIM,
				PERC_RAGG_OBIETTIVO_SIM: oEntryPisteSim.PERC_RAGG_OBIETTIVO_SIM,
				PERC_RAGG_MBO_SIM: oEntryPisteSim.PERC_RAGG_MBO_SIM,
				NOTE: NOTE,
				NOTE_OBIETTIVO: NOTE_OBIETTIVO,
				NOTE_CONSUNTIVO: NOTE_CONSUNTIVO,
				DATETIME_CR: sap.ui.getCore().getModel("PercMboModel").getProperty("/DATETIME_CR"),
				P_SOTTOPISTE: SOTTOPISTE

			};
			/// post operation
			var that = this;
			$.ajax({
				url: this.sServiceUrl + "/",
				type: "GET",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("X-CSRF-Token", "Fetch");
				},
				success: function (data, textStatus, XMLHttpRequest) {
					var token = XMLHttpRequest.getResponseHeader('X-CSRF-Token');
					$.ajax({
						url: "/HANAMDC/STIP/STIPAdmin/services/ModifyPiste.xsjs",
						type: "POST",
						contentType: 'application/json',

						data: JSON.stringify(sPayload),
						beforeSend: function (xhr) {
							xhr.setRequestHeader("X-CSRF-Token", token);
						},
						success: function (data1, textStatus1, XMLHttpRequest1) {
							sap.ui.core.BusyIndicator.hide();
							MessageBox.success("PISTA : " + " " + data1.ID_PISTAVIEW + " got Updated for " + oYears, {
								title: "Success", // default
								onClose: function (sButton) {
									if (sButton === MessageBox.Action.OK) {
										sap.ui.getCore().getModel("BasicAppModel").setProperty("/PisteChange", false);
										sap.ui.core.UIComponent.getRouterFor(that).navTo("Piste", {
											Piste: "Piste",
											str: that.selectedfiscalYearPeriodi
										});
									}
								},
								actions: sap.m.MessageBox.Action.OK,
								emphasizedAction: sap.m.MessageBox.Action.OK
							});

						},
						error: function (data1, textStatus1, XMLHttpRequest1) {
							sap.ui.core.BusyIndicator.hide();
							MessageBox.error("Error while perfoming Salva operation. Please contact administrator.");
							jQuery.sap.log.getLogger().error("Salva operation failed" + textStatus1.toString());

						}
					});
				}
			});

		},
		onCurveSelect: function (oEvent) {
			this.pistestopistecurvmodel = this.getView().getModel("CurvaModel").getObject(oEvent.getSource().getSelectedItem().oBindingContexts
				.CurvaModel.sPath);
			sap.ui.getCore().getModel("PercMboModel").setProperty("/ID_CURVA", this.pistestopistecurvmodel.ID_CURVA);
			sap.ui.getCore().getModel("PercMboModel").setProperty("/ID_TIPO_CURVA", this.pistestopistecurvmodel.ID_TIPO_CURVA);
			var data = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");
			var index = oEvent.getSource().getParent().getParent().getParent().indexOfItem(oEvent.getSource().getParent().getParent());
			if (data.length > 0) {
				data[index].ID_CURVA = this.pistestopistecurvmodel.ID_CURVA;
				data[index].ID_TIPO_CURVA = this.pistestopistecurvmodel.ID_TIPO_CURVA;
				/*data[index].ConsuntivoCurva2 = "";
				data[index].ConsuntivoSimulatoCurva2 = "";
				data[index].Obiettivo = "";
				data[index].Consuntivo = "";
				data[index].ConsuntivoSimulato = "";
				data[index].ObiettivoSimulato = "";*/
				if (this.pistestopistecurvmodel.ID_TIPO_CURVA === "2" || this.pistestopistecurvmodel.ID_TIPO_CURVA === 2) {
					data[index].ConsuntivoValueEnable = true;
				} else {
					data[index].ConsuntivoValueEnable = false;
				}

			}
			this.getView().byId("idTableCreatePiste").getModel("PisteModel").setProperty("/sottopiste", data);
		},
		setCurva2Model: function (ID_CURVA, firstTime, PERC_MBO) {
			var oModel = new sap.ui.model.odata.ODataModel(this.sServiceUrl, true);
			var that = this;
			var sPath;
			var vS_GRADINO = "";
			if (firstTime) {
				sPath = "T_CURVE_RIGHE?$filter=ID_CURVA eq " + ID_CURVA + " and PERC_MBO eq " + PERC_MBO;
				oModel.read(sPath, null, null, false, function (oData) {
					//	var arrayOentry = [];
					var oEntry = {};
					var oCurva2Model = new sap.ui.model.json.JSONModel();
					for (var i = 0; i < oData.results.length; i++) {
						oEntry.PERC_MBO = oData.results[i].PERC_MBO;
						oEntry.S_GRADINO = oData.results[i].S_GRADINO;
						//	arrayOentry.push(oEntry);
						//oEntry = {};
					}
					//	oCurva2Model.setData(arrayOentry);
					//	that.getView().setModel(oCurva2Model, "Curva2Dialog");
					vS_GRADINO = oEntry.S_GRADINO;
				}, function (oError) {
					MessageBox.error("Error in getting Curva 2 MBO and Performance. Please contact administrator.");
				});
				return vS_GRADINO;
			} else {
				sPath = "T_CURVE_RIGHE?$filter=ID_CURVA eq " + ID_CURVA;
				oModel.read(sPath, null, null, false, function (oData) {
					var arrayOentry = [];
					var oEntry = {};
					var oCurva2Model = new sap.ui.model.json.JSONModel();
					for (var i = 0; i < oData.results.length; i++) {
						oEntry.PERC_MBO = oData.results[i].PERC_MBO;
						oEntry.S_GRADINO = oData.results[i].S_GRADINO;
						arrayOentry.push(oEntry);
						oEntry = {};
					}
					oCurva2Model.setSizeLimit(9999999999);
					oCurva2Model.setData(arrayOentry);
					that.getView().setModel(oCurva2Model, "Curva2Dialog");
				}, function (oError) {
					MessageBox.error("Error in getting Curva 2 MBO and Performance. Please contact administrator.");
				});
			}

		},
		calculate: function (data1, sServiceUrl, count) {
			var oObject;
			var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
			var that = this;
			oModel.read("T_CURVE_RIGHE?$filter=ID_CURVA eq " + data1.ID_CURVA, null, null, false, function (oData) {
				var arrayOentry = [];
				var oEntry = {};
				for (var i = 0; i < oData.results.length; i++) {
					oEntry.PERC_MBO = oData.results[i].PERC_MBO;
					oEntry.VALORE_CURVA = oData.results[i].VALORE_CURVA;
					arrayOentry.push(oEntry);
					oEntry = {};
				}
				if (count === 3 || count === 4) { // here count represent the simulato and non simulato calcualtion
					oObject = that.calculate_PistewithSottopiste(arrayOentry, data1, count);
				} else {
					oObject = that.calculate_PistewithoutSottopiste(arrayOentry, data1, count);
				}

			}, function (oError) {
				MessageBox.error("Error in getting Gruppo Pista. Please contact administrator.");
			});
			return oObject;

		},
		calculate_PistewithSottopiste: function (arrayOentry, data1, count) {
			var tmp_MBO = 0;
			var ID_TIPO_CURVA = sap.ui.getCore().getModel("PercMboModel").getProperty("/ID_TIPO_CURVA");
			//	// for the curve type 1 the calculation will be Consuntivo * 100 / Consuntivo with one decimal position
			if (ID_TIPO_CURVA === 1 || data1.ID_TIPO_CURVA === 1) {
				var sortAscArray = this.sortAscMBOData(arrayOentry);
				if (count === 3) {
					var vConsuntivo = parseFloat((data1.Consuntivo.toString()).replace(',', '.').replace(' ', ''));
					var vObiettivo = parseFloat((data1.Obiettivo.toString()).replace(',', '.').replace(' ', ''));
				} else {
					var vConsuntivo = parseFloat((data1.ConsuntivoSimulato.toString()).replace(',', '.').replace(' ', ''));
					var vObiettivo = parseFloat((data1.ObiettivoSimulato.toString()).replace(',', '.').replace(' ', ''));
				}

				var PERC_RAGG_OBIETTIVO = parseFloat((vConsuntivo * 100 / vObiettivo).toFixed(1));
				// after getting the PERC_RAGG_OBIETTIVO value we will check this value against VALORE_CURVA value of the arrayOentry in method calculate.
				// as per algorithm if the p_piste.Perc_Ragg_Obiettivo is < for the first value of % Performance then use the first % MBO
				//  if the p_piste.Perc_Ragg_Obiettivo is > for the last value of % Performance then use the last % MBO
				// getting first value of the array arrayOentry
				if (sortAscArray.length > 0) {
					var firstItem = parseFloat(sortAscArray[0].VALORE_CURVA);
					var lastItem = parseFloat(sortAscArray[sortAscArray.length - 1].VALORE_CURVA);
					if (PERC_RAGG_OBIETTIVO < firstItem) {
						tmp_MBO = sortAscArray[0].PERC_MBO;
					} else if (PERC_RAGG_OBIETTIVO > lastItem) {
						tmp_MBO = sortAscArray[sortAscArray.length - 1].PERC_MBO;
					} else {
						for (var i = 0; i < sortAscArray.length; i++) {
							if (PERC_RAGG_OBIETTIVO === firstItem) {
								tmp_MBO = sortAscArray[i].PERC_MBO;
								break;
							}
						}
						for (var i = 1; i < sortAscArray.length; i++) {
							var k = i;
							var j = i - 1;
							var secondValue = parseFloat(sortAscArray[k].VALORE_CURVA);
							var firstValue = parseFloat(sortAscArray[j].VALORE_CURVA);
							if (PERC_RAGG_OBIETTIVO > firstValue && PERC_RAGG_OBIETTIVO < secondValue) {
								var parameter1 = parseFloat(sortAscArray[k].VALORE_CURVA) - parseFloat(sortAscArray[j].VALORE_CURVA);
								var parameter2 = parseFloat(sortAscArray[k].PERC_MBO) - parseFloat(sortAscArray[j].PERC_MBO);
								var parameter3 = (PERC_RAGG_OBIETTIVO - parseFloat(sortAscArray[j].VALORE_CURVA)).toFixed(1);
								var parameter4 = (parameter3 * parameter2 / parameter1).toFixed(1);
								tmp_MBO = (parseFloat(parameter4) + parseFloat(sortAscArray[j].VALORE_CURVA)).toFixed(1);
								break;

							}

						}

					}
					var tmp_perc1 = sap.ui.getCore().getModel("PercMboModel").getProperty("/PERC_MBO5");
					// calculation of PARZIALE which will be tmp_mbo * percentage enter in Peso column * gate perc_mbo

					var PARZIALE = tmp_MBO * data1.PESO_PERC * tmp_perc1;

				}
				if (count === 3) {
					var oEntryCalculate = {
						OBIETTIVO: vObiettivo,
						CONSUNTIVO: vConsuntivo,
						PERC_RAGG_OBIETTIVO: PERC_RAGG_OBIETTIVO,
						PERC_RAGG_MBO: PARZIALE

					};
				} else {
					var oEntryCalculate = {
						OBIETTIVO_SIM: vObiettivo,
						CONSUNTIVO_SIM: vConsuntivo,
						PERC_RAGG_OBIETTIVO_SIM: PERC_RAGG_OBIETTIVO,
						PERC_RAGG_MBO_SIM: PARZIALE

					};
				}

			} else if (ID_TIPO_CURVA === 3 || data1.ID_TIPO_CURVA === 3) {

				var sortAscArray = this.sortDescMBOData(arrayOentry);
				if (count === 3) {
					var vConsuntivo = parseFloat((data1.Consuntivo.toString()).replace(',', '.').replace(' ', ''));
					var vObiettivo = parseFloat((data1.Obiettivo.toString()).replace(',', '.').replace(' ', ''));
				} else {
					var vConsuntivo = parseFloat((data1.ConsuntivoSimulato.toString()).replace(',', '.').replace(' ', ''));
					var vObiettivo = parseFloat((data1.ObiettivoSimulato.toString()).replace(',', '.').replace(' ', ''));
				}
				var PERC_RAGG_OBIETTIVO = parseFloat((vConsuntivo * 100 / vObiettivo).toFixed(1));
				// after getting the PERC_RAGG_OBIETTIVO value we will check this value against VALORE_CURVA value of the arrayOentry in method calculate.
				// as per algorithm if the p_piste.Perc_Ragg_Obiettivo is < for the first value of % Performance then use the first % MBO
				//  if the p_piste.Perc_Ragg_Obiettivo is > for the last value of % Performance then use the last % MBO
				// getting first value of the array arrayOentry
				if (sortAscArray.length > 0) {
					var firstItem = parseFloat(sortAscArray[0].VALORE_CURVA);
					var lastItem = parseFloat(sortAscArray[sortAscArray.length - 1].VALORE_CURVA);
					if (PERC_RAGG_OBIETTIVO < firstItem) {
						tmp_MBO = sortAscArray[0].PERC_MBO;
					} else if (PERC_RAGG_OBIETTIVO > lastItem) {
						tmp_MBO = sortAscArray[sortAscArray.length - 1].PERC_MBO;
					} else {
						for (var i = 0; i < sortAscArray.length; i++) {
							if (PERC_RAGG_OBIETTIVO === firstItem) {
								tmp_MBO = sortAscArray[i].PERC_MBO;
								break;
							}
						}
						for (var i = 1; i < sortAscArray.length; i++) {
							var k = i;
							var j = i - 1;
							var secondValue = parseFloat(sortAscArray[k].VALORE_CURVA);
							var firstValue = parseFloat(sortAscArray[j].VALORE_CURVA);
							if (PERC_RAGG_OBIETTIVO > firstValue && PERC_RAGG_OBIETTIVO < secondValue) {
								var parameter1 = parseFloat(sortAscArray[k].VALORE_CURVA) - parseFloat(sortAscArray[j].VALORE_CURVA);
								var parameter2 = parseFloat(sortAscArray[k].PERC_MBO) - parseFloat(sortAscArray[j].PERC_MBO);
								var parameter3 = (PERC_RAGG_OBIETTIVO - parseFloat(sortAscArray[j].VALORE_CURVA)).toFixed(1);
								var parameter4 = (parameter3 * parameter2 / parameter1).toFixed(1);
								tmp_MBO = (parseFloat(parameter4) + parseFloat(sortAscArray[j].VALORE_CURVA)).toFixed(1);
								break;
							}

						}

					}
					var tmp_perc1 = sap.ui.getCore().getModel("PercMboModel").getProperty("/PERC_MBO5");
					// calculation of PARZIALE which will be tmp_mbo * percentage enter in Peso column * gate perc_mbo

					var PARZIALE = tmp_MBO * data1.PESO_PERC * tmp_perc1;

				}
				if (count === 3) {
					var oEntryCalculate = {
						OBIETTIVO: vObiettivo,
						CONSUNTIVO: vConsuntivo,
						PERC_RAGG_OBIETTIVO: PERC_RAGG_OBIETTIVO,
						PERC_RAGG_MBO: PARZIALE

					};
				} else {
					var oEntryCalculate = {
						OBIETTIVO_SIM: vObiettivo,
						CONSUNTIVO_SIM: vConsuntivo,
						PERC_RAGG_OBIETTIVO_SIM: PERC_RAGG_OBIETTIVO,
						PERC_RAGG_MBO_SIM: PARZIALE

					};
				}
			} else if (ID_TIPO_CURVA === 2 || data1.ID_TIPO_CURVA === 2) {

				var sortAscArray = this.sortAscMBOData(arrayOentry);
				if (count === 3) {
					var vConsuntivo = parseFloat(parseFloat((data1.ConsuntivoCurva2.toString()).replace(',', '.').replace(' ', '')) / 100);
					var vObiettivo = parseFloat((data1.Obiettivo.toString()).replace(',', '.').replace(' ', ''));
				} else {
					var vConsuntivo = parseFloat(parseFloat((data1.ConsuntivoSimulatoCurva2.toString()).replace(',', '.').replace(' ', '')) / 100);
					var vObiettivo = parseFloat((data1.ObiettivoSimulato.toString()).replace(',', '.').replace(' ', ''));
				}

				var PERC_RAGG_OBIETTIVO = parseFloat((vConsuntivo * 100 / vObiettivo).toFixed(1));

				if (sortAscArray.length > 0) {

					tmp_MBO = vConsuntivo;
					var tmp_perc1 = sap.ui.getCore().getModel("PercMboModel").getProperty("/PERC_MBO5");
					// calculation of PARZIALE which will be tmp_mbo * percentage enter in Peso column * gate perc_mbo

					var PARZIALE = tmp_MBO * data1.PESO_PERC * tmp_perc1;

				}
				if (count === 3) {
					var oEntryCalculate = {
						OBIETTIVO: vObiettivo,
						CONSUNTIVO: vConsuntivo,
						PERC_RAGG_OBIETTIVO: PERC_RAGG_OBIETTIVO,
						PERC_RAGG_MBO: PARZIALE

					};
				} else {
					var oEntryCalculate = {
						OBIETTIVO_SIM: vObiettivo,
						CONSUNTIVO_SIM: vConsuntivo,
						PERC_RAGG_OBIETTIVO_SIM: PERC_RAGG_OBIETTIVO,
						PERC_RAGG_MBO_SIM: PARZIALE

					};
				}

			} else {
				//	var vConsuntivo = parseFloat((data1.Consuntivo.toString()).replace(',', '.').replace(' ', ''));
				//	var vObiettivo = parseFloat((data1.Obiettivo.toString()).replace(',', '.').replace(' ', ''));
				var oEntryCalculate = {
					OBIETTIVO: ((vObiettivo) ? vObiettivo : 0.0),
					CONSUNTIVO: ((vConsuntivo) ? vConsuntivo : 0.0),
					PERC_RAGG_OBIETTIVO: 0.0,
					PERC_RAGG_MBO: 0.0

				};
				// 	var vConsuntivo1 = parseFloat((data1.Consuntivo.toString()).replace(',', '.').replace(' ', ''));
				//	var vObiettivo1 = parseFloat((data1.Obiettivo.toString()).replace(',', '.').replace(' ', ''));
				var oEntryCalculate = {
					OBIETTIVO: ((vObiettivo) ? vObiettivo : 0.0),
					CONSUNTIVO: ((vConsuntivo) ? vConsuntivo : 0.0),
					PERC_RAGG_OBIETTIVO: 0.0,
					PERC_RAGG_MBO: 0.0

				};
				if (count === 3) {
					var oEntryCalculate = {
						OBIETTIVO: ((vObiettivo) ? vObiettivo : 0.0),
						CONSUNTIVO: ((vConsuntivo) ? vConsuntivo : 0.0),
						PERC_RAGG_OBIETTIVO: 0.0,
						PERC_RAGG_MBO: 0.0

					};
				} else {
					var oEntryCalculate = {
						OBIETTIVO_SIM: ((vObiettivo) ? vObiettivo : 0.0),
						CONSUNTIVO_SIM: ((vConsuntivo) ? vConsuntivo : 0.0),
						PERC_RAGG_OBIETTIVO_SIM: 0.0,
						PERC_RAGG_MBO_SIM: 0.0

					};
				}
			}
			sap.ui.core.BusyIndicator.hide();

			return oEntryCalculate;
		},
		calculate_PistewithoutSottopiste: function (arrayOentry, data1, count) {
			var tmp_MBO;
			var ID_TIPO_CURVA = sap.ui.getCore().getModel("PercMboModel").getProperty("/ID_TIPO_CURVA");
			//	// for the curve type 1 the calculation will be Consuntivo * 100 / Consuntivo with one decimal position
			if (ID_TIPO_CURVA === 1 || data1.ID_TIPO_CURVA === 1) {
				var sortAscArray = this.sortAscMBOData(arrayOentry);
				if (count === 1) {
					var vConsuntivo = parseFloat((data1.Consuntivo.toString()).replace(',', '.').replace(' ', ''));
					var vObiettivo = parseFloat((data1.Obiettivo.toString()).replace(',', '.').replace(' ', ''));
				} else {
					var vConsuntivo = parseFloat((data1.ConsuntivoSimulato.toString()).replace(',', '.').replace(' ', ''));
					var vObiettivo = parseFloat((data1.ObiettivoSimulato.toString()).replace(',', '.').replace(' ', ''));
				}

				var PERC_RAGG_OBIETTIVO = parseFloat((vConsuntivo * 100 / vObiettivo).toFixed(1));
				// after getting the PERC_RAGG_OBIETTIVO value we will check this value against VALORE_CURVA value of the arrayOentry in method calculate.
				// as per algorithm if the p_piste.Perc_Ragg_Obiettivo is < for the first value of % Performance then use the first % MBO
				//  if the p_piste.Perc_Ragg_Obiettivo is > for the last value of % Performance then use the last % MBO
				// getting first value of the array arrayOentry
				if (sortAscArray.length > 0) {
					var firstItem = parseFloat(sortAscArray[0].VALORE_CURVA);
					var lastItem = parseFloat(sortAscArray[sortAscArray.length - 1].VALORE_CURVA);
					if (PERC_RAGG_OBIETTIVO < firstItem) {
						tmp_MBO = sortAscArray[0].PERC_MBO;
					} else if (PERC_RAGG_OBIETTIVO > lastItem) {
						tmp_MBO = sortAscArray[sortAscArray.length - 1].PERC_MBO;
					} else {
						for (var i = 0; i < sortAscArray.length; i++) {
							if (PERC_RAGG_OBIETTIVO === firstItem) {
								tmp_MBO = sortAscArray[i].PERC_MBO;
								break;
							}
						}
						for (var i = 1; i < sortAscArray.length; i++) {
							var k = i;
							var j = i - 1;
							var secondValue = parseFloat(sortAscArray[k].VALORE_CURVA);
							var firstValue = parseFloat(sortAscArray[j].VALORE_CURVA);
							if (PERC_RAGG_OBIETTIVO > firstValue && PERC_RAGG_OBIETTIVO < secondValue) {
								var parameter1 = parseFloat(sortAscArray[k].VALORE_CURVA) - parseFloat(sortAscArray[j].VALORE_CURVA);
								var parameter2 = parseFloat(sortAscArray[k].PERC_MBO) - parseFloat(sortAscArray[j].PERC_MBO);
								var parameter3 = (PERC_RAGG_OBIETTIVO - parseFloat(sortAscArray[j].VALORE_CURVA)).toFixed(1);
								var parameter4 = (parameter3 * parameter2 / parameter1).toFixed(1);
								tmp_MBO = (parseFloat(parameter4) + parseFloat(sortAscArray[j].VALORE_CURVA)).toFixed(1);
								break;

							}

						}

					}
					var tmp_perc1 = sap.ui.getCore().getModel("PercMboModel").getProperty("/PERC_MBO1");
					var tmp_perc2 = sap.ui.getCore().getModel("PercMboModel").getProperty("/PERC_MBO3");
					var tmp_perc_mbo, Perc_Ragg_MBO, tmp_perc_mbo1;
					if (tmp_perc1 && !tmp_perc2) {
						var tmp_perc_mbo = parseFloat(parseFloat(tmp_perc1) / 100).toFixed(1);
						var Perc_Ragg_MBO = (parseFloat(tmp_perc_mbo) * parseFloat(tmp_MBO)).toFixed(1);
					} else if (!tmp_perc1 && tmp_perc2) {
						var tmp_perc_mbo = parseFloat(parseFloat(tmp_perc2) / 100).toFixed(1);
						var Perc_Ragg_MBO = (parseFloat(tmp_perc_mbo) * parseFloat(tmp_MBO)).toFixed(1);
					} else if (tmp_perc1 && tmp_perc2) {
						var tmp_perc_mbo = parseFloat(parseFloat(tmp_perc1) / 100).toFixed(1);
						var tmp_perc_mbo1 = parseFloat(parseFloat(tmp_perc2) / 100).toFixed(1);
						var Perc_Ragg_MBO = (parseFloat(tmp_perc_mbo1) * parseFloat(tmp_perc_mbo) * parseFloat(tmp_MBO)).toFixed(1);
					} else {
						var Perc_Ragg_MBO = 0;
					}
				}
				if (count === 1) {
					var oEntryCalculate = {
						OBIETTIVO: vObiettivo,
						CONSUNTIVO: vConsuntivo,
						PERC_RAGG_OBIETTIVO: PERC_RAGG_OBIETTIVO,
						PERC_RAGG_MBO: Perc_Ragg_MBO

					};
				} else {
					var oEntryCalculate = {
						OBIETTIVO_SIM: vObiettivo,
						CONSUNTIVO_SIM: vConsuntivo,
						PERC_RAGG_OBIETTIVO_SIM: PERC_RAGG_OBIETTIVO,
						PERC_RAGG_MBO_SIM: Perc_Ragg_MBO

					};
				}

			} else if (ID_TIPO_CURVA === 3 || data1.ID_TIPO_CURVA === 3) {

				var sortAscArray = this.sortDescMBOData(arrayOentry);
				if (count === 1) {
					var vConsuntivo = parseFloat((data1.Consuntivo.toString()).replace(',', '.').replace(' ', ''));
					var vObiettivo = parseFloat((data1.Obiettivo.toString()).replace(',', '.').replace(' ', ''));
				} else {
					var vConsuntivo = parseFloat((data1.ConsuntivoSimulato.toString()).replace(',', '.').replace(' ', ''));
					var vObiettivo = parseFloat((data1.ObiettivoSimulato.toString()).replace(',', '.').replace(' ', ''));
				}
				var PERC_RAGG_OBIETTIVO = parseFloat((vConsuntivo * 100 / vObiettivo).toFixed(1));
				// after getting the PERC_RAGG_OBIETTIVO value we will check this value against VALORE_CURVA value of the arrayOentry in method calculate.
				// as per algorithm if the p_piste.Perc_Ragg_Obiettivo is < for the first value of % Performance then use the first % MBO
				//  if the p_piste.Perc_Ragg_Obiettivo is > for the last value of % Performance then use the last % MBO
				// getting first value of the array arrayOentry
				if (sortAscArray.length > 0) {
					var firstItem = parseFloat(sortAscArray[0].VALORE_CURVA);
					var lastItem = parseFloat(sortAscArray[sortAscArray.length - 1].VALORE_CURVA);
					if (PERC_RAGG_OBIETTIVO < firstItem) {
						tmp_MBO = sortAscArray[0].PERC_MBO;
					} else if (PERC_RAGG_OBIETTIVO > lastItem) {
						tmp_MBO = sortAscArray[sortAscArray.length - 1].PERC_MBO;
					} else {
						for (var i = 0; i < sortAscArray.length; i++) {
							if (PERC_RAGG_OBIETTIVO === firstItem) {
								tmp_MBO = sortAscArray[i].PERC_MBO;
								break;
							}
						}
						for (var i = 1; i < sortAscArray.length; i++) {
							var k = i;
							var j = i - 1;
							var secondValue = parseFloat(sortAscArray[k].VALORE_CURVA);
							var firstValue = parseFloat(sortAscArray[j].VALORE_CURVA);
							if (PERC_RAGG_OBIETTIVO > firstValue && PERC_RAGG_OBIETTIVO < secondValue) {
								var parameter1 = parseFloat(sortAscArray[k].VALORE_CURVA) - parseFloat(sortAscArray[j].VALORE_CURVA);
								var parameter2 = parseFloat(sortAscArray[k].PERC_MBO) - parseFloat(sortAscArray[j].PERC_MBO);
								var parameter3 = (PERC_RAGG_OBIETTIVO - parseFloat(sortAscArray[j].VALORE_CURVA)).toFixed(1);
								var parameter4 = (parameter3 * parameter2 / parameter1).toFixed(1);
								tmp_MBO = (parseFloat(parameter4) + parseFloat(sortAscArray[j].VALORE_CURVA)).toFixed(1);
								break;
							}

						}

					}
					var tmp_perc1 = sap.ui.getCore().getModel("PercMboModel").getProperty("/PERC_MBO1");
					var tmp_perc2 = sap.ui.getCore().getModel("PercMboModel").getProperty("/PERC_MBO3");
					var tmp_perc_mbo, Perc_Ragg_MBO, tmp_perc_mbo1;
					if (tmp_perc1 && !tmp_perc2) {
						var tmp_perc_mbo = parseFloat(parseFloat(tmp_perc1) / 100).toFixed(1);
						var Perc_Ragg_MBO = (parseFloat(tmp_perc_mbo) * parseFloat(tmp_MBO)).toFixed(1);
					} else if (!tmp_perc1 && tmp_perc2) {
						var tmp_perc_mbo = parseFloat(parseFloat(tmp_perc2) / 100).toFixed(1);
						var Perc_Ragg_MBO = (parseFloat(tmp_perc_mbo) * parseFloat(tmp_MBO)).toFixed(1);
					} else if (tmp_perc1 && tmp_perc2) {
						var tmp_perc_mbo = parseFloat(parseFloat(tmp_perc1) / 100).toFixed(1);
						var tmp_perc_mbo1 = parseFloat(parseFloat(tmp_perc2) / 100).toFixed(1);
						var Perc_Ragg_MBO = (parseFloat(tmp_perc_mbo1) * parseFloat(tmp_perc_mbo) * parseFloat(tmp_MBO)).toFixed(1);
					} else {
						var Perc_Ragg_MBO = 0;
					}
				}
				if (count === 1) {
					var oEntryCalculate = {
						OBIETTIVO: vObiettivo,
						CONSUNTIVO: vConsuntivo,
						PERC_RAGG_OBIETTIVO: PERC_RAGG_OBIETTIVO,
						PERC_RAGG_MBO: Perc_Ragg_MBO

					};
				} else {
					var oEntryCalculate = {
						OBIETTIVO_SIM: vObiettivo,
						CONSUNTIVO_SIM: vConsuntivo,
						PERC_RAGG_OBIETTIVO_SIM: PERC_RAGG_OBIETTIVO,
						PERC_RAGG_MBO_SIM: Perc_Ragg_MBO

					};
				}
			} else if (ID_TIPO_CURVA === 2 || data1.ID_TIPO_CURVA === 2) {

				var sortAscArray = this.sortAscMBOData(arrayOentry);
				if (count === 1) {
					var vConsuntivo = parseFloat(parseFloat((data1.ConsuntivoCurva2.toString()).replace(',', '.').replace(' ', '')) / 100);
					var vObiettivo = parseFloat((data1.Obiettivo.toString()).replace(',', '.').replace(' ', ''));
				} else {
					var vConsuntivo = parseFloat(parseFloat((data1.ConsuntivoSimulatoCurva2.toString()).replace(',', '.').replace(' ', '')) / 100);
					var vObiettivo = parseFloat((data1.ObiettivoSimulato.toString()).replace(',', '.').replace(' ', ''));
				}

				var PERC_RAGG_OBIETTIVO = parseFloat((vConsuntivo * 100 / vObiettivo).toFixed(1));

				if (sortAscArray.length > 0) {

					tmp_MBO = vConsuntivo;
					var tmp_perc1 = sap.ui.getCore().getModel("PercMboModel").getProperty("/PERC_MBO1");
					var tmp_perc2 = sap.ui.getCore().getModel("PercMboModel").getProperty("/PERC_MBO3");
					var tmp_perc_mbo, Perc_Ragg_MBO, tmp_perc_mbo1;
					if (tmp_perc1 && !tmp_perc2) {
						var tmp_perc_mbo = parseFloat(parseFloat(tmp_perc1) / 100).toFixed(1);
						var Perc_Ragg_MBO = (parseFloat(tmp_perc_mbo) * parseFloat(tmp_MBO)).toFixed(1);
					} else if (!tmp_perc1 && tmp_perc2) {
						var tmp_perc_mbo = parseFloat(parseFloat(tmp_perc2) / 100).toFixed(1);
						var Perc_Ragg_MBO = (parseFloat(tmp_perc_mbo) * parseFloat(tmp_MBO)).toFixed(1);
					} else if (tmp_perc1 && tmp_perc2) {
						var tmp_perc_mbo = parseFloat(parseFloat(tmp_perc1) / 100).toFixed(1);
						var tmp_perc_mbo1 = parseFloat(parseFloat(tmp_perc2) / 100).toFixed(1);
						var Perc_Ragg_MBO = (parseFloat(tmp_perc_mbo1) * parseFloat(tmp_perc_mbo) * parseFloat(tmp_MBO)).toFixed(1);
					} else {
						var Perc_Ragg_MBO = tmp_MBO;
					}

				}
				if (count === 1) {
					var oEntryCalculate = {
						OBIETTIVO: vObiettivo,
						CONSUNTIVO: vConsuntivo,
						PERC_RAGG_OBIETTIVO: PERC_RAGG_OBIETTIVO,
						PERC_RAGG_MBO: Perc_Ragg_MBO

					};
				} else {
					var oEntryCalculate = {
						OBIETTIVO_SIM: vObiettivo,
						CONSUNTIVO_SIM: vConsuntivo,
						PERC_RAGG_OBIETTIVO_SIM: PERC_RAGG_OBIETTIVO,
						PERC_RAGG_MBO_SIM: Perc_Ragg_MBO

					};
				}

			} else {
				//	var vConsuntivo = parseFloat((data1.Consuntivo.toString()).replace(',', '.').replace(' ', ''));
				//	var vObiettivo = parseFloat((data1.Obiettivo.toString()).replace(',', '.').replace(' ', ''));
				var oEntryCalculate = {
					OBIETTIVO: ((vObiettivo) ? vObiettivo : 0.0),
					CONSUNTIVO: ((vConsuntivo) ? vConsuntivo : 0.0),
					PERC_RAGG_OBIETTIVO: 0.0,
					PERC_RAGG_MBO: 0.0

				};
				// 	var vConsuntivo1 = parseFloat((data1.Consuntivo.toString()).replace(',', '.').replace(' ', ''));
				//	var vObiettivo1 = parseFloat((data1.Obiettivo.toString()).replace(',', '.').replace(' ', ''));
				var oEntryCalculate = {
					OBIETTIVO: ((vObiettivo) ? vObiettivo : 0.0),
					CONSUNTIVO: ((vConsuntivo) ? vConsuntivo : 0.0),
					PERC_RAGG_OBIETTIVO: 0.0,
					PERC_RAGG_MBO: 0.0

				};
				if (count === 1) {
					var oEntryCalculate = {
						OBIETTIVO: ((vObiettivo) ? vObiettivo : 0.0),
						CONSUNTIVO: ((vConsuntivo) ? vConsuntivo : 0.0),
						PERC_RAGG_OBIETTIVO: 0.0,
						PERC_RAGG_MBO: 0.0

					};
				} else {
					var oEntryCalculate = {
						OBIETTIVO_SIM: ((vObiettivo) ? vObiettivo : 0.0),
						CONSUNTIVO_SIM: ((vConsuntivo) ? vConsuntivo : 0.0),
						PERC_RAGG_OBIETTIVO_SIM: 0.0,
						PERC_RAGG_MBO_SIM: 0.0

					};
				}
			}
			sap.ui.core.BusyIndicator.hide();

			return oEntryCalculate;
		},
		sortAscMBOData: function (arr) {
			var sortAscArr = arr.sort(function (a, b) {

				if ((a.PERC_MBO !== "") && (b.PERC_MBO !== "")) {
					if (a.PERC_MBO < b.PERC_MBO) //sort ascending
						return -1;
					if (a.PERC_MBO > b.PERC_MBO)
						return 1;
					return 0; //default return value (no sorting)					
				}

			});

			return sortAscArr;
		},

		sortDescMBOData: function (arr) {
			var sortDescArr = arr.sort(function (a, b) {

				if ((a.PERC_MBO !== "") && (b.PERC_MBO !== "")) {
					if (parseInt(a.PERC_MBO) > parseInt(b.PERC_MBO)) //sort descending
						return -1;
					if (parseInt(a.PERC_MBO) < parseInt(b.PERC_MBO))
						return 1;
					return 0; //default return value (no sorting)					
				}

			});

			return sortDescArr;
		},
		clearFields: function (oEvent) {
			if (this.getView().byId("desc").getValue()) {
				this.getView().byId("desc").setValue("");
			}

			if (this.getView().byId("MI").getSelectedItem()) {
				this.getView().byId("MI").setSelectedKey("");
			}
			if (this.getView().byId("MI1").getSelectedItem()) {
				this.getView().byId("MI1").setSelectedKey("");
			}
			if (this.getView().byId("MI3").getSelectedItem()) {
				this.getView().byId("MI3").setSelectedKey("");
			}
			if (this.getView().byId("Mul1").getSelectedItem()) {
				this.getView().byId("Mul1").setSelectedKey("");
			}
			if (this.getView().byId("Mul2").getSelectedItem()) {
				this.getView().byId("Mul2").setSelectedKey("");
			}
			if (this.getView().byId("Additivo").getSelectedItem()) {
				this.getView().byId("Additivo").setSelectedKey("");
			}
			if (this.getView().byId("Soglia").getValue()) {
				this.getView().byId("Soglia").setValue("");
			}
			if (this.getView().byId("curva2").getSelectedItem()) {
				this.getView().byId("curva2").setSelectedKey("");
			}
			if (this.getView().byId("ObiettivoComplessivo").getValue()) {
				this.getView().byId("ObiettivoComplessivo").setValue("");
			}
			if (this.getView().byId("ConsuntivoComplessivo").getValue()) {
				this.getView().byId("ConsuntivoComplessivo").setValue("");
			}
			if (this.byId("Pers").getSelectedButton()) {
				this.byId("Pers").getSelectedButton().setSelected(false);
			}
		},
		onAnnulla: function (oEvent) {
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/PisteChange", false);
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Piste", {
				Piste: "Piste",
				str: this.selectedfiscalYearPeriodi
			});
		},
		onConsuntivoValueHelp: function (oEvent) {
			this.firstConsuntivo = true;
			if (oEvent.getSource().getParent().getBindingContextPath()) {
				this.selectedIndexofRow = parseInt(oEvent.getSource().getParent().getBindingContextPath().split("/")[2]);
			}
			var data = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");
			this.firstTime = false;
			var PERC_MBO = 0;
			this.setCurva2Model(data[this.selectedIndexofRow].ID_CURVA, this.firstTime, PERC_MBO);
			this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.Curva2Dialog", this);
			this.getView().addDependent(this._oValueHelpDialog);
			this._oValueHelpDialog.setModel(this.getView().getModel("Curva2Dialog"), "Curva2Dialog");
			this._oValueHelpDialog.open();
		},
		onConsuntivoSimulatoValueHelp: function (oEvent) {
			this.firstConsuntivo = false;
			if (oEvent.getSource().getParent().getBindingContextPath()) {
				this.selectedIndexofRow = parseInt(oEvent.getSource().getParent().getBindingContextPath().split("/")[2]);
			}
			var data = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");
			this.firstTime = false;
			var PERC_MBO = 0;
			this.setCurva2Model(data[this.selectedIndexofRow].ID_CURVA, this.firstTime, PERC_MBO);
			this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.Curva2Dialog", this);
			this.getView().addDependent(this._oValueHelpDialog);
			this._oValueHelpDialog.setModel(this.getView().getModel("Curva2Dialog"), "Curva2Dialog");
			this._oValueHelpDialog.open();
		},
		onCloseDialog: function (oEvent) {
			this._oValueHelpDialog.destroy();
		},
		onPressCurva2Dialog: function (oEvent) {
			var object = this.getView().getModel("Curva2Dialog").getObject(oEvent.getSource().getBindingContextPath());
			var data = this.getView().byId("idTableCreatePiste").getModel("PisteModel").getProperty("/sottopiste");
			if (this.firstConsuntivo) {
				data[this.selectedIndexofRow].Consuntivo = object.S_GRADINO;
				data[this.selectedIndexofRow].ConsuntivoCurva2 = object.PERC_MBO;
			} else {
				data[this.selectedIndexofRow].ConsuntivoSimulato = object.S_GRADINO;
				data[this.selectedIndexofRow].ConsuntivoSimulatoCurva2 = object.PERC_MBO;
			}
			this.getView().byId("idTableCreatePiste").getModel("PisteModel").setProperty("/sottopiste", data);
			this.onCloseDialog(this);
		}

	});
});