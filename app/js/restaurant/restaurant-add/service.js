"use strict";

define(function (require, exports, module) {
    var app = require("app");
    require("public/local/http");
    var pubSub = require("public/general/pub-sub");
    app.service("restaurantAddService", ["httpService", function (httpService) {
        return {
            /**
             * @param data
             * @param success
             * @param error
             */
            addTopic: function (data, success, error) {
                httpService.post({
                    r: "special/create",
                    data: data,
                    success: function (data) {
                        pubSub.publish("businessSuccess", {
                            title: "编辑专题成功!",
                            msg: ""
                        });
                        success && success(data);
                    },
                    error: function () {
                        error && error(data);
                    }
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