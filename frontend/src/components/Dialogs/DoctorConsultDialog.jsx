// src/components/Dialogs/DoctorConsultDialog.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Rating,
  LinearProgress
} from '@mui/material';
import {
  LocalHospital as DoctorIcon,
  VideoCall as VideoIcon
} from '@mui/icons-material';

const DoctorConsultDialog = ({ open, onClose }) => {
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
      image: '👩‍⚕️'
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
      consultationFee: 'Free (NGO Sponsored)',
      image: '👨‍⚕️'
    }
  ];

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [consultationStarted, setConsultationStarted] = useState(false);

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setTimeout(() => {
      setConsultationStarted(true);
    }, 1000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <DoctorIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {consultationStarted ? 'Video Consultation' : 'Available Doctors'}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {consultationStarted ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
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
              <Typography variant="h6" sx={{ color: 'white' }}>
                Video Stream Active...
              </Typography>
              <Box sx={{ 
                position: 'absolute',
                top: 16,
                left: 16,
                bgcolor: 'rgba(0,0,0,0.7)',
                borderRadius: 2,
                p: 1,
                color: 'white'
              }}>
                <Typography variant="body2">
                  {selectedDoctor?.name}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Connected with {selectedDoctor?.name}
            </Typography>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Consultation in progress...
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {availableDoctors.map((doctor) => (
              <Grid item xs={12} key={doctor.id}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 4 }
                  }}
                  onClick={() => handleDoctorSelect(doctor)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ 
                      width: 60, 
                      height: 60, 
                      borderRadius: '50%',
                      bgcolor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem'
                    }}>
                      {doctor.image}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {doctor.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {doctor.specialty} • {doctor.experience}
                      </Typography>
                      <Rating value={doctor.rating} precision={0.1} size="small" readOnly />
                      <Box sx={{ mt: 1 }}>
                        {doctor.languages.map((lang) => (
                          <Chip 
                            key={lang} 
                            label={lang} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }} 
                          />
                        ))}
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
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        {consultationStarted ? (
          <Button 
            variant="contained"
            color="error"
            onClick={() => {
              setConsultationStarted(false);
              setSelectedDoctor(null);
              onClose();
            }}
          >
            End Consultation
          </Button>
        ) : (
          <Button onClick={onClose}>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DoctorConsultDialog;