"use strict";

define(function (require, exports, module) {
    var app = require("app");
    var system = require("public/local/system");
    require("index/controller");
    require("restaurant/restaurant-add/controller");
    require("restaurant/restaurant-admin-add/controller");
    require("restaurant/restaurant-list/controller");
    require("menu/menu-list/controller");
    require("user/user-list/controller");
    require("user/user-add/controller");
    require("comment/comment-list/controller");
    require("restaurant/restaurant-image-list/controller");
    require("login/controller");
    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.
            when("/restaurant/restaurant-list/", {
                controller: "restaurantListCtrl",
                templateUrl: system.getTplAbsolutePath("restaurant/restaurant-list.html")
            }).
            when('/restaurant/restaurant-add/:id', {
                controller: "restaurantAddCtrl",
                templateUrl: system.getTplAbsolutePath("restaurant/restaurant-add.html")
            }).
            when('/restaurant/restaurant-admin-add/:id', {
                controller: "restaurantAdminAddCtrl",
                templateUrl: system.getTplAbsolutePath("restaurant/restaurant-admin-add.html")
            }).
            when("/menu/menu-list/", {
                controller: "menuListCtrl",
                templateUrl: system.getTplAbsolutePath("tpl/menu/menu-list.html")
            }).
            when("/user/user-list/", {
                controller: "userListCtrl",
                templateUrl: system.getTplAbsolutePath("tpl/user/user-list.html")
            }).
            when("/user/user-add/:id", {
                controller: "userAddCtrl",
                templateUrl: system.getTplAbsolutePath("tpl/user/user-add.html")
            }).
            when('/comment/comment-list/', {
                controller: "commentListCtrl",
                templateUrl: system.getTplAbsolutePath("tpl/comment/comment-list.html")
            }).
            when('/restaurant/restaurant-image-list/', {
                controller: "restaurantImageListCtrl",
                templateUrl: system.getTplAbsolutePath("tpl/restaurant/restaurant-image-list.html")
            }).
            otherwise({redirectTo: "/restaurant/restaurant-list/"});
    }]);
});