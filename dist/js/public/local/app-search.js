"use strict";

/**
 * @fileOverview app-search 需要父scope提供两个方法
 * addApp(app)和getAddedApp();
 */
define("public/local/app-search", [ "app", "public/local/system", "public/general/util", "public/local/http", "public/general/directive/alert", "public/general/directive/pagination" ], function(require, exports, module) {
    var app = require("app");
    var system = require("public/local/system");
    var util = require("public/general/util");
    require("public/local/http");
    require("public/general/directive/alert");
    require("public/general/directive/pagination");
    app.directive("appSearch", [ "httpService", "$compile", "$timeout", function(httpService, $compile, $timeout) {
        return {
            restrict: "E",
            replace: true,
            transclude: true,
            scope: true,
            templateUrl: system.getTplAbsolutePath("tpl/directive/app-search.html"),
            link: function(scope, elem, attrs) {
                var $elem = $(elem);
                scope.alertShow = false;
                scope.alertType = "alert-danger";
                scope.disabled = false;
                //为了防止操作太频繁。操作频繁时设置表格不可交互。
                scope.search = {
                    method: "APPNAME",
                    keywords: "",
                    status: "1"
                };
                scope.filter = {
                    range: "s_newapp",
                    date_limit: 0,
                    neworupd: 0,
                    page_size: 50,
                    status: 1,
                    app_tag: 0,
                    sign: ""
                };
                scope.searchResult = {
                    apps: []
                };
                scope.searchStatus = scope.SEARCH_STATUS.INIT;
                scope.$on("searchStart", function() {
                    scope.searchStatus = scope.SEARCH_STATUS.SEARCHING;
                });
                scope.$on("searchEnd", function(event, data) {
                    scope.searchStatus = scope.SEARCH_STATUS.SEARCH_SUCCESSED;
                    scope.searchResult.apps = data.apps;
                    setSelectedStatus();
                });
                scope.$on("searchFail", function() {
                    scope.searchStatus = scope.SEARCH_STATUS.SEARCH_FAILED;
                });
                scope.searchApp = function() {
                    scope.paginationScope.searchForm = scope.search;
                    scope.paginationScope.searchInterface = "searchApp/search";
                    scope.paginationScope.goPage(1);
                    scope.setPanelOpen();
                };
                scope.filterApp = function() {
                    scope.paginationScope.searchForm = scope.filter;
                    scope.paginationScope.searchInterface = "searchApp/filter";
                    scope.paginationScope.goPage(1);
                    scope.setPanelOpen();
                };
                scope.selectApp = function(app) {
                    var result;
                    if (!scope.disabled) {
                        //防止其篡改app的属性
                        result = scope.addApp(util.clone(app));
                        //调用原型对象的addApp方法
                        if (!result.success) {
                            scope.alertContent = "添加失败：" + result.msg;
                            scope.alertShow = true;
                        }
                    } else {
                        scope.alertContent = "获取详情中,不要急";
                        scope.alertShow = true;
                    }
                };
                /**
                 * 设置面板处于展开状态
                 */
                scope.setPanelOpen = function() {
                    scope.hide = "";
                };
                /**
                 * 设置面板处于关闭状态
                 */
                scope.setPanelClose = function() {
                    scope.hide = "hide";
                };
                scope.$watch("hide", function() {
                    if (scope.hide === "hide") {
                        scope.open = "btn-default";
                        scope.close = "btn-success";
                    } else {
                        scope.open = "btn-success";
                        scope.close = "btn-default";
                    }
                });
                scope.setPanelClose();
                scope.$on("addedAppChanging", function() {
                    scope.disabled = true;
                });
                scope.$on("addedAppChanged", function() {
                    scope.disabled = false;
                    setSelectedStatus();
                });
                /**
                 * 设置所有APP的选中状态
                 *
                 */
                function setSelectedStatus() {
                    scope.searchResult.apps.forEach(function(item) {
                        if (appIsSelected(item)) {
                            item.status = "success";
                        } else {
                            item.status = "";
                        }
                    });
                }
                /**
                 * 判断某个app是否选中
                 * @param app
                 */
                function appIsSelected(app) {
                    return scope.getAddedApp().some(function(item) {
                        if (app.APPID === item.APPID) {
                            return true;
                        }
                        return false;
                    });
                }
            }
        };
    } ]);
});