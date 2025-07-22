import React from "react";
import { Container, Box, Heading } from "@chakra-ui/react";
import RegisterForm from "../components/form/RegisterForm";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { Link } from "react-router-dom";

const RegisterPage = () => {
  return (
    <Container maxW="md" mt={20}>
      <Box p={6} boxShadow="md" borderRadius="md" bg="white">
        <Link to="/">
          <Box
            alignItems={"center"}
            justifyItems={"flex-start"}
            fontSize={"3xl"}
          >
            <MdOutlineKeyboardArrowLeft />
          </Box>
        </Link>
        <Heading mb={6} textAlign="center" fontFamily="Inter">
          Register
        </Heading>
        <RegisterForm />
      </Box>
    </Container>
  );
};

export default RegisterPage;
