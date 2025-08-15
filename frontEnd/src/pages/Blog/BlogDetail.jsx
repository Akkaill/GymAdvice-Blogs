import React, { useEffect, useMemo,useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Text,
  Heading,
  Container,
  VStack,
  HStack,
  Skeleton,
  SkeletonText,
  AspectRatio,
  Avatar,
  Badge,
  IconButton,
  Button,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Kbd,
  Tooltip,
  Image,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import { FiArrowLeft, FiLink, FiShare2 } from "react-icons/fi";
import { useBlogStore } from "@/store/blog";
import { CommentSection } from "@/components/layout/CommentSection";


const hashStr = (s = "") => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};
const toHsl = (seed, s = 60, l = 22) => `hsl(${seed % 360} ${s}% ${l}%)`;
const makeGradient = (key) => {
  const h = hashStr(key || "");
  return `linear-gradient(135deg, ${toHsl(h, 58, 18)}, ${toHsl(
    h * 3,
    55,
    26
  )} 55%, ${toHsl(h * 7, 50, 22)})`;
};

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchBlogById } = useBlogStore();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");


  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchBlogById(id);
        if (!alive) return;
        if (data) setBlog(data);
        else setErrMsg("Blog not found or failed to load.");
      } catch {
        if (alive) setErrMsg("Failed to load this blog.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, fetchBlogById]);

  const [heroLoaded, setHeroLoaded] = useState(false);
  const [heroError, setHeroError] = useState(false);
  const placeholder = useMemo(
    () => makeGradient((blog?.title || blog?.image || id) ?? id),
    [blog?.title, blog?.image, id]
  );

 
  const cardBg = useColorModeValue("white", "gray.900");
  const borderCol = useColorModeValue("gray.200", "whiteAlpha.200");
  const titleColor = useColorModeValue("gray.900", "gray.100");
  const subColor = useColorModeValue("gray.600", "gray.300");
  const textColor = useColorModeValue("gray.800", "gray.200");


  if (loading) {
    return (
      <Container maxW="container.md" py={10}>
        <Button
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          mb={4}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <VStack spacing={6} align="stretch">
          <AspectRatio ratio={16 / 9}>
            <Skeleton rounded="xl" />
          </AspectRatio>
          <Box>
            <Skeleton h="36px" mb={3} rounded="md" />
            <Skeleton h="18px" mb={1.5} rounded="md" />
            <Skeleton h="18px" mb={1.5} rounded="md" />
          </Box>
          <SkeletonText mt="4" noOfLines={8} spacing="3" rounded="md" />
        </VStack>
      </Container>
    );
  }

  if (errMsg) {
    return (
      <Container maxW="container.md" py={10}>
        <Button
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          mb={4}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Alert status="error" rounded="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{errMsg}</AlertDescription>
          </Box>
        </Alert>
      </Container>
    );
  }

  if (!blog) return null;

  
  const author = blog.authorName || blog.author;
  const authorId = author?._id || author?.id || author?.username; 
  const authorProfileHref = authorId ? `/profile/${authorId}` : undefined;
  const authorAvatarUrl = author?.avatar?.url;
  const createdAtStr = blog.createdAt
    ? new Date(blog.createdAt).toLocaleString()
    : "";


  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {}
  };
  const onShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.subtitle || blog.title,
          url: window.location.href,
        });
      } catch {}
    } else {
      await onCopyLink();
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      {/* Back + actions */}
      <HStack justify="space-between" mb={4}>
        <Button
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <HStack>
          <Tooltip label="Copy link">
            <IconButton
              aria-label="Copy link"
              icon={<FiLink />}
              variant="ghost"
              onClick={onCopyLink}
            />
          </Tooltip>
          <Tooltip label="Share">
            <IconButton
              aria-label="Share"
              icon={<FiShare2 />}
              variant="ghost"
              onClick={onShare}
            />
          </Tooltip>
        </HStack>
      </HStack>

      <VStack spacing={6} align="stretch">
        <Box
          rounded="2xl"
          overflow="hidden"
          border="1px solid"
          borderColor={borderCol}
        >
          <AspectRatio ratio={16 / 9}>
            <Box position="relative" backgroundImage={placeholder}>
              <Skeleton
                isLoaded={heroLoaded || heroError || !blog.image}
                fadeDuration={0.2}
              >
                {blog.image && !heroError ? (
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onLoad={() => setHeroLoaded(true)}
                    onError={() => setHeroError(true)}
                    // เอฟเฟกต์เบลอขณะโหลด
                    style={{
                      filter: heroLoaded ? "none" : "blur(12px)",
                      transform: heroLoaded ? "none" : "scale(1.04)",
                      transition: "filter 300ms ease, transform 300ms ease",
                    }}
                  />
                ) : (
                  <Box w="100%" h="100%" />
                )}
              </Skeleton>
            </Box>
          </AspectRatio>
        </Box>

        {/* Title & subtitle */}
        <Box>
          <Heading size="2xl" mb={2} color={titleColor} lineHeight={1.1}>
            {blog.title}
          </Heading>
          {blog.subtitle && (
            <Text fontSize={{ base: "md", md: "lg" }} color={subColor}>
              {blog.subtitle}
            </Text>
          )}
        </Box>

        <HStack
          spacing={4}
          p={4}
          bg={cardBg}
          border="1px solid"
          borderColor={borderCol}
          rounded="xl"
          justify="space-between"
        >
          <LinkBox
            as={HStack}
            spacing={3}
            cursor={authorProfileHref ? "pointer" : "default"}
          >
            {authorAvatarUrl ? (
              <Avatar
                size="sm"
                name={author?.username || "Author"}
                src={authorAvatarUrl}
                referrerPolicy="no-referrer"
              />
            ) : (
              <Avatar size="sm" name={author?.username || "Author"}  />
            )}

            <Box>
              {author?.username ? (
                <HStack spacing={2}>
                  {authorProfileHref ? (
                    <LinkOverlay as={Link} to={authorProfileHref}>
                      <Text
                        fontWeight="bold"
                        color={titleColor}
                        _hover={{ textDecoration: "underline" }}
                      >
                        {author.username}
                      </Text>
                    </LinkOverlay>
                  ) : (
                    <Text fontWeight="bold" color={titleColor}>
                      {author.username}
                    </Text>
                  )}
                  {author?.role && (
                    <Badge colorScheme="purple">{author.role}</Badge>
                  )}
                </HStack>
              ) : (
                <Text color={subColor}>Unknown author</Text>
              )}
              <Text fontSize="xs" color="gray.500">
                Created: {createdAtStr}
              </Text>
            </Box>
          </LinkBox>

          {Array.isArray(blog.tags) && blog.tags.length > 0 && (
            <HStack spacing={2} flexWrap="wrap" justify="flex-end">
              {blog.tags.map((t) => (
                <Badge key={t} variant="subtle" colorScheme="blue">
                  #{t}
                </Badge>
              ))}
            </HStack>
          )}
        </HStack>

        {/* Content */}
        <Box
          p={{ base: 0, md: 1 }}
          color={textColor}
          fontSize={{ base: "md", md: "lg" }}
          lineHeight={1.8}
          letterSpacing="0.01em"
          whiteSpace="pre-wrap"
        >
          {blog.description}
        </Box>

        <Divider />

        {/* Comments */}
        <Box>
          <Heading size="md" mb={3}>
            Comments
          </Heading>
          <CommentSection blogId={blog._id} />
          <Text mt={3} fontSize="xs" color="gray.500">
            Tip: กด <Kbd>Enter</Kbd> เพื่อโพสต์, <Kbd>Shift</Kbd>+
            <Kbd>Enter</Kbd> เพื่อขึ้นบรรทัดใหม่
          </Text>
        </Box>
      </VStack>
    </Container>
  );
} 
