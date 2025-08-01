import React, { useState } from 'react';
import Chatbot from './Chatbot';

const LearningCycleContent = ({ user, onLogout }) => {
  const [activeChatbot, setActiveChatbot] = useState(null);
  const cycleStages = [
    {
      stage: "1. Engage",
      description: "Capture students' interest and activate prior knowledge",
      color: "bg-blue-100 text-blue-800"
    },
    {
      stage: "2. Explore", 
      description: "Students investigate and discover concepts hands-on",
      color: "bg-green-100 text-green-800"
    },
    {
      stage: "3. Explain",
      description: "Teacher provides clear explanations and introduces vocabulary",
      color: "bg-yellow-100 text-yellow-800"
    },
    {
      stage: "4. Elaborate",
      description: "Students apply knowledge to new situations and contexts",
      color: "bg-purple-100 text-purple-800"
    },
    {
      stage: "5. Evaluate",
      description: "Assess student understanding and lesson effectiveness",
      color: "bg-red-100 text-red-800"
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '1rem 0'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e40af' }}>
            Teaching Cycle AI
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img 
              src={user.photoURL} 
              alt="Profile" 
              style={{ 
                borderRadius: '50%', 
                width: '40px', 
                height: '40px' 
              }} 
            />
            <span style={{ fontWeight: '500' }}>{user.displayName}</span>
            <button 
              onClick={onLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            Welcome to Your Teaching Dashboard
          </h2>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Plan engaging lessons using the 5-stage Teaching and Learning Cycle framework
          </p>
        </div>

        {/* Learning Cycle Stages */}
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            textAlign: 'center',
            marginBottom: '2rem',
            color: '#1f2937'
          }}>
            The Teaching & Learning Cycle
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gap: '1.5rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
          }}>
            {cycleStages.map((stage, index) => (
              <div 
                key={index}
                style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  ...(index === 0 && { backgroundColor: '#dbeafe', color: '#1e40af' }),
                  ...(index === 1 && { backgroundColor: '#dcfce7', color: '#166534' }),
                  ...(index === 2 && { backgroundColor: '#fef3c7', color: '#92400e' }),
                  ...(index === 3 && { backgroundColor: '#e9d5ff', color: '#7c2d12' }),
                  ...(index === 4 && { backgroundColor: '#fecaca', color: '#991b1b' })
                }}>
                  {stage.stage}
                </div>
                <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                  {stage.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Chatbot Action Section */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#1f2937'
          }}>
            AI Teaching Assistants
          </h3>
          <p style={{ 
            color: '#6b7280',
            marginBottom: '2rem'
          }}>
            Get expert guidance on teaching frameworks and create detailed lesson plans
          </p>
          
          <div style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            <button 
              onClick={() => setActiveChatbot('framework')}
              style={{
                padding: '1rem 1.5rem',
                fontSize: '1rem',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                textAlign: 'left'
              }}
            >
              <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                🎯 Framework Analysis
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                Get expert advice on teaching strategies and pedagogical approaches
              </div>
            </button>

            <button 
              onClick={() => setActiveChatbot('lesson')}
              style={{
                padding: '1rem 1.5rem',
                fontSize: '1rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                textAlign: 'left'
              }}
            >
              <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                📝 Lesson Planner
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                Create detailed lesson plans using the 5-stage learning cycle
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Chatbot Modals */}
      {activeChatbot === 'framework' && (
        <Chatbot
          type="framework"
          title="Framework Analysis Assistant"
          description="Get expert advice on teaching strategies, pedagogical approaches, and educational frameworks"
          onClose={() => setActiveChatbot(null)}
        />
      )}

      {activeChatbot === 'lesson' && (
        <Chatbot
          type="lesson"
          title="Lesson Plan Creator"
          description="Create detailed lesson plans using the 5-stage Teaching and Learning Cycle"
          onClose={() => setActiveChatbot(null)}
        />
      )}
    </div>
  );
};

export default LearningCycleContent;