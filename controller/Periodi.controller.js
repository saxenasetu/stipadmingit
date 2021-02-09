sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/Device",
	"sap/m/TablePersoController",
	"./DemoPersoService",
	"stipAdmin/stipAdmin/util/Formatter",
	"sap/ui/model/json/JSONModel",
	"./exportExcel",
	"sap/ui/model/Sorter",
	"sap/m/MessageBox"
], function (Controller, Fragment, Device, TablePersoController, DemoPersoService, Formatter, JSONModel, exportExcel, Sorter, MessageBox) {
	"use strict";
	var oResource;
	var oMainModel = new sap.ui.model.json.JSONModel();
	var f, countPiste, countSM, countSP, mpm = "";
	var periodiIdSequnce = 0;
	return Controller.extend("stipAdmin.stipAdmin.controller.Periodi", {
			/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
			onInit: function () {
				debugger
				var oResource = new sap.ui.model.resource.ResourceModel({
					bundleName: "stipAdmin.stipAdmin.i18n.i18n"
				}).getResourceBundle();
				this.getView().byId("filterbar")._oSearchButton.setText("Cerca"); // Changing filter bar button name
				//	this.getView().byId("filterbar")._oSearchButton.setText(oResource.getText("ok"));
				this.getView().byId("filterbar")._oHintText.setText(oResource.getText("noFilter"));
				this._mViewSettingsDialogs = {};
				this.busyDialog = new sap.m.BusyDialog;
				//	debugger
				this.getOwnerComponent().getRouter().getRoute("Periodi").attachPatternMatched(this._onObjectMatched, this);
				//this.getView().byId("filterbar")._oSearchButton.setText("Cerca"); // Changing filter bar button name
				this.mGroupFunctions = {

					DESCR_PERIODO: function (oContext) {
						var name = oContext.getProperty("DESCR_PERIODO");
						return {
							key: name,
							text: name
						};
					},

					VALE_DAL: function (oContext) {
						var name = oContext.getProperty("VALE_DAL");
						return {
							key: name,
							text: name
						};
					},

					VALE_AL: function (oContext) {
						var name = oContext.getProperty("VALE_AL");
						return {
							key: name,
							text: name
						};
					}
				};
			},
			/*******************onHome method navigates user to Home Page of STIPAdmin module*****************************/
			onHome: function () {
				//	debugger;
				this.getView().byId("idSearchBox").setValue("");
				console.log("Back");
				var n = sap.ui.core.UIComponent.getRouterFor(this);
				n.navTo("Home");
			},
			/******************** _onObjectMatched fetches argument values and depends on role and authorization checkbox visibility********************************************/
			_onObjectMatched: function (oEvent) {
					debugger
					this.getPeriodiTableData();
					this.getFiscalYear();

				
				//this.getView().byId("periodiTable").setVisible(true);
				//if (sap.ui.getCore().getModel("BasicAppModel").getProperty("/back") === "back")
				//this.getView().byId("periodiTable").setVisible(true);

		},
		/******************** getFiscalYear function calls generic.xsjs ,payload is ID_PERIODO and output is fiscal year****************************/
		/******************** START of getFiscalYear method*********************************/
		getFiscalYear: function (selectedfiscalYearPeriodi) {
			debugger;

			var sPayload = {
				"ID_PERIODO": 0
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

					periodiIdSequnce = data1[17].ID_PERIODO;

				}.bind(this),
				error: function (data1, textStatus1) {
					debugger;
					console.log("error");

				}
			});
		},
		/******************** END of getFiscalYear method*********************************/

		/*	onReset: function (oEvent) {
				var sMessage = "onReset trigered";
				sap.m.MessageBox.success("Fields Reset");
			},*/
		/************************clear function clears all the upper filter values and makes it blank by default********************************/
		clear: function (oEvent) {
			/*	var data = [];
			oMainModel.setData(data);
			this.getView().setModel(oMainModel, "PeriodiTableModel");
			oMainModel.refresh();*/

			this.getView().byId("periodiIdInput").setValue("");
			this.getView().byId("periodiStartDate").setValue("");
			this.getView().byId("periodiEndDate").setValue("");
			//this.getView().byId("periodiDesc").setText("-");
			this.getView().byId("periodiDesc").setSelectedKey("");
			this.byId("vsdFilterLabel").setText("");
			this.byId("vsdFilterBar").setVisible(false);
			this.byId("periodiTable").getBinding("items").sort();
			if (sap.ui.getCore().byId("FilterDialog") !== undefined) {
				var aFilterItems = sap.ui.getCore().byId("FilterDialog").getFilterItems();
				aFilterItems.forEach(function (item) {
					var aItems = item.getItems();
					aItems.forEach(function (item) {
						item.setSelected(false);
					});
				});
			}
			//	this.onSearch();
		},
		/************************dateValue function is used to set the date format based on / or - and sets the hours and minutes********************************/
		dateValue: function (date) {
			//	debugger;
			if (date.includes("/")) {
				date = date.replace(/\//g, "-");
				var dt = date.split("-");
				date = dt[1] + "-" + dt[0] + "-" + dt[2];
				date = new Date(date);
				date.setHours("05");
				date.setMinutes("30");
			} else if (date.includes("-")) {
				date = new Date(date);
				date.setHours("05");
				date.setMinutes("30");
			}
			console.log(date);
			return date;
		},
		/************************handleDateChange1 function is used to enable/disable the EndDate based on the StartDate********************************/
		handleDateChange1: function (oEvent) {
			debugger;
			var periodiStartDate = this.getView().byId("periodiStartDate").getValue();
			if (periodiStartDate !== "")
				this.getView().byId("periodiEndDate").setEnabled(false);

			else
				this.getView().byId("periodiEndDate").setEnabled(true);
			oMainModel.refresh();
		},
		/************************handleDateChange2 function is used to enable/disable the StartDate based on the EndDate********************************/
		handleDateChange2: function (oEvent) {
			debugger;
			var periodiEndDate = this.getView().byId("periodiEndDate").getValue();
			if (periodiEndDate !== "")
				this.getView().byId("periodiStartDate").setEnabled(false);
			else
				this.getView().byId("periodiStartDate").setEnabled(true);
			oMainModel.refresh();
		},
		/*******************onSearch function fetches the data as per the upper filter values********************/
		onSearch: function (oEvent) {
			debugger;
			var periodiIdInput = this.getView().byId("periodiIdInput").getValue();
			if (periodiIdInput != undefined && periodiIdInput != "")
				periodiIdInput = parseInt(periodiIdInput);
			var periodiDesc = this.getView().byId("periodiDesc").getSelectedKey();
			//	debugger
			//var periodiStartDate = (this.getView().byId("periodiStartDate").getValue()).toString();
			var periodiStartDate = this.getView().byId("periodiStartDate").getValue();
			if (periodiStartDate != undefined && periodiStartDate != "") {
				//periodiStartDate = this.dateValue(periodiStartDate);
				periodiStartDate = Formatter.removetime(new Date(periodiStartDate));
			}
			//var periodiEndDate = (this.getView().byId("periodiEndDate").getValue()).toString();
			var periodiEndDate = this.getView().byId("periodiEndDate").getValue();
			if (periodiEndDate != undefined && periodiEndDate != "") {
				//periodiEndDate = this.dateValue(periodiEndDate);
				periodiEndDate = Formatter.removetime(new Date(periodiEndDate));
				//	periodiEndDate.setDate(periodiEndDate.getDate() + 1);
			}
			console.log(periodiIdInput + periodiDesc + periodiStartDate + periodiEndDate);
			//	this.getPeriodiTableData(periodiIdInput, periodiDesc, periodiStartDate, periodiEndDate);
			this.filterPeriodiTableData(periodiIdInput, periodiDesc, periodiStartDate, periodiEndDate);
			//var oTable = this.getView().byId("periodiTable");
			//var aBinding = oTable.getBinding("items");
			//aBinding.filter([]);
		},
		/******************* In filterPeriodiTableData function, we are ready with the filters********************/
		/******************** START of filterPeriodiTableData method*********************************/
		filterPeriodiTableData: function (periodiIdInput, periodiDesc, periodiStartDate, periodiEndDate) {
			debugger
			var oFilters = [];
			if (periodiIdInput === "" && periodiDesc === "" && periodiStartDate === "" && periodiEndDate === "") {
				this.getView().byId("periodiTable").setVisible(true);

				var aItems = this.getView().getModel("PeriodiFilterTableModel").getData();
				console.log(aItems);
				oMainModel.setData(
					aItems
				);
				this.getView().setModel(oMainModel, "PeriodiTableModel");
				oMainModel.refresh();
			} else {
				if (periodiIdInput != undefined && periodiIdInput != "") {
					var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, periodiIdInput);
					oFilters.push(filter1);
				}
				if (periodiDesc != undefined && periodiDesc != "" && periodiDesc != "-") {
					//var filter2 = new sap.ui.model.Filter("DESCR_PERIODO", sap.ui.model.FilterOperator.Contains, periodiDesc);
					var filter2 = new sap.ui.model.Filter({
						path: 'DESCR_PERIODO',
						operator: sap.ui.model.FilterOperator.Contains,
						value1: periodiDesc,
						caseSensitive: false
					});
					oFilters.push(filter2);
				}
				/*if (periodiStartDate != undefined && periodiStartDate != "") {
					periodiStartDate = Formatter.removetime(new Date(periodiStartDate));
						
					var filter3 = new sap.ui.model.Filter("VALE_DAL", sap.ui.model.FilterOperator.GE, periodiStartDate);
					oFilters.push(filter3);
				}
				if (periodiEndDate != undefined && periodiEndDate != "") {
					periodiEndDate = Formatter.removetime(new Date(periodiEndDate));
					
					var filter4 = new sap.ui.model.Filter("VALE_AL", sap.ui.model.FilterOperator.LE, periodiEndDate);
					oFilters.push(filter4);
				}*/
				console.log(oFilters);
				/*//this.getView().byId("periodiTable").setVisible(true);
				var oTable = this.getView().byId("periodiTable");
				var aBinding = oTable.getBinding("items");
				aBinding.filter(new sap.ui.model.Filter({
					filters: oFilters,
					and: true // AND operator true will check all of the filter conditions get satisfied
				}));*/
				var tmp = [],
					data = [];
				debugger
				var aItems = this.getView().getModel("PeriodiFilterTableModel").getData();
				var i = 0;
				if (periodiIdInput != undefined && periodiIdInput != "") {
					for (i = 0; i < aItems.length; i++) {
						if (aItems[i].ID_PERIODO === parseInt(periodiIdInput, 10)) {
							tmp = aItems[i];
							data.push(tmp);
						}
					}
					aItems = data;
					data = [];
				}
				if (periodiDesc != undefined && periodiDesc != "") {
					for (i = 0; i < aItems.length; i++) {
						if (aItems[i].DESCR_PERIODO.includes(periodiDesc)) {
							tmp = aItems[i];
							data.push(tmp);
						}
					}
					aItems = data;
					data = [];
				}
				if (periodiStartDate != undefined && periodiStartDate != "") {
					periodiStartDate = periodiStartDate.split("-");
					periodiStartDate = periodiStartDate[1] + "-" + periodiStartDate[0] + "-" + periodiStartDate[2];
					debugger;
					for (i = 0; i < aItems.length; i++) {
						var periodiStartDate2 = aItems[i].VALE_DAL.split("-");
						periodiStartDate2 = periodiStartDate2[1] + "-" + periodiStartDate2[0] + "-" + periodiStartDate2[2];

						if (new Date(periodiStartDate2) >= new Date(periodiStartDate)) {
							tmp = aItems[i];
							data.push(tmp);
						}
					}
					aItems = data;
					data = [];
				}
				if (periodiEndDate != undefined && periodiEndDate != "") {
					periodiEndDate = periodiEndDate.split("-");
					periodiEndDate = periodiEndDate[1] + "-" + periodiEndDate[0] + "-" + periodiEndDate[2];
					for (i = 0; i < aItems.length; i++) {
						var periodiEndDate2 = aItems[i].VALE_AL.split("-");
						periodiEndDate2 = periodiEndDate2[1] + "-" + periodiEndDate2[0] + "-" + periodiEndDate2[2];

						if (new Date(periodiEndDate2) <= new Date(periodiEndDate)) {
							tmp = aItems[i];
							data.push(tmp);
						}
					}
					aItems = data;
					data = [];
				}
				oMainModel.setData(
					aItems
				);
				this.getView().setModel(oMainModel, "PeriodiTableModel");
				oMainModel.refresh();

				//this.getView().byId("periodiTable").setVisible(true);
			}
			var count = this.getView().getModel("PeriodiTableModel").getData().length;
			var txt = this.getView().getModel("i18n").getResourceBundle().getText("Periodi") + " (" + count + ")";
			this.byId("title").setText(txt);
		},
		/******************** END of filterPeriodiTableData method*********************************/
		/******************* getPeriodiTableData function fetches the desired data from the backened as per the filters********************/
		/******************** START of getPeriodiTableData method*********************************/
		getPeriodiTableData: function (periodiIdInput, periodiDesc, periodiStartDate, periodiEndDate) {
			//	debugger
			var that = this;
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			var descModel = new sap.ui.model.json.JSONModel();
			var idGetJsonData = [],
				idJsonData = [];
			debugger

			var periodiIdModel = new sap.ui.model.json.JSONModel();

			var periodiRiferimentoGetJson = [];
			var descData = [{
				"DESCR_PERIODO": "-"
			}];
			var desc = {};
			var periodiRiferimentoGetJsonData = {};
			xsoDataModel.read("/PERIODI_RIFERIMENTO?$format=json", {
				//	filters: oFilters,
				success: function (oDataIn, oResponse) {
					//	debugger;
					console.log(oDataIn);
					for (var i = 0; i < oDataIn.results.length; ++i) {
						periodiRiferimentoGetJsonData = {
							"DESCR_PERIODO": oDataIn.results[i].DESCR_PERIODO,
							"ID_PERIODO": oDataIn.results[i].ID_PERIODO,
							"NOTA_SCHEDA": oDataIn.results[i].NOTA_SCHEDA,
							//	"VALE_AL": Formatter.formatUTCDate(oDataIn.results[i].VALE_AL),
							//	"VALE_DAL": Formatter.formatUTCDate(oDataIn.results[i].VALE_DAL),
							"VALE_AL": Formatter.removetime(oDataIn.results[i].VALE_AL),
							"VALE_DAL": Formatter.removetime(oDataIn.results[i].VALE_DAL)
						};
						desc = {
							"DESCR_PERIODO": oDataIn.results[i].DESCR_PERIODO
						};
						console.log("desc: " + i + " " + desc);
						descData.push(desc);
						periodiRiferimentoGetJson.push(periodiRiferimentoGetJsonData);
						console.log(periodiRiferimentoGetJson);
						idGetJsonData = {
							"ID_PERIODO": oDataIn.results[i].ID_PERIODO
						};
						idJsonData.push(idGetJsonData);
					}

					console.log(idJsonData);
					periodiIdModel.setData(idJsonData);
					//	sap.ui.getCore().setModel(periodiIdModel, "periodiIdFragModel");
					this.getView().setModel(periodiIdModel, "periodiIdFragModel");

					console.log(periodiRiferimentoGetJson);
					var oMainModel22 = new JSONModel;
					oMainModel22.setData(
						periodiRiferimentoGetJson
					);
					descModel.setData(descData);
					//this.getView().setModel(oMainModel22, "PeriodiTableModel");
					sap.ui.getCore().setModel(oMainModel, "BasicAppModel"); //This is BasicAppModel model which can be used in display,create,view of periodi controllers
					this.getView().setModel(descModel, "PeriodiDisplayModel");
					var oMainModel2 = new JSONModel;
					oMainModel2.setData(periodiRiferimentoGetJson);
					this.getView().setModel(oMainModel2, "PeriodiFilterTableModel");
					this.getView().byId("periodiTable").setVisible(true);

				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed while getting PERIODI_RIFERIMENTO. Please contact administrator.");
					jQuery.sap.log.getLogger().error("PERIODI_RIFERIMENTO fetch failed" + oError.toString());
				}.bind(this)
			});
			xsoDataModel.attachRequestCompleted(function () {

				if (sap.ui.getCore().getModel("BasicAppModel").getProperty("/back") === "back") {
					that.onSearch();
					that.filter();

				} else {
					//	this.clear();
					that.getView().byId("periodiIdInput").setValue("");
					that.getView().byId("periodiStartDate").setValue("");
					that.getView().byId("periodiEndDate").setValue("");
					//this.getView().byId("periodiDesc").setText("-");
					that.getView().byId("periodiDesc").setSelectedKey("");
					that.getView().byId("periodiTable").setVisible(false);

				}
			});
		},
		/******************** END of getPeriodiTableData method*********************************/
		/******************** getModifyFields function fetches the P_PISTE, P_SCHEDEPERSONALI
		and P_SCHEDEMASTER count and validates if the data is present at the backend*********************************/
		/******************** START of getModifyFields method*********************************/
		getModifyFields: function () {
			debugger
			var that = this;
			var periodiIdInput = sap.ui.getCore().getModel("BasicAppModel").getProperty("/DISPLAY_PERIODI_VIEW_ID");

			//	periodiIdInput = parseInt(periodiIdInput, 10) + 1;

			var oFilters = [];
			f = 0, countPiste = 0, countSM = 0, countSP = 0;
			var p;
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/f", f);
			var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, periodiIdInput);
			oFilters.push(filter1);
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			xsoDataModel.read("/P_PISTE/$count", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;
					if (oResponse.data !== "0") {
						countPiste = oResponse.data;
					}
					console.log("P_Piste : " + countPiste);
					sap.ui.getCore().getModel("BasicAppModel").setProperty("/countPiste", countPiste);
				}.bind(this),
				error: function (oError) {
					//debugger;
					console.log(oError);
				}.bind(this)
			});
			xsoDataModel.read("/P_SCHEDEPERSONALI/$count", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;
					if (oResponse.data !== "0") {
						countSP = oResponse.data;
					}
					console.log("P_SCHEDEPERSONALI : " + countSP);
					sap.ui.getCore().getModel("BasicAppModel").setProperty("/countSP", countSP);
				}.bind(this),
				error: function (oError) {
					//debugger;
					console.log(oError);
				}.bind(this)
			});
			xsoDataModel.read("/P_SCHEDEMASTER/$count", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;
					if (oResponse.data !== "0") {
						countSM = oResponse.data;
					}
					console.log("P_SCHEDEMASTER : " + countSM);
					sap.ui.getCore().getModel("BasicAppModel").setProperty("/countSM", countSM);
					var t = sap.ui.core.UIComponent.getRouterFor(that);
					t.navTo("modPeriodi", {
						/******************** Here, we navigate to 'modPeriodi' where periodIdInput,countSM,countPiste,countSP 
						are passed as the parameters*********************************/
						periodi: "modPeriodi",
						id: periodiIdInput,
						countSM: countSM,
						countPiste: countPiste,
						countSP: countSP
					});
				}.bind(this),
				error: function (oError) {
					//	debugger;
					console.log(oError);
				}.bind(this)
			});
			/*	xsoDataModel.attachRequestCompleted(function () {
					sap.ui.getCore().getModel("BasicAppModel").setProperty("/f", f);
					console.log("Periodi: f: " + sap.ui.getCore().getModel("BasicAppModel").getProperty("/f"));
					p = 1;
				});*/
			/*if(p===1)
			this.navModify();*/
		},
		/******************** END of getModifyFields method*********************************/
		/**********************************************START of filter Bar methods**********************************************/
		/******************* handleEmpValueHelp function fetches the data into the dialog box from the 'PeriodoIdFragment' ********************/
		handleEmpValueHelp: function (oEvent) {
			var that = this;
			//	console.log(sap.ui.getCore().getModel("periodiIdFragModel").getData());
			console.log(this.getView().getModel("periodiIdFragModel").getData());
			var idPath = oEvent.getSource().sId;
			if (!that._valueHelpDialog) {
				that._valueHelpDialog = sap.ui.xmlfragment(
					"stipAdmin.stipAdmin.fragment.PeriodoIdFragment", that);
				that._valueHelpDialog.setModel(that.getView().byId("periodiIdInput").getModel("PeriodiTableModel"));
				that._valueHelpDialog.setModel(that.getView().getModel("periodiIdFragModel"));
				sap.ui.getCore().byId(idPath).addDependent(that._valueHelpDialog);
				//this.getView().addDependent(this._valueHelpDialog);
			}
			that._valueHelpDialog.open();
		},
		/*******************_handleValueHelpSearch function is used to search the ID value from the ValueHelpSearch dialog box ********************/
		_handleValueHelpSearch: function (oEvent) {
			var oFilters = [];
			var svalue = parseInt(oEvent.getParameters("selectedItem").value);
			var oFilter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, svalue);
			oFilters.push(oFilter1);
			// filter binding
			var oList = sap.ui.getCore().byId("idPeriodoSelect");
			var oBinding = oList.getBinding("items");
			oBinding.filter(oFilters);
		},
		/******************* _handleEmployeesconfirm function fetches the selected value to the Id filter********************/
		_handleEmployeesconfirm: function (oEvent) {
			var t = oEvent.getParameter("selectedItem");
			if (t) {
				this.getView().byId("periodiIdInput").setValue(t.getTitle())
			}
			oEvent.getSource().getBinding("items").filter([])
		},
		/******************* _handleValueHelpClose function closes the ValueHelpSearch dialog box********************/
		_handleValueHelpClose: function (oEvent) {
			this._valueHelpDialog.close();
		},
		/**********************************************END of filter Bar methods**********************************************/

		/******************* handleAggiungi function is used to navigate to the other page 'CreatePeriodi'********************/
		handleAggiungi: function () {
			//	debugger

			sap.ui.getCore().getModel("BasicAppModel").setProperty("/DISPLAY_PERIODI_SEQUENCE_ID", periodiIdSequnce);
			var t = sap.ui.core.UIComponent.getRouterFor(this);
			t.navTo("createPeriodi", {
				periodi: "createPeriodi",
				str: periodiIdSequnce
			});
		},
		/******************* handleModifica function is used to modify the fields for the particularly selected Id********************/
		handleModifica: function (oEvent) {
			var periodiIdndex = oEvent.oSource.getBindingContext("PeriodiTableModel").sPath;

			//	periodiIdndex = periodiIdndex.replace("/", "");

			periodiIdndex = oMainModel.getProperty(periodiIdndex).ID_PERIODO;
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/DISPLAY_PERIODI_VIEW_ID", periodiIdndex);
			this.getModifyFields();
		},
		/******************* navModify function is used to navigate to the other page 'modPeriodi'********************/
		navModify: function (oEvent) {
			var t = sap.ui.core.UIComponent.getRouterFor(this);
			t.navTo("modPeriodi");
		},
		/******************* displayPeriodiView function is used to navigate to the other page 'displayPeriodi'********************/
		displayPeriodiView: function (oEvent) {
			var periodiIdndex = oEvent.oSource.getBindingContext("PeriodiTableModel").sPath;
			//periodiIdndex = periodiIdndex.replace("/", "");
			periodiIdndex = oMainModel.getProperty(periodiIdndex).ID_PERIODO;
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/DISPLAY_PERIODI_VIEW_ID", periodiIdndex);
			var t = sap.ui.core.UIComponent.getRouterFor(this);
			t.navTo("displayPeriodi", {
				periodi: "displayPeriodi",
				id: periodiIdndex
			});
		},
		/***************************** start of Toolbar  methods****************************************************************/
		/***************************** start of Toolbar search operation method*************************************************/
		/******************* onTableSearch function is used to search the records in the table based on the search value filter
		which is present on the Toolbar just above the table based on the parameters(DESCR_PERIODO,ID_PERIODO,VALE_DAL,VALE_AL)********************/
		onTableSearch: function (oEvent) {
			var sQuery = oEvent.getParameter("query");
			sQuery = sQuery.trim();
			var aFilters = [];

			if (!sQuery) {
				this.clear();
				this.onSearch();
				/*	var oTable = this.getView().byId("periodiTable");
					var aBinding = oTable.getBinding("items");
					aBinding.filter([]);
					console.log(aBinding);*/
				//	var data = sap.ui.getCore().getModel("BasicAppModel").getData();
			} else {
				var tmp = [],
					data = [];
				debugger
				var aItems = this.getView().byId('periodiTable').getItems();
				for (var i = 0; i < aItems.length; i++) {

					if (aItems[i].getBindingContext("PeriodiTableModel").getObject().DESCR_PERIODO.toLowerCase().includes(sQuery.toLowerCase()) ||
						aItems[i].getBindingContext(
							"PeriodiTableModel").getObject().ID_PERIODO === parseInt(sQuery) || aItems[i].getBindingContext("PeriodiTableModel").getObject()
						.VALE_DAL === sQuery || aItems[i].getBindingContext("PeriodiTableModel").getObject().VALE_AL === sQuery) {
						tmp = aItems[i].getBindingContext("PeriodiTableModel").getObject();
						data.push(tmp);
					}

				}
				console.log(data);
				oMainModel.setData(
					data
				);
				this.getView().setModel(oMainModel, "PeriodiTableModel");
			}

		},
		/***************************** end of Toolbar seatch operation method*************************************************/
		/*******************onDataExport function is used to download the table data in the Excel format
		  (with all four fields ID_PERIODO, DESCR_PERIODO, VALE_DAL, VALE_AL)********************/
		onDataExport: function (oEvent) {
			//	var oModel = this.getView().getModel('PeriodiTableModel').getData();
			oResource = this.getView().getModel("i18n").getResourceBundle();
			var columnTemplate = [
				[{
					column: 'ID_PERIODO',
					label: oResource.getText("Id")
				}, {
					column: 'DESCR_PERIODO',
					label: oResource.getText("Desc")
				}, {
					column: 'VALE_DAL',
					label: oResource.getText("DAL")
				}, {
					column: 'VALE_AL',
					label: oResource.getText("AI")
				}]
			];
			/*	for (var i = 0; i < oModel.length; i++) {
					oModel[i].ID_PERIODO = oModel[i].ID_PERIODO
					oModel[i].DESCR_PERIODO = oModel[i].DESCR_PERIODO;
					oModel[i].VALE_DAL = Formatter.formatUTCDate(oModel[i].VALE_DAL);
					oModel[i].VALE_AL = Formatter.formatUTCDate(oModel[i].VALE_AL);
				}
				var obj = {}
				obj.results = oModel;
				console.log(oModel);*/
			debugger
			var aItems = this.getView().byId('periodiTable').getItems();

			var tmp = {};
			var dataExport = [];
			for (var i = 0; i < aItems.length; i++) {
				tmp = {
					ID_PERIODO: aItems[i].getBindingContext("PeriodiTableModel").getObject().ID_PERIODO,
					DESCR_PERIODO: aItems[i].getBindingContext("PeriodiTableModel").getObject().DESCR_PERIODO,
					VALE_DAL: aItems[i].getBindingContext("PeriodiTableModel").getObject().VALE_DAL,
					VALE_AL: aItems[i].getBindingContext("PeriodiTableModel").getObject().VALE_AL
						/*	VALE_DAL: Formatter.formatUTCDate(aItems[i].getBindingContext("PeriodiTableModel").getObject().VALE_DAL),
							VALE_AL: Formatter.formatUTCDate(aItems[i].getBindingContext("PeriodiTableModel").getObject().VALE_AL),*/
				}
				dataExport.push(tmp);
			}
			var obj = {}
			obj.results = dataExport;
			console.log(dataExport);
			tablesToExcel(obj, ['tab1'], columnTemplate, 'Fiscal Year.xls', 'Excel');
		},
		/************************createViewSettingsDialog function is used to create a popup dialog box for Sort, Filter and Group functions ********************************/
		createViewSettingsDialog: function (sDialogFragmentName) {
			//	debugger;
			var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
				this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;
				console.log(this.getView().getModel("PeriodiTableModel"));
				oDialog.setModel(this.getView().getModel("PeriodiTableModel"));
				this.getView().addDependent(oDialog);
				if (Device.system.desktop) {
					oDialog.addStyleClass("sapUiSizeCompact");
				}
			}
			return oDialog;
		},
		/************************handleSortButtonPressed function accesses the sort_Periodi fragment 
		based on the parameters(ID_PERIODO,DESCR_PERIODO,VALE_DAL,VALE_AL)********************************/
		handleSortButtonPressed: function () {
			this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.sort_Periodi").open();
		},
		/************************sort function allows the user to sort the data of the periodiTable as per the user 
		selected values of ID_PERIODO, DESCR_PERIODO, VALE_DAL, VALE_AL either in ascending or descending order********************************/
		sort: function (oEvent) {
			//	debugger;
			var oTable = this.byId("periodiTable"),
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
		/************************handleFilterButtonPressed function accesses the filter_Periodi fragment 
		based on the parameters(DESCR_PERIODO,VALE_DAL,VALE_AL)********************************/
		handleFilterButtonPressed: function (oEvent) {
			this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.filter_Periodi").open();
		},
		/************************filter function allows the user to filter the data of the periodiTable 
		as per the user selected values of DESCR_PERIODO, VALE_DAL, VALE_AL********************************/
		/**********************************************START of filter function**********************************************/
		filter: function (oEvent) {
			//	debugger;
			var tmp = [],
				data = [];
			var that = this;
			this.byId("vsdFilterBar").setVisible(false);
			this.byId("vsdFilterLabel").setText("");
			var that = this;
			var oTable = this.getView().byId("periodiTable");
			if (oEvent) {
				var mParams = oEvent.getParameters();
				mpm = oEvent.getParameters();
			} else
				mParams = mpm;
			var oModel = this.getView().getModel("PeriodiFilterTableModel").getData();
			var oBinding = oTable.getBinding("items"),
				aFilters = [],
				oFilter;
			mParams.filterItems.forEach(function (oItem) {
				var sPath = oItem.getKey();
				var text = oItem.getText();

				console.log(sPath + text);

				if (text !== "-") {
					debugger;
					if (text.includes("/")) //Check date format
						text = that.dateValue(text); //converts date format
					oFilter = new sap.ui.model.Filter(sPath, sap.ui.model.FilterOperator.EQ, text);
					aFilters.push(oFilter);
					//var oModel = sap.ui.getCore().getModel("BasicAppModel").getData();

					for (var i = 0; i < oModel.length; i++) {
						if ((sPath === "ID_PERIODO" && oModel[i].ID_PERIODO === parseInt(text, 10)) || (sPath === "DESCR_PERIODO" && oModel[i].DESCR_PERIODO ===
								text) || (sPath === "VALE_DAL" && oModel[i].VALE_DAL.includes(text)) || (sPath === "VALE_AL" && oModel[i].VALE_AL.includes(
								text))) {

							/*if (oModel[i].ID_PERIODO === text || oModel[i].DESCR_PERIODO === text || Formatter.removetime(new Date(oModel[i].VALE_DAL)) >=
								Formatter.removetime(new Date(text)) || Formatter.removetime(new Date(oModel[i].VALE_AL)) <= Formatter.removetime(new Date(text))) {
							*/
							tmp = oModel[i];
							//break;
							data.push(tmp);
						}
					}
				}
				//oBinding.filter(aFilters);
				var m = {},
					data11 = data;
				data = [];
				for (var i = 0; i < data11.length; i++) {
					var vv = data11[i].ID_PERIODO;
					if (!m[vv]) {
						m[vv] = true;
						data.push(data11[i]);
					}
				}
				oMainModel.setData(data);

				that.getView().setModel(oMainModel, "PeriodiTableModel");
				console.log(that.getView().getModel("PeriodiTableModel").getData());
				oMainModel.refresh();
				var count = that.getView().getModel("PeriodiTableModel").getData().length;
				var txt = that.getView().getModel("i18n").getResourceBundle().getText("Periodi") + " (" + count + ")";
				that.byId("title").setText(txt);
			});
			// apply filter settings
			//oBinding.filter(aFilters);
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
		/**********************************************END of filter function**********************************************/
		/************************handleGroupButtonPressed function accesses the group_Periodi fragment 
		based on the parameters(DESCR_PERIODO,VALE_DAL,VALE_AL)********************************/
		handleGroupButtonPressed: function (oEvent) {
			this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.group_Periodi").open();
		},
		/************************group function allows the user to group the data of the periodiTable
		based on the user selected values of DESCR_PERIODO, VALE_DAL, VALE_AL or None based on ascending or descending order********************************/
		group: function (oEvent) {
			//	debugger;
			var oTable = this.byId("periodiTable"),
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
		}
	});
});