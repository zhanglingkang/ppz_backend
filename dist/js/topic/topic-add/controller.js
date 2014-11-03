"use strict";

define("topic/topic-add/controller", [ "app", "public/local/app-search", "./service", "public/local/http", "public/general/pub-sub", "public/general/directive/preview-img", "public/general/directive/set-file", "public/general/directive/popover", "public/general/directive/file-required", "public/general/directive/file-type", "public/general/directive/img-size", "public/local/service", "public/general/directive/submitting", "public/general/form-validation", "public/general/directive/form-reset" ], function(require, exports, module) {
    var app = require("app");
    require("public/local/app-search");
    require("./service");
    require("public/general/directive/preview-img");
    require("public/general/directive/set-file");
    require("public/general/directive/popover");
    require("public/general/directive/file-required");
    require("public/general/directive/file-type");
    require("public/general/directive/img-size");
    require("public/local/service");
    require("public/general/directive/submitting");
    var validationUtil = require("public/general/form-validation");
    require("public/general/directive/form-reset");
    app.controller("topicAddCtrl", [ "$scope", "$routeParams", "topicAddService", "publicService", function($scope, $routeParams, topicAddService, publicService) {
        initForm();
        if ($routeParams.id != "null") {
            topicAddService.getTopicDetail($routeParams.id, function(data) {
                $scope.topicForm.id = $routeParams.id;
                $scope.topicForm.title = data.title;
                $scope.topicForm.introduce = data.introduce;
                $scope.topic.indexPicUrl = data.index_pic;
                $scope.topic.bannerUrl = data.banner;
                $scope.topic.backgroundUrl = data.background;
                data.applications.forEach(function(app, index) {
                    $scope.addApp(app);
                });
            });
        }
        $scope.addTopic = function(formValidation) {
            $scope.submitted = true;
            validationUtil.setFormValidataion(formValidation);
            if (formValidation.$valid && $scope.addedApp.length > 0 && !$scope.publishing) {
                $scope.publishing = true;
                $scope.topicForm.applications = JSON.stringify(getApplications());
                topicAddService.addTopic($scope.topicForm, function() {
                    initForm();
                    $scope.publishing = false;
                }, function() {
                    $scope.publishing = false;
                });
            }
        };
        $scope.saveToDraft = function(formValidation) {
            $scope.submitted = true;
            validationUtil.setFormValidataion(formValidation);
            if (formValidation.$valid && $scope.addedApp.length > 0 && !$scope.saving) {
                $scope.saving = true;
                $scope.topicForm.applications = JSON.stringify(getApplications());
                $scope.topicForm.status = 3;
                topicAddService.addTopic($scope.topicForm, function() {
                    initForm();
                    $scope.saving = false;
                }, function() {
                    $scope.saving = false;
                });
            }
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
            publicService.getAppDetail(publicService.getAppId(app), "", function(appDetail) {
                $scope.addedApp[appIndex] = appDetail;
                $scope.$broadcast("addedAppChanged", appDetail);
            });
            return {
                success: true,
                msg: ""
            };
        };
        $scope.deleteApp = function(app) {
            $scope.addedApp = $scope.addedApp.filter(function(addedApp) {
                return addedApp.APPID !== app.APPID;
            });
        };
        $scope.getAddedApp = function() {
            return $scope.addedApp;
        };
        function initForm() {
            //与表单相关的信息
            $scope.topic = {
                indexPicUrl: "",
                bannerUrl: "",
                backgroundUrl: "",
                set indexPicFiles(files) {
                    $scope.topicForm.index_pic = files[0];
                    $scope.$digest();
                },
                set bannerFiles(files) {
                    $scope.topicForm.banner = files[0];
                    $scope.$digest();
                },
                set backgroundFiles(files) {
                    $scope.topicForm.background = files[0];
                    $scope.$digest();
                }
            };
            //topicForm为提交到服务器的参数
            $scope.topicForm = {
                id: "",
                title: "",
                introduce: "",
                index_pic: "",
                //File对象 专题大图
                banner: "",
                //专题内图
                background: "",
                //专题底图
                applications: "",
                //[{appid:appval;extend_end:val},{}]，
                status: ""
            };
            $scope.submitted = false;
            $scope.addedApp = [];
            $scope.formReset = true;
            $scope.imgClear = true;
        }
        /**
         * 根据$scope.addedApp得到需要提交的applications
         * @return {Array} applications
         */
        function getApplications() {
            var applications = [];
            $scope.addedApp.forEach(function(app) {
                applications.push({
                    app_id: app.APPID,
                    summary: app.introduce
                });
            });
            return applications;
        }
    } ]);
});