import React, { useEffect, useState } from "react";
import {
  Box,
  HStack,
  Stack,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Select,
  IconButton,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiSearch, FiX, FiSliders } from "react-icons/fi";

export default function SearchFavorite({
  value,
  onChange,
  debounceMs = 300,
  placeholder = "Search favorites…",
}) {
  const border = useColorModeValue("gray.200", "whiteAlpha.300");
  const bg = useColorModeValue("white", "blackAlpha.300");
  const iconCol = useColorModeValue("gray.500", "gray.400");
  const placeholderCol = useColorModeValue("gray.500", "gray.400");
  const focusCol = useColorModeValue("teal.500", "teal.300");

  const [local, setLocal] = useState(() => ({
    search: value?.search ?? "",
    sortBy: value?.sortBy ?? "createdAt",
    order: value?.order ?? "desc",
  }));


  useEffect(() => {
    setLocal((prev) => ({
      ...prev,
      search: value?.search ?? "",
      sortBy: value?.sortBy ?? "createdAt",
      order: value?.order ?? "desc",
    }));
  }, [value?.search, value?.sortBy, value?.order]);


  useEffect(() => {
    const id = setTimeout(() => onChange?.(local), debounceMs);
    return () => clearTimeout(id);
  }, [local.search]);

  // sort/order ส่งทันที
  useEffect(() => {
    onChange?.(local);
  }, [local.sortBy, local.order]);

  const clearSearch = () => {
    const next = { ...local, search: "" };
    setLocal(next);
    onChange?.(next); 
  };

  const resetAll = () => {
    const next = { search: "", sortBy: "createdAt", order: "desc" };
    setLocal(next);
    onChange?.(next);
  };

  return (
    <Box as="form" onSubmit={(e) => e.preventDefault()}>
      <Stack
        direction={{ base: "column", md: "row" }}
        spacing={2}
        align="stretch"
        w="full"
      >
        {/* Search */}
        <InputGroup size="sm">
          <InputLeftElement pointerEvents="none">
            <FiSearch size={16} color={iconCol} />
          </InputLeftElement>
          <Input
            value={local.search}
            onChange={(e) => setLocal((p) => ({ ...p, search: e.target.value }))}
            placeholder={placeholder}
            aria-label="Search favorites"
            bg={bg}
            borderColor={border}
            _placeholder={{ color: placeholderCol }}
            rounded="lg"
            focusBorderColor={focusCol}
          />
          {local.search && (
            <InputRightElement>
              <IconButton
                aria-label="Clear search"
                size="xs"
                variant="ghost"
                icon={<FiX />}
                onClick={clearSearch}
                color={iconCol}
                _hover={{ bg: "blackAlpha.50", _dark: { bg: "whiteAlpha.100" } }}
                rounded="full"
              />
            </InputRightElement>
          )}
        </InputGroup>

        {/* Sort & Order + Reset */}
        <HStack spacing={2} flexWrap={{ base: "wrap", md: "nowrap" }}>
          <Select
            size="sm"
            value={local.sortBy}
            onChange={(e) => setLocal((p) => ({ ...p, sortBy: e.target.value }))}
            bg={bg}
            borderColor={border}
            rounded="lg"
            focusBorderColor={focusCol}
            aria-label="Sort by"
            minW={{ base: "auto", md: "180px" }}
            fontSize="sm"
          >
            <option value="createdAt">Latest</option>
            <option value="title">Title</option>
            <option value="favoritedAt">Favorited time</option>
          </Select>

          <Select
            size="sm"
            value={local.order}
            onChange={(e) => setLocal((p) => ({ ...p, order: e.target.value }))}
            bg={bg}
            borderColor={border}
            rounded="lg"
            focusBorderColor={focusCol}
            aria-label="Order"
            minW={{ base: "auto", md: "140px" }}
            fontSize="sm"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </Select>

          <Button
            size="sm"
            w='36'
            leftIcon={<FiSliders size={16} />}
            variant="outline"
            onClick={resetAll}
            borderColor={border}
            rounded="lg"
            _hover={{ bg: "blackAlpha.50", _dark: { bg: "whiteAlpha.100" } }}
          >
            Reset
          </Button>
        </HStack>
      </Stack>
    </Box>
  );
}
