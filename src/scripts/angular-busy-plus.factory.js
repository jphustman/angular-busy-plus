//loosely modeled after angular-promise-tracker
angular.module("cgBusyPlus").factory("_cgBusyPlusTrackerFactory", [
    "$timeout",
    "$q",
    function ($timeout, $q) {
        "use strict";

        return function () {

            var tracker = {};

            var addPromiseLikeThing = function (promise) {

                if (!tracker.isPromise(promise)) {
                    throw new Error("cgBusyPlus expects a promise (or something that has a .promise or .$promise");
                }

                if (tracker.promises.indexOf(promise) !== -1) {
                    return;
                }
                tracker.promises.push(promise);

                tracker.callThen(promise, function () {
                    promise.$cgBusyPlusFulfilled = true;
                    if (tracker.promises.indexOf(promise) === -1) {
                        return;
                    }
                    tracker.promises.splice(tracker.promises.indexOf(promise), 1);
                }, function (err) {
                    tracker.errors.push(err);
                    promise.$cgBusyPlusFulfilled = true;
                    if (tracker.promises.indexOf(promise) === -1) {
                        return;
                    }
                    tracker.promises.splice(tracker.promises.indexOf(promise), 1);
                });
            };

            tracker.promises = [];
            tracker.errors = [];
            tracker.delayPromise = null;
            tracker.durationPromise = null;
            tracker.delayJustFinished = false;

            tracker.reset = function (options) {
                tracker.minDuration = options.minDuration;

                tracker.promises = [];
                tracker.errors.splice(0, tracker.errors.length); // reset array

                angular.forEach(options.promises, function (p) {
                    if (!p || p.$cgBusyPlusFulfilled) {
                        return;
                    }
                    addPromiseLikeThing(p);
                });

                if (tracker.promises.length === 0) {
                    //if we have no promises then don't do the delay or duration stuff
                    return;
                }

                tracker.delayJustFinished = false;
                if (options.delay) {
                    tracker.delayPromise = $timeout(function () {
                        tracker.delayPromise = null;
                        tracker.delayJustFinished = true;
                    }, parseInt(options.delay, 10));
                }
                if (options.minDuration) {
                    tracker.durationPromise = $timeout(function () {
                        tracker.durationPromise = null;
                    }, parseInt(options.minDuration, 10) + (options.delay
                        ? parseInt(options.delay, 10)
                        : 0));
                }
            };

            tracker.isPromise = function (promiseThing) {
                var then = promiseThing && (promiseThing.then || promiseThing.$then ||
                        (promiseThing.$promise && promiseThing.$promise.then));

                    // debugger;
                return typeof then !== "undefined";
            };

            tracker.callThen = function (promiseThing, success, error) {
                var promise;
                if (promiseThing.then || promiseThing.$then) {
                    promise = promiseThing;
                } else if (promiseThing.$promise) {
                    promise = promiseThing.$promise;
                } else if (promiseThing.denodeify) {
                    promise = $q.when(promiseThing);
                }

                var then = (promise.then || promise.$then);

                then.call(promise, success, error);
            };

            tracker.active = function () {
                if (tracker.delayPromise) {
                    return false;
                }

                if (!tracker.delayJustFinished) {
                    if (tracker.durationPromise) {
                        return true;
                    }
                    return tracker.promises.length > 0;
                }

                //if both delay and min duration are set,
                //we don't want to initiate the min duration if the
                //promise finished before the delay was complete

                tracker.delayJustFinished = false;

                if (tracker.promises.length === 0) {
                    tracker.durationPromise = null;
                }

                return tracker.promises.length > 0;
            };

            tracker.hasError = function () {
                return tracker.errors.length > 0;
            };

            return tracker;
        };
    }
]);

