sap.ui.define(["sap/m/TablePersoController", "sap/ui/core/Fragment",
	"sap/ui/Device", "./DemoPersoService", "./Formatter", "sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel", "sap/m/MessageBox", "stipAdmin/stipAdmin/util/Formatter", "./exportExcel", "sap/ui/model/Sorter",
], function (e, Fragment, Device, o, t, n, i, MessageBox, Formatter, Excel, Sorter) {
	"use strict";
	var id = [];
	var f;
	var maxCurveId = 0,
		load = 0;
	var oMainModel = new sap.ui.model.json.JSONModel();
	var oMainModel1 = new sap.ui.model.json.JSONModel();
	var selectedfiscalYearPeriodi;
	var year = "";
	var oFilters = [];
	return n.extend("stipAdmin.stipAdmin.controller.Curve", {
		onInit: function () {
			this._mViewSettingsDialogs = {};
			this.busyDialog = new sap.m.BusyDialog;
			var oResource = new sap.ui.model.resource.ResourceModel({
				bundleName: "stipAdmin.stipAdmin.i18n.i18n"
			}).getResourceBundle();
			this.getView().byId("filterbar")._oSearchButton.setText("Cerca"); // Changing filter bar button name
			//this.getView().byId("filterbar")._oSearchButton.setText(oResource.getText("ok"));
			this.getView().byId("filterbar")._oHintText.setText(oResource.getText("noFilter"));
			this.getOwnerComponent().getRouter().getRoute("Curve").attachPatternMatched(this._onObjectMatched, this);
			this.mGroupFunctions = {
				DESCR_CURVA: function (oContext) {
					var name = oContext.getProperty("DESCR_CURVA");
					return {
						key: name,
						text: name
					};
				},
				ID_TIPO_CURVA: function (oContext) {
					var name = oContext.getProperty("ID_TIPO_CURVA");
					return {
						key: name,
						text: Formatter.convertIdTipoToDesc(name)
					};
				},
				NUMERO_PUNTI: function (oContext) {
					var name = oContext.getProperty("NUMERO_PUNTI");
					return {
						key: name,
						text: name
					};
				},
				PISTE: function (oContext) {
					var name = oContext.getProperty("PISTE");
					return {
						key: name,
						text: name
					};
				}
			};
		},
		/**********************************************START of Curve page methods**********************************************/
		_onObjectMatched: function (oEvent) {
			var oArguments = oEvent.getParameter("arguments");
			selectedfiscalYearPeriodi = oArguments.str;
			console.log(selectedfiscalYearPeriodi);
			this.getFiscalYear(selectedfiscalYearPeriodi);
			//	this.clear();
			debugger
			this.getView().byId("curveResultTable").setVisible(false);
			if (sap.ui.getCore().getModel("BasicAppModel").getProperty("/change") === "change")
			//this.getCurveResultTableData(oFilters);
				this.onSearch();
			else {
				this.getView().byId("desc").setValue("");
				this.getView().byId("select0").setSelectedKey("");
				this.getView().byId("selectCurve").setSelectedKey("");
			}
		},

		filtersDialogBeforeOpen: function (oEvent) {
			debugger
			console.log(oEvent.getSource());
			console.log(oEvent.getParameters());

		},
		getFiscalYear: function (selectedfiscalYearPeriodi) {
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

					year = data1[1].DESCR_PERIODO;

					that.byId("fy").setText(year);
					maxCurveId = data1[9].ID_CURVA;

				}.bind(this),
				error: function (data1, textStatus1) {
					debugger;
					console.log("error");
				}
			});
		},
		getCurveResultTableData: function (oFilters) {
			debugger
			//this.getFiscalYear(selectedfiscalYearPeriodi);
			//load = 1;
			this.getView().byId("curveResultTable").setVisible(false);
			var curveResultJson = [];
			oMainModel.setData(curveResultJson);
			var curveResultJsonData = {};
			var tipo = [],
				mul = [],
				desc = [];

			var sPayload = {
				"ID_PERIODO": selectedfiscalYearPeriodi
			};
			sPayload = JSON.stringify(sPayload);
			var that = this;
			var url = "/HANAMDC/STIP/STIPAdmin/services/V_CURVA.xsjs";
			$.ajax({
				url: url,
				type: "GET",
				contentType: "application/json",
				data: {
					odata: sPayload
				},

				success: function (oDataIn, oResponse) {
					debugger;
					console.log(oDataIn);

					if (oDataIn.length > 0) {

						for (var i = 0; i < oDataIn.length; i++) {
							id.push(oDataIn[i].ID_CURVA);
							if (oDataIn[i].SN_GATE === "N")
								oDataIn[i].SN_GATE = "";
							
							curveResultJsonData = {
								"FISCAL_YEAR": selectedfiscalYearPeriodi,
								"DESCR_CURVA": oDataIn[i].DESCR_CURVA,
								"ID_TIPO_CURVA": oDataIn[i].ID_TIPO_CURVA,
								"SN_GATE": oDataIn[i].SN_GATE,
								"ID_CURVA": oDataIn[i].ID_CURVA, // this ID_CURVE will be required to calculate numeropunti and piste in result table
								"NUMERO_PUNTI": oDataIn[i].NUMERO_PUNTI,
								"PISTE": oDataIn[i].PISTE
							};
							f = 1;
							//maxCurveId = oDataIn.results[i].ID_CURVA + 1;
							curveResultJson.push(curveResultJsonData);

							//	console.log(this.getView().getModel("curveResultTableModel").getData());
						}
						var m = {},
							data11 = curveResultJson;
						curveResultJson = [];
						for (var i = 0; i < data11.length; i++) {
							var vv = data11[i].ID_CURVA;
							if (!m[vv]) {
								m[vv] = true;
								curveResultJson.push(data11[i]);
							}
						}
						
						console.log(curveResultJson);

						sap.ui.getCore().setModel(oMainModel, "BasicAppModel");

						this.getView().setModel(oMainModel, "curveResultTableModel");
						oMainModel.refresh();
						
						this.getView().byId("curveResultTable").setVisible(true);
						this.getView().byId("curveResultTable").getBinding("items").filter(oFilters);
						var index = this.getView().byId("curveResultTable").getBinding("items").aIndices;
						var storeTmp = [];
						for(var i = 0;i<oMainModel.getData().length;i++){
							for(var j = 0;j<index.length;j++){
								if(i===index[j]){
									storeTmp.push(oMainModel.getData()[i]);
									tipo.push(oMainModel.getData()[i].ID_TIPO_CURVA);
							mul.push(oMainModel.getData()[i].SN_GATE);
							desc.push(oMainModel.getData()[i].DESCR_CURVA);
								}
							}
						}
						var m = {},
							data11 = tipo;
						tipo = [];
						for (var i = 0; i < data11.length; i++) {
							var vv = data11[i];
							if (!m[vv]) {
								m[vv] = true;
								tipo.push(Formatter.convertIdTipoToDesc(data11[i]));
							}
						}
						var m = {},
							data11 = mul;
						mul = [];
						for (var i = 0; i < data11.length; i++) {
							var vv = data11[i];
							if (!m[vv]) {
								m[vv] = true;
								if (vv === "" || vv === "N")
									mul.push("No");
								else
									mul.push("Si");
								//mul.push(data11[i]);
							}
						}
						var m = {},
							data11 = desc;
						desc = [];
						for (var i = 0; i < data11.length; i++) {
							var vv = data11[i];
							if (!m[vv]) {
								m[vv] = true;
								desc.push({
									DESCR_CURVA: data11[i]
								});
							}
						}
						oMainModel.setData(storeTmp);
						oMainModel.setProperty("/tipo", tipo);
						oMainModel.setProperty("/mul", mul);
						oMainModel.setProperty("/desc", desc);
						var count = this.getView().byId("curveResultTable").getBinding("items").aIndices.length;
						var txt = this.getView().getModel("i18n").getResourceBundle().getText("Curve") + " (" + count + ")";
						this.byId("title").setText(txt);
						//oMainModel.setData(curveResultJson);
						oFilters = [];
						if(count===0)
						MessageBox.error("Nessuna curva esistente");

					} else
						MessageBox.error("Nessuna curva esistente");
				}.bind(this),
				error: function (oError) {
					//Handle the error
					oFilters = [];
					MessageBox.error("Data fetch failed while getting T_Curve. Please contact administrator.");
					jQuery.sap.log.getLogger().error("T_Curve fetch failed" + oError.toString());
				}.bind(this)
			});

		},
		//getCurveResultTableDataAll this function is used to set curveAllDataModel
		getCurveResultTableDataAll: function (selectedfiscalYearPeriodi) {
			//	debugger
			//this.getFiscalYear(selectedfiscalYearPeriodi);
			load = 1;
			this.getView().byId("curveResultTable").setVisible(false);
			var curveResultJson = [];
			var curveResultJsonData = {};
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			oFilters = [];
			if (selectedfiscalYearPeriodi != undefined && selectedfiscalYearPeriodi != "") {
				var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, selectedfiscalYearPeriodi);
				oFilters.push(filter1);
			}
			xsoDataModel.read("/V_CURVA?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					//	debugger;
					//	console.log(oDataIn);
					if (oDataIn.results.length > 0) {
						this.getView().byId("curveResultTable").setVisible(false);
						for (var i = 0; i < oDataIn.results.length; i++) {
							id.push(oDataIn.results[i].ID_CURVA);
							if (oDataIn.results[i].SN_GATE === "N")
								oDataIn.results[i].SN_GATE = "";
							curveResultJsonData = {
								"FISCAL_YEAR": selectedfiscalYearPeriodi,
								"DESCR_CURVA": oDataIn.results[i].DESCR_CURVA,
								"ID_TIPO_CURVA": oDataIn.results[i].ID_TIPO_CURVA,
								"SN_GATE": oDataIn.results[i].SN_GATE,
								"ID_CURVA": oDataIn.results[i].ID_CURVA, // this ID_CURVE will be required to calculate numeropunti and piste in result table
								"NUMERO_PUNTI": oDataIn.results[i].NUMERO_PUNTI,
								"PISTE": oDataIn.results[i].PISTE
							};
							f = 1;

							curveResultJson.push(curveResultJsonData);
							//oMainModel.setData(curveResultJson);
							sap.ui.getCore().setModel(oMainModel, "BasicAppModel");
							//oView.setModel(oMainModel, "curveResultTableModel");

							//this.getView().setModel(oMainModel, "curveResultTableModel");
							oMainModel.refresh();
							//	console.log(this.getView().getModel("curveResultTableModel").getData());
						}
						//this.NumeroPunti();
						//this.Piste();
						console.log(curveResultJson);
						oMainModel1.setData(
							curveResultJson
						);
						sap.ui.getCore().setModel(oMainModel1, "curveAllDataModel");
						oMainModel1.refresh();
					} else
						MessageBox.error("Nessuna curva esiste");
				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed while getting T_Curve. Please contact administrator.");
					jQuery.sap.log.getLogger().error("T_Curve fetch failed" + oError.toString());
				}.bind(this)
			});
		},

		onHome: function () {
			this.getView().byId("idSearchBox").setValue("");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/change", ""); //resetting to blank
			var n = sap.ui.core.UIComponent.getRouterFor(this);
			n.navTo("Home");
		},
		onPersoButtonPressed: function (e) {
			this._oTPC.openDialog()
		},
		onTablePersoRefresh: function () {
			o.resetPersData();
			this._oTPC.refresh()
		},
		onTableGrouping: function (e) {
			this._oTPC.setHasGrouping(e.getSource().getSelected())
		},
		handleModifica: function (oEvent) {
			debugger;
			var curveIdContext = oEvent.oSource.getBindingContext("curveResultTableModel").sPath;
			var idCurve = this.getView().getModel("curveResultTableModel").getProperty(curveIdContext + "/ID_CURVA");
			var descrCurve = this.getView().getModel("curveResultTableModel").getProperty(curveIdContext + "/DESCR_CURVA");
			var piste = this.getView().getModel("curveResultTableModel").getProperty(curveIdContext).PISTE;
			piste = parseInt(piste, 10);
			var selectedCurve = Formatter.convertIdTipoToDesc(this.getView().getModel("curveResultTableModel").getProperty(curveIdContext +
				"/ID_TIPO_CURVA"));
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", idCurve);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/descrCurve", descrCurve);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/selectedCurve", selectedCurve);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/piste", piste);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/0/FISCAL_YEAR", selectedfiscalYearPeriodi);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/year", year)
			var e = sap.ui.core.UIComponent.getRouterFor(this);
			if (selectedCurve == "Lineare")
				e.navTo("modCurvaLineare");
			else if (selectedCurve == "Discreta") {
				var gate = this.getView().getModel("curveResultTableModel").getProperty(curveIdContext + "/SN_GATE");
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/gate", gate);
				e.navTo("modCurvaDiscreta");
			} else if (selectedCurve == "Descrittiva")
				e.navTo("modCurvaDescrittiva");
			else if (selectedCurve == "Discreta/Rapporto Percentuale")
				e.navTo("modDiscretaRapportoPercentuale");
			else if (selectedCurve == "Lineare/Consuntivo")
				e.navTo("modCurvaLineare_Consuntivo");
			else if (selectedCurve == "Lineare/Pdecimale")
				e.navTo("modCurva_Pdecimale");
		},
		clear: function (oEvent) {
			debugger

			/*	var data = [];
				oMainModel.setData(data);
				this.getView().setModel(oMainModel, "curveResultTableModel");
				oMainModel.refresh();*/
			this.byId("vsdFilterBar").setVisible(false);
			//this.byId("vsdFilterBar").setVisible(false);
			this.byId("vsdFilterLabel").setText("");
			this.getView().byId("desc").setValue("");
			this.getView().byId("select0").setSelectedKey("");
			this.getView().byId("selectCurve").setSelectedKey("");
			//	resetting filter
			if (sap.ui.getCore().byId("FilterDialogCurve") !== undefined) {
				var aFilterItems = sap.ui.getCore().byId("FilterDialogCurve").getFilterItems();
				aFilterItems.forEach(function (item) {
					var aItems = item.getItems();
					aItems.forEach(function (item) {
						item.setSelected(false);
					});
				});
			}
			//	this.onSearch();

		},
		onSearch: function () {
			debugger;
			this.byId("curveResultTable").setVisible(true);
			if (sap.ui.getCore().getModel("BasicAppModel").getProperty("/change") === "change") {

			} else {

				this.byId("vsdFilterBar").setVisible(false);
				this.byId("vsdFilterLabel").setText("");

			}
			var desc = this.byId("desc").getValue();
			var curvaTipo = this.byId("select0").getSelectedKey();
			curvaTipo = parseInt(curvaTipo, 10);
			this.filterCurvaData(desc, curvaTipo);
			

		},
		filterCurvaData: function (desc, curvaTipo) {
			debugger
			oFilters = [];
			if (curvaTipo != undefined && curvaTipo !== "" && !isNaN(curvaTipo)) {
				var filter1 = new sap.ui.model.Filter("ID_TIPO_CURVA", sap.ui.model.FilterOperator.EQ, curvaTipo);
				oFilters.push(filter1);
			}
			if (desc != undefined && desc != "") {
				var filter2 = new sap.ui.model.Filter({
					path: 'DESCR_CURVA',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: desc,
					caseSensitive: false
				});
				//var filter2 = new sap.ui.model.Filter("DESCR_CURVA", sap.ui.model.FilterOperator.Contains, desc);
				oFilters.push(filter2);
			}
			console.log(oFilters);

			this.getCurveResultTableData(oFilters);

		},
		onTableSearch: function (oEvent) {
			debugger;
			var search = oEvent.getParameter("query");
			search = search.trim();
			var filter1; // = new sap.ui.model.Filter("ID_TIPO_CURVA", sap.ui.model.FilterOperator.EQ, "");
			if (search != undefined && search != "") {
				if (search === "Lineare" || search === "Discreta" || search === "Descrittiva" || search === "Discreta/Rapporto Percentuale" ||
					search === "Lineare/Consuntivo" || search === "Lineare/Pdecimale") {
					search = Formatter.convertDescToIdTipo(search);
					filter1 = new sap.ui.model.Filter("ID_TIPO_CURVA", sap.ui.model.FilterOperator.EQ, search);
				} else
				//filter1 = new sap.ui.model.Filter("DESCR_CURVA", sap.ui.model.FilterOperator.Contains, search);
					filter1 = new sap.ui.model.Filter({
					path: 'DESCR_CURVA',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: search,
					caseSensitive: false
				});
				//var filter2 = new sap.ui.model.Filter("SN_GATE", sap.ui.model.FilterOperator.EQ, search);
				//var filter3 = new sap.ui.model.Filter("NUMERO_PUNTI", sap.ui.model.FilterOperator.EQ, search);
				oFilters.push(filter1);
			}
			/*else if (desc != undefined && desc != "") {
				var filter1 = new sap.ui.model.Filter("ID_TIPO_CURVA", sap.ui.model.FilterOperator.EQ, curvaTipo);
				oFilters.push(filter2);
			}*/
			this.getView().byId("curveResultTable").setVisible(true);
			console.log(oFilters);
			var oTable;
			var aBinding;
			if (!search) {
				this.clear();
				this.onSearch();
				/*	oTable = this.getView().byId("curveResultTable");
					aBinding = oTable.getBinding("items");
					aBinding.filter([]);*/
			} else {
				/*	oTable = this.getView().byId("curveResultTable");
				aBinding = oTable.getBinding("items");
				aBinding.filter(new sap.ui.model.Filter({
					filters: oFilters,
					and: true
				}));
*/
				var tmp = [],
					data = [];
				//	debugger
				var oModel = this.getView().getModel('curveResultTableModel').getData();
				for (var i = 0; i < oModel.length; i++) {
					if (oModel[i].ID_TIPO_CURVA == search || oModel[i].DESCR_CURVA.toLowerCase().includes(search.toLowerCase())) {
						tmp = oModel[i];
						data.push(tmp);
					}
				}
				console.log(data);
				oMainModel.setData(
					data
				);
				this.getView().setModel(oMainModel, "curveResultTableModel");
				oMainModel.refresh();
			}
		},
		createViewSettingsDialog: function (sDialogFragmentName) {
			//           debugger;
			var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];
			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
				this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;
				oDialog.setModel(this.getView().getModel("curveResultTableModel"));
				this.getView().addDependent(oDialog);
				if (Device.system.desktop) {
					oDialog.addStyleClass("sapUiSizeCompact");
				}
			}
			return oDialog;
		},
		handleSortButtonPressed: function (oEvent) {
			this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.sort_Curva").open();
		},
		sort: function (oEvent) {
			var oTable = this.byId("curveResultTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];
			sPath = mParams.sortItem.getKey();
			if (sPath === "ID_TIPO_CURVA") // The sorting of "Tipo curva"  field must based on the description of curva's type, not for ID.
			{
				var CurveItems = this.getView().getModel("curveResultTableModel").getData();
				bDescending = mParams.sortDescending;
				if (bDescending === true) {
					CurveItems.sort(function (a, b) {
						if (Formatter.convertIdTipoToDesc(a.ID_TIPO_CURVA) > Formatter.convertIdTipoToDesc(b.ID_TIPO_CURVA)) {
							return -1;
						} else
							return 1;
					});
				} else {
					CurveItems.sort(function (a, b) {
						if (Formatter.convertIdTipoToDesc(a.ID_TIPO_CURVA) < Formatter.convertIdTipoToDesc(b.ID_TIPO_CURVA)) {
							return -1;
						} else
							return 1;
					});

				}
				//	console.log(CurveItems);
				oMainModel.setData(
					CurveItems
				);
				this.getView().setModel(oMainModel, "curveResultTableModel");
				oMainModel.refresh();
				oBinding.sort();

			} else {
				bDescending = mParams.sortDescending;
				aSorters.push(new Sorter(sPath, bDescending));
				// apply the selected sort and group settings
				oBinding.sort(aSorters);
			}

		},
		handleFilterButtonPressed: function (oEvent) {
			debugger;
			this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.filter_Curva").open();
		},
		filter: function (oEvent) {
			debugger;
			var that = this;
			var tmp = [],
				data = [];
			var tipo = [],
				mul = [],
				desc = [];
			this.byId("vsdFilterBar").setVisible(false);
			this.byId("vsdFilterLabel").setText("");
			var oTable = this.byId("curveResultTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				aFilters = [],
				oFilter;
			mParams.filterItems.forEach(function (oItem) {
				var sPath = oItem.getKey();
				var text = oItem.getText();
				if (text !== "") {
					if (sPath === "ID_TIPO_CURVA") {
						text = Formatter.convertDescToIdTipo(text);
						oFilter = new sap.ui.model.Filter(sPath, "EQ", text);
						aFilters.push(oFilter);
					} else if (sPath === "PISTE") {
						if (text === "Più di 1") {
							oFilter = new sap.ui.model.Filter(sPath, "GE", 1);
							aFilters.push(oFilter);
						} else {
							oFilter = new sap.ui.model.Filter(sPath, "LT", 1);
							aFilters.push(oFilter);
						}
					} else if (sPath === "SN_GATE") {
						if (text === "Si")
							text = "S";
						else
							text = "";
					} else {
						oFilter = new sap.ui.model.Filter(sPath, "EQ", text);
						aFilters.push(oFilter);
					}

					var oModel = that.getView().getModel('curveResultTableModel').getData();
					for (var i = 0; i < oModel.length; i++) {

						if (oModel[i].ID_TIPO_CURVA === text || oModel[i].DESCR_CURVA === text || oModel[i].SN_GATE === text) {
							tmp = oModel[i];
							data.push(tmp);
						}
					}
				}
			});
			// apply filter settings
			oBinding.filter(aFilters);
			var tmpCurve = [],
				arrCurve = [],
				duplicateArray = [];
			for (var i = 0; i < data.length; i++) {
				tipo.push(data[i].ID_TIPO_CURVA);
				mul.push(data[i].SN_GATE);
				desc.push(data[i].DESCR_CURVA);
				//**********************start of removing duplicate ID_Gruppi**************************
				if (data[i].ID_CURVA !== null && data[i].ID_CURVA !== "") {
					var id_curve = data[i].ID_CURVA;
					if (!duplicateArray[id_curve]) {
						tmpCurve = data[i];
						duplicateArray[id_curve] = true;
						console.log(tmpCurve);
						arrCurve.push(tmpCurve);
					}
				}
				//**********************end of removing duplicate ID_Gruppi**************************
			}
			console.log(arrCurve);
			oMainModel.setData(arrCurve);

			var m = {},
				data11 = tipo;
			tipo = [];
			for (var i = 0; i < data11.length; i++) {
				var vv = data11[i];
				if (!m[vv]) {
					m[vv] = true;
					tipo.push(Formatter.convertIdTipoToDesc(data11[i]));
				}
			}
			var m = {},
				data11 = mul;
			mul = [];
			for (var i = 0; i < data11.length; i++) {
				var vv = data11[i];
				if (!m[vv]) {
					m[vv] = true;
					if (vv === "")
						mul.push("No");
					else
						mul.push("Si");
				}
			}
			var m = {},
				data11 = desc;
			desc = [];
			for (var i = 0; i < data11.length; i++) {
				var vv = data11[i];
				if (!m[vv]) {
					m[vv] = true;
					desc.push({
						DESCR_CURVA: data11[i]
					});
				}
			}
			oMainModel.setProperty("/tipo", tipo);
			oMainModel.setProperty("/mul", mul);
			oMainModel.setProperty("/desc", desc);
			this.getView().setModel(oMainModel, "curveResultTableModel");
			oMainModel.refresh();
			var count = this.getView().byId("curveResultTable").getBinding("items").aIndices.length;
						var txt = this.getView().getModel("i18n").getResourceBundle().getText("Curve") + " (" + count + ")";
						this.byId("title").setText(txt);
			// update filter bar
			this.byId("vsdFilterBar").setVisible(aFilters.length > 0);
			this.byId("vsdFilterLabel").setText(mParams.filterString);
		},
		handleGroupButtonPressed: function (oEvent) {
			this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.group_Curva").open();
		},
		group: function (oEvent) {
			debugger;
			var oTable = this.byId("curveResultTable"),
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
		onDataExport: function (oEvent) {
			debugger;
			var oModel = [];
			var oModel1= this.byId("curveResultTable").getBinding("items").aIndices;
			var data = this.getView().getModel('curveResultTableModel').getData();
			for(var i = 0; i < oModel1.length; i++)
			{ var val = oModel1[i];
				oModel.push(data[val]);
			}
			var columnTemplate = [
				[{
					column: 'ID_CURVA',
					label: 'ID Curva'
				}, {
					column: 'ID_PERIODO',
					label: 'ID Fiscal year'
				}, {
					column: 'DESCR_CURVA',
					label: 'Descrizone Curva'
				}, {
					column: 'ID_TIPO_CURVA',
					label: 'Tipo Curva'
				}]
			];
			var data = [];
			var data1 = {};
			for (var i = 0; i < oModel.length; i++) {
				//	debugger;
				data1 = {
					"ID_CURVA": oModel[i].ID_CURVA,
					"ID_PERIODO": oModel[i].FISCAL_YEAR,
					"DESCR_CURVA": oModel[i].DESCR_CURVA,
					"ID_TIPO_CURVA": Formatter.convertIdTipoToDesc(oModel[i].ID_TIPO_CURVA)
				}
				data.push(data1);
			}
			var obj = {}
			obj.results = data;
			console.log(data);
			tablesToExcel(obj, ['Curva'], columnTemplate, 'Curve.xls', 'Excel');
		},
		handleAggiungi: function (oEvent) {
			debugger;
			var selectedCurve = this.getView().byId("selectCurve").getSelectedKey();
			var selectedCurve2 = Formatter.convertDescToIdTipo(selectedCurve);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/selectedCurve", selectedCurve2);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/nextCurveId", maxCurveId);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/fiscalYear", selectedfiscalYearPeriodi);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/year", year)
			var e = sap.ui.core.UIComponent.getRouterFor(this);
			if (selectedCurve == "Lineare")
				e.navTo("curvaLineare");
			else if (selectedCurve == "Discreta")
				e.navTo("curvaDiscreta");
			else if (selectedCurve == "Descrittiva")
				e.navTo("curvaDescrittiva");
			else if (selectedCurve == "Discreta/Rapporto Percentuale")
				e.navTo("curvaDis_rapp");
			else if (selectedCurve == "Lineare/Consuntivo")
				e.navTo("curvaLineare_Consuntivo");
			else if (selectedCurve == "Lineare/Pdecimale")
				e.navTo("curvaLineare_Pdecimale");
			else
				MessageBox.error("Nessuna curva selezionata");
		},
		displayCurveFn: function (oEvent) {
			debugger;
			var curveIdContext = oEvent.oSource.getBindingContext("curveResultTableModel").sPath;
			var idCurve = this.getView().getModel("curveResultTableModel").getProperty(curveIdContext + "/ID_CURVA");
			var curveDesc = this.getView().getModel("curveResultTableModel").getProperty(curveIdContext + "/DESCR_CURVA");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/0/FISCAL_YEAR", selectedfiscalYearPeriodi);
			var selectedCurve = Formatter.convertIdTipoToDesc(this.getView().getModel("curveResultTableModel").getProperty(curveIdContext +
				"/ID_TIPO_CURVA"));
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", idCurve);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveDesc", curveDesc);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/year", year)
			var e = sap.ui.core.UIComponent.getRouterFor(this);
			if (selectedCurve == "Lineare")
				e.navTo("displayCurvaLineare");
			else if (selectedCurve == "Discreta") {
				var gate = this.getView().getModel("curveResultTableModel").getProperty(curveIdContext + "/SN_GATE");
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/gate", gate);
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "curve");
				e.navTo("displayCurvaDiscreta");
			} else if (selectedCurve == "Discreta/Rapporto Percentuale")
				e.navTo("displayDiscretaRapportoPercentuale");
			else if (selectedCurve == "Lineare/Consuntivo")
				e.navTo("displayCurvaLineare_Consuntivo");
			else if (selectedCurve == "Lineare/Pdecimale")
				e.navTo("displayCurva_Pdecimale");
			else if (selectedCurve == "Descrittiva")
				e.navTo("displayCurvaDescrittiva");
		},
		copyCurve: function () {
				var e = sap.ui.core.UIComponent.getRouterFor(this);
				e.navTo("Curve_Copy", {
					curve: "Curve_Copy",
					str: selectedfiscalYearPeriodi
				});
			}
			/**********************************************END of Curve page methods**********************************************/
	});
});
