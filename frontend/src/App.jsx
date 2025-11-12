import React, { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

function Login({ name, setName, onJoin }) {
  return (
    <div className="login">
      <h2>Welcome to Momo Chat</h2>
      <p className="subtitle">Quickly join with a display name to start chatting.</p>
      <div className="login-controls">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          onKeyDown={(e) => e.key === 'Enter' && onJoin()}
        />
        <button className="primary" onClick={onJoin}>Join</button>
      </div>
    </div>
  )
}

function MessageList({ messages, me }) {
  return (
    <div className="messages">
      {messages.map((m, i) => (
        <div key={i} className={`message ${m.user === me ? 'me' : ''}`}>
          <div className="meta">{m.user} · {new Date(m.time).toLocaleTimeString()}</div>
          <div className="text">{m.text}</div>
        </div>
      ))}
    </div>
  )
}

function Composer({ value, onChange, onSend }) {
  return (
    <form className="composer" onSubmit={(e) => { e.preventDefault(); onSend() }}>
      <input placeholder="Type a message..." value={value} onChange={(e) => onChange(e.target.value)} />
      <button className="primary" type="submit">Send</button>
    </form>
  )
}

export default function App() {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [name, setName] = useState('')
  const [joined, setJoined] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    const s = io(SOCKET_URL)
    setSocket(s)

    s.on('connect', () => setConnected(true))
    s.on('disconnect', () => setConnected(false))
    s.on('connect_error', (err) => {
      console.error('Socket connect_error', err)
    })

    s.on('chat message', (msg) => {
      setMessages((m) => [...m, msg])
    })

    s.on('chat history', (history) => {
      setMessages(history || [])
    })

    s.on('user joined', (u) => {
      setMessages((m) => [...m, { user: 'System', text: `${u.user} joined`, time: Date.now() }])
    })

    return () => s.disconnect()
  }, [])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

  function join() {
    if (!name.trim() || !socket) return
    setJoined(true)
    socket.emit('join', { user: name })
  }

  function sendMessage() {
    if (!input.trim() || !socket || !joined) return
    const msg = { user: name || 'Anonymous', text: input.trim(), time: Date.now() }
    socket.emit('chat message', msg)
    setInput('')
  }

  return (
    <div className="app">
      <header className="top">
        <div className="title">
          <h1>Momo Chat</h1>
          <div className="status">{connected ? 'Online' : 'Offline'}</div>
        </div>
        <div className="user">{joined ? <strong>{name}</strong> : null}</div>
      </header>

      {!joined ? (
        <Login name={name} setName={setName} onJoin={join} />
      ) : (
        <div className="chat">
          <div className="messages-wrap" ref={listRef}>
            <MessageList messages={messages} me={name} />
          </div>
          <Composer value={input} onChange={setInput} onSend={sendMessage} />
        </div>
      )}
    </div>
  )
}
