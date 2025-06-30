import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(5);

  // ถ้าไม่มี state, กลับไปที่ "/"
  const redirectPath = location.state?.from || "/";

  useEffect(() => {
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    const redirect = setTimeout(() => navigate(redirectPath), 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [navigate, redirectPath]);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-red-400">🚫 Unauthorized</h1>
        <p className="text-lg">You don’t have permission to access this page.</p>
        <p className="text-sm text-gray-300">
          Redirecting you back to{" "}
          <span className="font-semibold">{redirectPath}</span> in{" "}
          <span className="font-bold">{countdown}</span> seconds...
        </p>
      </div>
    </div>
  );
}
