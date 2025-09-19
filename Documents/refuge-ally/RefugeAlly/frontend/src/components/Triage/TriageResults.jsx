import React from 'react';
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
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Favorite as HeartIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const TriageResults = ({ result }) => {
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
              <Box sx={{ backgroundColor: 'rgba(99, 102, 241, 0.05)', p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Next Steps
                </Typography>
                <Typography variant="body1">
                  {result.data.followUp}
                </Typography>
              </Box>
            )}

            {/* Timestamp */}
            <Box sx={{ textAlign: 'center', mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                Assessment completed on {new Date(result.timestamp).toLocaleString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );
};

export default TriageResults;
