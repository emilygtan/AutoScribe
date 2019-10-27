var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var SummarizerManager = require("node-summarizer").SummarizerManager;
var request = require('request');
const express = require('express');
const path = require('path');

const dotenv = require('dotenv');
dotenv.config();

var PORT = process.env.port || 3000;

server.listen(PORT, function(){
	console.log("listening on "+PORT);
}); //listen on port 3000

app.use(express.static(path.join(__dirname, 'client/build')));


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
app.get('/summarize', function (req,res) {
	console.log(req.query);
	if (req.query.unpunctuated) {
		request.post({
			headers: {'content-type' : 'application/x-www-form-urlencoded'},
			url: "http://bark.phon.ioc.ee/punctuator", 
			body: "text="+req.query.body
		}, function(e, r, b) {
			var sentences = req.query.sentences? req.query.sentences : 3;
			var Summarizer = new SummarizerManager(b,sentences);
			//console.log(Summarizer.getSummaryByFrequency());
			res.header('Access-Control-Allow-Origin','*');
			res.end(Summarizer.getSummaryByFrequency().summary);
		})
	} else {
		var sentences = req.query.sentences? req.query.sentences : 3;
		var Summarizer = new SummarizerManager(req.query.body,sentences);

		//console.log(Summarizer.getSummaryByFrequency());
		res.header('Access-Control-Allow-Origin','*');
		res.end(Summarizer.getSummaryByFrequency().summary);
	}
});
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
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