/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"stipAdmin/stipAdmin/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});