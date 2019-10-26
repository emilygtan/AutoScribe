window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
// window.SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
// window.SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

const LOG_LEVEL = 4

const recognition = new SpeechRecognition();
recognition.interimResults = true;
var fulltranscript = []

recognition.addEventListener('result', e => {
  processSpeech(results=e.results[0][0], e.results[0].isFinal);
});

recognition.addEventListener('end', e => {
  if (LOG_LEVEL >= 2) console.log('restarting SpeechRecognition');
  if (dictationActive) recognition.start();
});


function processSpeech(results, isFinal) {
  words = results.transcript.split(' ');
  currentTranscript = [];

  clearCurrentCorrections();

  if (isFinal) {
    //if it's @ final
    if(LOG_LEVEL >= 4) console.log('Finalized: ' + words);
    recognition.stop();
    countWordsFinal(words.length - wordIndexOffset);

    for (wIndex = wordIndexOffset; wIndex < words.length; wIndex++) {
      currentWord = words[wIndex];
      processSingleWord(fullTranscript.length + currentTranscript.length, currentWord, intrim = false);
    }

    fullTranscript = fullTranscript.concat(currentTranscript);
    fullTranscript = fullTranscript.concat(".");
    currentTranscript = [];
  } 

  else {
    //if it's intrim
    if(LOG_LEVEL >= 5) console.log('Intrim: ' + words);
    countWordsIntrim(words.length - wordIndexOffset);

    for (wIndex = wordIndexOffset; wIndex < words.length; wIndex++) {
      currentWord = words[wIndex];
      processSingleWord(fullTranscript.length + currentTranscript.length, currentWord, intrim = true);
    }
  }
  setSelection(fullTranscript.length + currentTranscript.length);
}