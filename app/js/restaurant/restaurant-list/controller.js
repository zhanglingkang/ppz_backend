"use strict";

define(function (require, exports, module) {
    var app = require("app");
    var pubSub = require("public/general/pub-sub");
    require("./service");
    require("public/general/directive/table-scroll");
    require("public/general/directive/confirm-hint");
    require("public/general/directive/tooltip");
    require("public/general/directive/full-tr");
    require("./directive");
    var restaurantListCtrl = ['$scope', "$routeParams", "$modal", "publicService", "restaurantListService", "userListService", function ($scope, $routeParams, $modal, publicService, restaurantListService, userListService) {
        var userIdChange = false;

        function loadRestaurantList() {
            $scope.loadRestaurantListStatus = $scope.REQUEST_STATUS.ING;
            restaurantListService.getRestaurantList().success(function (data) {
                $scope.restaurantList = data.results;
                $scope.loadRestaurantListStatus = $scope.REQUEST_STATUS.SUCCESSED;
            }).error(function () {
                $scope.loadRestaurantListStatus = $scope.REQUEST_STATUS.FAILED;
            });
        }

        loadRestaurantList();
        $scope.userId = "";
        $scope.restaurantName = "";
        $scope.search = function () {
            $scope.searchForm.name = $scope.restaurantName;
            $scope.searchByUserId();
        };
        $scope.$watch("userId", function (newValue) {
            userIdChange = true;
        });
        $scope.searchByUserId = function () {
            if (userIdChange) {
                userIdChange = false;
                if ($scope.userId) {
                    restaurantListService.searchByUserId($scope.userId).success(function (data) {
                        $scope.restaurantList = data.results;
                    });
                } else {
                    loadRestaurantList();
                }
            }
        };
        $scope.searchResult = {
            restaurantList: []
        };
        $scope.searchForm = {
            name: ""//餐厅名称
        };
        $scope.showUserList = false;
        $scope.assignedUser = {};
        $scope.selectUser = function (user) {
            $scope.assignedUser = user;
        };

        userListService.getUserList().success(function (data) {
            $scope.userList = data.results;
        }).error(function () {
        });
        $scope.selectRestaurant = function (restaurant) {
            $scope.assignedRestaurant = restaurant;
            $scope.assignedUser = {};
            $scope.showUserList = true;
            $scope.wantAssign = false;
        };
        $scope.viewRestaurantAdmin = function (restaurant) {
            var modalInstance = $modal.open({
                templateUrl: "restaurant-admin-list.html",
                controller: "restaurantAdminListCtrl",
//                backdrop: false,
                resolve: {
                    restaurant: function () {
                        return angular.copy(restaurant);
                    }
                }
            });
        };
        $scope.assignUser = function () {
            $scope.wantAssign = true;
            if ($scope.assignedUser.userId) {
                restaurantListService.assignManagingRestaurantToUser($scope.assignedUser.userId, $scope.assignedRestaurant.restaurantId).success(function () {
                    $scope.showUserList = false;
                });
            }
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
    }];
    var restaurantAdminListCtrl = ['$scope', 'restaurantListService', '$modalInstance', 'restaurant', function ($scope, restaurantListService, $modalInstance, restaurant) {
        $scope.loadAdminListStatus = $scope.REQUEST_STATUS.ING;
        $scope.restaurantAdminList = [];
        restaurantListService.getRestaurantAdmin(restaurant.restaurantId).success(function (data) {
            $scope.restaurantAdminList = data.results;
            $scope.loadAdminListStatus = $scope.REQUEST_STATUS.SUCCESSED;
        }).error(function () {
            $scope.loadAdminListStatus = $scope.REQUEST_STATUS.FAILED;
        });
        $scope.removeManagingRestaurantFromUser = function (user) {
            restaurantListService.removeManagingRestaurantFromUser(user.userId, restaurant.restaurantId).success(function () {
                $scope.restaurantAdminList = $scope.restaurantAdminList.filter(function (item) {
                    return item.userId !== user.userId;
                })
            });
        };
    }];
    app.controller("restaurantListCtrl", restaurantListCtrl);
    app.controller("restaurantAdminListCtrl", restaurantAdminListCtrl);
});