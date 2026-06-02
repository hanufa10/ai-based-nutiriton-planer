import { apiFetch } from "../api";

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

  updateUser: (userId: number, data: Record<string, unknown>) =>
    apiFetch(`/admin/users/${userId}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteUser: (userId: number) => 
    apiFetch<{ message: string }>(`/admin/users/${userId}`, { method: "DELETE" }),

  getFoods: () =>
    apiFetch<
      Array<{
        id: number;
        foodName: string;
        foodCalories: number;
        foodProtein: number;
        carbs: number;
        fat: number;
        category: string;
        foodType: string;
      }>
    >("/admin/foods"),

  createFood: (food: Record<string, unknown>) =>
    apiFetch("/admin/foods", { method: "POST", body: JSON.stringify(food) }),

  deleteFood: (id: number) => 
    apiFetch<{ message: string }>(`/admin/foods/${id}`, { method: "DELETE" }),

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
