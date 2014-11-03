"use strict";

define(function (require, exports, module) {
    var app = require("app");
    app.directive("submitting", function () {
        return {
            restrict: "A",
            scope: {
                isSubmitting: "="
            },
            link: function (scope, elem, attrs) {
                var $elem = $(elem);
                //提交状态的提示
                var hint = attrs.submitting || "提交中...";
                //正常情况下的提示
                var normalHint = $elem.val() || $elem.html();
                var method;
                if ($elem[0].nodeName === "BUTTON") {
                    method = "html";
                } else if ($elem[0].nodeName === "INPUT") {
                    method = "val";
                }

                scope.$watch("isSubmitting", function () {
                    if (scope.isSubmitting) {
                        $elem[method](hint);
                        $elem.attr("disabled", "disabled");
                    } else {
                        $elem[method](normalHint);
                        $elem.removeAttr("disabled");
                    }
                });
            }
        };
    });
})