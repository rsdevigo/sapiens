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
  app.loading = true;

  if (window.location.port === '') {  // if production
    // Uncomment app.baseURL below and
    // set app.baseURL to '/your-pathname/' if running from folder in production
    app.baseUrl = '/sapiens/';
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

  app.removeChildrenFrom = function(el){
    var actionButtonsContainer = document.querySelector(el);
        
    while (actionButtonsContainer.firstChild) {
      actionButtonsContainer.removeChild(actionButtonsContainer.firstChild);
    }
  }

  app.changeView = function(view){
    app.showLoading();

    if (!app.user){
      //app.lastUrl = window.location.pathname;
      app.lastUrl = window.location.hash;
      page.redirect('/login'); 
    }else{
      this.activeTitle = view.title;    
      
      var parent = document.querySelector('[data-route="' + view.route + '"]');
      var viewNode = Polymer.dom(parent).querySelector('.view');

      if(view.route){
        app.route = view.route;    
      }

      /* Configurar ações caso houver um sapiens-toolbar-actions */

      var el = document.querySelector(view.viewElement);

      if (el){
        var toolbarActions = el.querySelector('sapiens-toolbar-actions');
        
        if (toolbarActions){ // adicionar actions à toolbar          
          toolbarActions.prepare(el);
        }
      }else{ // remover conteúdo da sapiens-toolbar-actions
        document.querySelector('sapiens-toolbar-actions').clear();
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
    var ref = new Firebase('https://blazing-inferno-2038.firebaseio.com/');

    if (!app.usuario){
      app.set('usuario', {});
    }

    for (var key in auth.detail.user){
      if (auth.detail.user.hasOwnProperty(key)) {
        app.usuario[key] = auth.detail.user[key];
      }
    }

    ref
      .child('servidores')
      .orderByChild('email')
      .equalTo(app.usuario.google.email)
      .on('value', function(snapshotServidores) {
        if (snapshotServidores.exists()){
          app.usuario.servidor = snapshotServidores.val().toArray()[0];
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
      }); 

    
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

          ref.child('servidores').orderByChild('email').equalTo(userEmail).on('value', function(snapshotServidores) {
            var key = userEmail.split('@')[0].replace('.', '-');

            if (snapshotServidores.exists()){              
              var servidor = snapshotServidores.val()[key];              

              app.set('usuario.key', key);
              app.set('usuario.nome', servidor.nomecompleto);

              app.atualizarUsuario(auth, app.usuario);              
            }

            ref.child('users').child(key).set(app.usuario);
          });
        });             
      }
      
      app.set('usuario', snapshotUsers.val());
      app.atualizarUsuario(auth, app.usuario);

     if (userEmail){
        ref.child('servidores').orderByChild('email').equalTo(userEmail).on('value', function(snapshot) {
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
      }      
    });  
         
  };

})(document);
