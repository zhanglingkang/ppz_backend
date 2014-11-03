"use strict";

define("boutique/slide-add/service", [ "app", "public/local/http", "public/general/pub-sub" ], function(require, exports, module) {
    var app = require("app");
    require("public/local/http");
    var pubSub = require("public/general/pub-sub");
    app.service("slideAddService", [ "httpService", function(httpService) {
        return {
            /**
             * @param data
             * @param success
             * @param error
             */
            addSlide: function(data, success, error) {
                httpService.post({
                    r: "boutiqueTurnPic/create",
                    data: data,
                    success: function(data) {
                        pubSub.publish("businessSuccess", {
                            title: "编辑轮播图成功!",
                            msg: ""
                        });
                        success && success(data);
                    },
                    error: function() {
                        error && error(data);
                    }
                });
            },
            getSlideDetail: function(id, success, error) {
                var data = {
                    id: id,
                    type: "turnpic"
                };
                httpService.get({
                    r: "boutique/edit",
                    data: data,
                    success: function(data) {
                        data.applications = JSON.parse(data.applications);
                        success(data);
                    },
                    error: error
                });
            }
        };
    } ]);
});