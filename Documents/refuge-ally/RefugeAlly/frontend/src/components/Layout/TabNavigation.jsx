import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Psychology as TriageIcon,
  Person as ProfileIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 0, label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 1, label: 'Health Check', icon: <TriageIcon /> },
    { id: 2, label: 'Analytics', icon: <AnalyticsIcon /> },
    { id: 3, label: 'Profile', icon: <ProfileIcon /> }
  ];

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs 
        value={activeTab} 
        onChange={onTabChange}
        variant="fullWidth"
        sx={{
          '& .MuiTabs-indicator': {
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            height: 3,
            borderRadius: '3px 3px 0 0'
          }
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            iconPosition="start"
            sx={{
              flexDirection: 'row',
              gap: 1,
              minHeight: 60,
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 600
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default TabNavigation;
