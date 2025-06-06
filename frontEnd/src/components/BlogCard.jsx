import { Box, HStack, Heading, Image, Text } from "@chakra-ui/react";
import React from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import { Link } from "react-router-dom";

export default function BlogCard({ blog }) {
  return (
    <Box
      shadow={"lg"}
      rounded={"lg"}
      overflow={"hidden"}
      transition={"all 0.3s"}
      _hover={{ transform: "translateY(-5px)", shadow: "xl" }}
      minH="300px"
    >
      <Image
        src={blog.image}
        alt={blog.title}
        w="full"
        aspectRatio={16 / 9}
        objectFit={"cover"}
      />
      <Box p={4}>
        <Heading as="h3" size={"md"} mb={2} noOfLines={1}>
          {blog.title}
        </Heading>
        <Text
          fontWeight={"bold"}
          fontSize={"xl"}
          color={"blackAlpha.600"}
          mb={4}
          noOfLines={2}
        >
          {blog.subtitle}
        </Text>
        <HStack wordSpacing={2} display={"flex"} justifyContent={"flex-end"}>
          <Link to={`/blogs/${blog._id}`}>
            <Box
              transition={"all 0.3s"}
              _hover={{ transform: "translateX(-5px)", shadow: "xl" }}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              rounded={"lg"}
              p={1}
              gap={1}
            >
              <Text>Learn more</Text>
              <Text>
                <FaArrowRightLong />
              </Text>
            </Box>
          </Link>
        </HStack>
      </Box>
    </Box>
  );
}
