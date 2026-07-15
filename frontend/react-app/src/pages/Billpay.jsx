import React, { useEffect, useState } from 'react'
import { apiRequest } from '../api'

export default function Billpay(){
  const [billers, setBillers] = useState([])
  const [accountId, setAccountId] = useState('')
  const [billerId, setBillerId] = useState('')
  const [amount, setAmount] = useState('')

  useEffect(()=>{(async ()=>{ try{ const r = await apiRequest('/billers'); setBillers(r.billers) }catch(e){} })()},[])

  async function submit(e){
    e.preventDefault()
    try{
      await apiRequest('/billpay', { method:'POST', body: { account_id: parseInt(accountId), biller_id: parseInt(billerId), amount: parseFloat(amount) } })
      alert('Bill paid')
      setAmount('')
    }catch(err){ alert(err.message) }
  }

  return (
    <div>
      <h1>Pay Bill</h1>
      <form onSubmit={submit} className="form-card">
        <label>From account id</label>
        <input value={accountId} onChange={e=>setAccountId(e.target.value)} placeholder="Account ID" required />
        <label>Biller</label>
        <select value={billerId} onChange={e=>setBillerId(e.target.value)} required>
          <option value="">Select</option>
          {billers.map(b=> <option value={b.id} key={b.id}>{b.name}</option>)}
        </select>
        <label>Amount</label>
        <input type="number" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} required />
        <button className="btn-primary" type="submit">Pay</button>
      </form>
    </div>
  )
}
