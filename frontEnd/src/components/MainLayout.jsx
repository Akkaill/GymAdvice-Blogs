import { Box } from "@chakra-ui/react";
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ResetSearchOnRouteChange from "./ResetSearchOnRouteChange";

export const MainLayout = () => {
  const location = useLocation();
  const path = location.pathname.toLowerCase();
  const hideNavbar =
    path === "/login" ||
    path === "/register" ||
    path === "/dashboard" ||
    path === "/unauthorized" ||
    path === "/manage-blogs" ||
    path === "/manage-users" ||
    path.includes("notfound");
  const isHome = path === "/";
  const contentPt = hideNavbar ? "0" : isHome ? "0" : "24";

  return (
    <Box display="flex" flexDirection="column" minH="100vh">
      <ResetSearchOnRouteChange />
      {!hideNavbar && <Navbar />}
      <Box flex="1" pt={contentPt}>
        <Outlet />
      </Box>
      {!hideNavbar && <Footer />}
    </Box>
  );
};
