import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardStore } from "@/store/dashboardStore";
import { useAuthStore } from "@/store/auth";
import {Spinner} from "@chakra-ui/react"; 

export default function Dashboard() {
  const {
    stats,
    recentLogs,
    fetchStats,
    fetchRecentLogs,
    loadingStats,
    loadingLogs,
  } = useDashboardStore();

  const { user, loading: authLoading } = useAuthStore();
  const navigate = useNavigate();

  // ✅ เช็คสิทธิ์ก่อนเข้าหน้านี้
  useEffect(() => {
    if (!authLoading) {
      if (!user || !["admin", "superadmin"].includes(user.role)) {
        navigate("/unauthorized"); // หรือ "/login"
      }
    }
  }, [authLoading, user, navigate]);

  // ✅ ถ้ายังโหลด user หรือ dashboard → รอ
  useEffect(() => {
    if (user && ["admin", "superadmin"].includes(user.role)) {
      fetchStats();
      fetchRecentLogs();
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <Spinner /> {/* หรือใช้ text "Loading..." ก็ได้ */}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 space-y-4">
        <h2 className="text-2xl font-bold text-blue-400">Admin Panel</h2>
        <nav className="space-y-2">
          <a href="#" className="block py-2 px-4 rounded hover:bg-gray-700 transition">📊 Dashboard</a>
          <a href="#" className="block py-2 px-4 rounded hover:bg-gray-700 transition">👥 Users</a>
          <a href="#" className="block py-2 px-4 rounded hover:bg-gray-700 transition">📜 Logs</a>
          <a href="#" className="block py-2 px-4 rounded hover:bg-gray-700 transition">⚙️ Settings</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <div className="flex items-center space-x-3">
            <span>👤 {user?.role}</span>
            <button className="bg-red-500 px-4 py-1 rounded hover:bg-red-600 transition">Logout</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingStats ? (
            <p className="text-white col-span-full">Loading stats...</p>
          ) : (
            stats &&
            Object.entries(stats).map(([key, value]) => (
              <div
                key={key}
                className="p-6 rounded-lg bg-blue-600 shadow hover:bg-blue-700 transition"
              >
                <h2 className="text-lg capitalize">{key}</h2>
                <p className="text-3xl font-bold">{value ?? "..."}</p>
              </div>
            ))
          )}
        </div>

        {/* Recent Logs */}
        <div className="bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-xl mb-4 font-semibold">Recent Logs</h2>
          {loadingLogs ? (
            <p className="text-white">Loading logs...</p>
          ) : recentLogs.length === 0 ? (
            <p className="text-gray-400">No logs found.</p>
          ) : (
            <table className="w-full text-left table-auto text-white">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="py-2">Action</th>
                  <th className="py-2">User</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr
                    key={log._id}
                    className="border-b border-gray-700 hover:bg-gray-700 transition"
                  >
                    <td className="py-2">{log.action}</td>
                    <td className="py-2">{log.performedBy?.username || "Unknown"}</td>
                    <td className="py-2">{log.performedBy?.role || "-"}</td>
                    <td className="py-2">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
