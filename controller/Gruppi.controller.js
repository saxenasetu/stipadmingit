sap.ui.define(["sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageBox",
		"sap/ui/Device",
		"sap/ui/model/Sorter",
		"stipAdmin/stipAdmin/util/Formatter",
		"sap/ui/core/BusyIndicator",
		"./exportExcel"
	],
	function (n, JSONModel, MessageBox, Device, Sorter, Formatter, BusyIndicator, Excel) {
		"use strict";
		var selectedfiscalYearPeriodi;
		var oMainModel = new sap.ui.model.json.JSONModel();
		var oMainModel1 = new sap.ui.model.json.JSONModel();
		var mpm, schedamster;
		var gruppiTipo;
		var max_gruppi_schede = 0,
			max_gruppi_piste = 0,
			idd = 0,
			piste, template_lettersFinal;
		var template_letters, template_letterss = [{
			DESCRIZIONE: '',
			ID_TEMPLATELETTERA: ''
		}];
		var max_gruppi;
		var tp = [{
			desc: "Gruppo KPI"
		}, {
			desc: "Gruppo Scheda"
		}];
		var year = "";
		return n.extend("stipAdmin.stipAdmin.controller.Gruppi", {
			/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
			onInit: function () {
				debugger;
				this.getView().byId("template").setFilterFunction(function(sTerm, oItem) {
				// A case-insensitive 'string contains' filter
				return oItem.getText().match(new RegExp(sTerm, "i")) || oItem.getKey().match(new RegExp(sTerm, "i"));
			});
				var oResource = new sap.ui.model.resource.ResourceModel({
					bundleName: "stipAdmin.stipAdmin.i18n.i18n"
				}).getResourceBundle();
				this.getView().byId("filterbar")._oSearchButton.setText("Cerca"); // Changing filter bar button name
				//this.getView().byId("filterbar")._oSearchButton.setText(oResource.getText("ok"));
				this.getView().byId("filterbar")._oHintText.setText(oResource.getText("noFilter"));
				this.mGroupFunctions = {
						ID: function (oContext) {
							var name = oContext.getProperty("ID");
							return {
								key: name,
								text: name
							};
						},
						DESC: function (oContext) {
							var name = oContext.getProperty("DESC");
							return {
								key: name,
								text: name
							};
						},
						TIPO_GRUPPO: function (oContext) {
							var name = oContext.getProperty("TIPO_GRUPPO");
							return {
								key: name,
								text: name
							};
						},
						TEMPLATE_LETTERE: function (oContext) {
							var name = oContext.getProperty("TEMPLATE_LETTERE");
							return {
								key: name,
								text: name
							};
						}
					},
					this._mViewSettingsDialogs = {};
				this.getOwnerComponent().getRouter().getRoute("Gruppi").attachPatternMatched(this._onObjectMatched, this);
			},
			/******************** _onObjectMatched fetches argument values and depends on role and authorization checkbox visibility********************************************/
			_onObjectMatched: function (oEvent) {
				//this.clear();
				var oArguments = oEvent.getParameter("arguments");
				selectedfiscalYearPeriodi = oArguments.str;
				console.log(selectedfiscalYearPeriodi);
				this.getFiscalYear(selectedfiscalYearPeriodi);
				this.getGruppiResultTableData(selectedfiscalYearPeriodi);
				this.byId("tbl").setVisible(false);
				//if(load === 0)
				this.templateLettereSearch();
				//this.getGruppiResultTableData(selectedfiscalYearPeriodi);
				if (sap.ui.getCore().getModel("BasicAppModel").getProperty("/backk") === "home") {
					this.clear();
					tp = [{
						desc: "Gruppo KPI"
					}, {
						desc: "Gruppo Scheda"
					}];
					//this.onSearch();
				} else if (sap.ui.getCore().getModel("BasicAppModel").getProperty("/backk") === "back" || sap.ui.getCore().getModel("BasicAppModel")
					.getProperty(
						"/backk") === "del") {
					console.log("if")
					oMainModel.refresh();
					this.onSearch();
					this.filter(); //It helps us to navigate to the previous page.
				} else {
					console.log("else");
					this.getView().setModel(oMainModel, "gruppiResultTableModel");
					this.clear();
					//this.onSearch();
					tp = [{
						desc: "Gruppo KPI"
					}, {
						desc: "Gruppo Scheda"
					}];
					oMainModel.refresh();
				}
				oMainModel.setProperty("/tipo", tp);
				oMainModel.setProperty("/template_letters", template_letters);
				//sap.ui.getCore().getModel("BasicAppModel").setProperty("/backk","");
				console.log(this.getView().getModel("gruppiResultTableModel").getData());
			},
			/******************** getFiscalYear function calls generic.xsjs ,payload is ID_PERIODO and output is fiscal year****************************/
			getFiscalYear: function (selectedfiscalYearPeriodi) {
				debugger;
				var sPayload = {
					"ID_PERIODO": selectedfiscalYearPeriodi
				};
				sPayload = JSON.stringify(sPayload);
				var that = this;
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
						BusyIndicator.hide();
						//data1 = JSON.parse(data1);
						// max-gruppi is assigned max_gruppi_schede or max_gruppi_piste whichever is greater and in case of equality max_gruppi_piste is assigned
						max_gruppi_piste = data1[3].ID_GRUPPOPISTA;
						year = data1[1].DESCR_PERIODO;
						max_gruppi_schede = data1[2].ID_GRUPPOSCHEDA;
						max_gruppi = 0;
						if (max_gruppi_schede > max_gruppi_piste)
							max_gruppi = max_gruppi_schede;
						else if (max_gruppi_schede < max_gruppi_piste)
							max_gruppi = max_gruppi_piste;
						else
							max_gruppi = max_gruppi_piste;
						that.byId("year").setText(year);
						//if (sap.ui.getCore().getModel("BasicAppModel").getProperty("/backk") === "back" || sap.ui.getCore().getModel("BasicAppModel").getProperty("/backk") === "del") {}
					}.bind(this),
					error: function (data1, textStatus1) {
						debugger;
						console.log("error");
					}
				});
			},
			/******************** getGruppiResultTableData function fetches the backend data from V_GRUPPI_PISTE based on the selected Fiscal Year period********************************************/
			getGruppiResultTableData: function (selectedfiscalYearPeriodi) {
				//	debugger
				BusyIndicator.show();
				var that = this;
				var count = 0;
				var oView = this.getView();
				var gruppiResultJson = [],
					path;
				var gruppiResultJsonData = {};
				var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
				var oFilters = [];
				selectedfiscalYearPeriodi = parseInt(selectedfiscalYearPeriodi, 10);
				if (selectedfiscalYearPeriodi != undefined && selectedfiscalYearPeriodi != "") {
					var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, selectedfiscalYearPeriodi);
					oFilters.push(filter1);
				}
				xsoDataModel.read("/V_GRUPPI_PISTE?$format=json", {
					filters: oFilters,
					success: function (oDataIn, oResponse) {
						debugger;
						console.log(oDataIn);
						for (var i = 0; i < oDataIn.results.length; i++) {
							/*if (oDataIn.results[i].ID_GRUPPOPISTA > max_gruppi_piste)
								max_gruppi_piste = oDataIn.results[i].ID_GRUPPOPISTA;*/
							//if (oDataIn.results[i].ID_PERIODO === selectedfiscalYearPeriodi) {
							//piste = this.Piste(oDataIn.results[i].ID_GRUPPOPISTA);
							gruppiResultJsonData = {
								"IDD": "",
								"ID": oDataIn.results[i].ID_GRUPPOPISTA,
								"FISCAL_YEAR": selectedfiscalYearPeriodi,
								"DESC": oDataIn.results[i].DESCR_GRUPPOPISTA,
								"TIPO_GRUPPO": "Gruppo KPI",
								"TEMPLATE_LETTERE_ID": "",
								"TEMPLATE_LETTERE": "",
								"Piste": oDataIn.results[i].ID_PISTA
							};
							//max_gruppi_piste = oDataIn.results[i].ID_GRUPPOPISTA + 1;
							//this.Piste(oDataIn.results[i].ID_GRUPPOPISTA);
							gruppiResultJson.push(gruppiResultJsonData);
						}
						//oMainModel.setData(gruppiResultJson);
						//sap.ui.getCore().setModel(oMainModel, "BasicAppModel");
						//}
						console.log(gruppiResultJson);
					}.bind(this),
					error: function (oError) {
						//Handle the error
						MessageBox.error("Data fetch failed while getting T_GRUPPIPISTE. Please contact administrator.");
						jQuery.sap.log.getLogger().error("T_GRUPPIPISTE fetch failed" + oError.toString());
					}.bind(this)
				});
				xsoDataModel.read("/V_GRUPPI_SCHEDA?$format=json", {
					filters: oFilters,
					success: function (oDataIn, oResponse) {
						debugger;
						console.log(oDataIn);
						for (var i = 0; i < oDataIn.results.length; i++) {
							/*if (oDataIn.results[i].ID_GRUPPOSCHEDA > max_gruppi_schede)
								max_gruppi_schede = oDataIn.results[i].ID_GRUPPOSCHEDA;*/
							//if (oDataIn.results[i].ID_PERIODO === selectedfiscalYearPeriodi) {
							//id.push(oDataIn.results[i].ID_GRUPPOPISTA);
							gruppiResultJsonData = {
								"IDD": "",
								"ID": oDataIn.results[i].ID_GRUPPOSCHEDA,
								"FISCAL_YEAR": selectedfiscalYearPeriodi,
								"DESC": oDataIn.results[i].DESCR_GRUPPOSCHEDA,
								"TIPO_GRUPPO": "Gruppo Scheda",
								"TEMPLATE_LETTERE_ID": oDataIn.results[i].ID_TEMPLATELETTERA,
								"TEMPLATE_LETTERE": oDataIn.results[i].NOMETEMPLATE,
								"schedamster": oDataIn.results[i].SCHEDAMASTER
							};
							gruppiResultJson.push(gruppiResultJsonData);
							//}
						}
						if (gruppiResultJson.length == 0) {
							gruppiResultJsonData = {
								"IDD": "",
								"ID": "",
								"FISCAL_YEAR": selectedfiscalYearPeriodi,
								"DESC": "",
								"TIPO_GRUPPO": "",
								"TEMPLATE_LETTERE_ID": "",
								"TEMPLATE_LETTERE": "",
								"Piste": ""
							};
							gruppiResultJson.push(gruppiResultJsonData);
						}
						count += gruppiResultJson.length;
						oMainModel.setData(gruppiResultJson);
						sap.ui.getCore().setModel(oMainModel, "BasicAppModel");
						console.log(gruppiResultJson);
						oMainModel.refresh();
						oMainModel1.setData(
							gruppiResultJson
						);
						if (gruppiResultJson[0].ID === "")
							that.byId("tbl").setVisible(false);
						sap.ui.getCore().setModel(oMainModel1, "gruppiAllDataModel");
						oMainModel1.refresh();

					}.bind(this),
					error: function (oError) {
						//Handle the error
						MessageBox.error("Data fetch failed while getting T_GRUPPISCHEDE. Please contact administrator.");
						jQuery.sap.log.getLogger().error("T_GRUPPISCHEDE fetch failed" + oError.toString());
					}.bind(this)
				});
				/*xsoDataModel.attachRequestCompleted(function () {
					debugger;
					for (var i = 0; i < oMainModel.getData().length; i++) {
						idd.push(oMainModel.getData()[i].ID);
						//path = "/" + i + "/IDD";
						var tlid = oMainModel.getData()[i].TEMPLATE_LETTERE_ID;
						if (tlid !== "")
							that.templateLettere(tlid, i);
					}
					console.log(oMainModel.getData());
				});
				console.log(oMainModel.getData());
				BusyIndicator.hide();*/
			},
			/******************** templateLettere function fetches the data from the backend(TEMPLATELETTERE)********************************************/
			templateLettere: function () {
				var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
				/*var oFilters = [],
					desc;
				var filter1 = new sap.ui.model.Filter("ID_TEMPLATELETTERA", sap.ui.model.FilterOperator.EQ, id);
				oFilters.push(filter1);*/
				xsoDataModel.read("/TEMPLATELETTERE?$format=json", {
					//filters: oFilters,
					success: function (oDataIn, oResponse) {
						debugger;
						//console.log(oDataIn);
						desc = oDataIn.results[0].NOMETEMPLATE;
						//console.log(desc);
					}.bind(this),
					error: function (oError) {
						//Handle the error
						//MessageBox.error("Data fetch failed while getting T_GRUPPISCHEDE. Please contact administrator.");
						jQuery.sap.log.getLogger().error("TEMPLATELETTERE fetch failed" + oError.toString());
					}.bind(this)
				});
				xsoDataModel.attachRequestCompleted(function () {
					debugger;
					var path = "/" + i + "/TEMPLATE_LETTERE";
					oMainModel.setProperty(path, desc);
					oMainModel.refresh();
					BusyIndicator.hide();
					//	}
				});
			},
			/******************** displayGruppi function will navigate to the respective pages based on Tipo_Gruppo field********************************************/
			/******************** If tipo_gruppo='Gruppo KPI' then navigates to 'displayGruppoPiste' page********************************************/
			/******************** If tipo_gruppo='Gruppo Scheda' then navigates to 'displayGruppi_Scheda' page********************************************/
			displayGruppi: function (oEvent) {
				debugger;
				var sPath = oEvent.oSource.mBindingInfos.text.binding.oContext.sPath;
				var idGruppi = this.getView().getModel("gruppiResultTableModel").getProperty(sPath).ID;
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/idGruppi", idGruppi);
				var tipo_gruppo = this.getView().getModel("gruppiResultTableModel").getProperty(sPath).TIPO_GRUPPO;
				var e = sap.ui.core.UIComponent.getRouterFor(this);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/DESCR_PERIODO", year);
				var data = oMainModel.getProperty(sPath);
				var oModModel = new JSONModel();
				oModModel.setData(data);
				sap.ui.getCore().setModel(oModModel, "modModel")
				if (tipo_gruppo === "Gruppo KPI")
					e.navTo("displayGruppoPiste", {
						displayGruppoPiste: "displayGruppoPiste",
						ID_PERIODO: selectedfiscalYearPeriodi,
						SEL_FY_PERIODI: year,
						ID_GRUPPI: idGruppi
					});
				else
					e.navTo("displayGruppi_Scheda", {
						displayGruppoPiste: "displayGruppi_Scheda",
						ID_PERIODO: selectedfiscalYearPeriodi,
						SEL_FY_PERIODI: year,
						ID_GRUPPI: idGruppi
					});
			},
			/******************** onHome function naviagtes the user to the Home Page of the StipAdmin module********************************************/
			onHome: function () {
				this.getView().byId("idSearchBox").setValue("");
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/backk", "home")
				var n = sap.ui.core.UIComponent.getRouterFor(this);
				n.navTo("Home");
			},
			/******************** Piste function is used to maintain the P_PISTE count based on ID_GRUPPOPISTA********************************************/
			Piste: function (id) {
				debugger;
				var i;
				var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
				var oFilters = [];
				debugger;
				var filter2 = new sap.ui.model.Filter("ID_GRUPPOPISTA", sap.ui.model.FilterOperator.EQ, id);
				oFilters.push(filter2);
				xsoDataModel.read("/P_PISTE/$count", {
					async: false,
					filters: oFilters,
					success: function (oDataIn, oResponse) {
						debugger;
						//console.log(oDataIn);
						piste = oResponse.data;
					},
					error: function (oError) {
						piste = 0;
					}
				});
				/*xsoDataModel.attachRequestCompleted(function () {
					debugger;
					sap.ui.getCore().getModel("BasicAppModel").setProperty("/piste", this.piste);
				});*/
				return piste;
			},
			/******************** SchedaMaster function is used to maintain the P_SCHEDEMASTER count based on ID_GRUPPOSCHEDA********************************************/
			SchedaMaster: function (id) {
				debugger;
				var i;
				var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
				var oFilters = [];
				//	debugger;
				var filter2 = new sap.ui.model.Filter("ID_GRUPPOSCHEDA", sap.ui.model.FilterOperator.EQ, id);
				oFilters.push(filter2);
				xsoDataModel.read("/P_SCHEDEMASTER/$count", {
					async: false,
					filters: oFilters,
					success: function (oDataIn, oResponse) {
						debugger;
						console.log(oDataIn);
						schedamster = oResponse.data;
					},
					error: function (oError) {
						schedamster = 0;
					}
				});
				xsoDataModel.attachRequestCompleted(function () {
					debugger;
					sap.ui.getCore().getModel("BasicAppModel").setProperty("/schedamster", schedamster);
				});
			},
			/********************handleModifica function is used to navigate to the respective pages based on the tipo_gruppo ********************************************/
			/********************If tipo_gruppo='Gruppo KPI'then navigates to the modGruppi page********************************************/
			/********************If tipo_gruppo='Gruppo Scheda'then navigates to the modGruppi_Scheda page ********************************************/
			handleModifica: function (oEvent) {
				debugger;
				var sPath = oEvent.oSource.getBindingContext("gruppiResultTableModel").sPath;
				var idGruppi = this.getView().getModel("gruppiResultTableModel").getProperty(sPath).ID;

				sap.ui.getCore().getModel("BasicAppModel").setProperty("/idGruppi", idGruppi);
				var tipo_gruppo = this.getView().getModel("gruppiResultTableModel").getProperty(sPath).TIPO_GRUPPO;
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/DESCR_PERIODO", year);
				var e = sap.ui.core.UIComponent.getRouterFor(this);
				var data = oMainModel.getProperty(sPath);
				if (tipo_gruppo === "Gruppo KPI") {
					//this.Piste(idGruppi);
					//data["Piste"]= piste;
					var oModModel = new JSONModel();
					oModModel.setData(data);
					sap.ui.getCore().setModel(oModModel, "modModel");

					e.navTo("modGruppi", {
						modGruppi: "modGruppi",
						ID_PERIODO: selectedfiscalYearPeriodi,
						SEL_FY_PERIODI: year,
						ID_GRUPPI: idGruppi

					});
				} else {
					//this.SchedaMaster(idGruppi);
					//data["schedamster"]= schedamster;
					var oModModel = new JSONModel();
					oModModel.setData(data);
					oModModel.setProperty("/template_letters", template_letters);
					sap.ui.getCore().setModel(oModModel, "modModel")
					e.navTo("modGruppi_Scheda", {
						modGruppi_Scheda: "modGruppi_Scheda",
						ID_PERIODO: selectedfiscalYearPeriodi,
						SEL_FY_PERIODI: year,
						ID_GRUPPI: idGruppi

					});
				}
			},
			/******************** handleAggiungischeda function navigates to the 'createGruppiSchede' page********************************************/
			/******************** The user can give Descrizione and choose the Template Lettere for a particular Id********************************************/
			handleAggiungischeda: function () {
				//max_gruppi_schede = max_gruppi_schede + 1;
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/nextidGruppi", max_gruppi);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/DESCR_PERIODO", year);
				var n = sap.ui.core.UIComponent.getRouterFor(this);
				//	n.navTo("createGruppiSchede")
				n.navTo("createGruppiSchede", {
					createGruppiSchede: "createGruppiSchede",
					ID_PERIODO: selectedfiscalYearPeriodi,
					SEL_FY_PERIODI: year,
					ID_GRUPPI: max_gruppi
						//	template_letters:template_letters
				});
			},
			/******************** handleAggiungi function navigates to the 'createGruppi' page********************************************/
			/******************** The user can give Descrizione for a particular Id********************************************/
			handleAggiungi: function () {
				//max_gruppi_piste = max_gruppi_piste + 1;
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/nextidGruppi", max_gruppi);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/DESCR_PERIODO", year);
				var n = sap.ui.core.UIComponent.getRouterFor(this);
				//	n.navTo("createGruppi")
				n.navTo("createGruppi", {
					createGruppi: "createGruppi",
					ID_PERIODO: selectedfiscalYearPeriodi,
					SEL_FY_PERIODI: year,
					ID_GRUPPI: max_gruppi
				});
			},
			/******************** templateLettereSearch function fetches the data from the backend TEMPLATELETTERE based on user input********************************************/
			templateLettereSearch: function () {
				debugger;
				BusyIndicator.show();
				var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
				//	debugger;
				template_letters = [{
					"id": 0,
					"desc": ""
				}];
				//template
				var filter1 = new sap.ui.model.Filter("SN_DISMESSO", sap.ui.model.FilterOperator.EQ, "N");
				var filter2 = new sap.ui.model.Filter("ID_TIPOTEMPLATE", sap.ui.model.FilterOperator.NE, 0);
				var oFilters = [];
				oFilters.push(filter1,filter2);
				xsoDataModel.read("/TEMPLATELETTERE?$format=json", {
					async: false,
					filters: oFilters,
					success: function (oDataIn, oResponse) {
						debugger;
						console.log(oDataIn);
						for (var i = 0; i < oDataIn.results.length; i++) {
							template_letters.push({
								"id": oDataIn.results[i].ID_TEMPLATELETTERA,
								"desc": oDataIn.results[i].NOMETEMPLATE
							});
						}
						oMainModel.setSizeLimit(template_letters.length);
						template_lettersFinal = template_letters;
						oMainModel.setProperty("/template_letters", template_letters);
						oMainModel.setProperty("/template_lettersFinal", template_lettersFinal);
						tp = [{
							desc: "Gruppo KPI"
						}, {
							desc: "Gruppo Scheda"
						}];
						oMainModel.setProperty("/tipo", tp);
						BusyIndicator.hide();
						oMainModel.refresh();
					},
					error: function (oError) {
						BusyIndicator.hide();
					}
				});
				/*xsoDataModel.attachRequestCompleted(function () {
					oMainModel.setProperty("/template_letters", template_letters);
					oMainModel.refresh();
					BusyIndicator.hide();
				});*/
			},
			/******************** clear function sets the fields (Id, Descrizione, Tipo Gruppi, Template Lettere) of the filter bar as blank********************************************/
			clear: function () {
				this.gt = "";
				var gruppiAllData = sap.ui.getCore().getModel("gruppiAllDataModel").getData();
				console.log(gruppiAllData);
				oMainModel.setData(
					gruppiAllData
				);
				this.getView().setModel(oMainModel, "gruppiResultTableModel");
				oMainModel.refresh();
				this.byId("vsdFilterBar").setVisible(false);
				this.byId("vsdFilterLabel").setText("");
				this.byId("desc").setValue("");
				this.byId("tipo_gruppi").setSelectedKey("");
				this.byId("template").setSelectedKey("");
				this.byId("id").setValue("");
				//	resetting filter
				if (sap.ui.getCore().byId("FilterDialogGruppi") !== undefined) {
					var aFilterItems = sap.ui.getCore().byId("FilterDialogGruppi").getFilterItems();
					aFilterItems.forEach(function (item) {
						var aItems = item.getItems();
						aItems.forEach(function (item) {
							item.setSelected(false);
						});
					});
				}
			},
			/******************** onSearch function  will invoke 'filterGruppiData' function based on id, desc, gruppiTipo, template********************************************/
			onSearch: function () {
				debugger;
				this.byId("tbl").setVisible(true);
				this.byId("vsdFilterBar").setVisible(false);
				this.byId("vsdFilterLabel").setText("");
				var desc = this.byId("desc").getValue().trim();
				gruppiTipo = this.byId("tipo_gruppi").getSelectedKey();
				var template = this.byId("template").getValue();
				
				var id = this.byId("id").getValue().trim();
				this.filterGruppiData(id, desc, gruppiTipo, template)
			},
			/******************** filterGruppiData function  will fetch and display the data to the user********************************************/
			/******************** If all the fields of filter bar are blank, then entire table data will be displayed********************************************/
			/********************If the fields in the filter bar are non blank then the specific data will be dispalyed********************************************/
			filterGruppiData: function (id, desc, gruppiTipo, template) {
				debugger
				var oFilters = [];
				if (gruppiTipo == "" && desc == "" && template == "" && id == "") {
					var oTable = this.getView().byId("tbl");
					var aBinding = oTable.getBinding("items");
					aBinding.filter(new sap.ui.model.Filter({
						filters: oFilters,
						and: true // AND operator true will check all of the filter conditions get satisfied
					}));
					var aItems = sap.ui.getCore().getModel("gruppiAllDataModel").getData();
					console.log(aItems);
					oMainModel.setData(
						aItems
					);
					this.templateLettereSearch();
					tp = [{
						desc: "Gruppo KPI"
					}, {
						desc: "Gruppo Scheda"
					}];
					oMainModel.setProperty("/tipo", tp);
					this.getView().setModel(oMainModel, "gruppiResultTableModel");
					oMainModel.refresh();
				} else {
					if (gruppiTipo != undefined && gruppiTipo != "") {
						var filter1 = new sap.ui.model.Filter("TIPO_GRUPPO", sap.ui.model.FilterOperator.EQ, gruppiTipo);
						oFilters.push(filter1);
					}
					if (desc != undefined && desc != "") {
						var filter2 = new sap.ui.model.Filter({
							path: 'DESC',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: desc,
							caseSensitive: false
						});
						//var filter2 = new sap.ui.model.Filter("DESC", sap.ui.model.FilterOperator.Contains, desc);
						oFilters.push(filter2);
					}
					if (template != undefined && template != "") {
						var filter3 = new sap.ui.model.Filter("TEMPLATE_LETTERE", sap.ui.model.FilterOperator.Contains, template);
						oFilters.push(filter3);
					}
					if (id != undefined && id != "") {
						var filter4 = new sap.ui.model.Filter("ID", sap.ui.model.FilterOperator.EQ, id);
						oFilters.push(filter4);
					}
					console.log(oFilters);
					var oTable = this.getView().byId("tbl");
					var aBinding = oTable.getBinding("items");
					aBinding.filter(new sap.ui.model.Filter({
						filters: oFilters,
						and: true // AND operator true will check all of the filter conditions get satisfied
					}));

					var tmp = [],
						data = [];
					debugger
					var aItems = sap.ui.getCore().getModel("gruppiAllDataModel").getData();
					var i = 0;
					if (gruppiTipo != undefined && gruppiTipo != "") {
						for (i = 0; i < aItems.length; i++) {
							if (aItems[i].TIPO_GRUPPO === gruppiTipo) {
								tmp = aItems[i];
								data.push(tmp);
							}
						}
						aItems = data;
						data = [];
					}
					if (desc != undefined && desc != "") {
						for (i = 0; i < aItems.length; i++) {
							if (aItems[i].DESC.toLowerCase().includes(desc.toLowerCase())) {
								tmp = aItems[i];
								data.push(tmp);
							}
						}
						aItems = data;
						data = [];
					}
					if (id != undefined && id != "") {
						for (i = 0; i < aItems.length; i++) {
							if (aItems[i].ID === parseInt(id)) {
								tmp = aItems[i];
								data.push(tmp);
							}
						}
						aItems = data;
						data = [];
					}
					if (template != undefined && template != "") {
						for (i = 0; i < aItems.length; i++) {
							if (aItems[i].TEMPLATE_LETTERE.includes(template)) {
								tmp = aItems[i];
								data.push(tmp);
							}
						}
						aItems = data;
						data = [];
					}
					template_letterss = [];
					for (var i = 0; i < aItems.length; i++)
						template_letterss.push({
							desc: aItems[i].TEMPLATE_LETTERE,
							id: aItems[i].TEMPLATE_LETTERE_ID
						});
					var m = {},
						data11 = template_letterss;
					template_letterss = [];
					for (var i = 0; i < data11.length; i++) {
						var vv = data11[i].id;
						if (!m[vv]) {
							m[vv] = true;
							template_letterss.push(data11[i]);
						}
					}
					console.log(aItems);
					oMainModel.setData(
						aItems
					);
					var tg = [];
					for (var i = 0; i < aItems.length; i++)
						tg.push(aItems[i].TIPO_GRUPPO);
					var m = {};
					var data11 = tg;
					tg = [];
					for (var i = 0; i < data11.length; i++) {
						var vv = data11[i];
						if (!m[vv]) {
							m[vv] = true;
							tg.push(vv);
						}
					}
					if (tg.length === 1)
						this.gt = tg[0];
					else
						this.gt = "";
					console.log(this.gt);
					var ll = [],
						tp = [];
					if (gruppiTipo === "Gruppo KPI" || this.gt === "Gruppo KPI") {
						oMainModel.setProperty("/template_letters", ll);
						tp = [{
							desc: "Gruppo KPI"
						}];
						template_lettersFinal = [];

					} else if (gruppiTipo === "Gruppo Scheda" || this.gt === "Gruppo Scheda") {
						oMainModel.setProperty("/template_letters", template_letterss);
						tp = [{
							desc: "Gruppo Scheda"
						}];
						template_lettersFinal = sap.ui.getCore().getModel("gruppiAllDataModel").getProperty("/template_lettersFinal");

					} else {
						oMainModel.setProperty("/template_letters", template_letterss);
						tp = [{
							desc: "Gruppo KPI"
						}, {
							desc: "Gruppo Scheda"
						}];
						template_lettersFinal = sap.ui.getCore().getModel("gruppiAllDataModel").getProperty("/template_lettersFinal");

					}
					oMainModel.setProperty("/tipo", tp);
					oMainModel.setProperty("/template_lettersFinal", template_lettersFinal);
					//this.templateLettereSearch();
					//color template letter
					/*	oTable.getColumns()[3].setStyleClass("grayBackground1");
						for ( i = 0; i < aItems.length; i++) {
							 oItems = oTable.getItems()[i];
							 if(aItems[i].TIPO_GRUPPO == "Gruppo Scheda")
							this.onPress(oItems);
						}*/
					this.getView().setModel(oMainModel, "gruppiResultTableModel");
					console.log(this.getView().getModel("gruppiResultTableModel").getData());

					console.log(sap.ui.getCore().getModel("gruppiAllDataModel").getData());
					oMainModel.refresh();
				}
				var count = this.getView().getModel("gruppiResultTableModel").getData().length;
				var txt = this.getView().getModel("i18n").getResourceBundle().getText("Gruppi") + " (" + count + ")";
				this.byId("title").setText(txt);
			},
			/******************** onPress function will remove the grayBackground1 class from the specific cell********************************************/
			/*onPress: function (oItem) {
				var oEditableCells = oItem.getCells();
				for (var i = 0; i < oEditableCells.length; i++) {
					if (i == 3) {
						oEditableCells[i].removeStyleClass("grayBackground1");

					}
				}
			},*/
			/***************************** start of Toolbar  methods****************************************************************/
			/***************************** start of Toolbar search operation method*************************************************/
			/******************* onTableSearch function is used to search the records in the table tbl based on the search value filter
		which is present on the Toolbar just above the table based on the parameters(Id, Descrizione, Tipo Gruppo, Template Lettere)********************/
			onTableSearch: function (oEvent) {
				var sQuery = oEvent.getParameter("query");
				sQuery = sQuery.trim();
				if (!sQuery) {
					this.clear();
					var oTable = this.getView().byId("tbl");
					var aBinding = oTable.getBinding("items");
					aBinding.filter([]);
				} else {
					var tmp = [],
						data = [];
					debugger
					var oModel = this.getView().getModel('gruppiResultTableModel').getData();
					for (var i = 0; i < oModel.length; i++) {
						if (oModel[i].ID == parseInt(sQuery) || oModel[i].DESC.toLowerCase().includes(sQuery.toLowerCase()) || oModel[i].TIPO_GRUPPO ==
							sQuery || oModel[i].TEMPLATE_LETTERE ==
							sQuery) {
							tmp = oModel[i];
							data.push(tmp);
						}
					}
					console.log(data);
					oMainModel.setData(
						data
					);
					var tg = [];
					for (var i = 0; i < data.length; i++)
						tg.push(data[i].TIPO_GRUPPO);
					var m = {};
					var data11 = tg;
					tg = [];
					for (var i = 0; i < data11.length; i++) {
						var vv = data11[i];
						if (!m[vv]) {
							m[vv] = true;
							tg.push(vv);
						}
					}
					if (tg.length === 1)
						this.gt = tg[0];
					else
						this.gt = "";
					console.log(this.gt);
					this.getView().setModel(oMainModel, "gruppiResultTableModel");
					oMainModel.refresh();
				}
			},
			/***************************** end of Toolbar search operation method*******************/
			/************************createViewSettingsDialog function is used to create a popup dialog box for Sort, Filter and Group functions ********************************/

			createViewSettingsDialog: function (sDialogFragmentName) {
				//           debugger;
				var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];
				if (!oDialog) {
					oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
					this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;
					oDialog.setModel(this.getView().getModel("gruppiResultTableModel"));
					this.getView().addDependent(oDialog);
					if (Device.system.desktop) {
						oDialog.addStyleClass("sapUiSizeCompact");
					}
				}
				return oDialog;
			},
			/************************handleSortButtonPressed function accesses the sortGruppi fragment 
		based on the parameters(Id, Descrizione, Template Lettere)********************************/
			handleSortButtonPressed: function (oEvent) {
				this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.sortGruppi").open();
			},
			/************************sort function allows the user to sort the data of the tbl as per the user 
		selected values of Id, Descrizione, Template Lettere either in ascending or descending order********************************/
			sort: function (oEvent) {
				debugger;
				var oTable = this.byId("tbl"),
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
			/************************handleFilterButtonPressed function accesses the filter_Gruppi fragment 
			 based on Gruppo KPI or Gruppo Scheda ********************************/
			handleFilterButtonPressed: function (oEvent) {
				debugger
				var ll = [];
				var gg = [{
					desc: "Gruppo KPI"
				}, {
					desc: "Gruppo Scheda"
				}];
				if (gruppiTipo === "Gruppo KPI" || this.gt === "Gruppo KPI") {
					//oMainModel.setProperty("/template_letterss", ll);
					gg = [{
						desc: "Gruppo KPI"
					}];
				} else if (gruppiTipo === "Gruppo Scheda" || this.gt === "Gruppo Scheda") {
					gg = [{
						desc: "Gruppo Scheda"
					}];
					//oMainModel.setProperty("/template_letterss", template_letterss);
				} else
				//oMainModel.setProperty("/template_letterss", template_letters);
					oMainModel.setProperty("/tipo_gruppo", gg);
				//oMainModel.refresh();

				var desc = [];
				for (var i = 0; i < oMainModel.getData().length; i++)
					desc.push(oMainModel.getData()[i].DESC);
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

				this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.filter_Gruppi").open();
				//oMainModel.setProperty("/template_letters",template_letters);
			},
			/************************filter function allows the user to filter the data of the periodiTable 
		as per the user selected values of Id, Descrizione, Tipo Gruppo, Template Lettere********************************/
			filter: function (oEvent) {
				debugger;
				var that = this;
				this.byId("vsdFilterBar").setVisible(false);
				this.byId("vsdFilterLabel").setText("");
				var oTable = this.byId("tbl");
				if (oEvent) {
					var mParams = oEvent.getParameters();
					mpm = oEvent.getParameters();
				} else
					mParams = mpm;
				var oBinding = oTable.getBinding("items"),
					aFilters = [],
					oFilter;
				var tmp = [],
					data = [];
				var duplicateIdArray = [];
				mParams.filterItems.forEach(function (oItem) {
					var sPath = oItem.getKey();
					var text = oItem.getText();
					if (text !== "") {
						oFilter = new sap.ui.model.Filter(sPath, "EQ", text);
						aFilters.push(oFilter);
						var oModel = that.getView().getModel('gruppiResultTableModel').getData();
						for (var i = 0; i < oModel.length; i++) {
							if (oModel[i].ID == text || oModel[i].DESC == text || oModel[i].TIPO_GRUPPO == text || oModel[i].TEMPLATE_LETTERE == text) {
								tmp = oModel[i];
								//break;
								data.push(tmp);
							}
						}
					}
					//
				});
				// apply filter settings
				oBinding.filter(aFilters);
				var tmpGruppi = [],
					arrGruppo = [],
					duplicateArray = [];
				for (var i = 0; i < data.length; i++) {
					//**********************start of removing duplicate ID_Gruppi**************************
					if (data[i].ID !== null && data[i].ID !== "") {
						var ID_Gruppi = data[i].ID;
						if (!duplicateArray[ID_Gruppi]) {
							tmpGruppi = data[i];
							duplicateArray[ID_Gruppi] = true;
							console.log(tmpGruppi);
							arrGruppo.push(tmpGruppi);
						}
					}
					//**********************end of removing duplicate ID_Gruppi**************************
				}
				template_letterss = [];
				for (var i = 0; i < arrGruppo.length; i++)
					template_letterss.push({
						desc: arrGruppo[i].TEMPLATE_LETTERE,
						id: arrGruppo[i].TEMPLATE_LETTERE_ID
					});
				var m = {},
					data11 = template_letterss;
				template_letterss = [];
				for (var i = 0; i < data11.length; i++) {
					var vv = data11[i].id;
					if (!m[vv]) {
						m[vv] = true;
						template_letterss.push(data11[i]);
					}
				}
				console.log(arrGruppo);
				console.log(template_letterss);
				oMainModel.setData(
					arrGruppo
				);
				var tg = [];
				for (var i = 0; i < data.length; i++)
					tg.push(data[i].TIPO_GRUPPO);
				var m = {};
				var data11 = tg;
				tg = [];
				for (var i = 0; i < data11.length; i++) {
					var vv = data11[i];
					if (!m[vv]) {
						m[vv] = true;
						tg.push(vv);
					}
				}
				if (tg.length === 1)
					this.gt = tg[0];
				else
					this.gt = "";
				var ll = [],
					tp = [];
				if (gruppiTipo === "Gruppo KPI" || this.gt === "Gruppo KPI") {
					oMainModel.setProperty("/template_letters", ll);
					tp = [{
						desc: "Gruppo KPI"
					}];
					template_lettersFinal = [];
				} else if (gruppiTipo === "Gruppo Scheda" || this.gt === "Gruppo Scheda") {
					oMainModel.setProperty("/template_letters", template_letterss);
					tp = [{
						desc: "Gruppo Scheda"
					}];
					template_lettersFinal = sap.ui.getCore().getModel("gruppiAllDataModel").getProperty("/template_lettersFinal");

				} else {
					oMainModel.setProperty("/template_letters", template_letterss);
					tp = [{
						desc: "Gruppo KPI"
					}, {
						desc: "Gruppo Scheda"
					}];
					template_lettersFinal = sap.ui.getCore().getModel("gruppiAllDataModel").getProperty("/template_lettersFinal");

				}
				oMainModel.setProperty("/tipo", tp);

				oMainModel.setProperty("/template_lettersFinal", template_lettersFinal);
				this.getView().setModel(oMainModel, "gruppiResultTableModel");
				oMainModel.refresh();
				var count = this.getView().getModel("gruppiResultTableModel").getData().length;
				var txt = this.getView().getModel("i18n").getResourceBundle().getText("Gruppi") + " (" + count + ")";
				this.byId("title").setText(txt);
				// update filter bar
				this.byId("vsdFilterBar").setVisible(aFilters.length > 0);
				this.byId("vsdFilterLabel").setText(mParams.filterString);
				/*resetting filter
				var aFilterItems = sap.ui.getCore().byId("FilterDialog").getFilterItems();
				aFilterItems.forEach(function (item) {
					var aItems = item.getItems();
					aItems.forEach(function (item) {
						item.setSelected(false);
					});
				}); */
			},
			/************************handleGroupButtonPressed function accesses the group_Gruppi fragment 
			based on the parameters(Id, Descrizione, Tipo Gruppo, Template Lettere)********************************/
			handleGroupButtonPressed: function (oEvent) {
				this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.group_Gruppi").open();
			},
			/************************group function allows the user to group the data of the tbl based on the user selected
			values of Id, Descrizione, Tipo Gruppo, Template Lettere or None based on ascending or descending order********************************/
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
			/*******************onUpdateFinished function will colour the  blank cells of TEMPLATE_LETTERE as Grey********************/
			/****TIPO Gruppi= Tipo scheda ******************/
			onUpdateFinished: function () {
				var oTable = this.getView().byId("tbl");
				var oItems = oTable.getItems();
				for (var i = 0; i < oTable.getItems().length; i++) {
					if (oItems[i].getCells()[3].getText() === "") {
						oItems[i].getCells()[3].$().addClass("background_grey");
					}
				}
			},
			/*******************onDataExport function is used to download the table data in the Excel format
		  (with fields ID, DESC, TIPO_GRUPPO, TEMPLATE_LETTERE)********************/
			onDataExport: function (oEvent) {
				debugger;
				var oModel = this.getView().getModel('gruppiResultTableModel').getData();
				var columnTemplate = [
					[{
							column: 'ID',
							label: 'ID Gruppi'
						}
						/*, {
											column: 'FISCAL_YEAR',
											label: 'ID Periodo'
										}*/
						, {
							column: 'DESC',
							label: 'Descrizone'
						}, {
							column: 'TIPO_GRUPPO',
							label: 'Tipo Gruppo'
						}, {
							column: 'TEMPLATE_LETTERE',
							label: 'Template Lettere'
						}
					]
				];
				debugger
				/*	var aItems = this.getView().byId('tbl').getItems();
					var tmp = {};
					var dataExport = [];
					for (var i = 0; i < aItems.length; i++) {
						tmp = {
							ID: aItems[i].getBindingContext("gruppiResultTableModel").getObject().ID,
							DESC: aItems[i].getBindingContext("gruppiResultTableModel").getObject().DESC,
							TIPO_GRUPPO: aItems[i].getBindingContext("gruppiResultTableModel").getObject().TIPO_GRUPPO,
							TEMPLATE_LETTERE: aItems[i].getBindingContext("gruppiResultTableModel").getObject().TEMPLATE_LETTERE
						}
						dataExport.push(tmp);
					}*/
				for (var i = 0; i < oModel.length; i++) {
					oModel[i].ID = oModel[i].ID
					oModel[i].DESC = oModel[i].DESC;
					oModel[i].TIPO_GRUPPO = oModel[i].TIPO_GRUPPO
					oModel[i].TEMPLATE_LETTERE = oModel[i].TEMPLATE_LETTERE;
				}
				var obj = {}
				obj.results = oModel;
				tablesToExcel(obj, ['Gruppi'], columnTemplate, 'Gruppi.xls', 'Excel');
			},
		});
	});