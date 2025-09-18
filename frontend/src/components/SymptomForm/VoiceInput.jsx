import React, { useState, useEffect } from 'react';
import { IconButton, Typography, Box } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

const VoiceInput = ({ onTranscript, language = 'en' }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = language === 'ar' ? 'ar-SA' : language === 'dari' ? 'fa-AF' : 'en-US';
      recognitionInstance.onresult = event => { onTranscript(event.results[0][0].transcript); };
      recognitionInstance.onend = () => setIsListening(false);
      setRecognition(recognitionInstance);
    }
  }, [language, onTranscript]);

  const toggleListening = () => {
    if (!recognition) return;
    isListening ? recognition.stop() : recognition.start();
    setIsListening(l => !l);
  };

  return (
    <Box sx={{ textAlign: 'center', mt: 2 }}>
      <IconButton onClick={toggleListening} color="primary" size="large">
        {isListening ? <MicIcon /> : <MicOffIcon />}
      </IconButton>
      {isListening && <Typography variant="caption">Listening...</Typography>}
    </Box>
  );
};
export default VoiceInput;
