sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/MessageBox"], function (t, MessageBox) {
	"use strict";
	return t.extend("stipAdmin.stipAdmin.controller.createPeriodi", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("createPeriodi").attachPatternMatched(this._onObjectMatched, this)
		},
		/*******************onHome method navigates user to home page of STIPAdmin module*****************************/
		onHome: function () {
			debugger;
			console.log("Back");
			var n = sap.ui.core.UIComponent.getRouterFor(this);
			n.navTo("Home");
		},
		/******************** _onObjectMatched fetches argument values and depends on role and authorization checkbox visibility********************************************/
		_onObjectMatched: function (oEvent) {
			debugger
			//var periodiIdSequnce = sap.ui.getCore().getModel("BasicAppModel").getProperty("/DISPLAY_PERIODI_SEQUENCE_ID"); //fetching next sequence of id in create page
			var periodiIdSequnce = oEvent.getParameter("arguments").str;
			var oMainModel = new sap.ui.model.json.JSONModel();

			var createPeriodiData = {
				"ID_PERIODO": periodiIdSequnce
			};
			console.log(createPeriodiData);
			oMainModel.setData(
				createPeriodiData
			);
			this.getView().setModel(oMainModel, "createPeriodiModel");
		},
		/******************** cancelPeriodiDisplay undo the changes and set the fields blank and navigate to the Home page********************************************/
		cancelPeriodiDisplay: function (t) {
			this.getView().byId("periodiId").setValue("");
			this.getView().byId("periodiDesc").setValue("");
			this.getView().byId("periodiStartDate").setValue("");
			this.getView().byId("periodiEndDate").setValue("");
			this.getView().byId("periodiNote").setValue("");
			this.getView().getModel("createPeriodiModel").setData([]);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "back");
			var n = sap.ui.core.UIComponent.getRouterFor(this);
			n.navTo("Periodi");
		},
		/******************** dateValidation function is used to validate the user entries of Date and Description********************************************/
		/******************** Performs validation for empty fields and date comparison (Start date must not exceed the End date)********************************************/
		dateValidation: function (date1, date2, desc) {
			debugger;
			var flag;
			if (date1 === "" || date2 === "" || desc === "") {
				flag = 2;
			} else {
				date1 = new Date(date1);
				date2 = new Date(date2);

				if (date1 > date2) {
					flag = 1;
				} else {
					flag = 0;
				}
			}
			return flag;
		},
		/******************** createPeriodiRecord fetches the data based on the user input, performs validation and 
		creates the entry based on parameters ID_PERIODO, DESCR_PERIODO, VALE_DAL, VALE_AL, NOTA_SCHEDA in 'sPayload'  ********************************************/
		createPeriodiRecord: function (t) {
			debugger

			var that = this;
			var periodiIdInput = parseInt(this.getView().byId("periodiId").getValue());
			var periodiDesc = this.getView().byId("periodiDesc").getValue();
			var periodiStartDate = this.getView().byId("periodiStartDate").getValue();
			var periodiEndDate = this.getView().byId("periodiEndDate").getValue();
			var periodiNote = this.getView().byId("periodiNote").getValue();

			var dateCheck = this.dateValidation(periodiStartDate, periodiEndDate, periodiDesc);
			/******************** Conditions are checked based on the flag values of dateValidation function ********************************************/
			if (dateCheck === 1) {
				sap.m.MessageBox.error("Range di date selezionate non valido"); //If Start date > End date then dispalys message 'Invalid Date range selected'

			} else if (dateCheck === 2) {
				sap.m.MessageBox.error("si prega di inserire campi obbligatori"); //If Date and description fields are blank, then display message 'Please enter required fields'
			} else {
				console.log(periodiIdInput + periodiDesc + periodiStartDate + periodiEndDate + periodiNote);

				var sPayload = {
					"ID_PERIODO": periodiIdInput,
					"DESCR_PERIODO": periodiDesc,
					"VALE_DAL": periodiStartDate,
					"VALE_AL": periodiEndDate,
					"NOTA_SCHEDA": periodiNote,
					"SN_IMPORTABASI": "",
					"SN_IMPORTAPDRATING": ""

				};
				sPayload = JSON.stringify(sPayload);
				console.log(sPayload);
				console.log(JSON.stringify(sPayload));
				$.ajax({
					url: "/HANAMDC/STIP/STIPAdmin/services/crea_periodi.xsjs",
					//url: "/HANAMDC/STIP/STIPAdmin/services/test.xsjs",
					type: "POST",
					method: "GET",
					contentType: 'application/json',
					data: {
						odata: sPayload
					},
					dataType: 'text',

					success: function (data, textStatus1) {
						debugger;
						console.log(data);
						if (JSON.parse(data).result === "Error")
							MessageBox.error(
								" Non è possibile salvare perchè le date incluse nel periodo già esistono"); // Error message displayed 'It is not possible to save because the dates included in the period already exist'
						else
							MessageBox.success(
								"Fiscal Year creato con successo", { //Success message displayed 'Fiscal Year successfully created'
									/********************onClose function calls the cancelPeriodiDisplay function to set the fields blank and navigate to the Home Page  ********************************************/
									onClose: function (oEvent) {
										debugger;
										console.log("Onclose");
										var n = sap.ui.core.UIComponent.getRouterFor(that);
										that.cancelPeriodiDisplay();
									}
								});

					},
					error: function (data, textStatus1) {
						debugger;
						console.log(data);
						MessageBox.error("Error while perfoming Salva operation. Please contact administrator.");
						jQuery.sap.log.getLogger().error("Salva operation failed" + textStatus1.toString());
					}
				});

			}

		}
	})
});