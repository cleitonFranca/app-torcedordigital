angular.module('app.serviceCalendario', [])


    .service('CalendarioService', ['$http', function ($http) {
        const SERVIDOR = "http://torcedordigital.com";
        //const SERVIDOR = "http://10.0.0.106:8080";

        var service = {
            calendario: function () {
                var settings = {
                    method: 'GET',
                    url: SERVIDOR + '/api/calendario',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }
                return $http(settings);
            }
        }

        return service;

    }])