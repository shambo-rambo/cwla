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
import { Brightness4, Brightness7, AdminPanelSettings, Email, LinkedIn } from '@mui/icons-material';
import Chatbot from './Chatbot';

const LearningCycleContent = ({ user, onLogout, darkMode, toggleDarkMode, onShowAdmin }) => {
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
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img 
              src="/logo.png" 
              alt="Teaching Cycle AI Logo" 
              style={{ 
                height: '60px', 
                width: 'auto'
              }} 
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user?.email === 'simon.hamblin@gmail.com' && (
              <IconButton onClick={onShowAdmin} color="inherit" title="Admin Dashboard">
                <AdminPanelSettings />
              </IconButton>
            )}
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

      <Container maxWidth="lg" sx={{ 
        py: 1, 
        height: 'calc(100vh - 200px)', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center'
      }}>

        <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h2" component="h2" sx={{ 
                mb: 1, 
                color: 'text.primary',
                background: 'linear-gradient(135deg, #49a2d4, #6bb6e0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2,
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}>
                The Teaching & Learning Cycle
              </Typography>
              <Typography variant="h4" component="p" sx={{ 
                mb: 4, 
                color: 'text.secondary',
                fontWeight: 400,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}>
                AI Assistant
              </Typography>
            </Box>
            
            <Grid container spacing={3} justifyContent="center" sx={{ maxWidth: '100%', mx: 'auto' }}>
              <Grid size={6}>
                <Card sx={{
                  height: '160px',
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
                  height: '160px',
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
          user={user}
          onClose={() => setActiveChatbot(null)}
        />
      )}

      {activeChatbot === 'lesson' && (
        <Chatbot
          type="lesson"
          title="Lesson Plan Creator"
          description="Create detailed lesson plans using the 4-stage Teaching and Learning Cycle"
          user={user}
          onClose={() => setActiveChatbot(null)}
        />
      )}

      {/* Footer Bio */}
      <Box sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        py: 3,
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
        backdropFilter: 'blur(15px)',
        borderTop: '1px solid rgba(73, 162, 212, 0.2)',
        zIndex: 1000,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #49a2d4, transparent)',
        }
      }}>
        <Container maxWidth="md">
          <Box sx={{ 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <Typography variant="h6" sx={{ 
              color: '#49a2d4',
              fontWeight: 600,
              fontSize: '1.1rem',
              mb: 1
            }}>
              About the Developer
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: 1.6,
              fontSize: '0.95rem',
              maxWidth: '600px'
            }}>
              Hi, I'm Simon, a History teacher and full stack web developer with over 15 years experience in education. 
              I created this AI assistant to help teachers design better lessons using proven pedagogical frameworks.
            </Typography>
            <Box sx={{
              mt: 3,
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Button
                component="a"
                href="mailto:simon.hamblin@gmail.com"
                variant="outlined"
                startIcon={<Email sx={{ fontSize: '1.2rem' }} />}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderColor: 'rgba(73, 162, 212, 0.5)',
                  color: '#6bb6e0',
                  background: 'rgba(73, 162, 212, 0.1)',
                  backdropFilter: 'blur(5px)',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  minWidth: '140px',
                  '&:hover': {
                    borderColor: '#49a2d4',
                    background: 'rgba(73, 162, 212, 0.2)',
                    color: '#49a2d4',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(73, 162, 212, 0.4)',
                    '& .MuiSvgIcon-root': {
                      transform: 'scale(1.1)'
                    }
                  },
                  transition: 'all 0.3s ease',
                  '& .MuiSvgIcon-root': {
                    transition: 'transform 0.3s ease'
                  }
                }}
              >
                EMAIL
              </Button>
              <Button
                component="a"
                href="https://www.linkedin.com/in/simon-hamblin-2b931398/"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                startIcon={<LinkedIn sx={{ fontSize: '1.2rem' }} />}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderColor: 'rgba(73, 162, 212, 0.5)',
                  color: '#6bb6e0',
                  background: 'rgba(73, 162, 212, 0.1)',
                  backdropFilter: 'blur(5px)',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  minWidth: '140px',
                  '&:hover': {
                    borderColor: '#49a2d4',
                    background: 'rgba(73, 162, 212, 0.2)',
                    color: '#49a2d4',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(73, 162, 212, 0.4)',
                    '& .MuiSvgIcon-root': {
                      transform: 'scale(1.1)'
                    }
                  },
                  transition: 'all 0.3s ease',
                  '& .MuiSvgIcon-root': {
                    transition: 'transform 0.3s ease'
                  }
                }}
              >
                LINKEDIN
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LearningCycleContent;