'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  role: 'Admin' | 'Staff' | 'Customer';
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userCookie = Cookies.get('user');
    const token = Cookies.get('token');
    
    if (userCookie && token) {
      setUser(JSON.parse(userCookie));
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    // Set cookies with 7 days expiry
    Cookies.set('token', token, { expires: 7 });
    Cookies.set('user', JSON.stringify(userData), { expires: 7 });
    
    setUser(userData);
    
    const dashboard = userData.role === 'Admin' ? '/admin/dashboard' : userData.role === 'Staff' ? '/staff/dashboard' : '/customer/dashboard';
    router.push(dashboard);
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
