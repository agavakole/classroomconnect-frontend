// src/pages/public/ScanPage.tsx
import { useEffect, useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Stack,
  Text,
  useBreakpointValue,
  VStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Scanner } from '@yudiel/react-qr-scanner'
import type { IDetectedBarcode } from '@yudiel/react-qr-scanner'
import {
  FiCamera,
  FiSmartphone,
  FiKey,
  FiArrowLeft,
} from 'react-icons/fi'

function extractJoinToken(rawValue: string) {
  try {
    const maybeUrl = new URL(rawValue)
    const pathMatch = maybeUrl.pathname.match(/session\/run\/([^/]+)/)
    if (pathMatch?.[1]) {
      return pathMatch[1]
    }
    const tokenParam =
      maybeUrl.searchParams.get('token') || maybeUrl.searchParams.get('join_token')
    if (tokenParam) {
      return tokenParam
    }
  } catch {
    // not a URL, fall through to treat as plain token
  }
  const plainTokenMatch = rawValue.match(/[A-Za-z0-9_-]{6,}/)
  return plainTokenMatch ? plainTokenMatch[0] : null
}

export function ScanPage() {
  const navigate = useNavigate()
  const isMobileExperience = useBreakpointValue({ base: true, md: false })
  const [scannedToken, setScannedToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const cardBg = useColorModeValue('white', 'gray.800')

  useEffect(() => {
    if (scannedToken) {
      navigate(`/session/run/${scannedToken}`)
    }
  }, [navigate, scannedToken])

  // Desktop view - No camera available
  if (!isMobileExperience) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgGradient="linear(135deg, purple.50 0%, blue.50 100%)"
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
          <Icon as={FiSmartphone} boxSize={10} color="purple.600" opacity={0.8} />
        </Box>

        {/* Back to Home button */}
        <Button
          as={RouterLink}
          to="/"
          leftIcon={<Icon as={FiArrowLeft} />}
          variant="ghost"
          colorScheme="purple"
          borderRadius="lg"
          position="absolute"
          top={{ base: '6', md: '10' }}
          left={{ base: '4', md: '10' }}
          fontWeight="medium"
        >
          Back to Home
        </Button>

        {/* Card */}
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
                Mobile Device Required
              </Heading>

              <Text textAlign="center" color="ink.600" fontSize="md">
                QR code scanning requires a mobile device with a camera.
              </Text>

              <Stack spacing={4}>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Open this page on your phone to scan, or enter your token manually.
                </Text>

                <Button
                  leftIcon={<Icon as={FiKey} />}
                  onClick={() => navigate('/guest/join')}
                  colorScheme="purple"
                  size="lg"
                  borderRadius="lg"
                >
                  Enter Token Manually
                </Button>
              </Stack>

              <Text textAlign="center" color="gray.600" fontSize="sm">
                Ask your teacher for the session token or QR code.
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

  // Mobile view - Camera scanner
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(135deg, purple.50 0%, blue.50 100%)"
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
        <Icon as={FiCamera} boxSize={10} color="purple.600" opacity={0.8} />
      </Box>

      {/* Back to Home button */}
      <Button
        as={RouterLink}
        to="/"
        leftIcon={<Icon as={FiArrowLeft} />}
        variant="ghost"
        colorScheme="purple"
        borderRadius="lg"
        position="absolute"
        top={{ base: '6', md: '10' }}
        left={{ base: '4', md: '10' }}
        fontWeight="medium"
      >
        Back
      </Button>

      {/* Card */}
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
              Scan QR Code
            </Heading>

            <Text textAlign="center" color="ink.600" fontSize="md">
              Point your camera at the QR code from your teacher.
            </Text>

            {/* Error Alert */}
            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Scanner Box */}
            <Box
              width="100%"
              borderRadius="xl"
              overflow="hidden"
              border="2px solid"
              borderColor="gray.200"
              position="relative"
            >
              {/* Corner decorations */}
              <Box
                position="absolute"
                top="12px"
                left="12px"
                w="30px"
                h="30px"
                borderTop="3px solid"
                borderLeft="3px solid"
                borderColor="purple.500"
                borderRadius="6px"
                zIndex={2}
              />
              <Box
                position="absolute"
                top="12px"
                right="12px"
                w="30px"
                h="30px"
                borderTop="3px solid"
                borderRight="3px solid"
                borderColor="purple.500"
                borderRadius="6px"
                zIndex={2}
              />
              <Box
                position="absolute"
                bottom="12px"
                left="12px"
                w="30px"
                h="30px"
                borderBottom="3px solid"
                borderLeft="3px solid"
                borderColor="purple.500"
                borderRadius="6px"
                zIndex={2}
              />
              <Box
                position="absolute"
                bottom="12px"
                right="12px"
                w="30px"
                h="30px"
                borderBottom="3px solid"
                borderRight="3px solid"
                borderColor="purple.500"
                borderRadius="6px"
                zIndex={2}
              />

              {/* Scanner */}
              <Scanner
                styles={{ container: { padding: 0 } }}
                onScan={(detected: IDetectedBarcode[]) => {
                  const firstValue = detected[0]?.rawValue
                  if (!firstValue) return
                  const token = extractJoinToken(firstValue)
                  if (token) {
                    setError(null)
                    setScannedToken(token)
                  } else {
                    setError('Unable to read join token from QR code.')
                  }
                }}
                onError={(scanError) => {
                  if (scanError instanceof Error) {
                    setError(scanError.message)
                  } else {
                    setError('Camera error')
                  }
                }}
              />
            </Box>

            <Stack spacing={4}>
              <Button
                leftIcon={<Icon as={FiKey} />}
                variant="outline"
                onClick={() => navigate('/guest/join')}
                size="lg"
                borderRadius="lg"
              >
                Enter Token Manually
              </Button>
            </Stack>

            <Text textAlign="center" color="gray.600" fontSize="sm">
              Hold your device steady and center the QR code in the frame.
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