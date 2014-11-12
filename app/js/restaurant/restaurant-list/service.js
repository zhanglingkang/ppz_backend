"use strict";

define(function (require, exports, module) {
    var app = require("app");
    require("public/local/http");
    var pubSub = require("public/general/pub-sub");
    app.service("restaurantListService", ["httpService", function (httpService) {
        var restaurantList = [];
        return {
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
            /**
             *
             * @param {String} restaurantId
             */
            getRestaurant: function (restaurantId) {
                var result;
                restaurantList.some(function (restaurant) {
                    if (restaurantId === restaurant.restaurantId) {
                        result = restaurant;
                        return true;
                    }
                });
                return result;
            },
            importRestaurant: function (data, success, error) {
                httpService.get({
                    r: "special/import",
                    data: data,
                    success: function (data, headers) {
                        pubSub.publish("businessSuccess", {
                            title: "导入成功!",
                            msg: ""
                        });
                        success && success(data);
                    },
                    error: error
                });
            },
            deleteRestaurant: function (id, success, error) {
                var data = {
                    id: id
                };
                httpService.get({
                    r: "special/delete",
                    data: data,
                    success: function (data, headers) {
                        pubSub.publish("businessSuccess", {
                            title: "删除专题成功!",
                            msg: ""
                        });
                        success(data);
                    },
                    error: error
                });
            }

        };
    }]);
});