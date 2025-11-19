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
  HStack,
  VStack,
  Icon,
  Divider,
} from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  FiUserPlus,
  FiKey,
  FiUser,
  FiArrowRight,
  FiCamera,
  FiAlertCircle,
  FiArrowLeft,
} from 'react-icons/fi'
import { getJoinSession } from '../../api/public'
import { ApiError } from '../../api/client'
import { useAuth } from '../../contexts/AuthContext'

export function GuestJoinPage() {
  const navigate = useNavigate()
  const { isStudent, isTeacher } = useAuth()
  const [token, setToken] = useState('')
  const [guestName, setGuestName] = useState('')

  // Redirect logged-in users
  useEffect(() => {
    if (isStudent) {
      navigate('/student?tab=join', { replace: true })
    } else if (isTeacher) {
      navigate('/teacher/courses', { replace: true })
    }
  }, [isStudent, isTeacher, navigate])

  const mutation = useMutation({
    mutationFn: (joinToken: string) => getJoinSession(joinToken),
    onSuccess: (_, joinToken) => {
      const trimmedName = guestName.trim()
      navigate(`/session/run/${joinToken}`, {
        state: {
          guestName: trimmedName,
          forceGuest: true,
        },
      })
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token.trim() || !guestName.trim()) return
    mutation.mutate(token.trim())
  }

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.isError
        ? 'Unable to find the session.'
        : null

  // Don't render anything while redirecting
  if (isStudent || isTeacher) {
    return null
  }

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(135deg, accent.50 0%, brand.50 100%)"
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
          color="accent.600"
          opacity={0.8}
        />
      </Box>

      {/* Back to Home button */}
      <Button
        as={RouterLink}
        to="/"
        leftIcon={<Icon as={FiArrowLeft} />}
        variant="ghost"
        colorScheme="accent"
        borderRadius="lg"
        position="absolute"
        top={{ base: '6', md: '10' }}
        left={{ base: '4', md: '10' }}
        fontWeight="medium"
      >
        Back to Home
      </Button>

      <Box maxW="2xl" w="full">
        <Stack spacing={8}>
          {/* Header */}
          <VStack spacing={3}>
       
            <VStack spacing={1}>
              <Heading size="xl" fontWeight="800" textAlign="center">
                Join as Guest
              </Heading>
              <Text color="gray.600" fontSize="lg" textAlign="center">
                Enter your session token to get started
              </Text>
            </VStack>
          </VStack>

          {/* Main Card */}
          <Card
            borderRadius="2xl"
            border="2px solid"
            borderColor="gray.100"
            boxShadow="2xl"
            bg="white"
          >
            <CardBody p={8}>
              <Box as="form" onSubmit={handleSubmit}>
                <Stack spacing={6}>
                  {/* Info Box */}
                  <Box
                    p={4}
                    bg="blue.50"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="blue.100"
                  >
                    <HStack spacing={3} align="start">
                      <Icon as={FiAlertCircle} color="blue.500" boxSize={5} mt={0.5} />
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="700" color="blue.900">
                          Quick Access
                        </Text>
                        <Text fontSize="sm" color="blue.800">
                          Get your join token from your teacher or scan the QR code
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  {/* Error Alert */}
                  {errorMessage && (
                    <Alert
                      status="error"
                      borderRadius="xl"
                      bg="red.50"
                      border="2px solid"
                      borderColor="red.200"
                    >
                      <AlertIcon color="red.500" />
                      <AlertDescription color="red.700" fontWeight="600">
                        {errorMessage}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Join Token Input */}
                  <FormControl isRequired>
                    <FormLabel fontWeight="700" fontSize="md" mb={3}>
                      <HStack spacing={2}>
                        <Icon as={FiKey} boxSize={5} color="accent.500" />
                        <Text>Session Token</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      value={token}
                      onChange={(event) => setToken(event.target.value)}
                      placeholder="e.g., ABC123"
                      size="lg"
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.200"
                      fontFamily="mono"
                      fontSize="lg"
                      fontWeight="700"
                      textAlign="center"
                      _hover={{ borderColor: 'accent.300' }}
                      _focus={{
                        borderColor: 'accent.400',
                        boxShadow: '0 0 0 1px var(--chakra-colors-accent-400)',
                      }}
                    />
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      Enter the code provided by your teacher
                    </Text>
                  </FormControl>

                  <Divider />

                  {/* Guest Name Input */}
                  <FormControl isRequired>
                    <FormLabel fontWeight="700" fontSize="md" mb={3}>
                      <HStack spacing={2}>
                        <Icon as={FiUser} boxSize={5} color="accent.500" />
                        <Text>Your Name</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      value={guestName}
                      onChange={(event) => setGuestName(event.target.value)}
                      placeholder="e.g., John Smith"
                      autoComplete="name"
                      size="lg"
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'accent.300' }}
                      _focus={{
                        borderColor: 'accent.400',
                        boxShadow: '0 0 0 1px var(--chakra-colors-accent-400)',
                      }}
                    />
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      Let your teacher know who you are
                    </Text>
                  </FormControl>

                  {/* Action Buttons */}
                  <Stack spacing={3} pt={2}>
                    <Button
                      type="submit"
                      rightIcon={<Icon as={FiArrowRight} />}
                      colorScheme="accent"
                      size="lg"
                      borderRadius="xl"
                      fontWeight="700"
                      isLoading={mutation.isPending}
                      loadingText="Joining Session..."
                      isDisabled={!token.trim() || !guestName.trim()}
                    >
                      Join Session
                    </Button>

                    <Button
                      leftIcon={<Icon as={FiCamera} />}
                      variant="outline"
                      size="lg"
                      borderRadius="xl"
                      fontWeight="600"
                      borderWidth="2px"
                      onClick={() => navigate('/scan')}
                      isDisabled={mutation.isPending}
                    >
                      Scan QR Code Instead
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </CardBody>
          </Card>

          {/* Help Text */}
          <Box
            p={6}
            bg="white"
            borderRadius="2xl"
            border="2px dashed"
            borderColor="gray.200"
            textAlign="center"
          >
            <VStack spacing={2}>
              <Text fontSize="sm" fontWeight="700" color="gray.700">
                Need help joining?
              </Text>
              <Text fontSize="sm" color="gray.600">
                Ask your teacher for the session token or QR code to scan
              </Text>
            </VStack>
          </Box>
        </Stack>
      </Box>

      {/* Animation */}
      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0) }
          50% { transform: translateY(-10px) }
        }
      `}</style>
    </Box>
  )
}
