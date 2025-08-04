import React from 'react';
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

const ConversationSidebar = ({ 
  showSidebar, 
  setShowSidebar, 
  conversations, 
  currentConversationId, 
  loadConversation, 
  deleteConversation, 
  startNewConversation 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Drawer
      anchor="left"
      open={showSidebar}
      onClose={() => setShowSidebar(false)}
      variant="temporary"
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '85vw', sm: 300 },
          maxWidth: 350,
          position: 'absolute',
          height: '100%',
          bgcolor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
          // Mobile safe area support
          paddingTop: { 
            xs: 'env(safe-area-inset-top)', 
            sm: 0 
          },
          paddingLeft: { 
            xs: 'env(safe-area-inset-left)', 
            sm: 0 
          }
        }
      }}
      ModalProps={{
        container: document.querySelector('[role="dialog"]'),
        style: { position: 'absolute' }
      }}
    >
      <Box sx={{ 
        p: { xs: 1.5, sm: 2 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          minHeight: { xs: 44, sm: 'auto' }
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              fontWeight: 600
            }}
          >
            Conversations
          </Typography>
          <IconButton 
            onClick={startNewConversation} 
            size="small" 
            title="New Conversation"
            sx={{
              width: { xs: 40, sm: 'auto' },
              height: { xs: 40, sm: 'auto' },
              // Larger touch target for mobile
              ...(isMobile && {
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: -4,
                  left: -4,
                  right: -4,
                  bottom: -4,
                  borderRadius: '50%'
                }
              })
            }}
          >
            <Add sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
          </IconButton>
        </Box>
        
        <List sx={{ 
          p: 0, 
          flex: 1, 
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          {conversations.map((conversation) => (
            <ListItem key={conversation.id} disablePadding>
              <ListItemButton
                onClick={() => {
                  loadConversation(conversation.id);
                  setShowSidebar(false);
                }}
                selected={currentConversationId === conversation.id}
                sx={{ 
                  borderRadius: 1, 
                  mb: 0.5,
                  minHeight: { xs: 56, sm: 48 }, // Larger touch target
                  px: { xs: 1.5, sm: 1 }
                }}
              >
                <ListItemText
                  primary={conversation.title || 'Untitled Conversation'}
                  secondary={new Date(conversation.created_at).toLocaleDateString()}
                  primaryTypographyProps={{
                    sx: { 
                      fontSize: { xs: '0.95rem', sm: '0.875rem' },
                      fontWeight: currentConversationId === conversation.id ? 600 : 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      lineHeight: 1.4
                    }
                  }}
                  secondaryTypographyProps={{
                    sx: { 
                      fontSize: { xs: '0.8rem', sm: '0.75rem' },
                      lineHeight: 1.2
                    }
                  }}
                />
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conversation.id);
                  }}
                  size="small"
                  sx={{ 
                    ml: 1,
                    width: { xs: 36, sm: 32 },
                    height: { xs: 36, sm: 32 },
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'error.main',
                      bgcolor: 'error.light'
                    },
                    // Larger touch target for mobile
                    ...(isMobile && {
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: -4,
                        left: -4,
                        right: -4,
                        bottom: -4,
                        borderRadius: '50%'
                      }
                    })
                  }}
                >
                  <Delete sx={{ fontSize: { xs: '1.1rem', sm: '1rem' } }} />
                </IconButton>
              </ListItemButton>
            </ListItem>
          ))}
          
          {conversations.length === 0 && (
            <ListItem>
              <ListItemText 
                primary="No conversations yet"
                secondary="Start chatting to create your first conversation"
                sx={{ 
                  textAlign: 'center', 
                  color: 'text.secondary',
                  py: 3
                }}
                primaryTypographyProps={{
                  sx: { fontSize: { xs: '0.95rem', sm: '0.875rem' } }
                }}
                secondaryTypographyProps={{
                  sx: { fontSize: { xs: '0.85rem', sm: '0.75rem' } }
                }}
              />
            </ListItem>
          )}
        </List>
      </Box>
    </Drawer>
  );
};

export default ConversationSidebar;