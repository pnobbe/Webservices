let userList = [];

getAllUsers(function (data) {
    data.result.forEach(function (user) {
      addUser(user);
    });
});

socket.on('new_user', function (user) {
    addUser(user);
});

socket.on('delete_user', function (email) {
    $(document.getElementById(email)).remove();
});

socket.on('update_user', function (user) {
    setUser(user);
});

$('#userList').on('click', '.btn-delete', function () {
    deleteUser($(this).closest("li").prop('id'));
});


$('#userList').on('click', '.btn-demote', function () {
    let user = userList[$(this).closest("li").prop('id')];
    user.role = ["user"];
    updateUser(user);
});

$('#userList').on('click', '.btn-promote', function () {
    let user = userList[$(this).closest("li").prop('id')];
    user.role = ["user", "admin"];
    updateUser(user);
});

function addUser(user) {
    console.log(user);
    userList[user.email] = user;
    if (user.isAdmin) {
        $("#userList").append('<li class="list-group-item" id=\'' + user.email + '\'>' + user.email + ' <button class="btn btn-warning btn-demote">Revoke Admin</button><button class="btn btn-error btn-delete">Delete</button></li>');
    } else {
        $("#userList").append('<li class="list-group-item" id=\'' + user.email + '\'>' + user.email + ' <button class="btn btn-primary btn-promote">Give Admin</button><button class="btn btn-error btn-delete">Delete</button></li>');
    }
}

function setUser(user) {
    userList[user.email] = user;
    var li = $(document.getElementById(user.email));

    if (user.isAdmin) {
        li.replaceWith('<li class="list-group-item" id=\'' + user.email + '\'>' + user.email + ' <button class="btn btn-warning btn-demote">Revoke Admin</button><button class="btn btn-error btn-delete">Delete</button></li>');
    } else {
        li.replaceWith('<li class="list-group-item" id=\'' + user.email + '\'>' + user.email + ' <button class="btn btn-primary btn-promote">Give Admin</button><button class="btn btn-error btn-delete">Delete</button></li>');
    }
}

function updateUser(user) {
    $.ajax({
        url: "/api/users/" + user.email,
        type: "PUT",
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(user),
        success: function (data) {
            console.log(data);
        }, error: function (data) {
            console.log(data);
        }
    });
}

function deleteUser(email) {
    $.ajax({
        url: "/api/users/" + email,
        type: "DELETE",
        success: function (data) {
            console.log(data);
        }, error: function (data) {
            console.log(data);
        }
    });
}

function getAllUsers(cb) {
    $.ajax({
        url: "/api/users/all/1/99?params",
        type: "GET",
        dataType: 'json',
        contentType: "application/json",
        success: function (data) {
            cb(data);
        }, error: function (data) {
            cb(data);
        }
    });
}