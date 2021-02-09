sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "sap/ui/Device", ], function (e, JSONModel, Device) {
	"use strict";
	var i;
	return e.extend("stipAdmin.stipAdmin.controller.ReportDetail", {
		onInit: function () {
			this.data = {
				Organization: [{
					"text": "Amministratore Delegato",
					"ref": "sap-icon://folder-full",
					"nodes": [{
						"text": "10011001 – Vodafone Italy Chief Executive",
						"ref": "sap-icon://folder-full",
						"nodes": [{
							"text": "10002959-Africa, Middle East & Asia Pac",
							"ref": "sap-icon://folder-full"
						}, {
							"text": "10011002-Human Resources & Organization",
							"ref": "sap-icon://folder-full"

						}, {
							"text": "10011063-Finance",
							"ref": "sap-icon://folder-full"

						}]
					}, {
						"text": "10011002 – Human Resources & organization",
						"ref": "sap-icon://folder-full"
					}, {
						"text": "10011003 – Industrial Relations & Payroll",
						"ref": "sap-icon://folder-full"
					}]
				}]
			};
			this._mViewSettingsDialogs = {};
			this.busyDialog = new sap.m.BusyDialog();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("ReportDetail").attachPatternMatched(this._onObjectMatched, this);
		},
		onTornaallalista: function (oEvent) {
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Reports");
			this.busyDialog.close();
		},
		onHomePage: function (oEvent) {
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
			this.busyDialog.close();
		},
		onPressView: function (oEvent) {
			var that = this;
			/*	this._oValueHelpDialog = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.OrgDialog", this);
				this.getView().addDependent(this._oValueHelpDialog);
				this.jModel = new JSONModel();
				this.jModel.setData(this.data);
				this.getView().setModel(this.jModel);
				this._oValueHelpDialog.open();*/
			var oTable = new sap.m.Table("tbl", {
				navigationMode: "Scrollbar",
				selectionMode: "MultiToggle",

				columns: [
					new sap.m.Column({
						hAlign: sap.ui.core.TextAlign.Center,
						width: "8rem",
						design: "Bold",
						header: [
							new sap.m.Text({
								text: "Identificativo",
							})
						],
					}),
					new sap.m.Column({
						hAlign: sap.ui.core.TextAlign.Center,
						width: "8rem",
						design: "Bold",
						header: [
							new sap.m.Text({
								text: "Descrizione",
							})
						],
					}),
					new sap.m.Column({
						hAlign: sap.ui.core.TextAlign.Center,
						width: "6rem",
						design: "Bold",
						header: [
							new sap.m.Text({
								text: "Gruppo",
							})
						],
					}),
					new sap.m.Column({
						hAlign: sap.ui.core.TextAlign.Center,
						width: "8rem",
						design: "Bold",
						header: [
							new sap.m.Text({
								text: "Personalizzabile",
							})
						],
					}),
					new sap.m.Column({
						hAlign: sap.ui.core.TextAlign.Center,
						width: "8rem",
						design: "Bold",
						header: [
							new sap.m.Text({
								text: "Obiettivo",
							})
						],
					}),
					new sap.m.Column({
						hAlign: sap.ui.core.TextAlign.Center,
						width: "8rem",
						design: "Bold",
						header: [
							new sap.m.Text({
								text: "Consuntivo",
							})
						],
					})
				]
			});

			// creating some data for binding 
			var data = {
				results: [{
					Identificativo: "Vaibhav",
					Descrizione: "GB",
					Gruppo: "aa",
					Personalizzabile: "0900",
					Obiettivo: "oooo",
					Consuntivo: "Consuntivo1"
				}, {
					Identificativo: "Anoop",
					Descrizione: "S",
					Gruppo: "iii",
					Personalizzabile: "lllll",
					Obiettivo: "oooo1",
					Consuntivo: "Consuntivo2"
				}, {
					Identificativo: "Anoop",
					Descrizione: "patkar1",
					Gruppo: "oklll",
					Personalizzabile: "ftftftf",
					Obiettivo: "ooooo2",
					Consuntivo: "Consuntivo3"
				}]
			};

			var model = new sap.ui.model.json.JSONModel(data);
			oTable.setModel(model);
			oTable.addStyleClass("stipAdmin");
			oTable.bindAggregation("items", {
				path: "/results",
				template: new sap.m.ColumnListItem({
					cells: [
						new sap.m.Text({
							text: "{Identificativo}"
						}),
						new sap.m.Text({
							text: "{Descrizione}"
						}),
						new sap.m.Text({
							text: "{Gruppo}"
						}),
						new sap.m.Text({
							text: "{Personalizzabile}"
						}),
						new sap.m.Text({
							text: "{Obiettivo}"
						}),
						new sap.m.Text({
							text: "{Consuntivo}"
						})
					]
				})
			})
			var oDialog = new sap.m.Dialog({

				content: [oTable],
				contentWidth: "700px",
				contentHeight: "300px",
				/*beginButton: new sap.m.Button({
					text: "",
					press: function () {

					}
				}),*/
				endButton: new sap.m.Button({
					text: "CANCEL",
					press: function () {
						that.oRouter.navTo("ReportDetail", {
							str: i
						});
						/*	var n = sap.ui.core.UIComponent.getRouterFor(that);
							n.navTo("Reports");*/
						oDialog.close();
						oDialog.destroy();
					}
				}),
				afterClose: function () {
					oDialog.destroy();
				}
			});

			oDialog.setTitle("KPI non associati a Schede Master");
			oDialog.setTitleAlignment("Center");
			//oContoller.getView().addDependent(oDialog1); 

			if (oDialog !== null) {
				oDialog.open();
			}
		},

		onTreeSelect: function (oEvent) {

			this.getView().byId("empDipartimento").setValue(oEvent.getSource().getTitle());
			this._oValueHelpDialog.destroy();
		},
		onCloseDialog: function (oEvent) {
			this._oValueHelpDialog.destroy();
		},
		handleClose: function (oEvent) {
			this._oValueHelpDialog.destroy();
		},
		handleBack: function (oEvent) {
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Reports");
			this.busyDialog.close();
		},
		_onObjectMatched: function (e) {
			 i = e.getParameter("arguments").str;
			if (i == "1") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
				this.getView().byId("vbx12").setVisible(true);
				this.getView().byId("vbx13").setVisible(false);
				this.getView().byId("vbx14").setVisible(false);
				this.getView().byId("vbx15").setVisible(false);
				this.getView().byId("vbx16").setVisible(false);
				this.getView().byId("vbx17").setVisible(false);
				this.getView().byId("vbx18").setVisible(false);

			} else if (i == "2") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
				this.getView().byId("vbx12").setVisible(false);
				this.getView().byId("vbx13").setVisible(true);
				this.getView().byId("vbx14").setVisible(false);
				this.getView().byId("vbx15").setVisible(false);
				this.getView().byId("vbx16").setVisible(false);
				this.getView().byId("vbx17").setVisible(false);
				this.getView().byId("vbx18").setVisible(false);
			} else if (i == "3") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
				this.getView().byId("vbx12").setVisible(false);
				this.getView().byId("vbx13").setVisible(false);
				this.getView().byId("vbx14").setVisible(true);
				this.getView().byId("vbx15").setVisible(false);
				this.getView().byId("vbx16").setVisible(false);
				this.getView().byId("vbx17").setVisible(false);
				this.getView().byId("vbx18").setVisible(false);
			} else if (i == "4") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
				this.getView().byId("vbx12").setVisible(false);
				this.getView().byId("vbx13").setVisible(false);
				this.getView().byId("vbx14").setVisible(false);
				this.getView().byId("vbx15").setVisible(true);
				this.getView().byId("vbx16").setVisible(false);
				this.getView().byId("vbx17").setVisible(false);
				this.getView().byId("vbx18").setVisible(false);
			} else if (i == "5") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
				this.getView().byId("vbx12").setVisible(false);
				this.getView().byId("vbx13").setVisible(false);
				this.getView().byId("vbx14").setVisible(false);
				this.getView().byId("vbx15").setVisible(false);
				this.getView().byId("vbx16").setVisible(true);
				this.getView().byId("vbx17").setVisible(false);
				this.getView().byId("vbx18").setVisible(false);
			} else if (i == "6") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(true);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
				this.getView().byId("vbx12").setVisible(false);
				this.getView().byId("vbx13").setVisible(false);
				this.getView().byId("vbx14").setVisible(false);
				this.getView().byId("vbx15").setVisible(false);
				this.getView().byId("vbx16").setVisible(false);
				this.getView().byId("vbx17").setVisible(false);
				this.getView().byId("vbx18").setVisible(false);
			} else if (i == "7") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
				this.getView().byId("vbx12").setVisible(false);
				this.getView().byId("vbx13").setVisible(false);
				this.getView().byId("vbx14").setVisible(false);
				this.getView().byId("vbx15").setVisible(false);
				this.getView().byId("vbx16").setVisible(false);
				this.getView().byId("vbx17").setVisible(false);
			} else if (i == "8") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
				this.getView().byId("vbx12").setVisible(false);
				this.getView().byId("vbx13").setVisible(false);
				this.getView().byId("vbx14").setVisible(false);
				this.getView().byId("vbx15").setVisible(false);
				this.getView().byId("vbx16").setVisible(false);
				this.getView().byId("vbx17").setVisible(false);
				this.getView().byId("vbx18").setVisible(true);
			} else if (i == "9") {
				this.getView().byId("vbx1").setVisible(false);
				//	this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
				this.getView().byId("vbx12").setVisible(false);
				this.getView().byId("vbx13").setVisible(false);
				this.getView().byId("vbx14").setVisible(false);
				this.getView().byId("vbx15").setVisible(false);
				this.getView().byId("vbx16").setVisible(false);
				this.getView().byId("vbx17").setVisible(false);
				this.getView().byId("vbx18").setVisible(false);
			} else if (i == "10") {
				this.getView().byId("vbx1").setVisible(true);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
				this.getView().byId("vbx12").setVisible(false);
				this.getView().byId("vbx13").setVisible(false);
				this.getView().byId("vbx14").setVisible(false);
				this.getView().byId("vbx15").setVisible(false);
				this.getView().byId("vbx16").setVisible(false);
				this.getView().byId("vbx17").setVisible(false);
				this.getView().byId("vbx18").setVisible(false);
			} else if (i == "11") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(true);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
				this.getView().byId("vbx12").setVisible(false);
				this.getView().byId("vbx13").setVisible(false);
				this.getView().byId("vbx14").setVisible(false);
				this.getView().byId("vbx15").setVisible(false);
				this.getView().byId("vbx16").setVisible(false);
				this.getView().byId("vbx17").setVisible(false);
			} else if (i == "12") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(true);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
				this.getView().byId("vbx12").setVisible(false);
				this.getView().byId("vbx13").setVisible(false);
				this.getView().byId("vbx14").setVisible(false);
				this.getView().byId("vbx15").setVisible(false);
				this.getView().byId("vbx16").setVisible(false);
				this.getView().byId("vbx17").setVisible(false);
				this.getView().byId("vbx18").setVisible(false);
			} else if (i == "13") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(true);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
				this.getView().byId("vbx12").setVisible(false);
				this.getView().byId("vbx13").setVisible(false);
				this.getView().byId("vbx14").setVisible(false);
				this.getView().byId("vbx15").setVisible(false);
				this.getView().byId("vbx16").setVisible(false);
				this.getView().byId("vbx17").setVisible(false);
				this.getView().byId("vbx18").setVisible(false);
			} else if (i == "14") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(true);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
				this.getView().byId("vbx12").setVisible(false);
				this.getView().byId("vbx13").setVisible(false);
				this.getView().byId("vbx14").setVisible(false);
				this.getView().byId("vbx15").setVisible(false);
				this.getView().byId("vbx16").setVisible(false);
				this.getView().byId("vbx17").setVisible(false);
				this.getView().byId("vbx18").setVisible(false);
			} else if (i == "15") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(true);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
				this.getView().byId("vbx12").setVisible(false);
				this.getView().byId("vbx13").setVisible(false);
				this.getView().byId("vbx14").setVisible(false);
				this.getView().byId("vbx15").setVisible(false);
				this.getView().byId("vbx16").setVisible(false);
				this.getView().byId("vbx17").setVisible(false);
				this.getView().byId("vbx18").setVisible(false);
			} else if (i == "16") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(true);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
				this.getView().byId("vbx12").setVisible(false);
				this.getView().byId("vbx13").setVisible(false);
				this.getView().byId("vbx14").setVisible(false);
				this.getView().byId("vbx15").setVisible(false);
				this.getView().byId("vbx16").setVisible(false);
				this.getView().byId("vbx17").setVisible(false);
				this.getView().byId("vbx18").setVisible(false);
			} else if (i == "17") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(true);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
				this.getView().byId("vbx12").setVisible(false);
				this.getView().byId("vbx13").setVisible(false);
				this.getView().byId("vbx14").setVisible(false);
				this.getView().byId("vbx15").setVisible(false);
				this.getView().byId("vbx16").setVisible(false);
				this.getView().byId("vbx17").setVisible(false);
				this.getView().byId("vbx18").setVisible(false);
			} else if (i == "18") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(true);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(false);
				this.getView().byId("vbx12").setVisible(false);
				this.getView().byId("vbx13").setVisible(false);
				this.getView().byId("vbx14").setVisible(false);
				this.getView().byId("vbx15").setVisible(false);
				this.getView().byId("vbx16").setVisible(false);
				this.getView().byId("vbx17").setVisible(false);
				this.getView().byId("vbx18").setVisible(false);
			} else if (i == "19") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(true);
				this.getView().byId("vbx11").setVisible(false);
				this.getView().byId("vbx12").setVisible(false);
				this.getView().byId("vbx13").setVisible(false);
				this.getView().byId("vbx14").setVisible(false);
				this.getView().byId("vbx15").setVisible(false);
				this.getView().byId("vbx16").setVisible(false);
				this.getView().byId("vbx17").setVisible(false);
				this.getView().byId("vbx18").setVisible(false);
			} else if (i == "20") {
				this.getView().byId("vbx1").setVisible(false);
				this.getView().byId("vbx2").setVisible(false);
				this.getView().byId("vbx3").setVisible(false);
				this.getView().byId("vbx4").setVisible(false);
				this.getView().byId("vbx5").setVisible(false);
				this.getView().byId("vbx6").setVisible(false);
				this.getView().byId("vbx7").setVisible(false);
				this.getView().byId("vbx8").setVisible(false);
				this.getView().byId("vbx9").setVisible(false);
				this.getView().byId("vbx10").setVisible(false);
				this.getView().byId("vbx11").setVisible(true);
				this.getView().byId("vbx12").setVisible(false);
				this.getView().byId("vbx13").setVisible(false);
				this.getView().byId("vbx14").setVisible(false);
				this.getView().byId("vbx15").setVisible(false);
				this.getView().byId("vbx16").setVisible(false);
				this.getView().byId("vbx17").setVisible(false);
				this.getView().byId("vbx18").setVisible(false);
			}
		},
		onClear: function (oEvent) {
			// Input clear 
			this.getView().byId("inp1").setValue("");
			this.getView().byId("inp2").setValue("");
			this.getView().byId("inp3").setValue("");
			this.getView().byId("inp4").setValue("");
			this.getView().byId("inp5").setValue("");
			this.getView().byId("inp6").setValue("");
			this.getView().byId("inp7").setValue("");
			this.getView().byId("inp8").setValue("");
			this.getView().byId("inp9").setValue("");
			this.getView().byId("inp10").setValue("");
			this.getView().byId("inp11").setValue("");
			this.getView().byId("inp12").setValue("");
			this.getView().byId("inp13").setValue("");
			this.getView().byId("inp14").setValue("");
			this.getView().byId("inp15").setValue("");
			this.getView().byId("inp16").setValue("");
			this.getView().byId("inp17").setValue("");
			this.getView().byId("inp18").setValue("");

			// clearing checkbox 

			//this.getView().byId("chk1").setSelected(false);
			this.getView().byId("chk2").setSelected(false);
			this.getView().byId("chk3").setSelected(false);
			this.getView().byId("chk4").setSelected(false);
			this.getView().byId("chk5").setSelected(false);
			this.getView().byId("chk6").setSelected(false);
			this.getView().byId("chk7").setSelected(false);
			this.getView().byId("chk8").setSelected(false);

			// clearing date picker

			this.getView().byId("dp1").setValue("");
			this.getView().byId("dp2").setValue("");
			this.getView().byId("dp3").setValue("");
			this.getView().byId("dp4").setValue("");

			// clearing select

			this.getView().byId("sel1").setSelectedKey(null);
			this.getView().byId("sel11").setSelectedKey(null);
			this.getView().byId("sel21").setSelectedKey(null);
			this.getView().byId("sel31").setSelectedKey(null);
			this.getView().byId("sel2").setSelectedKey(null);
			this.getView().byId("sel12").setSelectedKey(null);
			this.getView().byId("sel22").setSelectedKey(null);
			this.getView().byId("sel32").setSelectedKey(null);
			this.getView().byId("sel3").setSelectedKey(null);
			this.getView().byId("sel13").setSelectedKey(null);
			this.getView().byId("sel23").setSelectedKey(null);
			this.getView().byId("sel33").setSelectedKey(null);
			this.getView().byId("sel4").setSelectedKey(null);
			this.getView().byId("sel14").setSelectedKey(null);
			this.getView().byId("sel24").setSelectedKey(null);
			this.getView().byId("sel34").setSelectedKey(null);
			this.getView().byId("sel5").setSelectedKey(null);
			this.getView().byId("sel15").setSelectedKey(null);
			this.getView().byId("sel25").setSelectedKey(null);
			this.getView().byId("sel35").setSelectedKey(null);
			this.getView().byId("sel6").setSelectedKey(null);
			this.getView().byId("sel16").setSelectedKey(null);
			this.getView().byId("sel26").setSelectedKey(null);
			this.getView().byId("sel36").setSelectedKey(null);
			this.getView().byId("sel7").setSelectedKey(null);
			this.getView().byId("sel17").setSelectedKey(null);
			this.getView().byId("sel27").setSelectedKey(null);
			this.getView().byId("sel8").setSelectedKey(null);
			this.getView().byId("sel18").setSelectedKey(null);
			this.getView().byId("sel28").setSelectedKey(null);
			this.getView().byId("sel9").setSelectedKey(null);
			this.getView().byId("sel19").setSelectedKey(null);
			this.getView().byId("sel29").setSelectedKey(null);
			this.getView().byId("sel10").setSelectedKey(null);
			this.getView().byId("sel20").setSelectedKey(null);
			this.getView().byId("sel30").setSelectedKey(null);

		}
	});
});