// src/pages/RegisterPage.jsx
import React from "react";
import { Box, IconButton, Tooltip } from "@chakra-ui/react";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { Link } from "react-router-dom";
import RegisterForm from "@/components/form/RegisterForm";

const NAV_OFFSET = 88; 

const BackFab = () => (
  <Box position="fixed" top={`${NAV_OFFSET}px`} left="16px" zIndex={1100}>
    <Tooltip label="Back to Home" hasArrow>
      <IconButton
        as={Link}
        to="/"
        aria-label="Back"
        icon={<MdOutlineKeyboardArrowLeft size={24} />}
        rounded="full"
        bg="white"
        border="1px solid #EFEAFD"
        shadow="md"
        _hover={{ bg: "#F8F7FF" }}
      />
    </Tooltip>
  </Box>
);

const RegisterPage = () => {
  return (
    <>
      <BackFab />
      <RegisterForm />
    </>
  );
};

export default RegisterPage;
