import React, { useEffect, useState, useCallback } from "react";
import { Box, Input, IconButton, Tooltip,useColorModeValue } from "@chakra-ui/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBlogStore } from "@/store/blog";
import debounce from "lodash.debounce";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiGrid } from "react-icons/fi";

export const SearchFilters = () => {
  const {
    fetchPaginatedBlogs,
    blogs,
    setSearch,
    setSort,
    search,
    sortBy,
    order,
    resetBlogs,
  } = useBlogStore();

  const [searchTerm, setSearchTerm] = useState(search);
  const [sortValue, setSortValue] = useState(
    sortBy && order ? `${sortBy}|${order}` : "createdAt|desc"
  );
  const location = useLocation();
  const isManageBlogs = location.pathname === "/manage-blogs";
  const debouncedFetch = useCallback(
    debounce((delay) => {
      setSearch(delay);
      resetBlogs(); 
      fetchPaginatedBlogs(null); 
    }, 500),
    []
  );
  useEffect(() => {
    setSearchTerm(search); 
    console.log("🧠 sortBy:", sortBy, "order:", order);
    console.log("📦 blogs:", blogs);
  }, [search]);

  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  const handleSearchChange = (e) => {
    const newSearch = e.target.value;
    setSearchTerm(newSearch);
    debouncedFetch(newSearch);
  };
  const handleSortChange = async (selectedValue) => {
    console.log("Selected (direct):", selectedValue);
    const [newSort, newOrder] = selectedValue.split("|");
    setSortValue(selectedValue);
    resetBlogs(); 
    await new Promise((resolve) => {
      setTimeout(() => {
        setSort(newSort, newOrder);
        resolve();
      }, 0);
    });

    fetchPaginatedBlogs(null);
  };
  const hoverBg = useColorModeValue("gray.100", "gray.600");
  return (
    <Box
      display={"flex"}
      w={"full"}
      gap={3}
      rounded={"l"}
      zIndex={999}
      position="relative"
    >
      {isManageBlogs && (
        <>
          <Tooltip label="Go to Home">
            <Link to="/">
              <IconButton
                icon={<FiHome />}
                aria-label="Home"
                variant="outline"
                colorScheme="blue"
                size="md"
                _hover={{ bg: hoverBg }}
              />
            </Link>
          </Tooltip>
          {/* Dashboard Button */}
          <Tooltip label="Go to Dashboard">
            <Link to="/dashboard">
              <IconButton
                icon={<FiGrid />}
                aria-label="Dashboard"
                variant="outline"
                colorScheme="blue"
                size="md"
                _hover={{ bg: hoverBg }}
              />
            </Link>
          </Tooltip>{" "}
        </>
      )}
      <Input
        placeholder="Search blogs..."
        value={searchTerm}
        onChange={handleSearchChange}
        mb={4}
        w="full"
      />
      <Select onValueChange={handleSortChange} mb={4} value={sortValue}>
        <SelectTrigger className="w-42 flex justify-center">
          <SelectValue placeholder="Filter" />
        </SelectTrigger>
        <SelectContent className="z-[999] bg-gray-100">
          <SelectItem value="createdAt|desc">Newest First</SelectItem>
          <SelectItem value="createdAt|asc">Oldest First</SelectItem>
          <SelectItem value="title|asc">Title A-Z</SelectItem>
          <SelectItem value="title|desc">Title Z-A</SelectItem>
        </SelectContent>
      </Select>
    </Box>
  );
};
