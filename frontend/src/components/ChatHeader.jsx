import React from 'react';
import {
  Box,
  Typography,
  DialogTitle,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Close, Fullscreen, FullscreenExit, History } from '@mui/icons-material';

const ChatHeader = ({ 
  title, 
  description, 
  isFullscreen, 
  setIsFullscreen, 
  setShowSidebar, 
  showSidebar, 
  onClose 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <DialogTitle 
      sx={{ 
        p: { xs: 0.75, sm: 2 }, 
        borderBottom: 1, 
        borderColor: 'divider', 
        flexShrink: 0, 
        minHeight: { xs: '56px', sm: 'auto' },
        // Mobile safe area support
        paddingTop: { 
          xs: 'max(0.75rem, env(safe-area-inset-top))', 
          sm: 2 
        },
        paddingLeft: { 
          xs: 'max(0.75rem, env(safe-area-inset-left))', 
          sm: 2 
        },
        paddingRight: { 
          xs: 'max(0.75rem, env(safe-area-inset-right))', 
          sm: 2 
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        height: '100%',
        minHeight: { xs: '40px', sm: 'auto' }
      }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="h4" 
            component="h3" 
            sx={{ 
              color: 'primary.main', 
              mb: { xs: 0, sm: 0.5 },
              fontSize: { xs: '1.1rem', sm: '2rem' },
              fontWeight: 600,
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              display: { xs: 'none', sm: 'block' },
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {description}
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 0.25, sm: 0.5 },
          alignItems: 'center'
        }}>
          <IconButton
            onClick={() => setShowSidebar(!showSidebar)}
            size="small"
            title="Conversation History"
            sx={{ 
              p: { xs: 0.5, sm: 1 },
              minWidth: { xs: 40, sm: 'auto' },
              width: { xs: 40, sm: 'auto' },
              height: { xs: 40, sm: 'auto' },
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
            <History sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
          </IconButton>
          
          {!isMobile && (
            <IconButton
              onClick={() => setIsFullscreen(!isFullscreen)}
              size="small"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              sx={{ 
                p: { xs: 0.5, sm: 1 },
                minWidth: { xs: 40, sm: 'auto' },
                width: { xs: 40, sm: 'auto' },
                height: { xs: 40, sm: 'auto' }
              }}
            >
              {isFullscreen ? 
                <FullscreenExit sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} /> : 
                <Fullscreen sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
              }
            </IconButton>
          )}
          
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{ 
              p: { xs: 0.5, sm: 1 },
              minWidth: { xs: 40, sm: 'auto' },
              width: { xs: 40, sm: 'auto' },
              height: { xs: 40, sm: 'auto' },
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
            <Close sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
          </IconButton>
        </Box>
      </Box>
    </DialogTitle>
  );
};

export default ChatHeader;