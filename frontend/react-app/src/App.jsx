import React from 'react'
import { Link, Outlet } from 'react-router-dom'

export default function App(){
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">SecureBank</Link>
          <nav className="nav">
            <Link to="/transfer">Transfer</Link>
            <Link to="/beneficiaries">Beneficiaries</Link>
            <Link to="/topup">Add money</Link>
            <Link to="/notifications">Notifications</Link>
          </nav>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  )
}
