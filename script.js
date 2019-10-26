var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

const recognition = new SpeechRecognition();
const speechRecognitionList = new SpeechGrammarList();
var diagnostic = document.querySelector(".output");

speechRecognitionList.addFromString(grammar, 1);
recognition.grammars = speechRecognitionList;
recognition.lang = 'en-US';
recognition.interimResults = true; //not continuous audio?
// recognition.maxAlternatives = 1; not using this rn 

var fulltranscript = []

recognition.start();

recognition.onresult = function(event) {
	var speechResult = event.results.transcript.toLowerCase();
	fulltranscript.concat(speechResult);
	fulltranscript.concat(".");
	diagnostic.textContent = "Text: " + fulltranscript;
}

recognition.onspeechend = function() {
	recognition.stop();
}

recognition.onerror = function(event) {
	diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
}

recognition.onaudiostart = function(event) {
	//when the user agent has started to capture audio.
	console.log('SpeechRecognition.onaudiostart');
}
  
recognition.onaudioend = function(event) {
	//when the user agent has finished capturing audio.
	console.log('SpeechRecognition.onaudioend');
}

recognition.onend = function(event) {
	//when the speech recognition service has disconnected.
	console.log('SpeechRecognition.onend');
}

recognition.onnomatch = function(event) {
	//when the speech recognition service returns a final result with no significant recognition
	console.log('SpeechRecognition.onnomatch');
}

// function get_text() {
// 	return fulltranscript;
// }