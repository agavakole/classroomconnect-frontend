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
  useToast,
  Icon,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { teacherLogin, teacherSignup } from "../../api/auth";
import { ApiError } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import { PiGraduationCapBold } from "react-icons/pi";
import { FiArrowLeft } from "react-icons/fi";

export function TeacherSignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      await teacherSignup({ email, password, full_name: fullName });
      // Auto-login after signup
      const loginResponse = await teacherLogin({ email, password });
      return loginResponse;
    },
    onSuccess: (loginResponse) => {
      login(loginResponse.access_token, "teacher", loginResponse.teacher_full_name);
      toast({
        title: "Account created.",
        description: "You have successfully signed up and logged in.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/teacher/dashboard", { replace: true });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
      bgGradient="linear(135deg, mint.50 0%, blush.50 100%)"
      px={4}
      py={{ base: 10, md: 16 }}
      position="relative"
    >
      {/* Floating icon (match login) */}
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

      {/* Back to Home (match login) */}
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
              Create Teacher Account
            </Heading>

            <Text textAlign="center" color="ink.600" fontSize="md">
              Sign up to manage courses and activities.
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
                    placeholder="Jane Doe"
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
                to="/login/teacher"
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