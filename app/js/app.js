"use strict";
/**
 * 定义angularjs的启动模块
 */

define(function (require) {
    return angular.module('ppz', ['ngRoute', 'ngCookies', 'ui.bootstrap']);
});
