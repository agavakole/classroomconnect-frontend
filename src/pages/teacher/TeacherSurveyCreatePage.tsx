// src/pages/teacher/TeacherSurveyCreatePage.tsx
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  IconButton,
  Input,
  NumberInput,
  NumberInputField,
  Stack,
  Text,
  HStack,
  VStack,
  Icon,
  Badge,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  SimpleGrid,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { FiCheckCircle, FiPlus, FiTrash2 } from 'react-icons/fi'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSurvey } from '../../api/surveys'
import { ApiError } from '../../api/client'

interface CategoryForm {
  id: string
  label: string
}

interface OptionForm {
  label: string
  scores: Record<string, number | ''>
}

interface QuestionForm {
  text: string
  options: OptionForm[]
}

function createCategory(defaultLabel = ''): CategoryForm {
  return {
    id: `category-${Math.random().toString(36).slice(2, 9)}`,
    label: defaultLabel,
  }
}

function createEmptyOption(categories: CategoryForm[] = []): OptionForm {
  const scores: Record<string, number | ''> = {}
  categories.forEach((category) => {
    scores[category.id] = 0
  })
  return { label: '', scores }
}

function createEmptyQuestion(categories: CategoryForm[] = []): QuestionForm {
  return {
    text: '',
    options: [createEmptyOption(categories), createEmptyOption(categories)],
  }
}

const DEFAULT_CATEGORIES = [
  createCategory('Active Learner'),
  createCategory('Passive Learner'),
  createCategory('Structured Learner'),
]

