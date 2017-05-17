
angular.module('app.services2',[])

/*
.factory('BlankFactory', [function(){

}])
*/
	
	.service('SocketService', ['socketFactory', function(socketFactory){

	//function SocketService(socketFactory){
		return socketFactory({
			
			ioSocket: io.connect('http://torcedordigital.com:8080')

		});
	
}]);