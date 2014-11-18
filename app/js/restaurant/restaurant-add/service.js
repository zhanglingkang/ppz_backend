"use strict";

define(function (require, exports, module) {
    var app = require("app");
    require("public/local/http");
    var pubSub = require("public/general/pub-sub");
    app.service("restaurantAddService", ["httpService", function (httpService) {
        return {
            /**
             * @param {Object} restaurantForm
             */
            addRestaurant: function (restaurantForm) {
                return httpService.post({
                    command: "createRestaurant",
                    data: restaurantForm
                });
            },
            uploadPictures: function (pictureForm) {
                return httpService.post({
                    command: "createRestaurant",
                    data: pictureForm,
                    isForm: true
                });
            },
            useRestaurantThumbnailPicture: function (restaurantId, pictureId) {
                return httpService.post({
                    command: "useRestaurantThumbnailPictures",
                    data: {
                        restaurantId: restaurantId,
                        pictureId: pictureId
                    }
                });
            },
            useRestaurantPosterPicture: function (restaurantId, pictureId) {
                return httpService.post({
                    command: "useRestaurantPosterPictures",
                    data: {
                        restaurantId: restaurantId,
                        pictureId: pictureId
                    }
                });
            },
            modifyRestaurant: function (restaurantForm) {
                return httpService.post({
                    command: "modifyRestaurantInfo",
                    data: restaurantForm
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