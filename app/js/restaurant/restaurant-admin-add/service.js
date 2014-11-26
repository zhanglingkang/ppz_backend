"use strict";

define(function (require, exports, module) {
    var app = require("app");
    require("public/local/http");
    var pubSub = require("public/general/pub-sub");
    app.service("restaurantAdminAddService", ["httpService", function (httpService) {
        return {
            /**
             * @param {Object} restaurantAdminForm
             */
            addRestaurantAdmin: function (restaurantAdminForm) {
                return httpService.post({
                    command: "createUser",
                    data: restaurantAdminForm
                });
            },
            uploadPictures: function (pictureForm) {
                return httpService.post({
                    command: "createRestaurantAdmin",
                    data: pictureForm,
                    isForm: true
                });
            },
            useRestaurantAdminThumbnailPicture: function (restaurantAdminId, pictureId) {
                return httpService.post({
                    command: "useRestaurantAdminThumbnailPictures",
                    data: {
                        restaurantAdminId: restaurantAdminId,
                        pictureId: pictureId
                    }
                });
            },
            useRestaurantAdminPosterPicture: function (restaurantAdminId, pictureId) {
                return httpService.post({
                    command: "useRestaurantAdminPosterPictures",
                    data: {
                        restaurantAdminId: restaurantAdminId,
                        pictureId: pictureId
                    }
                });
            },
            modifyRestaurantAdmin: function (restaurantAdminForm) {
                return httpService.post({
                    command: "modifyRestaurantAdminInfo",
                    data: restaurantAdminForm
                });
            },
            getTopicDetail: function (id, success, error) {
                var data = {
                    id: id
                };
                httpService.get({
                    r: "special/edit",
                    data: data,
                    success: function (data) {
                        success(data);
                    },
                    error: error
                });
            }
        }
    }]);
});