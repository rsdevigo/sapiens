'use strict';

var SapiensOpensheet = (function(window, undefined) {
  function parse(sheetData) {
    if (sheetData.length) {
      var keys = [];
      var data = [];
      
      /* Finding properties that starts with gsx$ */
      Object.keys(sheetData[0]).forEach(function(key) {
        if (key.indexOf('gsx$') >= 0) {
          keys.push(key.replace('gsx$', ''));              
        }
      });

      sheetData.forEach(function(item) {
        var obj = {};

        keys.forEach(function(key) {
          if (item['gsx$' + key].$t) {
            obj[key] = item['gsx$' + key].$t;
          }
        });
                   
        data.push(obj);
      });

      return data;
    }
  }
  
  return {
    parse: parse
  };
  
})(window);

