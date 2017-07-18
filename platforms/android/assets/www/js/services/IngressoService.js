angular.module('app.serviceIngresso', [])


    .service('IngressoService', ['$http', function ($http) {
       // const SERVIDOR = "http://torcedordigital.com";
        const SERVIDOR = "http://10.0.0.106:8080";

        var service = {
            calendario: function () {
                var settings = {
                    method: 'GET',
                    url: SERVIDOR + '/api/calendario',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }
                return $http(settings);
            },
            compraIngresso: function (data) {
                var settings = {
                    method: 'POST',
                    url: SERVIDOR + '/api/checkout',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    transformRequest: function (obj) {
                        var str = [];
                        for (var p in obj)
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        return str.join("&");
                    },
                    data: { 
                        nome: data.nome, 
                        email: data.email, 
                        telefone: data.telefone,
                        cep: data.cep,
                        estado: data.estado,
                        cidade: data.cidade,
                        bairro: data.bairro,
                        logradouro: data.logradouro,
                        complemento: data.complemento,
                        numero: data.numero,
                        bandeira: data.bandeira,
                        numero_cartao: data.numero_cartao,
                        codigo: data.codigo,
                        validade: data.validade,
                        quantidade: data.quantidade,
                        id_jogo: data.id_jogo 
                    }
                }

                return $http(settings);
            },
            
            buscaIngresso: function(email) {
                var settings = {
                    method: 'GET',
                    url: SERVIDOR + '/api/ingressos?email='+email
                }
                return $http(settings);
            }
        }

        return service;

    }])