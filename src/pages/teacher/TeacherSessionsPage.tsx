// src/pages/teacher/TeacherSessionsPage.tsx
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  FormLabel,
  Heading,
  Stack,
  Text,
  HStack,
  VStack,
  Icon,
  SimpleGrid,
  Flex,
  Avatar,
  Wrap,
  WrapItem,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiPlayCircle,
  FiClock,
  FiCheckCircle,
  FiPlus,
  FiActivity,
  FiEye,
  FiArrowRight,
} from 'react-icons/fi'
import { listCourses } from '../../api/courses'
import { listCourseSessions } from '../../api/sessions'

export function TeacherSessionsPage() {
  const navigate = useNavigate()
  const [courseId, setCourseId] = useState('')

  const coursesQuery = useQuery({
    queryKey: ['courses'],
    queryFn: listCourses,
  })

  const sessionsQuery = useQuery({
    queryKey: ['courseSessions', courseId],
    queryFn: () => listCourseSessions(courseId),
    enabled: Boolean(courseId),
  })

  const selectedCourse = coursesQuery.data?.find((c) => c.id === courseId)
  const activeSessions = sessionsQuery.data?.filter((s) => !s.closed_at) || []
  const closedSessions = sessionsQuery.data?.filter((s) => s.closed_at) || []

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
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color="gray.900" fontWeight="600" cursor="default">
              Session Library
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <Heading size="lg" fontWeight="800" color="gray.800" mb={2}>
          Session Library
        </Heading>
        <Text color="gray.600" fontSize="lg">
          Review and manage your teaching sessions
        </Text>
      </Box>

      {/* Course Selection Card */}
      <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
        <CardBody p={{ base: 4, md: 6 }}>
          <Stack spacing={6}>
            <HStack spacing={3}>
              <Icon as={FiPlayCircle} boxSize={6} color="brand.500" />
              <Heading size="md" fontWeight="700">
                Select Course
              </Heading>
            </HStack>

            <Box>
              <FormLabel fontWeight="600" fontSize="sm" mb={2}>
                Tap a course to view its sessions
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
                          onClick={() => setCourseId(course.id)}
                          borderWidth={isSelected ? undefined : '2px'}
                          size={{ base: 'sm', md: 'md' }}
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
            </Box>

            {selectedCourse && (
              <HStack
                p={4}
                bg="brand.50"
                borderRadius="xl"
                border="1px solid"
                borderColor="brand.100"
                spacing={3}
              >
                <Icon as={FiCheckCircle} color="brand.500" boxSize={5} />
                <VStack align="flex-start" spacing={0} flex={1}>
                  <Text fontWeight="700" color="brand.900">
                    {selectedCourse.title}
                  </Text>
                  <HStack fontSize="xs" color="brand.700" spacing={2}>
                    <Text>
                      {activeSessions.length} active • {closedSessions.length} closed
                    </Text>
                  </HStack>
                </VStack>
              </HStack>
            )}
          </Stack>
        </CardBody>
      </Card>

      {/* Sessions Content */}
      {courseId ? (
        sessionsQuery.isLoading ? (
          <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
            <CardBody p={12}>
              <VStack spacing={4}>
                <Icon as={FiActivity} boxSize={12} color="gray.300" />
                <Text color="gray.500" fontSize="lg">
                  Loading sessions...
                </Text>
              </VStack>
            </CardBody>
          </Card>
        ) : sessionsQuery.isError ? (
          <Alert
            status="error"
            borderRadius="xl"
            bg="red.50"
            border="2px solid"
            borderColor="red.200"
            p={6}
          >
            <AlertIcon color="red.500" />
            <AlertDescription color="red.700" fontWeight="600">
              Unable to load sessions for this course
            </AlertDescription>
          </Alert>
        ) : sessionsQuery.data?.length ? (
          <Stack spacing={6}>
            {/* Active Sessions */}
            {activeSessions.length > 0 && (
              <Card borderRadius="2xl" border="2px solid" borderColor="green.100" boxShadow="xl">
                <CardBody p={{ base: 4, md: 6 }}>
                  <HStack spacing={3} mb={6}>
                    <Icon as={FiActivity} boxSize={6} color="green.500" />
                    <Heading size="md" fontWeight="700">
                      Active Sessions ({activeSessions.length})
                    </Heading>
                    <Badge colorScheme="green" fontSize="xs" px={2} py={1} borderRadius="full">
                      LIVE
                    </Badge>
                  </HStack>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                    {activeSessions.map((session) => (
                      <Card
                        key={session.session_id}
                        borderRadius="xl"
                        border="2px solid"
                        borderColor="green.200"
                        bg="green.50"
                        _hover={{
                          transform: 'translateY(-4px)',
                          boxShadow: 'lg',
                          borderColor: 'green.300',
                        }}
                        transition="all 0.2s"
                      >
                        <CardBody p={5}>
                          <VStack align="stretch" spacing={4}>
                            {/* Session Header */}
                            <Flex
                              direction={{ base: 'column', sm: 'row' }}
                              justify="space-between"
                              align={{ base: 'flex-start', sm: 'center' }}
                              gap={2}
                            >
                              <HStack spacing={3}>
                                <Box
                                  bg="green.500"
                                  color="white"
                                  p={2}
                                  borderRadius="lg"
                                >
                                  <Icon as={FiPlayCircle} boxSize={5} />
                                </Box>
                                <VStack align="flex-start" spacing={0}>
                                  <Text fontWeight="700" fontSize="sm" color="green.900">
                                    Session {session.session_id.slice(0, 8)}...
                                  </Text>
                                  <HStack fontSize="xs" color="green.700">
                                    <Icon as={FiClock} boxSize={3} />
                                    <Text>
                                      {new Date(session.started_at).toLocaleString()}
                                    </Text>
                                  </HStack>
                                </VStack>
                              </HStack>
                              <Badge
                                colorScheme="green"
                                fontSize="xs"
                                px={2}
                                py={1}
                                borderRadius="full"
                              >
                                🟢 Open
                              </Badge>
                            </Flex>

                            {/* Session Details */}
                            <Stack spacing={2}>
                              <HStack justify="space-between" fontSize="sm">
                                <Text color="green.700">Join Token:</Text>
                                <Badge
                                  colorScheme="green"
                                  fontSize="sm"
                                  px={3}
                                  py={1}
                                  borderRadius="lg"
                                  fontFamily="mono"
                                >
                                  {session.join_token}
                                </Badge>
                              </HStack>
                              <HStack justify="space-between" fontSize="sm">
                                <Text color="green.700">Survey:</Text>
                                <Badge
                                  colorScheme={session.require_survey ? 'purple' : 'orange'}
                                  fontSize="xs"
                                  px={2}
                                  py={1}
                                  borderRadius="full"
                                >
                                  {session.require_survey ? 'Required' : 'Optional'}
                                </Badge>
                              </HStack>
                            </Stack>

                            {/* View Button */}
                            <Button
                              rightIcon={<Icon as={FiEye} />}
                              colorScheme="green"
                              onClick={() =>
                                navigate(`/teacher/sessions/${session.session_id}/dashboard`)
                              }
                              size="sm"
                              borderRadius="lg"
                              fontWeight="600"
                            >
                              View Dashboard
                            </Button>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </CardBody>
              </Card>
            )}

            {/* Closed Sessions */}
            {closedSessions.length > 0 && (
              <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
                <CardBody p={{ base: 4, md: 6 }}>
                  <HStack spacing={3} mb={6}>
                    <Icon as={FiCheckCircle} boxSize={6} color="gray.500" />
                    <Heading size="md" fontWeight="700">
                      Closed Sessions ({closedSessions.length})
                    </Heading>
                  </HStack>

                  <Stack spacing={3}>
                    {closedSessions.map((session) => (
                      <Card
                        key={session.session_id}
                        borderRadius="xl"
                        border="2px solid"
                        borderColor="gray.100"
                        _hover={{
                          borderColor: 'brand.200',
                          bg: 'brand.50',
                        }}
                        transition="all 0.2s"
                      >
                        <CardBody p={4}>
                          <Flex
                            direction={{ base: 'column', md: 'row' }}
                            justify="space-between"
                            align={{ base: 'flex-start', md: 'center' }}
                            gap={4}
                          >
                            <HStack spacing={3} flex={1}>
                              <Avatar
                                icon={<Icon as={FiPlayCircle} />}
                                bg="gray.200"
                                color="gray.600"
                                size="sm"
                              />
                              <VStack align="flex-start" spacing={1}>
                                <Text fontWeight="700" fontSize="sm">
                                  Session {session.session_id.slice(0, 8)}...
                                </Text>
                                <HStack spacing={2} fontSize="xs" color="gray.500" flexWrap="wrap">
                                  <HStack>
                                    <Icon as={FiClock} boxSize={3} />
                                    <Text>
                                      {new Date(session.started_at).toLocaleDateString()}
                                    </Text>
                                  </HStack>
                                  <Text display={{ base: 'none', sm: 'block' }}>•</Text>
                                  <Badge
                                    size="sm"
                                    colorScheme={session.require_survey ? 'purple' : 'orange'}
                                  >
                                    {session.require_survey ? 'Survey' : 'No Survey'}
                                  </Badge>
                                  <Text display={{ base: 'none', sm: 'block' }}>•</Text>
                                  <Text fontFamily="mono" display={{ base: 'none', sm: 'block' }}>
                                    {session.join_token}
                                  </Text>
                                </HStack>
                              </VStack>
                            </HStack>

                            <Button
                              rightIcon={<Icon as={FiArrowRight} />}
                              variant="outline"
                              colorScheme="brand"
                              onClick={() =>
                                navigate(`/teacher/sessions/${session.session_id}/dashboard`)
                              }
                              size="sm"
                              borderRadius="lg"
                              fontWeight="600"
                              w={{ base: '100%', md: 'auto' }}
                            >
                              View Results
                            </Button>
                          </Flex>
                        </CardBody>
                      </Card>
                    ))}
                  </Stack>
                </CardBody>
              </Card>
            )}
          </Stack>
        ) : (
          // Empty State - No Sessions
          <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
            <CardBody p={12}>
              <VStack spacing={4}>
                <Box
                  bg="gray.50"
                  p={6}
                  borderRadius="full"
                  border="2px dashed"
                  borderColor="gray.200"
                >
                  <Icon as={FiPlayCircle} boxSize={12} color="gray.400" />
                </Box>
                <VStack spacing={2}>
                  <Text fontSize="lg" fontWeight="600" color="gray.700">
                    No sessions yet
                  </Text>
                  <Text color="gray.500" textAlign="center" maxW="md">
                    Create your first session to start engaging with students
                  </Text>
                </VStack>
                <Button
                  leftIcon={<Icon as={FiPlus} />}
                  colorScheme="brand"
                  size="lg"
                  onClick={() =>
                    navigate('/teacher/sessions/new', {
                      state: { courseId },
                    })
                  }
                  mt={2}
                  borderRadius="xl"
                  fontWeight="600"
                >
                  Create First Session
                </Button>
              </VStack>
            </CardBody>
          </Card>
        )
      ) : (
        // Empty State - No Course Selected
        <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
          <CardBody p={12}>
            <VStack spacing={4}>
              <Box
                bg="brand.50"
                p={6}
                borderRadius="full"
                border="2px dashed"
                borderColor="brand.200"
              >
                <Icon as={FiPlayCircle} boxSize={12} color="brand.400" />
              </Box>
              <VStack spacing={2}>
                <Text fontSize="lg" fontWeight="600" color="gray.700">
                  Select a course to begin
                </Text>
                <Text color="gray.500" textAlign="center" maxW="md">
                  Choose a course from the dropdown above to view its sessions
                </Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Create New Session Button */}
      <Card
        borderRadius="2xl"
        border="2px dashed"
        borderColor="brand.200"
        bg="brand.50"
        cursor="pointer"
        onClick={() =>
          navigate('/teacher/sessions/new', {
            state: { courseId },
          })
        }
        _hover={{
          borderColor: 'brand.400',
          bg: 'brand.100',
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        }}
        transition="all 0.2s"
      >
        <CardBody p={6}>
          <HStack spacing={4} justify="center">
            <Icon as={FiPlus} boxSize={6} color="brand.500" />
            <VStack align="flex-start" spacing={0}>
              <Text fontWeight="700" fontSize="lg" color="brand.700">
                Create New Session
              </Text>
              <Text fontSize="sm" color="brand.600">
                Start a new interactive teaching session
              </Text>
            </VStack>
          </HStack>
        </CardBody>
      </Card>
    </Stack>
  )
}