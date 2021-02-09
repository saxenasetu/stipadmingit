sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/m/MessageBox",
	"sap/ui/core/BusyIndicator"
], function (Controller, JSONModel, Device, MessageBox, BusyIndicator) {
	"use strict";
	var oResource;
	var load = 0,
		year = '';
	var data2 = [];
	var totalschedaCount = 0;
	var oMainModel = new JSONModel(),
		oMainModel1 = new JSONModel(),
		oMainModel2 = new JSONModel(), //to avoid maxpayout duplication in upper search 
		oMainModel3 = new JSONModel(),
		changeModel = new JSONModel(), //Gruppo schede master dropdon values
		max_id, pista = [],
		pista2 = [];
	var oFilters = [],
		curve = [],
		gruppo = [],
		pay = [],
		gruppopista = [];
	/*	var pista = [{
			per_piste: "%",
			id_piste: "",
			desc_piste: ""
		}];*/
	var count = {
		rows: 0,
		per: 0
	};
	var selectedfiscalYearPeriodi, periodi = [],
		change_id_arr = [];
	var flagSort, flagGroup, flagFilter;

	return Controller.extend("stipAdmin.stipAdmin.controller.BloccaSchedeMaster", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {
			this.f1 = 0, this.f2 = 0;

			this.byId("cong").setEnabled(false);
			this.byId("scong").setEnabled(false);
			this.congArr = [];
			this.count = 0;
			this.tops = 150;
			this.skip = 0;
			this.busyDialog = new sap.m.BusyDialog();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("BloccaSchedeMaster").attachPatternMatched(this._onObjectMatched, this);
		},
		/******************** _onObjectMatched fetches argument values *******************************************/
		_onObjectMatched: function (oEvent) {
			if (oEvent) {
				var oArguments = oEvent.getParameter("arguments");
				this.selectedfiscalYearPeriodi = oArguments.str;

			}
			this.byId("tbl").setVisible(false);
			this.getGeneric(this.selectedfiscalYearPeriodi);
		},
		/******************** getGeneric function calls generic.xsjs ,payload is ID_PERIODO and output is fiscal year 
		and sets the BloccaSchedaModel****************************/
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

					that.byId("idtxtfiscalyear").setText(data1[1].DESCR_PERIODO);

					var gruppo = data1[13].GRUPPOSCHEDA;
					BusyIndicator.hide();
					var data = [];
					data.push({
						GRUPPO: gruppo
					});
				//	var oMainModel = new JSONModel();
					oMainModel.setData({
						Filter: data
					});
					that.getView().setModel(oMainModel, "BloccaSchedaModel");
					BusyIndicator.hide();
				},
				error: function (data1, textStatus1, XMLHttpRequest1) {
					BusyIndicator.hide();
				}
			});
		},
		/******************** onAvvio fetches and displays the data from the backend based on the filter values
		(idscheda,desc,gruppo,note,cong,kpiid,txtPista)********************************************/
		onAvvio: function () {
			this.skip = 0;
			var oFilters = [];
			var idScheda = this.byId("txtID").getValue();
			var desc = this.byId("desc").getValue();
			var gruppo = this.byId("gruppo").getSelectedKey();
			var note = this.byId("note").getValue();
			var cong = this.byId("congelata").getSelectedKey();
			var kpiId = this.byId("kpiId").getValue();
			var txtPista = this.byId("txtPista").getValue();

			if (idScheda != "")
				oFilters.push(new sap.ui.model.Filter("ID_SCHEDAMASTER", sap.ui.model.FilterOperator.EQ, idScheda));

			if (desc != "")
				oFilters.push(new sap.ui.model.Filter({
					path: 'DESCR_SCHEDA',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: desc,
					caseSensitive: false
				}));

			if (gruppo != "")
				oFilters.push(new sap.ui.model.Filter("ID_GRUPPOSCHEDA", sap.ui.model.FilterOperator.EQ, gruppo));

			if (note != "")
				oFilters.push(new sap.ui.model.Filter({
					path: 'NOTE',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: note,
					caseSensitive: false
				}));

			if (cong != "")
				oFilters.push(new sap.ui.model.Filter("SN_CONGELATA", sap.ui.model.FilterOperator.EQ, cong));

			if (kpiId != "")
				oFilters.push(new sap.ui.model.Filter("ID_PISTAVIEW", sap.ui.model.FilterOperator.EQ, kpiId));

			if (note != "")
				oFilters.push(new sap.ui.model.Filter({
					path: 'DESCR_PISTA',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: txtPista,
					caseSensitive: false
				}));
			this.oFilters = oFilters;
			this.getSchedaMaster(oFilters);
		},
		/******************** onResetta will reset all the filter fields(idscheda,desc,gruppo,note,cong,kpiid,txtPista) as blank********************************************/
		onResetta: function () {
			this.byId("txtID").setValue("");
			this.byId("desc").setValue("");
			this.byId("gruppo").setSelectedKey("");
			this.byId("note").setValue("");
			this.byId("congelata").setSelectedKey("");
			this.byId("kpiId").setValue("");
			this.byId("txtPista").setValue("");
		},
		/******************** getSchedaMaster function fetches the data from the V_SchedaMaster (as per ID_PERIODO ) 
		based on NOTE,SN_CONGELATA and SN_BLOCCATA parameters********************************************/

		getSchedaMaster: function (oFilters) {
			debugger;
			var that = this,
				count = 0;
			this.byId("tbl").setVisible(false);
			var filter = that.getView().getModel("BloccaSchedaModel").getData().Filter;

			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
		//	var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, this.selectedfiscalYearPeriodi);
		//	oFilters.push(filter1);
		//	var data = [];
		//	var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");


			var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, this.selectedfiscalYearPeriodi);
			oFilters.push(filter1);
			var data, data22 = [],
				GATE = [],
				CURVE = [],
				PISTE = [],
				arrGruppoDesc = [],
				arrGruppoDesc1 = [],
				arrGruppoDesc2 = [],
				id, that = this,
				tmp = {},
				tmpMaxPayout = [{
					"MAXPAYOUT": "-"
				}],
				maxArray = {};
			
			xsoDataModel.read("/V_SchedaMaster1?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;
					this.byId("prev").setVisible(true);
					this.byId("next").setVisible(true);
					this.byId("prev").setEnabled(false);
					this.byId("next").setEnabled(true);

					data = oDataIn.results;

					console.log(data);
					if (data.length > 0) {
						this.byId("tbl").setVisible(true);
						var ch = [];
						var duplicateArray = [];
						var m = {};
						for (var i = 0; i < data.length; i++) {
							var a = data[i].ID_SCHEDAMASTER;

							if (!duplicateArray[a]) {
								//	var firstSchedaId = true;
								for (var j = i + 1; j < data.length; j++) {
									if (data[j].ID_SCHEDAMASTER === a) {
										data[j].DESCR_TEMPLATELETTERA = false;
										data[i].DESCR_TEMPLATELETTERA = true;
										duplicateArray[a] = true;
										//console.log(duplicateArray);
										/*data[i].DESCR_TEMPLATELETTERA = 0;
										data[j].DESCR_TEMPLATELETTERA = 1;*/
									} else
										data[i].DESCR_TEMPLATELETTERA = true; //this condition for single value

								}
							}
							//console.log(data[i].DESCR_TEMPLATELETTERA + "---" + data[i].DESCR_TEMPLATELETTERA + "------- " + data[i].ID_SCHEDAMASTER);
							//console.log();
						}

/*						var data11 = data;
						data = [];
						for (var i = 0; i < data11.length; i++) {
							var vv = data11[i].ID_SCHEDAMASTER + ":" + data11[i].ID_PISTA,
								v = data11[i];
							if (!m[vv]) {
								m[vv] = true;
								data.push(v);
							}
						}*/

/*						if (data.length > 0) {
							periodi.push({
								"Periodi_start_date": data[0].PERIODI_VALE_DAL,
								"Periodi_end_date": data[0].PERIODI_VALE_AL
							});
							console.log(periodi);
						}*/
						for (var i = 0; i < data.length; i++) {
							if (data[i].NOTE === "NULL" || data[i].NOTE === null)
								data[i].NOTE = "";
							data[i].ID_SCHEDAMASTER2 = data[i].ID_SCHEDAMASTER;
							data[i].DESCR_GRUPPOSCHEDA2 = data[i].DESCR_GRUPPOSCHEDA;
							data[i].NOTE2 = data[i].NOTE;
							data[i].DESCR_SCHEDA2 = data[i].DESCR_SCHEDA;
							data[i].MAXPERCPAYOUT2 = data[i].MAXPERCPAYOUT;
							tmp = {
								row: i,
								Check_CHECKBOX: false,
								DESCR_GRUPPOSCHEDA: data[i].DESCR_GRUPPOSCHEDA,
								DESCR_SCHEDA: data[i].DESCR_SCHEDA,
								ID_GRUPPOSCHEDA: data[i].ID_GRUPPOSCHEDA,
								ID_PERIODO: selectedfiscalYearPeriodi,
								ID_SCHEDAMASTER: data[i].ID_SCHEDAMASTER,
								MATRICOLA: data[i].MATRICOLA,
								MAXPERCPAYOUT: data[i].MAXPERCPAYOUT,
								NOTE: data[i].NOTE,
								P4P: data[i].P4P,
								SN_BLOCCATA: data[i].SN_BLOCCATA,
								SN_CONGELATA: data[i].SN_CONGELATA,
							};
							//	debugger
							//**********************start of removing duplicate maxpayout**************************

							if (data[i].MAXPERCPAYOUT !== null && data[i].MAXPERCPAYOUT !== "") {
								var maxPayOut = data[i].MAXPERCPAYOUT;
								if (!maxArray[maxPayOut]) {
									tmpMaxPayout = {
										"MAXPAYOUT": maxPayOut
									};
									maxArray[maxPayOut] = true;
									console.log(tmpMaxPayout);
									arrGruppoDesc.push(tmpMaxPayout);
								}
							} //end of 	if (data[i].MAXPERCPAYOUT !== null || data[i].MAXPERCPAYOUT == "")
							data22.push(tmp);
						}
						//arrGruppoDesc.push("_");
						//arrGruppoDesc.unshift("&nbsp;");
						arrGruppoDesc.unshift({
							MAXPAYOUT: ""
						});
						oMainModel2.setData(arrGruppoDesc);
						//this.getView().setModel(oMainModel2, "maxPayoutModel");
						console.log(oMainModel2.getData());

						//Removing duplicates
						var data11 = data22;
						this.GateFilter = [];
						data22 = [];
						var m = {};
						for (i = 0; i < data11.length; i++) {
							var v = data11[i],
								vv = data11[i].ID_SCHEDAMASTER;
							if (!m[vv]) {
								data22.push(v);
								m[vv] = true;
							}
						}
						var m = {};
						for (i = 0; i < data.length; i++) {
							var c = data[i].ID_GATE,
								c1 = data[i].ID_GATE2,
								cc = {
									id: data[i].ID_GATE,
									desc: data[i].DESCR_GATE1
								},
								cc2 = {
									id: data[i].ID_GATE2,
									desc: data[i].DESCR_GATE2
								};
							if (!m[c]) {
								this.GateFilter.push(cc);
								m[c] = true;
							} else if (!m[c1]) {
								this.GateFilter.push(cc2);
								m[c1] = true;
							}
						}
						debugger;
						for (i = 0; i < data22.length; i++) {
							id = data22[i].ID_SCHEDAMASTER;
							data22[i].row = i;
							for (var j = 0; j < data.length; j++) {
								if (data[j].ID_SCHEDAMASTER === id) {
									if (data[j].ID_GATE1 !== null && data[j].ID_GATE2 !== null) {
										tmp = {
											DESCR_GATE1: data[j].DESCR_GATE1,
											DESCR_GATE2: data[j].DESCR_GATE2,
											ID_GATE1: data[j].ID_GATE,
											ID_GATE2: data[j].ID_GATE2,
											ID_PISTE: data[j].ID_PISTA
										};
										GATE.push(tmp);
									}
									if (data[j].ID_CURVA !== null) {
										tmp = {
											DESCR_CURVA: data[j].DESCR_CURVA,
											ID_CURVA: data[j].ID_CURVA,
											ID_PISTA: data[j].ID_PISTA,
											ID_TIPO_CURVA: data[j].ID_TIPO_CURVA
										};
										CURVE.push(tmp);
									}
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
							}
							data22[i].CURVE = CURVE;
							CURVE = [];
							data22[i].GATE = GATE;
							GATE = [];
							data22[i].PISTE = PISTE;
							PISTE = [];
						}

						var data11 = data;
						data = [];
						for (var i = 0; i < data11.length; i++) {

							var vv = data11[i].ID_SCHEDAMASTER,
								v = data11[i];
							if (data11[i].NOTE === "NULL")
								data11[i].NOTE = "";
							if (data11[i].SN_CONGELATA === "N")
								data11[i].SN_CONGELATA = "No";
							else
								data11[i].SN_CONGELATA = "Si";
							if (data11[i].SN_BLOCCATA === "S")
								data11[i].SN_BLOCCATA = "Bloccata";
							else
								data11[i].SN_BLOCCATA = "";
							if (!m[vv]) {
								count += 1;
								m[vv] = true;
								data11[i].CheckBox_visible = true;
								
							}
							else{
							data11[i].ID_SCHEDAMASTER = "";
							data11[i].DESCR_SCHEDA = "";
							data11[i].NOTE = "";
							data11[i].SN_CONGELATA = "";
							data11[i].CheckBox_visible = false;
							 data11[i].DESCR_GRUPPOSCHEDA = "";
							}								
/*							if (!m[vv]) {
								count += 1;
								m[vv] = true;
							} else {

								data11[i].ID_SCHEDAMASTER = "";
								data11[i].NOTE = "";
								data11[i].DESCR_SCHEDA = "";
								data11[i].DESCR_GRUPPOSCHEDA = "";
								data11[i].MAXPERCPAYOUT = "";
								data11[i].DESCR_TEMPLATELETTERA = false;

							}*/
							//data.push(v);
							
						}
						data = data11;
						var filterData=oMainModel.getData().Filter;
						oMainModel.setData({Filter:filterData,Main:data});
					//	changeModel.setData(data);
						console.log(oMainModel.getData());
						//Removing duplicate filters
/*						var m1 = {},
							m2 = {},
							m3 = {},
							m4 = {},
							m5 = {},
							m6 = {},
							m7 = {},
							m8 = {},
							m9 = {},
							m10 = {},
							v1 = [],
							v2 = [],
							v3 = [],
							v4 = [],
							v5 = [],
							v6 = [],
							v7 = [],
							v8 = [],
							v9 = [],
							v10 = [];
						for (var i = 0; i < data.length; i++) {
							var vv1 = data[i].ID_SCHEDAMASTER,
								vv2 = data[i].DESCR_SCHEDA,
								vv3 = data[i].MAXPERCPAYOUT,
								vv4 = data[i].DESCR_GRUPPOSCHEDA,
								vv5 = data[i].NOTE,
								vv6 = data[i].SN_CONGELATA,
								vv7 = data[i].DESCR_CURVA,
								vv8 = data[i].DESCR_PISTA,
								vv9 = data[i].PESO_PERCENTUALE,
								vv10 = data[i].ID_PISTA;

							if (!m1[vv1] && vv1 !== "") {
								m1[vv1] = true;
								v1.push(vv1);
							}
							if (!m2[vv2] && vv2 !== "") {
								m2[vv2] = true;
								v2.push(vv2);
							}
							if (!m3[vv3] && vv3 !== "") {
								m3[vv3] = true;
								v3.push(vv3);
							}
							if (!m4[vv4] && vv4 !== "") {
								m4[vv4] = true;
								v4.push(vv4);
							}

							if (!m5[vv5] && vv5 !== "") {
								m5[vv5] = true;
								v5.push(vv5);
							}
							if (!m6[vv6] && vv6 !== "") {
								m6[vv6] = true;
								if (vv6 === "S")
									v6.push("Si");
								else
									v6.push("No")
							}

							if (!m7[vv7] && vv7 !== "") {
								m7[vv7] = true;
								v7.push(vv7);
							}
							if (!m8[vv8] && vv8 !== "") {
								m8[vv8] = true;
								v8.push(vv8);
							}
							if (!m9[vv9] && vv9 !== "") {
								m9[vv9] = true;
								v9.push(vv9);
							}
							if (!m1[vv10] && vv10 !== "") {
								m10[vv10] = true;
								v10.push(vv10);
							}

						}

						var Filter = [{
							ID_SCHEDAMASTER: v1
						}, {
							DESCR_SCHEDA: v2
						}, {
							MAXPERCPAYOUT: v3
						}, {
							DESCR_GRUPPOSCHEDA: v4
						}, {
							NOTE: v5
						}, {
							SN_CONGELATA: v6
						}, {
							DESCR_CURVA: v7
						}, {
							DESCR_PISTA: v8
						}, {
							PESO_PERCENTUALE: v9
						}, {
							ID_PISTA: v10
						}];

						console.log(Filter);*/
					//	var oMainModel = new JSONModel();
					//	oMainModelFilter.setData(Filter);
						console.log(oMainModel.getData());
						that.getView().setModel(oMainModel, "BloccaSchedaModel");

					//	console.log(data22);
					//	oMainModel1.setData(data22);
					//	that.getView().setModel(oMainModel1, "BloccaSchedaModel"); //this is required for fragments setting data
					//	console.log(oMainModel1.getData());
					//	sap.ui.getCore().setModel(oMainModel, "BloccaSchedaModel");

						var colorToSet = "G",
							page = [],
							count = 0,
							m = {};
						this.pageCount = 0;
						debugger;
						var result=oMainModel.getData().Main.length;
						for (var i = 0; i < result ; i++) {
							if (oMainModel.getData().Main[i].ID_SCHEDAMASTER !== "" && colorToSet === "G") {
								colorToSet = String("W");
							} else if (oMainModel.getData().Main[i].ID_SCHEDAMASTER !== "" && colorToSet === "W") {
								colorToSet = String("G");
							}
							oMainModel.getData().Main[i].COLORSET = colorToSet;

							var vv = oMainModel.getData().Main[i].ID_SCHEDAMASTER2 + ":" + oMainModel.getData().Main[i].ID_PISTAVIEW;
							if (count < 50 && !m[vv]) {
								page.push(oMainModel.getData().Main[i]);
								m[vv] = true;
								if (oMainModel.getData().Main[i].ID_SCHEDAMASTER !== "")
									count += 1;
								this.prevEnd = i;
								this.prevStart = 0;
							}
						}
						if (count === 50) {
							for ( i = 0; i < result; i++) {
								if (page[page.length - 1].ID_SCHEDAMASTER2 === oMainModel.getData().Main[i].ID_SCHEDAMASTER2 && page[page.length - 1].ID_PISTA !=
									oMainModel.getData().Main[i].ID_PISTA) {
									page.push(oMainModel.getData().Main[i]);
									this.prevEnd = i;
								}
							}
						}
						this.prevArr = [{
							prevStart: this.prevStart,
							prevEnd: this.prevEnd
						}];
						this.pageCount += count;
						totalschedaCount = data22.length;
						var totalPage = Math.ceil(totalschedaCount / 50);
						this.pageno = 1;
						if (this.pageno === totalPage)
							this.byId("next").setEnabled(false);

						var title = this.getView().getModel("i18n").getResourceBundle().getText("SchedaMaster") + " : " + this.pageCount + "/" +
							totalschedaCount + "\nPage: " + this.pageno + "/" + totalPage;
						that.byId("title").setText(title);

						oMainModel.setProperty("/page", page);
						console.log(oMainModel.getData());
					//	that.getView().setModel(oMainModel, "SchedaMasterModel");
					//	that.getView().getModel("SchedaMasterModel").updateBindings(true);
						//that.getView().setModel(oMainModel, "SchedaMasterModel");
					} else
						MessageBox.error("Nessun dato trovato");
				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Nessun dato trovato");
				}.bind(this)
			});
			xsoDataModel.attachRequestCompleted(function () {
				//debugger;
				//	oMainModel.refresh(true);
			});
		},
		/******************** _next function takes the user to the next page of the table********************************************/
		_next: function () {
			debugger
			this.byId("prev").setEnabled(true);
			var colorToSet = "G",
				page = [],
				count = 0;
			this.prevStart = this.prevEnd + 1;
			var result=oMainModel.getData().Main.length;
			for (var i = this.prevArr[this.prevArr.length - 1].prevEnd + 1; i < result; i++) {

				if (oMainModel.getData().Main[i].ID_SCHEDAMASTER !== "" && colorToSet === "G") {
					colorToSet = String("W");
				} else if (oMainModel.getData().Main[i].ID_SCHEDAMASTER !== "" && colorToSet === "W") {
					colorToSet = String("G");
				}
				oMainModel.getData().Main[i].COLORSET = colorToSet;
				if (count < 50) {
					page.push(oMainModel.getData().Main[i]);
					if (oMainModel.getData().Main[i].ID_SCHEDAMASTER !== "")
						count += 1;
					this.prevEnd = i;

				}
				if (count === 50) {

					if (page[page.length - 1].ID_SCHEDAMASTER2 === oMainModel.getData().Main[i].ID_SCHEDAMASTER2 && page[page.length - 1].ID_PISTA !=
						oMainModel.getData().Main[i].ID_PISTA) {
						page.push(oMainModel.getData().Main[i]);
						this.prevEnd = i;

					}
				}
			}
			this.pageCount += count;

			var totalPage = Math.ceil(totalschedaCount / 50);
			this.pageno += 1;

			var title = this.getView().getModel("i18n").getResourceBundle().getText("SchedaMaster") + " : " + this.pageCount + "/" +
				totalschedaCount + "\nPage: " + this.pageno + "/" + totalPage;
			this.byId("title").setText(title);

			oMainModel.setProperty("/page", page);
			this.getView().setModel(oMainModel, "BloccaSchedaModel");
			if (this.pageno === totalPage)
				this.byId("next").setEnabled(false);
			this.prevArr.push({
				prevStart: this.prevStart,
				prevEnd: this.prevEnd,
				count:count
			});

		},
		/******************** _prev function takes the user to the previous page of the table*******************************************/
		_prev: function () {
			debugger
			this.pageCount-= this.prevArr[this.prevArr.length-1].count;
			this.byId("next").setEnabled(true);
			this.prevArr.pop();
			var colorToSet = "G",
				page = [],
				count = 0;
			this.prevEnd = this.prevStart;
			var result=oMainModel.getData().Main.length;
			//	for (var i = this.prevStart-1; i >=0; i--) {
			for (var i = this.prevArr[this.prevArr.length - 1].prevStart; i < result; i++) {

				if (oMainModel.getData().Main[i].ID_SCHEDAMASTER !== "" && colorToSet === "G") {
					colorToSet = String("W");
				} else if (oMainModel.getData().Main[i].ID_SCHEDAMASTER !== "" && colorToSet === "W") {
					colorToSet = String("G");
				}
				oMainModel.getData().Main[i].COLORSET = colorToSet;
				if (count < 50) {
					page.push(oMainModel.getData().Main[i]);
					if (oMainModel.getData().Main[i].ID_SCHEDAMASTER !== "")
						count += 1;
					this.prevStart = i;

				}
				if (count === 50) {

					if (page[page.length - 1].ID_SCHEDAMASTER2 === oMainModel.getData().Main[i].ID_SCHEDAMASTER2 && page[page.length - 1].ID_PISTA !=
						oMainModel.getData().Main[i].ID_PISTA) {
						page.push(oMainModel.getData().Main[i]);
						this.prevStart = i;

					}
				}

			}

			

			var totalPage = Math.ceil(totalschedaCount / 50);
			this.pageno -= 1;

			var title = this.getView().getModel("i18n").getResourceBundle().getText("SchedaMaster") + " : " + this.pageCount + "/" +
				totalschedaCount + "\nPage: " + this.pageno + "/" + totalPage;
			this.byId("title").setText(title);

			oMainModel.setProperty("/page", page);
			this.getView().setModel(oMainModel, "BloccaSchedaModel");
			if (this.pageno <= 1)
				this.byId("prev").setEnabled(false);

		},
		/******************** onHomePage function naviagtes the user to the Home Page of the StipAdmin module********************************************/
		onHomePage: function (oEvent) {
			this.clear();
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
			this.busyDialog.close();
		},
		/******************** handleBack function naviagtes the user to the previous page (BloccaCongela)********************************************/
		handleBack: function (oEvent) {
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
			if (sap.ui.getCore().byId("FilterDialogBloccaSchedeMaster") !== undefined) {
				var aFilterItems = sap.ui.getCore().byId("FilterDialogBloccaSchedeMaster").getFilterItems();
				aFilterItems.forEach(function (item) {
					var aItems = item.getItems();
					aItems.forEach(function (item) {
						item.setSelected(false);
					});
				});
			}
			if (this.byId("txtID").getValue())
				this.byId("txtID").setValue("");

			if (this.byId("desc").getValue())
				this.byId("desc").setValue("");

			if (this.byId("note").getValue())
				this.byId("note").setValue("");

			if (this.byId("gruppo").getSelectedKey())
				this.byId("gruppo").setSelectedKey("");

			if (this.byId("congelata").getSelectedKey())
				this.byId("congelata").setSelectedKey("");

			if (this.byId("kpiId").getValue())
				this.byId("kpiId").setValue("");

			if (this.byId("txtPista").getValue())
				this.byId("txtPista").setValue("");
			// if (this.byId("idSearchBox").getSelectedKey())
			// this.byId("idSearchBox").setSelectedKey("");

			/*	this.onSearch();
				var oTable = this.getView().byId("tbl");
				var aBinding = oTable.getBinding("items");
				aBinding.filter([]);*/
			/*	if (this.byId("box4").getSelectedKey())
					this.byId("box4").setSelectedKey("");*/
		},
		/******************** selectCong function fetches the ID_SCHEDAMASTER value
		If none is selected, then both buttons Congela Selezionati and Scongela Selezionati are disabled
		else buttons are enabled based on the ID_SCHEDAMASTER and SN_BLOCCATA********************************************/
		selectCong: function (oEvent, id) {
			var f1 = 0,
				f2 = 0;
			if (oEvent.mParameters.selected === true)
				this.congArr.push({
					ID_SCHEDAMASTER: id
				});
			else {
				for (var i = 0; i < this.congArr.length; i++) {
					if (this.congArr[i].ID_SCHEDAMASTER === id)
						this.congArr.splice(i, 1);
				}
			}
			if (this.congArr.length === 0) {
				this.byId("cong").setEnabled(false);
				this.byId("scong").setEnabled(false);
			} else {
				var data = this.getView().getModel("BloccaSchedaModel").getData().Main;
				for (var i = 0; i < this.congArr.length; i++) {
					for (var ii = 0; ii < data.length; ii++) {
						if (this.congArr[i].ID_SCHEDAMASTER === data[ii].ID_SCHEDAMASTER && data[ii].SN_BLOCCATA === "") {
							this.congArr[i].f1 = 1;
							this.congArr[i].f2 = 0;
						} else if (this.congArr[i].ID_SCHEDAMASTER === data[ii].ID_SCHEDAMASTER && data[ii].SN_BLOCCATA !== "") {
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
		 are enabled/disabled based on the ID_SCHEDAMASTER and SN_BLOCCATA********************************************/
		selectCongAll: function (oEvent) {
			if (oEvent.mParameters.selected === false) {
				this.congArr = [];
				this.byId("cong").setEnabled(false);
				this.byId("scong").setEnabled(false);

			} else {
				var data = this.getView().getModel("BloccaSchedaModel").getData().Main;
				for (var i = 0; i < data.length; i++)
					this.congArr.push(data[i].ID_SCHEDAMASTER);

				for (var i = 0; i < this.congArr.length; i++) {
					for (var ii = 0; ii < data.length; ii++) {
						if (this.congArr[i] === data[ii].ID_SCHEDAMASTER && data[ii].SN_BLOCCATA === "")
							this.f1 += 1;
						else
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
				"type": 1,
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
				"type": 1,
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
		/******************** onPress function will remove the fields from Grey, Italic and Label Text wrapping where checkbox is selected
		else will simply remove Grey and Italic from the fields********************************************/
		onPress: function (oItem, oFlag) {
			var oEditableCells = oItem.getCells();
			for (var i = 0; i < oEditableCells.length; i++) {
				if (i < 6) {
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
		onPress1: function (oItem, oFlag) {
			var oEditableCells = oItem.getCells();
			for (var i = 0; i < oEditableCells.length - 2; i++) {
				if (i < 6) {
					if (oEditableCells[i].getMetadata().getElementName() === "sap.m.CheckBox") {
						oEditableCells[i].addStyleClass("stipAdminBloccaCongelatext");
					} else {
						oEditableCells[i].addStyleClass("stipAdminBloccaCongelatext1");
					}
				}
			}
		},
	});

});