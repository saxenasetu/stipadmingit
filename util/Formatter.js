/*global com*/
$.sap.declare("stipAdmin.stipAdmin.util.Formatter");

stipAdmin.stipAdmin.util.Formatter = {

	removePercent: function (sValue) {
		return sValue.split("%")[0];
	},
	addPercent: function (sValue) {
		return sValue + "%";
	},
	hide: function (sValue1, sValue2) {
		/*var a = sValue.split("");
		if(a[0]!==null || a[0]!==undefined)
		a[0]="";
		return a[0];*/
		//sValue2 = sValue2.style.display = "none";

		return " ";
	},
	removetime: function (value) {
		if (value) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd-MM-yyyy"
			});
			return oDateFormat.format(new Date(value));
		} else {
			return value;
		}
	},
	months: function (sValue) {
		if (sValue === 0)
			return "";
		if (sValue === 1)
			return "Gennaio";
		if (sValue === 2)
			return "Febbraio";
		if (sValue === 3)
			return "Marzo";
		if (sValue === 4)
			return "Aprile";
		if (sValue === 5)
			return "Maggio";
		if (sValue === 6)
			return "Giugno";
		if (sValue === 7)
			return "Luglio";
		if (sValue === 8)
			return "Agosto";
		if (sValue === 9)
			return "Settembre";
		if (sValue === 10)
			return "Ottobre";
		if (sValue === 11)
			return "Novembre";
		if (sValue === 12)
			return "Dicembre";
	},
	monthsRev: function (sValue) {
		if (sValue === 0)
			return "";
		if (sValue === "Gennaio")
			return 1;
		if (sValue === "Febbraio")
			return 2;
		if (sValue === "Marzo")
			return 3;
		if (sValue === "Aprile")
			return 4;
		if (sValue === "Maggio")
			return 5;
		if (sValue === "Giugno")
			return 6;
		if (sValue === "Luglio")
			return 7;
		if (sValue === "Agosto")
			return 8;
		if (sValue === "Settembre")
			return 9;
		if (sValue === "Ottobre")
			return 10;
		if (sValue === "Novembre")
			return 11;
		if (sValue === "Dicembre")
			return 12;
	},

	convertDescToIdTipo: function (sValue) {
		if (sValue === "" || sValue === undefined || sValue === null)
			return "";
		if (sValue == "Descrittiva")
			return 0;
		if (sValue == "Lineare")
			return 1;
		if (sValue == "Discreta")
			return 2;
		if (sValue == "Discreta/Rapporto Percentuale")
			return 3;
		if (sValue == "Lineare/Consuntivo")
			return 4;
		if (sValue == "Lineare/Pdecimale")
			return 5;
	},

	convertIdTipoToDesc: function (sValue) {
		if (sValue === "" || sValue === undefined || sValue === null)
			return "";
		if (sValue == 0)
			return "Descrittiva";
		if (sValue == 1)
			return "Lineare";
		if (sValue == 2)
			return "Discreta";
		if (sValue == 3)
			return "Discreta/Rapporto Percentuale";
		if (sValue == 4)
			return "Lineare/Consuntivo";
		if (sValue == 5)
			return "Lineare/Pdecimale";
	},

	convertmstomins: function (sValue) {
		if (sValue === "") {
			return 0;
		} else {
			return sValue / 60000;
		}
	},

	convertminstoHHSS: function (MINUTES) {
		var m = MINUTES % 60;

		var h = (MINUTES - m) / 60;

		var HHMM = h.toString() + ":" + (m < 10 ? "0" : "") + m.toString();

		return HHMM;
	},

	formatDate: function (sValue) {

		if (sValue === "" || sValue === undefined || sValue === null) {
			return "";
		} else {
			jQuery.sap.require("sap.ui.core.format.DateFormat");
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd-MM-yyyy"
			});

			return oDateFormat.format(new Date(sValue), true);
		}
	},
		formatDate2: function (sValue) {

		if (sValue === "" || sValue === undefined || sValue === null) {
			return "";
		} else {
			jQuery.sap.require("sap.ui.core.format.DateFormat");
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/yyyy"
			});

			return oDateFormat.format(new Date(sValue), true);
		}
	},

	formatMeseAnno: function (sValue) {
		if (sValue === "" || sValue === undefined || sValue === null) {
			return "";
		} else {
			jQuery.sap.require("sap.ui.core.format.DateFormat");
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				//pattern: "MM-y"
				pattern: "yyyy-MM-dd"
			});

			return oDateFormat.format(new Date(sValue), true);
		}
	},

	formatDateToMMDDYYYY: function (sValue) {
		if (sValue === "" || sValue === undefined || sValue === null) {
			return "";
		} else {
			return (sValue.split("-")[1] + "-" + sValue.split("-")[0] + "-" + sValue.split("-")[2]);
		}
	},

	formatUTCDate: function (sValue) {
		if (sValue === "" || sValue === undefined || sValue === null) {
			return "";
		} else {
			jQuery.sap.require("sap.ui.core.format.DateFormat");
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/yyyy"
			});
			//sValue = sValue.substring(0,sValue.indexOf("T")); // E.g Returns "2018-04-03" from "2018-04-03T00:00:00" 
			return oDateFormat.format(new Date(sValue), true);
		}
	},
	getIdentificativo_Assegnatario: function (sValue1, sValue2, sValue3) {
		if (sValue1 === "" || sValue2 === "" || sValue3 === "") {
			return "";
		} else {

			return sValue1 + " : " + sValue2 + " " + sValue3;
		}
	},
	getTarget: function (sValue1, sValue2, sValue3) {
		if (sValue1 === "" || sValue2 === "" || sValue3 === "") {
			return "";
		} else {

			return sValue2;
		}
	},
	getConsunt: function (sValue1, sValue2, sValue3) {
		if (sValue1 === "" || sValue2 === "" || sValue3 === "") {
			return "";
		} else {

			return sValue2;
		}
	},
	setReportDesc: function (str, str1) {
		var i = str.indexOf("n.b.");
		var oList = this.getView().byId('list');
		var oCustomItem = new sap.m.ObjectListItem({
			type: "Active",
			press: [this.onSelectionChange, this]
		});
		var oText1 = "";
		var oText2 = "";
		if (i > 0) {
			var res = str.substr(0, i);
			oCustomItem.setTitle(res);
			var res2 = str.substr(i);
			oText2 = new sap.m.ObjectAttribute({
				text: res2
			});
			oText1 = new sap.m.ObjectAttribute({
				text: str1
			});
			oText1.setVisible(false);
			oCustomItem.addAttribute(oText2);
			oCustomItem.addAttribute(oText1);
		} else {
			oText1 = new sap.m.ObjectAttribute({
				text: str1
			});
			oCustomItem.setTitle(str);
			oCustomItem.addAttribute(oText1);
		}

		oList.addItem(oCustomItem);
	},
	getTipoCalculate: function (value1) {
		if (value1)
			monthCount = parseInt(value1);
		//	var monthCount = stipAdmin.stipAdmin.util.Formatter.monthDiff(new Date(value1), new Date(value2));
		if (monthCount >= 0 && monthCount <= 2) {
			return "T";
		} else if (monthCount > 2 && monthCount <= 5) {
			return "S";
		} else if (monthCount > 5) {
			return "A";
		}
	},
	getTipoCalculate1: function (value1, value2) {
		if (value1 && value2)

			var monthCount = stipAdmin.stipAdmin.util.Formatter.monthDiff(new Date(value1), new Date(value2));
		if (monthCount >= 0 && monthCount <= 3) {
			return "T";
		} else if (monthCount > 3 && monthCount <= 6) {
			return "S";
		} else if (monthCount > 6) {
			return "A";
		}
	},
	monthDiff: function (d1, d2) {
		var months, day1, day2;
		months = (d2.getFullYear() - d1.getFullYear()) * 12; //calculates months between two years
		months -= d1.getMonth() + 1;
		months += d2.getMonth(); //calculates number of complete months between two months
		day1 = 30 - d1.getDate();
		day2 = day1 + d2.getDate();
		months += parseInt(day2 / 30); //calculates no of complete months lie between two dates
		return months <= 0 ? 0 : months;
	},
	formatDatePiste: function (sValue) {

		if (sValue === "" || sValue === undefined || sValue === null) {
			return "";
		} else {
			jQuery.sap.require("sap.ui.core.format.DateFormat");
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-dd"
			});

			return oDateFormat.format(new Date(sValue), true);
		}
	},

	getNomeCognome: function (sValue1, sValue2) {
		if (sValue1 === "" || sValue2 === "") {
			return "";
		} else {
			return sValue1 + " " + sValue2;
		}
	},

	removeBlank: function (sValue1) {
		if (sValue1 == "") {
			return false;
		} else {
			return true;
		}
	},

	formatTableCell: function (v1, v2) {
		if (v2.includes("nolineThrough")) {
			this.removeStyleClass("lineThrough");
		} else if (v2.includes("Gruppo Scheda")) {
			this.removeStyleClass("grayBackground");
		} else if (v2 === "N" || v2 === "") {
			this.removeStyleClass("grayFont");
		}
		return v1;
	},
	formatTableCell1: function (v1, v2, v3) {
		if (v3.includes("nolineThrough")) {
			this.removeStyleClass("lineThrough");
		}
		return v1 + " " + v2;
	},
	formatPersonalizzabile: function (sValue) {
		if (sValue == "S") {
			return "Si";
		} else if (sValue == "N") {
			return "No";
		}
	},
	// ********** Gestione Consuntivazione functions START ************
	formatDateGestCons: function (sValue) {
		if (sValue === "" || sValue === undefined || sValue === null || sValue === "NULL") {
			return "";
		} else {

			var yy = sValue.substr(0, 4);
			var mm = sValue.substr(4, 2);
			var dd = sValue.substr(6, 2);

			return (dd + "/" + mm + "/" + yy);
		}
	},
	formatDatePopup: function (sValue) {
		if (sValue === "" || sValue === undefined || sValue === null || sValue === "NULL") {
			return "";
		} else {
			jQuery.sap.require("sap.ui.core.format.DateFormat");
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/yyyy"
			});

			return oDateFormat.format(new Date(sValue), true);
		}
	},
	formatDateImpMan: function (sValue) {
		if (sValue === "" || sValue === undefined || sValue === null || sValue === "NULL") {
			return "";
		} else {
			jQuery.sap.require("sap.ui.core.format.DateFormat");
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/yyyy HH:mm"
			});

			return oDateFormat.format(new Date(sValue), true);
		}
	},
	// ********** Gestione Consuntivazione functions END ************
	/************* convertQualificaTypeQ function converts Qualifica filter value I to Q if and only if HR1_PAYGRADE like Q************/
	convertQualificaTypeQ: function (sValue, sValue1) {
		if (sValue === "" || sValue === undefined || sValue === null)
			return "";
		else if (sValue === "D")//If Qualifica is D, displays D in result table
			return "D";
		else if (sValue === "Q")//If Qualifica is Q, displays Q in result table
			return "Q";
		else if (sValue1 !== "" || sValue1 !== undefined || sValue1 !== null) {//when HR1_PAYGRADE/PAYGRADE is not blank or not null or not undefined
			if (sValue === "I" && sValue1.match(/Q.*/))//If Qualifica is I & HR1_PAYGRADE/PAYGRADE is like Q, displays Q in result table
				return "Q";
			else if (sValue === "I") //If Qualifica is I,displays I in result table if sValue1 dont have like Q condition 
				return "I";
		} else if (sValue === "I") //If Qualifica is I, displays I in result table when HR1_PAYGRADE/PAYGRADE is blank or null or undefined
			return "I";
	}
	

};