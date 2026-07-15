import React, { useContext } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { apiRequest } from './api'
import { AuthContext } from './auth/AuthProvider'

export default function App(){
  const { setUser } = useContext(AuthContext)
  async function logout(){
    try{ await apiRequest('/logout', { method: 'POST' }) }catch(e){}
    setUser(null)
  }
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">SecureBank</Link>
          <nav className="nav">
            <Link to="/transfer">Transfer</Link>
            <Link to="/beneficiaries">Beneficiaries</Link>
            <Link to="/billpay">Billpay</Link>
            <Link to="/statement">Statement</Link>
            <Link to="/topup">Add money</Link>
            <Link to="/notifications">Notifications</Link>
            <a href="#" onClick={e=>{ e.preventDefault(); logout(); }} style={{marginLeft:12, color:'#fff'}}>Logout</a>
          </nav>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  )
}
