'use strict';
var PORT = process.env.PORT || 8000;
var express = require('express');
var app = express();
//var router = require('./')(app);
var fs = require('fs');
var server = app.listen(PORT,(function(req, res){
    fs.readFile('index.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
    })
}));
var socket = require("socket.io");
var io=socket.listen(app);
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


