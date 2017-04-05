let raceList = [];
let participantList = [];

$.ajax({
    url: "/api/races/all",
    type: "GET",
    dataType: 'json',
    success: function (data) {
        data.result.forEach(function (race) {
            addRace(race);
        });
    },
    error: function (data) {
        console.log(data);
    }
});

socket.on('new_race', function (race) {
    addRace(race);
});

socket.on('delete_race', function (name) {
    $(document.getElementById(name)).remove();
    if (curRace.name == name) {
        $('#waypointList').empty();
        $('#map').empty();
        curRace = null;
    }
});

socket.on('race_start', function (data) {
});

socket.on('update_race_data', function (data) {

});

socket.on('participant_joined'), function (data) {

};

socket.on('participant_left'), function (data) {
    
};

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
        return obj.name === $(event.target).closest("li").prop('id');
    })[0];
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

function getParticipants(race) {
    $.ajax({
        url: "/api/races/" + race.name + "/participants",
        type: "GET",
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            data.forEach(function(participant) {
               addParticipant(participant);
            });
        }, error: function (data) {
            console.log(data);
        }
    });
}