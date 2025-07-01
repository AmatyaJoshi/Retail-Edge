import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// This is a wrapper around the context for better imports
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};