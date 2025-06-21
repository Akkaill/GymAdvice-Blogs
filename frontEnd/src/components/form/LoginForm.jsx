import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

export default function LoginForm() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const { login, error, loading } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const res = await login(form);
    if (res.success) {
      navigate("/dashboard");
    } else if (res.requireVerification) {
      alert("OTP verification required.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 shadow rounded font-inter">
      <h2 className="text-2xl font-semibold mb-6 text-center pb-1.5">Welcome</h2>
      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Username"
            className={`w-full px-4 py-2 border-2 rounded ${errors.username ? "border-red-500" : "border-gray-200"}`}
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
        </div>

        {/* Future: Enable email login here
        <input
          type="email"
          placeholder="Email"
          disabled
          className="w-full px-4 py-2 border rounded bg-gray-100 cursor-not-allowed"
        />
        */}

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className={`w-full px-4 py-2 border rounded ${errors.password ? "border-red-500" : "border-gray-200"}`}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-0.5 cursor-pointer text-sm text-blue-500"
          >
            {showPassword ? "Hide" : "Show"}
          </span>
          {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
