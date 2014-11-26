"use strict";

define(function (require, exports, module) {
    var app = require("app");
    app.directive("deleteModal", function () {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                scope.$watch("showUserList", function (value) {
                    if (value === false) {
                        $(".modal-backdrop").remove();
                    }
                });
            }
        };
    });
});