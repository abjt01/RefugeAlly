import React, { useState, useRef, useCallback } from 'react';
import {
  IconButton,
  Tooltip,
  Box,
  Typography,
  Alert
} from '@mui/material';
import {
  Mic,
  MicOff,
  Stop
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { isVoiceSupported } from '../../utils/helpers';
import { VOICE_CONFIG } from '../../utils/constants';

const VoiceInput = ({ onTranscript, language = 'en', disabled = false }) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  const startRecording = useCallback(() => {
    if (!isVoiceSupported()) {
      setError(t('errors.voiceNotSupported'));
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = VOICE_CONFIG.MAX_ALTERNATIVES;
      
      // Set language based on current language
      const langCode = VOICE_CONFIG.LANGUAGE_CODES[language] || VOICE_CONFIG.LANGUAGE_CODES.en;
      recognition.lang = langCode;

      recognition.onstart = () => {
        setIsRecording(true);
        setError('');
        
        // Auto-stop after timeout
        timeoutRef.current = setTimeout(() => {
          stopRecording();
        }, VOICE_CONFIG.RECOGNITION_TIMEOUT);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          onTranscript(finalTranscript.trim());
          stopRecording();
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        switch (event.error) {
          case 'no-speech':
            setError(t('errors.noSpeechDetected') || 'No speech detected');
            break;
          case 'not-allowed':
          case 'service-not-allowed':
            setError(t('errors.microphoneError'));
            break;
          case 'network':
            setError(t('errors.networkError'));
            break;
          default:
            setError(`Speech recognition error: ${event.error}`);
        }
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError(t('errors.voiceNotSupported'));
    }
  }, [language, onTranscript, t]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!isVoiceSupported()) {
    return null;
  }

  return (
    <Box>
      <Tooltip 
        title={isRecording ? t('symptoms.stopRecording') : t('symptoms.startRecording')}
      >
        <span>
          <IconButton
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            color={isRecording ? 'error' : 'primary'}
            sx={{
              ...(isRecording && {
                animation: 'recording 1s infinite'
              })
            }}
          >
            {isRecording ? <Stop /> : <Mic />}
          </IconButton>
        </span>
      </Tooltip>
      
      {isRecording && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'error.main',
              animation: 'pulse 1s infinite'
            }}
          />
          <Typography variant="caption" color="error">
            {t('symptoms.recording') || 'Recording...'}
          </Typography>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default VoiceInput;