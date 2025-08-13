import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Flex, Spinner } from "@chakra-ui/react";
import { useAuthStore } from "@/store/auth";

function FullscreenSpinner() {
  return (
    <Flex minH="60vh" align="center" justify="center">
      <Spinner size="lg" />
    </Flex>
  );
}

export function RequireAuth() {
  const { isUserReady, isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // 1) ยังโหลดสถานะผู้ใช้อยู่ → แสดงสปินเนอร์ (อย่ารีไดเรกต์)
  if (!isUserReady) return <FullscreenSpinner />;

  // 2) โหลดแล้วแต่ยังไม่ล็อกอิน → ส่งไปหน้า Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3) ผ่าน
  return <Outlet />;
}

export function RequireRole({ roles = [] }) {
  const { isUserReady, isAuthenticated, user } = useAuthStore();

  if (!isUserReady) return <FullscreenSpinner />;

  // ยังไม่ล็อกอิน → ส่งไป Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // ล็อกอินแล้ว แต่ role ไม่เข้าเงื่อนไข → Unauthorized
  if (!roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}