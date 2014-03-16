"use strict";

var criteriaUtils = criteriaUtils || {
    updateMls: function (criteria) {
        if (typeof criteria.mlsStr === "undefined" || criteria.mlsStr === null) {
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
    function ($scope, $window, storageService, searchService, criteriaBookmarkService) {

        // $location.search() isn't working right, so use $window.location.search
        if ($window.location.search.length !== 0)
        {
            var criteria = criteriaUtils.getFromUrlSearch($window.location.search);
            $scope.criteria = criteria;
            $scope.$apply();

            chrome.tabs.getCurrent (function (tab) {
                searchService.searchDaytonRapmls (criteria, tab);
            });
            return;
        }

        $scope.criteria = {
            scrapeResults: false
        };

        chrome.tabs.query ({ currentWindow: true, active: true }, function (tabs) {
            if (typeof tabs === "undefined" || tabs === null || tabs.length === 0)
                $scope.canScrapeCurrentPage = false;
            chrome.tabs.sendMessage (tabs[0].id, { action: "getCanScrape" }, function (response) {
                $scope.canScrapeCurrentPage = response === true;
            });
        });

        $scope.scrapeCurrentPage = function () {
            chrome.tabs.query ({ currentWindow: true, active: true }, function (tabs) {
                if (typeof tabs === "undefined" || tabs === null || tabs.length === 0)
                    return;

                chrome.tabs.sendMessage (tabs[0].id, { action: "scrape" });
                window.close ();
            });
        };

        storageService.getLastCriteria().then (function (criteria) {
            if (criteria != null) {
                $scope.criteria = criteria;
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