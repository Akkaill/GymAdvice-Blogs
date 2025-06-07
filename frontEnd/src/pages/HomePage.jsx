import React, { useEffect } from "react";
import { VStack, Container, Text, SimpleGrid, Box } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useBlogStore } from "@/store/blog";
import BlogCard from "@/components/BlogCard";
import { HeroSection } from "@/components/HeroSection";
import { Section } from "@/components/Section";
import { SearchFilters } from "@/components/SearchFilters";

export const HomePage = () => {
  const { fetchPaginatedBlogs, blogs, loading } = useBlogStore();

  const uniqueBlogs = Array.from(
    new Map(blogs.map((blog) => [blog._id, blog])).values()
  );

  useEffect(() => {
    fetchPaginatedBlogs(null, 6);
    console.log("Rendering App");
  }, []);

  return (
    <Box>
      <Section>
        <HeroSection />
      </Section>
      <Container maxW="container.xl" py={12}>
        <Section>
          <VStack wordSpacing={2} id="next-section">
            <Text
              fontSize={"4xl"}
              fontWeight={"bold"}
              bgColor={"black"}
              bgClip={"text"}
              textAlign={"center"}
              paddingTop={14}
            >
              Recently Blogs
            </Text>
            <SearchFilters />

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
          </VStack>
        </Section>
      </Container>
    </Box>
  );
};
