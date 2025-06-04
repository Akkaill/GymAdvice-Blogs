import React, { useEffect, useState } from "react";
import {
  VStack,
  Container,
  Text,
  SimpleGrid,
  Spinner,
  Box,
  Input,
} from "@chakra-ui/react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { useBlogStore } from "@/store/blog";
import BlogCard from "@/components/BlogCard";
import { useInView } from "react-intersection-observer";
import debounce from "lodash.debounce";
import { useCallback } from "react";

export const HomePage = () => {
  const {
    fetchPaginatedBlogs,
    blogs,
    nextCursor,
    loading,
    hasMore,
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
  const uniqueBlogs = Array.from(
    new Map(blogs.map((blog) => [blog._id, blog])).values()
  );
  const debouncedFetch = useCallback(
    debounce((delay) => {
      setSearch(delay);
      fetchPaginatedBlogs(null); // reset + fetch ใหม่
    }, 500),
    []
  );
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  useEffect(() => {
    if (nextCursor) {
      console.log("📌 Sending cursor:", nextCursor);
      query.append("cursor", nextCursor);
    }
    console.log("🧠 sortBy:", sortBy, "order:", order);
    console.log("📦 blogs:", blogs);
  }, []);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchPaginatedBlogs(nextCursor);
    }
  }, [inView, hasMore, loading, nextCursor]);

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
    resetBlogs(); // 1. reset

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
    <Container maxW="container.xl" py={12}>
      <VStack wordSpacing={2}>
        <Text
          fontSize={"4xl"}
          fontWeight={"bold"}
          bgColor={"black"}
          bgClip={"text"}
          textAlign={"center"}
        >
          Recently Blogs
        </Text>
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

        <SimpleGrid
          columns={{
            base: 1,
            md: 2,
            lg: 3,
            xl: 3,
          }}
          gap={5}
          w={"full"}
          zIndex={"100"}
        >
          {/* {Array.isArray(blogs) && blogs.length > 0 ? (
            <>
              {console.log("🧾 Rendering blogs:", blogs)}
              {blogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </>
          ) : (
            <Text>No blogs found.</Text>
          )} */}
          {uniqueBlogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </SimpleGrid>

        {blogs.length === 0 && !loading && (
          <Text
            fontSize="xl"
            textAlign="center"
            fontWeight="medium"
            color="gray.600"
          >
            NO BLOG FOUND{" "}
            <Link to="/create">
              <Text
                as="span"
                color="blackAlpha.800"
                _hover={{ textDecoration: "underline" }}
              >
                Create Blog
              </Text>
            </Link>
          </Text>
        )}

        {loading && (
          <Spinner size="lg" thickness="4px" speed="0.65s" color="gray.600" />
        )}

        <div ref={ref} style={{ height: "1px" }} />

        {!hasMore && blogs.length > 0 && (
          <Text fontSize="sm" color="gray.400">
            You've reached the end.
          </Text>
        )}
      </VStack>
    </Container>
  );
};
