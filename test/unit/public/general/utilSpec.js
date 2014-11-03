"use strict";

define("public/general/utilSpec", function (require, exports, module) {
    var util = require("public/general/util");
    describe('util', function () {
        describe('serialize', function () {
            it('应该返回a=1&b=2格式的字符串', function () {
                var result = util.serialize({
                    name: "zlk",
                    age: 23
                });
                expect(result).toBe("name=zlk&age=23");
            });
            it("应该忽略原型对象的属性", function () {
                var obj = {
                    name: "zlk"
                };
                obj.__proto__ = {
                    age: 23
                };
                var result = util.serialize(obj);
                expect(result).toBe("name=zlk");
            });
            it("对象为空时，应该返回空", function () {
                var result = util.serialize({

                });
                expect(result).toBe("");
            });
        });
        describe('getUrl', function () {
            it('应该根据url是否包含？和参数，将data的属性附加到url上构造出一个合法的url', function () {
                var url = "http://www.baidu.com";
                var newUrl;
                newUrl = util.getUrl(url, {
                    a: 3,
                    b: "xx"
                });
                expect(newUrl).toBe("http://www.baidu.com?a=3&b=xx");
                url = "http://www.baidu.com?c=3";
                newUrl = util.getUrl(url, {
                    a: 3
                });
                expect(newUrl).toBe("http://www.baidu.com?c=3&a=3");
                url = "http://www.baidu.com?";
                newUrl = util.getUrl(url, {
                    a: 3
                });
                expect(newUrl).toBe("http://www.baidu.com?a=3");
            });
        });
        describe('clone', function () {
            it('克隆一个对象后，改变克隆对象的属性，不应该影响到原对象的属性', function () {
                var a = {
                    name: "xxx"
                };
                var b = util.clone(a);
                b.name = "yyy";
                expect(a.name).toBe("xxx");
            });
        });
        describe('setPropertyValue', function () {
            it('当property参数不包含点时，函数应该能正确工作', function () {
                var a = {
                    name: "xxx"
                };
                util.setPropertyValue(a, "name", "yyy");
                expect(a.name).toBe("yyy");
            });
            it('当property参数包含点时，函数应该能正确工作', function () {
                var a = {
                    b: {
                        name: "xxx"
                    }
                };
                util.setPropertyValue(a, "b.name", "yyy");
                expect(a.b.name).toBe("yyy");
            });
        });
    });
});
seajs.use("public/general/utilSpec");