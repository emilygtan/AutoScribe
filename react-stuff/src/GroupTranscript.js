import React, { Component } from "react";
import openSocket from 'socket.io-client';

class GroupTranscript extends Component {
  constructor() {
    super();

    var recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = event => {
      var transcript = event.results[event.results.length - 1][0].transcript;
      this.sendMsg(transcript);
    }
    this.state = {
      color: 'white',
      socket: openSocket("http://localhost:3000"),
      value: "type something!",
      messages: "chat transcript",
      transcript: "",
      summary: "",
      recognition:recognition,
      voteActive: false,
      votesHeld: 0,
      wordCount: new Map(),
      phoneNumber:""
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
    fetch("http://localhost:3000/summarize?unpunctuated=true&body=" + toSummarize, {
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
  }
  inviteMsg = () => {
    var msg = "Hello, a friend has invited you to a meeting! Enter room code \""+this.props.roomCode+ "\" at "+window.location.href;
    fetch("http://localhost:3000/send?to="+this.state.phoneNumber+"&message=" + msg, {
      method: 'GET',
      mode: 'no-cors',
    });
  }
  componentDidMount= () => {
    this.state.socket.on('news', (data) => {
      console.log(data);
    });
    this.state.socket.on('message', (data) => {
      console.log("message received: " + data);
      this.setState({transcript:this.state.transcript+"\n "+data});
      console.log(this.state.transcript);
    });

    var checkingForVote = setInterval(this.checkForVote, 1000);
  }

  checkForVote = () => {
    //console.log("hello its working");
    if (!this.state.voteActive) {
      var timesAppeared = 0;
      var textToParse = this.state.transcript;
      var lines = textToParse.split("\n");
      lines.forEach((element) => {
        //console.log(element);
        var words = element.split(" ");
        words.forEach((element) => {
          if (element=="vote") {
            timesAppeared++;
            if (timesAppeared > this.state.votesHeld) {
              this.startVote();
            }
          }
        })
      });
    }
  }

  startVote = () => {
    console.log("vote started");
    this.setState({voteActive:true});
    this.setState({messages:"VOTE IN PROGRESS"});
    this.setState({votesHeld:this.state.votesHeld+1});
    var endPoll = setTimeout(this.endVote, 20000);
  }

  endVote = () => {
    this.setState({voteActive:false});
    this.setState({messages:"chat transcript"});
    console.log("vote finished");
    this.state.wordCount = new Map();
    var textToParse = this.state.transcript;
    var lines = textToParse.split("\n");
    lines.forEach((element) => {
      //console.log(element);
      var words = element.split(" ");
      words.forEach((e) => {
        var element = e.toLowerCase();
        if (this.state.wordCount.has(element)) {
          this.state.wordCount.set(element, this.state.wordCount.get(element) + 1);
        } else {
          this.state.wordCount.set(element, 1);
        }
      })
    });
    const filterOut = ["", "vote", "and", "is", "to", "or", "the", "of", "a", "in", "that", "it", "for", "on"];
    filterOut.forEach((e) => {
      var element = e.toLowerCase();
      if (this.state.wordCount.has(element)) {
        this.state.wordCount.delete(element);
      }
    })
    console.log(this.state.wordCount);

    this.state.wordCount[Symbol.iterator] = function* () {
        yield* [...this.entries()].sort((a, b) => b[1] - a[1]);
    }
    var count = 0;
    var voteResult = "Vote Complete. Top 3 Results were: \n";
    for (let [key, value] of this.state.wordCount) {     // get data sorted
      count++;
      voteResult += key + " with " + value + " votes \n"
      if (count == 3) {
        break;
      }
    }
    this.setState({transcript:this.state.transcript+'\n'+voteResult});

    //this.setState({transcript:""});
  }
  componentDidUpdate(prevProps) {
    if (prevProps.active != this.props.active) {
      if (this.props.active == true) {
        this.state.recognition.start();
      } else {
        this.state.registration.stop();
      }
    }
  }

  render() {
    if (!this.props.active)
      return null;
    return (
      <div style={{ textAlign: "center", padding: 5 }}>
        <h2>Room Code:</h2> <strong style={{fontSize:30}}> {this.props.roomCode}</strong>
        <p>
        Invite a friend (phone number) <br/>
        <input value={this.state.phoneNumber} onChange={(e)=>this.setState({phoneNumber:e.target.value})}/>
        <button onClick={(e)=>{
          this.inviteMsg();
          this.setState({phoneNumber:""})
        }}> send </button>
        </p>
        {/*
        <input type="text" value={this.state.value} onChange={this.handleChange}/>
        <button onClick={this.handleSend}> send </button>
        */}
        <div>
          <button id="summarize" onClick={this.summarizeReq}>Summarize Meeting</button>
          <p>{this.state.summary}</p>
          <p> <strong> {this.state.messages} </strong> </p>
          {/**<p value={this.state.messages}> </p>**/}
        </div>
        <div style={{
          textAlign:'left',
          backgroundColor:'#333',
          width:'90%',
          margin:'auto'
        }}>
          <pre>{this.state.transcript}</pre>
        </div>
      </div>
    )
  }
}

export default GroupTranscript;
