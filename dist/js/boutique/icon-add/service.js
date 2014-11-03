"use strict";

define("boutique/icon-add/service", [ "app", "public/local/http", "public/general/pub-sub" ], function(require, exports, module) {
    var app = require("app");
    require("public/local/http");
    var pubSub = require("public/general/pub-sub");
    app.service("iconAddService", [ "httpService", function(httpService) {
        return {
            /**
             * @param data
             * @param success
             * @param error
             */
            addIcon: function(data, success, error) {
                httpService.post({
                    r: "boutiqueIconApp/create",
                    data: data,
                    success: function(data) {
                        pubSub.publish("businessSuccess", {
                            title: "编辑iconapp成功!",
                            msg: ""
                        });
                        success && success(data);
                    },
                    error: error
                });
            },
            getIconDetail: function(id, success, error) {
                var data = {
                    id: id,
                    type: "iconapp"
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