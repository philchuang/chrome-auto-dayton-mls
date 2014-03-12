"use strict";

app.filter ("mlsSearchUrl", function () {
    return function (mls) {
        return chrome.runtime.getURL("/app/templates/search.html?mlsStr=" + mls + "&scrapeResults=true");
    };
});