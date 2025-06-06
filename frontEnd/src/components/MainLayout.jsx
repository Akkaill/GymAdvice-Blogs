import { Box } from "@chakra-ui/react";
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import  ResetSearchOnRouteChange  from "./ResetSearchOnRouteChange";
export const MainLayout = () => {
  return (
    <Box display="flex" flexDirection="column" minH="100vh">
      <ResetSearchOnRouteChange />
      <Navbar />
      <Box flex="1">
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};
