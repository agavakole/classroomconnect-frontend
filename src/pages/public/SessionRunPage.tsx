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
} from '@chakra-ui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
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
  const { token: authToken, isStudent } = auth
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

  // Determine if we need to ask for name first
  // We need name if:
  // 1. Guest identity is required (not logged in or forced guest)
  // 2. We don't have a name from state/storage
  // 3. We haven't set a name in the local state yet (handled by the input)
  // Actually, we just check if we have a valid name to proceed.
  // If we are at step 0 and need a name, we show the name input.
  
  // We can use a flag to indicate if the "Name Input" step is active.
  // However, to fit into the wizard flow, it's cleaner to treat it as Step 0 if needed.
  
  // Let's refine:
  // If `requireGuestIdentity` is true, and we don't have `guestJoinState?.guestName` or `storedGuest?.guestName`,
  // then we treat the first step as "Enter Name".
  
  const initialName = guestJoinState?.guestName ?? storedGuest?.guestName ?? ''
  const needsNameInput = requireGuestIdentity && !initialName
  
  // If needsNameInput is true, step 0 is Name Input.
  // Survey questions start at index 1 (if present).
  // Mood check is last.
  
  const [currentStep, setCurrentStep] = useState(0)
  
  // Calculate total steps
  // Base steps: Survey Questions + Mood Check
  // Add 1 if Name Input is needed
  const surveyStepCount = showSurvey ? (sessionData?.survey?.questions?.length ?? 0) : 0
  const totalSteps = (needsNameInput ? 1 : 0) + surveyStepCount + 1
  
  // Helper to map currentStep to content
  const isNameStep = needsNameInput && currentStep === 0
  
  // Survey question index:
  // If needsNameInput, survey starts at step 1. So question index = currentStep - 1.
  // If !needsNameInput, survey starts at step 0. So question index = currentStep.
  const surveyQuestionIndex = needsNameInput ? currentStep - 1 : currentStep
  
  const isSurveyStep = showSurvey && surveyQuestionIndex >= 0 && surveyQuestionIndex < surveyStepCount
  const currentQuestion = isSurveyStep ? sessionData?.survey?.questions[surveyQuestionIndex] : null
  
  const isMoodStep = currentStep === totalSteps - 1

  const surveyQuestions = useMemo(
    () => sessionData?.survey?.questions ?? [],
    [sessionData?.survey?.questions],
  )

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
      <Stack align="center" spacing={4} py={12}>
        <Spinner size="xl" color="brand.500" thickness="4px" />
        <Text color="gray.500" fontWeight="600">Loading session...</Text>
      </Stack>
    )
  }

  if (sessionQuery.isError || !sessionData) {
    const message =
      sessionQuery.error instanceof ApiError
        ? sessionQuery.error.message
        : 'We could not find this session or it is no longer available.'
    return (
      <Alert status="error" borderRadius="xl" variant="subtle">
        <AlertIcon />
        <AlertDescription fontWeight="600">{message}</AlertDescription>
      </Alert>
    )
  }

  if (sessionData.status !== 'OPEN') {
    return (
      <Alert status="warning" borderRadius="xl" variant="subtle">
        <AlertIcon />
        <AlertDescription fontWeight="600">This session is closed.</AlertDescription>
      </Alert>
    )
  }

  const progress = ((currentStep + 1) / totalSteps) * 100
  
  // Display name logic
  const displayName = studentName || auth.fullName || 'Guest'

  return (
    <Box maxW="2xl" mx="auto" px={{ base: 4, md: 0 }}>
      <Stack spacing={6}>
        {/* Header */}
        <Stack spacing={2} textAlign="center">
          <Heading size="lg" color="gray.800">{sessionData.course_title}</Heading>
          
          {/* Show welcome message if we have a name and are not on the name input step */}
          {!isNameStep && (
             <Text color="brand.600" fontWeight="600" fontSize="md">
               Welcome, {displayName}
             </Text>
          )}
          
          <Text color="gray.500" fontWeight="600" fontSize="sm">
            Step {currentStep + 1} of {totalSteps}
          </Text>
          {/* Progress Bar */}
          <Box w="full" h="2" bg="gray.100" borderRadius="full" overflow="hidden">
            <Box h="full" bg="brand.500" w={`${progress}%`} transition="width 0.3s ease" />
          </Box>
        </Stack>

        <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl" overflow="hidden">
          <CardBody p={{ base: 6, md: 8 }}>
            <Stack spacing={8}>
              
              {/* Name Input Step */}
              {isNameStep && (
                <Stack spacing={6}>
                   <Heading size="md" fontWeight="700" color="gray.800">
                    Let's get started
                  </Heading>
                  <Text color="gray.600">
                    Please enter your name so the teacher can identify you.
                  </Text>
                  
                  <Input 
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)} // We need to expose setStudentName
                    placeholder="Your Full Name"
                    size="lg"
                    borderRadius="xl"
                    autoFocus
                  />
                  
                  <Button
                    size="lg"
                    colorScheme="brand"
                    onClick={handleNext}
                    isDisabled={!studentName.trim()}
                    borderRadius="xl"
                    w="full"
                    mt={4}
                  >
                    Next
                  </Button>
                </Stack>
              )}
              
              {/* Survey Question Step */}
              {currentQuestion && (
                <Stack spacing={6}>
                  <Heading size="md" fontWeight="700" color="gray.800">
                    {currentQuestion.text}
                  </Heading>
                  
                  <Stack spacing={3}>
                    {currentQuestion.options.map((option) => {
                      const isSelected = answers[currentQuestion.question_id] === option.option_id
                      return (
                        <Box
                          key={option.option_id}
                          as="button"
                          onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.question_id]: option.option_id }))}
                          p={4}
                          borderRadius="xl"
                          border="2px solid"
                          borderColor={isSelected ? 'brand.500' : 'gray.200'}
                          bg={isSelected ? 'brand.50' : 'white'}
                          _hover={{ borderColor: isSelected ? 'brand.500' : 'brand.200', bg: isSelected ? 'brand.50' : 'gray.50' }}
                          transition="all 0.2s"
                          textAlign="left"
                          w="full"
                        >
                          <Text fontWeight={isSelected ? "700" : "500"} color={isSelected ? "brand.900" : "gray.700"}>
                            {option.text}
                          </Text>
                        </Box>
                      )
                    })}
                  </Stack>

                  <Button
                    size="lg"
                    colorScheme="brand"
                    onClick={handleNext}
                    isDisabled={!answers[currentQuestion.question_id]}
                    borderRadius="xl"
                    w="full"
                    mt={4}
                  >
                    Next Question
                  </Button>
                </Stack>
              )}

              {/* Mood Check Step */}
              {isMoodStep && (
                <Stack spacing={6}>
                  <Stack spacing={2}>
                    <Heading size="md" fontWeight="700" color="gray.800">
                      Last step!
                    </Heading>
                    <Text fontSize="lg" color="gray.600">
                      {sessionData.mood_check_schema.prompt}
                    </Text>
                  </Stack>

                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                    {sessionData.mood_check_schema.options.map((option) => {
                      const isSelected = mood === option
                      return (
                        <Box
                          key={option}
                          as="button"
                          onClick={() => setMood(option)}
                          p={6}
                          borderRadius="xl"
                          border="2px solid"
                          borderColor={isSelected ? 'accent.500' : 'gray.200'}
                          bg={isSelected ? 'accent.50' : 'white'}
                          _hover={{ borderColor: isSelected ? 'accent.500' : 'accent.200', transform: 'translateY(-2px)' }}
                          transition="all 0.2s"
                          textAlign="center"
                          boxShadow={isSelected ? 'md' : 'none'}
                        >
                          <Text fontWeight="700" fontSize="lg" color={isSelected ? "accent.900" : "gray.700"}>
                            {option}
                          </Text>
                        </Box>
                      )
                    })}
                  </SimpleGrid>

                  {errorMessage && (
                    <Alert status="error" borderRadius="xl">
                      <AlertIcon />
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    size="lg"
                    colorScheme="accent"
                    onClick={handleSubmit}
                    isDisabled={!mood}
                    isLoading={mutation.isPending}
                    loadingText="Submitting..."
                    borderRadius="xl"
                    w="full"
                    mt={4}
                  >
                    Submit Check-in
                  </Button>
                </Stack>
              )}

            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </Box>
  )
}
