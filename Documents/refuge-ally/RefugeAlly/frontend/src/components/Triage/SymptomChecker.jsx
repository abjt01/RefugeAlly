import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Chip,
  Grid,
  Paper,
  Fade,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Mic as MicIcon,
  Send as SendIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import triageService from '../../services/triageService';
import VoiceInput from './VoiceInput';

const SymptomChecker = ({ onResult }) => {
  const { t } = useTranslation();
  const [symptoms, setSymptoms] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const commonSymptoms = [
    { key: 'fever', label: 'Fever', color: '#ef4444' },
    { key: 'cough', label: 'Cough', color: '#f59e0b' },
    { key: 'headache', label: 'Headache', color: '#8b5cf6' },
    { key: 'fatigue', label: 'Fatigue', color: '#06b6d4' },
    { key: 'nausea', label: 'Nausea', color: '#84cc16' },
    { key: 'bodyAche', label: 'Body Ache', color: '#f97316' },
    { key: 'breathingDifficulty', label: 'Difficulty Breathing', color: '#dc2626' },
    { key: 'chestPain', label: 'Chest Pain', color: '#991b1b' }
  ];

  const handleSymptomToggle = (symptom) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom.key)
        ? prev.filter(s => s !== symptom.key)
        : [...prev, symptom.key]
    );
  };

  const handleSubmit = async () => {
    if (!symptoms.trim() && selectedSymptoms.length === 0) {
      setError('Please describe your symptoms');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const symptomsArray = symptoms.trim() 
        ? [symptoms.trim(), ...selectedSymptoms]
        : selectedSymptoms;

      const result = await triageService.submitSymptoms({
        symptoms: symptomsArray,
        language: 'en',
        duration: 'unknown'
      });

      onResult(result);
      setSymptoms('');
      setSelectedSymptoms([]);
    } catch (err) {
      setError('Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography variant="h2" gutterBottom className="gradient-text" textAlign="center">
          How are you feeling today?
        </Typography>
        <Typography variant="body1" textAlign="center" sx={{ mb: 4, color: 'text.secondary' }}>
          Describe your symptoms and get personalized health guidance
        </Typography>
      </motion.div>

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="glass-card" sx={{ mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                {/* Text Input */}
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Tell me about your symptoms in detail..."
                  variant="outlined"
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(148, 163, 184, 0.05)',
                      '&:hover': {
                        backgroundColor: 'rgba(148, 163, 184, 0.08)'
                      }
                    }
                  }}
                />

                {/* Voice Input */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <VoiceInput onTranscript={(text) => setSymptoms(prev => prev + ' ' + text)} />
                </Box>

                {/* Common Symptoms */}
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Common Symptoms
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {commonSymptoms.map((symptom) => (
                    <motion.div
                      key={symptom.key}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Chip
                        label={symptom.label}
                        onClick={() => handleSymptomToggle(symptom)}
                        variant={selectedSymptoms.includes(symptom.key) ? 'filled' : 'outlined'}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 600,
                          backgroundColor: selectedSymptoms.includes(symptom.key) 
                            ? symptom.color 
                            : 'transparent',
                          color: selectedSymptoms.includes(symptom.key) ? 'white' : symptom.color,
                          borderColor: symptom.color,
                          '&:hover': {
                            backgroundColor: selectedSymptoms.includes(symptom.key) 
                              ? symptom.color 
                              : `${symptom.color}20`
                          }
                        }}
                      />
                    </motion.div>
                  ))}
                </Box>

                {/* Error Alert */}
                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={() => {
                      setSymptoms('');
                      setSelectedSymptoms([]);
                      setError('');
                    }}
                    sx={{ borderRadius: 3, px: 3 }}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontWeight: 600
                    }}
                  >
                    {loading ? 'Analyzing...' : 'Get Health Advice'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SymptomChecker;
