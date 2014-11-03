"use strict";

define(function (require) {

    var app = require("app");
    require("./service");
    require("./directive");
    require("public/general/directive/view-img");
    var pubSub = require("public/general/pub-sub");
    require("public/local/http");
    require("public/general/directive/alert");
    var system = require("public/local/system");
    require("public/local/share");
    app.controller("appInfoCtrl", ["$window", "$scope", "shareDataService", "systemInfoService", "httpService", function ($window, $scope, shareDataService, systemInfoService, httpService) {
        pubSub.subscribe("serverError", function (topicInfo) {
            $scope.alertShow = true;
            $scope.alertType = "alert-danger";
            $scope.alertContent = "服务器出错啦！状态码:" + topicInfo.status + "请求接口:" + topicInfo.url;
        });
        pubSub.subscribe("jsonError", function (topicInfo) {
            $scope.alertShow = true;
            $scope.alertType = "alert-danger";
            $scope.alertContent = "服务器返回数据格式不正确！返回数据：" + topicInfo.response + ",请求接口：" + topicInfo.url;
        });
        pubSub.subscribe("businessError", function (topicInfo) {
            $scope.alertShow = true;
            $scope.alertType = "alert-danger";
            $scope.alertContent = topicInfo.title + topicInfo.msg;
        });
        pubSub.subscribe("businessSuccess", function (topicInfo) {
            $scope.alertShow = true;
            $scope.alertType = "alert-success";
            $scope.alertContent = topicInfo.title + topicInfo.msg;
        });


        $scope.name = "ppz管理系统";
        $scope.modules = [
            {
                action: "/restaurant/restaurant-list/",
                name: "餐厅管理",
                children: [
                    {
                        name: "餐厅列表",
                        action: "/restaurant/restaurant-list/"
                    },
                    {
                        name: "注册餐厅",
                        action: "/restaurant/restaurant-add/null"
                    }
                ]
            },
            {
                action: "/restaurant/restaurant-image-list/",
                name: "餐厅图片管理",
                children: [
                    {
                        name: "餐厅图片列表",
                        action: "/restaurant/restaurant-image-list/"
                    }
                ]
            },
            {
                action: "/comment/comment-list/",
                name: "评论管理",
                children: [
                    {
                        name: "评论列表",
                        action: "/comment/comment-list/"
                    }
                ]
            },
            {
                action: "/user/user-list/",
                name: "app用户管理",
                children: [
                    {
                        name: "app用户列表",
                        action: "/user/user-list/"
                    }
                ]
            },
            {
                action: "/menu/menu-list/",
                name: "菜单管理",
                children: [
                    {
                        name: "菜单列表",
                        action: "/menu/menu-list/"
                    }
                ]
            }
        ];
        $scope.logout = function () {
            systemInfoService.clearLocalUserPermission();
            systemInfoService.clearLocalUserInfo();
            $window.location.href = system.getRequestInterface("index/logout");
        };

        /**
         * 根据url得到需要显示的模块和页面
         * @param url
         */
        function getModuleAndPage(url) {
            var moduleAndPage = null;

            /**
             * 由于 轮播图页面等的action为/boutique/slide-add/null，url 部分为/boutique/slide-add/:id'
             * 为了让其匹配。判断action的最后部分是否为null，为null则去掉
             * @param action
             */
            function getHandledAction(action) {
                if (action.substring(action.length - 4, action.length) == "null") {
                    return action.substring(0, action.length - 4);
                }
                return action;
            }

            $scope.modules.some(function (module, index) {
                var moduleFinded = false;
                module.children.some(function (page, index) {
                    var pageFined = false;
                    if (url.indexOf(getHandledAction(page.action)) != -1) {
                        pageFined = true;
                        moduleFinded = true;
                        moduleAndPage = {
                            page: page,
                            module: module
                        };
                    }
                    return pageFined;
                });
                return moduleFinded;
            });
            return moduleAndPage;
        }

        /**
         * 用来监听url的变化，显示对应的模块和菜单。
         */
        $scope.$on("$locationChangeStart", function (event, newUrl, oldUrl) {
            var moduleAndPage = getModuleAndPage(newUrl);
            if (moduleAndPage) {
                $scope.modules.forEach(function (module, index) {
                    if (module.action === moduleAndPage.module.action) {
                        module.active = "active";
                        $scope.pages = module.children;
                        module.children.forEach(function (page, index) {
                            if (page.action === moduleAndPage.page.action) {
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
    }]);
});
