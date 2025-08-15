import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Icon,
  Button,
  VStack,
  HStack,
  Badge,
  useToast,
  useColorModeValue,
  CloseButton,
  Divider,
} from "@chakra-ui/react";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { useBlogStore } from "@/store/blog";
import { useAuthStore } from "@/store/auth";
import BlogCard from "@/components/layout/BlogCard";
import { BlogCardSkeleton } from "@/components/skeletons/BlogCardSkeleton";
import SearchFavorite from "@/components/search/SearchFavorite";

export default function FavoriteListPage() {
  const { favoriteBlogs, fetchFavoriteBlogs } = useBlogStore();
  const { user, isAuthenticated } = useAuthStore();

  const [pageLoading, setPageLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    sortBy: "createdAt",
    order: "desc",
  });

  const toast = useToast();
  const navigate = useNavigate();
  const userId = (user && (user._id || user.id)) || null;


  const cardBg = useColorModeValue("whiteAlpha.700", "blackAlpha.400");
  const borderCol = useColorModeValue("gray.200", "whiteAlpha.300");
  const subtle = useColorModeValue("gray.600", "gray.300");

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setPageLoading(true);
      try {
        await fetchFavoriteBlogs();
      } catch (err) {
        console.error("fetchFavoriteBlogs failed:", err);
        toast({
          title: "Failed to load favorites",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setPageLoading(false);
      }
    })();
  }, [userId, fetchFavoriteBlogs, toast]);

  const favorites = useMemo(() => {
    const raw = Array.isArray(favoriteBlogs) ? favoriteBlogs : [];
    const uniq = Array.from(new Map(raw.map((b) => [b._id, b])).values());

    const q = filters.search.trim().toLowerCase();
    let list = q
      ? uniq.filter((b) => {
          const title = (b.title || "").toLowerCase();
          const subtitle = (b.subtitle || "").toLowerCase();
          return title.includes(q) || subtitle.includes(q);
        })
      : uniq;

    const ts = (b) =>
      new Date(b.favoritedAt || b.updatedAt || b.createdAt || b._id).getTime();

    if (filters.sortBy === "title") {
      list.sort((a, b) =>
        filters.order === "asc"
          ? (a.title || "").localeCompare(b.title || "")
          : (b.title || "").localeCompare(a.title || "")
      );
    } else if (filters.sortBy === "favoritedAt") {
      list.sort((a, b) =>
        filters.order === "asc"
          ? new Date(a.favoritedAt || 0) - new Date(b.favoritedAt || 0)
          : new Date(b.favoritedAt || 0) - new Date(a.favoritedAt || 0)
      );
    } else {
      list.sort((a, b) =>
        filters.order === "asc" ? ts(a) - ts(b) : ts(b) - ts(a)
      );
    }

    return list;
  }, [favoriteBlogs, filters]);

  const hasActiveFilters =
    !!filters.search || filters.sortBy !== "createdAt" || filters.order !== "desc";

  const resetFilters = () =>
    setFilters({ search: "", sortBy: "createdAt", order: "desc" });

  // not logged in
  if (!isAuthenticated || !userId) {
    return (
      <Container maxW="container.md" pt={{ base: 24, md: 28 }} pb={20}>
        <VStack spacing={5} textAlign="center">
          <Icon as={FaRegHeart} boxSize={12} color="gray.400" />
          <Heading size="md">Please log in to see your favorite blogs</Heading>
          <Text color="gray.500">Sign in to save and revisit posts you love.</Text>
          <Button colorScheme="blue" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </VStack>
      </Container>
    );
  }

  // loading
  if (pageLoading) {
    return (
      <Container maxW="container.xl" pt={{ base: 24, md: 28 }} pb={20}>
        <Heading size="lg" mb={6}>
          My Favorites
        </Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {Array.from({ length: 8 }).map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </SimpleGrid>
      </Container>
    );
  }


  if (favorites.length === 0) {
    return (
      <Container maxW="container.md" pt={{ base: 24, md: 28 }} pb={20}>
        <VStack spacing={5} textAlign="center">
          <Icon as={FaHeart} boxSize={12} color="pink.300" />
          <Heading
            size="lg"
            bgGradient="linear(to-r, teal.400, cyan.400)"
            bgClip="text"
          >
            No favorites yet
          </Heading>
        </VStack>

        <VStack spacing={3} mt={4}>
          <Text color={subtle} maxW="sm" textAlign="center">
            Tap the heart icon on any blog to save it here for quick access.
          </Text>
          <Button colorScheme="teal" onClick={() => navigate("/blogs")}>
            Browse Blogs
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" pt={{ base: 24, md: 28 }} pb={20}>
      {/* Header */}
      <VStack spacing={1} align="flex-start" mb={4}>
        <Heading
          size="lg"
          lineHeight="1.2"
          bgGradient="linear(to-r, teal.400, cyan.400)"
          bgClip="text"
        >
          My Favorites <Badge ml={2}>{favorites.length}</Badge>
        </Heading>
        <Text fontSize="sm" color={subtle}>
          Quickly find and manage your saved posts.
        </Text>
      </VStack>

   
      <Box
        mb={5}                                 
        border="1px solid"
        borderColor={borderCol}
        bg={cardBg}
        backdropFilter="saturate(160%) blur(8px)"
        rounded="xl"
        p={{ base: 3, md: 4 }}
      >
        <SearchFavorite value={filters} onChange={setFilters} />

        {hasActiveFilters && (
          <>
            <Divider my={3} borderColor={borderCol} />
            <HStack spacing={2} flexWrap="wrap">
              {filters.search && (
                <Chip
                  label={`Search: "${filters.search}"`}
                  onClear={() => setFilters((p) => ({ ...p, search: "" }))}
                />
              )}
              {(filters.sortBy !== "createdAt" || filters.order !== "desc") && (
                <Chip
                  label={`Sort: ${filters.sortBy} • ${filters.order}`}
                  onClear={resetFilters}
                />
              )}
              <Button size="xs" variant="ghost" onClick={resetFilters}>
                Clear all
              </Button>
            </HStack>
          </>
        )}
      </Box>

      {/* Grid */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
        {favorites.map((blog) => (
          <BlogCard key={blog._id} blog={blog} />
        ))}
      </SimpleGrid>
    </Container>
  );
}

/* ---------- Small Chip component ---------- */
function Chip({ label, onClear }) {
  const borderCol = useColorModeValue("gray.200", "whiteAlpha.300");
  return (
    <HStack
      spacing={1}
      px={2.5}
      py={1}
      border="1px solid"
      borderColor={borderCol}
      rounded="full"
      bg="whiteAlpha.600"
      _dark={{ bg: "whiteAlpha.100" }}
    >
      <Text fontSize="xs">{label}</Text>
      <CloseButton size="sm" onClick={onClear} />
    </HStack>
  );
}
