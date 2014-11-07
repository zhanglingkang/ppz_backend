"use strict";

define(function (require, exports, module) {
    var ROOT_DIR = seajs.data.cwd + "tpl/";
    return {
        /**
         * @param path {String} tpl相对路径
         * @returns {string} tpl在php服务器的绝对路径 如：http://ipadbms.kuaiyong.com/protected/views/template/index.html
         */
        getTplAbsolutePath: function (path) {
            if (/^\//.test(path)) {
                path = path.substring(1);
            }
            if (/^tpl/.test(path)) {
                path = path.substring(3);
            }
            return ROOT_DIR + path;
        },
        /**
         *
         * @method getRequestInterface 所有的接口均为http://ipad.kuaiyong.com/index.php?r=，区别仅为r不同。调用此方法可根据r的值得到服务器接口的url
         * @param r {String} 参数r的值。
         */
        getRequestInterface: function (r) {
            return "http://ipadbms.kuaiyong.com/index.php?r=" + r;
        }
    };
});