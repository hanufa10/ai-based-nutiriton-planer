const API_URL = "https://nutiplanner-api-2.onrender.com";

function getToken() {
  return localStorage.getItem("auth_token");
}

export const adminApi = {
  async getUsers() {
    const res = await fetch(`${API_URL}/admin/users`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    return res.json();
  },

  async deleteUser(userId: number) {
    await fetch(`${API_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },

  async getReport() {
    const res = await fetch(`${API_URL}/admin/reports`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    return res.json();
  },

  async getFeedback() {
    const res = await fetch(`${API_URL}/admin/feedback`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    return res.json();
  },

  async deleteFeedback(id: number) {
    await fetch(`${API_URL}/admin/feedback/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },

  async getFoods() {
    const res = await fetch(`${API_URL}/admin/foods`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    return res.json();
  },

  async createFood(food: any) {
    const res = await fetch(`${API_URL}/admin/foods`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(food),
    });

    return res.json();
  },

  async deleteFood(id: number) {
    await fetch(`${API_URL}/admin/foods/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  },
};