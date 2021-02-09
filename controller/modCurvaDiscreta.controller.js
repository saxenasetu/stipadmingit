sap.ui.define(["sap/ui/core/mvc/Controller", "stipAdmin/stipAdmin/util/Formatter",
	"sap/ui/model/json/JSONModel", "sap/m/MessageBox", "../service/RepoService"
], function (Controller, Formatter, JSONModel, MessageBox, RepoService) {
	"use strict";
	var minPercMbo;
	var maxPercMbo;
	var oMainModel = new sap.ui.model.json.JSONModel();
	var oMainModel = new sap.ui.model.json.JSONModel();
	var idCurve = "";
	return Controller.extend("stipAdmin.stipAdmin.controller.modCurvaDiscreta", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {
			this.getOwnerComponent().getRouter().getRoute("modCurvaDiscreta").attachPatternMatched(this._onObjectMatched, this);
		},
		/******************** _onObjectMatched function fetches the argument values ********************************************/
		_onObjectMatched: function () {
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
		/******************** displayLinearCurveTb function is used to fetch the data from the backend based on the filter values********************************************/
		displayLinearCurveTb: function () {
			debugger
			var that = this;
			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");

			var curveResultJson = [];
			var curveResultJsonData = {};
			var curveMBOJson = [];
			var oFilters = [];
			var idCurve = sap.ui.getCore().getModel("BasicAppModel").getProperty("/curveId");
			var descrCurve = sap.ui.getCore().getModel("BasicAppModel").getProperty("/descrCurve");
			//	var desc = this.getView().byId("desc").getValue();
			if (idCurve != undefined && idCurve != "") {
				var filter1 = new sap.ui.model.Filter("ID_CURVA", sap.ui.model.FilterOperator.EQ, idCurve);
				oFilters.push(filter1);
			}

			xsoDataModel.read("/T_CURVE?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;
					console.log(oDataIn);
					var ch1 = oDataIn.results[0].SN_GATE;
					if (ch1 != "")
						this.byId("ch1").setSelected(true);

				}.bind(this),
				error: function (oError) {
					//Handle the error
					MessageBox.error("Data fetch failed while getting T_Curve_righe. Please contact administrator.");
					jQuery.sap.log.getLogger().error("T_Curve_righe fetch failed" + oError.toString());
				}.bind(this)
			});

			xsoDataModel.read("/T_CURVE_RIGHE?$format=json", {
				filters: oFilters,
				success: function (oDataIn, oResponse) {
					debugger;
					console.log(oDataIn);
					for (var i = 0; i < oDataIn.results.length; ++i) {
						curveResultJsonData = {
							"PERC_MBO": oDataIn.results[i].PERC_MBO,
							"S_GRADINO": oDataIn.results[i].S_GRADINO,
							//              "S_GRADINO": oDataIn.results[i].S_GRADINO,
						};
						curveMBOJson.push(parseInt(oDataIn.results[i].PERC_MBO));
						curveResultJson.push(curveResultJsonData);
					}
					console.log(curveResultJson);
					console.log(curveMBOJson);
					minPercMbo = Math.min.apply(null, curveMBOJson);
					maxPercMbo = Math.max.apply(null, curveMBOJson);

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

		/****************************start of save functionality method****************************************/
		/********************validation function performs validation check that description should not be empty and 
		there must be entry in the payout field********************************************/
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
					/*	if (pattern.test(curveData[i].PERC_MBO) === false) {
							f = 0;
							break;
						}*/
					//	curveData[i].PERC_MBO = curveData[i].PERC_MBO.split("%")[0];
					curveData[i].PERC_MBO = parseFloat(curveData[i].PERC_MBO);

					if (isNaN(curveData[i].PERC_MBO)) {	//Validation for payout to be number only

						f = 0;
						break;
					} else
						f = 1;
				}
				if (f === 1)
					this.saveLinearCurve(curveData);//After validation Success, saveLinearCurve is called passing the curveData parameter
				else {
					MessageBox.error("l'input deve essere in numeri"); //Error message 'input must be in numbers'
				}

			}
		},
		/********************saveLinearCurve function is used to save the curvaData and description 
		based on the fiscal year and curva type and invoke the displayLinearCurve function********************************************/
		saveLinearCurve: function () {
			debugger
			var curveData = this.getView().getModel("modCurveLinearModel").getData().curveData;
			var curveLength = curveData.length;
			var curveResultJson = [];
			var curveResultJsonData = [];
			for (var i = 0; i < curveLength; ++i) {
				curveResultJsonData = {
					"PERC_MBO": curveData[i].PERC_MBO,
					"S_GRADINO": curveData[i].S_GRADINO
				};
				curveResultJson.push(curveResultJsonData);
			}
			var desc = this.getView().byId("desc").getValue();
			var periodiId = parseInt(sap.ui.getCore().getModel("BasicAppModel").getProperty("/0/FISCAL_YEAR"), 10);
			//           var selectedCurve=sap.ui.getCore().getModel("BasicAppModel").getProperty("/selectedCurve");
			var selectedCurve = Formatter.convertDescToIdTipo(sap.ui.getCore().getModel("BasicAppModel").getData().selectedCurve);
			if (selectedCurve === undefined)
				selectedCurve = 2;
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
				valore_curva.push(parseFloat(0));
				s_gradino.push(curveResultJson[i].S_GRADINO);
			}

			var sPayload = {
				"ID_CURVA": idCurve,
				"ID_PERIODO": periodiId,
				"DESCR_CURVA": desc,
				"ID_TIPO_CURVA": selectedCurve,
				"PERC_MBO": perc_mbo,
				"VALORE_CURVA": valore_curva,
				"S_GRADINO": s_gradino,
				"SN_GATE": ch1,

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
		/******************** showCurveTitle function is used to set the vizProperties(Title) to the DiscretaCurve********************************************/
		showCurveTitle: function (curveDesc) {
			debugger
			this.getView().byId("idcolumn").setVisible(true);
			//      1.Get the id of the VizFrame

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
					//	text: curveDesc + " - tipo curva Discreta",
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
		/****************************end of save functionality method****************************************/
		/********************************start of delete functionality methods *********************************/
		/********************************deleteCurveFn function seeks confirmation from the user for deletion *********************************/
		/********************************If the user input is "Si" then invokes the deleteCurve function*********************************/
		deleteCurveFn: function () {
			var that = this;
			var idCurve = sap.ui.getCore().getModel("BasicAppModel").getProperty("/curveId");
			sap.m.MessageBox.confirm("Sei sicuro di voler eliminare?", { //Confirmation message 'Are you sure you want to delete?'
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
			debugger
			var selectedFYPeriodi = sap.ui.getCore().getModel("BasicAppModel").getProperty("/0/FISCAL_YEAR");
			var that = this;
			var sPayload = {
				"ID_CURVA": idCurve,
				ID_PERIODO: parseInt(selectedFYPeriodi, 10)
			};
			sPayload = JSON.stringify(sPayload);
			console.log(sPayload);

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
						"Curva eliminata con successo", {
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

			var filenameTXT = "CURVA--DISCRETA--" + idCurve + ".txt";

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