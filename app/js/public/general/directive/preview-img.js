"use strict";

define(function (require, exports, module) {
    var app = require("app");
    var system = require("public/local/system");
    app.directive("previewImg", function () {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                var $elem = $(elem);
                var $img = $(attrs.previewImg);
                $elem.bind("change", function (event) {
                    var file = $elem.prop("files")[0];
                    if (file && file.type.indexOf("image") !== -1) {
                        var reader = new FileReader();
                        reader.addEventListener('load', function (evt) {
                            $img.prop('src', evt.target.result);
                        });
                        reader.readAsDataURL(file);
                    } else {
                        $img.prop('src', "");
                    }
                });
            }
        };
    });
});