import React, { createContext, useState, useEffect } from 'react'
import { apiRequest } from '../api'

export const AuthContext = createContext()

export default function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    (async ()=>{
      try{
        const res = await apiRequest('/me')
        setUser(res.user)
      }catch(e){
        setUser(null)
      }finally{
        setLoading(false)
      }
    })()
  },[])

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
