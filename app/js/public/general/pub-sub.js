"use strict";

/**
 * @fileOverview 发布订阅模式
 */
define(function (require, exports, module) {
    /**
     * 这里topics作为map使用,key为topic的Type。value为topic的详情
     * @type {Object}
     */
    var topics = {};
    /**
     * 作为map使用,key为topic的type。value为订阅者列表
     * @type {Object}
     */
    var subList = {};

    return {
        publish: function (topicType, topic) {
            topics[topicType] = topic;
            subList[topicType] = subList[topicType] || [];
            subList[topicType].forEach(function (sub) {
                sub(topic);
            });
        },
        subscribe: function (topic, fn) {
            subList[topic] = subList[topic] || [];
            subList[topic].push(fn);
        },
        unSubscribe: function (topic, fn) {
            subList[topic] = subList[topic] || [];
            subList[topic] = subList[topic].filter(function (sub) {
                return sub !== fn;
            });
        }

    };
});