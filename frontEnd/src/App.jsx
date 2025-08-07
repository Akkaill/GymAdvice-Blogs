import { useEffect } from "react";
import { useAuthStore } from "./store/auth";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { CreatePage } from "./pages/CreatePage";
import { BlogDetail } from "./pages/BlogDetail";
import { Toaster } from "sonner";
import { AllBlogs } from "@/pages/Blogs";
import { MainLayout } from "./components/MainLayout";
import { ProfilePage } from "./pages/Profilepage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Authorization/Unauthorized";
import NotFoundPage from "./pages/Authorization/์NotfoundPage";
import FavoriteListPage from "./pages/FavoriteListPage";
import { ManageBlogs } from "./pages/ManageBlogs";
import ManageUserPage from "./pages/ManageUsers";
import VerifyOtpLoginPage from "./pages/VerifyOtpLoginPage";

function App() {
  const {
    fetchUser,
    isUserReady,
    hasAttemptedAuth,
    refreshToken,
    isAuthenticated,
    user,
  } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      const hasRefreshTokenCookie =
        localStorage.getItem("hasRefreshToken") === "true";

      if (!hasRefreshTokenCookie) {
        useAuthStore.setState({
          isUserReady: true,
          hasAttemptedAuth: true,
        });
        return;
      }

      try {
        const token = await refreshToken();
        if (token) {
          await fetchUser();
        }
      } catch (err) {
        console.error("❌ Refresh token failed:", err);
      } finally {
        useAuthStore.setState({
          isUserReady: true,
          hasAttemptedAuth: true,
        });
      }
    };

    if (!hasAttemptedAuth) {
      initAuth();
    } else {
      useAuthStore.setState({ isUserReady: true });
    }

    return () => {
      cancelled = true;
    };
  }, [hasAttemptedAuth]);

  useEffect(() => {
    if (!isUserReady) return;

    // ถ้าอยู่หน้า verify-otp ให้ข้าม redirect
    if (location.pathname === "/verify-otp-login") return;

    if (isAuthenticated && user) {
      const role = user?.role;
      if (location.pathname === "/login" || location.pathname === "/register") {
        if (role === "admin" || role === "superadmin") {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
    }
  }, [isUserReady, isAuthenticated, user, location.pathname, navigate]);

  if (!isUserReady) {
    return (
      <Flex minH="100vh" align="center" justify="center" direction="column">
        <Spinner size="xl" />
        <Text mt={4} fontSize="lg">
          Loading user...
        </Text>
      </Flex>
    );
  }

  return (
    <Box minH="100vh">
      <Toaster richColors position="bottom-right" />

      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/blogs/:id" element={<BlogDetail />} />
          <Route path="/blogs" element={<AllBlogs />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/verify-otp-login" element={<VerifyOtpLoginPage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/manage-blogs" element={<ManageBlogs />} />
          <Route path="/manage-users" element={<ManageUserPage />} />
          <Route path="/favorites" element={<FavoriteListPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;
