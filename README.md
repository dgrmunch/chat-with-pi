chat-with-pi
========

An user-friendly web service to communicate with a Raspberry pi (send commands, browse directories, play with GPIO...). Oriented to education, 'chat-with-pi' allows collective learning. By using a friendly chat interface, students and professors can share knowledge and practise on a Raspberry pi. Without 'ssh' and in any platform/browser different users can share a real-time updated interface.

* Download the latest source of node.js in your Raspberry pi.
~~~~~~~~~~~~~~~~~~~~~
wget http://nodejs.org/dist/v0.10.30/node-v0.10.30.tar.gz
~~~~~~~~~~~~~~~~~~~~~
* Compile the source for your system. NOTE: It takes about two hours on a *Raspberry pi model B*.
~~~~~~~~~~~~~~~~~~~~~
tar -xf node-v0.10.30.tar.gz
cd node-v0.10.30
./configure
make
make install
~~~~~~~~~~~~~~~~~~~~~
* Clone repo:  `git clone https://github.com/dgrmunch/chat-with-pi.git` 
* Install dependencies in cloned repo:
~~~~~~~~~~~~~~~~~~~~~
cd chat-with-pi
npm install
~~~~~~~~~~~~~~~~~~~~~
* Run the app:
~~~~~~~~~~~~~~~~~~~~~
node index.js
~~~~~~~~~~~~~~~~~~~~~
* Chat with your pi in a browser: [http://localhost:5000](http://localhost:5000)

PS. This is still an alpha version. More functionality will be added soon.

Enjoy! Help is welcome!

[Diego Gonzalez](http://www.xmunch.net)
