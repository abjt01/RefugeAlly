import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  CircularProgress, 
  Paper,
  Alert,
  Grid
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import triageService from '../services/triageService';

const LoomPage = () => {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

useEffect(() => {
  // Test Loom service connection
  const testConnection = async () => {
    try {
      // Try both possible health endpoints
      let response;
      try {
        response = await fetch('http://localhost:6000/mental-health/health');
      } catch (error) {
        response = await fetch('http://localhost:6000/health');
      }
      setIsOnline(response.ok);
      
      if (response.ok) {
        console.log('✅ Loom service connected successfully');
      }
    } catch (error) {
      console.log('❌ Loom service not available:', error.message);
      setIsOnline(false);
    }
  };
  testConnection();
  
  // Check every 30 seconds
  const interval = setInterval(testConnection, 30000);
  return () => clearInterval(interval);
}, []);

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

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Typography variant="h2" sx={{ textAlign: 'center', fontWeight: 800, mb: 2, color: 'primary.main' }}>
          Loom Mental Health Support
        </Typography>
        <Typography variant="h6" sx={{ textAlign: 'center', mb: 6, color: 'text.secondary' }}>
          {isOnline ? 'Trauma-informed AI support for refugees' : 'Service Fetched From the MicroServices'}
        </Typography>

        <Card>
          <CardContent sx={{ p: 4 }}>
            {/* Service Status */}
            {/* <Alert severity={isOnline ? "success" : "warning"} sx={{ mb: 3 }}>
              Loom Service Status: {isOnline ? "Online ✅" : "Demo Mode (Start loom service: cd loom && python app/main.py) ⚠️"}
            </Alert> */}

            {/* Chat Interface */}
            <Box sx={{ minHeight: 400, maxHeight: 400, overflowY: 'auto', mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              {chatMessages.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <Typography variant="h6" gutterBottom>
                    🤗 Welcome to Loom Mental Health Support
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    I'm here to provide trauma-informed support designed specifically for refugees.
                  </Typography>
                  <Typography variant="body2">
                    How are you feeling today? You can share in English, Arabic, or Dari.
                  </Typography>
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
                  <Paper sx={{ p: 2, borderRadius: 3 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" sx={{ ml: 1, display: 'inline' }}>
                      Thinking...
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Box>
            
            {/* Chat Input */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Share what's on your mind... (English, Arabic, or Dari)"
                variant="outlined"
                onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                multiline
                maxRows={3}
              />
              <Button
                variant="contained"
                onClick={handleChatSubmit}
                disabled={!chatInput.trim() || chatLoading}
                sx={{ minWidth: 'auto', px: 3 }}
              >
                <SendIcon />
              </Button>
            </Box>

            {/* Features Grid */}
            <Grid container spacing={3} sx={{ mt: 4 }}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ mb: 1 }}>🛡️</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Crisis Detection</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Automatic detection of crisis situations with immediate support resources
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ mb: 1 }}>🌍</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Multilingual</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Support in English, Arabic, and Dari with cultural sensitivity
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ mb: 1 }}>💚</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Trauma-Informed</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Specialized approach designed for refugee experiences
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoomPage;
