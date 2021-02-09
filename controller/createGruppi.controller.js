sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (t, MessageBox) {
	"use strict";
	//var id;
	var oMainModel = new sap.ui.model.json.JSONModel();

		var idGruppi, year,selectedFYPeriodi;
	return t.extend("stipAdmin.stipAdmin.controller.createGruppi", {
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("createGruppi").attachPatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function (oEvent) {
			var oArguments = oEvent.getParameter("arguments");
			year = oArguments.ID_PERIODO;
			idGruppi = oArguments.ID_GRUPPI;
			selectedFYPeriodi=oArguments.SEL_FY_PERIODI;
			this.byId("desc").setValue("");
		//	selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/0/FISCAL_YEAR");
		//	var id = sap.ui.getCore().getModel("BasicAppModel").getProperty("/nextidGruppi");
		//	var year = sap.ui.getCore().getModel("BasicAppModel").getProperty("/DESCR_PERIODO");
			this.byId("fy").setText(selectedFYPeriodi);
			var GruppiPisteData = {
					ID_GRUPPOPISTA:idGruppi,
				//	ID_GRUPPOPISTA: id,
					ID_PERIODO: parseInt(year,10),
					DESCR_GRUPPOPISTA: ""
				};

				oMainModel.setData(
					GruppiPisteData
				);
			this.getView().setModel(oMainModel, "GruppiPisteTableModel");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/backk","back");
		},
		/*id: function () {
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			xsoDataModel.read("/T_GRUPPIPISTE/$count", {

				success: function (oDataIn, oResponse) {
					debugger;
					id = parseInt(oResponse.data, 10) + 1;
				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed while getting T_GRUPPIPISTE. Please contact administrator.");
					jQuery.sap.log.getLogger().error("T_GRUPPIPISTE fetch failed" + oError.toString());
				}.bind(this)
			});

			xsoDataModel.attachRequestCompleted(function () {
				var GruppiPisteData = {
					ID_GRUPPOPISTA: id,
					ID_PERIODO: parseInt(selectedFYPeriodi,10),
					DESCR_GRUPPOPISTA: ""
				};

				oMainModel.setData(
					GruppiPisteData
				);
				//	this.getView().setModel(oMainModel, "GruppiPisteTableModel");
			});
		},*/
		Salva: function () {
			debugger;
			var that = this;
			if(oMainModel.getData().DESCR_GRUPPOPISTA === null ||  oMainModel.getData().DESCR_GRUPPOPISTA === "")
			MessageBox.error("Non è possibile salvare l'azione. il campo 'Descrizione' è obbligatorio. ");
			else{
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			xsoDataModel.create("/T_GRUPPIPISTE", oMainModel.getData(), {

				success: function (oDataIn, oResponse) {
					debugger;
					if (oResponse.statusCode === "200" || oResponse.statusCode === "201") {
						sap.ui.getCore().getModel("BasicAppModel").getProperty("/backk","create");
						//MessageBox.success("Gruppi Piste Successfully Created");
						//this.byId("Salva").setVisible(false);}
						MessageBox.success(
							"Gruppo KPI creato con successo", {
								onClose: function (oEvent) {
									debugger;
									console.log("Onclose");
									sap.ui.core.UIComponent.getRouterFor(that).navTo("Gruppi", {
										gruppi: "Gruppi",
										str: year
									});
								}
							});
					} else
						MessageBox.error("Couldn't create T_GRUPPIPISTE. Please contact administrator.");
				}.bind(this),
				error: function (oError) {
					//Handle the error
					debugger;
					MessageBox.error("Couldn't create T_GRUPPIPISTE. Please contact administrator.");
					jQuery.sap.log.getLogger().error("T_GRUPPIPISTE fetch failed" + oError.toString());
				}.bind(this)
			});
		}

		},
		cancel: function () {
			
		//	var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/0/FISCAL_YEAR");
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Gruppi", {
				gruppi: "Gruppi",
				str: year
			});
		}

	})
});