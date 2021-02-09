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
	return e.extend("stipAdmin.stipAdmin.controller.ReportIncrociSchede", {
		onInit: function () {

			this._mViewSettingsDialogs = {};
			this.busyDialog = new sap.m.BusyDialog();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("ReportIncrociSchede").attachPatternMatched(this._onObjectMatched, this);
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
		_onObjectMatched: function (e) {
			this.t = e.getParameter("arguments").str;
		//	i = this.t.split(';')[0];
	//		var z = this.t.split(';')[1];
		//	this.selYear = z.substring(12);
			this.IdPeriodo = e.getParameter("arguments").IdPeriodo;
		},

		onValueHelpRequest1: function (oEvent) {
			this.busyDialog.open();
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
					this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.F4GruppiPiste", this);
					this.getView().addDependent(this._oValueHelpDialog);
					this._oValueHelpDialog.setModel(oGruppoModel, 'oGruppoModel');
					this._oValueHelpDialog.open();
					this.busyDialog.close();
				}.bind(this),
				error: function (oError) {
					console.log("Error");
					this.busyDialog.close();
				}.bind(this)
			});
		},
		onValueHelpRequest2: function (oEvent) {
			this.busyDialog.open();
			var oBaseModel = this.getOwnerComponent().getModel();
			oBaseModel.read('/T_GRUPPISCHEDE', {
				filters: [new Filter({
					path: "ID_PERIODO",
					operator: FilterOperator.EQ,
					value1: this.IdPeriodo,
				})],

				success: function (oDataIn, oResponse) {
					console.log("Data Loded");
					var oGruppoModel = new sap.ui.model.json.JSONModel(oDataIn.results);
					this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.F4GruppiSchede", this);
					this.getView().addDependent(this._oValueHelpDialog);
					this._oValueHelpDialog.setModel(oGruppoModel, 'oGruppoModel');
					this._oValueHelpDialog.open();
					this.busyDialog.close();
				}.bind(this),
				error: function (oError) {
					console.log("Error");
					this.busyDialog.close();
				}.bind(this)
			});
		},
		onDialogSelectGruppiScheda: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var selectedObj = aContexts.map(function (oContext) {
				return oContext.getObject()
			});
			var modelGruppoSelected = new sap.ui.model.json.JSONModel(selectedObj[0]);
			this.getView().setModel(modelGruppoSelected, 'modelGruppiScheda');
		},

		onSearchGruppiScheda: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("DESCR_GRUPPOSCHEDA", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);
		},
		onResetta13: function (oEvent) {
			this.byId("sel27").setSelectedKey(null);
			if (this.getView().getModel("modelGruppiScheda")) {
				this.getView().getModel("modelGruppiScheda").setData(null);
			}
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

		onShow: async function (oEvent, fromExcel) {
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			var aFilters = [];
			aFilters.push(new Filter("ID_PERIODO", "EQ", this.IdPeriodo));

			if (this.byId("sel27").getValue() !== "") {
				aFilters.push(new Filter("ID_GRUPPOSCHEDA", "EQ", this.getView().getModel("modelGruppiScheda").getData().ID_GRUPPOSCHEDA));
			}
			// Read IncrociSchede
			var Schede = await this._getHanaData("/IncrociSchede", aFilters);
			if (Schede.length === 0) {
				this.getView().byId("idIncrociScheda").setModel(null);
			} else {

				var multiFilter = [];
				for (i = 0; i < Schede.length; i++) {
					multiFilter.push(new Filter("ID_PISTA", "EQ", Schede[i].ID_PISTE));
				}
				var z = new Filter({
					filters: multiFilter,
					and: false
				});
				aFilters.push(z);

				// Read IncrociMaster
				var Master = await this._getHanaData("/IncrociMaster", aFilters);

				//Colonne
				var columnData = [];
				var line = {
					column: 'DESCR_GRUPPOSCHEDA',
					label: i18n.getText("DESCR_GRUPPOSCHEDA"),
					width: '10em',
					hAlign: "Left"
				};
				columnData.push(line);
				line = {
					column: 'DESCR_SCHEDA',
					label: i18n.getText("DESCR_SCHEDA"),
					width: '20em',
					hAlign: "Left"
				};
				columnData.push(line);
				line = {
					column: 'MAXPERCPAYOUT',
					label: i18n.getText("MAXPERCPAYOUT"),
					width: '7em',
					hAlign: "Center"
				};
				columnData.push(line);
				line = {
					column: 'P4P',
					label: i18n.getText("P4P"),
					width: '5em',
					hAlign: "Center"
				};
				columnData.push(line);
				line = {
					column: 'NOTE',
					label: i18n.getText("NOTE"),
					width: '10em',
					hAlign: "Center"
				};
				columnData.push(line);

				for (i = 0; i < Schede.length; i++) {
					var control = '';
					for (var j = 0; j < columnData.length; j++) {
						if (columnData[j].column === Schede[i].ID_PISTE.toString()) {
							control = 'X';
						}
					}
					if (control !== 'X') {
						line = {
							column: Schede[i].ID_PISTE.toString(),
							label: Schede[i].DESCR_PISTA.toString(),
							width: '15em',
							hAlign: "Center"
						};
						columnData.push(line);
					}
				}

				//Righe
				var rowData = [];
				line = "";
				for (i = 0; i < Master.length; i++) {
					//collegamento nuove colonne 
					if (line === "") {
						line = Master[i];
					}
					if (line.ID_SCHEDAMASTER !== Master[i].ID_SCHEDAMASTER) {
						//Push SCHEDAMASTER
						rowData.push(line);

						line = Master[i];
						line[Master[i].ID_PISTA] = Master[i].PESO_PERCENTUALE + ' %';

					} else {
						line[Master[i].ID_PISTA] = Master[i].PESO_PERCENTUALE + ' %';
					}

					//ultima riga
					if (i === (Master.length - 1)) {
						//Push SCHEDAMASTER
						rowData.push(line);
					}

				}
				for (i = 0; i < rowData.length; i++) {
					for (var j = 0; j < Schede.length; j++) {
						if (rowData[i][Schede[j].ID_PISTE.toString()] === undefined) {
							rowData[i][Schede[j].ID_PISTE.toString()] = '';
						}
					}
				}
				debugger
				//Call from Export Excel 
				if (fromExcel === 'X') {

					var obj = {};
					obj.results = rowData;
					var columnTemplate = [columnData];
					var name = 'SchedePiste.xls';
					tablesToExcel(obj, ['tab1'], columnTemplate, name, 'Excel');

				} else {

					var oTable = this.getView().byId("idIncrociScheda");
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData({
						rows: rowData,
						columns: columnData
					});
					oTable.setModel(oModel);

					oTable.bindColumns("/columns", function (sId, oContext) {
						var columnName = oContext.getObject().column;
						var label = oContext.getObject().label;
						var width = oContext.getObject().width;
						var hAlign = oContext.getObject().hAlign;
						return new sap.ui.table.Column({
							label: label,
							template: columnName,
							width: width,
							hAlign: hAlign
						});
					});
					oTable.bindRows("/rows");
				}
			}
		},

		getPistaFilters: function (aSchede) {

			return new Filter({
				filters: aFilters,
				and: false
			});
		},

		onPressExport: function (oEvent) {
			if (this.getView().byId("idIncrociScheda").getModel().getData() !== null) {
				var obj = {};
				obj.results = this.getView().byId("idIncrociScheda").getModel().getData().rows;
				var columnTemplate = [this.getView().byId("idIncrociScheda").getModel().getData().columns];
				var name = 'SchedePiste.xls';
				tablesToExcel(obj, ['tab1'], columnTemplate, name, 'Excel');
			} else {
				this.onShow(oEvent, 'X');
			}
		}
	});
});