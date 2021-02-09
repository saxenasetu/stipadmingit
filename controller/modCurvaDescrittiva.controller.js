sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";
	var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");

	return Controller.extend("stipAdmin.stipAdmin.controller.modCurvaDescrittiva", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("modCurvaDescrittiva").attachPatternMatched(this._onObjectMatched, this);
		},
		/******************** _onObjectMatched function fetches the argument values ********************************************/
		_onObjectMatched: function () {
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/change", "change");
			var descrCurve = sap.ui.getCore().getModel("BasicAppModel").getProperty("/descrCurve");
			var piste = parseInt(sap.ui.getCore().getModel("BasicAppModel").getProperty("/piste")); //fetching piste id
			console.log(piste);
			if (piste > 0) {
				this.byId("deleteCurveButton").setVisible(false); //if piste >0 dont display elimina button
				this.byId("desc").setEditable(false); //if piste >0 ,description field is non editable
			} else {
				this.byId("deleteCurveButton").setVisible(true);
				this.byId("desc").setEditable(true);
			}
			this.getView().byId("desc").setValue(descrCurve);
		},
		/********************saveCurve function is used to save the data based on the ID_CURVA and DESCR_CURVA********************************************/
		saveCurve: function () {
			debugger
			var that = this;
			var desc = this.byId("desc").getValue();
			if (desc === "" || desc === undefined) {
				MessageBox.error("la descrizione è obbligatoria"); //Error message displayed 'the description is mandatory'
				//	break;
			} else {
				var idCurve = parseInt(sap.ui.getCore().getModel("BasicAppModel").getProperty("/curveId"), 10);
				var context = "/T_CURVE(" + idCurve + ")";
				var sPayload = {
					"ID_CURVA": idCurve,
					"DESCR_CURVA": desc
				};
				xsoDataModel.update(context, sPayload, {
					success: function (oDataIn, oResponse) {
						debugger;
						console.log(oDataIn);
						MessageBox.success("curva modificata con successo "); //Success message 'successfully modified curve'

					}.bind(this),
					error: function (oError) {
						//Handle the error
						//	debugger;
						MessageBox.error("Couldn't create record in T_CURVE. Please contact administrator.");
						jQuery.sap.log.getLogger().error("T_CURVE fetch failed" + oError.toString());
					}.bind(this)
				});
			}
		},
		/********************************start of delete functionality methods *********************************/
		/********************************deleteCurveFn function seeks confirmation from the user for deletion *********************************/
		/********************************If the user input is "Si" then invokes the deleteCurve function*********************************/
		deleteCurveFn: function () {
			var that = this;
			var idCurve = sap.ui.getCore().getModel("BasicAppModel").getProperty("/curveId");
			sap.m.MessageBox.confirm("Sei sicuro di voler eliminare?", { //Confirmation message 'Are you sure you want to delete?'
				actions: ["Si", sap.m.MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction == "NO") {
						//that.cancel();
					} else if (oAction == "Si") {
						that.deleteCurve(idCurve);
					}

				}
			});
		},
		/********************************deleteCurve function deletes the particular Curve based on ID_CURVA and ID_PERIODO *********************************/
		deleteCurve: function (idCurve) {
			var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/0/FISCAL_YEAR");
			var that = this;
			var sPayload = {
				"ID_CURVA": idCurve,
				ID_PERIODO: parseInt(selectedFYPeriodi, 10)
			};
			sPayload = JSON.stringify(sPayload);
			console.log(sPayload);
			$.ajax({
				url: "/HANAMDC/STIP/STIPAdmin/services/delete_curve.xsjs",
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
					MessageBox.success(
						"Curva eliminata con successo", {
							onClose: function (oEvent) {
								debugger;
								console.log("Onclose");
								that.cancel();
							}
						});

				},
				error: function (data, textStatus1) {
					debugger;
					console.log(data);
					MessageBox.error("Error while perfoming delete operation. Please contact administrator.");
					jQuery.sap.log.getLogger().error("delete operation failed" + textStatus1.toString());
				}
			});
		},
		/********************************end of delete functionality methods *********************************/
		/******************** cancel function navigates the user to the previous Curva page and will retain the previous changes********************************************/
		cancel: function () {
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/change", "change");
			var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/0/FISCAL_YEAR");
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Curve", {
				curve: "Curve",
				str: selectedFYPeriodi
			});
		}

	});

});