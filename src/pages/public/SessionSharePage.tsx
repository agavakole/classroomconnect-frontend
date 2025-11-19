// src/pages/public/SessionSharePage.tsx
import {
  Badge,
  Box,
  Icon,
  IconButton,
  Stack,
  Text,
  useToast,
  VStack,
  HStack,
  Button,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import QRCode from 'react-qr-code'
import { FiCopy, FiLink } from 'react-icons/fi'

export function SessionSharePage() {
  const [searchParams] = useSearchParams()
  const toast = useToast()

  const joinToken = searchParams.get('s') ?? searchParams.get('token') ?? ''
  const joinLink = useMemo(() => {
    if (!joinToken) return ''
    return `${window.location.origin}/session/run/${joinToken}`
  }, [joinToken])

  const copyValue = async (value: string, successTitle: string) => {
    if (!value) return
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      } else {
        const tempInput = document.createElement('input')
        tempInput.value = value
        document.body.appendChild(tempInput)
        tempInput.select()
        document.execCommand('copy')
        document.body.removeChild(tempInput)
      }
      toast({
        title: successTitle,
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: error instanceof Error ? error.message : 'Please copy manually',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleCopyToken = () => copyValue(joinToken, 'Join token copied')
  const handleCopyLink = () => copyValue(joinLink, 'Join link copied')

  if (!joinToken) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgGradient="linear(135deg, red.50 0%, orange.50 100%)"
        px={4}
      >
        <Stack
          spacing={6}
          p={10}
          borderRadius="3xl"
          border="2px solid"
          borderColor="red.200"
          bg="white"
          boxShadow="2xl"
          textAlign="center"
        >
          <Text fontSize="2xl" fontWeight="800" color="gray.900">
            Missing join token
          </Text>
          <Text fontSize="md" color="gray.600">
            Please open the share link provided by your teacher.
          </Text>
        </Stack>
      </Box>
    )
  }

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(135deg, brand.50 0%, accent.50 100%)"
      px={4}
      py={10}
    >
      <VStack
        spacing={8}
        p={10}
        bg="white"
        borderRadius="3xl"
        border="3px solid"
        borderColor="gray.100"
        boxShadow="2xl"
        maxW="sm"
        w="full"
      >
        <Box
          p={6}
          bg="white"
          borderRadius="2xl"
          border="4px solid"
          borderColor="brand.100"
          boxShadow="lg"
        >
          <QRCode value={joinLink} size={260} />
        </Box>

        <VStack spacing={4} w="full">
          <VStack spacing={2} w="full">
            <Text fontSize="sm" fontWeight="700" color="gray.500">
              Join Token
            </Text>
            <HStack spacing={3} justify="center">
              <Badge
                fontSize="2xl"
                px={6}
                py={3}
                borderRadius="xl"
                colorScheme="brand"
                fontWeight="800"
                fontFamily="mono"
                textTransform="none"
              >
                {joinToken}
              </Badge>
              <IconButton
                aria-label="Copy token"
                icon={<Icon as={FiCopy} />}
                colorScheme="brand"
                variant="ghost"
                onClick={handleCopyToken}
              />
            </HStack>
          </VStack>

          <Box
            w="full"
            p={4}
            borderRadius="xl"
            border="2px solid"
            borderColor="gray.100"
            bg="gray.50"
          >
            <VStack align="stretch" spacing={3}>
              <Text fontSize="sm" fontWeight="700" color="gray.600">
                Join Link
              </Text>
              <Button
                leftIcon={<Icon as={FiLink} />}
                variant="outline"
                colorScheme="brand"
                borderRadius="xl"
                fontWeight="600"
                onClick={handleCopyLink}
                isDisabled={!joinLink}
              >
                Copy Join Link
              </Button>
            </VStack>
          </Box>
        </VStack>
      </VStack>
    </Box>
  )
}
