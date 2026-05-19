import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = Cookies.get('token');

  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = new Headers({
    // Don't set Content-Type for FormData — the browser sets it (with boundary) automatically.
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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
  upload: (endpoint: string, formData: FormData) =>
    fetchWithAuth(endpoint, { method: 'POST', body: formData }),
};

// Uploads a single image to /api/uploads/image and returns the public URL.
// Handles both `{ data: "<url>" }` and `{ data: { url|imageUrl|path: "<url>" } }` response shapes.
export async function uploadImage(file: File, folder = 'parts'): Promise<string> {
  const formData = new FormData();
  formData.append('File', file);
  formData.append('Folder', folder);
  const res = await api.upload('/api/uploads/image', formData);
  if (!res?.success) throw new Error(res?.message || 'Image upload failed');
  const data = res.data;
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') {
    return data.url || data.imageUrl || data.path || data.location || '';
  }
  return '';
}
