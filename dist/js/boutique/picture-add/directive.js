"use strict";

define("boutique/picture-add/directive", [ "app" ], function(require, exports, module) {
    var app = require("app");
    app.directive("produceLine", [ function() {
        return {
            restrict: "A",
            //scope: true,
            link: function(scope, elem, attrs) {
                var trNode = $(elem).parents("tr");
                var newTrNode = $("<tr></tr>");
                newTrNode.append($(elem));
                trNode.after(newTrNode);
                newTrNode.find("td").attr("colspan", "11");
            }
        };
    } ]);
    app.directive("deleteContent", [ function() {
        return {
            restrict: "A",
            //scope: true,
            link: function(scope, elem, attrs) {
                var observer = new MutationObserver(function(records) {
                    $(elem).find("[data-remove]").remove();
                });
                var options = {
                    subtree: true,
                    childList: true,
                    attributeFilter: [ "data-remove" ]
                };
                observer.observe($(elem)[0], options);
            }
        };
    } ]);
});