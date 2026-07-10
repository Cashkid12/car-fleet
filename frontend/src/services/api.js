import axios from 'axios'
import offlineSync from '../utils/offlineSync'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(async (config) => {
  try {
    const token = await window.Clerk?.session?.getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch {}
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (!navigator.onLine && error.config.method !== 'get') {
      // Queue write operations for later sync
      return Promise.reject({ ...error, offline: true })
    }
    if (error.response?.status === 401) {
      console.warn('API 401 — session may have expired')
    }
    return Promise.reject(error)
  }
)

export default api