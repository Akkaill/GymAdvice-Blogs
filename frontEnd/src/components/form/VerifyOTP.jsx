import { useState, useEffect } from "react";
import axios from "../../utils/axios";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  useToast,
  HStack,
  PinInput,
  PinInputField,
  ScaleFade,
} from "@chakra-ui/react";
import { useAuthStore } from "@/store/auth";

export default function VerifyOTP({ contact, onSuccess }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [resending, setResending] = useState(false);
  const toast = useToast();
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const { verifyRegister } = useAuthStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async () => {
    try {
      const res = await verifyRegister({
        otp,
        email: contact.includes("@") ? contact : null,
        phone: contact.includes("@") ? null : contact,
      });

      if (res?.success) {
        toast({
          title: "OTP Verified",
          description: "You can now login.",
          status: "success",
          duration: 4000,
          isClosable: true,
        });
        onSuccess();
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Invalid OTP";
      setError(msg);

      if (msg.toLowerCase().includes("expired")) {
        toast({
          title: "OTP Expired",
          description: "Please resend and try again.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      await axios.post(`${API}/users/resend-temp-otp`, { contact });
      setCountdown(30);
      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your contact.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Resend Failed",
        description: "Unable to resend OTP.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <Box
      maxW="md"
      mx="auto"
      mt={12}
      p={8}
      bg="white"
      shadow="lg"
      borderRadius="md"
    >
      <Heading size="md" mb={4} textAlign="center">
        Verify OTP
      </Heading>
      <Text textAlign="center" color="gray.600" mb={4}>
        OTP sent to <strong>{contact}</strong>
      </Text>

      {error && (
        <Text color="red.500" textAlign="center" mb={3}>
          {error}
        </Text>
      )}

      <VStack spacing={6}>
        <ScaleFade in={true} initialScale={0.9}>
          <HStack justify="center">
            <PinInput
              otp
              autoFocus
              value={otp}
              onChange={(value) => setOtp(value)}
              onComplete={(value) => setOtp(value)}
              mask
              size="lg"
              variant="filled"
              focusBorderColor="green.400"
            >
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
            </PinInput>
          </HStack>
        </ScaleFade>

        <Button
          onClick={handleVerify}
          colorScheme="blue"
          width="full"
          isDisabled={otp.length !== 6}
        >
          Verify
        </Button>

        <Button
          onClick={handleResend}
          isDisabled={countdown > 0}
          isLoading={resending}
          variant="link"
          colorScheme="blue"
          size="sm"
        >
          {countdown > 0
            ? `Resend OTP in ${countdown}s`
            : "Resend OTP"}
        </Button>
      </VStack>
    </Box>
  );
}
