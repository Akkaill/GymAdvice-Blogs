import React from "react";
import { Container, Box, Heading } from "@chakra-ui/react";
import RegisterForm from "../components/form/RegisterForm";

const RegisterPage = () => {
  return (
    <Container maxW="md" mt={20}>
      <Box p={6} boxShadow="md" borderRadius="md" bg="white">
        <Heading mb={6} textAlign="center" fontFamily="Inter">Register</Heading>
        <RegisterForm />
      </Box>
    </Container>
  );
};

export default RegisterPage;
