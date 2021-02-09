sap.ui.define([
	"sap/ui/core/mvc/Controller"

], function (Controller, JSONModel, Device, MessageBox) {
	"use strict";

	return Controller.extend("stipAdmin.stipAdmin.controller.BloccaCongela", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {

			this.busyDialog = new sap.m.BusyDialog();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("BloccaCongela").attachPatternMatched(this._onObjectMatched, this);
		},
		/******************** _onObjectMatched fetches argument values********************************************/
		_onObjectMatched: function (oEvent) {
			var oArguments = oEvent.getParameter("arguments");
			this.selectedfiscalYearPeriodi = oArguments.str;
			this.getView().byId("idtxtfiscalyear").setText(sap.ui.getCore().getModel("fiscalyear").getData());
		},
		/******************** onHomePage function naviagtes the user to the Home Page of the StipAdmin module********************************************/
		onHomePage: function (oEvent) {
			debugger;
			this.clear();
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
			this.busyDialog.close();
		},
		/******************** handleBack function naviagtes the user to the previous page(Home Page) of the StipAdmin module********************************************/
		handleBack: function (oEvent) {
			debugger;
			this.clear();
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
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
			if (sap.ui.getCore().byId("FilterDialogBloccaCongela") !== undefined) {
				var aFilterItems = sap.ui.getCore().byId("FilterDialogBloccaCongela").getFilterItems();
				aFilterItems.forEach(function (item) {
					var aItems = item.getItems();
					aItems.forEach(function (item) {
						item.setSelected(false);
					});
				});
			}
			if (this.byId("selBloccaCongela").getSelectedKey())
				this.byId("selBloccaCongela").setSelectedKey("");

			

			/*	this.onSearch();
				var oTable = this.getView().byId("tbl");
				var aBinding = oTable.getBinding("items");
				aBinding.filter([]);*/
			/*	if (this.byId("box4").getSelectedKey())
					this.byId("box4").setSelectedKey("");*/
		},
		//aditya
		/******************** onOK function naviagtes the user to the next page as per the user selection based on the drop-down********************************************/
		/********************If user choice is 1, then navigates to the BloccaCongelaScongela page********************************************/
		/******************** If user choice is 2, then navigates to the BloccaPiste page********************************************/
		/******************** If user choice is 3, then navigates to the BloccaSchedeMaster page********************************************/
		/******************** If user choice is 4, then navigates to the BloccaSchedePersonali page********************************************/
		onOK: function (oEvent) {
			var oKey = this.getView().byId("selBloccaCongela").getSelectedKey();
			switch (oKey) {
			case "1":
				this.oRouter.navTo("BloccaCongelaScongela", {
					ID: oKey,
					str: this.selectedfiscalYearPeriodi

				});
				break;
			case "2":
				this.oRouter.navTo("BloccaPiste", {
					ID: oKey,
					str: this.selectedfiscalYearPeriodi

				});
				break;
			case "3":
				this.oRouter.navTo("BloccaSchedeMaster", {
					ID: oKey,
					str: this.selectedfiscalYearPeriodi

				});
				break;
			case "4":
				this.oRouter.navTo("BloccaSchedePersonali", {
					ID: oKey,
					str: this.selectedfiscalYearPeriodi

				});
				break;
			}
			this.clear();
		}
	});

});