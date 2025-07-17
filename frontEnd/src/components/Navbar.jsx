import React, { useEffect } from "react";
import {
  Box,
  Container,
  Flex,
  HStack,
  IconButton,
  Text,
  VStack,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  MenuDivider,
  MenuGroup,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { FaHeart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { CiSquarePlus } from "react-icons/ci";
import { HiMenu, HiX } from "react-icons/hi";
import { FiBell, FiSettings, FiRepeat, FiLogOut, FiUser } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/auth";
import { useNotificationStore } from "../store/notificationStore";

const MotionMenuList = motion.create(MenuList);

const Navbar = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { user, logout } = useAuthStore();
  const { notifications, unseenCount, fetchNotifications, markAsRead } =
    useNotificationStore();
  const navigate = useNavigate();
  const MotionVStack = motion.create(VStack);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const handleSwitchRole = () => {
    navigate("/settings");
    onClose();
  };

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <Box
      position="fixed"
      top={2}
      zIndex={1000}
      w="60%"
      mx="auto"
      left="50%"
      transform="translateX(-50%)"
      borderRadius="2xl"
      backdropFilter="blur(20px)"
      bg="rgba(255, 255, 255, 0.2)"
      boxShadow="lg"
      px={4}
      py={1}
      fontFamily="Inter, sans-serif"
    >
      <Container maxW="1140px" px={6} py={4}>
        <Flex justify="space-between" align="center">
          {/* Logo */}
          <Text
            fontSize="2xl"
            fontWeight="bold"
            as={Link}
            to="/"
            _hover={{ opacity: 0.7 }}
            transition="0.3s"
          >
            Gym Advice
          </Text>

          {/* Desktop Menu */}
          <HStack
            spacing={5}
            display={{ base: "none", md: "flex" }}
            align="center"
          >
            <NavLink to="/">Home</NavLink>
            <NavLink to="/blogs">Blogs</NavLink>

            {user && (
              <>
                <IconButton
                  variant="ghost"
                  as={Link}
                  to="/create"
                  icon={<CiSquarePlus size={22} />}
                  aria-label="Create Blog"
                />
                {user.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
                {user.role === "superadmin" && (
                  <NavLink to="/superadmin">Superadmin</NavLink>
                )}

                {/* Notifications */}
                <Menu>
                  <MenuButton position="relative">
                    <FiBell size={20} />
                    {unseenCount > 0 && (
                      <Badge
                        colorScheme="red"
                        borderRadius="full"
                        position="absolute"
                        top="-2px"
                        right="-2px"
                        fontSize="xs"
                      >
                        {unseenCount}
                      </Badge>
                    )}
                  </MenuButton>
                  <MotionMenuList
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition="all 0.25s ease-in-out"
                    p={2}
                    borderRadius="lg"
                    boxShadow="lg"
                    bg="white"
                    minW="200px"
                    maxH="300px"
                    overflowY="auto"
                    zIndex={2000}
                  >
                    <MenuGroup title="Notifications">
                      {notifications.length === 0 ? (
                        <Spinner size="sm" />
                      ) : (
                        notifications.map((n) => (
                          <MenuItem
                            key={n._id}
                            onClick={() => markAsRead(n._id)}
                            transition="all 0.25s ease-in-out"
                          >
                            <Badge
                              size="xs"
                              colorScheme={n.read ? "gray" : "blue"}
                              mr={2}
                            />
                            {n.title}
                          </MenuItem>
                        ))
                      )}
                    </MenuGroup>
                  </MotionMenuList>
                </Menu>

                {/* Avatar Menu */}
                <Menu>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    p={0}
                    _hover={{ bg: "transparent" }}
                    _active={{ bg: "transparent" }}
                    transition="all 0.25s ease-in-out"
                  >
                    <Avatar size="sm" name={user.username} />
                  </MenuButton>
                  <MotionMenuList
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition="all 0.25s ease-in-out"
                    p={2}
                    borderRadius="lg"
                    boxShadow="lg"
                    bg="white"
                    minW="200px"
                    maxH="300px"
                    overflowY="auto"
                    zIndex={2000}
                  >
                    <MenuItem icon={<FiUser />}>Profile</MenuItem>
                    <MenuItem icon={<FiSettings />} onClick={handleSwitchRole}>
                      Settings
                    </MenuItem>
                    {user.role !== "superadmin" && (
                      <MenuItem icon={<FiRepeat />} onClick={handleSwitchRole}>
                        Switch Role
                      </MenuItem>
                    )}
                    <MenuDivider />
                    <MenuItem
                      icon={<FiLogOut />}
                      color="red.500"
                      onClick={logout}
                    >
                      Logout
                    </MenuItem>
                  </MotionMenuList>
                </Menu>
              </>
            )}

            {!user && (
              <>
                <NavLink to="/login" color="blue.600">
                  Login
                </NavLink>
                <NavLink to="/register" color="green.600">
                  Register
                </NavLink>
              </>
            )}
          </HStack>

          {/* Mobile Menu Icon */}
          <IconButton
            display={{ base: "flex", md: "none" }}
            onClick={isOpen ? onClose : onOpen}
            icon={isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            aria-label="Toggle Menu"
            variant="ghost"
          />
        </Flex>

        {/* Mobile Menu Items */}
        <AnimatePresence>
          {isOpen && (
            <MotionVStack
              spacing={4}
              bg="gray.50"
              p={4}
              rounded="md"
              mt={3}
              shadow="md"
              display={{ base: "flex", md: "none" }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition="all 0.25s ease-in-out"
            >
              <Button w="full" variant="ghost" onClick={() => handleNav("/")}>
                Home
              </Button>
              <Button
                w="full"
                variant="ghost"
                onClick={() => handleNav("/blogs")}
              >
                Blogs
              </Button>
              <Button
                leftIcon={<FaHeart />}
                colorScheme="pink"
                onClick={() => handleNav("/favorites")}
              >
                My Favorites
              </Button>
              {user ? (
                <>
                  <Button
                    w="full"
                    variant="ghost"
                    onClick={() => handleNav("/create")}
                  >
                    Create
                  </Button>
                  {user.role === "admin" && (
                    <Button
                      w="full"
                      variant="ghost"
                      onClick={() => handleNav("/admin")}
                    >
                      Admin
                    </Button>
                  )}
                  {user.role === "superadmin" && (
                    <Button
                      w="full"
                      variant="ghost"
                      onClick={() => handleNav("/superadmin")}
                    >
                      Superadmin
                    </Button>
                  )}
                  <Button
                    w="full"
                    colorScheme="red"
                    size="sm"
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    w="full"
                    variant="ghost"
                    onClick={() => handleNav("/login")}
                  >
                    Login
                  </Button>
                  <Button
                    w="full"
                    variant="ghost"
                    onClick={() => handleNav("/register")}
                  >
                    Register
                  </Button>
                </>
              )}
            </MotionVStack>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
};

const NavLink = ({ to, children, color = "gray.800" }) => (
  <Text
    as={Link}
    to={to}
    position="relative"
    px={2}
    py={1}
    fontWeight="500"
    fontSize="md"
    color={color}
    transition="all 0.3s ease"
    _before={{
      content: `""`,
      position: "absolute",
      bottom: 0,
      left: 2,
      width: "0%",
      height: "2px",
      bgGradient: "linear(to-r, blue.400, teal.400)",
      borderRadius: "full",
      transition: "width 0.3s ease-in-out",
    }}
    _hover={{
      color: "teal.500",
      transform: "scale(1.04)",
      _before: { width: "80%" },
    }}
  >
    {children}
  </Text>
);

export default Navbar;
