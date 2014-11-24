"use strict";

define(function (require, exports, module) {
    var app = require("app");
    require("public/local/http");
    var pubSub = require("public/general/pub-sub");
    app.service("userAddService", ["httpService", function (httpService) {
        return {
            /**
             * @param {Object} userForm
             */
            addUser: function (userForm) {
                return httpService.post({
                    command: "createUser",
                    data: userForm
                });
            },
            getUser: function (userId) {
                return httpService.post({
                    command: "getUserInfoById",
                    data: {
                        userId: userId
                    }
                }).success(function (data) {
                });
            },
            uploadPictures: function (pictureForm) {
                return httpService.post({
                    command: "createUser",
                    data: pictureForm,
                    isForm: true
                });
            },
            useUserThumbnailPicture: function (userId, pictureId) {
                return httpService.post({
                    command: "useUserThumbnailPictures",
                    data: {
                        userId: userId,
                        pictureId: pictureId
                    }
                });
            },
            useUserPosterPicture: function (userId, pictureId) {
                return httpService.post({
                    command: "useUserPosterPictures",
                    data: {
                        userId: userId,
                        pictureId: pictureId
                    }
                });
            },
            modifyUser: function (userForm) {
                return httpService.post({
                    command: "modifyUserInfo",
                    data: userForm
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