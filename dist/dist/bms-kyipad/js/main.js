/**
 * seajs的配置
 */
seajs.config({
    base: "http://js.wanmeiyueyu.com/bms-kyipad/js/",
    alias: {
    }
});
"use strict";

/**
 * 定义angularjs的启动模块
 */
define("app", [], function(require) {
    return angular.module("bmsIPad", [ "ngRoute" ]);
});
"use strict";

define("article/article-create/controller", [ "app", "public/local/service", "./service", "public/local/http", "public/general/pub-sub", "public/general/directive/editor", "public/general/directive/date-picker", "public/general/directive/view-img", "public/general/directive/drag-sort", "public/general/directive/submitting", "public/general/form-validation" ], function(require, exports, module) {
    var app = require("app");
    require("public/local/service");
    require("./service");
    require("public/general/directive/editor");
    require("public/general/directive/date-picker");
    require("public/general/directive/view-img");
    require("public/general/directive/drag-sort");
    require("public/general/directive/submitting");
    var validationUtil = require("public/general/form-validation");
    app.controller("articleCreateCtrl", [ "$scope", "$routeParams", "publicService", "articleCreateService", function($scope, $routeParams, publicService, articleCreateService) {
        initForm();
        if ($routeParams.id != "null") {
            articleCreateService.getArticleDetail($routeParams.id, function(data) {
                $scope.articleForm.id = data.id;
                $scope.articleForm.content = data.content;
                $scope.articleForm.release_time = data.release_time;
                $scope.articleForm.source = data.source;
                $scope.articleForm.text = data.text;
                $scope.articleForm.title = data.title;
                $scope.articleForm.type = data.type;
                $scope.articleForm.priority_etime = data.priority_etime;
                $scope.articleForm.priority_stime = data.priority_stime;
                $scope.article.isTop = publicService.isTop(data) ? 1 : 0;
                $scope.articleForm.first_pic = $scope.article.imgUrl = data.up_file;
                data.applications.forEach(function(app, index) {
                    $scope.addApp(app);
                });
            });
        }
        $scope.addArticle = function(formValidation) {
            var applications;
            $scope.submitted = true;
            validationUtil.setFormValidataion(formValidation);
            //虽然现在不限制必须选择app。预防以后文章需要限制app的数量
            if (formValidation.$valid && $scope.addedApp.length > -1 && !$scope.submitting) {
                $scope.submitting = true;
                if ($scope.article.isTop == 0) {
                    $scope.articleForm.priority_stime = $scope.articleForm.priority_etime = "";
                }
                //如果是编辑操作而且上传了新图片
                if ($scope.articleForm.id && $scope.articleForm.up_file) {
                    $scope.articleForm.first_pic = "";
                }
                $scope.articleForm.applications = JSON.stringify(publicService.getApplications($scope.addedApp));
                articleCreateService.addArticle($scope.articleForm, function() {
                    initForm();
                    $scope.submitting = false;
                }, function() {
                    $scope.submitting = false;
                });
            }
        };
        $scope.sortAddedApp = function(sortList) {
            $scope.addedApp = publicService.sortAddedApp(sortList, $scope.addedApp);
        };
        $scope.deleteApp = function(app) {
            $scope.addedApp = $scope.addedApp.filter(function(addedApp) {
                return addedApp.APPID !== app.APPID;
            });
        };
        /**
         * @param app
         * @return {Object} result
         *  result.success {Boolean} true表示添加成功，false表示失败
         *  result.msg {String}
         */
        $scope.addApp = function(app) {
            var appIndex = $scope.addedApp.length;
            if (publicService.isAdded(app, $scope.addedApp)) {
                return {
                    success: false,
                    msg: "此app已经添加过"
                };
            }
            $scope.addedApp.push(app);
            $scope.$broadcast("addedAppChanging", app);
            publicService.getAppDetail(publicService.getAppId(app), "article", function(appDetail) {
                $scope.addedApp[appIndex] = appDetail;
                $scope.$broadcast("addedAppChanged", appDetail);
            });
            return {
                success: true,
                msg: ""
            };
        };
        $scope.getAddedApp = function() {
            return $scope.addedApp;
        };
        function initForm() {
            $scope.addedApp = [];
            $scope.submitted = false;
            $scope.article = {
                imgUrl: ""
            };
            $scope.articleForm = {
                id: "",
                release_time: "",
                title: "",
                type: "testing",
                content: "article",
                source: "",
                up_file: "",
                first_pic: "",
                text: "",
                priority_etime: "",
                priority_stime: "",
                applications: ""
            };
            $scope.formReset = true;
            $scope.imgClear = true;
            $scope.article = {
                set firstPicFiles(files) {
                    $scope.$apply(function() {
                        $scope.articleForm.up_file = files[0];
                    });
                },
                isTop: 0
            };
        }
    } ]);
});
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
"use strict";

define("article/article-list/controller", [ "app", "public/general/date-util", "public/local/service", "./service", "public/local/http", "public/general/pub-sub", "public/general/directive/tooltip" ], function(require, exports, module) {
    var app = require("app");
    var dateUtil = require("public/general/date-util");
    require("public/local/service");
    require("./service");
    require("public/general/directive/tooltip");
    app.controller("articleListCtrl", [ "$scope", "$routeParams", "publicService", "articleListService", function($scope, $routeParams, publicService, articleListService) {
        $scope.searchForm = {
            title: ""
        };
        $scope.searchResult = {
            articleList: []
        };
        $scope.searchStatus = $scope.SEARCH_STATUS.INIT;
        $scope.$on("searchStart", function(event, data) {
            $scope.searchStatus = $scope.SEARCH_STATUS.SEARCHING;
        });
        $scope.$on("searchEnd", function(event, data) {
            $scope.searchStatus = $scope.SEARCH_STATUS.SEARCH_SUCCESSED;
            $scope.searchResult.articleList = data.data;
            $scope.searchResult.articleList.forEach(function(value, index) {
                value.isTop = publicService.isTop(value);
            });
        });
        $scope.$on("searchFail", function() {
            $scope.searchStatus = $scope.SEARCH_STATUS.SEARCH_FAILED;
        });
        $scope.search = function() {
            $scope.paginationScope.goPage(1);
        };
        $scope.deleteArticle = function(id) {
            articleListService.deleteArticle(id, function() {
                $scope.paginationScope.goPage();
            });
        };
        $scope.cancelTop = function(articleId) {
            articleListService.cancelTop(articleId, function() {
                $scope.paginationScope.goPage();
            });
        };
        $scope.toTopArticle = function(valid, articleScope) {
            articleScope.submitted = true;
            var article;
            if (valid) {
                article = articleScope.article;
                articleListService.toTopArticle(article.id, article.priority_stime, article.priority_etime, function() {
                    articleScope.deletePopover = true;
                    $scope.paginationScope.goPage();
                });
            }
        };
        $scope.$watch("paginationScope", function() {
            if ($scope.paginationScope) {
                $scope.paginationScope.searchForm = $scope.searchForm;
                $scope.paginationScope.searchInterface = "article/index";
                $scope.paginationScope.goPage(1);
            }
        });
    } ]);
});
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
"use strict";

define("boutique/article-add/controller", [ "app", "public/local/service", "./service", "public/local/http", "public/general/pub-sub", "public/general/directive/date-picker", "public/general/directive/view-img", "public/general/directive/submitting" ], function(require, exports, module) {
    var app = require("app");
    require("public/local/service");
    require("./service");
    require("public/general/directive/date-picker");
    require("public/general/directive/view-img");
    require("public/general/directive/submitting");
    app.controller("articleAddCtrl", [ "$scope", "$routeParams", "publicService", "articleAddService", function($scope, $routeParams, publicService, articleAddService) {
        initForm();
        if ($routeParams.id != "null") {
            articleAddService.getArticlePlan($routeParams.id, function(data) {
                $scope.articleForm.id = data.id;
                $scope.articleForm.release_time = data.release_time;
                articleAddService.getArticleDetail(data.article_id, function(data) {
                    $scope.addedArticle = data.data;
                });
            });
        }
        $scope.submitArticle = function(valid) {
            $scope.submitted = true;
            if (valid && $scope.addedArticle.length > 0 && !$scope.submitting) {
                $scope.confirmSubmit();
            }
        };
        $scope.confirmSubmit = function() {
            $scope.submitting = true;
            $scope.articleForm.articles = JSON.stringify(publicService.getArticles($scope.addedArticle));
            articleAddService.addArticle($scope.articleForm, function() {
                $scope.submitting = false;
                initForm();
            }, function() {
                $scope.submitting = false;
            });
        };
        $scope.deleteArticle = function(article) {
            $scope.addedArticle = $scope.addedArticle.filter(function(articleItem) {
                return articleItem.id !== article.id;
            });
            $scope.$broadcast("addedArticleChanged");
        };
        $scope.sortAddedArticle = function(sortList) {
            $scope.addedArticle = publicService.sortAddedArticle(sortList, $scope.addedArticle);
        };
        /**
         * @param article
         * @return {Object} result
         *  result.success {Boolean} true表示添加成功，false表示失败
         *  result.msg {String}
         */
        $scope.addArticle = function(article) {
            if (!publicService.contains(article, $scope.addedArticle)) {
                $scope.addedArticle.push(article);
            }
            $scope.$broadcast("addedArticleChanged");
            return {
                success: true,
                msg: ""
            };
        };
        $scope.getAddedArticle = function() {
            return $scope.addedArticle;
        };
        function initForm() {
            $scope.addedArticle = [];
            $scope.submitted = false;
            $scope.articleForm = {
                id: "",
                release_time: "",
                articles: ""
            };
        }
    } ]);
});
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
"use strict";

