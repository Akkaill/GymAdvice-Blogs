import React, { useEffect } from "react";
import {
  VStack,
  Container,
  Text,
  SimpleGrid,
  Box,
  Divider,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useBlogStore } from "@/store/blog";
import BlogCard from "@/components/BlogCard";
import { HeroSection } from "@/components/HeroSection";
import { Section } from "@/components/Section";
import { SearchFilters } from "@/components/search/SearchFilters";
import { TopBlogs } from "@/components/TopBlogs";

export const HomePage = () => {
  const { fetchPaginatedBlogs, blogs, loading } = useBlogStore();

  const uniqueBlogs = Array.from(
    new Map(blogs.map((blog) => [blog._id, blog])).values()
  );

  useEffect(() => {
    fetchPaginatedBlogs(null, 6);
  }, []);

  return (
    <Box bg="gray.50" minH="100vh">
      <Section>
        <HeroSection />
      </Section>

      {/* Recently Blogs Section */}
      <Container maxW="container.xl" py={12}>
        <Section>
          <VStack spacing={6} id="recent-blogs" align="stretch">
            <Text
              fontSize="4xl"
              fontWeight="bold"
              bgColor="black"
              bgClip="text"
              textAlign="center"
              py={4}
              borderBottom="4px solid"
              borderColor="teal.400"
              maxW="fit-content"
              mx="auto"
            >
              Recently Blogs
            </Text>

            <SearchFilters />

            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3, xl: 3 }}
              gap={6}
              w="full"
              zIndex={100}
            >
              {uniqueBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </SimpleGrid>

            {!loading && blogs.length === 0 && (
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
          </VStack>
        </Section>
      </Container>

  
      <Box
        as="section"
        bg="white"
        py={12}
        px={{ base: 4, md: 8, lg: 16 }}
        borderTop="1px solid"
        borderColor="gray.200"
      >
        <VStack spacing={8} maxW="container.xl" mx="auto" align="stretch">
          <Text
            fontSize="4xl"
            fontWeight="bold"
            bgColor="black"
            bgClip="text"
            textAlign="center"
            pb={4}
            borderBottom="4px solid"
            borderColor="teal.400"
            maxW="fit-content"
            mx="auto"
          >
            Top Blogs
          </Text>

          {/* ใส่ TopBlogs component ที่ card กว้างเต็ม */}
          <TopBlogs fullWidth />
        </VStack>
      </Box>
    </Box>
  );
};
