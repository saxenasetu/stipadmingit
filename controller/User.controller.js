sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageBox, JSONModel) {
	"use strict";
	var oMainModel = new sap.ui.model.json.JSONModel();
	return Controller.extend("stipAdmin.stipAdmin.controller.User", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("User").attachPatternMatched(this._onObjectMatched, this);
		},
		/******************** _onObjectMatched fetches argument values and depends on role and authorization checkbox visibility********************************************/
		_onObjectMatched: function (oEvent) {
			debugger;
			this.display();

		},
		/*******************onHome method navigates user to Home Page of STIPAdmin module*****************************/
		onHome: function () {
			var n = sap.ui.core.UIComponent.getRouterFor(this);
			n.navTo("Home");
		},
		/*******************display function fetches and displays the data from the backend(T_USER)*****************************/
		display: function () {
			var that = this;
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			xsoDataModel.read("/T_USER?$format=json", {

				success: function (oDataIn, oResponse) {
					debugger;
					var data = oDataIn.results;
					console.log(data);
					oMainModel.setData(data);
					that.getView().setModel(oMainModel, "UserModel");
					oMainModel.refresh();

				},
				error: function (oerror) {}
			});
		},
		/*******************handleModifica function navigates the user to 'User_new_change' page and enables to make changes based on user Id*****************************/
		handleModifica: function (oEvent, id) {
			debugger;
			var n = sap.ui.core.UIComponent.getRouterFor(this);
			var oModel2 = new JSONModel(),
				data = [];
			if (id === undefined || id === null) {
				id = 0;
			} else {

				for (var i = 0; i < oMainModel.getData().length; i++) {
					if (oMainModel.getData()[i].ID === id)
						data = oMainModel.getData()[i];
				}
			}
			oModel2.setData(data);
			sap.ui.getCore().setModel(oModel2, "BasicAppModel");

			n.navTo("User_new_change", {
				User: "User_new_change",
				id: id
			});
		},
		/*******************handleDelete function seeks confirmation from the user to delete the particular user (based on Id)*****************************/
		/*******************If the user input is OK then the particular record is deleted*****************************/
		handleDelete: function (oEvent, id, matr) {
			var that = this;
			MessageBox.confirm("Confermare l'eliminazione dell'utente?", { //Confirmation message displayed 'Confirm the user's deletion?'
				styleClass: "sapUiSizeCompact",
				actions: ["Si", sap.m.MessageBox.Action.NO],
				emphasizedAction: "Si",
				initialFocus: sap.m.MessageBox.Action.NO,
				onClose: function (oAction) {
					if (oAction === "Si") {
						that.del(id, matr);
					}
				}
			});
		},
		/*******************del function makes the deletion changes on the backend data and displays the success message*****************************/
		del: function (id, matr) {
			var url = "/T_USER(ID=" + "'" + id + "'" + ",MATRICOLA=" + "'" + matr + "')";
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			var that = this;
			xsoDataModel.remove(url, function (oDataIn) {
					debugger;
					console.log(oDataIn);
					MessageBox.success("User eliminato con successo"); //Success message displayed 'User successfully deleted'

				}.bind(this),
				function (oError) {
					//Handle the error
					MessageBox.error("Error Occurred while deleting T_USER. Please contact administrator.");
					jQuery.sap.log.getLogger().error("T_GRUPPIPISTE fetch failed" + oError.toString());
				}.bind(this)
			);
			xsoDataModel.attachRequestCompleted(function () {
				MessageBox.success("User eliminato con successo"); //Success message displayed 'User successfully deleted'
				that.display(); //After the success message, it navigates to the previous page and display function is called (T_USER table is displayed)
				oMainModel.refresh();
			});
		}

	});

});