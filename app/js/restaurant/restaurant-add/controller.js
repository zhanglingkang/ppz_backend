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
    app.controller("restaurantAddCtrl", ['$scope', '$location', "$routeParams", "restaurantAddService", "restaurantListService", "publicService", function ($scope, $location, $routeParams, restaurantAddService, restaurantListService, publicService) {
        initForm();
        if ($routeParams.id != "null") {
            $scope.mode = $scope.MODE.EDIT;
            restaurantListService.getRestaurant($routeParams.id).then(function (data) {
                var restaurant = data.results[0];
                $scope.restaurant = restaurant;
                angular.forEach($scope.restaurantForm, function (value, key) {
                    var object;
                    var property;
                    if (/\./.test(key)) {
                        object = key.substring(0, key.indexOf("."));
                        property = key.substring(key.indexOf(".") + 1);
                        $scope.restaurantForm[key] = restaurant[object][property];
                    } else if (key == "latitude") {
                        $scope.restaurantForm[key] = restaurant.address.location[1];
                    } else if (key == "longitude") {
                        $scope.restaurantForm[key] = restaurant.address.location[0];
                    } else {
                        $scope.restaurantForm[key] = restaurant[key];
                    }
                });
                $scope.restaurantForm["phone.number"] = restaurant.phone.phone;
            });
        }
        $scope.addStatus = $scope.REQUEST_STATUS.INIT;
        $scope.addTypeInfo = function () {
            $scope.restaurantForm.partyTypeInfos.push({
                partyTypeDescription: "",
                unitIdPrefix: ""
            });
        };
        $scope.addTypeInfoScope = function (typeInfoScope) {
            $scope.typeInfoScopeList.push(typeInfoScope);
        };
        $scope.removeTypeInfo = function (typeInfo) {
            $scope.restaurantForm.partyTypeInfos = $scope.restaurantForm.partyTypeInfos.filter(function (item) {
                return item != typeInfo;
            });
        };
        $scope.modifyRestaurant = function () {
            restaurantAddService.modifyRestaurant($scope.restaurantForm).success(function () {
                $scope.addStatus = $scope.REQUEST_STATUS.SUCCESSED;
                pubSub.publish("businessSuccess", {
                    msg: "餐厅信息修改成功"
                });
            }).error(function (data) {
                $scope.addStatus = $scope.REQUEST_STATUS.FAILED;
            });
        };
        $scope.addRestaurant = function (valid) {
            $scope.submitted = true;
            $scope.typeInfoScopeList.some(function (typeInfoScope) {
                if (typeInfoScope.typeInfoFormValidation.$invalid) {
                    valid = false;
                    return true;
                }
            });
            if (valid) {
                if ($scope.mode === $scope.MODE.ADD) {
                    delete $scope.restaurantForm.latitude;
                    delete $scope.restaurantForm.longitude;
                    $scope.addStatus = $scope.REQUEST_STATUS.ING;
                    restaurantAddService.addRestaurant($scope.restaurantForm).success(function () {
                        $scope.addStatus = $scope.REQUEST_STATUS.SUCCESSED;
                        pubSub.publish("businessSuccess", {
                            msg: "餐厅注册成功"
                        });
                        $location.path("/restaurant/restaurant-list/");
                    }).error(function (data) {
                        $scope.addStatus = $scope.REQUEST_STATUS.FAILED;
                    });
                } else {
                    $scope.modifyRestaurant();
                }
            }
        };
        $scope.useRestaurantThumbnailPicture = function () {
            $scope.wantUploadThumbnail = true;
            if (validateFile()) {
                $scope.pictureForm.pictureType = "thumbnail";
                restaurantAddService.uploadPictures($scope.pictureForm).then(function (data) {
                    return restaurantAddService.useRestaurantThumbnailPicture(
                        $scope.restaurantForm.restaurantId,
                        data.results[0].pictureId
                    )
                }).then(function (data) {
                    pubSub.publish("businessSuccess", {
                        msg: "餐厅小图标修改成功"
                    });
                });
            }
        };
        $scope.useRestaurantPosterPicture = function () {
            $scope.wantUploadPoster = true;
            if (validateFile()) {
                $scope.pictureForm.pictureType = "poster";
                restaurantAddService.uploadPictures($scope.pictureForm).then(function (data) {
                    return restaurantAddService.useRestaurantPosterPicture(
                        $scope.restaurantForm.restaurantId,
                        data.results[0].pictureId
                    )
                }).then(function (data) {
                    pubSub.publish("businessSuccess", {
                        msg: "餐厅大图标修改成功"
                    });
                });
            }
        };
        $scope.$watch("restaurantForm.restaurantId", function (newValue) {
            $scope.pictureForm.restaurantId = newValue;
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
                restaurantId: "",
                file: "",
                pictureComment: "",
                pictureType: ""
            };
            //与表单相关的信息
            $scope.restaurantForm = {
                name: "",
                //"phone.country":null,
                //"phone.area":703,
                "phone.number": "",
                //"phone.extension":null,
                restaurantId: "",
                email: "",
                website: "",
                restaurantDescription: "",
                imageLinkThumbnail: "",
                imageLinkPoster: "",
                "address.street": "",
                "address.street2": "",
                "address.city": "",
                "address.state": "",
                "address.zipcode": "",
                latitude: "",
                longitude: "",
                pointOfContactName: "",
                pointOfContactPhone: "",
                legalPersonName: "",
                legalPersonPhone: "",
                partyTypeInfos: [

                ]
            };
            $scope.submitted = false;
            $scope.typeInfoScopeList = [];
            $scope.mode = $scope.MODE.ADD;
        }
    }]);
});