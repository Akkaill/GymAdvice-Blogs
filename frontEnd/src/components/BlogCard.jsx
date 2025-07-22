import { Box, HStack, Heading, Image, Text } from "@chakra-ui/react";
import { FaArrowRightLong } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import { FavoriteButton } from "./button/FavoriteButton";

export default function BlogCard({ blog }) {
  if (!blog) return null;

  const location = useLocation();
  const isFavoritePage = location.pathname.includes("/favorites");

  const favCount = Array.isArray(blog.favoritedBy)
    ? blog.favoritedBy.length
    : 0;

  return (
    <Box
      bg="rgba(255, 255, 255, 0.15)"
      backdropFilter="blur(10px)"
      border="1px solid rgba(255, 255, 255, 0.2)"
      shadow="xl"
      rounded="2xl"
      overflow="hidden"
      transition="all 0.35s ease"
      _hover={{
        transform: "translateY(-6px) scale(1.02)",
        shadow: "2xl",
      }}
      minH="340px"
    >
      {/* Image Section */}
      <Box overflow="hidden" position="relative">
        <Image
          src={blog.image}
          alt={blog.title}
          w="full"
          aspectRatio={16 / 9}
          objectFit="cover"
          transition="transform 0.4s ease"
          _hover={{ transform: "scale(1.05)" }}
        />
      </Box>

      {/* Content Section */}
      <Box p={4}>
        <Heading
          as="h3"
          size="md"
          mb={2}
          noOfLines={1}
          color="gray.800"
          _hover={{ color: "teal.500" }}
          transition="color 0.2s"
        >
          {blog.title}
        </Heading>

        <Text
          fontWeight="medium"
          fontSize="sm"
          color="gray.600"
          mb={4}
          noOfLines={2}
        >
          {blog.subtitle}
        </Text>

        {/* Actions */}
        <HStack justifyContent="space-between" spacing={3}>
          {!isFavoritePage && (
            <FavoriteButton blogId={blog._id} />
          )}

          <Link to={`/blogs/${blog._id}`}>
            <Box
              transition="all 0.3s"
              _hover={{ transform: "translateX(3px)" }}
              display="flex"
              alignItems="center"
              gap={2}
              p={1}
              rounded="lg"
            >
              <Text fontWeight="semibold" color="blue.500">
                Learn More
              </Text>
              <FaArrowRightLong color="blue.400" />
              <Text fontSize="xs" color="gray.500">
                Favs: {favCount}
              </Text>
            </Box>
          </Link>
        </HStack>
      </Box>
    </Box>
  );
}
