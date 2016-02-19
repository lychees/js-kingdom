Vue.component('rooms-grid', {
    template: '#grid-template',
    props: {
        data: Array,
        columns: Array,
        filterKey: String
    },
    data: function () {
        var sortOrders = {}
        this.columns.forEach(function (key) {
            sortOrders[key] = 1
        })
        return {
            sortKey: '',
            sortOrders: sortOrders
        }
    },
    methods: {
        sortBy: function (key) {
            this.sortKey = key
            this.sortOrders[key] = this.sortOrders[key] * -1
        }
    }
})


Vue.component('modal', {
    template: '#modal-template',
    props: {
        show: {
            type: Boolean,
            required: true
        }
    }
})


// bootstrap the demo
var rooms = new Vue({
    el: '#rooms',
    data: {
        searchQuery: '',
        roomsColumns: ['房间号', '房间名', '房主', '玩家数', '状态'],
        roomsData: [
        ]
    }
});


new Vue({
    el: '#app',
    data: {
        showModal: false
    }
})

// ------------------------------------------------------------------------------------------

var socket = io();
var user_id, room_id;
var nickname = "xiaodao";

$('#nickname').on('change', function(){
    //alert($(this).val());
    socket.emit('change nickname', $(this).val());    
    $('#room_name').attr('value', $(this).val()+'的房间');
});

function join_room(){
    alert("Join!");
}

function create_room(){
    //alert("123");
    var socket = io();
    socket.emit('create room', {
        room_name: $('#room_name').val(),
        room_size: 2
    });
}

function refresh_rooms(rooms){
    socket.emit('refresh rooms');   
}


// --------------------------------------


socket.on('login', function (data) {    
    user_id = data.id;    
});


socket.on('create room', function (data) {

    room_id = data.room_id;

    if (data.room_owner == user_id){
        alert("你创建了编号为" + data.room_id + '的房间');
    }

    if (data.room_owner != user_id){
        var message = '玩家 ';
        message += data.room_owner_nickname;
        message += ' 创建了编号为 ' + data.room_id +  ' 的房间';
        alert(message);
    }
    refresh_rooms();    
});

socket.on('refresh rooms', function (data) {

    console.log(data);

    rooms.$data = {
        searchQuery: '',
        roomsColumns: ['房间号', '房间名', '房主', '玩家数', '状态'],
        roomsData: data
    };
});





$(document).ready(function(){        



    $("#test > table tr").live('click', function(){    
        $(this).children('td').eq(1).addClass('red');
    });


    $("#rooms > table tr").live('click', function(){    
        //("123");
        //$('#room_id').attr('value', 1002);
        //console.log($(this));
        //$(this).children('td').eq(1).addClass('red');
        //console.log($(this).children('td').eq(0).html());
        //alert();
        var room_id = $(this).children('td').eq(0).html().trim();
        $('#room_id').attr('value', room_id);    

    });

    socket.emit('add user', nickname);    
    $('#room_name').attr('value', nickname+'的房间');
    refresh_rooms();
});
