import React, { useEffect, useState, useRef } from "react";
import { useProfileStore } from "@/store/profileStore";
import { useDisclosure } from "@chakra-ui/react";
import EditBlogModal from "@/components/form/EditBlogModal";
import { Link, useParams } from "react-router-dom";

import {
  Box,
  Button,
  Input,
  Text,
  Image,
  VStack,
  HStack,
  Heading,
  Spinner,
  useToast,
  IconButton,
  Divider,
  useColorModeValue,
  Tooltip,
} from "@chakra-ui/react";
import {
  EditIcon,
  CheckIcon,
  CloseIcon,
  DeleteIcon,
  AddIcon,
} from "@chakra-ui/icons";

export function ProfilePage() {
  const toast = useToast();
  const fileInputRef = useRef();
  const { id } = useParams();

  const {
    user,
    blogs,
    loading,
    error,
    fetchProfile,
    fetchProfileById,
    updateUserInfo,
    uploadAvatar,
    deleteAvatar,
    clearError,
  } = useProfileStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBlog, setSelectedBlog] = useState(null);

  const [username, setUsername] = useState("");
  const [instagram, setInstagram] = useState("");
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingInstagram, setEditingInstagram] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarDeleting, setAvatarDeleting] = useState(false);

  // ถ้าไม่มี id ใน URL ให้ถือว่าเป็น profile ตัวเอง
  const isOwner = !id || user?._id === id;

  useEffect(() => {
    if (id) {
      fetchProfileById(id); // ดึง profile ของ id อื่น (ต้องมีฟังก์ชันนี้ใน store)
    } else {
      fetchProfile(); // ดึง profile ตัวเอง
    }
  }, [id]);

  useEffect(() => {
    if (user?.username) setUsername(user.username);
    if (user?.instagram) setInstagram(user.instagram);
  }, [user]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      clearError();
    }
  }, [error]);

  const handleEditBlog = (blog) => {
    setSelectedBlog(blog);
    onOpen();
  };

  const handleDeleteBlog = async (id) => {
    const success = await useProfileStore.getState().deleteBlog(id);
    toast({
      title: success ? "Deleted" : "Error",
      status: success ? "success" : "error",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleUpdateInfo = async () => {
    const success = await updateUserInfo({username, instagram});
    if (success) {
      toast({ title: "Info updated", status: "success" });
      setEditingUsername(false);
      setEditingInstagram(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    const success = await uploadAvatar(file);
    if (success) {
      toast({ title: "Avatar updated", status: "success" });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setAvatarUploading(false);
  };

  const handleDeleteAvatar = async () => {
    setAvatarDeleting(true);
    const success = await deleteAvatar();
    if (success) toast({ title: "Avatar deleted", status: "success" });
    setAvatarDeleting(false);
  };

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const subtitleColor = useColorModeValue("gray.500", "gray.400");

  if (loading) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box maxW="700px" mx="auto" p={6}>
      <Heading
        mb={6}
        textAlign="center"
        color={textColor}
        fontWeight="extrabold"
      >
        {isOwner ? "My Profile" : `${user?.username}'s Profile`}
      </Heading>

      <Box
        p={6}
        bg={cardBg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        boxShadow="lg"
        mb={8}
        transition="box-shadow 0.2s ease"
        _hover={{ boxShadow: "xl" }}
      >
        <Box textAlign="center" mb={4}>
          {user?.avatar?.url ? (
            <Image
              src={user.avatar.url}
              alt="Avatar"
              boxSize="140px"
              objectFit="cover"
              borderRadius="full"
              mx="auto"
              mb={3}
              border="3px solid"
              borderColor="teal.400"
              cursor={isOwner ? "pointer" : "default"}
              transition="transform 0.2s ease"
              _hover={isOwner ? { transform: "scale(1.05)" } : undefined}
            />
          ) : (
            <Box
              boxSize="140px"
              bg="gray.100"
              borderRadius="full"
              mx="auto"
              mb={3}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="3xl"
              color="gray.400"
              fontWeight="bold"
              userSelect="none"
            >
              No Avatar
            </Box>
          )}
          {isOwner && (
            <HStack justify="center" spacing={4} mb={2}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={avatarUploading}
                style={{ display: "none" }}
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload">
                <Tooltip label="Upload Avatar" hasArrow>
                  <IconButton
                    as="span"
                    icon={<AddIcon />}
                    colorScheme="teal"
                    isLoading={avatarUploading}
                    aria-label="Upload avatar"
                    size="md"
                    borderRadius="full"
                    _hover={{ bg: "teal.600" }}
                  />
                </Tooltip>
              </label>
              {user?.avatar?.url && (
                <Tooltip label="Delete Avatar" hasArrow>
                  <IconButton
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    onClick={handleDeleteAvatar}
                    isLoading={avatarDeleting}
                    aria-label="Delete avatar"
                    size="md"
                    borderRadius="full"
                    _hover={{ bg: "red.600" }}
                  />
                </Tooltip>
              )}
            </HStack>
          )}
        </Box>

        <Divider mb={5} />

        <Box mb={4}>
          <Text fontWeight="bold" mb={2} fontSize="lg" color={textColor}>
            Username:
          </Text>
          {!editingUsername ? (
            <HStack spacing={3}>
              <Text fontSize="xl" color={textColor} fontWeight="medium">
                {user?.username}
              </Text>
              <Tooltip label="Edit Username" hasArrow>
                {isOwner && (
                  <IconButton
                    icon={<EditIcon />}
                    onClick={() => setEditingUsername(true)}
                    size="md"
                    aria-label="Edit"
                    colorScheme="teal"
                    variant="outline"
                    borderRadius="md"
                    _hover={{ bg: "teal.50" }}
                  />
                )}
              </Tooltip>
            </HStack>
          ) : (
            <HStack spacing={3}>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                size="md"
                autoFocus
              />
              <Tooltip label="Save" hasArrow>
                <IconButton
                  icon={<CheckIcon />}
                  onClick={handleUpdateInfo}
                  colorScheme="green"
                  size="md"
                  isLoading={loading}
                  aria-label="Save"
                  borderRadius="md"
                  _hover={{ bg: "green.50" }}
                />
              </Tooltip>
              <Tooltip label="Cancel" hasArrow>
                <IconButton
                  icon={<CloseIcon />}
                  onClick={() => {
                    setUsername(user?.username || "");
                    setEditingUsername(false);
                  }}
                  size="md"
                  aria-label="Cancel"
                  borderRadius="md"
                />
              </Tooltip>
            </HStack>
          )}
        </Box>

        <Box mb={4}>
          <Text fontWeight="bold" mb={2} fontSize="lg" color={textColor}>
            Instagram:
          </Text>
          {!editingInstagram ? (
            <HStack spacing={3}>
              {user?.instagram ? (
                isOwner ? (
                  <Text fontSize="xl" color={textColor} fontWeight="medium">
                    {user.instagram}
                  </Text>
                ) : (
                  <Link
                    href={`https://instagram.com/${user.instagram}`}
                    isExternal
                    color="pink.500"
                    fontWeight="bold"
                  >
                    @{user.instagram}
                  </Link>
                )
              ) : (
                <Text color="gray.500" fontStyle="italic">
                  No Instagram linked.
                </Text>
              )}
              {isOwner && (
                <Tooltip label="Edit Instagram" hasArrow>
                  <IconButton
                    icon={<EditIcon />}
                    onClick={() => setEditingInstagram(true)}
                    size="md"
                    aria-label="Edit Instagram"
                    colorScheme="teal"
                    variant="outline"
                    borderRadius="md"
                    _hover={{ bg: "teal.50" }}
                  />
                </Tooltip>
              )}
            </HStack>
          ) : (
            <HStack spacing={3}>
              <Input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                size="md"
                autoFocus
                placeholder="Instagram username"
              />
              <Tooltip label="Save" hasArrow>
                <IconButton
                  icon={<CheckIcon />}
                  onClick={handleUpdateInfo}
                  colorScheme="green"
                  size="md"
                  isLoading={loading}
                  aria-label="Save Instagram"
                  borderRadius="md"
                  _hover={{ bg: "green.50" }}
                />
              </Tooltip>
              <Tooltip label="Cancel" hasArrow>
                <IconButton
                  icon={<CloseIcon />}
                  onClick={() => {
                    setInstagram(user?.instagram || "");
                    setEditingInstagram(false);
                  }}
                  size="md"
                  aria-label="Cancel Instagram"
                  borderRadius="md"
                />
              </Tooltip>
            </HStack>
          )}
        </Box>
      </Box>

      <Box>
        <Heading size="md" mb={5} color={textColor} fontWeight="semibold">
          My Blogs ({blogs.length})
        </Heading>
        {blogs.length === 0 ? (
          <Text color="gray.500" fontStyle="italic">
            You haven't written any blogs yet.
          </Text>
        ) : (
          <VStack spacing={5} align="stretch">
            {blogs.map((b) => (
              <Link to={`/blogs/${b._id}`} key={b._id}>
                <Box
                  key={b._id}
                  p={5}
                  bg={cardBg}
                  borderWidth="1px"
                  borderRadius="md"
                  transition="box-shadow 0.3s ease"
                  _hover={{ shadow: "lg", bg: hoverBg }}
                >
                  <HStack justify="space-between" align="start">
                    <Box>
                      <Text fontWeight="bold" fontSize="xl" color={textColor}>
                        {b.title}
                      </Text>
                      <Text fontSize="md" color={subtitleColor} noOfLines={2}>
                        {b.subtitle}
                      </Text>
                    </Box>
                    {isOwner && (
                      <HStack spacing={1}>
                        <Tooltip label="Edit Blog">
                          <IconButton
                            icon={<EditIcon />}
                            aria-label="Edit"
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleEditBlog(b)}
                          />
                        </Tooltip>
                        <Tooltip label="Delete Blog">
                          <IconButton
                            icon={<DeleteIcon />}
                            aria-label="Delete"
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteBlog(b._id)}
                          />
                        </Tooltip>
                        <EditBlogModal
                          isOpen={isOpen}
                          onClose={onClose}
                          blog={selectedBlog}
                        />
                      </HStack>
                    )}
                  </HStack>
                </Box>
              </Link>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
}
