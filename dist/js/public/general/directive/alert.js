"use strict";

define("public/general/directive/alert", [ "app", "public/local/system" ], function(require, exports, module) {
    var app = require("app");
    var system = require("public/local/system");
    app.directive("alert", [ "$timeout", function($timeout) {
        return {
            restrict: "E",
            replace: true,
            transclude: true,
            scope: {
                show: "=",
                showType: "=",
                noAutoHide: "="
            },
            templateUrl: system.getTplAbsolutePath("tpl/directive/alert.html"),
            link: function(scope, elem, attrs) {
                //                scope.showType = scope.showType || "alert-danger";
                var $elem = $(elem);
                var showTime = parseInt(attrs.showTime || 0);
                scope.hideAlert = function() {
                    scope.show = false;
                };
                scope.$watch("show", function() {
                    if (scope.show && !scope.noAutoHide) {
                        $timeout(function() {
                            scope.show = false;
                        }, showTime || 5e3);
                    }
                });
            }
        };
    } ]);
});