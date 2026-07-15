import React, { useState, useContext } from 'react'
import { apiRequest } from '../api'
import { AuthContext } from '../auth/AuthProvider'
import { useNavigate, Link } from 'react-router-dom'

export default function Login(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setUser } = useContext(AuthContext)
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    setError('')
    setLoading(true)
    try{
      const res = await apiRequest('/login', { method: 'post', body: { username, password } })
      setUser(res.user)
      nav('/')
    }catch(err){
      setError(err.message || 'Login failed')
    }finally{ setLoading(false) }
  }

  return (
    <div className="auth-card">
      <h2 style={{textAlign:'center', marginBottom:8}}>Welcome back</h2>
      <p className="auth-hint">Sign in to access your SecureBank account</p>
      {error && <div className="flash flash-error" style={{marginTop:12}}>{error}</div>}
      <form onSubmit={submit} style={{marginTop:12}}>
        <label>Username</label>
        <input autoFocus value={username} onChange={e=>setUsername(e.target.value)} placeholder="e.g. demo" required />
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" required />
        <button className="btn-primary" type="submit" disabled={loading} style={{marginTop:16}}>{loading? 'Signing in...':'Sign in'}</button>
      </form>
      <div className="auth-alt">New here? <Link to="/register">Create an account</Link></div>
      <div className="auth-hint" style={{marginTop:12}}>Demo: <strong>demo</strong> / <code>demo1234</code></div>
    </div>
  )
}
