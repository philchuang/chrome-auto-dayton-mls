"use strict";

/*
 * Executes searches with the given criteria
 */
app.factory ("searchService", function (browserTabsService, browserGeneralStorageService) {

    var DAYTON_RAPMLS_PARTIAL_URL = "http://dayton.rapmls.com/scripts/mgrqispi.dll?APPNAME=Dayton";
    var DAYTON_RAPMLS_URL = "http://dayton.rapmls.com/scripts/mgrqispi.dll?APPNAME=Dayton&PRGNAME=MLSLogin&ARGUMENT=1qpfrF1qRkQqOropCefZ1w%3D%3D&KeyRid=1";

    return {

        searchDaytonRapmls: function (criteria) {

            // if active tab is the DAYTON MLS search page, use that - else, create a new tab
            browserTabsService.getCurrentTabUrl ().then (function (url) {
                if (!(S(url).startsWith (DAYTON_RAPMLS_PARTIAL_URL))) {
                    browserTabsService.openNewTab (DAYTON_RAPMLS_URL).then (function (tabId) {

                        browserGeneralStorageService.publishCriteria(criteria, tabId);
                        if (criteria.scrapeResults === true || criteria.viewDetailsFirstResult === true)
                            browserGeneralStorageService.publishScrapeOptions (tabId, { scrapeResults: criteria.scrapeResults, viewDetailsFirstResult: criteria.viewDetailsFirstResult });
                        // TODO figure out what happens if new tab calls consume before publish is called

                    });
                } else {
                    browserTabsService.getCurrentTabId ().then (function (tabId) {

                        browserGeneralStorageService.publishCriteria (criteria, tabId);
                        if (criteria.scrapeResults === true || criteria.viewDetailsFirstResult === true)
                            browserGeneralStorageService.publishScrapeOptions (tabId, { scrapeResults: criteria.scrapeResults, viewDetailsFirstResult: criteria.viewDetailsFirstResult });

                        browserTabsService.sendMessageToTab (tabId, { "action": "setCriteriaAndExecute", "criteria": criteria }).then (function (response) {
                            if (Utils.isDefinedAndNotNull (response) && response === true)
                                browserGeneralStorageService.consumeCriteria (tabId);
                        });
                    });
                }
            });
        },

        searchDaytonRapmlsInCurrentTab: function (criteria) {
            browserTabsService.getCurrentTabId ().then (function (tabId) {

                browserGeneralStorageService.publishCriteria (criteria, tabId);
                if (criteria.scrapeResults === true || criteria.viewDetailsFirstResult === true)
                    browserGeneralStorageService.publishScrapeOptions (tabId, 
                        { scrapeResults: criteria.scrapeResults, viewDetailsFirstResult: criteria.viewDetailsFirstResult });

                browserTabsService.updateTabUrl (tabId, DAYTON_RAPMLS_URL);

            });
        }

    };
});