import { apiFetch } from "./api";

// USERS
export const getUsers = () => apiFetch("/admin/users");

export const updateUser = (userId: number, data: any) =>
  apiFetch(`/admin/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteUser = (userId: number) =>
  apiFetch(`/admin/users/${userId}`, {
    method: "DELETE",
  });

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