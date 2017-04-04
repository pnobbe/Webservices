/**
 * Created by Marius on 3-4-2017.
 * wrapper for google places api
 */
const mongoose = require('mongoose');
const Waypoint = mongoose.model('Waypoint');
const NodeGeocoder = require('node-geocoder');

module.exports = class Places {

    constructor() {
        this.config = require('../config/googlePlaces');
        var g = require('node-googleplaces');
        this.places = new g(this.config.places_key);
        this.geoCoder = NodeGeocoder(this.config.geo_options);
    }

    getNearbyLocations(lat, lng) {
        var self = this;
        // using Promises
        let params = {
            location: lat + "," + lng,
            radius: this.config.range
        };
        return this.places.nearbySearch(params).then((res) => {
            // convert to waypoint
            if (res.statusCode != 200 || res.body.status != 'OK') {
                return new Promise((resolve) => {
                    resolve([]);
                });
            }

            var arr = res.body.results;
            var promises = arr.map(entree => {
                var waypoint = new Waypoint();
                waypoint.id = entree.place_id;
                return waypoint;
            });
            return self.createWaypoints(promises);
        });
    }

    getDetail(place_ID) {
        let params = {
            placeid: place_ID
        };
        return this.places.details(params);
    }

    getNearby(lat, lng, search) {
        var self = this;
        const params = {
            location: lat + "," + lng,
            radius: this.config.range,
            keyword: search
        };
        return this.places.radarSearch(params).then((res) => {
            // convert to waypoint
            if (res.statusCode != 200 || res.body.status != 'OK') {
                return new Promise((resolve) => {
                    resolve([]);
                });
            }

            var arr = res.body.results;
            var promises = arr.map(entree => {
                var waypoint = new Waypoint();
                waypoint.id = entree.place_id;
                return waypoint;
            });
            return self.createWaypoints(promises);
        });

    }


    getNearbyBars(lat, lng) {
        return this.getNearby(lat, lng, "bar");
    }

    getNearbyLocationsbyCity(city) {
        var self = this;
        return this.cityToCoordinate(city).then(data => {
            return self.getNearbyLocations(data.lat, data.lng);
        })
    }

    getNearbyBarsbyCity(city) {
        var self = this;
        return this.cityToCoordinate(city).then(data => {
            return self.getNearbyBars(data.lat, data.lng);
        })
    }

    getNearbybyCity(city, search) {
        var self = this;
        return this.cityToCoordinate(city).then(data => {
            return self.getNearby(data.lat, data.lng, search);
        })
    }


    cityToCoordinate(city) {
        return this.geoCoder.geocode(city)
            .then(function (res) {
                if (res.length > 0) {
                    return {lat: res[0].latitude, lng: res[0].longitude}
                }
                // middle of atlantic ocean
                return {lat: 34.161818, lng: -38.232422}

            });
    }


    createWaypoints(waypoints) {

        var self = this;
        if (!Array.isArray(waypoints)) {
            return new Promise((resolve) => {
                resolve([]);
            });
        }

        // create promises
        var promises = waypoints.map(waypoint => {
            return self.getDetail(waypoint.id).then(data => {


                if (data == null || data.body == null || data.body.result == null) {
                    return {waypoint: waypoint};
                }
                waypoint.name = waypoint.name ? waypoint.name : data.body.result.name;
                var o =
                {
                    waypoint: waypoint,
                    lat: data.body.result.geometry.location.lat,
                    lng: data.body.result.geometry.location.lng,
                    address: data.body.result.vicinity
                };
                return o;
            })
        });
        return Promise.all(promises);
    }

};

