import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Loader from './Loader';

export default function ProtectedRoute({ children }){
  const { user, loading } = useAuth();
  if (loading) return <> <Loader /> <div className="text-center py-5">Checking session...</div> </>

  if (!user) return <Navigate to="/login" replace />
  return children;
}
