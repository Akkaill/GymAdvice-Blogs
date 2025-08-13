// src/pages/ManageUserPage.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { SearchUserFilter } from "@/components/search/SearchUserFilter";
import { useAuthStore } from "@/store/auth";
import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  Spinner,
  MenuList,
  Box,
  Heading,
  Flex,
  Text,
  useToast,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";

const MotionTr = motion.create(Tr);
const MotionMenuList = motion.create(MenuList);

export default function ManageUserPage() {
  const {
    users = [],
    fetchAllUsers,
    loadingUsers,
    deleteUser,
    updateUserRole,
  } = useAuthStore();

  const [roleChanges, setRoleChanges] = useState({});
  const [savingRoleIds, setSavingRoleIds] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  const toast = useToast();

  // สี/ธีมให้เข้ากับแนวสว่างของ Dashboard
  const pageBg = useColorModeValue("#F8F7FF", "gray.700");
  const tableBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("#F8F7FF", "gray.700");
  const borderColor = useColorModeValue("#EFEAFD", "gray.600");
  const hoverBg = useColorModeValue("#efe9ff", "gray.700");
  const thColor = useColorModeValue("blue.700", "blue.300");

  const roleOptions = useMemo(() => ["user", "admin", "superadmin"], []);

  useEffect(() => {
    // โหลดครั้งแรก
    fetchAllUsers?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRolePick = useCallback((userId, role) => {
    setRoleChanges((prev) => ({ ...prev, [userId]: role }));
  }, []);

  const handleSaveRole = useCallback(
    async (userId, currentRole) => {
      const newRole = roleChanges[userId];
      if (!newRole || newRole === currentRole) return;

      try {
        setSavingRoleIds((s) => ({ ...s, [userId]: true }));
        await updateUserRole(userId, newRole);
        toast({
          title: "Role updated",
          description: `User role changed to "${newRole}"`,
          status: "success",
          duration: 2500,
          isClosable: true,
        });
        // เคลียร์สถานะที่แก้แล้ว
        setRoleChanges((prev) => {
          const { [userId]: _, ...rest } = prev;
          return rest;
        });
      } catch (err) {
        toast({
          title: "Update failed",
          description: "Cannot update user role right now.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setSavingRoleIds((s) => ({ ...s, [userId]: false }));
      }
    },
    [roleChanges, toast, updateUserRole]
  );

  const handleDelete = useCallback(
    async (userId, username) => {
      const ok = window.confirm(`Delete user "${username}"?`);
      if (!ok) return;
      try {
        setDeletingId(userId);
        await deleteUser(userId);
        toast({
          title: "User deleted",
          description: `"${username}" has been removed.`,
          status: "success",
          duration: 2500,
          isClosable: true,
        });
      } catch (err) {
        toast({
          title: "Delete failed",
          description: "Cannot delete user right now.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setDeletingId(null);
      }
    },
    [deleteUser, toast]
  );

  return (
    <Box minH="100vh" bg={pageBg} p={6}>
      {/* Header + Filter */}
      <Flex
        justify="space-between"
        align="center"
        flexWrap="wrap"
        gap={4}
        mb={6}
      >
        <Heading
          as="h2"
          size="xl"
          bgGradient="linear(to-r, #283E51, #485563, #2BC0E4)"
          bgClip="text"
          letterSpacing="wide"
          fontWeight="extrabold"
        >
          👥 Manage Users
        </Heading>

        <Flex gap={2} align="center" flexWrap="wrap" w={{ base: "full", md: "auto" }}>
          <SearchUserFilter />
        </Flex>
      </Flex>

      {/* Table */}
      {loadingUsers ? (
        <Flex justify="center" py={20}>
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : users.length === 0 ? (
        <Box
          bg={tableBg}
          border="1px dashed"
          borderColor={borderColor}
          rounded="2xl"
          p={10}
          textAlign="center"
        >
          <Heading size="md" mb={2}>No users found</Heading>
          <Text color="gray.600">ลองปรับตัวกรอง หรือรีเฟรชหน้าอีกครั้ง</Text>
        </Box>
      ) : (
        <Box
          overflowX="auto"
          rounded="xl"
          shadow="lg"
          border="1px solid"
          borderColor={borderColor}
          bg={tableBg}
        >
          <Table minWidth="760px" variant="simple" size="md">
            <Thead>
              <Tr bg={headerBg}>
                <Th color={thColor}>Username</Th>
                <Th color={thColor} textAlign="center" width="200px">
                  Role
                </Th>
                <Th color={thColor} width="260px">
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((u) => {
                const currentRole = u.role;
                const pickedRole = roleChanges[u._id];
                const isChanged = pickedRole && pickedRole !== currentRole;
                const isSaving = !!savingRoleIds[u._id];
                const isDeleting = deletingId === u._id;

                return (
                  <MotionTr
                    key={u._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    _hover={{ bg: hoverBg }}
                  >
                    <Td fontWeight="semibold" fontSize="md">
                      {u.username}
                    </Td>

                    <Td textAlign="center" width="200px">
                      {currentRole === "superadmin" ? (
                        <Box
                          display="inline-flex"
                          alignItems="center"
                          justifyContent="center"
                          px={3}
                          py={1}
                          borderRadius="full"
                          bg="yellow.100"
                          color="yellow.800"
                          fontWeight="bold"
                          fontSize="sm"
                          userSelect="none"
                          border="1px solid"
                          borderColor="yellow.300"
                        >
                          👑 Super Admin
                        </Box>
                      ) : (
                        <Menu autoSelect={false} isLazy>
                          <MenuButton
                            as={Button}
                            rightIcon={<ChevronDownIcon />}
                            size="sm"
                            bg="#F8F7FF"
                            border="1px solid #EFEAFD"
                            _hover={{ bg: "#efe9ff" }}
                            minW="160px"
                            isDisabled={isSaving || isDeleting}
                          >
                            {pickedRole || currentRole}
                          </MenuButton>
                          <MotionMenuList
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            border="1px solid #EFEAFD"
                            bg="white"
                            zIndex={10}
                          >
                            {roleOptions.map((r) => (
                              <MenuItem
                                key={r}
                                onClick={() => handleRolePick(u._id, r)}
                                bg={
                                  pickedRole === r || currentRole === r
                                    ? "#F8F7FF"
                                    : "white"
                                }
                                _hover={{ bg: "blue.500", color: "white" }}
                                fontWeight="semibold"
                                fontSize="sm"
                                isDisabled={isSaving || isDeleting}
                              >
                                {r}
                              </MenuItem>
                            ))}
                          </MotionMenuList>
                        </Menu>
                      )}
                    </Td>

                    <Td width="260px">
                      <Flex gap={3} align="center">
                        {currentRole !== "superadmin" ? (
                          <>
                            <Button
                              size="sm"
                              bgGradient="linear(to-r, #283E51, #485563, #2BC0E4)"
                              color="white"
                              _hover={{ opacity: 0.9 }}
                              onClick={() => handleSaveRole(u._id, currentRole)}
                              isDisabled={!isChanged || isSaving || isDeleting}
                              isLoading={isSaving}
                              loadingText="Saving"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="red"
                              onClick={() => handleDelete(u._id, u.username)}
                              isDisabled={isSaving || isDeleting}
                              isLoading={isDeleting}
                              loadingText="Deleting"
                            >
                              Delete
                            </Button>
                          </>
                        ) : (
                          <Text color="gray.400" fontSize="sm" fontStyle="italic" userSelect="none">
                            No actions
                          </Text>
                        )}
                      </Flex>
                    </Td>
                  </MotionTr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
