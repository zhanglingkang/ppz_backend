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
                                                $(this).css({left: scrollLeft + "px", position: "relative"});
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
                        $elem.find("tr").each(function (index) {
                                if (index === trCount) {
                                    return false;
                                }
                                if (top < 0) {
                                    $(this).find("td").css({top: -top + "px", position: "relative"});
                                    $(this).find("td").addClass("vertical-fix");
                                } else {
                                    $(this).find("td").css({top: "0px", position: "relative"});
                                    $(this).find("td").removeClass("vertical-fix");
                                }
                            }
                        )
                    });
                }
            }
        }
    })
})