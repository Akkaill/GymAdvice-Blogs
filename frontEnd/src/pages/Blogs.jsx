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
import { SearchFilters } from "@/components/SearchFilters";
import { Link } from "react-router-dom";

export const AllBlogs = () => {
  const {
    blogs,
    nextCursor,
    hasMore,
    loading,
    fetchPaginatedBlogs,
    resetBlogs,
    search
  } = useBlogStore();
  const { ref, inView } = useInView({ threshold: 0.1 });
  useEffect(() => {
    resetBlogs();
    fetchPaginatedBlogs(null); // 👈 โหลด blog ทั้งหมดเมื่อเข้าหน้านี้
  }, []);
  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchPaginatedBlogs(nextCursor, 9);
    }
  }, [inView, hasMore, loading, nextCursor]);



  return (
    <Container maxW="container.xl" py={8}>
      <VStack>
        <Text
          fontSize={"4xl"}
          fontWeight={"bold"}
          bgColor={"black"}
          bgClip={"text"}
          textAlign={"center"}
        
          paddingBottom={10}
        >
          ALL BLOGS
        </Text>

        <SearchFilters />

        <Box px={4} py={8}>
          {/* กรณีโหลดข้อมูล */}
          {loading && blogs.length === 0 && (
            <Container maxW="container.md" centerContent mt={10}>
              <Spinner size="xl" thickness="4px" color="gray.600" />
            </Container>
          )}

          {!loading && blogs.length === 0 && (
            <Text
              fontSize="xl"
              textAlign="center"
              fontWeight="medium"
              color="gray.600"
            >
              No matching results for {" "}
               <Text as="span" fontWeight="bold" color="blackAlpha.800">
                  "{search}"
                </Text>
                <Text fontSize="md" color="gray.600" textAlign="center">
                Please try a different keyword or {" "}
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
            </Text>
          )}

          {blogs.length > 0 && (
            <>
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

              {loading && <Spinner size="lg" color="gray.500" mt={4} />}

              <div ref={ref} style={{ height: "1px" }} />

              {!hasMore && (
                <Text fontSize="sm" color="gray.400" mt={4} textAlign="center">
                  You've reached the end.
                </Text>
              )}
            </>
          )}
        </Box>
      </VStack>
    </Container>
  );
};
