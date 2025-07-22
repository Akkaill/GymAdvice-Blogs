import { FaHeart, FaRegHeart } from "react-icons/fa";
import { IconButton, Tooltip } from "@chakra-ui/react";
import { useMemo } from "react";
import { useBlogStore } from "@/store/blog";
import { useAuthStore } from "@/store/auth";

export const FavoriteButton = ({ blogId }) => {
  const { toggleFavoriteBlog, blogs } = useBlogStore();
  const { user } = useAuthStore();

  const blog = blogs.find((b) => b._id === blogId);
  const isFavorite = useMemo(() => {
    if (!blog || !Array.isArray(blog.favoritedBy)) return false;
    return blog.favoritedBy.includes(user?._id);
  }, [blog, user]);

  if (!user || !blog) return null;

  const handleClick = async () => {
    await toggleFavoriteBlog(blogId);
  };

  return (
    <Tooltip label={isFavorite ? "Unfavorite" : "Favorite"}>
      <IconButton
        variant="ghost"
        aria-label="Favorite"
        icon={isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
        onClick={handleClick}
        color={isFavorite ? "pink.400" : "gray.400"}
        _hover={{ color: "pink.500" }}
      />
    </Tooltip>
  );
};
