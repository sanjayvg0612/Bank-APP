import React, { useState } from 'react'
import { apiRequest } from '../api'

export default function Statement(){
  const [accountId, setAccountId] = useState('')
  const [days, setDays] = useState(30)

  function download(){
    const url = `${window.API_BASE||'/api'}/accounts/${accountId}/statement?format=csv&days=${days}`
    window.open(url, '_blank')
  }

  return (
    <div>
      <h1>Download Statement</h1>
      <div className="form-card">
        <label>Account ID</label>
        <input value={accountId} onChange={e=>setAccountId(e.target.value)} placeholder="Account ID" />
        <label>Days</label>
        <input type="number" value={days} onChange={e=>setDays(e.target.value)} />
        <button className="btn-primary" onClick={download}>Download CSV</button>
      </div>
    </div>
  )
}
