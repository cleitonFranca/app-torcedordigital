angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  
  .state('tabsController.cameraTabDefaultPage', {
    url: '/page2',
    views: {
      'tab1': {
        templateUrl: 'templates/cameraTabDefaultPage.html',
        controller: 'cameraTabDefaultPageCtrl'
      }
    }
  })

  .state('tabsController.calendRioDeJogos', {
    url: '/page3',
    views: {
      'tab2': {
        templateUrl: 'templates/calendRioDeJogos.html',
        controller: 'calendRioDeJogosCtrl'
      }
    }
  })

  .state('tabsController.rankTorcedorDigital', {
    url: '/page4',
    views: {
      'tab3': {
        templateUrl: 'templates/rankTorcedorDigital.html',
        controller: 'rankTorcedorDigitalCtrl'
      }
    }
  })

  .state('profilesTabDefaultPage', {
    url: '/page6',
    templateUrl: 'templates/profilesTabDefaultPage.html',
    controller: 'profilesTabDefaultPageCtrl'
    })

  .state('tabsController', {
    url: '/page1',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

  .state('login', {
    url: '/page5',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })
  
  .state('novoUsuario', {
    url: '/novoUsuario',
    templateUrl: 'templates/formUsuario.html',
    controller: 'novoUsuarioCtrl'
  })

  .state('recSenha', {
    url: '/recSenha',
    templateUrl: 'templates/formRecSenha.html',
    controller: 'loginCtrl'
  })

  .state('convite', {
    url: '/convite',
    templateUrl: 'templates/formConvite.html',
    controller: 'conviteCtrl'
  })

  .state('ingresso', {
    url: '/ingresso',
    templateUrl: 'templates/ingresso.html',
    controller: 'ingressoCtrl'
  })

  .state('checkout', {
    url: '/checkout',
    templateUrl: 'templates/checkout.html',
    controller: 'calendRioDeJogosCtrl'
  })

  .state('rooms', {
    url: '/rooms',
    templateUrl: 'templates/rooms.html'
  })

  .state('room', {
    url: '/room',
    templateUrl: 'templates/room.html'
  })

$urlRouterProvider.otherwise('/page5')

});