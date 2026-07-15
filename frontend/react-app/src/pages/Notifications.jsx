import React, { useEffect, useState } from 'react'
import { apiRequest } from '../api'

export default function Notifications(){
  const [list, setList] = useState([])
  useEffect(()=>{(async()=>{ try{ const r = await apiRequest('/notifications'); setList(r.notifications) }catch(e){} })();
    const es = new EventSource('/api/notifications/stream');
    es.onmessage = (ev) => { try{ const obj = JSON.parse(ev.data.replace(/'/g,'"')); apiRequest('/notifications').then(r=>setList(r.notifications)) }catch(e){} }
    return ()=> es.close()
  },[])
  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {list.map(n=> <li key={n.id}>{n.message} <small>{new Date(n.timestamp).toLocaleString()}</small></li>)}
      </ul>
    </div>
  )
}
