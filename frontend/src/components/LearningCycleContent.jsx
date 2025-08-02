import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  Avatar,
  IconButton,
  Chip,
  Container,
  Grid,
  useTheme,
  Fade,
  Grow,
  Slide
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import Chatbot from './Chatbot';

const LearningCycleContent = ({ user, onLogout, darkMode, toggleDarkMode }) => {
  const theme = useTheme();
  const [activeChatbot, setActiveChatbot] = useState(null);

  // Check for URL parameters to auto-open chatbots
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const openParam = urlParams.get('open');
    
    if (openParam === 'lesson-planner') {
      setActiveChatbot('lesson');
      // Clean up URL after opening
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (openParam === 'framework') {
      setActiveChatbot('framework');
      // Clean up URL after opening
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography variant="h1" component="h1" sx={{ flexGrow: 1, color: 'primary.main' }}>
            Teaching Cycle AI
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            <Avatar 
              src={user.photoURL} 
              alt="Profile"
              sx={{ 
                width: 40, 
                height: 40, 
                border: 2, 
                borderColor: 'primary.main' 
              }}
            />
            <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
              {user.displayName}
            </Typography>
            <Button 
              variant="contained"
              color="primary"
              onClick={onLogout}
              size="small"
            >
              Sign Out
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 2 }}>

        <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h2" component="h2" sx={{ 
              mb: 6, 
              color: 'text.primary',
              background: 'linear-gradient(135deg, #49a2d4, #6bb6e0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              The Teaching & Learning Cycle AI Assistant
            </Typography>
            
            <Grid container spacing={3} justifyContent="center" sx={{ maxWidth: '100%', mx: 'auto' }}>
              <Grid size={6}>
                <Card sx={{
                  height: '200px',
                  background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' 
                    : 'linear-gradient(135deg, #1e1e1e 0%, #3a3a3a 100%)',
                  borderRadius: 4,
                  border: theme.palette.mode === 'dark' 
                    ? '1px solid rgba(73, 162, 212, 0.3)' 
                    : '1px solid rgba(73, 162, 212, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 60px rgba(73, 162, 212, 0.3)',
                    border: '1px solid rgba(73, 162, 212, 0.6)',
                  },
                }}
                onClick={() => setActiveChatbot('framework')}
                >
                  <CardContent sx={{ 
                    p: 2, 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <Typography variant="h5" sx={{ 
                      mb: 1, 
                      color: '#49a2d4',
                      fontWeight: 600
                    }}>
Framework Analysis
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)',
                      lineHeight: 1.5,
                      mb: 2,
                      fontSize: '0.9rem'
                    }}>
                      Get expert advice on teaching strategies, pedagogical approaches, and educational frameworks
                    </Typography>
                    <Box sx={{
                      width: '60px',
                      height: '3px',
                      background: 'linear-gradient(90deg, #49a2d4, #6bb6e0)',
                      borderRadius: '2px'
                    }} />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid size={6}>
                <Card sx={{
                  height: '200px',
                  background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' 
                    : 'linear-gradient(135deg, #1e1e1e 0%, #3a3a3a 100%)',
                  borderRadius: 4,
                  border: theme.palette.mode === 'dark' 
                    ? '1px solid rgba(73, 162, 212, 0.3)' 
                    : '1px solid rgba(73, 162, 212, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 60px rgba(73, 162, 212, 0.3)',
                    border: '1px solid rgba(73, 162, 212, 0.6)',
                  },
                }}
                onClick={() => setActiveChatbot('lesson')}
                >
                  <CardContent sx={{ 
                    p: 2, 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <Typography variant="h5" sx={{ 
                      mb: 1, 
                      color: '#49a2d4',
                      fontWeight: 600
                    }}>
Lesson Planner
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)',
                      lineHeight: 1.5,
                      mb: 2,
                      fontSize: '0.9rem'
                    }}>
                      Create detailed lesson plans using the 4-stage Teaching and Learning Cycle
                    </Typography>
                    <Box sx={{
                      width: '60px',
                      height: '3px',
                      background: 'linear-gradient(90deg, #49a2d4, #6bb6e0)',
                      borderRadius: '2px'
                    }} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Container>

      {/* Chatbot Modals */}
      {activeChatbot === 'framework' && (
        <Chatbot
          type="framework"
          title="Framework Analysis Assistant"
          description="Get expert advice on teaching strategies, pedagogical approaches, and educational frameworks"
          onClose={() => setActiveChatbot(null)}
        />
      )}

      {activeChatbot === 'lesson' && (
        <Chatbot
          type="lesson"
          title="Lesson Plan Creator"
          description="Create detailed lesson plans using the 5-stage Teaching and Learning Cycle"
          onClose={() => setActiveChatbot(null)}
        />
      )}
    </Box>
  );
};

export default LearningCycleContent;