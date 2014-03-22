var Utils = Utils || {

    isDefinedAndNotNull: function (obj) {
        return typeof obj !== "undefined" && obj !== null;
    },
    
    convertStringToInt: function (obj, propName) {
        if (Utils.isDefinedAndNotNull (obj[propName]) && typeof obj[propName] === "string" && obj[propName].length > 0)
            obj[propName] = parseInt (obj[propName]);
        
        if (typeof obj[propName] !== "number")
            obj[propName] = null;
    }
};