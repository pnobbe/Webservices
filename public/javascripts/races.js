/*
$.ajax({
    url: "/api/races",
    type: "GET",
    dataType: 'html',
    success: function (data) {
        console.log(data);
        $("#racesList").append(data);
    },
    error: function (data) {
        console.log(data);
    }
});
*/


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
    let name = $('#name').val();
    let city = $('#city').val();

    if (name == "" || city == "") {
        return;
    }

    $('#name').val("");
    $('#city').val("");
    let body = { city: city, name: name, owner: "test" };
    /*
    $.ajax({
        url: "/api/races",
        type: "POST",
        data: body,
        success: function (data) {
            console.log(data);
        }
    });
    */
});

$('#raceList').on('click', '.btn-delete', function () {
    socket.emit('delete_race', $(this).closest("li").prop('id'));
});

function addRace(id) {
    $("#raceList").append('<li class="list-group-item" id=' + id + '>Race ' + id + ' <button class="btn btn-error btn-primary">Select</button><button class="btn btn-error btn-danger">Delete</button></li>');
}