'use strict';
var SPORT = process.env.PORT || 50000;
var CPORT = process.env.PORT || 8000;
const io = require('socket.io').listen(SPORT);

io.sockets.on('connection', socket => {

    socket.emit('connection', {
        type : 'connected'
    });

    socket.on('connection', data => {

        if(data.type === 'join') {

            socket.join(data.room);

            // depracated
            // socket.set('room', data.room);
            socket.room = data.room;

            socket.emit('system', {
                message : 'welcome to chat room'
            });

            socket.broadcast.to(data.room).emit('system', {
                message : `${data.name} is connected`
            });
        }

    });

    socket.on('user', data => {

        // depracated
        // socket.get('room', (error, room) => {
        // });

        var room = socket.room;

        if(room) {
            socket.broadcast.to(room).emit('message', data);
        }
    });

});

var http = require('http');
var fs = require('fs');


http.createServer(function(req, res){
    fs.readFile('index.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
    });
}).listen(CPORT);