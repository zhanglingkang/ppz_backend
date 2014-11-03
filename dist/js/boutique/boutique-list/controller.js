"use strict";

define("boutique/boutique-list/controller", [ "app", "public/local/system", "public/general/directive/date-picker", "./service", "public/local/http", "public/general/pub-sub", "public/general/directive/prevent-spread", "public/general/directive/confirm-hint", "public/general/directive/tooltip", "public/general/directive/drag-sort" ], function(require, exports, module) {
    var app = require("app");
    var system = require("public/local/system");
    require("public/general/directive/date-picker");
    require("./service");
    require("public/general/directive/prevent-spread");
    require("public/general/directive/confirm-hint");
    require("public/general/directive/tooltip");
    require("public/general/directive/drag-sort");
    var pubSub = require("public/general/pub-sub");
    app.controller("boutiqueListCtrl", [ "$scope", "$filter", "boutiqueListService", function($scope, $filter, boutiqueListService) {
        var BOUTIQUE_MAX_LENGTH = 10;
        $scope.submitted = false;
        $scope.introduceTemplateUrl = system.getTplAbsolutePath("tpl/public/app-introduce-edit.html");
        $scope.searchStatus = $scope.SEARCH_STATUS.INIT;
        search(null);
        $scope.search = function(valid) {
            $scope.submitted = true;
            if (valid) {
                search($scope.time);
            }
        };
        $scope.updateIntroduce = function(valid, childScope) {
            var app = childScope.app;
            childScope.introduceSubmitted = true;
            if (valid) {
                boutiqueListService.updateIntroduce({
                    id: app.j_id,
                    text: app.tempIntroduce
                }, function() {
                    app.APPINTRO = app.tempIntroduce;
                    childScope.deletePopover = true;
                    childScope.introduceSubmitted = false;
                });
            }
        };
        $scope.getMore = function() {
            if ($scope.boutiqueList.length >= BOUTIQUE_MAX_LENGTH) {
                pubSub.publish("businessError", {
                    title: "最多展示十天数据!",
                    msg: ""
                });
            } else {
                boutiqueListService.getMore($scope.nextTime, function(data) {
                    $scope.boutiqueList = $scope.boutiqueList || [];
                    $scope.boutiqueList.push(data.boutiqueList[0]);
                });
                $scope.nextTime = getLastDay($scope.nextTime);
            }
        };
        /**
         *
         * @param {Array} slideList 元素为obj
         *  obj.id {String}
         *  obj.sort {Integer}
         */
        $scope.sortSlide = function(slideList, time) {
            boutiqueListService.sortSlide(slideList, function() {
                updateBoutiqueList(time);
            }, function() {
                updateBoutiqueList(time);
            });
        };
        $scope.sortPicture = function(pictureList, time) {
            boutiqueListService.sortPicture(pictureList, function() {
                updateBoutiqueList(time);
            }, function() {
                updateBoutiqueList(time);
            });
        };
        $scope.sortArticle = function(articleList, time) {
            boutiqueListService.sortArticle(articleList, function() {
                updateBoutiqueList(time);
            }, function() {
                updateBoutiqueList(time);
            });
        };
        $scope.sortIcon = function(iconList, time) {
            boutiqueListService.sortIcon(iconList, function() {
                updateBoutiqueList(time);
            }, function() {
                updateBoutiqueList(time);
            });
        };
        $scope.deleteSlide = function(id, time) {
            boutiqueListService.deleteSlide(id, function() {
                updateBoutiqueList(time);
            });
        };
        $scope.deletePicture = function(id, time) {
            boutiqueListService.deletePicture(id, function() {
                updateBoutiqueList(time);
            });
        };
        $scope.deleteIcon = function(id, time) {
            boutiqueListService.deleteIcon(id, function() {
                updateBoutiqueList(time);
            });
        };
        $scope.deleteArticle = function(id, time) {
            boutiqueListService.deleteArticle(id, function() {
                updateBoutiqueList(time);
            });
        };
        /**
         * @method search
         * @description 精品数据查询
         * @param {String} time 格式如：2012-02-02
         */
        function search(time) {
            if ($scope.searchStatus !== $scope.SEARCH_STATUS.SEARCHING) {
                $scope.searchStatus = $scope.SEARCH_STATUS.SEARCHING;
                boutiqueListService.getBoutiqueList(time, function(data) {
                    $scope.searchStatus = $scope.SEARCH_STATUS.SEARCH_SUCCESSED;
                    $scope.boutiqueList = data.boutiqueList;
                    setNextTime(data.boutiqueList);
                    $scope.submitted = false;
                }, function() {
                    $scope.searchStatus = $scope.SEARCH_STATUS.SEARCH_FAILED;
                });
            }
        }
        /**
         * @method 更新$scope.boutiqueList
         * @param time {String}
         */
        function updateBoutiqueList(time) {
            boutiqueListService.getMore(time, function(data) {
                addBoutique(data.boutiqueList[0]);
            });
        }
        /**
         * @method addBoutique 将boutique的精品数据添加到$scope.boutiquelist中，time重复的覆盖，不重复的添加进去
         * @param {Object} boutique
         */
        function addBoutique(boutique) {
            var repeated = $scope.boutiqueList.some(function(boutiqueItem, index) {
                if (boutique.time == boutiqueItem.time) {
                    /**
                     * 调用ngRepeat指令时，每一个循环都会创建一个scope
                     * 写成下面这样而不是写成$scope.boutiqueList[index]= boutique是为了不刷新$scope.boutiqueList[index]所在的scope
                     */
                    $scope.boutiqueList[index].article = boutique.article;
                    $scope.boutiqueList[index].iconapp = boutique.iconapp;
                    $scope.boutiqueList[index].picapp = boutique.picapp;
                    $scope.boutiqueList[index].turnpic = boutique.turnpic;
                    return true;
                }
                return false;
            });
            if (!repeated) {
                $scope.boutiqueList.push(boutique);
            }
        }
        /**
         * @method 点击获取更多时，传递的参数为$scope.nextTime。这里设置$scope.nextTime
         * @param boutiqueList
         */
        function setNextTime(boutiqueList) {
            $scope.nextTime = getLastDay($filter("orderBy")(boutiqueList, "time", false)[0].time);
        }
        /**
         *
         * @param {String}time  格式“2014-03-08”
         * @return {String} "2014-03-07"
         */
        function getLastDay(time) {
            var date = new Date(time);
            date.setDate(date.getDate() - 1);
            return date.toJSON().substring(0, 10);
        }
    } ]);
});