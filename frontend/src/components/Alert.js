import React, { useEffect, useState } from 'react';

export default function Alert({ type='info', children, onClose, duration = 4000 }){
  const [visible, setVisible] = useState(true);
  useEffect(()=>{
    if (!duration) return;
    const t = setTimeout(()=>{ setVisible(false); onClose && onClose(); }, duration);
    return () => clearTimeout(t);
  },[duration]);
  if (!visible) return null;
  return (
    <div className={`alert alert-${type} alert-fixed`} role="alert">
      <div className="d-flex justify-content-between align-items-start">
        <div>{children}</div>
        <button type="button" className="btn-close ms-3" aria-label="Close" onClick={()=>{ setVisible(false); onClose && onClose(); }} />
      </div>
    </div>
  );
}
