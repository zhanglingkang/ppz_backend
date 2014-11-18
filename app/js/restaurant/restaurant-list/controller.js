"use strict";

define(function (require, exports, module) {
    var app = require("app");
    var pubSub = require("public/general/pub-sub");
    require("./service");
    require("public/general/directive/table-scroll");
    require("public/general/directive/confirm-hint");
    require("public/general/directive/tooltip");
    app.controller("restaurantListCtrl", ['$scope', "$routeParams", "publicService", "restaurantListService", function ($scope, $routeParams, publicService, restaurantListService) {
        restaurantListService.getRestaurantList().success(function (data) {
            $scope.restaurantList = data.results;
        });
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
            //$scope.paginationScope.goPage(1);
        };
        $scope.deleteRestaurant = function (restaurantId) {
            restaurantListService.deleteRestaurant(restaurantId).success(function () {
                    $scope.restaurantList = $scope.restaurantList.filter(function (restaurant) {
                        return restaurant.restaurantId !== restaurantId;
                    });
                    pubSub.publish("businessSuccess", {
                        msg: "删除成功"
                    });
                }
            );
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
        $scope.sortRestaurant = function (sortList, dragParam, dragId) {
            var data = {};
            sortList.some(function (value) {
                if (value.id === dragId) {
                    data.position = value.sort;
                    data.id = value.id;
                    return true;
                }
                return false;
            });
            restaurantListService.sortRestaurant(data, function () {
                $scope.paginationScope.goPage();
            });
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