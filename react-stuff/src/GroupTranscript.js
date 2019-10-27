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
      transcript: "",
      summary: "",
      voteActive: false,
      wordCount: new Map()
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
  writeSummary = (text) => {
    this.setState({summary: "chat summary: \n" + text});
  }
  summarizeReq = () => {
    var toSummarize = this.state.transcript;
    fetch("http://localhost:3000/summarize?body=" + toSummarize, {
      method: 'GET',
      //mode: 'no-cors',
    })
      .then(res => res.text())
      .then(
        (result) => {
          console.log(result);
          this.writeSummary(result);
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          console.log("no bueno");
          console.log(error);
        }
      )
    this.state.transcript = "";
  }
  componentDidMount= () => {
    var recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = event => {
      var transcript = event.results[event.results.length - 1][0].transcript
      console.log(transcript);
      this.sendMsg(transcript);
    }
    this.state.socket.on('news', (data) => {
      console.log(data);
    });
    this.state.socket.on('message', (data) => {
      console.log("message received: " + data);
      this.setState({transcript:this.state.transcript+"\n"+data});
      console.log(this.state.transcript);
    });

    var checkingForVote = setInterval(this.checkForVote, 1000);
  }

  checkForVote = () => {
    //console.log("hello its working");
    if (!this.state.voteActive) {
      var textToParse = this.state.transcript;
      var lines = textToParse.split("\n");
      lines.forEach((element) => {
        //console.log(element);
        var words = element.split(" ");
        words.forEach((element) => {
          if (element=="vote") {
            this.startVote();
          }
        })
      });
    }
  }

  startVote = () => {
    console.log("vote started");
    this.setState({voteActive:true});
    var endPoll = setTimeout(this.endVote, 20000);
  }

  endVote = () => {
    this.setState({voteActive:false}); 
    console.log("vote finished");
    this.state.wordCount = new Map();
    var textToParse = this.state.transcript;
    var lines = textToParse.split("\n");
    lines.forEach((element) => {
      //console.log(element);
      var words = element.split(" ");
      words.forEach((element) => {
        if (this.state.wordCount.has(element)) {
          this.state.wordCount.set(element, this.state.wordCount.get(element) + 1);
        } else {
          this.state.wordCount.set(element, 1);
        }
      })
    });
    console.log(this.state.wordCount);
    this.setState({transcript:""});
  }

  render() {
    if (!this.props.active)
      return null;
    return (
      <div style={{ textAlign: "center" }}>
        <input type="text" value={this.state.value} onChange={this.handleChange}/>
        <button onClick={this.handleSend}> send </button>
        <div>
          <button id="summarize" onClick={this.summarizeReq}>Summarize Meeting</button>
          <p>{this.state.summary}</p>
          <h1> chat transcript </h1>
          <p value={this.state.messages}> </p>
        </div>
        <pre>{this.state.transcript}</pre>
      </div>
    )
  }
}

export default GroupTranscript;
