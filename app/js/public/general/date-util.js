"use strict";

define(function (require, exports, module) {
    return {
        /**
         * @method parse
         * @description
         * @param {String}date 任意格式的日期字符串
         * @return {Date} 日期对象
         */
        parse: function (date) {
            date = date.replace(/-/g, "/");
            return new Date(date);
        }
    };
});