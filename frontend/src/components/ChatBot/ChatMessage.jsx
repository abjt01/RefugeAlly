import React from 'react';
import { Box, Typography, Card, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useTranslation } from 'react-i18next';

const ChatMessage = ({ message, isBot = false }) => {
  const { t } = useTranslation();
  const getSeverityColor = severity => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'info';
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: isBot ? 'flex-start' : 'flex-end', mb: 2, alignItems: 'flex-start', gap: 1 }}>
      {isBot && (
        <Box sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: '50%', p: 0.5 }}>
          <SmartToyIcon fontSize="small" />
        </Box>
      )}
      <Card sx={{ maxWidth: '75%', bgcolor: isBot ? 'grey.100' : 'primary.main', color: isBot ? 'text.primary' : 'white' }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="body1">{message.text || message.advice}</Typography>
          {message.severity && (
            <Chip label={t(`severity.${message.severity}`)} color={getSeverityColor(message.severity)} size="small" sx={{ mt: 1 }} />
          )}
          {message.timestamp && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7, fontSize: '0.75rem' }}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </Typography>
          )}
        </Box>
      </Card>
      {!isBot && (
        <Box sx={{ bgcolor: 'grey.400', color: 'white', borderRadius: '50%', p: 0.5 }}>
          <PersonIcon fontSize="small" />
        </Box>
      )}
    </Box>
  );
};
export default ChatMessage;
