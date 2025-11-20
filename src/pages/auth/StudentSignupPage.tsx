// src/pages/auth/StudentSignupPage.tsx
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
  Link,
  Stack,
  Text,
  VStack,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { studentLogin, studentSignup } from "../../api/auth";
import { ApiError } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import { FiArrowLeft } from "react-icons/fi";
import { PiGraduationCapBold } from "react-icons/pi";

export function StudentSignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      await studentSignup({ email, password, full_name: fullName });
      // Auto-login after signup
      const loginResponse = await studentLogin({ email, password });
      login(loginResponse.access_token, 'student', loginResponse.student_full_name);
      navigate("/student", { replace: true });
      return loginResponse; // Optionally return if needed elsewhere, but not strictly for this flow
    },
    // onSuccess is no longer needed for login/navigation as it's handled in mutationFn
    // onSuccess: (tokenResponse) => {
    //   login(tokenResponse.access_token, "student", fullName);
    //   navigate("/student", { replace: true });
    // },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate();
  };

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.isError
      ? "Unable to sign up. Please try again."
      : null;

  const cardBg = useColorModeValue("white", "gray.800");

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(135deg, blush.50 0%, mint.50 100%)"
      px={4}
      py={{ base: 10, md: 16 }}
      position="relative"
    >
      {/* Floating student icon */}
      <Box
        position="absolute"
        top="8"
        right="8"
        animation="float 6s infinite ease-in-out"
      >
        <Icon
          as={PiGraduationCapBold}
          boxSize={10}
          color="mint.600"
          opacity={0.8}
        />
      </Box>

      {/* Back to Home */}
      <Button
        as={RouterLink}
        to="/"
        leftIcon={<FiArrowLeft />}
        variant="ghost"
        colorScheme="mint"
        borderRadius="lg"
        position="absolute"
        top={{ base: "6", md: "10" }}
        left={{ base: "4", md: "10" }}
        fontWeight="medium"
      >
        Back to Home
      </Button>

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
            <Heading
              textAlign="center"
              size="lg"
              color="ink.800"
              fontWeight="extrabold"
            >
              Create Student Account
            </Heading>

            <Text textAlign="center" color="ink.600" fontSize="md">
              Sign up to join activities and track your progress.
            </Text>

            {errorMessage && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <Box as="form" onSubmit={handleSubmit}>
              <Stack spacing={5}>
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Kim"
                    borderRadius="lg"
                    borderColor="gray.200"
                    focusBorderColor="mint.500"
                    _placeholder={{ color: "gray.400" }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="student@example.com"
                    borderRadius="lg"
                    borderColor="gray.200"
                    focusBorderColor="mint.500"
                    _placeholder={{ color: "gray.400" }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    borderRadius="lg"
                    borderColor="gray.200"
                    focusBorderColor="mint.500"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  borderRadius="lg"
                  isLoading={mutation.isPending}
                  isDisabled={!email || !password || !fullName}
                >
                  Sign up
                </Button>
              </Stack>
            </Box>

            <Text textAlign="center" color="gray.600">
              Already have an account?{" "}
              <Link
                as={RouterLink}
                to="/login/student"
                color="mint.600"
                fontWeight="semibold"
                _hover={{ textDecoration: "underline" }}
              >
                Log in
              </Link>
            </Text>
          </VStack>
        </CardBody>
      </Card>

      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0) }
          50% { transform: translateY(-10px) }
        }
      `}</style>
    </Box>
  );
}
