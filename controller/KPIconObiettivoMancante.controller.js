sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"stipAdmin/stipAdmin/controller/exportExcel",
], function (e, Filter, FilterOperator, JSONModel, Device, MessageBox, MessageToast, exportExcel) {
	"use strict";
	var i;
	return e.extend("stipAdmin.stipAdmin.controller.KPIconObiettivoMancante", {
		onInit: function () {
		/**** ONINIT FUNCTION IS CALLED UPON INITIALIZATION OF THE VIEW AND CONTROLLER PERFORM THE SETUP ****/
			this.data = {
				Organization: [{
					"text": "Amministratore Delegato",
					"ref": "sap-icon://folder-full",
					"nodes": [{
						"text": "10011001 – Vodafone Italy Chief Executive",
						"ref": "sap-icon://folder-full",
						"nodes": [{
							"text": "10002959-Africa, Middle East & Asia Pac",
							"ref": "sap-icon://folder-full"
						}, {
							"text": "10011002-Human Resources & Organization",
							"ref": "sap-icon://folder-full"

						}, {
							"text": "10011063-Finance",
							"ref": "sap-icon://folder-full"

						}]
					}, {
						"text": "10011002 – Human Resources & organization",
						"ref": "sap-icon://folder-full"
					}, {
						"text": "10011003 – Industrial Relations & Payroll",
						"ref": "sap-icon://folder-full"
					}]
				}]
			};

			this._mViewSettingsDialogs = {};
			this.busyDialog = new sap.m.BusyDialog();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("KPIconObiettivoMancante").attachPatternMatched(this._onObjectMatched, this);
		},
		
		onFlagChange: function () {
		/***** THIS FUNCTION IS CALLED BY THE COMBOBOX IN VIEW AND THE VALUE STATE IS GIVEN NONE *****/
			this.byId("sel28a").setValueState(sap.ui.core.ValueState.None);
			this.byId("sel28b").setValueState(sap.ui.core.ValueState.None);
		},
	
		onTornaallalista: function (oEvent) {
		/** NAVIGATES BACK TO REPORTS PAGE
		 * CALLS THE FUNCTION clearValues
		 */
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Reports", {
				str: this.t,
				IdPeriodo: this.IdPeriodo
			});
			this.busyDialog.close();
			this.clearValues();
		},
	
		onHomePage: function (oEvent) {
		/** NAVIGATES BACK TO HOME PAGE
		 * CALLS THE FUNCTION clearValues
		 */
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
			this.busyDialog.close();
			this.clearValues();
		},

		onTreeSelect: function (oEvent) {

			this.getView().byId("empDipartimento").setValue(oEvent.getSource().getTitle());
			this._oValueHelpDialog.destroy();
		},
		onCloseDialog: function (oEvent) {
			this._oValueHelpDialog.destroy();
		},
		handleClose: function (oEvent) {
			this._oValueHelpDialog.destroy();
		},

		handleBack: function (oEvent) {
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Reports", {
				str: this.t,
				IdPeriodo: this.IdPeriodo
			});
			if (this.getView().getModel("oModelReport1")) {
				this.getView().getModel("oModelReport1").setData(null);
			}
			if (this.getView().getModel("oModelReport2")) {
				this.getView().getModel("oModelReport2").setData(null);
			}
			this.busyDialog.close();
		},
		
		_onObjectMatched: function (e) {
		/***** IT FETCHES ARGUMENT VALUES AND JSON DATA HAS BEEN ADDED  *****/
			this.t = e.getParameter("arguments").str;
		//	i = this.t.split(';')[0];
		//	var z = this.t.split(';')[1];
			this.selYear = this.t.substring(12);
			this.IdPeriodo = e.getParameter("arguments").IdPeriodo;
			this.getView().byId("idtxtfiscalyearReport").setText(this.t);
			
			var year = this.selYear.split("-");
			var yearStart = year[0].trim();
			var yearEnd = year[1].trim();
			var jsonData = [{
				"Month": "Aprile " + yearStart
			}, {
				"Month": "Maggio " + yearStart
			}, {
				"Month": "Giugno " + yearStart
			}, {
				"Month": "Luglio " + yearStart
			}, {
				"Month": "Agosto " + yearStart
			}, {
				"Month": "Settembre " + yearStart
			}, {
				"Month": "Ottobre " + yearStart
			}, {
				"Month": "Novembre " + yearStart
			}, {
				"Month": "Dicembre " + yearStart
			}, {
				"Month": "Gennaio " + yearEnd
			}, {
				"Month": "Febbraio " + yearEnd
			}, {
				"Month": "Marzo " + yearEnd
			}];
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData({
				"Months": jsonData
			});
			this.getView().setModel(oModel);
		},

		onValueHelpRequest1: function (oEvent) {
		/** CALLED UPON FROM THE VIEW
		  * Provides valueHelp for the GruppoKP input field based on the periodoId 
		 */
			var that = this;
			that.busyDialog.open();
			this.byId("sel29").setValueState(sap.ui.core.ValueState.None);
			var oBaseModel = this.getOwnerComponent().getModel();
			oBaseModel.read('/T_GRUPPIPISTE', {
				filters: [new Filter({
					path: "ID_PERIODO",
					operator: FilterOperator.EQ,
					value1: this.IdPeriodo,
				})],
				success: function (oDataIn, oResponse) {
					var oGruppoModel = new sap.ui.model.json.JSONModel(oDataIn.results);
					that._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.GruppoF4", that);
					that.getView().addDependent(that._oValueHelpDialog);
					that._oValueHelpDialog.setModel(oGruppoModel, 'oGruppoModel');
					that._oValueHelpDialog.open();
					that.busyDialog.close();
				},
				error: function (oError) {
					that.busyDialog.close();
				}
			});
		},
		onDialogSelectGruppo: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var selectedObj = aContexts.map(function (oContext) {
				return oContext.getObject();
			});
			var modelGruppoSelected = new sap.ui.model.json.JSONModel(selectedObj[0]);
			this.getView().setModel(modelGruppoSelected, 'modelGruppoSelected');
		},
		onSearchGruppo: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("DESCR_GRUPPOPISTA", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);
		},
		
		onResetta13: function (oEvent) {
		/** CALLED UPON FROM VIEW
		  * THIS FUNCTION RESETS THE ENTERED INPUT VALUE TO NULL 
		 */
			this.byId("sel28a").setSelectedKey("");
			this.byId("sel28b").setSelectedKey("");
			this.byId("sel29").setSelectedKey("");
			if (this.getView().getModel("modelGruppoSelected")) {
				this.getView().getModel("modelGruppoSelected").setData("");
			}
		},
	
		onShow16: function (oEvent) {
			/** CALLED UPON FROM VIEW
			  * THIS FUNCTION SHOWS THE LIST OF ITEMS CREATED AND WE CAN SELECT THE ITEM FROM THE LIST
			  * CHECKS FOR VARIOUS CONDITIONS OF DALMESE AND ALMESE
			 */
			
			var m1 = this.byId("sel28a").getSelectedKey();
			var m2 = this.byId("sel28b").getSelectedKey();
			if (this.getView().getModel("modelGruppoSelected")) {
				if (this.getView().getModel("modelGruppoSelected").getData() !== "") {
					var gruppoKPI = parseInt(this.getView().getModel("modelGruppoSelected").getData().ID_GRUPPOPISTA);
				}
			}
			var t = this.selYear.split("-");
			var dateStart;
			var dateEnd;
			var yearStart = m1.substring(m1.length - 4);
			var yearEnd = m2.substring(m2.length - 4);
			var monthStart;
			var monthEnd;
			var monthDay;
			
			if (this.byId("sel28a").getSelectedKey() === "") {
				monthStart = "04";
				if (monthEnd >= "01" && monthEnd <= "03") {
					yearStart = yearEnd - 1;
				} else {
					yearStart = yearEnd;
				}
			}

			if (this.byId("sel28b").getSelectedKey() === "") {
				monthEnd = "03";
				if (monthStart >= "01" && monthStart <= "03") {
					yearEnd = yearStart;
				} else {
					yearEnd = yearStart + 1;
				}
			}
		
			if ((this.byId("sel28a").getSelectedKey() === "") && (this.byId("sel28b").getSelectedKey() === "")) {
				monthDay = "31";
				var year = this.selYear.split("-");
				yearStart = year[0].trim();
				yearEnd = year[1].trim();
				yearStart = yearEnd - 1;
				yearEnd = yearStart + 1;
			}
			
			if (m1.startsWith("Aprile")) {
				monthStart = "04";
			} else if (m1.startsWith("Maggio")) {
				monthStart = "05";
			} else if (m1.startsWith("Giugno")) {
				monthStart = "06";
			} else if (m1.startsWith("Luglio")) {
				monthStart = "07";
			} else if (m1.startsWith("Agosto")) {
				monthStart = "08";
			} else if (m1.startsWith("Settembre")) {
				monthStart = "09";
			} else if (m1.startsWith("Ottobre")) {
				monthStart = "10";
			} else if (m1.startsWith("Novembre")) {
				monthStart = "11";
			} else if (m1.startsWith("Dicembre")) {
				monthStart = "12";
			} else if (m1.startsWith("Gennaio")) {
				monthStart = "01";
			} else if (m1.startsWith("Febbraio")) {
				monthStart = "02";
			} else if (m1.startsWith("Marzo")) {
				monthStart = "03";
			}

			if (m2.startsWith("Aprile")) {
				monthEnd = "04";
				monthDay = "30";
			} else if (m2.startsWith("Maggio")) {
				monthEnd = "05";
				monthDay = "31";
			} else if (m2.startsWith("Giugno")) {
				monthEnd = "06";
				monthDay = "30";
			} else if (m2.startsWith("Luglio")) {
				monthEnd = "07";
				monthDay = "31";
			} else if (m2.startsWith("Agosto")) {
				monthEnd = "08";
				monthDay = "31";
			} else if (m2.startsWith("Settembre")) {
				monthEnd = "09";
				monthDay = "30";
			} else if (m2.startsWith("Ottobre")) {
				monthEnd = "10";
				monthDay = "31";
			} else if (m2.startsWith("Novembre")) {
				monthEnd = "11";
				monthDay = "30";
			} else if (m2.startsWith("Dicembre")) {
				monthEnd = "12";
				monthDay = "31";
			} else if (m2.startsWith("Gennaio")) {
				monthEnd = "01";
				monthDay = "31";
			} else if (m2.startsWith("Febbraio")) {
				monthEnd = "02";
				monthDay = "28";
			} else if (m2.startsWith("Marzo")) {
				monthEnd = "03";
				monthDay = "31";
			}
			
			

			dateStart = yearStart + monthStart + "01";
			dateEnd = yearEnd + monthEnd + monthDay;
			
			if (yearStart > yearEnd) {
				this.byId("sel28a").setValueStateText("Please Enter DAL MESE");
				this.byId("sel28b").setValueStateText("Please Enter AL MESE");
				MessageBox.error("DAL MESE can't be greater than AL MESE");
				this.busyDialog.close();
				return;
			} else if (yearStart === yearEnd && monthStart > monthEnd) {
				MessageBox.error("DAL MESE can't be greater than AL MESE");
				this.busyDialog.close();
				return;
			} else {
				this.byId("sel28a").setValueState(sap.ui.core.ValueState.None);
				this.byId("sel28b").setValueState(sap.ui.core.ValueState.None);
			}
			
			var that = this;
			var oBaseModel = this.getOwnerComponent().getModel();
			var aFilter = [];
		
			if (dateStart !== "") {
				aFilter.push(new Filter("PISTA_VALE_DAL", FilterOperator.GE, dateStart));
			}
			if (dateEnd !== "") {
				aFilter.push(new Filter("PISTA_VALE_AL", FilterOperator.LE, dateEnd));
			}
			if (this.getView().getModel("modelGruppoSelected")) {
				if (this.getView().getModel("modelGruppoSelected").getData() !== "") {
					aFilter.push(new Filter("ID_GRUPPOPISTA", FilterOperator.EQ, gruppoKPI));
				}
			}
			aFilter.push(new Filter("ID_PERIODO", FilterOperator.EQ, this.IdPeriodo));
			oBaseModel.read('/V_REPORT3V2Set', {
				filters: aFilter,
				
				success: function (oDataIn, oResponse) {
					that.busyDialog.close();
					if (oDataIn.results.length > 0) {
						MessageToast.show('Data Loaded');
						var oModelReport3 = new sap.ui.model.json.JSONModel(oDataIn.results);
						that.getView().setModel(oModelReport3, "oModelReport3");
					} else {
						MessageToast.show('No Data Found on Selected Criteria');
						if (!oModelReport3) {
							that.getView().getModel("oModelReport3").setData(null);
						}
					}
				},
				error: function (oError) {
					that.busyDialog.close();
				}
			});

		},
		
		clearValues: function () {
		/***** CLEARS THE VALUES OF DAL MESE, AL MESE AND LOADED DATA *****/
			var that = this;
			that.byId("sel28a").setSelectedKey("");
			that.byId("sel28b").setSelectedKey("");
			that.byId("sel29").setSelectedKey("");
			that.getView().getModel("oModelReport3").setData(null);
		},
		
	onPressExport: function (oEvent) {
            /***** IN THIS THE DATA CAN BE EXPORTED TO EXCEL *****/
            var oModel = this.getView().getModel('oModelReport3');
            var columnTemplate = [
                [{
                    column: "ID_PISTE",
                    label: "Id KPI"
                }, {
                    column: "DESCR_PISTA",
                    label: "Descrizione"
                }, {
                    column: "Descr_GruppoPista",
                    label: "Gruppo KPI"
                }, {
                    column: "Eventuale_Assegnatario",
                    label: "Eventuale Assegnatario"
                }, {
                    column: "INIZIO_ASSEGNAZIONE",
                    label: "Inizio Scheda Personale’"
                }, {
                    column: "FINE_ASSEGNAZIONE",
                    label: "Fine Scheda Personale"
                }, {
                    column: "Curva",
                    label: "Curva"
                }, {
                    column: "Obiettivo",
                    label: "Obiettivo"
                }]
            ];
            var obj = {};
            obj.results = oModel.getData();
            tablesToExcel(obj, ['tab1'], columnTemplate, 'Report3.xls', 'Excel');
        },
        });
});