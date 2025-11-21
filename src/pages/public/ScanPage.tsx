// src/pages/public/ScanPage.tsx
import { useEffect, useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Heading,
  Stack,
  Text,
  useBreakpointValue,
  VStack,
  Icon,
  HStack,
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Scanner } from '@yudiel/react-qr-scanner'
import type { IDetectedBarcode } from '@yudiel/react-qr-scanner'
import {
  FiCamera,
  FiSmartphone,
  FiKey,
  FiArrowLeft,
  FiAlertCircle,
  FiCheckCircle,
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
  const prefersMobileLayout = useBreakpointValue({ base: true, lg: false })
  const [scannedToken, setScannedToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isTouchDevice =
    typeof navigator !== 'undefined' &&
    (navigator.maxTouchPoints > 1 ||
      (typeof window !== 'undefined' && 'ontouchstart' in window))
  const isMobileExperience = Boolean(prefersMobileLayout || isTouchDevice)

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
          Back to Home
        </Button>

        <VStack spacing={8} maxW="lg" textAlign="center">
          {/* Icon */}
          <Box
            bgGradient="linear(135deg, purple.400, blue.500)"
            color="white"
            p={6}
            borderRadius="2xl"
            boxShadow="xl"
          >
            <Icon as={FiSmartphone} boxSize={16} />
          </Box>

          {/* Title */}
          <VStack spacing={3}>
            <Heading size="xl" fontWeight="800">
              Mobile Device Required
            </Heading>
            <Text color="gray.600" fontSize="lg">
              QR code scanning needs a mobile device camera
            </Text>
          </VStack>

          {/* Info Card */}
          <Box
            bg="white"
            p={6}
            borderRadius="2xl"
            border="2px solid"
            borderColor="gray.100"
            boxShadow="xl"
            w="full"
          >
            <VStack spacing={4} align="stretch">
              <HStack spacing={3}>
                <Icon as={FiAlertCircle} color="purple.500" boxSize={6} />
                <Text fontSize="md" fontWeight="700" color="gray.800">
                  How to Join
                </Text>
              </HStack>
              <Stack spacing={5} pl={9}>
                <Text fontSize="sm" color="gray.600">
                  • Open this page on your phone or tablet(so we can use the camera)
                </Text>
                <Text fontSize="sm" color="gray.600">
                  • Scan the QR code from your teacher      
                </Text>
                <Text fontSize="sm" color="gray.600">
                  • Or enter the token manually below
                </Text>
              </Stack>
            </VStack>
          </Box>

          {/* Action Button */}
          <Button
            leftIcon={<Icon as={FiKey} />}
            onClick={() => navigate('/guest/join')}
            colorScheme="purple"
            size="lg"
            borderRadius="xl"
            fontWeight="700"
            w="full"
          >
            Enter Token Manually
          </Button>
        </VStack>

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
      bgGradient="linear(135deg, purple.50 0%, blue.50 100%)"
      px={4}
      py={8}
      position="relative"
    >
      {/* Back Button */}
      <Button
        as={RouterLink}
        to="/"
        leftIcon={<Icon as={FiArrowLeft} />}
        variant="ghost"
        colorScheme="purple"
        borderRadius="lg"
        position="absolute"
        top="4"
        left="4"
        fontWeight="medium"
        zIndex={10}
      >
        Back
      </Button>

      <VStack spacing={6} pt={16}>
        {/* Header */}
        <VStack spacing={3}>
          <Box
            bgGradient="linear(135deg, purple.400, blue.500)"
            color="white"
            p={4}
            borderRadius="2xl"
            boxShadow="lg"
          >
            <Icon as={FiCamera} boxSize={10} />
          </Box>
          <VStack spacing={1}>
            <Heading size="lg" fontWeight="800" textAlign="center">
              Scan QR Code
            </Heading>
            <Text color="gray.600" textAlign="center" fontSize="md">
              Point your camera at the QR code from your teacher
            </Text>
          </VStack>
        </VStack>

        {/* Scanner Box */}
        <Box
          width="100%"
          maxW="400px"
          borderRadius="2xl"
          overflow="hidden"
          border="4px solid"
          borderColor="white"
          boxShadow="2xl"
          position="relative"
        >
          {/* Corner decorations */}
          <Box
            position="absolute"
            top="20px"
            left="20px"
            w="40px"
            h="40px"
            borderTop="4px solid"
            borderLeft="4px solid"
            borderColor="purple.500"
            borderRadius="8px"
            zIndex={2}
          />
          <Box
            position="absolute"
            top="20px"
            right="20px"
            w="40px"
            h="40px"
            borderTop="4px solid"
            borderRight="4px solid"
            borderColor="purple.500"
            borderRadius="8px"
            zIndex={2}
          />
          <Box
            position="absolute"
            bottom="20px"
            left="20px"
            w="40px"
            h="40px"
            borderBottom="4px solid"
            borderLeft="4px solid"
            borderColor="purple.500"
            borderRadius="8px"
            zIndex={2}
          />
          <Box
            position="absolute"
            bottom="20px"
            right="20px"
            w="40px"
            h="40px"
            borderBottom="4px solid"
            borderRight="4px solid"
            borderColor="purple.500"
            borderRadius="8px"
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

        {/* Instructions */}
        <Box
          bg="white"
          p={4}
          borderRadius="xl"
          border="2px solid"
          borderColor="gray.100"
          maxW="400px"
          w="full"
        >
          <HStack spacing={3} align="start">
            <Icon as={FiCheckCircle} color="green.500" boxSize={5} mt={0.5} />
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" fontWeight="700" color="gray.800">
                Scanning Active
              </Text>
              <Text fontSize="sm" color="gray.600">
                Hold your device steady and center the QR code
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            status="error"
            borderRadius="xl"
            bg="red.50"
            border="2px solid"
            borderColor="red.200"
            maxW="400px"
          >
            <AlertIcon color="red.500" />
            <AlertDescription color="red.700" fontWeight="600" fontSize="sm">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Manual Entry Button */}
        <Button
          leftIcon={<Icon as={FiKey} />}
          variant="outline"
          onClick={() => navigate('/guest/join')}
          size="lg"
          borderRadius="xl"
          fontWeight="600"
          borderWidth="2px"
          maxW="400px"
          w="full"
          bg="white"
        >
          Enter Token Manually
        </Button>

        {/* Help Text */}
        <Box
          p={4}
          bg="white"
          borderRadius="xl"
          border="2px dashed"
          borderColor="gray.200"
          textAlign="center"
          maxW="400px"
          w="full"
        >
          <Text fontSize="sm" color="gray.600">
            💡 Ask your teacher if you need help finding the QR code
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}
