sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/Device"], function (e, t) {
	"use strict";
	return {
		createDeviceModel: function () {
			var i = new e(t);
			i.setDefaultBindingMode("OneWay");
			return i
		},
		setReportDesc: function (e, t) {
			var i = e.indexOf("n.b.");
			var s = this.getView().byId("list");
			var a = new sap.m.ObjectListItem({
				type: "Active",
				press: [this.onSelectionChange, this]
			});
			var r = "";
			var n = "";
			if (i > 0) {
				var u = e.substr(0, i);
				a.setTitle(u);
				var d = e.substr(i);
				n = new sap.m.ObjectAttribute({
					text: d
				});
				r = new sap.m.ObjectAttribute({
					text: t
				});
				r.setVisible(false);
				a.addAttribute(n);
				a.addAttribute(r)
			} else {
				r = new sap.m.ObjectAttribute({
					text: t
				});
				a.setTitle(e);
				a.addAttribute(r)
			}
			s.addItem(a)
		}
	}
});