"use strict";

define(function (require, exports, module) {
    var app = require("app");
    var util = require("public/general/util");
    var system = require("public/local/system");
    /**
     * 此指令给父scope设置属性值
     * setFile的值为父scope的属性名。
     * @example 比如setFile="a.b";则为父scope.a.b设置为此文件结点的files
     */
    app.directive("setFile", function () {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                var $elem = $(elem);
                $elem.bind("change", function () {
                    util.setPropertyValue(scope, attrs.setFile, $elem[0].files);
                });
            }
        };
    });
});