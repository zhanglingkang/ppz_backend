"use strict";

define(function (require, exports, module) {
    var app = require("app");
    app.directive("fullTr", function () {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                var $elem = $(elem);
                var tdList = $elem.parents("table").find("thead tr:nth-child(1)").find(">td,>th");
                if (tdList.length === 0) {
                    tdList = $elem.parents("table").find("tr:nth-child(1)").find(">td,>th");
                }
                var tdCount = 0;
                tdList.each(function (index, td) {
                    tdCount += parseInt($(td).attr("colspan") || 1);
                });
                $elem.attr("colspan", tdCount);
            }
        };
    });
});