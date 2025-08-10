'use client';

import React, { createContext, useContext } from 'react';
import { useAuth as useAuthStore } from '@/lib/auth';

// Re-export the auth hook from the store
export const useAuth = useAuthStore;

// Create a context for consistency (though we're using Zustand)
const AuthContext = createContext(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthContext.Provider value={null}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
