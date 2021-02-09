sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (Controller, JSONModel, MessageBox) {
	"use strict";
	var f = 0;
	return Controller.extend("stipAdmin.stipAdmin.controller.User_new_change", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("User_new_change").attachPatternMatched(this._onObjectMatched, this);
		},
		/******************** _onObjectMatched fetches argument values and depends on role and authorization checkbox visibility********************************************/
		_onObjectMatched: function (oEvent) {
			debugger;
			var id = oEvent.getParameter("arguments").id;
			if (id !== "0" && id !== 0) {
				f = 1;
				this.modUser(id);
				this.byId("heading").setText("Modifica User");
				this.byId("save").attachPress(this.modify, this);
			} else {
				f = 2;
				this.byId("id").setValue("");
				this.byId("id").setEditable(true);
				this.byId("emp").setSelected(false);
				this.byId("mgr").setSelected(false);
				this.byId("hr").setSelected(false);
				this.byId("hrbp").setSelected(false);
				this.byId("hradm").setSelected(false);
				this.byId("dep").setSelected(false);
				this.byId("pco").setSelected(false);
				this.byId("heading").setText("Nuova User");
				this.byId("save").attachPress(this.create, this);

			}

			//this.getView().setModel(oMainModel, "UserModel");
		},
		/********************back function navigates the user to the previous 'User' page*****************************************/
		back: function () {
			var n = sap.ui.core.UIComponent.getRouterFor(this);
			n.navTo("User");
		},
		/********************modUser function is used to select the checkbox against that field
		(ROLE_EMP, ROLE_REPORTING, ROLE_MANAGER, ROLE_MANAGER_SYS, ROLE_HR, ROLE_PCO, ROLE_HR_ADMIN) which is marked as 'X' *****************************************/
		modUser: function (id) {
			var that = this;
			var oFilters = [];
			oFilters.push(new sap.ui.model.Filter("ID", sap.ui.model.FilterOperator.Contains, id));
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			xsoDataModel.read("/T_USER?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;

					var data = oDataIn.results[0];
					console.log(data);
					that.byId("id").setValue(id);
					that.byId("id").setEditable(false);
					that.matr = data.MATRICOLA;
					if (data.ROLE_EMP === "X")
						that.byId("emp").setSelected(true);
					else
						that.byId("emp").setSelected(false);
					if (data.ROLE_MANAGER === "X")
						that.byId("mgr").setSelected(true);
					else
						that.byId("mgr").setSelected(false);
					if (data.ROLE_HR === "X")
						that.byId("hr").setSelected(true);
					else
						that.byId("hr").setSelected(false);
					if (data.ROLE_MANAGER_SYS === "X")
						that.byId("hrbp").setSelected(true);
					else
						that.byId("hrbp").setSelected(false);
					if (data.ROLE_HR_ADMIN === "X")
						that.byId("hradm").setSelected(true);
					else
						that.byId("hradm").setSelected(false);
					if (data.ROLE_REPORTING === "X")
						that.byId("dep").setSelected(true);
					else
						that.byId("dep").setSelected(false);
					if (data.ROLE_PCO === "X")
						that.byId("pco").setSelected(true);
					else
						that.byId("pco").setSelected(false);

				},
				error: function (oerror) {}
			});
		},
		/*******************create function assigns 'X' against those fields where the checkbox is selected
		(ROLE_EMP, ROLE_REPORTING, ROLE_MANAGER, ROLE_MANAGER_SYS, ROLE_HR, ROLE_PCO, ROLE_HR_ADMIN) and other fields are left blank*****************************************/
		/*******************An error message is displayed in case of blank Id and success message is displayed after the changes in the T_USER *****************************************/
		create: function () {
			var id = this.byId("id").getValue();
			var emp = this.byId("emp").getSelected();
			var mgr = this.byId("mgr").getSelected();
			var hr = this.byId("hr").getSelected();
			var hrbp = this.byId("hrbp").getSelected();
			var hradm = this.byId("hradm").getSelected();
			var dep = this.byId("dep").getSelected();
			var pco = this.byId("pco").getSelected();
			if (emp === true)
				emp = "X"
			else
				emp = "";
			if (dep === true)
				dep = "X";
			else
				dep = "";
			if (mgr === true)
				mgr = "X";
			else
				mgr = "";
			if (hrbp === true)
				hrbp = "X";
			else
				hrbp = "";
			if (hr === true)
				hr = "X";
			else
				hr = "";
			if (pco === true)
				pco = "X";
			else
				pco = "";
			if (hradm === true)
				hradm = "X";
			else
				hradm = "";

			if (id === "" || id === null)
				MessageBox.error("L'ID non può essere nullo");
			else {

				var payload = {
					ID: id,
					MATRICOLA: "",
					ROLE_EMP: emp,
					ROLE_REPORTING: dep,
					ROLE_MANAGER: mgr,
					ROLE_MANAGER_SYS: hrbp,
					ROLE_HR: hr,
					ROLE_PCO: pco,
					ROLE_HR_ADMIN: hradm
				};
				var that = this;
				var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
				xsoDataModel.create("/T_USER", payload, {

					success: function (oDataIn, oResponse) {
						debugger;
						if (f === 2)
							MessageBox.success(
								"Nuova User creato con successo", {
									onClose: function (oEvent) {
										debugger;
										console.log("Onclose");
										sap.ui.core.UIComponent.getRouterFor(that).navTo("User");
									}
								});

					}.bind(this),
					error: function (oError) {
						//Handle the error
						debugger;
						//MessageBox.error("Couldn't create record in T_USER. Please contact administrator.");
						jQuery.sap.log.getLogger().error("T_USER fetch failed" + oError.toString());
					}.bind(this)
				});
			}

		},
		/********************modify function fetches the matr field and allows modification in 
		ROLE_EMP, ROLE_REPORTING, ROLE_MANAGER, ROLE_MANAGER_SYS, ROLE_HR, ROLE_PCO, ROLE_HR_ADMIN for that particular Id *****************************************/
		/******************* It assigns 'X' against those fields where the checkbox is selected and other fields are left blank*****************************************/
		modify: function () {
			var id = this.byId("id").getValue();
			var matr = this.matr;
			var emp = this.byId("emp").getSelected();
			var mgr = this.byId("mgr").getSelected();
			var hr = this.byId("hr").getSelected();
			var hrbp = this.byId("hrbp").getSelected();
			var hradm = this.byId("hradm").getSelected();
			var dep = this.byId("dep").getSelected();
			var pco = this.byId("pco").getSelected();
			if (emp === true)
				emp = "X"
			else
				emp = "";
			if (dep === true)
				dep = "X";
			else
				dep = "";
			if (mgr === true)
				mgr = "X";
			else
				mgr = "";
			if (hrbp === true)
				hrbp = "X";
			else
				hrbp = "";
			if (hr === true)
				hr = "X";
			else
				hr = "";
			if (pco === true)
				pco = "X";
			else
				pco = "";
			if (hradm === true)
				hradm = "X";
			else
				hradm = "";
			var that = this;
			if (id === "" || id === null)
				MessageBox.error("L'ID non può essere nullo");
			else {
				var url = "/T_USER(ID=" + "'" + id + "'" + ",MATRICOLA=" + "'" + matr + "')";
				var payload = {
					ID: id,
					MATRICOLA: "",
					ROLE_EMP: emp,
					ROLE_REPORTING: dep,
					ROLE_MANAGER: mgr,
					ROLE_MANAGER_SYS: hrbp,
					ROLE_HR: hr,
					ROLE_PCO: pco,
					ROLE_HR_ADMIN: hradm
				};
				var that = this;
				var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
				xsoDataModel.update(url, payload, {

					success: function (oDataIn, oResponse) {
						debugger;
						if (f === 1)
							MessageBox.success(
								"User modificato con successo", {
									onClose: function (oEvent) {
										debugger;
										console.log("Onclose");
										sap.ui.core.UIComponent.getRouterFor(that).navTo("User");
									}
								});

					}.bind(this),
					error: function (oError) {
						//Handle the error
						debugger;
						//MessageBox.error("Couldn't modify record in T_USER. Please contact administrator.");
						jQuery.sap.log.getLogger().error("T_USER fetch failed" + oError.toString());
					}.bind(this)
				});
			}

		},

	});

});