import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import {
  Box,
  Typography,
  Card,
  CardContent,
  DialogContent,
  IconButton,
  FormControlLabel,
  Checkbox,
  TextField,
  Button,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { ContentCopy } from '@mui/icons-material';

const ChatMessages = ({
  messages,
  isLoading,
  messagesEndRef,
  copyToClipboard,
  type
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  

  return (
    <DialogContent sx={{ 
      flex: 1, 
      p: { xs: 0.75, sm: 2 }, 
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 0.75, sm: 2 },
      // Mobile safe area support
      paddingLeft: { 
        xs: 'max(0.75rem, env(safe-area-inset-left))', 
        sm: 2 
      },
      paddingRight: { 
        xs: 'max(0.75rem, env(safe-area-inset-right))', 
        sm: 2 
      },
      // Improved scrolling on mobile
      WebkitOverflowScrolling: 'touch',
      scrollBehavior: 'smooth'
    }}>
      {messages.length === 0 && (
        <Box sx={{ 
          textAlign: 'center', 
          p: { xs: 2, sm: 4 },
          mt: { xs: 2, sm: 0 }
        }}>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              fontSize: { xs: '0.95rem', sm: '1rem' },
              lineHeight: 1.6
            }}
          >
            {type === 'framework' 
              ? 'Ask me anything about the Teaching and Learning Cycle!'
              : 'Describe what lesson you\'d like to create and I\'ll build a detailed plan using the Teaching and Learning Cycle!'
            }
          </Typography>
        </Box>
      )}
        
      {messages.map((message, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
          }}
        >
          <Card
            sx={{
              maxWidth: { xs: '95%', sm: '70%' },
              bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
              color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
              border: message.role === 'assistant' ? 1 : 0,
              borderColor: 'divider',
              position: 'relative',
              // Better shadows for mobile
              boxShadow: isMobile ? 2 : 1
            }}
          >
            {message.role === 'assistant' && (
              <IconButton
                size="small"
                onClick={() => copyToClipboard(message.content)}
                sx={{
                  position: 'absolute',
                  top: { xs: 4, sm: 8 },
                  right: { xs: 4, sm: 8 },
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  zIndex: 1,
                  width: { xs: 32, sm: 'auto' },
                  height: { xs: 32, sm: 'auto' },
                  '&:hover': {
                    bgcolor: 'grey.100'
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
                <ContentCopy sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
              </IconButton>
            )}
            
            <CardContent sx={{ 
              p: { xs: 1, sm: 1.5 }, 
              '&:last-child': { pb: { xs: 1, sm: 1.5 } },
              pr: message.role === 'assistant' ? { xs: 5, sm: 6 } : { xs: 1, sm: 1.5 }
            }}>
              {message.role === 'assistant' ? (
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={{
                    p: ({ children }) => <Typography variant="body2" sx={{ mb: { xs: 0.75, sm: 1 }, fontSize: { xs: '0.9rem', sm: '0.875rem' }, lineHeight: 1.5 }}>{children}</Typography>,
                    ul: ({ children }) => <Box component="ul" sx={{ my: { xs: 0.75, sm: 1 }, pl: 2 }}>{children}</Box>,
                    ol: ({ children }) => <Box component="ol" sx={{ my: { xs: 0.75, sm: 1 }, pl: 2 }}>{children}</Box>,
                    li: ({ children }) => <Box component="li" sx={{ my: { xs: 0.2, sm: 0.25 }, fontSize: { xs: '0.9rem', sm: '0.875rem' } }}>{children}</Box>,
                    strong: ({ children }) => <Typography component="strong" sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', sm: '0.875rem' } }}>{children}</Typography>,
                    em: ({ children }) => <Typography component="em" sx={{ fontStyle: 'italic', fontSize: { xs: '0.9rem', sm: '0.875rem' } }}>{children}</Typography>,
                    h1: ({ children }) => <Typography variant="h6" sx={{ color: 'primary.main', my: { xs: 0.75, sm: 1 }, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>{children}</Typography>,
                    h2: ({ children }) => <Typography variant="subtitle1" sx={{ color: 'primary.main', my: { xs: 0.75, sm: 1 }, fontSize: { xs: '1rem', sm: '1.1rem' } }}>{children}</Typography>,
                    h3: ({ children }) => <Typography variant="subtitle2" sx={{ color: 'primary.main', my: { xs: 0.75, sm: 1 }, fontSize: { xs: '0.95rem', sm: '1rem' } }}>{children}</Typography>,
                    code: ({ children }) => <Chip label={children} size="small" sx={{ fontSize: { xs: '0.75rem', sm: '0.75rem' } }} />,
                    blockquote: ({ children }) => <Box sx={{ borderLeft: 3, borderColor: 'primary.main', pl: 1, my: { xs: 0.75, sm: 1 }, fontStyle: 'italic', fontSize: { xs: '0.9rem', sm: '0.875rem' } }}>{children}</Box>
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    whiteSpace: 'pre-wrap', 
                    fontSize: { xs: '0.9rem', sm: '0.875rem' },
                    lineHeight: 1.5
                  }}
                >
                  {message.content}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      ))}
        
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Card sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', boxShadow: isMobile ? 2 : 1 }}>
            <CardContent sx={{ p: { xs: 1, sm: 1.5 }, '&:last-child': { pb: { xs: 1, sm: 1.5 } } }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
                Thinking...
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
      
      <div ref={messagesEndRef} />
    </DialogContent>
  );
};

export default ChatMessages;