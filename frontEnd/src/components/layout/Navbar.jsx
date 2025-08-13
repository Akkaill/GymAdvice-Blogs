// src/components/Navbar.jsx
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
  usePrefersReducedMotion,
} from "@chakra-ui/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CiSquarePlus } from "react-icons/ci";
import { HiMenu, HiX } from "react-icons/hi";
import { FiBell, FiLogOut, FiUser, FiBarChart2 } from "react-icons/fi";
import { FaRegHeart } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/auth";
import { useNotificationStore } from "@/store/notificationStore";

const MotionBox = motion.create(Box);
const MotionMenuList = motion.create(MenuList);
const MotionVStack = motion.create(VStack);

const NAV_HEIGHT_BASE = 64;
const NAV_HEIGHT_MD = 76;

const Navbar = () => {
  const menuDisc = useDisclosure(); // mobile menu
  const { user, logout, isUserReady, isAuthenticated } = useAuthStore();

  const {
    notifications = [],
    unseenCount = 0,
    fetchNotifications,
    markAsRead,
    loading,
  } = useNotificationStore();

  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();

  const [scrolled, setScrolled] = useState(false);


  useEffect(() => {
    if (isUserReady && isAuthenticated) fetchNotifications();
  }, [isUserReady, isAuthenticated, fetchNotifications]);


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  useEffect(() => {
    menuDisc.onClose();
  }, [location.pathname]);

  const isHome = location.pathname === "/";
  const isHeroMode = isHome && !scrolled;

  const handleNav = (path) => {
    navigate(path);
    menuDisc.onClose();
  };

  const fg = isHeroMode ? "white" : "gray.800";
  const iconFg = isHeroMode ? "white" : "black";
  const iconHoverBg = isHeroMode ? "whiteAlpha.200" : "gray.100";

  return (
    <>
      <Box position="fixed" top="0" left="0" w="100%" zIndex={1000} pointerEvents="none">
        <MotionBox
          pointerEvents="auto"
          mx="auto"
          fontFamily="Inter, ui-sans-serif, system-ui"
          px={{ base: 3, md: 4 }}
          py={{ base: 1, md: 2 }}
          sx={{
            backdropFilter: isHeroMode ? "saturate(140%) blur(3px)" : "none",
            WebkitBackdropFilter: isHeroMode ? "saturate(140%) blur(3px)" : "none",
          }}
          variants={{
            hero: {
              width: "100%",
              borderRadius: "0px",
              backgroundColor: "rgba(255,255,255,0)",
              boxShadow: "0 0 0 rgba(0,0,0,0)",
              y: 0,
            },
            compact: {
              width: "min(1120px, 92%)",
              borderRadius: "24px",
              backgroundColor: "rgba(255,255,255,0.9)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              y: 14,
            },
          }}
          initial="hero"
          animate={isHeroMode ? "hero" : "compact"}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35, ease: "easeInOut" }}
        >
          <Container maxW="1140px" px={{ base: 2, md: 6 }} py={{ base: 2, md: 3 }}>
            <Flex
              justify="space-between"
              align="center"
              minH={{ base: `${NAV_HEIGHT_BASE}px`, md: `${NAV_HEIGHT_MD}px` }}
            >
              {/* Left: Brand */}
              <Text
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="bold"
                as={Link}
                to="/"
                _hover={{ opacity: 0.85 }}
                color={fg}
                transition="0.2s"
                letterSpacing="0.2px"
              >
                Gym Advice
              </Text>

              {/* Center/Right: Desktop nav */}
              <HStack spacing={6} display={{ base: "none", md: "flex" }} align="center">
                <NavLink to="/" scrolled={!isHeroMode}>
                  Home
                </NavLink>
                <NavLink to="/blogs" scrolled={!isHeroMode}>
                  Blogs
                </NavLink>

                {user ? (
                  <>
                    <IconButton
                      variant="ghost"
                      as={Link}
                      to="/create"
                      icon={<CiSquarePlus size={22} />}
                      aria-label="Create Blog"
                      color={iconFg}
                      _hover={{ bg: iconHoverBg }}
                    />

                    {/* Notifications (Desktop) */}
                    <NotificationsMenu
                      iconColor={iconFg}
                      unseenCount={unseenCount}
                      loading={loading}
                      notifications={notifications}
                      markAsRead={markAsRead}
                      prefersReducedMotion={prefersReducedMotion}
                    />

                    {/* Account */}
                    <Menu isLazy>
                      <MenuButton
                        as={Button}
                        variant="ghost"
                        p={0}
                        _hover={{ bg: "transparent" }}
                        _active={{ bg: "transparent" }}
                        minW="unset"
                        aria-label="Account menu"
                      >
                        <Avatar
                          size="sm"
                          src={user?.avatar}
                          bg="gray.100"
                          border="1px solid rgba(0,0,0,0.08)"
                        />
                      </MenuButton>
                      <MotionMenuList
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
                        p={2}
                        borderRadius="lg"
                        boxShadow="lg"
                        bg="white"
                        minW="220px"
                        zIndex={2000}
                      >
                        <MenuItem icon={<FiUser />} onClick={() => navigate("/profile")}>
                          Profile
                        </MenuItem>
                        <MenuItem icon={<FaRegHeart />} onClick={() => navigate("/favorites")}>
                          My Favorites
                        </MenuItem>
                        {(user?.role === "admin" || user?.role === "superadmin") && (
                          <MenuItem icon={<FiBarChart2 />} onClick={() => navigate("/dashboard")}>
                            Dashboard
                          </MenuItem>
                        )}
                        <MenuDivider />
                        <MenuItem
                          icon={<FiLogOut />}
                          color="red.500"
                          onClick={() => logout()}
                        >
                          Logout
                        </MenuItem>
                      </MotionMenuList>
                    </Menu>
                  </>
                ) : (
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

              {/* Right: Mobile actions (bell + hamburger) */}
              <HStack spacing={1} display={{ base: "flex", md: "none" }} align="center">
                {user && (
                  <NotificationsMenu
                    iconColor={iconFg}
                    unseenCount={unseenCount}
                    loading={loading}
                    notifications={notifications}
                    markAsRead={markAsRead}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                )}

                <IconButton
                  onClick={menuDisc.isOpen ? menuDisc.onClose : menuDisc.onOpen}
                  icon={menuDisc.isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
                  aria-label="Toggle menu"
                  variant="ghost"
                  color={iconFg}
                  _hover={{ bg: iconHoverBg }}
                />
              </HStack>
            </Flex>

            {/* Mobile Menu */}
            <AnimatePresence>
              {menuDisc.isOpen && (
                <MotionVStack
                  spacing={1}
                  bg="rgba(255,255,255,0.95)"
                  backdropFilter="saturate(140%) blur(10px)"
                  p={3}
                  rounded="xl"
                  mt={2}
                  shadow="lg"
                  border="1px solid rgba(239,234,253,1)"
                  display={{ base: "flex", md: "none" }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                >
                  <Button w="full" variant="ghost" onClick={() => handleNav("/")}>
                    Home
                  </Button>
                  <Button w="full" variant="ghost" onClick={() => handleNav("/blogs")}>
                    Blogs
                  </Button>

                  {user ? (
                    <>
                      {(user.role === "admin" || user.role === "superadmin") && (
                        <Button w="full" variant="ghost" onClick={() => handleNav("/dashboard")}>
                          Dashboard
                        </Button>
                      )}
                      <Button w="full" variant="ghost" onClick={() => handleNav("/create")}>
                        Create
                      </Button>
                      <Button w="full" variant="ghost" onClick={() => handleNav("/profile")}>
                        My Profile
                      </Button>
                      <Button w="full" variant="ghost" onClick={() => handleNav("/favorites")}>
                        My Favorites
                      </Button>
                      <Button
                        w="full"
                        colorScheme="red"
                        onClick={() => {
                          logout();
                          menuDisc.onClose();
                        }}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button w="full" variant="ghost" onClick={() => handleNav("/login")}>
                        Login
                      </Button>
                      <Button w="full" variant="ghost" onClick={() => handleNav("/register")}>
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

      {/* Spacer: avoid content overlap (not needed in hero mode) */}
      {!isHeroMode && (
        <Box
          h={{ base: `${NAV_HEIGHT_BASE + 16}px`, md: `${NAV_HEIGHT_MD + 24}px` }}
          w="100%"
        />
      )}
    </>
  );
};

function NotificationsMenu({
  iconColor,
  unseenCount,
  loading,
  notifications,
  markAsRead,
  prefersReducedMotion,
}) {
  return (
    <Menu isLazy>
      <MenuButton position="relative" aria-label="Notifications">
        <FiBell size={20} color={iconColor} />
        {unseenCount > 0 && (
          <Badge
            colorScheme="red"
            borderRadius="full"
            position="absolute"
            top="-6px"
            right="-8px"
            fontSize="0.65rem"
            px="1.5"
          >
            {unseenCount}
          </Badge>
        )}
      </MenuButton>
      <MotionMenuList
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
        p={2}
        borderRadius="lg"
        boxShadow="lg"
        bg="white"
        minW="260px"
        maxH="320px"
        overflowY="auto"
        zIndex={2000}
      >
        <MenuGroup title="Notifications">
          {loading ? (
            <Flex justify="center" p={3}>
              <Spinner size="sm" />
            </Flex>
          ) : notifications.length === 0 ? (
            <Text px={3} py={2} fontSize="sm" color="gray.500">
              No notifications
            </Text>
          ) : (
            notifications.map((n) => (
              <MenuItem
                key={n._id}
                onClick={() => markAsRead(n._id)}
                transition="all 0.2s ease"
              >
                <Badge mr={2} variant="solid" colorScheme={n.read ? "gray" : "blue"} />
                <Text fontSize="sm" color="gray.700">
                  {n.title}
                </Text>
              </MenuItem>
            ))
          )}
        </MenuGroup>
      </MotionMenuList>
    </Menu>
  );
}

const NavLink = ({ to, children, scrolled }) => {
  const location = useLocation();
  const isActive = location?.pathname === to;
  return (
    <Box position="relative">
      <Text
        as={Link}
        to={to}
        fontWeight="600"
        fontSize="md"
        color={scrolled ? "gray.800" : "white"}
        transition="all 0.2s ease"
        _hover={{
          color: scrolled ? "blue.600" : "teal.300",
          transform: "translateY(-1px)",
        }}
      >
        {children}
      </Text>
      {isActive && (
        <Box mt="6px" h="2px" borderRadius="full" bgGradient="linear(to-r, #7C3AED, #F43F5E)" />
      )}
    </Box>
  );
};

export default Navbar;
