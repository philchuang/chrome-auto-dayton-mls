"use strict";

/*
 * Executes searches with the given criteria
 */
app.factory ("searchService", function (browserTabsService, browserGeneralStorageService) {

    var DAYTON_RAPMLS_PARTIAL_URL = "http://dayton.rapmls.com/scripts/mgrqispi.dll?APPNAME=Dayton";
    var DAYTON_RAPMLS_URL = "http://dayton.rapmls.com/scripts/mgrqispi.dll?APPNAME=Dayton&PRGNAME=MLSLogin&ARGUMENT=1qpfrF1qRkQqOropCefZ1w%3D%3D&KeyRid=1";

    // TODO consolidate these methods

    return {

        searchDaytonRapmls: function (criteria) {

            // if active tab is not the DAYTON MLS search page then create a new tab, else re-use the active tab
            browserTabsService.getActiveTabUrl ().then (function (url) {
                if (!Utils.isDefinedAndNotNull (url) || !(S(url).startsWith (DAYTON_RAPMLS_PARTIAL_URL))) {
                    // have to use background page to open new tab & publish b/c new tab opening kills popup process
                    chrome.extension.getBackgroundPage().openNewTabAndPublishSearchCriteria(DAYTON_RAPMLS_URL, criteria);
                } else {
                    browserTabsService.getActiveTabId ().then (function (tabId) {

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
        },

        searchDaytonRapmlsInActiveTab: function (criteria) {
            browserTabsService.getActiveTabId ().then (function (tabId) {

                browserGeneralStorageService.publishCriteria (criteria, tabId);
                if (criteria.scrapeResults === true || criteria.viewDetailsFirstResult === true)
                    browserGeneralStorageService.publishScrapeOptions (tabId, 
                        { scrapeResults: criteria.scrapeResults, viewDetailsFirstResult: criteria.viewDetailsFirstResult });

                browserTabsService.updateTabUrl (tabId, DAYTON_RAPMLS_URL);

            });
        }

    };
});