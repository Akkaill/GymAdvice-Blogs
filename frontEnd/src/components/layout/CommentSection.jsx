import {
  Box,
  Button,
  Textarea,
  Text,
  VStack,
  HStack,
  IconButton,
  useToast,
  Skeleton,
  Avatar,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCommentStore } from "@/store/commentStore";
import { useAuthStore } from "@/store/auth";

const timeAgo = (date) => {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const dd = Math.floor(h / 24);
    if (dd < 7) return `${dd}d ago`;
    return d.toLocaleDateString();
  } catch {
    return "";
  }
};

/** ลด motion */
const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e) => setReduced(e.matches);
    setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
};

const CommentItem = memo(function CommentItem({
  c,
  canDelete,
  onDelete,
  reduced,
}) {
  const cardBg = useColorModeValue("gray.50", "gray.800");
  const nameColor = useColorModeValue("gray.800", "gray.100");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const name = c.userId?.username ?? c.user?.username ?? "Unknown";
  const avatarSrc = c.userId?.avatar?.url ?? c.user?.avatar?.url ?? undefined;

  return (
    <Box
      p={3}
      bg={cardBg}
      borderRadius="lg"
      border="1px solid"
      borderColor={useColorModeValue("gray.200", "whiteAlpha.200")}
      transition="transform 0.25s ease, box-shadow 0.25s ease"
      _hover={
        !reduced
          ? { transform: "translateY(-2px)", boxShadow: "sm" }
          : undefined
      }
    >
      <HStack justify="space-between" align="start">
        <HStack spacing={3} align="center">
          {avatarSrc ? (
            <Avatar
              size="sm"
              name={name}
              src={avatarSrc}
              referrerPolicy="no-referrer"
            />
          ) : null}

          <Box>
            <HStack spacing={2}>
              <Text fontWeight="bold" color={nameColor}>
                {c.userId?.username || "Unknown"}
              </Text>
              {c.userId?.role && (
                <Badge variant="subtle" colorScheme="purple">
                  {c.userId.role}
                </Badge>
              )}
              {c._optimistic && (
                <Badge variant="subtle" colorScheme="blue">
                  sending…
                </Badge>
              )}
            </HStack>
            <Text fontSize="xs" color="gray.500">
              {timeAgo(c.createdAt)}
            </Text>
          </Box>
        </HStack>

        {canDelete && (
          <IconButton
            aria-label="Delete comment"
            icon={<DeleteIcon />}
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={() => onDelete(c)}
          />
        )}
      </HStack>

      <Text mt={2} color={textColor} whiteSpace="pre-wrap">
        {c.content}
      </Text>
    </Box>
  );
});

export const CommentSection = ({ blogId }) => {
  const { user } = useAuthStore();
  const toast = useToast();
  const reduced = usePrefersReducedMotion();

  const { comments, fetchComments, addComment, deleteComment, loading } =
    useCommentStore();

  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const MAX_LEN = 500;
  const taRef = useRef(null);

  const safeComments = Array.isArray(comments) ? comments : [];

  useEffect(() => {
    if (blogId) fetchComments(blogId);
  }, [blogId]);

  const canPost = useMemo(
    () => !!user && !!content.trim() && content.trim().length <= MAX_LEN,
    [user, content]
  );

  const handleSubmit = useCallback(async () => {
    if (!canPost || posting) return;
    const text = content.trim();
    if (!text) return;

    setPosting(true);

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      content: text,
      createdAt: new Date().toISOString(),
      userId: {
        _id: user?._id,
        username: user?.username || "You",
        role: user?.role,
        avatar: user?.avatar,
      },
      _optimistic: true,
    };

    try {
      await addComment(blogId, text);
      setContent("");
      toast({
        title: "Posted!",
        status: "success",
        duration: 1600,
        isClosable: true,
      });
    } catch (e) {
      await fetchComments(blogId);
      toast({
        title: "Failed to post",
        description:
          e?.response?.data?.message || "Please try again in a moment.",
        status: "error",
        duration: 2200,
        isClosable: true,
      });
    } finally {
      setPosting(false);
      // โฟกัสกลับ textarea
      requestAnimationFrame(() => {
        taRef.current?.focus();
      });
    }
  }, [
    canPost,
    posting,
    content,
    user,
    blogId,
    addComment,
    fetchComments,
    toast,
  ]);

  const handleDelete = useCallback(
    async (c) => {
      if (deletingId) return;
      setDeletingId(c._id);
      const backup = comments.slice();

      try {
        // ลบจริง
        await deleteComment(c._id);
        toast({
          title: "Comment deleted.",
          status: "info",
          duration: 1600,
          isClosable: true,
        });
      } catch (e) {
        // rollback
        await fetchComments(blogId);
        toast({
          title: "Failed to delete",
          description:
            e?.response?.data?.message || "Please try again in a moment.",
          status: "error",
          duration: 2200,
          isClosable: true,
        });
      } finally {
        setDeletingId(null);
      }
    },
    [deleteComment, deletingId, toast, comments, fetchComments, blogId]
  );

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canDelete = useCallback(
    (c) =>
      user &&
      (user._id === c?.userId?._id ||
        user?.role === "admin" ||
        user?.role === "superadmin"),
    [user]
  );

  const frameBg = useColorModeValue("white", "gray.900");
  const borderCol = useColorModeValue("gray.200", "whiteAlpha.200");

  return (
    <Box mt={6}>
      {/* Compose box */}
      {user ? (
        <Box
          p={4}
          bg={frameBg}
          borderRadius="xl"
          border="1px solid"
          borderColor={borderCol}
          boxShadow="sm"
          mb={4}
        >
          <HStack align="start" spacing={3}>
            <Avatar size="sm" name={user?.username} src={user?.avatar} />
            <Box flex="1">
              <Textarea
                ref={taRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Write a comment… (Enter = Post, Shift+Enter = new line)"
                rows={3}
                resize="vertical"
                maxLength={MAX_LEN}
                isDisabled={posting}
              />
              <HStack justify="space-between" mt={2}>
                <Text fontSize="xs" color="gray.500">
                  {content.trim().length}/{MAX_LEN}
                </Text>
                <Button
                  onClick={handleSubmit}
                  colorScheme="blue"
                  isLoading={posting}
                  loadingText="Posting"
                  isDisabled={!canPost}
                >
                  Post
                </Button>
              </HStack>
            </Box>
          </HStack>
        </Box>
      ) : (
        <Box
          p={4}
          bg={frameBg}
          borderRadius="xl"
          border="1px solid"
          borderColor={borderCol}
          boxShadow="sm"
          mb={4}
        >
          <Text fontSize="sm" color="gray.500">
            Please sign in to comment.
          </Text>
        </Box>
      )}

      {/* List */}
      <VStack spacing={4} align="stretch">
        {loading && (
          <>
            <Skeleton height="86px" rounded="lg" />
            <Skeleton height="86px" rounded="lg" />
            <Skeleton height="86px" rounded="lg" />
          </>
        )}

        {!loading && safeComments.length === 0 && (
          <Box
            p={6}
            textAlign="center"
            color="gray.500"
            border="1px dashed"
            borderColor={borderCol}
            rounded="xl"
          >
            No comments yet — be the first to share your thoughts!
          </Box>
        )}

        {!loading &&
          comments.map((c) => (
            <CommentItem
              key={c._id}
              c={c}
              canDelete={canDelete(c)}
              onDelete={handleDelete}
              reduced={reduced}
            />
          ))}
      </VStack>
    </Box>
  );
};
