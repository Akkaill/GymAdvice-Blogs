import { SearchUserFilter } from "@/components/search/SearchUserFilter";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";
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
  const { users, fetchAllUsers, loadingUsers, deleteUser, updateUserRole } =
    useAuthStore();
  const [roleChanges, setRoleChanges] = useState({});

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleSaveRole = async (userId) => {
    if (!roleChanges[userId]) return;
    await updateUserRole(userId, roleChanges[userId]);
  };

  const bg = useColorModeValue("gray.50", "gray.700");
  const tableBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("blue.100", "blue.700");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const hoverBg = useColorModeValue("gray.100", "gray.700");

  return (
    <Box minH="100vh" bg={bg} p={6}>
      {/* Header + Navigation */}
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
          color="blue.600"
          letterSpacing="wide"
          fontWeight="extrabold"
        >
          👥 Manage Users
        </Heading>
        <Flex
          gap={2}
          align="center"
          flexWrap="wrap"
          w={{ base: "full", md: "auto" }}
        >
          <SearchUserFilter />
        </Flex>
      </Flex>

      {/* Table */}
      {loadingUsers ? (
        <Flex justify="center" py={20}>
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : (
        <Box
          overflowX="auto"
          rounded="xl"
          shadow="lg"
          border="1px solid"
          borderColor={borderColor}
          bg={tableBg}
        >
          <Table
            minWidth="600px"
            variant="simple"
            size="md"
            sx={{
              "thead tr": {
                backgroundColor: headerBg,
              },
              th: {
                color: useColorModeValue("blue.700", "blue.300"),
                fontWeight: "bold",
                letterSpacing: "wider",
                verticalAlign: "middle",
                userSelect: "none",
              },
              td: {
                verticalAlign: "middle",
              },
              "tbody tr": {
                transition: "background-color 0.3s",
                cursor: "default",
                _hover: {
                  backgroundColor: hoverBg,
                },
              },
            }}
          >
            <Thead>
              <Tr>
                <Th>Username</Th>
                <Th textAlign="center" width="180px">
                  Role
                </Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((u) => (
                <MotionTr
                  key={u._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Td fontWeight="semibold" fontSize="md">
                    {u.username}
                  </Td>
                  <Td textAlign="center" width="180px">
                    {u.role === "superadmin" ? (
                      <Box
                        display="inline-flex"
                        alignItems="center"
                        justifyContent="center"
                        px={3}
                        py={1}
                        borderRadius="full"
                        bg="yellow.400"
                        color="gray.900"
                        fontWeight="bold"
                        fontSize="sm"
                        userSelect="none"
                        border="1px solid"
                        borderColor="yellow.500"
                        boxShadow="md"
                      >
                        👑 Super Admin
                      </Box>
                    ) : (
                      <Menu autoSelect={false}>
                        <MenuButton
                          as={Button}
                          rightIcon={<ChevronDownIcon />}
                          size="sm"
                          bg="blue.50"
                          color="blue.700"
                          borderRadius="md"
                          px={4}
                          minW="140px"
                          _hover={{ bg: "blue.100" }}
                          _expanded={{ bg: "blue.200" }}
                        >
                          {roleChanges[u._id] || u.role}
                        </MenuButton>
                        <MotionMenuList
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.15 }}
                          bg="white"
                          borderRadius="md"
                          boxShadow="xl"
                          minW="140px"
                          border="1px solid #cbd5e0"
                          color="gray.700"
                          py={1}
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
                                  ? "blue.100"
                                  : "transparent"
                              }
                              _hover={{
                                bg: "blue.300",
                                color: "white",
                              }}
                              fontWeight="semibold"
                              fontSize="sm"
                              userSelect="none"
                            >
                              {r}
                            </MenuItem>
                          ))}
                        </MotionMenuList>
                      </Menu>
                    )}
                  </Td>
                  <Td>
                    <Flex gap={3}>
                      {u.role !== "superadmin" ? (
                        <>
                          <Button
                            size="sm"
                            bgGradient="linear(to-r, blue.400, cyan.400)"
                            color="white"
                            rounded="md"
                            shadow="sm"
                            _hover={{
                              bgGradient: "linear(to-r, blue.500, cyan.500)",
                            }}
                            onClick={() => handleSaveRole(u._id)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="red"
                            rounded="md"
                            onClick={() => deleteUser(u._id)}
                          >
                            Delete
                          </Button>
                        </>
                      ) : (
                        <Text
                          color="gray.400"
                          fontSize="sm"
                          fontStyle="italic"
                          userSelect="none"
                        >
                          No actions
                        </Text>
                      )}
                    </Flex>
                  </Td>
                </MotionTr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
