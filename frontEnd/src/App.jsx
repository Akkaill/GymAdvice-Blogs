import "./App.css";
import { Box } from "@chakra-ui/react";
import NavBar from "./components/Navbar";
import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { CreatePage } from "./pages/CreatePage";
import { BlogDetail } from "./pages/BlogDetail";
import { Toaster } from "sonner";
import Footer from "./components/Footer";
import { AllBlogs } from "@/pages/Blogs";
import { MainLayout } from "./components/MainLayout";

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
        </Route>
      </Routes>
    </Box>
  );
}

export default App;
