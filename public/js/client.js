var theme = {};

function formatMessage(data){
	return '<div class="alert alert-info">'
	+			'<div id="chat-avatar" class="left-block"></div>'
	+			'<div id="body-message" >'
	+				'<span class="label label-primary" style="text-transform: uppercase;">'
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
	return '<div class="alert alert-info" style="border: 7px solid lightblue; background-color: #4D4A4A !important;background-image: none !important;color:white !important">'
	+			'<div id="chat-avatar" class="left-block"></div>'
	+			'<div id="body-message" >'
	+				'<span class="label label-primary" style="text-transform: uppercase;">'
	+					'terminal'
	+				'</span>&nbsp'
	+				'<span class="label label-info" style="text-transform: uppercase;">'
	+					data['command']
	+				'</span>'
	+				'<br><br>'
	+				data['response']
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

function selectBusiness(){
	path_ = 'http://www.avatarpro.biz/avatar?s=';
	name_ = 'Business';
	url_= 'http://www.avatarpro.biz/';
	changeTheme(path_,name_,url_);
}

function selectRobots(){
	path_ = 'http://robohash.org/';
	name_ = 'RoboHash';
	url_ = path_;
	changeTheme(path_,name_,url_);
}

jQuery(function($) {
	
	var socket = io.connect();
	var $messageForm = $('#send-message');
	var $messageBox = $('#message');
	var $chat = $('#chat');
	var $buttonSend = $('#send');
	var $nickForm = $('#setNick');
	var $nickBox = $('#nickname');
	var $users = $('#users');
	var $closeAlert = $('#closeAlert');
	var $cmdBtn = $('#cmd-btn');
	var $msgBtn = $('#msg-btn');

	$nickForm.click(function(e) {
	   e.preventDefault();
	   socket.emit('new user', $nickBox.val(), function(data) {
	       if(data) {
	           $('#nickWrap').hide();
			   $('#pageHeader').hide();
			   $('#usersPanel').show();
	           $('#contentWrap').show();
	       } else {
	           $("#login-error").show();
	       }
	   });
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
