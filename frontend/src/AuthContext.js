import React, { createContext, useContext, useEffect, useState } from 'react';
import api from './api';

const AuthContext = createContext();

export function AuthProvider({ children }){
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    let mounted = true;
    api.get('/auth/me').then(r=>{ if(mounted) setUser(r.data.user) }).catch(()=>{ if(mounted) setUser(null) }).finally(()=>{ if(mounted) setLoading(false) });
    return ()=> mounted = false;
  },[]);

  const refresh = async ()=>{
    setLoading(true);
    try{ const r = await api.get('/auth/me'); setUser(r.data.user); }catch(e){ setUser(null) }finally{ setLoading(false) }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  return useContext(AuthContext);
}
