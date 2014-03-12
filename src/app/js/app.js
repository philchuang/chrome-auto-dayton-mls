"use strict";

var app = angular.module ("AutoDaytonMls", []);
app.config (function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist (/^\s*(https?|ftp|mailto|chrome-extension):/);
    // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
});