"use strict";

define("article/article-list/service", [ "app", "public/local/http", "public/general/pub-sub" ], function(require, exports, module) {
    var app = require("app");
    require("public/local/http");
    var pubSub = require("public/general/pub-sub");
    app.service("articleListService", [ "httpService", function(httpService) {
        return {
            deleteArticle: function(id, success, error) {
                var data = {
                    id: id
                };
                httpService.get({
                    r: "article/delete",
                    data: data,
                    success: function(data, headers) {
                        pubSub.publish("businessSuccess", {
                            title: "删除文章成功!",
                            msg: ""
                        });
                        success(data);
                    },
                    error: error
                });
            },
            toTopArticle: function(id, startTime, endTime, success, error) {
                var data = {
                    id: id,
                    priority_stime: startTime,
                    priority_etime: endTime
                };
                httpService.get({
                    r: "article/setPriority",
                    data: data,
                    success: function(data, headers) {
                        pubSub.publish("businessSuccess", {
                            title: "置顶成功!",
                            msg: ""
                        });
                        success(data);
                    },
                    error: error
                });
            },
            cancelTop: function(id, success, error) {
                httpService.get({
                    r: "article/setPriority",
                    data: {
                        id: id,
                        priority_stime: "",
                        priority_etime: ""
                    },
                    success: function(data, headers) {
                        pubSub.publish("businessSuccess", {
                            title: "取消置顶成功!",
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