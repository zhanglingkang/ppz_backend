"use strict";

define(function (require, exports, module) {
    var app = require("app");
    var system = require("public/local/system");
    require("public/local/http");
    app.directive("selfPagination", ["httpService", function (httpService) {
        return {
            restrict: "E",
            replace: true,
            templateUrl: system.getTplAbsolutePath("tpl/directive/pagination.html"),
            scope: {
//                searchForm: "=",
//                searchInterface: "=",
//                goPage: "=",
                paginationScope: "="

            },
            link: function (scope, elem, attrs) {
                var $elem = $(elem);
                scope.paginationScope = scope;
                /**
                 * @param {Number|Boolean|undefined} page page 为boolean类型时，只能为false。这时不做任何处理；如果page为undefined。则page按照当前的页码处理
                 */
                scope.goPage = function (page) {
                    if (page === false) {
                        return;
                    }
                    if (page === undefined) {
                        scope.searchForm.page = scope.searchForm.page || 1;
                    } else if (page) {
                        scope.searchForm.page = page;
                    }
                    scope.$emit("searchStart");
                    httpService.get({
                        r: scope.searchInterface,
                        data: scope.searchForm,
                        success: function (data) {
                            handleSearchResult(data);
                            scope.$emit("searchEnd", data);
                        }, error: function (data) {
                            scope.$emit("searchFail", data);
                        }
                    });
                };
                if (scope.autoSearch) {
                    scope.goPage = (1);
                }

                /**
                 * @method handleSearchResult
                 * @description 对含有分页数据的查询结果作统一处理,在每条数据加上order属性。表示此条记录的序号
                 * @param {Object} data
                 * @param {Number|String}data.count 查询的总记录数
                 * @param {Number|String}data.page 当前页码
                 * @param {Number|String}data.pageSize 每页的记录数
                 */
                function handleSearchResult(data) {
                    scope.searchResult = data;
                    scope.searchResult.pageCount = parseInt((parseInt(data.count) + data.pageSize - 1) / data.pageSize);
                    scope.searchResult.pageInfo = getShowPageRange(scope.searchResult.pageCount, data.page);
                    angular.forEach(data, function (value, key) {
                        if (angular.isArray(value)) {
                            value.forEach(function (item, index) {
                                item.order = scope.searchResult.pageSize * scope.searchResult.page - scope.searchResult.pageSize + 1 + index;
                            });
                        }
                    });
                }

                /**
                 * @method getShowPageRange
                 * @description 得到显示的页面范围 比如有100页.当前页为20，则分页栏显示的是15-25页。
                 * @param {Number} pageCount 总页数
                 * @param {Number} currentPage 当前页
                 * @return {Object} pageInfo
                 *  pageInfo.pageRange{Array}元素值为显示的页码
                 *  pageInfo.last 上一页的页码 如果没有可用 为false
                 *  pageInfo.next 下一页的页码 如果没有可用 为false
                 */
                function getShowPageRange(pageCount, currentPage) {
                    var startPage = currentPage - 5;
                    if (startPage < 1) {
                        startPage = 1;
                    }
                    var showPageArray = [];
                    for (var i = 0; i < 10 && startPage + i <= pageCount; ++i) {
                        showPageArray.push(startPage + i);
                    }
                    return {
                        pageRange: showPageArray,
                        last: currentPage == 1 ? false : currentPage - 1,
                        next: currentPage == pageCount ? false : currentPage + 1
                    };
                }


            }
        };
    }]);
});