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
    }
};

app.controller ("SearchController",
    function ($scope, $window, storageService, searchService, criteriaBookmarkService) {

        // $location.search() isn't working right, so use $window.location.search
        if ($window.location.search.length !== 0)
        {
            chrome.tabs.getCurrent (function (tab) {
                var criteria = jQuery.deparam ($window.location.search.substr (1));
                criteria.scrapeResults = criteria.scrapeResults === true || criteria.scrapeResults === "true";
                criteriaUtils.updateMls (criteria);
                $scope.criteria = criteria;
                searchService.searchDaytonRapmls (criteria, tab);
            });
        }

        $scope.criteria = {
            scrapeResults: false
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
            criteriaUtils.updateMls (criteria);
            searchService.searchDaytonRapmls (criteria);
        };

        $scope.bookmarkSearch = function (criteria) {
            criteriaUtils.updateMls (criteria);
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