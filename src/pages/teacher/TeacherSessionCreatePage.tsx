// src/pages/teacher/TeacherSessionCreatePage.tsx
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
  Switch,
  Text,
  HStack,
  VStack,
  Icon,
  Badge,
  Divider,
  FormHelperText,
  Wrap,
  WrapItem,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  FiPlayCircle,
  FiCheckCircle,
  FiAlertCircle,
  FiMessageSquare,
} from 'react-icons/fi'
import { listCourses, createCourseSession } from '../../api/courses'
import { ApiError } from '../../api/client'

export function TeacherSessionCreatePage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const preselectedCourseId =
    (location.state as { courseId?: string } | null)?.courseId ?? ''
  const [courseId, setCourseId] = useState(preselectedCourseId)
  const [requireSurvey, setRequireSurvey] = useState(true)
  const [moodPrompt, setMoodPrompt] = useState('How are you feeling today?')

  const coursesQuery = useQuery({
    queryKey: ['courses'],
    queryFn: listCourses,
  })

  useEffect(() => {
    if (preselectedCourseId) {
      setCourseId(preselectedCourseId)
    }
  }, [preselectedCourseId])

  const sessionMutation = useMutation({
    mutationFn: () =>
      createCourseSession(courseId, {
        require_survey: requireSurvey,
        mood_prompt: moodPrompt,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', courseId] })
      navigate(`/teacher/sessions/${data.session_id}/dashboard`, {
        state: { fromCreation: true },
      })
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    sessionMutation.mutate()
  }

  const selectedCourse = coursesQuery.data?.find((c) => c.id === courseId)

  return (
    <Stack spacing={8}>
      {/* Header */}
      <Box>
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          spacing={2}
          separator={<ChevronRightIcon color="gray.400" boxSize={4} />}
          mb={4}
          fontSize="sm"
          fontWeight="500"
        >
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => navigate('/teacher/dashboard')}
              color="gray.600"
              _hover={{ color: 'brand.600', textDecoration: 'none' }}
              cursor="pointer"
            >
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => navigate('/teacher/sessions')}
              color="gray.600"
              _hover={{ color: 'brand.600', textDecoration: 'none' }}
              cursor="pointer"
            >
              Session Library
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color="gray.900" fontWeight="600" cursor="default">
              Create Session
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <HStack spacing={4} align="flex-start">
          <VStack align="flex-start" spacing={1}>
            <Heading size="lg" fontWeight="800">
              Launch New Session
            </Heading>
            <Text color="gray.600" fontSize="md">
              Start an interactive learning session for your students
            </Text>
          </VStack>
        </HStack>
      </Box>

      {/* Main Form */}
      <Box as="form" onSubmit={handleSubmit}>
        <Stack spacing={6}>
          {/* Course Selection Card */}
          <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
            <CardBody p={6}>
              <VStack align="stretch" spacing={5}>
                <HStack spacing={3}>
                  <Icon as={FiCheckCircle} boxSize={6} color="brand.500" />
                  <Heading size="md" fontWeight="700">
                    Select Course
                  </Heading>
                  <Badge colorScheme="red" fontSize="xs" px={2} py={1} borderRadius="full">
                    Required
                  </Badge>
                </HStack>

                <FormControl isRequired>
                  <FormLabel fontWeight="600" fontSize="sm" mb={2}>
                    Which course is this session for?
                  </FormLabel>
                  {coursesQuery.isLoading ? (
                    <Text color="gray.500">Loading courses...</Text>
                  ) : coursesQuery.data?.length ? (
                    <Wrap spacing={3}>
                      {coursesQuery.data.map((course) => {
                        const isSelected = courseId === course.id
                        return (
                          <WrapItem key={course.id}>
                            <Button
                              variant={isSelected ? 'solid' : 'outline'}
                              colorScheme="brand"
                              borderRadius="xl"
                              fontWeight="600"
                              borderWidth={isSelected ? undefined : '2px'}
                              onClick={() => setCourseId(course.id)}
                            >
                              {course.title}
                            </Button>
                          </WrapItem>
                        )
                      })}
                    </Wrap>
                  ) : (
                    <Text color="gray.500">No courses available yet.</Text>
                  )}
                  <FormHelperText fontSize="sm" color="gray.600">
                    Students will join this course's session
                  </FormHelperText>
                </FormControl>

                {selectedCourse && (
                  <Box
                    p={4}
                    bg="brand.50"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="brand.100"
                  >
                    <HStack spacing={3}>
                      <Icon as={FiCheckCircle} color="brand.500" boxSize={5} />
                      <VStack align="flex-start" spacing={0} flex={1}>
                        <Text fontWeight="700" color="brand.900">
                          {selectedCourse.title}
                        </Text>
                        <Text fontSize="xs" color="brand.700">
                          {selectedCourse.mood_labels.length} mood options configured
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Session Settings Card */}
          <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
            <CardBody p={6}>
              <VStack align="stretch" spacing={5}>
                <HStack spacing={3}>
                  <Icon as={FiAlertCircle} boxSize={6} color="accent.500" />
                  <Heading size="md" fontWeight="700">
                    Session Settings
                  </Heading>
                </HStack>

                {/* Survey Requirement Toggle */}
                <FormControl>
                  <HStack
                    justify="space-between"
                    p={4}
                    bg="gray.50"
                    borderRadius="xl"
                    border="2px solid"
                    borderColor="gray.100"
                  >
                    <VStack align="flex-start" spacing={1} flex={1}>
                      <FormLabel mb={0} fontWeight="700" fontSize="md">
                        Require Survey
                      </FormLabel>
                      <Text fontSize="sm" color="gray.600">
                        Students must complete the survey before joining
                      </Text>
                    </VStack>
                    <Switch
                      size="lg"
                      isChecked={requireSurvey}
                      onChange={(event) => setRequireSurvey(event.target.checked)}
                      colorScheme="brand"
                    />
                  </HStack>
                </FormControl>

                {requireSurvey && (
                  <Box
                    p={4}
                    bg="brand.50"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="brand.100"
                  >
                    <HStack spacing={2} fontSize="sm" color="brand.800">
                      <Icon as={FiCheckCircle} />
                      <Text fontWeight="600">
                        Students will answer survey questions to get personalized recommendations
                      </Text>
                    </HStack>
                  </Box>
                )}

                <Divider />

                {/* Mood Prompt Input */}
                <FormControl>
                  <FormLabel fontWeight="700" fontSize="md" mb={2}>
                    <HStack spacing={2}>
                      <Icon as={FiMessageSquare} color="accent.500" />
                      <Text>Mood Check Prompt</Text>
                      <Text color="red.500">*</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    value={moodPrompt}
                    onChange={(event) => setMoodPrompt(event.target.value)}
                    placeholder="How are you feeling today?"
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
                  <FormHelperText fontSize="sm" color="gray.600">
                    This question will be shown to students when they join
                  </FormHelperText>
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          {/* Error Alert */}
          {sessionMutation.error instanceof ApiError && (
            <Alert
              status="error"
              borderRadius="xl"
              bg="red.50"
              border="2px solid"
              borderColor="red.200"
            >
              <AlertIcon color="red.500" />
              <AlertDescription color="red.700" fontWeight="600">
                {sessionMutation.error.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <Card
            borderRadius="2xl"
            bgGradient="linear(135deg, brand.50, accent.50)"
            border="2px solid"
            borderColor="brand.100"
          >
            <CardBody p={6}>
              <VStack spacing={4}>
                <VStack spacing={1}>
                  <Text fontSize="lg" fontWeight="700" color="gray.800">
                    Ready to start?
                  </Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Students will be able to join immediately after creation
                  </Text>
                </VStack>

                <HStack spacing={4} w="full">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/teacher/sessions')}
                    size="lg"
                    borderRadius="xl"
                    fontWeight="600"
                    borderWidth="2px"
                    flex={1}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="brand"
                    isLoading={sessionMutation.isPending}
                    loadingText="Creating Session..."
                    isDisabled={!courseId}
                    size="lg"
                    borderRadius="xl"
                    fontWeight="600"
                    flex={2}
                    leftIcon={<Icon as={FiPlayCircle} />}
                  >
                    Launch Session
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Helper Info Box */}
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
                  💡 Quick Tip
                </Text>
                <Text fontSize="sm" color="blue.800">
                  After creating the session, you'll get a QR code and join link to share with
                  your students. They can join instantly!
                </Text>
              </VStack>
            </HStack>
          </Box>
        </Stack>
      </Box>
    </Stack>
  )
}