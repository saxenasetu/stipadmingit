
sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/Device", "stipAdmin/stipAdmin/model/models"], function (i, e, t) {
	"use strict";
	return i.extend("stipAdmin.stipAdmin.Component", {
		metadata: {
			manifest: "json"
		},
		init: function () {
			i.prototype.init.apply(this, arguments);
			// this.getRouter().initialize();
			this.setModel(t.createDeviceModel(), "device");
			// Below code commented by Kapil on 15th Dec 2020
			// Below code added by Kapil on 2nd Dec 2020 - Merging Gestione Consuntivazione
			//var flatData = this.readFile();
			//var deepData = this.transformTreeData(flatData);
			//this.setModelData(deepData);
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/", {
				json: true,
				defaultBindingMode: "TwoWay"
			});
			this.setModel(xsoDataModel, "basexsoModel");
			this.setModel(new sap.ui.model.json.JSONModel(), "viewProperties");
			// adding code for auth
			var oEntry = {};
			$.ajax({
				url: "/services/userapi/currentUser",
				async: false,
				success: function (data, response) {
					oEntry.name = data.name.toUpperCase();
					oEntry.firstName = data.firstName;
					oEntry.lastName = data.lastName;
				},
				error: function (xhr, textStatus, error) {
					jQuery.sap.log.getLogger().error("Get Employee Authorization fetch failed" + error.toString());
				}
			});
			var oEmpModel = new sap.ui.model.json.JSONModel();
			oEmpModel.setData(oEntry);
			this.setModel(oEmpModel, "empModel");
			var oMainModel = new sap.ui.model.json.JSONModel();
			sap.ui.getCore().setModel(oMainModel, "BasicAppModel");
			/////////////////////////
			this.checkAuthorization();
		},
		checkAuthorization: function () {
			var that = this;
			var empID = this.getModel("empModel").getData().name; // Get logged in Emp EmpId
			empID = empID.toUpperCase();
			var stipEmpAuthoModel = new sap.ui.model.json.JSONModel();
			var ostipEmpAuthoJson = [];
			var ostipEmpAuthoJsonData = {};
			// Actual working url below
			var urlgetAutho = "/HANAMDC/STIP/STIPAdmin/services/getAuthorization.xsjs/?aEmpid=" + empID + "";
			$.ajax({
				url: urlgetAutho,
				success: function (data, response) {
					ostipEmpAuthoJsonData = {
						"AUTHHORIZEDDATA": data[0],
						"ROLE_EMP": data[0].ROLE_EMP,
						"ROLE_DEPUTY": data[0].ROLE_DEPUTY,
						"ROLE_MANAGER": data[0].ROLE_MANAGER,
						"ROLE_HRBP": data[0].ROLE_HRBP,
						"ROLE_HR": data[0].ROLE_HR,
						"ROLE_PCO": data[0].ROLE_PCO,
						"ROLE_HR_ADMIN": data[0].ROLE_HR_ADMIN,
						"AUTHHORIZEDFLAG": "1",
						user: empID
					};
					ostipEmpAuthoJson.push(ostipEmpAuthoJsonData);
					stipEmpAuthoModel.setData(ostipEmpAuthoJson);
					that.setModel(stipEmpAuthoModel, "EmpAuthoModel");
					sap.ui.getCore().setModel(stipEmpAuthoModel, "EmpAuthoModel");
					//that.getModel("viewProperties").setProperty("/Authorized", true);
					// enable routing
					that.getRouter().initialize();
				},
				error: function (xhr, textStatus, error) {
					that.getModel("viewProperties").setProperty("/Authorized", false);
					jQuery.sap.log.getLogger().error("Employee Authorization failed " + error.toString());
				}
			});
		},
		// readFile: function () {
		// var flatData = null;
		// var jsonData = {
		// "nodes": [{
		// "ID": "O100",
		// "Text": "CORPORATE FOLDER",
		// "ParentID": "",
		// "Type": "O"
		// }, {
		// "ID": "O110",
		// "Text": "CUSTOM",
		// "ParentID": "O100",
		// "Type": "O"
		// }, {
		// "ID": "S111",
		// "Text": "CITTA",
		// "ParentID": "O110",
		// "Type": "S"
		// }, {
		// "ID": "S112",
		// "Text": "LOCATION",
		// "ParentID": "O110",
		// "Type": "S"
		// }, {
		// "ID": "S113",
		// "Text": "PROVINCIA",
		// "ParentID": "O110",
		// "Type": "S"
		// }, {
		// "ID": "S114",
		// "Text": "ZONA",
		// "ParentID": "O110",
		// "Type": "S"
		// }, {
		// "ID": "S115",
		// "Text": "CASA",
		// "ParentID": "O110",
		// "Type": "S"
		// }, {
		// "ID": "O120",
		// "Text": "GEOGRAFICHE",
		// "ParentID": "O100",
		// "Type": "O"
		// }, {
		// "ID": "S121",
		// "Text": "GEOGRAFICHE1",
		// "ParentID": "O120",
		// "Type": "S"
		// }, {
		// "ID": "S122",
		// "Text": "GEOGRAFICHE2",
		// "ParentID": "O120",
		// "Type": "S"
		// }, {
		// "ID": "S123",
		// "Text": "GEOGRAFICHE3",
		// "ParentID": "O120",
		// "Type": "S"
		// }, {
		// "ID": "S124",
		// "Text": "GEOGRAFICHE4",
		// "ParentID": "O120",
		// "Type": "S"
		// }, {
		// "ID": "S125",
		// "Text": "GEOGRAFICHE5",
		// "ParentID": "O120",
		// "Type": "S"
		// }, {
		// "ID": "S126",
		// "Text": "GEOGRAFICHE6",
		// "ParentID": "O120",
		// "Type": "S"
		// }, {
		// "ID": "S127",
		// "Text": "GEOGRAFICHE7",
		// "ParentID": "O120",
		// "Type": "S"
		// }, {
		// "ID": "O130",
		// "Text": "ORGANIZZATIVE",
		// "ParentID": "O100",
		// "Type": "O"
		// }, {
		// "ID": "S131",
		// "Text": "ORGANIZZATIVE1",
		// "ParentID": "O130",
		// "Type": "S"
		// }, {
		// "ID": "S132",
		// "Text": "ORGANIZZATIVE2",
		// "ParentID": "O130",
		// "Type": "S"
		// }, {
		// "ID": "S133",
		// "Text": "ORGANIZZATIVE3",
		// "ParentID": "O130",
		// "Type": "S"
		// }, {
		// "ID": "S134",
		// "Text": "ORGANIZZATIVE4",
		// "ParentID": "O130",
		// "Type": "S"
		// }, {
		// "ID": "S135",
		// "Text": "ORGANIZZATIVE5",
		// "ParentID": "O130",
		// "Type": "S"
		// }]
		// };
		// //load the data from the JSON file
		// //NB same format as gateway service could be
		// var inModel = new sap.ui.model.json.JSONModel(jsonData);
		// //////inModel.loadData("/webapp/model/FlatData.json", "", false);
		// var data = inModel.getData();
		// if (data) {
		// flatData = data.nodes;
		// }
		// return flatData;
		// },
		// transformTreeData: function (nodesIn) {
		// var nodes = []; //'deep' object structure
		// var nodeMap = {}; //'map', each node is an attribute
		// if (nodesIn) {
		// var nodeOut;
		// var parentId;
		// for (var i = 0; i < nodesIn.length; i++) {
		// var nodeIn = nodesIn[i];
		// nodeOut = {
		// id: nodeIn.ID,
		// text: nodeIn.Text,
		// type: nodeIn.Type,
		// children: []
		// };
		// parentId = nodeIn.ParentID;
		// if (parentId && parentId.length > 0) {
		// //we have a parent, add the node there
		// //NB because object references are used, changing the node
		// //in the nodeMap changes it in the nodes array too
		// //(we rely on parents always appearing before their children)
		// var parent = nodeMap[nodeIn.ParentID];
		// if (parent) {
		// parent.children.push(nodeOut);
		// }
		// } else {
		// //there is no parent, must be top level
		// nodes.push(nodeOut);
		// }
		// //add the node to the node map, which is a simple 1-level list of all nodes
		// nodeMap[nodeOut.id] = nodeOut;
		// }
		// }
		// return nodes;
		// },
		// setModelData: function (nodes) {
		// //store the nodes in the JSON model, so the view can access them
		// var nodesModel = new sap.ui.model.json.JSONModel();
		// nodesModel.setData({
		// nodeRoot: {
		// children: nodes
		// }
		// });
		// this.setModel(nodesModel, "nodeModel");
		// }
	});
});
