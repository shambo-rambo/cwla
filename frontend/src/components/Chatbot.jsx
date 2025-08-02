import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const Chatbot = ({ type, title, description, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [interactiveStates, setInteractiveStates] = useState({});

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
  const InteractiveOptions = ({ options, messageIndex, hasReplied, responseText }) => {
    const [selections, setSelections] = useState([]);
    const [additionalText, setAdditionalText] = useState('');

    if (hasReplied) {
      return (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.75rem',
          backgroundColor: '#1f2937',
          borderRadius: '6px',
          border: '1px solid #374151'
        }}>
          <div style={{ color: '#10b981', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            ✓ Reply sent
          </div>
          <div style={{ color: '#d1d5db', fontSize: '0.85rem' }}>
            {responseText}
          </div>
        </div>
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
      <div style={{
        marginTop: '0.75rem',
        padding: '0.75rem',
        backgroundColor: '#1f2937',
        borderRadius: '6px',
        border: '1px solid #374151'
      }}>
        <div style={{ marginBottom: '0.75rem' }}>
          {options.map((option, index) => (
            <label
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '0.5rem',
                cursor: 'pointer',
                color: '#d1d5db',
                fontSize: '0.9rem'
              }}
            >
              <input
                type="checkbox"
                checked={selections.includes(option)}
                onChange={(e) => handleCheckboxChange(option, e.target.checked)}
                style={{
                  marginRight: '0.5rem',
                  marginTop: '0.1rem',
                  accentColor: '#49a2d4'
                }}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
        
        <textarea
          value={additionalText}
          onChange={(e) => setAdditionalText(e.target.value)}
          placeholder="Additional details or other questions..."
          style={{
            width: '100%',
            padding: '0.5rem',
            backgroundColor: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '4px',
            color: '#ffffff',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            resize: 'vertical',
            minHeight: '60px',
            marginBottom: '0.75rem'
          }}
        />
        
        <button
          onClick={handleSubmit}
          disabled={selections.length === 0 && !additionalText.trim()}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: selections.length > 0 || additionalText.trim() ? '#49a2d4' : '#4b5563',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: selections.length > 0 || additionalText.trim() ? 'pointer' : 'not-allowed',
            fontWeight: '500',
            fontSize: '0.9rem'
          }}
        >
          Send Reply
        </button>
      </div>
    );
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const endpoint = type === 'framework' ? '/api/framework-learning' : '/api/lesson-planner';
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
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  border: message.role === 'assistant' ? '1px solid #404040' : 'none'
                }}
              >
                {message.role === 'assistant' ? (
                  (() => {
                    const interactiveData = parseInteractiveOptions(message.content);
                    const interactiveState = interactiveStates[index] || {};
                    
                    if (interactiveData) {
                      return (
                        <>
                          {/* Render content before options */}
                          {interactiveData.beforeOptions && (
                            <ReactMarkdown
                              rehypePlugins={[]}
                              remarkPlugins={[]}
                              components={{
                                p: ({ children }) => <p style={{ margin: '0 0 0.5rem 0' }}>{children}</p>,
                                ul: ({ children }) => <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>{children}</ul>,
                                ol: ({ children }) => <ol style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>{children}</ol>,
                                li: ({ children }) => <li style={{ margin: '0.2rem 0' }}>{children}</li>,
                                strong: ({ children }) => <strong style={{ fontWeight: '600' }}>{children}</strong>,
                                em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
                                h1: ({ children }) => <h1 style={{ fontSize: '1.2rem', fontWeight: '600', margin: '0.5rem 0', color: '#49a2d4' }}>{children}</h1>,
                                h2: ({ children }) => <h2 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0.5rem 0', color: '#49a2d4' }}>{children}</h2>,
                                h3: ({ children }) => <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0.5rem 0', color: '#49a2d4' }}>{children}</h3>,
                                h4: ({ children }) => <h4 style={{ fontSize: '0.95rem', fontWeight: '600', margin: '0.5rem 0', color: '#49a2d4' }}>{children}</h4>,
                                code: ({ children }) => <code style={{ backgroundColor: '#404040', padding: '0.2rem 0.4rem', borderRadius: '3px', fontSize: '0.85rem' }}>{children}</code>,
                                blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid #49a2d4', paddingLeft: '0.8rem', margin: '0.5rem 0', fontStyle: 'italic' }}>{children}</blockquote>,
                                div: ({ children, ...props }) => <div {...props}>{children}</div>
                              }}
                              allowedElements={['p', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'br', 'div', 'span']}
                            >
                              {interactiveData.beforeOptions}
                            </ReactMarkdown>
                          )}
                          
                          {/* Render interactive options */}
                          <InteractiveOptions
                            options={interactiveData.options}
                            messageIndex={index}
                            hasReplied={interactiveState.hasReplied}
                            responseText={interactiveState.responseText}
                          />
                          
                          {/* Render content after options */}
                          {interactiveData.afterOptions && (
                            <ReactMarkdown
                              rehypePlugins={[]}
                              remarkPlugins={[]}
                              components={{
                                p: ({ children }) => <p style={{ margin: '0 0 0.5rem 0' }}>{children}</p>,
                                ul: ({ children }) => <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>{children}</ul>,
                                ol: ({ children }) => <ol style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>{children}</ol>,
                                li: ({ children }) => <li style={{ margin: '0.2rem 0' }}>{children}</li>,
                                strong: ({ children }) => <strong style={{ fontWeight: '600' }}>{children}</strong>,
                                em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
                                h1: ({ children }) => <h1 style={{ fontSize: '1.2rem', fontWeight: '600', margin: '0.5rem 0', color: '#49a2d4' }}>{children}</h1>,
                                h2: ({ children }) => <h2 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0.5rem 0', color: '#49a2d4' }}>{children}</h2>,
                                h3: ({ children }) => <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0.5rem 0', color: '#49a2d4' }}>{children}</h3>,
                                h4: ({ children }) => <h4 style={{ fontSize: '0.95rem', fontWeight: '600', margin: '0.5rem 0', color: '#49a2d4' }}>{children}</h4>,
                                code: ({ children }) => <code style={{ backgroundColor: '#404040', padding: '0.2rem 0.4rem', borderRadius: '3px', fontSize: '0.85rem' }}>{children}</code>,
                                blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid #49a2d4', paddingLeft: '0.8rem', margin: '0.5rem 0', fontStyle: 'italic' }}>{children}</blockquote>,
                                div: ({ children, ...props }) => <div {...props}>{children}</div>
                              }}
                              allowedElements={['p', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'br', 'div', 'span']}
                            >
                              {interactiveData.afterOptions}
                            </ReactMarkdown>
                          )}
                        </>
                      );
                    } else {
                      // Regular message without interactive options
                      return (
                        <ReactMarkdown
                          rehypePlugins={[]}
                          remarkPlugins={[]}
                          components={{
                            p: ({ children }) => <p style={{ margin: '0 0 0.5rem 0' }}>{children}</p>,
                            ul: ({ children }) => <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>{children}</ul>,
                            ol: ({ children }) => <ol style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>{children}</ol>,
                            li: ({ children }) => <li style={{ margin: '0.2rem 0' }}>{children}</li>,
                            strong: ({ children }) => <strong style={{ fontWeight: '600' }}>{children}</strong>,
                            em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
                            h1: ({ children }) => <h1 style={{ fontSize: '1.2rem', fontWeight: '600', margin: '0.5rem 0', color: '#49a2d4' }}>{children}</h1>,
                            h2: ({ children }) => <h2 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0.5rem 0', color: '#49a2d4' }}>{children}</h2>,
                            h3: ({ children }) => <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0.5rem 0', color: '#49a2d4' }}>{children}</h3>,
                            h4: ({ children }) => <h4 style={{ fontSize: '0.95rem', fontWeight: '600', margin: '0.5rem 0', color: '#49a2d4' }}>{children}</h4>,
                            code: ({ children }) => <code style={{ backgroundColor: '#404040', padding: '0.2rem 0.4rem', borderRadius: '3px', fontSize: '0.85rem' }}>{children}</code>,
                            blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid #49a2d4', paddingLeft: '0.8rem', margin: '0.5rem 0', fontStyle: 'italic' }}>{children}</blockquote>,
                            div: ({ children, ...props }) => <div {...props}>{children}</div>
                          }}
                          allowedElements={['p', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'br', 'div', 'span']}
                        >
                          {message.content}
                        </ReactMarkdown>
                      );
                    }
                  })()
                ) : (
                  <span style={{ whiteSpace: 'pre-wrap' }}>{message.content}</span>
                )}
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