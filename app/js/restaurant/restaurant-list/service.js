"use strict";

define(function (require, exports, module) {
    var app = require("app");
    require("public/local/http");
    var pubSub = require("public/general/pub-sub");
    app.service("restaurantListService", ["httpService", function (httpService) {
        return {
            getRestaurantList: function () {
                return httpService.post({
                    command: "getRestaurantInfoList",
                    data: {
                        start: 1,
                        end: -1
                    }
                }).success(function (data) {
                });
            },
            moveUp: function (id, positon, success, error) {
                this.move({
                    id: id,
                    position: positon,
                    direction: "up"
                }, success, error);
            },
            moveDown: function (id, position, success, error) {
                this.move({
                    id: id,
                    position: position,
                    direction: "down"
                }, success, error);
            },
            importRestaurant: function (data, success, error) {
                httpService.get({
                    r: "special/import",
                    data: data,
                    success: function (data, headers) {
                        pubSub.publish("businessSuccess", {
                            title: "导入成功!",
                            msg: ""
                        });
                        success && success(data);
                    },
                    error: error
                });
            },
            move: function (data, success, error) {
                httpService.get({
                    r: "special/updatePosition",
                    data: data,
                    success: function (data, headers) {
                        pubSub.publish("businessSuccess", {
                            title: "排序成功!",
                            msg: ""
                        });
                        success && success(data);
                    },
                    error: error
                });
            },
            lock: function (id, position, success, error) {
                var data = {
                    id: id,
                    position: position

                };
                httpService.get({
                    r: "special/PositionLock",
                    data: data,
                    success: function (data, headers) {
                        pubSub.publish("businessSuccess", {
                            title: "锁定成功!",
                            msg: ""
                        });
                        success(data);
                    },
                    error: error
                });
            },
            sortRestaurant: function (data, success, error) {
                httpService.get({
                    r: "special/updatePosition",
                    data: data,
                    success: function (data, headers) {
                        pubSub.publish("businessSuccess", {
                            title: "专题排序成功!",
                            msg: ""
                        });
                        success(data);
                    },
                    error: error
                });
            },
            pushToFrontEnd: function (id, success, error) {
                var data = {
                    id: id
                };
                httpService.get({
                    r: "special/release",
                    data: data,
                    success: function (data, headers) {
                        pubSub.publish("businessSuccess", {
                            title: "发布成功!",
                            msg: ""
                        });
                        success(data);
                    },
                    error: error
                });
            },
            unlock: function (id, success, error) {
                var data = {
                    id: id
                };
                httpService.get({
                    r: "special/PositionUnlock",
                    data: data,
                    success: function (data, headers) {
                        pubSub.publish("businessSuccess", {
                            title: "解锁成功!",
                            msg: ""
                        });
                        success(data);
                    },
                    error: error
                });
            },
            deleteRestaurant: function (id, success, error) {
                var data = {
                    id: id
                };
                httpService.get({
                    r: "special/delete",
                    data: data,
                    success: function (data, headers) {
                        pubSub.publish("businessSuccess", {
                            title: "删除专题成功!",
                            msg: ""
                        });
                        success(data);
                    },
                    error: error
                });
            }

        };
    }]);
});