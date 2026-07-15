import React, { useEffect, useState } from 'react'
import { apiRequest } from '../api'
import { Link } from 'react-router-dom'

export default function Dashboard(){
  const [accounts, setAccounts] = useState([])
  const [total, setTotal] = useState(0)

  useEffect(()=>{(async ()=>{ try{ const r = await apiRequest('/accounts'); setAccounts(r.accounts); setTotal(r.total_balance) }catch(e){} })()},[])

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="summary-card">
        <div className="summary-label">Total balance</div>
        <div className="summary-value">₹ {total.toFixed(2)}</div>
        <div className="summary-sub">Quick actions</div>
        <div className="quick-actions">
          <Link to="/transfer" className="btn-primary">Transfer</Link>
          <Link to="/topup" className="btn-secondary">Add money</Link>
        </div>
      </div>

      <h2>Your accounts</h2>
      <div className="account-grid">
        {accounts.map(a=> (
          <Link to={`/account/${a.id}`} className="account-card" key={a.id}>
            <div className="account-type">{a.type || 'Savings'}</div>
            <div className="account-number">{a.account_number}</div>
            <div className="account-balance">₹ {a.balance.toFixed(2)}</div>
          </Link>
        ))}
        {accounts.length===0 && <div className="empty-state">No accounts found.</div>}
      </div>
    </div>
  )
}
