 import {
  Box,
  HStack,
  Heading,
  IconButton,
  Image,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { MdModeEdit, MdDelete } from "react-icons/md";

export const BlogCard = ({ blog }) => {
  return (
    <Box
      shadow={"lg"}
      rounded={"lg"}
      overflow={"hidden"}
      transition={"all 0.3s"}
      _hover={{ transform: "translateY(-5px)", shadow: "xl" }}
    >
      <Image
        src={blog.image}
        alt={blog.title}
        h={45}
        w="full"
        objectFit={"cover"}
      />
      <Box p={4}>
        <Heading as="h3" size={"md"} mb={2}>
          {blog.title}
        </Heading>
        <Text
          fontWeight={"bold"}
          fontSize={"xl"}
          color={"blackAlpha.600"}
          mb={4}
        >{blog.subtitle}</Text>
        {/* <HStack wordSpacing={2}>
          <IconButton _icon={<MdModeEdit />} colorScheme="blue" />
          <IconButton _icon={<MdDelete />} colorScheme="blue" />
        </HStack> */}
      </Box>
    </Box>
  );
};
