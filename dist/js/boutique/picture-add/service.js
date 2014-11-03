"use strict";

define("boutique/picture-add/service", [ "app", "public/local/http", "public/general/pub-sub" ], function(require, exports, module) {
    var app = require("app");
    require("public/local/http");
    var pubSub = require("public/general/pub-sub");
    app.service("pictureAddService", [ "httpService", function(httpService) {
        return {
            /**
             * @param data
             * @param success
             * @param error
             */
            addPicture: function(data, success, error) {
                httpService.post({
                    r: "boutiquePicApp/create",
                    data: data,
                    success: function(data) {
                        pubSub.publish("businessSuccess", {
                            title: "编辑图形app成功!",
                            msg: ""
                        });
                        success && success(data);
                    },
                    error: error
                });
            },
            getPictureDetail: function(id, success, error) {
                var data = {
                    id: id,
                    type: "picapp"
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