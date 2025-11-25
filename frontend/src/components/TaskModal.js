import React, { useEffect, useState } from 'react';

export default function TaskModal({ show, task, onClose, onSave, saving = false }){
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(()=>{
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setCompleted(!!task.completed);
    } else {
      setTitle(''); setDescription(''); setCompleted(false);
    }
  }, [task]);

  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-center">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Edit task</h5>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input className={`form-control ${errors.title ? 'is-invalid' : ''}`} value={title} onChange={e=>setTitle(e.target.value)} />
              {errors.title && <div className="invalid-feedback">{errors.title}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea className={`form-control ${errors.description ? 'is-invalid' : ''}`} value={description} onChange={e=>setDescription(e.target.value)} />
              {errors.description && <div className="invalid-feedback">{errors.description}</div>}
            </div>
            <div className="form-check mb-3">
              <input className="form-check-input" type="checkbox" id="markComplete" checked={completed} onChange={e=>setCompleted(e.target.checked)} />
              <label className="form-check-label" htmlFor="markComplete">Mark complete</label>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" disabled={saving} onClick={()=>{
                const errs = {};
                if (!title || !title.trim()) errs.title = 'Title is required';
                if (!description || !description.trim()) errs.description = 'Description is required';
                setErrors(errs);
                if (Object.keys(errs).length === 0) onSave({ ...task, title: title.trim(), description: description.trim(), completed });
              }}>
                {saving && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
