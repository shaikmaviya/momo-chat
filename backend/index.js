const express = require('express')
const http = require('http')
const cors = require('cors')
const { Server } = require('socket.io')

const app = express()

// CORS configuration for production
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://momo-chat.netlify.app',
      'https://momo-chat.vercel.app',
      'https://your-frontend-url.vercel.app',
      'https://your-frontend-url.netlify.app'
    ]
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173']

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())

const PORT = process.env.PORT || 3001

// In-memory message store (simple).
// Each message: { user, text, time }
const messages = []
const MAX_MESSAGES = 1000

app.get('/health', (req, res) => res.json({ ok: true }))

app.get('/messages', (req, res) => {
  res.json(messages)
})

// allow posting a message via HTTP (useful for integrations or testing)
app.post('/messages', (req, res) => {
  const { user, text, time } = req.body || {}
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' })
  }
  const message = {
    user: user || 'Anonymous',
    text: text,
    time: time || Date.now()
  }
  messages.push(message)
  if (messages.length > MAX_MESSAGES) messages.shift()
  io.emit('chat message', message)
  res.status(201).json(message)
})

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
})

io.on('connection', (socket) => {
  console.log('socket connected', socket.id)

  // send chat history on connect
  socket.emit('chat history', messages)

  socket.on('join', (data) => {
    // store username on socket session
    try { socket.data.user = data.user } catch (e) {}
    console.log('user joined', data)
    // optional broadcast that a user joined
    socket.broadcast.emit('user joined', { user: data.user })
  })

  socket.on('chat message', (msg) => {
    // ensure message shape
    const message = {
      user: msg.user || socket.data.user || 'Anonymous',
      text: msg.text || '',
      time: msg.time || Date.now()
    }

    messages.push(message)
    if (messages.length > MAX_MESSAGES) messages.shift()

    // broadcast to all clients including sender
    io.emit('chat message', message)
  })

  socket.on('disconnect', (reason) => {
    console.log('socket disconnected', socket.id, reason)
  })
})

server.listen(PORT, () => {
  console.log(`Momo Chat backend listening on http://localhost:${PORT}`)
})
