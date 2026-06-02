import { apiFetch } from "./api";

// USERS
export const getUsers = () => apiFetch("/admin/users");

export const updateUser = (userId: number, data: any) =>
  apiFetch(`/admin/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export async function deleteUser(userId: number) {
  const response = await fetch(`/admin/users/${userId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete user");
  }
}

// REPORTS
export const getReports = () => apiFetch("/admin/reports");

// FEEDBACK
export const getFeedback = () => apiFetch("/admin/feedback");

export const deleteFeedback = (id: number) =>
  apiFetch(`/admin/feedback/${id}`, {
    method: "DELETE",
  });

// FOODS
export const getFoods = () => apiFetch("/admin/foods");

export const createFood = (data: any) =>
  apiFetch("/admin/foods", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateFood = (id: number, data: any) =>
  apiFetch(`/admin/foods/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteFood = (id: number) =>
  apiFetch(`/admin/foods/${id}`, {
    method: "DELETE",
  });