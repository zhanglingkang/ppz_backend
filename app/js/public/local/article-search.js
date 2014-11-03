"use strict";
/**
 * @fileOverview article-search 需要父scope提供两个方法
 * addArticle(app)和getAddedArticle();
 */

define(function (require, exports, module) {
    var app = require("app");
    var system = require("public/local/system");
    var util = require("public/general/util");
    require("public/local/http");
    require("public/general/directive/alert");
    require("public/general/directive/tooltip");
    require("public/general/directive/pagination");
    app.directive("articleSearch", ["httpService", "$compile", "$timeout", function (httpService, $compile, $timeout) {
        return {
            restrict: "E",
            replace: true,
            transclude: true,
            scope: true,
            templateUrl: system.getTplAbsolutePath("tpl/directive/article-search.html"),
            link: function (scope, elem, attrs) {
                var $elem = $(elem);
                scope.disabled = false;//为了防止操作太频繁。操作频繁时设置表格不可交互。
                scope.searchForm = {
                    title: ""
                };
                scope.searchResult = {
                    articleList: []
                };
                scope.searchStatus = scope.SEARCH_STATUS.INIT;
                scope.$on("searchStart", function () {
                    scope.searchStatus = scope.SEARCH_STATUS.SEARCHING;
                });
                scope.$on("searchEnd", function (event, data) {
                    scope.searchStatus = scope.SEARCH_STATUS.SEARCH_SUCCESSED;
                    scope.searchResult.articleList = data.data;
                    setSelectedStatus();
                });
                scope.$on("searchFail", function () {
                    scope.searchStatus = scope.SEARCH_STATUS.SEARCH_FAILED;
                });
                scope.search = function () {
                    scope.paginationScope.searchForm = scope.searchForm;
                    scope.paginationScope.searchInterface = "article/index";
                    scope.paginationScope.goPage(1);
                };
                scope.selectArticle = function (article) {
                    scope.addArticle(article);
                };
                scope.$on("addedArticleChanged", function () {
                    setSelectedStatus();
                });
                /**
                 * 设置所有APP的选中状态
                 *
                 */
                function setSelectedStatus() {
                    scope.searchResult.articleList.forEach(function (item) {
                        if (articleIsSelected(item)) {
                            item.status = "success";
                        } else {
                            item.status = "";
                        }
                    });
                }

                /**
                 * 判断某个article是否选中
                 * @param article
                 */
                function articleIsSelected(article) {
                    return scope.getAddedArticle().some(function (item) {
                        if (article.id === item.id) {
                            return true;
                        }
                        return false;
                    });
                }
            }
        };
    }]);
});