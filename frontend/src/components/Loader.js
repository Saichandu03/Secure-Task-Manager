import React from 'react';

export default function Loader({ size = 'lg', text, overlay = false }){
  const cls = size === 'sm' ? 'app-spinner sm' : 'app-spinner';

  const spinner = (
    <div className={cls} role="status" aria-live="polite" aria-busy="true">
      <svg className="spinner-svg" viewBox="0 0 50 50" aria-hidden="true">
        <defs>
          <linearGradient id="g" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#2b3940" />
            <stop offset="100%" stopColor="#59606a" />
          </linearGradient>
        </defs>
        <circle className="path" cx="25" cy="25" r="20" fill="none" stroke="url(#g)" strokeWidth="5" strokeLinecap="round" />
      </svg>
      {text && <div className="text-muted mt-2 small">{text}</div>}
    </div>
  );

  if(overlay){
    return (
      <div className="loader-overlay">
        <div className="card p-3 shadow-sm text-center">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
}
