import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Transfer from './pages/Transfer'
import Beneficiaries from './pages/Beneficiaries'
import Topup from './pages/Topup'
import Notifications from './pages/Notifications'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Account from './pages/Account'
import Billpay from './pages/Billpay'
import Register from './pages/Register'
import Statement from './pages/Statement'
import AuthProvider from './auth/AuthProvider'
import RequireAuth from './auth/RequireAuth'

import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/*" element={<RequireAuth><App/></RequireAuth>}>
            <Route index element={<Dashboard />} />
            <Route path="transfer" element={<Transfer />} />
            <Route path="beneficiaries" element={<Beneficiaries />} />
            <Route path="billpay" element={<Billpay />} />
            <Route path="statement" element={<Statement />} />
            <Route path="topup" element={<Topup />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="account/:id" element={<Account />} />
          </Route>
          <Route path="/register" element={<Register/>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
