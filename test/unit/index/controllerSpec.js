"use strict";

define("index/controllerSpec", function (require) {
    require("index/controller");
    describe('公共区域controller', function () {
        describe('appInfoCtrl', function () {
            var scope;
            beforeEach(module('bmsIPad'));
            beforeEach(inject(function ($rootScope, $controller) {
                scope = $rootScope.$new();
                var ctrl = $controller("appInfoCtrl", {$scope: scope});
            }));

            it('scope.link应该是/bms-kyipad/', function () {
               // expect(scope.link).toBe("/bms-kyipad/");
            });

            it('should set the default value of spice', function () {
               // expect(scope.name).toBe('快用iPad版管理系统');
            });
        });
    });
});
seajs.use("index/controllerSpec");
