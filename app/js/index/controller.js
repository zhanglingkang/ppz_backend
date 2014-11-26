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
    app.controller("appInfoCtrl", ["$window", "$scope", "$cookies", "shareDataService", "systemInfoService", "httpService", function ($window, $scope, $cookies, shareDataService, systemInfoService, httpService) {
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
            topicInfo.title = topicInfo.title || "温馨提示";
            topicInfo.title = topicInfo.title + "：";
            $scope.alertContent = topicInfo.title + topicInfo.msg;
        });
        pubSub.subscribe("businessSuccess", function (topicInfo) {
            $scope.alertShow = true;
            $scope.alertType = "alert-success";
            topicInfo.title = topicInfo.title || "温馨提示";
            topicInfo.title = topicInfo.title + "：";
            $scope.alertContent = topicInfo.title + topicInfo.msg;
        });
        $scope.isLogin = function () {
            return !!($cookies.token && $cookies.token !== "null");
        };
        $scope.loginTemplate = seajs.data.cwd + "tpl/login.html";
        $scope.getUserName = function () {
            return $scope.isLogin() ? $cookies.username : "";
        };
        /**
         * 任何一个请求都有四种状态：INIT 尚未请求 REQUESTING 请求中 REQUEST_SUCCESSED 请求成功 REQUEST_FAILED 请求失败
         */
        $scope.REQUEST_STATUS = {
            INIT: 0,
            ING: 1,
            SUCCESSED: 2,
            FAILED: 3
        };
        $scope.KEY_CODE = {
            ENTER: 13,
            BACKSPACE: 8,
            TOP: 38,
            RIGHT: 39,
            BOTTOM: 40,
            LEFT: 37
        };
        $scope.MODE = {
            EDIT: 1,
            ADD: 2
        };
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
                    },
                    {
                        name: "注册餐厅管理员",
                        action: "/restaurant/restaurant-admin-add/null"
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
                    },
                    {
                        name: "app用户信息修改",
                        action: "/user/user-add/null"
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
            delete $cookies.token;
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
