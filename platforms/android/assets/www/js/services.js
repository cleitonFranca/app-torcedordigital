angular.module('app.services', [])

.factory('BlankFactory', [function(){

}])


.service('AcessTokem', [function(){
    var access_token =  {
        access: function(storege, http) {
            if(storege.hasOwnProperty("accessTokenTD") === true) {
                http.get("https://graph.facebook.com/oauth/access_token", {
                params: { 
                    grant_type: "fb_exchange_token",
                    client_id: "1312201258817812",
                    client_secret: "f01dfe25d356bab41cd707697548c8f0",
                    fb_exchange_token: storege.accessTokenTD, 
                    format: "json" }}).then(function(result) {
                        storege.accessTokenTD = result.data.access_token;
                     
                    }, function(error) {
                       
                        console.log(error);
                    });

            } else {
            
                http.get("https://graph.facebook.com/oauth/access_token", {
                    params: { 
                        grant_type: "fb_exchange_token",
                        client_id: "1312201258817812",
                        client_secret: "f01dfe25d356bab41cd707697548c8f0",
                        fb_exchange_token: "EAASpcKnn2RQBAOOOijAhWaOMzV0aZBinAgQoeaKeeJHsukrl0fMBv9aiBZBfd2tQLdmDZAAswyBTTARq8g4lSMhpfHhiP4cZC8bPGUSp3iuogv5MUabzFriGsgx1ZAeGhhRiZBkQBlBZBCZBQc6hZBcA5MbVWt4tQaCUZD", 
                        format: "json" }}).then(function(result) {
                        storege.accessTokenTD = result.data.access_token;
                        
                        }, function(error) {
                            
                            console.log(error);
                        });
            }
        }
    }
    return access_token;
}])

.service('ProfileService', ['$http', '$cordovaOauth', '$localStorage','$location', function($http, $cordovaOauth, $localStorage, $location) {
  
    var profile = {
        /**
        * metodo para solicitação do perfil do usuário no Facebook
        */
        profile: function() {
            if($localStorage.hasOwnProperty("accessToken") === true) {
                 $http.get("https://graph.facebook.com/v2.9/me", { params: { access_token: $localStorage.accessToken, fields: "id,name,gender, email, location,website,picture,relationship_status", format: "json" }})
                 .then(function(result) {
                    return result.data;
                }, 
                function(error) {
                    
                    console.log(error);
                });
            } else {
                alert("Not signed in");
                $location.path("/page1/page2");
            }           
        },
    };

   return profile;
}])

.service('AuthService', ['$http', '$cordovaOauth', '$localStorage','$location', 
function($http, $cordovaOauth, $localStorage, $location) {
    
    var servicos = {
        /**
        * metodo para verificar se usuario está autenticado
        */
        authenticated: function() {    
            if($localStorage.hasOwnProperty("accessToken") === true) {
                return true;
            }
            return false;  
        },

        /**
        * servico de autenticação no servidor
        */     
        auth: function(){
        },
        /**
        * serviço de autenticação no facebook
        */
        authFacebook: function() {
            if($localStorage.hasOwnProperty("accessToken") === true) {
                return true;
            }
            $cordovaOauth.facebook("1312201258817812", ["email", "read_stream", "user_website",            
                    "user_location", "user_relationships", "user_posts", "publish_pages", "user_friends", "user_relationship_details", "user_relationships", "user_videos", "pages_messaging", "user_actions.news", "user_actions.video"])
                    .then(function(result) {
                       
                        $localStorage.accessToken = result.access_token;
                        $location.path("/page1/page2");
                    }, function(error) {
                        console.log(error);
                        return false;
                    })
        },
    };

   return servicos;
    
    

}]);