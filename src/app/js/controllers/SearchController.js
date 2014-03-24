"use strict";

var criteriaUtils = criteriaUtils || {
    updateMls: function (criteria) {
        if (!Utils.isDefinedAndNotNull (criteria.mlsStr)) {
            criteria.mls = [];
            return;
        }
        criteria.mls = criteria.mlsStr.split (",");
        if (criteria.mls.length == 1 && S (criteria.mls[0]).trim ().s == "") {
            criteria.mls = [];
        } else {
            for (var i = 0; i < criteria.mls.length; i++) {
                criteria.mls[i] = S (criteria.mls[i]).trim ().s;
            }
        }
    },
    
    prepareCriteria: function (criteria) {
        criteriaUtils.updateMls (criteria);

        Utils.convertStringToInt (criteria, "minPriceK");
        Utils.convertStringToInt (criteria, "maxPriceK");
        Utils.convertStringToInt (criteria, "minBedrooms");

        criteria.viewDetailsFirstResult = criteria.mls.length == 1;
    }
};

criteriaUtils.getFromUrlSearch = criteriaUtils.getFromUrlSearch ||
    function (search) {
        if (search[0] === "?")
            search = search.substr (1);
        var criteria = jQuery.deparam (search);
        criteria.scrapeResults = criteria.scrapeResults === true || criteria.scrapeResults === "true";
        criteriaUtils.prepareCriteria (criteria);
        return criteria;
    };

app.controller ("SearchController",
    function ($scope, $window, browserGeneralStorageService, searchService, criteriaBookmarkService) {

        // $location.search() isn't working right, so use $window.location.search
        if ($window.location.search.length !== 0)
        {
            var urlCriteria = criteriaUtils.getFromUrlSearch ($window.location.search);
            $scope.criteria = urlCriteria;
            $scope.$apply();

            chrome.tabs.getCurrent (function (tab) {
                searchService.searchDaytonRapmls (urlCriteria, tab);
            });
            return;
        }

        $scope.criteria = {
            scrapeResults: false
        };

        chrome.tabs.query ({ currentWindow: true, active: true }, function (tabs) {
            if (!Utils.isDefinedAndNotNull (tabs) || tabs.length === 0)
                $scope.canScrapeCurrentPage = false;
            chrome.tabs.sendMessage (tabs[0].id, { action: "getCanScrape" }, function (response) {
                $scope.canScrapeCurrentPage = response === true;
            });
        });

        $scope.scrapeCurrentPage = function () {
            chrome.tabs.query ({ currentWindow: true, active: true }, function (tabs) {
                if (!Utils.isDefinedAndNotNull (tabs) || tabs.length === 0)
                    return;

                chrome.tabs.sendMessage (tabs[0].id, { action: "scrape" });
                window.close ();
            });
        };

        browserGeneralStorageService.getLastCriteria ().then (function (criteria) {
            if (Utils.isDefinedAndNotNull (criteria)) {
                for (var i = 0; i < criteria.length; i++)
                    criteria[i].id = Utils.getCriteriaDescription (criteria[i]);
                if (criteria.length > 0)
                    $scope.criteria = criteria[0];
                $scope.recentCriteria = criteria;
            }
        });

        $scope.toggleScrapeResults = function () {
            $scope.criteria.scrapeResults = !$scope.criteria.scrapeResults;
        };

        $scope.executeSearch = function (criteria) {
            criteriaUtils.prepareCriteria (criteria);
            searchService.searchDaytonRapmls (criteria);
        };

        $scope.bookmarkSearch = function (criteria) {
            criteriaUtils.prepareCriteria (criteria);
            criteriaBookmarkService.addOrUpdateBookmark (criteria);
        };

        $scope.viewListings = function () {
            var listingsUrl = chrome.runtime.getURL("/app/templates/listings.html");

            // if active tab is the DAYTON MLS search page, use that - else, create a new tab
            chrome.tabs.query ({ url: listingsUrl }, function (tabs) {
                if (tabs.length === 0) {
                    chrome.tabs.create ({ url: listingsUrl }, function (_) {});
                }
                else {
                    chrome.tabs.update (tabs[0].id, { url: listingsUrl, active: true });
                }
            });
        };

    });