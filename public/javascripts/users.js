socket.on('new_user', function (data) {
    console.log(data);
});

socket.on('update_all_users', function (data) {
    console.log(data);
});

socket.on('delete_user', function (id) {
    $("#userList").find('#' + id).remove();
});

socket.on('user_start', function () {
    console.log("User start");
});

$('#userList').on('click', '.btn-delete', function () {
    socket.emit('delete_user', $(this).closest("li").prop('id'));
});

function addUser(id) {
    $("#userList").append('<li class="list-group-item" id=' + id + '>User ' + id + ' <button class="btn btn-error btn-delete">Delete</button></li>');
}