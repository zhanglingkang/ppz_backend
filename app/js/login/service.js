"use strict";

define(function (require, exports, module) {
    var app = require("app");
    var storage = require("public/general/storage");
    require("public/local/http");
    app.service("loginService", ["httpService", "$cookies", function (httpService, $cookies) {
        return {
            login: function (userName, password) {
                return  httpService.post({
                    command: "login",
                    data: {
                        userId: userName, password: password
                    }
                }).success(function (data) {
                    var token = data.results[0].sessionId;
                    $cookies.token = token;
                    $cookies.username = username;
                }).error(function () {
                    $cookies.token = null;
                });
            }
        }
    }]);
});