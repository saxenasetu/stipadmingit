sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/MessageBox", "stipAdmin/stipAdmin/util/Formatter"], function (t, MessageBox, Formatter) {
	"use strict";
	var f, countPiste, countSM, countSP;
	var periodiIdInput;
	var periodiIdndex;
	return t.extend("stipAdmin.stipAdmin.controller.modPeriodi", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {
			//this.getOwnerComponent().getRouter().getRoute("modPeriodi").attachPatternMatched(this._onObjectMatched, this);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("modPeriodi").attachMatched(this._onObjectMatched, this);

		},
		/*******************onHome method navigates user to home page of STIPAdmin module*****************************/
		onHome: function () {
			debugger;
			console.log("Back");
			var n = sap.ui.core.UIComponent.getRouterFor(this);
			n.navTo("Home");
		},
		/******************** _onObjectMatched fetches argument values and depends on role and authorization checkbox visibility********************************************/
		/******************** Here countPiste, countSM, countSP values are evaluated and if found>0 then
		Periodi description, Start date and End date are set as non-editable and also getModifyPeriodi function is called********************************************/
		_onObjectMatched: function (oEvent) {
			debugger
			//	f = sap.ui.getCore().getModel("BasicAppModel").getProperty("/f");
			//	console.log("modPeriodi: f: " + sap.ui.getCore().getModel("BasicAppModel").getProperty("/f"));
			/*countPiste = sap.ui.getCore().getModel("BasicAppModel").getProperty("/countPiste");
			countSM = sap.ui.getCore().getModel("BasicAppModel").getProperty("/countSM");
			countSP = sap.ui.getCore().getModel("BasicAppModel").getProperty("/countSP");*/

			countPiste = oEvent.getParameter("arguments").countPiste;
			countSM = oEvent.getParameter("arguments").countSM;
			countSP = oEvent.getParameter("arguments").countSP;
			periodiIdInput = oEvent.getParameter("arguments").id;
			console.log(countPiste + countSM + countSP);
			//console.log("f: " + f);
			//	if (f === 0) {
			if (countPiste > 0 || countSM > 0 || countSP > 0) {
				this.byId("periodiDesc").setEditable(false);
				this.byId("periodiStartDate").setEditable(false);
				this.byId("periodiEndDate").setEditable(false);
				this.byId("deletePeriodiButton").setVisible(false);
				var modErrorMsgValue = "impossibile modificare e/eliminare I dati di base del periodo perché risulta associato a " + countPiste +
					" KPI," + countSM + " schede master e " + countSP + " schede personali" //Error message dispalyed 'impossible to modify and / delete the basic data of the period because it is associated with' the countPiste, countSP, countSM values
				this.byId("modErrorMsg").setVisible(true);
				this.byId("modErrorMsg").setValue(modErrorMsgValue);
			} else {
				this.byId("periodiDesc").setEditable(true);
				this.byId("periodiStartDate").setEditable(true);
				this.byId("periodiEndDate").setEditable(true);
				this.byId("deletePeriodiButton").setVisible(true);
				this.byId("modErrorMsg").setVisible(false);
			}
			this.getModifyPeriodi();
		},
		/******************** dateValidation function is used to validate the user entries of Date and Description********************************************/
/******************** Performs validation for empty fields and date comparison (Start date must not exceed the End date)********************************************/
		dateValidation: function (date1, date2, desc) {
			//	debugger;
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
		/******************** cancelPeriodiDisplay undo the changes and set the fields blank and navigate to the Home page********************************************/
		cancelPeriodiDisplay: function (t) {
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "back");
			var n = sap.ui.core.UIComponent.getRouterFor(this);
			n.navTo("Periodi");
		},
		/******************** getModifyPeriodi function fetches the data from the backend and verifies the condition of periodiIdInput
		If it is not blank and not undefined then will allow it to get modified********************************************/
		getModifyPeriodi: function () {
			debugger
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			var oFilters = [];
			var that = this;
			var oMainModel = new sap.ui.model.json.JSONModel();
			if (periodiIdInput != undefined && periodiIdInput != "") {
				var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, periodiIdInput);
				oFilters.push(filter1);
			}
			xsoDataModel.read("/PERIODI_RIFERIMENTO?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;
					console.log(oDataIn);
					var modifyPeriodiData = oDataIn.results[0];
					console.log(modifyPeriodiData);
					modifyPeriodiData.NOTA_SCHEDA = modifyPeriodiData.NOTA_SCHEDA === "NULL" ? "" : modifyPeriodiData.NOTA_SCHEDA; 
					modifyPeriodiData.VALE_DAL = Formatter.removetime(modifyPeriodiData.VALE_DAL); //removetime function in the Formatter is invoked to change the format of the Start Date to DD-MM-YYYY
					modifyPeriodiData.VALE_AL = Formatter.removetime(modifyPeriodiData.VALE_AL); //removetime function in the Formatter is invoked to change the format of the End Date to DD-MM-YYYY
					oMainModel.setData(
						modifyPeriodiData
					);
					that.getView().setModel(oMainModel, "modifyPeriodiModel");
				},
				error: function (oDataIn, oResponse) {
					debugger;
					console.log(oDataIn);
				}
			});

		},
		/******************** deletePeriodi displays the confirmation message and based on user input calls the respective functions********************************************/

		deletePeriodi: function () {
			var that = this;
			sap.m.MessageBox.confirm("Sei sicuro di voler eliminare?", { //Displays confirmation message 'Are you sure you want to delete?'
				actions: ["Si", sap.m.MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction == "NO") {
						that.cancelPeriodiDisplay(); //If user action is NO then calls the cancelPeriodiDisplay function
					} else if (oAction == "Si") {
						that.deletePeriodiRecord(); //If user action is OK then calls the deletePeriodiRecord function
					}

				}
			});
		},
		/******************** deletePeriodiRecord function deletes a particular record based on the periodiIdInput********************************************/
		deletePeriodiRecord: function () {
			//	debugger
			var that = this;
			var periodiIdInput = parseInt(this.getView().byId("periodiId").getValue());

			console.log(periodiIdInput);

			var sPayload = {
				"ID_PERIODO": periodiIdInput
			};
			sPayload = JSON.stringify(sPayload);
			console.log(sPayload);
			console.log(JSON.stringify(sPayload));
			$.ajax({
				url: "/HANAMDC/STIP/STIPAdmin/services/delete_periodi.xsjs",
				type: "POST",
				method: "GET",
				contentType: 'application/json',
				data: {
					odata: sPayload
				},
				dataType: 'text',

				success: function (data, textStatus1) {
					//	debugger;
					console.log(data);
					MessageBox.success(
						"Fiscal Year eliminato con successo", { // Displays the success message after deletion 'Fiscal Year successfully eliminated'
							/******************** onClose function navigates the user to the Home Page ********************************************/
							onClose: function (oEvent) {
								//	debugger;
								console.log("Onclose");
								/*var n = sap.ui.core.UIComponent.getRouterFor(that);
								n.navTo("Periodi");*/
								that.cancelPeriodiDisplay();
							}
						});

				},
				error: function (data, textStatus1) {
					//	debugger;
					console.log(data);
					MessageBox.error("Error while perfoming delete operation. Please contact administrator.");
					jQuery.sap.log.getLogger().error("delete operation failed" + textStatus1.toString());
				}
			});

		},
		/******************** formatDateToMMDDYYYY function modifies Date to MM-DD-YYYY format ********************************************/
		formatDateToMMDDYYYY: function (sValue) {
			if (sValue === "" || sValue === undefined || sValue === null) {
				return "";
			} else {
				var pos = sValue.indexOf("-");
				if (parseInt(pos) == 2)
					return (sValue.split("-")[2] + "-" + sValue.split("-")[1] + "-" + sValue.split("-")[0]);
				else
					return sValue;
			}
		},
		/******************** modifyPeriodiDisplay fetches the field values, formats Date to the MM-DD-YYYY format,
		performs date validation and displays the output based on parameters ID_PERIODO, DESCR_PERIODO, VALE_DAL, VALE_AL, NOTA_SCHEDA in 'sPayload'********************************************/
		modifyPeriodiDisplay: function () {
			debugger
			var that = this;
			var periodiIdInput = parseInt(this.getView().byId("periodiId").getValue());
			var periodiDesc = this.getView().byId("periodiDesc").getValue();
			var periodiStartDate = this.getView().byId("periodiStartDate").getValue();
			periodiStartDate = this.formatDateToMMDDYYYY(periodiStartDate);
			var periodiEndDate = this.getView().byId("periodiEndDate").getValue();
			periodiEndDate = this.formatDateToMMDDYYYY(periodiEndDate);
			var periodiNote = this.getView().byId("periodiNote").getValue();
			var dateCheck = this.dateValidation(periodiStartDate, periodiEndDate, periodiDesc);
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
					url: "/HANAMDC/STIP/STIPAdmin/services/modifica_periodi.xsjs",
					//url: "/HANAMDC/STIP/STIPAdmin/services/test.xsjs",
					type: "POST",
					method: "GET",
					contentType: 'application/json',
					data: {
						odata: sPayload
					},
					dataType: 'text',

					success: function (data, textStatus1) {
						//	debugger;
						console.log(data);
						if (JSON.parse(data).result === "Error")
							MessageBox.error(
								" Non è possibile salvare perchè le date incluse nel periodo già esistono"); //Error message displayed 'It is not possible to save because the dates included in the period already exist'
						else
							MessageBox.success(
								"Fiscal Year modificato con successo", { // Success message displayed 'Fiscal Year changed successfully'
									onClose: function (oEvent) {
										//	debugger;
										console.log("Onclose");
										/*var n = sap.ui.core.UIComponent.getRouterFor(that);
										n.navTo("Periodi");*/
										that.cancelPeriodiDisplay();
									}
								});

					},
					error: function (data, textStatus1) {
						//	debugger;
						console.log(data);
						MessageBox.error("Error while perfoming Salva operation. Please contact administrator.");
						jQuery.sap.log.getLogger().error("Salva operation failed" + textStatus1.toString());
					}
				});

			}
		}

	});
});