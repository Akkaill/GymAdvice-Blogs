import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDashboardStore } from "@/store/dashboardStore";
import { useAuthStore } from "@/store/auth";
import {
  Spinner,
  Button,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
  VStack,
  useToast,
  Text,
  HStack,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import { FiHome, FiBarChart2, FiUsers, FiFileText } from "react-icons/fi";

const MotionBox = motion.create(Box);
const MotionMenuList = motion.create(MenuList);
const MotionVStack = motion.create(VStack);
const MotionTr = motion.tr;

export default function Dashboard() {
  const {
    stats,
    recentLogs,
    users,
    fetchStats,
    fetchRecentLogs,
    fetchUsers,
    updateUserRole,
    deleteUser,
    revokeUser,
    createAdmin,
    loadingStats,
    loadingLogs,
    loadingUsers,
  } = useDashboardStore();

  const { user, loading: authLoading, logout } = useAuthStore();
  const [roleChanges, setRoleChanges] = useState({});
  const [newAdmin, setNewAdmin] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!user || !["admin", "superadmin"].includes(user.role)) {
        navigate("/unauthorized");
      }
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user && ["admin", "superadmin"].includes(user.role)) {
      fetchStats();
      fetchRecentLogs();
      fetchUsers();
    }
  }, [user]);

  const handleSaveRole = async (userId) => {
    const newRole = roleChanges[userId];
    if (!newRole) return;
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

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#1a1c1f] text-white">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#1a1c1f] via-[#1e2126] to-[#141518] text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#1e1f24] to-[#16171b] backdrop-blur-xl p-6 shadow-2xl border-r border-gray-700 rounded-r-2xl">
        {/* Logo / Home */}
        <div className="flex items-center justify-between mb-8">
          <Text
            fontWeight="500"
            fontSize="md"
            color="blue.400"
            transition="all 0.3s ease"
          >
            Admin Panel
          </Text>
          <Link
            to="/"
            className="p-2 rounded-full bg-[#22252a] hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            title="Go Home"
          >
            <FiHome className="text-white w-5 h-5" />
          </Link>
        </div>

        {/* Nav Menu */}
        <nav className="space-y-3">
          <a
            href="#dashboard"
            className="flex items-center gap-3 py-3 px-4 rounded-lg bg-[#22252a] hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium"
          >
            <FiBarChart2 className="w-5 h-5" /> Dashboard
          </a>
          <a
            href="#users"
            className="flex items-center gap-3 py-3 px-4 rounded-lg bg-[#22252a] hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium"
          >
            <FiUsers className="w-5 h-5" /> Users
          </a>
          <a
            href="#logs"
            className="flex items-center gap-3 py-3 px-4 rounded-lg bg-[#22252a] hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium"
          >
            <FiFileText className="w-5 h-5" /> Logs
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-10">
        {/* Header */}
        <HStack justify="space-between" mb={8}>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
            Dashboard
          </h1>
          <HStack spacing={4}>
            <span className="font-semibold text-lg bg-[#22252a] px-4 py-2 rounded-xl shadow-inner">
              👤 {user?.role}
            </span>
            <Button
              colorScheme="red"
              size="md"
              rounded="lg"
              px={6}
              fontWeight="semibold"
              shadow="md"
              onClick={logout}
            >
              Logout
            </Button>
          </HStack>
        </HStack>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingStats ? (
            <Spinner size="lg" />
          ) : (
            stats && (
              <>
                <MotionBox
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  bg="blue.600"
                  p={6}
                  rounded="xl"
                  shadow="lg"
                  _hover={{ transform: "scale(1.05)", shadow: "2xl" }}
                >
                  <Text fontSize="lg">Users</Text>
                  <Text fontSize="3xl" fontWeight="bold">
                    {stats.users}
                  </Text>
                </MotionBox>

                <MotionBox
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  bg="purple.600"
                  p={6}
                  rounded="xl"
                  shadow="lg"
                  _hover={{ transform: "scale(1.05)", shadow: "2xl" }}
                >
                  <Text fontSize="lg">Admins</Text>
                  <Text fontSize="3xl" fontWeight="bold">
                    {stats.admins.length < 1 ? "0" : stats.admins}
                  </Text>
                </MotionBox>

                <MotionBox
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  bg="pink.600"
                  p={6}
                  rounded="xl"
                  shadow="lg"
                  _hover={{ transform: "scale(1.05)", shadow: "2xl" }}
                >
                  <Text fontSize="lg">Superadmins</Text>
                  <Text fontSize="3xl" fontWeight="bold">
                    {stats.superadmin}
                  </Text>
                </MotionBox>
              </>
            )
          )}
        </section>

        {/* Users Management */}
        <section
          id="users"
          className="bg-[#22252a]/80 p-6 rounded-2xl shadow-xl space-y-6"
        >
          <h2 className="text-2xl font-bold text-blue-300">User Management</h2>
          {loadingUsers ? (
            <Spinner />
          ) : (
            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-700">
              <table className="w-full text-left text-white border-collapse">
                <thead>
                  <tr className="bg-[#2b2e33] text-gray-300 border-b border-gray-700">
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <MotionTr
                      key={u._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-b border-gray-700 hover:bg-[#2a2d32] transition"
                    >
                      <td className="py-2 px-4">{u.username}</td>
                      <td className="py-2 px-4">
                        <Menu>
                          <MenuButton
                            as={Button}
                            rightIcon={<ChevronDownIcon />}
                            size="sm"
                            bg="#2b2e33"
                            color="white"
                            borderRadius="md"
                            px={4}
                            minW="160px"
                            _hover={{ bg: "#3a3d44" }}
                            _expanded={{ bg: "blue.500" }}
                          >
                            {roleChanges[u._id] || u.role}
                          </MenuButton>
                          <MotionMenuList
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            bg="#2b2e33"
                            borderRadius="lg"
                            boxShadow="lg"
                            minW="160px"
                            border="1px solid #3a3d44"
                            color="white"
                            py={1}
                          >
                            {["user", "admin", "superadmin"].map((r) => (
                              <MenuItem
                                key={r}
                                onClick={() =>
                                  setRoleChanges({ ...roleChanges, [u._id]: r })
                                }
                                bg={
                                  roleChanges[u._id] === r || u.role === r
                                    ? "#3a3d44"
                                    : "transparent"
                                }
                                _hover={{ bg: "blue.500", color: "white" }}
                              >
                                {r}
                              </MenuItem>
                            ))}
                          </MotionMenuList>
                        </Menu>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            bgGradient="linear(to-r, blue.400, purple.400)"
                            color="white"
                            rounded="lg"
                            shadow="md"
                            _hover={{
                              bgGradient: "linear(to-r, blue.500, purple.500)",
                            }}
                            onClick={() => handleSaveRole(u._id)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="yellow"
                            rounded="lg"
                            onClick={() => revokeUser(u._id)}
                          >
                            Revoke
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="red"
                            rounded="lg"
                            onClick={() => deleteUser(u._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </MotionTr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {user.role === "superadmin" && (
            <MotionBox
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-6 bg-gradient-to-br from-[#2b2e33] to-[#1f2024] p-6 rounded-2xl shadow-lg border border-gray-700"
            >
              <h3 className="text-xl font-semibold mb-3 text-purple-300">
                Create New Admin
              </h3>
              <MotionVStack spacing={3} align="stretch">
                <Input
                  placeholder="Username"
                  value={newAdmin.username}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, username: e.target.value })
                  }
                  className="rounded-lg"
                />
                <Input
                  placeholder="Password"
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, password: e.target.value })
                  }
                  className="rounded-lg"
                />
                <Button
                  bgGradient="linear(to-r, purple.400, blue.400)"
                  color="white"
                  _hover={{ bgGradient: "linear(to-r, purple.500, blue.500)" }}
                  className="px-6 font-semibold shadow-lg"
                  onClick={() =>
                    createAdmin(newAdmin.username, newAdmin.password)
                  }
                >
                  Create Admin
                </Button>
              </MotionVStack>
            </MotionBox>
          )}
        </section>

        {/* Logs */}
        <section
          id="logs"
          className="bg-[#22252a]/80 p-6 rounded-2xl shadow-xl mt-8"
        >
          <h2 className="text-2xl mb-4 font-semibold text-blue-300">
            Recent Logs
          </h2>
          {loadingLogs ? (
            <Spinner />
          ) : recentLogs.length === 0 ? (
            <p className="text-gray-400">No logs found.</p>
          ) : (
            <table className="w-full text-left table-auto text-white">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="py-2">Action</th>
                  <th className="py-2">User</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <MotionTr
                    key={log._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-gray-700 hover:bg-[#2a2d32] transition"
                  >
                    <td className="py-2">{log.action}</td>
                    <td className="py-2">
                      {log.performedBy?.username || "Unknown"}
                    </td>
                    <td className="py-2">{log.performedBy?.role || "-"}</td>
                    <td className="py-2">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </MotionTr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
