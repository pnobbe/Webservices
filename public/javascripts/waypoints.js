function selectRace(race) {

}



socket.on('new_waypoint', function (id) {


    addWaypoint(id);
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