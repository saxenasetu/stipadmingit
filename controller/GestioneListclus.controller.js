sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/Device",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Label",
	"sap/m/MessageToast",
	"sap/m/Input",
	"sap/ui/core/Core",
	"sap/ui/core/Icon"
], function (Controller, JSONModel, MessageBox, Device, Filter, FilterOperator, Dialog, DialogType, Button, ButtonType, Label,
	MessageToast, Input, Core, Icon) {
	"use strict";
	var oMainModel = new JSONModel();
	return Controller.extend("stipAdmin.stipAdmin.controller.GestioneListclus", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {

			this._mViewSettingsDialogs = {};
			this.busyDialog = new sap.m.BusyDialog();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("GestioneListclus").attachPatternMatched(this._onObjectMatched, this);
		},
		/******************** _onObjectMatched fetches argument values and depends on role and authorization checkbox visibility********************************************/
		_onObjectMatched: function (oEvent) {
			//this.listCount(this.getView().byId("lstNuovaLista").getItems().length);
			this.displayList();
			this.getView().byId("idtxtfiscalyear").setText(sap.ui.getCore().getModel("fiscalyear").getData());

		},
		/******************** displayList function fetches the data from V_LISTE_MAIN and displays the list********************************************/
		displayList: function () {
			var data1 = [];
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			xsoDataModel.read("/V_LISTE_MAIN?$format=json", {
				success: function (oDataIn, oResponse) {
					debugger;
					var data = oDataIn.results,
						del;
					for (var i = 0; i < data.length; i++) {

						if (parseInt(data[i].COUNT_MATRICOLA, 10) === 0)
							del = true;
						else
							del = false;
						data1.push({
							ID: data[i].ID_LISTA,
							DescrizioneLista: data[i].DESCR_LISTA,
							Count: data[i].COUNT_MATRICOLA,
							del: del
						});
					}

					oMainModel.setData(data1);
					console.log(oMainModel.getData());
					this.getView().setModel(oMainModel, "GestioneModel");
					oMainModel.refresh();

				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed while getting Fiscal Year. Please contact administrator.");
				}.bind(this)
			});
		},
		/******************** deleteList function seeks confirmation from the user whether to delete the list********************************************/
		/******************** If user input is NO then exit from the page********************************************/
		/******************** If user input is OK then the particular list is deleted from the backend data********************************************/
		deleteList: function (oEvent, id) {
			debugger;
			var that = this;
			MessageBox.confirm("Sei sicuro di voler eliminare?", { // Confirmation message displayed 'Are you sure you want to delete'
				styleClass: "sapUiSizeCompact",
				actions: ["Si", sap.m.MessageBox.Action.NO],
				emphasizedAction: sap.m.MessageBox.Action.OK,
				initialFocus: sap.m.MessageBox.Action.NO,
				onClose: function (oAction) {
					if (oAction === "NO") {
						that.exit(0);
					} else if (oAction === "Si") {
						debugger;
						var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
						var context = "/LISTE(" + id + ")";
						xsoDataModel.remove(context, function (oDataIn) {
								debugger;
								console.log(oDataIn);
								MessageBox.success("Liste eliminata con successo");
								that.displayList();
							}.bind(this),
							function (oError) {
								debugger;
								MessageBox.error("Error Occurred while deleting Liste. Please contact administrator.");

							}.bind(this)
						);

						xsoDataModel.attachRequestCompleted(function () {
							MessageBox.success("Liste eliminata con successo");
							//oMainModel.refresh();
							that.displayList();
						});
					}

				}
			});
		},
		/******************** listCount function fetches the number of lists present********************************************/
		listCount: function (count) {
			var sTitle = this.getView().getModel("i18n").getResourceBundle().getText("NumeroListe", [count]);
			this.getView().byId("txtNumberCount").setText(sTitle);
		},
		/************************onExit function is used to exit from the current dialog box ********************************/
		onExit: function () {
			var oDialogKey,
				oDialogValue;

			for (oDialogKey in this._mViewSettingsDialogs) {
				oDialogValue = this._mViewSettingsDialogs[oDialogKey];

				if (oDialogValue) {
					oDialogValue.destroy();
				}
			}
		},
		/************************createViewSettingsDialog function is used to create a popup dialog box for Sort function********************************/
		/*	createViewSettingsDialog: function (sDialogFragmentName) {
				var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];

				if (!oDialog) {
					oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
					this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;

					if (Device.system.desktop) {
						oDialog.addStyleClass("sapUiSizeCompact");
					}
				}
				return oDialog;
			},*/
		/************************handleSortButtonPressed function accesses the SortingGestioneListe fragment********************************/
		/*		handleSortButtonPressed: function () {
					this.createViewSettingsDialog("stipAdmin.stipAdmin.fragment.SortingGestioneListe").open();
				},*/
		/************************onSearch function fetches the data based on Description List********************************/
		onSearch: function (oEvent) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("DescrizioneLista", FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}

			// update list binding
			var oList = this.byId("lstNuovaLista");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilters, "Application");
			this.listCount(oList.getItems().length);
		},
		/******************** onHomePage function allows the user to navigate to the Home Page of STIPAdmin module ********************************************/
		/*		onHomePage: function (oEvent) {
					this.busyDialog.open();
					sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
					this.busyDialog.close();
				},*/
		/******************** handleBack function allows the user to navigate to the Home Page of STIPAdmin module ********************************************/
		handleBack: function (oEvent) {

			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
			this.busyDialog.close();
		},
		/******************** handleNuovaLista function allows the user to create a new list ********************************************/
		/******************** A dialog box 'InserimentoNuovaLista' opens with the label 'DescrizioneLista' 
		where the user has to enter the list description and then SAVE or CANCEL as per requirement********************************************/
		handleNuovaLista: function (oEvent) {
			/*var oList = this.byId("lstNuovaLista");
			var count = oList.getItems().length;*/
			var that = this;
			if (!this.oSubmitDialog) {
				this.oSubmitDialog = new Dialog({
					type: DialogType.Message,
					title: that.getView().getModel("i18n").getResourceBundle().getText("InserimentoNuovaLista"),
					draggable: true,
					content: [
						new Label({
							text: that.getView().getModel("i18n").getResourceBundle().getText("DescrizioneLista"),
							labelFor: "submissionNote"
						}),
						new Input("submissionNote", {
							width: "100%",
							placeholder: that.getView().getModel("i18n").getResourceBundle().getText("EnterDesc"),
							liveChange: function (oEvent) {
								var sText = oEvent.getParameter("value");
								that.oSubmitDialog.getBeginButton().setEnabled(sText.length > 0);
							}.bind(that)
						})
					],
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: that.getView().getModel("i18n").getResourceBundle().getText("SAVE"), //After entering data in the DescrizioneLista, displays a SAVE button
						enabled: false,
						press: function () {
							var sText = Core.byId("submissionNote").getValue();
							//that.onConfirmDialogPress(sText, count, oList);
							that.onConfirmDialogPress(sText);
							Core.byId("submissionNote").setValue("");
							that.oSubmitDialog.close();
						}.bind(that)
					}),
					endButton: new Button({
						type: ButtonType.Emphasized,
						text: that.getView().getModel("i18n").getResourceBundle().getText("CANCEL"), //After entering data in the DescrizioneLista, displays a CANCEL button
						press: function () {
							Core.byId("submissionNote").setValue("");
							that.oSubmitDialog.close();
						}.bind(that)
					})
				});
			}
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			xsoDataModel.read("/LISTE?$format=json", {
				success: function (oDataIn, oResponse) {
					debugger;
					var data = oDataIn.results;
					for (var i = 0; i < data.length; i++)
						this.max_ID = data[i].ID_LISTA

				}.bind(this),
				error: function (oError) {
					//Handle the error
					//MessageBox.error("Data fetch failed while getting Fiscal Year. Please contact administrator.");
				}.bind(this)
			});

			that.oSubmitDialog.open();
		},
		//onConfirmDialogPress: function (sText, count, oList) {
		/******************** onConfirmDialogPress function displays OK and CANCEL buttons for confirmation ********************************************/
		/******************** In case of OK button, new list is created and displayed but in case of error will not be created ********************************************/
		/******************** In case of CANCEL button, the dialog box will simply close ********************************************/
		onConfirmDialogPress: function (sText) {
			var that = this;
			if (!that.oConfirmDialog) {
				that.oConfirmDialog = new Dialog({
					type: DialogType.Message,
					draggable: true,
					title: "Confirmation",
					content: [
						/*	new Icon({
								src: "sap-icon://question-mark",
								class: "size4"
							}),*/
						new Label({
							class: "stipAdminSpace"

						}),
						new Label({
							//	text: that.getView().getModel("i18n").getResourceBundle().getText("message1")
							text: "Si vuole confermare la creazione della lista " + sText + "?"
						})
					],
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: that.getView().getModel("i18n").getResourceBundle().getText("ok"),
						enabled: true,
						press: function () {
							//////////////////////////////////////////////
							// In future here odata serice should get call to save the list to backend
							//count = count + 1;
							debugger;
							var oNewObject = [{
								ID_LISTA: this.max_ID + 1,
								DESCR_LISTA: sText
							}];
							var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");

							xsoDataModel.create("/LISTE", oNewObject[0], {
								success: function (oDataIn, oResponse) {
									debugger;
									MessageBox.success("La lista " + sText + " è stata creata con successo", {
										onClose: function (oEvent) {
											that.displayList();
										}
									});
									oMainModel.refresh();

								}.bind(this),
								error: function (oError) {
									debugger;
									console.log(oNewObject);
									MessageBox.error("Not Created");

								}.bind(this)
							});
							//oMainModel.refresh();
							//that.displayList();
							//oMainModel.refresh();
							/*var oModel = oList.getModel().getProperty("/NuovaLista");
							oModel.push(oNewObject);
							oList.getModel().setProperty("/NuovaLista", oModel);
							oList.getModel().updateBindings(true);*/
							//////////////////////////////////////////////
							//	MessageToast.show("Note is: " + sText);
							that.oConfirmDialog.close();
							//oMainModel.refresh();

						}.bind(that)
					}),
					endButton: new Button({
						type: ButtonType.Emphasized,
						text: that.getView().getModel("i18n").getResourceBundle().getText("CANCEL"),
						press: function () {
							that.oConfirmDialog.close();
						}.bind(that)
					})
				});
			}

			that.oConfirmDialog.open();

		},
		/******************** onSelectionChange function navigates to the GestioneListclusDetail page taking id, desc and count as the input********************************************/
		onSelectionChange: function (oEvent, id, desc, count) {
			debugger;
			/*var path = oEvent.mParameters.listItem.mBindingInfos.number.binding.oContext.sPath;
			this.busyDialog.open();
			var ObjectHeader = oMainModel.getProperty(path);*/
			//if (ObjectHeader) {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("GestioneListclusDetail", {
				ID: id
			});
			//}
			this.busyDialog.close();
		}
	});

});