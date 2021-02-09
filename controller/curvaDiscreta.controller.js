sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox", "../service/RepoService"
], function (n, MessageBox, RepoService) {
	"use strict";
	var minPercMbo;
	var maxPercMbo;
	var curveIdModel = new sap.ui.model.json.JSONModel();
	return n.extend("stipAdmin.stipAdmin.controller.curvaDiscreta", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("curvaDiscreta").attachPatternMatched(this._onObjectMatched, this);

		},
		/******************** _onObjectMatched function fetches the argument values ********************************************/
		_onObjectMatched: function (t) {
			debugger
			var year = sap.ui.getCore().getModel("BasicAppModel").getProperty("/year");
			this.byId("fy").setText(year);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/change", "change");	//Will restore the changes on going back
			var curveDiscretaData = {
				curveData: [{
					/*Performance: "%",
					Payout: "%"*/
					Performance: "",
					Payout: ""
				}]
			};
			this.byId("desc").setEditable(true);
			this.byId("Salva").setVisible(true);
			this.byId("idDeleteCol").setVisible(true);
			this.byId("idAddRow").setVisible(true);
			this.getView().byId("desc").setValue("");
			var oMainModel = new sap.ui.model.json.JSONModel();
			oMainModel.setData(
				curveDiscretaData
			);
			this.getView().setModel(oMainModel, "curveResultTableModel");
			this.getView().byId("idcolumn").setVisible(false);
			//           this.createLinearCurve();
		},
		/********************validation function performs validation check that description should not be empty and 
		there must be entry in the payout field********************************************/
		validation: function () {
			debugger;
			var f;
			console.log(this.getView().getModel("curveResultTableModel").getData().curveData);
			var desc = this.getView().byId("desc").getValue();
			if (desc === "" || desc === undefined) {
				MessageBox.error("la descrizione è obbligatoria"); //Error message displayed 'the description is mandatory'
				//	break;
			} else {
				var curveData = this.getView().getModel("curveResultTableModel").getData().curveData;
				var curveLength = this.getView().getModel("curveResultTableModel").getData().curveData.length;
				//	var pattern = RegExp('[0-9]+%{1}');
				var pattern = RegExp('[0-9]');

				for (var i = 0; i < curveLength; ++i) {
					if (pattern.test(curveData[i].Payout) === false) {
						f = 0;
						break;
					}
					//	curveData[i].Payout = curveData[i].Payout.split("%")[0];
					curveData[i].Payout = parseFloat(curveData[i].Payout);
					//curveData[i].Performance = parseFloat(curveData[i].Performance);
					if (isNaN(curveData[i].Payout)) {
						MessageBox.error("E' necessario inserire i punti della curva"); //Error message '"It is necessary to insert the points of the curve'
						f = 0;
						break;
					} else
						f = 1;
				}
				if (f === 1)
					this.saveDiscretaCurve(curveData);
				else {
					if (f === 0)
						MessageBox.error("E' necessario inserire i punti della curva"); //Error message '"It is necessary to insert the points of the curve'
					var curveDiscretaData = {
						curveData: [{
							/*	Performance: "%",
								Payout: "%"*/
							Performance: "",
							Payout: ""
						}]
					};

					var oMainModel = new sap.ui.model.json.JSONModel();
					oMainModel.setData(
						curveDiscretaData
					);
					this.getView().setModel(oMainModel, "curveResultTableModel");
				}
			}
		},
		/********************saveLinearCurve function is used to save the curvaData(Payout and Performance) 
		and description based on the fiscal year and curva type and invoke the createDiscretaCurve function********************************************/
		saveDiscretaCurve: function (curveData) {
			debugger
			this.getView().byId("idcolumn").setVisible(true);

			var curveLength = curveData.length;
			var curveResultJson = [];
			var curveResultJsonData = [];
			var curveMBOJson = [];
			for (var i = 0; i < curveLength; ++i) {
				curveResultJsonData = {
					"PERC_MBO": curveData[i].Payout,
					//"VALORE_CURVE": curveData[i].Performance,
					"S_GRADINO": curveData[i].Performance,
				};
				curveResultJson.push(curveResultJsonData);
				curveMBOJson.push(parseInt(curveData[i].Payout));
			}
			console.log(curveMBOJson);
			minPercMbo = Math.min.apply(null, curveMBOJson);
			maxPercMbo = Math.max.apply(null, curveMBOJson);
			var desc = this.getView().byId("desc").getValue();
			var periodiId = sap.ui.getCore().getModel("BasicAppModel").getProperty("/fiscalYear");
			//           var selectedCurve=sap.ui.getCore().getModel("BasicAppModel").getProperty("/selectedCurve");
			var selectedCurve = sap.ui.getCore().getModel("BasicAppModel").getData().selectedCurve;
			console.log(curveResultJson + desc + periodiId + selectedCurve);
			this.createDiscretaCurve(curveResultJson, desc, periodiId, selectedCurve);

		},
		/******************** createDiscretaCurve function takes curveResultJson, desc, periodiId, selectedCurve
		as the input parameters and invoke the displayDiscretaCurve function********************************************/
		createDiscretaCurve: function (curveResultJson, desc, periodiId, selectedCurve) {
			debugger
			console.log(curveResultJson);
			var that = this;
			var ch1 = this.byId("ch1").getSelected();
			if (ch1 === true)
				ch1 = "S";
			else
				ch1 = "";

			var perc_mbo = [],
				valore_curva = [],
				s_gradino = [];

			for (var i = 0; i < curveResultJson.length; i++) {
				perc_mbo.push(parseFloat(curveResultJson[i].PERC_MBO));
				s_gradino.push(curveResultJson[i].S_GRADINO);
				valore_curva.push(parseFloat(0));
			}

			var sPayload = {
				"ID_PERIODO": periodiId,
				"DESCR_CURVA": desc,
				"ID_TIPO_CURVA": selectedCurve,
				"PERC_MBO": perc_mbo,
				"VALORE_CURVA": valore_curva,
				"S_GRADINO": s_gradino,
				"SN_GATE": ch1
			};
			sPayload = JSON.stringify(sPayload);
			console.log(sPayload);
			console.log(JSON.stringify(sPayload));
			$.ajax({
				url: "/HANAMDC/STIP/STIPAdmin/services/crea_curva.xsjs",
				//url: "/HANAMDC/STIP/STIPAdmin/services/test.xsjs",
				type: "POST",
				method: "GET",
				contentType: 'application/json',
				data: {
					odata: sPayload
				},
				dataType: 'text',

				success: function (data, textStatus1) {
					debugger;
					data = JSON.parse(data);
					console.log(data);
					var curveId = data[0].ID_CURVA;
					curveIdModel.setData(
						curveId
					);
					that.getView().setModel(curveIdModel, "curveIdModel");
					that.byId("Salva").setVisible(false);
					that.byId("desc").setEditable(false);
					that.byId("idDeleteCol").setVisible(false);
					that.byId("idAddRow").setVisible(false);

					that.displayDiscretaCurve(desc, curveId);

				},
				error: function (data, textStatus1) {
					debugger;
					console.log(data);
					MessageBox.error("Error while perfoming Salva operation. Please contact administrator.");
					jQuery.sap.log.getLogger().error("Salva operation failed" + textStatus1.toString());
				}
			});
		},
		/******************** displayDiscretaCurve function is used to plot and display the Discreta(column) curve********************************************/
		displayDiscretaCurve: function (desc, curveId) {
			//      1.Get the id of the VizFrame
			debugger
			var oVizFrame = this.getView().byId("idcolumn");
			oVizFrame.setVizProperties({
				dataLabel: {
					visible: true,
					formatString: '0"%"'
				},
				title: {
					//	text: desc + " - tipo curva Discreta",
					text: desc,
					visible: true
				}
			});

			/*	oVizFrame.setVizScales([{
					feed: "valueAxis",
					min: minPercMbo,
					max: maxPercMbo
				}]);*/

		},
		/********************addRow function is used to add a new row with fields Performance and Payout********************************************/
		addRow: function (t) {
			debugger;
			var e = this.getView().byId("tbl");
			var o = e.getModel("curveResultTableModel").getProperty("/curveData");
			//                         var o1 =this.getView().getModel("curveResultTableModel").getData();
			var i = {
				Performance: "",
				Payout: ""
					//	Payout: "%"
			};
			o.push(i);
			e.getModel("curveResultTableModel").setProperty("/curveData", o);
		},
		/******************** removeRow function is used to remove a row from the table********************************************/
		removeRow: function (oEvent) {
			//	debugger;
			var e = this.getView().byId("tbl");
			var o = e.getModel("curveResultTableModel").getProperty("/curveData");
			//	console.log(o);
			var context = oEvent.getSource().getBindingContext("curveResultTableModel");
			var path = context.getPath();
			var pos1 = ("/curveData/").length;
			var length = path.length;
			var index = Number(path.substring(pos1, length));
			//	console.log(index);
			o.splice(index, 1)
				//	console.log(o);
			e.getModel("curveResultTableModel").setProperty("/curveData", o);
		},
		/********************sendCurveDMSfile function is used to create the file type and sendFileDMS function is called********************************************/
		sendCurveDMSfile: function () {
			debugger
			var oVizFrame = this.getView().byId("idcolumn");
			//da salvare in DMS
			var sSVG = oVizFrame.exportToSVGString({
				width: 800,
				height: 600
			});
			var textHtml = sSVG;
			//CREATE FILE TYPE

			var today = new Date();
			var curveId = this.getView().getModel("curveIdModel").getData();
			var filenameTXT = "CURVA--DISCRETA--" + curveId + ".txt";

			var blob2 = new Blob([textHtml], {
				type: "text/plain;charset=utf-8"
			});
			var fText = new File([blob2], filenameTXT, {
				type: "text/plain",
				lastModifiedDate: today
			});
			//var fileArray = [fPdf, fText];
			var fileArray = [fText];
			this.onSendFileDMS(fileArray);
		},
		/******************** onSendFileDMS function is used to delete the existing file and upload the new one********************************************/
		onSendFileDMS: async function (fileArray) {
			//	debugger
			var count = 0;
			var that = this;
			for (var i = 0; i < fileArray.length; i++) {
				var Errmsg = "noErr";
				try {
					await RepoService.deleteFile(fileArray[i].name, "CURVE_DOC");
				} catch (e) {
					if (e.status === 404) {
						Errmsg = "404"
					}
				} finally {
					if (Errmsg === "noErr" || Errmsg === "404") {
						await RepoService.uploadFile(fileArray[i], "CURVE_DOC");
						count++

					}

				}
			}
		},
		/******************** cancel function navigates the user to the previous Curva page and will retain the previous changes********************************************/
		cancel: function () {

			var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/fiscalYear");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/change", "change");
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Curve", {
				curve: "Curve",
				str: selectedFYPeriodi
			});

		}
	});
});