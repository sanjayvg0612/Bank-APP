import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiRequest } from '../api'

export default function Account(){
  const { id } = useParams()
  const [acc, setAcc] = useState(null)
  const [txns, setTxns] = useState([])

  useEffect(()=>{(async ()=>{ try{ const r = await apiRequest(`/accounts/${id}`); setAcc(r.account); const t = await apiRequest(`/accounts/${id}/transactions`); setTxns(t.transactions) }catch(e){} })()},[id])

  if(!acc) return <div>Loading...</div>

  return (
    <div>
      <a href="/" className="back-link">&larr; Back</a>
      <h1>Account {acc.account_number}</h1>
      <div className="summary-card">
        <div className="summary-label">Balance</div>
        <div className="summary-value">₹ {acc.balance.toFixed(2)}</div>
      </div>

      <h2>Recent transactions</h2>
      {txns.length===0 && <div className="empty-state">No recent transactions</div>}
      {txns.length>0 && (
        <table className="txn-table">
          <thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Balance</th></tr></thead>
          <tbody>
            {txns.map(t=> (
              <tr key={t.id}><td>{new Date(t.timestamp).toLocaleString()}</td><td>{t.description}</td><td className={t.type==='credit'? 'credit':'debit'}>{t.amount}</td><td>{t.balance_after}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
