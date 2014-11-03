"use strict";

define(function (require, exports, module) {
    var app = require("app");
    app.directive("preventSpread", function () {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                var $elem = $(elem);
                $elem.bind(attrs.preventSpread, function (event) {
                    event.stopPropagation();
                });
            }
        };
    });
});