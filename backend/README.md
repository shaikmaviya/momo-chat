# Momo Chat — Backend

Simple Express + Socket.IO backend for the Momo Chat app.

Quick start

1. cd into the `backend` folder
2. npm install
3. npm run start

 This server exposes:
 - GET /health — basic health check
 - GET /messages — returns in-memory chat history
 
 Additional HTTP API:
 - POST /messages — send a message by HTTP JSON body { user, text, time } (broadcasts to all socket clients and returns the persisted message)
 - GET /messages — returns in-memory chat history


Socket.IO events:
- client -> server: `join` { user }
- client -> server: `chat message` { user, text, time }
- server -> client: `chat message` { user, text, time }
- server -> client: `chat history` [messages]

Test the health check with:
```
curl http://localhost:3000/health
```
