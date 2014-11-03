"use strict";

define("public/local/service", [ "app", "public/general/date-util", "public/local/http" ], function(require, exports, module) {
    var app = require("app");
    var dateUtil = require("public/general/date-util");
    require("public/local/http");
    app.service("publicService", [ "httpService", function(httpService) {
        return {
            /**
             * @param appId
             * @param callback
             */
            getAppDetail: function(appId, type, callback) {
                httpService.get({
                    r: "searchApp/appDetail",
                    data: {
                        appid: appId,
                        type: type
                    },
                    success: function(data) {
                        callback(data);
                    }
                });
            },
            /**
             * @method getRepeatedApp
             * @description 得到在10天内重复添加过的app
             * @param {Array} addedApp
             * @param {String} date
             * @param {String} type 可选值IpadBoutiqueTurnPic、IpadBoutiquePicApp、IpadBoutiqueIconApp、IpadBoutiqueArticle、IpadArticle
             * @return {Array} repeadedApp 如果十天内没有重复的，数组为空
             */
            getRepeatedApp: function(addedApp, date, type) {
                var result = [];
                //10天距离对应的毫秒数
                var distance10 = 24 * 60 * 60 * 1e3 * 10;
                addedApp.forEach(function(app, index) {
                    var repeatData = [];
                    app = angular.copy(app);
                    app.repeat.forEach(function(oneRepeat) {
                        var distance = Date.parse(date) - Date.parse(oneRepeat.release_time);
                        if (distance > 0 && distance < distance10 && oneRepeat.type === type) {
                            repeatData.push(oneRepeat);
                        }
                    });
                    app.repeat = repeatData;
                    if (app.repeat.length > 0) {
                        result.push(app);
                    }
                });
                return result;
            },
            /**
             * @method getAppId
             * @description 因为appId命名有多种格式。这里作统一获取
             * @param app
             */
            getAppId: function(app) {
                return app.APPID || app.app_id || app.appId;
            },
            /**
             * @method isAdded
             * @description 判断某个app是否已经添加过
             * @param app
             */
            isAdded: function(app, addedApp) {
                var self = this;
                return addedApp.some(function(oneApp) {
                    return self.getAppId(app) === self.getAppId(oneApp);
                });
            },
            /**
             * @method sortAddedApp
             * @description 根据sortList对addedApp进行排序
             * @param {Array} sortList 元素格式为{id:"",sort:""}
             * @param {Array} addedApp 元素为app
             * @return {Array}排序后的appList
             */
            sortAddedApp: function(sortList, addedApp) {
                var sortedAddedApp = [];
                var self = this;
                sortList.forEach(function(sortValue) {
                    sortedAddedApp.push(self.getApp(sortValue.id, addedApp));
                });
                return sortedAddedApp;
            },
            /**
             * @method sortArticle
             * @description 根据sortList对articles进行排序
             * @param {Array} sortList 元素格式为{id:"",sort:""}
             * @param {Array} addedArticles 带排序的文章
             */
            sortAddedArticle: function(sortList, addedArticles) {
                var sortedArticles = [];
                var self = this;
                sortList.forEach(function(sortValue) {
                    sortedArticles.push(self.getArticle(sortValue.id, addedArticles));
                });
                return sortedArticles;
            },
            /**
             * @method getArticles
             * @description 根据addedArticles得到需要提交的articles
             * @return {Array} articles
             */
            getArticles: function(addedArticles) {
                var articles = [];
                addedArticles.forEach(function(article) {
                    articles.push({
                        article_id: article.id
                    });
                });
                return articles;
            },
            /**
             * @method getApplications
             * @description 根据addedApp得到需要提交的applications
             * @return {Array} applications
             */
            getApplications: function(addedApp) {
                var applications = [];
                addedApp.forEach(function(app) {
                    applications.push({
                        app_id: app.APPID,
                        summary: app.introduce,
                        app_sign: app.APPDOWNLOADUSER
                    });
                });
                return applications;
            },
            /**
             * @method getApp
             * @description 在addedApp中根据appId找到对应的app
             * @param {String} appId
             * @param {Array} addedApp
             */
            getApp: function(appId, addedApp) {
                var app;
                var self = this;
                addedApp.some(function(oneApp) {
                    if (appId === self.getAppId(oneApp)) {
                        app = oneApp;
                        return true;
                    }
                });
                return app;
            },
            /**
             * @method getArticle
             * @description addedArticles是否包含article
             * @param {Object} article
             * @param {Array} addedArticles
             * @return {Boolean}包含返回true
             */
            contains: function(article, addedArticles) {
                addedArticles = addedArticles || [];
                return addedArticles.some(function(item) {
                    return item.id === article.id;
                });
            },
            /**
             * @method getArticle
             * @description 在addedArticles中根据articleId找到对应的article
             * @param {String} articleId
             * @param {Array} addedArticles
             */
            getArticle: function(articleId, addedArticles) {
                var article;
                var self = this;
                addedArticles.some(function(oneArticle) {
                    if (articleId === oneArticle.id) {
                        article = oneArticle;
                        return true;
                    }
                });
                return article;
            },
            /**
             * @method isTop
             * @description 判断某篇文章是否置顶
             * @param {Object} article
             * @return {Boolean}
             */
            isTop: function(article) {
                var isTop = false;
                if (article.priority_etime && article.priority_stime) {
                    //                    var endTime = dateUtil.parse(article.priority_etime + " 23:59:59");
                    //                    if (new Date() < endTime) {
                    isTop = true;
                }
                return isTop;
            }
        };
    } ]);
});