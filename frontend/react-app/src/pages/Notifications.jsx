import React, { useEffect, useState } from 'react'
import { apiRequest } from '../api'

export default function Notifications(){
  const [list, setList] = useState([])
  useEffect(()=>{
    (async()=>{ try{ const r = await apiRequest('/notifications'); setList(r.notifications) }catch(e){} })();
    const base = window.API_BASE || '/api'
    const es = new EventSource(base + '/notifications/stream')
    es.onmessage = (ev) => {
      try{
        const obj = JSON.parse(ev.data)
        // prepend new notification
        setList(prev => [obj, ...prev].slice(0,50))
      }catch(e){}
    }
    es.onerror = () => {
      // reconnect will be attempted by the browser; could add backoff here
    }
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
