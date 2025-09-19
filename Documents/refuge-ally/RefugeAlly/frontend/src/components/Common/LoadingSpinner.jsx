import React from 'react';
import {
  Box,
  CircularProgress,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const LoadingSpinner = ({ 
  message, 
  size = 40, 
  showMessage = true,
  center = true 
}) => {
  const { t } = useTranslation();

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        p: 2
      }}
    >
      <CircularProgress size={size} />
      {showMessage && (
        <Typography variant="body2" color="text.secondary">
          {message || t('common.loading')}
        </Typography>
      )}
    </Box>
  );

  if (center) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
          width: '100%'
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};

export default LoadingSpinner;