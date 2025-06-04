import React from "react";
import { Box, Text, Stack, Link, IconButton, Flex } from "@chakra-ui/react";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import { GiBiceps } from "react-icons/gi";
const Footer = () => {
  return (
    <Box bg={"gray.100"} color={"gray.700"} py={10} mt={10}>
      <Flex
        direction={{ base: "column", md: "row" }}
        maxW="6xl"
        mx="auto"
        justify="space-between"
        align="center"
        px={6}
        gap={4}
      >
        {/* Branding */}
        <Text fontWeight="bold" fontSize="lg" display={'flex'} gap={'2'}>
          <GiBiceps /> BlogSpace
        </Text>

        {/* Navigation Links */}
        <Stack direction="row" spacing={6}>
          <Link href="/">Home</Link>
          <Link href="/create">Create</Link>
          <Link href="/about">About</Link>
        </Stack>

        {/* Social Icons */}
        <Stack direction="row" spacing={4}>
          <IconButton
            as="a"
            href="https://github.com/"
            target="_blank"
            aria-label="GitHub"
            variant="ghost"
          >
            <FaGithub />
          </IconButton>
          <IconButton
            as="a"
            href="https://twitter.com/"
            target="_blank"
            aria-label="Twitter"
            variant="ghost"
          >
            <FaTwitter />
          </IconButton>
          <IconButton
            as="a"
            href="https://linkedin.com/"
            target="_blank"
            aria-label="LinkedIn"
            variant="ghost"
          >
            <FaLinkedin />
          </IconButton>
        </Stack>
      </Flex>

      {/* Copyright */}
      <Text textAlign="center" fontSize="sm" mt={6}>
        © {new Date().getFullYear()} BlogSpace. All rights reserved.
      </Text>
    </Box>
  );
};

export default Footer;
