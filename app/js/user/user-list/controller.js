"use strict";

define(function (require, exports, module) {
    require("./service");
    var app = require("app");
    app.controller("userListCtrl", ['$scope', "$routeParams", "publicService", "userListService", function ($scope, $routeParams, publicService, userListService) {
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
        $scope.deleteUser = function (id) {
            userListService.deleteUser(id, function () {
                $scope.paginationScope.goPage();
            });
        };
        $scope.importUser = function () {
            $scope.loading = true;
            userListService.importUser(null, function () {
                $scope.loading = false;
            }, function () {
                $scope.loading = false;
            });
        };
        $scope.moveUp = function (id, position) {
            userListService.moveUp(id, position, function () {
                $scope.paginationScope.goPage();
            });
        };
        $scope.moveDown = function (id, position) {
            userListService.moveDown(id, position, function () {
                $scope.paginationScope.goPage();
            });
        };
        $scope.sortUser = function (sortList, dragParam, dragId) {
            var data = {};
            sortList.some(function (value) {
                if (value.id === dragId) {
                    data.position = value.sort;
                    data.id = value.id;
                    return true;
                }
                return false;
            });
            userListService.sortUser(data, function () {
                $scope.paginationScope.goPage();
            });
        };
        /**
         * 刷新到前端
         * @param id
         * @param position
         */
        $scope.pushToFrontEnd = function (id) {
            userListService.pushToFrontEnd(id, function () {
                $scope.paginationScope.goPage();
            });
        };
        $scope.unlock = function (id) {
            userListService.unlock(id, function () {
                $scope.paginationScope.goPage();
            });
        };
        $scope.lockPosition = function (valid, childScope) {
            var user = childScope.user;
            childScope.lockPositionSubmitted = true;
            if (valid) {
                userListService.lock(user.id, user.lockPosition, function () {
                    $scope.paginationScope.goPage();
                    childScope.deletePopover = true;
                    childScope.lockPositionSubmitted = false;
                });
            }
        };
//        $scope.$watch("paginationScope", function () {
//            if ($scope.paginationScope) {
//                $scope.paginationScope.searchForm = $scope.searchForm;
//                $scope.paginationScope.searchInterface = "special/index";
//                $scope.paginationScope.goPage(1);
//            }
//        });
    }]);
});