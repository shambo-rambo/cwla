import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Send } from '@mui/icons-material';

const ChatInput = ({ 
  inputMessage, 
  setInputMessage, 
  onSendMessage, 
  isLoading, 
  isLimitReached, 
  type, 
  hasActiveInteractiveOptions 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const inputRef = useRef(null);

  // Keyboard detection and handling
  useEffect(() => {
    if (!isMobile) return;

    let initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const currentHeight = window.visualViewport.height;
        const heightDiff = initialViewportHeight - currentHeight;
        
        if (heightDiff > 150) { // Keyboard is likely visible
          setIsKeyboardVisible(true);
          setKeyboardHeight(heightDiff);
        } else {
          setIsKeyboardVisible(false);
          setKeyboardHeight(0);
        }
      }
    };

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDiff = initialViewportHeight - currentHeight;
      
      if (heightDiff > 150) { // Keyboard is likely visible
        setIsKeyboardVisible(true);
        setKeyboardHeight(heightDiff);
      } else {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    };

    // Use visualViewport if available (modern browsers)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [isMobile]);

  // Focus management
  const handleFocus = () => {
    if (isMobile && inputRef.current) {
      // Scroll input into view with some delay
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  

  return (
    <Box 
      sx={{ 
        p: { xs: 0.75, sm: 1.5 }, 
        borderTop: 1, 
        borderColor: 'divider', 
        display: 'flex', 
        alignItems: 'flex-end',
        gap: { xs: 0.75, sm: 1 },
        flexShrink: 0,
        minHeight: { xs: '60px', sm: 'auto' },
        // Mobile safe area support
        paddingBottom: { 
          xs: `max(0.75rem, env(safe-area-inset-bottom))`, 
          sm: 1.5 
        },
        paddingLeft: { 
          xs: 'max(0.75rem, env(safe-area-inset-left))', 
          sm: 1.5 
        },
        paddingRight: { 
          xs: 'max(0.75rem, env(safe-area-inset-right))', 
          sm: 1.5 
        },
        // Adjust position when keyboard is visible
        ...(isMobile && isKeyboardVisible && {
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'background.paper',
          zIndex: 1300,
          borderTop: 1,
          borderColor: 'divider',
          boxShadow: 3
        })
      }}
    >
      <TextField
        ref={inputRef}
        fullWidth
        multiline
        maxRows={isMobile ? 3 : 4}
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        onFocus={handleFocus}
        placeholder={type === 'framework' 
          ? 'Type your question...'
          : 'Message'
        }
        disabled={isLoading || isLimitReached}
        variant="outlined"
        size="small"
        sx={{
          '& .MuiInputBase-root': {
            fontSize: { xs: '16px', sm: '1rem' }, // 16px prevents zoom on iOS
            paddingRight: '12px',
            paddingTop: { xs: '12px', sm: '8px' },
            paddingBottom: { xs: '12px', sm: '8px' },
            minHeight: { xs: '48px', sm: 'auto' }, // Larger touch target
            lineHeight: 1.5
          },
          '& .MuiInputBase-input': {
            padding: { xs: '8px 12px', sm: '6px 8px' }
          },
          '& .MuiOutlinedInput-root': {
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
              borderWidth: 2,
            }
          }
        }}
      />
      
      <IconButton
        onClick={onSendMessage}
        disabled={isLoading || !inputMessage.trim() || isLimitReached}
        sx={{ 
          bgcolor: 'primary.main',
          color: 'white',
          width: { xs: 48, sm: 44 },
          height: { xs: 48, sm: 44 },
          minWidth: { xs: 48, sm: 44 },
          flexShrink: 0,
          '&:hover': {
            bgcolor: 'primary.dark'
          },
          '&:disabled': {
            bgcolor: 'action.disabled',
            color: 'action.disabled'
          },
          // Larger touch target for mobile
          '&:before': isMobile ? {
            content: '""',
            position: 'absolute',
            top: -4,
            left: -4,
            right: -4,
            bottom: -4,
            borderRadius: '50%'
          } : {}
        }}
      >
        <Send sx={{ fontSize: { xs: '1.25rem', sm: '1.2rem' } }} />
      </IconButton>
    </Box>
  );
};

export default ChatInput;