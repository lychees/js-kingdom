// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io');
var port = 2335;

io = io.listen(server);
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom
var msgs = [];
var rooms = {};
var users = {};
var users_n = 0;
var numUsers = 0;
var room_n = 1000;


io.on('connection', function (socket) {
    var addedUser = false;

    socket.on('add user', function (nickname) {
        if (addedUser) return;
        ++numUsers; addedUser = true;
        var id = users_n++;
        socket.nickname = nickname;
        socket.id = id;
        users[id] = {
            nickname: nickname
        }
        socket.emit('login', {
            numUsers: numUsers,
            msgs: msgs,
            id: id
        });
        socket.broadcast.emit('user joined', {
            username: nickname,
            numUsers: numUsers
        });
    });


    // when the user disconnects.. perform this
    socket.on('disconnect', function (){
        if (addedUser) {
            --numUsers;
            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.nickname,
                numUsers: numUsers
            });
        }
    });

    socket.on('create room', function(data){
        var room_id = '' + room_n + '';
        //console.log(room_id);

        rooms[room_id] = {
            room_name: data.room_name,                        
            room_owner: socket.id,            
            room_size: data.room_size,
            state: "等待",
            password: null
        };

        io.emit('create room', {
            room_owner: socket.id,
            room_owner_nickname: socket.nickname,
            room_id: room_id
        });
        room_n++;
    });    

    socket.on('refresh rooms', function(){

        var data = [];

        for (var room_id in rooms){
            var t = {
                房间号: room_id,
                房间名: rooms[room_id].room_name,
                房主: users[rooms[room_id].room_owner].nickname,
                玩家数: '1/4',
                状态: rooms[room_id].state
            }
            data.push(t);
        }

        io.emit('refresh rooms', data)
    });

    socket.on('change nickname', function(nickname){
        //console.log(nickname);
        var id = socket.id;
        users[id] = {
            nickname: nickname
        }
        //socket.nickname = nickname;
    });
        
    socket.on('join room', function(room_id){        
        socket.join(room_id);
        io.emit('join room');
    });

});
