"use strict";

define(function (require, exports, module) {
    var app = require("app");
    app.directive("triggerClick", function () {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                var $elem = $(elem);
                $elem.bind("click", function () {
                    $(attrs.triggerClick).click();
                });
            }
        };
    });
});