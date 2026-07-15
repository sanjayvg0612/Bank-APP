import React, { useEffect, useState } from 'react'
import { apiRequest } from '../api'

export default function Transfer(){
  const [accounts, setAccounts] = useState([])
  const [beneficiaries, setBeneficiaries] = useState([])
  const [form, setForm] = useState({ from_account: '', beneficiary_id: '', to_account_number: '', amount: '' })

  useEffect(()=>{(async()=>{
    const d = await apiRequest('/accounts')
    setAccounts(d.accounts)
    if (d.accounts[0]) setForm(f=>({ ...f, from_account: d.accounts[0].id }))
    try{
      const b = await apiRequest('/beneficiaries'); setBeneficiaries(b.beneficiaries)
    }catch(e){}
  })()},[])

  async function submit(e){
    e.preventDefault()
    try{
      const payload = { ...form }
      if (!payload.beneficiary_id) delete payload.beneficiary_id
      await apiRequest('/transfer', { method: 'post', body: payload })
      alert('Transfer successful')
    }catch(e){ alert(e.message) }
  }

  return (
    <div>
      <h2>Transfer funds</h2>
      <form onSubmit={submit}>
        <label>From</label>
        <select value={form.from_account} onChange={e=>setForm({...form, from_account: e.target.value})}>
          {accounts.map(a=> <option key={a.id} value={a.id}>{a.account_type} - {a.account_number} (Rs. {a.balance.toFixed(2)})</option>)}
        </select>

        <label>Beneficiary</label>
        <select value={form.beneficiary_id} onChange={e=>setForm({...form, beneficiary_id: e.target.value, to_account_number: ''})}>
          <option value="">-- none --</option>
          {beneficiaries.map(b=> <option key={b.id} value={b.id} data-account={b.account_number}>{b.name} - {b.account_number}</option>)}
        </select>

        <label>Or enter account</label>
        <input value={form.to_account_number} onChange={e=>setForm({...form, to_account_number: e.target.value, beneficiary_id: ''})} />

        <label>Amount</label>
        <input type="number" step="0.01" value={form.amount} onChange={e=>setForm({...form, amount: e.target.value})} />

        <button type="submit">Send</button>
      </form>
    </div>
  )
}
