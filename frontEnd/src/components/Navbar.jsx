import React, { useEffect, useState } from "react";
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
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CiSquarePlus } from "react-icons/ci";
import { HiMenu, HiX } from "react-icons/hi";
import { FiBell, FiSettings, FiRepeat, FiLogOut, FiUser } from "react-icons/fi";
import { FaRegHeart } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/auth";
import { useNotificationStore } from "../store/notificationStore";


const MotionBox = motion.create(Box);
const MotionMenuList = motion.create(MenuList);
const MotionVStack = motion.create(VStack);

const Navbar = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { user, logout } = useAuthStore();
  const { notifications, unseenCount, fetchNotifications, markAsRead } =
    useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = location.pathname === "/";
  const isHeroMode = isHome && !scrolled;

  const handleSwitchRole = () => {
    navigate("/settings");
    onClose();
  };

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  const fg = isHeroMode ? "white" : "gray.800";
  const iconFg = isHeroMode ? "white" : "black";

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      w="100%"
      zIndex={1000}
      pointerEvents="none"
    >
      <MotionBox
        pointerEvents="auto"
        mx="auto"
        fontFamily="Inter, sans-serif"
        px={4}
        py={2}
        variants={{
          hero: {
            width: "100%",
            borderRadius: "0px",
            backgroundColor: "rgba(255,255,255,0)",
            boxShadow: "0 0 0 rgba(0,0,0,0)",
            y: 0,
          },
          compact: {
            width: "75%",
            borderRadius: "1.25rem",
            backgroundColor: "rgba(255,255,255,0.9)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
            y: 20,
          },
        }}
        initial="hero"
        animate={isHeroMode ? "hero" : "compact"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
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
              color={fg}
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
              <NavLink to="/" scrolled={!isHeroMode}>
                Home
              </NavLink>
              <NavLink to="/blogs" scrolled={!isHeroMode}>
                Blogs
              </NavLink>

              {user && (
                <>
                  <IconButton
                    variant="ghost"
                    as={Link}
                    to="/create"
                    icon={<CiSquarePlus size={22} />}
                    aria-label="Create Blog"
                    color={iconFg}
                    _hover={{
                      bg: isHeroMode ? "whiteAlpha.200" : "gray.100",
                    }}
                  />
                  {user.role === "admin" && (
                    <NavLink to="/admin" scrolled={!isHeroMode}>
                      Admin
                    </NavLink>
                  )}
                  {user.role === "superadmin" && (
                    <NavLink to="/superadmin" scrolled={!isHeroMode}>
                      Superadmin
                    </NavLink>
                  )}

                  {/* Notifications */}
                  <Menu>
                    <MenuButton position="relative">
                      <FiBell size={20} color={iconFg} />
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
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
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
                       className="min-w-[120px] text-left"
                    >
                      <Avatar size="sm" name={user.username} />
                    </MenuButton>
                    <MotionMenuList
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.2 }}
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
                      <MenuItem
                        icon={<FaRegHeart />}
                        onClick={() => handleNav("/favorites")}
                      >
                        My Favorites
                      </MenuItem>
                      <MenuItem
                        icon={<FiSettings />}
                        onClick={handleSwitchRole}
                      >
                        Settings
                      </MenuItem>
                      {user.role !== "superadmin" && (
                        <MenuItem
                          icon={<FiRepeat />}
                          onClick={handleSwitchRole}
                        >
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
                  <NavLink to="/login" scrolled={!isHeroMode}>
                    Login
                  </NavLink>
                  <NavLink to="/register" scrolled={!isHeroMode}>
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
              color={iconFg}
              _hover={{
                bg: isHeroMode ? "whiteAlpha.200" : "gray.100",
              }}
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
                transition={{ duration: 0.25 }}
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
      </MotionBox>
    </Box>
  );
};


const NavLink = ({ to, children, scrolled }) => (
  <Text
    as={Link}
    to={to}
    fontWeight="500"
    fontSize="md"
    color={scrolled ? "gray.800" : "white"}
    transition="all 0.3s ease"
    _hover={{
      color: scrolled ? "blue.500" : "teal.300",
      transform: "scale(1.04)",
    }}
  >
    {children}
  </Text>
);

export default Navbar;
