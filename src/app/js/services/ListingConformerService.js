"use strict";

/*
 * ensures listing objects are consistent, clean, and migrated
 */
app.factory ("listingConformerService", function ($q) {
    
    var migrate = function (listing) {
        // nothing here right now
        return false;
    };

    var cleanse = function (listing) {
        var modified = false;

        if (typeof listing === "undefined" || listing === null) return modified;

        // delete $$hashKey (gets added somehow)

        if (typeof listing.history !== "undefined" && listing.history !== null)
        {
            for (var i = 0; i < listing.history.length; i++)
            {
                if (typeof listing.history[i].$$hashKey !== "undefined")
                {
                    delete listing.history[i].$$hashKey;
                    modified = true;
                }
            }
        }

        if (typeof listing.pictures !== "undefined" && listing.pictures !== null)
        {
            for (var i2 = 0; i2 < listing.pictures.length; i2++)
            {
                if (typeof listing.pictures[i2].$$hashKey !== "undefined")
                {
                    delete listing.pictures[i2].$$hashKey;
                    modified = true;
                }
            }
        }

        return modified;
    };

    var conform = function (listing) {
        var modified = false;

        if (typeof listing === "undefined" || listing === null) return modified;

        // make sure user data is present
        if (typeof listing.isFavorite === "undefined" || listing.isFavorite === null) {
            listing.isFavorite = false;
            modified = true;
        }

        if (typeof listing.isHidden === "undefined" || listing.isHidden === null) {
            listing.isHidden = false;
            modified = true;
        }

        if (typeof listing.score === "undefined" || listing.score === null) {
            listing.score = 0;
            modified = true;
        }

        if (typeof listing.subdivision === "undefined") {
            listing.subdivision = null;
            modified = true;
        }

        return modified;
    };
    
    return {

        conform: function (listing) {
            var modified = migrate (listing);
            modified |= cleanse (listing);
            modified |= conform (listing);
            return modified;
        }

    };
});