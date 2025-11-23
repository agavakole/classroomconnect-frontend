// src/pages/teacher/TeacherActivityDetailPage.tsx
import {
  Alert,
  AlertDescription,
  AlertIcon,
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
  Text,
  Textarea,
  HStack,
  VStack,
  Icon,
  Badge,
  Box,
  Flex,
  Divider,
  Wrap,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FiGrid,
  FiCheckCircle,
  FiTag,
  FiCode,
  FiSave,
  FiAlertCircle,
  FiPlayCircle,
} from 'react-icons/fi'
import { getActivity, updateActivity } from '../../api/activities'
import { ApiError } from '../../api/client'
import { ActivityContentDisplay } from '../../components/activity/ActivityContentDisplay'

export function TeacherActivityDetailPage() {
  const { activityId } = useParams<{ activityId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const activityQuery = useQuery({
    queryKey: ['activity', activityId],
    queryFn: () => getActivity(activityId ?? ''),
    enabled: Boolean(activityId),
  })

  const [name, setName] = useState('')
  const [summary, setSummary] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [contentJson, setContentJson] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)

  const previewContent = useMemo(() => {
    try {
      return contentJson.trim() ? JSON.parse(contentJson) : null
    } catch {
      return null
    }
  }, [contentJson])

  useEffect(() => {
    if (!activityQuery.data) return
    setName(activityQuery.data.name)
    setSummary(activityQuery.data.summary)
    setTags(activityQuery.data.tags)
    setContentJson(JSON.stringify(activityQuery.data.content_json, null, 2))
  }, [activityQuery.data])

  const mutation = useMutation({
    mutationFn: () => {
      let parsedContent: Record<string, unknown> | undefined
      if (contentJson.trim()) {
        try {
          parsedContent = JSON.parse(contentJson)
        } catch {
          setJsonError('Content JSON must be valid JSON.')
          throw new Error('invalid json')
        }
      }
      setJsonError(null)
      return updateActivity(activityId ?? '', {
        name: name.trim(),
        summary: summary.trim(),
        tags,
        content_json: parsedContent,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] })
    },
  })

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (!trimmed || tags.includes(trimmed)) return
    setTags((prev) => [...prev, trimmed])
    setTagInput('')
  }

  if (activityQuery.isLoading) {
    return (
      <Box textAlign="center" py={12}>
        <Text color="gray.500" fontSize="lg">
          Loading activity...
        </Text>
      </Box>
    )
  }

  if (activityQuery.isError || !activityQuery.data) {
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
          Unable to load activity
        </AlertDescription>
      </Alert>
    )
  }

  const activity = activityQuery.data
  const hasChanges =
    name !== activity.name ||
    summary !== activity.summary ||
    JSON.stringify(tags.sort()) !== JSON.stringify([...activity.tags].sort()) ||
    contentJson !== JSON.stringify(activity.content_json, null, 2)
  const previewPayload = {
    name: name || activity.name,
    summary: summary || activity.summary,
    type: activity.type,
    tags,
    content_json: (previewContent ?? activity.content_json) as Record<string, unknown>,
  }

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
            <BreadcrumbLink color="gray.900" fontWeight="600" cursor="default" noOfLines={1}>
              {activity.name}
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
            <Box
              bgGradient="linear(135deg, brand.400, brand.600)"
              color="white"
              p={4}
              borderRadius="2xl"
              boxShadow="lg"
            >
              <Icon as={FiGrid} boxSize={8} />
            </Box>
            <VStack align="flex-start" spacing={1}>
              <Heading size="lg" fontWeight="800">
                {activity.name}
              </Heading>
              <HStack spacing={3} fontSize="sm">
                <Badge colorScheme="purple" fontSize="sm" px={3} py={1} borderRadius="full">
                  {activity.type}
                </Badge>
                <Text color="gray.600" fontWeight="600">
                  {activity.tags.length} tags
                </Text>
              </HStack>
            </VStack>
          </HStack>

          {hasChanges && (
            <Badge
              colorScheme="orange"
              fontSize="sm"
              px={4}
              py={2}
              borderRadius="full"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Icon as={FiAlertCircle} />
              Unsaved Changes
            </Badge>
          )}
        </Flex>
      </Box>

      {/* Activity Preview */}
      <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
        <CardBody p={6}>
          <VStack align="stretch" spacing={4}>
            <HStack spacing={3}>
              <Icon as={FiPlayCircle} boxSize={6} color="brand.500" />
              <Heading size="md" fontWeight="700">
                Activity Preview
              </Heading>
            </HStack>
            <Text fontSize="sm" color="gray.600">
              This is the kid-friendly view of the activity using the current content details.
            </Text>
            {previewContent === null ? (
              <Alert
                status="warning"
                borderRadius="xl"
                bg="yellow.50"
                border="2px solid"
                borderColor="yellow.200"
              >
                <AlertIcon color="yellow.600" />
                <AlertDescription color="yellow.700" fontWeight="600">
                  Fix the JSON to update the preview. Showing the last saved version instead.
                </AlertDescription>
              </Alert>
            ) : null}
            <ActivityContentDisplay activity={previewPayload} />
          </VStack>
        </CardBody>
      </Card>

      {/* Basic Information Card */}
      <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
        <CardBody p={6}>
          <VStack align="stretch" spacing={5}>
            <HStack spacing={3}>
              <Icon as={FiCheckCircle} boxSize={6} color="brand.500" />
              <Heading size="md" fontWeight="700">
                Basic Information
              </Heading>
            </HStack>

            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="600" fontSize="sm" mb={2}>
                  Activity Name
                </FormLabel>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g., Math Word Problems"
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
                <FormLabel fontWeight="600" fontSize="sm" mb={2}>
                  Summary
                </FormLabel>
                <Textarea
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  placeholder="Brief description of this activity..."
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

      {/* Tags Card */}
      <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
        <CardBody p={6}>
          <VStack align="stretch" spacing={5}>
            <HStack spacing={3}>
              <Icon as={FiTag} boxSize={6} color="accent.500" />
              <Heading size="md" fontWeight="700">
                Tags
              </Heading>
              <Badge colorScheme="accent" fontSize="xs" px={2} py={1} borderRadius="full">
                {tags.length}
              </Badge>
            </HStack>

            <FormControl>
              <FormLabel fontWeight="600" fontSize="sm" mb={2}>
                Add Tags
              </FormLabel>
              <HStack spacing={3}>
                <Input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  placeholder="Enter tag and press Add"
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
                      handleAddTag()
                    }
                  }}
                />
                <Button
                  onClick={handleAddTag}
                  isDisabled={!tagInput.trim()}
                  colorScheme="accent"
                  size="lg"
                  px={8}
                  borderRadius="xl"
                  fontWeight="600"
                >
                  Add
                </Button>
              </HStack>
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
                        <TagCloseButton onClick={() => setTags(tags.filter((t) => t !== tag))} />
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

      {/* Content JSON Card */}
      <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
        <CardBody p={6}>
          <VStack align="stretch" spacing={5}>
            <HStack spacing={3}>
              <Icon as={FiCode} boxSize={6} color="purple.500" />
              <Heading size="md" fontWeight="700">
                Content Configuration
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
                    Advanced Settings
                  </Text>
                  <Text fontSize="sm" color="blue.800">
                    This JSON object stores activity-specific data. Ensure valid JSON format.
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <Box
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor="gray.100"
              bg="gray.50"
            >
              <HStack justify="space-between" align="center" mb={3}>
                <Heading size="sm" fontWeight="800" color="gray.700">
                  Live Student Preview
                </Heading>
                {previewContent === null ? (
                  <Badge colorScheme="yellow" borderRadius="full" px={3}>
                    Fix JSON to update preview
                  </Badge>
                ) : null}
              </HStack>
              <ActivityContentDisplay activity={previewPayload} showHeader />
            </Box>

            <FormControl>
              <FormLabel fontWeight="600" fontSize="sm" mb={2}>
                JSON Content
              </FormLabel>
              <Textarea
                minH="300px"
                fontFamily="mono"
                fontSize="sm"
                value={contentJson}
                onChange={(event) => {
                  setContentJson(event.target.value)
                  if (jsonError) setJsonError(null)
                }}
                borderRadius="xl"
                border="2px solid"
                borderColor={jsonError ? 'red.300' : 'gray.200'}
                bg="gray.50"
                _hover={{ borderColor: jsonError ? 'red.400' : 'purple.300' }}
                _focus={{
                  borderColor: jsonError ? 'red.400' : 'purple.400',
                  boxShadow: `0 0 0 1px var(--chakra-colors-${jsonError ? 'red' : 'purple'}-400)`,
                }}
              />
            </FormControl>

            {jsonError && (
              <Alert
                status="error"
                borderRadius="xl"
                bg="red.50"
                border="2px solid"
                borderColor="red.200"
              >
                <AlertIcon color="red.500" />
                <AlertDescription color="red.700" fontWeight="600">
                  {jsonError}
                </AlertDescription>
              </Alert>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Error Alert */}
      {mutation.error instanceof ApiError && (
        <Alert
          status="error"
          borderRadius="xl"
          bg="red.50"
          border="2px solid"
          borderColor="red.200"
        >
          <AlertIcon color="red.500" />
          <AlertDescription color="red.700" fontWeight="600">
            {mutation.error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <Card
        borderRadius="2xl"
        bgGradient={hasChanges ? 'linear(135deg, brand.50, accent.50)' : 'gray.50'}
        border="2px solid"
        borderColor={hasChanges ? 'brand.100' : 'gray.100'}
      >
        <CardBody p={6}>
          <VStack spacing={4}>
            {hasChanges && (
              <VStack spacing={1}>
                <Text fontSize="lg" fontWeight="700" color="gray.800">
                  You have unsaved changes
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Save your changes to update this activity
                </Text>
              </VStack>
            )}

            <HStack spacing={4} w="full">
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
                leftIcon={<Icon as={FiSave} />}
                colorScheme="brand"
                onClick={() => mutation.mutate()}
                isLoading={mutation.isPending}
                loadingText="Saving..."
                isDisabled={!name.trim() || !summary.trim() || !hasChanges}
                size="lg"
                borderRadius="xl"
                fontWeight="600"
                flex={2}
              >
                {hasChanges ? 'Save Changes' : 'No Changes'}
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </Stack>
  )
}