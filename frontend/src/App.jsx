// src/App.jsx - FIXED VERSION WITH i18n
import React, { useState } from 'react';
import { 
  ThemeProvider, 
  CssBaseline, 
  Container, 
  Box,
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
  Avatar
} from '@mui/material';
import { 
  Psychology as AIIcon,
  VideoCall as VideoIcon,
  LocalHospital as DoctorIcon,
  Analytics as OutbreakIcon,
  Send as SendIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

// Import your existing systems - KEEP THESE
import theme from './styles/theme';
import triageService from './services/triageService';
import './i18n/i18n'; // Import your i18n configuration

// Import new components
import Header from './components/Layout/Header';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoomPage from './pages/LoomPage';
import DoctorConsultDialog from './components/Dialogs/DoctorConsultDialog';

// Enhanced HomePage Component
const HomePage = ({ onSymptomSubmit, searchResults, onDoctorConsult }) => {
  const [symptoms, setSymptoms] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Keep your existing symptom list
  const commonSymptoms = [
    { key: 'fever', label: '🤒 Fever', severity: 'high' },
    { key: 'cough', label: '😷 Cough', severity: 'medium' },
    { key: 'headache', label: '🧠 Headache', severity: 'medium' },
    { key: 'fatigue', label: '😴 Fatigue', severity: 'low' },
    { key: 'nausea', label: '🤢 Nausea', severity: 'medium' },
    { key: 'bodyache', label: '💪 Body Ache', severity: 'medium' }
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

      onSymptomSubmit(response);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'high':
        return { color: 'error', icon: <ErrorIcon />, bgColor: '#fee2e2' };
      case 'medium':
        return { color: 'warning', icon: <WarningIcon />, bgColor: '#fef3c7' };
      default:
        return { color: 'success', icon: <CheckIcon />, bgColor: '#dcfce7' };
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
            AI-Powered Health Assistant for Refugees
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4 }}>
            Get instant health advice, connect with doctors, and access mental health support
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {/* Symptom Input Card */}
            <Card sx={{ mb: 4, borderRadius: 4, boxShadow: 3 }}>
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

            {/* Search Results Display - NEW: Shows results on same page */}
            {searchResults && (
              <Card sx={{ mb: 4, borderRadius: 4, boxShadow: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <AIIcon sx={{ fontSize: 50, color: 'success.main', mb: 2 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                      AI Assessment Complete
                    </Typography>
                  </Box>

                  {(() => {
                    const config = getSeverityConfig(searchResults.data.severity);
                    return (
                      <>
                        <Alert 
                          severity={config.color} 
                          sx={{ mb: 3, fontSize: '1.1rem' }}
                        >
                          <Typography variant="h6" gutterBottom>
                            Priority: {searchResults.data.severity?.toUpperCase() || 'MEDIUM'}
                          </Typography>
                          {searchResults.data.advice}
                        </Alert>

                        {searchResults.data.recommendations && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>Recommendations:</Typography>
                            <List>
                              {searchResults.data.recommendations.map((rec, index) => (
                                <ListItem key={index}>
                                  <ListItemIcon>
                                    <CheckIcon color="primary" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText primary={rec} />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}

                        {/* Doctor Consultation Button - NEW FEATURE */}
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          onClick={onDoctorConsult}
                          startIcon={<VideoIcon />}
                          sx={{
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          }}
                        >
                          Consult with Doctor
                        </Button>
                      </>
                    );
                  })()}
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
                    <ListItemText primary="AI Health Triage" secondary="Instant symptom analysis" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><VideoIcon color="success" /></ListItemIcon>
                    <ListItemText primary="Video Consultations" secondary="Connect with doctors" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><OutbreakIcon color="warning" /></ListItemIcon>
                    <ListItemText primary="Outbreak Prevention" secondary="Community monitoring" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><SecurityIcon color="info" /></ListItemIcon>
                    <ListItemText primary="Mental Health Support" secondary="Trauma-informed care" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [doctorDialogOpen, setDoctorDialogOpen] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentPage('home');
  };

  const handleSignup = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage('home');
    setSearchResults(null);
  };

  const handleSymptomSubmit = (results) => {
    setSearchResults(results);
  };

  const handleDoctorConsult = () => {
    setDoctorDialogOpen(true);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage 
            onSymptomSubmit={handleSymptomSubmit}
            searchResults={searchResults}
            onDoctorConsult={handleDoctorConsult}
          />
        );
      case 'login':
        return <LoginPage onLogin={handleLogin} onPageChange={setCurrentPage} />;
      case 'signup':
        return <SignupPage onSignup={handleSignup} onPageChange={setCurrentPage} />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'loom':
        return <LoomPage />;
      default:
        return (
          <HomePage 
            onSymptomSubmit={handleSymptomSubmit}
            searchResults={searchResults}
            onDoctorConsult={handleDoctorConsult}
          />
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
        {/* Header with navigation */}
        <Header 
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          isLoggedIn={isLoggedIn}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        
        {/* Page Content */}
        {renderPage()}
        
        {/* Doctor Consultation Dialog */}
        <DoctorConsultDialog 
          open={doctorDialogOpen}
          onClose={() => setDoctorDialogOpen(false)}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;