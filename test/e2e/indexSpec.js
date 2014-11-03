var config = require("./config");
var fs = require("fs");
describe('bms-kyipad的index页面', function () {
    beforeEach(function () {
        browser.get(config.rootDir);
    });
    it('标题应该有快用两个字', function () {
        expect(browser.getTitle()).toMatch(/快用/);
//        browser.getTitle().then(function (title) {
//            expect(title).toMatch(/快用/);
//        });
    });
});
