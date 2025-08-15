import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  VStack,
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Text,
  HStack,
  SimpleGrid,
  Image,
  Divider,
  useColorModeValue,
  IconButton,
  Tooltip,
  Kbd,
} from "@chakra-ui/react";
import { toast } from "sonner";
import { useBlogStore } from "@/store/blog";
import { FiTrash2, FiEye, FiImage, FiSave } from "react-icons/fi";

const DRAFT_KEY = "draft:createBlog";

export default function CreatePage() {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderCol = useColorModeValue("gray.200", "gray.700");
  const subtle = useColorModeValue("gray.600", "gray.300");

  const { createBlog } = useBlogStore();
  const [newBlog, setNewBlog] = useState({
    title: "",
    subtitle: "",
    description: "",
    image: "",
  });
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounceRef = useRef(null);

  // ---------- helpers ----------
  const isValidUrl = (v) => {
    if (!v) return true; 
    try {
      const u = new URL(v);
      return !!u.protocol && !!u.host;
    } catch {
      return false;
    }
  };

  const counts = useMemo(() => {
    const desc = newBlog.description ?? "";
    return {
      title: (newBlog.title ?? "").length,
      subtitle: (newBlog.subtitle ?? "").length,
      descChars: desc.length,
      descWords: desc.trim() ? desc.trim().split(/\s+/).length : 0,
    };
  }, [newBlog]);

  const errors = useMemo(() => {
    const e = {};
    if (!newBlog.title?.trim() || newBlog.title.trim().length < 3) {
      e.title = "Title must be at least 3 characters.";
    }
    if (!newBlog.description?.trim() || newBlog.description.trim().length < 30) {
      e.description = "Description must be at least 30 characters.";
    }
    if (!isValidUrl(newBlog.image)) {
      e.image = "Please enter a valid image URL (or leave empty).";
    }
    return e;
  }, [newBlog]);

  const isFormValid = Object.keys(errors).length === 0;

  // ---------- autosave draft ----------
  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setNewBlog((prev) => ({ ...prev, ...parsed }));
      } catch {}
    }
  }, []);

  useEffect(() => {
    // debounce save
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(newBlog));
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [newBlog]);

  // Warn before unload if there are unsaved changes
  useEffect(() => {
    const hasSomething =
      newBlog.title || newBlog.subtitle || newBlog.description || newBlog.image;
    const handler = (e) => {
      if (isSubmitting) return;
      if (hasSomething) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [newBlog, isSubmitting]);

  // ---------- handlers ----------
  const onChange =
    (field) =>
    (e) => {
      setNewBlog((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const markTouched = (field) => setTouched((t) => ({ ...t, [field]: true }));

  const clearForm = () => {
    setNewBlog({ title: "", subtitle: "", description: "", image: "" });
    setTouched({});
    localStorage.removeItem(DRAFT_KEY);
  };

  const handleSubmit = async () => {
    setTouched({ title: true, description: true, image: true });
    if (!isFormValid) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setIsSubmitting(true);

    const op = createBlog(newBlog);

    // ใช้ toast.promise ให้ status ชัดเจน
    await toast.promise(op, {
      loading: "Creating blog…",
      success: (res) => {
        const message = res?.message || "Created successfully.";
        clearForm();
        return `✅ ${message}`;
      },
      error: (err) => {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to create the blog.";
        return `❌ ${message}`;
      },
    });

    setIsSubmitting(false);
  };

  const submitOnShortcut = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const showPreviewImage = !!newBlog.image && isValidUrl(newBlog.image);

  return (
    <Container maxW="container.md" pt={28} pb={10}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="lg" textAlign="center">
          ✍️ Create New Blog
        </Heading>

        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={borderCol}
          rounded="2xl"
          p={{ base: 5, md: 6 }}
          shadow="sm"
        >
          <VStack align="stretch" spacing={5}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
              <FormControl isInvalid={touched.title && !!errors.title}>
                <FormLabel>Title</FormLabel>
                <Input
                  placeholder="E.g. How to build a stronger back"
                  value={newBlog.title}
                  onChange={onChange("title")}
                  onBlur={() => markTouched("title")}
                />
                <HStack justify="space-between" mt={1}>
                  <FormErrorMessage>{errors.title}</FormErrorMessage>
                  <Text fontSize="xs" color={subtle}>
                    {counts.title} chars
                  </Text>
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel>Subtitle (optional)</FormLabel>
                <Input
                  placeholder="A short supportive line"
                  value={newBlog.subtitle}
                  onChange={onChange("subtitle")}
                />
                <HStack justify="flex-end" mt={1}>
                  <Text fontSize="xs" color={subtle}>
                    {counts.subtitle} chars
                  </Text>
                </HStack>
              </FormControl>
            </SimpleGrid>

            <FormControl isInvalid={touched.description && !!errors.description}>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Write something helpful and detailed…"
                value={newBlog.description}
                onChange={onChange("description")}
                onBlur={() => markTouched("description")}
                onKeyDown={submitOnShortcut}
                minH="180px"
              />
              <HStack justify="space-between" mt={1}>
                <FormErrorMessage>{errors.description}</FormErrorMessage>
                <Text fontSize="xs" color={subtle}>
                  {counts.descWords} words • {counts.descChars} chars
                </Text>
              </HStack>
            </FormControl>

            <FormControl isInvalid={touched.image && !!errors.image}>
              <FormLabel>Cover Image URL (optional)</FormLabel>
              <HStack align="start" spacing={4}>
                <Input
                  placeholder="https://example.com/cover.jpg"
                  value={newBlog.image}
                  onChange={onChange("image")}
                  onBlur={() => markTouched("image")}
                />
                <Tooltip label="Preview">
                  <IconButton
                    aria-label="Preview image"
                    icon={<FiEye />}
                    onClick={() => {
                      if (!newBlog.image) return;
                      if (!isValidUrl(newBlog.image)) {
                        toast.error("Invalid image URL.");
                        return;
                      }
                      // open in new tab
                      window.open(newBlog.image, "_blank", "noopener,noreferrer");
                    }}
                  />
                </Tooltip>
              </HStack>
              <FormErrorMessage>{errors.image}</FormErrorMessage>

              {showPreviewImage && (
                <Box
                  mt={3}
                  border="1px solid"
                  borderColor={borderCol}
                  rounded="lg"
                  overflow="hidden"
                >
                  <Image
                    src={newBlog.image}
                    alt="Cover preview"
                    maxH="220px"
                    w="100%"
                    objectFit="cover"
                    fallbackSrc="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='220'></svg>"
                  />
                </Box>
              )}
              {!newBlog.image && (
                <HStack mt={2} color={subtle}>
                  <FiImage />
                  <Text fontSize="sm">Tip: paste any public image URL to show a preview.</Text>
                </HStack>
              )}
            </FormControl>

            <Divider />

            <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
              <HStack color={subtle} fontSize="sm">
                <Kbd>{navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}</Kbd>
                <Text> + </Text>
                <Kbd>Enter</Kbd>
                <Text>to publish</Text>
              </HStack>

              <HStack>
                <Tooltip label="Save draft (local)">
                  <IconButton
                    aria-label="Save draft"
                    icon={<FiSave />}
                    onClick={() => {
                      localStorage.setItem(DRAFT_KEY, JSON.stringify(newBlog));
                      toast.success("Draft saved locally.");
                    }}
                    variant="outline"
                  />
                </Tooltip>

                <Button
                  leftIcon={<FiTrash2 />}
                  variant="outline"
                  onClick={() => {
                    clearForm();
                    toast("Draft cleared.");
                  }}
                >
                  Clear
                </Button>

                <Button
                  colorScheme="teal"
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  isDisabled={!isFormValid || isSubmitting}
                >
                  Publish
                </Button>
              </HStack>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}
