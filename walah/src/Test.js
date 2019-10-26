import React, { Component } from "react";
import openSocket from 'socket.io-client';

class Test extends Component {
	constructor() {
		super();
		this.state = {
		  endpoint: "http://localhost:3000",

		  ///
		  color: 'white',
		  ///

		  socket: openSocket("http://localhost:3000"),

		  value: "type something!",

		  messages: "<h1> chat transcript </h1>"

		};
		this.handleChange = this.handleChange.bind(this);
    this.handleSend = this.handleSend.bind(this);
		
	}

	sendMsg(text) {
  	console.log(text);
  	this.state.socket.emit('message', text);
  }

	handleChange(event) {
		this.setState({value: event.target.value});
	}

	handleSend() {
		this.sendMsg(this.state.value);
		this.setState({value: ""});
	}

  // sending sockets
	send() {
		console.log("reached1");
    this.state.socket.emit('change color', this.state.color) // change 'red' to this.state.color
  }
 
  ///

  // adding the function
  setColor(color) {
    this.setState({ color });
    console.log(this.state.color);
  }

  componentDidMount() {
    //const socket = openSocket(this.state.endpoint);

    this.state.socket.on('news', function(data){
    	console.log(data);
    });
	  this.state.socket.on('change color', (col) => {
	  	console.log("reached");
	    document.body.style.backgroundColor = col;
	  })
	  this.state.socket.on('message', function(data) {
	  	console.log("message received: " + data);
	  });

  }

  render() {

    return (
      <div style={{ textAlign: "center" }}>
      	<input type="text" value={this.state.value} onChange={this.handleChange}/>
      	<button onClick={this.handleSend}> send </button>

        <button onClick={() => this.send() }>Change Color</button>
        <button id="blue" onClick={() => this.setColor('blue')}>Blue</button>
        <button id="red" onClick={() => this.setColor('red')}>Red</button>

        <div>
        	<h1> chat transcript </h1>
        	<p value={this.state.messages}> </p>
        </div>

      </div>
    )
  }
}

export default Test;