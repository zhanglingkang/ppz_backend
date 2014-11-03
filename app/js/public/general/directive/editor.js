"use strict";

define(function (require, exports, module) {

    var app = require("app");
    var system = require("public/local/system");
    var util = require("public/general/util");
    require("../jquery-plugin/editor");
    require("public/local/http");
    function initToolbarBootstrapBindings() {
        var fonts = ['Serif', 'Sans', 'Arial', 'Arial Black', 'Courier',
                'Courier New', 'Comic Sans MS', 'Helvetica', 'Impact', 'Lucida Grande', 'Lucida Sans', 'Tahoma', 'Times',
                'Times New Roman', 'Verdana'],
            fontTarget = $('.font-set').siblings('.dropdown-menu');
        $.each(fonts, function (idx, fontName) {
            fontTarget.append($('<li><a data-edit="fontName ' + fontName + '" style="font-family:\'' + fontName + '\'">' + fontName + '</a></li>'));
        });
        $('a[title]').tooltip({container: 'body'});
        $('.dropdown-menu input').click(function () {
            return false;
        })
            .change(function () {
                $(this).parent('.dropdown-menu').siblings('.dropdown-toggle').dropdown('toggle');
            })
            .keydown('esc', function () {
                this.value = '';
                $(this).change();
            });

        $('[data-role=magic-overlay]').each(function () {
            var overlay = $(this), target = $(overlay.data('target'));
            overlay.css('opacity', 0).css('position', 'absolute').offset(target.offset()).width(target.outerWidth()).height(target.outerHeight());
        });
    }


    app.directive("editor", ["$compile", "httpService", function ($compile, httpService) {
        return {
            restrict: "E",
            replace: true,
            scope: true,
            templateUrl: system.getTplAbsolutePath("tpl/directive/editor.html"),
            compile: function (elem, attrs) {
                var $elem = $(elem);
                var link = function (scope, elem, attrs) {
                    var $editor = $elem.find("#editor");
                    initToolbarBootstrapBindings();
                    $editor.wysiwyg();
                    $editor.on("fileSelected", function (event, fileList) {
                        var file = fileList[0];
                        if (file && /image/.test(file.type)) {
                            httpService.post({
                                r: "index/imageUpload",
                                data: {
                                    up_file: fileList[0]
                                },
                                success: function (result) {
                                    $editor.trigger("fileUploaded", [result.image_url]);
                                }
                            });
                        }
                    });
                    $editor.on("editorContentChanged", function (event, editorContent) {
                        scope.$parent.$apply(function () {
                            $elem.find("textarea").html(editorContent);
                            util.setPropertyValue(scope.$parent, attrs.ngModel, editorContent);
                        });
                    });
                    scope.$parent.$watch(attrs.ngModel, function () {
                        //当通过编辑进入此页面时，把model的值同步到编辑器中。
                        var editorContent = $editor.cleanHtml();
                        var modelValue = util.getPropertyValue(scope.$parent, attrs.ngModel);
                        if (modelValue !== editorContent) {
                            $editor.html(modelValue);
                        }
                    });
                };
                var validateProp = {
                };
                for (var key in attrs) {
                    if (attrs.hasOwnProperty(key)) {
                        if (key.match(/^ng/) || key === "required" || key === "name") {
                            validateProp[attrs.$attr[key]] = attrs[key];
                        }
                    }
                }
                $elem.find("textarea").attr(validateProp);
                return link;
            }

        };
    }
    ])
    ;
})
;