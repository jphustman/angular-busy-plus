/*global angular */
'use strict';
angular.module('app', ['ngAnimate','cgBusyPlus']);

angular.module('app')

.controller('DemoCtrl', [
    '$scope',
    '$http',
    function(
      $scope,
      $http
    ) {

      $scope.delay = 0;
      $scope.minDuration = 0;
      $scope.message = 'Please Wait...';
      $scope.backdrop = true;
      $scope.promise = null;

      $scope.demo = function(){
        $scope.promise = $http.get('http://httpbin.org/delay/3');
      };


}]);
