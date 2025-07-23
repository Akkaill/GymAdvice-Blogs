// src/components/button/FavoriteButton.jsx
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { IconButton, Tooltip } from "@chakra-ui/react";
import { useMemo } from "react";
import { useBlogStore } from "@/store/blog";
import { useAuthStore } from "@/store/auth";

export const FavoriteButton = ({ blogId }) => {
  const { toggleFavoriteBlog, blogs, favoriteBlogs } = useBlogStore();
  const { user } = useAuthStore();

  const userId = user ? String(user._id || user.id) : null;

  // หา blog จากทั้งสองที่
  const blog = useMemo(() => {
    return (
      blogs.find((b) => b._id === blogId) ||
      favoriteBlogs.find((b) => b._id === blogId) ||
      null
    );
  }, [blogs, favoriteBlogs, blogId]);

  // ตรวจสถานะ
  const isFavorite = useMemo(() => {
    if (!blog || !Array.isArray(blog.favoritedBy) || !userId) return false;
    return blog.favoritedBy.map(String).includes(userId);
  }, [blog, userId]);

  if (!user || !blog) return null;

  const handleClick = async () => {
    await toggleFavoriteBlog(blogId);
  };

  return (
    <Tooltip label={isFavorite ? "Unfavorite" : "Favorite"}>
      <IconButton
        variant="ghost"
        aria-label="Favorite"
        icon={isFavorite ? <FaHeart /> : <FaRegHeart />}
        color={isFavorite ? "pink.400" : "gray.400"}
        _hover={{ color: "pink.500" }}
        onClick={handleClick}
      />
    </Tooltip>
  );
};
