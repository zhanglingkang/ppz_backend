"use strict";

define("boutique/slide-add/controller", [ "app", "public/local/system", "public/local/app-search", "public/local/article-search", "./service", "public/local/http", "public/general/pub-sub", "public/general/directive/preview-img", "public/general/directive/set-file", "public/general/directive/popover", "public/general/directive/trigger-click", "public/general/directive/file-required", "public/general/directive/file-type", "public/general/directive/img-size", "public/local/service", "public/general/directive/form-reset", "public/general/directive/clear-img", "public/general/directive/submitting", "article/article-create/service", "public/general/form-validation" ], function(require, exports, module) {
    var app = require("app");
    var system = require("public/local/system");
    require("public/local/app-search");
    require("public/local/article-search");
    require("./service");
    require("public/general/directive/preview-img");
    require("public/general/directive/set-file");
    require("public/general/directive/popover");
    require("public/general/directive/trigger-click");
    require("public/general/directive/file-required");
    require("public/general/directive/file-type");
    require("public/general/directive/img-size");
    require("public/local/service");
    require("public/general/directive/form-reset");
    require("public/general/directive/clear-img");
    require("public/general/directive/submitting");
    require("article/article-create/service");
    var validationUtil = require("public/general/form-validation");
    app.controller("slideAddCtrl", [ "$scope", "$routeParams", "slideAddService", "articleCreateService", "publicService", function($scope, $routeParams, slideAddService, articleCreateService, publicService) {
        var APP_DETAIL = 0;
        //表示跳转到应用详情
        var ARTICLE = 1;
        //表示跳转到文章
        $scope.needAppCount = 1;
        $scope.needArticleCount = 1;
        $scope.introduceTemplateUrl = system.getTplAbsolutePath("tpl/public/app-introduce-edit.html");
        /**
         * 提交时，检测是否有十天内添加过的app，如果有，给予提示。
         * @type {Array}
         */
        $scope.repeatedApp = [];
        $scope.showRepeatedHint = false;
        initForm();
        if ($routeParams.id && $routeParams.id != "null") {
            slideAddService.getSlideDetail($routeParams.id, function(data) {
                $scope.slideForm.id = $routeParams.id;
                $scope.slideForm.release_time = data.release_time;
                $scope.slideForm.link = data.link;
                $scope.slideForm.title = data.title;
                $scope.slide.imgUrl = data.up_file;
                if ($scope.slideForm.link == APP_DETAIL) {
                    data.applications.forEach(function(app, index) {
                        $scope.addApp(app);
                    });
                } else if ($scope.slideForm.link == ARTICLE) {
                    articleCreateService.getArticleDetail(data.article_id, function(data) {
                        $scope.addArticle(data);
                    });
                }
            });
        }
        $scope.addSlide = function(formValidation) {
            $scope.submitted = true;
            validationUtil.setFormValidataion(formValidation);
            if (formValidation.$valid && !$scope.submitting && ($scope.addedApp.length > 0 || $scope.addedArticle.length > 0)) {
                if ($scope.slideForm.link == APP_DETAIL) {
                    $scope.repeatedApp = publicService.getRepeatedApp($scope.addedApp, $scope.slideForm.release_time, "IpadBoutiqueTurnPic");
                    if ($scope.repeatedApp.length === 0) {
                        $scope.confirmSubmit();
                    } else {
                        $scope.showRepeatedHint = true;
                    }
                } else {
                    $scope.confirmSubmit();
                }
            }
        };
        $scope.confirmSubmit = function() {
            $scope.submitting = true;
            if ($scope.slideForm.link == APP_DETAIL && $scope.addedApp.length == $scope.needAppCount) {
                $scope.slideForm.applications = JSON.stringify(publicService.getApplications($scope.addedApp));
                slideAddService.addSlide($scope.slideForm, function() {
                    initForm();
                    $scope.submitting = false;
                }, function() {
                    $scope.submitting = false;
                });
            } else if ($scope.slideForm.link == ARTICLE && $scope.addedArticle.length == $scope.needArticleCount) {
                $scope.slideForm.article_id = $scope.addedArticle[0].id;
                slideAddService.addSlide($scope.slideForm, function() {
                    initForm();
                    $scope.submitting = false;
                }, function() {
                    $scope.submitting = false;
                });
            }
        };
        /**
         * @method addApp
         * @description 添加app
         * @param {Object}app
         * @param {String} app.app_id||app.appId||app.APPID
         * @return {Object} result
         *  result.success {Boolean} true表示添加成功，false表示失败
         *  result.msg {String}
         */
        $scope.addApp = function(app) {
            var appId = publicService.getAppId(app);
            $scope.$broadcast("addedAppChanging", app);
            publicService.getAppDetail(appId, "turnpic", function(appDetail) {
                $scope.addedApp[0] = appDetail;
                $scope.addedApp[0].introduce = app.summary || appDetail.APPINTRO;
                //通过编辑进入页面时，app有summary
                $scope.$broadcast("addedAppChanged", appDetail);
            });
            return {
                success: true,
                msg: ""
            };
        };
        /**
         * @param article
         * @return {Object} result
         * result.success {Boolean} true表示添加成功，false表示失败
         * result.msg {String}
         */
        $scope.addArticle = function(article) {
            $scope.addedArticle[0] = article;
            $scope.$broadcast("addedArticleChanged");
            return {
                msg: "",
                success: true
            };
        };
        $scope.deleteApp = function() {
            $scope.addedApp = [];
            $scope.$broadcast("addedAppChanged", app);
        };
        $scope.deleteArticle = function(article) {
            $scope.addedArticle = [];
            $scope.$broadcast("addedArticleChanged");
        };
        $scope.getAddedApp = function() {
            return $scope.addedApp;
        };
        $scope.getAddedArticle = function() {
            return $scope.addedArticle;
        };
        /**
         * @param {Boolean} valid表示更新简介的表单的有效性
         * @param {Scope} childScope为ng-repeat指令创建的scope
         */
        $scope.updateIntroduce = function(valid, childScope) {
            var app = childScope.app;
            childScope.introduceSubmitted = true;
            if (valid) {
                app.introduce = app.tempIntroduce;
                childScope.deletePopover = true;
                childScope.introduceSubmitted = false;
            }
        };
        $scope.$on("formReseted", function() {
            $scope.slideForm.link = APP_DETAIL;
        });
        function initForm() {
            //与表单相关的信息
            $scope.slide = {
                imgUrl: "",
                set slidePicFiles(files) {
                    $scope.slideForm.up_file = files[0];
                    $scope.$digest();
                }
            };
            $scope.formReset = true;
            $scope.imgClear = true;
            //slideForm为提交到服务器的参数
            $scope.slideForm = {
                id: "",
                release_time: "",
                //时间戳格式
                link: "",
                title: "",
                up_file: "",
                //选择的轮播图文件
                applications: "",
                //[{appid:appval;extend_end:val},{}]，
                article_id: ""
            };
            $scope.submitted = false;
            $scope.addedApp = [];
            $scope.addedArticle = [];
        }
    } ]);
});