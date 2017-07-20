var Accuracy = require("ui/enums").Accuracy;
var MockManager = (function () {
    function MockManager() {
        this.MOCK_PROVIDER_NAME = "mockLocationProvider";
    }
    MockManager.prototype.requestSingleUpdate = function (options, locListener, looper) {
        var newLocation = new android.location.Location(this.MOCK_PROVIDER_NAME);
        newLocation.setLatitude(this._getRandomCoordinate());
        newLocation.setLongitude(this._getRandomCoordinate());
        newLocation.setTime((new Date()).getTime());
        newLocation.setAccuracy(500);
        locListener.onLocationChanged(newLocation);
    };
    MockManager.prototype.getProviders = function (criteria, enabledOnly) {
        var providers = [this.MOCK_PROVIDER_NAME];
        providers.size = function () {
            return providers.length;
        };
        return providers;
    };
    MockManager.prototype.removeUpdates = function (listener) {
        clearInterval(MockManager.intervalId);
    };
    MockManager.prototype.requestLocationUpdates = function (minTime, minDistance, criteria, listener, looper) {
        var _this = this;
        this.removeUpdates(null);
        MockManager.intervalId = setInterval(function () {
            return _this.requestSingleUpdate(null, listener, null);
        }, 500);
    };
    MockManager.prototype.getLastKnownLocation = function () {};
    MockManager.prototype._getRandomCoordinate = function () {
        var min = -180;
        var max = 180;
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
    return MockManager;
}());

describe("location class", function () {
    it("can be instantiated", function () {
        var geolocation = require("nativescript-geolocation");
        var Location = geolocation.Location;

        expect(function () {
            return new Location();
        }).not.toThrow();

        expect(new Location()).toBeDefined();
    });

});

describe("geolocation", function () {
    beforeEach(function () {
        geolocation = require("nativescript-geolocation");
        geolocation.setCustomLocationManager(new MockManager());
    });

    it("getCurrentLocation", function (done) {
        var location = geolocation.getCurrentLocation({
                desiredAccuracy: Accuracy.high,
                updateDistance: 0.1,
                maximumAge: 5000,
                timeout: 20000
            })
            .then(function (loc) {
                expect(loc).toBeDefined();
                expect(180 > loc.latitude > -180).toBeTruthy();

                done();
            }, function (e) {
                done.fail("Error: " + e.message);
            });
    });

    it("watchLocation", function (done) {
        var locations = [];

        geolocation.watchLocation(
            function (loc) {
                expect(loc).toBeDefined();
                expect(180 > loc.latitude > -180).toBeTruthy();
                locations.push(loc);
            },
            function (e) {
                done.fail("Error: " + e.message);
            }, {
                desiredAccuracy: Accuracy.high,
                updateDistance: 0.1,
                minimumUpdateTime: 100
            });

        setTimeout(function () {
            expect(locations.length > 1).toBeTruthy();
            done();
        }, 1500);
    });

    it("clearWatch", function (done) {
        var locations = [];
        var reference = 0;

        var watchId = geolocation.watchLocation(
            function (loc) {
                locations.push(loc);
            },
            function (e) {
                done.fail("Error: " + e.message);
            }, {
                desiredAccuracy: Accuracy.high,
                updateDistance: 0.1,
                minimumUpdateTime: 100
            });

        setTimeout(function () {
            geolocation.clearWatch(watchId);
            reference = locations.length;
        }, 1000);
        setTimeout(function () {
            expect(reference).toEqual(locations.length);
            done();
        }, 2000);
    });
});