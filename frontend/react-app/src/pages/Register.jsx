import React, { useState } from 'react'
import { apiRequest } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    try{
      await apiRequest('/register', { method:'POST', body: { username, password } })
      alert('Registered; please login')
      nav('/login')
    }catch(err){ alert(err.message) }
  }

  return (
    <div className="auth-card">
      <h2>Create account</h2>
      <form onSubmit={submit}>
        <label>Username</label>
        <input value={username} onChange={e=>setUsername(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="btn-primary" type="submit">Register</button>
      </form>
      <div className="auth-alt">Already have an account? <a href="/login">Login</a></div>
    </div>
  )
}
