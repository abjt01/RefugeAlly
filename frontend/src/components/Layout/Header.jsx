import React from 'react';
import { AppBar, Toolbar, Typography, Box, Container } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LanguageSelector from '../Common/LanguageSelector';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();
  return (
    <AppBar position="static" elevation={2}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MedicalServicesIcon />
            <Box>
              <Typography variant="h6">{t('app.title')}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {t('app.subtitle')}
              </Typography>
            </Box>
          </Box>
          <LanguageSelector />
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default Header;
