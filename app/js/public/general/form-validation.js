/**
 * 发布订阅模式
 */
"use strict";

define(function (require, exports, module) {
    return {
        /**
         * @method setFieldValidation 为angularjs表单的字段设置校验信息,根据field.$error对象设置field.$valid,field.$invalid
         * @param  {Object}  field angularjs创建的字段校验信息对象
         */
        setFieldValidation: function (field) {
            field.$valid = true;
            field.$invalid = false;
            for (var key in field.$error) {
                if (field.$error.hasOwnProperty(key)) {
                    if (field.$error[key]) {
                        field.$valid = false;
                        field.$invalid = true;
                    }
                }
            }
        },
        /**
         *
         * @method setFormValidataion 为angularjs表单设置校验信息，根据form各个字段的$valid值设置form的$valid和$invalid.
         * @param form angularjs创建的表单校验信息对象
         */
        setFormValidataion: function (form) {
            form.$valid = true;
            form.$invalid = false;
            for (var key in form) {
                if (form.hasOwnProperty(key) && key.substring(0, 1) !== "$") {
                    if (form[key].$invalid) {
                        form.$valid = false;
                        form.$invalid = true;
                    }
                }
            }
        }
    }
});