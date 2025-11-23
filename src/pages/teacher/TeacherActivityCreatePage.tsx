// src/pages/teacher/TeacherActivityCreatePage.tsx
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Textarea,
  Wrap,
  HStack,
  VStack,
  Icon,
  Badge,
  Divider,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  FiGrid,
  FiPlus,
  FiCheckCircle,
  FiTag,
  FiLayers,
  FiAlertCircle,
  FiChevronDown,
} from 'react-icons/fi'
import { createActivity, listActivityTypes } from '../../api/activities'
import { ApiError } from '../../api/client'

export function TeacherActivityCreatePage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [summary, setSummary] = useState('')
  const [typeName, setTypeName] = useState('')
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [tagsInput, setTagsInput] = useState('')
  const [tags, setTags] = useState<string[]>([])

  const activityTypesQuery = useQuery({
    queryKey: ['activityTypes'],
    queryFn: listActivityTypes,
  })

  const selectedType = useMemo(
    () => activityTypesQuery.data?.find((item) => item.type_name === typeName),
    [activityTypesQuery.data, typeName],
  )

  const createMutation = useMutation({
    mutationFn: () =>
      createActivity({
        name,
        summary,
        type: typeName,
        tags,
        content_json: Object.fromEntries(
          Object.entries(fieldValues).filter(([, value]) => value && value.trim()),
        ),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      navigate('/teacher/activities')
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createMutation.mutate()
  }

  const handleAddTag = () => {
    const trimmed = tagsInput.trim()
    if (!trimmed || tags.includes(trimmed)) return
    setTags((prev) => [...prev, trimmed])
    setTagsInput('')
  }

  const allFields = selectedType
    ? [...selectedType.required_fields, ...selectedType.optional_fields]
    : []

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
              onClick={() => navigate('/teacher/activities')}
              color="gray.600"
              _hover={{ color: 'brand.600', textDecoration: 'none' }}
              cursor="pointer"
            >
              Activity Library
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color="gray.900" fontWeight="600" cursor="default">
              Create Activity
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <HStack spacing={4} align="flex-start">
          <VStack align="flex-start" spacing={1}>
            <Heading size="lg" fontWeight="800">
              Create Activity
            </Heading>
            <Text color="gray.600" fontSize="md">
              Build a new learning activity for personalized recommendations
            </Text>
          </VStack>
        </HStack>
      </Box>

      {/* Main Form */}
      <Box as="form" onSubmit={handleSubmit}>
        <Stack spacing={6}>
          {/* Basic Information Card */}
          <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
            <CardBody p={6}>
              <VStack align="stretch" spacing={5}>
                <HStack spacing={3}>
                  <Icon as={FiCheckCircle} boxSize={6} color="brand.500" />
                  <Heading size="md" fontWeight="700">
                    Basic Information
                  </Heading>
                  <Badge colorScheme="red" fontSize="xs" px={2} py={1} borderRadius="full">
                    Required
                  </Badge>
                </HStack>

                <Stack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel htmlFor="activity-name" fontWeight="600" fontSize="sm" mb={2}>
                      Activity Name
                    </FormLabel>
                    <Input
                      id="activity-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="e.g., Interactive Math Quiz"
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

                  <FormControl isRequired>
                    <FormLabel htmlFor="activity-summary" fontWeight="600" fontSize="sm" mb={2}>
                      Summary
                    </FormLabel>
                    <Textarea
                      id="activity-summary"
                      value={summary}
                      onChange={(event) => setSummary(event.target.value)}
                      placeholder="Brief description of what students will do..."
                      rows={3}
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
                </Stack>
              </VStack>
            </CardBody>
          </Card>

          {/* Activity Type Card */}
          <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
            <CardBody p={6}>
              <VStack align="stretch" spacing={5}>
                <HStack spacing={3}>
                  <Icon as={FiLayers} boxSize={6} color="purple.500" />
                  <Heading size="md" fontWeight="700">
                    Activity Type
                  </Heading>
                  <Badge colorScheme="red" fontSize="xs" px={2} py={1} borderRadius="full">
                    Required
                  </Badge>
                </HStack>

                <FormControl isRequired>
                  <Box mb={2}>
                    <Text fontWeight="600" fontSize="sm" as="label">
                      Select Type
                    </Text>
                  </Box>

                  {/* Custom Menu Dropdown */}
                  <Menu matchWidth>
                    <MenuButton
                      id="activity-type-select"
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
                      _hover={{ borderColor: 'purple.300' }}
                      _active={{ borderColor: 'purple.400' }}
                      bg="white"
                      color={typeName ? 'gray.800' : 'gray.400'}
                      isDisabled={activityTypesQuery.isLoading}
                    >
                      {activityTypesQuery.isLoading
                        ? 'Loading types...'
                        : typeName || 'Choose an activity type'}
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
                      {activityTypesQuery.data?.map((type) => (
                        <MenuItem
                          key={type.type_name}
                          onClick={() => setTypeName(type.type_name)}
                          bg={typeName === type.type_name ? 'purple.50' : 'transparent'}
                          fontWeight={typeName === type.type_name ? '700' : '500'}
                          color={typeName === type.type_name ? 'purple.700' : 'gray.700'}
                          _hover={{ bg: 'purple.50' }}
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

                <Text color="purple.700" fontWeight="600" fontSize="sm">
                  Missing a type? Please contact your administrator.
                </Text>

                {selectedType && (
                  <Box
                    p={4}
                    bg="purple.50"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="purple.100"
                  >
                    <HStack spacing={3}>
                      <Icon as={FiCheckCircle} color="purple.500" boxSize={5} />
                      <VStack align="flex-start" spacing={0} flex={1}>
                        <Text fontWeight="700" color="purple.900">
                          {selectedType.type_name}
                        </Text>
                        <Text fontSize="xs" color="purple.700">
                          {selectedType.required_fields.length} required fields •{' '}
                          {selectedType.optional_fields.length} optional fields
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Dynamic Fields Card */}
          {selectedType && allFields.length > 0 && (
            <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
              <CardBody p={6}>
                <VStack align="stretch" spacing={5}>
                  <HStack spacing={3}>
                    <Icon as={FiGrid} boxSize={6} color="accent.500" />
                    <Heading size="md" fontWeight="700">
                      Activity Fields
                    </Heading>
                  </HStack>

                  <Box
                    p={4}
                    bg="blue.50"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="blue.100"
                  >
                    <HStack spacing={3} align="start">
                      <Icon as={FiAlertCircle} color="blue.500" boxSize={5} mt={0.5} />
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="700" color="blue.900">
                          Type-Specific Fields
                        </Text>
                        <Text fontSize="sm" color="blue.800">
                          Fill in the fields specific to this activity type
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  <Stack spacing={4}>
                    {allFields.map((field) => {
                      const isRequired = selectedType.required_fields.includes(field)
                      const fieldId = `field-${field}`
                      return (
                        <FormControl key={field} isRequired={isRequired}>
                          <HStack justify="space-between" mb={2}>
                            <FormLabel htmlFor={fieldId} fontWeight="600" fontSize="sm" mb={0}>
                              {field.replaceAll('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </FormLabel>
                            <Badge
                              colorScheme={isRequired ? 'red' : 'gray'}
                              fontSize="xs"
                              px={2}
                              py={1}
                              borderRadius="full"
                            >
                              {isRequired ? 'Required' : 'Optional'}
                            </Badge>
                          </HStack>
                          <Input
                            id={fieldId}
                            value={fieldValues[field] ?? ''}
                            onChange={(event) =>
                              setFieldValues((prev) => ({ ...prev, [field]: event.target.value }))
                            }
                            placeholder={`Enter ${field.replaceAll('_', ' ')}...`}
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
                      )
                    })}
                  </Stack>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Tags Card */}
          <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
            <CardBody p={6}>
              <VStack align="stretch" spacing={5}>
                <HStack spacing={3}>
                  <Icon as={FiTag} boxSize={6} color="accent.500" />
                  <Heading size="md" fontWeight="700">
                    Tags
                  </Heading>
                  {tags.length > 0 && (
                    <Badge colorScheme="accent" fontSize="xs" px={2} py={1} borderRadius="full">
                      {tags.length}
                    </Badge>
                  )}
                </HStack>

                <FormControl>
                  <FormLabel htmlFor="tag-input" fontWeight="600" fontSize="sm" mb={2}>
                    Add Tags
                  </FormLabel>
                  <Stack spacing={3} direction={{ base: 'column', sm: 'row' }}>
                    <Input
                      id="tag-input"
                      value={tagsInput}
                      onChange={(event) => setTagsInput(event.target.value)}
                      placeholder="Enter tag and press Add"
                      size="lg"
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.200"
                      flex={1}
                      _hover={{ borderColor: 'accent.300' }}
                      _focus={{
                        borderColor: 'accent.400',
                        boxShadow: '0 0 0 1px var(--chakra-colors-accent-400)',
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          handleAddTag()
                        }
                      }}
                    />
                    <Button
                      onClick={handleAddTag}
                      isDisabled={!tagsInput.trim()}
                      colorScheme="accent"
                      size="lg"
                      px={8}
                      borderRadius="xl"
                      fontWeight="600"
                      w={{ base: 'full', sm: 'auto' }}
                    >
                      Add
                    </Button>
                  </Stack>
                </FormControl>

                {tags.length > 0 ? (
                  <>
                    <Divider />
                    <Box>
                      <Text fontSize="sm" fontWeight="600" color="gray.600" mb={3}>
                        Current Tags
                      </Text>
                      <Wrap spacing={2}>
                        {tags.map((tag) => (
                          <Tag
                            key={tag}
                            size="lg"
                            colorScheme="accent"
                            borderRadius="full"
                            px={4}
                            py={2}
                          >
                            <TagLabel fontWeight="600">{tag}</TagLabel>
                            <TagCloseButton
                              onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                            />
                          </Tag>
                        ))}
                      </Wrap>
                    </Box>
                  </>
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
                      No tags yet. Add tags to help organize and search for this activity.
                    </Text>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Error Alert */}
          {createMutation.error instanceof ApiError && (
            <Alert
              status="error"
              borderRadius="xl"
              bg="red.50"
              border="2px solid"
              borderColor="red.200"
            >
              <AlertIcon color="red.500" />
              <AlertDescription color="red.700" fontWeight="600">
                {createMutation.error.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <Card
            borderRadius="2xl"
            bgGradient="linear(135deg, brand.50, accent.50)"
            border="2px solid"
            borderColor="brand.100"
          >
            <CardBody p={6}>
              <VStack spacing={4}>
                <VStack spacing={1}>
                  <Text fontSize="lg" fontWeight="700" color="gray.800">
                    Ready to create?
                  </Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    This activity will be available for personalized recommendations
                  </Text>
                </VStack>

                <Stack spacing={4} w="full" direction={{ base: 'column', sm: 'row' }}>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/teacher/activities')}
                    size="lg"
                    borderRadius="xl"
                    fontWeight="600"
                    borderWidth="2px"
                    flex={1}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    leftIcon={<Icon as={FiCheckCircle} />}
                    colorScheme="brand"
                    isLoading={createMutation.isPending}
                    loadingText="Creating..."
                    isDisabled={!name.trim() || !summary.trim() || !typeName}
                    size="lg"
                    borderRadius="xl"
                    fontWeight="600"
                    flex={2}
                  >
                    Create Activity
                  </Button>
                </Stack>
              </VStack>
            </CardBody>
          </Card>
        </Stack>
      </Box>
    </Stack>
  )
}