// src/pages/FavoriteListPage.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Icon,
  Button,
  VStack,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { useBlogStore } from "@/store/blog";
import { useAuthStore } from "@/store/auth";
import BlogCard from "@/components/BlogCard";

/**
 * Premium Favorites Page
 * - แยก state loading สำหรับหน้านี้ (กันกะ global loading ของ blog store)
 * - ดึง favoriteBlogs เมื่อ user เปลี่ยน หรือหน้าเปิดครั้งแรก
 * - Spacing ด้านบน pt="28" กัน Navbar glass ทับ
 * - Empty state สวย ๆ พร้อมปุ่มไป Browse Blogs
 * - Debug console & toast error (ช่วยตอนแก้ API)
 */
export default function FavoriteListPage() {
  const { favoriteBlogs, fetchFavoriteBlogs } = useBlogStore();
  const { user, isAuthenticated } = useAuthStore();
  const [pageLoading, setPageLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const userId = user?._id || user?.id || null;

  // โหลด favorites เมื่อ user พร้อม
  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setPageLoading(true);
      try {
        await fetchFavoriteBlogs();
      } catch (err) {
        console.error("❌ fetchFavoriteBlogs failed:", err);
        toast({
          title: "Failed to load favorites",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, [userId]);

  // กันกรณี store ยังไม่ normalize
  const favorites = useMemo(
    () => (Array.isArray(favoriteBlogs) ? favoriteBlogs : []),
    [favoriteBlogs]
  );

  /* ---------- UI States ---------- */
  if (!isAuthenticated || !userId) {
    return (
      <Box pt="28" maxW="720px" mx="auto" textAlign="center">
        <VStack spacing={4}>
          <Icon as={FaRegHeart} boxSize={12} color="gray.400" />
          <Heading size="md">Please log in to see your favorite blogs.</Heading>
          <Button colorScheme="blue" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </VStack>
      </Box>
    );
  }

  if (pageLoading) {
    return (
      <Box pt="28" minH="40vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="lg" />
      </Box>
    );
  }

  if (favorites.length === 0) {
    return (
      <Box pt="28" maxW="720px" mx="auto" textAlign="center">
        <VStack spacing={4}>
          <Icon as={FaHeart} boxSize={12} color="pink.300" />
          <Heading size="lg">No favorites yet</Heading>
          <Text color="gray.500" maxW="sm">
            Tap the heart icon on any blog to save it here for quick access later.
          </Text>
          <Button colorScheme="teal" onClick={() => navigate("/blogs")}>
            Browse Blogs
          </Button>
        </VStack>
      </Box>
    );
  }

  /* ---------- Favorites Grid ---------- */
  return (
    <Box pt="28" px={{ base: 4, md: 8 }} maxW="1280px" mx="auto">
      <Heading mb={6} size="lg">
        My Favorites
      </Heading>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
        {favorites.map((blog) => (
          <BlogCard key={blog._id} blog={blog} />
        ))}
      </SimpleGrid>
    </Box>
  );
}
