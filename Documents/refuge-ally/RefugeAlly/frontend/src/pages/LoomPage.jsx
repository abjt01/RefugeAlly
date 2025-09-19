// src/pages/LoomPage.jsx
import React from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Button
} from '@mui/material';
import {
  VideoCall as VideoIcon,
  Language as LanguageIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const LoomPage = () => (
  <Container maxWidth="lg">
    <Box sx={{ py: 8 }}>
      <Typography variant="h2" sx={{ textAlign: 'center', fontWeight: 800, mb: 2, color: 'primary.main' }}>
        Loom (Beta)
      </Typography>
      <Typography variant="h6" sx={{ textAlign: 'center', mb: 6, color: 'text.secondary' }}>
        Advanced Video Consultation Platform
      </Typography>
      
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <VideoIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Loom is our next-generation video consultation platform with AI-powered real-time translation
              and cultural sensitivity features.
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <LanguageIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Real-time Translation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Break language barriers with instant translation during video calls
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <SecurityIcon sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Secure & Private
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  End-to-end encryption with blockchain-based identity verification
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Button
            variant="outlined"
            size="large"
            fullWidth
            sx={{ mt: 4, py: 1.5 }}
            disabled
          >
            Join Beta Waitlist
          </Button>
        </CardContent>
      </Card>
    </Box>
  </Container>
);

export default LoomPage;