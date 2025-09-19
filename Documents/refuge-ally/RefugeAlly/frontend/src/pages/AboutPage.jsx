// src/pages/AboutPage.jsx
import React from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { CheckCircle as CheckIcon } from '@mui/icons-material';

const AboutPage = () => (
  <Container maxWidth="lg">
    <Box sx={{ py: 8 }}>
      <Typography variant="h2" sx={{ textAlign: 'center', fontWeight: 800, mb: 6, color: 'primary.main' }}>
        About RefugeAlly
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                Our Mission
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                RefugeAlly is an AI-enabled Virtual Health Assistant designed specifically to improve 
                healthcare access for refugees and displaced populations. Built with cutting-edge technology 
                and humanitarian principles, we provide comprehensive, scalable healthcare solutions.
              </Typography>
              
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, mt: 4 }}>
                Key Features
              </Typography>
              <List>
                <ListItem>
                  <CheckIcon sx={{ mr: 2, color: 'success.main' }} />
                  <ListItemText primary="Multilingual AI health triage supporting Arabic, Dari, and English" />
                </ListItem>
                <ListItem>
                  <CheckIcon sx={{ mr: 2, color: 'success.main' }} />
                  <ListItemText primary="Advanced outbreak prediction using real-time data analysis" />
                </ListItem>
                <ListItem>
                  <CheckIcon sx={{ mr: 2, color: 'success.main' }} />
                  <ListItemText primary="Trauma-informed mental health chatbot" />
                </ListItem>
                <ListItem>
                  <CheckIcon sx={{ mr: 2, color: 'success.main' }} />
                  <ListItemText primary="Secure, blockchain-based digital identity system" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>
                50K+
              </Typography>
              <Typography variant="body1">Refugees Served</Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                15
              </Typography>
              <Typography variant="body1">Countries</Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'warning.main' }}>
                98%
              </Typography>
              <Typography variant="body1">Accuracy Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  </Container>
);

export default AboutPage;