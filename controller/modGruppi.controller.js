sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (t, MessageBox) {
	"use strict";
	var oMainModel = new sap.ui.model.json.JSONModel();
	//	var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/0/FISCAL_YEAR");
	var idGruppi, year, selectedFYPeriodi;
	return t.extend("stipAdmin.stipAdmin.controller.modGruppi", {
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("modGruppi").attachPatternMatched(this._onObjectMatched, this)
		},
		_onObjectMatched: function (oEvent) {
			debugger;
			var oArguments = oEvent.getParameter("arguments");
			year = oArguments.ID_PERIODO;
			idGruppi = oArguments.ID_GRUPPI;
			selectedFYPeriodi = oArguments.SEL_FY_PERIODI;
		
			var data = [];
			if (sap.ui.getCore().getModel("modModel") != undefined) {

				data.push(sap.ui.getCore().getModel("modModel").getData());
				oMainModel.setData(data);
				console.log(oMainModel.getData());
				//this.displayGruppoPiste();
				var piste = oMainModel.getData()[0].Piste,
					that = this;
				if (parseInt(piste, 10) !== 0) {
					that.byId("Del").setVisible(false);
					that.byId("delLabel").setVisible(true);
					var text = "Non è possibile eliminare il gruppo perchè associate a " + piste + " KPI.";
					that.byId("delLabel").setText(text);
				} else {
					that.byId("Del").setVisible(true);
					that.byId("delLabel").setVisible(false);
				}
				this.getView().setModel(oMainModel, "GruppiPisteModel");
			} else {
				oMainModel.setSizeLimit(1000);
				oMainModel.setData(data);
				this.getView().setModel(oMainModel, "GruppiPisteModel");
				this.displayGruppoPiste();
			}

			//	var year = sap.ui.getCore().getModel("BasicAppModel").getProperty("/DESCR_PERIODO");
			this.byId("fy").setText(selectedFYPeriodi);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/backk", "back");
		},

		displayGruppoPiste: function () {
			debugger
			var that = this;
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");

			var gruppiResultJson = [];
			var gruppiResultJsonData = [];
			var oFilters = [],
				piste = [];
			//	var idGruppi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/idGruppi");
			if (idGruppi != undefined && idGruppi != "") {
				var filter1 = new sap.ui.model.Filter("ID_GRUPPOPISTA", sap.ui.model.FilterOperator.EQ, idGruppi);
				oFilters.push(filter1);
			}

			xsoDataModel.read("/V_GRUPPI_PISTE?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;
					console.log(oDataIn);
					for (var i = 0; i < oDataIn.results.length; ++i) {
						gruppiResultJsonData = {
							"ID": oDataIn.results[i].ID_GRUPPOPISTA,
							"DESC": oDataIn.results[i].DESCR_GRUPPOPISTA,
						};
						gruppiResultJson.push(gruppiResultJsonData);
						if (oDataIn.results[i].ID_PISTA !== null && oDataIn.results[i].ID_PISTA !== "0" && oDataIn.results[i].ID_PISTA !==
							undefined)
							piste.push(oDataIn.results[i].ID_PISTA);
					}
					console.log(gruppiResultJson);
					oMainModel.setData(
						gruppiResultJson
					);
					this.getView().setModel(oMainModel, "GruppiPisteModel");
					console.log(piste);
					//var piste = parseInt(sap.ui.getCore().getModel("BasicAppModel").getProperty("/piste"), 10);
					if (piste.length >= 1) {
						that.byId("Del").setVisible(false);
						that.byId("delLabel").setVisible(true);
						var text = "Non è possibile eliminare il gruppo perchè associate a " + piste.length + " KPI.";
						that.byId("delLabel").setText(text);
					} else {
						that.byId("Del").setVisible(true);
						that.byId("delLabel").setVisible(false);
					}

				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed while getting T_GRUPPIPISTE. Please contact administrator.");
					jQuery.sap.log.getLogger().error("T_GRUPPIPISTE fetch failed" + oError.toString());
				}.bind(this)
			});

		},
		salva: function () {
			debugger;
			var that = this;
			if (oMainModel.getData()[0].DESC === undefined || oMainModel.getData()[0].DESC === "")
				MessageBox.error("Non è possibile salvare l'azione. il campo 'Descrizione' è obbligatorio. ");
			else {
				var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
				var payload = {
					"ID_GRUPPOPISTA": oMainModel.getData()[0].ID,
					"DESCR_GRUPPOPISTA": oMainModel.getData()[0].DESC
				};
				var context = "/T_GRUPPIPISTE(" + oMainModel.getData()[0].ID + ")";
				xsoDataModel.update(context, payload, null, function (oDataIn) {
						debugger;
						console.log(oDataIn);

						MessageBox.success("Gruppo KPI modificato con successo", {
							onClose: function (oEvent) {
								debugger;
								console.log("Onclose");
								sap.ui.getCore().getModel("BasicAppModel").setProperty("/backk", "back");
								sap.ui.core.UIComponent.getRouterFor(that).navTo("Gruppi", {
									gruppi: "Gruppi",
									str: year
								});
							}
						});

					}.bind(this),
					function (oError) {
						//Handle the error
						MessageBox.error("Data fetch failed while updating T_GRUPPIPISTE. Please contact administrator.");
						jQuery.sap.log.getLogger().error("T_GRUPPIPISTE fetch failed" + oError.toString());
					}.bind(this)
				);

				xsoDataModel.attachRequestCompleted(function () {
					MessageBox.success("Gruppo KPI modificato con successo", {
						onClose: function (oEvent) {
							debugger;
							console.log("Onclose");
							sap.ui.getCore().getModel("BasicAppModel").setProperty("/backk", "back");
							sap.ui.core.UIComponent.getRouterFor(that).navTo("Gruppi", {
								gruppi: "Gruppi",
								str: year
							});
						}
					});

				});
			}

		},
		deleteGruppi: function () {
			var that = this;
			var gruppi_id = oMainModel.getData()[0].ID;
			MessageBox.confirm("Sei sicuro di voler eliminare?", {
				styleClass: "sapUiSizeCompact",
				actions: ["Si", sap.m.MessageBox.Action.NO],
				emphasizedAction: "Si",
				initialFocus: sap.m.MessageBox.Action.NO,
				onClose: function (oAction) {
					if (oAction === "NO") {
						//that.cancel();
					} else if (oAction === "Si") {
						that.elimina();
					}

				}
			});
		},

		elimina: function () {
			var that = this;
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			var context = "/T_GRUPPIPISTE(" + oMainModel.getData()[0].ID + ")";
			xsoDataModel.remove(context, function (oDataIn) {
					debugger;
					console.log(oDataIn);
					MessageBox.success(
						"Gruppo KPI eliminato con successo", {
							onClose: function (oEvent) {
								debugger;
								console.log("Onclose");
								sap.ui.getCore().getModel("BasicAppModel").setProperty("/backk", "del");
								sap.ui.core.UIComponent.getRouterFor(that).navTo("Gruppi", {
									gruppi: "Gruppi",
									str: year
								});
							}
						});

				}.bind(this),
				function (oError) {
					//Handle the error
					MessageBox.error("Error Occurred while deleting T_GRUPPIPISTE. Please contact administrator.");
					jQuery.sap.log.getLogger().error("T_GRUPPIPISTE fetch failed" + oError.toString());
				}.bind(this)
			);

			xsoDataModel.attachRequestCompleted(function () {
				MessageBox.success(
					"Gruppo KPI eliminato con successo", {
						onClose: function (oEvent) {
							debugger;
							sap.ui.getCore().getModel("BasicAppModel").setProperty("/backk", "del");
							console.log("Onclose");
							sap.ui.core.UIComponent.getRouterFor(that).navTo("Gruppi", {
								gruppi: "Gruppi",
								str: year
							});
						}
					});

			});
		},

		cancel: function () {
			var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/0/FISCAL_YEAR");
			//sap.ui.getCore().getModel("BasicAppModel").setProperty("/backk","back");
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Gruppi", {
				gruppi: "Gruppi",
				str: year
			});
		}
	})
});