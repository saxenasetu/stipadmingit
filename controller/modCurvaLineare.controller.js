sap.ui.define(["sap/ui/core/mvc/Controller", "stipAdmin/stipAdmin/util/Formatter",
	"sap/ui/model/json/JSONModel", "sap/m/MessageBox", "../service/RepoService"
], function (t, Formatter, JSONModel, MessageBox, RepoService) {
	"use strict";
	var minPercMbo;
	var maxPercMbo;
	var oMainModel = new sap.ui.model.json.JSONModel();
	var idCurve = "";

	return t.extend("stipAdmin.stipAdmin.controller.modCurvaLineare", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("modCurvaLineare").attachPatternMatched(this._onObjectMatched, this);
		},
		/******************** _onObjectMatched function fetches the argument values ********************************************/
		_onObjectMatched: function () {
			//	debugger
			idCurve = sap.ui.getCore().getModel("BasicAppModel").getProperty("/curveId");
			var piste = parseInt(sap.ui.getCore().getModel("BasicAppModel").getProperty("/piste"));
			console.log(piste);
			if (piste > 0) {
				this.byId("deleteCurveButton").setVisible(false); //if piste >0 dont display elimina button
				this.byId("desc").setEditable(false); //if piste >0 ,description field is non editable
			} else {
				this.byId("deleteCurveButton").setVisible(true);
				this.byId("desc").setEditable(true);
			}
			this.displayLinearCurveTb();
			this.byId("fy").setText(sap.ui.getCore().getModel("BasicAppModel").getProperty("/year"));

		},
		/********************addRow function is used to add a new row with fields Performance and Payout********************************************/
		addRow: function (t) {
			debugger;
			var e = this.getView().byId("tbl");
			var o = this.getView().getModel("modCurveLinearModel").getData().curveData;
			var i = {
				/*PERC_MBO: "%",
				VALORE_CURVA: "%",*/
				PERC_MBO: "",
				VALORE_CURVA: ""
			};
			o.push(i);

			this.getView().getModel("modCurveLinearModel").setProperty("/curveData", o)

		},
		/******************** removeRow function is used to remove a row from the table********************************************/
		removeRow: function (oEvent) {
			//	debugger;
			var e = this.getView().byId("tbl");
			var o = e.getModel("modCurveLinearModel").getProperty("/curveData");
			//	console.log(o);
			var context = oEvent.getSource().getBindingContext("modCurveLinearModel");
			var path = context.getPath();
			var pos1 = ("/curveData/").length;
			var length = path.length;
			var index = Number(path.substring(pos1, length));
			//	console.log(index);
			o.splice(index, 1)
				//	console.log(o);
			e.getModel("modCurveLinearModel").setProperty("/curveData", o);
		},
		/******************** displayLinearCurveTb function is used to fetch the data from the backend(T_CURVE_RIGHE)
			based on the performance and payout********************************************/
		displayLinearCurveTb: function () {
			debugger
			var that = this;
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");

			var curveResultJson = [];
			var curveResultJsonData = {};
			var curveMBOJson = [];
			var oFilters = [];

			var descrCurve = sap.ui.getCore().getModel("BasicAppModel").getProperty("/descrCurve");

			if (idCurve != undefined && idCurve != "") {
				var filter1 = new sap.ui.model.Filter("ID_CURVA", sap.ui.model.FilterOperator.EQ, idCurve);
				oFilters.push(filter1);
			}

			xsoDataModel.read("/T_CURVE_RIGHE?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;
					console.log(oDataIn);
					for (var i = 0; i < oDataIn.results.length; ++i) {
						curveResultJsonData = {
							"PERC_MBO": oDataIn.results[i].PERC_MBO,
							"VALORE_CURVA": oDataIn.results[i].VALORE_CURVA,
							//              "S_GRADINO": oDataIn.results[i].S_GRADINO,
						};
						curveMBOJson.push(parseInt(oDataIn.results[i].PERC_MBO));
						curveResultJson.push(curveResultJsonData);
					}

					console.log(curveResultJson);
					/*	console.log(curveMBOJson);
						minPercMbo = Math.min.apply(null, curveMBOJson);
						maxPercMbo = Math.max.apply(null, curveMBOJson);*/

					curveResultJson.sort(function (a, b) {
						if (Number(a.VALORE_CURVA) < Number(b.VALORE_CURVA)) {
							return -1;
						} else
							return 1;
					});
					console.log(curveResultJson);

					oMainModel.setProperty("/curveData", curveResultJson);

					oMainModel.setProperty("/DESCR_CURVE", descrCurve);
					this.getView().setModel(oMainModel, "modCurveLinearModel");

					console.log(this.getView().getModel("modCurveLinearModel"));

					//           oMainModel.destroy();
					//this.createLinearCurve();
					this.showCurveTitle(descrCurve);
				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed while getting T_Curve_righe. Please contact administrator.");
					jQuery.sap.log.getLogger().error("T_Curve_righe fetch failed" + oError.toString());
				}.bind(this)
			});
			//var that = this;

		},
		/******************** showCurveTitle function is used to set the vizProperties(Title) to the LinearCurve********************************************/
		showCurveTitle: function (curveDesc) {
			debugger
			this.getView().byId("idcolumn").setVisible(true);
			//      1.Get the id of the VizFrame
			//	curveDesc=this.byId("desc").getValue();
			var oVizFrame = this.getView().byId("idcolumn");

			oVizFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						visible: true,
						formatString: '0"%"'
					}
					/*'window': {
					    start: "100",
					    end: "1000"
					},*/

					//	startValue: 10
				},
				title: {
					//	text: "Margin on KPI - tipo curva Linear",
					//text: curveDesc + " - tipo curva Lineare",
					text: curveDesc,
					visible: true
				}
			});
			/*	oVizFrame.setVizScales([{
					feed: "valueAxis",
					min: minPercMbo,
					max: maxPercMbo
				}]);*/

		},
		/*change: function(oEvent){
			debugger;
			var curveData = this.getView().getModel("modCurveLinearModel").getData().curveData;
			var v = this.byId("VALORE_CURVA").getValue();
			oEvent.getSource();
		},*/
		/********************validation function performs validation check that description should not be empty and 
		there must be entries in the performance and payout fields********************************************/
		validation: function () {
			debugger;
			var f;
			console.log(this.getView().getModel("modCurveLinearModel").getData().curveData);
			var curveData = this.getView().getModel("modCurveLinearModel").getData().curveData;
			var curveLength = this.getView().getModel("modCurveLinearModel").getData().curveData.length;
			var desc = this.getView().byId("desc").getValue();
			if (desc === "" || desc === undefined) {
				MessageBox.error("la descrizione è obbligatoria"); //Error message displayed 'the description is mandatory'
			} else {
				//	var pattern = RegExp('[0-9]+%{1}');
				for (var i = 0; i < curveLength; ++i) {
					/*		if (pattern.test(curveData[i].PERC_MBO) === false || pattern.test(curveData[i].VALORE_CURVA) === false) {
								f = 0;
								break;
							}*/
					//	curveData[i].PERC_MBO = curveData[i].PERC_MBO.split("%")[0];*/
					curveData[i].PERC_MBO = parseFloat(curveData[i].PERC_MBO);
					//	curveData[i].VALORE_CURVA = curveData[i].VALORE_CURVA.split("%")[0];
					curveData[i].VALORE_CURVA = parseFloat(curveData[i].VALORE_CURVA);
					if (isNaN(curveData[i].PERC_MBO) || isNaN(curveData[i].VALORE_CURVA)) {	//Validation for performance and payout to be numbers only

						f = 0;
						break;
					} else
						f = 1;
				}
				if (f === 1)	//If validation success calls saveLinearCurve and passing curveData with performance and payout values for X and Y axis
					this.saveLinearCurve(curveData);
				else {
					MessageBox.error("l'input deve essere in numeri"); //Error message 'input must be in numbers'
				}
			}
		},

		/****************************start of save functionality method****************************************/
		/********************saveLinearCurve function is used to save the curvaData(Payout and Performance) 
		and description based on the fiscal year and curva type and invoke the insertLinearCurve function********************************************/
		saveLinearCurve: function (curveData) {
			debugger
			var curveData = this.getView().getModel("modCurveLinearModel").getData().curveData;
			var curveLength = curveData.length;
			var curveResultJson = [];
			var curveResultJsonData = [];
			for (var i = 0; i < curveLength; ++i) {
				curveResultJsonData = {
					"PERC_MBO": curveData[i].PERC_MBO,
					"VALORE_CURVA": curveData[i].VALORE_CURVA
				};
				curveResultJson.push(curveResultJsonData);
			}
			var desc = this.getView().byId("desc").getValue();
			var periodiId = parseInt(sap.ui.getCore().getModel("BasicAppModel").getProperty("/0/FISCAL_YEAR"), 10);
			//           var selectedCurve=sap.ui.getCore().getModel("BasicAppModel").getProperty("/selectedCurve");
			var selectedCurve = Formatter.convertDescToIdTipo(sap.ui.getCore().getModel("BasicAppModel").getData().selectedCurve);
			console.log(curveResultJson + desc + periodiId + selectedCurve);
			this.insertLinearCurve(curveResultJson, desc, periodiId, selectedCurve);
		},
		/******************** insertLinearCurve function takes curveResultJson, desc, periodiId, selectedCurve
				as the input parameters and invoke the displayLinearCurveTb function********************************************/
		insertLinearCurve: function (curveResultJson, desc, periodiId, selectedCurve) {
			var idCurve = parseInt(sap.ui.getCore().getModel("BasicAppModel").getProperty("/curveId"), 10);
			debugger
			var that = this;
			console.log(curveResultJson);

			var perc_mbo = [],
				valore_curva = [],
				s_gradino = [];

			for (var i = 0; i < curveResultJson.length; i++) {
				perc_mbo.push(parseFloat(curveResultJson[i].PERC_MBO));
				valore_curva.push(parseFloat(curveResultJson[i].VALORE_CURVA));
				s_gradino.push(parseFloat(0));
			}

			var sPayload = {
				"ID_CURVA": idCurve,
				"ID_PERIODO": periodiId,
				"DESCR_CURVA": desc,
				"ID_TIPO_CURVA": selectedCurve,
				"PERC_MBO": perc_mbo,
				"VALORE_CURVA": valore_curva,
				"S_GRADINO": s_gradino,
				//           "SN_GATE":"",
				//           "SN_DESCRITTIVA":""
			};
			sPayload = JSON.stringify(sPayload);
			console.log(sPayload);
			console.log(JSON.stringify(sPayload));
			$.ajax({
				url: "/HANAMDC/STIP/STIPAdmin/services/modifica_curva.xsjs",
				type: "POST",
				method: "GET",
				contentType: 'application/json',
				data: {
					odata: sPayload
				},
				dataType: 'text',

				success: function (data, textStatus1) {
					debugger;
					console.log(data);
					//that.createLinearCurve();
					oMainModel.refresh();
					MessageBox.success("Curva modificata con successo", { //Success message 'Successfully modified curve'
						onClose: function (oEvent) {
							debugger;
							console.log("Onclose");
							that.cancel();
							//var n = sap.ui.core.UIComponent.getRouterFor(that);
							//              n.navTo("Periodi");
						}
					});
					that.displayLinearCurveTb();

				},
				error: function (data, textStatus1) {
					debugger;
					console.log(data);
					MessageBox.error("Error while perfoming Salva operation. Please contact administrator.");
					jQuery.sap.log.getLogger().error("Salva operation failed" + textStatus1.toString());
				}
			});
		},
		/****************************end of save functionality method****************************************/
		/********************************start of delete functionality methods *********************************/
		/********************************deleteCurveFn function seeks confirmation from the user for deletion *********************************/
		/********************************If the user input is "Si" then invokes the deleteCurve function*********************************/
		deleteCurveFn: function () {
			var that = this;
			var idCurve = sap.ui.getCore().getModel("BasicAppModel").getProperty("/curveId");
			sap.m.MessageBox.confirm("Sei sicuro di voler eliminare?", {	//Confirmation message 'Are you sure you want to delete?'
				actions: ["Si", sap.m.MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction == "Si") {
						that.deleteCurve(idCurve);
					}

				}
			});
		},
		/********************************deleteCurve function deletes the particular Curve based on ID_CURVA and ID_PERIODO *********************************/
		deleteCurve: function (idCurve) {
			var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/0/FISCAL_YEAR");
			debugger
			var that = this;
			var sPayload = {
				"ID_CURVA": idCurve,
				ID_PERIODO: parseInt(selectedFYPeriodi, 10)
			};
			sPayload = JSON.stringify(sPayload);
			console.log(sPayload);
			console.log(JSON.stringify(sPayload));
			$.ajax({
				url: "/HANAMDC/STIP/STIPAdmin/services/delete_curve.xsjs",
				type: "POST",
				method: "GET",
				contentType: 'application/json',
				data: {
					odata: sPayload
				},
				dataType: 'text',

				success: function (data, textStatus1) {
					debugger;
					console.log(data);

					MessageBox.success(
						"Curva eliminata con successo", { //Success message 'Successfully eliminated curve'
							onClose: function (oEvent) {
								debugger;
								console.log("Onclose");
								that.cancel();
								//var n = sap.ui.core.UIComponent.getRouterFor(that);
								//              n.navTo("Periodi");
							}
						});

				},
				error: function (data, textStatus1) {
					debugger;
					console.log(data);
					MessageBox.error("Error while perfoming delete operation. Please contact administrator.");
					jQuery.sap.log.getLogger().error("delete operation failed" + textStatus1.toString());
				}
			});
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

			var filenameTXT = "CURVA--LINEARE--" + idCurve + ".txt";

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
		/********************************end of delete functionality methods *********************************/
		/******************** cancel function navigates the user to the previous Curva page and will retain the previous changes********************************************/
		cancel: function () {
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/change", "change");
			var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/0/FISCAL_YEAR");
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Curve", {
				curve: "Curve",
				str: selectedFYPeriodi
			});
		}
	});
});