const BASE_URL = import.meta.env.VITE_WORKER_URL || "http://localhost:8787";

function getToken() {
  return localStorage.getItem("auth_token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export const adminService = {
  // GET ALL PENDING/PROCESSED REQUESTS
  async listRequests() {
    const res = await fetch(`${BASE_URL}/admin/requests`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch requests");
    return data.requests;
  },

  // APPROVE A REQUEST
  async approveRequest(id) {
    const res = await fetch(`${BASE_URL}/admin/requests/${id}/approve`, {
      method: "POST",
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to approve request");
    return data;
  },

  // REJECT A REQUESTS
  async rejectRequest(id) {
    const res = await fetch(`${BASE_URL}/admin/requests/${id}/reject`, {
      method: "POST",
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to reject request");
    return data;
  },

  // GET ALL USERS
  async listUsers() {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch users");
    return data.users;
  },

  // DELETE A USER
  async deleteUser(username) {
    const res = await fetch(`${BASE_URL}/admin/users/${username}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete users");
    return data;
  },
};
