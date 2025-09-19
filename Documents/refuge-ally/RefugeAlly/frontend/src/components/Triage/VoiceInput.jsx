import React, { useState } from 'react';
import { IconButton, Typography, Box } from '@mui/material';
import { Mic as MicIcon, MicOff as MicOffIcon } from '@mui/icons-material';

const VoiceInput = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      if (onTranscript) {
        onTranscript("Voice input received");
      }
    } else {
      setIsListening(true);
      // Simulate voice input after 2 seconds
      setTimeout(() => {
        setIsListening(false);
        if (onTranscript) {
          onTranscript("fever and headache");
        }
      }, 2000);
    }
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <IconButton
        onClick={toggleListening}
        size="large"
        sx={{
          bgcolor: isListening ? 'error.main' : 'primary.main',
          color: 'white',
          width: 60,
          height: 60,
          '&:hover': {
            bgcolor: isListening ? 'error.dark' : 'primary.dark',
            transform: 'scale(1.1)'
          },
          transition: 'all 0.2s ease'
        }}
      >
        {isListening ? <MicOffIcon /> : <MicIcon />}
      </IconButton>
      {isListening && (
        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'primary.main' }}>
          Listening...
        </Typography>
      )}
    </Box>
  );
};

export default VoiceInput;
