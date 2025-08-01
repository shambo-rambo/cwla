import React, { useState } from 'react';

const Chatbot = ({ type, title, description, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const endpoint = type === 'framework' ? '/api/framework-analysis' : '/api/lesson-planner';
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#3a3939',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '800px',
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        border: '1px solid #404040'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #404040',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#49a2d4' }}>
              {title}
            </h3>
            <p style={{ color: '#a6a6a6', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
              {description}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#a6a6a6'
            }}
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          padding: '1rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {messages.length === 0 && (
            <div style={{
              textAlign: 'center',
              color: '#a6a6a6',
              fontSize: '0.9rem',
              padding: '2rem'
            }}>
              {type === 'framework' 
                ? 'Ask me about teaching frameworks, pedagogical approaches, or educational strategies!'
                : 'Describe what lesson you\'d like to create and I\'ll build a detailed plan using the 5-stage learning cycle!'
              }
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: message.role === 'user' ? '#49a2d4' : '#292828',
                  color: message.role === 'user' ? 'white' : '#ffffff',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  border: message.role === 'assistant' ? '1px solid #404040' : 'none'
                }}
              >
                {message.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start'
            }}>
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#292828',
                color: '#a6a6a6',
                fontSize: '0.9rem',
                border: '1px solid #404040'
              }}>
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #404040',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={type === 'framework' 
              ? 'Ask about teaching frameworks, strategies, or pedagogical approaches...'
              : 'Describe the lesson you want to create...'
            }
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #404040',
              borderRadius: '6px',
              resize: 'none',
              minHeight: '80px',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              backgroundColor: '#292828',
              color: '#ffffff'
            }}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: isLoading || !inputMessage.trim() ? '#404040' : '#49a2d4',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              alignSelf: 'flex-end'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;