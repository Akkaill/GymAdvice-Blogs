import "./App.css";
import { Box, Button } from "@chakra-ui/react";
import NavBar from "./components/Navbar";
import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { CreatePage } from "./pages/CreatePage";
import { Toaster } from "sonner";
function App() {
  return (
    <Box minH={"100vh"}>
      <NavBar />
      <Toaster richColors position="bottom-right"/>
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/create" element={<CreatePage />}></Route>
      </Routes>
    </Box>
  );
}

export default App;
