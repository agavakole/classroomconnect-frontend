// src/pages/teacher/TeacherCourseCreatePage.tsx
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
  HStack,
  IconButton,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Wrap,
  WrapItem,
  VStack,
  Icon,
  Divider,
} from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiBookOpen,
  FiCheckCircle,
  FiTag,
  FiAlertCircle,
} from 'react-icons/fi'
import { createCourse, listCourses } from '../../api/courses'
import { listSurveys } from '../../api/surveys'
import { ApiError } from '../../api/client'

export function TeacherCourseCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const coursesQuery = useQuery({
    queryKey: ['courses'],
    queryFn: listCourses,
  })
  const surveysQuery = useQuery({
    queryKey: ['surveys'],
    queryFn: listSurveys,
  })

  const [title, setTitle] = useState('')
  const [baselineSurveyId, setBaselineSurveyId] = useState('')
  const [moodInput, setMoodInput] = useState('')
  const [moodLabels, setMoodLabels] = useState<string[]>([])

  const formatMoodLabel = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return ''
    return `${trimmed[0].toUpperCase()}${trimmed.slice(1).toLowerCase()}`
  }

  const addMoodLabel = () => {
    const label = formatMoodLabel(moodInput)
    if (!label || moodLabels.includes(label)) return
    setMoodLabels((prev) => [...prev, label])
    setMoodInput('')
  }

  const removeMoodLabel = (label: string) => {
    setMoodLabels((prev) => prev.filter((item) => item !== label))
  }

  const createMutation = useMutation({
    mutationFn: () =>
      createCourse({
        title,
        baseline_survey_id: baselineSurveyId,
        mood_labels: moodLabels,
      }),
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      setTitle('')
      setBaselineSurveyId('')
      setMoodLabels([])
      navigate(`/teacher/courses/${course.id}`)
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim() || !baselineSurveyId || moodLabels.length === 0) return
    createMutation.mutate()
  }

  const createError =
    createMutation.error instanceof ApiError
      ? createMutation.error.message
      : createMutation.isError
        ? 'Unable to create course.'
        : null

  const totalCourses = coursesQuery.data?.length || 0

  return (
    <Stack spacing={8}>
      <Box>
        <Heading size="lg" fontWeight="800" color="gray.800" mb={2}>
          Create Course
        </Heading>
        <Text color="gray.600" fontSize="lg">
          Set up a new course with baseline surveys and mood options
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Card
           border="2px solid"
          borderColor="blue.100"
          bg="blue.50"
        >
          <CardBody p={6}>
            <HStack spacing={4} align="flex-start">
              <Box
                bg="whiteAlpha.300"
                p={3}
                borderRadius="xl"
                backdropFilter="blur(10px)"
              >
                <Icon as={FiBookOpen} boxSize={6} color="blue.500"/>
              </Box>
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="sm" fontWeight="600" opacity={0.9}>
                  Total Courses
                </Text>
                <Text fontSize="3xl" fontWeight="800">
                  {totalCourses}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        <Card
           border="2px solid"
          borderColor="red.100"
          bg="red.50"
        >
          <CardBody p={6}>
            <HStack spacing={4} align="flex-start">
              <Box
                bg="whiteAlpha.300"
                p={3}
                borderRadius="xl"
                backdropFilter="blur(10px)"
              >
                <Icon as={FiCheckCircle} boxSize={6} color ="red.500"/>
              </Box>
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="sm" fontWeight="600" opacity={0.9}>
                  Quick Tip
                </Text>
                <Text fontSize="sm" opacity={0.9}>
                  Create courses to organize activities
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
        <CardBody p={6}>
          <Box as="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={6}>
              <HStack spacing={3}>
              
                <Heading size="md" fontWeight="700">
                  Create New Course
                </Heading>
              </HStack>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                <FormControl>
                  <FormLabel fontWeight="600" fontSize="sm" mb={2}>
                    <HStack spacing={2}>
                      <Icon as={FiBookOpen} boxSize={4} color="brand.500" />
                      <Text>Course Title</Text>
                      <Text color="red.500">*</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g., Mathematics Grade 5"
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

                <FormControl>
                  <FormLabel fontWeight="600" fontSize="sm" mb={2}>
                    <HStack spacing={2}>
                      <Icon as={FiCheckCircle} boxSize={4} color="brand.500" />
                      <Text>Baseline Survey</Text>
                      <Text color="red.500">*</Text>
                    </HStack>
                  </FormLabel>
                  <Select
                    placeholder={
                      surveysQuery.isLoading ? 'Loading surveys...' : 'Select survey template'
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
              </SimpleGrid>

              <Divider />

              <FormControl isRequired>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      <Icon as={FiTag} boxSize={5} color="accent.500" />
                      <Text fontWeight="700" fontSize="md">
                        Mood Labels
                      </Text>
                    </HStack>
                    <Badge
                      colorScheme="accent"
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderRadius="full"
                    >
                      {moodLabels.length} labels
                    </Badge>
                  </HStack>

                  <Box
                    p={4}
                    bg="accent.50"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="accent.100"
                  >
                    <HStack spacing={3} align="start">
                      <Icon as={FiAlertCircle} color="accent.500" boxSize={5} mt={0.5} />
                      <Text fontSize="sm" color="accent.800">
                        Add mood options that students can select when joining sessions
                      </Text>
                    </HStack>
                  </Box>

                  <HStack spacing={3}>
                    <Input
                      isRequired={false}
                      value={moodInput}
                      onChange={(event) => setMoodInput(event.target.value)}
                      placeholder="e.g., Happy, Focused, Tired"
                      size="lg"
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'accent.300' }}
                      _focus={{
                        borderColor: 'accent.400',
                        boxShadow: '0 0 0 1px var(--chakra-colors-accent-400)',
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          addMoodLabel()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={addMoodLabel}
                      isDisabled={!moodInput.trim()}
                      colorScheme="accent"
                      size="lg"
                      px={8}
                      borderRadius="xl"
                      fontWeight="600"
                    >
                      Add
                    </Button>
                  </HStack>

                  {moodLabels.length > 0 ? (
                    <Box>
                      <Text fontSize="sm" fontWeight="600" color="gray.600" mb={3}>
                        Current Labels
                      </Text>
                      <Wrap spacing={2}>
                        {moodLabels.map((label) => (
                          <WrapItem key={label}>
                            <Badge
                              colorScheme="accent"
                              px={3}
                              py={2}
                              borderRadius="full"
                              fontSize="sm"
                              textTransform="none"
                            >
                              <HStack spacing={2}>
                                <Text fontWeight="600">{label}</Text>
                                <IconButton
                                  aria-label={`Remove ${label}`}
                                  size="xs"
                                  icon={<CloseIcon />}
                                  variant="ghost"
                                  onClick={() => removeMoodLabel(label)}
                                  color="accent.700"
                                  _hover={{ bg: 'accent.700', color: 'white' }}
                                />
                              </HStack>
                            </Badge>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </Box>
                  ) : (
                    <Box
                      p={6}
                      bg="gray.50"
                      borderRadius="xl"
                      border="2px dashed"
                      borderColor="gray.200"
                      textAlign="center"
                    >
                      <Text fontSize="sm" color="gray.500">
                        No mood labels yet. Add at least one to continue.
                      </Text>
                    </Box>
                  )}
                </VStack>
              </FormControl>

              {createError && (
                <Alert
                  status="error"
                  borderRadius="xl"
                  bg="red.50"
                  border="2px solid"
                  borderColor="red.200"
                >
                  <AlertIcon color="red.500" />
                  <AlertDescription color="red.700" fontWeight="600">
                    {createError}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                leftIcon={<Icon as={FiCheckCircle} />}
                colorScheme="brand"
                isLoading={createMutation.isPending}
                loadingText="Creating Course..."
                isDisabled={
                  !title.trim() ||
                  !baselineSurveyId ||
                  createMutation.isPending ||
                  !moodLabels.length
                }
                size="lg"
                borderRadius="xl"
                fontWeight="600"
              >
                Create Course
              </Button>
            </Stack>
          </Box>
        </CardBody>
      </Card>
    </Stack>
  )
}
