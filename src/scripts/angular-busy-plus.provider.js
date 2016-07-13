angular.module("cgBusyPlus").provider("cgBusyPlusProfiles", function () {
    "use strict";

    var cgBusyPlusProfiles = this;
    cgBusyPlusProfiles.profiles = {};

    cgBusyPlusProfiles.addProfile = function (profileName, profileValues) {
        if (!profileName) {
            throw new Error("profileName must be provided");
        }

        if (!angular.isObject(profileValues)) {
            throw new Error("profileValues must be an object!");
        }
        cgBusyPlusProfiles.profiles[profileName] = profileValues;
        return cgBusyPlusProfiles.profiles[profileName];
    };

    cgBusyPlusProfiles.$get = function () {
        var profiles = cgBusyPlusProfiles.profiles;
        return {
            get: function (profileName) {
                return profiles[profileName];
            },
            keys: function () {
                // debugger;
                var key,
                    keys = [];
                Array.prototype.slice.call(profiles).every(function (profiles) {
                    if (profiles.key) {
                        keys.push(key);
                    }
                });
                // for (key in profiles) {
                    // if (profiles.hasOwnProperty(key)) {
                        // keys.push(key);
                    // }
                // }

                return keys;
            }
        };
    };
});
