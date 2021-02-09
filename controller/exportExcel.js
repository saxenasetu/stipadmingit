var tablesToExcel = (function() {
  var uri = 'data:application/vnd.ms-excel;base64,'
    , tmplWorkbookXML = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">'
      + '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Author>Chandan Shashwat</Author><Created>{created}</Created></DocumentProperties>'
      + '{worksheets}</Workbook>'
      , tmplWorksheetXML = '<Worksheet ss:Name="{nameWS}"><Table>{rows}</Table></Worksheet>'
        , tmplCellXML = '<Cell><Data ss:Type="{nameType}">{data}</Data></Cell>'
          , base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) }
  , format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }
  return function(tables, wsnames, columnTemplate, wbname, appname) {


    var ctx = "";
    var workbookXML = "";
    var worksheetsXML = "";
    var rowsXML = "";
    var tablesKeys = [];

    for (key in tables) {
      tablesKeys.push({key:key});
    }

    for (var i = 0; i < Object.keys(tables).length; i++) {
      for (var k = 0; k < tables[tablesKeys[i].key].length; k++) {

        rowsXML += '<Row>'

          if(k==0){
            for(var l =0 ; l<columnTemplate[i].length;l++){
            var dataType = 'String';
            var dataStyle = 'String';

            dataValue = columnTemplate[i][l].label;

            ctx = {  nameType: true?dataType:'String', data:dataValue     };
            rowsXML += format(tmplCellXML, ctx);
            }
            rowsXML+="</Row><Row>"
          }

        for(var l =0 ; l<columnTemplate[i].length;l++){
          var key = columnTemplate[i][l].column;

          if (tables[tablesKeys[i].key][k].hasOwnProperty(key)) {
            var val = tables[tablesKeys[i].key][k][key];

            var dataType = 'String';
            var dataStyle = 'String';

            dataValue = val;
            ctx = {   nameType: true?dataType:'String', data:dataValue};
            rowsXML += format(tmplCellXML, ctx);
          }
        }

        rowsXML += '</Row>';
      }
      ctx = {rows: rowsXML, nameWS: wsnames[i] || 'Sheet' + i};
      worksheetsXML += format(tmplWorksheetXML, ctx);
      rowsXML = "";
    }

    ctx = {created: (new Date()).getTime(), worksheets: worksheetsXML};
    workbookXML = format(tmplWorkbookXML, ctx);

    if(sap.ui.Device.browser.name !== "ie"){

    var link = document.createElement("A");
    var csvData = new Blob([workbookXML], { type: 'text/html' }); //new way
    link.href = URL.createObjectURL(csvData);

      link.download = wbname || 'Workbook.xls';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }else {
      if (window.navigator.msSaveBlob) {
        var blob = new Blob([workbookXML], {
          type: "text/html"
        });
        navigator.msSaveBlob(blob, wbname || 'Workbook.xls');

         }
      }
  }
})();