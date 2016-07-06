/*global angular */
'use strict';
angular.module('app2', ['ngAnimate','cgBusyPlus'])
.value('cgBusyPlusDefaults', {
    backdrop: true,
    delay: 300,
    message: 'Please wait...',
    templateUrl: 'custom-cgbusyplus-template.html',
    wrapperClass: 'cg-busy-plus cg-busy-plus-animation fixed-center'
});

angular.module('app2').controller('DemoCtrlSettingDefaults',function($scope,$http){

  $scope.delay = 0;
  $scope.minDuration = 0;
  $scope.message = 'Please Wait...';
  $scope.backdrop = true;
  $scope.promise = null;

  $scope.demo = function(){

    $scope.promise = $http.get('http://httpbin.org/delay/3');

  };


});
