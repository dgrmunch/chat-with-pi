var theme = {};
var nickname = "Default";

function formatMessage(data){
	return '<div class="alert alert-info">'
	+			'<div id="chat-avatar" class="left-block"></div>'
	+			'<div id="body-message" >'
	+				'<span class="label label-primary uppercase">'
	+					data.nick
	+				'</span>'
	+				'<br><br>'
	+				'<div class="left-block">'
	+					data.msg
	+				'</div>'
	+				'<div class="right-block">'
	+					'<a href="#" title="' + data.nick + '">'
	+						'<img class="avatar-chat" src="' + theme['path'] + data.nick +'.png">'
	+					'</a>'
	+				'</div>'
	+			'</div>'
	+		'</div>';
}

function formatTerminalOutput(data){
	return '<div class="alert alert-warning terminal">'
	+			'<div id="chat-avatar" class="left-block"></div>'
	+			'<div id="body-message" >'
	+				'<span class="label label-warning uppercase">'
	+					'terminal'
	+				'</span>&nbsp'
	+				'<span class="label label-info">'
	+					data['command']
	+				'</span>'
	+				'<br><br>'
	+				'<span class="terminal-text" style="color:white">'
	+					'chat-with-pi@localhost:'
	+				'</span>'
	+				'<span class="terminal-text" style="color:lightgreen">'
	+					data['directory']
	+				'</span>'
	+				'<span class="terminal-text" style="color:lightblue">'
	+					'&nbsp'+data['command']
	+				'</span>'
	+				'<pre>'
	+					data['response']
	+				'</pre>'	
	+			'</div>'
	+		'</div>';
}

function changeTheme(path_,name_,url_){
	theme = {};
	theme['path'] = path_;
	theme['name'] = name_;
	theme['url'] = url_;
	$('#nickWrap').show();
	$('#theme-selector').hide();
}

function selectRobots(){
	path_ = 'http://robohash.org/';
	name_ = 'RoboHash';
	url_ = path_;
	changeTheme(path_,name_,url_);
}

function divToImage(){
	// TODO
    html2canvas(document.getElementById('chat'), {
		allowTaint:true,
		taintTest:false,
		letterRendering:true,
	    onrendered: function(canvas) {
	   	 	document.body.appendChild(canvas);
	    }
    });
}

jQuery(function($) {
	selectRobots();
	var socket = io.connect();
	var $messageForm = $('#send-message');
	var $messageBox = $('#message');
	var $chat = $('#chat');
	var $buttonSend = $('#send');
	var $nickForm = $('#setNick');
	var $nickBox = $('#nickname');
	var $users = $('#users');
	var $closeAlert = $('#closeAlert');
	var $colorPanel = $('#colorPanel');
	var $cmdBtn = $('#cmd-btn');
	var $msgBtn = $('#msg-btn');
	var $dwlBtn = $('#dwl-btn');
	
	$("#sortable").sortable();
	$("#sortable").disableSelection();

	$nickForm.click(function(e) {
	   e.preventDefault();
	   socket.emit('new user', $nickBox.val(), function(data) {
	       if(data) {
	           $('#nickWrap').hide();
			   $('.banner-img').hide();
			   $('#usersPanel').show();
	           $('#contentWrap').show();
	       } else {
	           $("#login-error").show();
	       }
	   });
	   nickname = $nickBox.val();
	   $nickBox.val('');
	});

	$closeAlert.click(function(e) {
	    $("#login-error").hide();
	});

	$cmdBtn.click(function(e) {
	   e.preventDefault();
	   if($messageBox.val()!='') socket.emit('execute command', $messageBox.val(), function(data) {
	       if(!data){
	           $("#login-error").show();
	       }
   		});
	   $messageBox.val('');
	});
	
	$msgBtn.click(function(e) {
	   e.preventDefault();
	   if($messageBox.val()!='') socket.emit('send message', $messageBox.val());
	   $messageBox.val('');
	});

	socket.on('color panel', function(data) {
	  	$colorPanel.delay(3000).show();
		$("#colorPanel").delay(3000).css("background-color",data['color']);
		$("#colorPanelName").delay(10000).css("color",data['color2']);
		$("#colorPanelName").text(nickname);
	});
	
	socket.on('new message', function(data) {
	  $chat.append(formatMessage(data)); 
	  $chat.animate({scrollTop: $chat[0].scrollHeight}, 1000);
	});
	
	socket.on('terminal', function(data) {
	  $chat.append(formatTerminalOutput(data)); 
	  $chat.animate({scrollTop: $chat[0].scrollHeight}, 1000);
	});

	socket.on('usernames', function(data) {
	    var html = '';
	    for (var username in data) {
	        html += '<a href="#" title='+username+'><img class="avatar-users" src="'+theme['path']+username+'.png"></a>';
	    }
	    $users.html(html);
	});
});
