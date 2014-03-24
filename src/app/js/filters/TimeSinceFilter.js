"use strict";

app.filter ("timeSince", function () {
    return function (dateObj) {
        if (typeof dateObj === "undefined" || dateObj == null) return "0";
        var date = new Date();
        if (typeof dateObj === "string")
            date = Date.parse(dateObj);
        else if (dateObj.getMonth)
            date = dateObj;

        var today = new Date();
        var diffMs = today - date;
        var diffMins = Math.round (diffMs / 1000 / 60);
        var diffHrs = Math.round (diffMs / 1000 / 60 / 60);
        var diffDays = Math.round (diffMs / 1000 / 60 / 60 / 24);

        return diffMins < 60 ? diffMins + "m" : diffHrs <= 48 ? diffHrs + "h" : diffDays + "d";
    };
});