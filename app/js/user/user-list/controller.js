"use strict";

define(function (require, exports, module) {
    require("./service");
    var app = require("app");
    app.controller("userListCtrl", ['$scope', "$routeParams", "publicService", "userListService", function ($scope, $routeParams, publicService, userListService) {

        userListService.getUserList().success(function (data) {
            $scope.userList = data.results;
        });
        $scope.searchForm = {
            status: "",
            title: ""
        };
        $scope.searchResult = {
            userList: []
        };
        $scope.$on("searchStart", function () {
            $scope.searchStatus = $scope.SEARCH_STATUS.SEARCHING;
        });
        $scope.$on("searchEnd", function (event, data) {
            $scope.searchStatus = $scope.SEARCH_STATUS.SEARCH_SUCCESSED;
            $scope.searchResult.userList = data.data;
        });
        $scope.$on("searchFail", function () {
            $scope.searchStatus = $scope.SEARCH_STATUS.SEARCH_FAILED;
        });
        $scope.search = function () {
            $scope.paginationScope.goPage(1);
        };
        $scope.disableUser = function (user) {
            userListService.disableUser(user.userId).success(function () {
                $scope.userList = $scope.userList.filter(function (item) {
                    return item.userId != user.userId;
                });
            })
        };
        $scope.enableUser = function (user) {
            userListService.enableUser(user.userId).success(function () {
                $scope.userList.forEach(function (item) {
                    //item.
                });
            })
        }

//        $scope.$watch("paginationScope", function () {
//            if ($scope.paginationScope) {
//                $scope.paginationScope.searchForm = $scope.searchForm;
//                $scope.paginationScope.searchInterface = "special/index";
//                $scope.paginationScope.goPage(1);
//            }
//        });
    }]);
});