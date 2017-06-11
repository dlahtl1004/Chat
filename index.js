
'use strict';
var PORT = process.env.PORT || 8000;
var fs = require('fs');
var http = require('http');
var app =http.createServer(function(req, res){
    fs.readFile('index.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
    });
}).listen(PORT);

var socket = require("socket.io");
var io=socket.listen(app);
var Quiz;
var isHost = 0;
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
            
            if(isHost == 0){
                socket.emit('setHost',{
                    isHost : 1
                });
                isHost = 1;
                socket.emit('system', {
                    message : 'your host'
                });
            }

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
        if(data.message == Quiz){
            if(room){
                socket.emit('system', {
                    message : `${data.message} is correct answer`
                });
                socket.broadcast.to(room).emit('eraseQuiz');
                socket.broadcast.to(room).emit('system', {
                    message : `${data.message} is correct answer`
                });
                Quiz = '';
            }
        }
        if(room) {
            socket.broadcast.to(room).emit('message', data);
        }
    });
    
    socket.on('startDraw', data => {
        var room = socket.room;
        if(room) {
            socket.broadcast.to(room).emit('start', data);
        }
    });

    socket.on('drawing', data => {
        var room = socket.room;
        if(room) {
            socket.broadcast.to(room).emit('draw', data);
        }
    });
    
    socket.on('endDraw', data => {
        var room = socket.room;
        if(room) {
            socket.broadcast.to(room).emit('end');
        }
    });
    socket.on('eraseCanvas',data=>{
        var room = socket.room;
        if(room) {
            socket.broadcast.to(room).emit('erase');
        }
    });
    
    socket.on('disconnect',function(data){
        var room = socket.room;
        if(isHost == 1){
            isHost = 0;
            if(room){
                socket.broadcast.to(room).emit('setHost',{
                    isHost : 0
                });
            }
            
        }
    });
    
    socket.on('setHost',data =>{
        if(isHost == 0){
            socket.emit('setHost',{
                isHost : 1
            });
            isHost = 1;
            socket.emit('system', {
                message : 'your host'
            });
        }
    });
    
    socket.on('addQuiz', function(data){
        Quiz = data.quiz;
    })
});

