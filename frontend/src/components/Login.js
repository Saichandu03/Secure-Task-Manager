import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function Login(){
  const [form, setForm] = useState({ email:'', password:'' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const submit = async (e)=>{
    e.preventDefault(); setError(null);
    try{
      const res = await api.post('/auth/login', form);
      // update global auth state so navbar updates immediately
      setUser(res.data.user);
      navigate('/dashboard');
    }catch(err){
      setError(err.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card p-4">
          <h4 className="mb-3">Login</h4>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={submit} noValidate>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
              <div className="form-text">We'll never share your email.</div>
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={6} />
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">Need an account? <a href="/register">Register</a></small>
              <button className="btn btn-primary" type="submit">Login</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
