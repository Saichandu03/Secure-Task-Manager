import React, { useState } from 'react';
import api from '../api';

export default function TaskForm({ onAdded }){
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e && e.preventDefault();
    if (!title.trim()) return;
    if (!description.trim()) return;
    setLoading(true);
    try{
      const r = await api.post('/tasks', { title: title.trim(), description: description.trim() });
      const created = (r && r.data && r.data.task) ? r.data.task : null;
      // clear local form regardless
      setTitle(''); setDescription('');
      // inform parent with created task so it can update state immediately
      if (onAdded) {
        try { onAdded(created); } catch(e) { console.warn('onAdded callback failed', e) }
      }
    }catch(err){
      console.error(err)
    }finally{ setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="mb-3">
      <div className="mb-2">
        <input className="form-control form-control-lg" placeholder="New task title" value={title} onChange={e=>setTitle(e.target.value)} required />
      </div>
      <div className="mb-2">
        <textarea className="form-control" placeholder="Task description (required)" value={description} onChange={e=>setDescription(e.target.value)} required />
      </div>
      <div className="d-flex justify-content-end">
        <button className="btn btn-primary d-flex align-items-center" disabled={loading}>
          {loading && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
          {loading ? 'Adding…' : 'Add task'}
        </button>
      </div>
    </form>
  )
}
