import "./App.css";
import { Box } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { CreatePage } from "./pages/CreatePage";
import { BlogDetail } from "./pages/BlogDetail";
import { Toaster } from "sonner";;
import { AllBlogs } from "@/pages/Blogs";
import { MainLayout } from "./components/MainLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Box minH={"100vh"}>
      <Toaster richColors position="bottom-right" />

      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />}></Route>
          <Route path="/create" element={<CreatePage />}></Route>
          <Route path="/blogs/:id" element={<BlogDetail />} />
          <Route path="/blogs" element={<AllBlogs />} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;
