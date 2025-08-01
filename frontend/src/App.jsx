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
        gap: '20px'
      }}>
        <h1>Teaching Cycle App</h1>
        <div style={{ fontSize: '18px', color: error ? 'red' : 'green' }}>
          Backend says: {error || backendMessage}
        </div>
        <button 
          onClick={handleGoogleLogin}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  return <LearningCycleContent user={user} onLogout={handleLogout} />
}

export default App