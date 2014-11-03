"use strict";

define("article/article-create/service", [ "app", "public/local/http", "public/general/pub-sub" ], function(require, exports, module) {
    var app = require("app");
    require("public/local/http");
    var pubSub = require("public/general/pub-sub");
    app.service("articleCreateService", [ "httpService", function(httpService) {
        return {
            /**
             * @param data
             * @param success
             * @param error
             */
            addArticle: function(data, success, error) {
                httpService.post({
                    r: "article/create",
                    data: data,
                    success: function(data) {
                        success && success(data);
                        pubSub.publish("businessSuccess", {
                            title: "编辑文章app成功!",
                            msg: ""
                        });
                    },
                    error: error
                });
            },
            getArticleDetail: function(id, success, error) {
                var data = {
                    id: id
                };
                httpService.get({
                    r: "article/edit",
                    data: data,
                    success: function(data) {
                        data.applications = JSON.parse(data.applications);
                        success(data);
                    },
                    error: error
                });
            }
        };
    } ]);
});