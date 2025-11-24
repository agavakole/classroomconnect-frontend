import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Input,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
  HStack,
  Icon,
  Progress,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiChevronLeft, FiUser, FiLogOut } from 'react-icons/fi'
import { getJoinSession, submitJoinSession, getJoinSubmissionStatus } from '../../api/public'
import { ApiError } from '../../api/client'
import type { PublicJoinResponse } from '../../api/types'
import { useAuth } from '../../contexts/AuthContext'

type GuestJoinState = {
  guestName?: string
  guestId?: string | null
  forceGuest?: boolean
}

export function SessionRunPage() {
  const { token: joinToken } = useParams<{ token: string }>()
  const location = useLocation()
  const guestJoinState = (location.state as GuestJoinState | null) ?? null
  const auth = useAuth()
  const { token: authToken } = auth
  const navigate = useNavigate()
  const guestStorageKey = joinToken ? `session_guest_${joinToken}` : null
  const storedGuest = useMemo(() => {
    if (!guestStorageKey || typeof window === 'undefined') return null
    try {
      const raw = sessionStorage.getItem(guestStorageKey)
      return raw ? (JSON.parse(raw) as GuestJoinState) : null
    } catch {
      return null
    }
  }, [guestStorageKey])
  const [mood, setMood] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [studentName, setStudentName] = useState(
    () => guestJoinState?.guestName ?? storedGuest?.guestName ?? '',
  )
  const [guestId, setGuestId] = useState<string | null>(
    () => guestJoinState?.guestId ?? storedGuest?.guestId ?? null,
  )

  const sessionQuery = useQuery({
    queryKey: ['publicJoin', joinToken],
    queryFn: () => getJoinSession(joinToken ?? ''),
    enabled: Boolean(joinToken),
    retry: false,
  })

  // Check if user already submitted
  const submissionStatusQuery = useQuery({
    queryKey: ['submissionStatus', joinToken, guestId],
    queryFn: () => getJoinSubmissionStatus(joinToken ?? '', guestId),
    enabled: Boolean(joinToken) && Boolean(sessionQuery.data),
    retry: false,
  })

  // Redirect to result page if already submitted
  useEffect(() => {
    if (submissionStatusQuery.data?.submitted) {
      navigate(`/session/run/${joinToken}/already-submitted`, { replace: true })
    }
  }, [submissionStatusQuery.data, navigate, joinToken])

  const mutation = useMutation({
    mutationFn: () => {
      if (!joinToken) {
        throw new Error('Missing join token')
      }
      const payload: Parameters<typeof submitJoinSession>[1] = {
        mood,
      }
      if (Object.keys(answers).length > 0) {
        payload.answers = answers
      }
      const trimmedName = studentName.trim()
      if (!authToken || guestJoinState?.forceGuest) {
        payload.is_guest = true
        payload.student_name = trimmedName
        payload.guest_id = guestId
      } else {
        payload.is_guest = false
      }
      return submitJoinSession(joinToken, payload)
    },
    onSuccess: (data) => {
      if (data.guest_id) {
        setGuestId(data.guest_id)
        if (guestStorageKey && typeof window !== 'undefined') {
          sessionStorage.setItem(
            guestStorageKey,
            JSON.stringify({ guestId: data.guest_id, guestName: studentName.trim() }),
          )
        }
      }
      navigate(`/session/run/${joinToken}/result`, {
        replace: true,
        state: {
          submission: data,
          courseTitle: sessionQuery.data?.course_title ?? '',
          guest:
            data.guest_id && studentName.trim()
              ? { guestId: data.guest_id, guestName: studentName.trim(), forceGuest: true }
              : data.guest_id
                ? { guestId: data.guest_id, forceGuest: true }
                : undefined,
        },
      })
    },
  })

  const sessionData: PublicJoinResponse | undefined = sessionQuery.data
  const showSurvey = Boolean(sessionData?.survey)
  const requireGuestIdentity = !authToken || Boolean(guestJoinState?.forceGuest)

  const initialName = guestJoinState?.guestName ?? storedGuest?.guestName ?? ''
  const needsNameInput = requireGuestIdentity && !initialName
  
  const [currentStep, setCurrentStep] = useState(0)
  
  const surveyStepCount = showSurvey ? (sessionData?.survey?.questions?.length ?? 0) : 0
  const totalSteps = (needsNameInput ? 1 : 0) + surveyStepCount + 1
  
  const isNameStep = needsNameInput && currentStep === 0
  const surveyQuestionIndex = needsNameInput ? currentStep - 1 : currentStep
  const isSurveyStep = showSurvey && surveyQuestionIndex >= 0 && surveyQuestionIndex < surveyStepCount
  const currentQuestion = isSurveyStep ? sessionData?.survey?.questions[surveyQuestionIndex] : null
  const isMoodStep = currentStep === totalSteps - 1

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }))
    setTimeout(() => {
      handleNext()
    }, 300)
  }

  const handleSubmit = () => {
    if (!sessionData) return
    mutation.mutate()
  }

  const handleBack = () => {
    navigate(-1)
  }

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.isError
        ? 'Unable to submit your response.'
        : null

  if (sessionQuery.isLoading || submissionStatusQuery.isLoading) {
    return (
      <Box minH="100vh" bgGradient="linear(135deg, mint.50 0%, blush.50 100%)" display="flex" alignItems="center" justifyContent="center" p={4}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Text fontWeight="600" fontSize="lg" color="gray.700">Loading session...</Text>
        </VStack>
      </Box>
    )
  }

  if (sessionQuery.isError || !sessionData) {
    const message =
      sessionQuery.error instanceof ApiError
        ? sessionQuery.error.message
        : 'We could not find this session or it is no longer available.'
    return (
      <Box minH="100vh" bgGradient="linear(135deg, mint.50 0%, blush.50 100%)" display="flex" alignItems="center" justifyContent="center" p={4}>
        <Card maxW="md" borderRadius="2xl" boxShadow="lg">
          <CardBody p={8}>
            <VStack spacing={4}>
              <Text fontSize="4xl">😕</Text>
              <Heading size="md" color="gray.800" textAlign="center">
                Session Not Found
              </Heading>
              <Text color="gray.600" textAlign="center" fontSize="sm">
                {message}
              </Text>
              <Button
                colorScheme="brand"
                size="md"
                onClick={() => navigate('/dashboard')}
                mt={2}
              >
                Back to Dashboard
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    )
  }

  if (sessionData.status !== 'OPEN') {
    return (
      <Box minH="100vh" bgGradient="linear(135deg, mint.50 0%, blush.50 100%)" display="flex" alignItems="center" justifyContent="center" p={4}>
        <Card maxW="md" borderRadius="2xl" boxShadow="lg">
          <CardBody p={8}>
            <VStack spacing={4}>
              <Text fontSize="4xl">🔒</Text>
              <Heading size="md" color="gray.800" textAlign="center">
                Session Closed
              </Heading>
              <Text color="gray.600" textAlign="center" fontSize="sm">
                This session is no longer accepting responses.
              </Text>
              <Button
                colorScheme="brand"
                size="md"
                onClick={() => navigate('/dashboard')}
                mt={2}
              >
                Back to Dashboard
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    )
  }

  const progress = ((currentStep + 1) / totalSteps) * 100
  const displayName = studentName || auth.fullName || 'Student'

  // Mood emoji mapping
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
        maxW="2xl" 
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
        {authToken && (
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

      <Box maxW="2xl" mx="auto">
        <Stack spacing={8}>

          {/* Header Card */}
          <Card 
            borderRadius="2xl" 
            boxShadow="md" 
            bg="white"
            border="1px solid"
            borderColor="gray.100"
          >
            <CardBody p={6}>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="flex-start">
                  <VStack align="flex-start" spacing={1} flex="1">
                    <HStack spacing={2}>
                      <Box 
                        w="8px" 
                        h="8px" 
                        borderRadius="full" 
                        bg="green.400"
                        boxShadow="0 0 0 3px rgba(72, 187, 120, 0.2)"
                      />
                      <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                        {sessionData.course_title}
                      </Text>
                    </HStack>
                    {!isNameStep && (
                      <Text fontSize="lg" fontWeight="700" color="gray.800">
                        Welcome, {displayName} 👋
                      </Text>
                    )}
                  </VStack>
                  <Box 
                    px={3} 
                    py={1} 
                    bg="brand.50" 
                    borderRadius="full"
                  >
                    <Text fontSize="xs" fontWeight="700" color="brand.600">
                      {currentStep + 1} of {totalSteps}
                    </Text>
                  </Box>
                </HStack>
                
                <Box>
                  <Progress
                    value={progress}
                    size="sm"
                    colorScheme="brand"
                    borderRadius="full"
                    bg="gray.100"
                    sx={{
                      '& > div': {
                        transition: 'width 0.4s ease',
                      }
                    }}
                  />
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Main Content Card */}
          <Card 
            borderRadius="2xl" 
            boxShadow="lg" 
            bg="white"
            border="1px solid"
            borderColor="gray.100"
          >
            <CardBody p={{ base: 8, md: 10 }}>
              
              {/* Name Input Step */}
              {isNameStep && (
                <VStack spacing={7} align="stretch">
                  <VStack spacing={3} align="flex-start">
                    <Heading size="lg" fontWeight="800" color="gray.900">
                      What's your name?
                    </Heading>
                    <Text color="gray.600" fontSize="md">
                      Your teacher will see this name
                    </Text>
                  </VStack>
                  
                  <Input
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter your full name"
                    size="lg"
                    fontSize="md"
                    h="56px"
                    autoFocus
                    borderRadius="xl"
                    _focus={{
                      borderColor: 'brand.500',
                      boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
                    }}
                  />
                  
                  <Button
                    size="lg"
                    h="56px"
                    colorScheme="brand"
                    onClick={handleNext}
                    isDisabled={!studentName.trim()}
                    fontWeight="700"
                    fontSize="md"
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
                    Continue
                  </Button>
                </VStack>
              )}
              
              {/* Survey Question Step */}
              {currentQuestion && (
                <VStack spacing={8} align="stretch">
                  <VStack spacing={3} align="flex-start">
                    <Box 
                      px={3} 
                      py={1} 
                      bg="brand.50" 
                      borderRadius="full"
                      mb={1}
                    >
                      <Text fontSize="xs" fontWeight="700" color="brand.600" textTransform="uppercase">
                        Question {surveyQuestionIndex + 1} of {surveyStepCount}
                      </Text>
                    </Box>
                    <Heading size="lg" fontWeight="800" color="gray.900" lineHeight="shorter">
                      {currentQuestion.text}
                    </Heading>
                  </VStack>
                  
                  <Stack spacing={4}>
                    {currentQuestion.options.map((option) => {
                      const isSelected = answers[currentQuestion.question_id] === option.option_id
                      
                      return (
                        <Box
                          key={option.option_id}
                          as="button"
                          onClick={() => handleAnswerSelect(currentQuestion.question_id, option.option_id)}
                          p={5}
                          borderRadius="xl"
                          border="2px solid"
                          borderColor={isSelected ? 'brand.500' : 'gray.200'}
                          bg={isSelected ? 'brand.50' : 'white'}
                          boxShadow={isSelected ? 'md' : 'sm'}
                          _hover={{
                            borderColor: isSelected ? 'brand.600' : 'brand.300',
                            transform: 'translateY(-2px)',
                            boxShadow: 'lg',
                          }}
                          transition="all 0.2s ease-in-out"
                          textAlign="left"
                          w="full"
                        >
                          <HStack spacing={4}>
                            <Box
                              w="20px"
                              h="20px"
                              borderRadius="full"
                              border="2px solid"
                              borderColor={isSelected ? 'brand.500' : 'gray.300'}
                              bg={isSelected ? 'brand.500' : 'white'}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              flexShrink={0}
                              transition="all 0.2s"
                            >
                              {isSelected && (
                                <Box w="10px" h="10px" borderRadius="full" bg="white" />
                              )}
                            </Box>
                            <Text
                              fontWeight={isSelected ? '600' : '500'}
                              fontSize="md"
                              color={isSelected ? 'brand.700' : 'gray.700'}
                              flex="1"
                            >
                              {option.text}
                            </Text>
                          </HStack>
                        </Box>
                      )
                    })}
                  </Stack>
                </VStack>
              )}

              {/* Mood Check Step */}
              {isMoodStep && (
                <VStack spacing={8} align="stretch">
                  <VStack spacing={3} align="flex-start">
                    <Box 
                      px={3} 
                      py={1} 
                      bg="purple.50" 
                      borderRadius="full"
                      mb={1}
                    >
                      <Text fontSize="xs" fontWeight="700" color="purple.600" textTransform="uppercase">
                        Final Step
                      </Text>
                    </Box>
                    <Heading size="lg" fontWeight="800" color="gray.900">
                      {sessionData.mood_check_schema.prompt}
                    </Heading>
                    <Text color="gray.600" fontSize="md">
                      Select the option that best describes how you're feeling right now
                    </Text>
                  </VStack>

                  <SimpleGrid columns={2} spacing={4}>
                    {sessionData.mood_check_schema.options.map((option) => {
                      const isSelected = mood === option
                      const emoji = moodEmojis[option] || '😊'
                      
                      return (
                        <Box
                          key={option}
                          as="button"
                          onClick={() => setMood(option)}
                          p={6}
                          borderRadius="xl"
                          border="2px solid"
                          borderColor={isSelected ? 'brand.500' : 'gray.200'}
                          bg={isSelected ? 'brand.50' : 'white'}
                          boxShadow={isSelected ? 'lg' : 'sm'}
                          _hover={{
                            borderColor: isSelected ? 'brand.600' : 'brand.300',
                            transform: 'translateY(-2px)',
                            boxShadow: 'lg',
                          }}
                          transition="all 0.2s ease-in-out"
                          position="relative"
                          overflow="hidden"
                          _before={{
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            bg: isSelected ? 'brand.500' : 'transparent',
                            transition: 'all 0.2s',
                          }}
                        >
                          <VStack spacing={3}>
                            <Text fontSize="3xl">{emoji}</Text>
                            <Text
                              fontWeight={isSelected ? '700' : '600'}
                              fontSize="md"
                              color={isSelected ? 'brand.700' : 'gray.700'}
                            >
                              {option}
                            </Text>
                          </VStack>
                        </Box>
                      )
                    })}
                  </SimpleGrid>

                  {errorMessage && (
                    <Alert 
                      status="error" 
                      borderRadius="xl"
                      boxShadow="sm"
                    >
                      <AlertIcon />
                      <AlertDescription fontSize="sm" fontWeight="500">
                        {errorMessage}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    size="lg"
                    colorScheme="brand"
                    onClick={handleSubmit}
                    isDisabled={!mood}
                    isLoading={mutation.isPending}
                    loadingText="Submitting..."
                    fontWeight="700"
                    fontSize="md"
                    h="56px"
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
                    Submit Check-in
                  </Button>
                </VStack>
              )}

            </CardBody>
          </Card>

          {/* Previous Button */}
          {currentStep > 0 && (
            <HStack justify="center">
              <Button
                leftIcon={<Icon as={FiChevronLeft} />}
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                fontWeight="600"
                color="gray.600"
                _hover={{ bg: 'gray.100' }}
              >
                Previous
              </Button>
            </HStack>
          )}
        </Stack>
      </Box>
    </Box>
  )
}