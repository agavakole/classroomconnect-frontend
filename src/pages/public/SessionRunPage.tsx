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
  Badge,
} from '@chakra-ui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { FiCheckCircle, FiUser, FiSmile } from 'react-icons/fi'
import { getJoinSession, submitJoinSession } from '../../api/public'
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

  const handleSubmit = () => {
    if (!sessionData) return
    mutation.mutate()
  }

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.isError
        ? 'Unable to submit your response.'
        : null

  if (sessionQuery.isLoading) {
    return (
      <Box minH="100vh" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" display="flex" alignItems="center" justifyContent="center" p={4}>
        <VStack spacing={6}>
          <Box
            w="80px"
            h="80px"
            bg="white"
            borderRadius="2xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="2xl"
          >
            <Spinner size="xl" color="purple.500" thickness="4px" />
          </Box>
          <VStack spacing={2}>
            <Text color="white" fontWeight="800" fontSize="2xl">Loading session...</Text>
            <Text color="whiteAlpha.800" fontSize="lg">Hang tight! 🚀</Text>
          </VStack>
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
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" p={4}>
        <Card maxW="md" borderRadius="2xl" boxShadow="xl">
          <CardBody p={8}>
            <VStack spacing={4}>
              <Box fontSize="5xl">😕</Box>
              <Text fontSize="xl" fontWeight="800" color="gray.800" textAlign="center">
                Oops! Session Not Found
              </Text>
              <Text color="gray.600" textAlign="center">
                {message}
              </Text>
              <Button
                colorScheme="purple"
                size="lg"
                borderRadius="xl"
                onClick={() => navigate('/dashboard')}
                mt={4}
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
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" p={4}>
        <Card maxW="md" borderRadius="2xl" boxShadow="xl">
          <CardBody p={8}>
            <VStack spacing={4}>
              <Box fontSize="5xl">🔒</Box>
              <Text fontSize="xl" fontWeight="800" color="gray.800" textAlign="center">
                Session Closed
              </Text>
              <Text color="gray.600" textAlign="center">
                This session is no longer accepting responses.
              </Text>
              <Button
                colorScheme="purple"
                size="lg"
                borderRadius="xl"
                onClick={() => navigate('/dashboard')}
                mt={4}
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
  const displayName = studentName || auth.fullName || 'Guest'

  // Fun step colors
  const stepColors = [
    'linear-gradient(135deg, #a8c0ff 0%, #c8b6ff 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ]
  
  const currentGradient = stepColors[currentStep % stepColors.length]

  return (
    <Box minH="100vh" bg="gray.50" py={{ base: 6, md: 12 }} px={{ base: 4, md: 6 }}>
      <Box maxW="3xl" mx="auto">
        <Stack spacing={8}>
          {/* Fun Header Card */}
          <Card
            borderRadius="3xl"
            bg={currentGradient}
            boxShadow="2xl"
            border="none"
            overflow="hidden"
            position="relative"
          >
            <Box
              position="absolute"
              top="-50px"
              right="-50px"
              w="200px"
              h="200px"
              bg="whiteAlpha.200"
              borderRadius="full"
            />
            <CardBody p={{ base: 6, md: 8 }} position="relative">
              <VStack spacing={4}>
                <HStack spacing={3}>
                  <Box fontSize="3xl">📚</Box>
                  <Heading size={{ base: "lg", md: "xl" }} color="white" fontWeight="900">
                    {sessionData.course_title}
                  </Heading>
                </HStack>
                
                {!isNameStep && (
                  <HStack spacing={2}>
                    <Text color="white" fontWeight="700" fontSize={{ base: "md", md: "lg" }}>
                      Hey there,
                    </Text>
                    <Badge
                      bg="whiteAlpha.300"
                      color="white"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontWeight="800"
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      {displayName}! 👋
                    </Badge>
                  </HStack>
                )}
                
                <VStack spacing={3} w="full" mt={2}>
                  <HStack justify="space-between" w="full">
                    <Text color="whiteAlpha.900" fontWeight="700" fontSize="sm">
                      Step {currentStep + 1} of {totalSteps}
                    </Text>
                    <Text color="whiteAlpha.900" fontWeight="700" fontSize="sm">
                      {Math.round(progress)}%
                    </Text>
                  </HStack>
                  <Box w="full" h="4" bg="whiteAlpha.300" borderRadius="full" overflow="hidden">
                    <Box
                      h="full"
                      bg="white"
                      w={`${progress}%`}
                      transition="all 0.5s ease"
                      borderRadius="full"
                      boxShadow="0 0 20px rgba(255,255,255,0.5)"
                    />
                  </Box>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Main Content Card */}
          <Card
            borderRadius="3xl"
            boxShadow="2xl"
            border="3px solid"
            borderColor="gray.200"
            bg="white"
            overflow="hidden"
          >
            <CardBody p={{ base: 6, md: 10 }}>
              
              {/* Name Input Step */}
              {isNameStep && (
                <VStack spacing={6} align="stretch">
                  <VStack spacing={3}>
                    <Box fontSize="5xl">👋</Box>
                    <Heading size="lg" fontWeight="900" color="gray.800" textAlign="center">
                      Let's get started!
                    </Heading>
                    <Text color="gray.600" textAlign="center" fontSize="lg">
                      What's your name? Your teacher will see this.
                    </Text>
                  </VStack>
                  
                  <Box
                    p={6}
                    bg="purple.50"
                    borderRadius="2xl"
                    border="2px solid"
                    borderColor="purple.200"
                  >
                    <VStack spacing={4}>
                      <HStack spacing={3} w="full">
                        <Box
                          bg="purple.500"
                          p={3}
                          borderRadius="xl"
                          color="white"
                        >
                          <Icon as={FiUser} boxSize={6} />
                        </Box>
                        <VStack align="flex-start" spacing={0} flex="1">
                          <Text fontSize="xs" fontWeight="700" color="purple.700" textTransform="uppercase">
                            Your Name
                          </Text>
                        </VStack>
                      </HStack>
                      <Input
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Type your full name here..."
                        size="lg"
                        borderRadius="xl"
                        border="3px solid"
                        borderColor="purple.300"
                        bg="white"
                        fontSize="xl"
                        fontWeight="700"
                        h="70px"
                        autoFocus
                        _hover={{ borderColor: 'purple.400' }}
                        _focus={{
                          borderColor: 'purple.500',
                          boxShadow: '0 0 0 3px rgba(159, 122, 234, 0.2)',
                        }}
                      />
                    </VStack>
                  </Box>
                  
                  <Button
                    size="lg"
                    h="70px"
                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    color="white"
                    onClick={handleNext}
                    isDisabled={!studentName.trim()}
                    borderRadius="2xl"
                    fontSize="xl"
                    fontWeight="800"
                    boxShadow="xl"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: '2xl',
                    }}
                    _active={{
                      transform: 'scale(0.98)',
                    }}
                    transition="all 0.2s"
                    mt={4}
                  >
                    Let's Go! 🚀
                  </Button>
                </VStack>
              )}
              
              {/* Survey Question Step */}
              {currentQuestion && (
                <VStack spacing={6} align="stretch">
                  <VStack spacing={3}>
                    <Badge
                      colorScheme="purple"
                      fontSize="md"
                      px={4}
                      py={2}
                      borderRadius="full"
                      fontWeight="800"
                    >
                      Question {surveyQuestionIndex + 1}
                    </Badge>
                    <Heading
                      size={{ base: "md", md: "lg" }}
                      fontWeight="900"
                      color="gray.800"
                      textAlign="center"
                    >
                      {currentQuestion.text}
                    </Heading>
                  </VStack>
                  
                  <Stack spacing={4} mt={4}>
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = answers[currentQuestion.question_id] === option.option_id
                      const optionColors = [
                        { bg: 'purple.50', border: 'purple.400', text: 'purple.900', icon: '🟣' },
                        { bg: 'blue.50', border: 'blue.400', text: 'blue.900', icon: '🔵' },
                        { bg: 'pink.50', border: 'pink.400', text: 'pink.900', icon: '🌸' },
                        { bg: 'green.50', border: 'green.400', text: 'green.900', icon: '🟢' },
                      ]
                      const colors = optionColors[index % optionColors.length]
                      
                      return (
                        <Box
                          key={option.option_id}
                          as="button"
                          onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.question_id]: option.option_id }))}
                          p={{ base: 5, md: 6 }}
                          borderRadius="2xl"
                          border="3px solid"
                          borderColor={isSelected ? colors.border : 'gray.200'}
                          bg={isSelected ? colors.bg : 'white'}
                          _hover={{
                            borderColor: colors.border,
                            bg: colors.bg,
                            transform: 'translateY(-2px)',
                            boxShadow: 'lg',
                          }}
                          transition="all 0.2s"
                          textAlign="left"
                          w="full"
                          position="relative"
                          boxShadow={isSelected ? 'lg' : 'sm'}
                        >
                          <HStack spacing={4}>
                            <Box
                              fontSize={{ base: "2xl", md: "3xl" }}
                              opacity={isSelected ? 1 : 0.5}
                              transition="all 0.2s"
                            >
                              {isSelected ? '✅' : colors.icon}
                            </Box>
                            <Text
                              fontWeight={isSelected ? '800' : '600'}
                              fontSize={{ base: "md", md: "lg" }}
                              color={isSelected ? colors.text : 'gray.700'}
                              flex="1"
                            >
                              {option.text}
                            </Text>
                          </HStack>
                        </Box>
                      )
                    })}
                  </Stack>

                  <Button
                    size="lg"
                    h="70px"
                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    color="white"
                    onClick={handleNext}
                    isDisabled={!answers[currentQuestion.question_id]}
                    borderRadius="2xl"
                    fontSize="xl"
                    fontWeight="800"
                    boxShadow="xl"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: '2xl',
                    }}
                    _active={{
                      transform: 'scale(0.98)',
                    }}
                    transition="all 0.2s"
                    mt={6}
                  >
                    Next Question →
                  </Button>
                </VStack>
              )}

              {/* Mood Check Step */}
              {isMoodStep && (
                <VStack spacing={6} align="stretch">
                  <VStack spacing={3}>
                    <Box fontSize="5xl">😊</Box>
                    <Heading
                      size={{ base: "md", md: "lg" }}
                      fontWeight="900"
                      color="gray.800"
                      textAlign="center"
                    >
                      Almost done!
                    </Heading>
                    <Text
                      fontSize={{ base: "lg", md: "xl" }}
                      color="gray.600"
                      textAlign="center"
                      fontWeight="600"
                    >
                      {sessionData.mood_check_schema.prompt}
                    </Text>
                  </VStack>

                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mt={4}>
                    {sessionData.mood_check_schema.options.map((option, index) => {
                      const isSelected = mood === option
                      
                      // Fun emoji mapping
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
                      
                      const emoji = moodEmojis[option] || '😊'
                      
                      const gradients = [
                        'linear-gradient(135deg, #a8c0ff 0%, #c8b6ff 100%)',
                        'linear-gradient(135deg, #ffd3a5 0%, #fff0e1 100%)',
                        'linear-gradient(135deg, #a8edea 0%, #d5f4f3 100%)',
                        'linear-gradient(135deg, #fbc2eb 0%, #ffeaa7 100%)',
                      ]
                      
                      return (
                        <Box
                          key={option}
                          as="button"
                          onClick={() => setMood(option)}
                          p={8}
                          borderRadius="2xl"
                          border="3px solid"
                          borderColor={isSelected ? 'purple.400' : 'gray.200'}
                          bg={isSelected ? gradients[index % gradients.length] : 'white'}
                          _hover={{
                            transform: 'translateY(-4px)',
                            boxShadow: 'xl',
                            borderColor: 'purple.400',
                          }}
                          transition="all 0.2s"
                          boxShadow={isSelected ? 'xl' : 'md'}
                        >
                          <VStack spacing={3}>
                            <Text fontSize="5xl">{emoji}</Text>
                            <Text
                              fontWeight="900"
                              fontSize="xl"
                              color={isSelected ? 'purple.900' : 'gray.700'}
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
                      borderRadius="2xl"
                      bg="red.50"
                      border="3px solid"
                      borderColor="red.200"
                      p={5}
                    >
                      <Text fontSize="2xl" mr={3}>😕</Text>
                      <AlertDescription color="red.700" fontWeight="700">
                        {errorMessage}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    size="lg"
                    h="70px"
                    bg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                    color="white"
                    onClick={handleSubmit}
                    isDisabled={!mood}
                    isLoading={mutation.isPending}
                    loadingText="Submitting..."
                    borderRadius="2xl"
                    fontSize="xl"
                    fontWeight="800"
                    boxShadow="xl"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: '2xl',
                    }}
                    _active={{
                      transform: 'scale(0.98)',
                    }}
                    transition="all 0.2s"
                    mt={6}
                    leftIcon={<Icon as={FiCheckCircle} boxSize={6} />}
                  >
                    Submit! 🎉
                  </Button>
                </VStack>
              )}

            </CardBody>
          </Card>

          {/* Fun Footer */}
          <HStack justify="center" spacing={2} opacity={0.6}>
            <Text color="gray.500" fontSize="sm" fontWeight="600">
              You're doing great! Keep going! 
            </Text>
            <Text fontSize="lg">🌟</Text>
          </HStack>
        </Stack>
      </Box>
    </Box>
  )
}
