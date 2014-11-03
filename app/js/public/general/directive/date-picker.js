"use strict";

define(function (require, exports, module) {

    var app = require("app");
    var system = require("public/local/system");
    var util = require("public/general/util");
    app.directive("datePicker", function () {
        return {
            restrict: "E",
            replace: "true",
            scope: true,
            templateUrl: system.getTplAbsolutePath("tpl/directive/date-picker.html"),
            compile: function (elem, attrs) {
                var $elem = $(elem);
                var validateProp = {
                };
                for (var key in attrs) {
                    if (attrs.hasOwnProperty(key)) {
                        if (key.match(/^ng/) || key === "required" || key === "name" || key === "placeholder") {
                            validateProp[attrs.$attr[key]] = attrs[key];
                        }
                    }
                }
                $elem.find("input").attr(validateProp);
                return function (scope, elem, attrs) {
                    $(elem).attr("data-date", new Date().toJSON().substring(0, 10));
                    var date = $(elem).datetimepicker({
                        language: 'zh-CN',
                        weekStart: 1,
                        todayBtn: 1,
                        autoclose: 1,
                        todayHighlight: 1,
                        startView: attrs.startView || 2,
                        minView: attrs.minView || 2,
                        forceParse: 0,
                        showMeridian: 1
                    });
                    $(".datetimepicker").find(".next").html('<i class="glyphicon glyphicon-arrow-right"></i>');
                    $(".datetimepicker").find(".prev").html('<i class="glyphicon glyphicon-arrow-left"></i>');
                    date.on("changeDate", function (event) {
                        scope.$parent.$apply(function () {
                            util.setPropertyValue(scope.$parent, attrs.ngModel, $(elem).find("input").val());
                        });
                    });
                };
            }
        };
    });
//    var app = require("app");
//    app.directive("datePicker", function () {
//        return {
//            restrict: "E",
//            replace: "true",
//            scope: {},
//            template: "<p style='background-color:{{color}}'>Hello World</p>",
//            link: function (scope, elem, attrs) {
//                elem.bind('click', function () {
//                    elem.css('background-color', 'red');
//                    scope.$apply(function () {
//                        scope.color = "white";
//                    });
//                });
//                elem.bind('mouseover', function () {
//                    elem.css('cursor', 'pointer');
//                });
//            }
//        };
//    });
});