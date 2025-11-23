// src/components/CourseSearch.tsx
import {
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Box,
  VStack,
  Text,
  HStack,
  Spinner,
  useOutsideClick,
} from '@chakra-ui/react'
import { FiSearch, FiBook } from 'react-icons/fi'
import { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { listCourses } from '../api/courses'

interface CourseSearchProps {
  size?: 'sm' | 'md' | 'lg'
  placeholder?: string
}

export function CourseSearch({ size = 'md', placeholder = 'Search your courses...' }: CourseSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Fetch courses - the API returns Course[] directly, not { courses: Course[] }
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: listCourses,
  })

  // Filter courses based on search query
  const filteredCourses = (courses || []).filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Close dropdown when clicking outside
  useOutsideClick({
    ref: ref,
    handler: () => setIsOpen(false),
  })

  const handleSelectCourse = (courseId: string) => {
    navigate(`/teacher/courses/${courseId}`)
    setSearchQuery('')
    setIsOpen(false)
  }

  const showDropdown = isOpen && searchQuery.length > 0

  return (
    <Box position="relative" w="full" ref={ref}>
      <InputGroup size={size}>
        <InputLeftElement pointerEvents="none">
          <Icon as={FiSearch} color="gray.400" />
        </InputLeftElement>
        <Input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          borderRadius="xl"
          bg="gray.50"
          border="none"
          _focus={{ bg: 'white', boxShadow: 'sm' }}
        />
      </InputGroup>

      {/* Dropdown Results */}
      {showDropdown && (
        <Box
          position="absolute"
          top="calc(100% + 8px)"
          left="0"
          right="0"
          bg="white"
          borderRadius="xl"
          boxShadow="xl"
          border="1px solid"
          borderColor="gray.200"
          maxH="400px"
          overflowY="auto"
          zIndex={1500}
          py={2}
        >
          {isLoading ? (
            <Box p={4} textAlign="center">
              <Spinner size="sm" color="purple.500" />
              <Text fontSize="sm" color="gray.500" mt={2}>
                Loading courses...
              </Text>
            </Box>
          ) : filteredCourses.length > 0 ? (
            <VStack spacing={0} align="stretch">
              {filteredCourses.map((course) => (
                <Box
                  key={course.id}
                  px={4}
                  py={3}
                  cursor="pointer"
                  _hover={{ bg: 'purple.50' }}
                  onClick={() => handleSelectCourse(course.id)}
                  transition="all 0.2s"
                >
                  <HStack spacing={3}>
                    <Box
                      bg="purple.100"
                      p={2}
                      borderRadius="lg"
                      color="purple.600"
                    >
                      <Icon as={FiBook} boxSize={4} />
                    </Box>
                    <VStack align="flex-start" spacing={0} flex="1">
                      <Text fontSize="sm" fontWeight="600" color="gray.800">
                        {course.title}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        ID: {course.id}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          ) : (
            <Box p={4} textAlign="center">
              <Text fontSize="sm" color="gray.500">
                No courses found for "{searchQuery}"
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}