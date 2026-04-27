'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: 'Admin' | 'Staff' | 'Customer';
  fullName: string;
  phoneNumber: string;
  address: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  verifyLoginOtp: (email: string, otp: string) => Promise<any>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const profileResponse = await api.get('/api/me');
      const userData = profileResponse.success ? profileResponse.data : profileResponse;
      
      setUser(userData);
      Cookies.set('user', JSON.stringify(userData), { expires: 7 });
      return userData;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  };

  useEffect(() => {
    const userCookie = Cookies.get('user');
    const token = Cookies.get('token');
    
    if (userCookie && token && token !== 'undefined') {
      setUser(JSON.parse(userCookie));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    return await api.post('/api/Login', { email, password });
  };

  const verifyLoginOtp = async (email: string, otp: string) => {
    const response = await api.post('/api/Login/verify-otp', { email, otp });
    
    if (response.success) {
      const token = response.data;
      Cookies.set('token', token, { expires: 7 });

      const userData = await refreshUser();
      if (userData) {
        const dashboard = userData.role === 'Admin' ? '/admin/dashboard' : userData.role === 'Staff' ? '/staff/dashboard' : '/customer/dashboard';
        router.push(dashboard);
      }
    }
    return response;
  };

  const register = async (data: any) => {
    await api.post('/api/Customers', data);
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyLoginOtp, logout, register, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
