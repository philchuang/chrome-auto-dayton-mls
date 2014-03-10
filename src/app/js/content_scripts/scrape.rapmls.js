/*
 * Content script for http://dayton.rapmls.com result list page
 */

"use strict";

function processRows (resultRows) {
    var currentListing = {};

    for (var i = 1; i < resultRows.length; i++) {
        if (i % 4 === 0) {
            currentListing = {};
            // TODO get row 1 data
        }

        if (i % 4 === 1) {
            currentListing = {};
            // TODO get row 2 data
        }

        if (i % 4 === 2) {
            currentListing = {};
            // TODO get row 3 data
        }

        if (i % 4 === 3) {
            // TODO get row 4 data
            // save listing
            chrome.runtime.sendMessage({ action: "processListing", listing: currentListing }, function (_) { });
        }
    }
}

$ (document).ready (function () {
    var resultRows = $($($("#WorkspaceBGSH > table:nth-child(1) > tbody > tr > td > table")[1]).children ("tbody")).children ("tr[class!=HeaderRow]");
    if (resultRows.length == 0)
        return; // not on the results page

    processRows (resultRows);
});