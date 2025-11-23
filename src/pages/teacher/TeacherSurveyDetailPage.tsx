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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { FiClipboard, FiCheckCircle } from 'react-icons/fi'
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
            <BreadcrumbLink color="gray.900" fontWeight="600" cursor="default" noOfLines={1}>
              {survey.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          gap={4}
        >
          <HStack spacing={4} align="flex-start">
  
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
                                  : key === 'auditory'
                                  ? 'blue'
                                  : 'gray'
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