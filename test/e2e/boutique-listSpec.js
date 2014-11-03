var config = require("./config");
describe('bms-kyipad slide-add', function () {
    beforeEach(function () {
        browser.get(config.rootDir + '/#/boutique/boutique-list/');
    });
    it('应该默认展示三条数据', function () {
        expect($$("#boutique-list li").count()).toBe(3);
    });
    it("点击获取更多时，应该多一条数据", function () {
        element(by.partialButtonText('获取更多')).click();
        expect($$("#boutique-list li").count()).toBe(4);
    });
    it("点击查询时，如果没有填入日期，给予提示", function () {
        element(by.partialButtonText('查询')).click();
        var classList = element(by.css("[name=searchBoutiqueFormValidation] .form-group")).getAttribute("class");
        expect(classList).toMatch(/has-error/);
    });
//    it("点击查询时,应该根据日期进行正确的查询", function () {
//        element(by.css("input[name='time']")).sendKeys("2014-09-12");
//        browser.driver.sleep(1000);
//        element(by.partialButtonText('查询')).click();
//        var classList = element(by.css("[name=searchBoutiqueFormValidation] .form-group")).getAttribute("class");
//        expect(classList).toMatch(/has-success/);
//    });
});