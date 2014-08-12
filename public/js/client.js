jQuery(function($) {
	
	var delay= 3000;
	var delayMax = 10000;
	var scrollOpt = 1000;
	var zero = 0;
	
	var empty = '';
	var color = 'color';
	var colorName = 'color2';
	var background = 'background-color';
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
	var $colorPanelName = $('#colorPanelName');
	var $cmdBtn = $('#cmd-btn');
	var $msgBtn = $('#msg-btn');
	var $dwlBtn = $('#dwl-btn');
	var $sortable = $('#sortable');
	var $nickWrap = $('#nickWrap');
	var $usersPanel = $('#usersPanel');
	var $contentWrap = $('#contentWrap');
	var $loginError = $('#login-error');
	var $bannerImg = $('.banner-img');
	
	var newUserAction = 'new user';
	var executeCommandAction = 'execute command';
	var sendMessageAction = 'send message';
	var colorPanelAction = 'color panel';
	var textPanelAction = 'text panel';
	var newMessageAction = 'new message';
	var terminalAction = 'terminal';
	var usernamesAction = 'usernames';
		
	$sortable.sortable();
	$sortable.disableSelection();	
	loadRobotsAvatars();
	loadSpecialElements();

	$nickForm.click(function(e) {
	   e.preventDefault();
	   socket.emit(newUserAction, $nickBox.val(), function(data) {
	       if(data) {
	           $nickWrap.hide();
			   $bannerImg.hide();
			   $usersPanel.show();
	           $contentWrap.show();
	       } else {
	           $loginError.show();
	       }
	   });
	  setNickname($nickBox.val());
	  $nickBox.val(empty);
	});

	$closeAlert.click(function(e) {
	    $loginError.hide();
	});

	$cmdBtn.click(function(e) {
	   e.preventDefault();
	   if($messageBox.val() !== empty) {
		   socket.emit(executeCommandAction, $messageBox.val(), function(data) {
	       		if(!data){
	           	 	$loginError.show();
	       		}
   			});
		}
	   $messageBox.val(empty);
	});
	
	$msgBtn.click(function(e) {
	   e.preventDefault();
	   if($messageBox.val() !== empty) {
		   socket.emit(sendMessageAction, $messageBox.val());
	   }
	   $messageBox.val(empty);
	});

	socket.on(colorPanelAction, function(data) {
	  	$('#colorPanel').delay(delay).show();
		$('#colorPanel').delay(delay).css(background,data[color]);
		$('#colorPanelName').delay(delayMax).css(color,data[colorName]);
		$('#colorPanelName').text(getNickname());
	});
	
	
	socket.on(textPanelAction, function(data) {
		$('#colorPanelName').text(getRandomText());
	});
	
	socket.on(newMessageAction, function(data) {
	  $chat.append(formatMessage(data)); 
	  $chat.animate({scrollTop: $chat[zero].scrollHeight}, scrollOpt);
	});
	
	socket.on(terminalAction, function(data) {
	  $chat.append(formatTerminalOutput(data)); 
	  $chat.animate({scrollTop: $chat[zero].scrollHeight}, scrollOpt);
	});

	socket.on(usernamesAction, function(data) {
	    var html = empty;
	    for (var username in data) {
	        html += getAvatar(username);
	    }
	    $users.html(html);
	});
});
