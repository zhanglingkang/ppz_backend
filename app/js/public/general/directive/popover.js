"use strict";

define(function (require, exports, module) {

    var app = require("app");
    var util = require("public/general/util");
    app.directive("popover", ["$compile", function ($compile) {
        /**
         * 此指令相关的属性
         * 1.relatedTarget:可选
         *  type string
         *  描述：css选择器，当指定relatedTarget时，点击relatedTarget时，出现弹出框,如果没有设置此属性，目标节点为父节点
         * 2. context:选择器的上下文，默认body。可选值parent
         * 3.autoClose 如果有此属性，点击浮框意外的部分时，自动关闭。
         * 4.container popover插件的options
         * 5.placement popover插件的options
         * 6.name 如果设置了name属性为popover，则在父scope里设置属性名为popover，值为此指令关联的scope
         */
        return {
            restrict: "E",
            terminal: true,
            scope: true,
            link: function (scope, elem, attrs, controller, transclude) {
                var $elem = $(elem);
                var targetNode = $elem.parent();
                var style = attrs.style || "";
                scope.$$close = false;
                scope.$watch("$$close", function () {
                    if (scope.$$close) {
                        targetNode.popover('hide');
                        scope.$$close = false;
                    }
                });
                scope.close = function () {
                    scope.$$close = true;
                };
                if (attrs.name) {
                    util.setPropertyValue(scope.$parent, attrs.name, scope);
                }
                if (attrs.relatedTarget) {
                    if (attrs.context === "parent") {
                        targetNode = $elem.parent().find(attrs.relatedTarget);
                    } else {
                        targetNode = $(attrs.relatedTarget);
                    }
                }
                $elem.remove();
                targetNode.attr("data-toggle", "popover");
                targetNode.popover({
                        html: true,
                        content: $elem.html(),
                        container: attrs.container,
                        placement: "top" || attrs.placement
                    }
                );
                targetNode.on("shown.bs.popover", function (event) {
                    var popoverContent = targetNode.data("bs.popover").$tip.find(".popover-content");
                    popoverContent.attr("style", style);
                    $compile(popoverContent.children())(scope);
                    if ("autoClose" in attrs) {
                        $(document).bind("click", autoClose);
                    }
                });
                targetNode.on("hidden.bs.popover", function (event) {
                    $(document).unbind("click", autoClose);
                });
                function autoClose(event) {
                    var container = targetNode.data("bs.popover").$tip[0];
                    if (container && !$.contains(container, event.target)) {
                        targetNode.popover("hide");
                    }
                }
            }
        }
    }]);
});