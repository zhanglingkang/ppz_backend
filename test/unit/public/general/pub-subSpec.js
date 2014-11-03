"use strict";

define("public/general/pub-subSpec", function (require, exports, module) {
    var pubSub = require("public/general/pub-sub");
    describe('pubSub', function () {
        describe('publish,subscribe,unSubscribe', function () {
            it('如果先订阅后发布，发布一个主题后，订阅者应该得到通知', function () {
                var msg = "xx";
                pubSub.subscribe("businessSuccess", function (topicInfo) {
                    msg = topicInfo.msg;
                });
                pubSub.publish("businessSuccess", {
                    msg: "创建成功"
                });
                expect(msg).toBe("创建成功");
            });
            it('如果先发布后订阅，发布一个主题后，订阅者应该得不到通知', function () {
                var msg = "xx";
                pubSub.publish("businessSuccess", {
                    msg: "创建成功"
                });
                pubSub.subscribe("businessSuccess", function (topicInfo) {
                    msg = topicInfo.msg;
                });
                expect(msg).toBe("xx");
            });

            it('订阅后再取消订阅，发布主题后订阅者应该得不到通知', function () {
                var msg = "xx";
                var fn = function (topicInfo) {
                    msg = topicInfo.msg;
                };
                pubSub.subscribe("businessSuccess", fn);
                pubSub.unSubscribe("businessSuccess", fn);
                pubSub.publish("businessSuccess", {
                    msg: "创建成功"
                });
                expect(msg).toBe("xx");
            });
        });
    });
});
seajs.use("public/general/pub-subSpec");