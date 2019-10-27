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
    video.style.cssText = "-moz-transform: scale(-1, 1); \
-webkit-transform: scale(-1, 1); -o-transform: scale(-1, 1); \
transform: scale(-1, 1); filter: FlipH;";
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
      <div style={{display: connected? "none":"block"}}>
        <input onChange={(e)=>setRoomCode(e.target.value)} />
        <button onClick={joinRoom}>Join Room</button>
      </div>
      <hr />
      <div id="callers"></div>
      <GroupTranscript roomCode={roomCode} active = {connected}  />
    </div>
  );
}

export default App;
