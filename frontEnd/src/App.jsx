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

function App() {
  return (
    <Box minH={"100vh"}>
      <NavBar />
      <Toaster richColors position="bottom-right" />
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/create" element={<CreatePage />}></Route>
        <Route path="/blogs/:id" element={<BlogDetail />} />
        <Route path="/blogs" element={<AllBlogs />} />
      </Routes>
      <Footer />
    </Box>
  );
}

export default App;
