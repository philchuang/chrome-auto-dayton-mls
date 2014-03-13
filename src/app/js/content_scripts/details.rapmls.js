/*
 * Content script for http://dayton.rapmls.com listing details page
 */

"use strict";

function parseDollarAmount (str, listing, propertyName) {
    if (typeof str === "undefined" || str === null) {
        str = "";
    }

    str = S (str).trim().s;

    if (str.length > 0 && str[0] === "$")
        str = str.substr (1);

    var val = parseFloat (str);

    if (isNaN (val)) {
        delete listing[propertyName];
        return;
    }

    listing[propertyName] = val;
}

function updateMlsData () {

    var listing = {
        timestamp: new Date ().toJSON ()
    };
    
    // #tdListingSummary > div > div:nth-child(2) > a
    // #Workspace > table > tbody > tr > td > form > table:nth-child(34) > tbody > tr > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(2) > td > div > table > tbody > tr:nth-child(1)
    var summaryTable = $ ("#tdListingSummary").parent ().next ().children ().first ().children ().first ().children ();
    
    // mls
    var mlsStr = summaryTable.children ().first ().children ().first ().children ().first ().children ().first ().text ();
    listing.mls = S ($ (mlsStr.split ("#")).last ()[0]).trim ().s;
    listing.id = listing.mls;

    // listingDate
    var listingDate = summaryTable.children ().first ().children ().first ().children ().first ().siblings ().first ().children ().first ().siblings ().first ().children ().first ().siblings ().last ().prev ().text ();
    if (listingDate.length > 2)
        listingDate = listingDate.substr (1, listingDate.length - 2);
    listing.listingDate = new Date(listingDate).toJSON();
    
    // taxes/hoa
    parseDollarAmount ($("a:contains('Semi Annual Taxes')").parent().siblings().first().text(), listing, "semiAnnualTaxes");
    parseDollarAmount ($("a:contains('HOA/Condo Fee')").parent().siblings().first().text(), listing, "hoaFee");

    chrome.runtime.sendMessage ({ action: "updateListing", listing: listing });

    chrome.runtime.sendMessage ({ action: "getMlsDetailsFetchList" }, function (mlsNums) {
        if (typeof mlsNums === "undefined" || mlsNums === null || mlsNums.length === 0)
            return;

        var idx = $.inArray (listing.mls, mlsNums);
        if (~idx) {
            mlsNums.splice (idx, 1);
            chrome.runtime.sendMessage ({ action: "saveMlsDetailsFetchList", mlsNums: mlsNums });
            window.history.back ();
        }
    });
}

$(document).ready (function ()
{
    if ($("#Workspace").length === 0)
        return; // not on the details page

    // currently not used
    //chrome.runtime.onMessage.addListener (function (request, sender, sendResponse) {
    //    if (request.action == "scrape") {
    //        handleScrapeOptions (request.options);
    //        sendResponse (true);
    //    }
    //    else
    //    {
    //        console.log ("Don't know how to to handle request: " + request);
    //    }
    //});

    updateMlsData ();
});