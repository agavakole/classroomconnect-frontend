// src/pages/teacher/TeacherActivitiesPage.tsx
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Input,
  Stack,
  Tag,
  TagLabel,
  Text,
  Wrap,
  WrapItem,
  HStack,
  VStack,
  Icon,
  SimpleGrid,
  FormControl,
  FormLabel,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiGrid,
  FiPlus,
  FiFilter,
  FiTag,
  FiEye,
  FiLayers,
  FiChevronDown,
} from 'react-icons/fi'
import { listActivities, listActivityTypes } from '../../api/activities'

export function TeacherActivitiesPage() {
  const navigate = useNavigate()
  const [typeFilter, setTypeFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')

  const activitiesQuery = useQuery({
    queryKey: ['activities'],
    queryFn: listActivities,
  })

  const activityTypesQuery = useQuery({
    queryKey: ['activityTypes'],
    queryFn: listActivityTypes,
  })

  const filteredActivities = useMemo(() => {
    if (!activitiesQuery.data) return []
    return activitiesQuery.data.filter((activity) => {
      const typeMatches = typeFilter ? activity.type === typeFilter : true
      const tagMatches = tagFilter
        ? activity.tags.some((tag) => tag.toLowerCase().includes(tagFilter.toLowerCase()))
        : true
      return typeMatches && tagMatches
    })
  }, [activitiesQuery.data, typeFilter, tagFilter])

  const totalActivities = activitiesQuery.data?.length || 0

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
              Activity Library
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

      
        <Text color="gray.600" fontSize="lg">
          Create and manage reusable activities for personalized recommendations
        </Text>
      </Box>
      {/* Stats Cards Row */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {/* Total Activities Stat */}
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
                <Icon as={FiGrid} boxSize={6} color="blue.500" />
              </Box>
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="sm" fontWeight="600" opacity={0.9}>
                  Total Activities
                </Text>
                <Text fontSize="3xl" fontWeight="800">
                  {totalActivities}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Create Activity Action Card */}
        <Card
         borderRadius="xl"
          border="2px solid"
          borderColor="red.100"
          bg="red.50"
          cursor="pointer"
          onClick={() => navigate('/teacher/activities/new')}
          _hover={{ transform: 'translateY(-4px)', boxShadow: '2xl' }}
          transition="all 0.3s"
        >
          <CardBody p={6}>
            <VStack spacing={3} align="stretch">
              <Flex justify="space-between" align="center">
                <Icon as={FiPlus} boxSize={8} color="red.500"/>
                <Box
                  bg="whiteAlpha.300"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="700"
                >
                  Quick Action
                </Box>
              </Flex>
              <VStack align="flex-start" spacing={0}>
                <Text fontSize="xl" fontWeight="800">
                  Create Activity
                </Text>
                <Text fontSize="sm" opacity={0.9}>
                  Build new learning content
                </Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Filters Card */}
      <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
        <CardBody p={6}>
          <VStack align="stretch" spacing={5}>
            <HStack spacing={3}>
              <Icon as={FiFilter} boxSize={6} color="accent.500" />
              <Heading size="md" fontWeight="700">
                Filter Activities
              </Heading>
              {(typeFilter || tagFilter) && (
                <Badge colorScheme="accent" fontSize="xs" px={2} py={1} borderRadius="full">
                  {filteredActivities.length} results
                </Badge>
              )}
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <Box mb={2}>
                  <HStack spacing={2}>
                    <Icon as={FiLayers} boxSize={4} color="accent.500" />
                    <Text fontWeight="600" fontSize="sm" as="label">
                      Activity Type
                    </Text>
                  </HStack>
                </Box>

                {/* Custom Menu Dropdown */}
                <Menu matchWidth>
                  <MenuButton
                    as={Button}
                    rightIcon={<Icon as={FiChevronDown} />}
                    w="full"
                    size="lg"
                    borderRadius="xl"
                    border="2px solid"
                    borderColor="gray.200"
                    fontWeight="600"
                    textAlign="left"
                    justifyContent="space-between"
                    _hover={{ borderColor: 'accent.300' }}
                    _active={{ borderColor: 'accent.400' }}
                    bg="white"
                    color={typeFilter ? 'gray.800' : 'gray.400'}
                  >
                    {typeFilter || 'All types'}
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
                    <MenuItem
                      onClick={() => setTypeFilter('')}
                      bg={!typeFilter ? 'accent.50' : 'transparent'}
                      fontWeight={!typeFilter ? '700' : '500'}
                      color={!typeFilter ? 'accent.700' : 'gray.700'}
                      _hover={{ bg: 'accent.50' }}
                      borderRadius="lg"
                      mx={2}
                      fontSize="md"
                    >
                      All types
                    </MenuItem>
                    {activityTypesQuery.data?.map((type) => (
                      <MenuItem
                        key={type.type_name}
                        onClick={() => setTypeFilter(type.type_name)}
                        bg={typeFilter === type.type_name ? 'accent.50' : 'transparent'}
                        fontWeight={typeFilter === type.type_name ? '700' : '500'}
                        color={typeFilter === type.type_name ? 'accent.700' : 'gray.700'}
                        _hover={{ bg: 'accent.50' }}
                        borderRadius="lg"
                        mx={2}
                        fontSize="md"
                      >
                        {type.type_name}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="tag-filter" fontWeight="600" fontSize="sm" mb={2}>
                  <HStack spacing={2}>
                    <Icon as={FiTag} boxSize={4} color="accent.500" />
                    <Text>Search Tags</Text>
                  </HStack>
                </FormLabel>
                <Input
                  id="tag-filter"
                  value={tagFilter}
                  onChange={(event) => setTagFilter(event.target.value)}
                  placeholder="Enter tag keyword..."
                  size="lg"
                  borderRadius="xl"
                  border="2px solid"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'accent.300' }}
                  _focus={{
                    borderColor: 'accent.400',
                    boxShadow: '0 0 0 1px var(--chakra-colors-accent-400)',
                  }}
                />
              </FormControl>
            </SimpleGrid>

            {(typeFilter || tagFilter) && (
              <HStack>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="accent"
                  onClick={() => {
                    setTypeFilter('')
                    setTagFilter('')
                  }}
                  borderRadius="lg"
                >
                  Clear Filters
                </Button>
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Activities List */}
      <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
        <CardBody p={{ base: 6, md: 8 }}>
          <Flex
            justify="space-between"
            align={{ base: 'flex-start', md: 'center' }}
            mb={6}
            direction={{ base: 'column', md: 'row' }}
            gap={4}
          >
            <HStack spacing={3}>
              <Icon as={FiGrid} boxSize={6} color="brand.500" />
              <Heading size="md" fontWeight="700">
                Your Activities
              </Heading>
              <Badge colorScheme="brand" fontSize="sm" px={3} py={1} borderRadius="full">
                {filteredActivities.length}
              </Badge>
            </HStack>
            <Button
              leftIcon={<Icon as={FiPlus} />}
              colorScheme="brand"
              onClick={() => navigate('/teacher/activities/new')}
              borderRadius="xl"
              fontWeight="600"
              w={{ base: 'full', md: 'auto' }}
            >
              New Activity
            </Button>
          </Flex>

          {activitiesQuery.isLoading ? (
            <Box textAlign="center" py={12}>
              <Text color="gray.500" fontSize="lg">
                Loading activities...
              </Text>
            </Box>
          ) : filteredActivities.length ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
              {filteredActivities.map((activity) => (
                <Card
                  key={activity.id}
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
                  onClick={() => navigate(`/teacher/activities/${activity.id}`)}
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
                          <Icon as={FiGrid} boxSize={6} color="brand.500" />
                        </Box>
                        <Badge
                          colorScheme="purple"
                          borderRadius="full"
                          px={3}
                          py={1}
                          fontSize="xs"
                          fontWeight="700"
                        >
                          {activity.type}
                        </Badge>
                      </Flex>

                      {/* Title and Summary */}
                      <VStack align="flex-start" spacing={2}>
                        <Heading size="sm" fontWeight="700" noOfLines={2}>
                          {activity.name}
                        </Heading>
                        <Text fontSize="sm" color="gray.600" noOfLines={2}>
                          {activity.summary}
                        </Text>
                      </VStack>

                      {/* Tags */}
                      {activity.tags.length > 0 && (
                        <Wrap>
                          {activity.tags.slice(0, 3).map((tag) => (
                            <WrapItem key={tag}>
                              <Tag
                                size="sm"
                                colorScheme="accent"
                                borderRadius="full"
                                fontSize="xs"
                              >
                                <TagLabel>{tag}</TagLabel>
                              </Tag>
                            </WrapItem>
                          ))}
                          {activity.tags.length > 3 && (
                            <WrapItem>
                              <Tag size="sm" colorScheme="gray" borderRadius="full" fontSize="xs">
                                <TagLabel>+{activity.tags.length - 3}</TagLabel>
                              </Tag>
                            </WrapItem>
                          )}
                        </Wrap>
                      )}

                      {/* View Button */}
                      <Button
                        rightIcon={<Icon as={FiEye} />}
                        variant="outline"
                        colorScheme="brand"
                        size="sm"
                        borderRadius="lg"
                        fontWeight="600"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/teacher/activities/${activity.id}`)
                        }}
                      >
                        View Details
                      </Button>
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
                <Icon as={FiGrid} boxSize={12} color="gray.400" />
              </Box>
              <VStack spacing={2}>
                <Text fontSize="lg" fontWeight="600" color="gray.700">
                  {activitiesQuery.data?.length
                    ? 'No activities match these filters'
                    : 'No activities yet'}
                </Text>
                <Text color="gray.500" textAlign="center" maxW="md">
                  {activitiesQuery.data?.length
                    ? 'Try adjusting your filters or clearing them'
                    : 'Create your first activity to get started with personalized learning'}
                </Text>
              </VStack>
              {!activitiesQuery.data?.length && (
                <Button
                  leftIcon={<Icon as={FiPlus} />}
                  colorScheme="brand"
                  size="lg"
                  onClick={() => navigate('/teacher/activities/new')}
                  mt={2}
                  borderRadius="xl"
                  fontWeight="600"
                >
                  Create First Activity
                </Button>
              )}
            </VStack>
          )}
        </CardBody>
      </Card>
    </Stack>
  )
}