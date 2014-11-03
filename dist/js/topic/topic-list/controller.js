"use strict";

define("topic/topic-list/controller", [ "./service", "app", "public/local/http", "public/general/pub-sub" ], function(require, exports, module) {
    require("./service");
    var app = require("app");
    app.controller("topicListCtrl", [ "$scope", "$routeParams", "publicService", "topicListService", function($scope, $routeParams, publicService, topicListService) {
        $scope.searchForm = {
            status: "",
            title: ""
        };
        $scope.searchResult = {
            topicList: []
        };
        $scope.$on("searchStart", function() {
            $scope.searchStatus = $scope.SEARCH_STATUS.SEARCHING;
        });
        $scope.$on("searchEnd", function(event, data) {
            $scope.searchStatus = $scope.SEARCH_STATUS.SEARCH_SUCCESSED;
            $scope.searchResult.topicList = data.data;
        });
        $scope.$on("searchFail", function() {
            $scope.searchStatus = $scope.SEARCH_STATUS.SEARCH_FAILED;
        });
        $scope.search = function() {
            $scope.paginationScope.goPage(1);
        };
        $scope.deleteTopic = function(id) {
            topicListService.deleteTopic(id, function() {
                $scope.paginationScope.goPage();
            });
        };
        $scope.importTopic = function() {
            $scope.loading = true;
            topicListService.importTopic(null, function() {
                $scope.loading = false;
            }, function() {
                $scope.loading = false;
            });
        };
        $scope.moveUp = function(id, position) {
            topicListService.moveUp(id, position, function() {
                $scope.paginationScope.goPage();
            });
        };
        $scope.moveDown = function(id, position) {
            topicListService.moveDown(id, position, function() {
                $scope.paginationScope.goPage();
            });
        };
        $scope.sortTopic = function(sortList, dragParam, dragId) {
            var data = {};
            sortList.some(function(value) {
                if (value.id === dragId) {
                    data.position = value.sort;
                    data.id = value.id;
                    return true;
                }
                return false;
            });
            topicListService.sortTopic(data, function() {
                $scope.paginationScope.goPage();
            });
        };
        /**
         * 刷新到前端
         * @param id
         * @param position
         */
        $scope.pushToFrontEnd = function(id) {
            topicListService.pushToFrontEnd(id, function() {
                $scope.paginationScope.goPage();
            });
        };
        $scope.unlock = function(id) {
            topicListService.unlock(id, function() {
                $scope.paginationScope.goPage();
            });
        };
        $scope.lockPosition = function(valid, childScope) {
            var topic = childScope.topic;
            childScope.lockPositionSubmitted = true;
            if (valid) {
                topicListService.lock(topic.id, topic.lockPosition, function() {
                    $scope.paginationScope.goPage();
                    childScope.deletePopover = true;
                    childScope.lockPositionSubmitted = false;
                });
            }
        };
        $scope.$watch("paginationScope", function() {
            if ($scope.paginationScope) {
                $scope.paginationScope.searchForm = $scope.searchForm;
                $scope.paginationScope.searchInterface = "special/index";
                $scope.paginationScope.goPage(1);
            }
        });
    } ]);
});