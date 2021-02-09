sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"stipAdmin/stipAdmin/util/Formatter",
	"sap/m/TablePersoController",
	"sap/ui/model/Sorter",
	"sap/ui/core/BusyIndicator",
	"sap/ui/Device",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"./exportExcel",
	"stipAdmin/stipAdmin/util/SchedaPersonaleTableHome",
	"stipAdmin/stipAdmin/libs/moment",
	"stipAdmin/stipAdmin/libs/jspdf.min",
	"stipAdmin/stipAdmin/libs/jspdf.plugin.autotable.min",
	"../service/RepoService", "stipAdmin/stipAdmin/libs/canvg", "stipAdmin/stipAdmin/libs/html2pdf",
	"sap/ui/richtexteditor/RichTextEditor"
], function (Controller, Fragment, MessageBox, JSONModel, Formatter, TablePersoController, Sorter, BusyIndicator, Device, Export,
	ExportTypeCSV, exportExcel, SchedaPersonaleTableHome, momentjs, jspdfdebugjs, autotablejs, RepoService, canvgjs, html2pdfjs,
	RichTextEditor) {
	"use strict";
	var flagDynamicTable = false;
	var flagCompletePDF = false;
	var flagOnlySendPDF = false;
	var flagNoTempleteDisplay = false;
	var mode = "";
	var oResource;
	var flagHr;
	var skip,
		tops,
		first,
		topsUser,
		skipUser,
		totalmatCount = 0,
		totalpckgCount = 0;
	var matCount = 0,
		pckgCount = 0;
	var filterData = [];
	var oMainModel = new sap.ui.model.json.JSONModel();
	var change_id_arr = [],
		change_pck_arr = [],
		frag = [{}, {}, {}, {}, {}],
		Role = [],
		grade = [],
		periodi = "",
		chk = 0,
		txt, allData;
	var max_id = 0,
		final;
	var selectedfiscalYearPeriodi, Periodi_start_date_main, Periodi_end_date_main;
	return Controller.extend("stipAdmin.stipAdmin.controller.SchedaPersonale", {
		formatter: {
			inputFormatter: function (ShowTrimese) {
				if (ShowTrimese == "true") {
					return true;
				} else {
					return false;
				}
			}
		},
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {
			var that = this;
			this.tabData = [];
			first = 0;
			this.count = 0;
			tops = 500;
			skip = 0;
			topsUser = 100;
			skipUser = 0;
			this.NewUserCount = 0;
			this._mViewSettingsDialogs = {};
			this.busyDialog = new sap.m.BusyDialog;
			this.getOwnerComponent().getRouter().getRoute("SchedaPersonale").attachPatternMatched(this._onObjectMatched, this);
			this._oTPC = new TablePersoController({
				table: this.byId("schedaPersonaleTable"),
				componentName: "SchedaPersonale",
				persoService: SchedaPersonaleTableHome
			}).activate();

			/*------------------------------Toolbar filter design starts----------------------------------------------*/
			/*	this.getView().byId("sid").addStyleClass("schedaPersonaleFilterWidth1");
				this.getView().byId("Dimessi").addStyleClass("schedaPersonaleFilterWidth1");
				this.getView().byId("Company").addStyleClass("schedaPersonaleFilterWidth1");
				this.getView().byId("bb").addStyleClass("schedaPersonaleFilterWidth1");
				this.getView().byId("cb").addStyleClass("schedaPersonaleFilterWidth1");
				this.getView().byId("pisteid").addStyleClass("schedaPersonaleFilterWidth1");
				this.getView().byId("idscheda").addStyleClass("schedaPersonaleFilterWidth1");
				this.getView().byId("maxpay").addStyleClass("schedaPersonaleFilterWidth1");
				this.getView().byId("checkBoxSG").addStyleClass("schedaPersonaleFilterWidth2");*/
			/*------------------------------Toolbar filter design end----------------------------------------------*/
		},
		/******************** _onObjectMatched fetches argument values ********************************************/
		_onObjectMatched: function (oEvent) {

			final = this;
			var oArguments = oEvent.getParameter("arguments");
			selectedfiscalYearPeriodi = oArguments.str;
			//this.getPersonaleId();
			this.getFilterData();
			//this.getFragmentData();
			//this.getFragmentRoleData();
			//this.getSchedaPersonaleData();
			this.getView().setModel(oMainModel, "SchedaPersonaleModel");
			this.byId("schedaPersonaleTable").setVisible(false);
			//this.getPeriodiDates(selectedfiscalYearPeriodi);
			oMainModel.refresh();
			this.byId("sdate").setSelectedKey(0);
			this.byId("edate").setSelectedKey(0);
			//this.getView().byId("filterbar")._oSearchButton.setText("Cerca");
			//	this.getView().byId("filterbar")._oSearchButton.setVisible(false);
			//this.getView().byId("idtxtfiscalyear").setText(sap.ui.getCore().getModel("fiscalyear").getData());
		},
		/********************onColumnHide function opens a dialog box for user to select which columns to be visible*******************************************/
		onColumnHide: function (oEvent) {
			this._oTPC.openDialog();
		},
		/******************** onTablePersoRefresh function is used to refresh the Perso Controller********************************************/
		onTablePersoRefresh: function () {
			SchedaPersonaleTableHome.resetPersData();
			this._oTPC.refresh();
		},
		/******************** onHome function naviagtes the user to the Home Page of the StipAdmin module********************************************/
		onHome: function () {
			this.getView().byId("idSearchBox").setValue("");
			this.clear();
			oMainModel.setData([]);
			oMainModel.refresh();
			var n = sap.ui.core.UIComponent.getRouterFor(this);
			n.navTo("Home");
		},
		/************************allCheck function is used to select/deselect all Matricolas********************************/
		allCheck: function () {
			var chmain = this.getView().byId("chmain").getSelected();
			var data = oMainModel.getData()[1].Main;
			if (chmain == true) {
				for (var i = 0; i < data.length; i++) {
					if (data[i].Enable_CHECKBOX === true) {
						data[i].Check_CHECKBOX = true;
						if (data[i].MATRICOLA != "")
							change_id_arr.push(data[i].MATRICOLA);
						oMainModel.refresh();
					}
				}
			} else if (chmain == false) {
				for (var i = 0; i < data.length; i++) {
					data[i].Check_CHECKBOX = false;
					change_id_arr = [];
					oMainModel.refresh();
				}
			}
			console.log(change_id_arr);
		},
		/************************allCheck1 function is used to select/deselect all the packages********************************/
		allCheck1: function () {
			var chmain1 = this.getView().byId("chmain1").getSelected();
			var data = oMainModel.getData()[1].Main;
			if (chmain1 == true) {
				for (var i = 0; i < data.length; i++) {
					data[i].Check_Pck_CHECKBOX = true;
					change_pck_arr.push(data[i].ID_PACKAGEDS)
						//change_pck_arr.push(data[i].ID_SCHEDAPERSONALE);
					this.byId("package").getItemByKey("rendiVisible").setEnabled(true);
					this.byId("package").getItemByKey("rendiNascosto").setEnabled(true);
					//this.byId("package").getItemByKey("stampaLettre").setEnabled(true);
					//this.byId("package").getItemByKey("invia").setEnabled(true);
					this.byId("package").getItemByKey("scegli").setEnabled(true);
					this.byId("package").getItemByKey("assegnaResp").setEnabled(true);
					//this.byId("package").getItemByKey("assegna").setEnabled(true);
					this.byId("package").getItemByKey("letter_asseg_change").setEnabled(true);
					this.byId("package").getItemByKey("annullaSel").setEnabled(true);
					oMainModel.refresh();
				}
			} else if (chmain1 == false) {
				change_pck_arr = [];
				for (var i = 0; i < data.length; i++) {
					data[i].Check_Pck_CHECKBOX = false;
					this.byId("package").getItemByKey("rendiVisible").setEnabled(false);
					this.byId("package").getItemByKey("rendiNascosto").setEnabled(false);
					//this.byId("package").getItemByKey("stampaLettre").setEnabled(false);
					this.byId("package").getItemByKey("invia").setEnabled(false);
					this.byId("package").getItemByKey("scegli").setEnabled(false);
					this.byId("package").getItemByKey("assegnaResp").setEnabled(false);
					//this.byId("package").getItemByKey("assegna").setEnabled(false);
					this.byId("package").getItemByKey("letter_asseg_change").setEnabled(false);
					this.byId("package").getItemByKey("annullaSel").setEnabled(false);
					oMainModel.refresh();
				}
			}
			console.log(change_pck_arr);
		},
		/************************getFragmentData function is used to fetch the data from V_SchedaMaster_Personale
		based on the filters as per the ID_PERIODO********************************/
		getFragmentData: function () {
			BusyIndicator.show();
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			var oFilters = [],
				tmp = [],
				id = [],
				desc = [],
				gruppi = [],
				note = [],
				cong = [],
				pisteid = [],
				descpiste = [],
				data, that = this,
				mom;
			var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, selectedfiscalYearPeriodi);
			oFilters.push(filter1);
			xsoDataModel.read("/V_SchedaMaster_Personale?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {

					data = oDataIn.results;
					console.log(data);
					for (var i = 0; i < data.length; i++) {
						if (data[i].ID_PISTA_MADRE === 0 && data[i].SN_PERSONALIZZABILE === "S")
							data[i].MOTHER = true + ":" + data[i].ID_PISTA;
						else
							data[i].MOTHER = false + ":" + 0;
						/*tmp.push({
							DESCR_PISTA: data[i].DESCR_PISTA,
							DESCR_SCHEDA: data[i].DESCR_SCHEDA,
							DESCR_GRUPPOSCHEDA: data[i].DESCR_GRUPPOSCHEDA,
							ID_PISTA: data[i].ID_PISTA,
							ID_SCHEDAMASTER: data[i].ID_SCHEDAMASTER,
							NOTE: data[i].NOTE,
							SN_CONGELATA: data[i].SN_CONGELATA,
							MAXPERCPAYOUT: data[i].MAXPERCPAYOUT,
							ID_CURVA: data[i].ID_CURVA,
							DESCR_CURVA: data[i].DESCR_CURVA,
							PESO: data[i].PESO_PERCENTUALE,
							ID_TIPO_CURVA: data[i].ID_TIPO_CURVA,
							ID_TEMPLATELETTERA: data[i].ID_TEMPLATELETTERA,
							DESCRIZIONE: data[i].DESCRIZIONE,
							ID_GRUPPOSCHEDA: data[i].ID_GRUPPOSCHEDA,
							SN_PERSONALIZZABILE: data[i].SN_PERSONALIZZABILE,
							MOTHER: data[i].MOTHER
						});*/
						id.push(data[i].ID_SCHEDAMASTER);
						desc.push(data[i].DESCR_SCHEDA);
						gruppi.push(data[i].DESCR_GRUPPOSCHEDA);
						note.push(data[i].NOTE);
						cong.push(data[i].SN_CONGELATA);
						pisteid.push(data[i].ID_PISTA);
						descpiste.push(data[i].DESCR_PISTA);
					}
					id = that.remove_Duplicates(id);
					desc = that.remove_Duplicates(desc);
					gruppi = that.remove_Duplicates(gruppi);
					note = that.remove_Duplicates(note);
					cong = that.remove_Duplicates(cong);
					pisteid = that.remove_Duplicates(pisteid);
					descpiste = that.remove_Duplicates(descpiste);
					/*frag.push({
						DESCR_PISTA: descpiste,
						DESCR_SCHEDA: desc,
						DESCR_GRUPPOSCHEDA: gruppi,
						ID_PISTA: pisteid,
						ID_SCHEDAMASTER: id,
						NOTE: note,
						SN_CONGELATA: cong,
						GRADE: grade
					});
					frag.push({
						Data: tmp
					});*/
					frag[0] = {
						DESCR_PISTA: descpiste,
						DESCR_SCHEDA: desc,
						DESCR_GRUPPOSCHEDA: gruppi,
						ID_PISTA: pisteid,
						ID_SCHEDAMASTER: id,
						NOTE: note,
						SN_CONGELATA: cong,
						GRADE: grade,
					};
					var data11 = data;
					var m = {};
					tmp = [];
					for (var i = 0; i < data11.length; i++) {
						var v = data11[i],
							vv = data11[i].ID_SCHEDAMASTER + " : " + data11[i].ID_PISTA;
						if (!m[vv]) {
							tmp.push(v);
							m[vv] = true;
						}
					}

					var tmp1 = [];
					var xx = tmp,
						finalData = [];
					m = {};
					for (var i = 0; i < xx.length; i++) {
						var a = xx[i].ID_SCHEDAMASTER;

						for (var j = 0; j < xx.length; j++) {
							if (xx[j].ID_SCHEDAMASTER === a)
								tmp1.push(xx[j].ID_PISTA);
						}
						xx[i].PISTE = tmp1;
						tmp1 = [];
						if (!m[a]) {
							m[a] = true;
							finalData.push(xx[i]);
						}
					}

					frag[1] = {
						Data: tmp
					};
					frag[7] = {
						SchedaPiste: finalData
					};
					BusyIndicator.hide();
				},
				error: function (error) {
					BusyIndicator.hide();
				}
			});
		},
		/************************getFilterData function is used to access schedapersonalifilters.xsjs based on ID_PERIODO'
		ID_SCHEDAPERSONALE, DESCR_PERIODO, VALE_DAL,VALE_ALand sets the filters********************************/
		getFilterData: function () {
			BusyIndicator.show();
			var that = this;
			var payload = {
				"ID_PERIODO": selectedfiscalYearPeriodi
			};
			$.ajax({
				url: "/HANAMDC/STIP/STIPAdmin/services/schedapersonalifilters.xsjs",
				//url: "/HANAMDC/STIP/STIPAdmin/services/test.xsjs",
				type: "POST",
				method: "GET",
				contentType: 'application/json',
				dataType: 'text',
				data: {
					odata: JSON.stringify(payload)
				},
				success: function (data, textStatus1) {

					if (data.length > 0) {
						that.getFragmentData();
						filterData = JSON.parse(data);
						filterData[9].DESCR_STATOINVIO.splice(12, 1)
						this.ID_SCHEDAPERSONALI = filterData[17].ID_SCHEDAPERSONALE;
						var periodi = filterData[13].DESCR_PERIODO;
						that.byId("idtxtfiscalyear").setText(periodi);
						Periodi_start_date_main = filterData[14].VALE_DAL;
						Periodi_end_date_main = filterData[15].VALE_AL;
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
						filterData.push({
							Month: month
						});
						var tmp = filterData[18].MANAGER;
						for (i = 0; i < tmp.length; i++) {
							if (tmp[i].STATUS_DIPENDENTE === "1")
								tmp[i].STATUS_DIPENDENTE = "Active"; //STATUS_DIPENDENTE is assignes as 'Active' if value is 1
							else if (tmp[i].STATUS_DIPENDENTE === "2")
								tmp[i].STATUS_DIPENDENTE = "Inactive"; //STATUS_DIPENDENTE is assignes as 'Inactive' if value is 2
							if (data[i].DATA_CESSAZIONE_MGR !== null && data[i].DATA_CESSAZIONE_MGR !== "NULL" && data[i].DATA_CESSAZIONE_MGR !==
								undefined && data[i].DATA_CESSAZIONE_MGR !== "")
								data[i].DATA_CESSAZIONE_MGR = data[i].DATA_CESSAZIONE_MGR.substr(0, 4) + "-" + data[i].DATA_CESSAZIONE_MGR.substr(4, 2) +
								"-" + data[i].DATA_CESSAZIONE_MGR
								.substr(6, 2);
						}
						frag[2] = {
							Manager: tmp
						};
						frag[3] = {
							HR: filterData[19].HR
						};
						frag[4] = {
							Month: filterData[21].Month
						};
						frag[5] = {
							RoleData: filterData[3].ROLE
						}
						for (var j = 0; j < filterData[20].LETTERE_AUTOMATICA.length; j++) {
							if (filterData[20].LETTERE_AUTOMATICA[j].id === 0)
								filterData[20].LETTERE_AUTOMATICA[j].desc = "";
							if (filterData[20].LETTERE_AUTOMATICA[j].id === -1)
								filterData[20].LETTERE_AUTOMATICA.splice(j, 1);
						}
						frag[6] = {
								Lettere_Automatica: filterData[20].LETTERE_AUTOMATICA
							}
							/*var data11 = filterData[3].ROLE,m={},grd=[];
							for(var i = 0; i < data11.length; i++){
								var vv= data11[i].GRADE;
								if(!m[vv])
								{
									m[vv]=true;
									grd.push(data11[i]);
								}
							}
							frag[6]={GRADE:grd};*/
						var ltr = filterData[5].LETTER;
						var m = {},
							data11 = ltr;
						ltr = [];
						for (var i = 0; i < data11.length; i++) {
							var vv = data11[i].id;
							if (vv === 0)
								data11[i].desc = "";
							if (!m[vv] && vv !== -1) {
								m[vv] = true;
								ltr.push(data11[i]);
							}
						}
						filterData[5].LETTER = ltr;

						for (var j = 0; j < filterData[16].LETTERE_MANUALE.length; j++) {
							if (filterData[16].LETTERE_MANUALE[j].id === 0)
								filterData[16].LETTERE_MANUALE[j].desc = "";
							if (filterData[16].LETTERE_MANUALE[j].id === -1)
								filterData[16].LETTERE_MANUALE.splice(j, 1);
						}
						frag.push({
							"Manuale": filterData[16].LETTERE_MANUALE
						});
						filterData[3].ROLE = [];
						console.log(filterData);
						var data0 = [];
						var setData = [{
							Filter: filterData
						}, {
							Main: data0
						}, {
							Fragment: frag
						}];
						oMainModel.setSizeLimit(15000);
						oMainModel.setData(setData);
						BusyIndicator.hide();
						that.allLetters = oMainModel.getData()[0].Filter[5].LETTER;
						console.log(oMainModel.getData());
					}
				},
				error: function () {}
			});
		},
		/************************letterType function is used to push the letter based on the type********************************/
		letterType: function () {

			var tmpltr = this.allLetters;
			var ltr = [];
			var type = this.byId("ltr").getSelectedIndex();
			if (type === 1) { //If type =1 then pushing the letters with non-zero and not null auto value
				for (var i = 0; i < tmpltr.length; i++) {
					if (tmpltr[i].auto != null && tmpltr[i].auto != 0)
						ltr.push(tmpltr[i]);
				}
			} else if (type === 2) { //If type =2 then pushing the letters with mod='s'
				for (var i = 0; i < tmpltr.length; i++) {
					if (tmpltr[i].mod === "S")
						ltr.push(tmpltr[i]);
				}
			} else if (type === 3) { //If type =3 then pushing the letters with non-zero and not null Id value
				for (var i = 0; i < tmpltr.length; i++) {
					if (tmpltr[i].id != null && tmpltr[i].id != 0)
						ltr.push(tmpltr[i]);
				}
			} else
				ltr = this.allLetters;
			oMainModel.getData()[0].Filter[5].LETTER = ltr;
			oMainModel.refresh();
		},
		/************************getSchedaPersonaleData function is used to fetch the data from the backend (V_SchedaPersonale_group) based on filters********************************/
		getSchedaPersonaleData: function (oFilters) {
			BusyIndicator.show();
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			var data, that = this,
				tmp1 = [],
				oFilters1 = [];

			var filter = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, selectedfiscalYearPeriodi);

			oFilters.push(filter);

			xsoDataModel.read("/V_SchedaPersonale_group?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {

					data = [];
					var setData = [{
						Filter: filterData
					}, {
						Main: data
					}, {
						Fragment: frag
					}];

					oMainModel.setData(setData);
					oMainModel.refresh();
					if (that.count < 1)
						that.byId("prev").setEnabled(false);
					else
						that.byId("prev").setEnabled(true);
					that.byId("next").setEnabled(true);
					data = oDataIn.results;
					console.log(data);
					var matList = [],
						pckgList = [];
					if (data.length !== 0) {

						for (var i = 0; i < data.length; i++) {

							//new users
							data[i].SID2 = data[i].SID;
							if (data[i].SESSO === "M")
								data[i].SESSO = "Egregio Signor"; //SESSO is assigned Egregio Signo if value is M
							else if (data[i].SESSO === "F")
								data[i].SESSO = "Gentile Signora"; //SESSO is assigned Gentile Signora if value is F
							else
								data[i].SESSO = ""; //SESSO is blank for any other value

							if (data[i].FLOWSCELTO === "C")
								data[i].FLOWSCELTO = 1; //FLOWSCELTO is assigned 1 if value is C
							else if (data[i].FLOWSCELTO === "S")
								data[i].FLOWSCELTO = 0; //FLOWSCELTO is assigned 0 if value is S
							else
								data[i].FLOWSCELTO = -1; //FLOWSCELTO is assigned -1 for any other value

							if (data[i].ID_SCHEDAPERSONALE === null || data[i].ID_SCHEDAPERSONALE === undefined || data[i].ID_SCHEDAPERSONALE === 0) {
								data[i].ID_SCHEDAPERSONALE = 0;
								data[i].PDF1_Visible = false;
								data[i].PDF2_Visible = false;
							}
							if (data[i].ID_PACKAGEDS === null || data[i].ID_PACKAGEDS === undefined)
								data[i].ID_PACKAGEDS = 0;
							if (data[i].ID_PROTOCOLLO === null || data[i].ID_PROTOCOLLO === undefined)
								data[i].ID_PROTOCOLLO = 0;

							if (data[i].EMP_DATA_CESSAZIONE !== null && !data[i].EMP_DATA_CESSAZIONE.includes("NULL") && data[i].EMP_DATA_CESSAZIONE !==
								"") {
								var date = data[i].EMP_DATA_CESSAZIONE.substr(0, 4) + "-" + data[i].EMP_DATA_CESSAZIONE.substr(4, 2) + "-" + data[i].EMP_DATA_CESSAZIONE
									.substr(6, 2);
								var dd = date.split("-")[2] + "-" + date.split("-")[1] + "-" + date.split("-")[0];
								date = new Date(date);
								var today = new Date();
								if (date > today) { //If EMP_DATA_CESSAZIONE date > today , then date=nolineThrough and the checkbox is enabled
									date = "nolineThrough";
									data[i].Enable_CHECKBOX = true;
								} else {

									data[i].STATODIPENDENTE = "Cessato " + dd;
									date = "lineThrough";
									data[i].Enable_CHECKBOX = false;
								}
							} else {
								date = "nolineThrough";
								data[i].Enable_CHECKBOX = true;
							}
							data[i].date = date;

							data[i].ID_PROTOCOLLO2 = data[i].ID_PROTOCOLLO;
							if (data[i].SN_MODIFICATA === "N")
								data[i].SN_MODIFICATA = "No";
							else if (data[i].SN_MODIFICATA === "S")
								data[i].SN_MODIFICATA = "Si";
							if (data[i].DATETIME_CR) {
								if (data[i].DATETIME_CR !== null && data[i].DATETIME_CR !== "")

									data[i].DATETIME_CR = Formatter.removetime(data[i].DATETIME_CR);
								if (data[i].DATETIME_CR.includes("-"))
									data[i].DATETIME_CR = "";
							} else
								data[i].DATETIME_CR = "";
							if (data[i].ID_LETTERE_MANUALE === 0 || data[i].ID_LETTERE_MANUALE === null)
								data[i].LETTERE_DESCRIZIONE_MANUALE = "";
							if (data[i].ID_LETTERE_AUTOMATICA === 0 || data[i].ID_LETTERE_AUTOMATICA === null)
								data[i].LETTERE_DESCRIZIONE_AUTOMATICA = "";
							/*if (data[i].ID_STATOINVIO === 10)
								data[i].DESCR_STATOINVIO = "Accettato";*/
							var sdate = data[i].INIZIO_ASSEGNAZIONE,
								edate = data[i].FINE_ASSEGNAZIONE;
							if (sdate !== null && sdate !== undefined && sdate !== "" && edate !== null && edate !== undefined && edate !== "") {
								if (typeof (sdate) === "string" && sdate.includes("Date")) {
									sdate = new Date(parseInt(sdate.substring(6, sdate.length - 2), 10));
									edate = new Date(parseInt(edate.substring(6, edate.length - 2), 10));
								}
								sdate = Formatter.months(sdate.getMonth() + 1) + " " + sdate.getFullYear();
								edate = Formatter.months(edate.getMonth() + 1) + " " + edate.getFullYear();

							} else {
								sdate = "";
								edate = "";
							}
							data[i].INIZIO_ASSEGNAZIONE = sdate;
							data[i].FINE_ASSEGNAZIONE = edate;
							var edate1 = oMainModel.getData()[0].Filter[21].Month[12].month;
							var sdate1 = oMainModel.getData()[0].Filter[21].Month[1].month;

							if (data[i].SN_INATTIVO === "S" && data[i].INIZIO_ASSEGNAZIONE === sdate1 && data[i].FINE_ASSEGNAZIONE === edate1)
								data[i].date = "lineThrough";

						}
						//**********************start of removing duplicate checkbox id for same matricola**************************

						//**********************end of removing duplicate checkbox id for same matricola************************** 
						//Removing multiple records with same id scheda in 1 matricola

						var data11 = data;
						var m = {};
						data = [];
						for (var i = 0; i < data11.length; i++) {
							if (data11[i].MATRICOLA !== "") {
								data11[i].MATRICOLA_JR = data11[i].MATRICOLA;
								data11[i].NOME_JR = data11[i].NOME;
								data11[i].COGNOME_JR = data11[i].COGNOME;
								data11[i].BB_JR = data11[i].BAND;

							}

							var v = data11[i],
								vv;

							//	vv = data11[i].MATRICOLA_JR + ":" + data11[i].ID_SCHEDAPERSONALE;
							vv = data11[i].ID_PACKAGEDS;
							data11[i].PDF1_Visible = false;
							data11[i].PDF2_Visible = false;
							if (data11[i].INIZIO_ASSEGNAZIONE === "" || data11[i].INIZIO_ASSEGNAZIONE.split(" ")[1].includes("-"))
								data11[i].INIZIO_ASSEGNAZIONE = "";
							if (data11[i].FINE_ASSEGNAZIONE === "" || data11[i].FINE_ASSEGNAZIONE.split(" ")[1].includes("-"))
								data11[i].FINE_ASSEGNAZIONE = "";
							if (data11[i].ID_SCHEDAMASTER === 0 || data11[i].ID_SCHEDAMASTER === "" || data11[i].ID_SCHEDAMASTER === null) {
								data11[i].ID_SCHEDAMASTER = "";
								data11[i].PDF1_Visible = false;
								data11[i].PDF2_Visible = false;
							} else
								data11[i].PDF2_Visible = true;
							/*if (data11[i].ID_TIPOFLOW === 5) {
								data11[i].PDF1_Visible = true;
								data11[i].PDF2_Visible = true;
							}*/
							if (data11[i].SN_SCHEDAGESTIONALE === "S")
								data11[i].DESCR_SCHEDA = "Scheda Gestionale" + data11[i].PERC_GESTIONALE + "%";
							if (data11[i].SN_INATTIVO === "S") {
								data11[i].STATODIPENDENTE = "Inattivo";
								data11[i].ID_PROTOCOLLO = "";
							}
							if (data11[i].ID_SCHEDAMASTER === 0 && data11[i].SN_SCHEDAGESTIONALE === "S") {
								data11[i].DESCR_SCHEDA = data11[i].PERC_GESTIONALE + "%";
								data11[i].MAXPERCPAYOUT = data11[i].PERC_GESTIONALE;
								//data11[i].MAXPERCPAYOUT = data11[i].NOTE_GESTIONALE;
								data11[i].ID_SCHEDAMASTER = "";
							}
							if (data11[i].STATODIPENDENTE === "N")
								data11[i].STATODIPENDENTE = "";
							if (data11[i].ID_STATOINVIO === 7 || data11[i].ID_STATOINVIO === 12 || data11[i].ID_STATOINVIO === 11)
								data11[i].ID_PROTOCOLLO = "";
							/*if (data11[i].ID_STATOINVIO === 8 || data11[i].ID_STATOINVIO === 14)*/
							if (data11[i].ID_STATOINVIO >= 8 && data11[i].ID_STATOINVIO != 12)
								data11[i].PDF1_Visible = true;

							if (!m[vv]) {

								/*	if (data11[i].ID_PACKAGEDS !== null && data11[i].ID_PACKAGEDS !== 0)
										pckgCount = pckgCount + 1;*/
								data.push(v);
								m[vv] = true;
							}

						}

						console.log(data);
						var sdate2 = "";
						/* In below loop, we have separated INIZIO_ASSEGNAZIONE: "Aprile 2019" as  INIZIO_ASSEGNAZIONE_year &  INIZIO_ASSEGNAZIONE_month for next sorting function */
						for (var i = 0; i < data.length; i++) {
							//	debugger
							sdate2 = data[i].INIZIO_ASSEGNAZIONE;
							if (sdate2 === "") {
								continue;
							}
							var smm = sdate2.split(" ")[0];
							var syy = parseInt(sdate2.split(" ")[1], 10);
							data[i].INIZIO_ASSEGNAZIONE_year = syy;
							data[i].INIZIO_ASSEGNAZIONE_month = smm;

						}
						console.log(data);

						const flowType = ['Assegnazione Standard', 'Assegnazione Standard 1 Firma', 'Assegnazione Standard (Cartaceo)',
							'Consuntivazione Standard', 'Consuntivazione  Standard 1 Firma', 'Consuntivazione Standard (Cartaceo)'
						];
						const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
							'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
						];

						/*	Sorting sequence is as below:

							1.	SID
							2.	Flow: Assegnazione types first then Consuntivazione types flows
							3. Assegnazione types sorted as per start date
							4. No start date for Consuntivazione flows . Kept as it is  */

						const sorter = (a, b) => {

							if (a.SID2 !== b.SID2) { // this if condtion is step 1 sorting SID

								return a.SID2 - b.SID2;
							} else {

								if (a.FLOW !== "" && a.FLOW !== undefined && a.FLOW !== null & b.FLOW !== "" && b.FLOW !== undefined && b.FLOW !== null) {
									if (a.FLOW.includes("Assegnazione") && b.FLOW.includes("Assegnazione")) { //when Flow type starts with Assegnazione, sorted as per start date( year first, then month)
										if (a.INIZIO_ASSEGNAZIONE_year !== b.INIZIO_ASSEGNAZIONE_year)
											return a.INIZIO_ASSEGNAZIONE_year - b.INIZIO_ASSEGNAZIONE_year;
										else
											return months.indexOf(a.INIZIO_ASSEGNAZIONE_month) - months.indexOf(b.INIZIO_ASSEGNAZIONE_month);

									} else if (a.FLOW.includes("Consuntivazione") && b.FLOW.includes("Consuntivazione")) { //when Flow type starts with Consuntivazione, sorted as per start date( year first, then month)
										if (a.INIZIO_ASSEGNAZIONE_year !== b.INIZIO_ASSEGNAZIONE_year)
											return a.INIZIO_ASSEGNAZIONE_year - b.INIZIO_ASSEGNAZIONE_year;
										else
											return months.indexOf(a.INIZIO_ASSEGNAZIONE_month) - months.indexOf(b.INIZIO_ASSEGNAZIONE_month);

									} else
										return flowType.indexOf(a.FLOW) - flowType.indexOf(b.FLOW);
								}
							}
						};

						data.sort(sorter);

						console.log(data);

						var data11 = data;
						var m = {},
							n = {};
						data = [];
						/* in below loop if multiple rows having same MATRICOLA_JR & SID, then will keep it only for first row
						for rest other rows with same SID, we are keeping MATRICOLA_JR & SID as ""
						This we are doing for display purpose in result table
						In below for loop, rows having matricola "", we are not displaying checkbox in result table  
						*/

						for (var i = 0; i < data11.length; i++) {
							var v = data11[i],
								vv = data11[i].MATRICOLA_JR,
								xx = data11[i].ID_PACKAGEDS;
							if (!m[vv]) {
								m[vv] = true;

								//matCount = matCount + 1;
							} else {
								data11[i].SID = "";
								data11[i].MATRICOLA = "";
								data11[i].NOME = "";
								data11[i].COGNOME = "";
							}
							if (data11[i].MATRICOLA !== "") {
								data11[i].DISPLAY_CHECKBOX = true;
								matList.push(data11[i].MATRICOLA);
							} else
								data11[i].DISPLAY_CHECKBOX = false;

							data.push(v);

						}

						console.log(data);

						var newFilter = [],
							flag = 0;
						if (this.load === 1) {
							for (var i = 0; i < oFilters.length; i++) {
								if (oFilters[i].sPath === "INIZIO_ASSEGNAZIONE" || oFilters[i].sPath === "FINE_ASSEGNAZIONE" || oFilters[i].sPath ===
									undefined)
									flag = 1;
							}
							if (flag === 1) {
								for (var ii = 0; ii < matList.length; ii++) {
									newFilter.push(new sap.ui.model.Filter("MATRICOLA", sap.ui.model.FilterOperator.EQ, matList[ii]));

								}
							}
						}

						if (flag === 1 && this.load === 1) {
							this.load += 1;
							if (newFilter.length !== 0)
								this.getSchedaPersonaleData(newFilter);

						}
						if (newFilter.length === 0)
							this.load += 1;

						//	BusyIndicator.hide();

						var setData = [{
							Filter: filterData
						}, {
							Main: []
						}, {
							Fragment: frag
						}, {
							All: data
						}];
						oMainModel.setSizeLimit(15000);
						oMainModel.setData(setData);
						var page;
						//allData = oMainModel.getData()[1].Main;
						if (this.load > 1) {
							that.matLayout();
							that.countData();
						}

						var aa = 0;
						for (var i = 0; i < this.matList.length; i++) {

							aa += this.matList[i].length;
						}
						if (aa >= totalmatCount)
							that.byId("next").setEnabled(false);
						else
							that.byId("next").setEnabled(true);

					} else {
						this.moreData = 1;

					}

				}.bind(this),
				error: function (oError) {

					that.newUser(aFilters);
					console.log("Error");
					data = [];
					var setData = [{
						Filter: filterData
					}, {
						All: data
					}, {
						Fragment: frag
					}];

					oMainModel.setData(setData);
					oMainModel.refresh();
					that.byId("matCount").setText("");
					BusyIndicator.hide();

				}.bind(this)
			});

		},

		/************************countData function is used to calculate and dispaly the total Matricola and package count********************************/
		countData: function () {
			var page,
				m = {},
				vv;
			var MainData = oMainModel.getData()[1].Main;
			matCount = 0, pckgCount = 0;
			// for (var i = 0; i < this.matList.length; i++)
			// 	matCount += this.matList[i].length; //Incrementing the Matricola count
			// for (var i = 0; i < this.pckgList.length; i++)
			// 	pckgCount += this.pckgList[i].length; //Incrementing the package count
			for (var i = 0; i < this.matList.length; i++)

				matCount += this.matList[i].length; //Incrementing the Matricola count
			for (var i = 0; i < this.pckgList.length; i++)
				pckgCount += this.pckgList[i].length; //Incrementing the package count

			/*if (this.prevv === false) {
				totalmatCount = totalmatCount + matCount;
				totalpckgCount = totalpckgCount + pckgCount;
			}*/

			this.matCount = matCount;
			this.pckgCount = pckgCount;
			if (matCount > totalmatCount)
				totalmatCount = matCount;
			if (pckgCount > totalpckgCount)
				totalpckgCount = pckgCount
			page = matCount / 50;
			var txt = "\nMatricola : " + matCount + "/" + totalmatCount + "\n" + "Packages : " + pckgCount + "/" + totalpckgCount + "\n" +
				"\nPage: " + page + "\n";

			this.byId("matCount").setText(txt);

			oMainModel.refresh();
			if (matCount >= totalmatCount)
				this.byId("next").setEnabled(false);
			else if (matCount <= 50)
				this.byId("prev").setEnabled(false);
			else {
				this.byId("next").setEnabled(true);
				this.byId("prev").setEnabled(true);
			}
		},
		/******************newUser function is used to fetch the data from the V_USER , adds a new user and increments the Usercount**************/
		newUser: function (oFilters) {
			debugger;
			var that = this;
			for (var i = 0; i < oFilters.length; i++) {
				if (oFilters[i].sPath === 'SID')
					oFilters[i].sPath = 'SUPERID';
				if (oFilters[i].sPath === 'ID_PERIODO')
					oFilters.splice(i, 1);
			}

			var tabData = [];
			for (var i = 0; i < this.matList.length; i++) {
				for (var j = 0; j < this.matList[i].length; j++)
					tabData.push(this.matList[i][j]);
			}
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");

			this.matList.pop();
			this.pckgList.pop()

			var MainData = oMainModel.getData()[3].All;
			xsoDataModel.read("/V_USER?$format=json", {
				filters: oFilters,

				success: function (oDataIn, oResponse) {
					debugger;
					var matCount = 0;
					var data = oDataIn.results;
					console.log(data);
					if (data.length !== 0) {
						//skipUser+=topsUser;

						for (var i = 0; i < data.length; i++) {
							if (data[i].SESSO === "M")
								data[i].SESSO = "Egregio Signor"; //SESSO is assigned Egregio Signo if value is M
							else if (data[i].SESSO === "F")
								data[i].SESSO = "Gentile Signora"; //SESSO is assigned Gentile Signora if value is F
							else
								data[i].SESSO = ""; //SESSO is set blank for any other value

							data[i].MATRICOLA_MGR = data[i].MATRICOLAMANAGER;
							data[i].SID2 = data[i].SID;
							data[i].COGNOME_JR = data[i].COGNOME;
							data[i].NOME_JR = data[i].NOME;
							data[i].MATRICOLA_JR = data[i].MATRICOLA;

							if (data[i].EMP_DATA_CESSAZIONE !== null && !data[i].EMP_DATA_CESSAZIONE.includes("NULL") && data[i].EMP_DATA_CESSAZIONE !==
								"") {
								var date = data[i].EMP_DATA_CESSAZIONE.substr(0, 4) + "-" + data[i].EMP_DATA_CESSAZIONE.substr(4, 2) + "-" + data[i].EMP_DATA_CESSAZIONE
									.substr(6, 2);
								var dd = date.split("-")[2] + "-" + date.split("-")[1] + "-" + date.split("-")[0];
								date = new Date(date);
								var today = new Date(date);
								if (date > today) { //If EMP_DATA_CESSAZIONE date > today , then date=nolineThrough and the checkbox is enabled 
									date = "nolineThrough";
									data[i].Enable_CHECKBOX = true;
								} else {

									data[i].STATODIPENDENTE = "Cessato " + dd;
									date = "lineThrough";
									data[i].Enable_CHECKBOX = false;
								}
							} else {
								date = "nolineThrough";
								data[i].Enable_CHECKBOX = true;
							}

							data[i].date = date;
							data[i].User = "New";
							data[i].SID = data[i].SUPERID;
							data[i].MATRICOLA_JR = data[i].MATRICOLA;
							data[i].ID_SCHEDAPERSONALE = 0;
							data[i].ID_PACKAGEDS = 0;
							data[i].ID_PROTOCOLLO2 = 0;
							data[i].ID_PROTOCOLLO = "";

							data[i].PDF1_Visible = false;
							data[i].PDF2_Visible = false;
						}
						/*for (var i = 0; i < data.length; i++)
							MainData.push(data[i]);
*/
						var m = {},
							vv;
						for (var ii = 0; ii < tabData.length; ii++) {
							vv = tabData[ii];
							m[vv] = true;
						}

						for (var ii = 0; ii < data.length; ii++) {
							vv = data[ii].MATRICOLA_JR;

							if (!m[vv])
								MainData.push(data[ii]);
							m[vv] = true;
						}

					}

					var tmp = oMainModel.getData()[1].Main;
					var setData = [{
						Filter: filterData
					}, {
						Main: tmp
					}, {
						Fragment: frag
					}, {
						All: MainData
					}];
					oMainModel.setSizeLimit(15000);
					oMainModel.setData(setData);

					console.log(oMainModel.getData());
					this.matLayout();

					BusyIndicator.hide();
				}.bind(this),
				error: function (oError) {
					BusyIndicator.hide();
					//Handle the error
					//MessageBox.error("Data fetch failed while fetching Scheda Personale. Please contact administrator.");
				}.bind(this)
			});
			xsoDataModel.attachRequestCompleted(function () {

				allData = oMainModel.getData()[1].Main;

				if (oMainModel.getData()[1].Main.length === 0) {
					MessageBox.error("Nessun utente trovato");
					that.byId("next").setEnabled(false);
				}
			});

		},
		/************************_next function is used to navigate to the next page of the table********************************/
		_next: function () {
			this.nextPage = true;
			this.byId("prev").setEnabled(true);
			this.matLayout();
		},
		/*************************_prev function is used to navigate to the previous page of the table*******************************/
		_prev: function () {
			this.matList.pop();
			this.pckgList.pop();
			this.matList.pop();
			this.pckgList.pop();
			this.matLayout();
			this.byId("next").setEnabled(true);
			this.countData();
		},
		matLayout: function () {
			BusyIndicator.show();
			if (this.nextPage === false && this.pckgList.length >= 1) {
				this.pckgList = [];
				this.matList = [];
			}
			var mainData = oMainModel.getData()[3].All,
				page = [];
			var matCount = 0,
				matList = [],
				pckgList = [];
			var start = 0,
				end;
			if (this.matList.length === 0) {
				start = 0;
				end = mainData.length;
			} else {
				for (var ii = 0; ii < this.matList[this.matList.length - 1].length; ii++) {
					for (var i = 0; i < mainData.length; i++) {

						if (this.matList[this.matList.length - 1][ii] === mainData[i].MATRICOLA_JR)

							break;
					}
				}

				for (var ii = i + 1; ii < mainData.length; ii++) {

					if (mainData[ii].MATRICOLA != "")

						break;
				}

				start = ii;

				end = mainData.length;
			}
			var m = {},
				vv;
			for (var i = start; i < end; i++) {
				vv = mainData[i].ID_PACKAGEDS;
				if (vv === 0)
					vv = mainData[i].ID_PACKAGEDS + ":" + mainData[i].MATRICOLA;
				if (!m[vv])
					m[vv] = true;
				if (mainData[i].ID_PACKAGEDS !== 0)
					pckgList.push(mainData[i].ID_PACKAGEDS);
				if (mainData[i].MATRICOLA !== "") {
					matCount += 1;
					matList.push(mainData[i].MATRICOLA);
				}
				page.push(mainData[i]);
				if (matCount === 50)
					break;

			}
			if (matCount === 50) {

				for (var i = start; i < mainData.length; i++) {

					for (var ii = 0; ii < page.length; ii++) {
						vv = mainData[i].ID_PACKAGEDS;
						if (mainData[i].MATRICOLA_JR === matList[matList.length - 1] && !m[vv] && vv !== 0) {
							m[vv] = true;
							page.push(mainData[i]);
							if (mainData[i].ID_PACKAGEDS !== 0)
								pckgList.push(mainData[i].ID_PACKAGEDS);
						}
					}
				}
			}
			var colorToSet = "G";
			var allData = page;
			debugger
			for (var i = 0; i < allData.length; i++) {
				if (allData[i].MATRICOLA !== "" && colorToSet === "G") {
					colorToSet = String("W");
				} else if (allData[i].MATRICOLA !== "" && colorToSet === "W") {
					colorToSet = String("G");
				}
				allData[i].COLORSET = colorToSet;

			}
			this.matList.push(matList);
			this.pckgList.push(pckgList);

			oMainModel.setProperty("/1/Main", page);
			oMainModel.refresh();
			console.log(page);
			console.log(matList);
			if (matList.length < 50 && this.NewUserCount === 0) {
				this.NewUserCount += 1;

				this.newUser(this.oFilters);
			}

			this.countData();
			BusyIndicator.hide();
		},
		/************************clear function is used to reset all the filter fields as blank********************************/
		clear: function () {

			first = 0;
			this.count = 0;
			tops = 500;
			skip = 0;
			topsUser = 100;
			skipUser = 0;
			this.tabData = [];
			this.byId("sid").setValue("");
			this.byId("matricola").setValue("");
			this.byId("cognome").setValue("");
			this.byId("Nome").setValue("");
			this.byId("Dimessi").setSelectedKey("");
			this.byId("Qualifica").setSelectedKey("");
			this.byId("Company").setSelectedKey("");
			this.byId("bb").setSelectedKey("");
			this.byId("idTree").setValue("");

			this.byId("pos").setValue("");

			this.byId("ruolo").setValue("");
			this.byId("cb").setSelectedKey("");
			this.byId("checkBoxSG").setSelected(false);
			this.byId("pisteid").setValue("");
			this.byId("box1").setSelectedKey("");
			this.byId("idscheda").setValue("");
			this.byId("descscheda").setValue("");
			this.byId("maxpay").setSelectedKey("");
			//this.byId("tp").setValue("");
			this.byId("gruppo").setSelectedKey("");
			this.byId("respdir").setValue("");
			this.byId("Protocollo").setValue("");
			this.byId("sdate").setSelectedKey("");
			this.byId("edate").setSelectedKey("");
			this.byId("TipiPckg").setSelectedKey("");
			//this.byId("vpi").setSelectedKey("");
			this.byId("statoPckg").setSelectedKey("");
			this.byId("TipiFlow").setSelectedKey("");
			this.byId("TemplateLettere").setSelectedKey("");
			this.byId("DataStato").setValue("");
			//this.byId("schedaPersonaleTable").setVisible(false);
		},
		/************************remove_Duplicates function is used to remove the duplicate values********************************/
		remove_Duplicates: function (data2) {
			//
			var data11 = data2;
			data2 = [{
				key: ""
			}];
			var m = {};
			for (var i = 0; i < data11.length; i++) {
				var v = data11[i];
				if (v !== null && v !== undefined && v !== "") {
					if (!m[v]) {
						data2.push({
							key: v
						});
						m[v] = true;
					}
				}
			}
			return data2;
		},
		//Below is old tree structure 
		/*	onPressView: function (oEvent) {
				this.secondTreebtn = false;
				this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.OrgDialog", this);
				this.getView().addDependent(this._oValueHelpDialog);
				this.jModel1 = new JSONModel();
				this.jModel1.setData(this.data1);
				this.getView().setModel(this.jModel1);
				this._oValueHelpDialog.open();
			},*/
		/************************onCancelDialog function is used to close the dialog box and the tree selection is cancelled********************************/
		onCancelDialog: function () {
			this.deptFragment.destroy();
		},
		/************************onSearch function is used to fetch the data from the backend based on the filter values********************************/
		onSearch: function (currentPage) {
			this.nextPage = false;
			this.tabData = [];
			this.NewUserCount = 0;
			if (currentPage === 0) {
				this.matList = [];
				this.pckgList = [];
				first = 0;
				this.count = 0;
				tops = 500;
				skip = 0;
				topsUser = 100;
				skipUser = 0;
				totalmatCount = 0;
				totalpckgCount = 0;
				this.prevv = false;
				matCount = 0;
				pckgCount = 0;

			} else {
				this.matList.pop();
				this.pckgList.pop();
				for (var i = 0; i < this.matList.length; i++) {
					for (var j = 0; j < this.matList[i].length; j++)
						this.tabData.push(this.matList[i][j]);
				}
			}

			this.PageData = [];
			this.load = 1;

			this.byId("schedaPersonaleTable").setVisible(true);
			this.byId("prev").setVisible(true);
			this.byId("next").setVisible(true);

			this.byId("prev").setEnabled(false);

			var sid = this.byId("sid").getValue();
			var matricola = this.byId("matricola").getValue();
			var cognome = this.byId("cognome").getValue();
			var nome = this.byId("Nome").getValue();
			var Dimessi = this.byId("Dimessi").getSelectedKey();
			var Qualifica = this.byId("Qualifica").getSelectedKey();
			var Company = this.byId("Company").getSelectedKey();
			var bb = this.byId("bb").getSelectedKey();
			var dept = this.byId("idTree").getValue();
			var pos = this.byId("pos").getValue();
			var ruolo = this.byId("ruolo").getValue();
			var cb = this.byId("cb").getSelectedKey();
			var pisteid = this.byId("pisteid").getValue();
			var tipoPista = this.byId("box1").getSelectedKey();
			var idscheda = this.byId("idscheda").getValue();
			var descscheda = this.byId("descscheda").getValue();
			var maxpay = this.byId("maxpay").getSelectedKey();
			//var tp = this.byId("tp").getValue();
			var gruppo = this.byId("gruppo").getSelectedKey();
			var respdir = this.byId("respdir").getValue();
			//	var resphr = this.byId("resphr").getValue();
			var sdate = this.byId("sdate").getSelectedKey();
			var edate = this.byId("edate").getSelectedKey();
			var Protocollo = this.byId("Protocollo").getValue();
			//var vpi = this.byId("vpi").getSelectedKey();
			var TipiPckg = this.byId("TipiPckg").getSelectedKey();
			var statoPckg = this.byId("statoPckg").getSelectedKey();
			var TipiFlow = this.byId("TipiFlow").getSelectedKey();
			var TemplateLettere = this.byId("TemplateLettere").getSelectedKey();
			var sg = this.byId("checkBoxSG").getSelected();
			var DataStato = this.byId("DataStato").getValue();
			var oFilters = [],
				f = 0;
			if (DataStato !== "") {

				var dt = parseInt(DataStato.split("-")[0], 10) + 1;
				var yr = parseInt(DataStato.split("-")[2], 10);
				if (dt === 13) {
					dt = 1;
					yr = DataStato.split("-")[2] + 1;
				}
				var DataStato2 = DataStato.split("-")[1] + "-" + dt + "-" + yr;
				DataStato = DataStato.split("-")[1] + "-" + DataStato.split("-")[0] + "-" + DataStato.split("-")[2];
				DataStato = new Date(DataStato);
				DataStato2 = new Date(DataStato2);

				var filter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("DATETIME_CR", sap.ui.model.FilterOperator.GE, DataStato),
						new sap.ui.model.Filter("DATETIME_CR", sap.ui.model.FilterOperator.LT, DataStato2),
					],
					and: true,
				});
				oFilters.push(filter);
			}
			if (sg === true) {
				var filter = new sap.ui.model.Filter("SN_SCHEDAGESTIONALE", sap.ui.model.FilterOperator.EQ, "S");
				oFilters.push(filter);
			}
			if (sid != undefined && sid != "") {
				var filter = new sap.ui.model.Filter("SID", sap.ui.model.FilterOperator.Contains, sid.trim());
				oFilters.push(filter);
			}

			if (matricola != undefined && matricola != "") {
				//var filter = new sap.ui.model.Filter("COGNOME", sap.ui.model.FilterOperator.EQ, cognome);
				var filter = new sap.ui.model.Filter({
					path: 'MATRICOLA',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: matricola.trim(),
					caseSensitive: false
				});
				oFilters.push(filter);
			}

			if (cognome != undefined && cognome != "") {
				//var filter = new sap.ui.model.Filter("COGNOME", sap.ui.model.FilterOperator.EQ, cognome);
				var filter = new sap.ui.model.Filter({
					path: 'COGNOME',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: cognome.trim(),
					caseSensitive: false
				});
				oFilters.push(filter);
			}
			if (nome != undefined && nome != "") {
				//var filter = new sap.ui.model.Filter("NOME", sap.ui.model.FilterOperator.EQ, nome)
				//nome = "'" + nome.trim()+ "'";
				//nome = nome.toUpperCase();
				var filter = new sap.ui.model.Filter({
					path: 'NOME',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: nome,
					caseSensitive: false
				});
				oFilters.push(filter);
			}
			if (Dimessi != undefined && Dimessi != "") {
				var filter = new sap.ui.model.Filter("STATUS_DIPENDENTE", sap.ui.model.FilterOperator.EQ, Dimessi);
				oFilters.push(filter);
			}
			if (sdate != undefined && sdate != "" && sdate != 0) {

				var month = Formatter.monthsRev(sdate.split(" ")[0]); //monthsRev function of formatter is used
				var yr = sdate.split(" ")[1];

				if (month === 1 || month === 3 || month === 5 || month === 7 || month === 8 || month === 10 || month === 12) {
					if (month < 10) //0 is diplayed before the month number if month <10
						month = "0" + month;
					var sdate2 = yr + "-" + month + "-31"; //Determining months with 31 days
				} else if (month === 2 && yr % 4 === 0) {
					if (month < 10)
						month = "0" + month;
					sdate2 = yr + "-" + month + "-29"; //Determining number of days in Februray of a leap year
				} else if (month === 2 && yr % 4 !== 0) {
					if (month < 10)
						month = "0" + month;
					sdate2 = yr + "-" + month + "-28"; //Determining number of days in Februray of a non-leap year
				} else {
					if (month < 10)
						month = "0" + month;
					sdate2 = yr + "-" + month + "-30"; //Determining months with 31 days
				}
				sdate2 = sdate2 + "T23:59:59.000";
				sdate2 = new Date(sdate2);

				sdate = Formatter.monthsRev(sdate.split(" ")[0]) + "-01-" + sdate.split(" ")[1];
				sdate = new Date(sdate);
				var filter = new sap.ui.model.Filter("INIZIO_ASSEGNAZIONE", sap.ui.model.FilterOperator.BT, sdate, sdate2);

				oFilters.push(filter);
			}
			if (edate != undefined && edate != "" && edate != 0) {
				//	if (sdate != undefined || sdate != "" || sdate != 0) {
				var month = Formatter.monthsRev(edate.split(" ")[0]);
				var yr = edate.split(" ")[1];
				if (month === 1 || month === 3 || month === 5 || month === 7 || month === 8 || month === 10 || month === 12) {
					if (month < 10)
						month = "0" + month;
					var edate2 = yr + "-" + month + "-31";
				} else if (month === 2 && yr % 4 === 0) {
					if (month < 10)
						month = "0" + month;
					edate2 = yr + "-" + month + "-29";
				} else if (month === 2 && yr % 4 !== 0) {
					if (month < 10)
						month = "0" + month;
					edate2 = yr + "-" + month + "-28";
				} else {
					if (month < 10)
						month = "0" + month;
					edate2 = yr + "-" + month + "-30";
				}
				edate2 = edate2 + "T23:59:59.000";
				edate2 = new Date(edate2);

				edate = Formatter.monthsRev(edate.split(" ")[0]) + "-01-" + edate.split(" ")[1];
				edate = new Date(edate);
				var filter = new sap.ui.model.Filter("FINE_ASSEGNAZIONE", sap.ui.model.FilterOperator.BT, edate, edate2);

				oFilters.push(filter);
				//}
			}
			if (Qualifica != undefined && Qualifica != "") {
				if (Qualifica === 'D')
					var filter = new sap.ui.model.Filter({
						path: 'QUALIFICA',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: Qualifica,
						caseSensitive: false
					});
				else if (Qualifica === 'Q')
					var filter = new sap.ui.model.Filter({
						path: 'HR1_PAYGRADE',
						operator: sap.ui.model.FilterOperator.Contains,
						value1: Qualifica,
						caseSensitive: false
					});

				else if (Qualifica === 'I') {
					var filter1 = new sap.ui.model.Filter({
						path: 'QUALIFICA',
						operator: sap.ui.model.FilterOperator.Contains,
						value1: Qualifica,
						caseSensitive: false
					});
					oFilters.push(filter1);
					var filter2 = new sap.ui.model.Filter({
						path: 'HR1_PAYGRADE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: '1',
						caseSensitive: false
					});
					var filter3 = new sap.ui.model.Filter({
						path: 'HR1_PAYGRADE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: '2',
						caseSensitive: false
					});
					var filter4 = new sap.ui.model.Filter({
						path: 'HR1_PAYGRADE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: '3',
						caseSensitive: false
					});
					var filter5 = new sap.ui.model.Filter({
						path: 'HR1_PAYGRADE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: '4',
						caseSensitive: false
					});
					var filter6 = new sap.ui.model.Filter({
						path: 'HR1_PAYGRADE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: '5',
						caseSensitive: false
					});
					var filter7 = new sap.ui.model.Filter({
						path: 'HR1_PAYGRADE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: '5S',
						caseSensitive: false
					});
					var filter8 = new sap.ui.model.Filter({
						path: 'HR1_PAYGRADE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: '6',
						caseSensitive: false
					});
					var filter9 = new sap.ui.model.Filter({
						path: 'HR1_PAYGRADE',
						operator: sap.ui.model.FilterOperator.EQ,
						value1: '7',
						caseSensitive: false
					});
					filter = new sap.ui.model.Filter({
						filters: [

							filter2,
							filter3,
							filter4,
							filter5,
							filter6,
							filter7,
							filter8,
							filter9

						],
						and: false
					});
				}
				oFilters.push(filter);
			}
			if (Company != undefined && Company != "") {
				var filter = new sap.ui.model.Filter("SOCIETA", sap.ui.model.FilterOperator.EQ, Company);
				oFilters.push(filter);
			}
			if (bb != undefined && bb != "") {
				var filter = new sap.ui.model.Filter("BAND", sap.ui.model.FilterOperator.EQ, bb);
				oFilters.push(filter);
			}
			if (dept != undefined && dept != "") {
				var filter = new sap.ui.model.Filter("DIP_DESCR", sap.ui.model.FilterOperator.Contains, dept);
				oFilters.push(filter);
			}
			if (pos != undefined && pos != "") {
				var filter = new sap.ui.model.Filter("POSITIONDESCRIPTION", sap.ui.model.FilterOperator.Contains, pos);
				oFilters.push(filter);
			}
			if (ruolo != undefined && ruolo != "") {

				filter = new sap.ui.model.Filter("RUOLO_PROF", sap.ui.model.FilterOperator.Contains, ruolo);
				oFilters.push(filter);
			}
			if (cb != undefined && cb != "") {
				if (cb === "S")
					var filter = new sap.ui.model.Filter("PERCSTIP", sap.ui.model.FilterOperator.NE, 0);

				else
					var filter = new sap.ui.model.Filter("PERCSTIP", sap.ui.model.FilterOperator.EQ, 0);
				oFilters.push(filter);
			}
			if (pisteid != undefined && pisteid != "") {
				var filter = new sap.ui.model.Filter("ID_PISTAVIEW", sap.ui.model.FilterOperator.EQ, pisteid);
				oFilters.push(filter);
			}
			if (tipoPista != undefined && tipoPista != "") {

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
			if (maxpay != undefined && maxpay != "") {
				var filter = new sap.ui.model.Filter("MAXPERCPAYOUT", sap.ui.model.FilterOperator.EQ, parseInt(maxpay, 10));
				oFilters.push(filter);
			}
			if (Protocollo != undefined && Protocollo != "") {
				var filter = new sap.ui.model.Filter("ID_PROTOCOLLO", sap.ui.model.FilterOperator.EQ, Protocollo);
				oFilters.push(filter);
			}
			if (TemplateLettere != undefined && TemplateLettere != "") {
				var filter1 = new sap.ui.model.Filter("ID_LETTERE_MANUALE", sap.ui.model.FilterOperator.EQ, parseInt(TemplateLettere, 10));
				var filter2 = new sap.ui.model.Filter("ID_LETTERE_AUTOMATICA", sap.ui.model.FilterOperator.EQ, parseInt(TemplateLettere, 10));
				var ofilter5 = new sap.ui.model.Filter({
					filters: [
						filter1,
						filter2
					],
					and: false
				});
				oFilters.push(ofilter5);
				//oFilters.push(filter);
			}
			if (TipiFlow != undefined && TipiFlow != "") {
				var filter = new sap.ui.model.Filter("ID_TIPOFLOW", sap.ui.model.FilterOperator.EQ, parseInt(TipiFlow, 10));
				oFilters.push(filter);
			}
			if (statoPckg != undefined && statoPckg != "") {
				var filter = new sap.ui.model.Filter("ID_STATOINVIO", sap.ui.model.FilterOperator.EQ, parseInt(statoPckg, 10));
				oFilters.push(filter);
			}
			if (TipiPckg != undefined && TipiPckg != "") {
				var filter = new sap.ui.model.Filter("ID_TIPOPACKAGEDS", sap.ui.model.FilterOperator.EQ, TipiPckg);
				oFilters.push(filter);
			}
			/*if (vpi != undefined && vpi != "") {
				var aFilters = [];
				var filter = new sap.ui.model.Filter("SN_MODBASIPOSTINVIO", sap.ui.model.FilterOperator.Contains, vpi);
				aFilters.push(filter);
				var filter = new sap.ui.model.Filter("SN_MODIMPORTOPOSTINVIO", sap.ui.model.FilterOperator.Contains, vpi);
				aFilters.push(filter);
				var filter = new sap.ui.model.Filter("SN_MODSCHEDAPOSTINVIO", sap.ui.model.FilterOperator.Contains, vpi);
				aFilters.push(filter);
				var filter = new sap.ui.model.Filter("SN_MODPISTAPOSTINVIO", sap.ui.model.FilterOperator.Contains, vpi);
				aFilters.push(filter);
				ofilter5 = new sap.ui.model.Filter({
					filters: aFilters,
					and: false
				});
				oFilters.push(ofilter5);
				console.log(oFilters);
			}*/
			if (respdir != undefined && respdir != "") {
				var filter1 = new sap.ui.model.Filter({
					path: 'COGNOME_MGR',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: respdir,
					caseSensitive: false
				});
				var filter2 = new sap.ui.model.Filter({
					path: 'NOME_MGR',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: respdir,
					caseSensitive: false
				});
				var filter3 = new sap.ui.model.Filter({
					path: 'PERS_MGR_COGNOME',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: respdir,
					caseSensitive: false
				});
				var filter4 = new sap.ui.model.Filter({
					path: 'PERS_MGR_NOME',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: respdir,
					caseSensitive: false
				});
				var aFilters = [];
				aFilters.push(filter1, filter2, filter3, filter4);
				var ofilter5 = new sap.ui.model.Filter({
					filters: aFilters,
					and: false
				});
				oFilters.push(ofilter5);

			}
			/*if (resphr != undefined && resphr != "") {
				var filter = new sap.ui.model.Filter("COGNOME_HR", sap.ui.model.FilterOperator.Contains, resphr);
				oFilters.push(filter);
			}*/
			if (gruppo != undefined && gruppo != "") {
				var filter = new sap.ui.model.Filter("ID_GRUPPOSCHEDA", sap.ui.model.FilterOperator.EQ, gruppo);
				oFilters.push(filter);
			}
			this.oFilters = oFilters;

			if (f === 0)
				this.dataCounter(oFilters);

			//}
		},
		/************************dataCounter function is used to access counter.xsjs and get the total Matricola count and the total package count********************************/
		dataCounter: function (oFilters) {
			var cond = [],
				cond2 = [],
				thiss = this;

			//thiss.getSchedaPersonaleData(oFilters);
			//var filter = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, selectedfiscalYearPeriodi);

			//oFilters.push(filter);

			if (oFilters.length > 0) {
				for (var i = 0; i < oFilters.length; i++) {
					if (oFilters[i].sPath === undefined) {
						for (var ii = 0; ii < oFilters[i].aFilters.length; ii++) {
							if (oFilters[i].aFilters[ii].sOperator === "BT") {
								cond.push({
									sPath: oFilters[i].aFilters[ii].sPath,
									operator: oFilters[i].aFilters[ii].sOperator,
									value1: oFilters[i].aFilters[ii].oValue1,
									value2: oFilters[i].aFilters[ii].oValue2
								});
								if (oFilters[i].aFilters[ii].sPath.includes("NOME_MGR")) {
									var ssPath = oFilters[i].aFilters[ii].sPath
									if (oFilters[i].aFilters[ii].sPath === "SID")
										ssPath = "SUPERID";
									cond2.push({
										sPath: ssPath,
										operator: oFilters[i].aFilters[ii].sOperator,
										value1: oFilters[i].aFilters[ii].oValue1,
										value2: oFilters[i].aFilters[ii].oValue2
									});
								}
							} else {
								cond.push({
									sPath: oFilters[i].aFilters[ii].sPath,
									operator: oFilters[i].aFilters[ii].sOperator,
									value: oFilters[i].aFilters[ii].oValue1
								});
								if (oFilters[i].aFilters[ii].sPath.includes("NOME_MGR")) {
									var ssPath = oFilters[i].aFilters[ii].sPath
									if (oFilters[i].aFilters[ii].sPath === "SID")
										ssPath = "SUPERID";
									cond2.push({
										sPath: ssPath,
										operator: oFilters[i].aFilters[ii].sOperator,
										value: oFilters[i].aFilters[ii].oValue1
									});
								}
							}
						}

					} else {

						if (oFilters[i].sOperator === "BT") {
							cond.push({
								sPath: oFilters[i].sPath,
								operator: oFilters[i].sOperator,
								value1: oFilters[i].oValue1,
								value2: oFilters[i].oValue2
							});
							if (oFilters[i].sPath === "SID" || oFilters[i].sPath === "MATRICOLA" || oFilters[i].sPath === "COGNOME" || oFilters[i].sPath ===
								"NOME" || oFilters[i].sPath === "STATUS_DIPENDENTE" || oFilters[i].sPath === "QUALIFICA" || oFilters[i].sPath ===
								"SOCIETA" || oFilters[i].sPath === "BAND") {
								var ssPath = oFilters[i].sPath
								if (oFilters[i].sPath === "SID")
									ssPath = "SUPERID";
								cond2.push({
									sPath: ssPath,
									operator: oFilters[i].sOperator,
									value1: oFilters[i].oValue1,
									value2: oFilters[i].oValue2
								});
							}

						} else {
							cond.push({
								sPath: oFilters[i].sPath,
								operator: oFilters[i].sOperator,
								value: oFilters[i].oValue1
							});
							if (oFilters[i].sPath === "SID" || oFilters[i].sPath === "MATRICOLA" || oFilters[i].sPath === "COGNOME" || oFilters[i].sPath ===
								"NOME" || oFilters[i].sPath === "STATUS_DIPENDENTE" || oFilters[i].sPath === "QUALIFICA" || oFilters[i].sPath ===
								"SOCIETA" || oFilters[i].sPath === "BAND") {
								var ssPath = oFilters[i].sPath
								if (oFilters[i].sPath === "SID")
									ssPath = "SUPERID";
								cond2.push({
									sPath: ssPath,
									operator: oFilters[i].sOperator,
									value: oFilters[i].oValue1
								});
							}

						}
					}
				}
			}
			for (var i = 0; i < cond.length; i++) {
				if (cond[i].sPath.includes("DATE") || cond[i].sPath.includes("VALE") || cond[i].sPath.includes("ASSEGNAZIONE")) {
					if (cond[i].operator === "BT") {
						cond[i].value1 = cond[i].value1.toISOString();
						cond[i].value2 = cond[i].value2.toISOString();
					} else

						cond[i].value = cond[i].value.toISOString();
				}
			}
			cond.push({
				sPath: "ID_PERIODO",
				operator: "EQ",
				value: selectedfiscalYearPeriodi
			});
			if (cond.length === 1 && cond2.length === 0) {

				var obj = [{
					field: ['MATRICOLA', 'ID_PACKAGEDS'],
					table: 'V_SchedaPersonale_group',
					condition: cond
				}, {
					field: ['MATRICOLA'],
					table: 'V_USER',
					condition: cond2
				}];
			} else if (cond.length > 1 && cond2.length === 0) {
				var obj = [{
					field: ['MATRICOLA', 'ID_PACKAGEDS'],
					table: 'V_SchedaPersonale_group',
					condition: cond
				}];
			} else
				var obj = [{
					field: ['MATRICOLA', 'ID_PACKAGEDS'],
					table: 'V_SchedaPersonale_group',
					condition: cond
				}, {
					field: ['MATRICOLA'],
					table: 'V_USER',
					condition: cond2
				}];
			console.log(obj);
			$.ajax({
				url: "/HANAMDC/STIP/STIPAdmin/services/counter.xsjs",
				//url: "/HANAMDC/STIP/STIPAdmin/services/test.xsjs",

				type: "POST",
				method: "GET",
				contentType: 'application/json',
				data: {
					odata: JSON.stringify(obj)
				},
				dataType: 'text',
				success: function (data, textStatus1) {

					thiss.getSchedaPersonaleData(oFilters);
					data = JSON.parse(data);
					console.log(data);
					if (data.result === "Error") {
						totalmatCount = 0;
						totalpckgCount = 0;
					} else {
						totalmatCount = data[1].MATRICOLA;
						totalpckgCount = data[0].ID_PACKAGEDS;
					}

				},
				error: function (data, textStatus1) {

					console.log(data);
					totalmatCount = 0;
					totalpckgCount = 0;
					thiss.getSchedaPersonaleData(oFilters);
				}
			});

		},
		/************************editing function is used to make the field(template_manual) editable if it is selected********************************/
		editing: function (oEvent) {

			var edit = sap.ui.getCore().byId("edit").getSelected();
			if (edit === true)
				sap.ui.getCore().byId("template_man").setEditable(true);
			else {
				sap.ui.getCore().byId("template_man").setEditable(false);
				sap.ui.getCore().byId("template_man").setSelectedKey("");
			}
		},
		/************************displayCurve function is used to navigate the user to the respective displayCurva pages
		based on the tipo(Lineare or Discreta)********************************/
		displayCurve: function (id, desc, tipo) {

			var basicmodel = new JSONModel;
			sap.ui.getCore().setModel(basicmodel, "BasicAppModel");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", id);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveDesc", desc);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/matricola", change_id_arr);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/FISCAL_YEAR", selectedfiscalYearPeriodi);
			var e = sap.ui.core.UIComponent.getRouterFor(this);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "SchedaPersonale"); //This is used to restore the changes on returning back
			if (tipo === 1)
			//var url = "https://stipadmin-bfmyao56da.dispatcher.hana.ondemand.com/index.html#/displayCurvaLineare";
				var url = "displayCurvaLineare";
			else if (tipo === 2)
			//var url = "https://stipadmin-bfmyao56da.dispatcher.hana.ondemand.com/index.html#/displayCurvaDiscreta"
				var url = "displayCurvaDiscreta";
			//sap.m.URLHelper.redirect(url, true);
			//window.open(url,_blank);
			this.schedaFilterFragmentClose();
			this.onCloseDialog();
			e.navTo(url);
		},
		/************************onShowStatus function is used to fetch the data from the V_PACKAGEDS_HISTORICAL based on the packages********************************/
		onShowStatus: function (pers) {

			var oFilters = [];
			var that = this;
			if (pers != undefined && pers != "") {
				var filter1 = new sap.ui.model.Filter("ID_PACKAGEDS", sap.ui.model.FilterOperator.EQ, pers);
				oFilters.push(filter1);
			}
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			xsoDataModel.read("/V_PACKAGEDS_HISTORICAL?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {

					var data = oDataIn.results;
					console.log(data);
					for (var i = 0; i < data.length; i++) {
						if (data[i].ID_STATOINVIO === 7)
							data[i].ID_PROTOCOLLO = "";
						var sdate = data[i].INIZIO_ASSEGNAZIONE,
							edate = data[i].FINE_ASSEGNAZIONE;
						//	Datadeldocumento = data[0].DATETIME_CR;
						if (sdate !== null && sdate !== undefined && sdate !== "" && edate !== null && edate !== undefined && edate !== "") {
							if (typeof (sdate) === "string" && sdate.includes("Date")) {
								sdate = new Date(parseInt(sdate.substring(6, sdate.length - 2), 10));
								edate = new Date(parseInt(edate.substring(6, edate.length - 2), 10));
								//	Datadeldocumento = new Date(parseInt(Datadeldocumento.substring(6, Datadeldocumento.length - 2), 10));
							}
							sdate = Formatter.months(sdate.getMonth() + 1) + " " + sdate.getFullYear(); //months function of Formatter used
							edate = Formatter.months(edate.getMonth() + 1) + " " + edate.getFullYear(); //months function of Formatter used
							//	Datadeldocumento = Formatter.months(Datadeldocumento.getMonth() + 1) + " " + Datadeldocumento.getFullYear();

						} else {
							sdate = "";
							edate = "";
							//	Datadeldocumento="";
						}
						data[i].INIZIO_ASSEGNAZIONE = sdate;
						data[i].FINE_ASSEGNAZIONE = edate;
						//	data[0].DATETIME_CR = Datadeldocumento;
					}
					var tmpModel = new sap.ui.model.json.JSONModel();
					tmpModel.setData(data);
					that.getView().setModel(tmpModel, "tmpModel")
					that.oDialogFragment = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.storici", that.getView().getController());
					that.oDialogFragment.setModel("tmpModel");
					that.getView().addDependent(that.oDialogFragment);
					that.oDialogFragment.open();

				},
				error: function (oerror) {

					console.log(oerror);
				}
			});
			/*	var payload = {
					ID_PACKAGEDS: pers
				}
				$.ajax({
					url: "/HANAMDC/STIP/STIPAdmin/services/storici.xsjs",

					type: "POST",
					method: "GET",
					contentType: 'application/json',
					data: {
						odata: JSON.stringify(payload)
					},
					dataType: 'text',
					success: function (data, textStatus1) {
						
						console.log(data);
						data = JSON.parse(data);
						for (var i = 0; i < data.length; i++) {
							if (data[i].ID_STATOINVIO === 7)
								data[i].ID_PROTOCOLLO = "";

						}
						var tmpModel = new sap.ui.model.json.JSONModel();
						tmpModel.setData(data);
						that.getView().setModel(tmpModel, "tmpModel")
						that.oDialogFragment = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.storici", that.getView().getController());
						that.oDialogFragment.setModel("tmpModel");
						that.getView().addDependent(that.oDialogFragment);
						that.oDialogFragment.open();
					},
					error: function (data, textStatus1) {
						
						console.log(data);
					}
				});*/
		},
		// End changes G.Guttuso 20200828
		/************************onPressView function is used to open the OrgDialog to view the organizations********************************/
		/*onPressView: function (oEvent) {
			var data1 = {
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
			this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.OrgDialog", this);
			this.getView().addDependent(this._oValueHelpDialog);
			this.jModel1 = new JSONModel();
			this.jModel1.setData(data1);
			this.getView().setModel(this.jModel1);
			this._oValueHelpDialog.open();
		},*/
		/************************onTreeSelect function is used to set the value of the department in empDipartimento and then close the dialog box ********************************/
		onTreeSelect: function (oEvent) {
			this.getView().byId("empDipartimento").setValue(oEvent.getSource().getTitle());
			this._oValueHelpDialog.destroy();
		},
		/********************onColumnHide function opens a dialog box for user to select which columns to be visible*******************************************/
		onColumnHide: function (oEvent) {
			this._oTPC.openDialog();
		},
		/************************selectSingle function is used to select a particular row of the table********************************/
		selectSingle: function (oEvent, id) {

			if (oEvent.mParameters.selected === true) {
				//this.change_id = id;
				change_id_arr.push(id);
			} else {
				//this.change_id = null;
				if (change_id_arr.length === 1)
					change_id_arr.pop();
				else {
					for (var i = 0; i < change_id_arr.length; i++) {
						if (change_id_arr[i] === id)
							change_id_arr.splice(i, 1);
					}
				}
			}
			console.log(change_id_arr);
		},
		/************************matricoleFn function is used to access the Matricola functionalities
		(scheda, letter_asseg/letter_consun, gestione, inattivo)********************************/
		matricoleFn: function (oEvent) {

			var selectedItem = oEvent.getSource().getSelectedItem();
			var key = selectedItem.mProperties.key;
			var data = oMainModel.getData()[1].Main;
			/*var ch1 = this.getView().byId("ch1").getSelected();
			var ch14 = this.getView().byId("ch14").getSelected();
			var chmain = this.getView().byId("chmain").getSelected();*/
			/*	if (key === "sel") {
					change_id_arr = []
					this.byId("chmain").setSelected(true);
					for (var i = 0; i < data.length; i++) {
						data[i].Check_CHECKBOX = true;
						oMainModel.refresh();
						change_id_arr.push(data[i].MATRICOLA);
					}
				} else if (key == "desel") {
					this.byId("chmain").setSelected(false);
					for (var i = 0; i < data.length; i++) {
						data[i].Check_CHECKBOX = false;
						oMainModel.refresh();
					}
					change_id_arr = [];
				} else*/
			console.log(change_id_arr);
			var f = 0;
			for (var i = 0; i < data.length; i++) {
				if (data[i].Check_CHECKBOX === true)
					f = 1;
			}
			if (key === "scheda") {

				if (f === 0) {
					this.byId("matricole").setSelectedKey("");
					MessageBox.error("Nessun utente selezionato per assegnare la scheda");
					//Error message 'No users selected to assign the tab'
				} else if (f === 1 && change_id_arr.length === 1) {
					this.scheda_master_frag();
				} else if (f === 1 && change_id_arr.length > 1) {
					this.multiple_scheda_master_frag();
				}
			} else if (key === "letter_asseg" || (key === "letter_consun")) {
				if (f === 0) {
					this.byId("matricole").setSelectedKey("");
					MessageBox.error("Nessun utente selezionato per assegnare la lettera"); //Error message 'No users selected to assign the tab'
				} else if (f === 1 && change_id_arr.length >= 1)
					this.scheda_master_letter(key);

			}
			/*else if (key === "consuntivazione") {
				if (f === 0) {
					this.byId("matricole").setSelectedKey("");
					MessageBox.error("Nessun utente selezionato per assegnare la lettera di consuntivazione");
				} else if (f === 1 && change_id_arr.length >= 1) {
					this.consuntivazione();
				}
			}*/
			else if (key === "gestione") {
				if (f === 0) {
					this.byId("matricole").setSelectedKey("");
					MessageBox.error("Nessun utenti selezionato per assegnare una scheda");
				} else if (f === 1 && change_id_arr.length >= 1) {
					this.gestione();
				}
			} else if (key === "inattivo") {
				if (f === 0) {
					this.byId("matricole").setSelectedKey("");
					MessageBox.error("Nessun utente selezionato per assegnare lo stato inattivo");
				} else if (f === 1 && change_id_arr.length >= 1) {
					this.inattivo();
				}
			}
		},
		/************************singleScheda function is used to change the details of the particular Scheda_Personale********************************/
		singleScheda: function (oEvent, matr, id, tp, pers, NOTE) {

			change_pck_arr.push(pers);
			var gest = /^[0-9]{1,2}[%]$/;
			if (id.match(gest))
				this.gestione(pers, tp, NOTE);
			else {
				for (var i = 0; i < oMainModel.getData()[1].Main.length; i++) {
					if (oMainModel.getData()[1].Main[i].ID_PACKAGEDS === pers) {
						matr = oMainModel.getData()[1].Main[i].MATRICOLA_JR;
						break;
					}
				}
				var fail = 0;
				var that = this;
				change_id_arr = [];
				change_id_arr.push(matr);
				if (tp === null || tp === undefined) {
					this.payout = oMainModel.getData()[1].Main[i].PERC_GESTIONALE;
					this.gestione(pers, this.payout, oMainModel.getData()[1].Main[i].NOTE_GESTIONALE);
				} else {
					this.ID_SCHEDAMASTER = id;
					this.payout = tp;
					this.scheda_master_frag("change", this.ID_SCHEDAMASTER, this.payout);
				}
			}
		},
		/************************onCloseDialog function is used to close the dialog box********************************/
		onCloseDialog: function () {
			if (this.oDialogFragment) {
				this.oDialogFragment.destroy();
			}
			var data = oMainModel.getData();
			data.pop();
			this.byId("matricole").setSelectedKey("");
			oMainModel.setData(data);
			change_id_arr = [];
			change_pck_arr = [];
			this.byId("package").setSelectedKey("pck1");
			data = oMainModel.getData()[1].Main;
			for (var i = 0; i < data.length; i++) {
				data[i].Check_CHECKBOX = false;
				data[i].Check_Pck_CHECKBOX = false
			}
			console.log(this.assign);
			BusyIndicator.show();

			this.onSearch(1);

			BusyIndicator.hide();
		},
		/************************inattivo function is used to access the scheda_master fragment 
		based on ID_SCHEDAPERSONALE, Matricola , sdate and edate ********************************/
		inattivo: function () {
			this.oDialogFragment = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.scheda_master", this.getView().getController());
			this.getView().addDependent(this.oDialogFragment);
			var data1 = [],
				sdt = [],
				edt = [],
				sch = [];
			var data = oMainModel.getData()[1].Main;
			for (var i = 0; i < data.length; i++) {
				if (data[i].Check_CHECKBOX === true)
					data[i].Check_CHECKBOX = false;
				for (var j = 0; j < change_id_arr.length; j++)
					if (data[i].MATRICOLA_JR === change_id_arr[j]) {
						data1.push(data[i]);
						if (data[i].ID_PACKAGEDS !== null && data[i].ID_PACKAGEDS !== "") {
							edt.push({
								Matricola: data[i].MATRICOLA_JR,
								sdate: data[i].INIZIO_ASSEGNAZIONE,
								edate: data[i].FINE_ASSEGNAZIONE
							});
						}
					}
			}
			var data11 = data1;
			data1 = [];
			var m = {};
			for (var i = 0; i < data11.length; i++) {
				var v = data11[i],
					vv = data11[i].MATRICOLA_JR;
				if (!m[vv]) {
					data1.push(v);
					m[vv] = true;
				}
			}
			console.log(data1);
			data = oMainModel.getData();
			data.push({
				New: data1,
				type: "inattivo",
				dates: edt,
				Length: {
					length: data1.length
				},
			});
			oMainModel.setData(data);
			console.log(oMainModel.getData());
			oMainModel.refresh();
			sap.ui.getCore().byId("scheda").setVisible(false);
			sap.ui.getCore().byId("dialog").setTitle("Anagraphica- Gestione Stato Inattivo");
			sap.ui.getCore().byId("ltr").setVisible(false);
			sap.ui.getCore().byId("Inattivo").setVisible(true);
			sap.ui.getCore().byId("template_man").setEditable(true);
			sap.ui.getCore().byId("btn").attachPress(this.confirmAssegna, this);
			this.oDialogFragment.open();
		},

		/************************consuntivazionefunction is used to access the scheda_master fragment 
		based on Matricola ********************************/
		consuntivazione: function () {

			this.oDialogFragment = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.scheda_master", this.getView().getController());
			this.getView().addDependent(this.oDialogFragment);
			var data = oMainModel.getData()[1].Main,
				data1 = [];
			for (var i = 0; i < data.length; i++) {
				if (data[i].Check_CHECKBOX === true)
					data[i].Check_CHECKBOX = false;
				if (data[i].MATRICOLA_JR === change_id_arr[0]) {
					//data[i].ID_SCHEDAPERSONALE = max_id + 1;
					data1.push(data[i]);
					break;
				}
			}
			console.log(data1);
			data = oMainModel.getData();
			data.push({
				New: data1
			});
			oMainModel.setData(data);
			oMainModel.refresh();
			sap.ui.getCore().byId("dialog").setContentWidth("500px");
			sap.ui.getCore().byId("dialog").setTitle("Inserimento Nuova Lettere di Consuntivazione");
			sap.ui.getCore().byId("ltr").setWidth("100%");
			sap.ui.getCore().byId("auto").setVisible(false);
			sap.ui.getCore().byId("Consun").setVisible(true);
			sap.ui.getCore().byId("Consun2").setVisible(true);
			sap.ui.getCore().byId("man").setHeaderText("Template Lettera");
			sap.ui.getCore().byId("ltr").setVisible(true);
			sap.ui.getCore().byId("scheda").setVisible(false);
			sap.ui.getCore().byId("Inattivo").setVisible(false);
			sap.ui.getCore().byId("template_man").setEditable(true);
			sap.ui.getCore().byId("btn").attachPress(this.assign_scheda, this);
			if (change_pck_arr.length > 0)
				sap.ui.getCore().byId("dialog").setTitle("Modifica Lettere di Consuntivazione");
			this.oDialogFragment.open();
		},
		/************************gestione function is used to access the scheda_master fragment 
		based on ID_SCHEDAPERSONALE, Matricola and the dialog box opens based on the pers parameter********************************/
		gestione: function (pers, pay, note) {

			this.oDialogFragment = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.scheda_master", this.getView().getController());
			this.getView().addDependent(this.oDialogFragment);
			var data = oMainModel.getData()[1].Main,
				data1 = [],
				sdt = [],
				edt = [],
				type;

			if (pers !== null && pers !== undefined) { //If pers is not null or undefined then dialog box with title 'Modifica Lettere di Gestionale(Insertion of the management sheet)' opens
				//change_pck_arr.push(pers);
				type = "Gestione_change"
				sap.ui.getCore().byId("dialog").setTitle("Modifica Lettere di Gestionale");
				sap.ui.getCore().byId("gestTxt").setValue(note);
				sap.ui.getCore().byId("tpi").setValue(pay);
				for (var i = 0; i < data.length; i++) {
					if (data[i].ID_PACKAGEDS === change_pck_arr[0]) {
						change_id_arr.push(data[i].MATRICOLA_JR);
						sap.ui.getCore().byId("MeIn").setSelectedKey(Formatter.monthsRev(data[i].INIZIO_ASSEGNAZIONE.split(" ")[0]));
						sap.ui.getCore().byId("MeFin").setSelectedKey(Formatter.monthsRev(data[i].FINE_ASSEGNAZIONE.split(" ")[0]));
						sap.ui.getCore().byId("template_man").setSelectedKey(data[i].ID_LETTERE_MANUALE);

					}
				}
			} else { ////If pers is not null or undefined then dialog box with title 'Inserimento scheda gestionale(Edit Management Letters)opens'
				sap.ui.getCore().byId("dialog").setTitle("Inserimento scheda gestionale");
				type = "Gestione";
				sap.ui.getCore().byId("tpi").setValue("100");
				var start = (new Date(Periodi_start_date_main)).getMonth() + 1;
				var end = (new Date(Periodi_end_date_main)).getMonth() + 1;
				sap.ui.getCore().byId("MeIn").setSelectedKey(start);
				sap.ui.getCore().byId("MeFin").setSelectedKey(end);
			}
			for (var i = 0; i < data.length; i++) {
				for (var j = 0; j < change_id_arr.length; j++) {
					if (data[i].MATRICOLA_JR === change_id_arr[j]) {
						//data[i].ID_SCHEDAPERSONALE = max_id + 1;
						data1.push(data[i]);
						if (data[i].ID_PACKAGEDS !== null && data[i].ID_PACKAGEDS !== "" && data[i].ID_PACKAGEDS !== change_pck_arr[0]) {
							edt.push(data[i].FINE_ASSEGNAZIONE);
							sdt.push(data[i].INIZIO_ASSEGNAZIONE);

						}
					}
				}
			}
			var m = {},
				d = change_id_arr;
			change_id_arr = [];
			for (var i = 0; i < d.length; i++) {
				var v = d[i];
				if (!m[v]) {
					m[v] = true;
					change_id_arr.push(v);
				}
			}
			if (change_id_arr.length > 1) {
				sap.ui.getCore().byId("matricoletab").setVisible(false);
				sap.ui.getCore().byId("dirtab").setVisible(false);
			} else {
				sap.ui.getCore().byId("matricoletab").setVisible(true);
				sap.ui.getCore().byId("dirtab").setVisible(true);
				sap.ui.getCore().byId("managerId").setSelectedKey(data1[0].MATRICOLA_MGR);
			}

			console.log(data1);
			data = oMainModel.getData();
			data.push({
				New: data1,
				sdate: sdt,
				edate: edt,
				type: type
			});
			oMainModel.setData(data);
			oMainModel.refresh();
			sap.ui.getCore().byId("dialog").setContentWidth("1200px");
			sap.ui.getCore().byId("ltr").setWidth("40%");
			sap.ui.getCore().byId("auto").setVisible(false);
			sap.ui.getCore().byId("gestNote").setVisible(true);
			sap.ui.getCore().byId("ruoloTable").setVisible(false);
			sap.ui.getCore().byId("tp").setText("Percentuale Scheda Gestionale")
			sap.ui.getCore().byId("tpi").setEditable(true);
			sap.ui.getCore().byId("tpi").setWidth("30%");
			sap.ui.getCore().byId("Consun").setVisible(false);
			sap.ui.getCore().byId("Consun2").setVisible(false);
			sap.ui.getCore().byId("man").setHeaderText("Template Lettera");
			sap.ui.getCore().byId("ltr").setVisible(true);
			sap.ui.getCore().byId("scheda").setVisible(true);
			sap.ui.getCore().byId("schedatab").setVisible(false);
			sap.ui.getCore().byId("Inattivo").setVisible(false);
			//sap.ui.getCore().byId("btn1").setVisible(true);
			sap.ui.getCore().byId("template_man").setEditable(true);
			sap.ui.getCore().byId("btn").attachPress(this.assign_scheda, this);
			this.oDialogFragment.open();
		},
		/************************scheda_master_letter function is used to access the scheda_master fragment
		and the dialog box is opened based on letter_asseg or letter_consun********************************/
		scheda_master_letter: function (key) {
			this.oDialogFragment = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.scheda_master", this.getView().getController());
			this.getView().addDependent(this.oDialogFragment);
			var tmpltr = this.allLetters;
			var ltr = [];
			if (key.includes("letter_asseg")) {
				sap.ui.getCore().byId("dialog").setTitle("Inserimento Nuova Lettere di Assegnazione"); //Insert New Assignment Letters
				sap.ui.getCore().byId("Consun").setVisible(false);
				sap.ui.getCore().byId("Consun2").setVisible(false);
				for (var i = 0; i < tmpltr.length; i++)
					if (tmpltr[i].ID_TIPOTEMPLATE === 1)
						ltr.push(tmpltr[i]);
			} else if (key.includes("letter_consun")) {
				sap.ui.getCore().byId("dialog").setTitle("Inserimento Nuova Lettere di Consuntivazione"); //Insertion New Letters of Finalization
				sap.ui.getCore().byId("Consun").setVisible(true);
				sap.ui.getCore().byId("Consun2").setVisible(true);
				for (var i = 0; i < tmpltr.length; i++)
					if (tmpltr[i].ID_TIPOTEMPLATE === 2)
						ltr.push(tmpltr[i]);
			}

			oMainModel.getData()[0].Filter[16].LETTERE_MANUALE = ltr;

			var data = oMainModel.getData()[1].Main,
				data1 = [];
			for (var i = 0; i < data.length; i++) {
				if (data[i].Check_CHECKBOX === true)
					data[i].Check_CHECKBOX = false;
				for (var ii = 0; ii < change_id_arr.length; ii++) {
					if (data[i].MATRICOLA === change_id_arr[ii]) {
						//data[i].ID_SCHEDAPERSONALE = max_id + 1;
						data1.push(data[i]);
						//break;
					}
				}
			}
			data = oMainModel.getData();
			data.push({
				New: data1,
				sdate: [],
				edate: [],
				type: key
			});
			if (change_pck_arr.length !== 0)
				sap.ui.getCore().byId("delPckg").setVisible(false);
			else
				sap.ui.getCore().byId("delPckg").setVisible(true);
			console.log(data1);

			if (key.includes("change") && change_pck_arr.length === 1) {
				var dataa = oMainModel.getData()[1].Main;
				for (var ii = 0; ii < change_pck_arr.length; ii++) {
					for (var i = 0; i < dataa.length; i++) {
						if (dataa[i].ID_PACKAGEDS === change_pck_arr[ii])
							sap.ui.getCore().byId("template_man").setSelectedKey(dataa[i].ID_LETTERE_MANUALE);
					}
				}
			}
			oMainModel.setData(data);
			oMainModel.refresh();
			sap.ui.getCore().byId("dialog").setContentWidth("500px");

			sap.ui.getCore().byId("ltr").setWidth("100%");
			sap.ui.getCore().byId("auto").setVisible(false);

			sap.ui.getCore().byId("edit").setVisible(false);
			sap.ui.getCore().byId("template_man").setEnabled(true);

			//sap.ui.getCore().byId("template_consun").setVisible(false);
			sap.ui.getCore().byId("gestNote").setVisible(false);
			sap.ui.getCore().byId("ruoloTable").setVisible(true);
			sap.ui.getCore().byId("tp").setText("Tetto Payout");
			sap.ui.getCore().byId("man").setHeaderText("Template Lettera");
			sap.ui.getCore().byId("ltr").setVisible(true);
			sap.ui.getCore().byId("scheda").setVisible(false);
			sap.ui.getCore().byId("Inattivo").setVisible(false);
			sap.ui.getCore().byId("btn").attachPress(this.assign_scheda, this);
			this.oDialogFragment.open();
		},
		/************************scheda_master_frag function is used to access the scheda_master fragment 
		based on ID_SCHEDAPERSONALE, Matricola , sdate and edate ********************************/
		scheda_master_frag: function (err, aa, bb) {

			BusyIndicator.show();
			this.oDialogFragment = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.scheda_master", this.getView().getController());
			this.getView().addDependent(this.oDialogFragment);
			var data1 = [];
			var data = oMainModel.getData()[1].Main,
				sch = 0,
				sdt = [],
				edt = [],
				mgr;
			for (var i = 0; i < data.length; i++) {
				if (data[i].Check_CHECKBOX === true)
					data[i].Check_CHECKBOX = false;
				if (data[i].MATRICOLA_JR === change_id_arr[0]) {
					if (data[i].User === "New") {
						data1.push(data[i]);
						mgr = data[i].MATRICOLA_MGR;
					} else {
						//sap.ui.getCore().byId("managerId").setSelectedKey(data[i].MATRICOLA_MGR);
						data1.push(data[i]);
						if (data[i].ID_PACKAGEDS !== null && data[i].ID_PACKAGEDS !== "") {
							edt.push(data[i].FINE_ASSEGNAZIONE);
							sdt.push(data[i].INIZIO_ASSEGNAZIONE);
							mgr = data[i].MATRICOLA_MGR;
						}
						//break;
					}
				}
			}
			//change_id_arr = [];
			sap.ui.getCore().byId("managerId").setSelectedKey(mgr);
			sap.ui.getCore().byId("roless").setValue(data1[0].RUOLO_PROF);
			sap.ui.getCore().byId("dialog").setContentWidth("1200px");
			sap.ui.getCore().byId("ltr").setWidth("40%");
			sap.ui.getCore().byId("dialog").setTitle("Inserimento Nuova Scheda");
			sap.ui.getCore().byId("ltr").setVisible(true);
			sap.ui.getCore().byId("Consun").setVisible(false);
			sap.ui.getCore().byId("Consun2").setVisible(false);
			sap.ui.getCore().byId("gestNote").setVisible(false);
			sap.ui.getCore().byId("ruoloTable").setVisible(true);
			sap.ui.getCore().byId("tp").setText("Tetto Payout");
			sap.ui.getCore().byId("auto").setVisible(true);
			sap.ui.getCore().byId("man").setHeaderText("");
			sap.ui.getCore().byId("scheda").setVisible(true);
			sap.ui.getCore().byId("template_man").setEditable(true);
			sap.ui.getCore().byId("tpi").setValue("");
			//sap.ui.getCore().byId("rh").setSelectedKey(data[i].MATRICOLA_HR);
			var start = (new Date(Periodi_start_date_main)).getMonth() + 1;
			var end = (new Date(Periodi_end_date_main)).getMonth() + 1;
			sap.ui.getCore().byId("MeIn").setSelectedKey(start);
			sap.ui.getCore().byId("MeFin").setSelectedKey(end);
			//this.byId("matricole").setSelectedKey("");
			data = oMainModel.getData();
			//data1[0].ID_SCHEDAPERSONALE = max_id;
			data.push({
				New: data1,
				sdate: sdt,
				edate: edt,
				type: "Scheda"
			});
			oMainModel.setData(data);
			oMainModel.refresh();
			console.log(oMainModel.getData());
			sap.ui.getCore().byId("matricoletab").setVisible(true);
			sap.ui.getCore().byId("Consun").setVisible(false);
			sap.ui.getCore().byId("ruoloTable").setVisible(true);
			sap.ui.getCore().byId("dirtab").setVisible(true);
			sap.ui.getCore().byId("schedatab").setVisible(true);
			sap.ui.getCore().byId("b1").setEnabled(true);
			//sap.ui.getCore().byId("hrtab").setVisible(true);
			sap.ui.getCore().byId("Inattivo").setVisible(false);
			sap.ui.getCore().byId("err").setText("");
			sap.ui.getCore().byId("btn").attachPress(this.assign_scheda, this);
			/*if (err === "no") {
				//Ruolo, resp. Diretto, Mese inizio, mese fine. 
				sap.ui.getCore().byId("err").setText(
					"Il package associate a questa scheda è già Inviato al manager. Non sono consentite Modifiche nella sezioni scheda master, flusso e lettera. Ad ogni salvataggio il package verrà evidenziato come post invio"
				);
				sap.ui.getCore().byId("schedainfo").setEnabled(false);
				sap.ui.getCore().byId("delPckg").setEnabled(false);
				sap.ui.getCore().byId("edit").setEnabled(false);
				sap.ui.getCore().byId("template_man").setEnabled(true);
				sap.ui.getCore().byId("b1").setEnabled(false);
			} else*/
			if (err === "scegli") {
				sap.ui.getCore().byId("dialog").setContentWidth("400px");
				sap.ui.getCore().byId("dialog").setContentHeight("200px");
				sap.ui.getCore().byId("ltr").setWidth("100%");
				sap.ui.getCore().byId("dialog").setTitle("Tipi Flussi");
				sap.ui.getCore().byId("ltr").setVisible(true);
				sap.ui.getCore().byId("Consun").setVisible(false);
				sap.ui.getCore().byId("edit").setVisible(false);
				sap.ui.getCore().byId("auto").setVisible(false);
				sap.ui.getCore().byId("Inattivo").setVisible(false);
				sap.ui.getCore().byId("man").setVisible(false);
				sap.ui.getCore().byId("scheda").setVisible(false);
				sap.ui.getCore().byId("template_man").setEditable(true);
				oMainModel.getData()[3].type = "scegli";
			} else if (err === "change") {

				sap.ui.getCore().byId("schedainfo").setValue(aa);

				sap.ui.getCore().byId("tpi").setValue(bb);
				sap.ui.getCore().byId("btn1").setVisible(true);
				sap.ui.getCore().byId("dialog").setTitle("Modifica Scheda");
				oMainModel.getData()[3].type = "change_Scheda";
				var data1 = [],
					data2 = [];
				var data = oMainModel.getData()[1].Main,
					mgr, p;
				for (var i = 0; i < data.length; i++) {
					if (data[i].Check_CHECKBOX === true)
						data[i].Check_CHECKBOX = false;
					if (data[i].ID_PACKAGEDS === change_pck_arr[0]) {
						data2.push(data[i]);
						p = i;
						/*if (data[i].ID_PROTOCOLLO !== "" && data[i].ID_PROTOCOLLO !== 0 && data[i].ID_PROTOCOLLO !== null)
							oMainModel.getData()[3].type = "Invia_change";*/
						//data1.push(data[i]);
						for (var ii = 0; ii < sdt.length; ii++) {
							if (edt[ii] === data[i].FINE_ASSEGNAZIONE) {
								edt.splice(ii, 1);
								sdt.splice(ii, 1);
							}
						}
						start = data[i].INIZIO_ASSEGNAZIONE;
						end = data[i].FINE_ASSEGNAZIONE;
						mgr = data[i].MATRICOLA_MGR;
					}
				}
				data2[0].NOME = data[p].NOME_JR;
				data2[0].COGNOME = data[p].COGNOME_JR;
				data2[0].MATRICOLA = data[p].MATRICOLA_JR;
				data2[0].BB = data[p].BB_JR;
				data2[0].INIZIO_ASSEGNAZIONE = start;
				data2[0].FINE_ASSEGNAZIONE = end;
				sap.ui.getCore().byId("delPckg").setSelectedIndex(data2[0].FLOWSCELTO);
				sap.ui.getCore().byId("autoLtrFix").setValue(data2[0].LETTERE_DESCRIZIONE_AUTOMATICA);
				sap.ui.getCore().byId("template_man").setSelectedKey(data2[0].ID_LETTERE_MANUALE);
				sap.ui.getCore().byId("roless").setValue(data2[0].PERS_RUOLO);
				sap.ui.getCore().byId("managerId").setSelectedKey(data2[0].PERS_MGR);
				start = Formatter.monthsRev(start.split(" ")[0]); //monthsRev function of Formatter is used
				end = Formatter.monthsRev(end.split(" ")[0]); //monthsRev function of Formatter is used
				oMainModel.getData()[3].New = data2;
				oMainModel.getData()[3].sdate = sdt;
				oMainModel.getData()[3].edate = edt;
				sap.ui.getCore().byId("MeIn").setSelectedKey(start);
				sap.ui.getCore().byId("MeFin").setSelectedKey(end);
				sap.ui.getCore().byId("btn").setEnabled(true);
				sap.ui.getCore().byId("btn1").setEnabled(true);

				if (oMainModel.getData()[3].New[0].ID_STATOINVIO !== 7 && oMainModel.getData()[3].New[0].ID_STATOINVIO !== 12 && oMainModel.getData()[
						3].New[0].ID_STATOINVIO !== 15) {
					sap.ui.getCore().byId("err").setText(
						"Il package associate a questa scheda è già Inviato al manager. Non sono consentite Modifiche nella sezioni scheda master, flusso e lettera. Ad ogni salvataggio il package verrà evidenziato come post invio"
					);
					sap.ui.getCore().byId("err").setVisible(true);
					sap.ui.getCore().byId("btn").setEnabled(true);
					//	sap.ui.getCore().byId("btn1").setEnabled(true);
					sap.ui.getCore().byId("btn1").setEnabled(false);
					sap.ui.getCore().byId("b1").setEnabled(false);
					sap.ui.getCore().byId("delPckg").setEnabled(false);
					sap.ui.getCore().byId("edit").setEnabled(false);
					sap.ui.getCore().byId("letterChangeFrag2").setEnabled(false);
					sap.ui.getCore().byId("letterChangeFrag1").setEnabled(false);
					sap.ui.getCore().byId("template_man").setEnabled(false);
				} else {
					sap.ui.getCore().byId("err").setText("");
					sap.ui.getCore().byId("err").setVisible(false);
					sap.ui.getCore().byId("btn").setEnabled(true);
					sap.ui.getCore().byId("btn1").setEnabled(true);
					sap.ui.getCore().byId("b1").setEnabled(true);
					sap.ui.getCore().byId("delPckg").setEnabled(true);
					sap.ui.getCore().byId("edit").setEnabled(true);
					sap.ui.getCore().byId("letterChangeFrag2").setEnabled(true);
					sap.ui.getCore().byId("letterChangeFrag1").setEnabled(true);
					sap.ui.getCore().byId("template_man").setEnabled(true);
				}

				oMainModel.refresh();
				console.log(oMainModel.getData());
			} else if (err === "assegnaResp") {
				sap.ui.getCore().byId("ltr").setVisible(false);
				sap.ui.getCore().byId("Inattivo").setVisible(false);
				sap.ui.getCore().byId("btn1").setVisible(false);
				sap.ui.getCore().byId("scheda").setVisible(true);
				sap.ui.getCore().byId("scheda").setWidth("100%");
				sap.ui.getCore().byId("dialog").setContentHeight("200px");
				sap.ui.getCore().byId("dialog").setContentWidth("400px");
				sap.ui.getCore().byId("matricoletab").setVisible(false);
				sap.ui.getCore().byId("schedatab").setVisible(false);
				sap.ui.getCore().byId("tptab").setVisible(false);
				sap.ui.getCore().byId("ruoloTable").setVisible(false);
				sap.ui.getCore().byId("gestNote").setVisible(false);
				sap.ui.getCore().byId("dirtab").setVisible(true);
				sap.ui.getCore().byId("dialog").setTitle("Associa Responsabile Diretto")
				sap.ui.getCore().byId("DateTab").setVisible(false);
				oMainModel.getData()[3].type = "assegnaResp";
				oMainModel.getData()[3].sdate = [];
				oMainModel.getData()[3].edate = [];
				var data = oMainModel.getData()[1].Main;
				var data2 = [];
				if (change_pck_arr.length === 1) {
					for (var i = 0; i < data.length; i++) {
						if (data[i].ID_PACKAGEDS === change_pck_arr[0])
							data2.push(data[i]);
					}
					sap.ui.getCore().byId("managerId").setSelectedKey(data2[0].PERS_MGR);
					oMainModel.getData()[3].New = data2;
				}
				oMainModel.refresh();
			}
			BusyIndicator.hide();
			this.oDialogFragment.open();
		},
		/************************multiple_scheda_master_frag function is used to access the scheda_master fragment in 
		case of multiple users********************************/
		multiple_scheda_master_frag: function (oEvent) {

			this.oDialogFragment = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.scheda_master", this.getView().getController());
			this.getView().addDependent(this.oDialogFragment);
			var data1 = [],
				sdt = [],
				edt = [],
				sch = [];
			var data = oMainModel.getData()[1].Main;
			for (var i = 0; i < data.length; i++) {
				/*if (data[i].Check_CHECKBOX === true)
					data[i].Check_CHECKBOX = false;*/
				for (var j = 0; j < change_id_arr.length; j++)
					if (data[i].MATRICOLA_JR === change_id_arr[j]) {
						data1.push(data[i]);
						if (data[i].ID_PACKAGEDS !== null && data[i].ID_PACKAGEDS !== "") {
							edt.push({
								Matricola: data[i].MATRICOLA_JR,
								sdate: data[i].INIZIO_ASSEGNAZIONE,
								edate: data[i].FINE_ASSEGNAZIONE
							});
							sch.push({
								Matricola: data[i].MATRICOLA_JR,
								Scheda: data[i].DESCR_SCHEDA
							});
						}
					}
			}
			console.log(data1);
			var data11 = data1;
			data1 = [];
			var m = {};
			for (var i = 0; i < data11.length; i++) {
				var v = data11[i],
					vv = data11[i].MATRICOLA_JR;
				if (!m[vv]) {
					data1.push(v);
					m[vv] = true;
				}
			}
			//change_id_arr = [];
			//sap.ui.getCore().byId("managerId").setSelectedKey(data[i].MATRICOLA_MGR);
			//sap.ui.getCore().byId("rh").setSelectedKey(data[i].MATRICOLA_HR);
			var start = (new Date(Periodi_start_date_main)).getMonth() + 1;
			var end = (new Date(Periodi_end_date_main)).getMonth() + 1;
			sap.ui.getCore().byId("MeIn").setSelectedKey(start);
			sap.ui.getCore().byId("MeFin").setSelectedKey(end);
			//this.byId("matricole").setSelectedKey("");
			sap.ui.getCore().byId("tpi").setValue("");
			data = oMainModel.getData();
			data.push({
				New: data1,
				Length: {
					length: data1.length
				},
				dates: edt,
				scheda: sch,
				type: "Scheda_2"
			});
			oMainModel.setData(data);
			oMainModel.refresh();
			console.log(oMainModel.getData());
			sap.ui.getCore().byId("dialog").setContentWidth("1200px");
			sap.ui.getCore().byId("ltr").setWidth("40%");
			sap.ui.getCore().byId("dialog").setTitle("Inserimento Nuova Scheda");
			sap.ui.getCore().byId("ltr").setVisible(true);
			sap.ui.getCore().byId("Consun").setVisible(false);
			sap.ui.getCore().byId("gestNote").setVisible(false);
			sap.ui.getCore().byId("ruoloTable").setVisible(true);
			sap.ui.getCore().byId("schedatab").setVisible(true);
			sap.ui.getCore().byId("tp").setText("Tetto Payout");
			sap.ui.getCore().byId("Consun2").setVisible(false);
			sap.ui.getCore().byId("auto").setVisible(true);
			sap.ui.getCore().byId("scheda").setVisible(true);
			sap.ui.getCore().byId("matricoletab").setVisible(false);
			sap.ui.getCore().byId("ruoloTable").setVisible(false);
			sap.ui.getCore().byId("dirtab").setVisible(false);
			//sap.ui.getCore().byId("hrtab").setVisible(false);
			sap.ui.getCore().byId("Inattivo").setVisible(false);
			sap.ui.getCore().byId("template_man").setEditable(true);
			sap.ui.getCore().byId("btn").attachPress(this.confirmAssegna, this);
			this.oDialogFragment.open();
		},
		/************************schedaFilterFragment function is used to access filter_schedamaster_personale fragment
		and based on the id, the tab and filters are getting visible********************************/
		schedaFilterFragment: function (oEvent, id) {
			BusyIndicator.show();
			this.oDialogFragment1 = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.filter_schedamaster_personale", this.getView().getController());
			this.getView().addDependent(this.oDialogFragment1);

			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			var oFilters = [],
				data;
			var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, selectedfiscalYearPeriodi);
			oFilters.push(filter1);
			xsoDataModel.read("/V_SchedaMaster_Personale?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {

					data = oDataIn.results;
					console.log(data);

					var data11 = data;
					var m = {};
					data = [];
					for (var i = 0; i < data11.length; i++) {
						var v = data11[i],
							vv = data11[i].ID_SCHEDAMASTER + " : " + data11[i].ID_PISTA;
						if (!m[vv]) {
							data.push(v);
							m[vv] = true;
						}
					}
					oMainModel.getData()[2].Fragment[1].Data = data;
					oMainModel.refresh();
					console.log(oMainModel.getData());
					BusyIndicator.hide();
				},
				error: function (error) {
					BusyIndicator.hide();
				}
			});
			if (id === 2) {
				sap.ui.getCore().byId("tab2").setVisible(true);
				sap.ui.getCore().byId("tblFilter1").setVisible(false);
				sap.ui.getCore().byId("tblFilter").setVisible(false);
				sap.ui.getCore().byId("tool2").setVisible(true);
				sap.ui.getCore().byId("tool1").setVisible(false);
				sap.ui.getCore().byId("tab1").setVisible(false);
			} else if (id === 1) {
				sap.ui.getCore().byId("tab1").setVisible(true);
				sap.ui.getCore().byId("tool1").setVisible(true);
				sap.ui.getCore().byId("tool2").setVisible(false);
				sap.ui.getCore().byId("tblFilter1").setVisible(false);
				sap.ui.getCore().byId("tblFilter").setVisible(false);
				sap.ui.getCore().byId("tab2").setVisible(false);
			}
			this.oDialogFragment1.open();
		},
		/************************RoleSelect function is used to set the description in the role********************************/
		RoleSelect: function (oEvent, desc) {

			if (this.oDialogFragment)
				sap.ui.getCore().byId("roless").setValue(desc);
			else
				this.byId("ruolo").setValue(desc);
			this.schedaFilterFragmentClose();
		},
		/************************RoleSearch function is used to fetch the filter values of Role and Grade********************************/
		RoleSearch: function () {
			var role = sap.ui.getCore().byId("role").getValue();
			var grade = sap.ui.getCore().byId("grade").getValue();
			var oFilters = [];
			if (role != undefined && role != "") {
				var filter1 = new sap.ui.model.Filter("RUOLO_PROF", sap.ui.model.FilterOperator.Contains, role);
				oFilters.push(filter1);
			}
			if (grade != undefined && grade != "") {
				var filter1 = new sap.ui.model.Filter("GRADE", sap.ui.model.FilterOperator.Contains, grade);
				oFilters.push(filter1);
			}
			var oTable = sap.ui.getCore().byId("tblFilter1");
			var aBinding = oTable.getBinding("items");
			aBinding.filter(new sap.ui.model.Filter({
				filters: oFilters,
				and: true // AND operator true will check all of the filter conditions get satisfied
			}));
			sap.ui.getCore().byId("tblFilter1").setVisible(true);
		},
		/************************RoleClear function is used to set the filter values of role and grade as blank********************************/
		RoleClear: function () {
			sap.ui.getCore().byId("role").setValue("");
			sap.ui.getCore().byId("grade").setValue("");
			sap.ui.getCore().byId("tblFilter1").setVisible(false);
		},
		/************************schedaFilterFragmentClose function is used to close the fragment********************************/
		schedaFilterFragmentClose: function () {
			this.oDialogFragment1.destroy();
		},
		/***********************FilterSchedaTableClear function is used to reset the filter values
		of idPistaF, noteF, descPistaF, descSchedaF, idSchedaF, gruppoF, congF as blank********************************/
		FilterSchedaTableClear: function () {
			sap.ui.getCore().byId("idPistaF").setValue("");
			sap.ui.getCore().byId("descPistaF").setValue("");
			sap.ui.getCore().byId("descSchedaF").setValue("");
			sap.ui.getCore().byId("idSchedaF").setValue("");
			sap.ui.getCore().byId("gruppoF").setSelectedKey("");
			sap.ui.getCore().byId("congF").setSelectedKey("");
			sap.ui.getCore().byId("noteF").setSelectedKey("");
			sap.ui.getCore().byId("tblFilter").setVisible(false);
		},
		/************************FilterSchedaTableSearch function is used to fetch the filter values
		of idPistaF, noteF, descPistaF, descSchedaF, idSchedaF, gruppoF, congF********************************/
		FilterSchedaTableSearch: function () {

			var pistaid = sap.ui.getCore().byId("idPistaF").getValue();
			var note = sap.ui.getCore().byId("noteF").getValue();
			var descpista = sap.ui.getCore().byId("descPistaF").getValue();
			var descSchedaF = sap.ui.getCore().byId("descSchedaF").getValue();
			var idSchedaF = sap.ui.getCore().byId("idSchedaF").getValue();
			var gruppoF = sap.ui.getCore().byId("gruppoF").getSelectedKey();
			var congF = sap.ui.getCore().byId("congF").getSelectedKey();
			var oFilters = [];
			var ofilterSM = [];

			if (pistaid != undefined && pistaid != "") {
				//fetch all schedamaster ids with search pistaId	
				var pistaIdSchedaMaster = "";
				console.log(this.getView().getModel("SchedaPersonaleModel"));
				for (var i = 0; i < oMainModel.getData()[2].Fragment[1].Data.length; i++) {
					if (oMainModel.getData()[2].Fragment[1].Data[i].ID_PISTA === parseInt(pistaid)) {
						pistaIdSchedaMaster = oMainModel.getData()[2].Fragment[1].Data[i].ID_SCHEDAMASTER; //fetching ID_SCHEDAMASTER of ID_PISTA
						var filter1 = new sap.ui.model.Filter("ID_SCHEDAMASTER", sap.ui.model.FilterOperator.EQ, pistaIdSchedaMaster);
						ofilterSM.push(filter1);
					}
				}
				console.log(ofilterSM);
				oFilters.push(new sap.ui.model.Filter(ofilterSM, false));
			}
			if (note != undefined && note != "") {
				var filter1 = new sap.ui.model.Filter("NOTE", sap.ui.model.FilterOperator.EQ, note);
				oFilters.push(filter1);
			}
			if (descpista != undefined && descpista != "") {
				var filter1 = new sap.ui.model.Filter("DESCR_PISTA", sap.ui.model.FilterOperator.Contains, descpista);
				oFilters.push(filter1);
			}
			if (descSchedaF != undefined && descSchedaF != "") {
				var filter1 = new sap.ui.model.Filter("DESCR_SCHEDA", sap.ui.model.FilterOperator.Contains, descSchedaF);
				oFilters.push(filter1);
			}
			if (idSchedaF != undefined && idSchedaF != "") {
				var filter1 = new sap.ui.model.Filter("ID_SCHEDAMASTER", sap.ui.model.FilterOperator.EQ, idSchedaF);
				oFilters.push(filter1);
			}
			if (gruppoF != undefined && gruppoF != "") {
				var filter1 = new sap.ui.model.Filter("DESCR_GRUPPOSCHEDA", sap.ui.model.FilterOperator.Contains, gruppoF);
				oFilters.push(filter1);
			}
			if (congF != undefined && congF != "") {
				var filter1 = new sap.ui.model.Filter("SN_CONGELATA", sap.ui.model.FilterOperator.EQ, congF);
				oFilters.push(filter1);
			}
			/*if ((pistaid != undefined && pistaid != "") || (descpista != undefined && descpista != "")){
				
			}*/
			var oTable = sap.ui.getCore().byId("tblFilter");
			var aBinding = oTable.getBinding("items");
			aBinding.filter(new sap.ui.model.Filter({
				filters: oFilters,
				and: true // AND operator true will check all of the filter conditions get satisfied
			}));
			sap.ui.getCore().byId("tblFilter").setVisible(true);
		},
		/************************selectIdFilter function is used to set the values to schedainfo, tpi, autoLtrFix and mom********************************/
		selectIdFilter: function (oEvent, desc, pay, ltr, mom) {
			sap.ui.getCore().byId("schedainfo").setValue(desc);
			sap.ui.getCore().byId("tpi").setValue(pay);
			sap.ui.getCore().byId("autoLtrFix").setValue(ltr);
			this.mom = mom;
			this.schedaFilterFragmentClose();
		},
		/************************openDiretto function is used to open the diretto fragment********************************/
		openDiretto: function (oEvent) {
			this.oDialogFragment1 = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.diretto", this.getView().getController());
			this.getView().addDependent(this.oDialogFragment1);
			sap.ui.getCore().byId("displayData").setVisible(false);
			this.oDialogFragment1.open();
		},
		/************************selectMGR function is used to set the ManagerId and close the schedafilterFragment********************************/
		selectMGR: function (oEvent, matr) {
			sap.ui.getCore().byId("managerId").setSelectedKey(matr);
			this.schedaFilterFragmentClose();
		},
		/************************FilterRoleClear function is used to reset the values of 
		Matricola, Cognome, Nome and Grade as blank and the data is not visible********************************/
		FilterRoleClear: function () {
			sap.ui.getCore().byId("mat_mgr").setValue("");
			sap.ui.getCore().byId("cognome_mgr").setValue("");
			sap.ui.getCore().byId("nome_mgr").setValue("");
			sap.ui.getCore().byId("band_mgr").setSelectedKey("");
			sap.ui.getCore().byId("displayData").setVisible(false);
		},
		/************************FilterRoleSearch function is used to fetch and display the values of 
		Matricola, Cognome, Nome and Grade for manager********************************/
		FilterRoleSearch: function () {
			var mat = sap.ui.getCore().byId("mat_mgr").getValue();
			var cog = sap.ui.getCore().byId("cognome_mgr").getValue();
			var nom = sap.ui.getCore().byId("nome_mgr").getValue();
			var band = sap.ui.getCore().byId("band_mgr").getSelectedKey();
			var oFilters = [];
			if (mat != undefined && mat != "") {
				var filter1 = new sap.ui.model.Filter("MATRICOLA_MGR", sap.ui.model.FilterOperator.Contains, mat);
				oFilters.push(filter1);
			}
			if (cog != undefined && cog != "") {
				var filter1 = new sap.ui.model.Filter("COGNOME_MGR", sap.ui.model.FilterOperator.Contains, cog);
				oFilters.push(filter1);
			}
			if (nom != undefined && nom != "") {
				var filter1 = new sap.ui.model.Filter("NOME_MGR", sap.ui.model.FilterOperator.Contains, nom);
				oFilters.push(filter1);
			}
			if (band != undefined && band != "") {
				var filter1 = new sap.ui.model.Filter("BAND_MGR", sap.ui.model.FilterOperator.EQ, band);
				oFilters.push(filter1);
			}
			var oTable = sap.ui.getCore().byId("displayData");
			var aBinding = oTable.getBinding("items");
			aBinding.filter(new sap.ui.model.Filter({
				filters: oFilters,
				and: true // AND operator true will check all of the filter conditions get satisfied
			}));
			sap.ui.getCore().byId("displayData").setVisible(true);
		},
		/************************assign_scheda function is used to access create_schedapersonali.xsjs 
		and based on the type it is used to assign the text********************************/
		assign_scheda: function (oEvent) {

			var id = change_pck_arr;
			var mom = [],
				tpckg = 0;
			var type = oMainModel.getData()[3].type;
			var protocol = null;
			var flow1 = sap.ui.getCore().byId("delPckg").getSelectedIndex();
			if (flow1 === -1) {
				flow1 = "X"; //no sel
				flow = 3;
			} else if (flow1 === 0) {
				flow1 = "S"; //standard
				flow = 1;
			} else if (flow1 === 1) {
				flow1 = "C"; //carcateo
				flow = 5;
			}
			var fail = 0,
				notes = "";
			var sn = "N",
				note_inattivo = "";
			var schedainfo = 0;
			var sg = "N";
			var mgr = [],
				hr = [],
				roless = [],
				warn = 0;
			//var template_man = sap.ui.getCore().byId("template_man").getSelectedKey();
			var template_man = 0;
			var auto_ltr = 0;
			var matricola = change_id_arr;
			if (type.includes("Gestione")) {
				sg = "S";
				template_man = sap.ui.getCore().byId("template_man").getSelectedKey();
				for (var i = 0; i < this.allLetters.length; i++) {
					if (this.allLetters[i].id === parseInt(template_man, 10)) {
						if (this.allLetters[i].ID_TIPOTEMPLATE === 2 && flow1 === "C")
							flow = 6;
						else if (this.allLetters[i].ID_TIPOTEMPLATE === 1 && flow1 === "C")
							flow = 5;
						else if (this.allLetters[i].ID_TIPOTEMPLATE === 1 && flow1 === "S")
							flow = 1;
						else if (this.allLetters[i].ID_TIPOTEMPLATE === 2 && flow1 === "S")
							flow = 3;
					}
				}
				//var pay = sap.ui.getCore().byId("tpi").getValue();
				if (auto_ltr === null || auto_ltr === '')
					auto_ltr = 0;
				var pay = sap.ui.getCore().byId("tpi").getValue();
				if (pay > 100) {
					MessageBox.error("Percentuale scheda gestionale non può essere maggiore del 100%");
					// Error message 'Management card percentage cannot be greater than 100%"'
					fail = 1;
				} else
					fail = 0;
				notes = sap.ui.getCore().byId("gestTxt").getValue();
				var mgr = [],
					roless = [],
					rh = [];
				var data = oMainModel.getData()[1].Main;

				if (change_id_arr.length === 1) {
					roless.push(sap.ui.getCore().byId("roless").getValue());
					mgr.push(sap.ui.getCore().byId("managerId").getSelectedKey());
					rh.push("");
				} else {
					for (var ii = 0; ii < change_id_arr.length; ii++) {
						for (var jj = 0; jj < oMainModel.getData()[1].Main.length; jj++) {
							if (oMainModel.getData()[1].Main[jj].MATRICOLA === change_id_arr[ii]) {
								roless.push(oMainModel.getData()[1].Main[jj].RUOLO_PROF);
								mgr.push(oMainModel.getData()[1].Main[jj].MATRICOLA_MGR);
								rh.push("");
							}
						}
					}
				}

				var sdatee = sap.ui.getCore().byId("MeIn").getSelectedKey();
				var year = new Date(Periodi_start_date_main).getFullYear();
				var sdate = sdatee + "-01-" + year + " 00:00:00 GMT+0100";
				sdate = new Date(sdate);
				var edatee = sap.ui.getCore().byId("MeFin").getSelectedKey();
				var years = year;
				if (parseInt(edatee, 10) < parseInt(sdatee, 10))
					var years = year + 1;
				var edate = edatee + "-01-" + years + " 00:00:00 GMT+0100";
				edate = new Date(edate);
			} else if (type.includes("letter")) {
				var roless = [];
				var mgr = [];
				var rh = [""];
				for (var ii = 0; ii < change_id_arr.length; ii++) {
					for (var jj = 0; jj < oMainModel.getData()[1].Main.length; jj++) {
						if (oMainModel.getData()[1].Main[jj].MATRICOLA === change_id_arr[ii]) {
							mgr.push(oMainModel.getData()[1].Main[jj].MATRICOLA_MGR);
							roless.push(oMainModel.getData()[1].Main[jj].RUOLO_PROF);
						}
					}
				}
				var sdate = "";
				var edate = "";
				var pay = 0;
				template_man = sap.ui.getCore().byId("template_man").getSelectedKey();
				for (var i = 0; i < this.allLetters.length; i++) {
					if (this.allLetters[i].id === parseInt(template_man, 10)) {
						if (this.allLetters[i].ID_TIPOTEMPLATE === 2 && flow1 === "C")
							flow = 6;
						else if (this.allLetters[i].ID_TIPOTEMPLATE === 1 && flow1 === "C")
							flow = 5;
						else if (this.allLetters[i].ID_TIPOTEMPLATE === 1 && flow1 === "S")
							flow = 1;
						else if (this.allLetters[i].ID_TIPOTEMPLATE === 2 && flow1 === "S")
							flow = 3;
					}
				}
				if (type.includes("letter_asseg"))
					tpckg = 1;
				else if (type.includes("letter_consun"))
					tpckg = 2;
				//var flow = 0;
				auto_ltr = 0;
			} else if (type === "assegnaResp") {
				id = change_pck_arr;
				mgr.push(sap.ui.getCore().byId("managerId").getSelectedKey())
			} else if (type === "scegli") {
				var roless = [];
				var mgr = [];
				var rh = [""];
				for (var ii = 0; ii < change_id_arr.length; ii++) {
					for (var jj = 0; jj < oMainModel.getData()[1].Main.length; jj++) {
						if (oMainModel.getData()[1].Main[jj].MATRICOLA === change_id_arr[ii]) {
							mgr.push(oMainModel.getData()[1].Main[jj].MATRICOLA_MGR);
							roless.push(oMainModel.getData()[1].Main[jj].RUOLO_PROF);
						}
					}
				}

			} else if (type === "inattivo") {
				var roless = [];
				var mgr = [];
				var rh = [];
				for (var ii = 0; ii < change_id_arr.length; ii++) {
					for (var jj = 0; jj < oMainModel.getData()[1].Main.length; jj++) {
						if (oMainModel.getData()[1].Main[jj].MATRICOLA === change_id_arr[ii]) {
							roless.push(oMainModel.getData()[1].Main[jj].RUOLO_PROF);
							mgr.push(oMainModel.getData()[1].Main[jj].MATRICOLA_MGR);
							rh.push("");
						}
					}
				}
				var sdatee = sap.ui.getCore().byId("MeIn1").getSelectedKey();
				var year = parseInt(sap.ui.getCore().byId("MeIn1")._oSelectionOnFocus.mProperties.text.split(" ")[1], 10)
				var sdate = sdatee + "-01-" + year + " 00:00:00 GMT+0100";
				sdate = new Date(sdate);
				var edatee = sap.ui.getCore().byId("MeFin1").getSelectedKey();
				var years = parseInt(sap.ui.getCore().byId("MeFin1")._oSelectionOnFocus.mProperties.text.split(" ")[1], 10)
				var edate = edatee + "-01-" + years + " 00:00:00 GMT+0100";
				edate = new Date(edate);
				var flow = 0;
				var pay = 0;
				//var matricola = change_id_arr;
				var sn = "S";
				note_inattivo = sap.ui.getCore().byId("note_inattivo").getValue();
				/*	var sdatee = sap.ui.getCore().byId("MeIn1").getSelectedKey();
					var year = parseInt(sap.ui.getCore().byId("MeIn1")._oSelectionOnFocus.mProperties.text.split(" ")[1], 10)
					var sdate = sdatee + "-01-" + year;
					sdate = new Date(sdate);
					var edatee = sap.ui.getCore().byId("MeFin1").getSelectedKey();
					var years = parseInt(sap.ui.getCore().byId("MeFin1")._oSelectionOnFocus.mProperties.text.split(" ")[1], 10)
					var edate = edatee + "-01-" + years;
					edate = new Date(edate);
					var edt = oMainModel.getData()[3].edate;
					var sdt = oMainModel.getData()[3].sdate;
					var yrs_s, yrs_e;
					
					for (var i = 0; i < sdt.length; i++) {
						if (sdt[i] !== null && edt[i] !== null) {
							yrs_s = parseInt(sdt[i].split(" ")[1], 10);
							yrs_e = parseInt(edt[i].split(" ")[1], 10);
							var sdt_i = Formatter.monthsRev(sdt[i].split(" ")[0]);
							var edt_i = Formatter.monthsRev(edt[i].split(" ")[0]);
							sdt_i = sdt_i + "-01-" + yrs_s;
							edt_i = edt_i + "-01-" + yrs_e;
							sdt_i = new Date(sdt_i);
							edt_i = new Date(edt_i);
							
							if ((sdate < sdt_i && edate < sdt_i) || (sdate > edt_i && edate > edt_i))
								fail = 0;
							
							else
								fail = 1;
							//fail = 0;
						}
					}
					if (fail === 1)
						MessageBox.error(
							"Impossibile salvare! Il periodo di validità della scheda personale si sovrappone al periodo di un’altra scheda personale già presente"
						);*/
			} else if (type.includes("Scheda")) {
				mom = this.mom;
				template_man = sap.ui.getCore().byId("template_man").getSelectedKey();
				for (var i = 0; i < this.allLetters.length; i++) {
					if (this.allLetters[i].id === parseInt(template_man, 10)) {
						if (this.allLetters[i].ID_TIPOTEMPLATE === 2 && flow1 === "C")
							flow = 6;
						else if (this.allLetters[i].ID_TIPOTEMPLATE === 1 && flow1 === "C")
							flow = 5;
						else if (this.allLetters[i].ID_TIPOTEMPLATE === 1 && flow1 === "S")
							flow = 1;
						else if (this.allLetters[i].ID_TIPOTEMPLATE === 2 && flow1 === "S")
							flow = 3;
					}
				}
				if (template_man === '')
					template_man = 0;
				if (type === "change_Scheda")
					id = change_pck_arr[0];
				var mgr = [];
				var rh = [];
				if (type === "change_Scheda" || type === "Scheda") {
					mgr.push(sap.ui.getCore().byId("managerId").getSelectedKey());
					roless.push(sap.ui.getCore().byId("roless").getValue());
				} else {
					for (var ii = 0; ii < change_id_arr.length; ii++) {
						for (var jj = 0; jj < oMainModel.getData()[1].Main.length; jj++) {
							if (oMainModel.getData()[1].Main[jj].MATRICOLA === change_id_arr[ii]) {
								mgr.push(oMainModel.getData()[1].Main[jj].MATRICOLA_MGR);
								roless.push(oMainModel.getData()[1].Main[jj].RUOLO_PROF);
							}
						}
					}
				}
				rh.push(" ");
				/*if (type === "change_Scheda" || type === "Scheda")
					roless.push(sap.ui.getCore().byId("roless").getValue());
				else {
					for (var ii = 0; ii < change_id_arr.length; ii++) {
						for (var jj = 0; jj < oMainModel.getData()[1].Main.length; jj++) {
							if (oMainModel.getData()[1].Main[jj].MATRICOLA === change_id_arr[ii])
								roless.push(oMainModel.getData()[1].Main[jj].RUOLO_PROF);
						}
					}
				}*/

				var schedainfo = sap.ui.getCore().byId("schedainfo").getValue();
				if (schedainfo === '')
					fail = 2;
				else
					fail = 0;
				var data = oMainModel.getData()[2].Fragment[1].Data;
				for (var i = 0; i < data.length; i++) {
					if (data[i].DESCR_SCHEDA === schedainfo) {
						schedainfo = data[i].ID_SCHEDAMASTER;
						auto_ltr = data[i].ID_TEMPLATELETTERA;
						break;
					}
				}

				for (var i = 0; i < oMainModel.getData()[2].Fragment[7].SchedaPiste.length; i++) {
					if (oMainModel.getData()[2].Fragment[7].SchedaPiste[i].ID_SCHEDAMASTER === schedainfo)
						mom = oMainModel.getData()[2].Fragment[7].SchedaPiste[i].PISTE;
				}

				var pay = sap.ui.getCore().byId("tpi").getValue();
				if (auto_ltr === null || auto_ltr === '')
					auto_ltr = 0;
			}
			if (type.includes("Scheda") || type.includes("Gestione")) {
				var sdatee = sap.ui.getCore().byId("MeIn").getSelectedKey();
				var year = parseInt(sap.ui.getCore().byId("MeIn")._oSelectionOnFocus.mProperties.text.split(" ")[1], 10)
				var sdate = sdatee + "-01-" + year + " 00:00:00 GMT+0100";
				sdate = new Date(sdate);
				var edatee = sap.ui.getCore().byId("MeFin").getSelectedKey();
				var years = parseInt(sap.ui.getCore().byId("MeFin")._oSelectionOnFocus.mProperties.text.split(" ")[1], 10)
				var edate = edatee + "-01-" + years + " 00:00:00 GMT+0100";
				edate = new Date(edate);
				if (!type.includes("Scheda_2")) {
					var edt = oMainModel.getData()[3].edate;
					var sdt = oMainModel.getData()[3].sdate;
					var yrs_s, yrs_e;

					for (var i = 0; i < sdt.length; i++) {
						if (sdt[i] !== null && edt[i] !== null) {
							yrs_s = parseInt(sdt[i].split(" ")[1], 10);
							yrs_e = parseInt(edt[i].split(" ")[1], 10);
							if (sdt[i] != "" && edt[i] !== "") {
								var sdt_i = Formatter.monthsRev(sdt[i].split(" ")[0]);
								var edt_i = Formatter.monthsRev(edt[i].split(" ")[0]);
								sdt_i = sdt_i + "-01-" + yrs_s;
								edt_i = edt_i + "-01-" + yrs_e;
								sdt_i = new Date(sdt_i);
								edt_i = new Date(edt_i);
								/*if ((parseInt(sdatee, 10) <= sdt_i && parseInt(edatee, 10) <= sdt_i && yrs_s === year) || (parseInt(sdatee, 10) >= edt_i &&
										parseInt(edatee, 10) >= edt_i && yrs_e >= years))*/
								if ((sdate < sdt_i && edate < sdt_i) || (sdate > edt_i && edate > edt_i))
									fail = 0;
								//if (parseInt(sdatee,10) >= sdt[i] && parseInt(edatee,10) <= edt[i]) {
								else {
									fail = 1;
									break;
								}
								//fail = 0;
								warn = 1;
								var t1 = sdate.getMonth() + 1,
									t2 = edt_i.getMonth() + 2;
								if (t1 === t2 || (t1 === 13 && t2 === 1))
									warn = 0;
							}
						}
					}

					if (fail === 1) {
						MessageBox.error(
							"Impossibile salvare! Il periodo di validità della scheda personale si sovrappone al periodo di un’altra scheda personale già presente"
							//Can't save! The period of validity of the personal card overlaps with the period of another personal card already present
						);
					} else if (fail === 2) {
						MessageBox.error("Schedamaster non può essere nullo"); //Tabmaster cannot be null
					} else if (warn === 1) {
						MessageBox.alert("Attenzione: Esiste un’interruzione nel periodo di validità delle schede.", { //Alert message 'Warning: There is a break in the validity period of the cards'
							styleClass: "sapUiSizeCompact",
							onClose: function (oAction) {
								warn = 0;
								fail = 0;
							}
						});
					}
				}
			}
			if (fail === 0 || type.includes("Scheda_2")) {
				var payload = {
					ID_PERIODO: parseInt(selectedfiscalYearPeriodi, 10),
					MATRICOLA: matricola,
					ID_SCHEDAMASTER: schedainfo,
					RUOLO: roless,
					_MATR_RESP_DIRETTO: mgr,
					_MATR_RESP_HR: rh,
					INIZIO_ASSEGNAZIONE: sdate,
					FINE_ASSEGNAZIONE: edate,
					SN_SCHEDAGESTIONALE: sg,
					PERC_GESTIONALE: pay,
					NOTE_GESTIONALE: notes,
					SN_BLOCCATA: "N",
					P4P_SCHEDA: "",
					SN_INATTIVO: sn,
					NOTE_INATTIVO: note_inattivo,
					DATETIME_CR: new Date(),
					DATETIME_LM: new Date(),
					type: type,
					ID_PACKAGEDS: id,
					ID_PROTOCOLLO: protocol,
					FLOWSCELTO: flow1,
					ID_TIPOFLOW: flow,
					ID_TIPOPACKAGEDS: tpckg,
					ID_CONSUNTIVO: 0,
					ID_TEMPLATELETTERA: parseInt(template_man, 10),
					ID_TEMPLATELETTERAAUTO: parseInt(auto_ltr, 10),
					SN_PREGRESSO: "",
					SN_REINVIO: "",
					SN_VISIBILEHR: "",
					SN_MODBASIPOSTINVIO: "",
					SN_MODIMPORTOPOSTINVIO: "",
					SN_MODSCHEDAPOSTINVIO: "",
					SN_MODPISTAPOSTINVIO: "",
					SBASIMATCH: "",
					mom: mom
				};
				console.log(payload);
				var that = this;
				$.ajax({
					url: "/HANAMDC/STIP/STIPAdmin/services/create_schedapersonali.xsjs",
					//url: "/HANAMDC/STIP/STIPAdmin/services/test.xsjs",
					type: "POST",
					method: "GET",
					contentType: 'application/json',
					data: {
						odata: JSON.stringify(payload)
					},
					dataType: 'text',
					success: function (data, textStatus1) {

						that.assign = 1;
						that.mom = false + ":" + 0;
						oMainModel.getData()[0].Filter[16].LETTERE_MANUALE = that.allLetters;
						console.log(data);
						var txxt = "";
						if (JSON.parse(data).result === "Error")
							MessageBox.error("Impossibile creare il Scheda Personale"); //Error message 'Unable to create My Card'
						else {
							chk = 1;
							that.getView().byId("chmain").setSelected(false);
							for (var i = 0; i < oMainModel.getData()[1].Main.length; i++)
								oMainModel.getData()[1].Main[i].Check_CHECKBOX = false;

							if (type === "Scheda")
								txt = "Scheda Personali creata con successo";

							else if (type === "Scheda_2")
								txt = "Scheda modificata con successo";
							else if (type === "scegli")
								txt = "Il flusso viene aggiornato";
							else if (type === "inattivo")
								txt = "Persona contrassegnata come inattiva";
							else if (type === "Gestione")
								txt = "Scheda gestionale creata con successo";
							else if (type === "change_Scheda")
								txt = "Scheda modificata con successo"
							else if (type === "letter_asseg")
								txt = "Lettera di assegnazione creata con successo.";
							else if (type === "letter_asseg_change") {
								txt = "Lettera di assegnazione modificata con successo per matricola ";
								for (var i = 0; i < change_id_arr.length; i++)
									txt = txt + change_id_arr[i] + " ";
							} else if (type === "letter_consun")
								txt = "Lettera di consuntivazione creata con successo.";
							else if (type === "letter_consun_change") {
								txt = "Lettera di consuntivazione modificata con successo per matricola ";
								for (var i = 0; i < change_id_arr.length; i++)
									txt = txt + change_id_arr[i] + " ";
							} else if (type === "assegnaResp")
								txt = "Responsibile Diretto Asseganata con successo";
							else if (type === "Gestione_change")
								txt = "Gestione modificata con successo";
							MessageBox.success(txt, {
								onClose: function (oEvent) {

									console.log("Onclose");
									oMainModel.refresh();

									that.onCloseDialog();
									that.onSearch(1);
								}
							});

						}
					},
					error: function (data, textStatus1) {

						console.log(data);
						MessageBox.error("Impossibile creare il Scheda Personale");
						jQuery.sap.log.getLogger().error("Modifica operation failed" + textStatus1.toString());
					}
				});
			}
		},
		/************************delScheda function seeks confirmation from the user to delete a particular package********************************/
		/************************If the user action is Si, then eliminaStati function is invoked********************************/
		delScheda: function () {

			var that = this;
			MessageBox.confirm("Confermi l’eliminazione?", {
				styleClass: "sapUiSizeCompact",
				actions: ["Si", sap.m.MessageBox.Action.NO],
				emphasizedAction: "Si",
				initialFocus: sap.m.MessageBox.Action.NO,
				onClose: function (oAction) {
					if (oAction === "NO") {
						//that.cancel();
					} else if (oAction === "Si") {
						that.eliminaStati();
					}
				}
			});
		},
		/************************confirmAssegna function is used to validate the start and end dates based on the types (inattivo or Scheda) for multiple users********************************/
		confirmAssegna: function () {

			//var txt = "";
			var type = oMainModel.getData()[3].type;
			var data = oMainModel.getData()[3].New,
				nome = [],
				cognome = [],
				matr = [],
				id = [];
			for (var i = 0; i < data.length; i++) {
				nome.push(data[i].NOME);
				cognome.push(data[i].COGNOME);
				matr.push(data[i].MATRICOLA);
				id.push(data[i].ID_SCHEDAMASTER);
			}
			var fail;
			txt = "";
			if (type === "inattivo") {
				var schedainfo = "X";
				var sdatee = sap.ui.getCore().byId("MeIn1").getSelectedKey();
				var edatee = sap.ui.getCore().byId("MeFin1").getSelectedKey();
				var year = parseInt(sap.ui.getCore().byId("MeIn1")._oSelectionOnFocus.mProperties.text.split(" ")[1], 10);
				var years = parseInt(sap.ui.getCore().byId("MeFin1")._oSelectionOnFocus.mProperties.text.split(" ")[1], 10);
			} else if (type.includes("Scheda")) {
				var schedainfo = sap.ui.getCore().byId("schedainfo").getValue();
				var sdatee = sap.ui.getCore().byId("MeIn").getSelectedKey();
				var year = parseInt(sap.ui.getCore().byId("MeIn")._oSelectionOnFocus.mProperties.text.split(" ")[1], 10)
				var edatee = sap.ui.getCore().byId("MeFin").getSelectedKey();
				var years = parseInt(sap.ui.getCore().byId("MeFin")._oSelectionOnFocus.mProperties.text.split(" ")[1], 10)
			}
			var sdate = sdatee + "-01-" + year + " 00:00:00 GMT+0100";
			sdate = new Date(sdate);
			var edate = edatee + "-01-" + years + " 00:00:00 GMT+0100";
			edate = new Date(edate);
			var p = [],
				tmp = [];
			var dates = oMainModel.getData()[3].dates;
			var yrs_s, yrs_e;

			for (var i = 0; i < dates.length; i++) {
				var t_sdt = dates[i].sdate,
					t_edt = dates[i].edate,
					t_mat = dates[i].Matricola;
				if (t_sdt === null || t_edt === null || t_sdt === undefined || t_edt === undefined || t_sdt === "" || t_edt === "")
					dates[i].fail = 0;
				else {
					//yrs_s = parseInt(sdt[i].split(" ")[1], 10);
					//yrs_e = parseInt(edt[i].split(" ")[1], 10);
					yrs_s = parseInt(t_sdt.split(" ")[1], 10);
					yrs_e = parseInt(t_edt.split(" ")[1], 10);
					//var sdt_i = Formatter.monthsRev(sdt[i].split(" ")[0]);
					//var edt_i = Formatter.monthsRev(edt[i].split(" ")[0]);
					var sdt_i = Formatter.monthsRev(t_sdt.split(" ")[0]); //monthsRev function of formatter is used
					var edt_i = Formatter.monthsRev(t_edt.split(" ")[0]);
					sdt_i = sdt_i + "-01-" + yrs_s;
					edt_i = edt_i + "-01-" + yrs_e;
					sdt_i = new Date(sdt_i);
					edt_i = new Date(edt_i);
					/*if ((parseInt(sdatee, 10) <= sdt_i && parseInt(edatee, 10) <= sdt_i && yrs_s === year) || (parseInt(sdatee, 10) >= edt_i &&
							parseInt(edatee, 10) >= edt_i && yrs_e >= years))*/
					if ((sdate < sdt_i && edate < sdt_i) || (sdate > edt_i && edate > edt_i))
					//fail = 0;
						dates[i].fail = 0;
					//if (parseInt(sdatee,10) >= sdt[i] && parseInt(edatee,10) <= edt[i]) {
					else {
						if (t_sdt !== null && t_edt !== null && t_sdt !== undefined && t_edt !== undefined) {
							//fail = 1;
							dates[i].fail = 1;
							//p.push(sdt[i].split(":")[1]);
						}
					}
					//fail = 0;
					var warn = 1;
					var t1 = sdate.getMonth() + 1,
						t2 = edt_i.getMonth() + 2;
					if (t1 === t2 || (t1 === 13 && t2 === 1))
						warn = 0;
				}
			}
			/*if (fail === 1) {
				for (var j = 0; j < matr.length; j++) {
					for (var i = 0; i < p.length; i++) {
						if (p[i] === matr[j])
							txt = txt + "\n" + cognome[j] + " " + nome[j] + " " + matr[j] + " " + id[j] + " " +
							" Error: Impossibile salvare! Il periodo di validità della scheda personale si sovrappone al periodo di un’altra scheda personale già presente";
					}
				}
			}*/
			for (var i = 0; i < dates.length; i++) {
				if (dates[i].fail === 1)
					p.push(dates[i].Matricola);
			}
			var d = p,
				m = {};
			p = [];
			for (var i = 0; i < d.length; i++) {
				var v = d[i];
				if (!m[v]) {
					m[v] = true;
					p.push(v);
				}
			}
			this.failMat = p;
			for (var i = 0; i < p.length; i++) {
				for (var j = 0; j < matr.length; j++) {
					if (matr[j] === p[i]) {
						if (type.includes("Scheda"))
							txt = txt + "\n" + matr[j] + " " + cognome[j] + " " + nome[j] + " " + id[j] + " " +
							" Error: Impossibile salvare! Il periodo di validità della scheda personale si sovrappone al periodo di un’altra scheda personale già presente";
						//Can't save! The period of validity of the personal card overlaps with the period of another personal card already present
						else
							txt = txt + "\n" + matr[j] + " " + cognome[j] + " " + nome[j] + " " + id[j] + " " +
							"Lo stato inattivo si sovrappone ad una scheda già esistente"; //Idle state overlaps an existing tab
					}
				}
			}
			if (sdatee === "0" || sdatee === null || sdatee === undefined) { //Condition for start date cannot be null or undefined
				for (var i = 0; i < nome.length; i++)
					txt = txt + "\n" + matr[j] + " " + cognome[i] + " " + nome[i] + " " + id[i] + " " + "Error: La data di inizio è nulla"; //Start date is none
			}
			if (edatee === "0" || edatee === null || edatee === undefined) { //Condition for end date cannot be null or undefined
				for (var i = 0; i < nome.length; i++)
					txt = txt + "\n" + matr[j] + " " + cognome[i] + " " + nome[i] + " " + id[i] + " " + "Error: La data di fine è nulla"; //	End date is none
			}
			/*	if ((syear === eyear && parseInt(sdatee, 10) > parseInt(edatee, 10)) || (syear > eyear)) {*/
			if (sdate > edate) {
				for (var i = 0; i < nome.length; i++)
					txt = txt + "\n" + matr[j] + " " + cognome[i] + " " + nome[i] + " " + id[i] + " " +
					"Error: La data di Inizio non può essere maggiore della data di Fine"; //Start date cannot be greater than finish date
			}
			this.oDialogFragment1 = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.confirm", this.getView().getController());
			this.getView().addDependent(this.oDialogFragment1);
			sap.ui.getCore().byId("ass").attachPress(this.associa, this);
			sap.ui.getCore().byId("cont").attachPress(this.continuaScheda, this);
			/*if (txt !== "")
				sap.ui.getCore().byId("ass").setEnabled(false);
			else
				sap.ui.getCore().byId("ass").setEnabled(true);*/
			if (type === "inattivo") {
				sap.ui.getCore().byId("confirmTitle").setTitle("Anagraphica- Gestione Stato Inattivo");
				sap.ui.getCore().byId("tab1").setHeaderText("Assegnazione Stato Inattivo");
			} else if (type.includes("Scheda")) {
				//var schedainfo = sap.ui.getCore().byId("schedainfo").getValue();
				sap.ui.getCore().byId("confirmTitle").setTitle("Procedura Associazione Schede Master");
				sap.ui.getCore().byId("tab1").setHeaderText("Assegnazione Scheda Master");
				var sch = oMainModel.getData()[3].scheda;
				/*for (var i = 0; i < sch.length; i++) {
					if (schedainfo === sch[i].split(":")[0]) {
						fail = 2;
						var matr = sch[i].split(":")[1];
					}
				}*/
				/*if (fail === 2) {
					for (var i = 0; i < nome.length; i++)
						txt = txt + "\n" + cognome[i] + " " + nome[i] + " " + matr[i] + " " + id[i] + " " + " Error: La scheda master " + schedainfo +
						" esiste per matricola ";
				}*/
				if (schedainfo === "" || schedainfo === null) {
					for (var i = 0; i < nome.length; i++)
						txt = txt + "\n" + cognome[i] + " " + nome[i] + " " + matr[i] + " " + id[i] + " " +
						" Error: Nessuna scheda master definita"; //No master card defined
				}
			}
			//Employee’s Matricola, last name and Name – id scheda master and error message
			this.oDialogFragment1.open();
		},
		/************************continuaScheda function invokes the assign_scheda if there is any id selected
		else disables the cont and interrupt ********************************/
		continuaScheda: function () {

			for (var j = 0; j < change_id_arr.length; j++) {
				for (var i = 0; i < this.failMat.length; i++) {
					if (this.failMat[i] === change_id_arr[j])
						change_id_arr.splice(j, 1);
				}
			}
			if (change_id_arr.length !== 0) {

				this.chiudi();
				this.assign_scheda();
			} else {
				sap.ui.getCore().byId("cont").setEnabled(false);
				sap.ui.getCore().byId("interrupt").setEnabled(false);
			}
			this.failMat = [];
		},
		/************************associa function is fetches the warn field; If it is blank, then invokes the assign_scheda
		function else enables the cont and interrupt********************************/
		associa: function () {

			/*this.oDialogFragment1.destroy();
			this.confirm = 1;*/
			sap.ui.getCore().byId("warn").setValue(txt);
			if (sap.ui.getCore().byId("warn").getValue() === "") {
				this.oDialogFragment1.destroy();
				this.confirm = 1;
				this.assign_scheda();
			} else {
				sap.ui.getCore().byId("ass").setEnabled(false);
				sap.ui.getCore().byId("cont").setEnabled(true);
				sap.ui.getCore().byId("interrupt").setEnabled(true);
			}
		},
		/************************chiudi function is used to close the dialog box********************************/
		chiudi: function () {
			this.oDialogFragment1.destroy();

			//this.assign_scheda();
		},
		/************************************************* starts of packaging functionality *************************/
		/***************************** start of 4.	Azioni sui package selezionati **************************************************/
		/************************onChangePackage function is used to carry out package operations********************************/
		onChangePackage: function (oEvent) {

			var selectedItem = oEvent.getSource().getSelectedItem();
			var key = selectedItem.mProperties.key;
			if (key === "selInactive") {
				var data = oMainModel.getData()[1].Main,
					p;
				//	this.byId("chmain").setSelected(false);
				for (var i = 0; i < data.length; i++) {
					if (data[i].MATRICOLA !== "")
						p = i;
					if (data[i].STATODIPENDENTE === "Inattivo") //If the user is inactive the value is S. If the user is active the value is N. 
					{
						if (data[i].MATRICOLA_JR === data[p].MATRICOLA) {
							change_id_arr.push(data[i].MATRICOLA_JR);
							data[p].Check_CHECKBOX = true;
						}
					}
					this.byId("package").getItemByKey("eliminaStati").setEnabled(true);
					oMainModel.refresh();
				}
			} else if (key === "eliminaStati") {
				var that = this;
				MessageBox.confirm("Confermi la cancellazione dei package selezionati?", { //Confirmation message 'Confirm cancellation of selected packages'
					styleClass: "sapUiSizeCompact",
					actions: ["Si", sap.m.MessageBox.Action.NO],
					emphasizedAction: "Si",
					initialFocus: sap.m.MessageBox.Action.NO,
					onClose: function (oAction) {
						if (oAction === "NO") {
							//that.cancel();
						} else if (oAction === "Si") {
							that.eliminaStati();
						}
					}
				});
			} else if (key === "invia" || key === "InvioPost") {

				var that = this;
				console.log(change_pck_arr);
				this.inviaCheck();
			} else if (key === "scegli") {

				var that = this;
				console.log(change_pck_arr);
				this.scheda_master_frag("scegli")
			} else if (key === "assegnaResp") {

				var that = this;
				console.log(change_pck_arr);
				this.scheda_master_frag("assegnaResp")
			}
			/*else if (key === "sblocca") {
				
				console.log(change_pck_arr);
				var payload = {
					ID_SCHEDAPERSONALE: change_pck_arr,
					type: "sblocca"
				};
				console.log(payload);
				$.ajax({
					url: "/HANAMDC/STIP/STIPAdmin/services/create_schedapersonali.xsjs",
					type: "POST",
					method: "GET",
					contentType: 'application/json',
					data: {
						odata: JSON.stringify(payload)
					},
					dataType: 'text',
					success: function (data1, textStatus1) {
						
						console.log(data1);
						change_pck_arr = [];
						oMainModel.refresh();
						MessageBox.success("Il pacchetto è sbloccato per l'invio al gestore");
					},
					error: function (data, textStatus1) {
						
						console.log(data);
						MessageBox.error("Errore durante  è sbloccato per l'invio al gestore");
					}
				});
			}*/
			else if (key === "rendiVisible" || key === "rendiNascosto" || key === "annullaSel" || key === "AnnullaReinvio") {
				console.log(change_pck_arr);
				var data = oMainModel.getData()[1].Main;
				var prot = [];
				for (var ii = 0; ii < change_pck_arr.length; ii++) {
					for (var i = 0; i < data.length; i++) {
						if (change_pck_arr[ii] === data[i].ID_PACKAGEDS)
							prot.push(data[i].ID_PROTOCOLLO2);
					}
				}
				var that = this;
				var payload = {
					ID_PACKAGEDS: change_pck_arr,
					type: key,
					ID_PROTOCOLLO: prot
				};
				console.log(payload);
				$.ajax({
					url: "/HANAMDC/STIP/STIPAdmin/services/create_schedapersonali.xsjs",
					type: "POST",
					method: "GET",
					contentType: 'application/json',
					data: {
						odata: JSON.stringify(payload)
					},
					dataType: 'text',
					success: function (data1, textStatus1) {

						change_id_arr = [];
						change_pck_arr = [];
						that.onSearch(1);
					},
					error: function (data, textStatus1) {

						console.log(data);
					}
				});
			} else if (key === "chiusuraCartacea") {
				console.log(change_pck_arr);
				this.scd = [];
				for (var i = 0; i < oMainModel.getData()[1].Main.length; i++) {
					if (oMainModel.getData()[1].Main[i].ID_PACKAGEDS === change_pck_arr[0])
						this.scd.push(oMainModel.getData()[1].Main[i]);
				}
				this.type = key;
				this.sendPDFToManager();
				this.sendMail();

			} else if (key === "eliminaScheda") {
				var that = this;
				MessageBox.confirm("Confermi la cancellazione dei package selezionati?", {
					styleClass: "sapUiSizeCompact",
					actions: ["Si", sap.m.MessageBox.Action.NO],
					emphasizedAction: "Si",
					initialFocus: sap.m.MessageBox.Action.NO,
					onClose: function (oAction) {
						if (oAction === "NO") {
							//that.cancel();
						} else if (oAction === "Si") {
							that.eliminaStati();
						}
					}
				});
			} else if (key === "letter_consun_change") {
				this.scheda_master_letter(key);
			} else if (key === "letter_asseg_change") {
				this.scheda_master_letter(key);
			}
			var data = oMainModel.getData()[1].Main;
			for (var i = 0; i < data.length; i++)
				data[i].Check_Pck_CHECKBOX = false;
			this.byId("package").setSelectedKey("pck1");

			prot = [];

		},
		/******************** onPress function will remove the fields from Grey, Italic and Label Text wrapping where checkbox is selected
		else will simply remove Grey and Italic from the fields********************************************/
		onPress: function (oItem) {
			var oEditableCells = oItem.getCells();
			for (var i = 0; i < oEditableCells.length; i++) {
				if (i < 19 && i > 4) {
					if (oEditableCells[i].getMetadata().getElementName() === "sap.m.CheckBox") {
						oEditableCells[i].removeStyleClass("stipAdminBloccaCongelatext");
					} else {
						oEditableCells[i].removeStyleClass("stipAdminBloccaCongelatext1");
					}
				}
			}
		},
		/******************** onPress1 function will set the fields as Grey and Italic and apply Label Text wrapping where checkbox is selected
		else will simply set the fields as Grey and Italic********************************************/
		onPress1: function (oItem) {
			var oEditableCells = oItem.getCells();
			for (var i = 0; i < oEditableCells.length; i++) {
				if (i < 19 && i > 4) {
					if (oEditableCells[i].getMetadata().getElementName() === "sap.m.CheckBox") {
						oEditableCells[i].addStyleClass("stipAdminBloccaCongelatext");
					} else {
						oEditableCells[i].addStyleClass("stipAdminBloccaCongelatext1");
					}
				}
			}
		},
		/************************inviaCheck function is used to access the mssCheck.xsjs and pushes the data 
		based on the ID_PERSONALE as per the ID_PERIODO********************************/
		inviaCheck: function () {

			var scd = [],
				details = [],
				piste = [];
			for (var i = 0; i < change_pck_arr.length; i++) {
				for (var j = 0; j < oMainModel.getData()[1].Main.length; j++) {
					if (change_pck_arr[i] === oMainModel.getData()[1].Main[j].ID_PACKAGEDS) {
						var sdate = oMainModel.getData()[1].Main[j].INIZIO_ASSEGNAZIONE;
						var edate = oMainModel.getData()[1].Main[j].FINE_ASSEGNAZIONE;
						if (edate !== "")
							edate = new Date((parseInt(Formatter.monthsRev(oMainModel.getData()[1].Main[j].FINE_ASSEGNAZIONE.split(" ")[0]), 10)) +
								"-01-" + oMainModel.getData()[1].Main[j].FINE_ASSEGNAZIONE.split(" ")[1]);
						if (sdate !== "")
							sdate = new Date((parseInt(Formatter.monthsRev(oMainModel.getData()[1].Main[j].INIZIO_ASSEGNAZIONE.split(" ")[0]), 10)) +
								"-01-" + oMainModel.getData()[1].Main[j].INIZIO_ASSEGNAZIONE.split(" ")[1]);
						scd.push({
							ID_LETTERE_MANUALE: oMainModel.getData()[1].Main[j].ID_LETTERE_MANUALE,
							ID_LETTERE_AUTOMATICA: oMainModel.getData()[1].Main[j].ID_LETTERE_AUTOMATICA,
							ID_SCHEDAPERSONALE: oMainModel.getData()[1].Main[j].ID_SCHEDAPERSONALE,
							ID_PROTOCOLLO: oMainModel.getData()[1].Main[j].ID_PROTOCOLLO2,
							NOME: oMainModel.getData()[1].Main[j].NOME_JR,
							COGNOME: oMainModel.getData()[1].Main[j].COGNOME_JR,
							ID_SCHEDAMASTER: oMainModel.getData()[1].Main[j].ID_SCHEDAMASTER,
							MATRICOLA: oMainModel.getData()[1].Main[j].MATRICOLA_JR,
							VALE_AL: edate,
							VALE_DAL: sdate,
						});
					}
				}
			}

			console.log(scd);
			var tmp = [];
			for (var i = 0; i < scd.length; i++) {
				//	this.sendPDFToManager(scd[i].ID_SCHEDAPERSONALE, scd[i].ID_PROTOCOLLO); //sendPDFToManager method sends PDF form to DMS
				for (var j = 0; j < oMainModel.getData()[2].Fragment[1].Data.length; j++) {
					if (scd[i].ID_SCHEDAMASTER === oMainModel.getData()[2].Fragment[1].Data[j].ID_SCHEDAMASTER) {
						piste.push({
							ID_PISTA: oMainModel.getData()[2].Fragment[1].Data[j].ID_PISTA,
							ID_PISTAVIEW: oMainModel.getData()[2].Fragment[1].Data[j].ID_PISTAVIEW
						});
						tmp.push(oMainModel.getData()[2].Fragment[1].Data[j].ID_PISTA);
					}
				}
				scd[i].ID_PISTA = piste;
				piste = [];
			}
			var m = {},
				count = 0;

			for (i = 0; i < scd.length; i++) {
				var v = scd[i].MATRICOLA;
				if (!m[v]) {
					count = count + 1;
					m[v] = true;
				}
			}
			var l = {
				length: count
			};
			var data = oMainModel.getData();
			data.push({
				Length: l
			});
			oMainModel.setData(data);
			oMainModel.refresh();

			console.log(piste);
			this.scd = scd;
			var payload = {
				scd: scd,
				ID_PERIODO: parseInt(selectedfiscalYearPeriodi, 10)
			};
			console.log(payload);
			var that = this;
			$.ajax({
				url: "/HANAMDC/STIP/STIPAdmin/services/mssCheck.xsjs",
				type: "POST",
				method: "GET",
				contentType: 'application/json',
				data: {
					odata: JSON.stringify(payload)
				},
				dataType: 'text',
				success: function (data, textStatus1) {

					console.log(data);
					that.contArr = data;
					data = JSON.parse(data);
					var txt1 = "",
						txt2 = "",
						txt = "";

					for (var i = 0; i < data.length; i++) {

						for (var j = 0; j < data[i].Error.length; j++) {
							if (data[i].Error[j].Error !== 0) {
								txt = txt + "\nPackage non Inviato: " + data[i].COGNOME + " " + data[i].NOME;
								break;
							}
						}
					}

					for (var i = 0; i < data.length; i++) {

						for (var j = 0; j < data[i].Error.length; j++) {
							if (data[i].Error[j].Error === 1)
								txt1 = txt1 + data[i].Error[j].Piste + ", ";
							if (data[i].Error[j].Error === 2 && data[i].Error[j].gap !== -1) {
								var gapDt = new Date(data[i].Error[j].gap);
								data[i].Error[j].VALE_DAL = new Date(data[i].Error[j].VALE_DAL);
								data[i].Error[j].gap = gapDt.getMonth() - data[i].Error[j].VALE_DAL.getMonth();

								txt2 = txt2 + "" + data[i].Error[j].gap;
							} else if (data[i].Error[j].Error === 2 && data[i].Error[j].gap === -1)
								txt2 = txt2 + ".";

						}
					}
					if (txt1 !== "")
						txt1 = "\nVi sono Obiettivi non valorizzati (" + txt1 + ")" + "\n"; //There are unvalued objectives
					if (txt2 !== "")
						txt2 = "\nNon vi è la copertura delle Basi sul periodo della scheda " + txt2; //There is no coverage of the Bases on the card period
					txt = txt + txt1 + txt2;
					/*	
					var err1 = [],
						tmp = "";
					for (var i = 0; i < scd.length; i++) {
						for (var j = 0; j < scd[i].ID_PISTA.length; j++) {
							for (var ii = 0; ii < data.length; ii++) {
								if (data[ii].Error === 1 && data[ii].Piste === scd[i].ID_PISTA[j])
									tmp = tmp + "," + data[ii].Piste;
							}
						}
						scd[i].Error = "Package non Inviato: " + scd[i].COGNOME + " " + scd[i].NOME + "\nVi sono Obiettivi non valorizzati (" + tmp +
							")";
					}
					console.log(scd);
					var txt = "";
					for (i = 0; i < scd.length; i++)
						txt = txt + scd[i].Error + "\n";
*/
					that.oDialogFragment1 = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.confirm", that.getView().getController());
					that.getView().addDependent(that.oDialogFragment1);
					sap.ui.getCore().byId("warn").setValue(txt);
					//	that.sendPDFToManager(); //sendPDFToManager method sends PDF form to DMS
					sap.ui.getCore().byId("ass").attachPress(that.confirmInvia, this);
					sap.ui.getCore().byId("cont").attachPress(that.continua, this);
					sap.ui.getCore().byId("interrupt").attachPress(that.chiudi, this);
					if (txt !== '') { //If text is blank then cont, interrupt and ass are disabled
						sap.ui.getCore().byId("cont").setEnabled(false);
						sap.ui.getCore().byId("interrupt").setEnabled(false);
						sap.ui.getCore().byId("ass").setEnabled(false);
						//sap.ui.getCore().byId("ass").setEnabled(true);
					} else { //If text is non blank, then ass is enabled to confirmInvia
						sap.ui.getCore().byId("cont").setEnabled(false);
						sap.ui.getCore().byId("interrupt").setEnabled(false);
						sap.ui.getCore().byId("ass").setEnabled(true);
					}
					that.oDialogFragment1.open();
				},
				error: function (data, textStatus1) {

					console.log(data);
				}
			});
		},
		/************************continua function is used to invoke the confirmInvia function for at least
		one ID_SCHEDAPERSONALE else the cont and interrupt are disabled********************************/
		continua: function () {

			var data = final.contArr,
				pck = [];
			for (var i = 0; i < data.length; i++) {
				for (var j = 0; j < data[i].Error.length; j++) {
					if (data[i].Error[j].Error === 0)
						pck.push(data[i].ID_PACKAGEDS);
				}
			}
			var m = {},
				tmp = pck;
			pck = [];
			for (i = 0; i < tmp.length; i++) {
				var v = tmp[i];
				if (!m[v]) {
					pck.push(v);
					m[v] = true;
				}
			}

			if (pck.length === 0) {

				sap.ui.getCore().byId("cont").setEnabled(false);
				sap.ui.getCore().byId("interrupt").setEnabled(false);

			} else {
				change_pck_arr = pck;
				final.confirmInvia();
			}

		},
		/************************confirmInvia function is used to send a request to the backend and complete the request
		Also, sendPDFToManager function is then invoked********************************/
		confirmInvia: function () {

			console.log("confirm invia");
			var that = final;
			var xsoBaseModel = that.getOwnerComponent().getModel("basexsoModel");
			xsoBaseModel.attachRequestSent(function () {
				that._busyDialog.open();
			});
			xsoBaseModel.attachRequestCompleted(function () {
				that._busyDialog.close();
			});
			that.type = "invia";
			that.chiudi();
			//	that.sendMail();
			that.sendPDFToManager();
			that.onSearch(1);

		},
		/************************packageSel function is used to select the partuicular package********************************/
		packageSel: function (oEvent, personale) {

			var data = oMainModel.getData()[1].Main;
			if (oEvent.mParameters.selected === true) {
				this.byId("package").getItemByKey("rendiVisible").setEnabled(true);
				this.byId("package").getItemByKey("rendiNascosto").setEnabled(true);
				this.byId("package").getItemByKey("AnnullaReinvio").setEnabled(true);
				//this.byId("package").getItemByKey("invia").setEnabled(true);
				//this.byId("package").getItemByKey("scegli").setEnabled(true);
				//this.byId("package").getItemByKey("assegnaResp").setEnabled(true);
				//this.byId("package").getItemByKey("assegna").setEnabled(true);
				//this.byId("package").getItemByKey("letter_asseg_change").setEnabled(true);
				this.byId("package").getItemByKey("annullaSel").setEnabled(true);
				this.byId("package").getItemByKey("eliminaScheda").setEnabled(true);
				change_pck_arr.push(personale);
			} else if (oEvent.mParameters.selected === false) {
				for (var i = 0; i < change_pck_arr.length; i++) {
					if (change_pck_arr[i] === personale) {
						change_pck_arr.splice(i, 1);
						break;
					}
				}
				var matr;
				for (var i = 0; i < data.length; i++) {
					if (data[i].ID_PACKAGEDS === personale)
						matr = data[i].MATRICOLA_JR;
				}
				for (var i = 0; i < change_id_arr.length; i++) {
					if (change_id_arr[i] === matr) {
						change_id_arr.splice(i, 1);
						break;
					}
				}
			}
			if (change_pck_arr.length === 0) {
				this.prot = [];
				change_id_arr = [];
				this.byId("package").getItemByKey("rendiVisible").setEnabled(false);
				this.byId("package").getItemByKey("rendiNascosto").setEnabled(false);
				this.byId("package").getItemByKey("AnnullaReinvio").setEnabled(false);
				this.byId("package").getItemByKey("invia").setEnabled(false);
				this.byId("package").getItemByKey("scegli").setEnabled(false);
				this.byId("package").getItemByKey("assegnaResp").setEnabled(false);
				//this.byId("package").getItemByKey("assegna").setEnabled(false);
				this.byId("package").getItemByKey("letter_asseg_change").setEnabled(false);
				this.byId("package").getItemByKey("annullaSel").setEnabled(false);
				this.byId("package").getItemByKey("eliminaScheda").setEnabled(false);
			}

			if (change_pck_arr.length > 0) {
				for (var ii = 0; ii < change_pck_arr.length; ii++) {
					personale = change_pck_arr[ii];
					for (var i = 0; i < data.length; i++) {
						/*	data[i].ID_TIPOTEMPLATE = data[i].ID_TIPOTEMPLATE_MANUALE;
						if(data[i].ID_TIPOTEMPLATE === 0)
						data[i].ID_TIPOTEMPLATE = data[i].ID_TIPOTEMPLATE_AUTOMATICA;
*/
						if (data[i].ID_PACKAGEDS === personale) {
							change_id_arr.push(data[i].MATRICOLA_JR);

							/*if (data[i].ID_PROTOCOLLO !== 0 && data[i].ID_PROTOCOLLO !== "")
								this.byId("package").getItemByKey("sblocca").setEnabled(true);
							else
								this.byId("package").getItemByKey("sblocca").setEnabled(false);*/
							if (data[i].STATODIPENDENTE === "Inattivo")
								this.byId("package").getItemByKey("eliminaStati").setEnabled(true);
							else
								this.byId("package").getItemByKey("eliminaStati").setEnabled(false);
							if (data[i].ID_STATOINVIO === 7 || data[i].ID_STATOINVIO === 11 || data[i].ID_STATOINVIO === 12 || data[i].ID_STATOINVIO ===
								15) { //invia, eliminaScheda, assegnaResp,scegli are enabled based on the conditions of ID_STATOINVIO
								this.byId("package").getItemByKey("invia").setEnabled(true);
								this.byId("package").getItemByKey("eliminaScheda").setEnabled(true);
								this.byId("package").getItemByKey("assegnaResp").setEnabled(true);
								this.byId("package").getItemByKey("scegli").setEnabled(true);

								if (data[i].ID_TIPOTEMPLATE_MANUALE === 2) {
									// If data[i].ID_TIPOTEMPLATE_MANUALE === 2 then letter_consun_change is enabled and letter_asseg_change is disabled 
									//	letter_consun_change is disabled and letter_asseg_change is enabled
									this.byId("package").getItemByKey("letter_consun_change").setEnabled(true);
									this.byId("package").getItemByKey("letter_asseg_change").setEnabled(false);
								} else if (data[i].ID_TIPOTEMPLATE_MANUALE !== 2) {
									this.byId("package").getItemByKey("letter_consun_change").setEnabled(false);
									this.byId("package").getItemByKey("letter_asseg_change").setEnabled(true);
								}
							} else {
								this.byId("package").getItemByKey("assegnaResp").setEnabled(false);
								this.byId("package").getItemByKey("invia").setEnabled(false);
								this.byId("package").getItemByKey("eliminaScheda").setEnabled(false);
								this.byId("package").getItemByKey("letter_consun_change").setEnabled(false);
								this.byId("package").getItemByKey("letter_asseg_change").setEnabled(false);
								this.byId("package").getItemByKey("scegli").setEnabled(false);
							}
							//chiusuraCartacea, invia, eliminaScheda are enabled based on the conditions of ID_TIPOFLOW and ID_STATOINVIO
							if ((data[i].ID_TIPOFLOW === 5 || data[i].ID_TIPOFLOW === 6) && data[i].ID_STATOINVIO === 7) {
								this.byId("package").getItemByKey("chiusuraCartacea").setEnabled(true);
								this.byId("package").getItemByKey("invia").setEnabled(false);
								this.byId("package").getItemByKey("eliminaScheda").setEnabled(true);
							} else if ((data[i].ID_TIPOFLOW === 5 || data[i].ID_TIPOFLOW === 6) && data[i].ID_STATOINVIO !== 7) {
								this.byId("package").getItemByKey("chiusuraCartacea").setEnabled(false);
								this.byId("package").getItemByKey("invia").setEnabled(false);
								this.byId("package").getItemByKey("eliminaScheda").setEnabled(false);
							}

							//annulla sel is enabled/disabled based on the conditions of ID_STATOINVIO and ID_TIPOFLOW
							if ((data[i].ID_STATOINVIO === 8 && (data[i].ID_TIPOFLOW !== 5 || data[i].ID_TIPOFLOW !== 6)) || ((data[i].ID_STATOINVIO ===
									9 ||
									data[i].ID_STATOINVIO === 11) && (data[i].ID_TIPOFLOW === 1 || data[i].ID_TIPOFLOW === 2)) || (data[i].ID_STATOINVIO ===
									7 &&
									(data[i].ID_TIPOFLOW === 5 || data[i].ID_TIPOFLOW === 6)))
								this.byId("package").getItemByKey("annullaSel").setEnabled(true);
							else
								this.byId("package").getItemByKey("annullaSel").setEnabled(false);

							if (data[i].ID_STATOINVIO === 15) // If (ID_STATOINVIO === 15) then InvioPost is enabled
								this.byId("package").getItemByKey("InvioPost").setEnabled(true);
							else
								this.byId("package").getItemByKey("InvioPost").setEnabled(false);

						}
					}
				}
			}
			var d = change_pck_arr,
				m = {};
			change_pck_arr = [];
			for (var i = 0; i < d.length; i++) {
				var v = d[i];
				if (!m[v]) {
					m[v] = true;
					change_pck_arr.push(v);
				}
			}
			var d = change_id_arr,
				m = {};
			change_id_arr = [];
			for (var i = 0; i < d.length; i++) {
				var v = d[i];
				if (!m[v]) {
					m[v] = true;
					change_id_arr.push(v);
				}
			}

			console.log(change_pck_arr);
			console.log(change_id_arr);

		},
		/************************eliminaStati function accesses delete_schedapersonali.xsjs to delete the package based on ID_SCHEDAPERSONALE ********************************/
		eliminaStati: function () {

			var payload = {
				ID_PACKAGEDS: change_pck_arr
			};
			console.log(payload);
			var that = this;
			$.ajax({
				url: "/HANAMDC/STIP/STIPAdmin/services/delete_schedapersonali.xsjs",
				//url: "/HANAMDC/STIP/STIPAdmin/services/test.xsjs",
				type: "POST",
				method: "GET",
				contentType: 'application/json',
				data: {
					odata: JSON.stringify(payload)
				},
				dataType: 'text',
				success: function (data, textStatus1) {

					console.log(data);
					that.assign = 1;
					MessageBox.success("Cancellazione eseguita con successo", { //Success message displayed 'Successfully erased'
						onClose: function (oEvent) {

							console.log("Onclose");
							oMainModel.refresh();
							that.onCloseDialog();
						}
					});
				},
				error: function (data, textStatus1) {

					console.log(data);
					MessageBox.error("Errore durante la modifica dello inattivo schedapersonali"); //Error message displayed 'Error editing personal card inactive'
				}
			});
		},
		/***************************** start of Toolbar  methods****************************************************************/
		/***************************** start of Toolbar seatch operation method*************************************************/
		/************************getFragmentData function is used to ********************************/
		/******************* onTableSearch function is used to search the records in the table
		 based on the search value filter which is present on the Toolbar just above the table ********************/
		onTableSearch: function (oEvent) {
			var sQuery = oEvent.mParameters.query;

			var oTable, aBinding;
			var aFilters = [];
			if (sQuery && sQuery.length > 0) {
				sQuery = sQuery.trim();
				/*aFilters.push(new sap.ui.model.Filter("SID", sap.ui.model.FilterOperator.EQ, sQuery));
				aFilters.push(new sap.ui.model.Filter("MATRICOLA", sap.ui.model.FilterOperator.EQ, sQuery));
				aFilters.push(new sap.ui.model.Filter("NOME", sap.ui.model.FilterOperator.Contains, sQuery));
				aFilters.push(new sap.ui.model.Filter("COGNOME", sap.ui.model.FilterOperator.Contains, sQuery));*/
				sQuery = sQuery.toLowerCase();
				for (var i = 0; i < oMainModel.getData()[1].Main.length; i++) {
					if ((oMainModel.getData()[1].Main[i].SID2 && oMainModel.getData()[1].Main[i].SID2.toLowerCase() === sQuery) || oMainModel.getData()[
							1].Main[i].MATRICOLA_JR.toLowerCase() ===
						sQuery || oMainModel.getData()[1].Main[i].NOME_JR.toLowerCase().includes(sQuery) || oMainModel.getData()[1].Main[i].COGNOME_JR.toLowerCase()
						.includes(sQuery))
						aFilters.push(oMainModel.getData()[1].Main[i]);
				}
				oMainModel.getData()[1].Main = aFilters;
			}
			/*oTable = this.getView().byId("schedaPersonaleTable");
			aBinding = oTable.getBinding("items");
			console.log(aBinding);
			aBinding.filter(new sap.ui.model.Filter({
				filters: aFilters,
				OR: true // OR operator true will check any of the filter conditions get satisfied
			}));*/
			else
				oMainModel.getData()[1].Main = allData;
			oMainModel.refresh();

		},
		/***************************** end of Toolbar search operation method*************************************************/
		/***************************** start of 4.	Azioni sui package selezionati **************************************************/
		/***************************** end of 4. Azioni sui package selezionati **************************************************/
		/***************************** start  of sort operation method*************************************************/
		/************************createViewSettingsDialog function is used to create a popup dialog box for Sort function ********************************/
		createViewSettingsDialog: function (sDialogFragmentName) {
			//	//
			var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
				this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;
				console.log(this.getView().getModel("SchedaPersonaleModel"));
				oDialog.setModel(this.getView().getModel("SchedaPersonaleModel"));
				this.getView().addDependent(oDialog);
				if (Device.system.desktop) {
					oDialog.addStyleClass("sapUiSizeCompact");
				}
			}
			return oDialog;
		},
		/************************handleSortButtonPressed function accesses the sort_SchedaPersonale fragment********************************/
		handleSortButtonPressed: function () {
			this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.sort_SchedaPersonale").open();
		},
		/************************sort function allows the user to sort the data of the schedaPersonaleTable as per the user 
		selected values   either in ascending or descending order********************************/
		sort: function (oEvent) {

			var oTable = this.getView().byId("schedaPersonaleTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];
			sPath = mParams.sortItem.getKey();
			sPath = sPath.split(";");
			console.log(sPath);
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath[0], bDescending));
			oBinding.sort(aSorters);
			oBinding.refresh();
			oTable.getColumns()[sPath[1]].setMergeDuplicates(false);
			oTable.getModel("SchedaPersonaleModel").refresh(true);
			oTable.getColumns()[sPath[1]].setMergeDuplicates(true);
			oTable.getModel("SchedaPersonaleModel").refresh(true);
		},
		/***************************** end  of sort operation method*************************************************/
		/***************************** start of download operation method*************************************************/
		/*******************onDataExport function is used to download the table data in the Excel format********************/
		_getHanaData: function (Entity, Filters) {
			// var xsoDataModelReport = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
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
		onDataExport: async function (oEvent) {

			var that = this,
				f = 0;
			var data = [],
				complete = 0;
			var oFilters = this.oFilters;
			var aFilters = [];
			var data = await this._getHanaData("/V_SchedaPersonale_group", oFilters);
			complete += 1;

			if (data.length > 0) {
				for (var i = 0; i < data.length; i++) {
					if (data[i].SN_MODIFICATA === "N")
						data[i].SN_MODIFICATA = "No";
					else if (data[i].SN_MODIFICATA === "S")
						data[i].SN_MODIFICATA = "Si";
					if (data[i].DATETIME_CR !== null && data[i].DATETIME_CR !== "")
						data[i].DATETIME_CR = Formatter.removetime(data[i].DATETIME_CR);
					if (data[i].DATETIME_CR) {
						if (data[i].DATETIME_CR.includes("-"))
							data[i].DATETIME_CR = "";
					}
					if (data[i].ID_LETTERE_MANUALE === 0 || data[i].ID_LETTERE_MANUALE === null)
						data[i].LETTERE_DESCRIZIONE_MANUALE = "";
					if (data[i].ID_LETTERE_AUTOMATICA === 0 || data[i].ID_LETTERE_AUTOMATICA === null)
						data[i].LETTERE_DESCRIZIONE_AUTOMATICA = "";
					/*if (data[i].ID_STATOINVIO === 10)
						data[i].DESCR_STATOINVIO = "Accettato";*/
					var sdate = data[i].INIZIO_ASSEGNAZIONE,
						edate = data[i].FINE_ASSEGNAZIONE;
					if (sdate !== null && sdate !== undefined && sdate !== "" && edate !== null && edate !== undefined && edate !== "") {
						if (typeof (sdate) === "string" && sdate.includes("Date")) {
							sdate = new Date(parseInt(sdate.substring(6, sdate.length - 2), 10));
							edate = new Date(parseInt(edate.substring(6, edate.length - 2), 10));
						}
						sdate = Formatter.months(sdate.getMonth() + 1) + " " + sdate.getFullYear();
						edate = Formatter.months(edate.getMonth() + 1) + " " + edate.getFullYear();

					} else {
						sdate = "";
						edate = "";
					}
					data[i].INIZIO_ASSEGNAZIONE = sdate;
					data[i].FINE_ASSEGNAZIONE = edate;
					var edate1 = oMainModel.getData()[0].Filter[21].Month[12].month;
					var sdate1 = oMainModel.getData()[0].Filter[21].Month[1].month;
				}
				var data11 = data;
				var m = {};
				data = [];
				for (var i = 0; i < data11.length; i++) {
					if (data11[i].MATRICOLA !== "") {
						data11[i].SID2 = data11[i].SID;
						data11[i].MATRICOLA_JR = data11[i].MATRICOLA;
						data11[i].NOME_JR = data11[i].NOME;
						data11[i].COGNOME_JR = data11[i].COGNOME;
						data11[i].BB_JR = data11[i].BAND;
					}

					var v = data11[i],
						vv;

					vv = data11[i].MATRICOLA_JR + ":" + data11[i].ID_PACKAGEDS;
					//vv = data11[i].ID_SCHEDAPERSONALE;

					if (data11[i].INIZIO_ASSEGNAZIONE === "" || data11[i].INIZIO_ASSEGNAZIONE.split(" ")[1].includes("-"))
						data11[i].INIZIO_ASSEGNAZIONE = "";
					if (data11[i].FINE_ASSEGNAZIONE === "" || data11[i].FINE_ASSEGNAZIONE.split(" ")[1].includes("-"))
						data11[i].FINE_ASSEGNAZIONE = "";

					if (data11[i].SN_SCHEDAGESTIONALE === "S")
						data11[i].DESCR_SCHEDA = "Scheda Gestionale" + data11[i].PERC_GESTIONALE + "%";
					if (data11[i].SN_INATTIVO === "S") {
						data11[i].STATODIPENDENTE = "Inattivo";
						data11[i].ID_PROTOCOLLO = "";
					}

					if (!m[vv]) {
						data.push(v);
						m[vv] = true;
					}

				}
			}
			that.data = data;

			var tmp = [],
				val_tmp;
			for (var i = 0; i < oFilters.length; i++) {
				if (oFilters[i].sPath === undefined) {

					for (var ii = 0; ii < oFilters[i].aFilters.length; ii++) {
						if (oFilters[i].aFilters[ii].sPath === "COGNOME_MGR" || oFilters[i].aFilters[ii].sPath === "NOME_MGR") {
							f = 1;
							//val_tmp = "'" + oFilters[i].aFilters[ii].oValue1.toUpperCase() + "'";
							//tmp.push(new sap.ui.model.Filter(oFilters[i].aFilters[ii].sPath, sap.ui.model.FilterOperator.Contains, val_tmp));
							tmp.push(oFilters[i].aFilters[ii]);

						}
					}

					var ofilter5 = new sap.ui.model.Filter({
						filters: tmp,
						and: false
					});
					aFilters.push(ofilter5);

				}

				if (oFilters[i].sPath === "SID" || oFilters[i].sPath === "MATRICOLA" || oFilters[i].sPath === "COGNOME" || oFilters[i].sPath ===
					"NOME" || oFilters[i].sPath === "STATUS_DIPENDENTE" || oFilters[i].sPath === "QUALIFICA" || oFilters[i].sPath ===
					"SOCIETA" || oFilters[i].sPath === "BAND") {

					if (oFilters[i].sPath === "SID")
						oFilters[i].sPath = "SUPERID";

					aFilters.push(oFilters[i]);

					f = 1;

				}

			}
			var oModel = data;
			console.log(oModel);

			oResource = that.getView().getModel("i18n").getResourceBundle();
			var columnTemplate = [
				[{
						column: 'SID',
						label: oResource.getText("sID")
					}, {
						column: 'MATRICOLA',
						label: oResource.getText("matricola")
					}, {
						column: 'COGNOME',
						label: oResource.getText("cognome")
					}, {
						column: 'NOME',
						label: oResource.getText("nome")
					}, {
						column: 'BAND',
						label: oResource.getText("broadbanding")
					}, {
						column: 'DIREZIONE',
						label: oResource.getText("codice_direzione")
					}, {
						column: 'DESCRIZIONET200',
						label: oResource.getText("direzione")
					}, {
						column: 'ID_DIPARTIMENTO',
						label: oResource.getText("codice_dipartimento")
					}, {
						column: 'DIP_DESCR',
						label: oResource.getText("Dipartimento")
					}, {
						column: 'DESCR_SCHEDA',
						label: "Package"
					}, {
						column: 'INIZIO_ASSEGNAZIONE',
						label: oResource.getText("DAL")
					}, {
						column: 'FINE_ASSEGNAZIONE',
						label: oResource.getText("AL")
					}, {
						column: 'RespDiretto',
						label: oResource.getText("RespDiretto")
					}
					/*, {
												column: 'RespHr',
												label: oResource.getText("RespHr")
											}*/
					, {
						column: 'ID_PROTOCOLLO',
						label: oResource.getText("Protocollo")
					}, {
						column: 'ID_SCHEDAMASTER',
						label: oResource.getText("Id")
					}, {
						column: 'FLOW',
						label: oResource.getText("Flow")
					}, {
						column: 'DESCR_STATOINVIO',
						label: oResource.getText("Status")
					}, {
						column: 'LETTERE_DESCRIZIONE_AUTOMATICA',
						label: oResource.getText("NomeTemplateAuto")
					}, {
						column: 'LETTERE_DESCRIZIONE_MANUALE',
						label: oResource.getText("NomeTemplate")
					}, {
						column: 'SN_MODIFICATA',
						label: oResource.getText("TemplateModificato")
					}
				]
			];
			var data = [];
			var data1 = {};
			for (var i = 0; i < oModel.length; i++) {

				if (oModel[i].SID === null || oModel[i].SID === undefined || oModel[i].SID === "")
					oModel[i].SID = oModel[i].SID2;
				if (oModel[i].MATRICOLA === null || oModel[i].MATRICOLA === undefined || oModel[i].MATRICOLA === "")
					oModel[i].MATRICOLA = oModel[i].MATRICOLA_JR;
				if (oModel[i].COGNOME === null || oModel[i].COGNOME === undefined || oModel[i].COGNOME === "")
					oModel[i].COGNOME = oModel[i].COGNOME_JR;
				if (oModel[i].NOME === null || oModel[i].NOME === undefined || oModel[i].NOME === "")
					oModel[i].NOME = oModel[i].NOME_JR;
				if (oModel[i].BAND === null || oModel[i].BAND === undefined)
					oModel[i].BAND = "";
				if (oModel[i].DIREZIONE === null || oModel[i].DIREZIONE === undefined)
					oModel[i].DIREZIONE = "";
				if (oModel[i].DESCRIZIONET200 === null || oModel[i].DESCRIZIONET200 === undefined)
					oModel[i].DESCRIZIONET200 = "";
				if (oModel[i].ID_DIPARTIMENTO === null || oModel[i].ID_DIPARTIMENTO === undefined)
					oModel[i].ID_DIPARTIMENTO = "";
				if (oModel[i].DIP_DESCR === null || oModel[i].DIP_DESCR === undefined)
					oModel[i].DIP_DESCR = "";
				if (oModel[i].DESCR_SCHEDA === null || oModel[i].DESCR_SCHEDA === undefined)
					oModel[i].DESCR_SCHEDA = "";
				if (oModel[i].INIZIO_ASSEGNAZIONE === null || oModel[i].INIZIO_ASSEGNAZIONE === undefined)
					oModel[i].INIZIO_ASSEGNAZIONE = "";
				if (oModel[i].FINE_ASSEGNAZIONE === null || oModel[i].FINE_ASSEGNAZIONE === undefined)
					oModel[i].FINE_ASSEGNAZIONE = "";
				if (oModel[i].COGNOME_MGR === null || oModel[i].COGNOME_MGR === undefined)
					oModel[i].COGNOME_MGR = "";
				if (oModel[i].NOME_MGR === null || oModel[i].NOME_MGR === undefined)
					oModel[i].NOME_MGR = "";
				if (oModel[i].COGNOME_HR === null || oModel[i].COGNOME_HR === undefined)
					oModel[i].COGNOME_HR = "";
				if (oModel[i].NOME_HR === null || oModel[i].NOME_HR === undefined)
					oModel[i].NOME_HR = "";
				if (oModel[i].ID_PROTOCOLLO === null || oModel[i].ID_PROTOCOLLO === undefined)
					oModel[i].ID_PROTOCOLLO = "";
				if (oModel[i].ID_SCHEDAMASTER === null || oModel[i].ID_SCHEDAMASTER === undefined)
					oModel[i].ID_SCHEDAMASTER = "";
				if (oModel[i].FLOW === null || oModel[i].FLOW === undefined)
					oModel[i].FLOW = "";
				if (oModel[i].DESCR_STATOINVIO === null || oModel[i].DESCR_STATOINVIO === undefined)
					oModel[i].DESCR_STATOINVIO = "";
				if (oModel[i].LETTERE_DESCRIZIONE_AUTOMATICA === null || oModel[i].LETTERE_DESCRIZIONE_AUTOMATICA === undefined)
					oModel[i].LETTERE_DESCRIZIONE_AUTOMATICA = "";
				if (oModel[i].LETTERE_DESCRIZIONE_MANUALE === null || oModel[i].LETTERE_DESCRIZIONE_MANUALE === undefined)
					oModel[i].LETTERE_DESCRIZIONE_MANUALE = "";
				if (oModel[i].SN_MODIFICATA === null || oModel[i].SN_MODIFICATA === undefined)
					oModel[i].SN_MODIFICATA = "";

				data1 = {
					"ID_SCHEDAMASTER": oModel[i].ID_SCHEDAMASTER,
					"SID": oModel[i].SID,
					"MATRICOLA": oModel[i].MATRICOLA,
					"COGNOME": oModel[i].COGNOME,
					"NOME": oModel[i].NOME,
					"BAND": oModel[i].BAND,
					"DIREZIONE": oModel[i].DIREZIONE,
					"DESCRIZIONET200": oModel[i].DESCRIZIONET200,
					"ID_DIPARTIMENTO": oModel[i].ID_DIPARTIMENTO,
					"DIP_DESCR": oModel[i].DIP_DESCR,
					"DESCR_SCHEDA": oModel[i].DESCR_SCHEDA,
					"INIZIO_ASSEGNAZIONE": oModel[i].INIZIO_ASSEGNAZIONE,
					"FINE_ASSEGNAZIONE": oModel[i].FINE_ASSEGNAZIONE,
					"RespDiretto": oModel[i].COGNOME_MGR + " " + oModel[i].NOME_MGR,
					"RespHr": oModel[i].COGNOME_HR + " " + oModel[i].NOME_HR,
					"ID_PROTOCOLLO": oModel[i].ID_PROTOCOLLO,
					"FLOW": oModel[i].FLOW,
					"DESCR_STATOINVIO": oModel[i].DESCR_STATOINVIO,
					"LETTERE_DESCRIZIONE_AUTOMATICA": oModel[i].LETTERE_DESCRIZIONE_AUTOMATICA,
					"LETTERE_DESCRIZIONE_MANUALE": oModel[i].LETTERE_DESCRIZIONE_MANUALE,
					"SN_MODIFICATA": oModel[i].SN_MODIFICATA
				}
				data.push(data1);
			}
			var obj = {}
			obj.results = data;
			console.log(obj);
			tablesToExcel(obj, ['SchedaPersonale'], columnTemplate, 'SchedaPersonale.xls', 'Excel');

			// oFilters.pop();
		},
		/***************************** end of download operation method*************************************************/
		/***************************** start of PDF dynamic table 3.1.4 *************************************************/
		/************************openPdfDetails1 function is used to fetch the text  and create Scheda_di_Assegnazione_Obiettivi PDF file********************************/
		openPdfDetails1: function (id, pers) {

			var oResource = this.getView().getModel("i18n").getResourceBundle();
			var i;
			var header = "<head><center><h3>" + "STIP" +
				"</h3></center><br><center><caption>Scheda di Assegnazione Obiettivi</caption></center></head>" +
				"<style type='text/css'>" +
				"</style></head>";
			var table1 =
				"<table style='border-collapse:collapse;border:1px solid black;' width='100%'><tr>" +
				"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Assegnata") + "</th>" +
				"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Matricola") + "</th>" +
				"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Ruolo") + "</th></tr>";
			var table2 =
				"<table style='border-collapse:collapse;border:1px solid black;' width='100%'><tr>" +
				"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("N") + "</th>" +
				"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Peso") + "</th>" +
				"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Descrizione") + "</th>" +
				"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Target") + "</th>" +
				"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Note") + "</th>" +
				"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("RisultatoFinale") + "</th>" +
				"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("InSulTarget") + "</th>" +
				"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("TipoScalaValorizzazione") + "</th>" +
				"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Risultato") + "</th>" +
				"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("RisultatoPonderato") + "</th></tr>";
			var table4 =
				"<table><tr>" +
				"<th style='font-size: 12px;'>" + oResource.getText("da") + "</th>" +
				"<th style='font-size: 12px;'>" + oResource.getText("aa") + "</th></tr>";

			var mgr1, mgr2;
			for (var i = 0; i < oMainModel.getData()[1].Main.length; i++) {
				if (oMainModel.getData()[1].Main[i].ID_PACKAGEDS === pers) {
					table1 += "<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" +
						oMainModel.getData()[
							1].Main[i].COGNOME_JR + " " + oMainModel.getData()[1].Main[i].NOME_JR +
						"</td>" +
						"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + oMainModel.getData()[
							1]
						.Main[i].MATRICOLA_JR +
						"</td>" +
						"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + oMainModel.getData()[
							1]
						.Main[i].PERS_RUOLO +
						"</td>";
					table4 += "<td style='font-size: 12px;'>" + oMainModel.getData()[1].Main[i].INIZIO_ASSEGNAZIONE + "</td>" +
						"<td style='font-size: 12px;'>" + oMainModel.getData()[1].Main[i].FINE_ASSEGNAZIONE + "</td></tr></table>";

					mgr1 = oMainModel.getData()[1].Main[i].PERS_MGR_COGNOME + " " + oMainModel.getData()[1].Main[i].PERS_MGR_NOME;
					mgr2 = oMainModel.getData()[1].Main[i].COGNOME_MGR + " " + oMainModel.getData()[1].Main[i].NOME_MGR;

					break;
				}
			}
			table1 = table1 + "</tr><tr></tr></table>";

			/*var table3 = "<p>" + oResource.getText("Note") + ":  " + "</p>" + "<p>" + oResource.getText("RespDiretto") + ":  " + mgr1 + "</p>" +
							"<p>" + oResource.getText("Accettazione") + ":  " + mgr2 + "</p>";
			*/
			var table3 = "<p>" + oResource.getText("Note") + ":  " + "</p>" + "<p>" + oResource.getText("RespDiretto") + ":  " + "" +
				"</p>" +
				"<p>" + oResource.getText("Accettazione") + ":  " + "" + "</p>";
			var scheda = [];
			for (var i = 0; i < oMainModel.getData()[2].Fragment[1].Data.length; i++) {
				if (oMainModel.getData()[2].Fragment[1].Data[i].ID_SCHEDAMASTER === id)
					scheda.push(oMainModel.getData()[2].Fragment[1].Data[i]);
			}

			var j, pon = 0;
			for (i = 0; i < scheda.length; i++) {
				j = i + 1;
				pon = pon + parseFloat(scheda[i].PERC_RAGG_MBO);
				table2 += '<tr>'
				table2 += "<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + j +
					"</td>" +
					"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + scheda[i].PESO +
					"%" +
					"</td>" +
					"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + scheda[i].DESCR_PISTA +

					"</td>" +
					"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + scheda[i].OBIETTIVO +
					"</td>" +
					"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + scheda[i].NOTE +
					"</td>" +
					"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + scheda[i].CONSUNTIVO +
					"</td>" +
					"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + parseInt(scheda[i]
						.OBIETTIVO,
						10) + "%" +
					"</td>" +
					"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + scheda[i].DESCR_CURVA +
					"</td>" +
					"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + scheda[i].PERC_RAGG_OBIETTIVO +
					"</td>" +
					"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + scheda[i].PERC_RAGG_MBO +
					"</td>";
				table2 += '</tr>'
			}

			table2 += "</table>";
			table3 = table3 + "<p>" + oResource.getText("RaggiungimentoObiettivo") + ":  " + pon + "%" + "</p>";

			var body = header + table4 + table1 + table2 + table3;
			var opt = {
				margin: 1,
				filename: 'Scheda_di_Assegnazione_Obiettivi.pdf',
				image: {
					type: 'jpeg',
					quality: 1
				},
				html2canvas: {
					scale: 2
				},
				jsPDF: {
					unit: 'in',
					format: 'letter',
					orientation: 'portrait'
				}
			};
			var pages = [body];
			var doc = html2pdf().set(opt).from(pages[0]).toPdf()
			for (var j = 1; j < pages.length; j++) {
				doc = doc.get('pdf').then(
					pdf => {
						pdf.addPage()
					}
				).from(pages[j]).toContainer().toCanvas().toPdf()
			}
			doc.save();
		},

		/***************************** end of PDF dynamic table 3.1.4 *************************************************/
		/***************************** start of PDF generataion 1. temaplte lettre 2. dynamic table 3. graphs*************************************************/
		/************************openPdfDetails function is used to access getCurva.xsjs and fetch the curveDetailsData
		(ID_CURVA, ID_TIPO_CURVA,DESCR_CURVA) on passing idLettreAuto, idLettreManual, idSchedaMaster, pers, idProtocolla, flagOnlySendPDF as input parameters********************************/
		openPdfDetails: function (idLettreAuto, idLettreManual, idSchedaMaster, pers, idProtocolla, flagOnlySendPDF) {

			if (idProtocolla === undefined)
				idProtocolla = "";
			console.log(idLettreAuto + idLettreManual + idSchedaMaster + pers + idProtocolla + flagOnlySendPDF);
			var curveData = [];
			var curveDetailsData = {};
			for (var i = 0; i < oMainModel.getData()[2].Fragment[1].Data.length; i++) {
				if (oMainModel.getData()[2].Fragment[1].Data[i].ID_SCHEDAMASTER === idSchedaMaster) {

					curveDetailsData = {
						"ID_CURVA": oMainModel.getData()[2].Fragment[1].Data[i].ID_CURVA,
						"ID_TIPO_CURVA": oMainModel.getData()[2].Fragment[1].Data[i].ID_TIPO_CURVA,
						"DESCR_CURVA": oMainModel.getData()[2].Fragment[1].Data[i].DESCR_CURVA
					}
					curveData.push(curveDetailsData);
				}

			}

			var res;
			var id_tempLettre = 0;

			if (idLettreManual === 0) //(If idLettreManual === 0 then id_tempLettre is Auto id else it is Manual id)
				id_tempLettre = idLettreAuto === undefined ? "" : idLettreAuto
			else
				id_tempLettre = idLettreManual === undefined ? "" : idLettreManual;
			if (id_tempLettre === "" || id_tempLettre === null)
				id_tempLettre = 0;
			console.log(id_tempLettre);
			curveData = this.remove_DuplicatesCurve(curveData);
			var that = final;
			var payload = {
				"ID_CURVA": curveData
			};
			$.ajax({
				url: "/HANAMDC/STIP/STIPAdmin/services/getCurva.xsjs",
				type: "POST",
				method: "GET",
				contentType: 'application/json',
				dataType: 'text',
				data: {
					odata: JSON.stringify(payload)
				},
				success: function (data, textStatus1) {
					//	
					data = JSON.parse(data);
					var res = [];
					for (var j = 0; j < curveData.length; j++) {
						for (var i = 0; i < data.length; i++) {
							if (data[i].ID_CURVA === curveData[j].ID_CURVA)
								res.push(data[i]);
						}
						curveData[j].RISULTATO = res;
						res = [];
					}
					console.log("scheda master" + idSchedaMaster + "---------------" + "curveData" + curveData);
					that._GetLetteraHtml(id_tempLettre, idSchedaMaster, curveData, pers, idProtocolla, flagOnlySendPDF);

				},
				error: function (data, textStatus1) {
					//	

				}
			});
		},

		/************************remove_DuplicatesCurve function is used to remove duplicate CURVE_IDs ********************************/
		remove_DuplicatesCurve: function (data2) {
			//
			var data11 = data2;
			var duplicateArray = [],
				arrGruppoDesc = [],
				tmpMaxPayout = [];
			for (var i = 0; i < data11.length; i++) {
				//**********************start of removing duplicate ID_CURVA**************************
				if (data11[i].ID_CURVA !== null && data11[i].ID_CURVA !== "") {
					var ID_CURVA = data11[i].ID_CURVA;
					var ID_TIPO_CURVA = data11[i].ID_TIPO_CURVA;
					var DESCR_CURVA = data11[i].DESCR_CURVA;
					if (!duplicateArray[ID_CURVA]) {
						tmpMaxPayout = {
							"ID_CURVA": ID_CURVA,
							"ID_TIPO_CURVA": ID_TIPO_CURVA,
							"DESCR_CURVA": DESCR_CURVA
						};
						duplicateArray[ID_CURVA] = true;
						console.log(tmpMaxPayout);
						arrGruppoDesc.push(tmpMaxPayout);
					}
				}
			}
			//**********************end of removing duplicate ID_CURVA**************************
			return arrGruppoDesc;
		},
		/************************convertIdTipoToDesc function is used to return the description of the Curve
		(Lineare, Discreta, DiscretaRapportoPercentuale, LineareConsuntivo) based on the Curve_Id********************************/
		convertIdTipoToDesc: function (sValue) {
			if (sValue === "" || sValue === undefined || sValue === null)
				return "";

			if (sValue == 1)
				return "LINEARE";
			if (sValue == 2)
				return "DISCRETA";
			if (sValue == 3)
				return "DiscretaRapportoPercentuale";
			if (sValue == 4)
				return "LineareConsuntivo";

		},
		// : retrieve the currente file name
		_GetLetteraHtml: async function (sid, idSchedaMaster, curveData, pers, idProtocolla, flagOnlySendPDF) {
			console.log(curveData);
			var oResource = this.getView().getModel("i18n").getResourceBundle();
			//Get file name from DB TEMPLATELETTERE.BODYTEMPLATE
			var that = this;
			//	
			var oFilters = [];
			oFilters.push(new sap.ui.model.Filter("ID_TEMPLATELETTERA", sap.ui.model.FilterOperator.EQ, sid));
			var bodyText = await this.getTemplateLetterPromise(oFilters, 0);
			var result = "";
			if (bodyText === "TemplateLettere-bodytemplate-0.txt") ////No template
				result = "";
			else
				result = await RepoService.getFiles(bodyText, "TEMPLATE_LETTERA");

			if (result === undefined)
				MessageBox.error("Scusate. File non trovato!"); //Error message displayed 'Sorry. File not found!'
			else {
				var opt = {
					margin: 1,
					filename: 'Invia_al_Manager.pdf',
					image: {
						type: 'jpeg',
						quality: 1
					},
					html2canvas: {
						scale: 2
					},
					jsPDF: {
						unit: 'in',
						format: 'letter',
						orientation: 'portrait'
					}
				};
				//1.start of PDF generation scheda persoanle 1st part template lettre
				var htmlTemplate = "";
				if (result === "") //No template
				{
					flagNoTempleteDisplay = true;
					//htmlTemplate = "";
				} else { //when template body is present
					flagNoTempleteDisplay = false;
					htmlTemplate = document.createElement('div');

					for (var i = 0; i < oMainModel.getData()[1].Main.length; i++) {
						if (oMainModel.getData()[1].Main[i].ID_PACKAGEDS === pers) {
							var n = result.lastIndexOf("[Egregio Sig/ Gent. Sig.ra]");
							var sub0 = result.substring(0, n);
							var sub1 = result.substring(n, result.length);
							var newString = sub0 + sub1;
							var replacedStringInMgr = newString.replace("[Egr.Sig/Gent.Sig.ra]", oMainModel.getData()[1].Main[i].SESSO);
							replacedStringInMgr = replacedStringInMgr.replace("[Cognome]", oMainModel.getData()[1].Main[i].COGNOME_JR);
							replacedStringInMgr = replacedStringInMgr.replace("[Nome]", oMainModel.getData()[1].Main[i].NOME_JR);
							replacedStringInMgr = replacedStringInMgr.replace("[Data]", Formatter.removetime(oMainModel.getData()[1].Main[i].DATALETTERA));
							replacedStringInMgr = replacedStringInMgr.replace("[Recapito]", oMainModel.getData()[1].Main[i].INDIRIZZO_REC + "\n" +
								oMainModel.getData()[
									1].Main[i].CAP_REC + " " + oMainModel.getData()[1].Main[i].COMUNE_REC + " (" + oMainModel.getData()[1].Main[i].PROVINCIA_REC +
								")");
							if (oMainModel.getData()[1].Main[i].Importo_Scheda === null && oMainModel.getData()[1].Main[i].BaseMBO === null)
								replacedStringInMgr = replacedStringInMgr.replace("[% Risultato]", 0);
							else
								replacedStringInMgr = replacedStringInMgr.replace("[% Risultato]", oMainModel.getData()[1].Main[i].Importo_Scheda * 100 /
									oMainModel.getData()[
										1].Main[i].BaseMBO);

							replacedStringInMgr = replacedStringInMgr.replace("[Mese Liquidazione]", Formatter.months(oMainModel.getData()[1].Main[i].dataPagamento
								.getMonth() + 1));
							replacedStringInMgr = replacedStringInMgr.replace("[Ragione Sociale]", oMainModel.getData()[1].Main[i].FIRMACOMPANY);
							replacedStringInMgr = replacedStringInMgr.replace("[Titolo]", oMainModel.getData()[1].Main[i].TITOLO);
							replacedStringInMgr = replacedStringInMgr.replace("[Periodo Riferimento]", Formatter.months(oMainModel.getData()[1].Main[i]
								.VALE_DAL_PERIODI
								.getMonth() + 1) + " " + oMainModel.getData()[1].Main[i].VALE_DAL_PERIODI.getFullYear() + " - " + Formatter.months(
								oMainModel
								.getData()[1].Main[i].VALE_AL_PERIODI.getMonth() + 1) + " " + oMainModel.getData()[1].Main[i].VALE_AL_PERIODI.getFullYear());
							replacedStringInMgr = replacedStringInMgr.replace("[Fine FY]", Formatter.removetime(oMainModel.getData()[1].Main[i].VALE_AL_PERIODI));
							replacedStringInMgr = replacedStringInMgr.replace("[FY]", oMainModel.getData()[1].Main[i].VALE_DAL_PERIODI.getFullYear() +
								" - " +
								oMainModel.getData()[1].Main[i].VALE_AL_PERIODI.getFullYear());
							if (oMainModel.getData()[1].Main[i].Inizio_Assegnazione_CS === null && oMainModel.getData()[1].Main[i].Fine_Assegnazione_CS ===
								null)
								replacedStringInMgr = replacedStringInMgr.replace("[Periodo Scheda associata]", "");
							else
								replacedStringInMgr = replacedStringInMgr.replace("[Periodo Scheda associata]", Formatter.months(oMainModel.getData()[1].Main[
											i]
										.Inizio_Assegnazione_CS
										.getMonth() + 1) + " " + oMainModel.getData()[1].Main[i].Inizio_Assegnazione_CS.getFullYear() + " - " + Formatter.months(
										oMainModel
										.getData()[1].Main[i].Fine_Assegnazione_CS.getMonth() + 1) + " " + oMainModel.getData()[1].Main[i].Fine_Assegnazione_CS
									.getFullYear());
							replacedStringInMgr = replacedStringInMgr.replace("[Inizio ProQuota]", Formatter.removetime(oMainModel.getData()[1].Main[i]
								.Inizio_Assegnazione_CS));
							replacedStringInMgr = replacedStringInMgr.replace("[Importo 1°Semestre]", oMainModel.getData()[1].Main[i].Importo_Scheda);

						}
					}
					//	
					htmlTemplate.innerHTML = replacedStringInMgr;

				}

				//1.end  of PDF generation scheda persoanle 1st part template lettre

				//2.start of PDF generation scheda persoanle 2nd part TABLE
				var htmlTable1 = document.createElement('div');

				var oResource = this.getView().getModel("i18n").getResourceBundle();
				var i;
				var header = "<head><center><h3>" + "STIP" +
					"</h3></center><br><center><caption>Scheda di Assegnazione Obiettivi</caption></center></head>" +
					"<style type='text/css'>" +
					"</style></head>";
				var table1 =
					"<table style='border-collapse:collapse;border:1px solid black;' width='100%'><tr>" +
					"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Assegnata") + "</th>" +
					"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Matricola") + "</th>" +
					"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Ruolo") + "</th></tr>";
				var table2 =
					"<table style='border-collapse:collapse;border:1px solid black;' width='100%'><tr>" +
					"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("N") + "</th>" +
					"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Peso") + "</th>" +
					"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Descrizione") + "</th>" +
					"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Target") + "</th>" +
					"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Note") + "</th>" +
					"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("RisultatoFinale") + "</th>" +
					"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("InSulTarget") + "</th>" +
					"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("TipoScalaValorizzazione") + "</th>" +
					"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("Risultato") + "</th>" +
					"<th width='10%' style='border:1px solid black;font-size: 12px;'>" + oResource.getText("RisultatoPonderato") + "</th></tr>";
				var table4 =
					"<table><tr>" +
					"<th style='font-size: 12px;'>" + oResource.getText("da") + "</th>" +
					"<th style='font-size: 12px;'>" + oResource.getText("aa") + "</th></tr>";

				var mgr1, mgr2;
				for (var i = 0; i < oMainModel.getData()[1].Main.length; i++) {
					if (oMainModel.getData()[1].Main[i].ID_PACKAGEDS === pers) {
						table1 += "<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" +
							oMainModel.getData()[
								1].Main[i].COGNOME_JR + " " + oMainModel.getData()[1].Main[i].NOME_JR +
							"</td>" +
							"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + oMainModel.getData()[
								1]
							.Main[i].MATRICOLA_JR +
							"</td>" +
							"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + oMainModel.getData()[
								1]
							.Main[i].PERS_RUOLO +
							"</td>";
						table4 += "<td style='font-size: 12px;'>" + oMainModel.getData()[1].Main[i].INIZIO_ASSEGNAZIONE + "</td>" +
							"<td style='font-size: 12px;'>" + oMainModel.getData()[1].Main[i].FINE_ASSEGNAZIONE + "</td></tr></table>";

						mgr1 = oMainModel.getData()[1].Main[i].PERS_MGR_COGNOME + " " + oMainModel.getData()[1].Main[i].PERS_MGR_NOME;
						mgr2 = oMainModel.getData()[1].Main[i].COGNOME_MGR + " " + oMainModel.getData()[1].Main[i].NOME_MGR;

						break;
					}
				}
				table1 = table1 + "</tr><tr></tr></table>";

				/*var table3 = "<p>" + oResource.getText("Note") + ":  " + "</p>" + "<p>" + oResource.getText("RespDiretto") + ":  " + mgr1 + "</p>" +
					"<p>" + oResource.getText("Accettazione") + ":  " + mgr2 + "</p>";*/
				var table3 = "<p>" + oResource.getText("Note") + ":  " + "</p>" + "<p>" + oResource.getText("RespDiretto") + ":  " + "" +
					"</p>" +
					"<p>" + oResource.getText("Accettazione") + ":  " + "" + "</p>";

				var scheda = [];
				for (var i = 0; i < oMainModel.getData()[2].Fragment[1].Data.length; i++) {
					if (oMainModel.getData()[2].Fragment[1].Data[i].ID_SCHEDAMASTER === idSchedaMaster)
						scheda.push(oMainModel.getData()[2].Fragment[1].Data[i]);
				}

				var j, pon = 0;
				for (i = 0; i < scheda.length; i++) {
					j = i + 1;
					pon = pon + parseFloat(scheda[i].PERC_RAGG_MBO);
					table2 += '<tr>'
					table2 += "<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + j +
						"</td>" +
						"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + scheda[i].PESO +
						"%" +
						"</td>" +
						"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + scheda[i].DESCR_PISTA +

						"</td>" +
						"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + scheda[i].OBIETTIVO +
						"</td>" +
						"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + scheda[i].NOTE +
						"</td>" +
						"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + scheda[i].CONSUNTIVO +
						"</td>" +
						"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + parseInt(scheda[i]
							.OBIETTIVO,
							10) + "%" +
						"</td>" +
						"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + scheda[i].DESCR_CURVA +
						"</td>" +
						"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + scheda[i].PERC_RAGG_OBIETTIVO +
						"</td>" +
						"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 12px;'>" + scheda[i].PERC_RAGG_MBO +
						"</td>";
					table2 += '</tr>'
				}

				table2 += "</table>";
				table3 = table3 + "<p>" + oResource.getText("RaggiungimentoObiettivo") + ":  " + pon + "%" + "</p>";

				var body = header + table4 + table1 + table2 + table3;
				htmlTable1.innerHTML += header + table4 + table1 + table2 + table3;

				//2.end of PDF generation scheda persoanle 2nd part TABLE
				//3. start of PDF generation scheda persoanle 3rd part graphs GRAFICO
				var curvePDFStore = [];

				for (var i = 0; i < curveData.length; i++) {

					var table1 =
						"<table width='50%' align = 'center'>" + "<tr>" +
						"<th width='10%'></th>" +
						"<th width='10%' style='border:1px solid black;font-size: 14px;background-color:red;height:50px;color:white;'>" + oResource
						.getText(
							"Payout") +
						"</th>";

					for (var j = 0; j < curveData[i].RISULTATO.length; j++)

						table1 +=
						"<th width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 14px;background-color:red;height:50px;color:white;'>" +
						curveData[i].RISULTATO[j].PERC_MBO + "%" +
						"</th>";
					table1 = table1 + "</tr><tr>";
					table1 = table1 +
						"<td width='10%' style='border:1px solid black;font-size: 14px;background-color:red;height:50px;color:white;'>" + oResource
						.getText(
							"Performance") + "</td>" +
						"<td width='10%' style='border:1px solid black;font-size: 14px;font-weight:bold;height:50px;'>" + curveData[i].DESCR_CURVA +
						"</td>";

					for (var j = 0; j < curveData[i].RISULTATO.length; j++)
						table1 +=
						"<td width='10%' style='border:1px solid black;padding-left: 5px;padding-right: 5px;font-size: 14px;font-weight:bold;'>" +
						curveData[i].RISULTATO[j].VALORE_CURVA + "%" +
						"</td>";

					table1 = table1 + "</tr></table><br/><br/>";
					var htmlTable = document.createElement('div');
					htmlTable.innerHTML += table1;

					var bodyText1 = "CURVA--" + this.convertIdTipoToDesc(curveData[i].ID_TIPO_CURVA) + "--" + curveData[i].ID_CURVA + ".txt";
					console.log(bodyText1);
					try {
						var sSVG = await RepoService.getFiles(bodyText1, "CURVE_DOC");
						console.log(sSVG);

						sSVG = sSVG.replace(/translate /gm, "translate");

						//Step 2: Create Canvas html Element to add SVG content
						var oCanvasHTML = document.createElement("canvas");

						canvg(oCanvasHTML, sSVG); // add SVG content to Canvas

						var htmlTemplateGrafico = document.createElement('div');
						htmlTemplateGrafico.appendChild(htmlTable);
						htmlTemplateGrafico.appendChild(oCanvasHTML);
						//htmlTemplateGrafico.appendChild(table1);
						curvePDFStore.push(htmlTemplateGrafico);
					} catch (e) {
						console.log("File Not found!");
					}

				}
				//3. end of PDF generation scheda persoanle 3rd part graphs GRAFICO
				var pages = [];

				if (flagNoTempleteDisplay === true)
					pages = [htmlTable1];
				else if (flagNoTempleteDisplay === false)
					pages = [htmlTemplate, htmlTable1];
				for (var k = 0; k < curvePDFStore.length; k++) {
					pages.push(curvePDFStore[k]);
				}
				console.log(pages);
				var doc = html2pdf().set(opt).from(pages[0]).toPdf()
				for (var j = 1; j < pages.length; j++) {
					doc = doc.get('pdf').then(
						pdf => {
							pdf.addPage()
						}
					).from(pages[j]).toContainer().toCanvas().toPdf()
				}
				if (flagOnlySendPDF !== true)
					doc.save();

				//sending PDF file to DMS SCHEDA_PERSONALE_PDF folder in preproduction
				//	
				/************************start of sending dynamic table file to DMs *******************/
				html2pdf().from(htmlTable1).set(opt).outputPdf('blob').then(function (blob) {
					var today = new Date();
					//	var filenamePDF = "TemplateLettere-bodytemplate-" + ID_TEMPLATELETTERA + ".pdf";
					var filenameTXT1 = "";
					if (idProtocolla != "") {
						filenameTXT1 = "SCHEDA--TABLE--" + pers + "--" + idProtocolla + ".txt";
						//		filenameTXT = "SCHEDA--PERSONALE--FORM--" + ID_SCHEDAPERSONALE + "--" + ID_PROTOCOLLO + ".txt";
					} else {
						filenameTXT1 = "SCHEDA--TABLE--" + pers + ".txt";
						//			filenameTXT = "SCHEDA--PERSONALE--FORM--" + ID_SCHEDAPERSONALE + ".txt";
					}

					var blobString = new Blob([body], {
						type: "text/plain;charset=utf-8"
					});
					var fText = new File([blobString], filenameTXT1, {
						type: "text/plain",
						lastModifiedDate: today
					});
					//var fileArray = [fPdf, fText];
					var fileArray1 = [fText];
					if (flagOnlySendPDF === true)
						that.onSendFileDMS1(fileArray1, true, false);
				});
				/************************end of sending dynamic table file to DMs *******************/

				doc.outputPdf('blob').then(function (blob) {
					//	html2pdf().from(doc).set(opt).outputPdf('blob').then(function (blob) {
					//CREATE FILE TYPE

					var today = new Date();
					var filenamePDF = "";
					var filenameTXT = "";
					if (idProtocolla != "") {
						filenamePDF = "SCHEDA--PERSONALE--FORM--" + pers + "--" + idProtocolla + ".pdf";
						//		filenameTXT = "SCHEDA--PERSONALE--FORM--" + ID_SCHEDAPERSONALE + "--" + ID_PROTOCOLLO + ".txt";
					} else {
						filenamePDF = "SCHEDA--PERSONALE--FORM--" + pers + ".pdf";
						//			filenameTXT = "SCHEDA--PERSONALE--FORM--" + ID_SCHEDAPERSONALE + ".txt";
					}

					var fPdf = new File([blob], filenamePDF, {
						type: "application/pdf",
						lastModifiedDate: today
					});
					//we need to store 1 page for each pages 3 pages/3 txt file
					var fText = new File([blob], filenameTXT, {
						type: "text/plain",
						lastModifiedDate: today
					});

					//var fileArray = [fPdf, fText];
					var fileArray = [fPdf];
					if (flagOnlySendPDF === true)
						that.onSendFileDMS1(fileArray, false, true);
					that.inviaFile = filenamePDF;
				});

			}
		},

		/*********************start of sendPDFToManager method***************************/
		//sendPDFToManager method is used to send PDF  for the approval in the standard flow
		sendPDFToManager: function () {

			var that = this;
			if (change_pck_arr.length !== 0) {
				var payload = {
					ID_PACKAGEDS: change_pck_arr,
					type: that.type
				};
				console.log(payload);
				$.ajax({
					url: "/HANAMDC/STIP/STIPAdmin/services/create_schedapersonali.xsjs",
					type: "POST",
					method: "GET",
					contentType: 'application/json',
					data: {
						odata: JSON.stringify(payload)
					},
					dataType: 'text',
					success: function (data1, textStatus1) {

						console.log(data1);
						data1 = JSON.parse(data1);
						if (data1.result === "Error") {
							MessageBox.error("errore nell'invio del pacchetto al gestore");
						} else {
							var scd = that.scd;
							console.log(scd);
							var ID_PACKAGEDS = "";
							var ID_PROTOCOLLO = "";
							var schedaMasterId = "";
							var lettereAut = "";
							var lettereMan = "";
							for (var i = 0; i < scd.length; i++) {
								ID_PACKAGEDS = data1[0].ID_PACKAGEDS[i];
								ID_PROTOCOLLO = data1[0].ID_PROTOCOLLO[i];
								schedaMasterId = scd[i].ID_SCHEDAMASTER;
								lettereAut = scd[i].ID_LETTERE_AUTOMATICA;
								lettereMan = scd[i].ID_LETTERE_MANUALE;
								flagOnlySendPDF = true; // this flag is set true only for sending  PDF not for generating
								that.openPdfDetails(lettereAut, lettereMan, schedaMasterId, ID_PACKAGEDS, ID_PROTOCOLLO, flagOnlySendPDF);
								that.sendMail();
							}
						}
						oMainModel.refresh();
						//sendPDFToManager method sends PDF form to DMS
					},
					error: function (data, textStatus1) {

						console.log(data);
						MessageBox.error("Errore durante la modifica dello inattivo schedapersonali");
					}
				});
			}

		},
		/******************** onSendFileDMS function is used to send the file to DMS********************************************/
		onSendFileDMS1: async function (fileArray, flagDynamicTable, flagCompletePDF) {

			var that = this;
			var count = 0;
			var flagSuccess = false;
			if (flagCompletePDF === true) {

				for (var i = 0; i < fileArray.length; i++) {
					var Errmsg = "noErr";
					try {
						await RepoService.deleteFile(fileArray[i].name, "SCHEDA_PERSONALE_PDF"); //deleteFile of RepoService is called
					} catch (e) {
						if (e.status === 404) {
							Errmsg = "404"
						}
					} finally {
						if (Errmsg === "noErr" || Errmsg === "404") {
							await RepoService.uploadFile(fileArray[i], "SCHEDA_PERSONALE_PDF"); //uploadFile of RepoService is called
							count++
							//success message status changed and form send to manager
							flagSuccess = true;

						}

					}
				}
				if (flagSuccess == true)
					MessageBox.success("Il documento è stato inviato"); //Success message displayed 'The document has been sent'
			} else if (flagDynamicTable === true) {
				for (var i = 0; i < fileArray.length; i++) {
					var Errmsg = "noErr";
					try {
						await RepoService.deleteFile(fileArray[i].name, "SCHEDA_PERSONALE_TABLE"); //deleteFile of RepoService is called
					} catch (e) {
						if (e.status === 404) {
							Errmsg = "404"
						}
					} finally {
						if (Errmsg === "noErr" || Errmsg === "404") {
							await RepoService.uploadFile(fileArray[i], "SCHEDA_PERSONALE_TABLE"); //uploadFile of RepoService is called
							count++

						}

					}
				}
			}

		},
		/******************** getTemplateLetterPromise function fetches the data from TEMPLATELETTERE and checks if the match is found else reports error********************************************/
		getTemplateLetterPromise: async function (oFilters, f) {

			var that = this;
			return new Promise(
				function (resolve, reject) {
					sap.ui.core.BusyIndicator.show(0);

					var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");

					xsoDataModel.read("/TEMPLATELETTERE?$format=json", {
						filters: oFilters,
						success: function (oDataIn, oResponse) {

							var data = oDataIn.results;
							if (f === 0) {
								//that.lettere = data[0].BODYTEMPLATE;
								resolve(data[0].BODYTEMPLATE); //It fetches template letter body.txt file
								/*	that.edit = data[0];
									mode = "Edit";
									edit_id = data[0].ID_TEMPLATELETTERA*/
							} else {}

							sap.ui.core.BusyIndicator.hide(0);
						},
						error: function (oDataIn, oResponse) {

							reject("error");
							sap.ui.core.BusyIndicator.hide(0);
						}
					});
				});

		},

		/***************************** end of PDF generataion 1. temaplte lettre 2. dynamic table 3. graphs*****************************************************/
		/******************** _GetTemplateLetter function fetches the data from TEMPLATELETTERE based on ID_TEMPLATELETTERA********************************************/
		_GetTemplateLetter: async function (id, pers) {
			//Get file name from DB TEMPLATELETTERE.BODYTEMPLATE
			BusyIndicator.show();
			var that = this;

			var oFilters = [];
			oFilters.push(new sap.ui.model.Filter("ID_TEMPLATELETTERA", sap.ui.model.FilterOperator.EQ, id));
			var bodyText = await this.getTemplateLetterPromise(oFilters, 0);
			var result = await RepoService.getFiles(bodyText, "TEMPLATE_LETTERA");
			var filename = bodyText + ".pdf";
			if (result === undefined)
				MessageBox.error("Scusate. File non trovato!"); //Error message displayed 'Sorry. File not found!'
			else {
				var opt = {
					margin: 1,
					filename: filename,
					image: {
						type: 'jpeg',
						quality: 1
					},
					html2canvas: {
						scale: 2
					},
					jsPDF: {
						unit: 'in',
						format: 'letter',
						orientation: 'portrait'
					}
				};
				//TEMPLATE LETTERA
				var htmlTemplate = document.createElement('div');

				if (pers != undefined) {
					for (var i = 0; i < oMainModel.getData()[1].Main.length; i++) {
						if (oMainModel.getData()[1].Main[i].ID_PACKAGEDS === pers) {
							var n = result.lastIndexOf("[Egregio Sig/ Gent. Sig.ra]");
							var sub0 = result.substring(0, n);
							var sub1 = result.substring(n, result.length);
							var newString = sub0 + sub1;
							var replacedStringInMgr = newString.replace("[Egr.Sig/Gent.Sig.ra]", oMainModel.getData()[1].Main[i].SESSO);
							replacedStringInMgr = replacedStringInMgr.replace("[Cognome]", oMainModel.getData()[1].Main[i].COGNOME_JR);
							replacedStringInMgr = replacedStringInMgr.replace("[Nome]", oMainModel.getData()[1].Main[i].NOME_JR);
							replacedStringInMgr = replacedStringInMgr.replace("[Data]", Formatter.removetime(oMainModel.getData()[1].Main[i].DATALETTERA));
							replacedStringInMgr = replacedStringInMgr.replace("[Recapito]", oMainModel.getData()[1].Main[i].INDIRIZZO_REC + "\n" +
								oMainModel.getData()[
									1].Main[i].CAP_REC + " " + oMainModel.getData()[1].Main[i].COMUNE_REC + " (" + oMainModel.getData()[1].Main[i].PROVINCIA_REC +
								")");
							if (oMainModel.getData()[1].Main[i].Importo_Scheda === null && oMainModel.getData()[1].Main[i].BaseMBO === null)
								replacedStringInMgr = replacedStringInMgr.replace("[% Risultato]", 0);
							else
								replacedStringInMgr = replacedStringInMgr.replace("[% Risultato]", oMainModel.getData()[1].Main[i].Importo_Scheda * 100 /
									oMainModel.getData()[
										1].Main[i].BaseMBO);

							replacedStringInMgr = replacedStringInMgr.replace("[Mese Liquidazione]", Formatter.months(oMainModel.getData()[1].Main[i].dataPagamento
								.getMonth() + 1));
							replacedStringInMgr = replacedStringInMgr.replace("[Ragione Sociale]", oMainModel.getData()[1].Main[i].FIRMACOMPANY);
							replacedStringInMgr = replacedStringInMgr.replace("[Titolo]", oMainModel.getData()[1].Main[i].TITOLO);
							replacedStringInMgr = replacedStringInMgr.replace("[Periodo Riferimento]", Formatter.months(oMainModel.getData()[1].Main[i]
								.VALE_DAL_PERIODI
								.getMonth() + 1) + " " + oMainModel.getData()[1].Main[i].VALE_DAL_PERIODI.getFullYear() + " - " + Formatter.months(
								oMainModel
								.getData()[1].Main[i].VALE_AL_PERIODI.getMonth() + 1) + " " + oMainModel.getData()[1].Main[i].VALE_AL_PERIODI.getFullYear());
							replacedStringInMgr = replacedStringInMgr.replace("[Fine FY]", Formatter.removetime(oMainModel.getData()[1].Main[i].VALE_AL_PERIODI));
							replacedStringInMgr = replacedStringInMgr.replace("[FY]", oMainModel.getData()[1].Main[i].VALE_DAL_PERIODI.getFullYear() +
								" - " +
								oMainModel.getData()[1].Main[i].VALE_AL_PERIODI.getFullYear());
							if (oMainModel.getData()[1].Main[i].Inizio_Assegnazione_CS === null && oMainModel.getData()[1].Main[i].Fine_Assegnazione_CS ===
								null)
								replacedStringInMgr = replacedStringInMgr.replace("[Periodo Scheda associata]", "");
							else
								replacedStringInMgr = replacedStringInMgr.replace("[Periodo Scheda associata]", Formatter.months(oMainModel.getData()[1].Main[
											i]
										.Inizio_Assegnazione_CS
										.getMonth() + 1) + " " + oMainModel.getData()[1].Main[i].Inizio_Assegnazione_CS.getFullYear() + " - " + Formatter.months(
										oMainModel
										.getData()[1].Main[i].Fine_Assegnazione_CS.getMonth() + 1) + " " + oMainModel.getData()[1].Main[i].Fine_Assegnazione_CS
									.getFullYear());
							replacedStringInMgr = replacedStringInMgr.replace("[Inizio ProQuota]", Formatter.removetime(oMainModel.getData()[1].Main[i]
								.Inizio_Assegnazione_CS)); //removetime function of Formatter is used
							replacedStringInMgr = replacedStringInMgr.replace("[Importo 1°Semestre]", oMainModel.getData()[1].Main[i].Importo_Scheda);
							result = replacedStringInMgr;
						}
					}
				}
				//	
				htmlTemplate.innerHTML = result;
				var pages = [htmlTemplate];
				var doc = html2pdf().set(opt).from(pages[0]).toPdf()
				doc.save();
			}
			BusyIndicator.hide();
		},
		/************************sendMail function is used to send the mail to manager********************************/
		sendMail: function () {
			var that = this;
			var body =
				"<html><head></head><body><font><b>Salve, ti avvisiamo che hai una scheda STIP nella tua inbox</b></font></body></html>";
			// Hi, we warn you that you have a STIP tab in your inbox
			$.ajax({
				//url: "/email/http/UI5_Mail_To_Manager_Employee",
				url: "/email/http/UI5_Scheda_Personale_STIP_Mail",
				type: "POST",
				data: body,
				dataType: "text",
				contentType: "text/xml; charset=\"utf-8\"",
				success: function (data, textStatus, jqXHR) {

					that.onSearch(1);
				},
				error: function (xhr, status) {}
			});
		},
		/************************getPDF function is used to fetch the pdf file(Invia_al_Manager) corresponding to SCHEDA_PERSONALE_TABLE********************************/
		getPDF: async function (oEvent, pers, prot) {

			//doc = doc+".txt";
			doc = "SCHEDA--TABLE--" + pers + "--" + prot + ".txt";
			var bodyText = await new Promise(
				function (resolve, reject) {
					resolve(doc);
				});

			var result = await RepoService.getFiles(bodyText, "SCHEDA_PERSONALE_TABLE");
			//var result = await RepoService.getFiles(bodyText, "TEMPLATE_LETTERA");

			if (result === undefined)
				MessageBox.error("Scusate. File non trovato!"); //Error message displayed 'Sorry. File not found!'
			else {
				var opt = {
					margin: 1,
					filename: 'Invia_al_Manager.pdf',
					image: {
						type: 'jpeg',
						quality: 1
					},
					html2canvas: {
						scale: 2
					},
					jsPDF: {
						unit: 'in',
						format: 'letter',
						orientation: 'portrait'
					}
				};

				var htmlTemplate = document.createElement('div');
				htmlTemplate.innerHTML = result;

				var pages = [htmlTemplate];

				console.log(pages);
				var doc = html2pdf().set(opt).from(pages[0]).toPdf()
				for (var j = 1; j < pages.length; j++) {
					doc = doc.get('pdf').then(
						pdf => {
							pdf.addPage()
						}
					).from(pages[j]).toContainer().toCanvas().toPdf()
				}

				doc.save();

			}

		},
		/************************letterChangeFrag1 function is used to fetch ID_LETTERE_MANUALE
		If it is non-blank, then editTemplateLetter function is invoked********************************/
		letterChangeFrag1: function (oEvent) {

			var ltr = sap.ui.getCore().byId("template_man").getSelectedKey();
			//this._GetTemplateLetter(ltr);
			if (ltr != "")
				this.editTemplateLetter(ltr);
			else
				MessageBox.error("Nessuna template letter selezionata"); //Error message displayed 'No template letter selected'
		},
		/************************letterChangeFrag2 function is used to fetch LETTERE_DESCRIZIONE_AUTOMATICA
		If it is non-blank, then will be assigned to the description and editTemplateLetter function is invoked********************************/
		letterChangeFrag2: function (oEvent) {

			var ltr = sap.ui.getCore().byId("autoLtrFix").getValue();
			if (ltr != "") {
				for (var i = 0; i < this.allLetters.length; i++) {
					if (this.allLetters[i].desc === ltr)
						ltr = this.allLetters[i].id;
				}
				//this._GetTemplateLetter(ltr);

				this.editTemplateLetter(ltr);
			} else
				MessageBox.error("Nessuna template letter selezionata"); //Error message displayed 'No template letter selected'
		},
		/************************editTemplateLetter function is used to access the templateletter_edit fragment
		and edit the data based on the ID_TEMPLATELETTERA filter********************************/
		editTemplateLetter: async function (ltr) {

			BusyIndicator.show();

			this.oLetterFragment = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.templateletter_edit", this.getView().getController());
			this.getView().addDependent(this.oLetterFragment);
			var ltrFilters = [];

			ltrFilters.push(new sap.ui.model.Filter("ID_TEMPLATELETTERA", sap.ui.model.FilterOperator.EQ, parseInt(ltr, 10)));
			var bodyText = await this.getTemplateLetterPromise(ltrFilters, 0);
			var result = await RepoService.getFiles(bodyText, "TEMPLATE_LETTERA"); //getFiles method of RepoService is called
			if (result === undefined) {
				BusyIndicator.hide();
				this.oLetterFragment.destroy();
				MessageBox.error("Scusate. File non trovato!"); //Error message displayed 'Sorry. File not found!'
			} else {
				this.getTags();

				var oRichTextEditor1 = new RichTextEditor("myRTE", {
					editorType: sap.ui.richtexteditor.EditorType.TinyMCE4,
					width: "100%",
					height: "600px",
					id: "RTE",
					customToolbar: true,
					showGroupFont: true,
					showGroupLink: true,
					showGroupInsert: true,
					value: result,
					ready: function () {
						this.addButtonGroup("styleselect").addButtonGroup("table");
					}
				});

				sap.ui.getCore().byId("idVerticalLayout").addContent(oRichTextEditor1);
				BusyIndicator.hide();

				this.oLetterFragment.open();
			}
		},
		/******************** getTags function is used to fetch the data from T_TEMPLATELETTERE_TAGS and push the tags to the main Model********************************************/
		getTags: function () {

			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");

			xsoDataModel.read("/T_TEMPLATELETTERE_TAGS?$format=json", {

				success: function (oDataIn, oResponse) {

					var data = oDataIn.results
					var aa = oMainModel.getData();
					aa.push({
						Tags: data
					});
					oMainModel.setData(aa);

					oMainModel.refresh();

					sap.ui.core.BusyIndicator.hide(0);
				},
				error: function (oDataIn, oResponse) {

					sap.ui.core.BusyIndicator.hide(0);
				}
			});

		},
		/************************closeTemplateLetter function is used to get the data and close the dialog box********************************/
		closeTemplateLetter: function () {

			var data = oMainModel.getData();
			data.pop();
			oMainModel.setData(data);
			oMainModel.refresh();
			this.oLetterFragment.destroy();
		},
		/************************_onpressVariables function adds the token to the TemplateLettere********************************/
		_onpressVariables: function (press) {

			var sOldValue = sap.ui.getCore().byId("idVerticalLayout").getContent()[0].mProperties.value;
			var n = sOldValue.lastIndexOf("</p>");
			var sub0 = sOldValue.substring(0, n);
			var sub1 = sOldValue.substring(n, sOldValue.length);

			//  To retrieve from the select
			var tokenToadd = sap.ui.getCore().byId("variables").getSelectedKey();

			var finalHtml = sub0 + tokenToadd + sub1;
			sap.ui.getCore().byId("idVerticalLayout").getContent()[0].mProperties.value = finalHtml;
			sap.ui.getCore().byId("variables").setSelectedKey("");

		},
		/******************* handleTreeValueHelp function fetches the data into the dialog box from the 'TreeStruc fragment' for Dipatimento ********************/
		handleTreeValueHelp: function () {
			debugger;
			var that = this;
			$.ajax({
				url: "/HANAMDC/STIP/STIPAdmin/services/department.xsjs",
				type: "POST",
				method: "GET",
				contentType: 'application/json',
				dataType: 'text',

				success: function (data, textStatus1) {
					debugger;
					data = JSON.parse(data);
					var oModel = new JSONModel();
					oModel.setSizeLimit(10000);
					oModel.setData(data);
					that.getView().setModel(oModel, "nodeModel");
					console.log(that.getView().getModel("nodeModel").getData());
					that.deptFragment = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.TreeStruc", that.getView().getController());
					that.getView().addDependent(that.deptFragment);
					that.deptFragment.open();

				},
				error: function (data, textStatus1) {
					debugger;
				}
			});

		},
		oncellClick: function (oEvent) {
			debugger;
			this.byId("idTree").setValue(oEvent.oSource.mProperties.title);
			this.onCancelDialog();
		},
		/************************onPosition function is used to access the hierarchy.xsjs only if department is non-blank
		 and opens the position_schedapers fragment on clicking the Tree icon beside Posizione********************************/
		onPosition: function () {
			var dept = this.byId("idTree").getValue();
			if (dept !== "") {
				for (var i = 0; i < oMainModel.getData()[0].Filter[12].JOB.length; i++) {
					if (oMainModel.getData()[0].Filter[12].JOB[i].name === dept) {
						dept = oMainModel.getData()[0].Filter[12].JOB[i].externalCode;
						break;
					}
				}
				var payload = {
					"DEPARTMENT": dept
				};
				var that = this;
				$.ajax({
					url: "/HANAMDC/STIP/STIPAdmin/services/hierarchy.xsjs",
					type: "POST",
					method: "GET",
					contentType: 'application/json',
					dataType: 'text',
					data: {
						odata: JSON.stringify(payload)
					},
					success: function (data, textStatus1) {

						data = JSON.parse(data);
						oMainModel.getData()[0].Filter[2].POSIZIONE = data;
						oMainModel.refresh();
						that.posFragment = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.position_schedapers", that.getView().getController());
						that.getView().addDependent(that.posFragment);
						sap.ui.getCore().byId("tblFilter2").setVisible(false);
						sap.ui.getCore().byId("tblFilter1").setVisible(true);
						that.posFragment.open();

					},
					error: function (data, textStatus1) {

					}
				});

			}
		},
		/************************PosSelect function is used to close the dialog box and set the value to Posizione********************************/
		PosSelect: function (oEvent, pos) {
			this.posFragment.destroy();
			this.byId("pos").setValue(pos);
		},
		/************************onRole function is used to access the hierarchy.xsjs only if posizione is non-blank
		and opens the position_schedapers fragment on clicking the Tree icon beside Ruolo********************************/
		onRole: function () {
			var pos = this.byId("pos").getValue();
			if (pos !== "") {
				for (var i = 0; i < oMainModel.getData()[0].Filter[2].POSIZIONE.length; i++) {
					if (oMainModel.getData()[0].Filter[2].POSIZIONE[i].POSITIONDESCRIPTION === pos) {
						pos = oMainModel.getData()[0].Filter[2].POSIZIONE[i].POSITIONCODE;
						break;
					}
				}
				var payload = {
					"POSITION": pos
				};
				var that = this;
				$.ajax({
					url: "/HANAMDC/STIP/STIPAdmin/services/hierarchy.xsjs",
					type: "POST",
					method: "GET",
					contentType: 'application/json',
					dataType: 'text',
					data: {
						odata: JSON.stringify(payload)
					},
					success: function (data, textStatus1) {

						data = JSON.parse(data);
						oMainModel.getData()[0].Filter[3].ROLE = data;
						oMainModel.refresh();
						that.posFragment = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.position_schedapers", that.getView().getController());
						that.getView().addDependent(that.posFragment);
						sap.ui.getCore().byId("tblFilter1").setVisible(false);
						sap.ui.getCore().byId("tblFilter2").setVisible(true);
						that.posFragment.open();

					},
					error: function (data, textStatus1) {

					}
				});

			}
		},
		/************************RoleFilterSelect function is used to close the dialog box and set the value to Ruolo********************************/
		RoleFilterSelect: function (oEvent, pos) {
			this.posFragment.destroy();
			this.byId("ruolo").setValue(pos);
		},
		/************************posRoleFragmentClose function is used to close the dialog box********************************/
		posRoleFragmentClose: function () {
			this.posFragment.destroy();
		}

	});
});