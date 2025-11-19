// src/pages/teacher/TeacherSurveysPage.tsx
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  HStack,
  VStack,
  Icon,
  Badge,
  Flex,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { FiClipboard, FiPlus, FiUsers, FiCheckCircle } from 'react-icons/fi'
import { listSurveys } from '../../api/surveys'

export function TeacherSurveysPage() {
  const navigate = useNavigate()
  const surveysQuery = useQuery({
    queryKey: ['surveys'],
    queryFn: listSurveys,
  })

  const totalSurveys = surveysQuery.data?.length || 0
  const totalQuestions = surveysQuery.data?.reduce((sum, s) => sum + s.questions.length, 0) || 0

  return (
    <Stack spacing={8}>
      {/* Page Header */}
      <Box>
        <Heading size="lg" fontWeight="800" color="gray.800" mb={2}>
          Survey Library 📋
        </Heading>
        <Text color="gray.600" fontSize="lg">
          Create reusable surveys that power course baselines and live sessions
        </Text>
      </Box>

      {/* Stats Cards Row */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        {/* Total Surveys Stat */}
        <Card
           borderRadius="xl"
          border="2px solid"
          borderColor="blue.100"
          bg="blue.50"
          
          overflow="hidden"
          position="relative"
        >
          <CardBody p={6}>
            <HStack spacing={4} align="flex-start">
              <Box
                bg="whiteAlpha.300"
                p={3}
                borderRadius="xl"
                backdropFilter="blur(10px)"
              >
                <Icon as={FiClipboard} boxSize={6} color="blue.500" />
              </Box>
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="sm" fontWeight="600"opacity={0.9}>
                  Total Surveys
                </Text>
                <Text fontSize="3xl" fontWeight="800">
                  {totalSurveys}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Total Questions Stat */}
        <Card   borderRadius="xl"
          border="2px solid"
          borderColor="red.100"
          bg="red.50"
          overflow="hidden"
          position="relative">
  <CardBody p={6}>
    <HStack spacing={4}>
      <Box bg="whiteAlpha.300" p={3} borderRadius="xl">
        <Icon as={FiCheckCircle} boxSize={6} color = "red.500"/>
      </Box>
      <VStack align="flex-start" spacing={0}>
        <Text fontSize="sm" fontWeight="600" opacity={0.9}>
          Total Questions
        </Text>
        <Text fontSize="3xl" fontWeight="800">
          {totalQuestions}
        </Text>
      </VStack>
    </HStack>
  </CardBody>
</Card>


        
      </SimpleGrid>

      {/* Survey Library List */}
      <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
        <CardBody p={8}>
          <Flex justify="space-between" align="center" mb={6}>
            <HStack spacing={3}>
              <Icon as={FiClipboard} boxSize={6} color="brand.500" />
              <Heading size="md" fontWeight="700">
                Your Library
              </Heading>
            </HStack>
            <Button
              leftIcon={<Icon as={FiPlus} />}
              colorScheme="brand"
              onClick={() => navigate('/teacher/surveys/new')}
              borderRadius="xl"
              fontWeight="600"
            >
              Add Survey
            </Button>
          </Flex>

          {surveysQuery.isLoading ? (
            <Box textAlign="center" py={12}>
              <Text color="gray.500" fontSize="lg">
                Loading library...
              </Text>
            </Box>
          ) : surveysQuery.data?.length ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
              {surveysQuery.data.map((survey) => (
                <Card
                  key={survey.id}
                  borderRadius="xl"
                  border="2px solid"
                  borderColor="gray.100"
                  cursor="pointer"
                  _hover={{
                    borderColor: 'brand.400',
                    transform: 'translateY(-4px)',
                    boxShadow: 'lg',
                  }}
                  transition="all 0.2s"
                  onClick={() => navigate(`/teacher/surveys/${survey.id}`)}
                >
                  <CardBody p={5}>
                    <VStack align="stretch" spacing={4}>
                      {/* Icon and Badge */}
                      <Flex justify="space-between" align="start">
                        <Box
                          bg="brand.50"
                          p={3}
                          borderRadius="xl"
                          border="2px solid"
                          borderColor="brand.100"
                        >
                          <Icon as={FiClipboard} boxSize={6} color="brand.500" />
                        </Box>
                        <Badge
                          colorScheme="brand"
                          borderRadius="full"
                          px={3}
                          py={1}
                          fontSize="xs"
                          fontWeight="700"
                        >
                          {survey.questions.length} Q's
                        </Badge>
                      </Flex>

                      {/* Title */}
                      <VStack align="flex-start" spacing={1}>
                        <Heading size="sm" fontWeight="700" noOfLines={2}>
                          {survey.title}
                        </Heading>
                        {survey.creator_name && (
                          <HStack spacing={1} fontSize="xs" color="gray.500">
                            <Icon as={FiUsers} boxSize={3} />
                            <Text>{survey.creator_name}</Text>
                          </HStack>
                        )}
                      </VStack>

                      {/* Footer */}
                      {survey.created_at && (
                        <Text fontSize="xs" color="gray.500">
                          Created {new Date(survey.created_at).toLocaleDateString()}
                        </Text>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            // Empty State
            <VStack spacing={4} py={12}>
              <Box
                bg="gray.50"
                p={6}
                borderRadius="full"
                border="2px dashed"
                borderColor="gray.200"
              >
                <Icon as={FiClipboard} boxSize={12} color="gray.400" />
              </Box>
                  <VStack spacing={2}>
                <Text fontSize="lg" fontWeight="600" color="gray.700">
                  Library is empty
                </Text>
                <Text color="gray.500" textAlign="center" maxW="md">
                  Add your first survey to start building personalized learning experiences
                </Text>
              </VStack>
              <Button
                leftIcon={<Icon as={FiPlus} />}
                colorScheme="brand"
                size="lg"
                onClick={() => navigate('/teacher/surveys/new')}
                mt={2}
              >
                Add First Survey
              </Button>
            </VStack>
          )}
        </CardBody>
      </Card>
    </Stack>
  )
}