define("boutique/icon-add/service", [ "app", "public/local/http", "public/general/pub-sub" ], function(require, exports, module) {
    var app = require("app");
    require("public/local/http");
    var pubSub = require("public/general/pub-sub");
    app.service("iconAddService", [ "httpService", function(httpService) {
        return {
            /**
             * @param data
             * @param success
             * @param error
             */
            addIcon: function(data, success, error) {
                httpService.post({
                    r: "boutiqueIconApp/create",
                    data: data,
                    success: function(data) {
                        pubSub.publish("businessSuccess", {
                            title: "编辑iconapp成功!",
                            msg: ""
                        });
                        success && success(data);
                    },
                    error: error
                });
            },
            getIconDetail: function(id, success, error) {
                var data = {
                    id: id,
                    type: "iconapp"
                };
                httpService.get({
                    r: "boutique/edit",
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
"use strict";

define("boutique/picture-add/directive", [ "app" ], function(require, exports, module) {
    var app = require("app");
    app.directive("produceLine", [ function() {
        return {
            restrict: "A",
            //scope: true,
            link: function(scope, elem, attrs) {
                var trNode = $(elem).parents("tr");
                var newTrNode = $("<tr></tr>");
                newTrNode.append($(elem));
                trNode.after(newTrNode);
                newTrNode.find("td").attr("colspan", "11");
            }
        };
    } ]);
    app.directive("deleteContent", [ function() {
        return {
            restrict: "A",
            //scope: true,
            link: function(scope, elem, attrs) {
                var observer = new MutationObserver(function(records) {
                    $(elem).find("[data-remove]").remove();
                });
                var options = {
                    subtree: true,
                    childList: true,
                    attributeFilter: [ "data-remove" ]
                };
                observer.observe($(elem)[0], options);
            }
        };
    } ]);
});
"use strict";

define("boutique/picture-add/service", [ "app", "public/local/http", "public/general/pub-sub" ], function(require, exports, module) {
    var app = require("app");
    require("public/local/http");
    var pubSub = require("public/general/pub-sub");
    app.service("pictureAddService", [ "httpService", function(httpService) {
        return {
            /**
             * @param data
             * @param success
             * @param error
             */
            addPicture: function(data, success, error) {
                httpService.post({
                    r: "boutiquePicApp/create",
                    data: data,
                    success: function(data) {
                        pubSub.publish("businessSuccess", {
                            title: "编辑图形app成功!",
                            msg: ""
                        });
                        success && success(data);
                    },
                    error: error
                });
            },
            getPictureDetail: function(id, success, error) {
                var data = {
                    id: id,
                    type: "picapp"
                };
                httpService.get({
                    r: "boutique/edit",
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
"use strict";

define("boutique/slide-add/controller", [ "app", "public/local/system", "public/local/app-search", "public/local/article-search", "./service", "public/local/http", "public/general/pub-sub", "public/general/directive/preview-img", "public/general/directive/set-file", "public/general/directive/popover", "public/general/directive/trigger-click", "public/general/directive/file-required", "public/general/directive/file-type", "public/general/directive/img-size", "public/local/service", "public/general/directive/form-reset", "public/general/directive/clear-img", "public/general/directive/submitting", "article/article-create/service", "public/general/form-validation" ], function(require, exports, module) {
    var app = require("app");
    var system = require("public/local/system");
    require("public/local/app-search");
    require("public/local/article-search");
    require("./service");
    require("public/general/directive/preview-img");
    require("public/general/directive/set-file");
    require("public/general/directive/popover");
    require("public/general/directive/trigger-click");
    require("public/general/directive/file-required");
    require("public/general/directive/file-type");
    require("public/general/directive/img-size");
    require("public/local/service");
    require("public/general/directive/form-reset");
    require("public/general/directive/clear-img");
    require("public/general/directive/submitting");
    require("article/article-create/service");
    var validationUtil = require("public/general/form-validation");
    app.controller("slideAddCtrl", [ "$scope", "$routeParams", "slideAddService", "articleCreateService", "publicService", function($scope, $routeParams, slideAddService, articleCreateService, publicService) {
        var APP_DETAIL = 0;
        //表示跳转到应用详情
        var ARTICLE = 1;
        //表示跳转到文章
        $scope.needAppCount = 1;
        $scope.needArticleCount = 1;
        $scope.introduceTemplateUrl = system.getTplAbsolutePath("tpl/public/app-introduce-edit.html");
        /**
         * 提交时，检测是否有十天内添加过的app，如果有，给予提示。
         * @type {Array}
         */
        $scope.repeatedApp = [];
        $scope.showRepeatedHint = false;
        initForm();
        if ($routeParams.id && $routeParams.id != "null") {
            slideAddService.getSlideDetail($routeParams.id, function(data) {
                $scope.slideForm.id = $routeParams.id;
                $scope.slideForm.release_time = data.release_time;
                $scope.slideForm.link = data.link;
                $scope.slideForm.title = data.title;
                $scope.slide.imgUrl = data.up_file;
                if ($scope.slideForm.link == APP_DETAIL) {
                    data.applications.forEach(function(app, index) {
                        $scope.addApp(app);
                    });
                } else if ($scope.slideForm.link == ARTICLE) {
                    articleCreateService.getArticleDetail(data.article_id, function(data) {
                        $scope.addArticle(data);
                    });
                }
            });
        }
        $scope.addSlide = function(formValidation) {
            $scope.submitted = true;
            validationUtil.setFormValidataion(formValidation);
            if (formValidation.$valid && !$scope.submitting && ($scope.addedApp.length > 0 || $scope.addedArticle.length > 0)) {
                if ($scope.slideForm.link == APP_DETAIL) {
                    $scope.repeatedApp = publicService.getRepeatedApp($scope.addedApp, $scope.slideForm.release_time, "IpadBoutiqueTurnPic");
                    if ($scope.repeatedApp.length === 0) {
                        $scope.confirmSubmit();
                    } else {
                        $scope.showRepeatedHint = true;
                    }
                } else {
                    $scope.confirmSubmit();
                }
            }
        };
        $scope.confirmSubmit = function() {
            $scope.submitting = true;
            if ($scope.slideForm.link == APP_DETAIL && $scope.addedApp.length == $scope.needAppCount) {
                $scope.slideForm.applications = JSON.stringify(publicService.getApplications($scope.addedApp));
                slideAddService.addSlide($scope.slideForm, function() {
                    initForm();
                    $scope.submitting = false;
                }, function() {
                    $scope.submitting = false;
                });
            } else if ($scope.slideForm.link == ARTICLE && $scope.addedArticle.length == $scope.needArticleCount) {
                $scope.slideForm.article_id = $scope.addedArticle[0].id;
                slideAddService.addSlide($scope.slideForm, function() {
                    initForm();
                    $scope.submitting = false;
                }, function() {
                    $scope.submitting = false;
                });
            }
        };
        /**
         * @method addApp
         * @description 添加app
         * @param {Object}app
         * @param {String} app.app_id||app.appId||app.APPID
         * @return {Object} result
         *  result.success {Boolean} true表示添加成功，false表示失败
         *  result.msg {String}
         */
        $scope.addApp = function(app) {
            var appId = publicService.getAppId(app);
            $scope.$broadcast("addedAppChanging", app);
            publicService.getAppDetail(appId, "turnpic", function(appDetail) {
                $scope.addedApp[0] = appDetail;
                $scope.addedApp[0].introduce = app.summary || appDetail.APPINTRO;
                //通过编辑进入页面时，app有summary
                $scope.$broadcast("addedAppChanged", appDetail);
            });
            return {
                success: true,
                msg: ""
            };
        };
        /**
         * @param article
         * @return {Object} result
         * result.success {Boolean} true表示添加成功，false表示失败
         * result.msg {String}
         */
        $scope.addArticle = function(article) {
            $scope.addedArticle[0] = article;
            $scope.$broadcast("addedArticleChanged");
            return {
                msg: "",
                success: true
            };
        };
        $scope.deleteApp = function() {
            $scope.addedApp = [];
            $scope.$broadcast("addedAppChanged", app);
        };
        $scope.deleteArticle = function(article) {
            $scope.addedArticle = [];
            $scope.$broadcast("addedArticleChanged");
        };
        $scope.getAddedApp = function() {
            return $scope.addedApp;
        };
        $scope.getAddedArticle = function() {
            return $scope.addedArticle;
        };
        /**
         * @param {Boolean} valid表示更新简介的表单的有效性
         * @param {Scope} childScope为ng-repeat指令创建的scope
         */
        $scope.updateIntroduce = function(valid, childScope) {
            var app = childScope.app;
            childScope.introduceSubmitted = true;
            if (valid) {
                app.introduce = app.tempIntroduce;
                childScope.deletePopover = true;
                childScope.introduceSubmitted = false;
            }
        };
        $scope.$on("formReseted", function() {
            $scope.slideForm.link = APP_DETAIL;
        });
        function initForm() {
            //与表单相关的信息
            $scope.slide = {
                imgUrl: "",
                set slidePicFiles(files) {
                    $scope.slideForm.up_file = files[0];
                    $scope.$digest();
                }
            };
            $scope.formReset = true;
            $scope.imgClear = true;
            //slideForm为提交到服务器的参数
            $scope.slideForm = {
                id: "",
                release_time: "",
                //时间戳格式
                link: "",
                title: "",
                up_file: "",
                //选择的轮播图文件
                applications: "",
                //[{appid:appval;extend_end:val},{}]，
                article_id: ""
            };
            $scope.submitted = false;
            $scope.addedApp = [];
            $scope.addedArticle = [];
        }
    } ]);
});
"use strict";

define("boutique/slide-add/service", [ "app", "public/local/http", "public/general/pub-sub" ], function(require, exports, module) {
    var app = require("app");
    require("public/local/http");
    var pubSub = require("public/general/pub-sub");
    app.service("slideAddService", [ "httpService", function(httpService) {
        return {
            /**
             * @param data
             * @param success
             * @param error
             */
            addSlide: function(data, success, error) {
                httpService.post({
                    r: "boutiqueTurnPic/create",
                    data: data,
                    success: function(data) {
                        pubSub.publish("businessSuccess", {
                            title: "编辑轮播图成功!",
                            msg: ""
                        });
                        success && success(data);
                    },
                    error: function() {
                        error && error(data);
                    }
                });
            },
            getSlideDetail: function(id, success, error) {
                var data = {
                    id: id,
                    type: "turnpic"
                };
                httpService.get({
                    r: "boutique/edit",
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
"use strict";

define("index/controller", [ "app", "./service", "public/general/storage", "public/local/http", "./directive", "public/general/pub-sub", "public/general/directive/alert", "public/local/system", "public/local/share" ], function(require) {
    var app = require("app");
    require("./service");
    require("./directive");
    var pubSub = require("public/general/pub-sub");
    require("public/local/http");
    require("public/general/directive/alert");
    var system = require("public/local/system");
    require("public/local/share");
    app.controller("appInfoCtrl", [ "$window", "$scope", "shareDataService", "systemInfoService", "httpService", function($window, $scope, shareDataService, systemInfoService, httpService) {
        pubSub.subscribe("serverError", function(topicInfo) {
            $scope.alertShow = true;
            $scope.alertType = "alert-danger";
            $scope.alertContent = "服务器出错啦！状态码:" + topicInfo.status + "请求接口:" + topicInfo.url;
        });
        pubSub.subscribe("jsonError", function(topicInfo) {
            $scope.alertShow = true;
            $scope.alertType = "alert-danger";
            $scope.alertContent = "服务器返回数据格式不正确！返回数据：" + topicInfo.response + ",请求接口：" + topicInfo.url;
        });
        pubSub.subscribe("businessError", function(topicInfo) {
            $scope.alertShow = true;
            $scope.alertType = "alert-danger";
            $scope.alertContent = topicInfo.title + topicInfo.msg;
        });
        pubSub.subscribe("businessSuccess", function(topicInfo) {
            $scope.alertShow = true;
            $scope.alertType = "alert-success";
            $scope.alertContent = topicInfo.title + topicInfo.msg;
        });
        $scope.name = "快用iPad版管理系统";
        $scope.version = "2.0";
        $scope.systems = [ {
            name: "快用PC端管理系统",
            action: "http://pc.kuaiyong.com/"
        } ];
        systemInfoService.getUserPermission().done(function(permission) {
            $scope.modules = permission.children;
            $scope.pages = $scope.modules[0].children;
        });
        systemInfoService.getUserInfo(function(user) {
            $scope.user = user.name;
        });
        $scope.logout = function() {
            systemInfoService.clearLocalUserPermission();
            systemInfoService.clearLocalUserInfo();
            $window.location.href = system.getRequestInterface("index/logout");
        };
        /**
         * 用来监听url的变化，显示对应的模块和菜单。
         */
        $scope.$on("$locationChangeStart", function(event, newUrl, oldUrl) {
            systemInfoService.getModuleAndPage(newUrl, function(moduleAndPage) {
                if (moduleAndPage) {
                    $scope.modules.forEach(function(module, index) {
                        if (module.id === moduleAndPage.module.id) {
                            module.active = "active";
                            $scope.pages = module.children;
                            module.children.forEach(function(page, index) {
                                if (page.id === moduleAndPage.page.id) {
                                    page.active = "active";
                                } else {
                                    page.active = "";
                                }
                            });
                        } else {
                            module.active = "";
                        }
                    });
                }
            });
        });
    } ]);
});
"use strict";

define("index/directive", [ "app" ], function(require, exports, module) {
    var app = require("app");
    app.directive("deleteDatePicker", [ function() {
        return {
            restrict: "A",
            link: function(scope, elem, attrs) {
                scope.$on("$locationChangeStart", function(event, newUrl, oldUrl) {
                    $("body .datetimepicker").remove();
                });
            }
        };
    } ]);
});
"use strict";

define("index/service", [ "app", "public/general/storage", "public/local/http" ], function(require, exports, module) {
    var app = require("app");
    var storage = require("public/general/storage");
    require("public/local/http");
    app.service("systemInfoService", [ "httpService", function(httpService) {
        var USER_INFO = "userInfo";
        var USER_PERMISSION = "userPermission";
        var userPermissionDeferred;
        return {
            getUserInfo: function(callback) {
                if (storage.has(USER_INFO)) {
                    callback(storage.get(USER_INFO));
                } else {
                    httpService.get({
                        r: "index/userinfo",
                        success: function(data) {
                            var user = {
                                id: data.id,
                                name: data.name,
                                email: data.email,
                                phone: data.phone
                            };
                            callback(user);
                            storage.store(USER_INFO, user);
                        }
                    });
                }
            },
            getUserPermission: function() {
                if (!userPermissionDeferred) {
                    userPermissionDeferred = $.Deferred();
                    if (storage.has(USER_PERMISSION)) {
                        userPermissionDeferred.resolve(storage.get(USER_PERMISSION));
                    } else {
                        httpService.get({
                            r: "index/role",
                            success: function(data) {
                                /**
                                 * 每个模块默认取第一个页面的链接。
                                 */
                                data.children = data.children || [];
                                data.children.forEach(function(module) {
                                    module.children = module.children || [];
                                    module.action = module.children[0] ? module.children[0].action : "";
                                });
                                userPermissionDeferred.resolve(data);
                                storage.store(USER_PERMISSION, data);
                            }
                        });
                    }
                }
                return userPermissionDeferred;
            },
            /**
             * @method clearLocalUserInfo 清空本地用户信息，调用此方法，下次获取用户信息时会从服务器获取
             */
            clearLocalUserInfo: function() {
                storage.remove(USER_INFO);
            },
            /**
             * @method clearLocalUserPermission 清空本地用户权限信息，调用此方法，下次获取用户权限信息时会从服务器获取
             */
            clearLocalUserPermission: function() {
                storage.remove(USER_PERMISSION);
            },
            /**
             * @method getModuleAndPage 根据url得到页面信息和页面所属模块信息。然后调用callback.如果没找到对应模块和页面，传参null给callback
             * @param {String} url
             * @param {Function} callback获取到模块和页面信息后执行的回调
             * @param {Object} obj callback的参数
             * @param {Object} obj.page 页面信息
             * @param {Object} obj.module 模块信息
             */
            getModuleAndPage: function(url, callback) {
                var moduleAndPage = null;
                /**
                 * 由于 轮播图页面等的action为/boutique/slide-add/null，url 部分为/boutique/slide-add/:id'
                 * 为了让其匹配。判断action的最后部分是否为null，为null则去掉
                 * @param action
                 */
                function getHandledAction(action) {
                    if (action.substring(action.length - 4, action.length) == "null") {
                        return action.substring(0, action.length - 4);
                    }
                    return action;
                }
                this.getUserPermission().done(function(userPermission) {
                    userPermission.children.some(function(module, index) {
                        var moduleFinded = false;
                        module.children.some(function(page, index) {
                            var pageFined = false;
                            if (url.indexOf(getHandledAction(page.action)) != -1) {
                                pageFined = true;
                                moduleFinded = true;
                                moduleAndPage = {
                                    page: page,
                                    module: module
                                };
                            }
                            return pageFined;
                        });
                        return moduleFinded;
                    });
                    callback(moduleAndPage);
                });
            }
        };
    } ]);
});
/**
 * seajs的启动模块，也是整个系统的启动模块。
 */
"use strict";

define("main", [ "app", "route" ], function(require) {
    var app = require("app");
    var route = require("route");
    angular.bootstrap(document, [ app.name ]);
});
"use strict";

define("public/general/app-cache", [], function(require, exports, module) {});
"use strict";

define("public/general/date-util", [], function(require, exports, module) {
    return {
        /**
         * @method parse
         * @description
         * @param {String}date 任意格式的日期字符串
         * @return {Date} 日期对象
         */
        parse: function(date) {
            date = date.replace(/-/g, "/");
            return new Date(date);
        }
    };
});
"use strict";

define("public/general/directive/alert", [ "app", "public/local/system" ], function(require, exports, module) {
    var app = require("app");
    var system = require("public/local/system");
    app.directive("alert", [ "$timeout", function($timeout) {
        return {
            restrict: "E",
            replace: true,
            transclude: true,
            scope: {
                show: "=",
                showType: "=",
                noAutoHide: "="
            },
            templateUrl: system.getTplAbsolutePath("tpl/directive/alert.html"),
            link: function(scope, elem, attrs) {
                //                scope.showType = scope.showType || "alert-danger";
                var $elem = $(elem);
                var showTime = parseInt(attrs.showTime || 0);
                scope.hideAlert = function() {
                    scope.show = false;
                };
                scope.$watch("show", function() {
                    if (scope.show && !scope.noAutoHide) {
                        $timeout(function() {
                            scope.show = false;
                        }, showTime || 5e3);
                    }
                });
            }
        };
    } ]);
});
/**
 * 当ng-src绑定的属性为""时，img的src不会更新 为" "（包含空格）时，会更新。
 */
"use strict";

define("public/general/directive/clear-img", [ "app" ], function(require, exports, module) {
    var app = require("app");
    app.directive("clearImg", function() {
        return {
            restrict: "A",
            scope: {
                clear: "="
            },
            link: function(scope, elem, attrs) {
                scope.$watch("clear", function() {
                    if (scope.clear) {
                        $(elem)[0].src = "";
                        scope.clear = false;
                    }
                });
            }
        };
    });
});
"use strict";

define("public/general/directive/confirm-hint", [ "app" ], function(require, exports, module) {
    var app = require("app");
    var $modal = $("#modal-hint");
    $modal.modal({
        keyboard: false,
        show: false,
        backdrop: false
    });
    app.directive("confirmHint", function() {
        return {
            restrict: "A",
            link: function(scope, elem, attrs) {
                var $elem = $(elem);
                var confirmed = false;
                document.addEventListener("click", function(event) {
                    if ($elem[0] === event.target) {
                        if (!confirmed) {
                            event.stopPropagation();
                            $modal.find(".modal-title").html(attrs.modalTitle);
                            $modal.find(".modal-body").html(attrs.modalContent);
                            $modal.modal("show");
                            $modal.find(".confirm")[0].onclick = function() {
                                confirmed = true;
                                $modal.modal("hide");
                                event.target.click();
                            };
                        } else {
                            confirmed = false;
                        }
                    }
                }, true);
            }
        };
    });
});
"use strict";

define("public/general/directive/date-picker", [ "app", "public/local/system", "public/general/util" ], function(require, exports, module) {
    var app = require("app");
    var system = require("public/local/system");
    var util = require("public/general/util");
    app.directive("datePicker", function() {
        return {
            restrict: "E",
            replace: "true",
            scope: true,
            templateUrl: system.getTplAbsolutePath("tpl/directive/date-picker.html"),
            compile: function(elem, attrs) {
                var $elem = $(elem);
                var validateProp = {};
                for (var key in attrs) {
                    if (attrs.hasOwnProperty(key)) {
                        if (key.match(/^ng/) || key === "required" || key === "name" || key === "placeholder") {
                            validateProp[attrs.$attr[key]] = attrs[key];
                        }
                    }
                }
                $elem.find("input").attr(validateProp);
                return function(scope, elem, attrs) {
                    $(elem).attr("data-date", new Date().toJSON().substring(0, 10));
                    var date = $(elem).datetimepicker({
                        language: "zh-CN",
                        weekStart: 1,
                        todayBtn: 1,
                        autoclose: 1,
                        todayHighlight: 1,
                        startView: attrs.startView || 2,
                        minView: attrs.minView || 2,
                        forceParse: 0,
                        showMeridian: 1
                    });
                    $(".datetimepicker").find(".next").html('<i class="glyphicon glyphicon-arrow-right"></i>');
                    $(".datetimepicker").find(".prev").html('<i class="glyphicon glyphicon-arrow-left"></i>');
                    date.on("changeDate", function(event) {
                        scope.$parent.$apply(function() {
                            util.setPropertyValue(scope.$parent, attrs.ngModel, $(elem).find("input").val());
                        });
                    });
                };
            }
        };
    });
});
"use strict";

define("public/general/directive/directive", [], function(require, exports, module) {});
"use strict";

define("public/general/directive/drag-sort", [ "app" ], function(require, exports, module) {
    var app = require("app");
    app.directive("dragId", function() {
        return {
            restrict: "A",
            link: function(scope, elem, attrs) {
                $(elem).attr("draggable", "true");
            }
        };
    });
    app.directive("dragSort", function() {
        return {
            restrict: "A",
            scope: {
                dragCompleted: "="
            },
            link: function(scope, elem, attrs) {
                var $elem = $(elem);
                //在一次拖拽过程中，除了被拖拽元素之外的其他元素的先后顺序是不会变化的。所以判断此次拖拽是否发生了元素重排只需要判断被拖拽元素的位置是否改变
                var dragNode;
                //被拖拽的节点，每次拖拽结束置为空
                var originalPosition = -1;
                //
                var selector = "[" + attrs.dragSort + "]";
                $elem.delegate(selector, "dragstart", function(event) {
                    var rawEvent = event.originalEvent;
                    dragNode = event.currentTarget;
                    originalPosition = getPosition(dragNode);
                    $(dragNode).addClass("moving");
                    //不知道是不是firefox的bug,非得调用setData方法才有拖拽效果。才能触发dragenter,dragend等后续拖拽事件。
                    rawEvent.dataTransfer.setData("text", "");
                    //rawEvent.dataTransfer.setDragImage(rawEvent.target, 0, 0);
                    rawEvent.dataTransfer.effectAllowed = "move";
                });
                $elem.delegate(selector, "dragover", function(event) {
                    var goalNode;
                    //如果被拖拽的节点是$elem的子元素，执行下面的逻辑
                    if (dragNode) {
                        goalNode = event.currentTarget;
                        if (goalNode === dragNode) {
                            return;
                        }
                        var where = dragNode.compareDocumentPosition(goalNode) === 2 ? "before" : "after";
                        $(goalNode)[where](dragNode);
                    }
                });
                $elem.delegate(selector, "dragend", function(event) {
                    var sortList = [];
                    $(dragNode).removeClass("moving");
                    //如果发生了顺序重排或者强制认为只要拖拽即发生顺序重拍
                    if (originalPosition !== getPosition(dragNode) || "forceRefresh" in attrs) {
                        $elem.children().attr("data-remove", "");
                        $elem.find(selector).each(function(index, value) {
                            sortList.push({
                                id: value.getAttribute(attrs.dragSort),
                                sort: index + 1
                            });
                        });
                        scope.$apply(function() {
                            scope.dragCompleted(sortList, attrs.dragParam, dragNode.getAttribute(attrs.dragSort));
                        });
                    }
                    dragNode = null;
                    originalPosition = -1;
                });
                /**
                 * 得到dragNode节点的位置.从1开始计数
                 * @param dragNode
                 * @returns {*}
                 */
                function getPosition(dragNode) {
                    var position;
                    $elem.find(selector).each(function(index, value) {
                        if (value.getAttribute(attrs.dragSort) === dragNode.getAttribute(attrs.dragSort)) {
                            position = index + 1;
                        }
                    });
                    return position;
                }
            }
        };
    });
});
"use strict";

define("public/general/directive/editor", [ "app", "public/local/system", "public/general/util", "../jquery-plugin/editor", "public/local/http" ], function(require, exports, module) {
    var app = require("app");
    var system = require("public/local/system");
    var util = require("public/general/util");
    require("../jquery-plugin/editor");
    require("public/local/http");
    function initToolbarBootstrapBindings() {
        var fonts = [ "Serif", "Sans", "Arial", "Arial Black", "Courier", "Courier New", "Comic Sans MS", "Helvetica", "Impact", "Lucida Grande", "Lucida Sans", "Tahoma", "Times", "Times New Roman", "Verdana" ], fontTarget = $(".font-set").siblings(".dropdown-menu");
        $.each(fonts, function(idx, fontName) {
            fontTarget.append($('<li><a data-edit="fontName ' + fontName + '" style="font-family:\'' + fontName + "'\">" + fontName + "</a></li>"));
        });
        $("a[title]").tooltip({
            container: "body"
        });
        $(".dropdown-menu input").click(function() {
            return false;
        }).change(function() {
            $(this).parent(".dropdown-menu").siblings(".dropdown-toggle").dropdown("toggle");
        }).keydown("esc", function() {
            this.value = "";
            $(this).change();
        });
        $("[data-role=magic-overlay]").each(function() {
            var overlay = $(this), target = $(overlay.data("target"));
            overlay.css("opacity", 0).css("position", "absolute").offset(target.offset()).width(target.outerWidth()).height(target.outerHeight());
        });
    }
    app.directive("editor", [ "$compile", "httpService", function($compile, httpService) {
        return {
            restrict: "E",
            replace: true,
            scope: true,
            templateUrl: system.getTplAbsolutePath("tpl/directive/editor.html"),
            compile: function(elem, attrs) {
                var $elem = $(elem);
                var link = function(scope, elem, attrs) {
                    var $editor = $elem.find("#editor");
                    initToolbarBootstrapBindings();
                    $editor.wysiwyg();
                    $editor.on("fileSelected", function(event, fileList) {
                        var file = fileList[0];
                        if (file && /image/.test(file.type)) {
                            httpService.post({
                                r: "index/imageUpload",
                                data: {
                                    up_file: fileList[0]
                                },
                                success: function(result) {
                                    $editor.trigger("fileUploaded", [ result.image_url ]);
                                }
                            });
                        }
                    });
                    $editor.on("editorContentChanged", function(event, editorContent) {
                        scope.$parent.$apply(function() {
                            $elem.find("textarea").html(editorContent);
                            util.setPropertyValue(scope.$parent, attrs.ngModel, editorContent);
                        });
                    });
                    scope.$parent.$watch(attrs.ngModel, function() {
                        //当通过编辑进入此页面时，把model的值同步到编辑器中。
                        var editorContent = $editor.cleanHtml();
                        var modelValue = util.getPropertyValue(scope.$parent, attrs.ngModel);
                        if (modelValue !== editorContent) {
                            $editor.html(modelValue);
                        }
                    });
                };
                var validateProp = {};
                for (var key in attrs) {
                    if (attrs.hasOwnProperty(key)) {
                        if (key.match(/^ng/) || key === "required" || key === "name") {
                            validateProp[attrs.$attr[key]] = attrs[key];
                        }
                    }
                }
                $elem.find("textarea").attr(validateProp);
                return link;
            }
        };
    } ]);
});
"use strict";

define("public/general/directive/file-required", [ "app", "public/general/form-validation" ], function(require, exports, module) {
    var app = require("app");
    var validationUtil = require("public/general/form-validation");
    app.directive("fileRequired", function() {
        return {
            restrict: "A",
            link: function(scope, elem, attrs) {
                var $elem = $(elem);
                var formScope = angular.element(elem).parent("form").scope();
                //表单所在scope对象
                var formName = $elem.parents("form").prop("name");
                var inputName = $elem.prop("name");
                var inputValidation = formScope[formName][inputName];
                var $error = inputValidation.$error;
                $error.required = true;
                validationUtil.setFieldValidation(inputValidation);
                validationUtil.setFormValidataion(formScope[formName]);
                $elem.bind("change", function() {
                    var file = $elem[0].files[0];
                    formScope.$apply(function() {
                        if (file) {
                            formScope[formName][inputName].$error.required = false;
                        } else {
                            formScope[formName][inputName].$error.required = true;
                        }
                        validationUtil.setFieldValidation(inputValidation);
                        validationUtil.setFormValidataion(formScope[formName]);
                    });
                });
            }
        };
    });
});
"use strict";

define("public/general/directive/file-type", [ "app", "public/general/form-validation" ], function(require, exports, module) {
    var app = require("app");
    var validationUtil = require("public/general/form-validation");
    app.directive("fileType", function() {
        return {
            restrict: "A",
            link: function(scope, elem, attrs) {
                var $elem = $(elem);
                var formScope = angular.element(elem).parent("form").scope();
                //表单所在scope对象
                var formName = $elem.parents("form").prop("name");
                var inputName = $elem.prop("name");
                var inputValidation = formScope[formName][inputName];
                var $error = inputValidation.$error;
                $elem.bind("change", function() {
                    var file = $elem[0].files[0];
                    formScope.$apply(function() {
                        if (file) {
                            if (file.type.indexOf(attrs.fileType) === -1) {
                                $error.fileType = true;
                            } else {
                                $error.fileType = false;
                            }
                        } else {
                            $error.fileType = false;
                        }
                        validationUtil.setFieldValidation(inputValidation);
                        validationUtil.setFormValidataion(formScope[formName]);
                    });
                });
            }
        };
    });
});
"use strict";

define("public/general/directive/form-reset", [ "app" ], function(require, exports, module) {
    var app = require("app");
    app.directive("formReset", function() {
        return {
            restrict: "A",
            scope: {
                reset: "="
            },
            link: function(scope, elem, attrs) {
                scope.$watch("reset", function() {
                    if (scope.reset) {
                        $(elem)[0].reset();
                        scope.reset = false;
                        scope.$emit("formReseted");
                    }
                });
            }
        };
    });
});
"use strict";

define("public/general/directive/img-size", [ "app", "public/general/form-validation" ], function(require, exports, module) {
    var app = require("app");
    var validationUtil = require("public/general/form-validation");
    app.directive("imgSize", function() {
        return {
            restrict: "A",
            link: function(scope, elem, attrs) {
                var $elem = $(elem);
                var formScope = angular.element(elem).parent("form").scope();
                //表单所在scope对象
                var formName = $elem.parents("form").prop("name");
                var inputName = $elem.prop("name");
                var inputValidation = formScope[formName][inputName];
                var $error = inputValidation.$error;
                $elem.bind("change", function() {
                    var file = $elem[0].files[0];
                    var imgWidth, imgHeight;
                    if (file && file.type.indexOf("image") != -1) {
                        var image = new Image();
                        var reader = new FileReader();
                        image.onload = function() {
                            imgWidth = image.naturalWidth;
                            imgHeight = image.naturalHeight;
                            setImgValidation();
                        };
                        reader.addEventListener("load", function(evt) {
                            image.src = evt.target.result;
                        });
                        reader.readAsDataURL(file);
                    } else {
                        formScope.$apply(function() {
                            formScope[formName][inputName].$error.imgSize = false;
                            validationUtil.setFieldValidation(inputValidation);
                            validationUtil.setFormValidataion(formScope[formName]);
                        });
                    }
                    function setImgValidation() {
                        var realImgSize = imgWidth + "*" + imgHeight;
                        formScope.$apply(function() {
                            if (realImgSize !== attrs["imgSize"].trim()) {
                                formScope[formName][inputName].$error.imgSize = true;
                            } else {
                                formScope[formName][inputName].$error.imgSize = false;
                            }
                            validationUtil.setFieldValidation(inputValidation);
                            validationUtil.setFormValidataion(formScope[formName]);
                        });
                    }
                });
            }
        };
    });
});
"use strict";

define("public/general/directive/pagination", [ "app", "public/local/system", "public/local/http" ], function(require, exports, module) {
    var app = require("app");
    var system = require("public/local/system");
    require("public/local/http");
    app.directive("pagination", [ "httpService", function(httpService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: system.getTplAbsolutePath("tpl/directive/pagination.html"),
            scope: {
                //                searchForm: "=",
                //                searchInterface: "=",
                //                goPage: "=",
                paginationScope: "="
            },
            link: function(scope, elem, attrs) {
                var $elem = $(elem);
                scope.paginationScope = scope;
                /**
                 * @param {Number|Boolean|undefined} page page 为boolean类型时，只能为false。这时不做任何处理；如果page为undefined。则page按照当前的页码处理
                 */
                scope.goPage = function(page) {
                    if (page === false) {
                        return;
                    }
                    if (page === undefined) {
                        scope.searchForm.page = scope.searchForm.page || 1;
                    } else if (page) {
                        scope.searchForm.page = page;
                    }
                    scope.$emit("searchStart");
                    httpService.get({
                        r: scope.searchInterface,
                        data: scope.searchForm,
                        success: function(data) {
                            handleSearchResult(data);
                            scope.$emit("searchEnd", data);
                        },
                        error: function(data) {
                            scope.$emit("searchFail", data);
                        }
                    });
                };
                if (scope.autoSearch) {
                    scope.goPage = 1;
                }
                /**
                 * @method handleSearchResult
                 * @description 对含有分页数据的查询结果作统一处理,在每条数据加上order属性。表示此条记录的序号
                 * @param {Object} data
                 * @param {Number|String}data.count 查询的总记录数
                 * @param {Number|String}data.page 当前页码
                 * @param {Number|String}data.pageSize 每页的记录数
                 */
                function handleSearchResult(data) {
                    scope.searchResult = data;
                    scope.searchResult.pageCount = parseInt((parseInt(data.count) + data.pageSize - 1) / data.pageSize);
                    scope.searchResult.pageInfo = getShowPageRange(scope.searchResult.pageCount, data.page);
                    angular.forEach(data, function(value, key) {
                        if (angular.isArray(value)) {
                            value.forEach(function(item, index) {
                                item.order = scope.searchResult.pageSize * scope.searchResult.page - scope.searchResult.pageSize + 1 + index;
                            });
                        }
                    });
                }
                /**
                 * @method getShowPageRange
                 * @description 得到显示的页面范围 比如有100页.当前页为20，则分页栏显示的是15-25页。
                 * @param {Number} pageCount 总页数
                 * @param {Number} currentPage 当前页
                 * @return {Object} pageInfo
                 *  pageInfo.pageRange{Array}元素值为显示的页码
                 *  pageInfo.last 上一页的页码 如果没有可用 为false
                 *  pageInfo.next 下一页的页码 如果没有可用 为false
                 */
                function getShowPageRange(pageCount, currentPage) {
                    var startPage = currentPage - 5;
                    if (startPage < 1) {
                        startPage = 1;
                    }
                    var showPageArray = [];
                    for (var i = 0; i < 10 && startPage + i <= pageCount; ++i) {
                        showPageArray.push(startPage + i);
                    }
                    return {
                        pageRange: showPageArray,
                        last: currentPage == 1 ? false : currentPage - 1,
                        next: currentPage == pageCount ? false : currentPage + 1
                    };
                }
            }
        };
    } ]);
});
"use strict";

define("public/general/directive/popover", [ "app" ], function(require, exports, module) {
    var app = require("app");
    var count = 0;
    function getCount() {
        return count++;
    }
    app.directive("popover", [ "$compile", function($compile) {
        return {
            restrict: "A",
            scope: {
                close: "="
            },
            link: function(scope, elem, attrs) {
                var contentId = "popover-" + getCount();
                var $elem = $(elem);
                var style = attrs.style || "";
                var content = $(attrs.selector).html();
                $elem.popover({
                    html: true,
                    content: "<div id='" + contentId + "'style='" + style + "'></div>"
                });
                $elem.on("shown.bs.popover", function() {
                    $("#" + contentId).append($compile(content)(scope.$parent));
                });
                scope.$watch("close", function() {
                    if (scope.close) {
                        $elem.popover("hide");
                        scope.close = false;
                    }
                });
            }
        };
    } ]);
});
"use strict";

define("public/general/directive/prevent-spread", [ "app" ], function(require, exports, module) {
    var app = require("app");
    app.directive("preventSpread", function() {
        return {
            restrict: "A",
            link: function(scope, elem, attrs) {
                var $elem = $(elem);
                $elem.bind(attrs.preventSpread, function(event) {
                    event.stopPropagation();
                });
            }
        };
    });
});
"use strict";

define("public/general/directive/preview-img", [ "app", "public/local/system" ], function(require, exports, module) {
    var app = require("app");
    var system = require("public/local/system");
    app.directive("previewImg", function() {
        return {
            restrict: "A",
            link: function(scope, elem, attrs) {
                var $elem = $(elem);
                var $img = $(attrs.previewImg);
                $elem.bind("change", function(event) {
                    var file = $elem.prop("files")[0];
                    if (file && file.type.indexOf("image") !== -1) {
                        var reader = new FileReader();
                        reader.addEventListener("load", function(evt) {
                            $img.prop("src", evt.target.result);
                        });
                        reader.readAsDataURL(file);
                    } else {
                        $img.prop("src", "");
                    }
                });
            }
        };
    });
});
"use strict";

define("public/general/directive/set-file", [ "app", "public/general/util", "public/local/system" ], function(require, exports, module) {
    var app = require("app");
    var util = require("public/general/util");
    var system = require("public/local/system");
    /**
     * 此指令给父scope设置属性值
     * setFile的值为父scope的属性名。
     * @example 比如setFile="a.b";则为父scope.a.b设置为此文件结点的files
     */
    app.directive("setFile", function() {
        return {
            restrict: "A",
            link: function(scope, elem, attrs) {
                var $elem = $(elem);
                $elem.bind("change", function() {
                    util.setPropertyValue(scope, attrs.setFile, $elem[0].files);
                });
            }
        };
    });
});
"use strict";

define("public/general/directive/submitting", [ "app" ], function(require, exports, module) {
    var app = require("app");
    app.directive("submitting", function() {
        return {
            restrict: "A",
            scope: {
                isSubmitting: "="
            },
            link: function(scope, elem, attrs) {
                var $elem = $(elem);
                //提交状态的提示
                var hint = attrs.submitting || "提交中...";
                //正常情况下的提示
                var normalHint = $elem.val() || $elem.html();
                var method;
                if ($elem[0].nodeName === "BUTTON") {
                    method = "html";
                } else if ($elem[0].nodeName === "INPUT") {
                    method = "val";
                }
                scope.$watch("isSubmitting", function() {
                    if (scope.isSubmitting) {
                        $elem[method](hint);
                        $elem.attr("disabled", "disabled");
                    } else {
                        $elem[method](normalHint);
                        $elem.removeAttr("disabled");
                    }
                });
            }
        };
    });
});
"use strict";

define("public/general/directive/tooltip", [ "app" ], function(require, exports, module) {
    var app = require("app");
    app.directive("tooltip", function() {
        return {
            restrict: "A",
            link: function(scope, elem, attrs) {
                var $elem = $(elem);
                var charNum = attrs.tooltip || 30;
                var observer = new MutationObserver(function() {
                    var content = $elem.html().trim();
                    if (content.replace(/\.\.\.$/, "").length > charNum) {
                        $elem.html(content.substring(0, charNum) + "...");
                    }
                });
                observer.observe($elem[0].childNodes[0], {
                    characterData: true
                });
                $elem.tooltip({
                    delay: {
                        show: 0,
                        hide: 0
                    }
                });
            }
        };
    });
});
"use strict";

define("public/general/directive/trigger-click", [ "app" ], function(require, exports, module) {
    var app = require("app");
    app.directive("triggerClick", function() {
        return {
            restrict: "A",
            link: function(scope, elem, attrs) {
                var $elem = $(elem);
                $elem.bind("click", function() {
                    $(attrs.triggerClick).click();
                });
            }
        };
    });
});
"use strict";

/**
 * @fileOverview 图片的幻灯片效果
 */
define("public/general/directive/view-img", [ "app" ], function(require, exports, module) {
    var app = require("app");
    var $modal = $("#modal-view-img");
    $modal.modal({
        show: false
    });
    app.directive("viewImg", function() {
        return {
            restrict: "A",
            link: function(scope, elem, attrs) {
                var $elem = $(elem);
                $elem.bind("click", function() {
                    if ($elem.attr("src")) {
                        $modal.find(".modal-title").html(attrs.imgTitle);
                        $modal.find(".modal-body img").attr("src", $elem.attr("src"));
                        $modal.modal("show");
                    }
                });
            }
        };
    });
});
/**
 * 发布订阅模式
 */
"use strict";

define("public/general/form-validation", [], function(require, exports, module) {
    return {
        /**
         * @method setFieldValidation 为angularjs表单的字段设置校验信息,根据field.$error对象设置field.$valid,field.$invalid
         * @param  {Object}  field angularjs创建的字段校验信息对象
         */
        setFieldValidation: function(field) {
            field.$valid = true;
            field.$invalid = false;
            for (var key in field.$error) {
                if (field.$error.hasOwnProperty(key)) {
                    if (field.$error[key]) {
                        field.$valid = false;
                        field.$invalid = true;
                    }
                }
            }
        },
        /**
         *
         * @method setFormValidataion 为angularjs表单设置校验信息，根据form各个字段的$valid值设置form的$valid和$invalid.
         * @param form angularjs创建的表单校验信息对象
         */
        setFormValidataion: function(form) {
            form.$valid = true;
            form.$invalid = false;
            for (var key in form) {
                if (form.hasOwnProperty(key) && key.substring(0, 1) !== "$") {
                    if (form[key].$invalid) {
                        form.$valid = false;
                        form.$invalid = true;
                    }
                }
            }
        }
    };
});
"use strict";

define("public/general/jquery-plugin/editor", [], function(require, exports, module) {
    (function($) {
        var readFileIntoDataUrl = function(fileInfo) {
            var loader = $.Deferred(), fReader = new FileReader();
            fReader.onload = function(e) {
                loader.resolve(e.target.result);
            };
            fReader.onerror = loader.reject;
            fReader.onprogress = loader.notify;
            fReader.readAsDataURL(fileInfo);
            return loader.promise();
        };
        /**
         * @method handleContent
         * @description 对html进行处理
         * 1.div替换成p
         * 2.html如果不是以p开头，添加p
         * 3.消除所有的br
         * 4.&#8203;替换成空
         * 5.以<p>(&#8203;)?\s+</p>开头时替换为空
         * 6.将iframe的src进行替换，去掉广告
         * @param {String}html
         * @return {String}
         */
        function handleContent(html) {
            //8203转16进制200b;
            html = html.trim();
            if (html) {
                html = html.replace(/<div/g, "<p").replace(/<\/div>/g, "</p>");
                html = html.replace(/<(\/)?br>/g, "");
                html = html.replace(/\u200b/g, "");
                html = html.replace(/<p>\s*<\/p>/g, "");
                html = html.replace(/class=['"]info-center['"]/g, "");
                html = html.replace(/<p((.(?!<p|class=|<\/p))*)(?=<img|<iframe)/g, "<p class='info-center' $1");
                if (html && !/^<p/.test(html)) {
                    html = html.replace(/<p/, "</p><p");
                    //只替换第一个匹配的p标签
                    html = "<p>" + html;
                    if (!/<\/p>/.test(html)) {
                        html += "</p>";
                    }
                }
                html = html.replace(/(<iframe[^>]*src=['"])http:\/\/player.youku.com\/embed\/(.+)(['"][^>]*>)/g, "$1http://pic.wanmeiyueyu.com/upload/youkukilledrelate.html#$2$3");
            }
            return html;
        }
        $.fn.cleanHtml = function() {
            return handleContent($(this).hasClass("source-mode") ? $(this).text() : $(this).html());
        };
        $.fn.wysiwyg = function(userOptions) {
            var editor = this, selectedRange, options, toolbarBtnSelector, updateToolbar = function() {
                if (options.activeToolbarClass) {
                    $(options.toolbarSelector).find(toolbarBtnSelector).each(function() {
                        var command = $(this).data(options.commandRole);
                        if (document.queryCommandState(command)) {
                            $(this).addClass(options.activeToolbarClass);
                        } else {
                            $(this).removeClass(options.activeToolbarClass);
                        }
                    });
                }
            }, execCommand = function(commandWithArgs, valueArg) {
                var commandArr = commandWithArgs.split(" "), command = commandArr.shift(), args = commandArr.join(" ") + (valueArg || "");
                var result = document.execCommand(command, 0, args);
                updateToolbar();
                return result;
            }, bindHotkeys = function(hotKeys) {
                $.each(hotKeys, function(hotkey, command) {
                    editor.keydown(hotkey, function(e) {
                        if (editor.attr("contenteditable") && editor.is(":visible")) {
                            e.preventDefault();
                            e.stopPropagation();
                            execCommand(command);
                        }
                    }).keyup(hotkey, function(e) {
                        if (editor.attr("contenteditable") && editor.is(":visible")) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    });
                });
            }, getCurrentRange = function() {
                var sel = window.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    return sel.getRangeAt(0);
                }
            }, saveSelection = function() {
                selectedRange = getCurrentRange();
            }, restoreSelection = function() {
                var selection = window.getSelection();
                if (selectedRange) {
                    try {
                        selection.removeAllRanges();
                    } catch (ex) {
                        document.body.createTextRange().select();
                        document.selection.empty();
                    }
                    selection.addRange(selectedRange);
                }
            }, //                insertFiles = function (files) {
            //                    editor.focus();
            //                    $.each(files, function (idx, fileInfo) {
            //                        if (/^image\//.test(fileInfo.type)) {
            //                            $.when(readFileIntoDataUrl(fileInfo)).done(function (dataUrl) {
            //                                execCommand('insertimage', dataUrl);
            //                            }).fail(function (e) {
            //                                options.fileUploadError("file-reader", e);
            //                            });
            //                        } else {
            //                            options.fileUploadError("unsupported-file-type", fileInfo.type);
            //                        }
            //                    });
            //                },
            insertFiles = function(url) {
                editor.focus();
                execCommand("inserthtml", "<p><img src='" + url + "' /></p>");
            }, markSelection = function(input, color) {
                restoreSelection();
                if (document.queryCommandSupported("hiliteColor")) {
                    document.execCommand("hiliteColor", 0, color || "transparent");
                }
                saveSelection();
                input.data(options.selectionMarker, color);
            }, bindToolbar = function(toolbar, options) {
                toolbar.find(toolbarBtnSelector).click(function() {
                    restoreSelection();
                    editor.focus();
                    execCommand($(this).data(options.commandRole));
                    saveSelection();
                });
                toolbar.find("[data-toggle=dropdown]").click(restoreSelection);
                toolbar.find("input[type=text][data-" + options.commandRole + "]").on("webkitspeechchange change", function() {
                    var newValue = this.value;
                    /* ugly but prevents fake double-calls due to selection restoration */
                    this.value = "";
                    restoreSelection();
                    if (newValue) {
                        editor.focus();
                        execCommand($(this).data(options.commandRole), newValue);
                    }
                    saveSelection();
                }).on("focus", function() {
                    var input = $(this);
                    if (!input.data(options.selectionMarker)) {
                        markSelection(input, options.selectionColor);
                        input.focus();
                    }
                }).on("blur", function() {
                    var input = $(this);
                    if (input.data(options.selectionMarker)) {
                        markSelection(input, false);
                    }
                });
                toolbar.find("input[type=file][data-" + options.commandRole + "]").change(function() {
                    restoreSelection();
                    if (this.type === "file" && this.files && this.files.length > 0) {
                        //insertFiles(this.files);
                        editor.trigger("fileSelected", [ this.files ]);
                    }
                    saveSelection();
                    this.value = "";
                });
                editor.on("fileUploaded", function(event, url) {
                    insertFiles(url);
                });
                toolbar.find("[data-operation='full-screen']").on("click", function() {
                    $("#editor-zone").toggleClass("full-screen");
                    if ($("#editor-zone").hasClass("full-screen")) {
                        $("body").css({
                            overflow: "hidden"
                        });
                    } else {
                        $("body").css({
                            overflow: ""
                        });
                    }
                });
                toolbar.find("[data-operation=source-mode]").on("click", function() {
                    editor.toggleClass("source-mode");
                    var editorContent;
                    var lessReg = /</g;
                    var escapeLessReg = /&lt;/g;
                    var greatReg = />/g;
                    var escapeGreatReg = /&gt;/g;
                    if (editor.hasClass("source-mode")) {
                        $(this).attr("data-original-title", "源码模式");
                        toolbar.find(toolbarBtnSelector).addClass("disabled");
                        toolbar.find("[data-toggle],#pictureBtn").addClass("disabled");
                        toolbar.find("[type=file]").attr("disabled", "");
                        editorContent = handleContent(editor.html());
                        editorContent = editorContent.replace(/&/g, "&amp;");
                        //这么做是为了用户使用源码模式编辑的时候看起来方便一点。
                        editorContent = editorContent.replace(/(<p[^>]*>)/g, "$1&nbsp;&nbsp;");
                        editorContent = editorContent.replace(lessReg, "<br/>&lt;").replace(greatReg, "&gt;<br/>");
                        editor.focus();
                        editor.html("");
                        execCommand("insertHtml", editorContent);
                    } else {
                        $(this).attr("data-original-title", "编辑模式");
                        toolbar.find(toolbarBtnSelector).removeClass("disabled");
                        toolbar.find("[data-toggle],#pictureBtn,[type=file]").removeClass("disabled");
                        toolbar.find("[type=file]").removeAttr("disabled");
                        editorContent = editor.text();
                        //感觉insertHTML有问题,调用insertHtml时，如果源码有空格。空格被转换成了&nbsp;这里将源码中的多个空格替换为一个
                        //在源码模式下编辑时，键入连续的空格不知道为什么编码总是按照32,160出现。而160即为&nbsp;html解析器不会忽略。所以这里手动去掉。
                        editorContent = editorContent.replace(/[\u00a0\u0020\u0009]+/g, " ");
                        //将"<p> a"替换为"<p>a"
                        editorContent = editorContent.replace(/>[\u00a0\u0020\u0009]{1,2}/g, ">");
                        editor.focus();
                        editor.html("");
                        execCommand("insertHtml", editorContent);
                    }
                });
                /**
                     * 如果编辑器的内容为空，添加占位符
                     */
                function addPlaceholderIfEmpty() {
                    if (editor.html().replace(/\s+/g, "") === "") {
                        execCommand("insertHtml", "<p>&#8203;</p>");
                    }
                }
                //监听编辑器内内容的变化
                (function() {
                    var observer = new MutationObserver(function(event) {
                        addPlaceholderIfEmpty();
                        editor.trigger("editorContentChanged", [ editor.cleanHtml() ]);
                    });
                    var options = {
                        subtree: true,
                        characterData: true,
                        childList: true,
                        attributes: true
                    };
                    observer.observe(editor[0], options);
                })();
                //                    editor.bind("focusout", function () {
                //
                //                    });
                editor.bind("keypress", function(event) {
                    addPlaceholderIfEmpty();
                });
            }, initFileDrops = function() {
                editor.on("dragenter dragover", false).on("drop", function(e) {
                    var dataTransfer = e.originalEvent.dataTransfer;
                    e.stopPropagation();
                    e.preventDefault();
                    if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
                        insertFiles(dataTransfer.files);
                    }
                });
            };
            options = $.extend({}, $.fn.wysiwyg.defaults, userOptions);
            toolbarBtnSelector = "a[data-" + options.commandRole + "],button[data-" + options.commandRole + "],input[type=button][data-" + options.commandRole + "]";
            bindHotkeys(options.hotKeys);
            if (options.dragAndDropImages) {
                initFileDrops();
            }
            bindToolbar($(options.toolbarSelector), options);
            editor.attr("contenteditable", true).on("mouseup keyup mouseout", function() {
                saveSelection();
                updateToolbar();
            });
            $(window).bind("touchend", function(e) {
                var isInside = editor.is(e.target) || editor.has(e.target).length > 0, currentRange = getCurrentRange(), clear = currentRange && currentRange.startContainer === currentRange.endContainer && currentRange.startOffset === currentRange.endOffset;
                if (!clear || isInside) {
                    saveSelection();
                    updateToolbar();
                }
            });
            return this;
        };
        $.fn.wysiwyg.defaults = {
            hotKeys: {
                "ctrl+b meta+b": "bold",
                "ctrl+i meta+i": "italic",
                "ctrl+u meta+u": "underline",
                "ctrl+z meta+z": "undo",
                "ctrl+y meta+y meta+shift+z": "redo",
                "ctrl+l meta+l": "justifyleft",
                "ctrl+r meta+r": "justifyright",
                "ctrl+e meta+e": "justifycenter",
                "ctrl+j meta+j": "justifyfull",
                "shift+tab": "outdent",
                tab: "indent"
            },
            toolbarSelector: "[data-role=editor-toolbar]",
            commandRole: "edit",
            activeToolbarClass: "btn-info",
            selectionMarker: "edit-focus-marker",
            selectionColor: "darkgrey",
            dragAndDropImages: true,
            fileUploadError: function(reason, detail) {
                console.log("File upload error", reason, detail);
            }
        };
    })(window.jQuery);
});
"use strict";

/**
 * @fileOverview 发布订阅模式
 */
define("public/general/pub-sub", [], function(require, exports, module) {
    /**
     * 这里topics作为map使用,key为topic的Type。value为topic的详情
     * @type {Object}
     */
    var topics = {};
    /**
     * 作为map使用,key为topic的type。value为订阅者列表
     * @type {Object}
     */
    var subList = {};
    return {
        publish: function(topicType, topic) {
            topics[topicType] = topic;
            subList[topicType] = subList[topicType] || [];
            subList[topicType].forEach(function(sub) {
                sub(topic);
            });
        },
        subscribe: function(topic, fn) {
            subList[topic] = subList[topic] || [];
            subList[topic].push(fn);
        },
        unSubscribe: function(topic, fn) {
            subList[topic] = subList[topic] || [];
            subList[topic] = subList[topic].filter(function(sub) {
                return sub !== fn;
            });
        }
    };
});
/**
 * 本模块提供本地存储、检索的功能。
 */
"use strict";

define("public/general/storage", [], function(require, exports, module) {
    return {
        /**
         * @method store 以键值对的形式存储到本地，如果key已经存在，覆盖原先的值
         * @param {String} key
         * @param {Any} value
         */
        store: function(key, value) {
            var valueStr = JSON.stringify(value);
            sessionStorage.setItem(key, valueStr);
        },
        /**
         * @method remove 从本地存储中删除键为key的信息。
         * @param {String} key
         */
        remove: function(key) {
            sessionStorage.removeItem(key);
        },
        /**
         * @method has 检索本地存储中是否存在键为key的值
         * @param key
         * @return {Boolean}
         */
        has: function(key) {
            return !!sessionStorage.getItem(key);
        },
        /**
         * @method get 返回key对应的值，返回的数据类型与存储一致
         * @param {String} key
         * @return {Any}
         */
        get: function(key) {
            var valueStr = sessionStorage.getItem(key);
            return JSON.parse(valueStr);
        }
    };
});
"use strict";

define("public/general/util", [], function(require, exports, module) {
    return {
        /**
         * @method serialize 将一个对象序列化为a=1&b=2&c=3&d=4&e=5的格式
         * @param obj {Object}
         */
        serialize: function(obj) {
            var result = "";
            var split = "";
            //参数之间的分隔符
            obj = obj || {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (result) {
                        split = "&";
                    } else {
                        result = "";
                    }
                    result += split + key + "=" + obj[key];
                }
            }
            return result;
        },
        /**
         * @method 得到附加参数后的url地址。
         * @param url {String} get请求的url
         * @param data {object} get请求的参数
         */
        getUrl: function(url, data) {
            var serializeValue = this.serialize(data);
            if (serializeValue) {
                if (url.indexOf("?") === -1) {
                    url += "?";
                }
                if (url.charAt(url.length - 1) != "?") {
                    url += "&";
                }
                url += serializeValue;
            }
            return url;
        },
        /**
         * @method clone 深克隆一个对象
         * @param {Object|Array} 被克隆的对象或者数组
         * @return {Object|Array}
         */
        clone: function(obj) {
            return JSON.parse(JSON.stringify(obj));
        },
        /**
         * @method 为对象的属性设置值
         * @param obj 设置属性值的对象
         * @param property 属性名，可以为a.b,则为obj.a.b设置值
         * @param value
         */
        setPropertyValue: function(obj, property, value) {
            var propertyList = property.split(".");
            var lastPropertyName;
            propertyList.forEach(function(value, index) {
                if (index < propertyList.length - 1) {
                    obj = obj[value];
                }
            });
            lastPropertyName = propertyList.pop();
            obj[lastPropertyName] = value;
        },
        /**
         * @method 为对象的属性设置值
         * @param obj 设置属性值的对象
         * @param property 属性名，可以为a.b,则为obj.a.b设置值
         * @param value
         */
        getPropertyValue: function(obj, property) {
            var propertyList = property.split(".");
            var lastPropertyName;
            propertyList.forEach(function(value, index) {
                if (index < propertyList.length - 1) {
                    obj = obj[value];
                }
            });
            lastPropertyName = propertyList.pop();
            return obj[lastPropertyName];
        }
    };
});
"use strict";

/**
 * @fileOverview app-search 需要父scope提供两个方法
 * addApp(app)和getAddedApp();
 */
define("public/local/app-search", [ "app", "public/local/system", "public/general/util", "public/local/http", "public/general/directive/alert", "public/general/directive/pagination" ], function(require, exports, module) {
    var app = require("app");
    var system = require("public/local/system");
    var util = require("public/general/util");
    require("public/local/http");
    require("public/general/directive/alert");
    require("public/general/directive/pagination");
    app.directive("appSearch", [ "httpService", "$compile", "$timeout", function(httpService, $compile, $timeout) {
        return {
            restrict: "E",
            replace: true,
            transclude: true,
            scope: true,
            templateUrl: system.getTplAbsolutePath("tpl/directive/app-search.html"),
            link: function(scope, elem, attrs) {
                var $elem = $(elem);
                scope.alertShow = false;
                scope.alertType = "alert-danger";
                scope.disabled = false;
                //为了防止操作太频繁。操作频繁时设置表格不可交互。
                scope.search = {
                    method: "APPNAME",
                    keywords: "",
                    status: "1"
                };
                scope.filter = {
                    range: "s_newapp",
                    date_limit: 0,
                    neworupd: 0,
                    page_size: 50,
                    status: 1,
                    app_tag: 0,
                    sign: ""
                };
                scope.searchResult = {
                    apps: []
                };
                scope.searchStatus = scope.SEARCH_STATUS.INIT;
                scope.$on("searchStart", function() {
                    scope.searchStatus = scope.SEARCH_STATUS.SEARCHING;
                });
                scope.$on("searchEnd", function(event, data) {
                    scope.searchStatus = scope.SEARCH_STATUS.SEARCH_SUCCESSED;
                    scope.searchResult.apps = data.apps;
                    setSelectedStatus();
                });
                scope.$on("searchFail", function() {
                    scope.searchStatus = scope.SEARCH_STATUS.SEARCH_FAILED;
                });
                scope.searchApp = function() {
                    scope.paginationScope.searchForm = scope.search;
                    scope.paginationScope.searchInterface = "searchApp/search";
                    scope.paginationScope.goPage(1);
                    scope.setPanelOpen();
                };
                scope.filterApp = function() {
                    scope.paginationScope.searchForm = scope.filter;
                    scope.paginationScope.searchInterface = "searchApp/filter";
                    scope.paginationScope.goPage(1);
                    scope.setPanelOpen();
                };
                scope.selectApp = function(app) {
                    var result;
                    if (!scope.disabled) {
                        //防止其篡改app的属性
                        result = scope.addApp(util.clone(app));
                        //调用原型对象的addApp方法
                        if (!result.success) {
                            scope.alertContent = "添加失败：" + result.msg;
                            scope.alertShow = true;
                        }
                    } else {
                        scope.alertContent = "获取详情中,不要急";
                        scope.alertShow = true;
                    }
                };
                /**
                 * 设置面板处于展开状态
                 */
                scope.setPanelOpen = function() {
                    scope.hide = "";
                };
                /**
                 * 设置面板处于关闭状态
                 */
                scope.setPanelClose = function() {
                    scope.hide = "hide";
                };
                scope.$watch("hide", function() {
                    if (scope.hide === "hide") {
                        scope.open = "btn-default";
                        scope.close = "btn-success";
                    } else {
                        scope.open = "btn-success";
                        scope.close = "btn-default";
                    }
                });
                scope.setPanelClose();
                scope.$on("addedAppChanging", function() {
                    scope.disabled = true;
                });
                scope.$on("addedAppChanged", function() {
                    scope.disabled = false;
                    setSelectedStatus();
                });
                /**
                 * 设置所有APP的选中状态
                 *
                 */
                function setSelectedStatus() {
                    scope.searchResult.apps.forEach(function(item) {
                        if (appIsSelected(item)) {
                            item.status = "success";
                        } else {
                            item.status = "";
                        }
                    });
                }
                /**
                 * 判断某个app是否选中
                 * @param app
                 */
                function appIsSelected(app) {
                    return scope.getAddedApp().some(function(item) {
                        if (app.APPID === item.APPID) {
                            return true;
                        }
                        return false;
                    });
                }
            }
        };
    } ]);
});
"use strict";

/**
 * @fileOverview article-search 需要父scope提供两个方法
 * addArticle(app)和getAddedArticle();
 */
define("public/local/article-search", [ "app", "public/local/system", "public/general/util", "public/local/http", "public/general/directive/alert", "public/general/directive/tooltip", "public/general/directive/pagination" ], function(require, exports, module) {
    var app = require("app");
    var system = require("public/local/system");
    var util = require("public/general/util");
    require("public/local/http");
    require("public/general/directive/alert");
    require("public/general/directive/tooltip");
    require("public/general/directive/pagination");
    app.directive("articleSearch", [ "httpService", "$compile", "$timeout", function(httpService, $compile, $timeout) {
        return {
            restrict: "E",
            replace: true,
            transclude: true,
            scope: true,
            templateUrl: system.getTplAbsolutePath("tpl/directive/article-search.html"),
            link: function(scope, elem, attrs) {
                var $elem = $(elem);
                scope.disabled = false;
                //为了防止操作太频繁。操作频繁时设置表格不可交互。
                scope.searchForm = {
                    title: ""
                };
                scope.searchResult = {
                    articleList: []
                };
                scope.searchStatus = scope.SEARCH_STATUS.INIT;
                scope.$on("searchStart", function() {
                    scope.searchStatus = scope.SEARCH_STATUS.SEARCHING;
                });
                scope.$on("searchEnd", function(event, data) {
                    scope.searchStatus = scope.SEARCH_STATUS.SEARCH_SUCCESSED;
                    scope.searchResult.articleList = data.data;
                    setSelectedStatus();
                });
                scope.$on("searchFail", function() {
                    scope.searchStatus = scope.SEARCH_STATUS.SEARCH_FAILED;
                });
                scope.search = function() {
                    scope.paginationScope.searchForm = scope.searchForm;
                    scope.paginationScope.searchInterface = "article/index";
                    scope.paginationScope.goPage(1);
                };
                scope.selectArticle = function(article) {
                    scope.addArticle(article);
                };
                scope.$on("addedArticleChanged", function() {
                    setSelectedStatus();
                });
                /**
                 * 设置所有APP的选中状态
                 *
                 */
                function setSelectedStatus() {
                    scope.searchResult.articleList.forEach(function(item) {
                        if (articleIsSelected(item)) {
                            item.status = "success";
                        } else {
                            item.status = "";
                        }
                    });
                }
                /**
                 * 判断某个article是否选中
                 * @param article
                 */
                function articleIsSelected(article) {
                    return scope.getAddedArticle().some(function(item) {
                        if (article.id === item.id) {
                            return true;
                        }
                        return false;
                    });
                }
            }
        };
    } ]);
});
/**
 *
 */
"use strict";

define("public/local/http", [ "app", "public/general/util", "./system", "public/general/pub-sub" ], function(require, exports, module) {
    var app = require("app");
    var util = require("public/general/util");
    var system = require("./system");
    var pubSub = require("public/general/pub-sub");
    app.service("httpService", [ "$http", "$rootScope", function($http, $rootScope) {
        return {
            /**
             * @method get 向php服务器发送httpGET请求。
             * @param {Object} config get请求的相关信息
             * @param config.r {String} 请求的接口 本系统中，通过r参数来表示请求接口的不同
             * @param config.data { Object }get请求发送的参数
             * @param config.success 请求成功后的回调
             * @param config.error 请求失败后的回调 这里的失败包括业务上的失败和服务器返回错误码
             */
            get: function(config) {
                $http({
                    method: "GET",
                    url: util.getUrl(system.getRequestInterface(config.r), config.data)
                }).success(function(result, status, headers, detail) {
                    if (!angular.isObject(result)) {
                        pubSub.publish("jsonError", {
                            status: status,
                            response: result,
                            url: detail.url
                        });
                        config.error && config.error(result);
                    } else if (result.code == 1) {
                        config.success && config.success(result.data, headers());
                    } else {
                        //表示业务上的失败
                        pubSub.publish("businessError", {
                            title: "操作失败：",
                            msg: result.msg
                        });
                        config.error && config.error(result);
                    }
                }).error(function(data, status, headers, detail) {
                    config.error && config.error(data);
                    pubSub.publish("serverError", {
                        status: status,
                        response: data,
                        url: detail.url
                    });
                });
            },
            /**
             * @method post 向php服务器发送httpPOST请求。
             * @param {Object} config post请求的相关信息
             * @param config.r {String} 请求的接口 本系统中，通过r参数来表示请求接口的不同
             * @param config.data { Object }post请求发送的参数
             * @param config.success 请求成功后的回调
             * @param config.error 请求失败后的回调
             */
            post: function(config) {
                //                $http({
                //                    method: 'POST',
                //                    url: system.getRequestInterface(config.r),
                //                    data: $.param(config.data),
                //                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                //                }).success(function (result, status, headers) {
                //                    config.success(result.data);
                //                }).error(function (data, status, headers) {
                //                    config.error && config.error();
                //                });
                var xhr = new XMLHttpRequest();
                var formData = new FormData();
                for (var key in config.data) {
                    formData.append(key, config.data[key]);
                }
                xhr.open("POST", system.getRequestInterface(config.r));
                xhr.onreadystatechange = function(event) {
                    var result = null;
                    if (xhr.readyState === 4) {
                        $rootScope.$apply(function() {
                            if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
                                try {
                                    result = JSON.parse(xhr.responseText);
                                } catch (e) {
                                    pubSub.publish("jsonError", {
                                        response: xhr.responseText,
                                        url: system.getRequestInterface(config.r)
                                    });
                                    config.error && config.error(result);
                                }
                                if (result.code == 1) {
                                    config.success && config.success(result.data);
                                } else {
                                    //表示业务上的失败
                                    config.error && config.error(result);
                                    pubSub.publish("businessError", {
                                        title: "操作失败：",
                                        msg: result.msg
                                    });
                                }
                            } else {
                                config.error && config.error(xhr.responseText);
                                pubSub.publish("serverError", {
                                    status: xhr.status,
                                    response: xhr.responseText,
                                    url: system.getRequestInterface(config.r)
                                });
                            }
                        });
                    }
                };
                xhr.send(formData);
            },
            /**
             * 获取模板内容
             * @param {String} tplPath 模板相对路径
             */
            getTpl: function(tplPath) {
                $http({
                    method: "GET",
                    url: system.getTplAbsolutePath(tplPath)
                }).success(function(result, status, headers) {
                    config.success(result.data);
                }).error(function(data, status, headers) {
                    config.error();
                });
            }
        };
    } ]);
});
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
"use strict";

/**
 * @fileOverview 在rootScope上添加共享数据
 */
define("public/local/share", [ "app" ], function(require, exports, module) {
    var app = require("app");
    app.service("shareDataService", [ "$rootScope", function($rootScope) {
        $rootScope.SEARCH_STATUS = {
            INIT: 0,
            SEARCHING: 1,
            SEARCH_SUCCESSED: 2,
            SEARCH_FAILED: 3
        };
    } ]);
});
"use strict";

define("public/local/system", [], function(require, exports, module) {
    var ROOT_DIR = "http://ipadbms.kuaiyong.com/protected/views/template/";
    //前端文件在php服务器的根目录
    return {
        /**
         * @param path {String} tpl相对路径
         * @returns {string} tpl在php服务器的绝对路径 如：http://ipadbms.kuaiyong.com/protected/views/template/index.html
         */
        getTplAbsolutePath: function(path) {
            return ROOT_DIR + path;
        },
        /**
         *
         * @method getRequestInterface 所有的接口均为http://ipad.kuaiyong.com/index.php?r=，区别仅为r不同。调用此方法可根据r的值得到服务器接口的url
         * @param r {String} 参数r的值。
         */
        getRequestInterface: function(r) {
            return "http://ipadbms.kuaiyong.com/index.php?r=" + r;
        }
    };
});
"use strict";

define("route", [ "app", "public/local/system", "index/controller", "boutique/article-add/controller", "boutique/icon-add/controller", "boutique/picture-add/controller", "boutique/slide-add/controller", "boutique/boutique-list/controller", "topic/topic-add/controller", "topic/topic-list/controller", "article/article-create/controller", "article/article-list/controller" ], function(require, exports, module) {
    var app = require("app");
    var system = require("public/local/system");
    require("index/controller");
    require("boutique/article-add/controller");
    require("boutique/icon-add/controller");
    require("boutique/picture-add/controller");
    require("boutique/slide-add/controller");
    require("boutique/boutique-list/controller");
    require("topic/topic-add/controller");
    require("topic/topic-list/controller");
    require("article/article-create/controller");
    require("article/article-list/controller");
    app.config([ "$routeProvider", function($routeProvider) {
        $routeProvider.when("/boutique/boutique-list/", {
            controller: "boutiqueListCtrl",
            templateUrl: system.getTplAbsolutePath("tpl/boutique/boutique-list.html")
        }).when("/boutique/slide-add/:id", {
            controller: "slideAddCtrl",
            templateUrl: system.getTplAbsolutePath("tpl/boutique/slide-add.html")
        }).when("/boutique/picture-add/:id", {
            controller: "pictureAddCtrl",
            templateUrl: system.getTplAbsolutePath("tpl/boutique/picture-add.html")
        }).when("/boutique/icon-add/:id", {
            controller: "iconAddCtrl",
            templateUrl: system.getTplAbsolutePath("tpl/boutique/icon-add.html")
        }).when("/boutique/article-add/:id", {
            controller: "articleAddCtrl",
            templateUrl: system.getTplAbsolutePath("tpl/boutique/article-add.html")
        }).when("/topic/topic-list/", {
            controller: "topicListCtrl",
            templateUrl: system.getTplAbsolutePath("tpl/topic/topic-list.html")
        }).when("/topic/topic-add/:id", {
            controller: "topicAddCtrl",
            templateUrl: system.getTplAbsolutePath("tpl/topic/topic-add.html")
        }).when("/article/article-list/", {
            controller: "articleListCtrl",
            templateUrl: system.getTplAbsolutePath("tpl/article/article-list.html")
        }).when("/article/article-add/:id", {
            controller: "articleCreateCtrl",
            //因为两个地方有文章添加的模块
            templateUrl: system.getTplAbsolutePath("tpl/article/article-create.html")
        }).otherwise({
            redirectTo: "/boutique/boutique-list"
        });
    } ]);
});
"use strict";

define("topic/topic-add/controller", [ "app", "public/local/app-search", "./service", "public/local/http", "public/general/pub-sub", "public/general/directive/preview-img", "public/general/directive/set-file", "public/general/directive/popover", "public/general/directive/file-required", "public/general/directive/file-type", "public/general/directive/img-size", "public/local/service", "public/general/directive/submitting", "public/general/form-validation", "public/general/directive/form-reset" ], function(require, exports, module) {
    var app = require("app");
    require("public/local/app-search");
    require("./service");
    require("public/general/directive/preview-img");
    require("public/general/directive/set-file");
    require("public/general/directive/popover");
    require("public/general/directive/file-required");
    require("public/general/directive/file-type");
    require("public/general/directive/img-size");
    require("public/local/service");
    require("public/general/directive/submitting");
    var validationUtil = require("public/general/form-validation");
    require("public/general/directive/form-reset");
    app.controller("topicAddCtrl", [ "$scope", "$routeParams", "topicAddService", "publicService", function($scope, $routeParams, topicAddService, publicService) {
        initForm();
        if ($routeParams.id != "null") {
            topicAddService.getTopicDetail($routeParams.id, function(data) {
                $scope.topicForm.id = $routeParams.id;
                $scope.topicForm.title = data.title;
                $scope.topicForm.introduce = data.introduce;
                $scope.topic.indexPicUrl = data.index_pic;
                $scope.topic.bannerUrl = data.banner;
                $scope.topic.backgroundUrl = data.background;
                data.applications.forEach(function(app, index) {
                    $scope.addApp(app);
                });
            });
        }
        $scope.addTopic = function(formValidation) {
            $scope.submitted = true;
            validationUtil.setFormValidataion(formValidation);
            if (formValidation.$valid && $scope.addedApp.length > 0 && !$scope.publishing) {
                $scope.publishing = true;
                $scope.topicForm.applications = JSON.stringify(getApplications());
                topicAddService.addTopic($scope.topicForm, function() {
                    initForm();
                    $scope.publishing = false;
                }, function() {
                    $scope.publishing = false;
                });
            }
        };
        $scope.saveToDraft = function(formValidation) {
            $scope.submitted = true;
            validationUtil.setFormValidataion(formValidation);
            if (formValidation.$valid && $scope.addedApp.length > 0 && !$scope.saving) {
                $scope.saving = true;
                $scope.topicForm.applications = JSON.stringify(getApplications());
                $scope.topicForm.status = 3;
                topicAddService.addTopic($scope.topicForm, function() {
                    initForm();
                    $scope.saving = false;
                }, function() {
                    $scope.saving = false;
                });
            }
        };
        /**
         * @param app
         * @return {Object} result
         *  result.success {Boolean} true表示添加成功，false表示失败
         *  result.msg {String}
         */
        $scope.addApp = function(app) {
            var appIndex = $scope.addedApp.length;
            if (publicService.isAdded(app, $scope.addedApp)) {
                return {
                    success: false,
                    msg: "此app已经添加过"
                };
            }
            $scope.addedApp.push(app);
            $scope.$broadcast("addedAppChanging", app);
            publicService.getAppDetail(publicService.getAppId(app), "", function(appDetail) {
                $scope.addedApp[appIndex] = appDetail;
                $scope.$broadcast("addedAppChanged", appDetail);
            });
            return {
                success: true,
                msg: ""
            };
        };
        $scope.deleteApp = function(app) {
            $scope.addedApp = $scope.addedApp.filter(function(addedApp) {
                return addedApp.APPID !== app.APPID;
            });
        };
        $scope.getAddedApp = function() {
            return $scope.addedApp;
        };
        function initForm() {
            //与表单相关的信息
            $scope.topic = {
                indexPicUrl: "",
                bannerUrl: "",
                backgroundUrl: "",
                set indexPicFiles(files) {
                    $scope.topicForm.index_pic = files[0];
                    $scope.$digest();
                },
                set bannerFiles(files) {
                    $scope.topicForm.banner = files[0];
                    $scope.$digest();
                },
                set backgroundFiles(files) {
                    $scope.topicForm.background = files[0];
                    $scope.$digest();
                }
            };
            //topicForm为提交到服务器的参数
            $scope.topicForm = {
                id: "",
                title: "",
                introduce: "",
                index_pic: "",
                //File对象 专题大图
                banner: "",
                //专题内图
                background: "",
                //专题底图
                applications: "",
                //[{appid:appval;extend_end:val},{}]，
                status: ""
            };
            $scope.submitted = false;
            $scope.addedApp = [];
            $scope.formReset = true;
            $scope.imgClear = true;
        }
        /**
         * 根据$scope.addedApp得到需要提交的applications
         * @return {Array} applications
         */
        function getApplications() {
            var applications = [];
            $scope.addedApp.forEach(function(app) {
                applications.push({
                    app_id: app.APPID,
                    summary: app.introduce
                });
            });
            return applications;
        }
    } ]);
});
"use strict";

define("topic/topic-add/service", [ "app", "public/local/http", "public/general/pub-sub" ], function(require, exports, module) {
    var app = require("app");
    require("public/local/http");
    var pubSub = require("public/general/pub-sub");
    app.service("topicAddService", [ "httpService", function(httpService) {
        return {
            /**
             * @param data
             * @param success
             * @param error
             */
            addTopic: function(data, success, error) {
                httpService.post({
                    r: "special/create",
                    data: data,
                    success: function(data) {
                        pubSub.publish("businessSuccess", {
                            title: "编辑专题成功!",
                            msg: ""
                        });
                        success && success(data);
                    },
                    error: function() {
                        error && error(data);
                    }
                });
            },
            getTopicDetail: function(id, success, error) {
                var data = {
                    id: id
                };
                httpService.get({
                    r: "special/edit",
                    data: data,
                    success: function(data) {
                        success(data);
                    },
                    error: error
                });
            }
        };
    } ]);
});
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
"use strict";

define("topic/topic-list/service", [ "app", "public/local/http", "public/general/pub-sub" ], function(require, exports, module) {
    var app = require("app");
    require("public/local/http");
    var pubSub = require("public/general/pub-sub");
    app.service("topicListService", [ "httpService", function(httpService) {
        return {
            /**
             * @param data 查询参数
             * @param success
             * @param error
             */
            getTopicList: function(data, success, error) {
                httpService.get({
                    r: "special/index",
                    data: data,
                    success: function(data, headers) {
                        success(data);
                    },
                    error: error
                });
            },
            moveUp: function(id, positon, success, error) {
                this.move({
                    id: id,
                    position: positon,
                    direction: "up"
                }, success, error);
            },
            moveDown: function(id, position, success, error) {
                this.move({
                    id: id,
                    position: position,
                    direction: "down"
                }, success, error);
            },
            importTopic: function(data, success, error) {
                httpService.get({
                    r: "special/import",
                    data: data,
                    success: function(data, headers) {
                        pubSub.publish("businessSuccess", {
                            title: "导入成功!",
                            msg: ""
                        });
                        success && success(data);
                    },
                    error: error
                });
            },
            move: function(data, success, error) {
                httpService.get({
                    r: "special/updatePosition",
                    data: data,
                    success: function(data, headers) {
                        pubSub.publish("businessSuccess", {
                            title: "排序成功!",
                            msg: ""
                        });
                        success && success(data);
                    },
                    error: error
                });
            },
            lock: function(id, position, success, error) {
                var data = {
                    id: id,
                    position: position
                };
                httpService.get({
                    r: "special/PositionLock",
                    data: data,
                    success: function(data, headers) {
                        pubSub.publish("businessSuccess", {
                            title: "锁定成功!",
                            msg: ""
                        });
                        success(data);
                    },
                    error: error
                });
            },
            sortTopic: function(data, success, error) {
                httpService.get({
                    r: "special/updatePosition",
                    data: data,
                    success: function(data, headers) {
                        pubSub.publish("businessSuccess", {
                            title: "专题排序成功!",
                            msg: ""
                        });
                        success(data);
                    },
                    error: error
                });
            },
            pushToFrontEnd: function(id, success, error) {
                var data = {
                    id: id
                };
                httpService.get({
                    r: "special/release",
                    data: data,
                    success: function(data, headers) {
                        pubSub.publish("businessSuccess", {
                            title: "发布成功!",
                            msg: ""
                        });
                        success(data);
                    },
                    error: error
                });
            },
            unlock: function(id, success, error) {
                var data = {
                    id: id
                };
                httpService.get({
                    r: "special/PositionUnlock",
                    data: data,
                    success: function(data, headers) {
                        pubSub.publish("businessSuccess", {
                            title: "解锁成功!",
                            msg: ""
                        });
                        success(data);
                    },
                    error: error
                });
            },
            deleteTopic: function(id, success, error) {
                var data = {
                    id: id
                };
                httpService.get({
                    r: "special/delete",
                    data: data,
                    success: function(data, headers) {
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
    } ]);
});

/**
 * seajs的启动
 */
seajs.use("main");
