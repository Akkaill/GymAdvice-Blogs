import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const [form, setForm] = useState({
    username: "",
    // email: "", // 🔒 ปิดไว้ก่อน สำหรับ future use
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const { register, error, loading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username is required";
    // if (!form.email.trim()) newErrors.email = "Email is required"; // future use
    if (!form.password.trim()) newErrors.password = "Password is required";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const res = await register(form.username, form.password);
    if (res?.success) {
      navigate("/login");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 shadow rounded font-inter">
      <h2 className="text-2xl font-semibold mb-6 text-center">Create Account</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Username"
            className={`w-full px-4 py-2 border rounded ${errors.username ? "border-red-500" : "border-gray-300"}`}
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
        </div>

        {/* Future: Enable this for email login/register
        <div>
          <input
            type="email"
            placeholder="Email"
            className={`w-full px-4 py-2 border rounded ${errors.email ? "border-red-500" : "border-gray-300"}`}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
        </div>
        */}

        <div>
          <input
            type="password"
            placeholder="Password"
            className={`w-full px-4 py-2 border rounded ${errors.password ? "border-red-500" : "border-gray-300"}`}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
        </div>

        <div>
          <input
            type="password"
            placeholder="Confirm Password"
            className={`w-full px-4 py-2 border rounded ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
          {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
