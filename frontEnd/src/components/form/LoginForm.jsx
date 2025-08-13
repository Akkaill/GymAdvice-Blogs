import { useState, useEffect } from "react";
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
  useToast,
  Text,
  Divider,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import VerifyOTP from "./VerifyOTP";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuthStore();
  const [loginError, setLoginError] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otpContact, setOtpContact] = useState("");
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

  useEffect(() => {
    setLoginError("");
    setErrors({ email: "", password: "" });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ email: "", password: "" });
    setLoginError("");
    if (!validate()) return;

    const res = await login(form.email, form.password);

    if (!res.success) {
      if (res.requireVerification) {
        toast({
          title: "OTP Required",
          description: "Please verify your OTP to continue.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        setOtpStep(true);
        setOtpContact(form.email);
        return;
      }
      setErrors({ email: "", password: "Invalid email or password" });
      setLoginError(res.message || "Invalid email or password");
      toast({
        title: "Login Failed",
        description: res.message || "Invalid email or password",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoginError("");
    setErrors({ email: "", password: "" });
    if (res.user?.role === "admin" || res.user?.role === "superadmin")
      navigate("/dashboard");
    else navigate("/");
  };

  if (otpStep) {
    return (
      <VerifyOTP
        contact={otpContact}
        onSuccess={async () => {
          const res = await login(form.email, form.password);
          if (res.success) {
            toast({
              title: "Login Successful",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            if (res.user?.role === "admin" || res.user?.role === "superadmin")
              navigate("/dashboard");
            else navigate("/");
          }
        }}
      />
    );
  }

  return (
    <Box bg="#F8F7FF" minH="100vh" py={10} px={4}>
      <Box
        maxW="md"
        mx="auto"
        bg="white"
        border="1px solid #EFEAFD"
        rounded="2xl"
        shadow="md"
        overflow="hidden"
      >
        <Box
          px={8}
          py={6}
          bgGradient="linear(to-r, #283E51, #485563, #2BC0E4)"
          // purple.600 → blue.500
          color="white"
        >
          <Heading size="lg" textAlign="center">
            Welcome Back
          </Heading>
          <Text fontSize="sm" opacity={0.9} textAlign="center" mt={1}>
            Log in to continue
          </Text>
        </Box>

        <Box px={8} py={6}>
          {loginError && (
            <Text color="red.500" textAlign="center" mb={3}>
              {loginError}
            </Text>
          )}

          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!errors.email} isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  borderColor="#EFEAFD"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.password} isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    borderColor="#EFEAFD"
                  />
                  <InputRightElement width="3rem">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword((s) => !s)}
                    >
                      {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>

              <Divider />

              <Button
                type="submit"
                isLoading={loading}
                bgGradient="linear(to-r, #283E51, #485563, #2BC0E4)"
                color="white"
                _hover={{ opacity: 0.9 }}
                height="48px"
                rounded="xl"
              >
                Login
              </Button>
            </VStack>
          </form>
        </Box>
      </Box>
    </Box>
  );
}
