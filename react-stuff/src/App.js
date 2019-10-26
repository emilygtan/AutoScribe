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
  React.useEffect(() => {
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
    var predefinedRoomId = 'YOUR_Name';

    document.getElementById('btn-open-room').onclick = function() {
      this.disabled = true;
      connection.open( predefinedRoomId );
    };

    document.getElementById('btn-join-room').onclick = function() {
      this.disabled = true;
      connection.join( predefinedRoomId );
    };
  },[]);
  return (
    <div className="App">
      <button id="btn-open-room">Open Room</button>
      <button id="btn-join-room">Join Room</button><hr />
      <div id="callers"></div>
      <GroupTranscript />
    </div>
  );
}

export default App;
