import React, { useEffect, useState, useCallback, useRef } from "react";
import { Box, Input } from "@chakra-ui/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBlogStore } from "@/store/blog";
import debounce from "lodash.debounce";


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


  const debouncedFetch = useCallback(
  debounce((delay) => {
    setSearch(delay);
    resetBlogs(); // เคลียร์ state ก่อนดึงข้อมูลใหม่
    fetchPaginatedBlogs(null); // ดึงใหม่ทุกครั้ง
  }, 500),
  []
)
  useEffect(() => {
    setSearchTerm(search); // ถ้า state ถูก reset ข้างนอก เช่น route change
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
    resetBlogs(); // reset
    // บังคับให้ใช้ callback หรือทำให้แน่ใจว่า state update แล้วจริงๆ
    await new Promise((resolve) => {
      setTimeout(() => {
        setSort(newSort, newOrder);
        resolve();
      }, 0);
    });

    fetchPaginatedBlogs(null);
  };

  return (
    <Box
      display={"flex"}
      w={"full"}
      gap={3}
      rounded={"l"}
      zIndex={999}
      position="relative"
    >
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
