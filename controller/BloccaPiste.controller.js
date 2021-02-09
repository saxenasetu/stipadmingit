sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/m/MessageBox",
	"stipAdmin/stipAdmin/util/DynamicTableColumn",
	"sap/m/TablePersoController",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/ui/core/BusyIndicator",
	"stipAdmin/stipAdmin/util/Formatter",
], function (Controller, JSONModel, Device, MessageBox, DynamicTableColumn, TablePersoController, Export, ExportTypeCSV, BusyIndicator,
	Formatter) {
	var oResource;

	return Controller.extend("stipAdmin.stipAdmin.controller.BloccaPiste", {
		/******************** onInit method is called upon initialization of the View. The controller can perform its internal setup in this hook ********************************************/
		onInit: function () {

			this.congArr = [];
			this.count = 0;
			this.tops = 150;
			this.skip = 0;
			this.f1 = 0, this.f2 = 0;
			this.byId("cong").setEnabled(true);
			//this.byId("scong").setEnabled(false);

			// init and activate controller
			this._oTPC = new TablePersoController({
				table: this.byId("tblBloccaPiste"),
				//specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
				componentName: "xmlview0",
				persoService: DynamicTableColumn
			}).activate();
			this.busyDialog = new sap.m.BusyDialog();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("BloccaPiste").attachPatternMatched(this._onObjectMatched, this);

		},
		/******************** onPersoButtonPressed function opens a dialog box for user to select which columns to be visible*******************************************/
		onPersoButtonPressed: function (oEvent) {
			this._oTPC.openDialog();
		},
		/******************** onTablePersoRefresh function is used to refresh the Perso Controller********************************************/
		onTablePersoRefresh: function () {
			DynamicTableColumn.resetPersData();
			this._oTPC.refresh();
		},
		/******************** _onObjectMatched fetches argument values********************************************/
		_onObjectMatched: function (oEvent) {
			if (oEvent) {
				var oArguments = oEvent.getParameter("arguments");
				this.selectedfiscalYearPeriodi = oArguments.str;

			}
			this.byId("tblBloccaPiste").setVisible(false);
			this.getGeneric(this.selectedfiscalYearPeriodi);
		},
		/******************** getGeneric function calls generic.xsjs ,payload is ID_PERIODO and output is fiscal year 
		and sets the BloccaPistaModel based on the Start and End date****************************/
		getGeneric: function (selectedfiscalYearPeriodi) {
			var that = this;
			BusyIndicator.show();
			var sPayload = {
				"ID_PERIODO": selectedfiscalYearPeriodi
			};
			sPayload = JSON.stringify(sPayload);
			var url = "/HANAMDC/STIP/STIPAdmin/services/generic.xsjs";
			$.ajax({
				url: url,
				type: "GET",
				contentType: "application/json",
				data: {
					odata: sPayload
				},
				//dataType: 'jsonp',
				success: function (data1, textStatus1, XMLHttpRequest1) {
					debugger;

					that.byId("idtxtfiscalyear").setText(data1[1].DESCR_PERIODO);

					var gruppo = data1[5].GRUPPO;
					var curve = data1[6].CURVE;

					that.Periodi_start_date_main = data1[8].dates[0].VALE_DAL;
					that.Periodi_end_date_main = data1[8].dates[0].VALE_AL;
					//max_id = data[21][1];
					console.log(that.Periodi_start_date_main);
					console.log(that.Periodi_end_date_main);
					var start = (new Date(that.Periodi_start_date_main)).getMonth() + 1;
					var end = (new Date(that.Periodi_end_date_main)).getMonth() + 1;
					var year = (new Date(that.Periodi_start_date_main)).getFullYear();
					var month = [{
						key: 0,
						month: ""
					}];
					for (var i = start; i <= 12; i++)
						month.push({
							key: i,
							month: Formatter.months(i) + " " + year
						});
					for (var i = 1; i <= end; i++)
						month.push({
							key: i,
							month: Formatter.months(i) + " " + (year + 1)
						});
					BusyIndicator.hide();
					var data = [];
					data.push({
						GRUPPO: gruppo,

					}, {
						Month: month
					}, {
						CURVE: curve
					});
					var oMainModel = new JSONModel();
					oMainModel.setData({
						Filter: data
					});
					that.getView().setModel(oMainModel, "BloccaPistaModel");
					BusyIndicator.hide();
				},
				error: function (data1, textStatus1, XMLHttpRequest1) {
					BusyIndicator.hide();
				}
			});
		},
		/******************** onAvvio fetches and displays the data from the backend(V_Piste) based on the filter values
		(idPista,desc,gruppo,tipoPista,sdate,edate,curve,pers,bloc,selPiste,asseg)********************************************/
		onAvvio: function () {
			var oFilters = [];
			var idPista = this.byId("txtID").getValue();
			var desc = this.byId("desc").getValue();
			var gruppo = this.byId("gruppo").getSelectedKey();
			var tipoPista = this.byId("tipo").getSelectedKey();
			var sdate = this.byId("sdate").getSelectedKey();
			var edate = this.byId("edate").getSelectedKey();
			var curve = this.byId("curve").getSelectedKey();
			var pers = this.byId("pers").getSelectedKey();
			var bloc = this.byId("bloc").getSelectedKey();
			var selPiste = this.byId("selPiste").getSelectedKey();
			var asseg = this.byId("asseg").getValue();

			this.sPath = "/V_Piste?$format=json";

			if (idPista !== "")
				oFilters.push(new sap.ui.model.Filter("ID_PISTAVIEW", sap.ui.model.FilterOperator.EQ, idPista));

			if (desc !== "")
				oFilters.push(new sap.ui.model.Filter({
					path: 'DESCR_PISTA',
					operator: sap.ui.model.FilterOperator.Contains,
					value1: desc,
					caseSensitive: false
				}));

			if (gruppo !== "")
				oFilters.push(new sap.ui.model.Filter("ID_GRUPPOPISTA", sap.ui.model.FilterOperator.EQ, parseInt(gruppo, 10)));

			if (curve !== "")
				oFilters.push(new sap.ui.model.Filter("ID_CURVA", sap.ui.model.FilterOperator.EQ, parseInt(curve, 10)));

			if (pers !== "")
				oFilters.push(new sap.ui.model.Filter("SN_PERSONALIZZABILE", sap.ui.model.FilterOperator.EQ, pers));

			if (bloc !== "")
				oFilters.push(new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("SN_BLOCCATA", sap.ui.model.FilterOperator.EQ, bloc),
						new sap.ui.model.Filter("SN_BLOCCATO_1T", sap.ui.model.FilterOperator.EQ, bloc),
						new sap.ui.model.Filter("SN_BLOCCATO_2T", sap.ui.model.FilterOperator.EQ, bloc),
						new sap.ui.model.Filter("SN_BLOCCATO_3T", sap.ui.model.FilterOperator.EQ, bloc),
						new sap.ui.model.Filter("SN_BLOCCATO_4T", sap.ui.model.FilterOperator.EQ, bloc)
					],

					and: false,
				}));
			if (sdate != undefined && sdate != "" && sdate != 0) {

				var month = Formatter.monthsRev(sdate.split(" ")[0]); //monthsRev function of formatter is used
				var yr = sdate.split(" ")[1];

				if (month === 1 || month === 3 || month === 5 || month === 7 || month === 8 || month === 10 || month === 12) {
					if (month < 10) //0 is diplayed before the month number if month <10
						month = "0" + month;
					var sdate2 = yr + "-" + month + "-31"; //Determining months with 31 days
				} else if (month === 2 && yr % 4 === 0) {
					if (month < 10)
						month = "0" + month;
					sdate2 = yr + "-" + month + "-29"; //Determining number of days in Februray of a leap year
				} else if (month === 2 && yr % 4 !== 0) {
					if (month < 10)
						month = "0" + month;
					sdate2 = yr + "-" + month + "-28"; //Determining number of days in Februray of a non-leap year
				} else {
					if (month < 10)
						month = "0" + month;
					sdate2 = yr + "-" + month + "-30"; //Determining months with 31 days
				}
				sdate2 = sdate2 + "T23:59:59.000";
				sdate2 = new Date(sdate2);

				sdate = Formatter.monthsRev(sdate.split(" ")[0]) + "-01-" + sdate.split(" ")[1];
				sdate = new Date(sdate);
				var filter = new sap.ui.model.Filter("PISTA_VALE_DAL", sap.ui.model.FilterOperator.BT, sdate, sdate2);

				oFilters.push(filter);
			}
			if (edate != undefined && edate != "" && edate != 0) {
				//	if (sdate != undefined || sdate != "" || sdate != 0) {
				var month = Formatter.monthsRev(edate.split(" ")[0]);
				var yr = edate.split(" ")[1];
				if (month === 1 || month === 3 || month === 5 || month === 7 || month === 8 || month === 10 || month === 12) {
					if (month < 10)
						month = "0" + month;
					var edate2 = yr + "-" + month + "-31";
				} else if (month === 2 && yr % 4 === 0) {
					if (month < 10)
						month = "0" + month;
					edate2 = yr + "-" + month + "-29";
				} else if (month === 2 && yr % 4 !== 0) {
					if (month < 10)
						month = "0" + month;
					edate2 = yr + "-" + month + "-28";
				} else {
					if (month < 10)
						month = "0" + month;
					edate2 = yr + "-" + month + "-30";
				}
				edate2 = edate2 + "T23:59:59.000";
				edate2 = new Date(edate2);

				edate = Formatter.monthsRev(edate.split(" ")[0]) + "-01-" + edate.split(" ")[1];
				edate = new Date(edate);
				var filter = new sap.ui.model.Filter("PISTA_VALE_AL", sap.ui.model.FilterOperator.BT, edate, edate2);

				oFilters.push(filter);
				//}
			}
			if (asseg !== "")
				oFilters.push(new sap.ui.model.Filter("FULLNAME", sap.ui.model.FilterOperator.Contains, asseg));

			if (tipoPista != undefined && tipoPista != "") {
				debugger
				var Periodi_start_date_main = this.Periodi_start_date_main;
				var Periodi_end_date_main = this.Periodi_end_date_main;

				//	var tempStorageDate = "";
				var piste_start_date = new Date(Periodi_start_date),
					piste_end_date = new Date(Periodi_end_date);
				if (tipoPista == "A") //when tipoPista= "A" Annual Periodi_start_date and Periodi_end_date is same pista_val_date and pista_al_date
				{
					piste_start_date = new Date(piste_start_date);
					piste_start_date = new Date(piste_start_date.setDate(piste_start_date.getDate() - 1));
					piste_end_date = new Date(piste_end_date);
					piste_end_date = new Date(piste_end_date.setDate(piste_end_date.getDate() + 1));
					tipoPista = "A";
				} else if (tipoPista == "S1") //when tipoPista= "S1" first 6 months 
				{
					piste_start_date = new Date(piste_start_date);
					piste_start_date = new Date(piste_start_date.setDate(piste_start_date.getDate() - 1));
					piste_end_date = new Date(piste_end_date.setMonth(piste_end_date.getMonth() - 6));
					//		piste_end_date = new Date(piste_end_date.setDate(piste_end_date.getDate() - 1));
					tipoPista = "S";
				} else if (tipoPista == "S2") //when tipoPista= "S2" last 6 months
				{
					piste_start_date = new Date(piste_start_date.setMonth(piste_start_date.getMonth() + 6));
					piste_start_date = new Date(piste_start_date.setDate(piste_start_date.getDate() - 1));
					piste_end_date = new Date(piste_end_date);
					piste_end_date = new Date(piste_end_date.setDate(piste_end_date.getDate() + 1));
					tipoPista = "S";
				} else if (tipoPista == "T1") //when tipoPista= "T1" first 3 months(1,2,3)
				{
					piste_start_date = new Date(piste_start_date);
					piste_start_date = new Date(piste_start_date.setDate(piste_start_date.getDate() - 1));
					piste_end_date = new Date(piste_end_date.setMonth(piste_end_date.getMonth() - 9));
					//	piste_end_date = new Date(piste_end_date.setDate(piste_end_date.getDate() - 1));
					tipoPista = "T";
				} else if (tipoPista == "T2") //when tipoPista= "T2" next 3 months(4,5,6)
				{
					piste_start_date = new Date(piste_start_date.setMonth(piste_start_date.getMonth() + 3));
					piste_start_date = new Date(piste_start_date.setDate(piste_start_date.getDate() - 1));
					piste_end_date = new Date(piste_end_date.setMonth(piste_end_date.getMonth() - 6));
					//	piste_end_date = new Date(piste_end_date.setDate(piste_end_date.getDate() - 1));
					tipoPista = "T";
				} else if (tipoPista == "T3") //when tipoPista= "T3" From 6th Month to 9th month
				{
					piste_start_date = new Date(piste_start_date.setMonth(piste_start_date.getMonth() + 6));
					piste_start_date = new Date(piste_start_date.setDate(piste_start_date.getDate() - 1));
					piste_end_date = new Date(piste_end_date.setMonth(piste_end_date.getMonth() - 3));
					piste_end_date = new Date(piste_end_date.setDate(piste_end_date.getDate() + 1));
					tipoPista = "T";
				} else if (tipoPista == "T4") //when tipoPista= "T4" last 3 months
				{
					piste_start_date = new Date(piste_start_date.setMonth(piste_start_date.getMonth() + 9));
					piste_start_date = new Date(piste_start_date.setDate(piste_start_date.getDate() - 1));
					piste_end_date = new Date(piste_end_date);
					piste_end_date = new Date(piste_end_date.setDate(piste_end_date.getDate() + 1));
					tipoPista = "T";
				}
				console.log(tipoPista + piste_start_date + piste_end_date);
				var ofilter5 = [];
				var filter13 = new sap.ui.model.Filter("TIPO_PISTA", sap.ui.model.FilterOperator.EQ, tipoPista);
				var filter14 = new sap.ui.model.Filter("PISTA_VALE_DAL", sap.ui.model.FilterOperator.GE, piste_start_date);
				var filter15 = new sap.ui.model.Filter("PISTA_VALE_AL", sap.ui.model.FilterOperator.LE, piste_end_date);
				ofilter5 = new sap.ui.model.Filter({
					filters: [
						filter13,
						filter14,
						filter15
					],
					and: true
				});
				oFilters.push(new sap.ui.model.Filter(ofilter5, false));
				console.log(oFilters);
			}
			if (selPiste !== "") {
				var orFilter = [];
				if (selPiste === "Key2") {
					sPath = "/V_PisteConGateHeader?$format=json";
				} else if (selPiste === "Key3") {
					sPath = "/V_PisteConGatePersonaleHeader?$format=json";

				} else if (selPiste === "Key4") {
					sPath = "/V_PisteConGatenonValorizzatoHeader?$format=json";

				} else if (selPiste === "Key5") {
					sPath = "/V_Piste?$format=json";
					oFilters.push(new sap.ui.model.Filter("N_SOTTOPISTE", sap.ui.model.FilterOperator.GT, 1));

				} else if (selPiste === "Key6") {
					sPath = "/V_Piste?$format=json";
					oFilters.push(new sap.ui.model.Filter("PERC_RAGG_MBO", sap.ui.model.FilterOperator.GT, 0));
				} else if (selPiste === "Key7") {
					var orFilter = [];
					sPath = "/V_Piste?$format=json";
					orFilter.push(new sap.ui.model.Filter("PERC_RAGG_MBO", sap.ui.model.FilterOperator.EQ, null));
					orFilter.push(new sap.ui.model.Filter("PERC_RAGG_MBO", sap.ui.model.FilterOperator.EQ, 0));
					oFilters.push(new sap.ui.model.Filter(orFilter, false));

				} else if (selPiste === "Key8") {
					sPath = "/V_PisteConCurvaDiscretaHeader?$format=json";
				} else {
					sPath = "/V_Piste?$format=json";
				}
				this.sPath = sPath;
			}

			this.oFilters = oFilters;
			this.getPiste(oFilters);
		},
		/******************** onResetta will reset all the filter fields(idPista,desc,gruppo,tipoPista,sdate,edate,curve,pers,bloc,selPiste,asseg) as blank********************************************/
		onResetta: function () {
			this.byId("txtID").setValue("");
			this.byId("desc").setValue("");
			this.byId("gruppo").setSelectedKey("");
			this.byId("tipo").setSelectedKey("");
			this.byId("sdate").setSelectedKey("");
			this.byId("edate").setSelectedKey("");
			this.byId("curve").setSelectedKey("");

			this.byId("pers").setSelectedKey("");
			this.byId("bloc").setSelectedKey("");
			this.byId("asseg").setValue("");
		},
		/******************** getPiste function fetches the data from the backend (as per ID_PERIODO ) 
		based on ID_PISTE and SN_BLOCCATA parameters********************************************/
		getPiste: function (oFilters) {
			debugger;
			this.congArr = [];
			BusyIndicator.show();

			var that = this;

			var filter = that.getView().getModel("BloccaPistaModel").getData().Filter;

			var xsoDataModel = new sap.ui.model.odata.v2.ODataModel("/HANAMDC/STIP/STIPAdmin/xsodata/stipadmin.xsodata/");
			var filter1 = new sap.ui.model.Filter("ID_PERIODO", sap.ui.model.FilterOperator.EQ, this.selectedfiscalYearPeriodi);
			oFilters.push(filter1);
			var data = [];
			xsoDataModel.read(this.sPath, {
				filters: oFilters,
				urlParameters: {
					"$top": this.tops,
					"$skip": this.skip
				},
				success: function (oDataIn, oResponse) {
					debugger;

					data = oDataIn.results;

					console.log(data);
					if (data.length > 0) {
						var data11 = data,
							m = {};
						data = [];
						for (var i = 0; i < data11.length; i++) {
							var v = data11[i].ID_PISTE;

							if (data11[i].SN_BLOCCATA === "S")
								data11[i].SN_BLOCCATA = "Bloccata";
							else
								data11[i].SN_BLOCCATA = "";
							if (!m[v]) {
								m[v] = true;
								data.push(data11[i]);
							}
						}

						this.byId("tblBloccaPiste").setVisible(true);

						console.log(data);
						var oMainModel = new JSONModel();

						oMainModel.setData({
							Filter: filter,
							Main: data
						});
						console.log(oMainModel.getData());
						that.getView().setModel(oMainModel, "BloccaPistaModel");
						that.byId("prev").setVisible(true);
						that.byId("next").setVisible(true);
						if (that.count < 1)
							that.byId("prev").setEnabled(false);
						else
							that.byId("prev").setEnabled(true);
						BusyIndicator.hide();

					} else {
						BusyIndicator.hide();
						MessageBox.error("Nessun dato trovato"); //Error message displayed 'No data found'
					}
				}.bind(this),
				error: function (oError) {
					//Handle the error
					BusyIndicator.hide();
					MessageBox.error("Nessun dato trovato"); //Error message displayed 'No data found'
				}.bind(this)
			});

		},
		/******************** _next function takes the user to the next page of the table********************************************/
		_next: function () {
			this.count = this.count + 1;
			this.skip = this.skip + this.tops;
			this.getPiste(this.oFilters)
		},
		/******************** _prev function takes the user to the previous page of the table*******************************************/
		_prev: function () {
			this.count = this.count - 1;
			if (this.skip > 0)
				this.skip = this.skip - this.tops;
			else
				this.skip = 0;
			this.getPiste(this.oFilters)
		},
		/******************** onHomePage function naviagtes the user to the Home Page of the StipAdmin module********************************************/
		onHomePage: function (oEvent) {
			this.clear();
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("Home");
			this.busyDialog.close();
		},
		/******************** handleBack function naviagtes the user to the previous page (BloccaCongela)********************************************/
		handleBack: function (oEvent) {
			this.clear();
			this.busyDialog.open();
			sap.ui.core.UIComponent.getRouterFor(this).navTo("BloccaCongela", {
				BloccaCongela: "BloccaCongela",
				str: this.selectedfiscalYearPeriodi
			});
			this.busyDialog.close();
		},
		clear: function () {
			/*	var data = [];
				oMainModel.setData(data);
				this.getView().setModel(oMainModel, "SchedaMasterModel");
				oMainModel.refresh();*/
			//	this.byId("vsdFilterBar").setVisible(false);
			//	this.byId("vsdFilterLabel").setText("");
			//	resetting filter
			if (sap.ui.getCore().byId("FilterDialogBloccaPiste") !== undefined) {
				var aFilterItems = sap.ui.getCore().byId("FilterDialogBloccaPiste").getFilterItems();
				aFilterItems.forEach(function (item) {
					var aItems = item.getItems();
					aItems.forEach(function (item) {
						item.setSelected(false);
					});
				});
			}
			if (this.byId("txtID").getValue())
				this.byId("txtID").setValue("");

			if (this.byId("desc").getValue())
				this.byId("desc").setValue("");

			if (this.byId("selPiste").getSelectedKey())
				this.byId("selPiste").setSelectedKey("");

			if (this.byId("gruppo").getSelectedKey())
				this.byId("gruppo").setSelectedKey("");

			if (this.byId("sdate").getSelectedKey())
				this.byId("sdate").setSelectedKey("");

			if (this.byId("edate").getSelectedKey())
				this.byId("edate").setSelectedKey("");

			if (this.byId("curve").getSelectedKey())
				this.byId("curve").setSelectedKey("");

			if (this.byId("pers").getSelectedKey())
				this.byId("pers").setSelectedKey("");

			if (this.byId("tipo").getSelectedKey())
				this.byId("tipo").setSelectedKey("");

			if (this.byId("bloc").getSelectedKey())
				this.byId("bloc").setSelectedKey("");

			if (this.byId("asseg").getValue())
				this.byId("asseg").setValue("");

			// if (this.byId("idSearchBox").getSelectedKey())
			// this.byId("idSearchBox").setSelectedKey("");

			/*	this.onSearch();
				var oTable = this.getView().byId("tbl");
				var aBinding = oTable.getBinding("items");
				aBinding.filter([]);*/
			/*	if (this.byId("box4").getSelectedKey())
					this.byId("box4").setSelectedKey("");*/
		},
		/******************** onSelect function fetches the data from BloccaPistaModel based on the Id********************************************/
		onSelect: function (oEvent, id) {
			debugger;
			var that = this;
			if (id !== 0) {
				if (oEvent.mParameters.selected === true)
					this.congArr.push(id);
				else {
					for (var i = 0; i < this.congArr.length; i++) {
						if (this.congArr[i] === id)
							this.congArr.splice(i, 1);
					}
				}
			} else {
				var data = that.getView().getModel("c").getData().Main;
				if (oEvent.mParameters.selected === true) {
					for (var i = 0; i < data.length; i++) {
						data[i].selected = true;
						this.congArr.push(id);
					}

				} else {
					for (var i = 0; i < data.length; i++)
						data[i].selected = false;
					this.congArr = [];

				}
				that.getView().getModel("BloccaPistaModel").refresh();

			}
			console.log(this.congArr);
		},
		/******************** onBloccaSblocca function is used to open BloccaSbloccaFrag fragment********************************************/
		onBloccaSblocca: function (oEvent, id) {
			var items = this.congArr;
			if (items.length === 0)
				MessageBox.error("Nessun utente selezionato"); //Error message displayed 'No users selected'
			else {
				/*for (var i = 0; i < items.length; i++) {
					var path = items[i].oBindingContexts.BloccaPistaModel.sPath;
					var id = this.getView().getModel("BloccaPistaModel").getProperty(path).ID_PISTE;
					this.congArr.push(id);
				}*/
				this.oDialogFragment = sap.ui.xmlfragment("stipAdmin.stipAdmin.fragment.BloccaSbloccaFrag", this.getView().getController());
				this.getView().addDependent(this.oDialogFragment);
				this.oDialogFragment.open();
			}

		},
		/******************** onCloseDialog function closes the BloccaSbloccaFrag fragment********************************************/
		onCloseDialog: function () {

			if (this.oDialogFragment) {
				this.oDialogFragment.destroy();
			}
		},
		/******************** onBlocca function calls the onBloccaMain passing value(SN_BLOCCATA) for Piste********************************************/
		onBlocca: function () {
			var value = {
				SN_BLOCCATA: "S"
			};
			var type2 = "B";
			if (this.oDialogFragment) {
				this.oDialogFragment.destroy();
			}
			this.onBloccaMain(value, type2);

		},
		/******************** onBloccaMain function fetches and displays the data from the backend based on the parameter value SN_BLOCCATA ********************************************/
		onBloccaMain: function (value, type2) {
			debugger;
			var that = this;
			BusyIndicator.show();
			var sPayload = {
				"scheda": this.congArr,
				"type": 3,
				"value": value,
				type2: type2
			};
			sPayload = JSON.stringify(sPayload);
			var url = "/HANAMDC/STIP/STIPAdmin/services/bloccaScheda.xsjs";
			$.ajax({
				url: url,
				type: "GET",
				contentType: "application/json",
				data: {
					odata: sPayload
				},
				//dataType: 'jsonp',
				success: function (data1, textStatus1, XMLHttpRequest1) {
					debugger;
					this.congArr = [];
					var data = that.getView().getModel("BloccaPistaModel").getData().Main;
					for (var i = 0; i < data.length; i++)
						data[i].selected = false;
					that.onAvvio();
					BusyIndicator.hide();
				},
				error: function (data1, textStatus1, XMLHttpRequest1) {
					BusyIndicator.hide();
				}
			});

		},
		/******************** onSblocca function calls the onBloccaMain passing value(SN_BLOCCATA)=N ********************************************/
		onSblocca: function (oEvent) {
			var value = {
				SN_BLOCCATA: "N"
			};
			var type2 = "B";
			if (this.oDialogFragment) {
				this.oDialogFragment.destroy();
			}
			this.onBloccaMain(value, type2);
		},
		/******************** onBlocca1Trimestre function calls the onBloccaMain passing value SN_BLOCCATA_1T=S********************************************/
		onBlocca1Trimestre: function (oEvent) {
			var value = {
				SN_BLOCCATO_1T: "S"
			};
			var type2 = "1T";
			if (this.oDialogFragment) {
				this.oDialogFragment.destroy();
			}
			this.onBloccaMain(value, type2);

		},
		/******************** onSblocca1Trimestre function calls the onBloccaMain passing value(SN_BLOCCATA_1T)=N********************************************/
		onSblocca1Trimestre: function (oEvent) {
			var value = {
				SN_BLOCCATO_1T: "N"
			};
			var type2 = "1T";
			if (this.oDialogFragment) {
				this.oDialogFragment.destroy();
			}
			this.onBloccaMain(value, type2);
		},
		/******************** onBlocca2Trimestre function calls the onBloccaMain passing value SN_BLOCCATA_2T=S********************************************/
		onBlocca2Trimestre: function (oEvent) {
			var value = {
				SN_BLOCCATO_2T: "S"
			};
			var type2 = "2T";
			if (this.oDialogFragment) {
				this.oDialogFragment.destroy();
			}
			this.onBloccaMain(value, type2);
		},
		/********************onSblocca2Trimestre function calls the onBloccaMain passing value SN_BLOCCATA_2T=N********************************************/
		onSblocca2Trimestre: function (oEvent) {
			var value = {
				SN_BLOCCATO_2T: "N"
			};
			var type2 = "2T";
			if (this.oDialogFragment) {
				this.oDialogFragment.destroy();
			}
			this.onBloccaMain(value, type2);
		},
		/******************** onBlocca3Trimestre function calls the onBloccaMain passing value SN_BLOCCATA_3T=S********************************************/
		onBlocca3Trimestre: function (oEvent) {
			var value = {
				SN_BLOCCATO_3T: "S"
			};
			var type2 = "3T";
			if (this.oDialogFragment) {
				this.oDialogFragment.destroy();
			}
			this.onBloccaMain(value, type2);
		},
		/******************** onSblocca3Trimestre function calls the onBloccaMain passing value SN_BLOCCATA_3T=N  ********************************************/
		onSblocca3Trimestre: function (oEvent) {
			var value = {
				SN_BLOCCATO_3T: "N"
			};
			var type2 = "3T";
			if (this.oDialogFragment) {
				this.oDialogFragment.destroy();
			}
			this.onBloccaMain(value, type2);
		},
		/******************** onBlocca4Trimestre function calls the onBloccaMain passing value SN_BLOCCATA_4T=S ********************************************/
		onBlocca4Trimestre: function (oEvent) {
			var value = {
				SN_BLOCCATO_4T: "S"
			};
			var type2 = "4T";
			if (this.oDialogFragment) {
				this.oDialogFragment.destroy();
			}
			this.onBloccaMain(value, type2);
		},
		/******************** onSblocca4Trimestre function calls the onBloccaMain passing value SN_BLOCCATA_4T=N********************************************/
		onSblocca4Trimestre: function (oEvent) {
			var value = {
				SN_BLOCCATO_4T: "N"
			};
			var type2 = "4T";
			if (this.oDialogFragment) {
				this.oDialogFragment.destroy();
			}
			this.onBloccaMain(value, type2);

		},
		/********************onDataExport function is used to download the table data*******************************************/
		onDataExport: function (oEvent) {
			oResource = this.getView().getModel("i18n").getResourceBundle();
			this.oModel2 = new JSONModel();
			this.oModel2.setData(this.data1);
			var that = this;
			var oExport = new Export({

				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType: new ExportTypeCSV({
					separatorChar: ";"
				}),

				// Pass in the model created above
				//	models : this.getView().getModel(),
				models: that.oModel2,
				// binding information for the rows aggregation
				rows: {
					path: "/NuovaLista"
				},

				// column definitions with column name and binding info for the content

				columns: [{
					name: oResource.getText("SelezionaDeseleziona"),
					template: {
						content: "{SelezionaDeseleziona}"
					}
				}, {
					name: oResource.getText("Trimestribloccati"),
					template: {
						content: "{Trimestribloccati}"
					}
				}, {
					name: oResource.getText("ID"),
					template: {
						content: "{ID}"
					}
				}, {
					name: oResource.getText("Descrizione"),
					template: {
						content: "{Descrizione}"
					}
				}, {
					name: oResource.getText("Gruppo"),
					template: {
						content: "{Gruppo}"
					}
				}, {
					name: oResource.getText("Mese_Inizio"),
					template: {
						content: "{Mese_Inizio}"
					}
				}, {
					name: oResource.getText("Mese_Fine"),
					template: {
						content: "{Mese_Fine}"
					}
				}, {
					name: oResource.getText("Curva"),
					template: {
						content: "{Curva}"
					}
				}, {
					name: oResource.getText("Moltiplicatore"),
					template: {
						content: "{Moltiplicatore}"
					}
				}, {
					name: oResource.getText("Inizio_Assegn"),
					template: {
						content: "{Inizio_Assegn}"
					}
				}, {
					name: oResource.getText("Fine_Assegn"),
					template: {
						content: "{Fine_Assegn}"
					}
				}, {
					name: oResource.getText("Identificativo_Assegnatario"),
					template: {
						content: "{Identificativo_Assegnatario}"
					}
				}, {
					name: oResource.getText("Count"),
					template: {
						content: "{Count}"
					}
				}, {
					name: oResource.getText("Target"),
					template: {
						content: "{Target}"
					}
				}, {
					name: oResource.getText("Consuntivo"),
					template: {
						content: "{Consuntivo}"
					}
				}, {
					name: oResource.getText("RaggObiett"),
					template: {
						content: "{RaggObiett}"
					}
				}, {
					name: oResource.getText("RaggPayout"),
					template: {
						content: "{RaggPayout}"
					}
				}, {
					name: oResource.getText("Payout"),
					template: {
						content: "{Payout}"
					}
				}, {
					name: oResource.getText("ObiettivoSim"),
					template: {
						content: "{ObiettivoSim}"
					}
				}, {
					name: oResource.getText("ConsuntivoSim"),
					template: {
						content: "{ConsuntivoSim}"
					}
				}, {
					name: oResource.getText("RaggObSim"),
					template: {
						content: "{RaggObSim}"
					}
				}, {
					name: oResource.getText("RaggPayoutsim"),
					template: {
						content: "{RaggPayoutsim}"
					}
				}]
			});

			// download exported file
			oExport.saveFile("Blocca Piste").catch(function (oError) {
				MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
			}).then(function () {
				oExport.destroy();
			});
		},
		// upendra
		handleIdCurvPress: function (oEvent, idCurve, curvetype) {
			debugger;
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "BlocaPisteMain");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/year", this.selectedfiscalYearPeriodi);

			sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", idCurve);

			var selectedCurve = Formatter.convertIdTipoToDesc(curvetype);

			var e = sap.ui.core.UIComponent.getRouterFor(this);
			if (selectedCurve == "Lineare") // after getting curv type t_tipi_curv
				e.navTo("displayCurvaLineare");

			else if (selectedCurve == "Discreta") {
				//	sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "curve");
				e.navTo("displayCurvaDiscreta");
			} else if (selectedCurve == "Discreta/Rapporto Percentuale")
				e.navTo("displayDiscretaRapportoPercentuale");
			else if (selectedCurve == "Lineare/Consuntivo")
				e.navTo("displayCurvaLineare_Consuntivo");
			else if (selectedCurve == "Lineare/Pdecimale")
				e.navTo("displayCurva_Pdecimale");
			else if (selectedCurve == "Descrittiva")
				e.navTo("displayCurvaDescrittiva");

		},
		handleDescGatePress: function (oEvent, idCurve, curvetype) {
			debugger;

			sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "BlocaPisteMainGate");
			sap.ui.getCore().getModel("BasicAppModel").setProperty("/year", this.selectedfiscalYearPeriodi);

			sap.ui.getCore().getModel("BasicAppModel").setProperty("/curveId", idCurve);
			var selectedCurve = Formatter.convertIdTipoToDesc(curvetype);

			var e = sap.ui.core.UIComponent.getRouterFor(this);
			if (selectedCurve == "Lineare") // after getting curv type t_tipi_curv
				e.navTo("displayCurvaLineare");

			else if (selectedCurve == "Discreta") {
				//	sap.ui.getCore().getModel("BasicAppModel").setProperty("/back", "curve");
				e.navTo("displayCurvaDiscreta");
			} else if (selectedCurve == "Discreta/Rapporto Percentuale")
				e.navTo("displayDiscretaRapportoPercentuale");
			else if (selectedCurve == "Lineare/Consuntivo")
				e.navTo("displayCurvaLineare_Consuntivo");
			else if (selectedCurve == "Lineare/Pdecimale")
				e.navTo("displayCurva_Pdecimale");
			else if (selectedCurve == "Descrittiva")
				e.navTo("displayCurvaDescrittiva");

		},
	});

});