"use strict";

define("public/general/form-validationSpec", function (require, exports, module) {
    var formValidation = require("public/general/form-validation");
    describe('formValidation', function () {
        describe('setFieldValidation', function () {
            it('field.$error中有属性为true时，filed.$valid应该为false，$invalid应该为true', function () {
                var field = {
                    $error: {
                        required: true,
                        fileType: false
                    }
                };
                formValidation.setFieldValidation(field);
                expect(field.$valid).toBe(false);
                expect(field.$invalid).toBe(true);
            });

            it('field.$error所有属性为false时，filed.$valid应该为true，$invalid应该为false', function () {
                var field = {
                    $error: {
                        required: false,
                        fileType: false
                    }
                };
                formValidation.setFieldValidation(field);
                expect(field.$valid).toBe(true);
                expect(field.$invalid).toBe(false);
            });
        });
        describe('setFormValidataion', function () {
            it('form中有字段的$invalid为true时，form.$valid应该为false，$invalid应该为true', function () {
                var form = {
                    name: {
                        $valid: true,
                        $invalid: false
                    },
                    age: {
                        $valid: false,
                        $invalid: true
                    }
                };
                formValidation.setFormValidataion(form);
                expect(form.$valid).toBe(false);
                expect(form.$invalid).toBe(true);
            });

            it('form中所有字段的$valid为true时，form.$valid应该为true，$invalid应该为false', function () {
                var form = {
                    name: {
                        $valid: true,
                        $invalid: false
                    },
                    age: {
                        $valid: true,
                        $invalid: false
                    }
                };
                formValidation.setFormValidataion(form);
                expect(form.$valid).toBe(true);
                expect(form.$invalid).toBe(false);
            });
        });
    });
});
seajs.use("public/general/form-validationSpec");