export function TeacherSurveyCreatePage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [categories, setCategories] = useState<CategoryForm[]>(DEFAULT_CATEGORIES)
  const [questions, setQuestions] = useState<QuestionForm[]>([
    createEmptyQuestion(DEFAULT_CATEGORIES),
  ])

  const syncQuestionScores = (nextCategories: CategoryForm[]) => {
    setQuestions((prev) =>
      prev.map((question) => ({
        ...question,
        options: question.options.map((option) => {
          const nextScores: Record<string, number | ''> = {}
          nextCategories.forEach((category) => {
            nextScores[category.id] = option.scores[category.id] ?? 0
          })
          return { ...option, scores: nextScores }
        }),
      })),
    )
  }

  const surveyMutation = useMutation({
    mutationFn: () => {
      const categoryLabelMap = Object.fromEntries(
        categories.map((category) => [category.id, category.label.trim()]),
      )

      return createSurvey({
        title,
        questions: questions.map((question, idx) => ({
          id: `q${idx + 1}`,
          text: question.text,
          options: question.options.map((option) => {
            const normalizedScores: Record<string, number> = {}
            Object.entries(option.scores).forEach(([key, value]) => {
              const label = categoryLabelMap[key]
              if (!label) return
              normalizedScores[label] = Number(value) || 0
            })
            const trimmedScores = Object.fromEntries(
              Object.entries(normalizedScores).filter(([, value]) => value !== 0),
            )
            const scores =
              Object.keys(trimmedScores).length > 0 ? trimmedScores : normalizedScores
            return {
              label: option.label,
              scores,
            }
          }),
        })),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] })
      navigate('/teacher/surveys')
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    surveyMutation.mutate()
  }

  const handleAddCategory = () => {
    const nextCategories = [...categories, createCategory('')]
    setCategories(nextCategories)
    syncQuestionScores(nextCategories)
  }

  const handleRemoveCategory = (index: number) => {
    if (categories.length <= 1) return
    const nextCategories = categories.filter((_, idx) => idx !== index)
    setCategories(nextCategories)
    syncQuestionScores(nextCategories)
  }

  const handleCategoryLabelChange = (index: number, value: string) => {
    setCategories((prev) =>
      prev.map((category, idx) =>
        idx === index ? { ...category, label: value } : category,
      ),
    )
  }

  const handleAddQuestion = () => {
    setQuestions((prev) => [...prev, createEmptyQuestion(categories)])
  }

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleAddOption = (questionIndex: number) => {
    setQuestions((prev) =>
      prev.map((question, idx) =>
        idx === questionIndex
          ? {
              ...question,
              options: [...question.options, createEmptyOption(categories)],
            }
          : question,
      ),
    )
  }

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    setQuestions((prev) =>
      prev.map((question, idx) =>
        idx === questionIndex
          ? { ...question, options: question.options.filter((_, optIdx) => optIdx !== optionIndex) }
          : question,
      ),
    )
  }

  const hasEmptyCategory = categories.some((category) => !category.label.trim())
  const hasEmptyQuestion = questions.some((question) => !question.text.trim())
  const hasEmptyOptionLabel = questions.some((question) =>
    question.options.some((option) => !option.label.trim()),
  )
  const isFormValid =
    Boolean(title.trim()) && !hasEmptyCategory && !hasEmptyQuestion && !hasEmptyOptionLabel

  const totalQuestions = questions.length
  const totalOptions = questions.reduce((sum, q) => sum + q.options.length, 0)

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
              onClick={() => navigate('/teacher/surveys')}
              color="gray.600"
              _hover={{ color: 'brand.600', textDecoration: 'none' }}
              cursor="pointer"
            >
              Survey Library
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color="gray.900" fontWeight="600" cursor="default">
              Create Survey
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <HStack spacing={4} align="flex-start">
          <VStack align="flex-start" spacing={1}>
            <Heading size="lg" fontWeight="800">
              Create Survey
            </Heading>
            <HStack spacing={4} fontSize="sm" color="gray.600" fontWeight="600">
              <HStack>
                <Icon as={FiCheckCircle} />
                <Text>{totalQuestions} Questions</Text>
              </HStack>
              <HStack>
                <Icon as={FiCheckCircle} />
                <Text>{totalOptions} Options</Text>
              </HStack>
            </HStack>
          </VStack>
        </HStack>
      </Box>

      {/* Main Form */}
      <Box as="form" onSubmit={handleSubmit}>
        <Stack spacing={6}>
          {/* Survey Title Card */}
          <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
            <CardBody p={6}>
              <FormControl isRequired>
                <FormLabel fontWeight="700" fontSize="lg" mb={3}>
                  Survey Title
                </FormLabel>
                <Input
                  placeholder="e.g., Learning Style Assessment"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
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
            </CardBody>
          </Card>

          {/* Category Builder */}
          <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
            <CardBody p={6}>
              <VStack align="stretch" spacing={5}>
                <HStack spacing={3}>
                  <Icon as={FiCheckCircle} boxSize={6} color="accent.500" />
                  <Heading size="md" fontWeight="700">
                    Learning Style Categories
                  </Heading>
                  <Badge colorScheme="red" fontSize="xs" px={2} py={1} borderRadius="full">
                    Required
                  </Badge>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  Define the learner types that this survey will help identify. These categories
                  will automatically appear below each answer option for scoring.
                </Text>

                <VStack spacing={4} align="stretch">
                  {categories.map((category, index) => (
                    <Box
                      key={category.id}
                      p={4}
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.100"
                      bg="gray.50"
                    >
                      <HStack align="flex-start" spacing={4}>
                        <FormControl isRequired>
                          <FormLabel fontWeight="600" fontSize="sm" mb={1}>
                            Category {index + 1}
                          </FormLabel>
                          <Input
                            placeholder="e.g., Active Learner"
                            value={category.label}
                            onChange={(event) =>
                              handleCategoryLabelChange(index, event.target.value)
                            }
                            borderRadius="xl"
                            border="2px solid"
                            borderColor="gray.200"
                            bg="white"
                            _hover={{ borderColor: 'accent.300' }}
                            _focus={{
                              borderColor: 'accent.400',
                              boxShadow: '0 0 0 1px var(--chakra-colors-accent-400)',
                            }}
                          />
                        </FormControl>
                        {categories.length > 1 && (
                          <IconButton
                            aria-label="Remove category"
                            icon={<Icon as={FiTrash2} />}
                            variant="ghost"
                            colorScheme="red"
                            mt={6}
                            onClick={() => handleRemoveCategory(index)}
                            borderRadius="xl"
                          />
                        )}
                      </HStack>
                    </Box>
                  ))}
                </VStack>

                <Button
                  leftIcon={<Icon as={FiPlus} />}
                  variant="outline"
                  borderRadius="xl"
                  borderWidth="2px"
                  borderStyle="dashed"
                  borderColor="accent.200"
                  color="accent.600"
                  onClick={handleAddCategory}
                  _hover={{ bg: 'accent.50', borderColor: 'accent.400' }}
                  fontWeight="600"
                  size="lg"
                >
                  Add Category
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Questions */}
          <Stack spacing={5}>
            {questions.map((question, questionIndex) => (
              <Card
                key={questionIndex}
                borderRadius="2xl"
                border="2px solid"
                borderColor="brand.100"
                boxShadow="lg"
                bg="white"
              >
                <CardBody p={6}>
                  <Stack spacing={5}>
                    {/* Question Header */}
                    <Flex justify="space-between" align="center">
                      <HStack spacing={3}>
                        <Badge
                          colorScheme="brand"
                          fontSize="md"
                          px={4}
                          py={2}
                          borderRadius="full"
                          fontWeight="700"
                        >
                          Question {questionIndex + 1}
                        </Badge>
                        <Text fontSize="sm" color="gray.500" fontWeight="600">
                          {question.options.length} options
                        </Text>
                      </HStack>
                      {questions.length > 1 && (
                        <IconButton
                          aria-label="Remove question"
                          icon={<Icon as={FiTrash2} />}
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleRemoveQuestion(questionIndex)}
                          borderRadius="xl"
                        />
                      )}
                    </Flex>

                    {/* Question Text Input */}
                    <FormControl isRequired>
                      <FormLabel fontWeight="600" fontSize="sm" mb={2}>
                        Question Text
                      </FormLabel>
                      <Input
                        placeholder="e.g., How do you prefer to learn new concepts?"
                        value={question.text}
                        onChange={(event) =>
                          setQuestions((prev) =>
                            prev.map((item, idx) =>
                              idx === questionIndex ? { ...item, text: event.target.value } : item,
                            ),
                          )
                        }
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

                    <Divider />

                    {/* Options */}
                    <VStack align="stretch" spacing={4}>
                      <Text fontWeight="700" fontSize="sm" color="gray.700">
                        Answer Options
                      </Text>
                      {question.options.map((option, optionIndex) => (
                        <Card
                          key={optionIndex}
                          bg="gray.50"
                          borderRadius="xl"
                          border="2px solid"
                          borderColor="gray.100"
                        >
                          <CardBody p={4}>
                            <Stack spacing={4}>
                              {/* Option Header */}
                              <Flex justify="space-between" align="center">
                                <Text fontWeight="700" fontSize="sm" color="gray.700">
                                  Option {optionIndex + 1}
                                </Text>
                                {question.options.length > 2 && (
                                  <IconButton
                                    aria-label="Remove option"
                                    icon={<Icon as={FiTrash2} />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                                  />
                                )}
                              </Flex>

                              {/* Option Label */}
                              <Input
                                placeholder="e.g., By reading and taking notes"
                                value={option.label}
                                onChange={(event) =>
                                  setQuestions((prev) =>
                                    prev.map((item, idx) =>
                                      idx === questionIndex
                                        ? {
                                            ...item,
                                            options: item.options.map((opt, optIdx) =>
                                              optIdx === optionIndex
                                                ? { ...opt, label: event.target.value }
                                                : opt,
                                            ),
                                          }
                                        : item,
                                    ),
                                  )
                                }
                                borderRadius="lg"
                                bg="white"
                                border="2px solid"
                                borderColor="gray.200"
                                _hover={{ borderColor: 'gray.300' }}
                              />

                              {/* Category Scores */}
                              <VStack align="stretch" spacing={3}>
                                <Text
                                  fontSize="xs"
                                  fontWeight="700"
                                  color="gray.600"
                                  textTransform="uppercase"
                                >
                                  Category Scores
                                </Text>
                                <SimpleGrid
                                  columns={{
                                    base: 1,
                                    md: Math.max(1, Math.min(3, categories.length)),
                                  }}
                                  spacing={3}
                                >
                                  {categories.map((category, categoryIndex) => (
                                    <VStack key={category.id} flex={1} align="stretch" spacing={1}>
                                      <Text fontSize="xs" color="gray.600" fontWeight="600">
                                        {category.label?.trim() || `Category ${categoryIndex + 1}`}
                                      </Text>
                                      <NumberInput
                                        min={0}
                                        max={10}
                                        value={option.scores[category.id] ?? 0}
                                        onChange={(valueString, valueNumber) => {
                                          const nextValue =
                                            valueString === '' ? '' : Number.isNaN(valueNumber) ? 0 : valueNumber
                                          setQuestions((prev) =>
                                            prev.map((item, idx) =>
                                              idx === questionIndex
                                                ? {
                                                    ...item,
                                                    options: item.options.map((opt, optIdx) =>
                                                      optIdx === optionIndex
                                                        ? {
                                                            ...opt,
                                                            scores: {
                                                              ...opt.scores,
                                                              [category.id]: nextValue,
                                                            },
                                                          }
                                                        : opt,
                                                    ),
                                                  }
                                                : item,
                                            ),
                                          )
                                        }}
                                      >
                                        <NumberInputField
                                          placeholder="0"
                                          borderRadius="lg"
                                          bg="white"
                                          border="2px solid"
                                          borderColor="gray.200"
                                          textAlign="center"
                                          fontWeight="700"
                                          _hover={{ borderColor: 'brand.200' }}
                                          _focus={{
                                            borderColor: 'brand.400',
                                            boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
                                          }}
                                        />
                                      </NumberInput>
                                    </VStack>
                                  ))}
                                </SimpleGrid>
                              </VStack>
                            </Stack>
                          </CardBody>
                        </Card>
                      ))}

                      {/* Add Option Button */}
                      <Button
                        leftIcon={<Icon as={FiPlus} />}
                        variant="outline"
                        onClick={() => handleAddOption(questionIndex)}
                        borderRadius="xl"
                        borderWidth="2px"
                        borderStyle="dashed"
                        borderColor="brand.200"
                        color="brand.600"
                        _hover={{
                          bg: 'brand.50',
                          borderColor: 'brand.400',
                        }}
                        size="lg"
                        fontWeight="600"
                      >
                        Add Answer Option
                      </Button>
                    </VStack>
                  </Stack>
                </CardBody>
              </Card>
            ))}

            {/* Add Question Button */}
            <Button
              leftIcon={<Icon as={FiPlus} />}
              onClick={handleAddQuestion}
              size="lg"
              borderRadius="xl"
              borderWidth="2px"
              borderStyle="dashed"
              variant="outline"
              borderColor="accent.200"
              color="accent.600"
              _hover={{
                bg: 'accent.50',
                borderColor: 'accent.400',
              }}
              fontWeight="600"
            >
              Add Question
            </Button>
          </Stack>

          {/* Error Alert */}
          {surveyMutation.error instanceof ApiError && (
            <Alert
              status="error"
              borderRadius="xl"
              bg="red.50"
              border="2px solid"
              borderColor="red.200"
            >
              <AlertIcon color="red.500" />
              <AlertDescription color="red.700" fontWeight="600">
                {surveyMutation.error.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <HStack spacing={4} justify="flex-end" pt={4}>
            <Button
              variant="outline"
              onClick={() => navigate('/teacher/surveys')}
              size="lg"
              borderRadius="xl"
              fontWeight="600"
              borderWidth="2px"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="brand"
              isLoading={surveyMutation.isPending}
              isDisabled={!isFormValid}
              size="lg"
              borderRadius="xl"
              fontWeight="600"
              px={8}
              leftIcon={<Icon as={FiCheckCircle} />}
            >
              Save to Library
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Stack>
  )
}