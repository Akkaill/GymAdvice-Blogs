import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
  Grid,
  GridItem,
  SimpleGrid,
  HStack,
  VStack,
  Text,
  Badge,
  Button,
  Spinner,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  useColorModeValue,
  useToast,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerCloseButton,
  DrawerBody,
  useDisclosure,
  useBreakpointValue,
  Divider,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiActivity,
  FiTrendingUp,
} from "react-icons/fi";
import { HiMenu } from "react-icons/hi";

import { useDashboardStore } from "@/store/dashboardStore";
import { useAuthStore } from "@/store/auth";

import {
  BlogStatsChart,
  LoginStatsChart,
} from "@/components/dashboardSection/ChartStats";
import { DashboardCalendar } from "@/components/dashboardSection/Calendar";

const MotionBox = motion.create(Box);
const MotionVStack = motion.create(VStack);
const MotionTr = motion.tr;
const MotionMenuList = motion.create(MenuList);

export default function Dashboard() {
  const {
    stats,
    recentLogs,
    users = [],
    fetchStats,
    fetchRecentLogs,
    fetchUsers,
    updateUserRole,
    deleteUser,
    createAdmin,
    loadingLogs,
    loadingUsers,
  } = useDashboardStore();

  const { user, isUserReady, isAuthenticated, logout } = useAuthStore();

  const [roleChanges, setRoleChanges] = useState({});
  const [newAdmin, setNewAdmin] = useState({ username: "", password: "" });

  const toast = useToast();
  const drawer = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const pageBg = "#F8F7FF";
  const cardBg = useColorModeValue("white", "gray.800");
  const subtle = useColorModeValue("gray.600", "gray.300");

  useEffect(() => {
    const canLoad =
      isUserReady &&
      isAuthenticated &&
      user &&
      ["admin", "superadmin"].includes(user.role);

    if (canLoad) {
      fetchStats();
      fetchRecentLogs();
      fetchUsers();
    }
  }, [isUserReady, isAuthenticated, user, fetchStats, fetchRecentLogs, fetchUsers]);

  const handleSaveRole = async (userId) => {
    const newRole = roleChanges[userId];
    const userObj = users.find((u) => u._id === userId);
    if (!newRole || newRole === userObj?.role) return;

    await updateUserRole(userId, newRole);
    toast({
      title: "Role updated",
      description: "User role has been successfully updated.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    fetchUsers();
  };

  if (!isUserReady) {
    return (
      <HStack justify="center" align="center" h="100vh" bg="#F8F7FF">
        <Spinner size="xl" />
      </HStack>
    );
  }
  if (!isAuthenticated || !["admin", "superadmin"].includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Safe guards
  const safeStats = {
    users: stats?.users ?? 0,
    admins: Array.isArray(stats?.admins)
      ? stats.admins.length
      : stats?.admins ?? 0,
    superadmin: stats?.superadmin ?? 0,
    blogs: stats?.blogs ?? 0,
    logs: stats?.logs ?? 0,
    completionRate: stats?.completionRate ?? 0,
    productivityScore: stats?.productivityScore ?? 0,
  };

  return (
    <Box minH="100vh" bg={pageBg} display="flex">
      {/* Sidebar (Desktop) */}
      <Box
        w={{ base: "0px", md: "260px" }}
        display={{ base: "none", md: "block" }}
        bg="white"
        borderRight="1px solid #EFEAFD"
        px={5}
        py={6}
        position="sticky"
        top={0}
        h="100vh"
      >
        <SidebarContent userRole={user?.role} />
      </Box>

      {/* Mobile Drawer Sidebar */}
      <Drawer placement="left" onClose={drawer.onClose} isOpen={drawer.isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Admin Panel</DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing={4} mt={2}>
              <Link to="/">
                <HStack
                  px={3}
                  py={2}
                  rounded="md"
                  _hover={{ bg: "gray.50" }}
                  border="1px solid #EFEAFD"
                >
                  <FiHome />
                  <Text>Home</Text>
                </HStack>
              </Link>
              {user?.role === "superadmin" && (
                <NavItem to="/manage-blogs" icon={<FiFileText />} label="Blogs" />
              )}
              <NavItem to="/manage-users" icon={<FiUsers />} label="Users" />
              <a href="#logs" onClick={drawer.onClose}>
                <NavPill icon={<FiFileText />} label="Logs" />
              </a>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main */}
      <Box flex="1" px={{ base: 4, md: 6, xl: 8 }} py={4} w="100%">
        {/* Top bar / header */}
        <HStack justify="space-between" mb={6} flexWrap="wrap" gap={3}>
          <HStack spacing={3}>
            {isMobile && (
              <IconButton
                aria-label="Open menu"
                icon={<HiMenu />}
                variant="ghost"
                onClick={drawer.onOpen}
              />
            )}
            <VStack align="flex-start" spacing={0}>
              <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold">
                Welcome to Your Dashboard
              </Text>
              <Text fontSize="sm" color={subtle}>
                System overview • live from store
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={3}>
            <Badge
              rounded="full"
              px={3}
              py={1}
              bg="#F8F7FF"
              border="1px solid #EFEAFD"
            >
              {user.role === "superadmin" ? "👑 Superadmin" : "🛠 Admin"}
            </Badge>
            <Button colorScheme="red" rounded="lg" onClick={logout}>
              Logout
            </Button>
          </HStack>
        </HStack>

        {/* Stat Cards */}
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 3, xl: 5 }}
          spacing={5}
          mb={6}
        >
          <StatCard
            title="Users"
            value={safeStats.users}
            icon="users"
            gradient="linear(to-r, #7C3AED, #A78BFA)"
          />
          <StatCard
            title="Admins"
            value={safeStats.admins}
            icon="activity"
            gradient="linear(to-r, #F43F5E, #FB7185)"
          />
          <StatCard
            title="Superadmins"
            value={safeStats.superadmin}
            icon="trending"
            gradient="linear(to-r, #F59E0B, #FDE68A)"
          />
          <StatCard
            title="Blogs"
            value={safeStats.blogs}
            icon="file"
            gradient="linear(to-r, #22C55E, #86EFAC)"
          />
          <StatCard
            title="Logs"
            value={safeStats.logs}
            icon="file"
            gradient="linear(to-r, #3B82F6, #93C5FD)"
          />
        </SimpleGrid>

        {/* Charts Row */}
        <Grid
          templateColumns={{ base: "1fr", lg: "1fr", xl: "7fr 5fr" }}
          gap={5}
          mb={6}
        >
          <GridItem>
            <Card>
              <BlogStatsChart />
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <LoginStatsChart />
            </Card>
          </GridItem>
        </Grid>

        {/* Calendar + Recent Logs */}
        <Grid
          templateColumns={{ base: "1fr", lg: "1fr", xl: "5fr 7fr" }}
          gap={5}
          mb={6}
        >
          <GridItem>
            <Card>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                minH={{ base: "280px", md: "100%" }}
              >
                <DashboardCalendar />
              </Box>
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <HStack justify="space-between" mb={3} id="logs">
                <Text fontWeight="bold">Recent Logs</Text>
                <Badge
                  rounded="full"
                  px={3}
                  py={1}
                  bg="#F8F7FF"
                  border="1px solid #EFEAFD"
                >
                  {recentLogs?.length ?? 0} items
                </Badge>
              </HStack>

              {loadingLogs ? (
                <HStack h={{ base: "160px", md: "220px" }} align="center" justify="center">
                  <Spinner size="lg" />
                </HStack>
              ) : (
                <VStack
                  align="stretch"
                  spacing={3}
                  maxH={{ base: "none", md: "260px" }}
                  overflowY={{ base: "visible", md: "auto" }}
                >
                  {recentLogs?.length ? (
                    recentLogs.map((log) => <LogItem key={log._id} log={log} />)
                  ) : (
                    <Empty text="No recent logs" />
                  )}
                </VStack>
              )}
            </Card>
          </GridItem>
        </Grid>

        {/* User Management (superadmin only) */}
        {user.role === "superadmin" && (
          <Card id="users">
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              User Management
            </Text>

            {loadingUsers ? (
              <Spinner />
            ) : isMobile ? (
              // Mobile: Card list
              <VStack align="stretch" spacing={3}>
                {users.map((u) => (
                  <Box
                    key={u._id}
                    p={4}
                    rounded="xl"
                    border="1px solid #EFEAFD"
                    bg="#FDFBFF"
                  >
                    <HStack justify="space-between" align="flex-start">
                      <HStack>
                        <Avatar size="sm" name={u.username} />
                        <VStack spacing={0} align="flex-start">
                          <Text fontWeight="semibold">{u.username}</Text>
                          <Text fontSize="xs" color="gray.600">
                            Role: {roleChanges[u._id] || u.role}
                          </Text>
                        </VStack>
                      </HStack>
                      <Badge rounded="full" px={3} py={1} bg="white" border="1px solid #EFEAFD">
                        {u.role}
                      </Badge>
                    </HStack>

                    <Divider my={3} />

                    {u.role === "superadmin" ? (
                      <Text fontSize="sm" color="gray.600">
                        👑 Super Admin
                      </Text>
                    ) : (
                      <HStack spacing={3} flexWrap="wrap">
                        <Menu>
                          <MenuButton
                            as={Button}
                            rightIcon={<ChevronDownIcon />}
                            size="sm"
                            bg="#F8F7FF"
                            border="1px solid #EFEAFD"
                            _hover={{ bg: "#efe9ff" }}
                          >
                            {roleChanges[u._id] || u.role}
                          </MenuButton>
                          <MotionMenuList
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            border="1px solid #EFEAFD"
                          >
                            {["user", "admin", "superadmin"].map((r) => (
                              <MenuItem
                                key={r}
                                onClick={() =>
                                  setRoleChanges({
                                    ...roleChanges,
                                    [u._id]: r,
                                  })
                                }
                                bg={
                                  roleChanges[u._id] === r || u.role === r
                                    ? "#F8F7FF"
                                    : "white"
                                }
                              >
                                {r}
                              </MenuItem>
                            ))}
                          </MotionMenuList>
                        </Menu>

                        {user._id !== u._id && u.role !== "superadmin" && (
                          <>
                            <Button
                              size="sm"
                              bgGradient="linear(to-r, #283E51, #485563, #2BC0E4)"
                              color="white"
                              onClick={() => handleSaveRole(u._id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="red"
                              onClick={() => deleteUser(u._id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </HStack>
                    )}
                  </Box>
                ))}
              </VStack>
            ) : (
              // Desktop: Table
              <Box overflowX="auto" border="1px solid #EFEAFD" rounded="xl">
                <table className="w-full text-left" style={{ minWidth: 640 }}>
                  <thead>
                    <tr className="bg-[#F8F7FF]">
                      <th className="py-3 px-4">Username</th>
                      <th className="py-3 px-4 text-center">Role</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <MotionTr
                        key={u._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-b"
                        style={{ borderColor: "#EFEAFD" }}
                      >
                        <td className="py-2 px-4">{u.username}</td>
                        <td className="py-2 px-4 text-center">
                          {u.role === "superadmin" ? (
                            <span className="inline-flex items-center justify-center gap-1 px-3 py-1 text-sm font-semibold text-yellow-600 bg-yellow-100 rounded-full border border-yellow-300">
                              👑 Super Admin
                            </span>
                          ) : (
                            <Menu>
                              <MenuButton
                                as={Button}
                                rightIcon={<ChevronDownIcon />}
                                size="sm"
                                bg="#F8F7FF"
                                border="1px solid #EFEAFD"
                                _hover={{ bg: "#efe9ff" }}
                                minW="160px"
                              >
                                {roleChanges[u._id] || u.role}
                              </MenuButton>
                              <MotionMenuList
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                border="1px solid #EFEAFD"
                              >
                                {["user", "admin", "superadmin"].map((r) => (
                                  <MenuItem
                                    key={r}
                                    onClick={() =>
                                      setRoleChanges({
                                        ...roleChanges,
                                        [u._id]: r,
                                      })
                                    }
                                    bg={
                                      roleChanges[u._id] === r || u.role === r
                                        ? "#F8F7FF"
                                        : "white"
                                    }
                                  >
                                    {r}
                                  </MenuItem>
                                ))}
                              </MotionMenuList>
                            </Menu>
                          )}
                        </td>
                        <td className="py-2 px-4">
                          <HStack spacing={3}>
                            {user._id !== u._id && u.role !== "superadmin" && (
                              <>
                                <Button
                                  size="sm"
                                  bgGradient="linear(to-r, #283E51, #485563, #2BC0E4)"
                                  color="white"
                                  onClick={() => handleSaveRole(u._id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  colorScheme="red"
                                  onClick={() => deleteUser(u._id)}
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                          </HStack>
                        </td>
                      </MotionTr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}

            {/* Create Admin */}
            <MotionBox
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              mt={6}
              bg={cardBg}
              rounded="2xl"
              p={5}
              border="1px solid #EFEAFD"
            >
              <Text fontWeight="semibold" mb={3}>
                Create New Admin
              </Text>
              <MotionVStack spacing={3} align="stretch">
                <Input
                  placeholder="Username"
                  value={newAdmin.username}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, username: e.target.value })
                  }
                />
                <Input
                  placeholder="Password"
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, password: e.target.value })
                  }
                />
                <Button
                  bgGradient="linear(to-r, #283E51, #485563, #2BC0E4)"
                  color="white"
                  onClick={() =>
                    createAdmin(newAdmin.username, newAdmin.password)
                  }
                >
                  Create Admin
                </Button>
              </MotionVStack>
            </MotionBox>
          </Card>
        )}
      </Box>
    </Box>
  );
}

/* ========== Sidebar content (reuse for desktop + drawer) ========== */
function SidebarContent({ userRole }) {
  return (
    <>
      <HStack justify="space-between" mb={8}>
        <Text
          fontWeight="bold"
          fontSize="lg"
          bgGradient="linear(to-r, #283E51, #485563, #2BC0E4)"
          bgClip="text"
        >
          Admin Panel
        </Text>
        <Link to="/">
          <Box
            rounded="full"
            p={2}
            bg="#F8F7FF"
            border="1px solid #EFEAFD"
            _hover={{ bg: "#efe9ff" }}
          >
            <FiHome />
          </Box>
        </Link>
      </HStack>

      <VStack align="stretch" spacing={3}>
        {userRole === "superadmin" && (
          <NavItem to="/manage-blogs" icon={<FiFileText />} label="Blogs" />
        )}
        <NavItem to="/manage-users" icon={<FiUsers />} label="Users" />
        <a href="#logs">
          <NavPill icon={<FiFileText />} label="Logs" />
        </a>
      </VStack>
    </>
  );
}

/* ========== UI Helpers ========== */

function NavItem({ to, icon, label }) {
  return (
    <Link to={to}>
      <NavPill icon={icon} label={label} />
    </Link>
  );
}

function NavPill({ icon, label }) {
  return (
    <HStack
      as="div"
      spacing={3}
      px={4}
      py={3}
      rounded="lg"
      bg="#F8F7FF"
      border="1px solid #EFEAFD"
      _hover={{ bg: "#efe9ff" }}
      cursor="pointer"
    >
      {icon}
      <Text fontWeight="medium">{label}</Text>
    </HStack>
  );
}

function Card({ children, ...rest }) {
  return (
    <MotionBox
      bg="white"
      rounded="2xl"
      shadow="md"
      p={{ base: 3, md: 4 }}
      border="1px solid #EFEAFD"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      {...rest}
    >
      {children}
    </MotionBox>
  );
}

function StatCard({ title, value, icon, gradient }) {
  const IconCmp =
    icon === "users"
      ? FiUsers
      : icon === "file"
      ? FiFileText
      : icon === "activity"
      ? FiActivity
      : FiTrendingUp;

  return (
    <MotionBox
      rounded="2xl"
      p={{ base: 4, md: 5 }}
      bg="white"
      border="1px solid #EFEAFD"
      shadow="md"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <HStack justify="space-between" align="flex-start">
        <VStack align="flex-start" spacing={1}>
          <Text fontSize="sm" color="gray.600">
            {title}
          </Text>
          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
            {value}
          </Text>
        </VStack>
        <Box rounded="full" p={3} bgGradient={gradient} color="white">
          <IconCmp />
        </Box>
      </HStack>
    </MotionBox>
  );
}

function LogItem({ log }) {
  return (
    <Box rounded="xl" border="1px solid #EFEAFD" bg="#FDFBFF" p={3}>
      <HStack justify="space-between" align="flex-start">
        <HStack>
          <Avatar size="sm" name={log?.performedBy?.username || "User"} />
          <VStack spacing={0} align="flex-start">
            <Text fontWeight="semibold" noOfLines={1}>
              {log?.action || "Activity"}
            </Text>
            <Text fontSize="xs" color="gray.600">
              {log?.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
            </Text>
          </VStack>
        </HStack>
        <Badge
          rounded="full"
          px={3}
          py={1}
          bg="white"
          border="1px solid #EFEAFD"
        >
          {log?.performedBy?.role || "-"}
        </Badge>
      </HStack>
    </Box>
  );
}

function Empty({ text }) {
  return (
    <VStack rounded="2xl" border="1px dashed #EFEAFD" p={8} spacing={2}>
      <Text fontWeight="bold">{text}</Text>
      <Text fontSize="sm" color="gray.600">
        Data will appear here once available.
      </Text>
    </VStack>
  );
}
