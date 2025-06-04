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

export const AllBlogs = () => {
  const { blogs, fetchBlogs, loading } = useBlogStore();
  useEffect(() => {
    fetchBlogs(); // 👈 โหลด blog ทั้งหมดเมื่อเข้าหน้านี้
  }, []);
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
        </Box>
      </VStack>
    </Container>
  );
};
