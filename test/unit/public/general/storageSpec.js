"use strict";

define("public/general/storageSpec", function (require, exports, module) {
    var storage = require("public/general/storage");
    describe('storage', function () {
        beforeEach(function () {
            sessionStorage.clear();
        });
        describe('store,get', function () {
            it('调用store存储某个对象后，调用get,应该正确返回保存的对象', function () {
                storage.store("person", {
                    name: "zlk",
                    age: 23
                });
                var person = storage.get("person");
                expect(person.name).toBe("zlk");
                expect(person.age).toBe(23);
            });
            it("调用store以同样的key保存两个不同的对象,调用get,应该返回后一个对象", function () {
                storage.store("person", {
                    name: "zlk",
                    age: 23
                });
                storage.store("person", {
                    name: "xx",
                    age: 25
                });
                var person = storage.get("person");
                expect(person.name).toBe("xx");
                expect(person.age).toBe(25);
            });
        });
        describe('store，has', function () {
            it('调用store存储某个对象后，调用has，应该返回true', function () {
                storage.store("person", {
                    name: "zlk",
                    age: 23
                });
                expect(storage.has("person")).toBe(true);
            });
            it('检测某个不存在的值，has应该返回false', function () {
                expect(storage.has("abcdefghilklmn1213")).toBe(false);
            });
        });
        describe('remove', function () {
            it('调用store存储某个对象后，调用remove删除这个对象,再调用has，应该返回false', function () {
                storage.store("person", {
                    name: "zlk",
                    age: 23
                });
                storage.remove("person");
                expect(storage.has("person")).toBe(false);
            });
            it("调用remove删除一个不存在的key，应该不抛出任何异常", function () {
                var a;
                try {
                    storage.remove("abafefageftrafaddddde");
                } catch (e) {
                    a = 3;
                }
            });
        });
    });
});
seajs.use("public/general/storageSpec");