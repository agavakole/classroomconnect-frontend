import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
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
} from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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

  const recommendations = recommendationsQuery.data

  if (recommendationsQuery.isLoading || courseQuery.isLoading) {
    return <Text>Loading course details…</Text>
  }

  if (!recommendations) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertDescription>Unable to load course information.</AlertDescription>
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

  return (
    <Stack spacing={6}>
      <Stack spacing={1}>
        <Heading size="lg">{courseQuery.data?.title ?? 'Course recommendations'}</Heading>
        <Text color="gray.600">
          Map each learning style + mood combination to an activity to drive personalized
          recommendations in your live sessions.
        </Text>
      </Stack>

      <Card>
        <CardHeader>
          <Heading size="md">Course configuration</Heading>
          <Text fontSize="sm" color="gray.500">
            Keep the course title and baseline survey up to date for future sessions.
          </Text>
        </CardHeader>
        <CardBody>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Course title</FormLabel>
              <Input value={courseTitle} onChange={(event) => setCourseTitle(event.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Baseline survey</FormLabel>
              <Select
                placeholder={
                  surveysQuery.isLoading ? 'Loading surveys…' : 'Select survey template'
                }
                value={baselineSurveyId}
                onChange={(event) => setBaselineSurveyId(event.target.value)}
                isDisabled={surveysQuery.isLoading || !surveysQuery.data?.length}
              >
                {surveysQuery.data?.map((survey) => (
                  <option value={survey.id} key={survey.id}>
                    {survey.title}
                  </option>
                ))}
              </Select>
            </FormControl>
            <Stack spacing={1}>
              <Text fontWeight="bold">Mood labels</Text>
              <Wrap>
                {courseQuery.data?.mood_labels.map((label) => (
                  <WrapItem key={label}>
                    <Badge>{label}</Badge>
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
              alignSelf="flex-start"
              colorScheme="brand"
              onClick={() => courseUpdateMutation.mutate()}
              isLoading={courseUpdateMutation.isPending}
              isDisabled={!hasCourseChanges || !courseTitle.trim() || !baselineSurveyId}
            >
              Save course changes
            </Button>
          </Stack>
        </CardBody>
      </Card>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Card>
          <CardHeader>
            <Stack
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              alignItems={{ base: 'flex-start', md: 'center' }}
              spacing={3}
            >
              <Box>
                <Heading size="md">Recommendation map</Heading>
                <Text fontSize="sm" color="gray.500">
                  Tap a cell to select it, then choose an activity on the right.
                </Text>
              </Box>
              <Button
                colorScheme="purple"
                onClick={() => autoGenerateMutation.mutate()}
                isLoading={autoGenerateMutation.isPending}
                isDisabled={!courseId || autoGenerateMutation.isPending}
                size="sm"
              >
                AI map
              </Button>
            </Stack>
            {autoGenerateErrorMessage ? (
              <Alert status="error" mt={3}>
                <AlertIcon />
                <AlertDescription>{autoGenerateErrorMessage}</AlertDescription>
              </Alert>
            ) : null}
            {isMapLocked ? (
              <Alert status="info" mt={3}>
                <AlertIcon />
                <AlertDescription>
                  Generating recommendations… Editing is disabled until this completes.
                </AlertDescription>
              </Alert>
            ) : null}
          </CardHeader>
          <CardBody>
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
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Activities</Heading>
            <Text fontSize="sm" color="gray.500">
              These come from your activity library. Assign them to the highlighted cell.
            </Text>
          </CardHeader>
          <CardBody>
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
                  No activities yet. Create one under “Create Activity”.
                </AlertDescription>
              </Alert>
            )}
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
        colorScheme="purple"
        alignSelf="flex-start"
        onClick={() => saveMutation.mutate()}
        isLoading={saveMutation.isPending}
        isDisabled={isMapLocked}
      >
        Save mappings
      </Button>
    </Stack>
  )
}
