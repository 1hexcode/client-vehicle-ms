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
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const NAMEID_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
const EMAIL_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

function userFromJwt(token: string): User {
  const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  return {
    id: payload[NAMEID_CLAIM] ?? '',
    email: payload[EMAIL_CLAIM] ?? '',
    role: (payload[ROLE_CLAIM] ?? 'Customer') as User['role'],
    fullName: '',
    phoneNumber: '',
    address: '',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const response = await api.get('/api/me');
      // Assuming response follows the same ApiResponse pattern
      const userData = response.success ? response.data : response;
      setUser(userData);
      Cookies.set('user', JSON.stringify(userData), { expires: 7 });
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
    // 1. Call Login API
    const response = await api.post('/api/Login', { email, password });

    // The backend returns an ApiResponse<string> where the token is in the .data field
    if (response.success) {
      const token = response.data;
      Cookies.set('token', token, { expires: 7 });

      const userData = userFromJwt(token);
      setUser(userData);
      Cookies.set('user', JSON.stringify(userData), { expires: 7 });

      const dashboard = userData.role === 'Admin' ? '/admin/dashboard' : userData.role === 'Staff' ? '/staff/dashboard' : '/customer/dashboard';
      router.push(dashboard);
    } else {
      throw new Error(response.message || 'Login failed');
    }
  };

  const register = async (data: any) => {
    await api.post('/api/Customers/register', data);
    await login(data.email, data.password);
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
