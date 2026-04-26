import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = Cookies.get('token');

  const headers = new Headers({
    'Content-Type': 'application/json',
    ...options.headers,
  });

  if (token && token !== 'undefined') {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        // Clear all session markers
        Cookies.remove('token');
        Cookies.remove('user');
        window.location.href = '/auth/login';
      }
    }
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Something went wrong');
  }

  return response.json();
}

export const api = {
  get: (endpoint: string) => fetchWithAuth(endpoint, { method: 'GET' }),
  post: (endpoint: string, data: any) => fetchWithAuth(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint: string, data: any) => fetchWithAuth(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (endpoint: string, data?: any) => fetchWithAuth(endpoint, { 
    method: 'PATCH', 
    body: data ? JSON.stringify(data) : undefined 
  }),
  delete: (endpoint: string) => fetchWithAuth(endpoint, { method: 'DELETE' }),
};
