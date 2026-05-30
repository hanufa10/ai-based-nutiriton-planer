// Detect environment or fallback to production
const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:4001' 
  : 'https://nutiplanner-api-2.onrender.com';

// Generic authed request helper mimicking your system architecture
async function fetchAdmin<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('auth_token'); // Matches standard auth patterns
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`Admin API Error: ${res.statusText}`);
  return res.json();
}

export const adminApi = {
  // GET /admin/reports
  getReport: () => fetchAdmin<{
    totalUsers: number;
    totalFoods: number;
    activePlansToday: number;
    cosineSimilarityJobStatus: string;
    lastCronRun: string;
  }>('/admin/reports'),

  // GET /admin/users
  getUsers: () => fetchAdmin<Array<{ id: number; username: string; email: string; role: 'user' | 'admin' }>>('/admin/users'),

  // PUT /admin/users/{userId}
  updateUser: (userId: number, data: { username: string; email: string; role: string }) => 
    fetchAdmin(`/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify(data) }),

  // DELETE /admin/users/{userId}
  deleteUser: (userId: number) => fetchAdmin(`/admin/users/${userId}`, { method: 'DELETE' }),

  // GET /admin/foods
  getFoods: () => fetchAdmin<Array<{ id: number; foodName: string; foodCalories: number; foodProtein: number; carbs: number; fat: number; category: string; foodType: string }>>('/admin/foods'),

  // POST /admin/foods
  createFood: (food: { foodName: string; foodCalories: number; foodProtein: number; carbs: number; fat: number; category: string; foodType: string }) =>
    fetchAdmin('/admin/foods', { method: 'POST', body: JSON.stringify(food) }),

  // DELETE /admin/foods/{id}
  deleteFood: (id: number) => fetchAdmin(`/admin/foods/${id}`, { method: 'DELETE' }),

  // GET /admin/feedback
  getFeedback: (params?: { userId?: number; rating?: number }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return fetchAdmin<Array<{ id: number; userId: number; rating: number; comment: string; createdAt: string }>>(`/admin/feedback${query}`);
  },
};