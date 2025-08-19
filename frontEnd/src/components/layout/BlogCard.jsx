// components/cards/BlogCard.jsx
import { memo, useMemo, useState, useEffect, useRef } from "react";
import {
  Box,
  HStack,
  Heading,
  Text,
  Skeleton,
  AspectRatio,
  LinkBox,
  LinkOverlay,
  IconButton,
  useColorModeValue,
  VisuallyHidden,
} from "@chakra-ui/react";
import { FaArrowRightLong } from "react-icons/fa6";
import { MdDeleteOutline } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import { FavoriteButton } from "../button/FavoriteButton";

/** เคารพ reduced-motion (modern only) */
function usePrefersReducedMotion() {
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
}

/** สร้าง gradient คงที่จาก string (title หรือ url) ใช้เป็น LQ placeholder */
const hashStr = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};
const toHsl = (seed, s = 65, l = 45) => `hsl(${seed % 360} ${s}% ${l}%)`;
const makeGradient = (key) => {
  const h = hashStr(key || "");
  const c1 = toHsl(h, 60, 18);
  const c2 = toHsl(h * 3, 55, 28);
  const c3 = toHsl(h * 7, 50, 22);
  return `linear-gradient(135deg, ${c1}, ${c2} 55%, ${c3})`;
};

function useImageStatus(src) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const lastSrc = useRef(null);

  useEffect(() => {
    if (!src) return;
    if (lastSrc.current === src && loaded) return;
    setLoaded(false);
    setErrored(false);
    lastSrc.current = src;

    const img = new Image();
    img.decoding = "async";
    img.loading = "lazy";
    img.referrerPolicy = "no-referrer";
    img.onload = () => setLoaded(true);
    img.onerror = () => setErrored(true);
    img.src = src;

    return () => {};
  }, [src]);

  return { loaded, errored };
}

function BlogCardBase({ blog, showDelete = false, onDelete }) {
  if (!blog) return null;

  const location = useLocation();
  const isFavoritePage = location.pathname.includes("/favorites");
  const isManagePage = location.pathname === "/manage-blogs";
  const reduced = usePrefersReducedMotion();

  const cardBg = useColorModeValue(
    "rgba(255,255,255,0.7)",
    "rgba(17,24,39,0.6)"
  );
  const borderCol = useColorModeValue(
    "rgba(255,255,255,0.35)",
    "rgba(255,255,255,0.15)"
  );
  const hoverShadow = useColorModeValue("2xl", "dark-lg");
  const titleColor = useColorModeValue("gray.800", "gray.100");
  const subColor = useColorModeValue("gray.600", "gray.300");
  const ctaColor = useColorModeValue("blue.600", "blue.300");

  const placeholder = useMemo(
    () => makeGradient(blog.title || blog.image || blog._id || "placeholder"),
    [blog.title, blog.image, blog._id]
  );

  const { loaded, errored } = useImageStatus(blog.image);

  const showImage = !!blog.image && !errored;

  return (
    <LinkBox
      as="article"
      role="group"
      aria-label={blog.title}
      bg={cardBg}
      backdropFilter="blur(10px)"
      border={`1px solid ${borderCol}`}
      boxShadow="xl"
      rounded="2xl"
      overflow="hidden"
      transition="transform 0.25s ease, box-shadow 0.25s ease"
      _hover={
        !reduced
          ? { transform: "translateY(-4px)", boxShadow: hoverShadow }
          : undefined
      }
      _focusWithin={{ boxShadow: hoverShadow }}
      willChange={!reduced ? "transform" : undefined}
      minH="340px"
    >
      <AspectRatio ratio={16 / 9}>
        <Box position="relative">
          {/* Placeholder gradient */}
          <Box
            position="absolute"
            inset={0}
            bgImage={placeholder}
            transition="opacity 0.35s ease"
            opacity={loaded && showImage ? 0 : 1}
          />

          <Skeleton isLoaded={loaded || !showImage} fadeDuration={0.2}>
            {showImage ? (
              <Box
                as="img"
                src={blog.image}
                alt={blog.title}
                width="100%"
                height="100%"
                style={{
                  objectFit: "cover",
                  filter: loaded || reduced ? "none" : "blur(12px)",
                  transform: loaded || reduced ? "none" : "scale(1.04)",
                  transition: "filter 300ms ease, transform 300ms ease",
                }}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Box
                width="100%"
                height="100%"
                display="grid"
                placeItems="center"
                bgGradient={placeholder}
                color="whiteAlpha.900"
                fontSize="2xl"
              >
                🖼️
              </Box>
            )}
          </Skeleton>
        </Box>
      </AspectRatio>

      {/* Content Section */}
      <Box p={4}>
        <Heading
          as="h3"
          size="md"
          mb={2}
          noOfLines={1}
          color={titleColor}
          transition="color 0.2s"
          _groupHover={!reduced ? { color: ctaColor } : undefined}
        >
          <LinkOverlay as={Link} to={`/blogs/${blog._id}`}>
            {blog.title}
          </LinkOverlay>
        </Heading>

        <Text
          fontWeight="medium"
          fontSize="sm"
          color={subColor}
          mb={4}
          noOfLines={2}
        >
          {blog.subtitle}
        </Text>

        {/* Actions */}
        <HStack justifyContent="space-between" spacing={3}>
          {!isManagePage && !isFavoritePage && (
            <FavoriteButton blogId={blog._id} />
          )}

          {isManagePage && showDelete && (
            <IconButton
              aria-label={`Delete ${blog.title}`}
              icon={<MdDeleteOutline />}
              size="sm"
              variant="ghost"
              onClick={() => onDelete?.(blog._id)}
              _hover={
                !reduced
                  ? { transform: "translateY(-2px)", color: "red.500" }
                  : { color: "red.500" }
              }
              _active={{ transform: "translateY(0px)" }}
            />
          )}

          <Box
            as={Link}
            to={`/blogs/${blog._id}`}
            display="flex"
            alignItems="center"
            gap={2}
            p={1.5}
            rounded="lg"
            transition="transform 0.2s ease"
            _hover={!reduced ? { transform: "translateX(3px)" } : undefined}
          >
            <Text fontWeight="semibold" color={ctaColor}>
              Learn More
            </Text>
            <FaArrowRightLong aria-hidden />
            <VisuallyHidden>Go to blog: {blog.title}</VisuallyHidden>
          </Box>
        </HStack>
      </Box>
    </LinkBox>
  );
}

const areEqual = (prev, next) => {
  const a = prev.blog || {};
  const b = next.blog || {};
  return (
    prev.showDelete === next.showDelete &&
    a._id === b._id &&
    a.title === b.title &&
    a.subtitle === b.subtitle &&
    a.image === b.image
  );
};

export default memo(BlogCardBase, areEqual);
