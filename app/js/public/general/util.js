"use strict";

define(function (require, exports, module) {
    return {
        /**
         * @method serialize 将一个对象序列化为a=1&b=2&c=3&d=4&e=5的格式
         * @param obj {Object}
         */
        serialize: function (obj) {
            var result = "";
            var split = "";//参数之间的分隔符
            obj = obj || {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (result) {
                        split = "&";
                    } else {
                        result = "";
                    }
                    result += split + key + "=" + obj[key];
                }
            }
            return result;
        },
        /**
         * @method 得到附加参数后的url地址。
         * @param url {String} get请求的url
         * @param data {object} get请求的参数
         */
        getUrl: function (url, data) {
            var serializeValue = this.serialize(data);
            if (serializeValue) {
                if (url.indexOf("?") === -1) {
                    url += "?";
                }
                if (url.charAt(url.length - 1) != "?") {
                    url += "&";
                }
                url += serializeValue;
            }
            return url;
        },
        /**
         * @method clone 深克隆一个对象
         * @param {Object|Array} 被克隆的对象或者数组
         * @return {Object|Array}
         */
        clone: function (obj) {
            return JSON.parse(JSON.stringify(obj));
        },
        /**
         * @method 为对象的属性设置值
         * @param obj 设置属性值的对象
         * @param property 属性名，可以为a.b,则为obj.a.b设置值
         * @param value
         */
        setPropertyValue: function (obj, property, value) {
            var propertyList = property.split(".");
            var lastPropertyName;
            propertyList.forEach(function (value, index) {
                if (index < propertyList.length - 1) {
                    obj = obj[value];
                }
            });
            lastPropertyName = propertyList.pop();
            obj[lastPropertyName] = value;
        },
        /**
         * @method 为对象的属性设置值
         * @param obj 设置属性值的对象
         * @param property 属性名，可以为a.b,则为obj.a.b设置值
         * @param value
         */
        getPropertyValue: function (obj, property) {
            var propertyList = property.split(".");
            var lastPropertyName;
            propertyList.forEach(function (value, index) {
                if (index < propertyList.length - 1) {
                    obj = obj[value];
                }
            });
            lastPropertyName = propertyList.pop();
            return obj[lastPropertyName];
        }
    };
});