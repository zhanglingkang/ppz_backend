module.exports = function (grunt) {

    var fs = require("fs");
    // Project configuration.
    grunt.initConfig({
            pkg: grunt.file.readJSON("package.json"),
            copy: {
                css: {
                    cwd: "./app/",
                    src: [ "./**" ],
                    dest: "./dist/",
                    expand: true
                }
            },
            uglify: {
                options: {
                    banner: "/*! <%= pkg.name %> <%= grunt.template.today('yyyy-mm-dd h:MM:ss TT') %> */\n"
                },
                js: {
                    src: "./dist/js/main.js",
                    dest: "./dist/js/main.min.js",
                    options: {
                        sourceMap: true,
                        sourceMapName: "./dist/js/main.js.map"
                    }
                },
                build: {
                    src: "./dist/js/build.js",
                    dest: "./dist/js/build.min.js"
                },
                libJs: {
                    src: "./dist/lib/js/seajs-angular-jquery-bootstrap.js",
                    dest: "./dist/lib/js/seajs-angular-jquery-bootstrap.min.js",
                    options: {
                        sourceMap: true,
                        sourceMapName: "./dist/lib/js/seajs-angular-jquery-bootstrap.js.map"
                    }
                }
            },
            cssmin: {
                options: {
                    keepSpecialComments: 0
                },
                css: {
                    src: "./dist/lib/css/bootstrap-editor-app.css",
                    dest: "./dist/lib/css/bootstrap-editor-app.css"
                }
            },
            htmlmin: {
                html: {
                    options: {
                        removeComments: true,
                        collapseWhitespace: true,
                        removeStyleLinkTypeAttributes: true,
                        minifyJS: true,
                        conservativeCollapse: true,
                        minifyCSS: true
                    },
                    files: [
                        {
                            expand: true,
                            cwd: './dist/tpl',
                            src: '**/*.html',
                            dest: './dist/tpl'
                        },
                        {
                            src: "./dist/index.html",
                            dest: "./dist/index.html"
                        }
                    ]
                }
            },
            transport: {
                options: {
                    alias: "<%= pkg.spm.alias %>",
                    debug: false
                },
                js: {
                    files: [
                        {
                            expand: true,
                            cwd: "./dist/js/",
                            src: "./**/*.js",
                            filter: function (filepath) {
                                return filepath.indexOf("build.js") == -1;
                            },
                            dest: "./dist/js"
                        }
                    ]
                },
                forTest: {
                    files: [
                        {
                            expand: true,
                            cwd: "./app/js/",
                            src: "./**/*.js",
                            filter: function (filepath) {
                                return filepath.indexOf("build.js") == -1;
                            },
                            dest: "./temp/js"
                        }
                    ]
                }
            },
            concat: {
                options: {
                    noncmd: true
                },
                js: {
                    files: [
                        {
                            src: ["./dist/js/**/*.js"],
                            dest: "./dist/js/main.js",
                            filter: function (filepath) {
                                return !/build|seajs-config|seajs-run/.test(filepath)
                            }
                        },
                        {
                            src: ["./dist/js/seajs-config.js", "./dist/js/main.js", "./dist/js/seajs-run.js"],
                            dest: "./dist/js/main.js"
                        }
                    ]
                },
                css: {
                    options: {
                        noncmd: true,
                        //include: "relative"
                        banner: "/*" + [
                            "./dist/css/bootstrap.min.css",
                            "./dist/css/bootstrap-datetimepicker.min.css",
                            "./dist/css/editor.css",
                            "./dist/css/font-awesome.css",
                            "./dist/css/app.css"
                        ].join(",") + "*/"
                    },
                    files: [
                        {
                            src: [
                                "./dist/css/bootstrap.min.css",
                                "./dist/css/bootstrap-datetimepicker.min.css",
                                "./dist/css/editor.css",
                                "./dist/css/font-awesome.css",
                                "./dist/css/app.css"
                            ],
                            dest: "./dist/lib/css/bootstrap-editor-app.css"
                        }
                    ]
                },
                lib: {
                    options: {
                        noncmd: true,
                        //include: "relative"
                        banner: "/*" + [
                            "./app/bower_components/seajs/dist/sea.js",
                            "./app/bower_components/angularjs/angular.min.js",
                            "./app/bower_components/angularjs/angular-route.min.js",
                            "./app/bower_components/jquery/dist/jquery.min.js",
                            "./app/bower_components/jquery/dist/hotkeys.js",
                            "./app/bower_components/bootstrap/dist/js/bootstrap.min.js",
                            "./app/bower_components/bootstrap/dist/js/bootstrap-datetimepicker.js",
                            "./app/bower_components/bootstrap/dist/js/locales/bootstrap-datetimepicker.zh-CN.js"
                        ].join(",") + "*/"
                    },
                    files: [
                        {
                            src: [
                                "./app/bower_components/seajs/dist/sea.js",
                                "./app/bower_components/angularjs/angular.min.js",
                                "./app/bower_components/angularjs/angular-route.min.js",
                                "./app/bower_components/jquery/dist/jquery.min.js",
                                "./app/bower_components/jquery/dist/hotkeys.js",
                                "./app/bower_components/bootstrap/dist/js/bootstrap.min.js",
                                "./app/bower_components/bootstrap/dist/js/bootstrap-datetimepicker.js",
                                "./app/bower_components/bootstrap/dist/js/locales/bootstrap-datetimepicker.zh-CN.js"
                            ],
                            dest: "./dist/lib/js/seajs-angular-jquery-bootstrap.js"
                        }
                    ]
                }
            },
            replace: {
                "index.html": {
                    file: "./dist/index.html",
                    replace: ['http://js.wanmeiyueyu.com/bms-kyipad/lib/css/bootstrap-editor-app.css'],
                },
                "build.js": {
                    file: "./dist/js/build.js",
                    replace: ['http://js.wanmeiyueyu.com/bms-kyipad/lib/js/seajs-angular-jquery-bootstrap.min.js', 'http://js.wanmeiyueyu.com/bms-kyipad/js/main.min.js']
                }
            },
            sftp: {
                test: {
                    files: {
                        "./": [ "dist/**"]//这里必须写成dist/**不能使./dist/**
                    },
                    options: {
                        path: "/data/ky_ria/bms-kyipad/",
                        srcBasePath: "dist/",
                        host: "192.168.110.23",
                        username: "root",
                        password: "@WE@e023",
                        showProgress: true,
                        createDirectories: true
                    }
                }
            },
            karma: {
                unit: {
                    configFile: "test/karma.conf.js",
                    singleRun: true//测试结束完毕，就终止karma
                }
            }
        }
    );
    grunt.registerTask("delete", "删除dist文件夹中的多余文件", function () {
        grunt.file.delete("./dist/bower_components");
//        grunt.file.delete("./dist/css");
        grunt.file.delete("./dist/bmsIPad.appcache");
    });
    grunt.registerTask("deleteDist", "删除dist文件夹中的多余文件", function () {
        grunt.file.delete("./dist");
    });

    grunt.registerTask("init", "初始化dist目录", function () {
        if (grunt.file.exists("./dist")) {
            grunt.file.delete("./dist");
        }
    });
    grunt.registerMultiTask("replace", "将指定的文件里标记data-romove属性标签删除掉", function () {
        var scriptReg = /<script\s+[^>]*data-remove[^>]*>\s*<\/script>/g;
        var linkReg = /<link\s+[^>]*data-remove[^>]*>/g;
        var fileContent = grunt.file.read(this.data.file);
        var replacePosition = -1;
        var contentToAdd = "";
        var addLinkContent = "";
        //找到添加script标签的位置
        while (scriptReg.exec(fileContent) != null) {
            replacePosition = scriptReg.lastIndex;
        }
        if (replacePosition != -1) {
            this.data.replace.forEach(function (value, index) {
                if (/js$/.test(value)) {
                    contentToAdd += "<script src=\"" + value + "\"></script>";
                }
            });
        }
        fileContent = fileContent.substring(0, replacePosition) + contentToAdd + fileContent.substring(replacePosition, fileContent.length);

        replacePosition = -1;
        contentToAdd = "";
        //找到添加link标签的位置
        while (linkReg.exec(fileContent) != null) {
            replacePosition = linkReg.lastIndex;
        }
        if (replacePosition != -1) {
            this.data.replace.forEach(function (value, index) {
                if (/css$/.test(value)) {
                    contentToAdd += "<link rel='stylesheet' href='" + value + "'/>";
                }
            });
        }
        fileContent = fileContent.substring(0, replacePosition) + contentToAdd + fileContent.substring(replacePosition, fileContent.length);
        fileContent = fileContent.replace(scriptReg, "").replace(linkReg, "");
        grunt.file.write(this.data.file, fileContent);
    });


    grunt.loadNpmTasks("grunt-cmd-transport");
    grunt.loadNpmTasks("grunt-cmd-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-ssh");
    grunt.loadNpmTasks("grunt-karma");
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-concat-sourcemap');
    // 默认被执行的任务列表。
    grunt.registerTask("default", [
        "init",
        "copy",
        "transport:js",
        "concat",
        "replace",
        "uglify",
        "cssmin",
        "htmlmin",
        "delete"
//        "sftp"
//        "deleteDist"
    ]);
    grunt.registerTask("test", [
        "transport:forTest",
        "karma"
    ]);
}