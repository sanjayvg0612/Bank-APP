import React, { useState, useContext } from 'react'
import { apiRequest } from '../api'
import { AuthContext } from '../auth/AuthProvider'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { setUser } = useContext(AuthContext)
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    try{
      const res = await apiRequest('/login', { method: 'post', body: { username, password } })
      setUser(res.user)
      nav('/')
    }catch(err){
      alert(err.message)
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div>
          <input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} required />
        </div>
        <div>
          <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  )
}
