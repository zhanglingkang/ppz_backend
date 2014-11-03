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