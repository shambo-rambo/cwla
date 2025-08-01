import { useState, useEffect } from 'react'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider } from './firebase'
import LearningCycleContent from './components/LearningCycleContent'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [backendMessage, setBackendMessage] = useState('Loading...')
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    const fetchBackendMessage = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/`)
        const data = await response.json()
        setBackendMessage(data.message)
      } catch (err) {
        setError('Failed to connect to backend')
        console.error('Error:', err)
      }
    }

    fetchBackendMessage()

    return () => unsubscribe()
  }, [])

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px'
      }}>
        Loading...
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        gap: '20px',
        backgroundColor: '#292828',
        color: '#ffffff'
      }}>
        <h1 style={{ color: '#49a2d4', fontSize: '3rem', marginBottom: '1rem' }}>
          Teaching Cycle AI
        </h1>
        <p style={{ color: '#a6a6a6', fontSize: '1.2rem', textAlign: 'center', maxWidth: '400px' }}>
          Transform your teaching with AI-powered lesson planning and framework analysis
        </p>
        <div style={{ fontSize: '14px', color: error ? '#ff6b6b' : '#49a2d4', marginBottom: '1rem' }}>
          Backend: {error || backendMessage}
        </div>
        <button 
          onClick={handleGoogleLogin}
          style={{
            padding: '16px 32px',
            fontSize: '18px',
            backgroundColor: '#49a2d4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 4px 8px rgba(73, 162, 212, 0.3)',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#4a92c4'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#49a2d4'}
        >
          🚀 Sign in with Google
        </button>
      </div>
    )
  }

  return <LearningCycleContent user={user} onLogout={handleLogout} />
}

export default App