import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  useDisclosure,
  Box,
  SimpleGrid,
  Heading,
  useColorModeValue,
  Text,
  useToast,
  Flex,
  Divider,
  Spinner,
} from "@chakra-ui/react";
import { SearchFilters } from "@/components/search/SearchFilters";
import { useRef, useState, useEffect } from "react";
import BlogCard from "@/components/layout/BlogCard";
import { useAuthStore } from "@/store/auth";
import { useBlogStore } from "@/store/blog";
import { useInView } from "react-intersection-observer";

export const ManageBlogs = () => {
  const {
    blogs,
    nextCursor,
    hasMore,
    loading,
    fetchPaginatedBlogs,
    resetBlogs,
    deleteBlog,
  } = useBlogStore();

  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const cancelRef = useRef();
  const { user, fetchUser } = useAuthStore();
  const { ref, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, []);

  useEffect(() => {
    if (user?.role === "superadmin") {
      resetBlogs();
      fetchPaginatedBlogs();
    }
  }, [user]);

  useEffect(() => {
    if (inView && hasMore && !loading && user?.role === "superadmin") {
      fetchPaginatedBlogs(nextCursor, 9);
    }
  }, [inView, hasMore, loading, nextCursor, user]);

  const handleDeleteClick = (id) => {
    setSelectedBlogId(id);
    onOpen();
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteBlog(selectedBlogId);
      toast({
        title: "Deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      resetBlogs();
      fetchPaginatedBlogs();
    } catch (err) {
      toast({
        title: "An error occurred",
        description: err?.response?.data?.message || "Unable to delete",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    onClose();
  };

  const bg = useColorModeValue("gray.50", "gray.700");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const headingColor = useColorModeValue("blue.600", "blue.300");

  if (user?.role !== "superadmin") {
    return (
      <Box p={8} bg={bg} minH="100vh">
        <Text fontSize="lg" color="red.500">
          You do not have permission to access this page.
        </Text>
      </Box>
    );
  }

  return (
    <Box bg={bg} minH="100vh" p={6}>
      <Flex
        justify="space-between"
        align="center"
        gap={4}
        mb={6}
        flexWrap={{ base: "wrap", md: "nowrap" }}
      >
        <Heading
          as="h2"
          size="xl"
          bgGradient="linear(to-r, #283E51, #485563, #2BC0E4)"
          letterSpacing="wide"
          fontWeight="extrabold"
          bgClip="text"
        >
          Manage Blogs
        </Heading>
        <Box flex="1" maxW={{ base: "100%", md: "320px", lg: "600px" }}>
          <SearchFilters />
        </Box>
      </Flex>

      <Divider mb={6} borderColor={borderColor} />

      {loading && blogs.length === 0 && (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
        </Box>
      )}

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
        {blogs.map((blog) => (
          <Box
            key={blog._id}
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            rounded="xl"
            shadow="lg"
            transition="all 0.3s"
            _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
          >
            <BlogCard blog={blog} showDelete onDelete={handleDeleteClick} />
          </Box>
        ))}
      </SimpleGrid>

      {loading && blogs.length > 0 && (
        <Spinner size="lg" color="gray.500" mt={4} />
      )}
      <div ref={ref} style={{ height: "1px" }} />
      {!hasMore && blogs.length > 0 && (
        <Text fontSize="sm" color="gray.400" mt={4} textAlign="center">
          You've reached the end.
        </Text>
      )}

      {/* Confirm Delete Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent
            bg={cardBg}
            borderRadius="xl"
            boxShadow="xl"
            border="1px solid"
            borderColor={borderColor}
          >
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="bold"
              color={headingColor}
            >
              Confirm Blog Deletion
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this blog? This action cannot be
              undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};
