import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Chip,
  FormControl,
  FormLabel,
  Alert,
  Divider
} from '@mui/material';
import { Send, Refresh } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import VoiceInput from './VoiceInput';
import { COMMON_SYMPTOMS } from '../../utils/constants';
import { sanitizeText } from '../../utils/helpers';
import './SymptomForm.css';

const SymptomForm = ({ onSubmit, loading = false, error = '' }) => {
  const { t, i18n } = useTranslation();
  
  const [formData, setFormData] = useState({
    description: '',
    symptoms: [],
    duration: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (field) => (event) => {
    const value = sanitizeText(event.target.value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSymptomToggle = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleVoiceTranscript = (transcript) => {
    setFormData(prev => ({
      ...prev,
      description: prev.description 
        ? `${prev.description} ${transcript}`
        : transcript
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.description.trim() && formData.symptoms.length === 0) {
      errors.general = t('errors.invalidInput');
    }
    
    if (!formData.duration.trim()) {
      errors.duration = t('symptoms.duration') + ' ' + t('common.required', 'is required');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submissionData = {
      ...formData,
      language: i18n.language,
      timestamp: new Date().toISOString()
    };

    onSubmit(submissionData);
  };

  const handleReset = () => {
    setFormData({
      description: '',
      symptoms: [],
      duration: ''
    });
    setValidationErrors({});
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto' }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          {t('symptoms.title')}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {validationErrors.general && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {validationErrors.general}
            </Alert>
          )}

          {/* Symptom Description */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('symptoms.describe')}
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder={t('symptoms.describePlaceholder')}
              value={formData.description}
              onChange={handleInputChange('description')}
              error={!!validationErrors.description}
              helperText={validationErrors.description}
              sx={{ mb: 1 }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {t('symptoms.voiceInput')}
              </Typography>
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                language={i18n.language}
                disabled={loading}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Common Symptoms */}
          <Box sx={{ mb: 3 }}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">
                <Typography variant="h6" gutterBottom>
                  {t('symptoms.commonSymptoms')}
                </Typography>
              </FormLabel>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {COMMON_SYMPTOMS.map((symptom) => (
                  <Chip
                    key={symptom}
                    label={t(`symptoms.symptoms.${symptom}`, symptom)}
                    onClick={() => handleSymptomToggle(symptom)}
                    color={formData.symptoms.includes(symptom) ? 'primary' : 'default'}
                    variant={formData.symptoms.includes(symptom) ? 'filled' : 'outlined'}
                    clickable
                  />
                ))}
              </Box>
            </FormControl>
          </Box>

          {/* Duration */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label={t('symptoms.duration')}
              placeholder={t('symptoms.durationPlaceholder')}
              value={formData.duration}
              onChange={handleInputChange('duration')}
              error={!!validationErrors.duration}
              helperText={validationErrors.duration}
              required
            />
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleReset}
              startIcon={<Refresh />}
              disabled={loading}
            >
              {t('common.reset')}
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              startIcon={<Send />}
              disabled={loading}
            >
              {loading ? t('common.loading') : t('common.submit')}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SymptomForm;