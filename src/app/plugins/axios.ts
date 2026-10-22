import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || '/api/',
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
})

export default api
