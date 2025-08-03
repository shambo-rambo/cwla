import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  FormControlLabel,
  Checkbox,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Close, Fullscreen, FullscreenExit, ContentCopy, History, Delete, Add } from '@mui/icons-material';

const Chatbot = ({ type, title, description, user, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interactiveStates, setInteractiveStates] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const messagesEndRef = useRef(null);

  const copyToClipboard = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  // Load user's conversations on component mount
  useEffect(() => {
    if (user?.uid) {
      loadUserConversations();
    }
  }, [user, type]);

  const loadUserConversations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/conversations/${user.uid}`);
      if (response.ok) {
        const data = await response.json();
        const typeConversations = data.conversations.filter(conv => conv.chat_type === type);
        setConversations(typeConversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const createNewConversation = async (firstMessage) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName,
          chatType: type,
          title: firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '')
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentConversationId(data.conversationId);
        loadUserConversations(); // Refresh the list
        return data.conversationId;
      } else if (response.status === 403) {
        // Chat limit exceeded
        const limitMessage = { role: 'assistant', content: data.message };
        setMessages(prev => [...prev, limitMessage]);
        setIsLimitReached(true);
        return null;
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
    return null;
  };

  const loadConversation = async (conversationId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/conversations/${conversationId}/messages`);
      if (response.ok) {
        const data = await response.json();
        const formattedMessages = data.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        setMessages(formattedMessages);
        setCurrentConversationId(conversationId);
        setInteractiveStates({}); // Reset interactive states
        
        // Check if this conversation has reached message limit
        const messageCount = data.messages.length;
        setIsLimitReached(messageCount >= 10);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (response.ok) {
        loadUserConversations(); // Refresh the list
        if (currentConversationId === conversationId) {
          // If we're deleting the current conversation, start fresh
          setMessages([]);
          setCurrentConversationId(null);
          setInteractiveStates({});
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setInteractiveStates({});
    setInputMessage('');
    setIsLimitReached(false);
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Parse interactive options from AI response
  const parseInteractiveOptions = (content) => {
    const regex = /```interactive-options\n([\s\S]*?)\n```/;
    const match = content.match(regex);
    if (!match) return null;
    
    const optionsText = match[1];
    const options = optionsText
      .split('\n')
      .filter(line => line.trim().startsWith('- '))
      .map(line => line.trim().substring(2));
    
    return {
      beforeOptions: content.substring(0, match.index),
      options,
      afterOptions: content.substring(match.index + match[0].length)
    };
  };

  // Handle interactive option selection
  const handleInteractiveSubmit = async (messageIndex, selections, additionalText) => {
    if (selections.length === 0 && !additionalText.trim()) return;
    
    // Format the response
    let responseText = '';
    if (selections.length > 0) {
      responseText = `Selected: ${selections.join(', ')}`;
      if (additionalText.trim()) {
        responseText += `\n\nAdditional: ${additionalText.trim()}`;
      }
    } else {
      responseText = additionalText.trim();
    }

    // Mark as replied
    setInteractiveStates(prev => ({
      ...prev,
      [messageIndex]: { ...prev[messageIndex], hasReplied: true, responseText }
    }));

    // Send to AI
    setIsLoading(true);
    try {
      const endpoint = type === 'framework' ? '/api/framework-learning' : '/api/lesson-planner';
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: responseText }),
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMessage = { role: 'assistant', content: data.response };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage = { role: 'assistant', content: `Error: ${data.error}` };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = { role: 'assistant', content: 'Failed to connect to the server. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Interactive Options Component
  const InteractiveOptions = ({ options, messageIndex, hasReplied, responseText, isLastMessage, hasNewerMessages }) => {
    const [selections, setSelections] = useState([]);
    const [additionalText, setAdditionalText] = useState('');

    // If user has replied AND there are newer messages, show minimal completed state
    if (hasReplied && hasNewerMessages) {
      return (
        <Card sx={{ mt: 1.5, bgcolor: 'action.hover', border: 1, borderColor: 'divider' }}>
          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
              ✓ Responded: {responseText.length > 50 ? responseText.substring(0, 50) + '...' : responseText}
            </Typography>
          </CardContent>
        </Card>
      );
    }

    // If user has replied but this is still the last message, show full response
    if (hasReplied) {
      return (
        <Card sx={{ mt: 1.5, bgcolor: 'success.light', border: 1, borderColor: 'success.main' }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="body2" sx={{ color: 'success.dark', mb: 1, fontWeight: 600 }}>
              ✓ Reply sent
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              {responseText}
            </Typography>
          </CardContent>
        </Card>
      );
    }

    const handleCheckboxChange = (option, checked) => {
      if (checked) {
        setSelections(prev => [...prev, option]);
      } else {
        setSelections(prev => prev.filter(sel => sel !== option));
      }
    };

    const handleSubmit = () => {
      handleInteractiveSubmit(messageIndex, selections, additionalText);
    };

    return (
      <Card sx={{ 
        mt: 1.5, 
        bgcolor: 'background.paper', 
        border: 1, 
        borderColor: 'divider'
      }}>
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ mb: 1.5 }}>
            {options.map((option, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={selections.includes(option)}
                    onChange={(e) => handleCheckboxChange(option, e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {option}
                  </Typography>
                }
                sx={{ 
                  display: 'flex',
                  alignItems: 'flex-start',
                  mb: 0.5,
                  ml: 0,
                  '& .MuiFormControlLabel-label': { mt: -0.5 }
                }}
              />
            ))}
          </Box>
          
          <TextField
            fullWidth
            multiline
            rows={2}
            value={additionalText}
            onChange={(e) => setAdditionalText(e.target.value)}
            placeholder="Additional details..."
            variant="outlined"
            size="small"
            sx={{ mb: 1.5 }}
          />
          
          <Button
            onClick={handleSubmit}
            disabled={selections.length === 0 && !additionalText.trim()}
            variant="contained"
            size="small"
            color="primary"
            fullWidth
          >
            Send Reply
          </Button>
        </CardContent>
      </Card>
    );
  };

  // Check if last message has interactive options
  const hasActiveInteractiveOptions = () => {
    if (messages.length === 0) return false;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'assistant') return false;
    
    const interactiveData = parseInteractiveOptions(lastMessage.content);
    if (!interactiveData) return false;
    
    const lastMessageIndex = messages.length - 1;
    const interactiveState = interactiveStates[lastMessageIndex] || {};
    
    // Hide input if there are interactive options and user hasn't replied yet
    return !interactiveState.hasReplied;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    
    // Create conversation if this is the first message
    let conversationId = currentConversationId;
    if (!conversationId && user?.uid) {
      conversationId = await createNewConversation(inputMessage);
    }

    const messageToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const endpoint = type === 'framework' ? '/api/framework-learning' : '/api/lesson-planner';
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: messageToSend,
          conversationHistory: messages,
          conversationId: conversationId,
          userId: user?.uid,
          userEmail: user?.email,
          userName: user?.displayName
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMessage = { role: 'assistant', content: data.response };
        setMessages(prev => [...prev, assistantMessage]);
        
        // If limit exceeded, disable further input
        if (data.limitExceeded) {
          setInputMessage('');
          setIsLimitReached(true);
        }
      } else {
        const errorMessage = { role: 'assistant', content: `Error: ${data.error}` };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = { role: 'assistant', content: 'Failed to connect to the server. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth={isFullscreen ? false : 'md'}
      fullWidth
      fullScreen={isFullscreen || isMobile}
      PaperProps={{
        sx: {
          height: isFullscreen || isMobile ? '100vh' : '80vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ p: { xs: 2, sm: 3 }, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h4" 
              component="h3" 
              sx={{ 
                color: 'primary.main', 
                mb: { xs: 0.5, sm: 1 },
                fontSize: { xs: '1.25rem', sm: '2rem' },
                fontWeight: 600
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {description}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: { xs: 0.25, sm: 0.5 } }}>
            <IconButton
              onClick={() => setShowSidebar(!showSidebar)}
              size="small"
              title="Conversation History"
              sx={{ p: { xs: 0.5, sm: 1 } }}
            >
              <History sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
            </IconButton>
            {!isMobile && (
              <IconButton
                onClick={() => setIsFullscreen(!isFullscreen)}
                size="small"
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                sx={{ p: { xs: 0.5, sm: 1 } }}
              >
                {isFullscreen ? <FullscreenExit sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} /> : <Fullscreen sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />}
              </IconButton>
            )}
            <IconButton 
              onClick={onClose} 
              size="small"
              sx={{ p: { xs: 0.5, sm: 1 } }}
            >
              <Close sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      {/* Conversation History Sidebar */}
      <Drawer
        anchor="left"
        open={showSidebar}
        onClose={() => setShowSidebar(false)}
        variant="temporary"
        sx={{
          '& .MuiDrawer-paper': {
            width: 300,
            position: 'absolute',
            height: '100%',
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider'
          }
        }}
        ModalProps={{
          container: document.querySelector('[role="dialog"]'),
          style: { position: 'absolute' }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Conversations</Typography>
            <IconButton onClick={startNewConversation} size="small" title="New Conversation">
              <Add />
            </IconButton>
          </Box>
          
          <List sx={{ p: 0 }}>
            {conversations.map((conversation) => (
              <ListItem key={conversation.id} disablePadding>
                <ListItemButton
                  onClick={() => {
                    loadConversation(conversation.id);
                    setShowSidebar(false);
                  }}
                  selected={currentConversationId === conversation.id}
                  sx={{ borderRadius: 1, mb: 0.5 }}
                >
                  <ListItemText
                    primary={conversation.title || 'Untitled Conversation'}
                    secondary={new Date(conversation.created_at).toLocaleDateString()}
                    primaryTypographyProps={{
                      sx: { 
                        fontSize: '0.875rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }
                    }}
                    secondaryTypographyProps={{
                      sx: { fontSize: '0.75rem' }
                    }}
                  />
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation.id);
                    }}
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </ListItemButton>
              </ListItem>
            ))}
            
            {conversations.length === 0 && (
              <ListItem>
                <ListItemText 
                  primary="No conversations yet"
                  secondary="Start chatting to create your first conversation"
                  sx={{ textAlign: 'center', color: 'text.secondary' }}
                />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>

      <DialogContent sx={{ 
        flex: 1, 
        p: 2, 
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
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
                maxWidth: { xs: '85%', sm: '70%' },
                bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                border: message.role === 'assistant' ? 1 : 0,
                borderColor: 'divider',
                position: 'relative'
              }}
            >
              {message.role === 'assistant' && (
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(message.content)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    zIndex: 1,
                    '&:hover': {
                      bgcolor: 'grey.100'
                    }
                  }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              )}
              <CardContent sx={{ p: { xs: 1, sm: 1.5 }, '&:last-child': { pb: { xs: 1, sm: 1.5 } } }}>
                {message.role === 'assistant' ? (
                  (() => {
                    const interactiveData = parseInteractiveOptions(message.content);
                    const interactiveState = interactiveStates[index] || {};
                    
                    if (interactiveData) {
                      return (
                        <>
                          {interactiveData.beforeOptions && (
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <Typography variant="body2" sx={{ mb: 1 }}>{children}</Typography>,
                                ul: ({ children }) => <Box component="ul" sx={{ my: 1, pl: 2 }}>{children}</Box>,
                                ol: ({ children }) => <Box component="ol" sx={{ my: 1, pl: 2 }}>{children}</Box>,
                                li: ({ children }) => <Box component="li" sx={{ my: 0.25 }}>{children}</Box>,
                                strong: ({ children }) => <Typography component="strong" sx={{ fontWeight: 600 }}>{children}</Typography>,
                                em: ({ children }) => <Typography component="em" sx={{ fontStyle: 'italic' }}>{children}</Typography>,
                                h1: ({ children }) => <Typography variant="h6" sx={{ color: 'primary.main', my: 1 }}>{children}</Typography>,
                                h2: ({ children }) => <Typography variant="subtitle1" sx={{ color: 'primary.main', my: 1 }}>{children}</Typography>,
                                h3: ({ children }) => <Typography variant="subtitle2" sx={{ color: 'primary.main', my: 1 }}>{children}</Typography>,
                                code: ({ children }) => <Chip label={children} size="small" sx={{ fontSize: '0.75rem' }} />,
                                blockquote: ({ children }) => <Box sx={{ borderLeft: 3, borderColor: 'primary.main', pl: 1, my: 1, fontStyle: 'italic' }}>{children}</Box>
                              }}
                            >
                              {interactiveData.beforeOptions}
                            </ReactMarkdown>
                          )}
                          
                          <InteractiveOptions
                            options={interactiveData.options}
                            messageIndex={index}
                            hasReplied={interactiveState.hasReplied}
                            responseText={interactiveState.responseText}
                            isLastMessage={index === messages.length - 1}
                            hasNewerMessages={index < messages.length - 1}
                          />
                          
                          {interactiveData.afterOptions && (
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <Typography variant="body2" sx={{ mb: 1 }}>{children}</Typography>,
                                ul: ({ children }) => <Box component="ul" sx={{ my: 1, pl: 2 }}>{children}</Box>,
                                ol: ({ children }) => <Box component="ol" sx={{ my: 1, pl: 2 }}>{children}</Box>,
                                li: ({ children }) => <Box component="li" sx={{ my: 0.25 }}>{children}</Box>,
                                strong: ({ children }) => <Typography component="strong" sx={{ fontWeight: 600 }}>{children}</Typography>,
                                em: ({ children }) => <Typography component="em" sx={{ fontStyle: 'italic' }}>{children}</Typography>,
                                h1: ({ children }) => <Typography variant="h6" sx={{ color: 'primary.main', my: 1 }}>{children}</Typography>,
                                h2: ({ children }) => <Typography variant="subtitle1" sx={{ color: 'primary.main', my: 1 }}>{children}</Typography>,
                                h3: ({ children }) => <Typography variant="subtitle2" sx={{ color: 'primary.main', my: 1 }}>{children}</Typography>,
                                code: ({ children }) => <Chip label={children} size="small" sx={{ fontSize: '0.75rem' }} />,
                                blockquote: ({ children }) => <Box sx={{ borderLeft: 3, borderColor: 'primary.main', pl: 1, my: 1, fontStyle: 'italic' }}>{children}</Box>
                              }}
                            >
                              {interactiveData.afterOptions}
                            </ReactMarkdown>
                          )}
                        </>
                      );
                    } else {
                      return (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <Typography variant="body2" sx={{ mb: 1 }}>{children}</Typography>,
                            ul: ({ children }) => <Box component="ul" sx={{ my: 1, pl: 2 }}>{children}</Box>,
                            ol: ({ children }) => <Box component="ol" sx={{ my: 1, pl: 2 }}>{children}</Box>,
                            li: ({ children }) => <Box component="li" sx={{ my: 0.25 }}>{children}</Box>,
                            strong: ({ children }) => <Typography component="strong" sx={{ fontWeight: 600 }}>{children}</Typography>,
                            em: ({ children }) => <Typography component="em" sx={{ fontStyle: 'italic' }}>{children}</Typography>,
                            h1: ({ children }) => <Typography variant="h6" sx={{ color: 'primary.main', my: 1 }}>{children}</Typography>,
                            h2: ({ children }) => <Typography variant="subtitle1" sx={{ color: 'primary.main', my: 1 }}>{children}</Typography>,
                            h3: ({ children }) => <Typography variant="subtitle2" sx={{ color: 'primary.main', my: 1 }}>{children}</Typography>,
                            code: ({ children }) => <Chip label={children} size="small" sx={{ fontSize: '0.75rem' }} />,
                            blockquote: ({ children }) => <Box sx={{ borderLeft: 3, borderColor: 'primary.main', pl: 1, my: 1, fontStyle: 'italic' }}>{children}</Box>
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      );
                    }
                  })()
                ) : (
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        ))}
          
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Card sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
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

      {!hasActiveInteractiveOptions() && (
        <Box sx={{ 
          p: { xs: 1.5, sm: 2 }, 
          borderTop: 1, 
          borderColor: 'divider', 
          display: 'flex', 
          gap: { xs: 0.75, sm: 1 },
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <TextField
            fullWidth
            multiline
            rows={{ xs: 2, sm: 3 }}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={type === 'framework' 
              ? 'Type here...'
              : 'Type here...'
            }
            disabled={isLoading || isLimitReached}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim() || isLimitReached}
            sx={{ 
              alignSelf: { xs: 'stretch', sm: 'flex-end' }, 
              minWidth: 'auto', 
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.85rem', sm: '0.875rem' }
            }}
          >
            Send
          </Button>
        </Box>
      )}
    </Dialog>
  );
};

export default Chatbot;