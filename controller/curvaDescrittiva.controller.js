sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";
	var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
	var id;
	return Controller.extend("stipAdmin.stipAdmin.controller.curvaDescrittiva", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("curvaDescrittiva").attachPatternMatched(this._onObjectMatched, this);
		},
		/******************** _onObjectMatched function fetches the argument values ********************************************/
		_onObjectMatched: function () {
			this.byId("desc").setEditable(true);
			this.byId("Salva").setVisible(true);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/change", "change");	//Will restore the changes on going back
			var year = sap.ui.getCore().getModel("BasicAppModel").getProperty("/year");
			this.byId("fy").setText(year);
			this.getView().byId("desc").setValue("");
			/*	xsoDataModel.read("/T_CURVE/$count", {
						success: function (oDataIn, oResponse) {
							debugger;
							console.log(oDataIn);
							id = oResponse.data;
						}.bind(this),
						error: function (oError) {
							//Handle the error
							MessageBox.error("Data fetch failed while getting T_Curve_righe. Please contact administrator.");
							jQuery.sap.log.getLogger().error("T_Curve_righe fetch failed" + oError.toString());
						}.bind(this)
					});*/

		},
		/********************saveCurve function is used to save the data based on the fiscal year and curva type after verifying that the 
		description is non blank and the Save is disabled and invisible after successful Save operation********************************************/
		saveCurve: function () {
			debugger
			var that = this;
			var desc = this.byId("desc").getValue();
			if (desc === "" || desc === undefined) {
				MessageBox.error("la descrizione è obbligatoria"); //Error message displayed 'the description is mandatory'
				//	break;
			} else {
				var periodiId = sap.ui.getCore().getModel("BasicAppModel").getProperty("/fiscalYear");
				var selectedCurve = sap.ui.getCore().getModel("BasicAppModel").getData().selectedCurve;

				id = sap.ui.getCore().getModel("BasicAppModel").getProperty("/nextCurveId");
				var sPayload = {
					"ID_CURVA": id,
					"DESCR_CURVA": desc,
					"ID_PERIODO": periodiId,
					"ID_TIPO_CURVA": selectedCurve,
					"SN_GATE": "",
					"SN_DESCRITTIVA": ""

				};

				xsoDataModel.create("/T_CURVE", sPayload, {

					success: function (oDataIn, oResponse) {
						//	debugger;
						if (oResponse.statusCode === "200" || oResponse.statusCode === "201") {
							//	MessageBox.success("curva creata con successo");
							that.byId("desc").setEditable(false);
							that.byId("Salva").setVisible(false);
							MessageBox.success(
								"curva creata con successo", { //Success message 'Successfully created curve'
									onClose: function (oEvent) {
										debugger;
										console.log("Onclose");
										that.cancel();
									}
								});

							//	that.cancel();
						} else
							MessageBox.error("Couldn't create record in T_CURVE. Please contact administrator.");
					}.bind(this),
					error: function (oError) {
						//Handle the error
						//	debugger;
						MessageBox.error("Couldn't create record in T_CURVE. Please contact administrator.");
						jQuery.sap.log.getLogger().error("T_CURVE fetch failed" + oError.toString());
					}.bind(this)
				});
				/*	console.log(sPayload);
					console.log(JSON.stringify(sPayload));
					$.ajax({
						url: "/HANAMDC/STIP/STIPAdmin/services/crea_curva.xsjs",
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

							//	that.byId("perf").setEditable(false);
							//	that.byId("pay").setEditable(false);
							that.byId("desc").setEditable(false);
							that.byId("Salva").setVisible(false);
							MessageBox.success("curva creata con successo");
						},
						error: function (data, textStatus1) {
							debugger;
							console.log(data);
							MessageBox.error("Error while perfoming Salva operation. Please contact administrator.");
							jQuery.sap.log.getLogger().error("Salva operation failed" + textStatus1.toString());
						}
					});*/
			}
		},
		/******************** cancel function navigates the user to the previous Curva page and will retain the previous changes********************************************/
		cancel: function () {
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/change", "change");
			var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/fiscalYear");
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Curve", {
				curve: "Curve",
				str: selectedFYPeriodi
			});
		}

	});

});