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
	return e.extend("stipAdmin.stipAdmin.controller.ReportAnalisiCurve", {
		onInit: function () {

			this._mViewSettingsDialogs = {};
			this.busyDialog = new sap.m.BusyDialog();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("ReportAnalisiCurve").attachPatternMatched(this._onObjectMatched, this);
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
			this.t = e.getParameter("arguments").str;
		//	i = this.t.split(';')[0];
		//	var z = this.t.split(';')[1];
		//	this.selYear = z.substring(12);
			this.IdPeriodo = e.getParameter("arguments").IdPeriodo;
		},

		onValueHelpRequest1: function (oEvent) {
			this.busyDialog.open();
			var oBaseModel = this.getOwnerComponent().getModel();
			oBaseModel.read('/T_TIPI_CURVE', {
				success: function (oDataIn, oResponse) {
					console.log("Data Loded");
					var oGruppoModel = new sap.ui.model.json.JSONModel(oDataIn.results);
					this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.F4TypeCurve", this);
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
			oBaseModel.read('/T_CURVE', {
				filters: [new Filter({
					path: "ID_PERIODO",
					operator: FilterOperator.EQ,
					value1: this.IdPeriodo,
				})],
				success: function (oDataIn, oResponse) {
					console.log("Data Loded");
					var oGruppoModel = new sap.ui.model.json.JSONModel(oDataIn.results);
					this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.F4NomeCurve", this);
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
		onDialogSelectNome: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var selectedObj = aContexts.map(function (oContext) {
				return oContext.getObject()
			});
			var modelGruppoSelected = new sap.ui.model.json.JSONModel(selectedObj[0]);
			this.getView().setModel(modelGruppoSelected, 'modelNomeSelected');
		},
		onSearchNome: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("DESCR_CURVA", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);
		},
		onDialogSelectType: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var selectedObj = aContexts.map(function (oContext) {
				return oContext.getObject()
			});
			var modelGruppoSelected = new sap.ui.model.json.JSONModel(selectedObj[0]);
			this.getView().setModel(modelGruppoSelected, 'modelTypeSelected');
		},
		onSearchType: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("DESCR_TIPO_CURVA", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);
		},
		onResetta13: function (oEvent) {
			this.byId("sel26").setSelectedKey(null);
			this.byId("sel27").setSelectedKey(null);
			if (this.getView().getModel("modelTypeSelected")) {
				this.getView().getModel("modelTypeSelected").setData(null);
			}
			if (this.getView().getModel("modelNomeSelected")) {
				this.getView().getModel("modelNomeSelected").setData(null);
			}
		},

		onShow13: async function (oEvent, columnTemplate) {

			//var i18n = this.getView().getModel("i18n").getResourceBundle();

			var aFilters = [];
			var oFilter = '';

			oFilter = new Filter({
				path: 'ID_PERIODO',
				operator: 'EQ',
				value1: this.IdPeriodo
			});
			aFilters.push(oFilter);
			if (this.byId("sel26").getValue() !== "") {
				oFilter = new Filter({
					path: 'ID_TIPO_CURVA',
					operator: 'EQ',
					value1: parseInt(this.getView().getModel('modelTypeSelected').getData().ID_TIPO_CURVA)
				});
				aFilters.push(oFilter);
			}
			if (this.byId("sel27").getValue() !== "") {
				oFilter = new Filter({
					path: 'DESCR_CURVA',
					operator: 'EQ',
					value1: this.byId("sel27").getValue()
				});
				aFilters.push(oFilter);
			}

			var Curve = await this._getHanaData("/AnalisiCurve", aFilters);
			if (columnTemplate !== undefined) {
				var obj = {};
				obj.results = Curve;
				var name = 'AnalisiCurve.xls';
				tablesToExcel(obj, ['tab1'], columnTemplate, name, 'Excel');
			} else {
				if (Curve.length > 0) {
					var oModelReport2 = new sap.ui.model.json.JSONModel(Curve);
					this.getView().setModel(oModelReport2, "oModelReport2");
				} else {
					MessageToast.show('No Data Found on Selected Criteria');
					if (!oModelReport2) {
						this.getView().getModel("oModelReport2").setData(null);
					}
				}
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
		onPressExport: function (oEvent) {
			var oModel = this.getView().getModel('oModelReport2');
			var columnTemplate = [
				[{
					column: 'ID_CURVA',
					label: 'Id Curva'
				}, {
					column: 'DESCR_CURVA',
					label: 'Nome Curva'
				}, {
					column: 'DESCR_TIPO_CURVA',
					label: 'Tipo'
				}, {
					column: 'SN_GATE',
					label: 'Associabile Gate'
				}, {
					column: 'PERC_MBO',
					label: 'Perc. Stip’'
				}, {
					column: 'VALORE',
					label: 'Valore Curva’'
				}]
			];
			if (oModel !== undefined) {
				var obj = {};
				obj.results = oModel.getData();
				var name = 'AnalisiCurve.xls';
				tablesToExcel(obj, ['tab1'], columnTemplate, name, 'Excel');
			} else {
				this.onShow13(oEvent, columnTemplate);
			}
		}
	});
});