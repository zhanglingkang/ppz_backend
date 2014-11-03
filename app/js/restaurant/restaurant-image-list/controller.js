"use strict";

define(function (require, exports, module) {
    require("./service");
    var app = require("app");
    app.controller("restaurantImageListCtrl", ['$scope', "$routeParams", "publicService", "restaurantImageListService", function ($scope, $routeParams, publicService, restaurantImageListService) {
        $scope.searchForm = {
            status: "",
            title: ""
        };
        $scope.searchResult = {
            restaurantImageList: []
        };
        $scope.$on("searchStart", function () {
            $scope.searchStatus = $scope.SEARCH_STATUS.SEARCHING;
        });
        $scope.$on("searchEnd", function (event, data) {
            $scope.searchStatus = $scope.SEARCH_STATUS.SEARCH_SUCCESSED;
            $scope.searchResult.restaurantImageList = data.data;
        });
        $scope.$on("searchFail", function () {
            $scope.searchStatus = $scope.SEARCH_STATUS.SEARCH_FAILED;
        });
        $scope.search = function () {
            //$scope.paginationScope.goPage(1);
        };
        $scope.deleteRestaurantImage = function (id) {
            restaurantImageListService.deleteRestaurantImage(id, function () {
                $scope.paginationScope.goPage();
            });
        };
        $scope.importRestaurantImage = function () {
            $scope.loading = true;
            restaurantImageListService.importRestaurantImage(null, function () {
                $scope.loading = false;
            }, function () {
                $scope.loading = false;
            });
        };
        $scope.moveUp = function (id, position) {
            restaurantImageListService.moveUp(id, position, function () {
                $scope.paginationScope.goPage();
            });
        };
        $scope.moveDown = function (id, position) {
            restaurantImageListService.moveDown(id, position, function () {
                $scope.paginationScope.goPage();
            });
        };
        $scope.sortRestaurantImage = function (sortList, dragParam, dragId) {
            var data = {};
            sortList.some(function (value) {
                if (value.id === dragId) {
                    data.position = value.sort;
                    data.id = value.id;
                    return true;
                }
                return false;
            });
            restaurantImageListService.sortRestaurantImage(data, function () {
                $scope.paginationScope.goPage();
            });
        };
        /**
         * 刷新到前端
         * @param id
         * @param position
         */
        $scope.pushToFrontEnd = function (id) {
            restaurantImageListService.pushToFrontEnd(id, function () {
                $scope.paginationScope.goPage();
            });
        };
        $scope.unlock = function (id) {
            restaurantImageListService.unlock(id, function () {
                $scope.paginationScope.goPage();
            });
        };
        $scope.lockPosition = function (valid, childScope) {
            var restaurantImage = childScope.restaurantImage;
            childScope.lockPositionSubmitted = true;
            if (valid) {
                restaurantImageListService.lock(restaurantImage.id, restaurantImage.lockPosition, function () {
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