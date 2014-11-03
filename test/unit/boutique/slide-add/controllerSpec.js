"use strict";
define("boutique/slide-add/controllerSpec",
    function (require, exports) {
        require("boutique/slide-add/controller");
        var system = require("public/local/system");
        var config = require("config");
        describe("slide-add/controller",
            function () {
                var scope;
                var mockBackend;
                beforeEach(module('bmsIPad'));
                beforeEach(inject(function ($rootScope, $controller, $httpBackend) {
                    mockBackend = $httpBackend;
                    scope = $rootScope.$new();
                    var ctrl = $controller("slideAddCtrl",
                        {$scope: scope});
                }));
                describe("应该包含introduceTemplateUrl属性",
                    function () {
                        it("scope.introduceTemplateUrl应该包含kuaiyong.com",
                            function () {
                                expect(scope.introduceTemplateUrl).toMatch(/kuaiyong\.com/);
                            }
                        );
                    });
                describe("addApp",
                    function () {
                        it("应该返回添加成功的消息。scope.addedApp.length应该加1",
                            function () {
                                mockBackend.expectGET(config.rootDir + 'r=searchApp/appDetail&appid=au.com.tinmangames.gamebookvolume1LITE&type=turnpic').
                                    respond({
                                        "code": 1,
                                        "msg": "",
                                        "data": {
                                            "CATEGORYNAME": "\u9ab0\u5b50\u6e38\u620f",
                                            "APPID": "au.com.tinmangames.gamebookvolume1LITE",
                                            "APPNAME": "\u6e38\u620f\u4e66\u5386\u9669\u8bb0\uff1a\u4e00\u4e2a\u6740\u4eba\u72af-Gamebook Adventures 1: An Assassin in Orlandes LITE",
                                            "APPTOPLCATE": "61",
                                            "APPSLCATE": "-1",
                                            "APPTLCATE": "-1",
                                            "APPFLCATE": "-1",
                                            "APPINTRO": "\u4f60\u5fc5\u987b\u901a\u8fc7\u6447\u9ab0\u5b50\u6765\u51b3\u5b9a\u4e0b\u4e00\u6b65\u505a\u4ec0\u4e48\uff0c\u9003\u907f\u6740\u4eba\u72af\u7684\u8ffd\u8e2a\u5427\uff01",
                                            "APPVERSION": "1.0",
                                            "APPDEVELOPER": "Tin Man Games",
                                            "APPSTATUS": "1",
                                            "APPPRICE": "0",
                                            "APPLEVEL": "9",
                                            "APPMINOSVER": "3.1.3",
                                            "APPDEVICE": "3",
                                            "APPSIZE": "99867869",
                                            "APPWEIGHT": "199",
                                            "APPUPDATETIME": "1309104000",
                                            "APPTAG": "1",
                                            "APPWEEKDOWNCOUNT": "0",
                                            "APPMONTHDOWNCOUNT": "0",
                                            "APPLANG": "\u82f1\u8bed",
                                            "APPTOTALDOWNCOUNT": "5",
                                            "APPDOWNLOADUSER": "FFFFFFFF",
                                            "APPSEARCHTAG": "\u6e38\u620f\u4e66\u5386\u9669\u8bb0\uff1a\u4e00\u4e2a\u6740\u4eba\u72af-Gamebook Adventures 1: An Assassin in Orlandes LITE",
                                            "APPINSERTTIME": "2014-05-08",
                                            "KID": "139",
                                            "APPAUTHENTIME": "1398233924",
                                            "APPPURCHASE": "2",
                                            "APPPOSITION": "1399530331",
                                            "FILEMD5": "027f3dbf06573dd1f91b7aeb6e3d200f",
                                            "APPDIGITALID": "440442224",
                                            "CDNPRE": "appdown.wanmeiyueyu.com",
                                            "STATTOTALDOWNLOADNUM": "1077",
                                            "DISPLAYVERSION": "1.0",
                                            "STRATEGY": "1",
                                            "EXTVERID": "3769552",
                                            "EVALUATINGPAGE": "",
                                            "DOWNLOADTYPE": "0",
                                            "APPNAMEFRONT": "\u6e38\u620f\u4e66\u5386\u9669\u8bb0\uff1a",
                                            "appStatus": "\u53d1\u5e03\u6001",
                                            "updateTime": "2011-06-27",
                                            "imgSrc": "http:\/\/pic.wanmeiyueyu.com\/Data\/APPINFOR\/69\/4\/au.com.tinmangames.gamebookvolume1LITE\/icon_1399478400.png"
                                        }
                                    }
                                );
                                var length = scope.addedApp.length;
                                var result = scope.addApp({
                                    appId: "au.com.tinmangames.gamebookvolume1LITE"
                                });
                                expect(result.success).toBe(true);
                                mockBackend.flush();
                                expect(scope.addedApp.length).toBe(length + 1);
                            });
                    });
                describe("addApp",
                    function () {
                        it("连续调用addApp两次。scope.addedApp.length应该为1",
                            function () {

                                mockBackend.expectGET(config.rootDir + 'r=searchApp/appDetail&appid=2&type=turnpic').
                                    respond({
                                        "code": 1,
                                        "msg": "",
                                        "data": {
                                            "CATEGORYNAME": "\u9ab0\u5b50\u6e38\u620f",
                                            "APPID": "2",
                                            "APPNAME": "\u6e38\u620f\u4e66\u5386\u9669\u8bb0\uff1a\u4e00\u4e2a\u6740\u4eba\u72af-Gamebook Adventures 1: An Assassin in Orlandes LITE",
                                            "APPTOPLCATE": "61",
                                            "APPSLCATE": "-1",
                                            "APPTLCATE": "-1",
                                            "APPFLCATE": "-1",
                                            "APPINTRO": "\u4f60\u5fc5\u987b\u901a\u8fc7\u6447\u9ab0\u5b50\u6765\u51b3\u5b9a\u4e0b\u4e00\u6b65\u505a\u4ec0\u4e48\uff0c\u9003\u907f\u6740\u4eba\u72af\u7684\u8ffd\u8e2a\u5427\uff01",
                                            "APPVERSION": "1.0",
                                            "APPDEVELOPER": "Tin Man Games",
                                            "APPSTATUS": "1",
                                            "APPPRICE": "0",
                                            "APPLEVEL": "9",
                                            "APPMINOSVER": "3.1.3",
                                            "APPDEVICE": "3",
                                            "APPSIZE": "99867869",
                                            "APPWEIGHT": "199",
                                            "APPUPDATETIME": "1309104000",
                                            "APPTAG": "1",
                                            "APPWEEKDOWNCOUNT": "0",
                                            "APPMONTHDOWNCOUNT": "0",
                                            "APPLANG": "\u82f1\u8bed",
                                            "APPTOTALDOWNCOUNT": "5",
                                            "APPDOWNLOADUSER": "FFFFFFFF",
                                            "APPSEARCHTAG": "\u6e38\u620f\u4e66\u5386\u9669\u8bb0\uff1a\u4e00\u4e2a\u6740\u4eba\u72af-Gamebook Adventures 1: An Assassin in Orlandes LITE",
                                            "APPINSERTTIME": "2014-05-08",
                                            "KID": "139",
                                            "APPAUTHENTIME": "1398233924",
                                            "APPPURCHASE": "2",
                                            "APPPOSITION": "1399530331",
                                            "FILEMD5": "027f3dbf06573dd1f91b7aeb6e3d200f",
                                            "APPDIGITALID": "440442224",
                                            "CDNPRE": "appdown.wanmeiyueyu.com",
                                            "STATTOTALDOWNLOADNUM": "1077",
                                            "DISPLAYVERSION": "1.0",
                                            "STRATEGY": "1",
                                            "EXTVERID": "3769552",
                                            "EVALUATINGPAGE": "",
                                            "DOWNLOADTYPE": "0",
                                            "APPNAMEFRONT": "\u6e38\u620f\u4e66\u5386\u9669\u8bb0\uff1a",
                                            "appStatus": "\u53d1\u5e03\u6001",
                                            "updateTime": "2011-06-27",
                                            "imgSrc": "http:\/\/pic.wanmeiyueyu.com\/Data\/APPINFOR\/69\/4\/au.com.tinmangames.gamebookvolume1LITE\/icon_1399478400.png"
                                        }
                                    }
                                );
                                var length = scope.addedApp.length;
                                scope.addApp({
                                    appId: 2
                                });
                                mockBackend.flush();
                                mockBackend.expectGET(config.rootDir + 'r=searchApp/appDetail&appid=3&type=turnpic').
                                    respond({
                                        "code": 1,
                                        "msg": "",
                                        "data": {
                                            "CATEGORYNAME": "\u9ab0\u5b50\u6e38\u620f",
                                            "APPID": "3",
                                            "APPNAME": "\u6e38\u620f\u4e66\u5386\u9669\u8bb0\uff1a\u4e00\u4e2a\u6740\u4eba\u72af-Gamebook Adventures 1: An Assassin in Orlandes LITE",
                                            "APPTOPLCATE": "61",
                                            "APPSLCATE": "-1",
                                            "APPTLCATE": "-1",
                                            "APPFLCATE": "-1",
                                            "APPINTRO": "\u4f60\u5fc5\u987b\u901a\u8fc7\u6447\u9ab0\u5b50\u6765\u51b3\u5b9a\u4e0b\u4e00\u6b65\u505a\u4ec0\u4e48\uff0c\u9003\u907f\u6740\u4eba\u72af\u7684\u8ffd\u8e2a\u5427\uff01",
                                            "APPVERSION": "1.0",
                                            "APPDEVELOPER": "Tin Man Games",
                                            "APPSTATUS": "1",
                                            "APPPRICE": "0",
                                            "APPLEVEL": "9",
                                            "APPMINOSVER": "3.1.3",
                                            "APPDEVICE": "3",
                                            "APPSIZE": "99867869",
                                            "APPWEIGHT": "199",
                                            "APPUPDATETIME": "1309104000",
                                            "APPTAG": "1",
                                            "APPWEEKDOWNCOUNT": "0",
                                            "APPMONTHDOWNCOUNT": "0",
                                            "APPLANG": "\u82f1\u8bed",
                                            "APPTOTALDOWNCOUNT": "5",
                                            "APPDOWNLOADUSER": "FFFFFFFF",
                                            "APPSEARCHTAG": "\u6e38\u620f\u4e66\u5386\u9669\u8bb0\uff1a\u4e00\u4e2a\u6740\u4eba\u72af-Gamebook Adventures 1: An Assassin in Orlandes LITE",
                                            "APPINSERTTIME": "2014-05-08",
                                            "KID": "139",
                                            "APPAUTHENTIME": "1398233924",
                                            "APPPURCHASE": "2",
                                            "APPPOSITION": "1399530331",
                                            "FILEMD5": "027f3dbf06573dd1f91b7aeb6e3d200f",
                                            "APPDIGITALID": "440442224",
                                            "CDNPRE": "appdown.wanmeiyueyu.com",
                                            "STATTOTALDOWNLOADNUM": "1077",
                                            "DISPLAYVERSION": "1.0",
                                            "STRATEGY": "1",
                                            "EXTVERID": "3769552",
                                            "EVALUATINGPAGE": "",
                                            "DOWNLOADTYPE": "0",
                                            "APPNAMEFRONT": "\u6e38\u620f\u4e66\u5386\u9669\u8bb0\uff1a",
                                            "appStatus": "\u53d1\u5e03\u6001",
                                            "updateTime": "2011-06-27",
                                            "imgSrc": "http:\/\/pic.wanmeiyueyu.com\/Data\/APPINFOR\/69\/4\/au.com.tinmangames.gamebookvolume1LITE\/icon_1399478400.png"
                                        }
                                    }
                                );
                                scope.addApp({
                                    appId: 3
                                });
                                mockBackend.flush();
                                expect(scope.addedApp.length).toBe(1);
                            });
                    });
                describe("deleteApp",
                    function () {
                        it("应该在调用后，scope.addedApp.length应该为0",
                            function () {
                                scope.deleteApp();
                                expect(scope.addedApp.length).toBe(0);
                            });
                    });
            });

    });
seajs.use("boutique/slide-add/controllerSpec");