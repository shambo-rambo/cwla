import { createTheme } from '@mui/material/styles';

export const createAppTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#49a2d4',
      dark: '#3b82c7',
      light: '#6bb6e0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6b7280',
      dark: '#4b5563',
      light: '#9ca3af',
      contrastText: '#ffffff',
    },
    ...(mode === 'dark' ? {
      background: {
        default: '#0a0a0a',
        paper: '#1a1a1a',
      },
      text: {
        primary: '#ffffff',
        secondary: '#9ca3af',
      },
      divider: '#374151',
      grey: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      },
    } : {
      background: {
        default: '#f8fafc',
        paper: '#ffffff',
      },
      text: {
        primary: '#1e293b',
        secondary: '#64748b',
      },
      divider: '#e2e8f0',
    }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 'bold',
      fontSize: '2rem',
    },
    h2: {
      fontWeight: 'bold',
      fontSize: '3rem',
    },
    h3: {
      fontWeight: 'bold',
      fontSize: '2rem',
    },
    h4: {
      fontWeight: 'bold',
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 'bold',
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 'bold',
      fontSize: '1.1rem',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          background: mode === 'dark' 
            ? 'linear-gradient(145deg, #1f2937, #111827)'
            : theme.palette.background.paper,
          borderRadius: '8px',
          boxShadow: mode === 'dark' 
            ? '0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' 
            : '0 2px 8px rgba(0,0,0,0.08)',
          border: mode === 'dark' ? '1px solid rgba(55, 65, 81, 0.3)' : 'none',
          transition: 'all 0.3s ease',
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
          transition: 'all 0.2s ease',
        },
        contained: ({ theme, ownerState }) => ({
          ...(ownerState.color === 'primary' && mode === 'dark' && {
            background: 'linear-gradient(135deg, #49a2d4, #3b82c7)',
            border: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #3b82c7, #2563eb)',
              boxShadow: '0 4px 16px rgba(73, 162, 212, 0.3)',
            },
          }),
          ...(ownerState.color === 'secondary' && mode === 'dark' && {
            background: 'linear-gradient(135deg, #4b5563, #374151)',
            border: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #374151, #1f2937)',
              boxShadow: '0 4px 16px rgba(73, 162, 212, 0.2)',
            },
          }),
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          background: mode === 'dark' 
            ? 'linear-gradient(180deg, #1f2937, #111827)'
            : theme.palette.background.paper,
          borderBottom: mode === 'dark' ? '1px solid rgba(55, 65, 81, 0.2)' : '1px solid #e2e8f0',
          boxShadow: mode === 'dark' 
            ? '0 2px 8px rgba(0,0,0,0.3)' 
            : '0 1px 4px rgba(0,0,0,0.1)',
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          background: mode === 'dark' 
            ? 'linear-gradient(145deg, #1f2937, #111827)'
            : theme.palette.background.paper,
          border: mode === 'dark' ? '1px solid rgba(55, 65, 81, 0.2)' : 'none',
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          ...(ownerState.color === 'primary' && mode === 'dark' && {
            background: 'linear-gradient(135deg, #49a2d4, #3b82c7)',
            border: 'none',
          }),
        }),
      },
    },
  },
});