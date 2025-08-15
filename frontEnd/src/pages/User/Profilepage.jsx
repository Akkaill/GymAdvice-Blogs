// src/pages/ProfilePage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useProfileStore } from "@/store/profileStore";
import { Link as RouterLink, useParams } from "react-router-dom";
import EditBlogModal from "@/components/form/EditBlogModal";
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
  Badge,
  SimpleGrid,
  SkeletonCircle,
  SkeletonText,
  Link as ChakraLink,
  useDisclosure,
} from "@chakra-ui/react";
import {
  EditIcon,
  CheckIcon,
  CloseIcon,
  DeleteIcon,
  AddIcon,
} from "@chakra-ui/icons";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

export function ProfilePage() {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const { id } = useParams();

  const {
    user,
    blogs = [],
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

  const isOwner = !id || user?._id === id;

  useEffect(() => {
    if (id) fetchProfileById(id);
    else fetchProfile();
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
  }, [error, clearError, toast]);

  const handleEditBlog = (blog) => {
    setSelectedBlog(blog);
    onOpen();
  };

  const handleDeleteBlog = async (blogId) => {
    const ok = window.confirm("Delete this blog?");
    if (!ok) return;
    const success = await useProfileStore.getState().deleteBlog(blogId);
    toast({
      title: success ? "Deleted" : "Error",
      status: success ? "success" : "error",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleUpdateInfo = async () => {
    const success = await updateUserInfo({ username, instagram });
    if (success) {
      toast({ title: "Info updated", status: "success" });
      setEditingUsername(false);
      setEditingInstagram(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
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
    const ok = window.confirm("Remove current avatar?");
    if (!ok) return;
    setAvatarDeleting(true);
    const success = await deleteAvatar();
    if (success) toast({ title: "Avatar deleted", status: "success" });
    setAvatarDeleting(false);
  };

  // Theme tokens
  const pageBg = useColorModeValue("#F8F7FF", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("#EFEAFD", "gray.700");
  const hoverBg = useColorModeValue("#FDFBFF", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subtitleColor = useColorModeValue("gray.600", "gray.300");

  if (loading && !user) {
    return (
      <Box maxW="960px" mx="auto" p={6}>
        <SkeletonText mt="4" noOfLines={6} spacing="4" />
      </Box>
    );
  }

  return (
    <Box bg={pageBg} minH="100vh">
      {/* Cover */}
      <Box
        h={{ base: "140px", md: "180px" }}
        bgGradient="linear(to-tr,gray.200,gray.500,gray.900)"
      />

      <Box maxW="960px" mx="auto" px={{ base: 4, md: 6 }} pb={10}>
        {/* Profile Card */}
        <MotionBox
          bg={cardBg}
          rounded="2xl"
          shadow="md"
          border="1px solid"
          borderColor={borderColor}
          p={{ base: 4, md: 6 }}
          mt={-16}
          position="relative"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Avatar + name row */}
          <HStack align="flex-end" spacing={5}>
            <Box position="relative">
              {user?.avatar?.url ? (
                <Image
                  src={user.avatar.url}
                  alt="Avatar"
                  boxSize={{ base: "112px", md: "132px" }}
                  objectFit="cover"
                  rounded="full"
                  border="4px solid white"
                  shadow="lg"
                  bg="white"
                />
              ) : (
                <SkeletonCircle
                  size={{ base: "28", md: "32" }}
                  startColor="#EFEAFD"
                  endColor="#F8F7FF"
                />
              )}

              {isOwner && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={avatarUploading}
                    style={{ display: "none" }}
                    id="avatar-upload"
                  />
                  <HStack position="absolute" bottom={1} right={1} spacing={2}>
                    <label htmlFor="avatar-upload">
                      <Tooltip label="Upload avatar" hasArrow>
                        <IconButton
                          as="span"
                          icon={<AddIcon />}
                          size="sm"
                          rounded="full"
                          colorScheme="purple"
                          isLoading={avatarUploading}
                          aria-label="Upload avatar"
                        />
                      </Tooltip>
                    </label>
                    {user?.avatar?.url && (
                      <Tooltip label="Delete avatar" hasArrow>
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          rounded="full"
                          colorScheme="red"
                          isLoading={avatarDeleting}
                          onClick={handleDeleteAvatar}
                          aria-label="Delete avatar"
                        />
                      </Tooltip>
                    )}
                  </HStack>
                </>
              )}
            </Box>

            <VStack align="flex-start" spacing={2} flex="1">
              <Heading
                size="lg"
                bgColor="blackAlpha.800"
                bgClip="text"
                lineHeight="1.2"
              >
                {isOwner ? "My Profile" : `${user?.username || ""}'s Profile`}
              </Heading>

              {/* Username inline edit */}
              <Box>
                <Text fontSize="xs" color={subtitleColor} mb={1}>
                  Username
                </Text>
                {!editingUsername ? (
                  <HStack spacing={3}>
                    <Text fontSize="xl" color={textColor} fontWeight="semibold">
                      {user?.username || "-"}
                    </Text>
                    {isOwner && (
                      <Tooltip label="Edit username" hasArrow>
                        <IconButton
                          icon={<EditIcon />}
                          onClick={() => setEditingUsername(true)}
                          size="sm"
                          aria-label="Edit username"
                          variant="outline"
                          borderColor={borderColor}
                          _hover={{ bg: hoverBg }}
                        />
                      </Tooltip>
                    )}
                  </HStack>
                ) : (
                  <HStack spacing={2}>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      size="sm"
                      maxW="280px"
                      autoFocus
                    />
                    <Tooltip label="Save" hasArrow>
                      <IconButton
                        icon={<CheckIcon />}
                        onClick={handleUpdateInfo}
                        size="sm"
                        colorScheme="green"
                        aria-label="Save username"
                        isLoading={loading}
                      />
                    </Tooltip>
                    <Tooltip label="Cancel" hasArrow>
                      <IconButton
                        icon={<CloseIcon />}
                        onClick={() => {
                          setUsername(user?.username || "");
                          setEditingUsername(false);
                        }}
                        size="sm"
                        aria-label="Cancel username"
                      />
                    </Tooltip>
                  </HStack>
                )}
              </Box>

              {/* Instagram inline edit/link */}
              <Box>
                <Text fontSize="xs" color={subtitleColor} mb={1}>
                  Instagram
                </Text>
                {!editingInstagram ? (
                  <HStack spacing={3}>
                    {user?.instagram ? (
                      isOwner ? (
                        <Text color={textColor} fontWeight="medium">
                          @{user.instagram}
                        </Text>
                      ) : (
                        <ChakraLink
                          href={`https://instagram.com/${user.instagram}`}
                          isExternal
                          color="#F43F5E"
                          fontWeight="semibold"
                        >
                          @{user.instagram}
                        </ChakraLink>
                      )
                    ) : (
                      <Text color={subtitleColor} fontStyle="italic">
                        Not linked
                      </Text>
                    )}
                    {isOwner && (
                      <Tooltip label="Edit Instagram" hasArrow>
                        <IconButton
                          icon={<EditIcon />}
                          onClick={() => setEditingInstagram(true)}
                          size="sm"
                          aria-label="Edit instagram"
                          variant="outline"
                          borderColor={borderColor}
                          _hover={{ bg: hoverBg }}
                        />
                      </Tooltip>
                    )}
                  </HStack>
                ) : (
                  <HStack spacing={2}>
                    <Input
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      size="sm"
                      maxW="280px"
                      placeholder="instagram username"
                      autoFocus
                    />
                    <Tooltip label="Save" hasArrow>
                      <IconButton
                        icon={<CheckIcon />}
                        onClick={handleUpdateInfo}
                        size="sm"
                        colorScheme="green"
                        aria-label="Save instagram"
                        isLoading={loading}
                      />
                    </Tooltip>
                    <Tooltip label="Cancel" hasArrow>
                      <IconButton
                        icon={<CloseIcon />}
                        onClick={() => {
                          setInstagram(user?.instagram || "");
                          setEditingInstagram(false);
                        }}
                        size="sm"
                        aria-label="Cancel instagram"
                      />
                    </Tooltip>
                  </HStack>
                )}
              </Box>
            </VStack>

            {/* Stat badge */}
            <Badge
              alignSelf="flex-start"
              variant="subtle"
              px={3}
              py={2}
              rounded="full"
              bg="#F8F7FF"
              border="1px solid"
              borderColor={borderColor}
              color={textColor}
            >
              Blogs: <b style={{ marginLeft: 6 }}>{blogs.length}</b>
            </Badge>
          </HStack>

          <Divider my={6} borderColor={borderColor} />

          {/* Quick actions (owner only) */}
          {isOwner && (
            <HStack spacing={3} flexWrap="wrap">
              <Button
                as={RouterLink}
                to="/create"
                bgGradient="linear(to-tr,gray.200,gray.500,gray.900)"
                color="white"
                rounded="lg"
                _hover={{ opacity: 0.9 }}
                size="sm"
              >
                Create new blog
              </Button>{" "}
            </HStack>
          )}
        </MotionBox>

        {/* Blogs */}
        <Box mt={8}>
          <Heading size="md" mb={4} color={textColor} fontWeight="semibold">
            {isOwner ? "My Blogs" : "Blogs"}
            <Text as="span" color={subtitleColor}>{`  (${blogs.length})`}</Text>
          </Heading>

          {blogs.length === 0 ? (
            <MotionBox
              bg={cardBg}
              rounded="2xl"
              border="1px dashed"
              borderColor={borderColor}
              p={8}
              textAlign="center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Text color={subtitleColor} fontStyle="italic">
                {isOwner
                  ? "You haven't written any blogs yet."
                  : "No blogs to show."}
              </Text>
            </MotionBox>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
              {blogs.map((b) => (
                <MotionBox
                  key={b._id}
                  bg={cardBg}
                  rounded="2xl"
                  border="1px solid"
                  borderColor={borderColor}
                  p={5}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <HStack justify="space-between" align="flex-start" mb={2}>
                    <Box as={RouterLink} to={`/blogs/${b._id}`} flex="1" mr={3}>
                      <Text
                        fontWeight="bold"
                        fontSize="lg"
                        color={textColor}
                        noOfLines={1}
                      >
                        {b.title || "Untitled"}
                      </Text>
                      {b.subtitle && (
                        <Text
                          fontSize="sm"
                          color={subtitleColor}
                          noOfLines={2}
                          mt={1}
                        >
                          {b.subtitle}
                        </Text>
                      )}
                    </Box>

                    {isOwner && (
                      <VStack spacing={1}>
                        <Tooltip label="Edit blog">
                          <IconButton
                            icon={<EditIcon />}
                            aria-label="Edit blog"
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleEditBlog(b)}
                          />
                        </Tooltip>
                        <Tooltip label="Delete blog">
                          <IconButton
                            icon={<DeleteIcon />}
                            aria-label="Delete blog"
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDeleteBlog(b._id)}
                          />
                        </Tooltip>
                      </VStack>
                    )}
                  </HStack>

                  {/* Meta row (optional place for tags/date) */}
                  {b.createdAt && (
                    <Text mt={3} fontSize="xs" color={subtitleColor}>
                      {new Date(b.createdAt).toLocaleString()}
                    </Text>
                  )}
                </MotionBox>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Box>

      {/* Edit Blog Modal */}
      <EditBlogModal isOpen={isOpen} onClose={onClose} blog={selectedBlog} />
    </Box>
  );
}

export default ProfilePage;
