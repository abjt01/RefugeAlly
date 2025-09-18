import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Container, Box } from '@mui/material';
import theme from './styles/theme';
import Header from './components/Layout/Header';
import SymptomForm from './components/SymptomForm/SymptomForm';
import ChatBot from './components/ChatBot/ChatBot';
import './i18n/i18n';

function App() {
  const [triageResult, setTriageResult] = useState(null);
  const handleTriageResult = result => setTriageResult(result);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <SymptomForm onTriageResult={handleTriageResult} />
          <ChatBot triageResult={triageResult} />
        </Container>
      </Box>
    </ThemeProvider>
  );
}
export default App;
