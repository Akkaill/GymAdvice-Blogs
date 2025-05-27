import React from "react";
import { VStack, Container, Text, SimpleGrid } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useBlogStore } from "@/store/blog";
import { useEffect } from "react";
import { BlogCard } from "@/components/BlogCard";
export const HomePage = () => {
  const { fetchBlogs, blogs } = useBlogStore();
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);
  console.log("blogs", blogs);
  return (
    <Container maxW="container.xl" py={12}>
      <VStack wordSpacing={2}>
        <Text
          fontSize={"38"}
          fontWeight={"bold"}
          bgColor={"black"}
          bgClip={"text"}
          textAlign={"center"}
        >
          Recently Blogs
        </Text>

        <SimpleGrid
      
          columns={{
            base: 1,
            md: 2,
            lg: 3,
            xl: 3,
          }}
          wordSpacing={2}
          spaceX={5}
          spaceY={4}
          w={"full"}
        >
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </SimpleGrid>

        {blogs.length === 0 && (
          <Text
            fontSize={"xl"}
            textAlign={"center"}
            fontWeight={"medium"}
            color={"grey.700"}
          >
            NO BLOG FOUND {""}
            <Link to={"/create"}>
              <Text
                as="span"
                color={"blackAlpha.800"}
                _hover={{ textDecoration: "underline" }}
              >
                Create Blog
              </Text>
            </Link>
          </Text>
        )}
      </VStack>
    </Container>
  );
};
