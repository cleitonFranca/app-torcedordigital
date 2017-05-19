angular.module('app.controllers', [])

.controller('cameraTabDefaultPageCtrl', ['$location','AuthService','$scope','$stateParams','$http','$localStorage','AcessTokem',

function($location, AuthService, $scope, $stateParams, $http, $localStorage, AcessTokem) {
        
    AcessTokem.access($localStorage, $http);
    
    $http.get("https://graph.facebook.com/v2.9/me/feed?limit=10", { params: { access_token: $localStorage.accessTokenTD,fields: "created_time, description, picture, message, source, name, link, full_picture", format: "json" }})
        .then(function(result) {
                $scope.feedData = result.data.data;
                $http.get("https://graph.facebook.com/v2.9/me", { params: { access_token: $localStorage.accessTokenTD, fields: "picture, name, email", format: "json" }}).then(function(result) {
                    $scope.feedData.myPicture = result.data.picture.data.url;
                    $location.path("/page1/page2");
                });
            }, function(error) {
                console.error(error);
            });
    }
])

.controller('profilesTabDefaultPageCtrl', ['$location','AuthService','$scope','$stateParams', 'ProfileService','$http','$localStorage',
function($location, AuthService, $scope, $stateParams, ProfileService, $http, $localStorage) {
    
    $http.get("https://graph.facebook.com/v2.9/me", { params: { access_token: $localStorage.accessToken, fields: "id,name,gender, email, location,website,picture,relationship_status", format: "json" }})
                .then(function(result) {
                    if(result!=null) {
                        $localStorage.username = result.data.name;
                        $localStorage.profile = result.data; 
                    }
            }, function(error) {
                console.error(error);
            });

             $scope.profileData = $localStorage.profile;
    } 

])
   
.controller('calendRioDeJogosCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('rankTorcedorDigitalCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('novoUsuarioCtrl', ['$scope', '$stateParams', '$location','$localStorage','CrudService',
function ($scope, $stateParams, $location, $localStorage, CrudService) {
    $scope.usuario = {};

    $scope.novoUsuario = function(usuario) {
        
        if(usuario.nome!=undefined 
            && usuario.sobreNome!=undefined 
            && usuario.senha!=undefined 
            && usuario.email!=undefined) {      
            
            CrudService.create(usuario).then(function(result){
                console.log(result);
            }, function(error){
                console.error(error);
                $scope.error = error.data.message;
            })
       
        } else {
             $scope.error = "Há campos obrigatórios não preenchidos!";
        }
       
        console.log(usuario);
    }




}])
      
.controller('menuCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {

    $scope.exit = function() {
        ionic.Platform.exitApp();
    }


}])
   
.controller('loginCtrl', ['$scope', '$stateParams','$location','$localStorage','AuthService','$ionicSideMenuDelegate',
function ($scope, $stateParams, $location, $localStorage, AuthService, $ionicSideMenuDelegate) {

    $scope.usuario = {}
    
    // desabilitando sideBar
    $ionicSideMenuDelegate.canDragContent(false);

    var autenticado = AuthService.authenticated();

    $scope.display = "display:none";
    $scope.displayButton = "display:block";
    
    if(autenticado === true) {
        $location.path("/page1/page2");
    } 
    
    $scope.loginFacebook = function() {
        autenticado = AuthService.authFacebook();
        if(autenticado === false) {
            // criar mensagem de error de login na view
        }
    }

    $scope.loginTorcedor = function() {
        $scope.display = "display:block";
        $scope.displayButton = "display:none";
    }

    $scope.cancel = function() {
        $scope.display = "display:none";
        $scope.displayButton = "display:block";
    }

    $scope.loginSerivor = function(usuario){
        AuthService.authServidor(usuario).then(function(d){
         
           var data = d.data.usuario;
           data.name = d.data.usuario.nome;

           $localStorage.username = d.data.usuario.nome;
           $localStorage.profile = data; 

           $location.path("/page1/page2");
           
           console.log($scope.data);
        }, function(error){
            console.error(error);
            $scope.error = error.data.message;
        })

        
    }
    
}])

.controller('HomeController', ['$scope', '$state', '$localStorage', 'SocketService',
    
    function ($scope, $state, $localStorage, SocketService){

        var me = this;

        me.current_room = $localStorage.room;
        me.rooms = ['GERAL', 'ABC', 'AMERICA', 'ALECRIM'];
        

        $scope.login = function(username){
            $localStorage.username;
            $state.go('rooms');
        };

        
        $scope.enterRoom = function(room_name){

            me.current_room = room_name;
            $localStorage.room = room_name;
            
            var room = {
                'room_name': room_name
            };

            SocketService.emit('join:room', room);

            $state.go('room');
        };
    
}])

.controller('RoomController', ['$scope', '$state', '$localStorage', 'SocketService', 'moment', '$ionicScrollDelegate',
    
    function ($scope, $state, $localStorage, SocketService, moment, $ionicScrollDelegate){

        var me = this;

        me.messages = [];

        $scope.humanize = function(timestamp){
            return moment(timestamp).fromNow();
        };

        me.current_room = $localStorage.room;
        
        var current_user = $localStorage.username;

        $scope.isNotCurrentUser = function(user){
            
            if(current_user != user){
                return 'not-current-user';
            }
            return 'current-user';
        };


        $scope.sendTextMessage = function(){

            var msg = {
                'room': me.current_room,
                'user': current_user,
                'text': me.message,
                'time': moment()
            };

            
            me.messages.push(msg);
            $ionicScrollDelegate.scrollBottom();

            me.message = '';
            
            SocketService.emit('send:message', msg);
        };


        $scope.leaveRoom = function(){
    
            var msg = {
                'user': current_user,
                'room': me.current_room,
                'time': moment()
            };

            SocketService.emit('leave:room', msg);
            $state.go('rooms');

        };


        SocketService.on('message', function(msg){
            me.messages.push(msg);
            $ionicScrollDelegate.scrollBottom();
        });


}])
 