var express = require('express'),
    app = express(),
	sys = require('sys'),
	exec = require('child_process').exec,
    server = require('http').createServer(app),
    io = require("socket.io").listen(server),
	path = require('path'),
	currentDirectory = '',
    nicknames = {},
	port = Number(process.env.PORT || 5000);
	
server.listen(port);
app.use(express.static(path.join(__dirname, 'public')));


app.get('/color', function(req, res) {
	console.log("Random color");
	randomColor = '#' + (function co(lor){   return (lor +=
  [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)])
  && (lor.length == 6) ?  lor : co(lor); })('');
randomColor2 = '#' + (function co(lor){   return (lor +=
[0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)])
&& (lor.length == 6) ?  lor : co(lor); })('');
	io.sockets.emit('color panel', {color:randomColor,color2:randomColor2});
});

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
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
			launchHelperWelcome();
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
		if( dataIn.substring(0,1) === '/') {
			if( dataIn === '/help') {
			io.sockets.emit('new message', {msg:'<b>Command &nbsp<span class="good-command">'+dataIn+'</span></b> was executed.', nick: socket.nickname});
			launchHelperInfo();
			} else{
				io.sockets.emit('new message', {msg: '<b>Command &nbsp<span class="bad-command">'+dataIn+"</span></b> was rejected.", nick: socket.nickname});
			}
		} else {
			if(getCurrentDirectory() === ''){
				console.log('Directory needs to be setted');
				pwd(executeCommand,dataIn);
			} else {
				console.log('Directory already setted');
				executeCommand(dataIn);
			}
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
		if(dataIn === 'ls' || dataIn === 'ps aux' || dataIn === 'cat README.md' || (dataIn.split(" ")[0] === 'cd') && dataIn.split(" ").length === 2) {
		io.sockets.emit('new message', {msg: '<b>Command &nbsp<span class="good-command">'+dataIn+'</span></b> was executed.', nick: socket.nickname});
child = exec(seq, function(error, stdout, stderr) {
	console.log('With this results:\n'+stdout);
	dataOut = processStdout(stdout);
	returnCommandResults(dataIn,dataOut);
});
		} else{
			io.sockets.emit('new message', {msg: '<b> Command &nbsp<span class="bad-command">'+dataIn+'</span></b> was rejected. <span class="good-command">The only allowed unix commands in this demo version are <b>cd</b>, <b>ls</b>, <b>ps aux</b> and <b>cat README.md</b>.</span>', nick: socket.nickname});
		}
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
	
	function launchHelperWelcome(){
		nicknames['raspberry-pi'] = 1; //User raspberri-pi connected by default
		io.sockets.emit('new message', {msg: '<h4>Hi '+socket.nickname+'!</h4> Welcome to <b>chat-with-pi</b>! Do you need some help to start? Write <b>/help</b> and click the <b>send command</b> button (&nbsp<span class="glyphicon glyphicon-screenshot"></span>&nbsp).', nick: 'raspberry-pi'});
	}
	
	function launchHelperInfo(){
		io.sockets.emit('new message', {msg: '<b>chat-with-pi</b> is an user-friendly interface to communicate with a <b>Raspberry pi</b> like me ;-)<br> In this web interface you can send commands, browse directories, play with GPIO... <b>Whatever you want!</b>.<br> Oriented to education, <b>chat-with-pi</b> allows collective learning. Students and professors (or geeks) can join the conversation at any moment. They only need a browser to practise.<br>Whatever you do, it will be shared on real-time with all the connected users. You can use the textbox to:<ul><li><b>Send a message (&nbsp<span class="glyphicon glyphicon-send"></span>&nbsp): </b> You can share your knowledge teaching how to control the <b>Raspberry pi</b>, ask/answer a technical question, tell a friend what you are going to do,... </li><li><b>Send a command (&nbsp<span class="glyphicon glyphicon-screenshot"></span>&nbsp): </b> You will control your <b>Raspberry pi</b> with a remote console.</li></ul>', nick: 'raspberry-pi'});
	}
});
