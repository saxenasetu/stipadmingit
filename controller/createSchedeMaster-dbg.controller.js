sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"

], function (MessageToast, JSONModel, Controller) {
	"use strict";

	return Controller.extend("stipAdmin.stipAdmin.controller.createSchedeMaster", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf stipAdmin.stipAdmin.view.createSchedeMaster
		 */
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("createSchedeMaster").attachPatternMatched(this._onObjectMatched, this);

			var dataObject = [{
					"ID Pista": "121",
					"Nome Pista": "Pista 121"

				}, {
					"ID Pista": "122",
					"Nome Pista": "III 122"
				},

			];

			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData({
				modelData: {
					productsData: []
				}
			});
			sap.ui.getCore().setModel(oModel);
			sap.ui.getCore().getModel().setProperty("/modelData/productsData", dataObject);

		//	var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},

		handleSelectionChange: function (oEvent) {
			var changedItem = oEvent.getParameter("changedItem");
			var isSelected = oEvent.getParameter("selected");

			var state = "Selected";
			if (!isSelected) {
				state = "Deselected";
			}

			// MessageToast.show("Event 'selectionChange': " + state + " '" + changedItem.getText() + "'", {
			// 	width: "auto"
			// });
		},

		handleSelectionFinish: function (oEvent) {
				var selectedItems = oEvent.getParameter("selectedItems");
				var messageText = "Event 'selectionFinished': [";

				for (var i = 0; i < selectedItems.length; i++) {
					messageText += "'" + selectedItems[i].getText() + "'";
					if (i != selectedItems.length - 1) {
						messageText += ",";
					}
				}

				messageText += "]";

/*				MessageToast.show(messageText, {
					width: "auto"
				});*/
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf stipAdmin.stipAdmin.view.createSchedeMaster
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf stipAdmin.stipAdmin.view.createSchedeMaster
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf stipAdmin.stipAdmin.view.createSchedeMaster
		 */
		//	onExit: function() {
		//
		//	}

	});

});