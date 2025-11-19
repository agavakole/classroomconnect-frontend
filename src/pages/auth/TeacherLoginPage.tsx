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
import { teacherLogin } from "../../api/auth";
import { ApiError } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import { PiGraduationCapBold } from "react-icons/pi";
import { FiArrowLeft } from "react-icons/fi";

export function TeacherLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const mutation = useMutation({
  mutationFn: () => teacherLogin({ email, password }),
  onSuccess: (data) => {
    login(data.access_token, "teacher");
    // ✅ For now, use email as fallback name
    const nameFromEmail = email.split('@')[0];
    localStorage.setItem('teacher_name', nameFromEmail);
    navigate("/teacher/courses", { replace: true });
  },
});

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.isError
      ? "Unable to login. Please try again."
      : null;

  const cardBg = useColorModeValue("white", "gray.800");

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
          as={PiGraduationCapBold}
          boxSize={10}
          color="gray.600"
          opacity={0.8}
        />
      </Box>

      {/* ✅ Back to Home button */}
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

      {/* Login card */}
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
              Teacher Login
            </Heading>

            <Text textAlign="center" color="ink.600" fontSize="md">
              Access your teacher dashboard and manage your courses.
            </Text>

            {errorMessage && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <Box
              as="form"
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                mutation.mutate();
              }}
            >
              <Stack spacing={5}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="teacher@example.com"
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
                    autoComplete="current-password"
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
                  isDisabled={!email || !password}
                >
                  Log In
                </Button>
              </Stack>
            </Box>

            <Text textAlign="center" color="gray.600">
              Need an account?{" "}
              <Link
                as={RouterLink}
                to="/signup/teacher"
                color="mint.600"
                fontWeight="semibold"
                _hover={{ textDecoration: "underline" }}
              >
                Sign up
              </Link>
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
