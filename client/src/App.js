import React from 'react';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  getUserMedia,
} from 'react-webrtc';
import * as io from 'socket.io-client'
import RTCMultiConnection from 'rtcmulticonnection';
import logo from './logo.svg';
import './App.css';
import GroupTranscript from "./GroupTranscript.js"

function App() {
  window.io = io;

  const [roomCode,setRoomCode] = React.useState("");
  const [connected,setConnected] = React.useState(false);

  var connection = new RTCMultiConnection();
  connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
  connection.session = {
    audio: true,
    video: true
  };
  connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
  };
  connection.onstream = function(event) {
    var video = event.mediaElement;
    video.controls = false;
    video.style.cssText = `-moz-transform: scale(-1, 1);
-webkit-transform: scale(-1, 1); -o-transform: scale(-1, 1);
transform: scale(-1, 1); filter: FlipH; width: 300px;`;
    document.getElementById("callers").appendChild( event.mediaElement );
  };
  const joinRoom = () => {
    if (!roomCode)
      return;
    connection.openOrJoin(roomCode);
    setConnected(true);
  }

  return (
    <div className="App">
      <div style={{display: connected? "none":"block",textAlign:'center'}}>
        <h1>AutoScribe</h1><br/>
        <h2>Enter your roomcode below</h2><br/>
        <input onChange={(e)=>setRoomCode(e.target.value)} style={{
          width:600,
          height:80,
          marginBottom:20,
          outline:'none',
          border: 'solid 1px',
          padding:5,
          fontSize:40,
          textAlign:'center'
        }} /><br/>
        <button style={{
          width:400,
          fontSize:30,
          padding:20
        }} onClick={joinRoom}>Join Room</button>
      </div>
      <div style={{
        display:'flex'
      }}>
        <div id="callers" style={{
          width:"70vw",
          display:'flex',
          alignItems:'center',
          height:'99vh',
          justifyContent:'space-around',
          flexWrap:'wrap',
          marginTop:'10px'
        }}></div>
        <div style={{
          width:"29vw"
        }}>
          <GroupTranscript roomCode={roomCode} active = {connected}  />
        </div>

      </div>
    </div>
  );
}

export default App;
