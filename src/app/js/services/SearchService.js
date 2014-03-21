"use strict";

var searchServiceBase = searchServiceBase || {
    DAYTON_RAPMLS_PARTIAL_URL: "http://dayton.rapmls.com/scripts/mgrqispi.dll?APPNAME=Dayton",
    DAYTON_RAPMLS_URL: "http://dayton.rapmls.com/scripts/mgrqispi.dll?APPNAME=Dayton&PRGNAME=MLSLogin&ARGUMENT=1qpfrF1qRkQqOropCefZ1w%3D%3D&KeyRid=1"
};

// TODO refactor chrome calls to new service
// executes searches
app.service ('searchService', function (storageService, rapmlsContentScriptMessageService) {
    
    return {

        searchDaytonRapmls: function (criteria, tab) {

            // uncomment this line to freshen up the listing data
            //storageService.clearAllListings();

            if (typeof tab !== "undefined" && tab != null)
            {
                // re-use the given tab
                storageService.publishCriteria (criteria, tab.id);
                if (criteria.scrapeResults === true || criteria.viewDetailsFirstResult === true)
                    storageService.publishScrapeOptions (tab.id, { scrapeResults: criteria.scrapeResults, viewDetailsFirstResult: criteria.viewDetailsFirstResult });
                chrome.tabs.update (tab.id, { url: searchServiceBase.DAYTON_RAPMLS_URL });
                return;
            }

            // if active tab is the DAYTON MLS search page, use that - else, create a new tab
            chrome.tabs.query ({ currentWindow: true, active: true }, function (tabs) {
                if (!(S(tabs[0].url).startsWith (searchServiceBase.DAYTON_RAPMLS_PARTIAL_URL)))
                {
                    chrome.tabs.create({ url: searchServiceBase.DAYTON_RAPMLS_URL }, function (newTab) {
                        storageService.publishCriteria (criteria, newTab.id);
                        if (criteria.scrapeResults === true || criteria.viewDetailsFirstResult === true)
                            storageService.publishScrapeOptions (newTab.id, { scrapeResults: criteria.scrapeResults, viewDetailsFirstResult: criteria.viewDetailsFirstResult });
                        // TODO figure out what happens if new tab calls consume before publish is called
                    });
                }
                else
                {
                    storageService.publishCriteria (criteria, tabs[0].id);
                    if (criteria.scrapeResults === true || criteria.viewDetailsFirstResult === true)
                        storageService.publishScrapeOptions (tabs[0].id, { scrapeResults: criteria.scrapeResults, viewDetailsFirstResult: criteria.viewDetailsFirstResult });
                    rapmlsContentScriptMessageService.sendCriteriaToTab(tabs[0].id, criteria, function (response) {
                        if (typeof response !== "undefined" && response !== null && response === true)
                            storageService.consumeCriteria (tabs[0].id);
                    });
                }
            });
        }
    };
});