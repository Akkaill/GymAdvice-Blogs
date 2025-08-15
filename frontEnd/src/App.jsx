import { useEffect, Suspense, lazy } from "react";
import { useAuthStore } from "./store/auth";
import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { RequireAuth, RequireRole } from "@/components/Routes/Guards";
import { Toaster } from "sonner";
import { AllBlogs } from "@/pages/Blog/Blogs";
import { MainLayout } from "./components/layout/MainLayout";
import { ProfilePage } from "./pages/User/Profilepage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import Unauthorized from "./pages/Authorization/Unauthorized";
import NotFoundPage from "./pages/Authorization/์NotfoundPage";
import FavoriteListPage from "./pages/Blog/FavoriteListPage";
import { ManageBlogs } from "./pages/BackOffice/ManageBlogs";
import ManageUserPage from "./pages/BackOffice/ManageUsers";
import VerifyOtpLoginPage from "./pages/Auth/VerifyOtpLoginPage";

const BlogDetail = lazy(() => import("@/pages/Blog/BlogDetail"));
const CreateBlog = lazy(() => import("@/pages/Blog/CreatePage"));
const DashBoard = lazy(() => import("@/pages/BackOffice/Dashboard"));

const PageSkeleton = () => <div style={{ padding: 24 }}>Loading…</div>;

function App() {
  const { isUserReady, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      // ใช้ local flag ช่วยกัน double-call
      if (useAuthStore.getState().hasAttemptedAuth) return;

      const hasRefresh = localStorage.getItem("hasRefreshToken") === "true";

      try {
        if (hasRefresh) {
          const token = await useAuthStore.getState().refreshToken();
          if (token) {
            await useAuthStore.getState().fetchUser();
          }
        } else {
          useAuthStore.setState({ isAuthenticated: false, user: null });
        }
      } finally {
        useAuthStore.setState({ isUserReady: true, hasAttemptedAuth: true });
      }
    };

    if (!useAuthStore.getState().hasAttemptedAuth) init();
  }, []);

  useEffect(() => {
    if (!isUserReady) return;
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
          <Route
            path="/blogs/:id"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <BlogDetail />{" "}
              </Suspense>
            }
          />
          <Route path="/blogs" element={<AllBlogs />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp-login" element={<VerifyOtpLoginPage />} />

          <Route element={<RequireAuth />}>
            <Route
              path="/create"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <CreateBlog />{" "}
                </Suspense>
              }
            />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/favorites" element={<FavoriteListPage />} />

            <Route element={<RequireRole roles={["admin", "superadmin"]} />}>
              <Route
                path="/dashboard"
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <DashBoard />{" "}
                  </Suspense>
                }
              />
              <Route
                path="/manage-blogs"
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <ManageBlogs />{" "}
                  </Suspense>
                }
              />
              <Route
                path="/manage-users"
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <ManageUserPage />{" "}
                  </Suspense>
                }
              />
            </Route>
          </Route>
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;
