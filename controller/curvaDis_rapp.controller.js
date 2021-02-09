sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox", "../service/RepoService"
], function (n, MessageBox, RepoService) {
	"use strict";
	var minPercMbo;
	var maxPercMbo;
	var curveIdModel = new sap.ui.model.json.JSONModel();
	return n.extend("stipAdmin.stipAdmin.controller.curvaDis_rapp", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("curvaDis_rapp").attachPatternMatched(this._onObjectMatched, this);

		},
		/******************** _onObjectMatched function fetches the argument values ********************************************/
		_onObjectMatched: function (t) {
			//debugger
			var year = sap.ui.getCore().getModel("BasicAppModel").getProperty("/year");
			this.byId("fy").setText(year);
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/change", "change");	//Will restore the changes on moving back
			var curveLinearData = {
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
				curveLinearData
			);
			this.getView().setModel(oMainModel, "curveResultTableModel");
			this.getView().byId("idcolumn").setVisible(false);

		},
		/********************validation function performs validation check that description should not be empty and 
		there must be entry in the performance and payout fields********************************************/
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
				for (var i = 0; i < curveLength; ++i) {
					//	curveData[i].Payout = curveData[i].Payout.split("%")[0];
					curveData[i].Payout = parseFloat(curveData[i].Payout);
					curveData[i].Performance = parseFloat(curveData[i].Performance);
					if (isNaN(curveData[i].Payout) || isNaN(curveData[i].Performance)) {
						//	MessageBox.error("l'input deve essere in numeri");
						f = 0;
						break;
					} else
						f = 1;
				}
				if (f === 1)
					this.saveLinearCurve(curveData);
				else {
					if (f === 0)
						MessageBox.error("E' necessario inserire i punti della curva"); //Error message '"It is necessary to insert the points of the curve'

					var curveLinearData = {
						curveData: [{
							/*	Performance: "%",
								Payout: "%"*/
							Performance: "",
							Payout: ""
						}]
					};

					var oMainModel = new sap.ui.model.json.JSONModel();
					oMainModel.setData(
						curveLinearData
					);
					this.getView().setModel(oMainModel, "curveResultTableModel");
				}
			}
		},
		/********************saveLinearCurve function is used to save the curvaData(Payout and Performance) 
		and description based on the fiscal year and curva type and invoke the createLinearCurve function********************************************/
		saveLinearCurve: function (curveData) {
			//	debugger

			var curveLength = curveData.length;
			var curveResultJson = [];
			var curveResultJsonData = [];
			var curveMBOJson = [];
			for (var i = 0; i < curveLength; ++i) {
				curveResultJsonData = {
					"PERC_MBO": curveData[i].Payout,
					"VALORE_CURVE": curveData[i].Performance,
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
			this.createLinearCurve(curveResultJson, desc, periodiId, selectedCurve);
		},
		/******************** createLinearCurve function takes curveResultJson, desc, periodiId, selectedCurve
		as the input parameters and invoke the displayLinearCurve function********************************************/
		createLinearCurve: function (curveResultJson, desc, periodiId, selectedCurve) {
			//	debugger
			var that = this;
			this.getView().byId("idcolumn").setVisible(true);
			console.log(curveResultJson);

			var perc_mbo = [],
				valore_curva = [],
				s_gradino = [];

			for (var i = 0; i < curveResultJson.length; i++) {
				perc_mbo.push(parseFloat(curveResultJson[i].PERC_MBO));
				valore_curva.push(parseFloat(curveResultJson[i].VALORE_CURVE));
				s_gradino.push(parseFloat(0));
			}

			var sPayload = {
				"ID_PERIODO": periodiId,
				"DESCR_CURVA": desc,
				"ID_TIPO_CURVA": selectedCurve,
				"PERC_MBO": perc_mbo,
				"VALORE_CURVA": valore_curva,
				"S_GRADINO": s_gradino
			};
			sPayload = JSON.stringify(sPayload);
			console.log(sPayload);
			console.log(JSON.stringify(sPayload));
			$.ajax({
				url: "/HANAMDC/STIP/STIPAdmin/services/crea_curva.xsjs",
				type: "POST",
				method: "GET",
				contentType: 'application/json',
				data: {
					odata: sPayload
				},
				dataType: 'text',

				success: function (data, textStatus1) {
					//	debugger;
					data = JSON.parse(data);
					console.log(data);
					var curveId = data[0].ID_CURVA;
					curveIdModel.setData(
						curveId
					);
					that.getView().setModel(curveIdModel, "curveIdModel");
					that.byId("desc").setEditable(false);
					that.byId("Salva").setVisible(false);
					that.byId("idDeleteCol").setVisible(false);
					that.byId("idAddRow").setVisible(false);
					that.displayLinearCurve(desc);
					MessageBox.success("curva creata con successo"); //Success message 'successfully created curve'

				},
				error: function (data, textStatus1) {
					//		debugger;
					console.log(data);
					MessageBox.error("Error while perfoming Salva operation. Please contact administrator.");
					jQuery.sap.log.getLogger().error("Salva operation failed" + textStatus1.toString());
				}
			});
		},
		/********************addRow function is used to add a new row with fields Performance and Payout********************************************/
		addRow: function (t) {
			//	debugger;
			var e = this.getView().byId("tbl");
			var o = e.getModel("curveResultTableModel").getProperty("/curveData");
			//                         var o1 =this.getView().getModel("curveResultTableModel").getData();
			var i = {
				/*Performance: "%",
				Payout: "%"*/
				Performance: "",
				Payout: ""
			};
			o.push(i);
			e.getModel("curveResultTableModel").setProperty("/curveData", o)
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
		/******************** displayLinearCurve function is used to plot  and display the Discreta/Rapporto(scattered) curve ********************************************/
		displayLinearCurve: function (desc) {
			//      1.Get the id of the VizFrame
			debugger
			var oVizFrame = this.getView().byId("idcolumn");
			oVizFrame.setVizProperties({
				dataLabel: {
					visible: true,
					formatString: '0"%"'
				},
				title: {
					//	text: desc + " - tipo curva Discreta/Rapporto Percentuale",
					text: desc,
					visible: true
				}
			});
			/*	oVizFrame.setVizScales([{
					feed: "valueAxis2",
					min: minPercMbo,
					max: maxPercMbo
				}]);*/

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
			var filenameTXT = "CURVA--DiscretaRapportoPercentuale--" + curveId + ".txt";

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
			debugger
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
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/change", "change");
			var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/fiscalYear");
			//	console.log(selectedFYPeriodi);
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Curve", {
				curve: "Curve",
				str: selectedFYPeriodi
			});
		}

	})
});