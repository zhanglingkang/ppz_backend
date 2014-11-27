"use strict";

define(function (require, exports, module) {
    var app = require("app");
    var storage = require("public/general/storage");
    require("public/local/http");
    app.service("loginService", ["httpService", "$cookies", function (httpService, $cookies) {
        return {
            login: function (userName, password) {
                return  httpService.post({
                    command: "loginAdmin",
                    data: {
                        userId: userName, password: password
                    }
                }).success(function (data) {
                    var token = data.results[0].sessionId;
                    $cookies.token = token;
                    $cookies.username = userName;
                }).error(function () {
                    $cookies.token = null;
                });
            }
        }
    }]);
});