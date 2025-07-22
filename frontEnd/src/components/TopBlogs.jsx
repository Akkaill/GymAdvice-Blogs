import { useEffect } from "react";
import { useBlogStore } from "@/store/blog";

export const TopBlogs = () => {
  const { topBlogs, fetchTopBlogs } = useBlogStore();

  useEffect(() => {
    fetchTopBlogs();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {topBlogs.map((blog) => (
        <div key={blog._id} className="p-4 shadow rounded bg-white">
          <h2 className="text-xl font-bold">{blog.title}</h2>
          <p className="text-gray-600">{blog.author.username}</p>
          <FavoriteButton blogId={blog._id} isInitiallyFavorite={false} />
        </div>
      ))}
    </div>
  );
};
