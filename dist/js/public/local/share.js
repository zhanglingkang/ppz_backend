"use strict";

/**
 * @fileOverview 在rootScope上添加共享数据
 */
define("public/local/share", [ "app" ], function(require, exports, module) {
    var app = require("app");
    app.service("shareDataService", [ "$rootScope", function($rootScope) {
        $rootScope.SEARCH_STATUS = {
            INIT: 0,
            SEARCHING: 1,
            SEARCH_SUCCESSED: 2,
            SEARCH_FAILED: 3
        };
    } ]);
});