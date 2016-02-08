(function(document) {
  Object.defineProperty(Object.prototype, 'clone', {
    value: function() {
      var cloned = JSON.parse(JSON.stringify(this));

      return cloned;
    }
  });

  Object.defineProperty(Object.prototype, 'toArray', {
    value: function() {
      var self = this;

      return Object.keys(self).map(function (key) {
        self[key].key = key;  

        return self[key];
      });
    }
  });

  Object.defineProperty(Object.prototype, 'isEmpty', {
    value: function(){
      var self = this;

      return Object.keys(self).length === 0;
    }
  });

  // Array.prototype.reduce = function(callback, initialValue) {
  //   var len = this.length;
  //   var index = 1; // index começa em 1
  //   var accumulatedValue = this[0]; // valor acumulado é o 1o valor
  //   // se for passado valor inicial, mudamos as coisas
  //   if ( initialValue ) {
  //     index = 0; // começa em 0
  //     accumulatedValue = initialValue; // acumulado = valor inicial
  //   }
  //   while(index < len) {
  //     accumulatedValue = callback(accumulatedValue, this[index], index, this );
  //     index++;
  //   }
  //   return accumulatedValue;
  // };

  })(document);
