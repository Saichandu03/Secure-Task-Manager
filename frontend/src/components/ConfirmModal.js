import React from 'react';

export default function ConfirmModal({ show, title = 'Confirm', message, onCancel, onConfirm, confirmText = 'Delete', loading = false }){
  if (!show) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-center">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">{title}</h5>
            <p className="card-text">{message}</p>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-outline-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
              <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
                {loading ? 'Deleting…' : confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
