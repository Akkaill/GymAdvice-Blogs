import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Text,
  Heading,
  Image,
  Container,
  Spinner,
  VStack,
  Alert,
} from "@chakra-ui/react";
import { IoIosAlert } from "react-icons/io";
import { useParams } from "react-router-dom";
import { useBlogStore } from "@/store/blog";
import { CommentSection } from "@/components/CommentSection";

export const BlogDetail = () => {
  const { id } = useParams();
  const { fetchBlogById } = useBlogStore();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBlog = async () => {
      setLoading(true);
      const data = await fetchBlogById(id);
      if (data) {
        setBlog(data);
      } else {
        setError("Blog not found or failed to load.");
      }
      setLoading(false);
    };
    loadBlog();
  }, [id]);

  if (loading) {
    return (
      <Container maxW="container.md" centerContent mt={10}>
        <Spinner size="xl" thickness="4px" color="gray.600" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.md" mt={10}>
        <Alert.Root status="error" borderRadius="md">
          <IoIosAlert />
          {error}
        </Alert.Root>
      </Container>
    );
  }

  if (!blog) return null;

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6} align="start">
        <Image
          src={blog.image}
          alt={blog.title}
          borderRadius="lg"
          objectFit="cover"
          width="100%"
          maxH="400px"
        />

        <Box>
          <Heading size="2xl" mb={1}>
            {blog.title}
          </Heading>
          <Text fontSize="lg" color="gray.600" mb={4}>
            {blog.subtitle}
          </Text>
          <Text fontSize="md" lineHeight="tall" whiteSpace="pre-wrap">
            {blog.description}
          </Text>
        </Box>

        <Text fontSize="sm" color="gray.500">
          Created At: {new Date(blog.createdAt).toLocaleString()}
        </Text>

        {blog.authorName && (
          <Text fontSize="sm" color="gray.500">
            Written by:{" "}
            <Link to={`/profile/${blog.authorName._id}`}>
              <Text
                as="span"
                fontWeight="bold"
                color="blue.500"
                _hover={{ textDecoration: "underline" }}
              >
                {blog.authorName.username}
              </Text>
            </Link>
          </Text>
        )}

        <Box width={"full"}>
          <CommentSection blogId={blog._id} />
        </Box>
      </VStack>
    </Container>
  );
};
