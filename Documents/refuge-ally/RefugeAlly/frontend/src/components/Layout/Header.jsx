// src/components/Layout/Header.jsx - FIXED VERSION
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Badge,
  Button
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  VideoCall as VideoIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  ContactMail as ContactIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  PersonAdd as SignupIcon
} from '@mui/icons-material';

// Import your existing LanguageSelector (keep it as is)
import LanguageSelector from '../Common/LanguageSelector';
import RefugeAllyLogo from '../Common/RefugeAllyLogo';

const Header = ({ 
  currentPage = 'home', 
  onPageChange = () => {}, 
  isLoggedIn = false, 
  onLogin = () => {}, 
  onLogout = () => {} 
}) => {
  // Remove the useTranslation hook to prevent errors
  // const { t } = useTranslation(); // REMOVED THIS LINE

  const menuItems = [
    { id: 'home', label: 'Home', icon: <HomeIcon /> },
    { id: 'loom', label: 'Loom (Beta)', icon: <VideoIcon /> },
    { id: 'about', label: 'About', icon: <InfoIcon /> },
    { id: 'contact', label: 'Contact', icon: <ContactIcon /> }
  ];

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
        <RefugeAllyLogo />
        
        {/* Navigation Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {menuItems.map((item) => (
            <Button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              startIcon={item.icon}
              sx={{
                color: currentPage === item.id ? 'primary.main' : 'text.secondary',
                fontWeight: currentPage === item.id ? 700 : 500,
                '&:hover': { color: 'primary.main' }
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Actions Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Use your existing LanguageSelector component */}
          <LanguageSelector />
          
          {isLoggedIn ? (
            <>
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
              
              <Button
                onClick={onLogout}
                startIcon={<LogoutIcon />}
                variant="outlined"
                size="small"
              >
                Logout
              </Button>
              
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
            </>
          ) : (
            <>
              <Button
                onClick={() => onPageChange('login')}
                startIcon={<LoginIcon />}
                variant="outlined"
                size="small"
              >
                Login
              </Button>
              <Button
                onClick={() => onPageChange('signup')}
                startIcon={<SignupIcon />}
                variant="contained"
                size="small"
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;