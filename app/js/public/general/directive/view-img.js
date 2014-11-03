"use strict";

/**
 * @fileOverview 图片的幻灯片效果
 */
define(function (require, exports, module) {
    var app = require("app");
    var $modal = $("#modal-view-img");
    $modal.modal({
        show: false
    });
    app.directive("viewImg", function () {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                var $elem = $(elem);
                $elem.bind("click", function () {
                    if ($elem.attr("src")) {
                        $modal.find(".modal-title").html(attrs.imgTitle);
                        $modal.find(".modal-body img").attr("src", $elem.attr("src"));
                        $modal.modal('show');
                    }
                });

            }
        };
    });
});