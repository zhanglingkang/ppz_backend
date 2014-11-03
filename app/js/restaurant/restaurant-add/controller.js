"use strict";

define(function (require, exports, module) {
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
    app.controller("restaurantAddCtrl", ['$scope', "$routeParams", "restaurantAddService", "publicService", function ($scope, $routeParams, restaurantAddService, publicService) {
        initForm();
        if ($routeParams.id != "null") {

        }
        $scope.addRestaurant = function (formValidation) {
            $scope.submitted = true;
            validationUtil.setFormValidataion(formValidation);
            if (formValidation.$valid && $scope.addedApp.length > 0 && !$scope.publishing) {

            }
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
                index_pic: "",//File对象 专题大图
                banner: "",//专题内图
                background: "",//专题底图
                applications: "",//[{appid:appval;extend_end:val},{}]，
                status: ""//3 表示草稿
            };
            $scope.submitted = false;
            $scope.addedApp = [];
            $scope.formReset = true;
            $scope.imgClear = true;
        }
    }]);
});