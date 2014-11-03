"use strict";

define(function (require, exports, module) {
    var app = require("app");
    var $modal = $("#modal-hint");
    $modal.modal({
        keyboard: false,
        show: false,
        backdrop: false
    });
    app.directive("confirmHint", function () {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                var $elem = $(elem);
                var confirmed = false;
                document.addEventListener("click", function (event) {
                    if ($elem[0] === event.target) {
                        if (!confirmed) {
                            event.stopPropagation();
                            $modal.find(".modal-title").html(attrs.modalTitle);
                            $modal.find(".modal-body").html(attrs.modalContent);
                            $modal.modal('show');
                            $modal.find(".confirm")[0].onclick = function () {
                                confirmed = true;
                                $modal.modal('hide');
                                event.target.click();
                            };
                        } else {
                            confirmed = false;
                        }
                    }
                }, true);
            }
        };
    });
});