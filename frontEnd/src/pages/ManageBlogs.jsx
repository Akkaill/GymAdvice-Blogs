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
  IconButton,
  Tooltip,
  SimpleGrid,
  Heading,
  useColorModeValue,
  Text,
  useToast,
  Flex,
  Divider,
} from "@chakra-ui/react";
import { SearchFilters } from "@/components/search/SearchFilters";
import { useRef, useState, useEffect } from "react";
import BlogCard from "@/components/BlogCard";
import { useAuthStore } from "@/store/auth";
import { useBlogStore } from "@/store/blog";
import { Link } from "react-router-dom";
import { FiHome, FiGrid } from "react-icons/fi";

export const ManageBlogs = () => {
  const { blogs, fetchBlogs, deleteBlog } = useBlogStore();
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const cancelRef = useRef();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.role !== "superadmin") return;
    fetchBlogs();
  }, [user]);

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
    } catch (err) {
      toast({
        title: "An error occurred",
        description: err?.response?.data?.message || "Unable to delete",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    await fetchBlogs();
    onClose();
  };

  // สีพื้นหลังและกรอบให้เหมือน Manage Users
  const bg = useColorModeValue("gray.50", "gray.700");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const headingColor = useColorModeValue("blue.600", "blue.300");
  const hoverBg = useColorModeValue("gray.100", "gray.700");

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
      {/* Header */}
      <Flex
        justify="space-between"
        align="center"
        gap={4}
        mb={6}
        flexWrap={{ base: "wrap", md: "nowrap" }}
      >
        {/* Title */}
        <Heading
          as="h2"
          size="xl"
          color={headingColor}
          letterSpacing="wide"
          fontWeight="extrabold"
          flexShrink={0}
        >
          📝 Manage Blogs
        </Heading>

        {/* Search Filters */}
        <Box flex="1" maxW={{ base: "100%", md: "320px" ,lg:"600px"}}>
          <SearchFilters />
        </Box>
      </Flex>

      <Divider mb={6} borderColor={borderColor} />

      {/* Blog List */}
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

      {/* Confirm Delete Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
        motionPreset="scale"
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
