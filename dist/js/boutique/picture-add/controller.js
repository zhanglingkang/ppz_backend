"use strict";

define("boutique/picture-add/controller", [ "app", "public/local/system", "public/local/service", "./service", "public/local/http", "public/general/pub-sub", "./directive", "public/general/directive/drag-sort", "public/general/directive/submitting" ], function(require, exports, module) {
    var app = require("app");
    var system = require("public/local/system");
    require("public/local/service");
    require("./service");
    require("./directive");
    require("public/general/directive/drag-sort");
    require("public/general/directive/submitting");
    app.controller("pictureAddCtrl", [ "$scope", "$routeParams", "publicService", "pictureAddService", function($scope, $routeParams, publicService, pictureAddService) {
        $scope.needAppCount = 4;
        $scope.introduceTemplateUrl = system.getTplAbsolutePath("tpl/public/app-introduce-edit.html");
        /**
         * 提交时，检测是否有十天内添加过的app，如果有，给予提示。
         * @type {Array}
         */
        $scope.repeatedApp = [];
        $scope.showRepeatedHint = false;
        $scope.hasNullPicApp = false;
        initForm();
        if ($routeParams.id != "null") {
            pictureAddService.getPictureDetail($routeParams.id, function(data) {
                $scope.pictureForm.id = $routeParams.id;
                $scope.pictureForm.release_time = data.release_time;
                data.applications.forEach(function(app, index) {
                    $scope.addApp(app);
                });
            });
        }
        $scope.addPicture = function(valid) {
            $scope.submitted = true;
            if (valid && $scope.addedApp.length >= 1 && !$scope.hasNullPicApp && !$scope.submitting) {
                $scope.repeatedApp = publicService.getRepeatedApp($scope.addedApp, $scope.pictureForm.release_time, "IpadBoutiquePicApp");
                if ($scope.repeatedApp.length === 0) {
                    $scope.confirmSubmit();
                } else {
                    $scope.showRepeatedHint = true;
                }
            }
        };
        $scope.confirmSubmit = function() {
            $scope.submitting = true;
            var applications = publicService.getApplications($scope.addedApp);
            applications.forEach(function(app) {
                $scope.addedApp.some(function(addedApp) {
                    if (publicService.getAppId(app) === publicService.getAppId(addedApp)) {
                        app.index_pic = addedApp.indexPic;
                        return true;
                    }
                    return false;
                });
            });
            $scope.pictureForm.applications = JSON.stringify(applications);
            pictureAddService.addPicture($scope.pictureForm, function(data) {
                initForm();
                $scope.submitting = false;
            }, function() {
                $scope.submitting = false;
            });
        };
        /**
         * @method  updateHasNullPicApp
         * @description 根据addedApp更新$scope.HasNullPicApp的值，如果选择的app中有任意一个的preview.length为0，
         * 则HasNullPicApp的值为true
         */
        $scope.updateHasNullPicApp = function() {
            $scope.hasNullPicApp = $scope.addedApp.some(function(app) {
                return app.preview.length === 0;
            });
        };
        $scope.deleteApp = function(app) {
            $scope.addedApp = $scope.addedApp.filter(function(addedApp) {
                return addedApp.APPID !== app.APPID;
            });
            $scope.$broadcast("addedAppChanged");
            $scope.updateHasNullPicApp();
        };
        $scope.sortAddedApp = function(sortList) {
            /**
             * 这里之所以调用angular.copy是因为angularjs为对象设置了一个$$hashkey属性，如果addedApp的元素的$$hashkey没有变,即使addedApp变化了，
             * 也不会为addedApp的元素创建新的scope，调用angular.copy复制，不会复制$$hashkey属性。
             */
            $scope.addedApp = angular.copy(publicService.sortAddedApp(sortList, $scope.addedApp));
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
            /**
             * 这么写是防止需求变更，以后会限制添加数量
             */
            if (true || $scope.addedApp.length < $scope.needAppCount) {
                appIndex = $scope.addedApp.length;
                $scope.addedApp.push(app);
                $scope.$broadcast("addedAppChanging", app);
                publicService.getAppDetail(publicService.getAppId(app), "picapp", function(appDetail) {
                    $scope.addedApp[appIndex] = appDetail;
                    $scope.addedApp[appIndex].introduce = app.summary || appDetail.APPINTRO;
                    $scope.addedApp[appIndex].indexPic = app.index_pic || $scope.addedApp[appIndex].indexPic;
                    $scope.$broadcast("addedAppChanged", appDetail);
                    $scope.updateHasNullPicApp();
                });
                return {
                    success: true,
                    msg: ""
                };
            } else {
                return {
                    success: false,
                    msg: "图形App最多添加4个！"
                };
            }
        };
        $scope.getAddedApp = function() {
            return $scope.addedApp;
        };
        $scope.updateIntroduce = function(valid, childScope) {
            var app = childScope.app;
            childScope.introduceSubmitted = true;
            if (valid) {
                app.introduce = app.tempIntroduce;
                childScope.deletePopover = true;
                childScope.introduceSubmitted = false;
            }
        };
        function initForm() {
            $scope.pictureForm = {
                id: "",
                release_time: "",
                applications: ""
            };
            $scope.hasNullPicApp = false;
            $scope.submitted = false;
            $scope.addedApp = [];
        }
    } ]);
});