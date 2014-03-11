"use strict";

var searchServiceBase = searchServiceBase || {
    DAYTON_RAPMLS_PARTIAL_URL: "http://dayton.rapmls.com/scripts/mgrqispi.dll?APPNAME=Dayton",
    DAYTON_RAPMLS_URL: "http://dayton.rapmls.com/scripts/mgrqispi.dll?APPNAME=Dayton&PRGNAME=MLSLogin&ARGUMENT=1qpfrF1qRkQqOropCefZ1w%3D%3D&KeyRid=1"

};

app.service('searchService', function (storageService, rapmlsContentScriptMessageService) {
    
    return {

        searchDaytonRapmls: function (criteria, tab) {

            if (typeof tab !== "undefined")
            {
                // re-use the given tab
                storageService.publishCriteria (criteria, tab.id);
                if (criteria.scrapeResults === true)
                    storageService.publishScrapeToken (tab.id);
                chrome.tabs.update (tab.id, { url: searchServiceBase.DAYTON_RAPMLS_URL });
                return;
            }

            // if active tab is the DAYTON MLS search page, use that - else, create a new tab
            chrome.tabs.query ({ currentWindow: true, active: true }, function (tabs) {
                if (!(S(tabs[0].url).startsWith (searchServiceBase.DAYTON_RAPMLS_PARTIAL_URL)))
                {
                    chrome.tabs.create({ url: searchServiceBase.DAYTON_RAPMLS_URL }, function (newTab) {
                        storageService.publishCriteria (criteria, newTab.id);
                        if (criteria.scrapeResults === true)
                            storageService.publishScrapeToken (newTab.id);
                        // TODO figure out what happens if new tab calls consume before publish is called
                    });
                }
                else
                {
                    storageService.publishCriteria (criteria, tabs[0].id);
                    if (criteria.scrapeResults === true)
                        storageService.publishScrapeToken (tabs[0].id);
                    rapmlsContentScriptMessageService.sendCriteriaToTab (tabs[0].id, criteria, function (response) {
                        if (typeof response !== "undefined" && response !== null && response === true)
                            storageService.consumeCriteria (tabs[0].id);
                    });
                }
            });
        }
    };
});