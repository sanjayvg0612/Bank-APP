import React, { useEffect, useState } from 'react'
import { apiRequest } from '../api'

export default function Beneficiaries(){
  const [list, setList] = useState([])
  const [form, setForm] = useState({ name: '', account_number: '', ifsc: '' })
  useEffect(()=>{(async()=>{ try{ const r = await apiRequest('/beneficiaries'); setList(r.beneficiaries) }catch(e){} })()},[])
  async function add(e){ e.preventDefault(); try{ const r = await apiRequest('/beneficiaries', { method: 'post', body: form }); setList(l=>[r.beneficiary, ...l]); setForm({ name:'', account_number:'', ifsc:'' }) }catch(e){ alert(e.message) } }
  async function del(id){ try{ await apiRequest(`/beneficiaries/${id}`, { method:'DELETE' }); setList(l=>l.filter(x=>x.id!==id)) }catch(e){ alert(e.message) } }
  return (
    <div>
      <h2>Beneficiaries</h2>
      <form onSubmit={add}>
        <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
        <input placeholder="Account number" value={form.account_number} onChange={e=>setForm({...form, account_number:e.target.value})} required />
        <input placeholder="IFSC" value={form.ifsc} onChange={e=>setForm({...form, ifsc:e.target.value})} />
        <button type="submit">Add</button>
      </form>
      <ul>
        {list.map(b=> <li key={b.id}>{b.name} - {b.account_number} <button onClick={()=>del(b.id)}>Delete</button></li>)}
      </ul>
    </div>
  )
}
