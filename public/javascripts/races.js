socket.on('new_race', function (id) {
    addRace(id);
});

socket.on('delete_race', function (id) {
    $("#raceList").find('#' + id).remove();
});

socket.on('race_start', function (data) {
    console.log("Race start");
});

$(".btn-new-race").click(function () {
    socket.emit('new_race');
});

$('#raceList').on('click', '.btn-delete', function (event) {
    socket.emit('delete_race', $(this).closest("li").prop('id'));
});

function addRace(id) {
    $("#raceList").append('<li class="list-group-item" id=' + id + '>Race ' + id + ' <button class="btn btn-error btn-delete">Delete</button></li>');
}