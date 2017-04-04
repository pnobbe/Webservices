let raceList = [];

$.ajax({
    url: "/api/races/all",
    type: "GET",
    dataType: 'json',
    success: function (data) {
        console.log(data);
        data.result.forEach(function (race) {
            addRace(race);
        });
        $("#raceList").append(data);
    },
    error: function (data) {
        console.log(data);
    }
});

socket.on('new_race', function (race) {
    addRace(race);
});

socket.on('delete_race', function (id) {
    $("#raceList").find('#' + id).remove();
});

socket.on('race_start', function (data) {
    console.log("Race start");
});

socket.on('update_race_data', function (data) {
    console.log("Room " + data.name + " emitted");
    console.log(data);
});

$(".btn-new-race").click(function () {
    let name = $('#name').val();
    let city = $('#city').val();

    if (name == "" || city == "") {
        return;
    }

    $('#name').val("");
    $('#city').val("");
    let body = {city: city, name: name};

    $.ajax({
        url: "/api/races",
        type: "POST",
        dataType: "json",
        data: body,
        success: function (data) {
            console.log(data);
        },
        error: function (data) {
            console.log(data);
        }
    });
});

$('#raceList').on('click', '.btn-delete', function (event) {
    deleteRace($(event.target).closest("li").prop('id'));
});

$('#raceList').on('click', '.btn-select', function (event) {
    let race = raceList.filter(function (obj) {
        console.log(obj.name + " " + $(event.target).closest("li").prop('id'));
        return obj.name === $(event.target).closest("li").prop('id');
    })[0];
    console.log(race);
    selectRace(race);
});

function addRace(race) {
    raceList.push(race);
    let ownername = (race.owner != null) ? race.owner.name : "Unknown";
    $("#raceList").append('<li class="list-group-item" id=\'' + race.name + '\'>' + race.name + '<span class="pull-right">Owner: ' + ownername + '</span><button class="btn btn-primary btn-select">Select</button><button class="btn btn-danger btn-delete">Delete</button></li>');
}

function deleteRace(name) {
    $.ajax({
        url: "/api/races/" + name,
        type: "DELETE",
        success: function (data) {
            console.log(data);
        }, error: function (data) {
            console.log(data);
        }
    });
}

function updateRace(race) {
    $.ajax({
        url: "/api/races/" + race.name,
        type: "PUT",
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(race),
        success: function (data) {
            console.log(data);
        }, error: function (data) {
            console.log(data);
        }
    });
}