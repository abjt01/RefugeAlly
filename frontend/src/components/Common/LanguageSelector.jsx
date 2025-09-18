import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, MenuItem, FormControl, Box } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'dari', name: 'دری', flag: '🇦🇫' }
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LanguageIcon color="primary" />
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select value={i18n.language}
          onChange={e => i18n.changeLanguage(e.target.value)}>
          {languages.map(lang => (
            <MenuItem key={lang.code} value={lang.code}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
export default LanguageSelector;
