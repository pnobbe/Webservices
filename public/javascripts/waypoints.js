let waypointList = [];
let curRace = null;
let map;
let markers = [];

function selectRace(race) {
    if (curRace != null) {
        socket.emit('leave_room', curRace.name);
        markers = [];
    }
    curRace = race;
    socket.emit('join_room', curRace.name);


    getWaypointsFromRace(race.name, function (data) {
        if (data != null) {
            $("#waypointList").empty();
            waypointList = [];
            data.forEach(function (waypoint) {
                addWaypoint(waypoint);
            });
        }

        /* // uncomment to hardcode data
        $.getJSON("spoofdata.json", function (data) {
            fillMap(data);
        });
        */

        $.ajax({
            url: "/api/waypoints/search/nearby/" + race.city + "/cafe",
            type: "GET",
            dataType: 'json',
            success: function (data) {
                fillMap(data);
            },
            error: function (data) {
                console.log(data);
            }
        });
    });
}

function fillMap(data) {
    $.ajax({
        url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + curRace.city + "&key=AIzaSyC41fhWPPWGRDLIeYoiegujStNytAa49Pc",
        type: "GET",
        dataType: 'json',
        success: function (city) {
            if (city.results.length <= 0) {
                console.log("Unable to determine race location");
                return;
            }

            let pos = city.results[0].geometry.location;
            map = new google.maps.Map(document.getElementById('map'), {
                zoom: 14
            });
            var infoWindow = new google.maps.InfoWindow({map: map});

            // Try HTML5 geolocation.
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    map.setCenter(pos);
                }, function () {
                    handleLocationError(true, infoWindow, map.getCenter());
                });
            } else {
                // Browser doesn't support Geolocation
                handleLocationError(false, infoWindow, map.getCenter());
            }
            data.forEach(function (waypoint) {
                if (waypointList[waypoint.id] == null) {
                    addMarker(waypoint);
                }
            });

            function handleLocationError(browserHasGeolocation, infoWindow, pos) {
                infoWindow.setPosition(pos);
                infoWindow.setContent(browserHasGeolocation ?
                    'Error: The Geolocation service failed.' :
                    'Error: Your browser doesn\'t support geolocation.');
            }
        }
    });
}

socket.on('delete_waypoint', function (id) {
    $("#waypointList").find('#' + id).remove();
    waypointList[id] = null;
});

socket.on('remove_marker', function (waypoint) {
    if (markers[waypoint.id] != null) {
        markers[waypoint.id].setMap(null);
        addWaypoint({waypoint: waypoint});
    }
});

$('#waypointList').on('click', '.btn-delete', function (event) {
    let id = $(event.target).closest("li").prop('id');
    $.ajax({
        url: "/api/waypoints/" + id,
        type: "DELETE",
    });
});

function addMarker(waypoint) {
    if (markers[waypoint.id] == null) {
        var marker = new google.maps.Marker({
            position: {lat: waypoint.lat, lng: waypoint.lng},
            map: map,
            title: waypoint.name,
            icon: "http://hangoverhacks.com/wp-content/uploads/2017/03/cropped-beer-32x32.png",
            waypoint: waypoint
        });
        markers[waypoint.id] = marker;

        marker.addListener('click', function () {
            createWaypoint(marker.waypoint, function (data) {
                if (data.status != null) {
                    getWaypoint(marker.waypoint.id, function (data) {
                        curRace.waypoints.push(data);
                        updateRace(curRace);
                        socket.emit('remove_marker', {roomname: curRace.name, waypoint: data})
                    });
                } else {
                    curRace.waypoints.push(data.waypoint);
                    updateRace(curRace);
                    socket.emit('remove_marker', {roomname: curRace.name, waypoint: data.waypoint})
                }
            });

        });
    }
}

function addWaypoint(object) {
    console.log(object);
    if (object.waypoint != null) {
        let waypoint = object.waypoint;
        waypointList[waypoint.id] = waypoint;
        $("#waypointList").append('<li class="list-group-item" id=' + waypoint.id + '>' + waypoint.name + ' <button class="btn btn-danger btn-delete">Remove</button></li>');
    }
}

function createWaypoint(waypoint, cb) {
    $.ajax({
        url: "/api/waypoints/",
        type: "POST",
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify({id: waypoint.id, name: waypoint.name}),
        success: function (data) {
            console.log(data);
            cb(data);
        }, error: function (data) {
            console.log(data);
            cb(data);
        }
    });
}

function getWaypoint(id, cb) {
    $.ajax({
        url: "/api/waypoints/" + id,
        type: "GET",
        dataType: 'json',
        contentType: "application/json",
        success: function (data) {
            console.log(data);
            cb(data);
        }, error: function (data) {
            console.log(data);
            cb(data);
        }
    });
}

function getWaypointsFromRace(name, cb) {
    $.ajax({
        url: "/api/races/" + name + "/waypoints",
        type: "GET",
        dataType: 'json',
        contentType: "application/json",
        success: function (data) {
            console.log(data);
            cb(data);
        }, error: function (data) {
            console.log(data);
            cb(data);
        }
    });
}