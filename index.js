var express = require('express'),
    app = express(),
	sys = require('sys'),
	exec = require('child_process').exec,
    server = require('http').createServer(app),
    io = require("socket.io").listen(server),
	path = require('path'),
    nicknames = {};

server.listen(8000);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {
    
	socket.on('send message', function(data) {
        io.sockets.emit('new message', {msg: data, nick: socket.nickname});
    });
    
    socket.on('new user', function(data, callback) {
        if (data in nicknames || data.search(/[^a-zA-Z]+/) !== -1) {
            callback(false);
        } else {
            callback(true);
            socket.nickname = data;
            nicknames[socket.nickname] = 1;
            updateNickNames();
        }
    });
    
    socket.on('disconnect', function(data) {
        if(!socket.nickname) return;
        delete nicknames[socket.nickname];
        updateNickNames();
    });
	
    socket.on('execute command', function(data, callback) {
		if(!socket.nickname) return;
		callback(true);
  	  	child = exec(data, function(error, stdout, stderr) {
  	 	 returnCommandResults(data,stdout);
  	  	});
    });
    
    function updateNickNames() {
        io.sockets.emit('usernames', nicknames);
    }
	
	function returnCommandResults(command,response){
		var results = {};
		results['command']=command;
		results['response']=response;
		io.sockets.emit('terminal', results);
	}
});