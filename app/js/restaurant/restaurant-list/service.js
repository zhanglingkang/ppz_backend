"use strict";

define(function (require, exports, module) {
    var app = require("app");
    require("public/local/http");
    var pubSub = require("public/general/pub-sub");
    app.service("restaurantListService", ["httpService", function (httpService) {
        var restaurantList = [];
        return {
            searchByUserId: function (userId) {
                return httpService.post({
                    command: "getManagingResturantByUser",
                    data: {
                        name: userId
                    }
                }).success(function (data) {
                    restaurantList = data.results;
                });
            },
            getRestaurantList: function () {
                return httpService.post({
                    command: "getRestaurantInfoList",
                    data: {
                        start: 1,
                        length: -1
                    }
                }).success(function (data) {
                    restaurantList = data.results;
                });
            },
            searchRestaurantList: function (restaurantName) {
                return httpService.post({
                    command: "searchRestaurantByName",
                    data: {
                        name: restaurantName
                    }
                }).success(function (data) {
                    restaurantList = data.results;
                });
            },
            /**
             *
             * @param {String} restaurantId
             */
            getRestaurant: function (restaurantId) {
                return httpService.post({
                    command: "getRestaurantInfoById",
                    data: {
                        restaurantId: restaurantId
                    }
                }).success(function (data) {
                });
            },
            getRestaurantAdmin: function (restaurantId) {
                return httpService.post({
                    command: "getRestaurantAdmins",
                    data: {
                        restaurantId: restaurantId
                    }
                }).success(function (data) {
                });
            },
            removeManagingRestaurantFromUser: function (userId, restaurantId) {
                return httpService.post({
                    command: "removeManagingRestaurantFromUser",
                    data: {
                        restaurantId: restaurantId,
                        userId: userId
                    }
                }).success(function (data) {
                    pubSub.publish("businessSuccess", {
                        msg: "解除成功！"
                    });
                });
            },
            /**
             * @param {String} userId
             * @param {String} restaurantId
             */
            assignManagingRestaurantToUser: function (userId, restaurantId) {
                return httpService.post({
                    command: "assignManagingRestaurantToUser",
                    data: {
                        restaurantId: restaurantId,
                        userId: userId
                    }
                }).success(function (data) {
                    pubSub.publish("businessSuccess", {
                        msg: "指派用户成功"
                    });
                });
            },
            /**
             *
             * @param {String} restaurantId
             */
            deleteRestaurant: function (restaurantId) {
                return httpService.post({
                    command: "disableRestaurant",
                    data: {
                        restaurantId: restaurantId
                    }
                }).success(function (data) {
                });
            }

        };
    }]);
});