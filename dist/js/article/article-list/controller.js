"use strict";

define("article/article-list/controller", [ "app", "public/general/date-util", "public/local/service", "./service", "public/local/http", "public/general/pub-sub", "public/general/directive/tooltip" ], function(require, exports, module) {
    var app = require("app");
    var dateUtil = require("public/general/date-util");
    require("public/local/service");
    require("./service");
    require("public/general/directive/tooltip");
    app.controller("articleListCtrl", [ "$scope", "$routeParams", "publicService", "articleListService", function($scope, $routeParams, publicService, articleListService) {
        $scope.searchForm = {
            title: ""
        };
        $scope.searchResult = {
            articleList: []
        };
        $scope.searchStatus = $scope.SEARCH_STATUS.INIT;
        $scope.$on("searchStart", function(event, data) {
            $scope.searchStatus = $scope.SEARCH_STATUS.SEARCHING;
        });
        $scope.$on("searchEnd", function(event, data) {
            $scope.searchStatus = $scope.SEARCH_STATUS.SEARCH_SUCCESSED;
            $scope.searchResult.articleList = data.data;
            $scope.searchResult.articleList.forEach(function(value, index) {
                value.isTop = publicService.isTop(value);
            });
        });
        $scope.$on("searchFail", function() {
            $scope.searchStatus = $scope.SEARCH_STATUS.SEARCH_FAILED;
        });
        $scope.search = function() {
            $scope.paginationScope.goPage(1);
        };
        $scope.deleteArticle = function(id) {
            articleListService.deleteArticle(id, function() {
                $scope.paginationScope.goPage();
            });
        };
        $scope.cancelTop = function(articleId) {
            articleListService.cancelTop(articleId, function() {
                $scope.paginationScope.goPage();
            });
        };
        $scope.toTopArticle = function(valid, articleScope) {
            articleScope.submitted = true;
            var article;
            if (valid) {
                article = articleScope.article;
                articleListService.toTopArticle(article.id, article.priority_stime, article.priority_etime, function() {
                    articleScope.deletePopover = true;
                    $scope.paginationScope.goPage();
                });
            }
        };
        $scope.$watch("paginationScope", function() {
            if ($scope.paginationScope) {
                $scope.paginationScope.searchForm = $scope.searchForm;
                $scope.paginationScope.searchInterface = "article/index";
                $scope.paginationScope.goPage(1);
            }
        });
    } ]);
});