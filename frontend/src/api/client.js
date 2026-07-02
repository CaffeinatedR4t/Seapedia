import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request if present
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('seapedia_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 — clear token (don't redirect here, let components handle it)
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('seapedia_token')
      localStorage.removeItem('seapedia_user')
    }
    return Promise.reject(err)
  }
)

export default client
