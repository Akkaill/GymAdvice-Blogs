/** @jsxImportSource @emotion/react */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { css, keyframes } from "@emotion/react";
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Text,
  VStack,
  InputGroup,
  InputRightElement,
  useToast,
  Spinner,
  Progress,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import VerifyOTP from "./VerifyOTP";

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
`;

export default function RegisterForm() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [duplicateErrors, setDuplicateErrors] = useState({});
  const [checking, setChecking] = useState({ username: false, email: false });
  const [valid, setValid] = useState({ username: false, email: false });
  const debounceRef = useRef({});
  const [otpStep, setOtpStep] = useState(false);
  const [shakeConfirm, setShakeConfirm] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });

  const { register, error, loading, checkDuplicate } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (shakeConfirm) {
      const timer = setTimeout(() => setShakeConfirm(false), 400);
      return () => clearTimeout(timer);
    }
  }, [shakeConfirm]);

  const passwordChecks = {
    length: form.password.length >= 10,
    lowercase: /[a-z]/.test(form.password),
    uppercase: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
  };
  const strengthScore = Object.values(passwordChecks).filter(Boolean).length;

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email format";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (!form.password.trim()) newErrors.password = "Password is required";
    if (!Object.values(passwordChecks).every(Boolean))
      newErrors.password = "Password is too weak";
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      setShakeConfirm(true);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const debounceCheck = (type, value) => {
    if (debounceRef.current[type]) clearTimeout(debounceRef.current[type]);

    if (type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
      return;
    if (type === "username" && value.trim().length < 3) return;

    setChecking((prev) => ({ ...prev, [type]: true }));

    debounceRef.current[type] = setTimeout(async () => {
      const valueToCheck =
        type === "email" ? value.trim().toLowerCase() : value.trim();

      const {
        exists,
        field,
        type: checkedType,
      } = await checkDuplicate({ [type]: valueToCheck });

      setChecking((prev) => ({ ...prev, [type]: false }));

      if (exists && field === type) {
        setDuplicateErrors((prev) => ({
          ...prev,
          [type]:
            type === "username"
              ? "That username might already be taken."
              : "Looks like this email’s already been used",
        }));
        setValid((prev) => ({ ...prev, [type]: false }));
      } else {
        setDuplicateErrors((prev) => {
          const { [type]: _, ...rest } = prev;
          return rest;
        });
        setValid((prev) => ({ ...prev, [type]: true }));
      }
    }, 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const res = await register(form);
    if (res?.success) {
      setOtpStep(true);
      toast({
        title: "OTP Sent",
        description: "Please verify the OTP sent to your email or phone.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (otpStep) {
    return (
      <VerifyOTP
        contact={form.email || form.phone}
        onSuccess={() => navigate("/login")}
      />
    );
  }

  const animatedInput = (isInvalid, isValid) =>
    css({
      animation: isInvalid ? `${shake} 0.3s ease-in-out` : "none",
      borderColor: isInvalid ? "red.400" : isValid ? "green.400" : undefined,
      boxShadow: isInvalid
        ? "0 0 0 1px red"
        : isValid
        ? "0 0 0 1px green"
        : undefined,
      transition: "all 0.2s ease",
    });

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
        Create Account
      </Heading>

      {error && (
        <Text color="red.500" textAlign="center" mb={4}>
          {error}
        </Text>
      )}

      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          {/* Username */}
          <FormControl
            isInvalid={!!errors.username || !!duplicateErrors.username}
            isRequired
            isDisabled={loading}
          >
            <FormLabel>Username</FormLabel>
            <InputGroup>
              <Input
                value={form.username}
                onChange={(e) => {
                  setForm({ ...form, username: e.target.value });
                  if (valid.username)
                    setValid((v) => ({ ...v, username: false }));
                }}
                onBlur={() => debounceCheck("username", form.username)}
                css={animatedInput(
                  !!errors.username || !!duplicateErrors.username,
                  valid.username
                )}
                placeholder="Enter your username"
              />
              <InputRightElement>
                {checking.username && <Spinner size="sm" />}
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>
              {errors.username || duplicateErrors.username}
            </FormErrorMessage>
          </FormControl>

          {/* Email */}
          <FormControl
            isInvalid={!!errors.email || !!duplicateErrors.email}
            isRequired
            isDisabled={loading}
          >
            <FormLabel>Email</FormLabel>
            <InputGroup>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (valid.email) setValid((v) => ({ ...v, email: false }));
                }}
                onBlur={() => debounceCheck("email", form.email)}
                css={animatedInput(
                  !!errors.email || !!duplicateErrors.email,
                  valid.email
                )}
                placeholder="Enter your email"
              />
              <InputRightElement>
                {checking.email && <Spinner size="sm" />}
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>
              {errors.email || duplicateErrors.email}
            </FormErrorMessage>
          </FormControl>

          {/* Phone */}
          <FormControl isInvalid={!!errors.phone}>
            <FormLabel>Phone</FormLabel>
            <Input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Enter your phone number"
            />
            <FormErrorMessage>{errors.phone}</FormErrorMessage>
          </FormControl>

          {/* Password */}
          <FormControl isInvalid={!!errors.password}>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPasswords.password ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Create a strong password"
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="1.5rem"
                  size="sm"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      password: !prev.password,
                    }))
                  }
                >
                  {showPasswords.password ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.password}</FormErrorMessage>
            <Progress
              value={(strengthScore / 5) * 100}
              size="xs"
              mt={2}
              colorScheme={
                strengthScore < 3
                  ? "red"
                  : strengthScore < 5
                  ? "yellow"
                  : "green"
              }
              borderRadius="md"
            />
            <List spacing={1} mt={2} fontSize="sm" color="gray.600">
              {Object.entries(passwordChecks).map(([key, pass]) => (
                <ListItem key={key}>
                  <ListIcon
                    as={pass ? CheckCircleIcon : WarningIcon}
                    color={pass ? "green.500" : "red.500"}
                  />
                  {key === "length" && "At least 10 characters"}
                  {key === "lowercase" && "Lowercase letter"}
                  {key === "uppercase" && "Uppercase letter"}
                  {key === "number" && "Number"}
                  {key === "special" && "Special character"}
                </ListItem>
              ))}
            </List>
          </FormControl>

          {/* Confirm Password */}
          <FormControl
            isInvalid={!!errors.confirmPassword}
            sx={{
              "&[data-invalid]": {
                borderColor: "transparent !important",
                boxShadow: "none !important",
              },
            }}
          >
            <FormLabel>Confirm Password</FormLabel>
            <InputGroup>
              <Input
                type={showPasswords.confirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => {
                  setForm({ ...form, confirmPassword: e.target.value });
                  if (errors.confirmPassword) {
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: undefined,
                    }));
                  }
                }}
                css={css({
                  animation: shakeConfirm
                    ? `${shake} 0.3s ease-in-out`
                    : "none",
                  borderColor: errors.confirmPassword ? "red.400" : undefined,
                  boxShadow: errors.confirmPassword
                    ? "0 0 0 1px red"
                    : undefined,
                  transition: "all 0.2s ease",
                })}
                placeholder="Confirm your password"
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="1.5rem"
                  size="sm"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      confirmPassword: !prev.confirmPassword,
                    }))
                  }
                >
                  {showPasswords.confirmPassword ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            isLoading={loading}
            colorScheme="green"
            width="full"
          >
            Register
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
