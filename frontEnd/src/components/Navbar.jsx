import React from "react";
import {
  Box,
  Container,
  Flex,
  HStack,
  IconButton,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { CiSquarePlus } from "react-icons/ci";
import { HiMenu, HiX } from "react-icons/hi";
const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Box w="full" bg="white" shadow="sm" position="sticky" top={0} zIndex={999}>
      <Container maxW="1140px" px={6} py={4}>
        <Flex justify="space-between" align="center">
       
          <Text
            fontSize={{ base: "24", sm: "28" }}
            fontWeight="bold"
            textTransform="uppercase"
            bgClip="text"
            bgColor="black"
          >
            <Link to="/">Gym Advice</Link>
          </Text>

      
          <HStack
            spacing={6}
            display={{ base: "none", md: "flex" }}
            align="center"
          >
            <NavLink to="/">Home</NavLink>
            <NavLink to="/blogs">Blogs</NavLink>
            <Link to="/create">
              <CiSquarePlus className="size-5" />
            </Link>
          </HStack>

          {/* Burger Icon */}
          <IconButton
            display={{ base: "flex", md: "none" }}
            onClick={onToggle}
            _icon={isOpen ? <HiX  size={24} /> : <HiMenu size={24}/>}
            variant="ghost"
            aria-label="Toggle Menu"
            
            
          />
          

        </Flex>

        {/* Mobile Menu */}
        {isOpen && (
          <VStack
            spacing={4}
            align="start"
            mt={4}
            display={{ base: "flex", md: "none" }}
            pb={4}
          >
            <NavLink to="/">Home</NavLink>
            <NavLink to="/blogs">Blogs</NavLink>
            <Link to="/create">
              <CiSquarePlus className="size-5" />
            </Link>
          </VStack>
        )}
      </Container>
    </Box>
  );
};

const NavLink = ({ to, children }) => (
  <Text
    as={Link}
    to={to}
    fontSize={{ base: "16", sm: "18", lg: "20" }}
    fontWeight="medium"
    textTransform="uppercase"
    bgClip="text"
    bgColor="black"
  >
    {children}
  </Text>
);

export default Navbar;
