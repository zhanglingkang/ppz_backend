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