import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import VoiceInput from './VoiceInput';
import triageService from '../../services/triageService';

const SymptomForm = ({ onTriageResult }) => {
  const { t, i18n } = useTranslation();
  const [symptoms, setSymptoms] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [duration, setDuration] = useState('unknown');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const commonSymptoms = [
    'fever', 'cough', 'headache', 'fatigue', 'nausea', 
    'bodyAche', 'breathingDifficulty', 'chestPain'
  ];

  const handleSymptomToggle = (symptom) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleVoiceTranscript = (transcript) => {
    setSymptoms(prev => prev ? `${prev} ${transcript}` : transcript);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!symptoms.trim() && selectedSymptoms.length === 0) {
      setError(t('messages.noInput'));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare symptoms array
      let symptomsArray = [];
      if (symptoms.trim()) {
        symptomsArray.push(symptoms.trim());
      }
      symptomsArray = [...symptomsArray, ...selectedSymptoms];

      const payload = {
        symptoms: symptomsArray,
        duration: duration,
        language: i18n.language,
        timestamp: new Date().toISOString()
      };

      console.log('Sending payload:', payload);
      
      const result = await triageService.submitSymptoms(payload);
      console.log('Received result:', result);
      
      if (result.success) {
        onTriageResult(result);
        setSuccess('Analysis completed successfully!');
        // Clear form
        setSymptoms('');
        setSelectedSymptoms([]);
        setDuration('unknown');
      } else {
        setError(result.message || 'Failed to analyze symptoms');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || t('messages.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      sx={{ 
        maxWidth: 700, 
        margin: '0 auto', 
        mb: 3,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom 
          color="primary" 
          textAlign="center"
          sx={{ mb: 3 }}
        >
          {t('symptoms.title')}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder={t('symptoms.placeholder')}
              variant="outlined"
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
              dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
            />
            
            <VoiceInput 
              onTranscript={handleVoiceTranscript}
              language={i18n.language}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Common Symptoms:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {commonSymptoms.map((symptom) => (
                <Chip
                  key={symptom}
                  label={t(`symptoms.common.${symptom}`)}
                  onClick={() => handleSymptomToggle(symptom)}
                  color={selectedSymptoms.includes(symptom) ? 'primary' : 'default'}
                  variant={selectedSymptoms.includes(symptom) ? 'filled' : 'outlined'}
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Duration of Symptoms</InputLabel>
            <Select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="less-than-day">Less than a day</MenuItem>
              <MenuItem value="1-3-days">1-3 days</MenuItem>
              <MenuItem value="3-7-days">3-7 days</MenuItem>
              <MenuItem value="more-than-week">More than a week</MenuItem>
              <MenuItem value="unknown">Unknown</MenuItem>
            </Select>
          </FormControl>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ 
              mb: 2,
              py: 1.5,
              fontSize: '1.1rem'
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 2 }} />
                {t('messages.loading')}
              </>
            ) : (
              t('buttons.submit')
            )}
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={() => {
              setSymptoms('');
              setSelectedSymptoms([]);
              setDuration('unknown');
              setError('');
              setSuccess('');
            }}
            sx={{ py: 1.5 }}
          >
            {t('buttons.clear')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SymptomForm;
