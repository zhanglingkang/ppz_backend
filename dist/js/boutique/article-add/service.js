"use strict";

define("boutique/article-add/service", [ "app", "public/local/http", "public/general/pub-sub" ], function(require, exports, module) {
    var app = require("app");
    require("public/local/http");
    var pubSub = require("public/general/pub-sub");
    app.service("articleAddService", [ "httpService", function(httpService) {
        return {
            /**
             * @param data
             * @param success
             * @param error
             */
            addArticle: function(data, success, error) {
                httpService.post({
                    r: "boutiqueArticle/create",
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
            /**
             * @method getArticlePlan
             * @description 得到文章排期数据
             * @param id
             * @param success
             * @param error
             */
            getArticlePlan: function(id, success, error) {
                var data = {
                    id: id,
                    type: "article"
                };
                httpService.get({
                    r: "boutique/edit",
                    data: data,
                    success: function(data) {
                        if ("applications" in data) {
                            data.applications = JSON.parse(data.applications);
                        }
                        success(data);
                    },
                    error: error
                });
            },
            /**
             * @method getArticleDetail
             * @description 获取文章详情。获取到的为数组数据
             * @param {String} idList 格式id1,id2
             * @param success
             * @param error
             *
             */
            getArticleDetail: function(idList, success, error) {
                httpService.get({
                    r: "article/index",
                    data: {
                        id: idList
                    },
                    success: function(data) {
                        success(data);
                    },
                    error: error
                });
            }
        };
    } ]);
});