/**
 * seajs的配置
 */
(function () {
    var base = document.scripts[document.scripts.length - 1].src.replace(/\/js\/.*/, "/js/");
    seajs.config({
        base: base,
        alias: {
        }
    });
}());
