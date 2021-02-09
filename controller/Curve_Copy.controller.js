sap.ui.define(["sap/m/TablePersoController", "sap/ui/core/Fragment",
	"sap/ui/Device", "./DemoPersoService", "./Formatter", "sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel", "sap/m/MessageBox", "stipAdmin/stipAdmin/util/Formatter", "./exportExcel", "sap/ui/model/Sorter",
], function (e, Fragment, Device, o, t, n, i, MessageBox, Formatter, Excel, Sorter) {
	"use strict";
	var selectedfiscalYearPeriodi, year, maxCurveId, fyDrop;
	var oMainModel = new i();
	var oFilters = [],
		curveID = [];
	return n.extend("stipAdmin.stipAdmin.controller.Curve_Copy", {

		onInit: function () {
			var oResource = new sap.ui.model.resource.ResourceModel({
				bundleName: "stipAdmin.stipAdmin.i18n.i18n"
			}).getResourceBundle();
			this.getView().byId("filterbar")._oSearchButton.setText("Cerca"); // Changing filter bar button name
			//this.getView().byId("filterbar")._oSearchButton.setText(oResource.getText("ok"));
			this.getView().byId("filterbar")._oHintText.setText(oResource.getText("noFilter"));

			this._mViewSettingsDialogs = {};
			this.getOwnerComponent().getRouter().getRoute("Curve_Copy").attachPatternMatched(this._onObjectMatched, this);
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
		_onObjectMatched: function (oEvent) {
			//	this.getView().byId("filterbar")._oSearchButton.setText("Cerca");
			var oArguments = oEvent.getParameter("arguments");
			selectedfiscalYearPeriodi = oArguments.str;
			console.log(selectedfiscalYearPeriodi);
			this.byId("fy0").setSelectedKey(parseInt(selectedfiscalYearPeriodi, 10) - 1);
			this.byId("btn1").setVisible(false);
			//this.byId("btn2").setVisible(false);
			this.getFiscalYear(selectedfiscalYearPeriodi);
			//	this.clear();
			this.getView().byId("curveResultTable").setVisible(false);
			if (sap.ui.getCore().getModel("BasicAppModel").getProperty("/back") === "curvaCopy") {
				this.onSearch();
				this.filter();
			}
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
					fyDrop = data1[10].PERIODI;
					that.byId("fy").setText(year);
					maxCurveId = data1[9].ID_CURVA;
					var data0 = [{
						Filter: fyDrop
					}];
					if(oMainModel.getData().length!=undefined){
						oMainModel.getData()[0].Filter = fyDrop;
					}
					else
					oMainModel.setData(data0);
					console.log(oMainModel.getData());
					this.getView().setModel(oMainModel, "curveResultTableModel");

				}.bind(this),
				error: function (data1, textStatus1) {
					debugger;
					console.log("error");
				}
			});
		},
		getCurveResultTableData: function (oFilters) {
			debugger

			this.getView().byId("curveResultTable").setVisible(false);
			var curveResultJson = [];
			oMainModel.setData(curveResultJson);
			oMainModel.refresh();
			var curveResultJsonData = {};
			var tipo = [],
				mul = [],
				desc = [];
			var sPayload = {
				"ID_PERIODO": this.fy
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

							if (oDataIn[i].SN_GATE === "N")
								oDataIn[i].SN_GATE = "";
							
							var en = true;

							if (oDataIn[i].SN_DESCRITTIVA !== undefined && oDataIn[i].SN_DESCRITTIVA !== "" && oDataIn[i].SN_DESCRITTIVA
								.includes("C:" + selectedfiscalYearPeriodi))
								en = false;
							curveResultJsonData = {
								"FISCAL_YEAR": that.fy,
								"ID_PERIODO": parseInt(that.fy, 10),
								DESCR_PERIODO: this.yy,
								"DESCR_CURVA": oDataIn[i].DESCR_CURVA,
								"ID_TIPO_CURVA": oDataIn[i].ID_TIPO_CURVA,
								"TIPO_CURVA": oDataIn[i].ID_TIPO_CURVA,
								"SN_GATE": oDataIn[i].SN_GATE,
								"SN_DESCRITTIVA": oDataIn[i].SN_DESCRITTIVA,
								"ID_CURVA": oDataIn[i].ID_CURVA, // this ID_CURVE will be required to calculate numeropunti and piste in result table
								"NUMERO_PUNTI": oDataIn[i].NUMERO_PUNTI,
								"PISTE": oDataIn[i].PISTE,
								selected: false,
								enabled: en
							};

							//maxCurveId = oDataIn[i].ID_CURVA + 1;
							curveResultJson.push(curveResultJsonData);

							//	console.log(this.getView().getModel("curveResultTableModel").getData());
						}
						debugger;
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
						var data = [{
							Filter: fyDrop,
							Main: curveResultJson
						}];
						oMainModel.setData(data);
						//sap.ui.getCore().setModel(oMainModel, "BasicAppModel");

						this.getView().setModel(oMainModel, "curveResultTableModel");
						oMainModel.refresh();
						
						console.log(this.getView().getModel("curveResultTableModel").getData());
						this.getView().byId("curveResultTable").setVisible(true);
						this.getView().byId("curveResultTable").getBinding("items").filter(oFilters);
						var count = this.getView().byId("curveResultTable").getBinding("items").aIndices.length;
						var txt = this.getView().getModel("i18n").getResourceBundle().getText("Curve") + " (" + count + ")";
						this.byId("title").setText(txt);
						var index = this.getView().byId("curveResultTable").getBinding("items").aIndices;
						var storeTmp = [];
						for(var i = 0;i<oMainModel.getData()[0].Main.length;i++){
							for(var j = 0;j<index.length;j++){
								if(i===index[j]){
									storeTmp.push(oMainModel.getData()[0].Main[i]);
									tipo.push(oMainModel.getData()[0].Main[i].ID_TIPO_CURVA);
							mul.push(oMainModel.getData()[0].Main[i].SN_GATE);
							desc.push(oMainModel.getData()[0].Main[i].DESCR_CURVA);
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
						data = [{
							Filter: fyDrop,
							Main: storeTmp
						}];
						oMainModel.setData(data);
						
						
						oMainModel.setProperty("/tipo", tipo);
						oMainModel.setProperty("/mul", mul);
						oMainModel.setProperty("/desc", desc);
						oFilters = [];
						this.byId("btn1").setVisible(true);
						this.byId("btn1").setEnabled(false);
						//this.byId("btn2").setVisible(true);

					} else
						MessageBox.error("Nessuna curva esiste");
				}.bind(this),
				error: function (oError) {
					//Handle the error
					oFilters = [];
					MessageBox.error("Data fetch failed while getting T_Curve. Please contact administrator.");

				}.bind(this)
			});

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
			this.fy = this.byId("fy0").getSelectedKey();
			for (var i = 0; i < fyDrop.length; i++) {
				if (fyDrop[i].ID_PERIODO === parseInt(this.fy, 10))
					this.yy = fyDrop[i].DESCR_PERIODO;
			}

			curvaTipo = parseInt(curvaTipo, 10);
			this.filterCurvaData(desc, curvaTipo, this.fy);

		},
		filterCurvaData: function (desc, curvaTipo, fy) {
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
			var filter3 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, parseInt(fy, 10));
			oFilters.push(filter3);
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
				oTable = this.getView().byId("curveResultTable");
				aBinding = oTable.getBinding("items");
				aBinding.filter([]);
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
					if (oModel[i].ID_TIPO_CURVA == search || oModel[i].DESCR_CURVA.includes(search)) {
						tmp = oModel[i];
						data.push(tmp);
					}
				}
				console.log(data);
				var data0 = [{
					Filter: fyDrop,
					Main: data
				}];
				oMainModel.setData(
					data0
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
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		},
		handleFilterButtonPressed: function (oEvent) {
			this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.filter_Curva").open();
		},
		filter: function (oEvent) {
			debugger;
			if(oEvent){
			var that = this;
			var tmp = [],
				data = [];
			var tipo = [],
				mul = [];
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

					var oModel = that.getView().getModel('curveResultTableModel').getData()[0].Main;
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
				desc = [],
				duplicateArray = {};
			for (var i = 0; i < data.length; i++) {
				tipo.push(data[i].ID_TIPO_CURVA);
				mul.push(data[i].SN_GATE);
				desc.push(data[i].DESCR_CURVA);
				//**********************start of removing duplicate ID_CURVA**************************
				if (data[i].ID_CURVA !== null && data[i].ID_CURVA !== "") {
					var id_curve = data[i].ID_CURVA;
					if (!duplicateArray[id_curve]) {
						tmpCurve = data[i];
						duplicateArray[id_curve] = true;
						//console.log(tmpCurve);
						arrCurve.push(tmpCurve);
					}
				}
				//**********************end of removing duplicate ID_Gruppi**************************
			}

			var data0 = [{
				Filter: fyDrop,
				Main: arrCurve
			}];
			oMainModel.setData(
				data0
			);

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

			oMainModel.setProperty("/tipo", tipo);
			oMainModel.setProperty("/mul", mul);
			oMainModel.setProperty("/desc", desc);
			console.log(oMainModel.getData());
			this.getView().setModel(oMainModel, "curveResultTableModel");
			oMainModel.refresh();
			// update filter bar
			this.byId("vsdFilterBar").setVisible(aFilters.length > 0);
			this.byId("vsdFilterLabel").setText(mParams.filterString);
		}
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
			}else
				oBinding.sort(); // else condition is to group none
		},
		clear: function (oEvent) {
			debugger

			this.byId("vsdFilterBar").setVisible(false);
			//this.byId("vsdFilterBar").setVisible(false);
			this.byId("vsdFilterLabel").setText("");
			this.getView().byId("desc").setValue("");
			this.getView().byId("select0").setSelectedKey("");
			this.byId("fy0").setSelectedKey(parseInt(selectedfiscalYearPeriodi, 10) - 1);

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
			oFilters = [];
			//this.getCurveResultTableData(oFilters);
			var oTable = this.getView().byId("curveResultTable");
			var aBinding = oTable.getBinding("items");
			aBinding.filter([]);
			this.getView().byId("curveResultTable").setVisible(false);

		},
		curveSelect: function (oEvent, id) {
			if (oEvent.getParameters().selected === true)
				curveID.push(id);

			else {
				for (var i = 0; i < curveID.length; i++) {
					if (curveID[i] === id)
						curveID.splice(i, 1);

				}
			}
			if (curveID.length === 0)
				this.byId("btn1").setEnabled(false);
			else
				this.byId("btn1").setEnabled(true);
			console.log(curveID);
		},
		allSelect: function (oEvent) {
			debugger;
			if (oEvent.getParameters().selected === true) {

				for (var i = 0; i < oMainModel.getData()[0].Main.length; i++) {
					if (oMainModel.getData()[0].Main[i].enabled === true) {
						curveID.push(oMainModel.getData()[0].Main[i].ID_CURVA);
						oMainModel.getData()[0].Main[i].selected = true;
					}
				}
			} else {

				curveID = [];
				for (var i = 0; i < oMainModel.getData()[0].Main.length; i++)
					oMainModel.getData()[0].Main[i].selected = false;
			}
			if (curveID.length === 0)
				this.byId("btn1").setEnabled(false);
			else
				this.byId("btn1").setEnabled(true);
			oMainModel.refresh();
			console.log(curveID);
		},
		CopyCurve: function () {
			if (curveID.length === 0)
				MessageBox.error("Nessuna Curva Selezionate");
			else {
				var payload = [];
				var data = oMainModel.getData()[0].Main;
				for (var i = 0; i < data.length; i++) {
					for (var ii = 0; ii < curveID.length; ii++) {
						if (data[i].ID_CURVA === curveID[ii])
							payload.push({
								ID_CURVA: data[i].ID_CURVA,
								DESCR_CURVA: data[i].DESCR_CURVA,
								ID_PERIODO: parseInt(data[i].FISCAL_YEAR, 10),
								ID_PERIODO_new: selectedfiscalYearPeriodi,
								ID_TIPO_CURVA: data[i].ID_TIPO_CURVA,
								SN_DESCRITTIVA: data[i].SN_DESCRITTIVA,
								SN_GATE: data[i].SN_GATE
							});
					}
				}
				console.log(payload);
				var sPayload = JSON.stringify(payload);
				var that = this;
				var url = "/HANAMDC/STIP/STIPAdmin/services/copyCurve.xsjs";
				$.ajax({
					url: url,
					type: "GET",
					contentType: "application/json",
					data: {
						odata: sPayload
					},
					success: function (data1, textStatus1) {
						debugger;
						for (var i = 0; i < oMainModel.getData()[0].Main.length; i++) {
							if (oMainModel.getData()[0].Main[i].selected === true) {
								oMainModel.getData()[0].Main[i].enabled = false;
								oMainModel.getData()[0].Main[i].selected = false;
							}
						}
						curveID = [];
						console.log(data1);
						MessageBox.success("Copiato con successo");

						oMainModel.refresh();
					}.bind(this),
					error: function (data1, textStatus1) {
						debugger;
						console.log("error");
						MessageBox.error("Copia fallita");
					}
				});
			}
		},
		displayCurveFn: function (oEvent) {
			debugger;
			var curveIdContext = oEvent.oSource.getBindingContext("curveResultTableModel").sPath;
			var idCurve = this.getView().getModel("curveResultTableModel").getProperty(curveIdContext + "/ID_CURVA");
			var curveDesc = this.getView().getModel("curveResultTableModel").getProperty(curveIdContext + "/DESCR_CURVA");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/FISCAL_YEAR", selectedfiscalYearPeriodi);
			var selectedCurve = Formatter.convertIdTipoToDesc(this.getView().getModel("curveResultTableModel").getProperty(curveIdContext +
				"/ID_TIPO_CURVA"));
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", idCurve);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveDesc", curveDesc);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/year", year);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "curvaCopy");
			var e = sap.ui.core.UIComponent.getRouterFor(this);
			if (selectedCurve == "Lineare")
				e.navTo("displayCurvaLineare");
			else if (selectedCurve == "Discreta") {
				var gate = this.getView().getModel("curveResultTableModel").getProperty(curveIdContext + "/SN_GATE");
				sap.ui.getCore().getModel("BasicAppModel").setProperty("/gate", gate);
				//sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "curve");
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
		cancel: function () {
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/change", "change");
			//aditya
			this.getView().byId("idSearchBox").setValue("");
			this.clear();
			//aditya
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Curve", {
				curve: "Curve",
				str: selectedfiscalYearPeriodi
			});
		},
		/*clear: function () {
		
			//	this.byId("vsdFilterBar").setVisible(false);
			//	this.byId("vsdFilterLabel").setText("");
			//	resetting filter
			if (sap.ui.getCore().byId("FilterDialogCurve_Copy") !== undefined) {
				var aFilterItems = sap.ui.getCore().byId("FilterDialogCurve_Copy").getFilterItems();
				aFilterItems.forEach(function (item) {
					var aItems = item.getItems();
					aItems.forEach(function (item) {
						item.setSelected(false);
					});
				});
			}
			if (this.byId("fy0").getSelectedKey())
				this.byId("fy0").setSelectedKey("");

			if (this.byId("desc").getValue())
				this.byId("desc").setValue("");

			if (this.byId("select0").getSelectedKey())
				this.byId("select0").setSelectedKey("");

			
		}*/

	});

});