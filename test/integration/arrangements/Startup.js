sap.ui.define(["sap/ui/test/Opa5"],function(t){"use strict";return t.extend("stipAdmin.stipAdmin.test.integration.arrangements.Startup",{iStartMyApp:function(t){var i=t||{};i.delay=i.delay||50;this.iStartMyUIComponent({componentConfig:{name:"stipAdmin.stipAdmin",async:true},hash:i.hash,autoWait:i.autoWait})}})});