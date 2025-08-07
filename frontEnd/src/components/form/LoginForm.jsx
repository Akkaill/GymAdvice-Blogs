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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
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

    // ❗ ถ้า login ไม่สำเร็จ → เช็กว่าต้อง OTP หรือไม่
    if (!res.success) {
      // ❗ ถ้า require OTP → เด้งไปหน้า verify OTP
      if (res.requireVerification) {
        toast({
          title: "OTP Required",
          description: "Please verify your OTP to continue.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        navigate("/verify-otp-login", {
          state: { email: form.email, password: form.password },
        });
        return;
      }

      // ❌ รหัสผิด หรือ error อื่น → แสดง error
      setErrors({
        email: "",
        password: "Invalid email or password",
      });

      setLoginError(res.message || "Invalid email or password");

      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        status: "error",
        duration: 5000,
        isClosable: true,
      });

      return;
    }

    setLoginError("");
    setErrors({ email: "", password: "" });

    if (res.user?.role === "admin" || res.user?.role === "superadmin") {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  if (otpStep) {
    return (
      <VerifyOTP
        contact={otpContact}
        onSuccess={async () => {
          // OTP ผ่านแล้ว ลอง login ใหม่
          const res = await login(form.email, form.password);
          if (res.success) {
            toast({
              title: "Login Successful",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            if (res.user?.role === "admin" || res.user?.role === "superadmin") {
              navigate("/dashboard");
            } else {
              navigate("/");
            }
          }
        }}
      />
    );
  }

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
        Welcome
      </Heading>

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
