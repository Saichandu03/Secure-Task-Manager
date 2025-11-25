import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import Loader from './Loader';

// Navbar: top navigation showing auth state and user actions
export default function Navbar(){
  const { user, setUser, loading, refresh } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const navigate = useNavigate();


  const logout = async ()=>{
    try { await api.post('/auth/logout'); } catch(e) {}
    setUser(null);
    navigate('/login');
  }

  useEffect(()=>{
    if(typeof loading !== 'undefined' && !loading && !user){
    }
  },[loading, user]);

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-white shadow-sm">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <span className="me-2 badge bg-primary rounded-pill">ST</span>
          <span>Secure Task</span>
        </Link>

        <button className="navbar-toggler" type="button" onClick={()=>setMenuOpen(!menuOpen)}>
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav ms-auto align-items-center">
            {loading ? (
              <li className="nav-item">
                <div className="d-flex align-items-center px-2"><Loader size="sm" /></div>
              </li>
            ) : user ? (
              <>
                <li className="nav-item me-3 d-none d-md-block">
                  {}
                </li>
                <li className="nav-item d-flex align-items-center position-relative">
                  <button className="avatar" title={user.name}>
                    {user.name ? user.name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() : 'U'}
                  </button>
                  <button className="btn btn-outline-secondary btn-sm ms-2 d-none d-md-inline" onClick={logout}>Logout</button>
                  {avatarOpen && (
                    <div className="avatar-dropdown card p-2">
                      <Link to="/profile" className="d-block mb-2">Profile</Link>
                    </div>
                  )}
                </li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                <li className="nav-item ms-2"><Link className="btn btn-sm btn-primary" to="/register">Get started</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
