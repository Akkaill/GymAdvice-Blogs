import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  Input,
  Textarea,
  Button,
  useToast,
  FormControl,
  FormLabel,
  Box,
  Divider,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useProfileStore } from "@/store/profileStore";

export default function EditBlogModal({ isOpen, onClose, blog }) {
  const toast = useToast();
  const { updateBlog } = useProfileStore();

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    if (blog) {
      setForm({
        title: blog.title || "",
        subtitle: blog.subtitle || "",
        description: blog.description || "",
        image: blog.image || "",
      });
    }
  }, [blog]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    const res = await updateBlog(blog._id, form);
    toast({
      title: res.success ? "Updated" : "Error",
      description: res.message || "Failed to update blog",
      status: res.success ? "success" : "error",
      duration: 3000,
      isClosable: true,
    });
    if (res.success) onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent
        rounded="2xl"
        shadow="2xl"
        border="1px solid"
        borderColor="gray.100"
      >
        <Box px={6} py={4} borderBottom="1px solid" borderColor="gray.200">
          <ModalHeader fontSize="xl" fontWeight="bold" color="gray.800" p={0}>
            Edit Blog
          </ModalHeader>
        </Box>
        <ModalCloseButton top="12px" />

        <ModalBody pb={6} px={6} pt={5} bg="white">
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                borderColor="gray.200"
                _hover={{ borderColor: "gray.400" }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Subtitle</FormLabel>
              <Input
                name="subtitle"
                value={form.subtitle}
                onChange={handleChange}
                borderColor="gray.200"
                _hover={{ borderColor: "gray.400" }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Image URL</FormLabel>
              <Input
                name="image"
                value={form.image}
                onChange={handleChange}
                borderColor="gray.200"
                _hover={{ borderColor: "gray.400" }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                borderColor="gray.200"
                _hover={{ borderColor: "gray.400" }}
              />
            </FormControl>

            <Divider />

            <Button
              onClick={handleSubmit}
              bg="blue.600"
              color="white"
              _hover={{ bg: "blue.700" }}
              w="full"
              height="44px"
              rounded="xl"
            >
              Save Changes
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
