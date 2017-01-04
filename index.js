var config = require('./config.json');
var AsteriskAmi = require('asterisk-ami');
var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

var ami = new AsteriskAmi({
	host: config.ami_host,
	username: config.ami_user,
	password: config.ami_password,
	reconnect: true
});
var connectedSockets=[];
ami.on('ami_data', function (evt) {
	connectedSockets.forEach(function(socket){
		try {
			socket.emit('ami_data', evt);
		}catch(e){
			console.log('Socket Emit Error',e);
		}
	})
});

app.listen(config.port);

function handler (req, res) {
	fs.readFile(__dirname + '/index.html',
		function (err, data) {
			if (err) {
				res.writeHead(500);
				return res.end('Error loading index.html');
			}

			res.writeHead(200);
			res.end(data);
		});
}

io.on('connection', function (socket) {
	connectedSockets.push(socket);

	socket.on('action', function (data) {
		ami_send(data);
	});

	socket.on('disconnect', function() {
		console.log('Got disconnect!');
		var i = connectedSockets.indexOf(socket);
		connectedSockets.splice(i, 1);
	});
});