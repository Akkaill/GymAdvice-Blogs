import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  HStack,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { useCommentStore } from "@/store/commentStore";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";

export const CommentSection = ({ blogId }) => {
  const { user } = useAuthStore();
  const toast = useToast();
  const {
    comments,
    fetchComments,
    addComment,
    deleteComment,
    loading,
  } = useCommentStore();

  const [content, setContent] = useState("");

  useEffect(() => {
    if (blogId) fetchComments(blogId);
  }, [blogId]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    await addComment(blogId, content);
    setContent("");
  };

  const handleDelete = async (id) => {
    await deleteComment(id);
    toast({
      title: "Comment deleted.",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box mt={6}>
      {user && (
        <HStack mb={4}>
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
          />
          <Button onClick={handleSubmit} colorScheme="blue">
            Post
          </Button>
        </HStack>
      )}

      <VStack spacing={4} align="stretch">
        {comments.map((c) => (
          <Box key={c._id} p={3} bg="gray.50" borderRadius="md">
            <HStack justify="space-between">
              <Text fontWeight="bold">{c.userId?.username || "Unknown"}</Text>
              {(user?._id === c.userId?._id ||
                user?.role === "admin" ||
                user?.role === "superadmin") && (
                <IconButton
                  icon={<DeleteIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => handleDelete(c._id)}
                />
              )}
            </HStack>
            <Text mt={2}>{c.content}</Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};


