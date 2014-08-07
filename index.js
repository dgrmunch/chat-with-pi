var express = require('express'),
    app = express(),
	sys = require('sys'),
	exec = require('child_process').exec,
    server = require('http').createServer(app),
    io = require("socket.io").listen(server),
	path = require('path'),
	currentDirectory = '',
    nicknames = {};

server.listen(80);
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
	
    socket.on('execute command', function(dataIn, callback) {
		if(!socket.nickname) return;
		callback(true);
		console.log(socket.nickname + ' is going to execute a command');
		if(getCurrentDirectory() === ''){
			console.log('Directory needs to be setted');
			pwd(executeCommand,dataIn);
		} else {
			console.log('Directory already setted');
			executeCommand(dataIn);
		}
    });
	
	function pwd(funct,data){
		console.log('pwd() was called');
		child = exec('pwd', function(error, stdout, stderr) {
			setCurrentDirectory(stdout);
			if(typeof funct == 'function'){
				console.log('And injected function is executed');
				funct(data);
			}	
		});
	}
	
	function executeCommand(dataIn){
		console.log('exectuteCommand() was called');
		seq = 'cd '+ getCurrentDirectory() + '\n' + dataIn + '\npwd';
		console.log('This sequence of commands will be executed:\n' + seq);
  	  	child = exec(seq, function(error, stdout, stderr) {
			console.log('With this results:\n'+stdout);
			dataOut = processStdout(stdout);
			returnCommandResults(dataIn,dataOut);
  	  	});
	}
    
    function updateNickNames() {
        io.sockets.emit('usernames', nicknames);
    }
	
	function setCurrentDirectory(dir){
		console.log('setCurrentDirectory() was called');
		currentDirectory = dir;
		console.log('Current dir is ' + currentDirectory);
	}
	
	function getCurrentDirectory(){
		console.log('getCurrentDirectory() was called');
		return currentDirectory;
	}
	
	function returnCommandResults(command,response){
		console.log('returnCommandResults() was called');
		var results = {};
		results['command']=command;
		results['response']=response;
		results['directory']=currentDirectory;
		console.log(results);
		io.sockets.emit('terminal', results);
	}
	
	function processStdout(stdout){
		console.log('processStdout() was called');
		var array = stdout.split('\n');
		setCurrentDirectory(array[array.length - 2]);
		array.splice(array.length - 2, 1);
		return array.join('\n');
	}
});