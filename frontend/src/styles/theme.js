import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#2E7D32' },
    secondary: { main: '#FF6B35' },
    background: { default: '#F8F9FA', paper: '#FFFFFF' }
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif'
  }
});
export default theme;
