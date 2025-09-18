import React, { useState } from 'react';
import { 
  ThemeProvider, 
  CssBaseline, 
  Container, 
  Box,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Rating,
  Dialog,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { 
  Psychology as AIIcon,
  VideoCall as VideoIcon,
  LocalHospital as DoctorIcon,
  Analytics as OutbreakIcon,
  Send as SendIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import theme from './styles/theme';
import triageService from './services/triageService';
// Removed CSS import - we'll add it later

const steps = [
  'Describe Symptoms',
  'AI Consultation', 
  'Doctor Connection',
  'Outbreak Analysis'
];

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [symptoms, setSymptoms] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [consultationDialog, setConsultationDialog] = useState(false);
  const [outbreakData, setOutbreakData] = useState(null);

  const commonSymptoms = [
    { key: 'fever', label: '🤒 Fever', severity: 'high' },
    { key: 'cough', label: '😷 Cough', severity: 'medium' },
    { key: 'headache', label: '🧠 Headache', severity: 'medium' },
    { key: 'fatigue', label: '😴 Fatigue', severity: 'low' }
  ];

  const availableDoctors = [
    {
      id: 1,
      name: 'Dr. Sarah Ahmed',
      specialty: 'General Medicine',
      rating: 4.8,
      experience: '8 years',
      languages: ['English', 'Arabic', 'Dari'],
      availability: 'Available Now',
      subsidized: true,
      consultationFee: 'Free (NGO Sponsored)',
      avatar: '👩‍⚕️'
    },
    {
      id: 2, 
      name: 'Dr. Michael Chen',
      specialty: 'Internal Medicine',
      rating: 4.9,
      experience: '12 years',
      languages: ['English'],
      availability: 'Available in 15 mins',
      subsidized: false,
      consultationFee: '$25',
      avatar: '👨‍⚕️'
    }
  ];

  const handleSymptomSubmit = async () => {
    if (!symptoms.trim() && selectedSymptoms.length === 0) return;
    
    setLoading(true);
    try {
      const symptomsArray = symptoms.trim() ? [symptoms.trim(), ...selectedSymptoms] : selectedSymptoms;
      
      const response = await triageService.submitSymptoms({
        symptoms: symptomsArray,
        language: 'en',
        duration: 'unknown'
      });

      setAiResponse(response);
      setActiveStep(1);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelection = (doctor) => {
    setSelectedDoctor(doctor);
    setActiveStep(2);
    setTimeout(() => {
      setOutbreakData({
        riskLevel: 'Medium',
        similarCases: 12,
        region: 'Eastern District',
        recommendation: 'Monitor closely - increased cases detected'
      });
      setActiveStep(3);
    }, 2000);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
        {/* Header */}
        <Box 
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            py: 4,
            mb: 4
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                🏥 RefugeAlly
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Complete AI Healthcare System for Refugees
              </Typography>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg">
          {/* Progress Stepper */}
          <Card sx={{ mb: 4, borderRadius: 4 }}>
            <CardContent sx={{ py: 3 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              {/* Step 1: Symptom Input */}
              {activeStep === 0 && (
                <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                      <AIIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                        Tell me about your symptoms
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Our AI will analyze your symptoms and connect you with the right care
                      </Typography>
                    </Box>

                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Describe how you're feeling..."
                      variant="outlined"
                      sx={{ mb: 3 }}
                    />

                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Common symptoms:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                      {commonSymptoms.map((symptom) => (
                        <Chip
                          key={symptom.key}
                          label={symptom.label}
                          onClick={() => {
                            setSelectedSymptoms(prev => 
                              prev.includes(symptom.key)
                                ? prev.filter(s => s !== symptom.key)
                                : [...prev, symptom.key]
                            );
                          }}
                          variant={selectedSymptoms.includes(symptom.key) ? 'filled' : 'outlined'}
                          color={symptom.severity === 'high' ? 'error' : symptom.severity === 'medium' ? 'warning' : 'success'}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleSymptomSubmit}
                      disabled={loading || (!symptoms.trim() && selectedSymptoms.length === 0)}
                      startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                      sx={{
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}
                    >
                      {loading ? 'Analyzing...' : 'Get AI Consultation'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: AI Response & Doctor Selection */}
              {activeStep === 1 && aiResponse && (
                <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <AIIcon sx={{ fontSize: 50, color: 'success.main', mb: 2 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                        AI Assessment Complete
                      </Typography>
                    </Box>

                    <Alert 
                      severity={aiResponse.data.severity === 'high' ? 'error' : aiResponse.data.severity === 'medium' ? 'warning' : 'success'}
                      sx={{ mb: 3, fontSize: '1.1rem' }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Priority: {aiResponse.data.severity?.toUpperCase() || 'MEDIUM'}
                      </Typography>
                      {aiResponse.data.advice}
                    </Alert>

                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
                      🩺 Available Doctors
                    </Typography>

                    <Grid container spacing={2}>
                      {availableDoctors.map((doctor) => (
                        <Grid item xs={12} key={doctor.id}>
                          <Paper 
                            sx={{ 
                              p: 3, 
                              cursor: 'pointer',
                              '&:hover': { boxShadow: 4 }
                            }}
                            onClick={() => handleDoctorSelection(doctor)}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Avatar sx={{ width: 60, height: 60, fontSize: '2rem' }}>
                                {doctor.avatar}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  {doctor.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {doctor.specialty} • {doctor.experience}
                                </Typography>
                                <Rating value={doctor.rating} precision={0.1} size="small" readOnly />
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Chip label={doctor.availability} color="success" sx={{ mb: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 700, color: doctor.subsidized ? 'success.main' : 'primary.main' }}>
                                  {doctor.consultationFee}
                                </Typography>
                                {doctor.subsidized && (
                                  <Chip label="NGO Subsidized" color="success" size="small" />
                                )}
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Doctor Connection */}
              {activeStep === 2 && selectedDoctor && (
                <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <VideoIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                        Connecting to Doctor
                      </Typography>
                    </Box>

                    <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light', color: 'white' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 60, height: 60, fontSize: '2rem' }}>
                          {selectedDoctor.avatar}
                        </Avatar>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {selectedDoctor.name}
                          </Typography>
                          <Typography variant="body1">
                            {selectedDoctor.specialty}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={() => setConsultationDialog(true)}
                      startIcon={<VideoIcon />}
                      sx={{
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      }}
                    >
                      Start Video Consultation
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Outbreak Analysis */}
              {activeStep === 3 && outbreakData && (
                <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <OutbreakIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                        Community Health Analysis
                      </Typography>
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.light' }}>
                          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                            {outbreakData.riskLevel}
                          </Typography>
                          <Typography variant="h6" fontWeight={600}>
                            Risk Level
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'info.light' }}>
                          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                            {outbreakData.similarCases}
                          </Typography>
                          <Typography variant="h6" fontWeight={600}>
                            Similar Cases
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Alert severity="warning" sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        📍 {outbreakData.region} Alert
                      </Typography>
                      {outbreakData.recommendation}
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </Grid>

            {/* Side Panel */}
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    🌍 RefugeAlly Services
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><AIIcon color="primary" /></ListItemIcon>
                      <ListItemText primary="AI Health Triage" secondary="Instant analysis" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><VideoIcon color="success" /></ListItemIcon>
                      <ListItemText primary="Video Consultations" secondary="Connect with doctors" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><OutbreakIcon color="warning" /></ListItemIcon>
                      <ListItemText primary="Outbreak Prevention" secondary="Community monitoring" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>

        {/* Video Consultation Dialog */}
        <Dialog 
          open={consultationDialog} 
          onClose={() => setConsultationDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: 'center' }}>
            <VideoIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h5">
              Video Consultation
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', py: 4 }}>
            <Box sx={{ 
              minHeight: 300, 
              bgcolor: 'grey.900', 
              borderRadius: 3, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 3
            }}>
              <Typography variant="h6" sx={{ color: 'white' }}>
                🎥 Video Stream Loading...
              </Typography>
            </Box>
            <Button 
              variant="contained"
              onClick={() => setConsultationDialog(false)}
            >
              End Consultation
            </Button>
          </DialogContent>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default App;
