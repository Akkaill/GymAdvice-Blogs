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
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent rounded="2xl" border="1px solid #EFEAFD" shadow="lg">
        <Box
          px={6}
          py={4}
          bgGradient="linear(to-r, #7C3AED, #F43F5E)"
          color="white"
          roundedTop="2xl"
        >
          <ModalHeader p={0}>Edit Blog</ModalHeader>
        </Box>
        <ModalCloseButton color="white" top="14px" />

        <ModalBody pb={6} px={6} pt={5} bg="white">
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input name="title" value={form.title} onChange={handleChange} borderColor="#EFEAFD" />
            </FormControl>
            <FormControl>
              <FormLabel>Subtitle</FormLabel>
              <Input name="subtitle" value={form.subtitle} onChange={handleChange} borderColor="#EFEAFD" />
            </FormControl>
            <FormControl>
              <FormLabel>Image URL</FormLabel>
              <Input name="image" value={form.image} onChange={handleChange} borderColor="#EFEAFD" />
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea name="description" value={form.description} onChange={handleChange} borderColor="#EFEAFD" />
            </FormControl>

            <Divider />

            <Button
              onClick={handleSubmit}
              bgGradient="linear(to-r, #7C3AED, #F43F5E)"
              color="white"
              _hover={{ opacity: 0.9 }}
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
