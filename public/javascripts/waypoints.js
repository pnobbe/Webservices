function selectRace(race) {
    $.ajax({
        url: "/api/search/nearby/" + race.city,
        type: "GET",
        dataType: 'json',
        success: function (data) {
            console.log(data);
            data.forEach(function (waypoint) {
                addWaypoint(waypoint);
            });

            var map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: -34.397, lng: 150.644},
                zoom: 6
            });
            var infoWindow = new google.maps.InfoWindow({map: map});

            // Try HTML5 geolocation.
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    infoWindow.setPosition(pos);
                    infoWindow.setContent('Location found.');
                    map.setCenter(pos);
                }, function() {
                    handleLocationError(true, infoWindow, map.getCenter());
                });
            } else {
                // Browser doesn't support Geolocation
                handleLocationError(false, infoWindow, map.getCenter());
            }


            function handleLocationError(browserHasGeolocation, infoWindow, pos) {
                infoWindow.setPosition(pos);
                infoWindow.setContent(browserHasGeolocation ?
                    'Error: The Geolocation service failed.' :
                    'Error: Your browser doesn\'t support geolocation.');
            }


        },
        error: function (data) {
            console.log(data);
        }
    });
}

socket.on('new_waypoint', function (waypoint) {
    console.log(waypoint);
    addWaypoint(waypoint);
});

socket.on('delete_waypoint', function (id) {
    console.log(id);
    $("#waypointList").find('#' + id).remove();
});

$(".btn-new-waypoint").click(function () {
    $.ajax({
        url: "/api/waypoints",
        type: "PUT",
        dataType: 'json',
    });
    socket.emit('new_waypoint');
});

$('#waypointList').on('click', '.btn-delete', function (event) {
    let id = $(event.target).closest("li").prop('id');
    $.ajax({
        url: "/api/waypoints/" + id,
        type: "DELETE",
    });
});

function addWaypoint(waypoint) {
    $("#waypointList").append('<li class="list-group-item" id=' + waypoint.id + '>' + waypoint.name + ' <button class="btn btn-danger btn-delete">Delete</button><button class="btn btn-error btn-warning">Edit</button></li>');
}