import { Box, Button, Container, Heading, Input, VStack } from "@chakra-ui/react";
import React from "react";
import { useState } from "react";

export const CreatePage = () => {
  const [newBlog, setNewBlog] = useState({
    title: "",
    subtitle: "",
    description: "",
    image: "",
  });
  const handleAddNewBlog = ()=>{

  }
  return (
    <Container maxW={"container.sm"} >
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
            <Button onClick={handleAddNewBlog} w={'full'}>ADD BLOG</Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};
