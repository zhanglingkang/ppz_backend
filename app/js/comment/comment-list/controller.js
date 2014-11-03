"use strict";

define(function (require, exports, module) {
    require("./service");
    var app = require("app");
    app.controller("commentListCtrl", ['$scope', "$routeParams", "publicService", "commentListService", function ($scope, $routeParams, publicService, restaurantListService) {
        $scope.searchForm = {
            status: "",
            title: ""
        };
        $scope.searchResult = {
            restaurantList: []
        };
        $scope.$on("searchStart", function () {
            $scope.searchStatus = $scope.SEARCH_STATUS.SEARCHING;
        });
        $scope.$on("searchEnd", function (event, data) {
            $scope.searchStatus = $scope.SEARCH_STATUS.SEARCH_SUCCESSED;
            $scope.searchResult.restaurantList = data.data;
        });
        $scope.$on("searchFail", function () {
            $scope.searchStatus = $scope.SEARCH_STATUS.SEARCH_FAILED;
        });
        $scope.search = function () {
//            $scope.paginationScope.goPage(1);
        };
        $scope.deleteComment = function (id) {
            restaurantListService.deleteComment(id, function () {
                $scope.paginationScope.goPage();
            });
        };
        $scope.importComment = function () {
            $scope.loading = true;
            restaurantListService.importComment(null, function () {
                $scope.loading = false;
            }, function () {
                $scope.loading = false;
            });
        };
        $scope.moveUp = function (id, position) {
            restaurantListService.moveUp(id, position, function () {
                $scope.paginationScope.goPage();
            });
        };
        $scope.moveDown = function (id, position) {
            restaurantListService.moveDown(id, position, function () {
                $scope.paginationScope.goPage();
            });
        };
        $scope.sortComment = function (sortList, dragParam, dragId) {
            var data = {};
            sortList.some(function (value) {
                if (value.id === dragId) {
                    data.position = value.sort;
                    data.id = value.id;
                    return true;
                }
                return false;
            });
            restaurantListService.sortComment(data, function () {
                $scope.paginationScope.goPage();
            });
        };
        /**
         * 刷新到前端
         * @param id
         * @param position
         */
        $scope.pushToFrontEnd = function (id) {
            restaurantListService.pushToFrontEnd(id, function () {
                $scope.paginationScope.goPage();
            });
        };
        $scope.unlock = function (id) {
            restaurantListService.unlock(id, function () {
                $scope.paginationScope.goPage();
            });
        };
        $scope.lockPosition = function (valid, childScope) {
            var restaurant = childScope.restaurant;
            childScope.lockPositionSubmitted = true;
            if (valid) {
                restaurantListService.lock(restaurant.id, restaurant.lockPosition, function () {
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