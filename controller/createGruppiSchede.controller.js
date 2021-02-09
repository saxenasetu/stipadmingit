sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox","sap/ui/core/BusyIndicator"
], function (t, MessageBox,BusyIndicator) {
	"use strict";
	var id;
	var oMainModel = new sap.ui.model.json.JSONModel();
	var idGruppi, year,selectedFYPeriodi;
		var template_letters, template_letterss = [{
			DESCRIZIONE: '',
			ID_TEMPLATELETTERA: ''
		}];
//	var template_letter = sap.ui.getCore().getModel("BasicAppModel").getProperty("/template_letters");
	/*var omodel2 = sap.ui.getCore().getModel("BasicAppModel");
	sap.ui.getCore().setModel(omodel2,"Model2");*/
	return t.extend("stipAdmin.stipAdmin.controller.createGruppiSchede", {
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("createGruppiSchede").attachPatternMatched(this._onObjectMatched, this)
		},
		_onObjectMatched: function (oEvent) {
			debugger
			var oArguments = oEvent.getParameter("arguments");
			year = oArguments.ID_PERIODO;
			idGruppi = oArguments.ID_GRUPPI;
			selectedFYPeriodi=oArguments.SEL_FY_PERIODI;
		
			this.byId("desc").setValue("");
			this.byId("letter").setSelectedKey("");
		/*	selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/0/FISCAL_YEAR");
			var id = sap.ui.getCore().getModel("BasicAppModel").getProperty("/nextidGruppi");
			var year = sap.ui.getCore().getModel("BasicAppModel").getProperty("/DESCR_PERIODO");
			this.byId("fy").setText(year);*/
				this.byId("fy").setText(selectedFYPeriodi);
					this.templateLettereSearch();
			var GruppiSchedaData = {
				ID_GRUPPOSCHEDA: idGruppi,
				ID_PERIODO: year,
				DESCR_GRUPPOSCHEDA: "",
				ID_TEMPLATELETTERA: "",
				TEMPLATELETTERA: ""
			};

			oMainModel.setData(
				GruppiSchedaData
			);
			oMainModel.setProperty("/template_letter", template_letters);
			oMainModel.refresh();

			this.getView().setModel(oMainModel, "GruppiSchedaTableModel");
			//oMainModel.setProperty("/template_letter", template_letter);
			//oMainModel.refresh();
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/backk","back");

		},
		/*id: function () {
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			xsoDataModel.read("/T_GRUPPISCHEDE/$count", {

				success: function (oDataIn, oResponse) {
					debugger;
					id = parseInt(oResponse.data, 10) + 1;
				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed while getting T_GRUPPISCHEDE. Please contact administrator.");
					jQuery.sap.log.getLogger().error("T_GRUPPISCHEDE fetch failed" + oError.toString());
				}.bind(this)
			});

			xsoDataModel.attachRequestCompleted(function () {
				var GruppiSchedaData = {
					ID_GRUPPOSCHEDA: id,
					ID_PERIODO: selectedFYPeriodi,
					DESCR_GRUPPOSCHEDA: "",
					ID_TEMPLATELETTERA: "",
					TEMPLATELETTERA: ""
				};

				oMainModel.setData(
					GruppiSchedaData
				);
				oMainModel.setProperty("/template_letter", template_letter);
				oMainModel.refresh();
				//	this.getView().setModel(oMainModel, "GruppiPisteTableModel");
			});
		},*/
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

		Salva: function () {
			debugger;
			if(oMainModel.getData().DESCR_GRUPPOSCHEDA === null ||  oMainModel.getData().DESCR_GRUPPOSCHEDA === "")
			MessageBox.error("Non è possibile salvare l'azione. il campo 'Descrizione' è obbligatorio. ");
			else{
			var letter = this.byId("letter").getSelectedKey();
			if (letter === undefined || letter === null || letter === "")
				letter = 0;
			var payload = {
				ID_GRUPPOSCHEDA: idGruppi,
				ID_PERIODO: year,
				DESCR_GRUPPOSCHEDA: oMainModel.getData().DESCR_GRUPPOSCHEDA,
				ID_TEMPLATELETTERA: parseInt(letter, 10)
			}
			var that = this;
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			xsoDataModel.create("/T_GRUPPISCHEDE", payload, {

				success: function (oDataIn, oResponse) {
					debugger;
					sap.ui.getCore().getModel("BasicAppModel").getProperty("/backk","create");
					if (oResponse.statusCode === "200" || oResponse.statusCode === "201") {
						//MessageBox.success("Gruppi Scheda Successfully Created");
						MessageBox.success(
							"Gruppo Scheda creato con successo", {
								onClose: function (oEvent) {
									debugger;
									console.log("Onclose");
									sap.ui.core.UIComponent.getRouterFor(that).navTo("Gruppi", {
										gruppi: "Gruppi",
										str: year
									});
								}
							});
						//this.byId("Salva").setVisible(false);
					} else
						MessageBox.error("Couldn't create record in T_GRUPPISCHEDE. Please contact administrator.");
				}.bind(this),
				error: function (oError) {
					//Handle the error
					debugger;
					MessageBox.error("Couldn't create record in T_GRUPPIPISTE. Please contact administrator.");
					jQuery.sap.log.getLogger().error("T_GRUPPIPISTE fetch failed" + oError.toString());
				}.bind(this)
			});
			}

		},
		cancel: function () {
			
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/backk","back");
		//	var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/0/FISCAL_YEAR");
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Gruppi", {
				gruppi: "Gruppi",
				str: year
			});
		}

	})
});