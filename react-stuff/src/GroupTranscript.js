import React, { Component } from "react";
import openSocket from 'socket.io-client';

class GroupTranscript extends Component {
  constructor() {
    super();
    this.state = {
      color: 'white',

      socket: openSocket("http://localhost:3000"),

      value: "type something!",

      messages: "<h1> chat transcript </h1>",

      transcript:""
    };

  }

  sendMsg = (text) => {
    console.log(text);
    this.state.socket.emit('message', text);
  }

  handleChange = (event) => {
    this.setState({value: event.target.value});
  }

  handleSend = () => {
    this.sendMsg(this.state.value);
    this.setState({value: ""});
  }

// sending sockets
  send = () => {
    console.log("reached1");
    this.state.socket.emit('change color', this.state.color) // change 'red' to this.state.color
  }

  // adding the function
  setColor = (color) => {
    this.setState({ color });
    console.log(this.state.color);
  }

  componentDidMount= () => {

    var recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "cmn-Hans-CN";
    recognition.onresult = event => {
      var transcript = event.results[event.results.length - 1][0].transcript
      console.log(transcript);
      this.sendMsg(transcript);
    }
    recognition.start();


    this.state.socket.on('news', (data) => {
      console.log(data);
    });
    this.state.socket.on('change color', (col) => {
      console.log("reached");
      document.body.style.backgroundColor = col;
    });
    this.state.socket.on('message', (data) => {
      console.log("message received: " + data);
      this.setState({transcript:this.state.transcript+"\n"+data});
      console.log(this.state.transcript);
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
        <pre>{this.state.transcript}</pre>
      </div>
    )
  }
}

export default GroupTranscript;
