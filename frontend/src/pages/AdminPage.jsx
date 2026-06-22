import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/adminService";
import Button from "../components/ui/Button";

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("requests"); // 'requests' | 'users'
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (tab === "requests") fetchRequests();
    if (tab === "users") fetchUsers();
  }, [tab]);

  async function fetchRequests() {
    try {
      setLoading(true);
      setError("");
      const data = await adminService.listRequests();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");
      const data = await adminService.listUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    try {
      setActionLoading(id);
      await adminService.approveRequest(id);
      await fetchRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id) {
    try {
      setActionLoading(id);
      await adminService.rejectRequest(id);
      await fetchRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteUser(username) {
    if (!confirm(`Are you sure you want to delete ${username}?`)) return;
    try {
      setActionLoading(username);
      await adminService.deleteUser(username);
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  function getStatusBadge(status) {
    const styles = {
      pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
      approved: "bg-green-500/10 text-green-400 border border-green-500/20",
      rejected: "bg-red-500/10 text-red-400 border border-red-500/20",
    };
    return (
      <span
        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${styles[status]}`}
      >
        {status}
      </span>
    );
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[rgba(79,142,247,0.12)] rounded-xl flex items-center justify-center">
            <Shield size={18} color="#4f8ef7" />
          </div>
          <div>
            <h1
              className="font-bold text-lg text-[#e8eaed] tracking-tight"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Admin Dashboard
            </h1>
            <p className="text-[12px] text-[#4a5568]">
              Logged in as {user?.username}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/drive")}>
          ← Back to Drive
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-[#13161b] border border-[#1d2229] rounded-xl p-1 ">
        <button
          onClick={() => setTab("requests")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
            ${
              tab === "requests"
                ? "bg-[#1a1e25] text-[#e8eaed]"
                : "text-[#8b95a3] hover:text-[#e8eaed]"
            }`}
        >
          <Clock size={14} />
          Requests
          {pendingCount > 0 && (
            <span className="bg-[#4f8ef7] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
            ${
              tab === "users"
                ? "bg-[#1a1e25] text-[#e8eaed]"
                : "text-[#8b95a3] hover:text-[#e8eaed]"
            }`}
        >
          <Users size={14} />
          Users
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 rounded-full border-2 border-[#4f8ef7] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Requests Tab */}
      {!loading && tab === "requests" && (
        <div className="flex flex-col gap-3">
          {requests.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-[#4a5568] text-sm">
              No requests yet.
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="bg-[#13161b] border border-[#1d2229] rounded-2xl p-5 flex items-start justify-between gap-4 overflow-hidden"
              >
                <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-[#e8eaed] text-sm">
                      {req.username}
                    </span>
                    {getStatusBadge(req.status)}
                  </div>
                  <span className="text-[12.5px] text-[#8b95a3] truncate">
                    {req.email}
                  </span>
                  <span className="text-[12.5px] text-[#4a5568]">
                    Reason: {req.reason}
                  </span>
                  <span className="text-[11.5px] text-[#4a5568]">
                    {new Date(req.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {req.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<CheckCircle size={13} />}
                      loading={actionLoading === req.id}
                      onClick={() => handleApprove(req.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<XCircle size={13} />}
                      loading={actionLoading === req.id}
                      onClick={() => handleReject(req.id)}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Users Tab */}
      {!loading && tab === "users" && (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Username", "Email", "Role", "Provider", "Created", ""].map(
                (h, i) => (
                  <th
                    key={i}
                    className="text-left text-[11px] font-semibold uppercase tracking-widest text-[#4a5568] pb-2.5 px-3 border-b border-[#1d2229]"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.username}
                className="border-b border-[#1d2229] last:border-b-0 hover:bg-[#1a1e25] transition-colors"
              >
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#4f8ef7] flex items-center justify-center text-xs font-bold text-white">
                      {u.username[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-[#e8eaed] font-medium">
                      {u.username}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 text-[12.5px] text-[#8b95a3]">
                  {u.email || "—"}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full border
                    ${
                      u.role === "admin"
                        ? "bg-[rgba(79,142,247,0.1)] text-[#4f8ef7] border-[rgba(79,142,247,0.2)]"
                        : "bg-[#1a1e25] text-[#8b95a3] border-[#252b36]"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-3 py-3 text-[12.5px] text-[#8b95a3]">
                  {u.provider}
                </td>
                <td className="px-3 py-3 text-[12.5px] text-[#8b95a3]">
                  {new Date(u.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-3 py-3">
                  {u.role !== "admin" && (
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 size={13} />}
                      loading={actionLoading === u.username}
                      onClick={() => handleDeleteUser(u.username)}
                    >
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
