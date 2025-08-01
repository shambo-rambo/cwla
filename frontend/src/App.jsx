import { useState, useEffect } from 'react'

function App() {
  const [backendMessage, setBackendMessage] = useState('Loading...')
  const [error, setError] = useState(null)

  useEffect(() => {
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
  }, [])

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      gap: '20px'
    }}>
      <h1>Hello from frontend</h1>
      <div style={{ fontSize: '18px', color: error ? 'red' : 'green' }}>
        Backend says: {error || backendMessage}
      </div>
    </div>
  )
}

export default App