import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Container, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import theme from './styles/theme';
import Header from './components/Layout/Header';
import SymptomForm from './components/SymptomForm/SymptomForm';
import ChatBot from './components/ChatBot/ChatBot';
import './i18n/i18n';

function App() {
  const [triageResult, setTriageResult] = useState(null);
  const { i18n } = useTranslation();

  const handleTriageResult = (result) => {
    setTriageResult(result);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Header />
        
        <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          <Box 
            sx={{ 
              direction: i18n.language === 'ar' ? 'rtl' : 'ltr',
              textAlign: i18n.language === 'ar' ? 'right' : 'left'
            }}
          >
            <SymptomForm onTriageResult={handleTriageResult} />
            <ChatBot triageResult={triageResult} />
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
