// src/pages/teacher/TeacherActivityTypeDetailPage.tsx
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Button,
  Card,
  CardBody,
  Heading,
  Stack,
  Text,
  HStack,
  VStack,
  Icon,
  Box,
  Flex,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FiArrowLeft,
  FiLayers,
  FiCheckCircle,
  FiList,
  FiCode,
  FiPlus,
} from 'react-icons/fi'
import { listActivityTypes } from '../../api/activities'
import { useEffect } from 'react'

export function TeacherActivityTypeDetailPage() {
  const { typeName } = useParams<{ typeName: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const activityTypesQuery = useQuery({
    queryKey: ['activityTypes'],
    queryFn: listActivityTypes,
  })

  if (activityTypesQuery.isLoading) {
    return (
      <Box textAlign="center" py={12}>
        <Text color="gray.500" fontSize="lg">
          Loading activity type...
        </Text>
      </Box>
    )
  }

  if (!activityTypesQuery.data?.length) {
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
          Unable to load activity types
        </AlertDescription>
      </Alert>
    )
  }

  const type = activityTypesQuery.data.find((item) => item.type_name === typeName)

  if (!type) {
    return (
      <Stack spacing={6}>
        <Alert
          status="warning"
          borderRadius="xl"
          bg="orange.50"
          border="2px solid"
          borderColor="orange.200"
        >
          <AlertIcon color="orange.500" />
          <AlertDescription color="orange.700" fontWeight="600">
            Activity type not found
          </AlertDescription>
        </Alert>
        <Button
          leftIcon={<Icon as={FiArrowLeft} />}
          onClick={() => navigate('/teacher/activity-types')}
          variant="outline"
          size="lg"
          borderRadius="xl"
        >
          Back to Types
        </Button>
      </Stack>
    )
  }

  return (
    <Stack spacing={8}>
      {/* Header */}
      <Box>
        <Button
          leftIcon={<Icon as={FiArrowLeft} />}
          variant="ghost"
          onClick={() => navigate('/teacher/activity-types')}
          mb={4}
          fontWeight="600"
        >
          Back to Activity Types
        </Button>

        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          gap={4}
        >
          <HStack spacing={4} align="flex-start">
            <Box
              bgGradient="linear(135deg, purple.400, purple.600)"
              color="white"
              p={4}
              borderRadius="2xl"
              boxShadow="lg"
            >
              <Icon as={FiLayers} boxSize={8} />
            </Box>
            <VStack align="flex-start" spacing={1}>
              <Heading size="lg" fontWeight="800">
                {type.type_name}
              </Heading>
              <Text color="gray.600" fontSize="md">
                {type.description}
              </Text>
            </VStack>
          </HStack>

          <Button
            leftIcon={<Icon as={FiPlus} />}
            colorScheme="brand"
            onClick={() => navigate('/teacher/activities/new')}
            size="lg"
            borderRadius="xl"
            fontWeight="600"
          >
            Create Activity
          </Button>
        </Flex>
      </Box>

      {/* Overview Stats */}
      <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
        <Card
          flex={1}
          borderRadius="xl"
          border="2px solid"
          borderColor="red.100"
          bg="red.50"
        >
          <CardBody p={5}>
            <VStack align="stretch" spacing={2}>
              <HStack spacing={2}>
                <Icon as={FiCheckCircle} color="red.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="700" color="red.900">
                  Required Fields
                </Text>
              </HStack>
              <Text fontSize="3xl" fontWeight="800" color="red.900">
                {type.required_fields.length}
              </Text>
            </VStack>
          </CardBody>
        </Card>

        <Card
          flex={1}
          borderRadius="xl"
          border="2px solid"
          borderColor="blue.100"
          bg="blue.50"
        >
          <CardBody p={5}>
            <VStack align="stretch" spacing={2}>
              <HStack spacing={2}>
                <Icon as={FiList} color="blue.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="700" color="blue.900">
                  Optional Fields
                </Text>
              </HStack>
              <Text fontSize="3xl" fontWeight="800" color="blue.900">
                {type.optional_fields.length}
              </Text>
            </VStack>
          </CardBody>
        </Card>

        <Card
          flex={1}
          borderRadius="xl"
          border="2px solid"
          borderColor="purple.100"
          bg="purple.50"
        >
          <CardBody p={5}>
            <VStack align="stretch" spacing={2}>
              <HStack spacing={2}>
                <Icon as={FiLayers} color="purple.500" boxSize={5} />
                <Text fontSize="sm" fontWeight="700" color="purple.900">
                  Total Fields
                </Text>
              </HStack>
              <Text fontSize="3xl" fontWeight="800" color="purple.900">
                {type.required_fields.length + type.optional_fields.length}
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Stack>

      {/* Required Fields Card */}
      <Card borderRadius="2xl" border="2px solid" borderColor="red.100" boxShadow="xl">
        <CardBody p={6}>
          <VStack align="stretch" spacing={5}>
            <HStack spacing={3}>
              <Icon as={FiCheckCircle} boxSize={6} color="red.500" />
              <Heading size="md" fontWeight="700">
                Required Fields
              </Heading>
              <Badge
                colorScheme="red"
                fontSize="sm"
                px={3}
                py={1}
                borderRadius="full"
                fontWeight="700"
              >
                {type.required_fields.length}
              </Badge>
            </HStack>

            <Box
              p={4}
              bg="red.50"
              borderRadius="xl"
              border="1px solid"
              borderColor="red.100"
            >
              <Text fontSize="sm" color="red.800">
                These fields must be filled when creating an activity of this type
              </Text>
            </Box>

            {type.required_fields.length > 0 ? (
              <Wrap spacing={3}>
                {type.required_fields.map((field) => (
                  <WrapItem key={field}>
                    <Badge
                      colorScheme="red"
                      fontSize="md"
                      px={4}
                      py={2}
                      borderRadius="xl"
                      fontWeight="600"
                      textTransform="none"
                    >
                      {field.replaceAll('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                  </WrapItem>
                ))}
              </Wrap>
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
                  No required fields defined
                </Text>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Optional Fields Card */}
      <Card borderRadius="2xl" border="2px solid" borderColor="blue.100" boxShadow="xl">
        <CardBody p={6}>
          <VStack align="stretch" spacing={5}>
            <HStack spacing={3}>
              <Icon as={FiList} boxSize={6} color="blue.500" />
              <Heading size="md" fontWeight="700">
                Optional Fields
              </Heading>
              <Badge
                colorScheme="blue"
                fontSize="sm"
                px={3}
                py={1}
                borderRadius="full"
                fontWeight="700"
              >
                {type.optional_fields.length}
              </Badge>
            </HStack>

            <Box
              p={4}
              bg="blue.50"
              borderRadius="xl"
              border="1px solid"
              borderColor="blue.100"
            >
              <Text fontSize="sm" color="blue.800">
                These fields can be left empty when creating an activity
              </Text>
            </Box>

            {type.optional_fields.length > 0 ? (
              <Wrap spacing={3}>
                {type.optional_fields.map((field) => (
                  <WrapItem key={field}>
                    <Badge
                      colorScheme="blue"
                      fontSize="md"
                      px={4}
                      py={2}
                      borderRadius="xl"
                      fontWeight="600"
                      textTransform="none"
                    >
                      {field.replaceAll('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                  </WrapItem>
                ))}
              </Wrap>
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
                  No optional fields defined
                </Text>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Example JSON Card */}
      {type.example_content_json && (
        <Card borderRadius="2xl" border="2px solid" borderColor="gray.100" boxShadow="xl">
          <CardBody p={6}>
            <VStack align="stretch" spacing={5}>
              <HStack spacing={3}>
                <Icon as={FiCode} boxSize={6} color="accent.500" />
                <Heading size="md" fontWeight="700">
                  Example JSON
                </Heading>
              </HStack>

              <Box
                p={4}
                bg="accent.50"
                borderRadius="xl"
                border="1px solid"
                borderColor="accent.100"
              >
                <Text fontSize="sm" color="accent.800">
                  Sample structure for activity content
                </Text>
              </Box>

              <Box
                as="pre"
                fontSize="sm"
                fontFamily="mono"
                p={5}
                bg="gray.50"
                borderRadius="xl"
                border="2px solid"
                borderColor="gray.200"
                overflowX="auto"
                color="gray.800"
              >
                {JSON.stringify(type.example_content_json, null, 2)}
              </Box>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Action Buttons */}
      <Card
        borderRadius="2xl"
        bgGradient="linear(135deg, purple.50, brand.50)"
        border="2px solid"
        borderColor="purple.100"
      >
        <CardBody p={6}>
          <VStack spacing={4}>
            <VStack spacing={1}>
              <Text fontSize="lg" fontWeight="700" color="gray.800">
                Ready to use this type?
              </Text>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                Create a new activity using this template structure
              </Text>
            </VStack>

            <HStack spacing={4} w="full">
              <Button
                variant="outline"
                onClick={() => navigate('/teacher/activity-types')}
                size="lg"
                borderRadius="xl"
                fontWeight="600"
                borderWidth="2px"
                flex={1}
              >
                View All Types
              </Button>
              <Button
                leftIcon={<Icon as={FiPlus} />}
                colorScheme="brand"
                onClick={() => navigate('/teacher/activities/new')}
                size="lg"
                borderRadius="xl"
                fontWeight="600"
                flex={2}
              >
                Create Activity
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </Stack>
  )
}
