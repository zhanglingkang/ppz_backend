"use strict";

define(function (require, exports, module) {

    var app = require("app");
    var count = 0;

    function getCount() {
        return count++;
    }

    app.directive("popover", ["$compile", function ($compile) {
        return {
            restrict: "A",
            scope: {
                close: "="
            },
            link: function (scope, elem, attrs) {
                var contentId = "popover-" + getCount();
                var $elem = $(elem);
                var style = attrs.style || "";
                var content = $(attrs.selector).html();
                $elem.popover({
                        html: true,
                        content: "<div id='" + contentId + "'style='" + style + "'></div>"
                    }
                );
                $elem.on("shown.bs.popover", function () {
                    $("#" + contentId).append($compile(content)(scope.$parent));
                    //scope.$emit("popoverShown", attrs.appId, contentId, attrs.contentType);
                    //addEventsForPopover(attrs.appId, contentId, attrs.contentType);
                });
                scope.$watch("close", function () {
                    if (scope.close) {
                        $elem.popover('hide');
                        scope.close = false;
                    }
                });
            }
        };
    }]);
});