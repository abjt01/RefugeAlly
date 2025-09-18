import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Badge
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  MedicalServices as MedicalIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../Common/LanguageSelector';

const Header = () => {
  const { t } = useTranslation();

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
        color: 'text.primary'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        {/* Logo Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
          >
            <MedicalIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography 
              variant="h4" 
              component="div" 
              className="gradient-text"
              sx={{ fontWeight: 800, fontSize: '1.5rem' }}
            >
              RefugeAlly
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: -0.5 }}>
              AI Health Assistant
            </Typography>
          </Box>
        </Box>

        {/* Actions Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LanguageSelector />
          
          <IconButton 
            color="inherit" 
            sx={{ 
              backgroundColor: 'rgba(148, 163, 184, 0.1)',
              '&:hover': { backgroundColor: 'rgba(148, 163, 184, 0.2)' }
            }}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <IconButton 
            color="inherit"
            sx={{ 
              backgroundColor: 'rgba(148, 163, 184, 0.1)',
              '&:hover': { backgroundColor: 'rgba(148, 163, 184, 0.2)' }
            }}
          >
            <SettingsIcon />
          </IconButton>
          
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              ml: 1
            }}
          >
            U
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
