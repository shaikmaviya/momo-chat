export async function sendMessageRest({ user, text, time } = {}) {
  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, text, time })
  })
  if (!res.ok) throw new Error('Failed to send message')
  return res.json()
}

// If frontend is served from a different origin than backend during dev,
// you may want to call the backend URL directly, e.g.:
export function sendMessageToBackendUrl({ user, text, time }, backendUrl = 'http://localhost:3000') {
  return fetch(`${backendUrl}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, text, time })
  }).then(res => {
    if (!res.ok) throw new Error('Failed')
    return res.json()
  })
}
