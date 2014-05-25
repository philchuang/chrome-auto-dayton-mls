"use strict";

app.filter ("mlsSearchUrl", function (browserTabsService) {
    return function (mls) {
        return browserTabsService.getAppUrl (browserTabsService.searchUrl + "?mlsStr=" + mls + "&scrapeResults=true");
    };
});