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
  Heading,
  Input,
  SimpleGrid,
  Stack,
  Text,
  Wrap,
  WrapItem,
  useToast,
  HStack,
  VStack,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FiBookOpen,
  FiCheckCircle,
  FiZap,
  FiSave,
  FiTag,
  FiRefreshCw,
  FiGrid,
  FiX,
  FiChevronDown,
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
    // On mobile, clear selection after assigning for better UX
    if (window.innerWidth < 1024) {
      setTimeout(() => setSelectedCell(null), 300)
    }
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

  // Get selected survey title for display
  const selectedSurveyTitle = surveysQuery.data?.find(
    (s) => s.id === baselineSurveyId
  )?.title

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

  // Get selected cell info for display
  const selectedCellInfo = selectedCell ? parseCellKey(selectedCell) : null

  return (
    <Stack spacing={{ base: 6, md: 8 }}>
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
              onClick={() => navigate('/teacher/courses')}
              color="gray.600"
              _hover={{ color: 'brand.600', textDecoration: 'none' }}
              cursor="pointer"
            >
              Course Library
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color="gray.900" fontWeight="600" cursor="default" noOfLines={1}>
              {courseQuery.data?.title || 'Course Details'}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <Stack direction={{ base: 'column', md: 'row' }} spacing={4} align="flex-start">
          <Box
            bgGradient="linear(135deg, brand.400, brand.600)"
            color="white"
            p={{ base: 3, md: 4 }}
            borderRadius="2xl"
            boxShadow="lg"
            flexShrink={0}
          >
            <Icon as={FiBookOpen} boxSize={{ base: 6, md: 8 }} />
          </Box>
          <VStack align="flex-start" spacing={1} flex="1">
            <Heading size={{ base: 'md', md: 'lg' }} fontWeight="800">
              {courseQuery.data?.title ?? 'Course Recommendations'}
            </Heading>
            <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
              Map each learning style + mood combination to an activity to drive personalized
              recommendations in your live sessions.
            </Text>
          </VStack>
        </Stack>
      </Box>

      {/* Course Configuration Card */}
      <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="sm">
        <CardBody p={{ base: 4, md: 6 }}>
          <VStack align="stretch" spacing={5}>
            <HStack spacing={3}>
              <Icon as={FiCheckCircle} boxSize={{ base: 5, md: 6 }} color="brand.500" />
              <Heading size={{ base: 'sm', md: 'md' }} fontWeight="700">
                Course Configuration
              </Heading>
            </HStack>

            <Text fontSize="sm" color="gray.500">
              Keep the course title and baseline survey up to date for future sessions.
            </Text>

            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="600" fontSize="sm" mb={2}>
                  Course Title
                </FormLabel>
                <Input
                  value={courseTitle}
                  onChange={(event) => setCourseTitle(event.target.value)}
                  size={{ base: 'md', md: 'lg' }}
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
                  Baseline Survey
                </FormLabel>
                <Menu matchWidth>
                  <MenuButton
                    as={Button}
                    rightIcon={<Icon as={FiChevronDown} />}
                    w="full"
                    size={{ base: 'md', md: 'lg' }}
                    borderRadius="xl"
                    border="2px solid"
                    borderColor="gray.200"
                    fontWeight="600"
                    textAlign="left"
                    justifyContent="space-between"
                    _hover={{ borderColor: 'brand.300' }}
                    _active={{ borderColor: 'brand.400' }}
                    bg="white"
                    color={baselineSurveyId ? 'gray.800' : 'gray.400'}
                    isDisabled={surveysQuery.isLoading || !surveysQuery.data?.length}
                  >
                    {surveysQuery.isLoading
                      ? 'Loading surveys...'
                      : selectedSurveyTitle || 'Select survey template'}
                  </MenuButton>
                  <MenuList
                    maxH="300px"
                    overflowY="auto"
                    borderRadius="xl"
                    border="2px solid"
                    borderColor="gray.200"
                    boxShadow="xl"
                    py={2}
                    zIndex={1500}
                  >
                    {surveysQuery.data?.map((survey) => (
                      <MenuItem
                        key={survey.id}
                        onClick={() => setBaselineSurveyId(survey.id)}
                        bg={baselineSurveyId === survey.id ? 'brand.50' : 'transparent'}
                        fontWeight={baselineSurveyId === survey.id ? '700' : '500'}
                        color={baselineSurveyId === survey.id ? 'brand.700' : 'gray.700'}
                        _hover={{ bg: 'brand.50' }}
                        borderRadius="lg"
                        mx={2}
                        fontSize="md"
                      >
                        {survey.title}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </FormControl>

              <Stack spacing={2}>
                <HStack justify="space-between">
                  <HStack spacing={2}>
                    <Icon as={FiTag} boxSize={5} color="purple.500" />
                    <Text fontWeight="bold" fontSize="sm">
                      Mood Labels
                    </Text>
                  </HStack>
                  <Badge colorScheme="purple" fontSize="xs" px={2} py={1} borderRadius="full">
                    {courseQuery.data?.mood_labels.length || 0} labels
                  </Badge>
                </HStack>
                <Wrap>
                  {courseQuery.data?.mood_labels.map((label) => (
                    <WrapItem key={label}>
                      <Badge colorScheme="purple" px={3} py={1} borderRadius="full" fontSize="xs">
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

              {courseUpdateMutation.error instanceof ApiError && (
                <Alert status="error" borderRadius="xl">
                  <AlertIcon />
                  <AlertDescription>{courseUpdateMutation.error.message}</AlertDescription>
                </Alert>
              )}

              <Button
                leftIcon={<Icon as={FiSave} />}
                alignSelf="flex-start"
                colorScheme="brand"
                onClick={() => courseUpdateMutation.mutate()}
                isLoading={courseUpdateMutation.isPending}
                isDisabled={!hasCourseChanges || !courseTitle.trim() || !baselineSurveyId}
                borderRadius="xl"
                fontWeight="600"
                size={{ base: 'md', md: 'lg' }}
              >
                Save Course Changes
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
        <CardBody p={{ base: 4, md: 6 }}>
          <Stack
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'stretch', md: 'center' }}
            spacing={{ base: 4, md: 0 }}
          >
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="sm" fontWeight="600" color="gray.700">
                Mapping Progress
              </Text>
              <Heading size={{ base: 'md', md: 'lg' }} fontWeight="800" color="brand.700">
                {completedAssignments} / {totalCells}
              </Heading>
              <Text fontSize="xs" color="gray.600">
                {remainingCombinations} combinations remaining
              </Text>
            </VStack>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={3} w={{ base: 'full', md: 'auto' }}>
              <Button
                variant="outline"
                leftIcon={<Icon as={FiRefreshCw} />}
                onClick={resetMappingDisplay}
                isDisabled={isMapLocked || totalAssignments === 0}
                borderRadius="xl"
                fontWeight="600"
                size={{ base: 'md', md: 'lg' }}
                w={{ base: 'full', sm: 'auto' }}
              >
                Reset Mapping
              </Button>
              <Button
                leftIcon={<Icon as={FiZap} />}
                colorScheme="purple"
                onClick={() => autoGenerateMutation.mutate()}
                isLoading={autoGenerateMutation.isPending}
                isDisabled={!courseId || autoGenerateMutation.isPending}
                size={{ base: 'md', md: 'lg' }}
                borderRadius="xl"
                fontWeight="600"
                w={{ base: 'full', sm: 'auto' }}
              >
                AI Auto-Map
              </Button>
            </Stack>
          </Stack>
        </CardBody>
      </Card>

      {/* Alerts */}
      {autoGenerateErrorMessage && (
        <Alert status="error" borderRadius="xl">
          <AlertIcon />
          <AlertDescription>{autoGenerateErrorMessage}</AlertDescription>
        </Alert>
      )}

      {isMapLocked && (
        <Alert status="info" borderRadius="xl">
          <AlertIcon />
          <AlertDescription>
            Generating recommendations… Editing is disabled until this completes.
          </AlertDescription>
        </Alert>
      )}

      {/* Selected Cell Indicator - Sticky on Mobile */}
      {selectedCell && (
        <Card
          position={{ base: 'sticky', lg: 'relative' }}
          top={{ base: '72px', lg: 'auto' }}
          zIndex={10}
          borderRadius="xl"
          bg="brand.50"
          border="2px solid"
          borderColor="brand.300"
          boxShadow="lg"
        >
          <CardBody p={4}>
            <Flex justify="space-between" align="center">
              <HStack spacing={3}>
                <Box bg="brand.100" p={2} borderRadius="lg">
                  <Icon as={FiGrid} boxSize={5} color="brand.600" />
                </Box>
                <VStack align="flex-start" spacing={0}>
                  <Text fontSize="xs" fontWeight="600" color="gray.600" textTransform="uppercase">
                    Selected Cell
                  </Text>
                  <Text fontSize="sm" fontWeight="700" color="gray.900">
                    {selectedCellInfo?.learningStyle} • {selectedCellInfo?.mood}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {cellAssignments[selectedCell]
                      ? getActivitySummary(cellAssignments[selectedCell])
                      : 'No activity assigned'}
                  </Text>
                </VStack>
              </HStack>
              <IconButton
                aria-label="Clear selection"
                icon={<Icon as={FiX} />}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCell(null)}
                colorScheme="brand"
              />
            </Flex>
          </CardBody>
        </Card>
      )}

      {/* Mapping Interface - Responsive Layout */}
      <Box display={{ base: 'block', lg: 'none' }}>
        {/* Mobile/Tablet: Tabs Layout */}
        <Tabs colorScheme="brand" variant="soft-rounded">
          <TabList
            bg="white"
            p={2}
            borderRadius="xl"
            border="2px solid"
            borderColor="gray.100"
            flexWrap="wrap"
            gap={2}
          >
            <Tab fontWeight="600" fontSize="sm">
              📍 Recommendation Map
            </Tab>
            <Tab fontWeight="600" fontSize="sm">
              📚 Activities
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0} pt={4}>
              <Card borderRadius="2xl" border="2px solid" borderColor="gray.100">
                <CardBody p={{ base: 4, md: 6 }}>
                  <Stack spacing={5}>
                    <Box>
                      <Heading size="sm" mb={2}>
                        Recommendation Map
                      </Heading>
                      <Text fontSize="sm" color="gray.500">
                        Tap a cell to select it, then switch to Activities tab to assign.
                      </Text>
                    </Box>

                    <Stack spacing={6}>
                      {recommendations.learning_style_categories.map((style) => (
                        <Box key={style}>
                          <Text fontWeight="bold" mb={3} textTransform="capitalize" fontSize="md">
                            {style} Learners
                          </Text>
                          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                            {recommendations.mood_labels.map((mood) => {
                              const key = makeCellKey(style, mood)
                              const isActive = selectedCell === key
                              const hasActivity = Boolean(cellAssignments[key])
                              return (
                                <Box
                                  key={key}
                                  borderWidth="2px"
                                  borderRadius="xl"
                                  p={4}
                                  cursor={isMapLocked ? 'not-allowed' : 'pointer'}
                                  bg={hasActivity ? 'purple.50' : 'white'}
                                  borderColor={isActive ? 'brand.500' : hasActivity ? 'purple.200' : 'gray.200'}
                                  opacity={isMapLocked ? 0.6 : 1}
                                  onClick={() => {
                                    if (isMapLocked) return
                                    setSelectedCell(key)
                                  }}
                                  transition="all 0.2s"
                                  _hover={{
                                    borderColor: isMapLocked ? undefined : 'brand.300',
                                    transform: isMapLocked ? undefined : 'translateY(-2px)',
                                  }}
                                >
                                  <VStack align="flex-start" spacing={2}>
                                    <HStack spacing={2} w="full" justify="space-between">
                                      <Text fontSize="xs" color="gray.500" fontWeight="600">
                                        MOOD
                                      </Text>
                                      {hasActivity && (
                                        <Badge colorScheme="purple" fontSize="xs" borderRadius="full">
                                          Assigned
                                        </Badge>
                                      )}
                                    </HStack>
                                    <Text fontWeight="bold" fontSize="md">
                                      {mood}
                                    </Text>
                                    <Divider />
                                    <Text fontSize="sm" color="gray.600" noOfLines={2} minH="40px">
                                      {getActivitySummary(cellAssignments[key])}
                                    </Text>
                                  </VStack>
                                </Box>
                              )
                            })}
                          </SimpleGrid>
                        </Box>
                      ))}
                    </Stack>
                  </Stack>
                </CardBody>
              </Card>
            </TabPanel>

            <TabPanel px={0} pt={4}>
              <Card borderRadius="2xl" border="2px solid" borderColor="gray.100">
                <CardBody p={{ base: 4, md: 6 }}>
                  <Stack spacing={5}>
                    <Box>
                      <Heading size="sm" mb={2}>
                        Activities
                      </Heading>
                      <Text fontSize="sm" color="gray.500">
                        {selectedCell
                          ? 'Tap an activity to assign it to the selected cell.'
                          : 'Select a cell from the Recommendation Map tab first.'}
                      </Text>
                    </Box>

                    {!selectedCell && (
                      <Alert status="info" borderRadius="xl">
                        <AlertIcon />
                        <AlertDescription fontSize="sm">
                          Please select a cell from the Recommendation Map tab first.
                        </AlertDescription>
                      </Alert>
                    )}

                    {activitiesQuery.isLoading ? (
                      <Text>Loading activities…</Text>
                    ) : activitiesQuery.data?.length ? (
                      <Stack spacing={3}>
                        {activitiesQuery.data.map((activity) => {
                          const isSelected =
                            selectedCell && cellAssignments[selectedCell] === activity.id
                          return (
                            <Box
                              key={activity.id}
                              borderWidth="2px"
                              borderRadius="xl"
                              p={4}
                              borderColor={isSelected ? 'brand.500' : 'gray.200'}
                              bg={isSelected ? 'brand.50' : 'white'}
                              cursor={isMapLocked || !selectedCell ? 'not-allowed' : 'pointer'}
                              opacity={isMapLocked || !selectedCell ? 0.6 : 1}
                              onClick={() => handleAssignActivity(activity.id)}
                              transition="all 0.2s"
                              _hover={{
                                borderColor:
                                  isMapLocked || !selectedCell ? undefined : 'brand.300',
                                transform:
                                  isMapLocked || !selectedCell ? undefined : 'translateY(-2px)',
                              }}
                            >
                              <VStack align="flex-start" spacing={2}>
                                <HStack justify="space-between" w="full">
                                  <Heading size="sm">{activity.name}</Heading>
                                  {isSelected && (
                                    <Badge colorScheme="brand" fontSize="xs" borderRadius="full">
                                      Selected
                                    </Badge>
                                  )}
                                </HStack>
                                <Text fontSize="sm" color="gray.600">
                                  {activity.summary}
                                </Text>
                                <Badge alignSelf="flex-start" colorScheme="purple" fontSize="xs">
                                  {activity.type}
                                </Badge>
                              </VStack>
                            </Box>
                          )
                        })}
                      </Stack>
                    ) : (
                      <Alert status="info" borderRadius="xl">
                        <AlertIcon />
                        <AlertDescription>
                          No activities yet. Create one under "Create Activity".
                        </AlertDescription>
                      </Alert>
                    )}
                  </Stack>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Desktop: Side by Side Layout */}
      <SimpleGrid columns={2} spacing={6} display={{ base: 'none', lg: 'grid' }}>
        <Card borderRadius="2xl" border="2px solid" borderColor="gray.100">
          <CardBody p={6}>
            <Stack spacing={5}>
              <Box>
                <Heading size="md" mb={2}>
                  Recommendation Map
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  Click a cell to select it, then choose an activity on the right.
                </Text>
              </Box>

              <Stack spacing={6}>
                {recommendations.learning_style_categories.map((style) => (
                  <Box key={style}>
                    <Text fontWeight="bold" mb={3} textTransform="capitalize">
                      {style} Learners
                    </Text>
                    <SimpleGrid columns={{ base: 2, xl: 3 }} spacing={3}>
                      {recommendations.mood_labels.map((mood) => {
                        const key = makeCellKey(style, mood)
                        const isActive = selectedCell === key
                        const hasActivity = Boolean(cellAssignments[key])
                        return (
                          <Box
                            key={key}
                            borderWidth="2px"
                            borderRadius="xl"
                            p={3}
                            cursor={isMapLocked ? 'not-allowed' : 'pointer'}
                            bg={hasActivity ? 'purple.50' : 'white'}
                            borderColor={isActive ? 'brand.500' : hasActivity ? 'purple.200' : 'gray.200'}
                            opacity={isMapLocked ? 0.6 : 1}
                            onClick={() => {
                              if (isMapLocked) return
                              setSelectedCell(key)
                            }}
                            transition="all 0.2s"
                            _hover={{
                              borderColor: isMapLocked ? undefined : 'brand.300',
                              transform: isMapLocked ? undefined : 'translateY(-2px)',
                            }}
                          >
                            <VStack align="flex-start" spacing={1}>
                              <Text fontSize="xs" color="gray.500" fontWeight="600">
                                MOOD
                              </Text>
                              <Text fontWeight="bold" fontSize="sm">
                                {mood}
                              </Text>
                              <Text fontSize="xs" color="gray.600" noOfLines={2} minH="32px">
                                {getActivitySummary(cellAssignments[key])}
                              </Text>
                            </VStack>
                          </Box>
                        )
                      })}
                    </SimpleGrid>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </CardBody>
        </Card>

        <Card borderRadius="2xl" border="2px solid" borderColor="gray.100">
          <CardBody p={6}>
            <Stack spacing={5}>
              <Box>
                <Heading size="md" mb={2}>
                  Activities
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  These come from your activity library. Assign them to the selected cell.
                </Text>
              </Box>

              {!selectedCell && (
                <Alert status="info" borderRadius="xl">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    Select a cell from the map to assign an activity.
                  </AlertDescription>
                </Alert>
              )}

              {activitiesQuery.isLoading ? (
                <Text>Loading activities…</Text>
              ) : activitiesQuery.data?.length ? (
                <Stack spacing={3} maxH="600px" overflowY="auto" pr={2}>
                  {activitiesQuery.data.map((activity) => {
                    const isSelected =
                      selectedCell && cellAssignments[selectedCell] === activity.id
                    return (
                      <Box
                        key={activity.id}
                        borderWidth="2px"
                        borderRadius="xl"
                        p={4}
                        borderColor={isSelected ? 'brand.500' : 'gray.200'}
                        bg={isSelected ? 'brand.50' : 'white'}
                        cursor={isMapLocked || !selectedCell ? 'not-allowed' : 'pointer'}
                        opacity={isMapLocked || !selectedCell ? 0.6 : 1}
                        onClick={() => handleAssignActivity(activity.id)}
                        transition="all 0.2s"
                        _hover={{
                          borderColor: isMapLocked || !selectedCell ? undefined : 'brand.300',
                          transform: isMapLocked || !selectedCell ? undefined : 'translateY(-2px)',
                        }}
                      >
                        <VStack align="flex-start" spacing={2}>
                          <HStack justify="space-between" w="full">
                            <Heading size="sm">{activity.name}</Heading>
                            {isSelected && (
                              <Badge colorScheme="brand" fontSize="xs" borderRadius="full">
                                Selected
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            {activity.summary}
                          </Text>
                          <Badge alignSelf="flex-start" colorScheme="purple" fontSize="xs">
                            {activity.type}
                          </Badge>
                        </VStack>
                      </Box>
                    )
                  })}
                </Stack>
              ) : (
                <Alert status="info" borderRadius="xl">
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

      {saveMutation.error instanceof ApiError && (
        <Alert status="error" borderRadius="xl">
          <AlertIcon />
          <AlertDescription>{saveMutation.error.message}</AlertDescription>
        </Alert>
      )}

      <Button
        leftIcon={<Icon as={FiSave} />}
        colorScheme="purple"
        alignSelf="flex-start"
        onClick={() => saveMutation.mutate()}
        isLoading={saveMutation.isPending}
        isDisabled={isMapLocked || !isMappingComplete}
        size={{ base: 'md', md: 'lg' }}
        borderRadius="xl"
        fontWeight="600"
        w={{ base: 'full', sm: 'auto' }}
      >
        Save Mappings
      </Button>
    </Stack>
  )
}