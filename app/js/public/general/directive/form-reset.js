"use strict";

define(function (require, exports, module) {
    var app = require("app");
    app.directive("formReset", function () {
        return {
            restrict: "A",
            scope: {
                reset: "="
            },
            link: function (scope, elem, attrs) {
                scope.$watch("reset", function () {
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