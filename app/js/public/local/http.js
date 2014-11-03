/**
 *
 */
"use strict";

define(function (require, exports, module) {
    var app = require("app");
    var util = require("public/general/util");
    var system = require("./system");
    var pubSub = require("public/general/pub-sub");
    app.service("httpService", ["$http", "$rootScope", function ($http, $rootScope) {
        return {
            /**
             * @method get 向php服务器发送httpGET请求。
             * @param {Object} config get请求的相关信息
             * @param config.r {String} 请求的接口 本系统中，通过r参数来表示请求接口的不同
             * @param config.data { Object }get请求发送的参数
             * @param config.success 请求成功后的回调
             * @param config.error 请求失败后的回调 这里的失败包括业务上的失败和服务器返回错误码
             */
            get: function (config) {
                $http({
                    method: 'GET',
                    url: util.getUrl(system.getRequestInterface(config.r), config.data)
                }).success(function (result, status, headers, detail) {
                    if (!angular.isObject(result)) {
                        pubSub.publish("jsonError", {
                            status: status,
                            response: result,
                            url: detail.url
                        });
                        config.error && config.error(result);
                    } else if (result.code == 1) {
                        config.success && config.success(result.data, headers());
                    } else {//表示业务上的失败
                        pubSub.publish("businessError", {
                            title: "操作失败：",
                            msg: result.msg
                        });
                        config.error && config.error(result);
                    }
                }).error(function (data, status, headers, detail) {
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
            post: function (config) {

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
                xhr.onreadystatechange = function (event) {
                    var result = null;
                    if (xhr.readyState === 4) {
                        $rootScope.$apply(function () {
                            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
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
                                } else {//表示业务上的失败
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
            getTpl: function (tplPath) {
                $http({
                    method: 'GET',
                    url: system.getTplAbsolutePath(tplPath)
                }).success(function (result, status, headers) {
                    config.success(result.data);
                }).error(function (data, status, headers) {
                    config.error();
                });
            }
        }
    }
    ]);
});


