"use strict";

define("article/article-create/controller", [ "app", "public/local/service", "./service", "public/local/http", "public/general/pub-sub", "public/general/directive/editor", "public/general/directive/date-picker", "public/general/directive/view-img", "public/general/directive/drag-sort", "public/general/directive/submitting", "public/general/form-validation" ], function(require, exports, module) {
    var app = require("app");
    require("public/local/service");
    require("./service");
    require("public/general/directive/editor");
    require("public/general/directive/date-picker");
    require("public/general/directive/view-img");
    require("public/general/directive/drag-sort");
    require("public/general/directive/submitting");
    var validationUtil = require("public/general/form-validation");
    app.controller("articleCreateCtrl", [ "$scope", "$routeParams", "publicService", "articleCreateService", function($scope, $routeParams, publicService, articleCreateService) {
        initForm();
        if ($routeParams.id != "null") {
            articleCreateService.getArticleDetail($routeParams.id, function(data) {
                $scope.articleForm.id = data.id;
                $scope.articleForm.content = data.content;
                $scope.articleForm.release_time = data.release_time;
                $scope.articleForm.source = data.source;
                $scope.articleForm.text = data.text;
                $scope.articleForm.title = data.title;
                $scope.articleForm.type = data.type;
                $scope.articleForm.priority_etime = data.priority_etime;
                $scope.articleForm.priority_stime = data.priority_stime;
                $scope.article.isTop = publicService.isTop(data) ? 1 : 0;
                $scope.articleForm.first_pic = $scope.article.imgUrl = data.up_file;
                data.applications.forEach(function(app, index) {
                    $scope.addApp(app);
                });
            });
        }
        $scope.addArticle = function(formValidation) {
            var applications;
            $scope.submitted = true;
            validationUtil.setFormValidataion(formValidation);
            //虽然现在不限制必须选择app。预防以后文章需要限制app的数量
            if (formValidation.$valid && $scope.addedApp.length > -1 && !$scope.submitting) {
                $scope.submitting = true;
                if ($scope.article.isTop == 0) {
                    $scope.articleForm.priority_stime = $scope.articleForm.priority_etime = "";
                }
                //如果是编辑操作而且上传了新图片
                if ($scope.articleForm.id && $scope.articleForm.up_file) {
                    $scope.articleForm.first_pic = "";
                }
                $scope.articleForm.applications = JSON.stringify(publicService.getApplications($scope.addedApp));
                articleCreateService.addArticle($scope.articleForm, function() {
                    initForm();
                    $scope.submitting = false;
                }, function() {
                    $scope.submitting = false;
                });
            }
        };
        $scope.sortAddedApp = function(sortList) {
            $scope.addedApp = publicService.sortAddedApp(sortList, $scope.addedApp);
        };
        $scope.deleteApp = function(app) {
            $scope.addedApp = $scope.addedApp.filter(function(addedApp) {
                return addedApp.APPID !== app.APPID;
            });
        };
        /**
         * @param app
         * @return {Object} result
         *  result.success {Boolean} true表示添加成功，false表示失败
         *  result.msg {String}
         */
        $scope.addApp = function(app) {
            var appIndex = $scope.addedApp.length;
            if (publicService.isAdded(app, $scope.addedApp)) {
                return {
                    success: false,
                    msg: "此app已经添加过"
                };
            }
            $scope.addedApp.push(app);
            $scope.$broadcast("addedAppChanging", app);
            publicService.getAppDetail(publicService.getAppId(app), "article", function(appDetail) {
                $scope.addedApp[appIndex] = appDetail;
                $scope.$broadcast("addedAppChanged", appDetail);
            });
            return {
                success: true,
                msg: ""
            };
        };
        $scope.getAddedApp = function() {
            return $scope.addedApp;
        };
        function initForm() {
            $scope.addedApp = [];
            $scope.submitted = false;
            $scope.article = {
                imgUrl: ""
            };
            $scope.articleForm = {
                id: "",
                release_time: "",
                title: "",
                type: "testing",
                content: "article",
                source: "",
                up_file: "",
                first_pic: "",
                text: "",
                priority_etime: "",
                priority_stime: "",
                applications: ""
            };
            $scope.formReset = true;
            $scope.imgClear = true;
            $scope.article = {
                set firstPicFiles(files) {
                    $scope.$apply(function() {
                        $scope.articleForm.up_file = files[0];
                    });
                },
                isTop: 0
            };
        }
    } ]);
});