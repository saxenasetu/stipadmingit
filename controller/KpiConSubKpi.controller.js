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
	var i,primoAnno,secondoAnno;
	return e.extend("stipAdmin.stipAdmin.controller.KpiConSubKpi", {
		onInit: function () {

			this._mViewSettingsDialogs = {};
			this.busyDialog = new sap.m.BusyDialog();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("KpiConSubKpi").attachPatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function (e) {
			var modelGruppoSelected = this.getView().getModel("modelGruppoSelected");
			this.t = e.getParameter("arguments").str;
		//	&&i = this.t.split(';')[0];
		//	var z = this.t.split(';')[1];
	//		this.selYear = z.substring(12, z.length);
			this.IdPeriodo = e.getParameter("arguments").IdPeriodo;
			this.byId("sel27").setValue("");
			if (modelGruppoSelected !== undefined)
				modelGruppoSelected.setData({});
			//Model mesi
			 primoAnno = "20" + (Number(this.IdPeriodo) + 1) ;
			 secondoAnno = "20" + (Number(this.IdPeriodo) + 2) ;
			var arrayMesi = [{
				descr: "",
				anno: "",
				num: ""
			}, {
				descr: "Aprile",
				anno: primoAnno,
				num: "04"
			}, {
				descr: "Maggio",
				anno: primoAnno,
				num: "05"
			}, {
				descr: "Giugno",
				anno: primoAnno,
				num: "06"
			}, {
				descr: "Luglio",
				anno: primoAnno,
				num: "07"
			}, {
				descr: "Agosto",
				anno: primoAnno,
				num: "08"
			}, {
				descr: "Settembre",
				anno: primoAnno,
				num: "09"
			}, {
				descr: "Ottobre",
				anno: primoAnno,
				num: "10"
			}, {
				descr: "Novembre",
				anno: primoAnno,
				num: "11"
			}, {
				descr: "Dicembre",
				anno: primoAnno,
				num: "12"
			}, {
				descr: "Gennaio",
				anno: secondoAnno,
				num: "01"
			}, {
				descr: "Febbraio",
				anno: secondoAnno,
				num: "02"
			}, {
				descr: "Marzo",
				anno: secondoAnno,
				num: "03"
			}];
			var objPage = {
				mesi: arrayMesi
			};
			this.getView().setModel(new JSONModel(objPage), "modelKpiSubKpi");
			this.byId("idMeseInizio").setSelectedKey(null);
			this.byId("idMeseFine").setSelectedKey(null);
		},
		onTornaallalista: function (oEvent) {
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Reports", {
				str: this.t,
				IdPeriodo: this.IdPeriodo
			});
			this.busyDialog.close();
		},
		onHomePage: function (oEvent) {
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
			this.busyDialog.close();
		},
		onValueHelpRequest1: function (oEvent) {
			var that = this;
			that.busyDialog.open();
			var oBaseModel = this.getOwnerComponent().getModel();
			oBaseModel.read('/T_GRUPPIPISTE', {
				filters: [new Filter({
					path: "ID_PERIODO",
					operator: FilterOperator.EQ,
					value1: this.IdPeriodo,
				})],
				success: function (oDataIn, oResponse) {
					console.log("Data Loded");
					var oGruppoModel = new sap.ui.model.json.JSONModel(oDataIn.results);
					that._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.GruppoF4", that);
					that.getView().addDependent(that._oValueHelpDialog);
					that._oValueHelpDialog.setModel(oGruppoModel, 'oGruppoModel');
					that._oValueHelpDialog.open();
					that.busyDialog.close();
				},
				error: function (oError) {
					console.log("Error");
					that.busyDialog.close();
				}
			});
		},
		onResetta: function (oEvent) {
			this.byId("idMeseInizio").setSelectedKey(null);
			this.byId("idMeseFine").setSelectedKey(null);
			if (this.getView().getModel("modelGruppoSelected")) {
				this.getView().getModel("modelGruppoSelected").setData(null);
			}
		},
		onDialogSelectGruppo: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var selectedObj = aContexts.map(function (oContext) {
				return oContext.getObject()
			});
			var modelGruppoSelected = new sap.ui.model.json.JSONModel(selectedObj[0]);
			this.getView().setModel(modelGruppoSelected, 'modelGruppoSelected');
		},
		onMeseChange: function (oEvent) {
			var modelKpiSubKpi = this.getView().getModel("modelKpiSubKpi");
		},
		onShow: function (oEvent) {
			var idMeseInizio = this.byId("idMeseInizio");
			var idMeseFine = this.byId("idMeseFine");
			var modelKpiSubKpi = this.getView().getModel("modelKpiSubKpi");
			var modelGruppoSelected = this.getView().getModel("modelGruppoSelected");
			var meseInizio;
			var meseFine;
		//	var t = this.selYear.split("-");
			var yearStart = primoAnno;
			var yearEnd = secondoAnno;
			var dateStart;
			var dateEnd;
			var oEvnt = $.extend(true, {}, oEvent);
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd/MM/YYYY"
			});

			if (idMeseInizio._oSelectionOnFocus !== null) {
				var meseInizio = modelKpiSubKpi.getProperty(idMeseInizio._oSelectionOnFocus.getBindingContext("modelKpiSubKpi").sPath);
				if (meseInizio.anno !== "" && meseInizio.descr !== "" && meseInizio.num !== "") {
					dateStart = meseInizio.anno + meseInizio.num + "01";
				} else {
					dateStart = yearStart + "04" + "01";
				}
			} else {
				dateStart = yearStart + "04" + "01";
			}
			if (idMeseFine._oSelectionOnFocus !== null) {
				var meseFine = modelKpiSubKpi.getProperty(idMeseFine._oSelectionOnFocus.getBindingContext("modelKpiSubKpi").sPath);
				if (meseFine.anno !== "" && meseFine.descr !== "" && meseFine.num !== "") {
					dateEnd = meseFine.anno + meseFine.num + "01";
				} else {
					dateEnd = yearEnd + "03" + "01";
				}
			} else {
				dateEnd = yearEnd + "03" + "01";
			}

			if (Number(dateStart) > Number(dateEnd)) {
				idMeseFine.setValueState("Error");
				idMeseFine.setValueStateText("Mese Fine inferiore a Mese Inizio");
				return;
			} else {
				idMeseFine.setValueState("None");
				idMeseFine.setValueStateText("");
			}

			var that = this
			var oBaseModel = this.getOwnerComponent().getModel();
			oBaseModel.read('/KpiConSubKpi', {
				success: function (oDataIn, oResponse) {
					that.busyDialog.close();
					if (oDataIn.results.length > 0) {
						var itemsTable = [];
						MessageToast.show('Data Loaded')
						oDataIn.results = oDataIn.results.filter(function (item) {
							return item.ID_PERIODO === parseInt(that.IdPeriodo);
						});
						if (modelGruppoSelected !== undefined) {
							if (modelGruppoSelected.getProperty("/ID_GRUPPOPISTA") !== undefined && modelGruppoSelected.getProperty("/ID_GRUPPOPISTA") !==
								null) {
								oDataIn.results = oDataIn.results.filter(function (item) {
									return item.ID_GRUPPOPISTA === modelGruppoSelected.getProperty("/ID_GRUPPOPISTA");
								});
							}
						}
						if (oDataIn.results.length > 0) {
							if (dateStart == dateEnd) {
								var newDateEndLastDay = new Date(dateEnd.substring(0, 4), dateEnd.substring(4, 6), 0).getDate().toString();
								if (newDateEndLastDay.length == 1) {
									newDateEndLastDay = "0" + newDateEndLastDay;
								}
								dateEnd = dateEnd.substring(0, 4) + dateEnd.substring(4, 6) + newDateEndLastDay;
							}
							oDataIn.results = oDataIn.results.filter(function (item) {
								return (Number(dateStart) <= Number(item.PISTA_VALE_DAL) && Number(dateEnd) >= Number(item.PISTA_VALE_AL));
							});
							oDataIn.results.map(function (item) {
								var obj = {};
								obj.id_pista = item.ID_PISTAVIEW;
								obj.descrizione = item.DESCR_PISTA;
								obj.descr_gruppopista = item.DESCR_GRUPPOPISTA;
								obj.eventuale_assegnatario = "";
								if (item.COGNOME) {
									obj.eventuale_assegnatario += item.COGNOME;
								}
								if (item.NOME) {
									obj.eventuale_assegnatario += " " + item.NOME;
								}
								if (item.MATRICOLA) {
									obj.eventuale_assegnatario += " " + item.MATRICOLA;
								}
								if (item.INIZIO_ASSEGNAZIONE !== null) {
									obj.inizio_schedapersonale = dateFormat.format(item.INIZIO_ASSEGNAZIONE);
								} else {
									obj.inizio_schedapersonale = "";
								}
								if (item.FINE_ASSEGNAZIONE !== null) {
									obj.fine_schedapersonale = dateFormat.format(item.FINE_ASSEGNAZIONE);
								} else {
									obj.fine_schedapersonale = "";
								}
								obj.curvaDescrittiva = item.DESCR_CURVA;
								obj.risultato_gatepista = item.RISULTATO_GRADINO;
								obj.sottopista = item.DESCR_SOTTOPISTA;
								if (item.LIVELLO === 0) {
									obj.peso_perc_zero = item.PESO_PERC;
								} else {
									obj.peso_perc_zero = 0;
								}
								if (item.LIVELLO === 1) {
									obj.peso_perc_uno = item.PESO_PERC;
								} else {
									obj.peso_perc_uno = 0;
								}
								obj.pista_reale = item.SN_REALE;
								obj.livello = item.LIVELLO;
								obj.ordinamento = item.ORDINAMENTO;
								obj.curva = item.DESCR_CURVA;
								obj.gate = item.DESCR_GATE;
								obj.risultato_gate = item.RISULTATO_GRADINO;

								if (item.ID_TIPO_CURVA == 2) {
									obj.obiettivo = item.OBIETTIVO_GRADINO;
									obj.consuntivo = item.CONSUNTIVO_GRADINO;
								} else {
									obj.obiettivo = item.OBIETTIVO;
									obj.consuntivo = item.CONSUNTIVO;
								}
								obj.perc_ragg_obiettivo = item.PERC_RAGG_OBIETTIVO;
								obj.perc_ragg_stip = item.PERC_RAGG_MBO;
								itemsTable.push(obj);
							});
						}
						if (!(oEvnt.getSource().getId().includes("idKpisubkpi"))) {
							modelKpiSubKpi.setProperty("/itemsTable", itemsTable);
						} else {
							modelKpiSubKpi.setProperty("/itemsExcel", itemsTable);
							that.onPressExport();
						}
					} else {
						MessageToast.show('No Data Found on Selected Criteria');
						if (!modelKpiSubKpi) {
							modelKpiSubKpi.setProperty("/itemsTable", []);
						}
					}

				},
				error: function (oError) {
					that.busyDialog.close();
					console.log("Error");
				}
			});
		},
		onPressExport: function (oEvent) {
			var oModel = this.getView().getModel('modelKpiSubKpi');
			var columnTemplate = [
				[{
					column: 'id_pista',
					label: 'Id Pista'
				}, {
					column: 'descrizione',
					label: 'Descrizione'
				}, {
					column: 'descr_gruppopista',
					label: 'Gruppo Pista'
				}, {
					column: 'eventuale_assegnatario',
					label: 'Eventuale Assegnatario'
				}, {
					column: 'inizio_schedapersonale',
					label: 'Inizio Scheda Personale’'
				}, {
					column: 'fine_schedapersonale',
					label: 'Fine Scheda Personale’'
				}, {
					column: 'curvaDescrittiva',
					label: 'Curva Descrittiva’'
				}, {
					column: 'risultato_gatepista',
					label: 'Risultato Gate Pista’'
				}, {
					column: 'sottopista',
					label: 'SottoPista’'
				}, {
					column: 'peso_perc_zero',
					label: 'Peso Percentuale Liv.0’'
				}, {
					column: 'peso_perc_uno',
					label: 'Peso Percentuale Liv.1’'
				}, {
					column: 'pista_reale',
					label: 'Pista Reale’'
				}, {
					column: 'livello',
					label: 'Livello’'
				}, {
					column: 'ordinamento',
					label: 'Ordinamento ’'
				}, {
					column: 'curva',
					label: 'Curva’'
				}, {
					column: 'gate',
					label: 'Gate’'
				}, {
					column: 'risultato_gate',
					label: 'Risultato Gate’'
				}, {
					column: 'obiettivo',
					label: 'Obiettivo’'
				}, {
					column: 'consuntivo',
					label: 'Consuntivo’'
				}, {
					column: 'perc_ragg_obiettivo',
					label: 'Perc.Ragg.Obiettivo’'
				}, {
					column: 'perc_ragg_stip',
					label: 'Perc.Ragg.Stip’'
				}]
			];
			if (oModel !== undefined) {
				var obj = {};
				obj.results = oModel.getProperty("/itemsExcel");
				var name = 'KpiConSubKpi.xls';
				tablesToExcel(obj, ['tab1'], columnTemplate, name, 'Excel');
			}
		},
		onSearchGruppo: function (oEvnt) {
			var sValue = oEvnt.getParameter("value");
			var oFilter = new Filter("DESCR_GRUPPOPISTA", FilterOperator.Contains, sValue);
			var oBinding = oEvnt.getParameter("itemsBinding");
			oBinding.filter([oFilter]);
		}
	});
});