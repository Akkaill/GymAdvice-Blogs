import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useBlogStore } from "@/store/blog";

const ResetSearchOnRouteChange = () => {
  const location = useLocation();
  const prevPathRef = useRef(null);
  const {
    setSearch,
    resetBlogs,
    fetchPaginatedBlogs
  } = useBlogStore.getState(); // avoid tracking updates via hook here

  useEffect(() => {
    const currentPath = location.pathname;
    if (prevPathRef.current === currentPath) return; // only reset on change

    prevPathRef.current = currentPath;

    // Reset only once per route
    console.log("🔁 Reset triggered on path change:", currentPath);
    setSearch("");
    resetBlogs();
     fetchPaginatedBlogs(null); //  Do fresh fetch here only
  }, [location.pathname]);

  return null;
};

export default ResetSearchOnRouteChange;
