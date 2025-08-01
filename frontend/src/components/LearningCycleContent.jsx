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
      backgroundColor: '#292828',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#3a3939',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
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
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#49a2d4' }}>
            Teaching Cycle AI
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img 
              src={user.photoURL} 
              alt="Profile" 
              style={{ 
                borderRadius: '50%', 
                width: '40px', 
                height: '40px',
                border: '2px solid #49a2d4'
              }} 
            />
            <span style={{ fontWeight: '500', color: '#ffffff' }}>{user.displayName}</span>
            <button 
              onClick={onLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#49a2d4',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
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
            color: '#ffffff',
            marginBottom: '1rem'
          }}>
            Welcome to Your Teaching Dashboard
          </h2>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#a6a6a6',
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
            color: '#49a2d4'
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
                  backgroundColor: '#3a3939',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  border: '1px solid #404040'
                }}
              >
                <div style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  backgroundColor: '#49a2d4',
                  color: '#ffffff'
                }}>
                  {stage.stage}
                </div>
                <p style={{ color: '#a6a6a6', lineHeight: '1.6' }}>
                  {stage.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Chatbot Action Section */}
        <div style={{
          backgroundColor: '#3a3939',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          textAlign: 'center',
          border: '1px solid #404040'
        }}>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#49a2d4'
          }}>
            AI Teaching Assistants
          </h3>
          <p style={{ 
            color: '#a6a6a6',
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
                backgroundColor: '#49a2d4',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                textAlign: 'left',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(73, 162, 212, 0.3)'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#4a92c4'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#49a2d4'}
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
                backgroundColor: '#1e3a52',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                textAlign: 'left',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(30, 58, 82, 0.3)'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2a4a6b'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#1e3a52'}
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