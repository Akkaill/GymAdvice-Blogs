import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import {
  Box,
  Input,
  Button,
  Heading,
  FormControl,
  FormLabel,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  VStack,
  Text,
  useToast,
} from "@chakra-ui/react";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, loading } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email format";
    if (!form.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const res = await login(form.email, form.password);

    if (res.success) {
      navigate("/dashboard");
    } else if (res.requireVerification) {
      toast({
        title: "OTP Required",
        description: "Please verify your OTP to continue.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });

      // 👉 Redirect to VerifyOTP page (ถ้ามีหน้ารอ OTP ยืนยัน)
      navigate("/verify-otp", {
        state: {
          email: form.email,
        },
      });
    }
  };

  return (
    <Box
      maxW="md"
      mx="auto"
      mt={12}
      p={8}
      bg="white"
      boxShadow="lg"
      borderRadius="md"
    >
      <Heading size="lg" mb={6} textAlign="center">
        Welcome Back
      </Heading>

      {error && (
        <Text color="red.500" mb={4} textAlign="center">
          {error}
        </Text>
      )}

      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          {/* Email */}
          <FormControl isInvalid={!!errors.email} isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          {/* Password */}
          <FormControl isInvalid={!!errors.password} isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
              />
              <InputRightElement width="4.5rem">
                <Button
                  size="sm"
                  h="1.5rem"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            isLoading={loading}
            colorScheme="green"
            width="full"
          >
            Login
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
