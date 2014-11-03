"use strict";

define("public/general/jquery-plugin/editor", [], function (require, exports, module) {
    (function ($) {
        var readFileIntoDataUrl = function (fileInfo) {
            var loader = $.Deferred(), fReader = new FileReader();
            fReader.onload = function (e) {
                loader.resolve(e.target.result);
            };
            fReader.onerror = loader.reject;
            fReader.onprogress = loader.notify;
            fReader.readAsDataURL(fileInfo);
            return loader.promise();
        };

        /**
         * @method handleContent
         * @description 对html进行处理
         * 1.div替换成p
         * 2.html如果不是以p开头，添加p
         * 3.消除所有的br
         * 4.&#8203;替换成空
         * 5.以<p>(&#8203;)?\s+</p>开头时替换为空
         * 6.将iframe的src进行替换，去掉广告
         * @param {String}html
         * @return {String}
         */
        function handleContent(html) {
            //8203转16进制200b;
            html = html.trim();
            if (html) {
                html = html.replace(/<div/g, "<p").replace(/<\/div>/g, "</p>");
                html = html.replace(/<(\/)?br>/g, "");
                html = html.replace(/\u200b/g, "");
                html = html.replace(/<p>\s*<\/p>/g, "");
                html = html.replace(/class=['"]info-center['"]/g, "");
                html = html.replace(/<p((.(?!<p|class=|<\/p))*)(?=<img|<iframe)/g, "<p class='info-center' $1");
                if (html && !/^<p/.test(html)) {
                    html = html.replace(/<p/, "</p><p");
                    //只替换第一个匹配的p标签
                    html = "<p>" + html;
                    if (!/<\/p>/.test(html)) {
                        html += "</p>";
                    }
                }
                html = html.replace(/(<iframe[^>]*src=['"])http:\/\/player.youku.com\/embed\/(.+)(['"][^>]*>)/g, "$1http://pic.wanmeiyueyu.com/upload/youkukilledrelate.html#$2$3");
            }
            return html;
        }

        $.fn.cleanHtml = function () {
            return handleContent($(this).hasClass("source-mode") ? $(this).text() : $(this).html());
        };
        $.fn.wysiwyg = function (userOptions) {
            var editor = this, selectedRange, options, toolbarBtnSelector, updateToolbar = function () {
                    if (options.activeToolbarClass) {
                        $(options.toolbarSelector).find(toolbarBtnSelector).each(function () {
                            var command = $(this).data(options.commandRole);
                            if (document.queryCommandState(command)) {
                                $(this).addClass(options.activeToolbarClass);
                            } else {
                                $(this).removeClass(options.activeToolbarClass);
                            }
                        });
                    }
                }, execCommand = function (commandWithArgs, valueArg) {
                    var commandArr = commandWithArgs.split(" "), command = commandArr.shift(), args = commandArr.join(" ") + (valueArg || "");
                    var result = document.execCommand(command, 0, args);
                    updateToolbar();
                    return result;
                }, bindHotkeys = function (hotKeys) {
                    $.each(hotKeys, function (hotkey, command) {
                        editor.keydown(hotkey, function (e) {
                            if (editor.attr("contenteditable") && editor.is(":visible")) {
                                e.preventDefault();
                                e.stopPropagation();
                                execCommand(command);
                            }
                        }).keyup(hotkey, function (e) {
                            if (editor.attr("contenteditable") && editor.is(":visible")) {
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        });
                    });
                }, getCurrentRange = function () {
                    var sel = window.getSelection();
                    if (sel.getRangeAt && sel.rangeCount) {
                        return sel.getRangeAt(0);
                    }
                }, saveSelection = function () {
                    selectedRange = getCurrentRange();
                }, restoreSelection = function () {
                    var selection = window.getSelection();
                    if (selectedRange) {
                        try {
                            selection.removeAllRanges();
                        } catch (ex) {
                            document.body.createTextRange().select();
                            document.selection.empty();
                        }
                        selection.addRange(selectedRange);
                    }
                }, //                insertFiles = function (files) {
            //                    editor.focus();
            //                    $.each(files, function (idx, fileInfo) {
            //                        if (/^image\//.test(fileInfo.type)) {
            //                            $.when(readFileIntoDataUrl(fileInfo)).done(function (dataUrl) {
            //                                execCommand('insertimage', dataUrl);
            //                            }).fail(function (e) {
            //                                options.fileUploadError("file-reader", e);
            //                            });
            //                        } else {
            //                            options.fileUploadError("unsupported-file-type", fileInfo.type);
            //                        }
            //                    });
            //                },
                insertFiles = function (url) {
                    editor.focus();
                    execCommand("inserthtml", "<p><img src='" + url + "' /></p>");
                }, markSelection = function (input, color) {
                    restoreSelection();
                    if (document.queryCommandSupported("hiliteColor")) {
                        document.execCommand("hiliteColor", 0, color || "transparent");
                    }
                    saveSelection();
                    input.data(options.selectionMarker, color);
                }, bindToolbar = function (toolbar, options) {
                    toolbar.find(toolbarBtnSelector).click(function () {
                        restoreSelection();
                        editor.focus();
                        execCommand($(this).data(options.commandRole));
                        saveSelection();
                    });
                    toolbar.find("[data-toggle=dropdown]").click(restoreSelection);
                    toolbar.find("input[type=text][data-" + options.commandRole + "]").on("webkitspeechchange change", function () {
                        var newValue = this.value;
                        /* ugly but prevents fake double-calls due to selection restoration */
                        this.value = "";
                        restoreSelection();
                        if (newValue) {
                            editor.focus();
                            execCommand($(this).data(options.commandRole), newValue);
                        }
                        saveSelection();
                    }).on("focus", function () {
                        var input = $(this);
                        if (!input.data(options.selectionMarker)) {
                            markSelection(input, options.selectionColor);
                            input.focus();
                        }
                    }).on("blur", function () {
                        var input = $(this);
                        if (input.data(options.selectionMarker)) {
                            markSelection(input, false);
                        }
                    });
                    toolbar.find("input[type=file][data-" + options.commandRole + "]").change(function () {
                        restoreSelection();
                        if (this.type === "file" && this.files && this.files.length > 0) {
                            //insertFiles(this.files);
                            editor.trigger("fileSelected", [ this.files ]);
                        }
                        saveSelection();
                        this.value = "";
                    });
                    editor.on("fileUploaded", function (event, url) {
                        insertFiles(url);
                    });
                    toolbar.find("[data-operation='full-screen']").on("click", function () {
                        $("#editor-zone").toggleClass("full-screen");
                        if ($("#editor-zone").hasClass("full-screen")) {
                            $("body").css({
                                overflow: "hidden"
                            });
                        } else {
                            $("body").css({
                                overflow: ""
                            });
                        }
                    });
                    toolbar.find("[data-operation=source-mode]").on("click", function () {
                        editor.toggleClass("source-mode");
                        var editorContent;
                        var lessReg = /</g;
                        var escapeLessReg = /&lt;/g;
                        var greatReg = />/g;
                        var escapeGreatReg = /&gt;/g;
                        if (editor.hasClass("source-mode")) {
                            $(this).attr("data-original-title", "源码模式");
                            toolbar.find(toolbarBtnSelector).addClass("disabled");
                            toolbar.find("[data-toggle],#pictureBtn").addClass("disabled");
                            toolbar.find("[type=file]").attr("disabled", "");
                            editorContent = handleContent(editor.html());
                            editorContent = editorContent.replace(/&/g, "&amp;");
                            //这么做是为了用户使用源码模式编辑的时候看起来方便一点。
                            editorContent = editorContent.replace(/(<p[^>]*>)/g, "$1&nbsp;&nbsp;");
                            editorContent = editorContent.replace(lessReg, "<br/>&lt;").replace(greatReg, "&gt;<br/>");
                            editor.focus();
                            editor.html("");
                            execCommand("insertHtml", editorContent);
                        } else {
                            $(this).attr("data-original-title", "编辑模式");
                            toolbar.find(toolbarBtnSelector).removeClass("disabled");
                            toolbar.find("[data-toggle],#pictureBtn,[type=file]").removeClass("disabled");
                            toolbar.find("[type=file]").removeAttr("disabled");
                            editorContent = editor.text();
                            //感觉insertHTML有问题,调用insertHtml时，如果源码有空格。空格被转换成了&nbsp;这里将源码中的多个空格替换为一个
                            //在源码模式下编辑时，键入连续的空格不知道为什么编码总是按照32,160出现。而160即为&nbsp;html解析器不会忽略。所以这里手动去掉。
                            editorContent = editorContent.replace(/[\u00a0\u0020\u0009]+/g, " ");
                            //将"<p> a"替换为"<p>a"
                            editorContent = editorContent.replace(/>[\u00a0\u0020\u0009]{1,2}/g, ">");
                            editor.focus();
                            editor.html("");
                            execCommand("insertHtml", editorContent);
                        }
                    });
                    /**
                     * 如果编辑器的内容为空，添加占位符
                     */
                    function addPlaceholderIfEmpty() {
                        if (editor.html().replace(/\s+/g, "") === "") {
                            execCommand("insertHtml", "<p>&#8203;</p>");
                        }
                    }

                    //监听编辑器内内容的变化
                    (function () {
                        var observer = new MutationObserver(function (event) {
                            addPlaceholderIfEmpty();
                            editor.trigger("editorContentChanged", [ editor.cleanHtml() ]);
                        });
                        var options = {
                            subtree: true,
                            characterData: true,
                            childList: true,
                            attributes: true
                        };
                        observer.observe(editor[0], options);
//                        editor.bind("input", function () {
//                            addPlaceholderIfEmpty();
//
//                        });
                    })();


//                    editor.bind("focusout", function () {
//
//                    });
                    editor.bind("keypress", function (event) {
                        addPlaceholderIfEmpty();
                    });
                }, initFileDrops = function () {
                    editor.on("dragenter dragover", false).on("drop", function (e) {
                        var dataTransfer = e.originalEvent.dataTransfer;
                        e.stopPropagation();
                        e.preventDefault();
                        if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
                            insertFiles(dataTransfer.files);
                        }
                    });
                };
            options = $.extend({}, $.fn.wysiwyg.defaults, userOptions);
            toolbarBtnSelector = "a[data-" + options.commandRole + "],button[data-" + options.commandRole + "],input[type=button][data-" + options.commandRole + "]";
            bindHotkeys(options.hotKeys);
            if (options.dragAndDropImages) {
                initFileDrops();
            }
            bindToolbar($(options.toolbarSelector), options);
            editor.attr("contenteditable", true).on("mouseup keyup mouseout", function () {
                saveSelection();
                updateToolbar();
            });
            $(window).bind("touchend", function (e) {
                var isInside = editor.is(e.target) || editor.has(e.target).length > 0, currentRange = getCurrentRange(), clear = currentRange && currentRange.startContainer === currentRange.endContainer && currentRange.startOffset === currentRange.endOffset;
                if (!clear || isInside) {
                    saveSelection();
                    updateToolbar();
                }
            });
            return this;
        };
        $.fn.wysiwyg.defaults = {
            hotKeys: {
                "ctrl+b meta+b": "bold",
                "ctrl+i meta+i": "italic",
                "ctrl+u meta+u": "underline",
                "ctrl+z meta+z": "undo",
                "ctrl+y meta+y meta+shift+z": "redo",
                "ctrl+l meta+l": "justifyleft",
                "ctrl+r meta+r": "justifyright",
                "ctrl+e meta+e": "justifycenter",
                "ctrl+j meta+j": "justifyfull",
                "shift+tab": "outdent",
                tab: "indent"
            },
            toolbarSelector: "[data-role=editor-toolbar]",
            commandRole: "edit",
            activeToolbarClass: "btn-info",
            selectionMarker: "edit-focus-marker",
            selectionColor: "darkgrey",
            dragAndDropImages: true,
            fileUploadError: function (reason, detail) {
                console.log("File upload error", reason, detail);
            }
        };
    })(window.jQuery);
});