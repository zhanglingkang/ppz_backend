"use strict";

define(function (require, exports, module) {
    var app = require("app");
    app.directive("tableScroll", function () {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                var $elem = $(elem);
                var tdCount;
                var trCount;
                if (attrs.td) {
                    tdCount = parseInt(attrs.td);
                    $elem.scroll(function () {
                            var scrollLeft = $elem[0].scrollLeft;
                            $elem.find("table tr.no-scroll").each(function () {
                                    for (var i = 0; i < tdCount; ++i) {
                                        $(this).find("td:nth-child(" + (i + 1) + ")").each(function () {
//                                                $(this).css({left: scrollLeft + "px", position: "relative"});
                                                $(this).css({
                                                    transform: $(this)[0].style.transform.replace(/translateX\(.*?\)/g, "") + " translateX(" + scrollLeft + "px)",
                                                    position: "relative"
                                                })

                                                if (scrollLeft === 0) {
                                                    $(this).removeClass("horizontal-fix");
                                                } else {
                                                    $(this).addClass("horizontal-fix");
                                                }
                                            }
                                        )
                                    }
                                }
                            );

                        }
                    )
                }
                if (attrs.tr) {
                    trCount = parseInt(attrs.tr);
                    $(window).scroll(function () {
                        var top = $elem[0].getBoundingClientRect().top;
                        if (top === $elem[0].__lastTop) {
                            return;
                        }
                        $elem[0].__lastTop = top;
                        $elem.find("tr").each(function (index) {
                                if (index === trCount) {
                                    return false;
                                }
                                top = top > 0 ? 0 : top;
                                $(this).find("td").each(function () {
                                    $(this).css({
                                        transform: $(this)[0].style.transform.replace(/translateY\(.*?\)/g, "") + " translateY(" + -top + "px)",
                                        position: "relative"
                                    })
                                    if (top === 0) {
                                        $(this).removeClass("vertical-fix");
                                    } else {
                                        $(this).addClass("vertical-fix");
                                    }
                                });
                            }
                        )
                    });
                }
            }
        }
    })
})