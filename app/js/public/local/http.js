"use strict";

define(function (require, exports, module) {
    var SERVER = "http://awsjp.ppzapp.com:34952";
    var SERVER = "http://ali.ppzapp.cn:34952";
    var SERVER_URL = SERVER + "/BBQueue/API";
    var AUTH_SERVER_URL = SERVER + "/BBQueue/CredentialService";
    var FILE_SERVER_URL = SERVER + "/FileUploader/upload";
    var MENU_IMPORT_URL = SERVER + "/FileUploader/menuUpload";
    var PPZ_CODE = {
        SUCCESS: 0,//code为0表示请求成功
        USER_NOT_FOUND: 14,
        SESSION_TIMEOUT: 16
    };
    var app = require("app");
    var util = require("public/general/util");
    var system = require("./system");
    var pubSub = require("public/general/pub-sub");

    /**
     * 根据command、data构造请求参数
     * @param command
     * @param data
     * @returns {{data: *, hash: string}}
     */
    function createRequest(command, data) {
        return {"data": JSON.stringify({"command": command, "inputs": data}), "hash": "pleasedonotcheckmyhashthankyou!!"};
    }

    app.service("httpService", ["$http", "$rootScope", "$q", "$location", "$cookies", function ($http, $rootScope, $q, $location, $cookies) {
        return {
            /**
             * @method post 向php服务器发送httpPOST请求。
             * @param {Object} config
             * @param {String} config.url 可选，默认值为 SERVER_URL
             * @param {String} config.command 本系统通过此字段来区分请求。
             * @param {Object} config.data 发送的数据
             * @param {Object} config.config post请求的相关配置信息,配置字段参考$http的config选项
             * @param {Boolean} config.isForm 默认false,如果为true,表示以表单形式穿参
             * @param {Boolean} includeSessionId 默认true
             * @return {Promise} angular的promise对象
             */
            post: function (config) {
                var deferred = $q.defer();
                var formData;
                var ngConfig = config.config || {};
                config.includeSessionId = config.includeSessionId === false ? false : true;
                if (config.includeSessionId) {
                    config.data.sessionId = $cookies.token;
                }
                if (config.isForm) {
                    angular.extend(ngConfig, {
                        transformRequest: angular.identity,
                        headers: {
                            'Content-Type': undefined
                        }
                    });
                    for (var key in config.data) {
                        formData.append(key, data[key]);
                    }
                    config.data = formData;
                } else {
                    config.data = createRequest(config.command, config.data);
                }
                $http(angular.extend(ngConfig, {
                    method: "POST",
                    url: config.url || SERVER_URL,
                    data: config.data
                })).success(
                    function (data, status, headers, config) {
                        var jsonData = JSON.parse(data.data);
                        if (jsonData.code == PPZ_CODE.SUCCESS) {
                            deferred.resolve(jsonData);
                        } else {
                            deferred.reject(jsonData);
                            if (jsonData.code == PPZ_CODE.SESSION_TIMEOUT) {
                                $cookies.token = null;
                            }
                        }
                    }
                ).error(
                    function (data, status, headers, config) {
                        deferred.reject(data);
                    }
                );
                deferred.promise.success = function (callback) {
                    deferred.promise.then(callback);
                    return deferred.promise;
                };
                deferred.promise.error = function (callback) {
                    deferred.promise.then(null, callback);
                    return deferred.promise;
                };
                return deferred.promise;
            }
        }
    }]);
});



