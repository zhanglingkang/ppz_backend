"use strict";

define("boutique/article-add/controller", [ "app", "public/local/service", "./service", "public/local/http", "public/general/pub-sub", "public/general/directive/date-picker", "public/general/directive/view-img", "public/general/directive/submitting" ], function(require, exports, module) {
    var app = require("app");
    require("public/local/service");
    require("./service");
    require("public/general/directive/date-picker");
    require("public/general/directive/view-img");
    require("public/general/directive/submitting");
    app.controller("articleAddCtrl", [ "$scope", "$routeParams", "publicService", "articleAddService", function($scope, $routeParams, publicService, articleAddService) {
        initForm();
        if ($routeParams.id != "null") {
            articleAddService.getArticlePlan($routeParams.id, function(data) {
                $scope.articleForm.id = data.id;
                $scope.articleForm.release_time = data.release_time;
                articleAddService.getArticleDetail(data.article_id, function(data) {
                    $scope.addedArticle = data.data;
                });
            });
        }
        $scope.submitArticle = function(valid) {
            $scope.submitted = true;
            if (valid && $scope.addedArticle.length > 0 && !$scope.submitting) {
                $scope.confirmSubmit();
            }
        };
        $scope.confirmSubmit = function() {
            $scope.submitting = true;
            $scope.articleForm.articles = JSON.stringify(publicService.getArticles($scope.addedArticle));
            articleAddService.addArticle($scope.articleForm, function() {
                $scope.submitting = false;
                initForm();
            }, function() {
                $scope.submitting = false;
            });
        };
        $scope.deleteArticle = function(article) {
            $scope.addedArticle = $scope.addedArticle.filter(function(articleItem) {
                return articleItem.id !== article.id;
            });
            $scope.$broadcast("addedArticleChanged");
        };
        $scope.sortAddedArticle = function(sortList) {
            $scope.addedArticle = publicService.sortAddedArticle(sortList, $scope.addedArticle);
        };
        /**
         * @param article
         * @return {Object} result
         *  result.success {Boolean} true表示添加成功，false表示失败
         *  result.msg {String}
         */
        $scope.addArticle = function(article) {
            if (!publicService.contains(article, $scope.addedArticle)) {
                $scope.addedArticle.push(article);
            }
            $scope.$broadcast("addedArticleChanged");
            return {
                success: true,
                msg: ""
            };
        };
        $scope.getAddedArticle = function() {
            return $scope.addedArticle;
        };
        function initForm() {
            $scope.addedArticle = [];
            $scope.submitted = false;
            $scope.articleForm = {
                id: "",
                release_time: "",
                articles: ""
            };
        }
    } ]);
});