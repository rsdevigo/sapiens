/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/*global Firebase*/

(function(document) {
  'use strict';

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');

  /* Configurações*/

  app.baseUrl = '/';
  app.master = false;
  app.docente = false;
  app.activeTitle = 'Sapiens'; 
  app.lastTitle = [];
  app.lastState = [];
  app.state = 'normal'; 
  
  app.normal = true;
  app.viewing = false;
  app.creating = false;
  app.editing = false;
  app.visiting = false;

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

  Array.prototype.reduce = function(callback, initialValue) {
    var len = this.length;
    var index = 1; // index começa em 1
    var accumulatedValue = this[0]; // valor acumulado é o 1o valor
    // se for passado valor inicial, mudamos as coisas
    if ( initialValue ) {
      index = 0; // começa em 0
      accumulatedValue = initialValue; // acumulado = valor inicial
    }
    while(index < len) {
      accumulatedValue = callback(accumulatedValue, this[index], index, this );
      index++;
    }
    return accumulatedValue;
  };

  if (window.location.port === '') {  // if production
    // Uncomment app.baseURL below and
    // set app.baseURL to '/your-pathname/' if running from folder in production
    // app.baseUrl = '/polymer-starter-kit/';
  }

  app.displayInstalledToast = function() {
    // Check to make sure caching is actually enabled—it won't be in the dev environment.
    if (!Polymer.dom(document).querySelector('platinum-sw-cache').disabled) {
      Polymer.dom(document).querySelector('#caching-complete').show();
    }
  };  

  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('dom-change', function() {
    // console.log('Our app is ready to rock!');

    var ref = new Firebase("https://blazing-inferno-2038.firebaseio.com");    

    ref.child('master').on('value', function(snapshot){
      if(snapshot.exists()){
        app.active = snapshot.val().active;
      }
    });
  });

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function() {
    // imports are loaded and elements have been registered
  });

  app.back = function(){
    // change title back
    app.activeTitle = app.lastTitle.pop();
    
    // change state back
    app[app.state] = false;
    app.state = app.lastState.pop();
    app[app.state] = true;

    if (typeof app.backAction === 'function'){
      app.backAction();
    }
  }

  app.changeView = function(view){
    //save last title and state
    app.lastTitle.push(app.activeTitle);
    app.lastState.push(app.state);

    this.activeTitle = view.title;    
    this.activeViewElement = view.activeViewElement;

    var parent = document.querySelector('[data-route="' + view.route + '"]');
    var viewNode = Polymer.dom(parent).querySelector('.view');

    app.route = view.route;    
    app.backAction = viewNode.backAction;

    if (!app[view.state]===app[app.state]){
      app[view.state] = true; //new state 
      app[app.state] = false; // last state
      app.state = view.state; // update state  
    }    
    
  };

  app.slug = function slug(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
    
    // remove accents, swap ñ for n, etc
    var from = "ãàáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to   = "aaaaaeeeeiiiioooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // Remove caracteres invalidos
      .replace(/\s+/g, '-') // remove espacos e os troca por hifens
      .replace(/-+/g, '-'); // junta hifens repetidos

    return str;
  };

  app.slugify = function(colecao, id, transformacao){
    var colecaoFinal = {};

    if (colecao){
      colecao.forEach(function(item, idx){
        var key = '';

        if (typeof transformacao === 'function'){
          key = transformacao(item[id], item);
        }else{
          key = app.slug(item[id]);  
        }
        
        colecaoFinal[key] = item;
      });
    }
         
    return colecaoFinal;
  };

  // Scroll page to top and expand header
  app.scrollPageToTop = function() {
    app.$.headerPanelMain.scrollToTop(true);
  };

  app.closeDrawer = function() {
    app.$.paperDrawerPanel.closeDrawer();
  };

  app.appActive = function() {
    return app.user && app.active;
  };

  app.login = function() {
    app.$.firebaseLogin.login({scope: 'email'});

  };

  app.logout = function() {
    app.$.firebaseLogin.logout();
    app.route = 'login';
    app.master = false;
    app.docente = false;
  };

  app.atualizarUsuario = function(auth, user){
    // usuário foi cadastrado
    // atualizar objeto app.user

    if (!user){
      user = {};
    }

    for (var key in auth.detail.user){
      if (auth.detail.user.hasOwnProperty(key)) {
        user[key] = auth.detail.user[key];
      }
    }

    app.user = user

    if(app.active){
      app.route = 'home';
    }else{
      if(user.master){
        app.route = 'master';
      }
    }     
  }

  app.loginHandler = function(auth) {
    var ref = new Firebase('https://blazing-inferno-2038.firebaseio.com/');
    var userEmail = auth.detail.user.google.email;    
    var displayName = auth.detail.user.google.displayName;    
    var key = userEmail.split('@')[0].replace('.', '-');
    
    var usuario = {
      name: displayName,
      email: userEmail
    };

    ref.child('users').child(key).once('value', function(snapshot){
      if (!snapshot.exists()){ // usuário não existe na base de dados

        // verificar se usuário é administrador
        ref.child('administradores').orderByChild('email').equalTo(userEmail).once('value', function(snapshot){
          if(snapshot.exists()){
            usuario.master = true;
          }

          ref.child('docentes').orderByChild('email').equalTo(userEmail).on('value', function(snapshotDocentes) {
            var key = userEmail.split('@')[0].replace('.', '-');

            if (snapshotDocentes.exists()){              
              var docente = snapshotDocentes.val()[key];              

              usuario.diren = docente.diren || false;
              usuario.docente = true; 
              usuario.key = key;

              app.atualizarUsuario(auth, usuario);              
            }else{
              usuario.docente = false; 
              usuario.diren = false; 
            }

            ref.child('users').child(key).set(usuario); 
          });
        });             
      }
      
      usuario = snapshot.val();
      app.atualizarUsuario(auth, usuario);

      ref.child('docentes').orderByChild('email').equalTo(userEmail).on('value', function(snapshot) {
        if (!snapshot.exists()) {
          if(!user.master){
            app.$.firebaseLogin.logout();

            app.$.toast.text = 'Usuário não autorizado. Entre em contato com o administrador do Sapiens';
            app.$.toast.show();
            page.redirect(app.baseUrl);
          }else{
            page.route = 'master'; 
          }
        }
      });       
    });  
         
  };

})(document);
