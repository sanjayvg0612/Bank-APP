import React, { useState } from 'react'
import { apiRequest } from '../api'

export default function Topup(){
  const [amt, setAmt] = useState('')
  async function submit(e){ e.preventDefault(); try{ const res = await apiRequest('/topup', { method:'POST', body: { amount: parseFloat(amt) } });
      // for demo, immediately confirm
      await apiRequest('/topup/confirm', { method:'POST', body: { id: res.id, amount: parseFloat(amt) } });
      alert('Top-up successful')
    }catch(e){ alert(e.message) } }
  return (
    <div>
      <h2>Add Money</h2>
      <form onSubmit={submit}>
        <input type="number" step="0.01" value={amt} onChange={e=>setAmt(e.target.value)} required />
        <button type="submit">Top up</button>
      </form>
    </div>
  )
}
