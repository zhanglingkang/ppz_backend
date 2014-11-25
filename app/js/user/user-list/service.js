"use strict";

define(function (require, exports, module) {
    var app = require("app");
    require("public/local/http");
    var pubSub = require("public/general/pub-sub");
    app.service("userListService", ["httpService", function (httpService) {
        var userList;
        return {
            getUserList: function () {
                return httpService.post({
                    command: "getUsersInfo",
                    data: {
                        start: 1,
                        length: -1
                    }
                }).success(function (data) {
                    userList = data.results;
                });
            },
            getUser: function (userId) {
                return httpService.post({
                    command: "getSingleUserInfo",
                    data: {
                        userId: userId
                    }
                }).success(function (data) {

                });
            },
            disableUser: function (userId) {
                return httpService.post({
                    command: "disableUser",
                    data: {
                        userId: userId
                    }
                }).success(function (data) {
                    pubSub.publish("businessSuccess", {
                        msg: "禁用成功！"
                    });
                })
            },
            enableUser: function (userId) {
                return httpService.post({
                    command: "enableUser",
                    data: {
                        userId: userId
                    }
                }).success(function (data) {
                });
            }

        };
    }]);
});