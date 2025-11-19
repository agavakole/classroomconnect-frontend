// src/pages/teacher/TeacherCourseDetailPage.tsx
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Wrap,
  WrapItem,
  useToast,
  HStack,
  VStack,
  Icon,
  Flex,
  Divider,
} from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FiArrowLeft,
  FiBookOpen,
  FiCheckCircle,
  FiGrid,
  FiZap,
  FiSave,
  FiAlertCircle,
  FiTag,
  FiRefreshCw,
} from 'react-icons/fi'
import {
  autoGenerateCourseRecommendations,
  getCourse,
  getCourseRecommendations,
  updateCourse,
  updateCourseRecommendations,
} from '../../api/courses'
import { listActivities } from '../../api/activities'
import { listSurveys } from '../../api/surveys'
import { ApiError } from '../../api/client'

const makeCellKey = (learningStyle: string | null, mood: string) =>
  JSON.stringify([learningStyle, mood])

const parseCellKey = (key: string): { learningStyle: string | null; mood: string } => {
  const [learningStyle, mood] = JSON.parse(key) as [string | null, string]
  return { learningStyle, mood }
}

export function TeacherCourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [selectedCell, setSelectedCell] = useState<string | null>(null)
  const [cellAssignments, setCellAssignments] = useState<Record<string, string>>({})
  const [courseTitle, setCourseTitle] = useState('')
  const [baselineSurveyId, setBaselineSurveyId] = useState('')

  const recommendationsQuery = useQuery({
    queryKey: ['courseRecommendations', courseId],
    queryFn: () => getCourseRecommendations(courseId ?? ''),
    enabled: Boolean(courseId),
  })

  const courseQuery = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourse(courseId ?? ''),
    enabled: Boolean(courseId),
  })

  useEffect(() => {
    if (!courseQuery.data) return
    setCourseTitle(courseQuery.data.title)
    setBaselineSurveyId(courseQuery.data.baseline_survey_id)
  }, [courseQuery.data])

  const activitiesQuery = useQuery({
    queryKey: ['activities'],
    queryFn: listActivities,
  })

  const surveysQuery = useQuery({
    queryKey: ['surveys'],
    queryFn: listSurveys,
  })

  useEffect(() => {
    if (!recommendationsQuery.data) return
    const mapping: Record<string, string> = {}
    recommendationsQuery.data.mappings.forEach((item) => {
      if (item.activity) {
        const key = makeCellKey(item.learning_style ?? null, item.mood)
        mapping[key] = item.activity.activity_id
      }
    })
    setCellAssignments(mapping)
  }, [recommendationsQuery.data])

  const saveMutation = useMutation({
    mutationFn: () =>
      updateCourseRecommendations(courseId ?? '', {
        mappings: Object.entries(cellAssignments).map(([key, activityId]) => {
          const { learningStyle, mood } = parseCellKey(key)
          return { learning_style: learningStyle, mood, activity_id: activityId }
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseRecommendations', courseId] })
      toast({
        title: 'Recommendation map saved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    },
  })

  const autoGenerateMutation = useMutation({
    mutationFn: () =>
      autoGenerateCourseRecommendations(courseId ?? '', {
        temperature: 0.3,
        activity_limit: 25,
      }),
    onSuccess: (payload) => {
      const mapping: Record<string, string> = {}
      payload.mappings.forEach(({ learning_style, mood, activity_id }) => {
        const key = makeCellKey(learning_style ?? null, mood)
        mapping[key] = activity_id
      })
      setSelectedCell(null)
      setCellAssignments(mapping)
      toast({
        title: 'AI recommendation map applied',
        description: 'Review the assignments before saving.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      })
    },
  })

  const courseUpdateMutation = useMutation({
    mutationFn: () =>
      updateCourse(courseId ?? '', {
        title: courseTitle.trim(),
        baseline_survey_id: baselineSurveyId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      queryClient.invalidateQueries({ queryKey: ['courseRecommendations', courseId] })
    },
  })

  const handleAssignActivity = (activityId: string) => {
    if (!selectedCell || autoGenerateMutation.isPending) return
    setCellAssignments((prev) => ({ ...prev, [selectedCell]: activityId }))
  }

  const getActivitySummary = (activityId?: string) => {
    if (!activityId) return 'Unassigned'
    const activity = activitiesQuery.data?.find((item) => item.id === activityId)
    return activity ? activity.name : 'Unknown'
  }

  const resetMappingDisplay = () => {
    setCellAssignments({})
    setSelectedCell(null)
    toast({
      title: 'Mapping cleared',
      description: 'Assignments reset in the UI. Remember to save if you want to persist.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }

  const recommendations = recommendationsQuery.data

  if (recommendationsQuery.isLoading || courseQuery.isLoading) {
    return (
      <Box textAlign="center" py={12}>
        <Text color="gray.500" fontSize="lg">
          Loading course details...
        </Text>
      </Box>
    )
  }

  if (!recommendations) {
    return (
      <Alert
        status="error"
        borderRadius="xl"
        bg="red.50"
        border="2px solid"
        borderColor="red.200"
      >
        <AlertIcon color="red.500" />
        <AlertDescription color="red.700" fontWeight="600">
          Unable to load course information
        </AlertDescription>
      </Alert>
    )
  }

  const hasCourseChanges =
    courseTitle.trim() !== (courseQuery.data?.title ?? '') ||
    baselineSurveyId !== (courseQuery.data?.baseline_survey_id ?? '')

  const isMapLocked = autoGenerateMutation.isPending
  const autoGenerateErrorMessage =
    autoGenerateMutation.error instanceof ApiError
      ? autoGenerateMutation.error.message
      : autoGenerateMutation.isError
        ? 'Unable to generate recommendations.'
        : null

  const totalAssignments = Object.keys(cellAssignments).length
  const totalCells =
    recommendations.learning_style_categories.length * recommendations.mood_labels.length
  const completedAssignments = Math.min(totalAssignments, totalCells)
  const remainingCombinations = Math.max(totalCells - totalAssignments, 0)
  const isMappingComplete = completedAssignments === totalCells && totalCells > 0

  return (
    <Stack spacing={8}>
      {/* Header */}
      <Box>
        <Button
          leftIcon={<Icon as={FiArrowLeft} />}
          variant="ghost"
          onClick={() => navigate('/teacher/courses')}
          mb={4}
          fontWeight="600"
        >
          Back to Courses
        </Button>

        <HStack spacing={4} align="flex-start">
          <Box
            bgGradient="linear(135deg, brand.400, brand.600)"
            color="white"
            p={4}
            borderRadius="2xl"
            boxShadow="lg"
          >
            <Icon as={FiBookOpen} boxSize={8} />
          </Box>
          <VStack align="flex-start" spacing={1}>
            <Heading size="lg" fontWeight="800">
              {courseQuery.data?.title ?? 'Course Recommendations'}
            </Heading>
            <Text color="gray.600" fontSize="md">
              Map each learning style + mood combination to an activity to drive personalized
              recommendations in your live sessions.
            </Text>
          </VStack>
        </HStack>
      </Box>

      {/* Course Configuration Card */}
      <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
        <CardBody p={6}>
          <VStack align="stretch" spacing={5}>
            <HStack spacing={3}>
              <Icon as={FiCheckCircle} boxSize={6} color="brand.500" />
              <Heading size="md" fontWeight="700">
                Course configuration
              </Heading>
            </HStack>

            <Text fontSize="sm" color="gray.500">
              Keep the course title and baseline survey up to date for future sessions.
            </Text>

            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="600" fontSize="sm" mb={2}>
                  Course title
                </FormLabel>
                <Input
                  value={courseTitle}
                  onChange={(event) => setCourseTitle(event.target.value)}
                  size="lg"
                  borderRadius="xl"
                  border="2px solid"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'brand.300' }}
                  _focus={{
                    borderColor: 'brand.400',
                    boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
                  }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="600" fontSize="sm" mb={2}>
                  Baseline survey
                </FormLabel>
                <Select
                  placeholder={
                    surveysQuery.isLoading ? 'Loading surveys…' : 'Select survey template'
                  }
                  value={baselineSurveyId}
                  onChange={(event) => setBaselineSurveyId(event.target.value)}
                  isDisabled={surveysQuery.isLoading || !surveysQuery.data?.length}
                  size="lg"
                  borderRadius="xl"
                  border="2px solid"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'brand.300' }}
                  _focus={{
                    borderColor: 'brand.400',
                    boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
                  }}
                >
                  {surveysQuery.data?.map((survey) => (
                    <option value={survey.id} key={survey.id}>
                      {survey.title}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <Stack spacing={1}>
                <HStack justify="space-between">
                  <HStack spacing={2}>
                    <Icon as={FiTag} boxSize={5} color="purple.500" />
                    <Text fontWeight="bold">Mood labels</Text>
                  </HStack>
                  <Badge colorScheme="purple" fontSize="xs" px={2} py={1} borderRadius="full">
                    {courseQuery.data?.mood_labels.length || 0} labels
                  </Badge>
                </HStack>
                <Wrap>
                  {courseQuery.data?.mood_labels.map((label) => (
                    <WrapItem key={label}>
                      <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                        {label}
                      </Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              </Stack>

              <Text fontSize="sm" color="gray.600">
                Requires re-baseline:{' '}
                <strong>{courseQuery.data?.requires_rebaseline ? 'Yes' : 'No'}</strong>
              </Text>

              {courseUpdateMutation.error instanceof ApiError ? (
                <Alert status="error">
                  <AlertIcon />
                  <AlertDescription>{courseUpdateMutation.error.message}</AlertDescription>
                </Alert>
              ) : null}

              <Button
                leftIcon={<Icon as={FiSave} />}
                alignSelf="flex-start"
                colorScheme="brand"
                onClick={() => courseUpdateMutation.mutate()}
                isLoading={courseUpdateMutation.isPending}
                isDisabled={!hasCourseChanges || !courseTitle.trim() || !baselineSurveyId}
                borderRadius="xl"
                fontWeight="600"
              >
                Save course changes
              </Button>
            </Stack>
          </VStack>
        </CardBody>
      </Card>

      {/* Mapping Progress Card */}
      <Card
        borderRadius="2xl"
        bgGradient="linear(135deg, purple.50, brand.50)"
        border="2px solid"
        borderColor="purple.100"
      >
        <CardBody p={6}>
          <HStack justify="space-between" align="center">
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="sm" fontWeight="600" color="gray.700">
                Mapping Progress
              </Text>
              <Heading size="lg" fontWeight="800" color="brand.700">
                {completedAssignments} / {totalCells}
              </Heading>
              <Text fontSize="xs" color="gray.600">
                {remainingCombinations} combinations remaining
              </Text>
            </VStack>
            <HStack spacing={3}>
              <Button
                variant="outline"
                leftIcon={<Icon as={FiRefreshCw} />}
                onClick={resetMappingDisplay}
                isDisabled={isMapLocked || totalAssignments === 0}
                borderRadius="xl"
                fontWeight="600"
              >
                Reset Mapping
              </Button>
              <Button
                leftIcon={<Icon as={FiZap} />}
                colorScheme="purple"
                onClick={() => autoGenerateMutation.mutate()}
                isLoading={autoGenerateMutation.isPending}
                isDisabled={!courseId || autoGenerateMutation.isPending}
                size="lg"
                borderRadius="xl"
                fontWeight="600"
              >
                AI Auto-Map
              </Button>
            </HStack>
          </HStack>
        </CardBody>
      </Card>

      {/* Alerts */}
      {autoGenerateErrorMessage ? (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>{autoGenerateErrorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {isMapLocked ? (
        <Alert status="info">
          <AlertIcon />
          <AlertDescription>
            Generating recommendations… Editing is disabled until this completes.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Mapping Grid */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Card>
          <CardBody p={6}>
            <Stack spacing={5}>
              <Box>
                <Heading size="md">Recommendation map</Heading>
                <Text fontSize="sm" color="gray.500">
                  Tap a cell to select it, then choose an activity on the right.To change tap the same cell and choose another activity
                </Text>
              </Box>

              <Stack spacing={6}>
                {recommendations.learning_style_categories.map((style) => (
                  <Box key={style}>
                    <Text fontWeight="bold" mb={3} textTransform="capitalize">
                      {style} learners
                    </Text>
                    <Grid templateColumns="repeat(auto-fit, minmax(160px, 1fr))" gap={3}>
                      {recommendations.mood_labels.map((mood) => {
                        const key = makeCellKey(style, mood)
                        const isActive = selectedCell === key
                        const hasActivity = Boolean(cellAssignments[key])
                        return (
                          <GridItem
                            key={key}
                            borderWidth="1px"
                            borderRadius="xl"
                            p={3}
                            cursor={isMapLocked ? 'not-allowed' : 'pointer'}
                            bg={hasActivity ? 'purple.50' : 'white'}
                            borderColor={isActive ? 'brand.500' : 'gray.200'}
                            opacity={isMapLocked ? 0.6 : 1}
                            onClick={() => {
                              if (isMapLocked) return
                              setSelectedCell(key)
                            }}
                          >
                            <Stack spacing={1}>
                              <Text fontSize="sm" color="gray.500">
                                Mood
                              </Text>
                              <Text fontWeight="semibold">{mood}</Text>
                              <Text fontSize="sm" color="gray.600">
                                {getActivitySummary(cellAssignments[key])}
                              </Text>
                            </Stack>
                          </GridItem>
                        )
                      })}
                    </Grid>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </CardBody>
        </Card>

        <Card>
          <CardBody p={6}>
            <Stack spacing={5}>
              <Box>
                <Heading size="md">Activities</Heading>
                <Text fontSize="sm" color="gray.500">
                  These come from your activity library. Assign them to the highlighted cell.
                </Text>
              </Box>

              {activitiesQuery.isLoading ? (
                <Text>Loading activities…</Text>
              ) : activitiesQuery.data?.length ? (
                <Stack spacing={3} maxH={{ base: 'auto', md: '600px' }} overflowY="auto" pr={2}>
                  {activitiesQuery.data.map((activity) => {
                    const isSelected =
                      selectedCell && cellAssignments[selectedCell] === activity.id
                    return (
                      <Box
                        key={activity.id}
                        borderWidth="1px"
                        borderRadius="lg"
                        p={3}
                        borderColor={isSelected ? 'brand.500' : 'gray.200'}
                        bg={isSelected ? 'brand.50' : 'white'}
                        cursor={isMapLocked ? 'not-allowed' : 'pointer'}
                        opacity={isMapLocked ? 0.6 : 1}
                        onClick={() => handleAssignActivity(activity.id)}
                      >
                        <Stack spacing={1}>
                          <Heading size="sm">{activity.name}</Heading>
                          <Text fontSize="sm" color="gray.600">
                            {activity.summary}
                          </Text>
                          <Badge alignSelf="flex-start">{activity.type}</Badge>
                        </Stack>
                      </Box>
                    )
                  })}
                </Stack>
              ) : (
                <Alert status="info">
                  <AlertIcon />
                  <AlertDescription>
                    No activities yet. Create one under "Create Activity".
                  </AlertDescription>
                </Alert>
              )}
            </Stack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {saveMutation.error instanceof ApiError ? (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>{saveMutation.error.message}</AlertDescription>
        </Alert>
      ) : null}

      <Button
        leftIcon={<Icon as={FiSave} />}
        colorScheme="purple"
        alignSelf="flex-start"
        onClick={() => saveMutation.mutate()}
        isLoading={saveMutation.isPending}
        isDisabled={isMapLocked || !isMappingComplete}
        size="lg"
        borderRadius="xl"
        fontWeight="600"
      >
        Save mappings
      </Button>
    </Stack>
  )
}
