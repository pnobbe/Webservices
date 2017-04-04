$.ajax({
    url: "/api/waypoints",
    type: "GET",
    dataType: 'json',
    success: function (data) {
        console.log(data);
        data.forEach(function (waypoint) {
            addWaypoint(waypoint);
        });
    },
    error: function (data) {
        console.log(data);
    }
});


socket.on('new_waypoint', function (id) {
    addWaypoint(id);
});

socket.on('delete_waypoint', function (id) {
    $("#waypointList").find('#' + id).remove();
});

$(".btn-new-waypoint").click(function () {
    console.log("new waypoint");

    socket.emit('new_waypoint');
});

$('#waypointList').on('click', '.btn-delete', function () {
    socket.emit('delete_waypoint', $(this).closest("li").prop('id'));
});

function addWaypoint(waypoint) {
    $("#waypointList").append('<li class="list-group-item" id=' + waypoint.id + '>' + waypoint.name + ' <button class="btn btn-error btn-delete">Delete</button></li>');
}