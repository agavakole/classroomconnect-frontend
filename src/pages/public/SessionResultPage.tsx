import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Stack,
  Text,
  Icon,
  VStack,
  HStack,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react'
import { useLocation, useNavigate, useParams, Navigate } from 'react-router-dom'
import type { PublicJoinSubmitResponse } from '../../api/types'
import { FiCheckCircle, FiRefreshCw, FiHome, FiArrowLeft, FiUser, FiLogOut } from 'react-icons/fi'
import { ActivityContentDisplay } from '../../components/activity/ActivityContentDisplay'
import { useAuth } from '../../contexts/AuthContext'

type ResultPageState = {
  submission: PublicJoinSubmitResponse
  courseTitle: string
  guest?: {
    guestId?: string | null
    guestName?: string
    forceGuest?: boolean
  }
}

export function SessionResultPage() {
  const { token: joinToken } = useParams<{ token: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const auth = useAuth()
  const state = (location.state as ResultPageState | null) ?? null

  if (!state?.submission || !joinToken) {
    return <Navigate to={joinToken ? `/session/run/${joinToken}` : '/scan'} replace />
  }

  const { submission, courseTitle, guest } = state
  const activity = submission.recommended_activity.activity

  const handleRetake = () => {
    navigate(`/session/run/${joinToken}`, {
      state: guest
        ? {
            guestName: guest.guestName,
            guestId: guest.guestId,
            forceGuest: guest.forceGuest ?? true,
          }
        : undefined,
    })
  }

  const handleBack = () => {
    navigate(-1)
  }

  // Simple emoji mapping
  const moodEmojis: Record<string, string> = {
    'Happy': '😊',
    'Excited': '🤩',
    'Sad': '😢',
    'Tired': '😴',
    'Confused': '😕',
    'Angry': '😠',
    'Calm': '😌',
    'Energetic': '⚡',
    'Nervous': '😰',
    'Good': '👍',
    'Great': '🌟',
    'Okay': '👌',
    'Not Great': '😐',
  }

  const moodEmoji = moodEmojis[submission.mood] || '😊'

  return (
    <Box 
      minH="100vh" 
      bgGradient="linear(135deg, mint.50 0%, blush.50 100%)" 
      py={{ base: 4, md: 12 }} 
      px={{ base: 4, md: 6 }}
      position="relative"
    >
      {/* Header with Back and Logout */}
      <Box 
        maxW="4xl" 
        mx="auto" 
        mb={{ base: 4, md: 6 }}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        {/* Back button */}
        <Button
          onClick={handleBack}
          leftIcon={<Icon as={FiArrowLeft} />}
          variant="ghost"
          colorScheme="mint"
          borderRadius="lg"
          fontWeight="medium"
          size={{ base: "sm", md: "md" }}
          _hover={{ bg: 'whiteAlpha.800' }}
        >
          Back
        </Button>

        {/* User menu */}
        {auth.token && (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<Icon as={FiUser} boxSize={{ base: 4, md: 5 }} />}
              variant="ghost"
              colorScheme="mint"
              borderRadius="lg"
              size={{ base: "sm", md: "md" }}
              _hover={{ bg: 'whiteAlpha.800' }}
            />
            <MenuList>
              <MenuItem 
                icon={<Icon as={FiLogOut} />} 
                onClick={() => {
                  auth.logout()
                  navigate('/')
                }}
              >
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </Box>

      <Box maxW="4xl" mx="auto">
        <Stack spacing={6}>
          
          {/* Success Header */}
          <Card borderRadius="2xl" boxShadow="lg" bg="white" border="1px solid" borderColor="gray.100">
            <CardBody p={8}>
              <VStack spacing={5}>
                <Box
                  w="64px"
                  h="64px"
                  bg="green.50"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="md"
                >
                  <Icon as={FiCheckCircle} boxSize={8} color="green.500" />
                </Box>
                <VStack spacing={2}>
                  <Heading size="lg" fontWeight="800" color="gray.900">
                    Check-in Complete!
                  </Heading>
                  <Text color="gray.600" fontSize="md" fontWeight="500">
                    {courseTitle}
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Recommended Activity */}
          <Card borderRadius="2xl" boxShadow="lg" bg="white" border="1px solid" borderColor="gray.100">
            <CardBody p={{ base: 6, md: 8 }}>
              <VStack spacing={6} align="stretch">
                <VStack spacing={3} align="flex-start">
                  <Box 
                    px={3} 
                    py={1} 
                    bg="brand.50" 
                    borderRadius="full"
                  >
                    <Text fontSize="xs" fontWeight="700" color="brand.600" textTransform="uppercase">
                      Recommended for You
                    </Text>
                  </Box>
                  <Heading size="lg" fontWeight="800" color="gray.900">
                    {activity.name}
                  </Heading>
                  <Text color="gray.600" fontSize="md">
                    {activity.summary}
                  </Text>
                  <Badge colorScheme="brand" fontSize="xs" px={3} py={1} borderRadius="full">
                    {activity.type}
                  </Badge>
                </VStack>

                <Divider />

                <Box>
                  <ActivityContentDisplay
                    activity={{
                      name: activity.name,
                      summary: activity.summary,
                      type: activity.type,
                      content_json: activity.content_json,
                    }}
                    showHeader={false}
                    showTags={false}
                  />
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Your Response */}
          <Card borderRadius="2xl" boxShadow="lg" bg="white" border="1px solid" borderColor="gray.100">
            <CardBody p={{ base: 6, md: 8 }}>
              <VStack spacing={5} align="stretch">
                <Heading size="md" fontWeight="800" color="gray.900">
                  Your Response
                </Heading>

                <HStack spacing={4} p={5} bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.100">
                  <Text fontSize="2xl">{moodEmoji}</Text>
                  <VStack align="flex-start" spacing={0} flex="1">
                    <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                      Mood
                    </Text>
                    <Text fontSize="md" fontWeight="700" color="gray.800">
                      {submission.mood}
                    </Text>
                  </VStack>
                </HStack>

                {submission.learning_style && (
                  <HStack spacing={4} p={5} bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.100">
                    <Box
                      w="40px"
                      h="40px"
                      bg="brand.100"
                      borderRadius="xl"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Text fontSize="lg">✨</Text>
                    </Box>
                    <VStack align="flex-start" spacing={0} flex="1">
                      <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase">
                        Learning Style
                      </Text>
                      <Text fontSize="md" fontWeight="700" color="gray.800">
                        {submission.learning_style}
                      </Text>
                    </VStack>
                  </HStack>
                )}

                {submission.is_baseline_update && (
                  <Alert status="success" borderRadius="xl" bg="green.50" border="1px" borderColor="green.200" boxShadow="sm">
                    <AlertIcon color="green.600" />
                    <AlertDescription fontSize="sm" color="green.800" fontWeight="500">
                      Your learning profile has been updated
                    </AlertDescription>
                  </Alert>
                )}

                {submission.message && (
                  <Alert status="info" borderRadius="xl" boxShadow="sm">
                    <AlertIcon />
                    <AlertDescription fontSize="sm" fontWeight="500">
                      {submission.message}
                    </AlertDescription>
                  </Alert>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Action Buttons */}
          <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
            <Button
              leftIcon={<Icon as={FiRefreshCw} />}
              size="lg"
              h="56px"
              colorScheme="brand"
              onClick={handleRetake}
              fontWeight="700"
              fontSize="md"
              flex="1"
              borderRadius="xl"
              boxShadow="md"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'xl',
              }}
              _active={{
                transform: 'translateY(0)',
              }}
              transition="all 0.2s"
            >
              Retake Check-in
            </Button>
            <Button
              leftIcon={<Icon as={FiHome} />}
              size="lg"
              h="56px"
              variant="outline"
              onClick={() => navigate('/')}
              fontWeight="700"
              fontSize="md"
              flex="1"
              borderRadius="xl"
              borderWidth="2px"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'md',
              }}
              _active={{
                transform: 'translateY(0)',
              }}
              transition="all 0.2s"
            >
              Done
            </Button>
          </Stack>

        </Stack>
      </Box>
    </Box>
  )
}