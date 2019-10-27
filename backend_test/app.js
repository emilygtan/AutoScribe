var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var SummarizerManager = require("node-summarizer").SummarizerManager;

const dotenv = require('dotenv');
dotenv.config();

server.listen(3000, function(){
	console.log("listening on 3000");
}); //listen on port 3000

var APIMarketplaceClient = require('@collaborizm/apimarket/out').APIMarketplaceClient // for project authentication                                                           
const apiMarketplaceClient = new APIMarketplaceClient({
  grant_type: 'client_credentials',
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  scope: 'openid'
});

// getValidToken will automatically refresh your access token if it's about to expire  
var sendMsg = async (message, to) => {
  const resp = await apiMarketplaceClient.simpleSmsSend({
    message: message,
    fromAddress: process.env.FROM,
    toAddress: to,
    callbackUrl: 'http://example.com'
  })
}
app.get('/send',(req,res) => {
	sendMsg(req.query.message, req.query.to)
	res.end('success');
})
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get('/summarize', function (req,res) {
	console.log("reached");
	var sentences = req.query.sentences? req.query.sentences : 3;
	var Summarizer = new SummarizerManager(req.query.body,sentences);

	//console.log(Summarizer.getSummaryByFrequency());
	res.header('Access-Control-Allow-Origin','*');
	res.send(Summarizer.getSummaryByFrequency().summary);
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