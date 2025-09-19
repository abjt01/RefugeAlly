// src/components/Layout/Header.jsx - UPDATED WITH GLOWING LOOM BUTTON
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Badge,
  Button,
  Chip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Psychology as LoomIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  ContactMail as ContactIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  PersonAdd as SignupIcon,
  AutoAwesome as SparkleIcon
} from '@mui/icons-material';

// Import your existing components
import LanguageSelector from '../Common/LanguageSelector';
import RefugeAllyLogo from '../Common/RefugeAllyLogo';

const Header = ({ 
  currentPage = 'home', 
  onPageChange = () => {}, 
  isLoggedIn = false, 
  onLogin = () => {}, 
  onLogout = () => {} 
}) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: <HomeIcon /> },
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
        
        {/* Navigation Menu with Special Loom Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {/* Regular Menu Items */}
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
          
          {/* SPECIAL GLOWING LOOM BUTTON */}
          <Box sx={{ position: 'relative', mx: 2 }}>
            <Button
              onClick={() => onPageChange('loom')}
              startIcon={<LoomIcon />}
              endIcon={<SparkleIcon sx={{ fontSize: 18 }} />}
              variant="contained"
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                px: 3,
                py: 1.5,
                borderRadius: 25,
                textTransform: 'none',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: currentPage === 'loom' 
                  ? '0 0 30px rgba(102, 126, 234, 0.6)' 
                  : '0 0 20px rgba(102, 126, 234, 0.4)',
                transform: currentPage === 'loom' ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                
                // Glowing animation
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  transition: 'left 0.8s',
                },
                
                '&:hover': {
                  transform: 'scale(1.08)',
                  boxShadow: '0 0 35px rgba(102, 126, 234, 0.8)',
                  '&:before': {
                    left: '100%'
                  }
                },
                
                '&:active': {
                  transform: 'scale(1.02)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
                  Loom AI
                </Typography>
                <Chip
                  label="NEW"
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 18,
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
              </Box>
            </Button>
            
            {/* Pulsing Glow Effect */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '120%',
                height: '120%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(102, 126, 234, 0.2) 0%, transparent 70%)',
                animation: 'pulse 2s infinite',
                zIndex: -1,
                '@keyframes pulse': {
                  '0%': {
                    transform: 'translate(-50%, -50%) scale(1)',
                    opacity: 1
                  },
                  '50%': {
                    transform: 'translate(-50%, -50%) scale(1.2)',
                    opacity: 0.5
                  },
                  '100%': {
                    transform: 'translate(-50%, -50%) scale(1)',
                    opacity: 1
                  }
                }
              }}
            />
          </Box>
        </Box>

        {/* Actions Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                sx={{ borderRadius: 2 }}
              >
                Login
              </Button>
              <Button
                onClick={() => onPageChange('signup')}
                startIcon={<SignupIcon />}
                variant="contained"
                size="small"
                sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                }}
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
