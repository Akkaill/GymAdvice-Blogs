import { useBlogStore } from "@/store/blog";
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  VStack,
} from "@chakra-ui/react";
import { toast } from "sonner";

import React from "react";
import { useState } from "react";

export const CreatePage = () => {
  const [newBlog, setNewBlog] = useState({
    title: "",
    subtitle: "",
    description: "",
    image: "",
  });

  const { createBlog } = useBlogStore();

  const handleAddNewBlog = async () => {
    // Show a fake loading toast with duration because toast.loading it doesnt work in sonner TT
    toast("⏳ Creating blog...", {
      duration: 3500, // 3.5 seconds
    });
    try {
      await new Promise((resolve) => setTimeout(resolve, 3500));
      const { success, message } = await createBlog(newBlog);

      if (success) {
        toast.success(` ✅ The creation was successful: ${message}`, {
          duration: 4000,
        });
        setNewBlog({
          title: "",
          subtitle: "",
          description: "",
          image: "",
        });
      } else {
        // Manually trigger error toast (red color)
        toast.error(` ❌ The creation was unsuccessful: ${message}`, {
          duration: 4000,
        });
      }

      console.log(success, "success");
      console.log(message, "message");
    } catch (error) {
      toast.error(
        ` 🚫 The creation failed: ${error.message || "Unknown error"}`,
        { duration: 4000 }
      );
      console.error("Create blog error:", error);
    }
  };
  return (
    <Container maxW={"container.sm"}>
      <VStack wordSpacing={8}>
        <Heading as={"h1"} textAlign={"center"} mb={8}>
          Create New Blog
        </Heading>
        <Box w={"full"} p="6" rounded={"lg"} shadow={"sm"}>
          <VStack wordSpacing={4}>
            <Input
              placeholder="Title"
              name="title"
              value={newBlog.title}
              onChange={(e) =>
                setNewBlog({ ...newBlog, title: e.target.value })
              }
            />
            <Input
              placeholder="subtitle"
              name="subtitle"
              value={newBlog.subtitle}
              onChange={(e) =>
                setNewBlog({ ...newBlog, subtitle: e.target.value })
              }
            />
            <Input
              placeholder="description"
              name="description"
              value={newBlog.description}
              onChange={(e) =>
                setNewBlog({ ...newBlog, description: e.target.value })
              }
            />
            <Input
              placeholder="image"
              name="image"
              value={newBlog.image}
              onChange={(e) =>
                setNewBlog({ ...newBlog, image: e.target.value })
              }
            />
            <Button onClick={handleAddNewBlog} w={"full"}>
              ADD BLOG
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};
