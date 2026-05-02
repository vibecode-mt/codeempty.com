export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export async function apiCall(endpoint: string, method: string = 'GET', body?: any) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = \Bearer \\;
  }

  const response = await fetch(\\\\, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    // Unauthorized - redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminEmail');
      window.location.href = '/admin/login';
    }
  }

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'API error');
  }

  return response.json();
}

export async function loginAdmin(email: string, password: string) {
  return apiCall('/api/admin/login', 'POST', { email, password });
}

export async function getPages() {
  return apiCall('/api/admin/content/pages');
}

export async function createPage(type: string, slug: string, title: string) {
  return apiCall('/api/admin/content/pages', 'POST', { type, slug, title });
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('adminToken');
  const response = await fetch(\\/api/admin/upload/image\, {
    method: 'POST',
    headers: { 'Authorization': \Bearer \\ },
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Upload failed');
  }

  return response.json();
}
