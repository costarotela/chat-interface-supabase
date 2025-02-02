import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import ReactMarkdown from 'react-markdown'
import supabase from './supabaseClient.js'

export default function ChatPage({ sessionId, setSessionId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!sessionId) {
      const newSessionId = uuidv4()
      setSessionId(newSessionId)
    }
  }, [sessionId])

  useEffect(() => {
    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('session_id, message')
        .order('created_at', { ascending: false })
        .limit(100)

      if (!error) {
        const uniqueSessions = Array.from(new Set(data.map(item => item.session_id)))
          .map(id => ({
            id,
            title: data.find(item => item.session_id === id && item.message.type === 'human')?.message.content.substring(0, 100) || 'New Chat'
          }))
        setSessions(uniqueSessions)
      }
    }

    fetchSessions()
  }, [])

  useEffect(() => {
    if (!sessionId) return

    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [sessionId])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage = {
      message: {
        type: 'human',
        content: input
      }
    }

    setInput('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8001/api/pydantic-github-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          user_id: 'NA',
          request_id: uuidv4(),
          session_id: sessionId
        })
      })

      if (!response.ok) throw new Error('Failed to send message')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-dark-blue text-white">
      <div className={`bg-medium-blue w-64 transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4">
          <h3 className="text-accent-blue mb-4">Conversations</h3>
          {sessions.map(session => (
            <div key={session.id} className="p-2 hover:bg-dark-gray rounded cursor-pointer">
              {session.title}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-dark-gray flex items-center">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="mr-4 text-accent-blue hover:text-blue-400"
          >
            ☰
          </button>
          <h1 className="text-xl">Chat Session</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.message.type === 'human' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl p-4 rounded-lg ${msg.message.type === 'human' ? 'bg-accent-blue' : 'bg-dark-gray'}`}>
                <ReactMarkdown className="prose dark:prose-invert">
                  {msg.message.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-dark-gray p-4 rounded-lg">Thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t border-dark-gray">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 rounded bg-dark-gray text-white"
            />
            <button 
              type="submit" 
              className="bg-accent-blue text-white px-6 py-2 rounded hover:bg-blue-400"
              disabled={loading}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
