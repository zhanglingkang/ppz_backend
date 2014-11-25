"use strict";

define(function (require, exports, module) {
    var app = require("app");
    var pubSub = require("public/general/pub-sub");
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
    app.controller("userAddCtrl", ['$scope', '$location', "$routeParams", "userAddService", "userListService", "publicService", function ($scope, $location, $routeParams, userAddService, userListService, publicService) {
        initForm();
        if ($routeParams.id != "null") {
            $scope.mode = $scope.MODE.EDIT;
            userListService.getUser($routeParams.id).success(function (data) {
                $scope.user = data.results[0];
                angular.forEach($scope.userForm, function (value, key) {
                    $scope.userForm[key] = $scope.user[key];
                });
            });
        }
        $scope.addStatus = $scope.REQUEST_STATUS.INIT;
        $scope.modifyUser = function () {
            userAddService.modifyUser($scope.userForm).success(function () {
                $scope.addStatus = $scope.REQUEST_STATUS.SUCCESSED;
                pubSub.publish("businessSuccess", {
                    msg: "用户信息修改成功"
                });
                $location.path("/user/user-list/");
            }).error(function (data) {
                $scope.addStatus = $scope.REQUEST_STATUS.FAILED;
            });
        };
        $scope.addUser = function (valid) {
            $scope.submitted = true;
            if (valid) {
                if ($scope.mode === $scope.MODE.ADD) {
                    $scope.addStatus = $scope.REQUEST_STATUS.ING;
                    userAddService.addUser($scope.userForm).success(function () {
                        $scope.addStatus = $scope.REQUEST_STATUS.SUCCESSED;
                        pubSub.publish("businessSuccess", {
                            msg: "餐厅注册成功"
                        });
                        $location.path("/user/user-list/");
                    }).error(function (data) {
                        $scope.addStatus = $scope.REQUEST_STATUS.FAILED;
                    });
                } else {
                    $scope.modifyUser();
                }
            }
        };
        $scope.useUserThumbnailPicture = function () {
            $scope.wantUploadThumbnail = true;
            if (validateFile()) {
                $scope.pictureForm.pictureType = "thumbnail";
                userAddService.uploadPictures($scope.pictureForm).then(function (data) {
                    return userAddService.useUserThumbnailPicture(
                        $scope.userForm.userId,
                        data.results[0].pictureId
                    )
                }).then(function (data) {
                    pubSub.publish("businessSuccess", {
                        msg: "餐厅小图标修改成功"
                    });
                });
            }
        };
        $scope.useUserPosterPicture = function () {
            $scope.wantUploadPoster = true;
            if (validateFile()) {
                $scope.pictureForm.pictureType = "poster";
                userAddService.uploadPictures($scope.pictureForm).then(function (data) {
                    return userAddService.useUserPosterPicture(
                        $scope.userForm.userId,
                        data.results[0].pictureId
                    )
                }).then(function (data) {
                    pubSub.publish("businessSuccess", {
                        msg: "餐厅大图标修改成功"
                    });
                });
            }
        };
        $scope.$watch("userForm.userId", function (newValue) {
            $scope.pictureForm.userId = newValue;
        });
        function validateFile() {
            if ($scope.pictureForm.file && /image/.test($scope.pictureForm.file.type)) {
                return true;
            }
        }

        function initForm() {
            $scope.__defineSetter__("pictureFiles", function (value) {
                $scope.pictureForm.file = value[0];
            });
            $scope.pictureForm = {
                userId: "",
                file: "",
                pictureComment: "",
                pictureType: ""
            };
            //与表单相关的信息
            $scope.userForm = {
                name: "",
                userId: "",
                email: "",
                phone: ""
            };
            $scope.submitted = false;
            $scope.typeInfoScopeList = [];
            $scope.mode = $scope.MODE.ADD;
        }
    }]);
});