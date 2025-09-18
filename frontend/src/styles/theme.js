import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
      light: '#818cf8', 
      dark: '#4f46e5',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#06b6d4',
      light: '#22d3ee',
      dark: '#0891b2'
    },
    success: {
      main: '#10b981',
      light: '#a7f3d0',
      dark: '#059669'
    },
    warning: {
      main: '#f59e0b',
      light: '#fde68a',
      dark: '#d97706'
    },
    error: {
      main: '#ef4444',
      light: '#fecaca',
      dark: '#dc2626'
    },
    info: {
      main: '#3b82f6',
      light: '#bfdbfe',
      dark: '#2563eb'
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b'
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      900: '#0f172a'
    }
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h3: {
      fontWeight: 800,
      lineHeight: 1.2
    },
    h4: {
      fontWeight: 700,
      lineHeight: 1.3
    },
    h5: {
      fontWeight: 600,
      lineHeight: 1.4
    },
    h6: {
      fontWeight: 600,
      lineHeight: 1.4
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          transition: 'all 0.2s ease-in-out'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500
        }
      }
    }
  }
});

export default theme;
