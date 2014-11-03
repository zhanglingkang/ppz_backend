"use strict";

define("boutique/icon-add/controller", [ "app", "public/general/pub-sub", "public/local/service", "./service", "public/local/http", "public/general/directive/drag-sort", "public/general/directive/submitting" ], function(require, exports, module) {
    var app = require("app");
    var pubSub = require("public/general/pub-sub");
    require("public/local/service");
    require("./service");
    require("public/general/directive/drag-sort");
    require("public/general/directive/submitting");
    app.controller("iconAddCtrl", [ "$scope", "$routeParams", "publicService", "iconAddService", function($scope, $routeParams, publicService, iconAddService) {
        $scope.needAppCount = 7;
        /**
         * 提交时，检测是否有十天内添加过的app，如果有，给予提示。
         * @type {Array}
         */
        $scope.repeatedApp = [];
        $scope.showRepeatedHint = false;
        initForm();
        if ($routeParams.id != "null") {
            iconAddService.getIconDetail($routeParams.id, function(data) {
                $scope.iconForm.id = $routeParams.id;
                $scope.iconForm.release_time = data.release_time;
                data.applications.forEach(function(app, index) {
                    $scope.addApp(app);
                });
            });
        }
        $scope.addIcon = function(valid) {
            $scope.submitted = true;
            if (valid && $scope.addedApp.length >= 1 && !$scope.submitting) {
                $scope.repeatedApp = publicService.getRepeatedApp($scope.addedApp, $scope.iconForm.release_time, "IpadBoutiqueIconApp");
                if ($scope.repeatedApp.length === 0) {
                    $scope.confirmSubmit();
                } else {
                    $scope.showRepeatedHint = true;
                }
            }
        };
        $scope.confirmSubmit = function() {
            $scope.submitting = true;
            $scope.iconForm.applications = JSON.stringify(publicService.getApplications($scope.addedApp));
            iconAddService.addIcon($scope.iconForm, function() {
                initForm();
                $scope.submitting = false;
            }, function() {
                $scope.submitting = false;
            });
        };
        $scope.deleteApp = function(app) {
            $scope.addedApp = $scope.addedApp.filter(function(addedApp) {
                return addedApp.APPID !== app.APPID;
            });
            $scope.$broadcast("addedAppChanged");
        };
        $scope.sortAddedApp = function(sortList) {
            $scope.addedApp = publicService.sortAddedApp(sortList, $scope.addedApp);
        };
        /**
         * @param app
         * @return {Object} result
         *  result.success {Boolean} true表示添加成功，false表示失败
         *  result.msg {String}
         */
        $scope.addApp = function(app) {
            var appIndex;
            if (publicService.isAdded(app, $scope.addedApp)) {
                return {
                    success: false,
                    msg: "此app已经添加过"
                };
            }
            if (true || $scope.addedApp.length < $scope.needAppCount) {
                appIndex = $scope.addedApp.length;
                $scope.addedApp.push(app);
                $scope.$broadcast("addedAppChanging", app);
                publicService.getAppDetail(publicService.getAppId(app), "iconapp", function(appDetail) {
                    $scope.addedApp[appIndex] = appDetail;
                    $scope.$broadcast("addedAppChanged", appDetail);
                });
                return {
                    success: true,
                    msg: ""
                };
            } else {
                return {
                    success: false,
                    msg: "iconApp最多添加7个！"
                };
            }
        };
        $scope.getAddedApp = function() {
            return $scope.addedApp;
        };
        function initForm() {
            $scope.iconForm = {
                id: "",
                release_time: "",
                applications: ""
            };
            $scope.submitted = false;
            $scope.addedApp = [];
        }
    } ]);
});