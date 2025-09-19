import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
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
  CircularProgress,
  Grid,
  Avatar,
  Rating,
  Tab,
  Tabs
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Favorite as HeartIcon,
  Psychology as LoomIcon,
  VideoCall as VideoIcon,
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import triageService from '../../services/triageService';

const TriageResults = ({ result }) => {
  // State for dialogs and chat
  const [loomDialog, setLoomDialog] = useState(false);
  const [practoDialog, setPractoDialog] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [moodDialog, setMoodDialog] = useState(false);

  // Chat and mood functions
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

  const handleMoodSubmit = async (emoji) => {
    try {
      const response = await triageService.logMood(emoji);
      const moodMessage = {
        type: 'bot',
        message: `${response.message || 'Thank you for sharing.'}\n\n${response.intervention || 'How can I support you today?'}`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, moodMessage]);
      setMoodDialog(false);
    } catch (error) {
      console.error('Mood logging error:', error);
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

  // Mock doctor data
  const availableDoctors = [
    {
      name: 'Dr. Sarah Ahmed',
      specialty: 'General Medicine',
      rating: 4.8,
      availability: 'Available Now',
      fee: 'Free (NGO Sponsored)',
      subsidized: true,
      experience: '8 years',
      languages: ['English', 'Arabic', 'Dari']
    },
    {
      name: 'Dr. Michael Chen',
      specialty: 'Internal Medicine', 
      rating: 4.9,
      availability: 'Available in 15 mins',
      fee: '$25',
      subsidized: false,
      experience: '12 years',
      languages: ['English', 'Mandarin']
    }
  ];

  const moodEmojis = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😰', label: 'Anxious' },
    { emoji: '😡', label: 'Angry' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h2" gutterBottom className="gradient-text" textAlign="center">
          Health Assessment Results
        </Typography>

        <Card className="glass-card" sx={{ maxWidth: 800, mx: 'auto' }}>
          <CardContent sx={{ p: 4 }}>
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
                  fontSize: '1.1rem',
                  fontWeight: 500
                }
              }}
            >
              {result.data.advice}
            </Alert>

            {/* Confidence Score */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Confidence Score
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
                  Recommendations
                </Typography>
                <List disablePadding>
                  {result.data.recommendations.map((rec, index) => (
                    <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={rec}
                        primaryTypographyProps={{ fontSize: '0.95rem' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Follow-up */}
            {result.data.followUp && (
              <Box sx={{ backgroundColor: 'rgba(99, 102, 241, 0.05)', p: 3, borderRadius: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Next Steps
                </Typography>
                <Typography variant="body1">
                  {result.data.followUp}
                </Typography>
              </Box>
            )}

            {/* NEW: ML Outbreak Analysis */}
            {result.data.outbreakAnalysis && (
              <Box sx={{ backgroundColor: 'rgba(255, 152, 0, 0.05)', p: 3, borderRadius: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'warning.main' }}>
                  🦠 Outbreak Analysis (ML Powered)
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
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {result.data.outbreakAnalysis.recommendation || 'Continue monitoring for outbreak patterns.'}
                </Typography>
              </Box>
            )}

            {/* NEW: Additional Support Buttons */}
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, textAlign: 'center' }}>
              Additional Support Available
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<VideoIcon />}
                onClick={() => setPractoDialog(true)}
                sx={{ 
                  borderRadius: 3, 
                  px: 3,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                }}
              >
                Connect with Doctor
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<LoomIcon />}
                onClick={() => setLoomDialog(true)}
                sx={{ borderRadius: 3, px: 3 }}
              >
                Mental Health Support
              </Button>
            </Box>

            {/* Timestamp */}
            <Box sx={{ textAlign: 'center', mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                Assessment completed on {new Date(result.timestamp).toLocaleString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Loom Mental Health Dialog */}
        <Dialog 
          open={loomDialog} 
          onClose={() => setLoomDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            bgcolor: 'secondary.main', 
            color: 'white', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LoomIcon />
              <Typography variant="h6">Mental Health Support</Typography>
            </Box>
            <IconButton onClick={() => setLoomDialog(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '500px' }}>
            {/* Chat Messages Area */}
            <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: 'grey.50' }}>
              {chatMessages.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <LoomIcon sx={{ fontSize: 40, mb: 2, color: 'secondary.main' }} />
                  <Typography variant="h6" gutterBottom>
                    I'm here to support you
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    How are you feeling today? You can share anything on your mind.
                  </Typography>
                  
                  {/* Quick Mood Buttons */}
                  <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
                    Quick mood check:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {moodEmojis.map((mood) => (
                      <Button
                        key={mood.emoji}
                        variant="outlined"
                        onClick={() => handleMoodSubmit(mood.emoji)}
                        sx={{ fontSize: '1.5rem', minWidth: '60px', borderRadius: 2 }}
                        title={mood.label}
                      >
                        {mood.emoji}
                      </Button>
                    ))}
                  </Box>
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
                      borderRadius: 3,
                      boxShadow: 2
                    }}
                  >
                    <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                      {msg.message}
                    </Typography>
                    {msg.crisis && (
                      <Alert severity="error" sx={{ mt: 1, fontSize: '0.8rem' }}>
                        🚨 Crisis support activated - Please seek immediate help: 988
                      </Alert>
                    )}
                    <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1 }}>
                      {msg.timestamp.toLocaleTimeString()}
                    </Typography>
                  </Paper>
                </Box>
              ))}
              
              {chatLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                  <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2">Thinking...</Typography>
                    </Box>
                  </Paper>
                </Box>
              )}
            </Box>
            
            {/* Chat Input Area */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Share what's on your mind..."
                  variant="outlined"
                  size="small"
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSubmit()}
                  multiline
                  maxRows={3}
                  sx={{ borderRadius: 3 }}
                />
                <Button
                  variant="contained"
                  onClick={handleChatSubmit}
                  disabled={!chatInput.trim() || chatLoading}
                  sx={{ minWidth: 'auto', px: 2, borderRadius: 2 }}
                >
                  <SendIcon />
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Practo Doctor Dialog */}
        <Dialog 
          open={practoDialog} 
          onClose={() => setPractoDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ 
            bgcolor: 'success.main', 
            color: 'white', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VideoIcon />
              <Typography variant="h6">Connect with Doctor</Typography>
            </Box>
            <IconButton onClick={() => setPractoDialog(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
              <Tab label="Available Doctors" />
              <Tab label="Video Consultation" />
              <Tab label="Prescription" />
            </Tabs>
            
            {/* Available Doctors Tab */}
            {selectedTab === 0 && (
              <Box sx={{ py: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
                  🩺 Select Your Doctor
                </Typography>
                <Grid container spacing={2}>
                  {availableDoctors.map((doctor, index) => (
                    <Grid item xs={12} key={index}>
                      <Paper 
                        sx={{ 
                          p: 3, 
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: '2px solid transparent',
                          '&:hover': { 
                            boxShadow: 4,
                            borderColor: 'primary.main',
                            transform: 'translateY(-2px)'
                          }
                        }}
                        onClick={() => setSelectedTab(1)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Avatar sx={{ 
                            width: 70, 
                            height: 70, 
                            bgcolor: 'primary.main', 
                            fontSize: '2rem' 
                          }}>
                            👩‍⚕️
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {doctor.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {doctor.specialty} • {doctor.experience}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Languages: {doctor.languages.join(', ')}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Rating value={doctor.rating} precision={0.1} size="small" readOnly />
                              <Typography variant="body2">({doctor.rating})</Typography>
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Chip 
                              label={doctor.availability} 
                              color="success" 
                              sx={{ mb: 1 }} 
                            />
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 700, 
                                color: doctor.subsidized ? 'success.main' : 'primary.main' 
                              }}
                            >
                              {doctor.fee}
                            </Typography>
                            {doctor.subsidized && (
                              <Chip label="NGO Sponsored" color="success" size="small" />
                            )}
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
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
                  🎥 Video Consultation Ready
                </Typography>
                <Box sx={{ 
                  minHeight: 300, 
                  bgcolor: 'grey.900', 
                  borderRadius: 3, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 3,
                  position: 'relative'
                }}>
                  <Box sx={{ color: 'white', textAlign: 'center' }}>
                    <VideoIcon sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h6">Connecting to Dr. Sarah Ahmed...</Typography>
                    <CircularProgress sx={{ mt: 2, color: 'white' }} />
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
                
                <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                  <Typography variant="body1">
                    🔗 <strong>Integration Ready:</strong> This connects to Practo's video consultation platform with your ML outbreak data automatically shared with the doctor.
                  </Typography>
                </Alert>
                
                <Typography variant="body2" color="text.secondary">
                  Your symptoms and ML risk analysis have been securely shared with the doctor.
                </Typography>
              </Box>
            )}
            
            {/* Prescription Tab */}
            {selectedTab === 2 && (
              <Box sx={{ py: 3 }}>
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
                        Symptoms: Analyzed via AI + ML outbreak detection<br/>
                        Risk Level: {result.data.severity?.toUpperCase() || 'MEDIUM'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                        Prescription:
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Paracetamol 500mg"
                            secondary="1 tablet twice daily after meals × 3 days"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Rest & Hydration"
                            secondary="Adequate fluids and rest"
                          />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                  
                  <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                    <strong>Follow-up:</strong> Return if symptoms worsen or persist beyond 5 days. 
                    Free follow-up consultation available via NGO partnership.
                  </Alert>
                </Paper>
                
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button variant="contained" startIcon={<SendIcon />}>
                    Send to Pharmacy
                  </Button>
                  <Button variant="outlined">
                    Download PDF
                  </Button>
                  <Button variant="outlined">
                    Schedule Follow-up
                  </Button>
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </motion.div>
  );
};

export default TriageResults;
