"use strict";

define(function (require, exports, module) {
    var app = require("app");
    app.directive("dragId", function () {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                $(elem).attr("draggable", "true");
            }
        }
    });
    app.directive("dragSort", function () {
        return {
            restrict: "A",
            scope: {
                dragCompleted: "="
            },
            link: function (scope, elem, attrs) {
                var $elem = $(elem);
                //在一次拖拽过程中，除了被拖拽元素之外的其他元素的先后顺序是不会变化的。所以判断此次拖拽是否发生了元素重排只需要判断被拖拽元素的位置是否改变
                var dragNode;//被拖拽的节点，每次拖拽结束置为空
                var originalPosition = -1;//
                var selector = "[" + attrs.dragSort + "]";
                $elem.delegate(selector, "dragstart", function (event) {
                    var rawEvent = event.originalEvent;
                    dragNode = event.currentTarget;
                    originalPosition = getPosition(dragNode);
                    $(dragNode).addClass("moving");
                    //不知道是不是firefox的bug,非得调用setData方法才有拖拽效果。才能触发dragenter,dragend等后续拖拽事件。
                    rawEvent.dataTransfer.setData("text", "");
                    //rawEvent.dataTransfer.setDragImage(rawEvent.target, 0, 0);
                    rawEvent.dataTransfer.effectAllowed = "move";
                });
                $elem.delegate(selector, "dragover", function (event) {
                    var goalNode;
                    //如果被拖拽的节点是$elem的子元素，执行下面的逻辑
                    if (dragNode) {
                        goalNode = event.currentTarget;
                        if (goalNode === dragNode) {
                            return;
                        }
                        var where = dragNode.compareDocumentPosition(goalNode) === 2 ? "before" : "after";
                        $(goalNode)[where](dragNode);
                    }
                });
                $elem.delegate(selector, "dragend", function (event) {
                    var sortList = [];
                    $(dragNode).removeClass("moving");
                    //如果发生了顺序重排或者强制认为只要拖拽即发生顺序重拍
                    if (originalPosition !== getPosition(dragNode) || "forceRefresh" in attrs) {
                        $elem.children().attr("data-remove", "");
                        $elem.find(selector).each(function (index, value) {
                            sortList.push({
                                id: value.getAttribute(attrs.dragSort),
                                sort: index + 1
                            })
                        });
                        scope.$apply(function () {
                            scope.dragCompleted(sortList, attrs.dragParam, dragNode.getAttribute(attrs.dragSort));
                        });
                    }
                    dragNode = null;
                    originalPosition = -1;
                });
                /**
                 * 得到dragNode节点的位置.从1开始计数
                 * @param dragNode
                 * @returns {*}
                 */
                function getPosition(dragNode) {
                    var position;
                    $elem.find(selector).each(function (index, value) {
                        if (value.getAttribute(attrs.dragSort) === dragNode.getAttribute(attrs.dragSort)) {
                            position = index + 1;
                        }
                    });
                    return position;
                }
            }
        };
    });
});