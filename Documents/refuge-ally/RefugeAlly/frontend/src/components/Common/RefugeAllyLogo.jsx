// src/components/Common/RefugeAllyLogo.jsx - Using Your Logo Image
import React from 'react';
import { Box, Typography } from '@mui/material';

const RefugeAllyLogo = ({ size = 60, showText = true }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    {/* Replace this with your actual logo image */}
    <Box
      component="img"
      src="/assets/images/refugeally-logo.png" // Path to your logo image
      alt="RefugeAlly Logo"
      sx={{
        width: size,
        height: size,
        objectFit: 'contain'
      }}
    />
    
    {/* Optional: Show/hide text based on prop */}
    {showText && (
      <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
        RefugeAlly
      </Typography>
    )}
  </Box>
);

export default RefugeAllyLogo;