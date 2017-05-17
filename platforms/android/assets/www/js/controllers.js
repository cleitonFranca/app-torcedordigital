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
                console.log(error);
            });
    }
])

.controller('profilesTabDefaultPageCtrl', ['$location','AuthService','$scope','$stateParams', 'ProfileService','$http','$localStorage',
function($location, AuthService, $scope, $stateParams, ProfileService, $http, $localStorage) {
    
    $http.get("https://graph.facebook.com/v2.9/me", { params: { access_token: $localStorage.accessToken, fields: "id,name,gender, email, location,website,picture,relationship_status", format: "json" }})
                .then(function(result) {
                    if(result!=null) {
                        $localStorage.username = result.data.name;
                        $scope.profileData = result.data;           

                    }
            }, function(error) {
                console.log(error);
            });
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
      
.controller('menuCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {

    $scope.exit = function() {
        ionic.Platform.exitApp();
    }


}])
   
.controller('loginCtrl', ['$scope', '$stateParams','$location','AuthService','$ionicSideMenuDelegate',
function ($scope, $stateParams, $location, AuthService, $ionicSideMenuDelegate) {

    $ionicSideMenuDelegate.canDragContent(false);

    var autenticado = AuthService.authenticated();

    $scope.display = "none";
    $scope.displayButton = "block";
    
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
        $scope.display = "block";
        $scope.displayButton = "none";
    }

    $scope.cancel = function() {
        $scope.display = "none";
        $scope.displayButton = "block";
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
 