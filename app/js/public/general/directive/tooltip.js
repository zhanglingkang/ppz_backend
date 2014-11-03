"use strict";

define(function (require, exports, module) {
    var app = require("app");
    app.directive("tooltip", function () {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                var $elem = $(elem);
                var charNum = attrs.tooltip || 30;
                var observer = new MutationObserver(function () {
                    var content = $elem.html().trim();
                    if (content.replace(/\.\.\.$/, "").length > charNum) {
                        $elem.html(content.substring(0, charNum) + "...");
                    }
                });
                observer.observe($elem[0].childNodes[0], {
                    characterData: true
                });
                $elem.tooltip({
                    delay: {
                        show: 0,
                        hide: 0
                    }
                });
            }
        };
    });
});