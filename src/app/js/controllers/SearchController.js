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
    function ($scope, $window, browserTabsService, browserGeneralStorageService, searchService, scrapeService, criteriaBookmarkService) {

        // $location.search() isn't working right, so use $window.location.search
        if ($window.location.search.length !== 0)
        {
            var urlCriteria = criteriaUtils.getFromUrlSearch ($window.location.search);
            $scope.criteria = urlCriteria;
            //$scope.$apply();

            searchService.searchDaytonRapmlsInCurrentTab (urlCriteria);
            return;
        }

        $scope.criteria = {
            scrapeResults: false
        };

        scrapeService.checkCurrentPageCanBeScraped ().then (function (canScrape) {
            $scope.canScrapeCurrentPage = canScrape;
        });

        $scope.scrapeCurrentPage = function () {
            scrapeService.scrapeCurrentPage ().then (function (tabs) {
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

            // if active tab is the search page, do search in active tab - else, create a new tab
            browserTabsService.getActiveTabUrl ().then (function (url) {
                if (Utils.isDefinedAndNotNull (url) && S(url).startsWith (browserTabsService.searchUrl)) {
                    searchService.searchDaytonRapmlsInActiveTab (criteria);
                } else {
                    searchService.searchDaytonRapmls (criteria);
                }
            });
        };

        $scope.bookmarkSearch = function (criteria) {
            criteriaUtils.prepareCriteria (criteria);
            criteriaBookmarkService.addOrUpdateBookmark (criteria);
        };

        $scope.viewListings = function () {
            // if active tab is the search page, open listing in current tab - else, create a new tab
            browserTabsService.getCurrentTabUrl ().then (function (url) {
                if (url === browserTabsService.searchUrl) {
                    browserTabsService.updateCurrentTabUrl (browserTabsService.listingsUrl);
                } else {
                    browserTabsService.openNewTab (browserTabsService.listingsUrl);
                }
            });
        };

    });