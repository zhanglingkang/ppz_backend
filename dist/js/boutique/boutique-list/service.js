"use strict";

define("boutique/boutique-list/service", [ "app", "public/local/http", "public/general/pub-sub" ], function(require, exports, module) {
    var app = require("app");
    require("public/local/http");
    var pubSub = require("public/general/pub-sub");
    app.service("boutiqueListService", [ "$filter", "httpService", function($filter, httpService) {
        /**
         *
         * @param data 服务器端返回的数据result.data
         * @param headers 响应头数据
         * @return {Object} obj
         * obj.boutiqueList{Array}
         * obj.time {String}
         */
        function boutiqueAdapter(data, headers) {
            var boutiqueList = [];
            var httpTime = new Date(headers.date);
            //这个http报文发生的时间
            httpTime.setHours(23);
            httpTime.setMinutes(59);
            httpTime.setSeconds(59);
            angular.forEach(data, function(value, key) {
                if (angular.isObject(value)) {
                    var boutiqueTime = new Date(value.time);
                    //精品数据的发布时间晚于今天，即为等待
                    if (boutiqueTime > httpTime) {
                        value.status = "等待";
                    } else {
                        value.status = "已发布";
                    }
                    boutiqueList.push(value);
                }
            });
            return {
                time: boutiqueList.length > 0 ? $filter("orderBy")(boutiqueList, "time", true)[0].time : "",
                boutiqueList: $filter("orderBy")(boutiqueList, "time", true)
            };
        }
        return {
            getMore: function(time, success, error) {
                var data = {
                    time: time
                };
                httpService.get({
                    r: "boutique/getMore",
                    data: data,
                    success: function(data, headers) {
                        success(boutiqueAdapter(data, headers));
                    },
                    error: error
                });
            },
            /**
             * @param data
             * @param success
             * @param error
             */
            getBoutiqueList: function(time, success, error) {
                var data = {
                    time: time
                };
                httpService.get({
                    r: "boutique/index",
                    data: data,
                    success: function(data, headers) {
                        success(boutiqueAdapter(data, headers));
                    },
                    error: error
                });
            },
            updateIntroduce: function(data, success, error) {
                httpService.get({
                    r: "boutique/editSummary",
                    data: data,
                    success: function(data) {
                        pubSub.publish("businessSuccess", {
                            title: "简介编辑成功!",
                            msg: ""
                        });
                        success && success(data);
                    },
                    error: error
                });
            },
            /**
             *
             * @param {Array} sortData 排序数据 element.id {String} element.sort {Integer}
             */
            sortSlide: function(sortData, success, error) {
                httpService.get({
                    r: "boutique/updateAppSort",
                    data: {
                        data: JSON.stringify(sortData),
                        type: "turnpic"
                    },
                    success: function(data) {
                        pubSub.publish("businessSuccess", {
                            title: "轮播图排序成功!",
                            msg: ""
                        });
                        success && success(data);
                    },
                    error: error
                });
            },
            sortIcon: function(sortData, success, error) {
                httpService.get({
                    r: "boutique/updateAppSort",
                    data: {
                        data: JSON.stringify(sortData),
                        type: "iconapp"
                    },
                    success: function(data) {
                        pubSub.publish("businessSuccess", {
                            title: "iconapp排序成功!",
                            msg: ""
                        });
                        success && success(data);
                    },
                    error: error
                });
            },
            sortPicture: function(sortData, success, error) {
                httpService.get({
                    r: "boutique/updateAppSort",
                    data: {
                        data: JSON.stringify(sortData),
                        type: "picapp"
                    },
                    success: function(data) {
                        pubSub.publish("businessSuccess", {
                            title: "图形app排序成功!",
                            msg: ""
                        });
                        success && success(data);
                    },
                    error: error
                });
            },
            sortArticle: function(sortData, success, error) {
                httpService.get({
                    r: "boutique/updateAppSort",
                    data: {
                        data: JSON.stringify(sortData),
                        type: "article"
                    },
                    success: function(data) {
                        pubSub.publish("businessSuccess", {
                            title: "文章排序成功!",
                            msg: ""
                        });
                        success && success(data);
                    },
                    error: error
                });
            },
            deleteSlide: function(id, success, error) {
                var data = {
                    id: id,
                    type: "turnpic"
                };
                httpService.get({
                    r: "boutique/delete",
                    data: data,
                    success: function(data) {
                        pubSub.publish("businessSuccess", {
                            title: "轮播图删除成功!",
                            msg: ""
                        });
                        success(data);
                    },
                    error: error
                });
            },
            deleteArticle: function(id, success, error) {
                var data = {
                    id: id,
                    type: "article"
                };
                httpService.get({
                    r: "boutique/delete",
                    data: data,
                    success: function(data) {
                        pubSub.publish("businessSuccess", {
                            title: "文章删除成功!",
                            msg: ""
                        });
                        success(data);
                    },
                    error: error
                });
            },
            deleteIcon: function(id, success, error) {
                var data = {
                    id: id,
                    type: "iconapp"
                };
                httpService.get({
                    r: "boutique/delete",
                    data: data,
                    success: function(data) {
                        pubSub.publish("businessSuccess", {
                            title: "icon删除成功!",
                            msg: ""
                        });
                        success(data);
                    },
                    error: error
                });
            },
            deletePicture: function(id, success, error) {
                var data = {
                    id: id,
                    type: "picapp"
                };
                httpService.get({
                    r: "boutique/delete",
                    data: data,
                    success: function(data) {
                        pubSub.publish("businessSuccess", {
                            title: "图形app删除成功!",
                            msg: ""
                        });
                        success(data);
                    },
                    error: error
                });
            }
        };
    } ]);
});