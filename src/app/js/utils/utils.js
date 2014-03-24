var Utils = Utils || {

    isDefinedAndNotNull: function (obj) {
        return typeof obj !== "undefined" && obj !== null;
    },
    
    convertStringToInt: function (obj, propName) {
        if (Utils.isDefinedAndNotNull (obj[propName]) && typeof obj[propName] === "string" && obj[propName].length > 0)
            obj[propName] = parseInt (obj[propName]);
        
        if (typeof obj[propName] !== "number")
            obj[propName] = null;
    },
    
    getCriteriaDescription: function (criteria)
    {
        var title = "";

        // MLS supercedes all else
        if (Utils.isDefinedAndNotNull (criteria.mls) && criteria.mls.length > 0)
        {
            title += "MLS: ";
            for (var i = 0; i < criteria.mls.length; i++)
            {
                if (i != 0)
                    title += ", ";
                title += criteria.mls[i];
            }
            return title;
        }

        if (Utils.isDefinedAndNotNull (criteria.minPriceK) && criteria.minPriceK.length != 0
            && Utils.isDefinedAndNotNull (criteria.maxPriceK) && criteria.maxPriceK.length != 0)
            title += "$" + criteria.minPriceK + "K < $" + criteria.maxPriceK + "K, ";
        else if (Utils.isDefinedAndNotNull (criteria.minPriceK) && criteria.minPriceK.length != 0)
            title += ">$" + criteria.minPriceK + "K, ";
        else if (Utils.isDefinedAndNotNull (criteria.maxPriceK) && criteria.maxPriceK.length != 0)
            title += "<$" + criteria.maxPriceK + "K, ";

        if (Utils.isDefinedAndNotNull (criteria.minBedrooms) && criteria.minBedrooms > 0)
            title += criteria.minBedrooms + "+ bed, ";

        if (Utils.isDefinedAndNotNull (criteria.zipCodes) && criteria.zipCodes.length != 0)
            title += "zips " + criteria.zipCodes + ", ";

        // cleanup
        if (title.substr (title.length - 2) == ", ")
            title = title.substr (0, title.length - 2);

        if (title.length == 0)
            title = "Empty search";

        if (Utils.isDefinedAndNotNull (criteria.scrapeResults) && criteria.scrapeResults === true)
            title += " +scrape";

        return title;
    }

};