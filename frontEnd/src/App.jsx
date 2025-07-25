// src/App.jsx
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

function App() {
  const { fetchUser, isUserReady, refreshToken, isAuthenticated, user } =
    useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      try {
        const token = await refreshToken(); // cookie -> access
        if (cancelled) return;
        if (token) {
          await fetchUser(); // fetch profile
        } else {
          // ไม่มี refresh token / หมดอายุ
          useAuthStore.getState().logout();
        }
      } catch (err) {
        console.error("Auth init failed:", err);
      } finally {
        if (!cancelled) {
          useAuthStore.setState({ isUserReady: true });
        }
      }
    };

    initAuth();
    return () => {
      cancelled = true;
    };
  }, []); 


  useEffect(() => {
    if (!isUserReady) return;
    if (!isAuthenticated) return;
    const role = user?.role;
    if (location.pathname === "/login" || location.pathname === "/register") {
      if (role === "admin" || role === "superadmin") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
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
          <Route path="/favorites" element={<FavoriteListPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;
