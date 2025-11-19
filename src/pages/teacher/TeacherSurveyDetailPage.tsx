// src/pages/teacher/TeacherSurveyDetailPage.tsx
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
  HStack,
  VStack,
  Icon,
  SimpleGrid,
  Flex,
  Divider,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { FiClipboard, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import { getSurvey } from '../../api/surveys'

export function TeacherSurveyDetailPage() {
  const { surveyId } = useParams<{ surveyId: string }>()
  const navigate = useNavigate()

  const surveyQuery = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: () => getSurvey(surveyId ?? ''),
    enabled: Boolean(surveyId),
  })

  if (surveyQuery.isLoading) {
    return (
      <Box textAlign="center" py={12}>
        <Text color="gray.500" fontSize="lg">
          Loading survey...
        </Text>
      </Box>
    )
  }

  if (surveyQuery.isError || !surveyQuery.data) {
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
          Unable to load survey
        </AlertDescription>
      </Alert>
    )
  }

  const survey = surveyQuery.data

  return (
    <Stack spacing={8}>
      {/* Header Section */}
      <Box>
        <Button
          leftIcon={<Icon as={FiArrowLeft} />}
          variant="ghost"
          onClick={() => navigate('/teacher/surveys')}
          mb={4}
          fontWeight="600"
        >
          Back to Survey Library
        </Button>

        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          gap={4}
        >
          <HStack spacing={4} align="flex-start">
            <Box
              bgGradient="linear(135deg, brand.400, brand.600)"
              color="white"
              p={4}
              borderRadius="2xl"
              boxShadow="lg"
            >
              <Icon as={FiClipboard} boxSize={8} />
            </Box>
            <VStack align="flex-start" spacing={1}>
              <Heading size="lg" fontWeight="800">
                {survey.title}
              </Heading>
              <HStack spacing={4} fontSize="sm" color="gray.600">
                <HStack>
                  <Icon as={FiCheckCircle} />
                  <Text fontWeight="600">
                    {survey.questions.length} Question{survey.questions.length !== 1 ? 's' : ''}
                  </Text>
                </HStack>
                {survey.created_at && (
                  <Text>
                    Created {new Date(survey.created_at).toLocaleDateString()}
                  </Text>
                )}
              </HStack>
            </VStack>
          </HStack>
        </Flex>
      </Box>

      {/* Questions Grid */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {survey.questions.map((question, qIdx) => (
          <Card
            key={question.id}
            borderRadius="2xl"
            border="2px solid"
            borderColor="gray.100"
            boxShadow="lg"
            overflow="hidden"
          >
            <CardBody p={6}>
              <VStack align="stretch" spacing={4}>
                {/* Question Header */}
                <HStack justify="space-between">
                  <Badge
                    colorScheme="brand"
                    fontSize="sm"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontWeight="700"
                  >
                    Question {qIdx + 1}
                  </Badge>
                  <Text fontSize="sm" color="gray.500" fontWeight="600">
                    {question.options.length} options
                  </Text>
                </HStack>

                {/* Question Text */}
                <Heading size="md" fontWeight="700" color="gray.800">
                  {question.text}
                </Heading>

                <Divider />

                {/* Options */}
                <Stack spacing={3}>
                  {question.options.map((option, optIdx) => (
                    <Box
                      key={optIdx}
                      bg="gray.50"
                      border="2px solid"
                      borderColor="gray.100"
                      borderRadius="xl"
                      p={4}
                      _hover={{
                        borderColor: 'brand.200',
                        bg: 'brand.50',
                      }}
                      transition="all 0.2s"
                    >
                      <VStack align="stretch" spacing={2}>
                        <Text fontWeight="600" color="gray.800">
                          {option.label}
                        </Text>
                        <HStack spacing={2} flexWrap="wrap">
                          {Object.entries(option.scores).map(([key, value]) => (
                            <Badge
                              key={key}
                              colorScheme={
                                key === 'visual'
                                  ? 'purple'
                                  : key === 'auditory' //here
                                  ? 'blue'
                                  : ''
                              }
                              fontSize="xs"
                              px={2}
                              py={1}
                              borderRadius="full"
                              textTransform="capitalize"
                            >
                              {key}: {value}
                            </Badge>
                          ))}
                        </HStack>
                      </VStack>
                    </Box>
                  ))}
                </Stack>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  )
}
