import React, { useEffect } from "react";
import {
  Container,
  Spinner,
  Box,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import BlogCard from "@/components/BlogCard";
import { useBlogStore } from "@/store/blog";
import { useInView } from "react-intersection-observer";

export const AllBlogs = () => {
  const { blogs, nextCursor, hasMore, loading,
    fetchPaginatedBlogs, resetBlogs, } = useBlogStore();
      const { ref, inView } = useInView({ threshold: 0.1 });
  useEffect(() => {
    resetBlogs();
    fetchPaginatedBlogs(null);; // 👈 โหลด blog ทั้งหมดเมื่อเข้าหน้านี้
  }, []);
  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchPaginatedBlogs(nextCursor, 9);
    }
  }, [inView, hasMore, loading, nextCursor]);
  if (loading) {
    return (
      <Container maxW="container.md" centerContent mt={10}>
        <Spinner size="xl" thickness="4px" color="gray.600" />
      </Container>
    );
  }

  if (!Array.isArray(blogs) || blogs.length === 0) {
    return (
      <Container maxW="container.md" mt={10}>
        <Text fontSize="xl" textAlign="center">
          No blogs found.
        </Text>
      </Container>
    );
  }

  return (
    <Container>
      <VStack>
        <Text
          fontSize={"4xl"}
          fontWeight={"bold"}
          bgColor={"black"}
          bgClip={"text"}
          textAlign={"center"}
        >
          ALL BLOGS
        </Text>
        <Box px={4} py={8}>
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            gap={6}
            w="full"
            zIndex="100"
          >
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </SimpleGrid>
           {loading && <Spinner size="lg" color="gray.500" />}
        <div ref={ref} style={{ height: "1px" }} />
        {!hasMore && blogs.length > 0 && (
          <Text fontSize="sm" color="gray.400">You've reached the end.</Text>
        )}
        </Box>
      </VStack>
    </Container>
  );
};
