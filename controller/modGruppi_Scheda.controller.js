sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox","sap/ui/core/BusyIndicator"
], function (Controller, MessageBox,BusyIndicator) {
	"use strict";
	var oMainModel = new sap.ui.model.json.JSONModel();
	//	var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/0/FISCAL_YEAR");

	var idGruppi, year, selectedFYPeriodi;
		var template_letters, template_letterss = [{
			DESCRIZIONE: '',
			ID_TEMPLATELETTERA: ''
		}];
	return Controller.extend("stipAdmin.stipAdmin.controller.modGruppi_Scheda", {
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("modGruppi_Scheda").attachPatternMatched(this._onObjectMatched, this)
		},
		_onObjectMatched: function (oEvent) {
			var oArguments = oEvent.getParameter("arguments");
			year = oArguments.ID_PERIODO;
			idGruppi = oArguments.ID_GRUPPI;
			selectedFYPeriodi = oArguments.SEL_FY_PERIODI;
		
			console.log(sap.ui.getCore().getModel("BasicAppModel").getData());
			//this.displayGruppoScheda();
			var data = [];
			if (sap.ui.getCore().getModel("modModel") != undefined) {
				data.push(sap.ui.getCore().getModel("modModel").getData());
				var template_letter = sap.ui.getCore().getModel("BasicAppModel").getProperty("/template_letters");
				oMainModel.setSizeLimit(1000);
				oMainModel.setData(data);
				console.log(oMainModel.getData());
				var schedamster = oMainModel.getData()[0].schedamster,
					that = this;
				if (parseInt(schedamster, 10) !== 0) {
					that.byId("Del").setVisible(false);
					that.byId("delLabel").setVisible(true);
					var text = "Non è possibile eliminare il gruppo perchè associate a " + schedamster + " Schede.";
					that.byId("delLabel").setText(text);
				} else {
					that.byId("Del").setVisible(true);
					that.byId("delLabel").setVisible(false);
				}
				var ltr = oMainModel.getData()[0].TEMPLATE_LETTERE_ID;
				//oMainModel.setProperty("/template_letter", template_letter);
				that.getView().byId("letter").setSelectedKey(ltr);
				this.getView().setModel(oMainModel, "displayGruppiSchedaModel");
				console.log(oMainModel.getData());
			} else {
				oMainModel.setSizeLimit(1000);
				oMainModel.setData(data);
				this.getView().setModel(oMainModel, "displayGruppiSchedaModel");
					this.templateLettereSearch();
				this.displayGruppoScheda();
			
			}
			//	var year = sap.ui.getCore().getModel("BasicAppModel").getProperty("/DESCR_PERIODO");
			this.byId("fy").setText(selectedFYPeriodi);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/backk", "back");
		},

		displayGruppoScheda: function () {
			debugger
			var that = this;
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");

			var gruppiResultJson = [];
			var gruppiResultJsonData = [];
			var oFilters = [];
			var schedamster = [];
		//	var idGruppi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/idGruppi");
			if (idGruppi != undefined && idGruppi != "") {
				var filter1 = new sap.ui.model.Filter("ID_GRUPPOSCHEDA", sap.ui.model.FilterOperator.EQ, idGruppi);
				oFilters.push(filter1);
			}

			xsoDataModel.read("/V_GRUPPI_SCHEDA?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;
					console.log(oDataIn);
					for (var i = 0; i < oDataIn.results.length; ++i) {
						gruppiResultJsonData = {
							"ID": oDataIn.results[i].ID_GRUPPOSCHEDA,
							"DESC": oDataIn.results[i].DESCR_GRUPPOSCHEDA,
							"ID_TEMPLATELETTERA": oDataIn.results[i].ID_TEMPLATELETTERA,
							"TEMPLATE_LETTERE": ""
						};
						if (oDataIn.results[i].ID_SCHEDAMASTER !== null && oDataIn.results[i].ID_SCHEDAMASTER !== 0 && oDataIn.results[i].ID_SCHEDAMASTER !==
							undefined)
							schedamster.push(oDataIn.results[i].ID_SCHEDAMASTER);
						gruppiResultJson.push(gruppiResultJsonData);
					}
					console.log(gruppiResultJson);
					console.log(schedamster);
					oMainModel.setData(
						gruppiResultJson
					);

					this.getView().setModel(oMainModel, "displayGruppiSchedaModel");
					//var schedamster = parseInt(sap.ui.getCore().getModel("BasicAppModel").getProperty("/schedamster"), 10);

					if (schedamster.length >= 1) {
						that.byId("Del").setVisible(false);
						that.byId("delLabel").setVisible(true);
						var text = "Non è possibile eliminare il gruppo perchè associate a " + schedamster.length + " Schede.";
						that.byId("delLabel").setText(text);
					} else {
						that.byId("Del").setVisible(true);
						that.byId("delLabel").setVisible(false);
					}
					var ltr = oMainModel.getData()[0].ID_TEMPLATELETTERA;
					oMainModel.setProperty("/template_letter", template_letters);
					that.getView().byId("letter").setSelectedKey(ltr);
					console.log(oMainModel.getData());
					oMainModel.refresh();

				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed while getting T_GRUPPISCHEDE. Please contact administrator.");
					jQuery.sap.log.getLogger().error("T_GRUPPISCHEDE fetch failed" + oError.toString());
				}.bind(this)
			});
			/*xsoDataModel.attachRequestCompleted(function () {
				debugger;
				oMainModel.setProperty("/template_letter", template_letter);
				that.byId("letter").setSelectedKey(oMainModel.getData()[0].ID_TEMPLATELETTERA);
				console.log(oMainModel.getData());
				oMainModel.refresh();
					var idTemp = parseInt(oMainModel.getData()[0].ID_TEMPLATELETTERA,10);
					var p = "/template_letter" + idTemp + "/desc"
					var q = "/template_letter" + idTemp + "/id"

					oMainModel.setProperty("/template_letter/0/id", idTemp);
					oMainModel.setProperty("/template_letter/0/desc", template_letter[idTemp]);
					oMainModel.setProperty(p, "");
					oMainModel.setProperty(q, 0);

				var tlid = oMainModel.getData()[0].ID_TEMPLATELETTERA;

				console.log(tlid);
				if (tlid !== "")
					that.templateLettere(tlid);

			});*/

		},
	templateLettereSearch: function () {
				debugger;
				BusyIndicator.show();
				var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
				//	debugger;
				template_letters = [{
					"id": 0,
					"desc": ""
				}];
				//template
				var filter = new sap.ui.model.Filter("SN_DISMESSO", sap.ui.model.FilterOperator.EQ, "N");
				var oFilters = [];
				oFilters.push(filter);
				xsoDataModel.read("/TEMPLATELETTERE?$format=json", {
					async: false,
					filters: oFilters,
					success: function (oDataIn, oResponse) {
						debugger;
						console.log(oDataIn);
						for (var i = 0; i < oDataIn.results.length; i++) {
							template_letters.push({
								"id": oDataIn.results[i].ID_TEMPLATELETTERA,
								"desc": oDataIn.results[i].DESCRIZIONE
							});
						}
						oMainModel.setSizeLimit(template_letters.length);
					//	template_lettersFinal = template_letters;
						oMainModel.setProperty("/template_letters", template_letters);
				/*	oMainModel.setProperty("/template_lettersFinal", template_lettersFinal);
						tp = [{
							desc: "Gruppo KPI"
						}, {
							desc: "Gruppo Scheda"
						}];
						oMainModel.setProperty("/tipo", tp);*/
						BusyIndicator.hide();
						oMainModel.refresh();
					},
					error: function (oError) {
						BusyIndicator.hide();
					}
				});
			
			},

		salva: function () {
			debugger;
			var that = this;
			if (oMainModel.getData()[0].DESCR_GRUPPOSCHEDA === null || oMainModel.getData()[0].DESCR_GRUPPOSCHEDA === "")
				MessageBox.error("Non è possibile salvare l'azione. il campo 'Descrizione' è obbligatorio. ");
			else {
				var letter = this.byId("letter").getSelectedKey();
				if (letter === undefined || letter === null || letter === "")
					letter = 0;
				var payload = {
					ID_GRUPPOSCHEDA: oMainModel.getData()[0].ID,
					ID_PERIODO: year,
					DESCR_GRUPPOSCHEDA: oMainModel.getData()[0].DESC,
					ID_TEMPLATELETTERA: parseInt(letter, 10)
				}
				var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
				var context = "/T_GRUPPISCHEDE(" + oMainModel.getData()[0].ID + ")";
				xsoDataModel.update(context, payload, null, function (oDataIn) {
						debugger;
						console.log(oDataIn);

						MessageBox.success("Gruppo Scheda modificato con successo", {
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
						MessageBox.error("Data fetch failed while updating T_GRUPPISCHEDE. Please contact administrator.");
						jQuery.sap.log.getLogger().error("T_GRUPPISCHEDE fetch failed" + oError.toString());
					}.bind(this)
				);

				xsoDataModel.attachRequestCompleted(function () {
					MessageBox.success("Gruppo Scheda modificato con successo", {
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
			var gruppi_id = oMainModel.getData()[0].ID_GRUPPOSCHEDA;
			MessageBox.confirm("Sei sicuro di voler eliminare?", {
				actions: ["Si", sap.m.MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction == "NO") {
						//that.cancel();
					} else if (oAction == "Si") {
						that.elimina();
					}

				}
			});
		},

		elimina: function () {
			var that = this;
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			var context = "/T_GRUPPISCHEDE(" + oMainModel.getData()[0].ID + ")";
			xsoDataModel.remove(context, function (oDataIn) {
					debugger;
					console.log(oDataIn);
					MessageBox.success(
						"Gruppo Scheda eliminato con successo", {
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
					"Gruppo Scheda eliminato con successo", {
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

			});
		},

		cancel: function () {
			var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/0/FISCAL_YEAR");
			//sap.ui.getCore().getModel("BasicAppModel").setProperty("/backk", "back");
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Gruppi", {
				gruppi: "Gruppi",
				str: year
			});
		}
	})
});