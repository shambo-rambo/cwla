import { useState, useEffect } from 'react'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider } from './firebase'
import LearningCycleContent from './components/LearningCycleContent'
import AdminDashboard from './components/AdminDashboard'
import { ThemeProvider, CssBaseline, Box, Typography, Card, Button } from '@mui/material'
import { createAppTheme } from './theme'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [backendMessage, setBackendMessage] = useState('Loading...')
  const [error, setError] = useState(null)
  const [darkMode, setDarkMode] = useState(true)
  const [showAdmin, setShowAdmin] = useState(false)
  
  const theme = createAppTheme(darkMode ? 'dark' : 'light')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    const fetchBackendMessage = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/`)
        const data = await response.json()
        setBackendMessage(data.message)
      } catch (err) {
        setError('Failed to connect to backend')
        console.error('Error:', err)
      }
    }

    fetchBackendMessage()

    return () => unsubscribe()
  }, [])

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontFamily: 'Arial, sans-serif',
          fontSize: '24px'
        }}>
          Loading...
        </div>
      </ThemeProvider>
    )
  }

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1f2937 50%, #111827 100%)',
          gap: 3,
          px: 2
        }}>
          <Typography 
            variant="h1" 
            sx={{ 
              background: 'linear-gradient(135deg, #49a2d4, #6bb6e0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2.5rem', md: '3rem' },
              textAlign: 'center',
              mb: 2
            }}
          >
            Teaching Cycle AI
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'text.secondary',
              textAlign: 'center',
              maxWidth: '500px',
              mb: 2
            }}
          >
            Transform your teaching with AI-powered lesson planning and framework analysis
          </Typography>
          <Card sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: error ? 'error.main' : 'primary.main',
                textAlign: 'center'
              }}
            >
              Backend: {error || backendMessage}
            </Typography>
          </Card>
          <Button
            onClick={handleGoogleLogin}
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 2,
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #49a2d4, #3b82c7)',
              border: '1px solid #49a2d4',
              '&:hover': {
                background: 'linear-gradient(135deg, #3b82c7, #2563eb)',
                boxShadow: '0 8px 24px rgba(73, 162, 212, 0.4)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Sign in with Google
          </Button>
        </Box>
      </ThemeProvider>
    )
  }

  if (showAdmin) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AdminDashboard 
          user={user}
          onBack={() => setShowAdmin(false)}
        />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LearningCycleContent 
        user={user} 
        onLogout={handleLogout}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        onShowAdmin={() => setShowAdmin(true)}
      />
    </ThemeProvider>
  )
}

export default App