import { ApiError, apiFetch } from "../api";

export const adminApi = {
  getReport: () =>
    apiFetch<{
      totalUsers: number;
      totalFoods: number;
      totalFeedback: number;
    }>("/admin/reports"),

    
  getUsers: () =>
    apiFetch<Array<{ id: number; username: string; email: string; role: "user" | "admin" }>>(
      "/admin/users"
    ),
  // Add these to the adminApi object in src/lib/api/admin.ts
  getNutritionists: () => 
    apiFetch<Array<{ userId: number; username: string; email: string }>>("/admin/nutritionists"),

  createNutritionist: (data: { name: string; email: string; password: string; role: string }) => 
    apiFetch("/admin/nutritionists", { method: "POST", body: JSON.stringify(data) }),

  updateNutritionist: (userId: number, data: Record<string, unknown>) => 
    apiFetch(`/admin/nutritionists/${userId}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteNutritionist: (userId: number) => 
    apiFetch<{ message: string }>(`/admin/nutritionists/${userId}`, { method: "DELETE" }),
  updateUser: (userId: number, data: Record<string, unknown>) =>
    apiFetch(`/admin/users/${userId}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteUser: (userId: number) => 
    apiFetch<{ message: string }>(`/admin/users/${userId}`, { method: "DELETE" }),

  getFoods: () =>
    apiFetch<
      Array<{
        foodId: number;
        foodName: string;
        foodCalories: number;
        foodProtein: number;
        carbs: number;
        fat: number;
        category: string;
        foodType: string | null;
      }>
    >("/admin/foods"),
  getUsersByRole: async (role: string) => {
    const response = await fetch(`/api/admin/users?role=${role}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    if (!response.ok) throw new ApiError("Failed to fetch users by role", response.status);
    return response.json();
  },
  createFood: (food: Record<string, unknown>) =>
    apiFetch("/admin/foods", { method: "POST", body: JSON.stringify(food) }),

  updateFood: (foodId: number, food: Record<string, unknown>) =>
    apiFetch(`/admin/foods/${foodId}`, { method: "PUT", body: JSON.stringify(food) }),

  deleteFood: (foodId: number) =>
    apiFetch<{ message: string }>(`/admin/foods/${foodId}`, { method: "DELETE" }),

  getFeedback: (userId?: number) => {
    const query = userId ? `?userId=${userId}` : "";
    return apiFetch<
      Array<{ id: number; userId: number; rating: number; comment: string; createdAt: string }>
    >(`/admin/feedback${query}`);
  },

deleteFeedback: (feedbackId: number) =>
  apiFetch(`/admin/feedback/${feedbackId}`, {
    method: "DELETE",
  }),


};
