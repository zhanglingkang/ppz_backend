"use strict";

define(function (require, exports, module) {
    var app = require("app");
    require("public/local/http");
    var pubSub = require("public/general/pub-sub");
    app.service("userListService", ["httpService", function (httpService) {
        return {
            getUserList: function () {
                return httpService.post({
                    command: "getUsersInfo",
                    data: {
                        start: 1,
                        length: -1
                    }
                }).success(function (data) {
                });
            },
            deleteUser: function (id, success, error) {
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