const SERVIDOR = "http://torcedordigital.com";
//const SERVIDOR = "http://10.0.0.106:8080";

angular.module('app.services', [])

    .factory('BlankFactory', [function () {

    }])

    .service('RankService', ['$http',
        function ($http) {

            var service = {
                rankGeral: function () {
                    var settings = {
                        method: 'GET',
                        url: SERVIDOR + '/api/rank',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }
                    return $http(settings)
                },
                rankSemanal: function () {
                    var settings = {
                        method: 'GET',
                        url: SERVIDOR + '/api/rankSemanal',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }
                    return $http(settings)
                },
                rankMensal: function () {
                    var settings = {
                        method: 'GET',
                        url: SERVIDOR + '/api/rankMensal',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }
                    return $http(settings)
                }
            }

            return service;

        }])

    .service('AcessTokem', [function () {

        var access_token = {
            access: function (storege, http) {

                http.get("https://graph.facebook.com/oauth/access_token", {
                    params: {
                        grant_type: "fb_exchange_token",
                        client_id: "1312201258817812",
                        client_secret: "f01dfe25d356bab41cd707697548c8f0",
                        fb_exchange_token: 'EAASpcKnn2RQBAN0voiadx87pPNAaMhguZAqWT3U3OKlIHGZB1esijK4Raz4nlozjmbr0xc0W3ZBhV2iQfhZCusvVPjVfde0EOC4Rq7eC0ZBldCVwh6U2vdQoJMAZBdPSTThNabvrADHFjmKLTltkQF5HsCUScyIl0ZD',
                        format: "json"
                    }
                }).then(function (result) {
                    storege.accessTokenTD = result.data.access_token;

                }, function (error) {

                    console.log(error);
                });
            }
        }
        return access_token;
    }])

    .service('ProfileService', ['$http', '$cordovaOauth', '$localStorage', '$location', function ($http, $cordovaOauth, $localStorage, $location) {

        var profile = {
            /**
            * metodo para solicitação do perfil do usuário no Facebook
            */
            profile: function () {
                if ($localStorage.hasOwnProperty("accessToken") === true) {
                    $http.get("https://graph.facebook.com/v2.9/me", { params: { access_token: $localStorage.accessToken, fields: "id,name,gender, email, location,website,picture,relationship_status", format: "json" } })
                        .then(function (result) {
                            return result.data;
                        },
                        function (error) {

                            console.log(error);
                        });
                } else {
                    alert("Not signed in");
                    $location.path("/page1/page2");
                }
            },

            salvarImg: function (local, email) {

                var settings = {
                    method: 'POST',
                    url: SERVIDOR + '/api/upload/salvarNoBanco',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    transformRequest: function (obj) {
                        var str = [];
                        for (var p in obj)
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        return str.join("&");
                    },
                    data: { local: local, email: email }
                }
                return $http(settings);
            }
        };

        return profile;
    }])

    .service('AuthService', ['$http', '$cordovaOauth', '$localStorage', '$location',
        function ($http, $cordovaOauth, $localStorage, $location) {

            var service = {
                /**
                * metodo para verificar se usuario está autenticado
                */
                authenticated: function () {
                    var settings = {
                        method: 'GET',
                        url: SERVIDOR + '/api/existe?email=' + $localStorage.profile.email,
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }
                    return $http(settings);
                },

                /**
                * servico de autenticação no servidor
                */
                authServidor: function (usuario) {

                    var settings = {
                        method: 'POST',
                        url: SERVIDOR + '/api/login',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        transformRequest: function (obj) {
                            var str = [];
                            for (var p in obj)
                                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                            return str.join("&");
                        },
                        data: { email: usuario.email, senha: usuario.senha }
                    }

                    return $http(settings);
                },
                /**
                * serviço de autenticação no facebook
                * metodo complexo pois envolve varias etapas ***
                */
                authFacebook: function () {
                    // antenticação do facebook
                    $cordovaOauth.facebook("1312201258817812", ["email", "read_stream", "user_website",
                        "user_location", "user_relationships", "user_posts", "publish_pages", "user_friends", "user_relationship_details", "user_relationships", "user_videos", "pages_messaging", "user_actions.news", "user_actions.video"])
                        .then(function (result) {
                            $localStorage.accessToken = result.access_token;
                            // busca do perfil do usuario no facebook
                            $http.get("https://graph.facebook.com/v2.9/me", { params: { access_token: $localStorage.accessToken, fields: "id, name, gender, email, location, website,picture, relationship_status", format: "json" } })
                                .then(function (r) {
                                    if (r != null) {
                                        $localStorage.username = r.data.name;
                                        $localStorage.profile = r.data;
                                        // busca do perfil no servidor (Torcedor Digital)
                                        if ($localStorage.profile.email) {
                                            var settings = {
                                                method: 'GET',
                                                url: SERVIDOR + '/api/existe?email=' + $localStorage.profile.email,
                                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                                            }
                                            $http(settings).then(function (data) {
                                                $location.path("/page1/page2");
                                            }, function (error) {
                                                // caso não exista no servidor criar novo usuario
                                                console.log("criar um novo usuario no servidor ...");
                                                var request = {
                                                    method: 'POST',
                                                    url: SERVIDOR + '/api/cadastrarUsuarioByFacebook',
                                                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                                    transformRequest: function (obj) {
                                                        var str = [];
                                                        for (var p in obj)
                                                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                                                        return str.join("&");
                                                    },
                                                    data: {
                                                        nome: $localStorage.profile.name,
                                                        // por enquanto que aws nao libera enviar pro meu email
                                                        //  e-mail destino --> cleiton2281@gmail.com
                                                        email: $localStorage.profile.email
                                                    }
                                                }
                                                $http(request).then(function (data) {
                                                    console.log("Novo usuário criado com sucesso!");
                                                    $location.path("/page1/page2");
                                                }, function (error) {
                                                    console.log(error);
                                                })
                                            })
                                        }
                                    }
                                })

                        }, function (error) {
                            console.log(error);
                        })

                },
            }

            return service;
        }])

    .service('CrudService', ['$http', '$cordovaOauth', '$localStorage', '$location', function ($http, $cordovaOauth, $localStorage, $location) {

        var service = {

            convite: function (convidado) {
                var settings = {
                    method: 'GET',
                    url: SERVIDOR + '/api/convite?convidado=' + convidado.nome + "&emailConvidado=" + convidado.email + "&usuarioNome=" + $localStorage.profile.name,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }

                return $http(settings);
            },

            recSenha: function (usuario) {
                var settings = {
                    method: 'GET',
                    url: SERVIDOR + '/api/recuperarSenha?email=' + usuario.email,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }

                return $http(settings);
            },

            find: function (usuario) {
                var settings = {
                    method: 'GET',
                    url: SERVIDOR + '/api/existe',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    transformRequest: function (obj) {
                        var str = [];
                        for (var p in obj)
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        return str.join("&");
                    },
                    data: {
                        email: usuario.email
                    }
                }

                return $http(settings);
            },
            pontuar: function (email) {
                var settings = {
                    method: 'GET',
                    url: SERVIDOR + '/api/pontuarPorConvite?email=' + email,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }

                return $http(settings);
            },

            create: function (usuario) {
                var settings = {
                    method: 'POST',
                    url: SERVIDOR + '/api/cadastrarUsuarioByFacebook',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    transformRequest: function (obj) {
                        var str = [];
                        for (var p in obj)
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        return str.join("&");
                    },
                    data: {
                        nome: usuario.nome,
                        sobreNome: usuario.sobreNome,
                        email: usuario.email,
                        senha: usuario.senha
                    }
                }

                return $http(settings);
            }


        }

        return service;
    }]);