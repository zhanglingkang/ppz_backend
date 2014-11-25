"use strict";

define(function (require) {
    var app = require("app");
    require("./service");
    app.controller("loginCtrl", [ "$scope", "$location", "loginService", function ($scope, $location, loginService) {
        $scope.loginStatus = $scope.REQUEST_STATUS.INIT;
        $scope.login = function (valid) {
            $scope.submitted = true;
            if (valid) {
                $scope.loginHintShow = true;
                $scope.loginStatus = $scope.REQUEST_STATUS.ING;
                loginService.login($scope.userName, $scope.password).then(
                    function (result) {
                        $scope.loginStatus = $scope.REQUEST_STATUS.SUCCESSED;
                        console.log("login result " + result);
                        $location.path("/restaurant/restaurant-list/");
                    }, function (result) {
                        $scope.loginStatus = $scope.REQUEST_STATUS.FAILED;
                        console.log("login failed " + result);
                    }
                );
            }
        };
    }]);
});
