// src/pages/teacher/TeacherCourseLibraryPage.tsx
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  Flex,
  Wrap,
  WrapItem,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { FiBookOpen, FiCalendar, FiCheckCircle, FiEye, FiTrash2, FiX } from 'react-icons/fi'
import { listCourses, deleteCourse } from '../../api/courses'
import { useState, useRef } from 'react'

export function TeacherCourseLibraryPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [isDeleteMode, setIsDeleteMode] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const coursesQuery = useQuery({
    queryKey: ['courses'],
    queryFn: listCourses,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast({
        title: 'Course deleted',
        status: 'success',
        duration: 3000,
      })
      onClose()
      setCourseToDelete(null)
    },
    onError: () => {
      toast({
        title: 'Failed to delete course',
        status: 'error',
        duration: 3000,
      })
    },
  })

  const handleDeleteClick = (courseId: string) => {
    setCourseToDelete(courseId)
    onOpen()
  }

  const handleConfirmDelete = () => {
    if (courseToDelete) {
      deleteMutation.mutate(courseToDelete)
    }
  }

  const totalCourses = coursesQuery.data?.length || 0

  return (
    <Stack spacing={8}>
      <Box>
        <Heading size="lg" fontWeight="800" color="gray.800" mb={2}>
          Course Library
        </Heading>
        <Text color="gray.600" fontSize="lg">
          Review every course and jump into their details
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Card border="2px solid" borderColor="blue.100" bg="blue.50">
          <CardBody p={6}>
            <HStack spacing={4} align="flex-start">
              <Box bg="whiteAlpha.300" p={3} borderRadius="xl" backdropFilter="blur(10px)">
                <Icon as={FiBookOpen} boxSize={6} color="blue.500" />
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

        <Card border="2px solid" borderColor="red.100" bg="red.50">
          <CardBody p={6}>
            <HStack spacing={4} align="flex-start">
              <Box bg="whiteAlpha.300" p={3} borderRadius="xl" backdropFilter="blur(10px)">
                <Icon as={FiCheckCircle} boxSize={6} color="red.500" />
              </Box>
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="sm" fontWeight="600" opacity={0.9}>
                  Quick Tip
                </Text>
                <Text fontSize="sm" opacity={0.9}>
                  Keep courses organized to power session planning
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
        <CardBody p={8}>
          <Flex justify="space-between" align="center" mb={6}>
            <HStack spacing={3}>
              <Icon as={FiBookOpen} boxSize={6} color="brand.500" />
              <Heading size="md" fontWeight="700">
                Your Courses
              </Heading>
              <Badge colorScheme="brand" fontSize="sm" px={3} py={1} borderRadius="full">
                {totalCourses}
              </Badge>
            </HStack>
            <HStack spacing={3}>
              <Button
                variant={isDeleteMode ? 'solid' : 'outline'}
                colorScheme={isDeleteMode ? 'gray' : 'red'}
                borderRadius="xl"
                fontWeight="600"
                leftIcon={isDeleteMode ? <FiX /> : <FiTrash2 />}
                onClick={() => setIsDeleteMode(!isDeleteMode)}
              >
                {isDeleteMode ? 'Done' : 'Delete Course'}
              </Button>
              <Button
                colorScheme="brand"
                borderRadius="xl"
                fontWeight="600"
                onClick={() => navigate('/teacher/courses/new')}
                isDisabled={isDeleteMode}
              >
                Create Course
              </Button>
            </HStack>
          </Flex>

          {coursesQuery.isLoading ? (
            <Box textAlign="center" py={12}>
              <Text color="gray.500" fontSize="lg">
                Loading courses...
              </Text>
            </Box>
          ) : coursesQuery.data?.length ? (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
              {coursesQuery.data.map((course) => (
                <Card
                  key={course.id}
                  borderRadius="xl"
                  border="2px solid"
                  borderColor={isDeleteMode ? 'red.200' : 'gray.100'}
                  cursor={isDeleteMode ? 'default' : 'pointer'}
                  _hover={
                    isDeleteMode
                      ? { borderColor: 'red.300', boxShadow: 'md' }
                      : {
                          borderColor: 'brand.400',
                          transform: 'translateY(-4px)',
                          boxShadow: 'lg',
                        }
                  }
                  transition="all 0.2s"
                  onClick={() => {
                    if (isDeleteMode) {
                      handleDeleteClick(course.id)
                    } else {
                      navigate(`/teacher/courses/${course.id}`)
                    }
                  }}
                >
                  <CardBody p={5}>
                    <VStack align="stretch" spacing={4}>
                      <Flex justify="space-between" align="start">
                        <Box
                          bg={isDeleteMode ? 'red.50' : 'brand.50'}
                          p={3}
                          borderRadius="xl"
                          border="2px solid"
                          borderColor={isDeleteMode ? 'red.100' : 'brand.100'}
                        >
                          <Icon
                            as={isDeleteMode ? FiTrash2 : FiBookOpen}
                            boxSize={6}
                            color={isDeleteMode ? 'red.500' : 'brand.500'}
                          />
                        </Box>
                        <Badge
                          colorScheme={isDeleteMode ? 'red' : 'brand'}
                          borderRadius="full"
                          px={3}
                          py={1}
                          fontSize="xs"
                          fontWeight="700"
                        >
                          {isDeleteMode ? 'DELETE' : 'COURSE'}
                        </Badge>
                      </Flex>

                      <VStack align="flex-start" spacing={1}>
                        <Heading size="sm" fontWeight="700" noOfLines={1}>
                          {course.title}
                        </Heading>
                        <HStack spacing={1} fontSize="xs" color="gray.500">
                          <Icon as={FiCalendar} boxSize={3} />
                          <Text>Created {new Date(course.created_at).toLocaleDateString()}</Text>
                        </HStack>
                      </VStack>

                      {course.mood_labels.length > 0 && (
                        <Box>
                          <Text fontSize="xs" fontWeight="600" color="gray.600" mb={2}>
                            Mood Options
                          </Text>
                          <Wrap spacing={1.5}>
                            {course.mood_labels.slice(0, 4).map((label) => (
                              <WrapItem key={label}>
                                <Badge
                                  size="sm"
                                  colorScheme="purple"
                                  borderRadius="full"
                                  fontSize="xs"
                                  px={2}
                                  py={1}
                                >
                                  {label}
                                </Badge>
                              </WrapItem>
                            ))}
                            {course.mood_labels.length > 4 && (
                              <WrapItem>
                                <Badge
                                  size="sm"
                                  colorScheme="gray"
                                  borderRadius="full"
                                  fontSize="xs"
                                  px={2}
                                  py={1}
                                >
                                  +{course.mood_labels.length - 4}
                                </Badge>
                              </WrapItem>
                            )}
                          </Wrap>
                        </Box>
                      )}

                      <Button
                        rightIcon={!isDeleteMode ? <Icon as={FiEye} /> : undefined}
                        variant={isDeleteMode ? 'solid' : 'outline'}
                        colorScheme={isDeleteMode ? 'red' : 'brand'}
                        size="sm"
                        borderRadius="lg"
                        fontWeight="600"
                        onClick={(event) => {
                          event.stopPropagation()
                          if (isDeleteMode) {
                            handleDeleteClick(course.id)
                          } else {
                            navigate(`/teacher/courses/${course.id}`)
                          }
                        }}
                      >
                        {isDeleteMode ? 'Delete This Course' : 'View Details'}
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <VStack spacing={4} py={12}>
              <Box
                bg="gray.50"
                p={6}
                borderRadius="full"
                border="2px dashed"
                borderColor="gray.200"
              >
                <Icon as={FiBookOpen} boxSize={12} color="gray.400" />
              </Box>
              <VStack spacing={2}>
                <Text fontSize="lg" fontWeight="600" color="gray.700">
                  No courses yet
                </Text>
                <Text color="gray.500" textAlign="center" maxW="md">
                  Head to Create Course to build your first one
                </Text>
              </VStack>
            </VStack>
          )}
        </CardBody>
      </Card>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Course
            </AlertDialogHeader>

            <AlertDialogBody>
              If you delete this course, all the sessions and submission history will be deleted. Are you sure?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} borderRadius="lg">
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleConfirmDelete}
                ml={3}
                borderRadius="lg"
                isLoading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Stack>
  )
}
