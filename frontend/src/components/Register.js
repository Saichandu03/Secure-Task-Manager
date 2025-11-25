import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function Register(){
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const submit = async (e)=>{
    e.preventDefault(); setError(null);
    try{
      const res = await api.post('/auth/register', form);
      setUser(res.data.user);
      navigate('/dashboard');
    }catch(err){
      setError(err.response?.data?.error || JSON.stringify(err.response?.data?.errors) || 'Register failed');
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-7">
        <div className="card p-4">
          <h4 className="mb-3">Create account</h4>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={submit} noValidate>
            <div className="mb-3">
              <label className="form-label">Full name</label>
              <input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required minLength={2} />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={6} />
              <div className="form-text">Choose a password of at least 6 characters.</div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">Already have an account? <a href="/login">Login</a></small>
              <button className="btn btn-success" type="submit">Create account</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
