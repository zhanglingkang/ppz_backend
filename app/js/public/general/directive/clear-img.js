/**
 * 当ng-src绑定的属性为""时，img的src不会更新 为" "（包含空格）时，会更新。
 */
"use strict";

define(function (require, exports, module) {
    var app = require("app");
    app.directive("clearImg", function () {
        return {
            restrict: "A",
            scope: {
                clear: "="
            },
            link: function (scope, elem, attrs) {
                scope.$watch("clear", function () {
                    if (scope.clear) {
                        $(elem)[0].src = "";
                        scope.clear = false;
                    }
                });
            }
        };
    });
});