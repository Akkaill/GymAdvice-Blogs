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
  Divider,
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
    const timer = setInterval(() => setCountdown((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
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
        toast({ title: "OTP Verified", description: "You can now login.", status: "success", duration: 4000, isClosable: true });
        onSuccess();
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Invalid OTP";
      setError(msg);
      if (msg.toLowerCase().includes("expired")) {
        toast({ title: "OTP Expired", description: "Please resend and try again.", status: "error", duration: 4000, isClosable: true });
      }
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      await axios.post(`${API}/users/resend-temp-otp`, { contact });
      setCountdown(30);
      toast({ title: "OTP Resent", description: "A new OTP has been sent to your contact.", status: "info", duration: 3000, isClosable: true });
    } catch {
      toast({ title: "Resend Failed", description: "Unable to resend OTP.", status: "error", duration: 3000, isClosable: true });
    } finally {
      setResending(false);
    }
  };

  return (
    <Box bg="#F8F7FF" minH="100vh" py={10} px={4}>
      <Box
        maxW="md"
        mx="auto"
        p={0}
        bg="white"
        border="1px solid #EFEAFD"
        rounded="2xl"
        shadow="md"
      >
        <Box px={8} py={6} bgGradient="linear(to-r, #7C3AED, #F43F5E)" color="white" roundedTop="2xl">
          <Heading size="md" textAlign="center">Verify OTP</Heading>
          <Text textAlign="center" opacity={0.9} mt={1}>
            OTP sent to <b>{contact}</b>
          </Text>
        </Box>

        <Box px={8} py={6}>
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
                  focusBorderColor="#7C3AED"
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

            <Divider />

            <Button
              onClick={handleVerify}
              bgGradient="linear(to-r, #7C3AED, #F43F5E)"
              color="white"
              _hover={{ opacity: 0.9 }}
              width="full"
              height="44px"
              rounded="xl"
              isDisabled={otp.length !== 6}
            >
              Verify
            </Button>

            <Button
              onClick={handleResend}
              isDisabled={countdown > 0}
              isLoading={resending}
              variant="link"
              color="#7C3AED"
              size="sm"
            >
              {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
            </Button>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}
