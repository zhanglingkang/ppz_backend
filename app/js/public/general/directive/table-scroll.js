"use strict";

define(function (require, exports, module) {
    var app = require("app");
    app.directive("tableScroll", function () {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                var $elem = $(elem);
                var tdCount = parseInt(attrs.td);
                $elem.scroll(function () {
                        var scrollLeft = $elem[0].scrollLeft;
                        $elem.find("table tr.no-scroll").each(function () {
                                for (var i = 0; i < tdCount; ++i) {
                                    $(this).find("td:nth-child(" + (i + 1) + ")").each(function () {
                                            $(this).css({transform: "translateX(" + scrollLeft + "px) scaleX(1)"})
                                            if (scrollLeft) {
                                                $(this).addClass("transform")
                                            } else {
                                                $(this).removeClass("transform")
                                            }
                                        }
                                    )
                                }
                            }
                        );

                    }
                )
            }
        }
    })
})