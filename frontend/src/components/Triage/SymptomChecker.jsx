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
  CircularProgress,
  Alert,
  Container
} from '@mui/material';
import {
  Send as SendIcon,
  Clear as ClearIcon,
  Psychology as AIIcon,
  VideoCall as VideoIcon,
  Analytics as OutbreakIcon,
  Favorite as MentalHealthIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import triageService from '../../services/triageService';
import VoiceInput from './VoiceInput';
import TriageResults from './TriageResults';

const SymptomChecker = ({ onResult }) => {
  const { t } = useTranslation();
  const [symptoms, setSymptoms] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

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

      const apiResult = await triageService.submitSymptoms({
        symptoms: symptomsArray,
        language: 'en',
        duration: 'unknown',
        location: 'refugee_camp_alpha'
      });

      setResult(apiResult);
      
      if (onResult) {
        onResult(apiResult);
      }
    } catch (err) {
      setError('Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    setSymptoms('');
    setSelectedSymptoms([]);
    setError('');
    setResult(null);
  };

  return (
    <Box>
      {/* Main Content Area */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h2" gutterBottom className="gradient-text" textAlign="center">
            How are you feeling today?
          </Typography>
          <Typography variant="body1" textAlign="center" sx={{ mb: 6, color: 'text.secondary' }}>
            Describe your symptoms and get personalized health guidance
          </Typography>
        </motion.div>

        {/* SIDE BY SIDE LAYOUT - SYMPTOM INPUT & AI ASSESSMENT */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* LEFT COLUMN - Symptom Input */}
          <Grid item xs={12} lg={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="glass-card" sx={{ height: '100%', minHeight: 600 }}>
                <CardContent sx={{ p: 4, height: '100%' }}>
                  <Typography variant="h4" sx={{ mb: 4, fontWeight: 600, textAlign: 'center', color: 'primary.main' }}>
                    📝 Symptom Input
                  </Typography>

                  {/* Text Input */}
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
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
                    Quick Select Common Symptoms
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
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
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 'auto' }}>
                    <Button
                      variant="outlined"
                      startIcon={<ClearIcon />}
                      onClick={handleClearAll}
                      sx={{ borderRadius: 3, px: 3, py: 1.5 }}
                    >
                      Clear All
                    </Button>
                    <Button
                      variant="contained"
                      endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                      onClick={handleSubmit}
                      disabled={loading}
                      sx={{
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontWeight: 600,
                        fontSize: '1.1rem'
                      }}
                    >
                      {loading ? 'Analyzing...' : 'Get AI Health Assessment'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* RIGHT COLUMN - AI Assessment Results */}
          <Grid item xs={12} lg={6}>
            {result ? (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <TriageResults result={result} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="glass-card" sx={{ height: '100%', minHeight: 600 }}>
                  <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <AIIcon sx={{ fontSize: 100, color: 'primary.main', mb: 3, opacity: 0.7 }} />
                      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, color: 'primary.main' }}>
                        🤖 AI Assessment Results
                      </Typography>
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                        Ready to analyze your symptoms
                      </Typography>
                      
                      <Box sx={{ textAlign: 'left', maxWidth: 350, mx: 'auto' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                          What you'll get:
                        </Typography>
                        <Box sx={{ space: 2 }}>
                          <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <span style={{ fontSize: '1.5rem' }}>🤖</span> 
                            <span><strong>Gemini AI Analysis</strong> - Instant symptom assessment</span>
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <span style={{ fontSize: '1.5rem' }}>🦠</span> 
                            <span><strong>ML Outbreak Detection</strong> - Community risk analysis</span>
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <span style={{ fontSize: '1.5rem' }}>👩‍⚕️</span> 
                            <span><strong>Doctor Recommendations</strong> - Connect with professionals</span>
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <span style={{ fontSize: '1.5rem' }}>🧠</span> 
                            <span><strong>Mental Health Support</strong> - Trauma-informed care</span>
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* REFUGEALLY SERVICES SECTION - FULL WIDTH AT BOTTOM */}
      <Box sx={{ 
        bgcolor: 'rgba(148, 163, 184, 0.05)', 
        py: 6,
        borderTop: '1px solid rgba(148, 163, 184, 0.1)'
      }}>
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Typography variant="h3" sx={{ 
              fontWeight: 700, 
              mb: 2, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🌍 RefugeAlly Services
            </Typography>
            <Typography variant="h6" sx={{ 
              textAlign: 'center', 
              color: 'text.secondary', 
              mb: 6 
            }}>
              Comprehensive healthcare solutions designed specifically for refugees
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card sx={{ 
                    height: '100%', 
                    textAlign: 'center', 
                    p: 3,
                    borderRadius: 4,
                    boxShadow: 3,
                    border: '2px solid transparent',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 6
                    }
                  }}>
                    <AIIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                      AI Health Triage
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Instant symptom analysis powered by Google Gemini AI with cultural sensitivity
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card sx={{ 
                    height: '100%', 
                    textAlign: 'center', 
                    p: 3,
                    borderRadius: 4,
                    boxShadow: 3,
                    border: '2px solid transparent',
                    '&:hover': {
                      borderColor: 'success.main',
                      boxShadow: 6
                    }
                  }}>
                    <VideoIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'success.main' }}>
                      Video Consultations
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Connect with verified doctors via Practo platform with NGO-subsidized consultations
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card sx={{ 
                    height: '100%', 
                    textAlign: 'center', 
                    p: 3,
                    borderRadius: 4,
                    boxShadow: 3,
                    border: '2px solid transparent',
                    '&:hover': {
                      borderColor: 'warning.main',
                      boxShadow: 6
                    }
                  }}>
                    <OutbreakIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'warning.main' }}>
                      Outbreak Prevention
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      ML-powered community health monitoring for early outbreak detection and prevention
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card sx={{ 
                    height: '100%', 
                    textAlign: 'center', 
                    p: 3,
                    borderRadius: 4,
                    boxShadow: 3,
                    border: '2px solid transparent',
                    '&:hover': {
                      borderColor: 'secondary.main',
                      boxShadow: 6
                    }
                  }}>
                    <MentalHealthIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'secondary.main' }}>
                      Mental Health Support
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Trauma-informed AI mental health support via Loom with crisis detection capabilities
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default SymptomChecker;
