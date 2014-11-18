"use strict";

define(function (require, exports, module) {
    var app = require("app");
    var validationUtil = require("public/general/form-validation");
    app.directive("fileType", function () {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                var $elem = $(elem);
                var formScope = angular.element(elem).parent("form").scope();//表单所在scope对象
                var formName = $elem.parents("form").attr("name");
                var inputName = $elem.attr("name");
                var inputValidation = formScope[formName][inputName];
                var $error = inputValidation.$error;
                $elem.bind("change", function () {
                    var file = $elem[0].files[0];
                    formScope.$apply(function () {
                        if (file) {
                            if (file.type.indexOf(attrs.fileType) === -1) {
                                $error.fileType = true;
                            } else {
                                $error.fileType = false;
                            }
                        } else {
                            $error.fileType = false;
                        }
                        validationUtil.setFieldValidation(inputValidation);
                        validationUtil.setFormValidataion(formScope[formName]);
                    });
                });
            }
        };
    });
});