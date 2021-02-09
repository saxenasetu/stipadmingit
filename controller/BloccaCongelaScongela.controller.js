sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/m/MessageBox",
	"sap/ui/core/BusyIndicator"
], function (Controller, JSONModel, Device, MessageBox, BusyIndicator) {
	"use strict";

	return Controller.extend("stipAdmin.stipAdmin.controller.BloccaCongelaScongela", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {

			this.count = 0;
			this.tops = 150;
			this.skip = 0;
			this.busyDialog = new sap.m.BusyDialog();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("BloccaCongelaScongela").attachPatternMatched(this._onObjectMatched, this);
		},
		/******************** _onObjectMatched fetches argument values********************************************/
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
					var oMainModel = new JSONModel();
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
		/******************** onAvvio fetches and displays the data from the backend(ID_SCHEDAMASTER) based on the filter values
		(idScheda,idScheda,gruppo,note,cong,kpiId,txtPista)********************************************/
		onAvvio: function () {
			var oFilters = [];
			var idScheda = this.byId("txtID").getValue();
			var desc = this.byId("desc").getValue();
			var gruppo = this.byId("gruppo").getSelectedKey();
			var note = this.byId("note").getValue();
			var cong = this.byId("cong").getSelectedKey();
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
		/******************** onResetta will reset all the filter fields(idScheda,idScheda,gruppo,note,cong,kpiId,txtPista) as blank********************************************/
		onResetta: function () {
			this.byId("txtID").setValue("");
			this.byId("desc").setValue("");
			this.byId("gruppo").setSelectedKey("");
			this.byId("note").setValue("");
			this.byId("cong").setSelectedKey("");
			this.byId("kpiId").setValue("");
			this.byId("txtPista").setValue("");
		},
		/******************** getSchedaMaster function fetches the data from the V_SchedaMaster (as per ID_PERIODO ) 
		based on NOTE and SN_CONGELATA parameters********************************************/
		getSchedaMaster: function (oFilters) {
			debugger;
			BusyIndicator.show();

			var that = this;

			var filter = that.getView().getModel("BloccaSchedaModel").getData().Filter;

			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, this.selectedfiscalYearPeriodi);
			oFilters.push(filter1);
			var data = [];
			xsoDataModel.read("/V_SchedaMaster?$format=json", {
				filters: oFilters,
				urlParameters: {
					"$top": this.tops,
					"$skip": this.skip
				},
				success: function (oDataIn, oResponse) {
					debugger;

					data = oDataIn.results;

					console.log(data);
					if (data.length > 0) {
						var data11 = data,
							m = {};
						data = [];
						for (var i = 0; i < data11.length; i++) {
							var v = data11[i].ID_SCHEDAMASTER;
							if (data11[i].NOTE === "NULL")
								data11[i].NOTE = "";
							if (data11[i].SN_CONGELATA === "N")
								data11[i].SN_CONGELATA = "No";
							else
								data11[i].SN_CONGELATA = "Si";
							if (!m[v]) {
								m[v] = true;
								data.push(data11[i]);
							}
						}
						this.byId("tbl").setVisible(true);

						console.log(data);
						var oMainModel = new JSONModel();

						oMainModel.setData({
							Filter: filter,
							Main: data
						});
						console.log(oMainModel.getData());
						that.getView().setModel(oMainModel, "BloccaSchedaModel");
						that.byId("prev").setVisible(true);
						that.byId("next").setVisible(true);
						if (that.count <= 1)
							that.byId("prev").setEnabled(false);
						else
							that.byId("prev").setEnabled(true);
						BusyIndicator.hide();

					} else {
						BusyIndicator.hide();
						MessageBox.error("Nessun dato trovato"); //Error message displayed 'No data found'
					}
				}.bind(this),
				error: function (oError) {
					//Handle the error
					BusyIndicator.hide();
					MessageBox.error("Nessun dato trovato"); //Error message displayed 'No data found'
				}.bind(this)
			});

		},
		/******************** _next function takes the user to the next page of the table********************************************/
		_next: function () {
			this.count = this.count + 1;
			this.skip = this.skip + this.tops;
			this.getSchedaMaster(this.oFilters)
		},
		/******************** _prev function takes the user to the previous page of the table*******************************************/
		_prev: function () {
			this.count = this.count - 1;
			if (this.skip > 0)
				this.skip = this.skip - this.tops;
			else
				skip = 0;
			this.getSchedaMaster(this.oFilters)
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
		//aditya
		clear: function () {
			/*	var data = [];
				oMainModel.setData(data);
				this.getView().setModel(oMainModel, "SchedaMasterModel");
				oMainModel.refresh();*/
			//	this.byId("vsdFilterBar").setVisible(false);
			//	this.byId("vsdFilterLabel").setText("");
			//	resetting filter
			if (sap.ui.getCore().byId("FilterDialogBloccaCongelaScongela") !== undefined) {
				var aFilterItems = sap.ui.getCore().byId("FilterDialogBloccaCongelaScongela").getFilterItems();
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

			if (this.byId("cong").getSelectedKey())
				this.byId("cong").setSelectedKey("");

			if (this.byId("kpiId").getSelectedKey())
				this.byId("kpiId").setSelectedKey("");

			if (this.byId("txtPista").getSelectedKey())
				this.byId("txtPista").setSelectedKey("");

			// if (this.byId("idSearchBox").getSelectedKey())
			// this.byId("idSearchBox").setSelectedKey("");

			/*	this.onSearch();
				var oTable = this.getView().byId("tbl");
				var aBinding = oTable.getBinding("items");
				aBinding.filter([]);*/
			/*	if (this.byId("box4").getSelectedKey())
					this.byId("box4").setSelectedKey("");*/
		},
		//aditya
		/******************** onSelect function********************************************/
		onSelect: function (oEvent) {
			/*	var getTabledata = this.getView().getModel("CongelaScongela").getData().NuovaLista;
				var itemPosition = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent())
				var selctedRowdata = getTabledata[itemPostion];*/ // this has the complete row info
		},
		/******************** onCongelaSelezionati function fetches the data from the tblPersonList1 and calls onPress1 function
		(grey and italic based on conditions) and assigns Si for Congelata********************************************/
		onCongelaSelezionati: function (oEvent) {

			//var oItem = oEvent.getSource().getParent();
			var oTable = this.getView().byId("tblPersonList1");
			var getTabledata = this.getView().getModel("CongelaScongela").getData().NuovaLista;
			for (var i = 0; i < getTabledata.length; i++) {
				if (getTabledata[i].CheckSel === true) {
					var oItems = oTable.getItems()[i];
					this.onPress1(oItems, true);
					this.getView().getModel("CongelaScongela").getData().NuovaLista[i].SelDesel = "Congelata";
					this.getView().getModel("CongelaScongela").getData().NuovaLista[i].C = "S";
				}
			}
			this.getView().getModel("CongelaScongela").updateBindings(true);
		},
		/******************** onScongelaSelezionati function fetches the data from the tblPersonList1 and calls onPress function
		(removes grey and italic based on conditions) and assigns No for Congelata********************************************/
		onScongelaSelezionati: function (oEvent) {

			var oTable = this.getView().byId("tblPersonList1");
			var getTabledata = this.getView().getModel("CongelaScongela").getData().NuovaLista;
			for (var i = 0; i < getTabledata.length; i++) {
				if (getTabledata[i].CheckSel === true) {
					var oItems = oTable.getItems()[i];
					this.onPress(oItems, true);
					this.getView().getModel("CongelaScongela").getData().NuovaLista[i].SelDesel = "";
					this.getView().getModel("CongelaScongela").getData().NuovaLista[i].C = "N";
					this.getView().getModel("CongelaScongela").getData().NuovaLista[i].CheckSel = false;

				}
			}
			this.getView().getModel("CongelaScongela").updateBindings(true);
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