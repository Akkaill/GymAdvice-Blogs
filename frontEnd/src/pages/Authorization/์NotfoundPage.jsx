import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  const navigate = useNavigate();

  const [countdown, setCountdown] = useState(5);



  useEffect(() => {
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    const redirect = setTimeout(() => navigate("/"), 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [navigate]);

  return (
    <div className="h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6 max-w-md"
      >
        {/* ตัวเลข 404 แบบเท่ ๆ */}
        <motion.h1
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500"
        >
          404
        </motion.h1>

        {/* ข้อความแจ้งเตือน */}
        <p className="text-2xl font-semibold"> 404 Page Not Found</p>
        <p className="text-gray-400">
          We couldn’t find the page you’re looking for 😥
        </p>

      
          
          <p className="text-sm text-gray-300">
            🔙{" "} Redirecting you back to{" "}Home Page in{" "}
            <span className="font-bold">{countdown}</span> seconds...
          </p>
       
      </motion.div>
    </div>
  );
}
