"use strict";

define(function (require, exports, module) {
    var app = require("app");
    var validationUtil = require("public/general/form-validation");
    app.directive("fileRequired", function () {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                var $elem = $(elem);
                var formScope = angular.element(elem).parent("form").scope();//表单所在scope对象
                var formName = $elem.parents("form").attr("name");
                var inputName = $elem.attr("name");
                var inputValidation = formScope[formName][inputName];
                var $error = inputValidation.$error;
                $error.required = true;
                validationUtil.setFieldValidation(inputValidation);
                validationUtil.setFormValidataion(formScope[formName]);
                $elem.bind("change", function () {
                    var file = $elem[0].files[0];
                    formScope.$apply(function () {
                        if (file) {
                            formScope[formName][inputName].$error.required = false;
                        } else {
                            formScope[formName][inputName].$error.required = true;
                        }
                        validationUtil.setFieldValidation(inputValidation);
                        validationUtil.setFormValidataion(formScope[formName]);
                    });

                });
            }
        };
    });
});