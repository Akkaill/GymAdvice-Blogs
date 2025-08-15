import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Input,
  IconButton,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/auth";
import debounce from "lodash.debounce";
import { Link } from "react-router-dom";
import { FiHome, FiGrid } from "react-icons/fi";

export const SearchUserFilter = () => {
  const {
    setSearchUser,
    setSortUser,
    fetchAllUsers,
    searchUser,
    sortUserBy,
    sortUserOrder,
    resetUsers,
  } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState(searchUser);
  const [sortValue, setSortValue] = useState(
    sortUserBy && sortUserOrder
      ? `${sortUserBy}|${sortUserOrder}`
      : "createdAt|desc"
  );


  const inputBg = useColorModeValue("white", "gray.700");
  const inputColor = useColorModeValue("gray.700", "white");
  const placeholderColor = useColorModeValue("gray.400", "gray.400");
  const hoverBg = useColorModeValue("gray.100", "gray.600");
  const dropdownBg = useColorModeValue("white", "gray.800");
  const dropdownColor = useColorModeValue("gray.700", "white");

 
  const debouncedFetch = useCallback(
    debounce((value) => {
      setSearchUser(value);
      resetUsers();
      fetchAllUsers();
    }, 500),
    []
  );

  useEffect(() => {
    setSearchTerm(searchUser);
    return () => debouncedFetch.cancel();
  }, [searchUser, debouncedFetch]);

  const handleSearchChange = (e) => {
    const newSearch = e.target.value;
    setSearchTerm(newSearch);
    debouncedFetch(newSearch);
  };

  const handleSortChange = async (selectedValue) => {
    const [newSort, newOrder] = selectedValue.split("|");
    setSortValue(selectedValue);
    resetUsers();
    await new Promise((resolve) => {
      setTimeout(() => {
        setSortUser(newSort, newOrder);
        resolve();
      }, 0);
    });
    fetchAllUsers();
  };

  return (
    <Box display="flex" w="full" gap={3} alignItems="center" mb={4} flexWrap="wrap">
      {/* Home Button */}
      <Tooltip label="Go to Home">
        <Link to="/">
          <IconButton
            icon={<FiHome />}
            aria-label="Home"
            variant="outline"
            colorScheme="blue"
            size="md"
            _hover={{ bg: hoverBg }}
          />
        </Link>
      </Tooltip>

      {/* Dashboard Button */}
      <Tooltip label="Go to Dashboard">
        <Link to="/dashboard">
          <IconButton
            icon={<FiGrid />}
            aria-label="Dashboard"
            variant="outline"
            colorScheme="blue"
            size="md"
            _hover={{ bg: hoverBg }}
          />
        </Link>
      </Tooltip>

      {/* Search Input */}
      <Input
        placeholder="Search username..."
        value={searchTerm}
        onChange={handleSearchChange}
        w={{ base: "100%", md: "auto", lg: "auto" }}
        minW="200px"
        bg={inputBg}
        color={inputColor}
        _placeholder={{ color: placeholderColor }}
        _focus={{ bg: hoverBg, borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
      />

      {/* Sort Dropdown */}
      <Select
        onValueChange={handleSortChange}
        value={sortValue}
        minW="200px"
        maxW="240px"
        mb={4}
      >
        <SelectTrigger
          className="flex justify-center w-42 "
          style={{ backgroundColor: inputBg, color: inputColor, borderColor: "#CBD5E0" }}
        >
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent
          className="z-[999]"
          style={{ backgroundColor: dropdownBg, color: dropdownColor }}
        >
          <SelectItem value="createdAt|desc">Newest First</SelectItem>
          <SelectItem value="createdAt|asc">Oldest First</SelectItem>
          <SelectItem value="username|asc">Username A-Z</SelectItem>
          <SelectItem value="username|desc">Username Z-A</SelectItem>
          <SelectItem value="role|asc">Role A-Z</SelectItem>
          <SelectItem value="role|desc">Role Z-A</SelectItem>
        </SelectContent>
      </Select>
    </Box>
  );
};
