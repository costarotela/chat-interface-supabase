import React, { useState, useEffect } from 'react'
  import ReactDOM from 'react-dom/client'
  import AuthPage from './AuthPage.jsx'
  import ChatPage from './ChatPage.jsx'

  const supabase = createClient(
    'https://pfebiivuiwvyozmuznbm.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmZWJpaXZ1aXd2eW96bXV6bmJtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzMxNzc3NywiZXhwIjoyMDUyODkzNzc3fQ.1RcvtipIKdtBha33lK6rF6jK8KKC4bt8MZvudsnlmRQ'
  )

  export default function App() {
    const [user, setUser] = useState(null)
    const [sessionId, setSessionId] = useState(null)

    useEffect(() => {
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null)
      })

      return () => authListener?.subscription.unsubscribe()
    }, [])

    if (!user) return <AuthPage supabase={supabase} />
    return <ChatPage supabase={supabase} sessionId={sessionId} setSessionId={setSessionId} />
  }
