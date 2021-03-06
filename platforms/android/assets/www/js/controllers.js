angular.module('app.controllers', [])

    .controller('cameraTabDefaultPageCtrl', ['$location', 'AuthService', '$scope'
        , '$stateParams', '$http', '$localStorage', 'AcessTokem', '$cordovaSocialSharing', 'CrudService',
        function ($location, AuthService, $scope, $stateParams, $http, $localStorage,
            AcessTokem, $cordovaSocialSharing, CrudService) {

            $scope.buscaFedd = function () {
                AcessTokem.access($localStorage, $http);
                $http.get("https://graph.facebook.com/v2.8/me/feed?limit=10", { params: { access_token: $localStorage.accessTokenTD, fields: "created_time, description, picture, message, source, name, link, full_picture", format: "json" } })
                    .then(function (result) {
                        $scope.feedData = result.data.data;
                        $http.get("https://graph.facebook.com/v2.8/me", { params: { access_token: $localStorage.accessTokenTD, fields: "picture, name, email", format: "json" } }).then(function (result) {
                            $scope.feedData.myPicture = result.data.picture.data.url;
                        });
                    }, function (error) {
                        console.log(error);
                    })

                $location.path("/page1/page2");
            }

            $scope.shareAnywhere = function (data) {
                $cordovaSocialSharing.share("Torcedor Digital", data.description, data.full_picture, data.link);

                var compartilhar = $localStorage.profile.email != null;
                if (compartilhar) {
                    CrudService.pontuar($localStorage.profile.email).then(
                        function (success) {
                            console.log(success);
                        }, function (error) {
                            console.log(error);
                        })
                }
            }

            $scope.restartFeed = function () {

                $scope.buscaFedd();
            }

            $scope.buscaFedd();

        }

    ])

    .controller('profilesTabDefaultPageCtrl', ['$location', 'AuthService', '$scope', '$stateParams', 'ProfileService', '$http', '$localStorage', 'upload',
        function ($location, AuthService, $scope, $stateParams, ProfileService, $http, $localStorage, upload) {
            $scope.profileData = $localStorage.profile;

            $scope.onUpload = function (files) {
                console.log('AdvancedMarkupCtrl.onUpload', files);
            };
            $scope.onError = function (response) {
                console.error('AdvancedMarkupCtrl.onError', response);
            };
            $scope.onComplete = function (response) {
                console.log('AdvancedMarkupCtrl.onComplete', response);
                try {
                    $scope.profileData.picture.data.url = response.data.location;
                } catch (error) {
                    $scope.profileData.picture = { "data": { "url": response.data.location } };
                }

                ProfileService.salvarImg(response.data.location, $scope.profileData.email).then(function (data) {
                    console.log(data);
                }, function (error) {
                    console.log(error);
                })
            };


        }

    ])

    .controller('ingressoCtrl', ['$location', 'AuthService', '$scope', '$stateParams', 'ProfileService', '$http', '$localStorage', 'IngressoService',
        function ($location, AuthService, $scope, $stateParams, ProfileService, $http, $localStorage, IngressoService) {

            IngressoService.buscaIngresso($localStorage.profile.email).then(function (data) {
              
                if(data.data.length > 0)
                    $scope.ingressos = data.data;
                else
                    $scope.msg = "Não há ingressos gerados!";
            }, function (error) {
                console.log(error);
            })
        }

    ])

    .controller('calendRioDeJogosCtrl', ['$location', '$scope', '$state', '$stateParams', '$localStorage', '$ionicLoading', 'CalendarioService', '$ionicPopup', '$cordovaInAppBrowser',
        function ($location, $scope, $state, $stateParams, $localStorage, $ionicLoading, CalendarioService, $ionicPopup, $cordovaInAppBrowser) {

            var options = {
                location: 'no',
                clearcache: 'yes',
                toolbar: 'no'
            };

            $scope.openBrowser = function (quantidade, id_jogo) {
                $cordovaInAppBrowser.open('http://torcedordigital.com/checkout?email='
                    + $localStorage.profile.email + '&id_jogo=' + id_jogo + '&quantidade=' + quantidade, '_system', options)

                    .then(function (event) {
                        // success

                    })

                    .catch(function (event) {
                        // error
                    });

                $location.path("/page1/page2");
            }


            CalendarioService.calendario().then(
                function (success) {
                    $scope.calendario = success.data;
                    $scope.btnCompra = true;

                }, function (error) {
                    console.log(error);
                });

            $scope.checkout = function (data) {
                $localStorage.id_jogo = data.id;
                $scope.openBrowser(1, data.id);
                //$state.go("checkout");
            }

            $scope.usuario = {
                nome: $localStorage.profile.name,
                email: $localStorage.profile.email,
                telefone: null,
                cep: null,
                estado: null,
                cidade: null,
                bairro: null,
                logradouro: null,
                complemento: null,
                numero: null,
                bandeira: null,
                numero_cartao: null,
                codigo: null,
                quantidade: null,
                validade: null,
                id_jogo: $localStorage.id_jogo

            }


            $scope.comprar = function (data) {
                // Validação dos campos

                if (data.complemento == null) {
                    data.complemento = " ";
                }

                var campos = function () {
                    // Total de 14 campos, para a função retornar verdadeiro 
                    // todos deverão estar preenchidos
                    var a = 0;
                    var e = 0;
                    for (var key in data) {
                        if (data[key] == null) {
                            e += 1;
                        } else {
                            a += 1;
                        }
                    }
                    return a == 16;
                }

                if (campos()) {
                    $ionicLoading.show();
                    CalendarioService.compraIngresso(data).then(
                        function (success) {
                            $ionicLoading.hide();
                            $ionicPopup.alert({
                                title: "<b>Compra solicitada</b>",
                                content: "Obrigado por efetuar a compra com o torcedor digital! Assim que o pagamento for confirmado, seu ingresso será enviado.",
                                okType: "button-energized"
                            }).then(function (result) {
                                $location.path("/page1/page2");
                            })
                        }, function (error) {
                            console.log(error);
                            $ionicLoading.hide();
                        }
                    )
                } else {
                    $ionicPopup.alert({
                        title: "<b>Preencha todos os campos</b>",
                        content: "Há campos obrigatórios não preenchidos!",
                        okType: "button-energized"
                    })
                }

            }
        }])

    .controller('rankTorcedorDigitalCtrl', ['$state', '$scope', '$location', '$localStorage', '$stateParams', 'RankService', 'ProfileService',
        function ($state, $scope, $location, $localStorage, $stateParams, RankService, ProfileService) {

            $scope.buscaRank = function () {
                // atualizar imagem de perfil
                try {
                    if ($localStorage.profile.picture.data.url) {
                        ProfileService.salvarImg($localStorage.profile.picture.data.url, $localStorage.profile.email).then(function (data) { },
                            function (error) { })
                    }
                } catch (error) { }

                RankService.rankGeral().then(function (res) {
                    $scope.classActiveG = "tab-item active";
                    $scope.classActiveS = "tab-item ";
                    $scope.classActiveM = "tab-item ";

                    $scope.rank = res.data;



                },
                    function (error) {
                        console.log(error);
                    })

                $location.path("/page1/page4");
            }

            $scope.buscaRankSemanal = function () {

                RankService.rankSemanal().then(function (res) {
                    $scope.classActiveG = "tab-item ";
                    $scope.classActiveS = "tab-item active";
                    $scope.classActiveM = "tab-item ";

                    $scope.rank = res.data;

                },
                    function (error) {
                        console.log(error);
                    })

                $location.path("/page1/page4");

            }

            $scope.buscaRankMensal = function () {

                RankService.rankMensal().then(function (res) {
                    $scope.classActiveG = "tab-item ";
                    $scope.classActiveS = "tab-item ";
                    $scope.classActiveM = "tab-item active";

                    $scope.rank = res.data;

                },
                    function (error) {
                        console.log(error);
                    })

                $location.path("/page1/page4");

            }

            $scope.restart = function () {
                $scope.buscaRank();
            }

            $scope.buscaRank();
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
                        console.log(error.data.message);
                        $scope.error = error.data.message;
                    })

                } else {
                    $scope.error = "Há campos obrigatórios não preenchidos!";
                }

            }

        }])

    .controller('menuCtrl', ['$scope', '$stateParams', '$cordovaSocialSharing', '$localStorage', 'CrudService',
        function ($scope, $stateParams, $cordovaSocialSharing, $localStorage, CrudService) {

            $scope.exit = function () {
                window.localStorage.clear();
                ionic.Platform.exitApp();
            }

        }])

    .controller('loginCtrl', ['$scope', '$stateParams', '$location', '$localStorage', 'AuthService', '$ionicSideMenuDelegate',
        'CrudService', '$ionicLoading',
        function ($scope, $stateParams, $location, $localStorage, AuthService, $ionicSideMenuDelegate, CrudService, $ionicLoading) {

            $scope.usuario = {}
            $scope.display = "display:none";
            $scope.displayButton = "display:block";

            // desabilitando sideBar
            $ionicSideMenuDelegate.canDragContent(false);

            if ($localStorage.hasOwnProperty("profile") === true) {
                $location.path("/page1/page2");
                AuthService.authenticated().then(function (data) { },
                    function (error) {
                        var novoUsuario = {
                            nome: $localStorage.profile.name,
                            email: $localStorage.profile.email
                        }
                        $ionicLoading.show({
                            template: 'Atualizando informações do usuário...'
                        })
                        CrudService.create(novoUsuario).then(function (success) {
                            $ionicLoading.hide();
                            $location.path("/page1/page2");
                        }, function (error) {
                            $ionicLoading.hide();
                            console.log(error);
                        })
                    })

            } else {
                $location.path("/page5");
            }

            $scope.loginFacebook = function () {

                AuthService.authFacebook();

                $ionicLoading.show({
                    template: 'Aguarde, atualizando informações...',
                    duration: 5000
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

                }, function (error) {
                    console.log(error);
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
                    console.log(error);
                    $ionicLoading.hide();
                    $scope.error = error.data.message;
                    $scope.success = null;
                    $scope.usuario = {}
                })
            }

        }])

    .controller('conviteCtrl', ['$scope', '$stateParams', '$location', '$localStorage', 'AuthService', '$ionicSideMenuDelegate',
        'CrudService', '$ionicLoading', '$cordovaSocialSharing', 'CalendarioService', function ($scope, $stateParams, $location, $localStorage, AuthService, $ionicSideMenuDelegate,
            CrudService, $ionicLoading, $cordovaSocialSharing, CalendarioService) {

            $scope.shareAnywhere = function (data) {

                $cordovaSocialSharing.share("Venha fazer parte dessa torcida", "Convite Torcedor Digital", "https://scontent-gru2-1.xx.fbcdn.net/v/t1.0-9/18268178_121789138375818_1794909317763594116_n.jpg?oh=8c301b22e7296ca8250e9a7fd8da1c63&oe=59A04910", "www.torcedordigital.com");
                var compartilhar = $localStorage.profile.email != null;
                if (compartilhar) {
                    CrudService.pontuar($localStorage.profile.email).then(
                        function (success) {
                            console.log(success);
                        }, function (error) {
                            console.log(error);
                        })
                }
            }

            $scope.convidarParaJogo = function (data) {

                $cordovaSocialSharing.share("Vamos assistir esse jogaço! " + data.timeCasa + " X " + data.timeVisitante + " data: " + data.dataInicio + " Local: Arena das Dunas", data.timeCasa + " X " + data.timeVisitante + " data: " + data.dataInicio + " Local: Arena das Dunas", "https://scontent-gru2-1.xx.fbcdn.net/v/t1.0-9/18268178_121789138375818_1794909317763594116_n.jpg?oh=8c301b22e7296ca8250e9a7fd8da1c63&oe=59A04910", "Compra já o seu ingresso: www.torcedordigital.com");
                var compartilhar = $localStorage.profile.email != null;
                /*if (compartilhar) {
                    CrudService.pontuar($localStorage.profile.email).then(
                        function (success) {
                            console.log(success);
                        }, function (error) {
                            console.log(error);
                        })
                }*/

            }

            CalendarioService.calendario().then(
                function (success) {
                    $scope.calendario = success.data;
                }, function (error) {
                    console.log(error);
                });

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