sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
], function (Controller, MessageBox, JSONModel, Filter, FilterOperator, MessageToast) {
	"use strict";

	return Controller.extend("stipAdmin.stipAdmin.controller.EffettuaSimulata", {

		onInit: function () {

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("EffettuaSimulata").attachPatternMatched(this._onObjectMatched, this);
		},

		//Every time we enter in this controller
		_onObjectMatched: function (oEvent) {
			this.selYear = "";
			sap.ui.getCore().oArgumentsReale = oEvent.getParameter("arguments");
			var selectedfiscalYearPeriodi = sap.ui.getCore().oArgumentsReale.ID;
			this.getFiscalYear(selectedfiscalYearPeriodi);
		},

		//get fiscal year
		getFiscalYear: function (selectedfiscalYearPeriodi) {
			var that = this;
			var oBaseModel = this.getOwnerComponent().getModel();
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
						this.selYear = oResponse.data.results[0].DESCR_PERIODO;
						this.selYear = this.selYear.substring(12);
						this._executeRead("GENERAL");
					}
				}.bind(this),
				error: function (oError) {
					MessageBox.error("Error in getting Fiscal year. Please contact administrator.");
					that.busyDialog.close();
				}
			};
			var path = "/PERIODI_RIFERIMENTO?$format=json";
			oBaseModel.read(path, mParameters);
		},

		//Read Hana DB 
		_getHanaData: function (Entity, Filters) {
			var oBaseModel = this.getOwnerComponent().getModel();
			return new Promise(
				function (resolve, reject) {
					oBaseModel.read(Entity, {
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

		//Payload for json consuntivazione rows
		_generateDummyPayload: function (r, oDataIn, monthEnd1, monthEnd2, monthEnd3, monthEnd4) {
			var tableData1 = this._getFilterConsuntivi(oDataIn, monthEnd1);
			var tableData2 = this._getFilterConsuntivi(oDataIn, monthEnd2);
			var tableData3 = this._getFilterConsuntivi(oDataIn, monthEnd3);
			var tableData4 = this._getFilterConsuntivi(oDataIn, monthEnd4);
			this.oEntry1 = {
				NRCONSUNTIVAZIONE: tableData1.length + 1,
				AvviaElaborazione: "Elabora Consuntivi",
				DATA_CONSUNTIVAZIONE: "30" + "/" + "06" + "/" + r[0],
				DATALETTERA: "15" + "/" + "07" + "/" + r[0],
				DATAPAGAMENTO: "27" + "/" + "07" + "/" + r[0],
				TOTALEMATRICOLE: "0",
				UTENTE_ULTIMA_MODIFICA: "",
				DATA_UM: "",
				RIGHE_NUOVE: 0,
				RIGHE_MODIFICATE: 0,
				NOTE: "",
				rowButton: true,
				ID_CONSUNTIVO: "New",
				SN_CONGELATA: "N"
			};
			this.oEntry2 = {
				NRCONSUNTIVAZIONE: tableData2.length + 1,
				AvviaElaborazione: "Elabora Consuntivi",
				DATA_CONSUNTIVAZIONE: "30" + "/" + "09" + "/" + r[0],
				DATALETTERA: "15" + "/" + "10" + "/" + r[0],
				DATAPAGAMENTO: "27" + "/" + "10" + "/" + r[0],
				TOTALEMATRICOLE: "0",
				UTENTE_ULTIMA_MODIFICA: "",
				DATA_UM: "",
				RIGHE_NUOVE: 0,
				RIGHE_MODIFICATE: 0,
				NOTE: "",
				rowButton: true,
				ID_CONSUNTIVO: "New",
				SN_CONGELATA: "N"
			};
			this.oEntry3 = {
				NRCONSUNTIVAZIONE: tableData3.length + 1,
				AvviaElaborazione: "Elabora Consuntivi",
				DATA_CONSUNTIVAZIONE: "31" + "/" + "12" + "/" + r[0],
				DATALETTERA: "15" + "/" + "01" + "/" + r[1],
				DATAPAGAMENTO: "27" + "/" + "01" + "/" + r[1],
				TOTALEMATRICOLE: "0",
				UTENTE_ULTIMA_MODIFICA: "",
				DATA_UM: "",
				RIGHE_NUOVE: 0,
				RIGHE_MODIFICATE: 0,
				NOTE: "",
				rowButton: true,
				ID_CONSUNTIVO: "New",
				SN_CONGELATA: "N"
			};
			this.oEntry4 = {
				NRCONSUNTIVAZIONE: tableData4.length + 1,
				AvviaElaborazione: "Elabora Consuntivi",
				DATA_CONSUNTIVAZIONE: "31" + "/" + "03" + "/" + r[1],
				DATALETTERA: "15" + "/" + "04" + "/" + r[1],
				DATAPAGAMENTO: "27" + "/" + "04" + "/" + r[1],
				TOTALEMATRICOLE: "0",
				UTENTE_ULTIMA_MODIFICA: "",
				DATA_UM: "",
				RIGHE_NUOVE: 0,
				RIGHE_MODIFICATE: 0,
				NOTE: "",
				rowButton: true,
				ID_CONSUNTIVO: "New",
				SN_CONGELATA: "N"
			};
		},

		//Handling scenario with no data , all json files
		_handleNoData: function (tableData1, tableData2, tableData3, tableData4) {
			if (!tableData1) {
				var tableData1 = [];
				tableData1.push(that.oEntry1);
				var JsModel1 = new sap.ui.model.json.JSONModel(tableData1);
				that.getView().setModel(JsModel1, "tblModel1");
				that.getView().getModel("oModelBtn").setProperty("/VisibilityBtn1", false);
			}
			if (!tableData2) {
				var tableData2 = [];
				tableData2.push(that.oEntry2);
				var JsModel2 = new sap.ui.model.json.JSONModel(tableData2);
				that.getView().setModel(JsModel2, "tblModel2");
				that.getView().getModel("oModelBtn").setProperty("/VisibilityBtn2", false);
			}
			if (!tableData3) {
				var tableData3 = [];
				tableData3.push(that.oEntry3);
				var JsModel3 = new sap.ui.model.json.JSONModel(tableData3);
				that.getView().setModel(JsModel3, "tblModel3");
				that.getView().getModel("oModelBtn").setProperty("/VisibilityBtn3", false);
			}
			if (!tableData4) {
				var tableData4 = [];
				tableData4.push(that.oEntry4);
				var JsModel4 = new sap.ui.model.json.JSONModel(tableData4);
				that.getView().setModel(JsModel4, "tblModel4");
				that.getView().getModel("oModelBtn").setProperty("/VisibilityBtn4", false);
			}
		},

		//Filter array based on data consuntivazione
		_getFilterConsuntivi: function (arr, value) {
			return arr.filter(function (el) {
				return el.DATA_CONSUNTIVAZIONE === value;
			});
		},

		//Sorting of each table
		_CustomSorter: function (arr, valueToSort) {
			arr.sort(function (a, b) {
				if (a[valueToSort] > b[valueToSort]) {
					return 1;
				} else {
					return -1;
				}
			});
		},

		//Manage Table right name to the button and dummy entries
		_manageTable: function (arrIn, entry, buttonId) {
			var arrOut;
			for (var j = 0; j < arrIn.length; j++) {
				arrIn[j].AvviaElaborazione = "Elabora Consuntivi";
				arrIn[j].NOTE = arrIn[j].NOTE.split("<BR>").join("\n")
				if (arrIn[j].SN_CONGELATA === "S") {
					arrIn[j].AvviaElaborazione = "Consuntivazione Congelata";
					arrIn[j].rowButton = false;
				}
				if (arrIn.length > 1 && arrIn[j].SN_CONGELATA === "N") {
					arrIn[j].AvviaElaborazione = "Elabora Consuntivi Delta";
				}
			};
			if (arrIn.length === 0 || arrIn[arrIn.length - 1].SN_CONGELATA === "S") {
				var Copy = JSON.parse(JSON.stringify(entry))
				if (arrIn.length > 0) {
					Copy.AvviaElaborazione = "Elabora Consuntivi Delta"
				}
				arrIn.push(Copy);
			}
			var z = arrIn.length - 1;
			if (arrIn[z].TOTALEMATRICOLE == "0" || arrIn[z].TOTALEMATRICOLE === null) {
				this.getView().getModel("oModelBtn").setProperty(buttonId, false);
			}
			arrOut = arrIn;
			return arrOut;
		},

		//Manipulate the data , separation by date , sorting , right naming of the button , manage congela , add json for new consuntivazione
		_handleData: function (oDataIn, monthEnd1, monthEnd2, monthEnd3, monthEnd4) {
			var that = this;
			//Divide in 4 tables
			var tableData1 = this._getFilterConsuntivi(oDataIn, monthEnd1);
			var tableData2 = this._getFilterConsuntivi(oDataIn, monthEnd2);
			var tableData3 = this._getFilterConsuntivi(oDataIn, monthEnd3);
			var tableData4 = this._getFilterConsuntivi(oDataIn, monthEnd4);

			//Sort Each table
			this._CustomSorter(tableData1, "ID_CONSUNTIVO");
			this._CustomSorter(tableData2, "ID_CONSUNTIVO");
			this._CustomSorter(tableData3, "ID_CONSUNTIVO");
			this._CustomSorter(tableData4, "ID_CONSUNTIVO");

			//Handle the content of each table
			tableData1 = this._manageTable(tableData1, that.oEntry1, "/VisibilityBtn1");
			tableData2 = this._manageTable(tableData2, that.oEntry2, "/VisibilityBtn2");
			tableData3 = this._manageTable(tableData3, that.oEntry3, "/VisibilityBtn3");
			tableData4 = this._manageTable(tableData4, that.oEntry4, "/VisibilityBtn4");

			//Bind the data
			var JsModel1 = new sap.ui.model.json.JSONModel(tableData1);
			that.getView().setModel(JsModel1, "tblModel1");
			var JsModel2 = new sap.ui.model.json.JSONModel(tableData2);
			that.getView().setModel(JsModel2, "tblModel2");
			var JsModel3 = new sap.ui.model.json.JSONModel(tableData3);
			that.getView().setModel(JsModel3, "tblModel3");
			var JsModel4 = new sap.ui.model.json.JSONModel(tableData4);
			that.getView().setModel(JsModel4, "tblModel4");

			//Scenario when I have no Data
			if (oDataIn.length === 0) {
				this._handleNoData(tableData1, tableData2, tableData3, tableData4);
			}
		},
		//Generate Or filer using dates
		_generateFilters: function (monthEnd1, monthEnd2, monthEnd3, monthEnd4) {
			var multiFilter = [];
			multiFilter.push(new Filter("DATA_CONSUNTIVAZIONE", "EQ", monthEnd1));
			multiFilter.push(new Filter("DATA_CONSUNTIVAZIONE", "EQ", monthEnd2));
			multiFilter.push(new Filter("DATA_CONSUNTIVAZIONE", "EQ", monthEnd3));
			multiFilter.push(new Filter("DATA_CONSUNTIVAZIONE", "EQ", monthEnd4));
			var z = new Filter({
				filters: multiFilter,
				and: false
			});
			var result = [];
			result.push(z);
			return result;
		},

		// Read the view of Consuntivi
		_executeRead: async function (TYPE) {
			var that = this;
			this.busyDialog = new sap.m.BusyDialog();
			this.busyDialog.open();
			var oModelBtnData = {
				VisibilityBtn1: true,
				VisibilityBtn2: true,
				VisibilityBtn3: true,
				VisibilityBtn4: true
			};
			var oModelBtn = new sap.ui.model.json.JSONModel(oModelBtnData);
			this.getView().setModel(oModelBtn, 'oModelBtn');
			var oJsonYear = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oJsonYear, 'oJsonYear');
			oJsonYear.setProperty("/year", this.selYear);
			//this.selYear = sap.ui.getCore().oArgumentsReale.ID.substring(12);
			var r = this.getYear(this.selYear);
			var monthEnd1 = "30" + "" + "06" + "/" + r[0];
			var monthEnd2 = "30" + "/" + "09" + "/" + r[0];
			var monthEnd3 = "31" + "/" + "12" + "/" + r[0];
			var monthEnd4 = "31" + "/" + "03" + "/" + r[1];
			var oFilter = this._generateFilters(monthEnd1, monthEnd2, monthEnd3, monthEnd4);
			var oDataIn = await this._getHanaData('/VI_CONSUNTIVAZIONE_SIM', oFilter);
			that._generateDummyPayload(r, oDataIn, monthEnd1, monthEnd2, monthEnd3, monthEnd4);
			that._handleData(oDataIn, monthEnd1, monthEnd2, monthEnd3, monthEnd4);
			that.busyDialog.close();
			this.jModel = new JSONModel();
			this.jModel.setData(this._data);
		},

		onHomePage: function (oEvent) {
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
			this.busyDialog.close();
		},

		//Update after freezing
		_UpadteHanaData: function (ID, payload) {
			var that = this;
			var oBaseModel = this.getOwnerComponent().getModel();
			return new Promise(
				function (resolve, reject) {
					oBaseModel.setDeferredBatchGroups(["UpTestata"]);
					oBaseModel.update("/CONSUNTIVI_SIMSET(ID_CONSUNTIVO=" + ID + ")", payload, {
						groupId: "UpTestata",
					});
					oBaseModel.submitChanges({ //ho modificato i dati relazionali
						groupId: "UpTestata",
						method: "PUT",
						success: function (oData, mss) {
							resolve(oData);
						},
						error: function (e) {
							reject(console.log(e));
						}
					});
				});
		},

		//Handling freezing buttons
		onPressBtn1: async function (oEvent) {
			var data = this.getView().getModel("tblModel1").getData();
			var Up = {
				SN_CONGELATA: "S"
			};
			var upadte = await this._UpadteHanaData(data[data.length - 1].ID_CONSUNTIVO, Up);
			this._executeRead("TABLE1");
		},

		onPressBtn2: async function (oEvent) {
			var data = this.getView().getModel("tblModel2").getData();
			var Up = {
				SN_CONGELATA: "S"
			};
			var upadte = await this._UpadteHanaData(data[data.length - 1].ID_CONSUNTIVO, Up);
			this._executeRead("TABLE2");
		},

		onPressBtn3: async function (oEvent) {
			var data = this.getView().getModel("tblModel3").getData();
			var Up = {
				SN_CONGELATA: "S"
			};
			var upadte = await this._UpadteHanaData(data[data.length - 1].ID_CONSUNTIVO, Up);
			this._executeRead("TABLE3");
		},

		onPressBtn4: async function (oEvent) {
			var data = this.getView().getModel("tblModel4").getData();
			var Up = {
				SN_CONGELATA: "S"
			};
			var upadte = await this._UpadteHanaData(data[data.length - 1].ID_CONSUNTIVO, Up);
			this._executeRead("TABLE4");
		},

		handleBack: function (oEvent) {
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
			this.busyDialog.close();
		},

		getYear: function (selYear) {
			var z = this.selYear.split('-');
			var r = [];
			r.push(z[0].trim());
			r.push(z[1].trim());
			return r;
		},

		//Post payload to B.E.
		_callXsjsScript: function (obj) {
			debugger;
			var that = this;
			var parsedPayload = JSON.stringify(obj);
			var jurl = "/HANAMDC/STIP/STIPAdmin/services/elaboraConsuntivazioneSimulata_new.xsjs";
			jQuery.ajax({
				url: jurl,
				async: true,
				TYPE: 'POST',
				data: {
					dataobject: parsedPayload
				},
				method: 'GET',
				dataType: 'text',
				success: function (data) {
					sap.ui.core.BusyIndicator.hide(0);
					if (JSON.parse(data).result == "Ok") {
						that._executeRead("GENERAL");
					}
				},
				error: function (data) {
					console.log("error calling hana xsjs");
				}
			});
		},

		//Get data consuntivazione
		_getDataCons: function (date) {
			debugger;
			var day = date.substring(0, 2);
			var month = date.substring(3, 5);
			var year = date.substring(6, 11);
			return year + "-" + month + "-" + day;
		},
		//Get data consuntivazione minus 3
		_getDataConsMinu3: function (date) {
			var output;
			var day = date.substring(0, 2);
			var month = date.substring(3, 5);
			var year = date.substring(6, 11);
			if (month === "06") {
				var DayOut = "04-01";
				var Year = Number(year);
				output = String(Year) + "-" + DayOut;
			} else if (month === "09") {
				var DayOut = "07-01";
				var Year = Number(year);
				output = String(Year) + "-" + DayOut;
			} else if (month === "12") {
				var DayOut = "10-01";
				var Year = Number(year);
				output = String(Year) + "-" + DayOut;
			} else if (month === "03") {
				var DayOut = "01-01";
				var Year = Number(year);
				output = String(Year) + "-" + DayOut;
			}
			return output;
		},

		//Get Month Name
		_getMonth: function (date) {
			var output;
			var month = date.substring(3, 5);
			if (month === "06") {
				output = "JUNE";
			} else if (month === "09") {
				output = "SEPTEMBER";
			} else if (month === "12") {
				output = "DECEMBER";
			} else if (month === "03") {
				output = "MARCH";
			}
			return output;
		},

		_getTodayDate: function () {
			var today = new Date();
			var date = String(today.getDate()).padStart(2, "0") + "/" + String(today.getMonth() + 1).padStart(2, "0") + "/" + today.getFullYear();
			return date;
		},

		_getCurrentTime: function () {
			var today = new Date();
			var time = String(today.getHours()).padStart(2, "0") + ":" + String(today.getMinutes()).padStart(2, "0") + ":" + String(today.getSeconds())
			return time;
		},

		//Retrieve of p-user
		createUserModel: function () {
			return new Promise(
				function (resolve, reject) {
					$.ajax({
						url: "/services/userapi/currentUser",
						async: false,
						success: function (data, response) {
							resolve(data.name);
						},
						error: function (xhr, textStatus, error) {
							reject(jQuery.sap.log.getLogger().error("Logged in user information failed fetch failed" + error.toString()));
						}
					});
				});
		},

		//Build Payload for B.E.
		_buildPayload: async function (data) {
			//this.selYear = sap.ui.getCore().oArgumentsReale.ID.substring(12);
			var r = this.getYear(this.selYear);
			var Periodo = Number(r[0].substring(2, 4)) - 1
			var dataCons = this._getDataCons(data.DATA_CONSUNTIVAZIONE);
			var dataConsMinu3 = this._getDataConsMinu3(data.DATA_CONSUNTIVAZIONE);
			var month = this._getMonth(data.DATA_CONSUNTIVAZIONE);
			var date = this._getTodayDate();
			var time = this._getCurrentTime();
			var Puser = await this.createUserModel();
			var multiFilter1 = [];
			multiFilter1.push(new Filter("ID", "EQ", Puser));
			var oDataIn = await this._getHanaData('/T_USER', multiFilter1);
			var multiFilter2 = [];
			multiFilter2.push(new Filter("MATRICOLA", "EQ", oDataIn[0].MATRICOLA));
			try {
				var oDataIn2 = await this._getHanaData('/T_TMP_INPUT_1', multiFilter2);
			} catch {
				var oDataIn2 = [{
					NOME: '',
					COGNOME: ''
				}];
			}
			var name = oDataIn2[0].NOME + ' ' + oDataIn2[0].COGNOME;
			//Campi to define
			var nuovo = '00N';
			var update = '00U';
			var noteToPush = data.NOTE + " " + date + " " + time + " " + name + " " + "(new:" + nuovo + " upd:" + update + ")" + "<BR>"
			var payload = {
				NRCONSUNTIVAZIONE: data.NRCONSUNTIVAZIONE,
				DATA_INIT_FISCAL: r[0] + "-04-01T00:00:00.000Z",
				DATA_CONSUNTIVAZIONE: dataCons + "T23:59:00.000Z",
				DATA_CONSUNTIVAZIONE_minus_3: dataConsMinu3 + "T00:00:00.000Z",
				DATA_CONSUNTIVAZIONE_0: dataCons + "T00:00:00.000Z",
				MONTH: month,
				ID_PERIODO: Periodo,
				MATRICOLA_UM: oDataIn[0].MATRICOLA,
				RIGHE_NUOVE: nuovo,
				RIGHE_MODIFICATE: update,
				NOTE: noteToPush,
				SN_CONGELATA: data.SN_CONGELATA,
				ID_CONSUNTIVO: data.ID_CONSUNTIVO,
				DATALETTERA: "DUMMY",
				DATAPAGAMENTO: "DUMMY"
			}
			this._callXsjsScript(payload);
		},

		//BUILD PAYLOAD + B.E. call
		_sendElaboration: function (data) {
			var buildedPayload = this._buildPayload(data)
		},

		//Handling Date pickers
		change1: function (oEvent) {
			var sData = oEvent.getParameters().value;
			var id = oEvent.getSource().getId();
			var row = oEvent.getSource();
			var context = row.getBindingContext("tblModel1");
			// get binding object (reference to an object of the original array)
			var Element = context.oModel.getProperty(context.sPath);
			id = id.split("-")[id.split("-").length - 5];
			if (id === "dtLettera1") {
				Element.DATALETTERA = sData;
			} else {
				Element.DATAPAGAMENTO = sData;
			}
			this.getView().getModel("tblModel1").updateBindings(true);
		},

		change2: function (oEvent) {
			var sData = oEvent.getParameters().value;
			var id = oEvent.getSource().getId();
			var row = oEvent.getSource();
			var context = row.getBindingContext("tblModel2");
			// get binding object (reference to an object of the original array)
			var Element = context.oModel.getProperty(context.sPath);
			id = id.split("-")[id.split("-").length - 5];
			if (id === "dtLettera2") {
				Element.DATALETTERA = sData;
			} else {
				Element.DATAPAGAMENTO = sData;
			}
			this.getView().getModel("tblModel2").updateBindings(true);
		},
		change3: function (oEvent) {
			var sData = oEvent.getParameters().value;
			var id = oEvent.getSource().getId();
			var row = oEvent.getSource();
			var context = row.getBindingContext("tblModel3");
			// get binding object (reference to an object of the original array)
			var Element = context.oModel.getProperty(context.sPath);
			id = id.split("-")[id.split("-").length - 5];
			if (id === "dtLettera3") {
				Element.DATALETTERA = sData;
			} else {
				Element.DATAPAGAMENTO = sData;
			}
			this.getView().getModel("tblModel3").updateBindings(true);
		},
		change4: function (oEvent) {
			var sData = oEvent.getParameters().value;
			var id = oEvent.getSource().getId();
			var row = oEvent.getSource();
			var context = row.getBindingContext("tblModel4");
			// get binding object (reference to an object of the original array)
			var Element = context.oModel.getProperty(context.sPath);
			id = id.split("-")[id.split("-").length - 5];
			if (id === "dtLettera4") {
				Element.DATALETTERA = sData;
			} else {
				Element.DATAPAGAMENTO = sData;
			}
			this.getView().getModel("tblModel4").updateBindings(true);
		},

		//Show constraints
		_showMessageBox: function () {
			MessageBox.information("Le date di lettera e pagamento sono obbligatorie");
		},

		//Handle elabora button for each row
		onPressRowBtn1: function (oEvent) {
			sap.ui.core.BusyIndicator.show(0);
			var getTabledata = this.getView().getModel("tblModel1").getData();
			var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
			var selctedRowdata1 = getTabledata[itemPosition];
			jQuery.sap.delayedCall(500, this, function () {
				//Check if data lettera and data pagamento 
				this._sendElaboration(selctedRowdata1);
			});

		},
		onPressRowBtn2: function (oEvent) {
			sap.ui.core.BusyIndicator.show(0);
			var getTabledata = this.getView().getModel("tblModel2").getData();
			var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
			var selctedRowdata2 = getTabledata[itemPosition];
			jQuery.sap.delayedCall(500, this, function () {
				this._sendElaboration(selctedRowdata2);
			});
		},
		onPressRowBtn3: function (oEvent) {
			sap.ui.core.BusyIndicator.show(0);
			var getTabledata = this.getView().getModel("tblModel3").getData();
			var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
			var selctedRowdata3 = getTabledata[itemPosition];
			jQuery.sap.delayedCall(500, this, function () {
				this._sendElaboration(selctedRowdata3);
			});
		},
		onPressRowBtn4: function (oEvent) {
			sap.ui.core.BusyIndicator.show(0);
			var getTabledata = this.getView().getModel("tblModel4").getData();
			var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
			var selctedRowdata4 = getTabledata[itemPosition];
			jQuery.sap.delayedCall(500, this, function () {
				this._sendElaboration(selctedRowdata4);
			});
		}

	});

});