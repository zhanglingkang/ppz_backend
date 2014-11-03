/**
 * 本模块提供本地存储、检索的功能。
 */
"use strict";

define(function (require, exports, module) {
    return {
        /**
         * @method store 以键值对的形式存储到本地，如果key已经存在，覆盖原先的值
         * @param {String} key
         * @param {Any} value
         */
        store: function (key, value) {
            var valueStr = JSON.stringify(value);
            sessionStorage.setItem(key, valueStr);
        },
        /**
         * @method remove 从本地存储中删除键为key的信息。
         * @param {String} key
         */
        remove: function (key) {
            sessionStorage.removeItem(key);
        },
        /**
         * @method has 检索本地存储中是否存在键为key的值
         * @param key
         * @return {Boolean}
         */
        has: function (key) {
            return !!sessionStorage.getItem(key);
        },
        /**
         * @method get 返回key对应的值，返回的数据类型与存储一致
         * @param {String} key
         * @return {Any}
         */
        get: function (key) {
            var valueStr = sessionStorage.getItem(key);
            return JSON.parse(valueStr);
        }

    };
});