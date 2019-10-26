var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000, function(){
	console.log("listening on 3000");
}); //listen on port 3000

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
	console.log("user connected")
	socket.on('disconnect', function() {
		console.log("some idiot left lmao");
	})
  	socket.emit('news', { hello: 'world' });


  	socket.broadcast.emit('broadcast', "hello peeps");
  	socket.on('my other event', function (data) {
	    console.log(data);
	});
	socket.on('message', function(data) {
		console.log(data);
		io.emit('message', data)
	})
	socket.on('change color', function(color) {
		io.emit('change color', color);
	} )
		

});