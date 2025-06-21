import React from "react";
import { Container, Box, Heading } from "@chakra-ui/react";
import LoginForm from "../components/form/LoginForm"

const LoginPage = () => {
  return (
    <Container maxW="md" mt={20}>
      <Box p={6} boxShadow="md" borderRadius="md" bg="white">
        <Heading mb={6} textAlign="center" fontFamily="Inter">Login</Heading>
        <LoginForm />
      </Box>
    </Container>
  );
};

export default LoginPage;
