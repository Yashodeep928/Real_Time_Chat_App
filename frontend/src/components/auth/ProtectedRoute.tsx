
import { Outlet, Navigate } from 'react-router-dom';

const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem('token');
  const currentUser = localStorage.getItem('currentUser');

  console.log('🔒 Protected Route Check:', { 
    isAuthenticated: !!isAuthenticated,
    currentUser: currentUser ? JSON.parse(currentUser) : null 
  });

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
