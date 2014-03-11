/*
 * Content script for http://dayton.rapmls.com result list page
 */

"use strict";

function processRows (resultRows) {
    var currentListing = {};

    for (var i = 0; i < resultRows.length; i++) {
        var cellIdx = 0;
        if (i % 4 === 0) {
            var cells = $(resultRows[i]).children ("td");
            currentListing = {};
            currentListing.timestamp = new Date ();
            currentListing.listPrice = parseInt (S($(cells[cellIdx++]).text ()).replaceAll ("$", "").replaceAll (",", ""));
            currentListing.bedrooms = parseInt ($(cells[cellIdx++]).text ());
            currentListing.bathrooms = $(cells[cellIdx++]).text ();
            currentListing.sqft = parseInt ($(cells[cellIdx++]).text ());
            currentListing.lotSize = $(cells[cellIdx++]).text ();
            currentListing.yearBuilt = parseInt ($(cells[cellIdx++]).text ());
            currentListing.listingType = $(cells[cellIdx++]).text();
            continue;
        }

        if (i % 4 === 1) {
            var addressCells = $($(resultRows[i]).find ("table table")[1]).find ("td");
            currentListing.streetNumber = $(addressCells[1]).text ();
            currentListing.streetName = S($(addressCells[2]).text ()).trim ().s;
            var cityAndZip = $(addressCells[3]).text ();
            var cityAndZipSplit = $(cityAndZip.split (decodeURIComponent ("%C2%A0")));
            currentListing.city = cityAndZipSplit.first ()[0];
            currentListing.zip = cityAndZipSplit.last ()[0];
            currentListing.description = $($($(resultRows[i]).find ("table table")[0]).children ("tbody").children ("tr").children ()[5]).text ();
            currentListing.mainImageUrl = $(resultRows[i]).find("img")[0].src;
            continue;
        }

        if (i % 4 === 2) {
            var mlsStr = $($(resultRows[i]).find ("td")[1]).text ();
            currentListing.mls = $(mlsStr.split ("#")).last ()[0];
            currentListing.id = currentListing.mls;
            continue;
        }

        if (i % 4 === 3) {
            // save listing
            chrome.runtime.sendMessage({ action: "processListing", listing: currentListing }, function (_) { });
            continue;
        }
    }
}

function getResultRows ()
{
    return $($($("#WorkspaceBGSH > table:nth-child(1) > tbody > tr > td > table")[1]).children ("tbody")).children ("tr[class!=HeaderRow]");
}

$(document).ready (function ()
{
    if ($("#WorkspaceBGSH").length === 0)
        return; // not on the results page

    chrome.runtime.onMessage.addListener (function (request, sender, sendResponse) {
        if (request.action == "scrapeResults")
        {
            processRows (getResultRows ());
            sendResponse (true);
        }
        else
        {
            console.log ("Don't know how to to handle request: " + request);
        }
    });

    chrome.runtime.sendMessage ({ action: "consumeScrapeToken" }, function (response) {
        if (response === true)
        {
            processRows (getResultRows ());
        }
    });
});