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
  

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');

  /* Configurações*/

  // Sets app default base URL
  app.baseUrl = '/';

  app.master = false;
  app.docente = false;
  app.activeTitle = 'Sapiens'; 
  app.lastTitle = [];
  app.lastState = [];
  app.state = 'normal'; 
  app.loading = true;
  
  app.normal = true;
  app.viewing = false;
  app.creating = false;
  app.editing = false;
  app.visiting = false;
  app.editandoPlanoEnsino = false;
  app.visitandoPlanoEnsino = false;
  app.direnPlanoEnsino = false;

  
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
        app.set('active', snapshot.val().active);
      }
    });
  });

  app.showLoading = function(){
    document.querySelector('#loading').style.display = 'block';
  }

  app.hideLoading = function(){
    document.querySelector('#loading').style.display = 'none';
  }

  HTMLImports.whenReady(function () {
    app.hideLoading();
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

    app.scrollPageToTop();
  }

  app.changeView = function(view){
    app.showLoading();

    if (!app.user){
      // app.$.toast.text = 'Usuário não autorizado! Entre em contato com o administrador do Sistema';
      // app.$.toast.show(); 
      //app.lastUrl = window.location.pathname;
      app.lastUrl = window.location.hash;
      page.redirect('/login'); 
    }else{
      //save last title and state
      app.lastTitle.push(app.activeTitle);
      app.lastState.push(app.state);

      this.activeTitle = view.title;    
      this.activeViewElement = view.activeViewElement;

      var parent = document.querySelector('[data-route="' + view.route + '"]');
      var viewNode = Polymer.dom(parent).querySelector('.view');

      app.set('route', view.route);    
      app.set('backAction', viewNode.backAction);

      if (!app[view.state]===app[app.state]){
        app[view.state] = true; //new state 
        app[app.state] = false; // last state
        app.state = view.state; // update state  
      }

      /* Configurar ações caso houver um sapiens-toolbar-actions */

      var el = document.querySelector(view.viewElement);

      if (el){
        var toolbarActions = el.querySelector('sapiens-toolbar-actions');

        if (toolbarActions){
          toolbarActions.prepare();
        }
      }
      

      /* Sempre que houver um viewElement, haverá um saveAction*/
      if (view.viewElement){
        var el = document.querySelector(view.viewElement);
        var toolbarActions = el.querySelector('sapiens-toolbar-actions');
      
        if (el.saveAction){ app.saveAction = el.saveAction;}  
        if (el.sendAction){ app.sendAction = el.sendAction;} 
        if (el.copyAction){ app.copyAction = el.copyAction;} 
        if (el.pasteAction){ app.pasteAction = el.pasteAction;}
        if (el.previewAction){ app.previewAction = el.previewAction;} 
        if (el.printAction){ app.printAction = el.printAction;}       
      }

      app.scrollPageToTop(); 
      app.hideLoading();
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

    app.set('route', 'login');
    app.set('master', false);
    app.set('docente', false);
  };

  app.atualizarUsuario = function(auth){
    // usuário foi cadastrado
    // atualizar objeto app.user

    if (!app.usuario){
      app.set('usuario', {});
    }

    for (var key in auth.detail.user){
      if (auth.detail.user.hasOwnProperty(key)) {
        app.usuario[key] = auth.detail.user[key];
      }
    }

    app.set('user', app.usuario);

    if(app.active){
      // app.set('route', 'home');
      if(app.lastUrl){
        page.redirect(app.lastUrl);
      }else{
        page.redirect(window.location.hash);
      }      

      app.hideLoading();
    }
  }

  app.loginHandler = function(auth) {
    var ref = new Firebase('https://blazing-inferno-2038.firebaseio.com/');
    var userEmail = auth.detail.user.google.email;    
    var displayName = auth.detail.user.google.displayName;    
    var key = userEmail.split('@')[0].replace('.', '-');
    
    app.set('usuario', {
      name: displayName,
      email: userEmail
    });

    ref.child('users').child(key).once('value', function(snapshotUsers){
      if (!snapshotUsers.exists()){ // usuário não existe na base de dados
        // verificar se usuário é administrador
        ref.child('administradores').orderByChild('email').equalTo(userEmail).once('value', function(snapshotAdministradores){
          if(snapshotAdministradores.exists()){
            app.set('usuario.master', true);
            app.set('user.master', true);
          }

          ref.child('docentes').orderByChild('email').equalTo(userEmail).on('value', function(snapshotDocentes) {
            var key = userEmail.split('@')[0].replace('.', '-');

            if (snapshotDocentes.exists()){              
              var docente = snapshotDocentes.val()[key];              

              app.set('usuario.diren', docente.diren || false);
              app.set('usuario.docente', true); 
              app.set('usuario.key', key);
              app.set('usuario.nome', docente['nome-completo']);

              app.atualizarUsuario(auth, app.usuario);              
            }else{
              app.set('usuario.docente', false); 
              app.set('usuario.diren', false); 
            }

            ref.child('users').child(key).set(app.usuario);

            app.set('user.docente', app.usuario.docente);
            app.set('user.diren', app.usuario.diren); 
          });
        });             
      }
      
      app.set('usuario', snapshotUsers.val());
      app.atualizarUsuario(auth, app.usuario);

      ref.child('docentes').orderByChild('email').equalTo(userEmail).on('value', function(snapshot) {
        if (!snapshot.exists()) {
          if(!app.user.master){
            app.$.firebaseLogin.logout();

            // app.$.toast.text = 'Usuário não autorizado. Entre em contato com o administrador do Sapiens';
            // app.$.toast.show();
            page.redirect(app.baseUrl);
            app.hideLoading();
          }else{
            app.changeView({
              title: 'Sapiens',
              state: 'normal',
              route: 'master',
            });
          }
        }
      });
    });  
         
  };

})(document);
