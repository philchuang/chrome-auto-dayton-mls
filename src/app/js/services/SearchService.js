"use strict";

// TODO move this inside factory method
var searchServiceBase = searchServiceBase || {
    DAYTON_RAPMLS_PARTIAL_URL: "http://dayton.rapmls.com/scripts/mgrqispi.dll?APPNAME=Dayton",
    DAYTON_RAPMLS_URL: "http://dayton.rapmls.com/scripts/mgrqispi.dll?APPNAME=Dayton&PRGNAME=MLSLogin&ARGUMENT=1qpfrF1qRkQqOropCefZ1w%3D%3D&KeyRid=1"
};

// TODO refactor chrome calls to new service, browserTabsService
/*
 * Executes searches with the given criteria, using Chrome API
 */
app.factory ("searchService", function (browserGeneralStorageService, rapmlsContentScriptMessageService) {
    
    return {

        searchDaytonRapmls: function (criteria, tab) {

            if (typeof tab !== "undefined" && tab != null)
            {
                // re-use the given tab
                browserGeneralStorageService.publishCriteria (criteria, tab.id);
                if (criteria.scrapeResults === true || criteria.viewDetailsFirstResult === true)
                    browserGeneralStorageService.publishScrapeOptions (tab.id, { scrapeResults: criteria.scrapeResults, viewDetailsFirstResult: criteria.viewDetailsFirstResult });
                chrome.tabs.update (tab.id, { url: searchServiceBase.DAYTON_RAPMLS_URL });
                return;
            }

            // if active tab is the DAYTON MLS search page, use that - else, create a new tab
            chrome.tabs.query ({ currentWindow: true, active: true }, function (tabs) {
                if (!(S(tabs[0].url).startsWith (searchServiceBase.DAYTON_RAPMLS_PARTIAL_URL)))
                {
                    chrome.tabs.create({ url: searchServiceBase.DAYTON_RAPMLS_URL }, function (newTab) {
                        browserGeneralStorageService.publishCriteria (criteria, newTab.id);
                        if (criteria.scrapeResults === true || criteria.viewDetailsFirstResult === true)
                            browserGeneralStorageService.publishScrapeOptions (newTab.id, { scrapeResults: criteria.scrapeResults, viewDetailsFirstResult: criteria.viewDetailsFirstResult });
                        // TODO figure out what happens if new tab calls consume before publish is called
                    });
                }
                else
                {
                    browserGeneralStorageService.publishCriteria (criteria, tabs[0].id);
                    if (criteria.scrapeResults === true || criteria.viewDetailsFirstResult === true)
                        browserGeneralStorageService.publishScrapeOptions (tabs[0].id, { scrapeResults: criteria.scrapeResults, viewDetailsFirstResult: criteria.viewDetailsFirstResult });
                    rapmlsContentScriptMessageService.sendCriteriaToTab(tabs[0].id, criteria, function (response) {
                        if (typeof response !== "undefined" && response !== null && response === true)
                            browserGeneralStorageService.consumeCriteria (tabs[0].id);
                    });
                }
            });
        }
    };
});