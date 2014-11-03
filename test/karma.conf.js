module.exports = function (config) {
    config.set({

            basePath: "../",

            files: [
                'http://js.wanmeiyueyu.com/public/seajs/dist/sea-debug.js',
                'http://js.wanmeiyueyu.com/public/angularjs/1.3.0/angular.js',
                'http://js.wanmeiyueyu.com/public/angularjs/1.3.0/angular-route.js',
                "http://js.wanmeiyueyu.com/public/angularjs/1.3.0/angular-mocks.js",
                'http://js.wanmeiyueyu.com/public/jquery/jquery-1.11.1.min.js',
                'http://js.wanmeiyueyu.com/bms-kyipad/bower_components/jquery/dist/hotkeys.js',
                'http://js.wanmeiyueyu.com/public/bootstrap/3.2.0/js/bootstrap.min.js',
                'http://js.wanmeiyueyu.com/bms-kyipad/bower_components/bootstrap/dist/js/bootstrap-datetimepicker.min.js',
                'http://js.wanmeiyueyu.com/bms-kyipad/bower_components/bootstrap/dist/js/locales/bootstrap-datetimepicker.zh-CN.js',
                "temp/js/**/*.js",
                "test/unit/**/*.js"
            ],

            autoWatch: true,

            frameworks: ["jasmine"],

            browsers: ["Chrome", "Firefox"],

            exclude: ["karma.conf.js"],

            reporters: ["progress", "coverage"],

            plugins: [
                "karma-chrome-launcher",
                "karma-firefox-launcher",
                "karma-jasmine",
                "karma-junit-reporter",
                "karma-coverage"
            ],

            junitReporter: {
                outputFile: "test_out/unit.xml",
                suite: "unit"
            },
            preprocessors: {
                //"temp/js/**.js": ["coverage"],
                "temp/js/**": ["coverage"]//temp/js/**.js匹配不到子目录的js文件。不清楚为什么。
            },
            coverageReporter: {
                type: "html",
                dir: "coverage/"
            }
        }
    )
    ;
}
;
