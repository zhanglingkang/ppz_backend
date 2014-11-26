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
    app.controller("restaurantAdminAddCtrl", ['$scope', '$location', "$routeParams", "restaurantAdminAddService", "publicService", function ($scope, $location, $routeParams, restaurantAdminAddService, publicService) {
        initForm();
        if ($routeParams.id != "null") {
            $scope.mode = $scope.MODE.EDIT;
            restaurantAdminListService.getRestaurantAdmin($routeParams.id).then(function (data) {
                var restaurantAdminAdmin = data.results[0];
                $scope.restaurantAdminAdmin = restaurantAdminAdmin;
                angular.forEach($scope.restaurantAdminForm, function (value, key) {
                    var object;
                    var property;
                    if (/\./.test(key)) {
                        object = key.substring(0, key.indexOf("."));
                        property = key.substring(key.indexOf(".") + 1);
                        $scope.restaurantAdminForm[key] = restaurantAdminAdmin[object][property];
                    } else if (key == "latitude") {
                        $scope.restaurantAdminForm[key] = restaurantAdminAdmin.address.location[1];
                    } else if (key == "longitude") {
                        $scope.restaurantAdminForm[key] = restaurantAdminAdmin.address.location[0];
                    } else {
                        $scope.restaurantAdminForm[key] = restaurantAdminAdmin[key];
                    }
                });
            });
        }
        $scope.addStatus = $scope.REQUEST_STATUS.INIT;
        $scope.modifyRestaurantAdmin = function () {
            restaurantAdminAddService.modifyRestaurantAdmin($scope.restaurantAdminForm).success(function () {
                $scope.addStatus = $scope.REQUEST_STATUS.SUCCESSED;
                pubSub.publish("businessSuccess", {
                    msg: "餐厅信息修改成功"
                });
            }).error(function (data) {
                $scope.addStatus = $scope.REQUEST_STATUS.FAILED;
            });
        };
        $scope.addRestaurantAdmin = function (valid) {
            $scope.submitted = true;
            if (valid && $scope.restaurantAdminForm.againPassword === $scope.restaurantAdminForm.password) {
                if ($scope.mode === $scope.MODE.ADD) {
                    $scope.addStatus = $scope.REQUEST_STATUS.ING;
                    restaurantAdminAddService.addRestaurantAdmin($scope.restaurantAdminForm).success(function () {
                        $scope.addStatus = $scope.REQUEST_STATUS.SUCCESSED;
                        pubSub.publish("businessSuccess", {
                            msg: "餐厅管理员注册成功"
                        });
                        $location.path("/restaurant/restaurant-admin-add/null");
                    }).error(function (data) {
                        $scope.addStatus = $scope.REQUEST_STATUS.FAILED;
                    });
                } else {
                    $scope.modifyRestaurantAdmin();
                }
            }
        };
        $scope.useRestaurantAdminThumbnailPicture = function () {
            $scope.wantUploadThumbnail = true;
            if (validateFile()) {
                $scope.pictureForm.pictureType = "thumbnail";
                restaurantAdminAddService.uploadPictures($scope.pictureForm).then(function (data) {
                    return restaurantAdminAddService.useRestaurantAdminThumbnailPicture(
                        $scope.restaurantAdminForm.restaurantAdminId,
                        data.results[0].pictureId
                    )
                }).then(function (data) {
                    pubSub.publish("businessSuccess", {
                        msg: "餐厅小图标修改成功"
                    });
                });
            }
        };
        $scope.useRestaurantAdminPosterPicture = function () {
            $scope.wantUploadPoster = true;
            if (validateFile()) {
                $scope.pictureForm.pictureType = "poster";
                restaurantAdminAddService.uploadPictures($scope.pictureForm).then(function (data) {
                    return restaurantAdminAddService.useRestaurantAdminPosterPicture(
                        $scope.restaurantAdminForm.restaurantAdminId,
                        data.results[0].pictureId
                    )
                }).then(function (data) {
                    pubSub.publish("businessSuccess", {
                        msg: "餐厅大图标修改成功"
                    });
                });
            }
        };
        function initForm() {
            $scope.restaurantAdminForm = {
                name: "",
                userId: "",
                password: "",
                againPassword: "",
                email: "",
                phone: "",
                userType: 1
//                restaurantId: "TGIF"
            };
            $scope.submitted = false;
            $scope.mode = $scope.MODE.ADD;
        }
    }]);
});