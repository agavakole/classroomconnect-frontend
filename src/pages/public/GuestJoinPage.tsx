// src/pages/public/GuestJoinPage.tsx
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  VStack,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  FiUserPlus,
  FiKey,
  FiUser,
  FiArrowRight,
  FiCamera,
  FiArrowLeft,
} from "react-icons/fi";
import { getJoinSession } from "../../api/public";
import { ApiError } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";

export function GuestJoinPage() {
  const navigate = useNavigate();
  const { isStudent, isTeacher } = useAuth();
  const [token, setToken] = useState("");
  const [guestName, setGuestName] = useState("");

  const cardBg = useColorModeValue("white", "gray.800");

  // Redirect logged-in users
  useEffect(() => {
    if (isStudent) {
      navigate("/student?tab=join", { replace: true });
    } else if (isTeacher) {
      navigate("/teacher/courses", { replace: true });
    }
  }, [isStudent, isTeacher, navigate]);

  const mutation = useMutation({
    mutationFn: (joinToken: string) => getJoinSession(joinToken),
    onSuccess: (_, joinToken) => {
      const trimmedName = guestName.trim();
      navigate(`/session/run/${joinToken}`, {
        state: {
          guestName: trimmedName,
          forceGuest: true,
        },
      });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token.trim() || !guestName.trim()) return;
    mutation.mutate(token.trim());
  };

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.isError
      ? "Unable to find the session."
      : null;

  // Don't render anything while redirecting
  if (isStudent || isTeacher) {
    return null;
  }

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(135deg, mint.50 0%, blush.50 100%)"
      px={4}
      py={{ base: 10, md: 16 }}
      position="relative"
    >
      {/* Floating icon */}
      <Box
        position="absolute"
        top="8"
        right="8"
        animation="float 6s infinite ease-in-out"
      >
        <Icon
          as={FiUserPlus}
          boxSize={10}
          color="gray.600"
          opacity={0.8}
        />
      </Box>

      {/* Back to Home button */}
      <Button
        as={RouterLink}
        to="/"
        leftIcon={<FiArrowLeft />}
        variant="ghost"
        colorScheme="gray"
        borderRadius="lg"
        position="absolute"
        top={{ base: "6", md: "10" }}
        left={{ base: "4", md: "10" }}
        fontWeight="medium"
      >
        Back to Home
      </Button>

      {/* Main card – matches TeacherLoginPage sizing */}
      <Card
        bg={cardBg}
        boxShadow="2xl"
        borderRadius="2xl"
        maxW="md"
        w="full"
        p={{ base: 6, md: 8 }}
      >
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <VStack spacing={2}>
              <Heading
                textAlign="center"
                size="lg"
                color="ink.800"
                fontWeight="extrabold"
              >
                Join as Guest
              </Heading>
              <Text textAlign="center" color="ink.600" fontSize="md">
                Enter your session details to join your class.
              </Text>
            </VStack>

            {/* Error */}
            {errorMessage && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {/* Form */}
            <Box as="form" onSubmit={handleSubmit}>
              <Stack spacing={5}>
                <FormControl isRequired>
                  <FormLabel fontWeight="600">
                    Session Token
                  </FormLabel>
                  <Input
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    placeholder="e.g., ABC123"
                    size="lg"
                    borderRadius="lg"
                    borderColor="gray.200"
                    focusBorderColor="mint.500"
                    textTransform="uppercase"
                    fontFamily="mono"
                    fontWeight="700"
                    textAlign="center"
                  />
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    Use the code your teacher shared with you.
                  </Text>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="600">
                    Your Name
                  </FormLabel>
                  <Input
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    placeholder="e.g., John Smith"
                    autoComplete="name"
                    size="lg"
                    borderRadius="lg"
                    borderColor="gray.200"
                    focusBorderColor="mint.500"
                  />
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    This is how your name will appear to the teacher.
                  </Text>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  borderRadius="lg"
                  fontWeight="700"
                  rightIcon={<FiArrowRight />}
                  isLoading={mutation.isPending}
                  loadingText="Joining session..."
                  isDisabled={!token.trim() || !guestName.trim()}
                >
                  Join Session
                </Button>

                <Button
                  leftIcon={<FiCamera />}
                  variant="outline"
                  size="lg"
                  borderRadius="lg"
                  fontWeight="600"
                  borderWidth="2px"
                  onClick={() => navigate("/scan")}
                  isDisabled={mutation.isPending}
                >
                  Scan QR Code Instead
                </Button>
              </Stack>
            </Box>

            <Text textAlign="center" fontSize="sm" color="gray.600">
              Don&apos;t see a code? Ask your teacher for the session token or QR code.
            </Text>
          </VStack>
        </CardBody>
      </Card>

      {/* Animation */}
      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0) }
          50% { transform: translateY(-10px) }
        }
      `}</style>
    </Box>
  );
}
