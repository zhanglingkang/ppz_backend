"use strict";

define("index/directive", [ "app" ], function(require, exports, module) {
    var app = require("app");
    app.directive("deleteDatePicker", [ function() {
        return {
            restrict: "A",
            link: function(scope, elem, attrs) {
                scope.$on("$locationChangeStart", function(event, newUrl, oldUrl) {
                    $("body .datetimepicker").remove();
                });
            }
        };
    } ]);
});