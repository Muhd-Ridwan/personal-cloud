const BASE_URL = import.meta.env.VITE_WORKER_URL || "http://localhost:8787";

// Get token from localStorage
function getToken() {
  return localStorage.getItem("auth_token");
}

// Base headers for every request
function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
  };
}

export const r2Service = {
  // Register new user
  async register(username, password) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    return data; // { token, username }
  },

  // Login existing user
  async login(username, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    return data; // { token, username }
  },

  // List all files for logged in user
  async listFiles() {
    const res = await fetch(`${BASE_URL}/files`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to list files");
    return data.files; // []
  },

  // Upload a file
  async uploadFile(file, onProgress, folderId = null) {
    const formData = new FormData();
    formData.append("file", file);
    if (folderId) formData.append("folderId", folderId);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${BASE_URL}/files/upload`);
      xhr.setRequestHeader("Authorization", `Bearer ${getToken()}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status === 201) resolve(data);
        else reject(new Error(data.error || "Upload failed"));
      };

      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.send(formData);
    });
  },

  // Download a file
  async downloadFile(key, filename) {
    const res = await fetch(
      `${BASE_URL}/files/download/${encodeURIComponent(key)}`,
      {
        headers: authHeaders(),
      },
    );
    if (!res.ok) throw new Error("Download failed");

    // Trigger browser download
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Delete a file
  async deleteFile(key) {
    const res = await fetch(`${BASE_URL}/files/${encodeURIComponent(key)}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Delete failed");
    return data;
  },

  async toggleStar(key) {
    const res = await fetch(
      `${BASE_URL}/files/star/${encodeURIComponent(key)}`,
      {
        method: "PATCH",
        headers: authHeaders(),
      },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to toggle star");
    return data;
  },

  async trashFile(key) {
    const res = await fetch(
      `${BASE_URL}/files/trash/${encodeURIComponent(key)}`,
      {
        method: "PATCH",
        headers: authHeaders(),
      },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to trash file");
    return data;
  },

  async restoreFile(key) {
    const res = await fetch(
      `${BASE_URL}/files/restore/${encodeURIComponent(key)}`,
      {
        method: "PATCH",
        headers: authHeaders(),
      },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to restore file");
    return data;
  },

  async listFolders() {
    const res = await fetch(`${BASE_URL}/folders`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to list folders");
    return data.folders;
  },

  async createFolder(name, parentFolderId = null) {
    const res = await fetch(`${BASE_URL}/folders`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ name, parentFolderId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create folder");
    return data;
  },

  async renameFolder(id, newName) {
    const res = await fetch(`${BASE_URL}/folders/rename/${id}`, {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ newName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to rename folder");
    return data;
  },

  async trashFolder(id) {
    const res = await fetch(`${BASE_URL}/folders/trash/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to trash folder");
    return data;
  },

  async restoreFolder(id) {
    const res = await fetch(`${BASE_URL}/folders/restore/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to restore folder");
    return data;
  },

  async deleteFolder(id) {
    const res = await fetch(`${BASE_URL}/folders/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete folder");
    return data;
  },

  async renameFile(key, newName) {
    const res = await fetch(
      `${BASE_URL}/files/rename/${encodeURIComponent(key)}`,
      {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ newName }),
      },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Rename Failed");
    return data;
  },

  async requestAccess(username, email, password, reason) {
    const res = await fetch(`${BASE_URL}/auth/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  },

  async forgotPassword(email) {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  },

  async resetPassword(token, newPassword) {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Reset failed");
    return data;
  },
};
