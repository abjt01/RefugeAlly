import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Grid,
  Avatar,
  Rating,
  Chip,
  Tab,
  Tabs,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Favorite as HeartIcon,
  Psychology as LoomIcon,
  VideoCall as VideoIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Phone as PhoneIcon,
  Chat as ChatIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import triageService from '../../services/triageService';

const TriageResults = ({ result }) => {
  const [loomDialog, setLoomDialog] = useState(false);
  const [practoDialog, setPractoDialog] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  // Available doctors data
  const availableDoctors = [
    {
      id: 'dr_001',
      name: 'Dr. Sarah Ahmed',
      specialty: 'General Medicine',
      rating: 4.8,
      experience: '8 years',
      languages: ['English', 'Arabic', 'Dari'],
      availability: 'Available Now',
      subsidized: true,
      consultationFee: 'Free (NGO Sponsored)',
      avatar: '👩‍⚕️',
      education: 'MBBS, MD - Harvard Medical School',
      certifications: ['Board Certified Internal Medicine', 'Refugee Health Specialist'],
      nextAvailable: 'Immediate',
      consultationTypes: ['Video Call', 'Phone Call', 'Chat'],
      about: 'Specializes in refugee healthcare with 8+ years experience in humanitarian medicine.'
    },
    {
      id: 'dr_002',
      name: 'Dr. Michael Chen', 
      specialty: 'Internal Medicine',
      rating: 4.9,
      experience: '12 years',
      languages: ['English', 'Mandarin'],
      availability: 'Available in 15 mins',
      subsidized: false,
      consultationFee: 'Free (NGO Sponsored)',
      avatar: '👨‍⚕️',
      education: 'MBBS, MD - Johns Hopkins',
      certifications: ['Internal Medicine Board Certified'],
      nextAvailable: '15 minutes',
      consultationTypes: ['Video Call', 'Phone Call'],
      about: 'Expert in internal medicine with focus on infectious diseases and preventive care.'
    }
  ];

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = { type: 'user', message: chatInput, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    setChatLoading(true);
    
    try {
      const response = await triageService.sendMentalHealthMessage(chatInput);
      const botMessage = { 
        type: 'bot', 
        message: response.response || 'I\'m here to support you.',
        timestamp: new Date(),
        crisis: response.crisis_detected || false
      };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { 
        type: 'bot', 
        message: 'I\'m having trouble connecting right now, but I care about you.',
        timestamp: new Date() 
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
      setChatInput('');
    }
  };

  if (!result) return null;

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'high':
        return {
          color: 'error',
          icon: <ErrorIcon />,
          bgColor: '#fee2e2',
          textColor: '#dc2626'
        };
      case 'medium':
        return {
          color: 'warning',
          icon: <WarningIcon />,
          bgColor: '#fef3c7',
          textColor: '#d97706'
        };
      case 'low':
        return {
          color: 'success',
          icon: <CheckIcon />,
          bgColor: '#dcfce7',
          textColor: '#16a34a'
        };
      default:
        return {
          color: 'info',
          icon: <InfoIcon />,
          bgColor: '#dbeafe',
          textColor: '#2563eb'
        };
    }
  };

  const severityConfig = getSeverityConfig(result.data.severity);

  return (
    <Card className="glass-card" sx={{ height: '100%', minHeight: 600 }}>
      <CardContent sx={{ p: 4, height: '100%' }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 600, textAlign: 'center', color: 'success.main' }}>
          🤖 AI Assessment Results
        </Typography>

        {/* Severity Badge */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Paper 
            sx={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 3,
              py: 1,
              borderRadius: 5,
              backgroundColor: severityConfig.bgColor,
              color: severityConfig.textColor,
              fontWeight: 600
            }}
          >
            {severityConfig.icon}
            <Typography variant="h6" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
              {result.data.severity} Priority
            </Typography>
          </Paper>
        </Box>

        {/* Main Advice */}
        <Alert 
          severity={severityConfig.color} 
          sx={{ 
            mb: 3, 
            borderRadius: 3,
            '& .MuiAlert-message': {
              fontSize: '1rem',
              fontWeight: 500
            }
          }}
        >
          {result.data.advice}
        </Alert>

        {/* Confidence Score */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            AI Confidence Score
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <HeartIcon color="primary" />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {Math.round((result.data.confidence || 0.5) * 100)}%
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Recommendations */}
        {result.data.recommendations && result.data.recommendations.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              💡 Recommendations
            </Typography>
            <List disablePadding>
              {result.data.recommendations.slice(0, 3).map((rec, index) => (
                <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={rec}
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* ML Outbreak Analysis */}
        {result.data.outbreakAnalysis && (
          <Box sx={{ backgroundColor: 'rgba(255, 152, 0, 0.05)', p: 2, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'warning.main' }}>
              🦠 Outbreak Analysis
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Risk Level</Typography>
                <Typography variant="h6" color="warning.main">
                  {result.data.outbreakAnalysis.risk_level || 'Medium'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Similar Cases</Typography>
                <Typography variant="h6" color="info.main">
                  {result.data.outbreakAnalysis.similar_cases || '12'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', mt: 'auto' }}>
          <Button
            variant="contained"
            startIcon={<VideoIcon />}
            onClick={() => setPractoDialog(true)}
            sx={{ 
              borderRadius: 3,
              py: 1.5,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            Connect with Doctor Now
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<LoomIcon />}
            onClick={() => setLoomDialog(true)}
            sx={{ borderRadius: 3, py: 1.5 }}
          >
            Mental Health Support
          </Button>
        </Box>

        {/* Practo Doctor Consultation Dialog */}
        <Dialog 
          open={practoDialog} 
          onClose={() => setPractoDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 4, minHeight: '600px' } }}
        >
          <DialogTitle 
            sx={{ 
              bgcolor: 'success.main', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VideoIcon />
              <Typography variant="h6">🩺 Practo Doctor Consultation</Typography>
            </Box>
            <IconButton 
              onClick={() => setPractoDialog(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {/* Tabs */}
            <Tabs 
              value={selectedTab} 
              onChange={(e, newValue) => setSelectedTab(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Available Doctors" />
              <Tab label="Video Consultation" />
              <Tab label="Prescription" />
              <Tab label="Follow-up" />
            </Tabs>

            {/* Tab Panels */}
            <Box sx={{ p: 3 }}>
              {/* Available Doctors Tab */}
              {selectedTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
                    🩺 Select Your Doctor
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Choose from our verified healthcare professionals specialized in refugee care
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {availableDoctors.map((doctor, index) => (
                      <Grid item xs={12} key={doctor.id}>
                        <Paper 
                          sx={{ 
                            p: 3, 
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: '2px solid transparent',
                            '&:hover': { 
                              boxShadow: 4,
                              borderColor: 'success.main',
                              transform: 'translateY(-2px)'
                            }
                          }}
                          onClick={() => setSelectedTab(1)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Avatar sx={{ 
                              width: 80, 
                              height: 80, 
                              bgcolor: 'success.main', 
                              fontSize: '2.5rem' 
                            }}>
                              {doctor.avatar}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {doctor.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {doctor.specialty} • {doctor.experience}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                🗣️ Languages: {doctor.languages.join(', ')}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Rating value={doctor.rating} precision={0.1} size="small" readOnly />
                                <Typography variant="body2">({doctor.rating})</Typography>
                              </Box>
                              <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                                {doctor.about}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Chip 
                                label={doctor.availability} 
                                color="success" 
                                sx={{ mb: 2 }} 
                              />
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontWeight: 700, 
                                  color: doctor.subsidized ? 'success.main' : 'primary.main',
                                  mb: 1 
                                }}
                              >
                                {doctor.consultationFee}
                              </Typography>
                              {doctor.subsidized && (
                                <Chip label="NGO Sponsored" color="success" size="small" sx={{ mb: 1 }} />
                              )}
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Next Available: {doctor.nextAvailable}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
              
              {/* Video Consultation Tab */}
              {selectedTab === 1 && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
                    🎥 Video Consultation with Dr. Sarah Ahmed
                  </Typography>
                  
                  <Box sx={{ 
                    minHeight: 350, 
                    bgcolor: 'grey.900', 
                    borderRadius: 3, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    mb: 3,
                    position: 'relative'
                  }}>
                    <Box sx={{ color: 'white', textAlign: 'center' }}>
                      <VideoIcon sx={{ fontSize: 80, mb: 2 }} />
                      <Typography variant="h5" sx={{ mb: 2 }}>Connecting to Doctor...</Typography>
                      <CircularProgress sx={{ color: 'white' }} />
                      <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
                        Secure, encrypted connection establishing
                      </Typography>
                    </Box>
                    
                    {/* Mock video controls */}
                    <Box sx={{ 
                      position: 'absolute', 
                      bottom: 16, 
                      left: '50%', 
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: 2
                    }}>
                      <IconButton sx={{ bgcolor: 'success.main', color: 'white', '&:hover': { bgcolor: 'success.dark' } }}>
                        <VideoIcon />
                      </IconButton>
                      <IconButton sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
                        <ChatIcon />
                      </IconButton>
                      <IconButton sx={{ bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}>
                        <PhoneIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                    <Typography variant="body1">
                      🔗 <strong>Practo Integration Active:</strong> Your symptoms and ML outbreak analysis have been securely shared with Dr. Sarah Ahmed for immediate assessment.
                    </Typography>
                  </Alert>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Button variant="outlined" fullWidth startIcon={<VideoIcon />} sx={{ py: 1.5 }}>
                        HD Video Call
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Button variant="outlined" fullWidth startIcon={<PhoneIcon />} sx={{ py: 1.5 }}>
                        Voice Call
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Button variant="outlined" fullWidth startIcon={<ChatIcon />} sx={{ py: 1.5 }}>
                        Text Chat
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Prescription Tab */}
              {selectedTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
                    📋 Digital Prescription
                  </Typography>
                  <Paper sx={{ p: 3, bgcolor: 'grey.50', mb: 3, borderRadius: 3 }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Dr. Sarah Ahmed, MD
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      General Medicine • License: MD123456 • NGO Partner
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                          Patient Information:
                        </Typography>
                        <Typography variant="body2">
                          Assessment Date: {new Date().toLocaleDateString()}<br/>
                          Symptoms: AI-analyzed symptoms with outbreak risk assessment<br/>
                          Priority Level: {result.data.severity?.toUpperCase() || 'MEDIUM'}<br/>
                          Consultation Type: Video Call (NGO Sponsored)
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                          Treatment Plan:
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText 
                              primary="💊 Paracetamol 500mg"
                              secondary="Take 1 tablet twice daily after meals for 3 days"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="💧 Adequate Hydration"
                              secondary="Drink 8-10 glasses of water daily"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="🛏️ Rest & Recovery"
                              secondary="Get adequate sleep and avoid strenuous activities"
                            />
                          </ListItem>
                        </List>
                      </Grid>
                    </Grid>
                    
                    <Alert severity="success" sx={{ mt: 3, borderRadius: 2 }}>
                      <Typography variant="body2">
                        <strong>Follow-up Instructions:</strong> Return for follow-up if symptoms worsen or persist beyond 5 days. 
                        Free follow-up consultation available through NGO partnership.
                      </Typography>
                    </Alert>
                  </Paper>
                  
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button variant="contained" startIcon={<SendIcon />}>
                      Send to Pharmacy
                    </Button>
                    <Button variant="outlined">
                      Download PDF
                    </Button>
                    <Button variant="outlined" startIcon={<ScheduleIcon />}>
                      Schedule Follow-up
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Follow-up Tab */}
              {selectedTab === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
                    📅 Follow-up Care Plan
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card sx={{ p: 3, mb: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                        <Typography variant="h6" gutterBottom>
                          ✅ Immediate Actions Complete
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon><CheckIcon sx={{ color: 'success.contrastText' }} /></ListItemIcon>
                            <ListItemText primary="AI symptom analysis completed" />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><CheckIcon sx={{ color: 'success.contrastText' }} /></ListItemIcon>
                            <ListItemText primary="Doctor consultation completed" />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><CheckIcon sx={{ color: 'success.contrastText' }} /></ListItemIcon>
                            <ListItemText primary="Prescription provided" />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><CheckIcon sx={{ color: 'success.contrastText' }} /></ListItemIcon>
                            <ListItemText primary="Outbreak risk assessed" />
                          </ListItem>
                        </List>
                      </Card>
                      
                      <Card sx={{ p: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
                        <Typography variant="h6" gutterBottom>
                          🔄 Next Steps
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          Based on your consultation, here's your recovery timeline:
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon><ScheduleIcon sx={{ color: 'info.contrastText' }} /></ListItemIcon>
                            <ListItemText primary="Day 1-2: Start medication, rest" />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><ScheduleIcon sx={{ color: 'info.contrastText' }} /></ListItemIcon>
                            <ListItemText primary="Day 3-5: Monitor improvement" />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon><ScheduleIcon sx={{ color: 'info.contrastText' }} /></ListItemIcon>
                            <ListItemText primary="Day 5+: Follow-up if no improvement" />
                          </ListItem>
                        </List>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        📞 24/7 Support Available
                      </Typography>
                      
                      <Paper sx={{ p: 2, mb: 2, bgcolor: 'warning.light' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                          🚨 Emergency Contact
                        </Typography>
                        <Typography variant="body2">
                          If symptoms worsen significantly, call emergency services or visit the nearest hospital immediately.
                        </Typography>
                        <Button variant="contained" color="error" size="small" sx={{ mt: 1 }}>
                          Emergency: 911
                        </Button>
                      </Paper>
                      
                      <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.light' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'primary.contrastText' }}>
                          💬 Free Follow-up
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'primary.contrastText', mb: 1 }}>
                          Chat with Dr. Sarah Ahmed anytime through the RefugeAlly app
                        </Typography>
                        <Button variant="outlined" size="small" sx={{ color: 'primary.contrastText', borderColor: 'primary.contrastText' }}>
                          Message Doctor
                        </Button>
                      </Paper>
                      
                      <Paper sx={{ p: 2, bgcolor: 'secondary.light' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'secondary.contrastText' }}>
                          🧠 Mental Health Support
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'secondary.contrastText', mb: 1 }}>
                          Access trauma-informed mental health support through Loom
                        </Typography>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          startIcon={<LoomIcon />}
                          onClick={() => {
                            setPractoDialog(false);
                            setLoomDialog(true);
                          }}
                          sx={{ color: 'secondary.contrastText', borderColor: 'secondary.contrastText' }}
                        >
                          Open Loom
                        </Button>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          </DialogContent>
        </Dialog>

        {/* Loom Mental Health Dialog */}
        <Dialog 
          open={loomDialog} 
          onClose={() => setLoomDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: 'secondary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LoomIcon />
              <Typography variant="h6">Mental Health Support</Typography>
            </Box>
            <IconButton onClick={() => setLoomDialog(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '400px' }}>
            <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: 'grey.50' }}>
              {chatMessages.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <LoomIcon sx={{ fontSize: 40, mb: 2, color: 'secondary.main' }} />
                  <Typography variant="h6" gutterBottom>I'm here to support you</Typography>
                  <Typography variant="body2">How are you feeling after your consultation?</Typography>
                </Box>
              )}
              
              {chatMessages.map((msg, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    mb: 2,
                    display: 'flex',
                    justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '80%',
                      bgcolor: msg.type === 'user' ? 'primary.main' : 'white',
                      color: msg.type === 'user' ? 'white' : 'text.primary',
                      borderRadius: 3
                    }}
                  >
                    <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                      {msg.message}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>
            
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Share what's on your mind..."
                  variant="outlined"
                  size="small"
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                />
                <Button
                  variant="contained"
                  onClick={handleChatSubmit}
                  disabled={!chatInput.trim() || chatLoading}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  <SendIcon />
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TriageResults;
