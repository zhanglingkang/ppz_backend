exports.config = {
    seleniumAddress: "http://localhost:4444/wd/hub",

    specs: ['e2e/*Spec.js'],
    getPageTimeout: 100000,
    allScriptsTimeout: 100000,
    jasmineNodeOpts: {defaultTimeoutInterval: 100000},

    multiCapabilities: [
//        {
//            browserName: 'firefox'
//        },
        {
            browserName: 'chrome'
        }
    ],

    onPrepare: function () {
        browser.driver.get("http://user.kuaiyong.com");

        browser.driver.findElement(by.id('email')).sendKeys('zhoufeng@kuaiyong.net');
        browser.driver.findElement(by.id('password')).sendKeys('123456');
        browser.driver.findElement(by.id('login')).click();
        browser.driver.sleep(1000);
        browser.driver.get("http://ipadbms.kuaiyong.com:8888");

        // Login takes some time, so wait until it's done.
        // For the test app's login, we know it's done when it redirects to
        // index.html.
        browser.driver.wait(function () {
            return browser.driver.getCurrentUrl().then(function (url) {
                return /ipadbms.kuaiyong.com/.test(url);
            });
        });
    }
};
