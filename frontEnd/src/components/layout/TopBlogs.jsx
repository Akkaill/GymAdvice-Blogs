import { useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import { FaArrowRightLong } from "react-icons/fa6";
import { FavoriteButton } from "@/components/button/FavoriteButton";
import { useBlogStore } from "@/store/blog";

export const TopBlogs = () => {
  const { topBlogs, fetchTopBlogs } = useBlogStore();
  const location = useLocation();
  const isFavoritePage = location.pathname.includes("/favorites");

  useEffect(() => {
    fetchTopBlogs();
  }, []);

  const cardBg = useColorModeValue("white", "gray.800");

  return (
    <VStack align="stretch" spacing={4}>
      {topBlogs.map((blog) => (
        <Flex
          key={blog._id}
          bg={cardBg}
          borderRadius="xl"
          overflow="hidden"
          shadow="md"
          p={3}
          gap={4}
          _hover={{ shadow: "lg", transform: "scale(1.01)" }}
          transition="all 0.3s ease"
          align="center"
        >
          {/* Image */}
          <Box flexShrink={0}>
            <Image
              src={blog.image}
              alt={blog.title}
              boxSize="100px"
              objectFit="cover"
              rounded="lg"
            />
          </Box>

          {/* Content */}
          <Box flex="1">
            <Heading as="h3" size="sm" mb={1} isTruncated color="teal.600">
              {blog.title}
            </Heading>
            <Text fontSize="xs" color="gray.500" noOfLines={1}>
              {blog.author?.username || blog.authorName}
            </Text>
            <Text fontSize="sm" noOfLines={2} color="gray.600" mt={1}>
              {blog.subtitle || "ไม่มีคำอธิบาย"}
            </Text>

            {/* Actions */}
            <Flex justify="space-between" align="center" mt={2}>
              <Text>{blog.favoriteCount} likes</Text>

              <Flex align="center" gap={2}>
                {!isFavoritePage && (
                  <FavoriteButton
                    blogId={blog._id}
                    isInitiallyFavorite={false}
                  />
                )}

                <Link to={`/blogs/${blog._id}`}>
                  <Flex
                    align="center"
                    gap={1}
                    fontSize="xs"
                    fontWeight="medium"
                    color="blue.500"
                    _hover={{ color: "blue.600" }}
                    transition="color 0.2s ease"
                  >
                    Readmore
                    <FaArrowRightLong />
                  </Flex>
                </Link>
              </Flex>
            </Flex>
          </Box>
        </Flex>
      ))}
    </VStack>
  );
};
