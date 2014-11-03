"use strict";

define(function (require, exports, module) {
    var app = require("app");
    var validationUtil = require("public/general/form-validation");
    app.directive("imgSize", function () {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                var $elem = $(elem);
                var formScope = angular.element(elem).parent("form").scope();//表单所在scope对象
                var formName = $elem.parents("form").prop("name");
                var inputName = $elem.prop("name");
                var inputValidation = formScope[formName][inputName];
                var $error = inputValidation.$error;
                $elem.bind("change", function () {
                    var file = $elem[0].files[0];
                    var imgWidth, imgHeight;
                    if (file && file.type.indexOf("image") != -1) {
                        var image = new Image();
                        var reader = new FileReader();
                        image.onload = function () {
                            imgWidth = image.naturalWidth;
                            imgHeight = image.naturalHeight;
                            setImgValidation();
                        };
                        reader.addEventListener('load', function (evt) {
                            image.src = evt.target.result;

                        });
                        reader.readAsDataURL(file);
                    } else {
                        formScope.$apply(function () {
                            formScope[formName][inputName].$error.imgSize = false;
                            validationUtil.setFieldValidation(inputValidation);
                            validationUtil.setFormValidataion(formScope[formName]);
                        });
                    }
                    function setImgValidation() {
                        var realImgSize = imgWidth + "*" + imgHeight;
                        formScope.$apply(function () {
                            if (realImgSize !== attrs["imgSize"].trim()) {
                                formScope[formName][inputName].$error.imgSize = true;
                            } else {
                                formScope[formName][inputName].$error.imgSize = false;
                            }
                            validationUtil.setFieldValidation(inputValidation);
                            validationUtil.setFormValidataion(formScope[formName]);
                        });
                    }
                });
            }
        };
    });
});