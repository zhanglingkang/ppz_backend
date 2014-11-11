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
    app.controller("restaurantAddCtrl", ['$scope', "$routeParams", "restaurantAddService", "restaurantListService", "publicService", function ($scope, $routeParams, restaurantAddService, restaurantListService, publicService) {
        initForm();
        if ($routeParams.id != "null") {
            (function () {
                var restaurant = restaurantListService.getRestaurant($routeParams.id);
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
            }());
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
        $scope.addRestaurant = function (valid) {
            $scope.submitted = true;
            $scope.typeInfoScopeList.some(function (typeInfoScope) {
                if (typeInfoScope.typeInfoFormValidation.$invalid) {
                    valid = false;
                    return true;
                }
            });
            if (valid) {

                $scope.addStatus = $scope.REQUEST_STATUS.ING;
                if ($scope.restaurantForm.restaurantId) {
                    restaurantAddService.modifyRestaurant($scope.restaurantForm).success(function () {
                        $scope.addStatus = $scope.REQUEST_STATUS.SUCCESSED;
                        pubSub.publish("businessSuccess", {
                            title: "提示",
                            msg: "餐厅注册成功"
                        });
                    }).error(function (data) {
                        $scope.addStatus = $scope.REQUEST_STATUS.FAILED;
                    });
                } else {
                    restaurantAddService.addRestaurant($scope.restaurantForm).success(function () {
                        $scope.addStatus = $scope.REQUEST_STATUS.SUCCESSED;
                        pubSub.publish("businessSuccess", {
                            title: "提示",
                            msg: "餐厅注册成功"
                        });
                    }).error(function (data) {
                        $scope.addStatus = $scope.REQUEST_STATUS.FAILED;
                    });
                }
            }
        };

        function initForm() {
            //与表单相关的信息
            $scope.restaurantForm = {
                name: "",
                //"phone.country":null,
                //"phone.area":703,
                //"phone.number":5527382,
                //"phone.extension":null,
//                restaurantId: Date.now(),
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
                partyTypeInfos: [

                ]
            };
            $scope.submitted = false;
            $scope.typeInfoScopeList = [];
        }
    }]);
});