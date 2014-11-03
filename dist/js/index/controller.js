"use strict";

define("index/controller", [ "app", "./service", "public/general/storage", "public/local/http", "./directive", "public/general/pub-sub", "public/general/directive/alert", "public/local/system", "public/local/share" ], function(require) {
    var app = require("app");
    require("./service");
    require("./directive");
    var pubSub = require("public/general/pub-sub");
    require("public/local/http");
    require("public/general/directive/alert");
    var system = require("public/local/system");
    require("public/local/share");
    app.controller("appInfoCtrl", [ "$window", "$scope", "shareDataService", "systemInfoService", "httpService", function($window, $scope, shareDataService, systemInfoService, httpService) {
        pubSub.subscribe("serverError", function(topicInfo) {
            $scope.alertShow = true;
            $scope.alertType = "alert-danger";
            $scope.alertContent = "服务器出错啦！状态码:" + topicInfo.status + "请求接口:" + topicInfo.url;
        });
        pubSub.subscribe("jsonError", function(topicInfo) {
            $scope.alertShow = true;
            $scope.alertType = "alert-danger";
            $scope.alertContent = "服务器返回数据格式不正确！返回数据：" + topicInfo.response + ",请求接口：" + topicInfo.url;
        });
        pubSub.subscribe("businessError", function(topicInfo) {
            $scope.alertShow = true;
            $scope.alertType = "alert-danger";
            $scope.alertContent = topicInfo.title + topicInfo.msg;
        });
        pubSub.subscribe("businessSuccess", function(topicInfo) {
            $scope.alertShow = true;
            $scope.alertType = "alert-success";
            $scope.alertContent = topicInfo.title + topicInfo.msg;
        });
        $scope.name = "快用iPad版管理系统";
        $scope.version = "2.0";
        $scope.systems = [ {
            name: "快用PC端管理系统",
            action: "http://pc.kuaiyong.com/"
        } ];
        systemInfoService.getUserPermission().done(function(permission) {
            $scope.modules = permission.children;
            $scope.pages = $scope.modules[0].children;
        });
        systemInfoService.getUserInfo(function(user) {
            $scope.user = user.name;
        });
        $scope.logout = function() {
            systemInfoService.clearLocalUserPermission();
            systemInfoService.clearLocalUserInfo();
            $window.location.href = system.getRequestInterface("index/logout");
        };
        /**
         * 用来监听url的变化，显示对应的模块和菜单。
         */
        $scope.$on("$locationChangeStart", function(event, newUrl, oldUrl) {
            systemInfoService.getModuleAndPage(newUrl, function(moduleAndPage) {
                if (moduleAndPage) {
                    $scope.modules.forEach(function(module, index) {
                        if (module.id === moduleAndPage.module.id) {
                            module.active = "active";
                            $scope.pages = module.children;
                            module.children.forEach(function(page, index) {
                                if (page.id === moduleAndPage.page.id) {
                                    page.active = "active";
                                } else {
                                    page.active = "";
                                }
                            });
                        } else {
                            module.active = "";
                        }
                    });
                }
            });
        });
    } ]);
});