angular.module('app.controllers', [])

    .controller('cameraTabDefaultPageCtrl', ['$location', 'AuthService', '$scope'
        , '$stateParams', '$http', '$localStorage', 'AcessTokem', '$cordovaSocialSharing',
        function ($location, AuthService, $scope, $stateParams, $http, $localStorage, AcessTokem, $cordovaSocialSharing) {

            function buscaFedd() {
                AcessTokem.access($localStorage, $http);
                $http.get("https://graph.facebook.com/v2.9/me/feed?limit=10", { params: { access_token: $localStorage.accessTokenTD, fields: "created_time, description, picture, message, source, name, link, full_picture", format: "json" } })
                    .then(function (result) {
                        $scope.feedData = result.data.data;
                        $http.get("https://graph.facebook.com/v2.9/me", { params: { access_token: $localStorage.accessTokenTD, fields: "picture, name, email", format: "json" } }).then(function (result) {
                            $scope.feedData.myPicture = result.data.picture.data.url;
                        });
                    }, function (error) {
                        console.error(error);
                    })

                $location.path("/page1/page2");
            }

            $scope.shareAnywhere = function (data) {
                $cordovaSocialSharing.share("Postado por: " + $localStorage.username, data.description, data.full_picture, "Link: " + data.link);
            }

            $scope.restartFeed = function () {
                buscaFedd();
            }

            buscaFedd();
        }

    ])

    .controller('profilesTabDefaultPageCtrl', ['$location', 'AuthService', '$scope', '$stateParams', 'ProfileService', '$http', '$localStorage',
        function ($location, AuthService, $scope, $stateParams, ProfileService, $http, $localStorage) {
            $scope.profileData = $localStorage.profile;
        }

    ])

    .controller('ingressoCtrl', ['$location', 'AuthService', '$scope', '$stateParams', 'ProfileService', '$http', '$localStorage',
        function ($location, AuthService, $scope, $stateParams, ProfileService, $http, $localStorage) {
            $scope.ingresso = $localStorage.ingresso;
        }

    ])

    .controller('calendRioDeJogosCtrl', ['$location', '$scope', '$state', '$stateParams', '$localStorage',
        function ($location, $scope, $state, $stateParams, $localStorage) {


            if ($localStorage.ingresso) {
                $scope.ingresso = true;
            }

            $scope.comprar = function (data) {

                var ingresso = {}

                var qrcode = "http://api.qrserver.com/v1/create-qr-code/?data=http://torcedordigital.com/api/pontuarIngresso?id=" + $localStorage.profile.id + "&amp;size=300x500";

                ingresso.id = data;
                ingresso.url = qrcode;

                $localStorage.ingresso = ingresso;

                $scope.ingresso = true;


                $state.transitionTo($state.current, $stateParams, { reload: true, inherit: false, notify: true });
            }

        }])

    .controller('rankTorcedorDigitalCtrl', ['$state', '$scope', '$location', '$stateParams', 'RankService',
        function ($state, $scope, $location, $stateParams, RankService) {

            function buscaRank() {
                RankService.rankGeral().then(function (res) {
                    $scope.rank = res.data;
                },
                    function (error) {
                        console.error(error);
                    })

                $location.path("/page1/page4");
            }

            $scope.restart = function () {
                buscaRank();
            }

            buscaRank();
        }])

    .controller('novoUsuarioCtrl', ['$scope', '$stateParams', '$location', '$localStorage', 'CrudService',
        function ($scope, $stateParams, $location, $localStorage, CrudService) {
            $scope.usuario = {};

            $scope.novoUsuario = function (usuario) {

                if (usuario.nome != undefined
                    && usuario.sobreNome != undefined
                    && usuario.senha != undefined
                    && usuario.email != undefined) {

                    CrudService.create(usuario).then(function (result) {
                        var data = result.data.usuario;
                        data.name = result.data.usuario.nome;
                        $localStorage.username = result.data.usuario.nome;
                        $localStorage.profile = data;
                        $location.path("/page1/page2");
                    }, function (error) {
                        console.error(error);
                        $scope.error = error.data.message;
                    })

                } else {
                    $scope.error = "Há campos obrigatórios não preenchidos!";
                }

            }

        }])

    .controller('menuCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
        // You can include any angular dependencies as parameters for this function
        // TIP: Access Route Parameters for your page via $stateParams.parameterName
        function ($scope, $stateParams) {

            $scope.exit = function () {
                ionic.Platform.exitApp();
            }

        }])

    .controller('loginCtrl', ['$scope', '$stateParams', '$location', '$localStorage', 'AuthService', '$ionicSideMenuDelegate',
        'CrudService', '$ionicLoading',
        function ($scope, $stateParams, $location, $localStorage, AuthService, $ionicSideMenuDelegate, CrudService, $ionicLoading) {

            $scope.usuario = {}

            // desabilitando sideBar
            $ionicSideMenuDelegate.canDragContent(false);

            var autenticado = AuthService.authenticated();

            $scope.display = "display:none";
            $scope.displayButton = "display:block";

            if (autenticado) {
                $location.path("/page1/page2");
            }

            $scope.loginFacebook = function () {

                AuthService.authFacebook();
                $ionicLoading.show({
                    template: 'Aguarde...',
                    duration: 33000
                });

            }

            $scope.loginTorcedor = function () {
                $scope.display = "display:block";
                $scope.displayButton = "display:none";
            }

            $scope.cancel = function () {
                $scope.display = "display:none";
                $scope.displayButton = "display:block";
            }

            $scope.loginServidor = function (usuario) {
                AuthService.authServidor(usuario).then(function (d) {
                    var data = d.data.usuario;
                    data.name = d.data.usuario.nome;

                    $localStorage.username = d.data.usuario.nome;
                    $localStorage.profile = data;
                    $location.path("/page1/page2");
                    console.log($scope.data);
                }, function (error) {
                    console.error(error);
                    $scope.error = error.data.message;
                })
            }

            $scope.recSenha = function (usuario) {
                $ionicLoading.show();
                CrudService.recSenha(usuario).then(function (sucess) {
                    $ionicLoading.hide();
                    $scope.success = sucess.data.message;
                    $scope.error = null;
                    $scope.usuario = {}
                }, function (error) {
                    console.error(error);
                    $ionicLoading.hide();
                    $scope.error = error.data.message;
                    $scope.success = null;
                    $scope.usuario = {}
                })
            }

        }])

    .controller('conviteCtrl', ['$scope', '$stateParams', '$location', '$localStorage', 'AuthService', '$ionicSideMenuDelegate',
        'CrudService', '$ionicLoading', function ($scope, $stateParams, $location, $localStorage, AuthService, $ionicSideMenuDelegate,
            CrudService, $ionicLoading) {

            $convidado = {}

            $scope.enviarConvite = function (convidado) {
                $ionicLoading.show();

                if (convidado) {
                    CrudService.convite(convidado).then(function (sucess) {
                        $ionicLoading.hide();
                        $scope.success = sucess.data.message;
                        $scope.error = null;
                        $scope.convidado = {}
                    }, function (error) {
                        console.error(error);
                        $ionicLoading.hide();
                        $scope.error = error.data.message;
                        $scope.success = null;
                        $scope.convidado = {}

                    })

                } else {
                    $ionicLoading.hide();
                    $scope.error = "Parâmetros obriatórios não preenchidos!";

                }

            }

        }])

    .controller('HomeController', ['$scope', '$state', '$localStorage', 'SocketService',

        function ($scope, $state, $localStorage, SocketService) {

            var me = this;

            me.current_room = $localStorage.room;
            me.rooms = ['GERAL', 'ABC', 'AMERICA', 'ALECRIM'];


            $scope.login = function (username) {
                $localStorage.username;
                $state.go('rooms');
            }


            $scope.enterRoom = function (room_name) {

                me.current_room = room_name;
                $localStorage.room = room_name;

                var room = {
                    'room_name': room_name
                }

                SocketService.emit('join:room', room);

                $state.go('room');
            }

        }])

    .controller('RoomController', ['$scope', '$state', '$localStorage', 'SocketService', 'moment', '$ionicScrollDelegate',

        function ($scope, $state, $localStorage, SocketService, moment, $ionicScrollDelegate) {

            var me = this;

            me.messages = [];

            $scope.humanize = function (timestamp) {
                return moment(timestamp).fromNow();
            }

            me.current_room = $localStorage.room;

            var current_user = $localStorage.username;

            $scope.isNotCurrentUser = function (user) {

                if (current_user != user) {
                    return 'not-current-user';
                }
                return 'current-user';
            }


            $scope.sendTextMessage = function () {

                var msg = {
                    'room': me.current_room,
                    'user': current_user,
                    'text': me.message,
                    'time': moment()
                }


                me.messages.push(msg);
                $ionicScrollDelegate.scrollBottom();

                me.message = '';

                SocketService.emit('send:message', msg);
            }


            $scope.leaveRoom = function () {

                var msg = {
                    'user': current_user,
                    'room': me.current_room,
                    'time': moment()
                }

                SocketService.emit('leave:room', msg);
                $state.go('rooms');

            }

            SocketService.on('message', function (msg) {
                me.messages.push(msg);
                $ionicScrollDelegate.scrollBottom();
            })

        }])