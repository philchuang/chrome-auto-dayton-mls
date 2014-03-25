"use strict";

app.filter ("mlsSearchUrl", function (browserTabsService) {
    return function (mls) {
        return browserTabsService.getAppUrl ("/app/templates/search.html?mlsStr=" + mls + "&scrapeResults=true");
    };
});