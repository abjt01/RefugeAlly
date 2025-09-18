import React, { useState } from 'react';
import { Card, CardContent, TextField, Button, Typography, Box, Chip, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import VoiceInput from './VoiceInput';
import triageService from '../../services/triageService';

const SymptomForm = ({ onTriageResult }) => {
  const { t, i18n } = useTranslation();
  const [symptoms, setSymptoms] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const commonSymptoms = ['fever', 'cough', 'headache', 'fatigue', 'nausea', 'bodyAche', 'breathingDifficulty', 'chestPain'];

  const handleSymptomToggle = symptom =>
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  const handleVoiceTranscript = transcript => setSymptoms(prev => prev ? `${prev} ${transcript}` : transcript);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!symptoms.trim() && selectedSymptoms.length === 0) { setError(t('messages.noInput')); return; }
    setLoading(true); setError('');
    try {
      const payload = {
        symptoms: symptoms.trim() ? [symptoms.trim(), ...selectedSymptoms] : selectedSymptoms,
        duration: duration || 'unknown',
        language: i18n.language,
        timestamp: new Date().toISOString()
      };
      const result = await triageService.submitSymptoms(payload);
      onTriageResult(result);
      setSymptoms(''); setSelectedSymptoms([]); setDuration('');
    } catch (err) {
      setError(err.message || t('messages.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, margin: '0 auto', mb: 3 }}>
      <CardContent>
        <Typography variant="h5" component="h2" color="primary" textAlign="center">
          {t('symptoms.title')}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <TextField fullWidth multiline rows={3} value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder={t('symptoms.placeholder')} variant="outlined" sx={{ mb: 2 }} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} />
            <VoiceInput onTranscript={handleVoiceTranscript} language={i18n.language} />
          </Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">Common Symptoms:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {commonSymptoms.map(symptom => (
                <Chip key={symptom} label={t(`symptoms.common.${symptom}`)} onClick={() => handleSymptomToggle(symptom)} color={selectedSymptoms.includes(symptom) ? 'primary' : 'default'} variant={selectedSymptoms.includes(symptom) ? 'filled' : 'outlined'} sx={{ cursor: 'pointer' }} />
              ))}
            </Box>
          </Box>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Duration</InputLabel>
            <Select value={duration} onChange={e => setDuration(e.target.value)}>
              <MenuItem value="less-than-day">Less than a day</MenuItem>
              <MenuItem value="1-3-days">1-3 days</MenuItem>
              <MenuItem value="3-7-days">3-7 days</MenuItem>
              <MenuItem value="more-than-week">More than a week</MenuItem>
            </Select>
          </FormControl>
          {error && <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>{error}</Typography>}
          <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ mb: 2 }}>{loading ? <><CircularProgress size={20} sx={{ mr: 1 }} />{t('messages.loading')}</> : t('buttons.submit')}</Button>
          <Button variant="outlined" color="secondary" fullWidth onClick={() => { setSymptoms(''); setSelectedSymptoms([]); setDuration(''); setError(''); }}>{t('buttons.clear')}</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SymptomForm;
