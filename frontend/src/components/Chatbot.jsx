import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ConversationSidebar from './ConversationSidebar';

const Chatbot = ({ type, title, description, user, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setInputMessage('');
    setIsLimitReached(false);
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleStreamingResponse = async (endpoint, requestData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = { role: 'assistant', content: '' };
      
      // Add empty assistant message that we'll update
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'chunk' && data.text) {
                assistantMessage.content += data.text;
                setMessages(prev => [
                  ...prev.slice(0, -1), // Remove last message
                  { ...assistantMessage } // Add updated message
                ]);
              } else if (data.type === 'complete') {
                console.log('Streaming complete');
                return;
              } else if (data.type === 'error') {
                throw new Error(data.error || 'Stream error');
              }
            } catch (parseError) {
              console.error('Error parsing stream data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
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
      
      // Handle streaming for framework learning
      if (type === 'framework') {
        await handleStreamingResponse(endpoint, {
          message: messageToSend,
          conversationHistory: messages,
          conversationId: conversationId,
          userId: user?.uid,
          userEmail: user?.email,
          userName: user?.displayName
        });
        return;
      }
      
      // Non-streaming for lesson planner (for now)
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

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth={isFullscreen ? false : 'md'}
      fullWidth
      fullScreen={isFullscreen || isMobile}
      slotProps={{
        backdrop: { sx: { backgroundColor: 'rgba(0, 0, 0, 0.8)' } }
      }}
      sx={{
        '& .MuiDialog-paper': {
          height: isMobile ? '100vh' : (isFullscreen ? '100vh' : '80vh'),
          maxHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          ...(isMobile && {
            margin: 0,
            borderRadius: 0,
            maxWidth: '100vw',
            width: '100vw',
            maxHeight: '100vh',
            // Better mobile viewport handling
            height: '100dvh' // Dynamic viewport height
          })
        }
      }}
    >
      <ChatHeader
        title={title}
        description={description}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
        setShowSidebar={setShowSidebar}
        showSidebar={showSidebar}
        onClose={onClose}
      />

      <ConversationSidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        conversations={conversations}
        currentConversationId={currentConversationId}
        loadConversation={loadConversation}
        deleteConversation={deleteConversation}
        startNewConversation={startNewConversation}
      />

      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
        copyToClipboard={copyToClipboard}
        type={type}
      />

      <ChatInput
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        onSendMessage={sendMessage}
        isLoading={isLoading}
        isLimitReached={isLimitReached}
        type={type}
      />
    </Dialog>
  );
};

export default Chatbot;