sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		setReportDesc: function (str,str1) {
			var i = str.indexOf("n.b.");
			var oList = this.getView().byId('list');
		/*	var oCustomItem = new sap.m.CustomListItem();
		    var oText1 ="";
		    var oText2 ="";
			if (i > 0) {
				var res = str.substr(0, i);
				oText1 = new sap.m.Text({text : res}).addStyleClass("STIPtext1");
				oCustomItem.addContent(oText1);
				var res2 = str.substr(i);
				oText2 = new sap.m.Text({text : res2});
				oCustomItem.addContent(oText2);
			} else {
			    oText1 = new sap.m.Text({text : str});
				oCustomItem.addContent(oText1);
			}
			oCustomItem.addStyleClass("STIPTextWidth");
			oList.addItem(oCustomItem);*/
			
		
			
			var oCustomItem = new sap.m.ObjectListItem({
				type : "Active",
				press : [ this.onSelectionChange, this]
			});
		    var oText1 ="";
		    var oText2 ="";
			if (i > 0) {
				var res = str.substr(0, i);
			    oCustomItem.setTitle(res);
				var res2 = str.substr(i);
				oText2 = new sap.m.ObjectAttribute({text : res2});
				oText1 = new sap.m.ObjectAttribute({text : str1});
				oText1.setVisible(false);
				oCustomItem.addAttribute(oText2);
				oCustomItem.addAttribute(oText1);
			} else {
				 oText1 = new sap.m.ObjectAttribute({text : str1});
			     oCustomItem.setTitle(str);
			     oCustomItem.addAttribute(oText1);
			}
			
			oList.addItem(oCustomItem);
		}

	};
});