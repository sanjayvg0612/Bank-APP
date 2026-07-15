import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Transfer from './pages/Transfer'
import Beneficiaries from './pages/Beneficiaries'
import Topup from './pages/Topup'
import Notifications from './pages/Notifications'

import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}> 
          <Route index element={<Transfer />} />
          <Route path="transfer" element={<Transfer />} />
          <Route path="beneficiaries" element={<Beneficiaries />} />
          <Route path="topup" element={<Topup />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
