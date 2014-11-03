/**
 * seajs的启动模块，也是整个系统的启动模块。
 */

"use strict";

define(function (require) {
    var app = require("app");
    var route = require("route");
    angular.bootstrap(document, [app.name]);
});