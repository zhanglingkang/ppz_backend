"use strict";

define(function (require, exports, module) {
    $.fn.scrollHorizontal = function (fn) {
        var self = this;
        self[0].lastScrollLeft = self[0].scrollLeft;
        self.scroll(function () {
            if (self[0].scrollLeft === self[0].lastScrollLeft) {
                return;
            }
            self[0].lastScrollLeft = self[0].scrollLeft;
            fn();
        });
    };
    $.fn.scrollVertical = function (fn) {
        var self = this;
        self[0].lastScrollTop = self[0].scrollTop;
        self.scroll(function () {
            if (self[0].scrollTop === self[0].lastScrollTop) {
                return;
            }
            self[0].lastScrollTop = self[0].scrollTop;
            fn();
        });
    };
});