"use strict";

define(function (require, exports, module) {
    var app = require("app");
    require("../jquery-plugin/scroll");
    app.directive("tableScroll", function () {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                var $elem = $(elem);
                var tdCount;
                var trCount;
                if (attrs.td) {
                    tdCount = parseInt(attrs.td);
                    $elem.scrollHorizontal(function () {
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
                    $elem.scrollVertical(function () {
                        var containerTop = $elem[0].getBoundingClientRect().top;
                        var tableTop = $elem.find("table")[0].getBoundingClientRect().top;
                        var offset = containerTop - tableTop;
                        $elem.find("tr").each(function (index) {
                                if (index === trCount) {
                                    return false;
                                }
                                $(this).find("td").each(function () {
                                    $(this).css({
                                        transform: $(this)[0].style.transform.replace(/translateY\(.*?\)/g, "") + " translateY(" + offset + "px)",
                                        position: "relative"
                                    })
                                    if (offset === 0) {
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