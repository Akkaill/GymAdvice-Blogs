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
      <ModalContent>
        <ModalHeader>Edit Blog</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input name="title" value={form.title} onChange={handleChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Subtitle</FormLabel>
              <Input name="subtitle" value={form.subtitle} onChange={handleChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Image URL</FormLabel>
              <Input name="image" value={form.image} onChange={handleChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </FormControl>
            <Button colorScheme="teal" onClick={handleSubmit} w="full">
              Save Changes
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
