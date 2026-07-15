import React, { useState, useEffect } from 'react'
import { apiRequest } from '../api'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'


function StripeTopupForm(){
  const [amt, setAmt] = useState('')
  const [loading, setLoading] = useState(false)
  const stripe = useStripe()
  const elements = useElements()

  async function submit(e){
    e.preventDefault()
    if(!stripe || !elements) return
    setLoading(true)
    try{
      const res = await apiRequest('/topup', { method:'POST', body: { amount: parseFloat(amt) } })
      const clientSecret = res.client_secret || res.clientSecret || res.cs
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      })
      if(result.error) throw new Error(result.error.message)
      // confirm with backend if needed
      await apiRequest('/topup/confirm', { method:'POST', body: { id: res.id, amount: parseFloat(amt) } })
      alert('Top-up successful')
      setAmt('')
    }catch(err){
      alert(err.message || 'Payment failed')
    }finally{ setLoading(false) }
  }

  return (
    <div>
      <h2>Add Money</h2>
      <form onSubmit={submit}>
        <input type="number" step="0.01" placeholder="Amount" value={amt} onChange={e=>setAmt(e.target.value)} required />
        <div style={{margin:'12px 0'}}>
          <CardElement />
        </div>
        <button type="submit" disabled={loading || !stripe}>Pay</button>
      </form>
    </div>
  )
}

export default function Topup(){
  const [pubKey, setPubKey] = useState(window.STRIPE_PUBLISHABLE_KEY || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

  useEffect(()=>{
    if(pubKey) return
    (async ()=>{
      try{
        const res = await apiRequest('/config')
        if(res.stripe_publishable_key) setPubKey(res.stripe_publishable_key)
      }catch(e){}
    })()
  },[])

  if(pubKey){
    const stripePromise = loadStripe(pubKey)
    return (
      <Elements stripe={stripePromise}>
        <StripeTopupForm />
      </Elements>
    )
  }

  // Fallback mock flow when no publishable key is available
  const [amt, setAmt] = useState('')
  async function submit(e){
    e.preventDefault()
    try{
      const res = await apiRequest('/topup', { method:'POST', body: { amount: parseFloat(amt) } })
      await apiRequest('/topup/confirm', { method:'POST', body: { id: res.id, amount: parseFloat(amt) } })
      alert('Top-up successful (mock)')
      setAmt('')
    }catch(e){ alert(e.message) }
  }

  return (
    <div>
      <h2>Add Money (mock)</h2>
      <form onSubmit={submit}>
        <input type="number" step="0.01" value={amt} onChange={e=>setAmt(e.target.value)} required />
        <button type="submit">Top up</button>
      </form>
      <p style={{color:'#666'}}>No Stripe key configured — using mock flow.</p>
    </div>
  )
}
