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
} from "@chakra-ui/react";
import { SearchFilters } from "@/components/SearchFilters";

import { useRef, useState, useEffect } from "react";
import BlogCard from "@/components/BlogCard";
import { useAuthStore } from "@/store/auth";
import { useBlogStore } from "@/store/blog";

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

  if (user?.role !== "superadmin") {
    return (
      <Box p={8}>
        <Text fontSize="lg" color="red.500">
          You do not have permission to access this page.
        </Text>
      </Box>
    );
  }

  return (
    <Box
      px={{ base: 4, md: 10 }}
      py={8}
      minH="100vh"
    >
      <Heading
        mb={10}
        fontSize={{ base: "2xl", md: "4xl" }}
        color={useColorModeValue("gray.800", "white")}
        textAlign="center"
      >
        Blog Management
      </Heading>
      <SearchFilters />
      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
        {blogs.map((blog) => (
          <BlogCard
            key={blog._id}
            blog={blog}
            showDelete
            onDelete={handleDeleteClick}
          />
        ))}
      </SimpleGrid>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
        motionPreset="scale"
      >
        <AlertDialogOverlay>
          <AlertDialogContent
            bg={useColorModeValue("white", "gray.800")}
            borderRadius="xl"
            boxShadow="xl"
          >
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
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
