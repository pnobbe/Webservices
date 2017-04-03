socket.on('new_waypoint', function (id) {
    addWaypoint(id);
});

socket.on('delete_waypoint', function (id) {
    $("#waypointList").find('#' + id).remove();
});

$(".btn-new-waypoint").click(function () {
    socket.emit('new_waypoint');
});

$('#waypointList').on('click', '.btn-delete', function (event) {
    socket.emit('delete_waypoint', $(this).closest("li").prop('id'));
});

function addWaypoint(id) {
    $("#waypointList").append('<li class="list-group-item" id=' + id + '>Waypoint ' + id + ' <button class="btn btn-error btn-delete">Delete</button></li>');
}