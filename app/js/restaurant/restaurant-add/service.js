"use strict";

define(function (require, exports, module) {
    var app = require("app");
    require("public/local/http");
    var pubSub = require("public/general/pub-sub");
    app.service("restaurantAddService", ["httpService", function (httpService) {
        return {
            /**
             * @param {Object} restaurantForm
             */
            addRestaurant: function (restaurantForm) {
                return httpService.post({
                    command: "createRestaurant",
                    data: restaurantForm
                });
            },
            modifyRestaurant: function (restaurantForm) {
                return httpService.post({
                    command: "modifyRestaurant",
                    data: restaurantForm
                });
            },
            getTopicDetail: function (id, success, error) {
                var data = {
                    id: id
                };
                httpService.get({
                    r: "special/edit",
                    data: data,
                    success: function (data) {
                        success(data);
                    },
                    error: error
                });
            }
        }
    }]);
});