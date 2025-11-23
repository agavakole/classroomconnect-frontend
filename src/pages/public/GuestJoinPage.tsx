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
  useColorModeValue,
  Icon,
} from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { FiUserPlus, FiArrowLeft, FiCamera } from 'react-icons/fi'
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

  const cardBg = useColorModeValue('white', 'gray.800')

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

      {/* Join card */}
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
              Join as Guest
            </Heading>

            <Text textAlign="center" color="ink.600" fontSize="md">
              Enter your session token and name to get started.
            </Text>

            {errorMessage && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <Box
              as="form"
              onSubmit={handleSubmit}
            >
              <Stack spacing={5}>
                <FormControl isRequired>
                  <FormLabel>Session Token</FormLabel>
                  <Input
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    placeholder="e.g., ABC123"
                    borderRadius="lg"
                    borderColor="gray.200"
                    focusBorderColor="accent.500"
                    fontFamily="mono"
                    fontWeight="600"
                    textAlign="center"
                    _placeholder={{ color: 'gray.400' }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Your Name</FormLabel>
                  <Input
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    placeholder="e.g., John Smith"
                    autoComplete="name"
                    borderRadius="lg"
                    borderColor="gray.200"
                    focusBorderColor="accent.500"
                    _placeholder={{ color: 'gray.400' }}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="accent"
                  size="lg"
                  borderRadius="lg"
                  isLoading={mutation.isPending}
                  loadingText="Joining..."
                  isDisabled={!token.trim() || !guestName.trim()}
                >
                  Join Session
                </Button>

                <Button
                  leftIcon={<Icon as={FiCamera} />}
                  variant="outline"
                  size="lg"
                  borderRadius="lg"
                  onClick={() => navigate('/scan')}
                  isDisabled={mutation.isPending}
                >
                  Scan QR Code
                </Button>
              </Stack>
            </Box>

            <Text textAlign="center" color="gray.600" fontSize="sm">
              Get your token from your teacher or scan the QR code to join.
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
  )
}