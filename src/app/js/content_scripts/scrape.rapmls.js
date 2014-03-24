/*
 * Content script for http://dayton.rapmls.com result list page
 * scrapes basic MLS data
 */

"use strict";

function processRows (resultRows, finishedCallback) {

    var numProcessed = 0;
    var numNew = 0;
    var numNoChange = 0;
    var numUpdated = 0;
    
    var currentListing = {};
    currentListing.record = {};

    var scrapedMlsNums = [];

    for (var i = 0; i < resultRows.length; i++) {
        var cellIdx = 0;
        if (i % 4 === 0) {
            var cells = $(resultRows[i]).children ("td");
            currentListing = {};
            currentListing.record = {};
            currentListing.record.refreshed = new Date ().toJSON ();
            currentListing.record.listPrice = parseInt (S($(cells[cellIdx++]).text ()).replaceAll ("$", "").replaceAll (",", ""));
            currentListing.record.bedrooms = parseInt ($(cells[cellIdx++]).text ());
            currentListing.record.bathrooms = $(cells[cellIdx++]).text ();
            currentListing.record.sqft = parseInt ($(cells[cellIdx++]).text ());
            currentListing.record.lotSize = $(cells[cellIdx++]).text ();
            currentListing.record.yearBuilt = parseInt ($(cells[cellIdx++]).text ());
            currentListing.record.listingType = $(cells[cellIdx++]).text ();
            continue;
        }

        if (i % 4 === 1) {
            currentListing.record.status = S($(resultRows[i]).find ("font.mStatusTextB").text ()).trim ().s;
            var addressCells = $($(resultRows[i]).find ("table table")[1]).find ("td");
            currentListing.record.streetNumber = $(addressCells[1]).text ();
            currentListing.record.streetName = S($(addressCells[2]).text ()).trim ().s;
            var cityAndZip = $(addressCells[3]).text ();
            var cityAndZipSplit = $(cityAndZip.split (decodeURIComponent ("%C2%A0")));
            currentListing.record.city = cityAndZipSplit.first ()[0];
            currentListing.record.zip = cityAndZipSplit.last ()[0];
            currentListing.record.description = $($($(resultRows[i]).find ("table table")[0]).children ("tbody").children ("tr").children ()[5]).text ();
            currentListing.record.mainImageUrl = $(resultRows[i]).find ("img")[0].src;
            continue;
        }

        if (i % 4 === 2) {
            var mlsStr = $($(resultRows[i]).find ("td")[1]).text ();
            currentListing.record.mls = $(mlsStr.split ("#")).last ()[0];
            scrapedMlsNums.push (currentListing.record.mls);
            currentListing.id = currentListing.record.mls;
            continue;
        }

        if (i % 4 === 3) {
            // process listing
            numProcessed++;
            chrome.runtime.sendMessage ({ action: "processListing", listing: currentListing }, function (resultAndListing) {
                if (resultAndListing.result === -1)
                    numNew++;
                else if (resultAndListing.result === 0)
                    numNoChange++;
                else if (resultAndListing.result === 1)
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

function openFirstResultDetailsPage (resultRows) {
    var row3 = resultRows[2];
    var link = $(row3).find ("a:contains('View Details')")[0];
    link.click ();
}

function processMlsNumsThatNeedDetails (mlsNums)
{
    if (typeof mlsNums === "undefined" || mlsNums === null || mlsNums.length == 0) return;

    var foundLink = null;
    for (var i = 0; i < mlsNums.length; i++) {
        var link = getDetailsPageLinkFor (mlsNums[i]);
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
            if (options.viewDetailsFirstResult) {
                // push options back to app, so that details content script can know to scrape
                chrome.runtime.sendMessage ({ action: "publishScrapeOptions", options: options }, function () {
                    openFirstResultDetailsPage (resultRows);
                });
            }
        });
    } else {
        if (options.viewDetailsFirstResult)
            openFirstResultDetailsPage (getResultRows ());
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

    chrome.runtime.onMessage.addListener (function (request, sender, sendResponse) {
        if (request.action === "getCanScrape") {
            sendResponse (true);
            return true;
        }
        
        if (request.action === "scrape") {
            processRows (getResultRows ());
            return false;
        }

        console.log ("Don't know how to to handle request: " + request);

        return false;
    });

});