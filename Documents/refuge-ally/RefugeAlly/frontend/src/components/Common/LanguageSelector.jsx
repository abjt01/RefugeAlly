// src/components/Common/LanguageSelector.jsx - FIXED VERSION
import React from 'react';
import { Select, MenuItem, FormControl, Box } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'dari', name: 'دری', flag: '🇦🇫' }
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  // Fallback if i18n is not initialized
  const currentLanguage = i18n.language || 'en';

  return (
    <FormControl size="small">
      <Select
        value={currentLanguage}
        onChange={handleLanguageChange}
        variant="outlined"
        sx={{
          backgroundColor: 'rgba(148, 163, 184, 0.1)',
          borderRadius: 2,
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none'
          },
          '&:hover': {
            backgroundColor: 'rgba(148, 163, 184, 0.2)'
          }
        }}
        renderValue={(value) => {
          const lang = languages.find(l => l.code === value) || languages[0];
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>{lang.flag}</span>
              <LanguageIcon fontSize="small" />
            </Box>
          );
        }}
      >
        {languages.map((lang) => (
          <MenuItem key={lang.code} value={lang.code}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: '1.2em' }}>{lang.flag}</span>
              <span>{lang.name}</span>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;