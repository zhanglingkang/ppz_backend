"use strict";

define(function (require, exports, module) {
    require("./service");
    var app = require("app");
    app.controller("menuListCtrl", ['$scope', "$routeParams", "publicService", "menuListService", function ($scope, $routeParams, publicService, menuListService) {
        $scope.searchForm = {
            status: "",
            title: ""
        };
        $scope.searchResult = {
            menuList: []
        };
        $scope.$on("searchStart", function () {
            $scope.searchStatus = $scope.SEARCH_STATUS.SEARCHING;
        });
        $scope.$on("searchEnd", function (event, data) {
            $scope.searchStatus = $scope.SEARCH_STATUS.SEARCH_SUCCESSED;
            $scope.searchResult.menuList = data.data;
        });
        $scope.$on("searchFail", function () {
            $scope.searchStatus = $scope.SEARCH_STATUS.SEARCH_FAILED;
        });
        $scope.search = function () {
            //$scope.paginationScope.goPage(1);
        };
        $scope.deleteMenu = function (id) {
            menuListService.deleteMenu(id, function () {
                $scope.paginationScope.goPage();
            });
        };
        $scope.importMenu = function () {
            $scope.loading = true;
            menuListService.importMenu(null, function () {
                $scope.loading = false;
            }, function () {
                $scope.loading = false;
            });
        };
        $scope.moveUp = function (id, position) {
            menuListService.moveUp(id, position, function () {
                $scope.paginationScope.goPage();
            });
        };
        $scope.moveDown = function (id, position) {
            menuListService.moveDown(id, position, function () {
                $scope.paginationScope.goPage();
            });
        };
        $scope.sortMenu = function (sortList, dragParam, dragId) {
            var data = {};
            sortList.some(function (value) {
                if (value.id === dragId) {
                    data.position = value.sort;
                    data.id = value.id;
                    return true;
                }
                return false;
            });
            menuListService.sortMenu(data, function () {
                $scope.paginationScope.goPage();
            });
        };
        /**
         * 刷新到前端
         * @param id
         * @param position
         */
        $scope.pushToFrontEnd = function (id) {
            menuListService.pushToFrontEnd(id, function () {
                $scope.paginationScope.goPage();
            });
        };
        $scope.unlock = function (id) {
            menuListService.unlock(id, function () {
                $scope.paginationScope.goPage();
            });
        };
        $scope.lockPosition = function (valid, childScope) {
            var menu = childScope.menu;
            childScope.lockPositionSubmitted = true;
            if (valid) {
                menuListService.lock(menu.id, menu.lockPosition, function () {
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