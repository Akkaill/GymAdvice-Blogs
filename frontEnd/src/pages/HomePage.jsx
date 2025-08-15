// src/pages/HomePage.jsx
import React, { useEffect } from "react";
import {
  VStack,
  Container,
  Text,
  SimpleGrid,
  Box,
  HStack,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useBlogStore } from "@/store/blog";
import BlogCard from "@/components/layout/BlogCard";
import { HeroSection } from "@/components/layout/HeroSection";
import { Section } from "@/components/layout/Section";
import { SearchFilters } from "@/components/search/SearchFilters";
import { TopBlogs } from "@/components/layout/TopBlogs";
import { BlogCardSkeleton } from "@/components/skeletons/BlogCardSkeleton";

export const HomePage = () => {
  const {
    fetchPaginatedBlogs,
    blogs,
    loading,
    // ถ้าสตอร์มี hasMore/page/cursor อยู่แล้วจะทำงาน “load more” ต่อเนื่อง
    hasMore,
  } = useBlogStore();

  const uniqueBlogs = Array.from(
    new Map(blogs.map((blog) => [blog._id, blog])).values()
  );

  useEffect(() => {
    // โหลดหน้าแรก 6 ชิ้น
    fetchPaginatedBlogs?.(null, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const borderCol = useColorModeValue("gray.200", "gray.700");
  const cardBg = useColorModeValue("white", "gray.800");

  return (
    <Box bg="gray.50" minH="100vh">
      <Section>
        <HeroSection />
      </Section>

      {/* Recent Blogs */}
      <Container maxW="container.xl" py={{ base: 10, md: 12 }}>
        <Section>
          <VStack spacing={6} id="recent-blogs" align="stretch">
            <Box textAlign="center">
              <Text
                as="h2"
                fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
                fontWeight="extrabold"
                bgClip="text"
                bgGradient="linear(to-r, teal.500, cyan.500)"
                display="inline-block"
              >
                Recent Blogs
              </Text>
              <Box
                mt={2}
                mx="auto"
                w="80px"
                h="3px"
                borderRadius="full"
                bgGradient="linear(to-r, teal.400, cyan.400)"
              />
            </Box>

            <Box
              position="sticky"
              top={{ base: 2, md: 4 }}
              zIndex={5}
              bg={cardBg}
              border="1px solid"
              borderColor={borderCol}
              rounded="xl"
              p={{ base: 3, md: 4 }}
              shadow="sm"
            >
              <SearchFilters />
            </Box>

            {/* Grid */}
            {loading && uniqueBlogs.length === 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <BlogCardSkeleton key={i} />
                ))}
              </SimpleGrid>
            ) : (
              <>
                <SimpleGrid
                  columns={{ base: 1, md: 2, lg: 3 }}
                  gap={6}
                  w="full"
                  zIndex={1}
                >
                  {uniqueBlogs.map((blog) => (
                    <BlogCard key={blog._id} blog={blog} />
                  ))}
                </SimpleGrid>

                {/* Empty state */}
                {!loading && uniqueBlogs.length === 0 && (
                  <Box
                    textAlign="center"
                    py={10}
                    border="1px dashed"
                    borderColor={borderCol}
                    rounded="xl"
                    bg="white"
                  >
                    <Text fontSize="lg" color="gray.600" mb={3}>
                      No blog found.
                    </Text>
                    <Button as={Link} to="/create" colorScheme="teal">
                      Create Blog
                    </Button>
                  </Box>
                )}

                <Button as={Link} to="/blogs" variant="ghost">
                  View all
                </Button>
              </>
            )}
          </VStack>
        </Section>
      </Container>

      {/* Top Blogs */}
      <Box
        as="section"
        bg="white"
        py={{ base: 10, md: 12 }}
        px={{ base: 4, md: 8, lg: 16 }}
        borderTop="1px solid"
        borderColor={borderCol}
      >
        <VStack spacing={8} maxW="container.xl" mx="auto" align="stretch">
          <Box textAlign="center">
            <Text
              as="h2"
              fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
              fontWeight="extrabold"
              bgClip="text"
              bgGradient="linear(to-r, purple.500, pink.500)"
              display="inline-block"
            >
              Top Blogs
            </Text>
            <Box
              mt={2}
              mx="auto"
              w="80px"
              h="3px"
              borderRadius="full"
              bgGradient="linear(to-r, purple.400, pink.400)"
            />
          </Box>

          <TopBlogs fullWidth />
        </VStack>
      </Box>
    </Box>
  );
};
