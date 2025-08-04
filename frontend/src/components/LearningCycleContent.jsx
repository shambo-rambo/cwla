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
  Slide,
  Zoom
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
    <Box sx={{ height: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AppBar position="static" elevation={2} sx={{ flexShrink: 0 }}>
        <Toolbar sx={{ px: { xs: 1, sm: 2 }, minHeight: { xs: '56px', sm: '64px' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box
              component="img"
              src="/logo.png" 
              alt="Teaching Cycle AI Logo" 
              sx={{ 
                height: { xs: '45px', sm: '60px' }, 
                width: 'auto'
              }} 
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
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
                width: { xs: 32, sm: 40 }, 
                height: { xs: 32, sm: 40 }, 
                border: 2, 
                borderColor: 'primary.main' 
              }}
            />
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 500, 
                color: 'text.primary',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {user.displayName}
            </Typography>
            <Button 
              variant="contained"
              color="primary"
              onClick={onLogout}
              size="small"
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.5, sm: 1 }
              }}
            >
              {/* Show only "Sign Out" on mobile, full text on desktop */}
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Sign Out</Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Out</Box>
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main content area - perfectly centered */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 3 }
      }}>
        <Container maxWidth="lg" sx={{ 
          width: '100%',
          py: { xs: 2, sm: 3, md: 4 }
        }}>

        <Fade in timeout={{ enter: 800, exit: 300 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h2" component="h1" sx={{ 
                mb: { xs: 0.3, md: 0.6 }, 
                color: 'text.primary',
                background: 'linear-gradient(135deg, #49a2d4, #6bb6e0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: { xs: 1.1, md: 1.2 },
                fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3.5rem' },
                fontWeight: 700
              }}>
                The Teaching & Learning Cycle
              </Typography>
              <Typography variant="h4" component="p" sx={{ 
                mb: { xs: 2, sm: 3, md: 4 }, 
                mt: { xs: 1, sm: 1.5, md: 2 },
                color: 'text.secondary',
                fontWeight: 300,
                fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2rem' },
                lineHeight: 1.3
              }}>
                AI Assistant
              </Typography>
            </Box>
            
            <Grid container spacing={{ xs: 3, sm: 4, md: 5 }} justifyContent="center" sx={{ maxWidth: '100%', mx: 'auto', mt: { xs: 1, sm: 2, md: 3 } }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Zoom in timeout={{ enter: 600, exit: 300 }} style={{ transitionDelay: '200ms' }}>
                  <Card sx={{
                  height: { xs: '140px', sm: '160px' },
                  background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' 
                    : 'linear-gradient(135deg, #1e1e1e 0%, #3a3a3a 100%)',
                  borderRadius: { xs: 3, sm: 4 },
                  border: theme.palette.mode === 'dark' 
                    ? '1px solid rgba(73, 162, 212, 0.3)' 
                    : '1px solid rgba(73, 162, 212, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: { xs: 'translateY(-4px)', sm: 'translateY(-8px)' },
                    boxShadow: { xs: '0 8px 25px rgba(73, 162, 212, 0.25)', sm: '0 20px 60px rgba(73, 162, 212, 0.3)' },
                    border: '1px solid rgba(73, 162, 212, 0.6)',
                  },
                  '&:active': {
                    transform: 'translateY(-2px)',
                    transition: 'all 0.1s ease'
                  },
                  // Enhanced touch feedback for mobile
                  '@media (hover: none)': {
                    '&:active': {
                      transform: 'scale(0.98) translateY(-1px)',
                      transition: 'all 0.1s ease'
                    }
                  }
                }}
                onClick={() => setActiveChatbot('framework')}
                >
                  <CardContent sx={{ 
                    p: { xs: 1.5, sm: 2 }, 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <Typography variant="h5" sx={{ 
                      mb: { xs: 1, sm: 1.5 }, 
                      color: '#49a2d4',
                      fontWeight: 600,
                      fontSize: { xs: '1.1rem', sm: '1.25rem' },
                      lineHeight: 1.2
                    }}>
TLC Explainer
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)',
                      lineHeight: 1.4,
                      mb: { xs: 1, sm: 2 },
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      display: { xs: 'none', sm: 'block' }
                    }}>
                      Learn about the Teaching and Learning Cycle
                    </Typography>
                    <Box sx={{
                      width: '60px',
                      height: '3px',
                      background: 'linear-gradient(90deg, #49a2d4, #6bb6e0)',
                      borderRadius: '2px',
                      mt: { xs: 1.5, sm: 2 }
                    }} />
                  </CardContent>
                  </Card>
                </Zoom>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Zoom in timeout={{ enter: 600, exit: 300 }} style={{ transitionDelay: '400ms' }}>
                  <Card sx={{
                  height: { xs: '140px', sm: '160px' },
                  background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' 
                    : 'linear-gradient(135deg, #1e1e1e 0%, #3a3a3a 100%)',
                  borderRadius: { xs: 3, sm: 4 },
                  border: theme.palette.mode === 'dark' 
                    ? '1px solid rgba(73, 162, 212, 0.3)' 
                    : '1px solid rgba(73, 162, 212, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: { xs: 'translateY(-4px)', sm: 'translateY(-8px)' },
                    boxShadow: { xs: '0 8px 25px rgba(73, 162, 212, 0.25)', sm: '0 20px 60px rgba(73, 162, 212, 0.3)' },
                    border: '1px solid rgba(73, 162, 212, 0.6)',
                  },
                  '&:active': {
                    transform: 'translateY(-2px)',
                    transition: 'all 0.1s ease'
                  },
                  // Enhanced touch feedback for mobile
                  '@media (hover: none)': {
                    '&:active': {
                      transform: 'scale(0.98) translateY(-1px)',
                      transition: 'all 0.1s ease'
                    }
                  }
                }}
                onClick={() => setActiveChatbot('lesson')}
                >
                  <CardContent sx={{ 
                    p: { xs: 1.5, sm: 2 }, 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <Typography variant="h5" sx={{ 
                      mb: { xs: 0.5, sm: 1 }, 
                      color: '#49a2d4',
                      fontWeight: 600,
                      fontSize: { xs: '1.1rem', sm: '1.25rem' },
                      lineHeight: 1.2
                    }}>
Lesson Planner
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)',
                      lineHeight: 1.4,
                      mb: { xs: 1, sm: 2 },
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      display: { xs: 'none', sm: 'block' }
                    }}>
                      Create detailed lesson plans using the Teaching and Learning Cycle
                    </Typography>
                    <Box sx={{
                      width: '60px',
                      height: '3px',
                      background: 'linear-gradient(90deg, #49a2d4, #6bb6e0)',
                      borderRadius: '2px',
                      mt: { xs: 1.5, sm: 2 }
                    }} />
                  </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            </Grid>
          </Box>
        </Fade>
        </Container>
      </Box>

      {/* Chatbot Modals */}
      {activeChatbot === 'framework' && (
        <Chatbot
          type="framework"
          title="Framework Assistant"
          description="Learn about The Teaching and Learning Cycle, including its stages and how to implement it effectively."
          user={user}
          onClose={() => setActiveChatbot(null)}
        />
      )}

      {activeChatbot === 'lesson' && (
        <Chatbot
          type="lesson"
          title="Lesson Plan Creator"
          description="Create detailed lesson plans using the Teaching and Learning Cycle"
          user={user}
          onClose={() => setActiveChatbot(null)}
        />
      )}

      {/* Footer Bio - Fixed height at bottom */}
      <Box sx={{
        flexShrink: 0,
        py: { xs: 1, sm: 1.5 },
        px: { xs: 1, sm: 2 },
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
        backdropFilter: 'blur(15px)',
        borderTop: '1px solid rgba(73, 162, 212, 0.2)',
        zIndex: activeChatbot ? -1 : 1000,
        opacity: activeChatbot ? 0 : 1,
        transform: activeChatbot ? 'translateY(100%)' : 'translateY(0)',
        transition: 'all 0.3s ease-in-out',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: '60px', sm: '100px' },
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
            gap: { xs: 1, sm: 1.5 }
          }}>
            <Typography variant="h6" sx={{ 
              color: '#49a2d4',
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              mb: { xs: 0.3, sm: 0.5 }
            }}>
              About the Developer
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: { xs: 1.4, sm: 1.6 },
              fontSize: { xs: '0.85rem', sm: '0.95rem' },
              maxWidth: '600px',
              px: { xs: 1, sm: 0 }
            }}>
              Hi, I'm Simon, a History teacher and full stack web developer with over 15 years experience in education. 
              I created this AI assistant to help teachers design better lessons using proven pedagogical frameworks.
            </Typography>
            <Box sx={{
              mt: { xs: 1, sm: 1.5 },
              display: 'flex',
              gap: { xs: 1, sm: 2 },
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: '100%', sm: 'auto' }
            }}>
              <Button
                component="a"
                href="mailto:simon.hamblin@gmail.com"
                variant="outlined"
                startIcon={<Email sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />}
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1, sm: 1.5 },
                  borderColor: 'rgba(73, 162, 212, 0.5)',
                  color: '#6bb6e0',
                  background: 'rgba(73, 162, 212, 0.1)',
                  backdropFilter: 'blur(5px)',
                  borderRadius: { xs: '8px', sm: '12px' },
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  fontWeight: 600,
                  minWidth: { xs: '120px', sm: '140px' },
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    borderColor: '#49a2d4',
                    background: 'rgba(73, 162, 212, 0.2)',
                    color: '#49a2d4',
                    transform: { xs: 'translateY(-1px)', sm: 'translateY(-2px)' },
                    boxShadow: { xs: '0 4px 15px rgba(73, 162, 212, 0.3)', sm: '0 6px 20px rgba(73, 162, 212, 0.4)' },
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
                startIcon={<LinkedIn sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />}
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1, sm: 1.5 },
                  borderColor: 'rgba(73, 162, 212, 0.5)',
                  color: '#6bb6e0',
                  background: 'rgba(73, 162, 212, 0.1)',
                  backdropFilter: 'blur(5px)',
                  borderRadius: { xs: '8px', sm: '12px' },
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  fontWeight: 600,
                  minWidth: { xs: '120px', sm: '140px' },
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    borderColor: '#49a2d4',
                    background: 'rgba(73, 162, 212, 0.2)',
                    color: '#49a2d4',
                    transform: { xs: 'translateY(-1px)', sm: 'translateY(-2px)' },
                    boxShadow: { xs: '0 4px 15px rgba(73, 162, 212, 0.3)', sm: '0 6px 20px rgba(73, 162, 212, 0.4)' },
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