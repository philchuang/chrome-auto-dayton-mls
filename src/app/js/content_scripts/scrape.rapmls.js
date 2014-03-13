/*
 * Content script for http://dayton.rapmls.com result list page
 */

"use strict";

function processRows (resultRows, finishedCallback) {

    var numProcessed = 0;
    var numNew = 0;
    var numNoChange = 0;
    var numUpdated = 0;
    
    var currentListing = {};
    
    // TODO get all image URLs
    // TODO get initial listing date

    var scrapedMlsNums = [];

    for (var i = 0; i < resultRows.length; i++) {
        var cellIdx = 0;
        if (i % 4 === 0) {
            var cells = $(resultRows[i]).children ("td");
            currentListing = {};
            currentListing.timestamp = new Date ().toJSON ();
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
            currentListing.status = S($(resultRows[i]).find ("font.mStatusTextB").text ()).trim ().s;
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
            scrapedMlsNums.push (currentListing.mls);
            currentListing.id = currentListing.mls;
            continue;
        }

        if (i % 4 === 3) {
            // process listing
            numProcessed++;
            
            chrome.runtime.sendMessage({ action: "processListing", listing: currentListing }, function (result) {
                if (result === -1)
                    numNew++;
                else if (result === 0)
                    numNoChange++;
                else if (result === 1)
                    numUpdated++;
                
                if (numProcessed === numNew + numNoChange + numUpdated) {
                    var message = numProcessed + " processed: " + numNew + " new, " + numUpdated + " updated, " + numNoChange + " unchanged.";
                    //console.log (message);

                    chrome.runtime.sendMessage ({ action: "updateListingStaleness" });

                    chrome.runtime.sendMessage ({
                        action: "displayNotification",
                        id: "",
                        title: "Scrape Results",
                        message: message
                    });

                    if (typeof finishedCallback !== "undefined" && finishedCallback != null)
                        finishedCallback (resultRows);

                    chrome.runtime.sendMessage ({ action: "checkNeedsListingDetails", mlsNums: scrapedMlsNums },
                        function (mlsNums) {
                            processMlsNumsThatNeedDetails (mlsNums);
                        });
                }
            });
            continue;
        }
    }
}

function getResultRows ()
{
    return $($($("#WorkspaceBGSH > table:nth-child(1) > tbody > tr > td > table")[1]).children ("tbody")).children ("tr[class!=HeaderRow]");
}

var DEBUG_allListings = [];

function DEBUG_loadAllListings () {
    chrome.runtime.sendMessage ({ action: "getAllListings" }, function (listings) {
        DEBUG_allListings = listings;
    });
}

function openFirstResultDetailsPage (resultRows) {
    var row3 = resultRows[2];
    var link = $(row3).find("a:contains('View Details')")[0];
    link.click ();
}

function processMlsNumsThatNeedDetails (mlsNums)
{
    if (typeof mlsNums === "undefined" || mlsNums === null || mlsNums.length == 0) return;

    var foundLink = null;
    for (var i = 0; i < mlsNums.length; i++) {
        var link = getDetailsPageLinkFor(mlsNums[i]);
        if (link != null) {
            foundLink = link;
            break;
        }
    }
    
    if (foundLink == null) {
        chrome.runtime.sendMessage ({ action: "saveMlsDetailsFetchList", mlsNums: [] });
    } else {
        foundLink.click ();
    }
}

function getDetailsPageLinkFor (mls) {
    var links = $($("td:contains('#" + mls + "')").last ().siblings ()[1]).find ("a");
    if (links.length > 0) {
        return links[0];
    }
    return null;
}

function openDetailsPageFor (mls) {
    var link = getDetailsPageLinkFor (mls);
    if (link != null)
        link.click ();
}

function handleScrapeOptions (options) {
    if (typeof options === "undefined" || options == null) return;

    if (options.scrapeResults) {
        processRows (getResultRows (), function (resultRows) {
            if (options.viewDetailsFirstResult)
                openFirstResultDetailsPage (resultRows);
        });
    }
}

$(document).ready (function ()
{
    if ($("#WorkspaceBGSH").length === 0)
        return; // not on the results page

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

    chrome.runtime.sendMessage ({ action: "consumeScrapeOptions" }, function (options) {
        if (options)
            handleScrapeOptions (options);
        else
            chrome.runtime.sendMessage ({ action: "getMlsDetailsFetchList" }, function (mlsNums) {
                processMlsNumsThatNeedDetails (mlsNums);
            });
    });

});