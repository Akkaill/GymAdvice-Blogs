import React from "react";
import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Link as CLink,
  IconButton,
  HStack,
  VStack,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Divider,
  useColorModeValue,
  Tooltip,
  Badge,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import { GiBiceps } from "react-icons/gi";
import {FiArrowUpRight } from "react-icons/fi";

const Footer = () => {
  const toast = useToast();
  const bg = useColorModeValue("gray.50", "gray.900");
  const fg = useColorModeValue("gray.700", "gray.300");
  const heading = useColorModeValue("gray.900", "white");
  const subtle = useColorModeValue("gray.500", "gray.400");
  const accent = useColorModeValue("teal.500", "teal.300");
  const borderCol = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      bg={bg}
      color={fg}
      borderTopWidth="1px"
      borderColor={borderCol}
      position="relative"
      overflow="hidden"
    >
      {/* Decorative glow blobs */}
      <Box
        aria-hidden
        position="absolute"
        top="-80px"
        right="-120px"
        w="320px"
        h="320px"
       bgGradient="linear(to-tr,gray.200,gray.500,gray.900)"
        filter="blur(40px)"
        opacity={0.25}
      />
      <Box
        aria-hidden
        position="absolute"
        bottom="-100px"
        left="-140px"
        w="360px"
        h="360px"
      bgGradient="linear(to-tr,gray.200,gray.500,gray.900)"
        filter="blur(50px)"
        opacity={0.2}
      />

      {/* Accent gradient bar */}
    

      <Container maxW="7xl" px={{ base: 4, md: 8 }} py={{ base: 10, md: 14 }}>
        <SimpleGrid
          columns={{ base: 1, sm: 2, lg: 4 }}
          spacing={{ base: 10, md: 14 }}
        >
          {/* Brand */}
          <Stack spacing={4}>
            <Flex align="center" gap={2}>
              <Box as={GiBiceps} boxSize={6} color={"blackAlpha.800"} />
              <Text
                fontWeight="extrabold"
                fontSize="xl"
                bgColor={'blackAlpha.800'}
                bgClip="text"
              >
                Gym Advice
              </Text>
            </Flex>
            <Text fontSize="sm" color={subtle} lineHeight="tall">
              A fitness community—stories, nutrition, and training that actually
              works.
            </Text>
          </Stack>

          {/* Navigation 1 */}
          <Stack spacing={3}>
            <Text fontWeight="semibold" color={heading}>
              Menu
            </Text>
            <CLink
              as={RouterLink}
              to="/"
              _hover={{ color: accent, textDecoration: "none" }}
            >
              Home
            </CLink>
            <CLink
              as={RouterLink}
              to="/create"
              _hover={{ color: accent, textDecoration: "none" }}
            >
              Create
            </CLink>
            <CLink
              as={RouterLink}
              to="/blogs"
              _hover={{ color: accent, textDecoration: "none" }}
            >
              All Blogs
            </CLink>
          </Stack>
        </SimpleGrid>

        <Divider my={8} borderColor={borderCol} />

        {/* Bottom bar */}
        <Flex
          direction={{ base: "column", md: "row" }}
          align={{ base: "flex-start", md: "center" }}
          justify="space-between"
          gap={4}
          fontSize="sm"
          color={subtle}
        >
          <Text>
            © {new Date().getFullYear()} Gym Advice. All rights reserved.
          </Text>

          <Button
            size="sm"
            variant="ghost"
            rightIcon={<FiArrowUpRight />}
            _hover={{ color: accent, transform: "translateY(-1px)" }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Back to top
          </Button>

          <HStack spacing={2}>
            <Tooltip label="GitHub" hasArrow>
              <IconButton
                as="a"
                href="https://github.com/"
                target="_blank"
                aria-label="GitHub"
                variant="ghost"
                borderWidth="1px"
                borderColor={borderCol}
                borderRadius="full"
                _hover={{ color: accent, transform: "translateY(-2px)" }}
                transition="all 0.2s"
                icon={<FaGithub />}
              />
            </Tooltip>
            <Tooltip label="Twitter / X" hasArrow>
              <IconButton
                as="a"
                href="https://twitter.com/"
                target="_blank"
                aria-label="Twitter"
                variant="ghost"
                borderWidth="1px"
                borderColor={borderCol}
                borderRadius="full"
                _hover={{ color: accent, transform: "translateY(-2px)" }}
                transition="all 0.2s"
                icon={<FaTwitter />}
              />
            </Tooltip>
            <Tooltip label="LinkedIn" hasArrow>
              <IconButton
                as="a"
                href="https://linkedin.com/"
                target="_blank"
                aria-label="LinkedIn"
                variant="ghost"
                borderWidth="1px"
                borderColor={borderCol}
                borderRadius="full"
                _hover={{ color: accent, transform: "translateY(-2px)" }}
                transition="all 0.2s"
                icon={<FaLinkedin />}
              />
            </Tooltip>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;
