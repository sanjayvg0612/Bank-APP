import axios from 'axios'

const API_BASE = window.API_BASE || '/api'
const client = axios.create({ baseURL: API_BASE, withCredentials: true })

export async function apiRequest(path, opts={}){
  const method = opts.method || 'get'
  const data = opts.body || opts.data
  try {
    const res = await client.request({ url: path, method, data })
    return res.data
  } catch (e) {
    const msg = e.response?.data?.error || e.message || 'Request failed'
    throw new Error(msg)
  }
}

export default client
