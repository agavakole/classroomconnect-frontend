// src/pages/student/StudentDashboardPage.tsx
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Button,
  Card,
  CardBody,
  Box,
  Input,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  HStack,
  VStack,
  Icon,
  SimpleGrid,
  Divider,
  Flex,
} from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiHash,
  FiClock,
  FiCheckCircle,
  FiKey,
  FiCamera,
  FiBookOpen,
  FiCalendar,
  FiAlertCircle,
} from "react-icons/fi";
import { getStudentProfile, getStudentSubmissions } from "../../api/students";
import { getJoinSession } from "../../api/public";
import { ApiError } from "../../api/client";

export function StudentDashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab");
  const tabIndex = initialTab === "history" ? 1 : initialTab === "join" ? 2 : 0;
  const [token, setToken] = useState("");

  const profileQuery = useQuery({
    queryKey: ["studentProfile"],
    queryFn: getStudentProfile,
  });

  const submissionsQuery = useQuery({
    queryKey: ["studentSubmissions"],
    queryFn: getStudentSubmissions,
  });

  const joinMutation = useMutation({
    mutationFn: (joinToken: string) => getJoinSession(joinToken),
    onSuccess: (_, joinToken) => {
      navigate(`/session/run/${joinToken}`);
    },
  });

  const handleJoinSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token.trim()) return;
    joinMutation.mutate(token.trim());
  };

  const handleTabChange = (index: number) => {
    const tabValue = index === 1 ? "history" : index === 2 ? "join" : null;
    if (tabValue) {
      setSearchParams({ tab: tabValue });
    } else {
      setSearchParams({});
    }
  };

  const joinError =
    joinMutation.error instanceof ApiError
      ? joinMutation.error.message
      : joinMutation.isError
      ? "Unable to find the session. Please check the token."
      : null;

  return (
    <Stack spacing={8}>
      {/* Header */}
      <Box>
        <Text color="gray.600" fontSize="lg">
          Manage your profile, view submissions, and join sessions
        </Text>
      </Box>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <Card
          borderRadius="xl"
          border="2px solid"
          borderColor="blue.100"
          bg="blue.50"
        >
          <CardBody p={6}>
            <HStack spacing={4} align="flex-start">
              <Box
                bg="whiteAlpha.300"
                p={3}
                borderRadius="xl"
                backdropFilter="blur(10px)"
              >
                <Icon as={FiCheckCircle} boxSize={6} color="blue.500" />
              </Box>
              <VStack align="flex-start" spacing={1}>
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  opacity={0.9}
                  color="blue.900"
                >
                  Submissions
                </Text>
                <Text fontSize="2xl" fontWeight="800" color="blue.900">
                  {submissionsQuery.data?.submissions.length || 0}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        <Card
          borderRadius="xl"
          border="2px solid"
          borderColor="red.100"
          bg="red.50"
          cursor="pointer"
          onClick={() => handleTabChange(2)}
          _hover={{ transform: "translateY(-4px)", boxShadow: "2xl" }}
          transition="all 0.3s"
        >
          <CardBody p={6}>
            <VStack spacing={3} align="stretch">
              <Flex justify="space-between" align="center">
                <Icon as={FiKey} boxSize={8} color="red.500"/>
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
                <Text fontSize="xl" fontWeight="800" color="red.900">
                  Join Session
                </Text>
                <Text fontSize="sm" opacity={0.9} color="red.900">
                  Enter token or scan QR
                </Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Tabs */}
      <Card
        borderRadius="2xl"
        border="2px solid"
        borderColor="gray.100"
        boxShadow="xl"
      >
        <CardBody p={0}>
          <Tabs
            index={tabIndex}
            onChange={handleTabChange}
            variant="enclosed"
            isLazy
          >
            <TabList borderBottom="2px solid" borderColor="gray.100" px={6}>
              <Tab
                fontWeight="600"
                _selected={{
                  color: "accent.600",
                  borderColor: "accent.600",
                  borderBottomWidth: "3px",
                }}
              >
                <HStack spacing={2}>
                  <Icon as={FiUser} />
                  <Text>Profile</Text>
                </HStack>
              </Tab>
              <Tab
                fontWeight="600"
                _selected={{
                  color: "accent.600",
                  borderColor: "accent.600",
                  borderBottomWidth: "3px",
                }}
              >
                <HStack spacing={2}>
                  <Icon as={FiClock} />
                  <Text>History</Text>
                </HStack>
              </Tab>
              <Tab
                fontWeight="600"
                _selected={{
                  color: "accent.600",
                  borderColor: "accent.600",
                  borderBottomWidth: "3px",
                }}
              >
                <HStack spacing={2}>
                  <Icon as={FiKey} />
                  <Text>Join</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Profile Tab */}
              <TabPanel p={8}>
                {profileQuery.isLoading ? (
                  <Box textAlign="center" py={12}>
                    <Spinner size="xl" color="accent.500" thickness="4px" />
                    <Text mt={4} color="gray.500">
                      Loading your profile...
                    </Text>
                  </Box>
                ) : profileQuery.data ? (
                  <Stack spacing={6} maxW="2xl">
                    <VStack align="flex-start" spacing={4}>
                      <Box
                        bg="accent.50"
                        p={4}
                        borderRadius="2xl"
                        border="1px solid"
                        borderColor="accent.100"
                        w="full"
                      >
                        <HStack spacing={4}>
                          <Box
                            bg="accent.500"
                            color="white"
                            p={4}
                            borderRadius="xl"
                            fontSize="2xl"
                          >
                            {profileQuery.data.full_name
                              .charAt(0)
                              .toUpperCase()}
                          </Box>
                          <VStack align="flex-start" spacing={0}>
                            <Text
                              fontSize="2xl"
                              fontWeight="800"
                              color="gray.800"
                            >
                              {profileQuery.data.full_name}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              Student Account
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>

                      <Divider />

                      <Stack spacing={4} w="full">
                        <HStack
                          p={4}
                          bg="gray.50"
                          borderRadius="xl"
                          spacing={4}
                          align="flex-start"
                        >
                          <Icon
                            as={FiHash}
                            boxSize={5}
                            color="accent.500"
                            mt={1}
                          />
                          <VStack align="flex-start" spacing={1} flex="1">
                            <Text
                              fontSize="xs"
                              fontWeight="600"
                              color="gray.500"
                            >
                              STUDENT ID
                            </Text>
                            <Text
                              fontSize="md"
                              fontWeight="600"
                              color="gray.800"
                            >
                              {profileQuery.data.id}
                            </Text>
                          </VStack>
                        </HStack>

                        <HStack
                          p={4}
                          bg="gray.50"
                          borderRadius="xl"
                          spacing={4}
                          align="flex-start"
                        >
                          <Icon
                            as={FiMail}
                            boxSize={5}
                            color="accent.500"
                            mt={1}
                          />
                          <VStack align="flex-start" spacing={1} flex="1">
                            <Text
                              fontSize="xs"
                              fontWeight="600"
                              color="gray.500"
                            >
                              EMAIL ADDRESS
                            </Text>
                            <Text
                              fontSize="md"
                              fontWeight="600"
                              color="gray.800"
                            >
                              {profileQuery.data.email}
                            </Text>
                          </VStack>
                        </HStack>

                        <HStack
                          p={4}
                          bg="gray.50"
                          borderRadius="xl"
                          spacing={4}
                          align="flex-start"
                        >
                          <Icon
                            as={FiUser}
                            boxSize={5}
                            color="accent.500"
                            mt={1}
                          />
                          <VStack align="flex-start" spacing={1} flex="1">
                            <Text
                              fontSize="xs"
                              fontWeight="600"
                              color="gray.500"
                            >
                              FULL NAME
                            </Text>
                            <Text
                              fontSize="md"
                              fontWeight="600"
                              color="gray.800"
                            >
                              {profileQuery.data.full_name}
                            </Text>
                          </VStack>
                        </HStack>
                      </Stack>
                    </VStack>
                  </Stack>
                ) : (
                  <Alert
                    status="error"
                    borderRadius="xl"
                    bg="red.50"
                    border="2px solid"
                    borderColor="red.200"
                  >
                    <AlertIcon color="red.500" />
                    <AlertDescription color="red.700" fontWeight="600">
                      Unable to load your profile. Please refresh the page.
                    </AlertDescription>
                  </Alert>
                )}
              </TabPanel>

              {/* History Tab */}
              <TabPanel p={8}>
                {submissionsQuery.isLoading ? (
                  <Box textAlign="center" py={12}>
                    <Spinner size="xl" color="accent.500" thickness="4px" />
                    <Text mt={4} color="gray.500">
                      Loading your submissions...
                    </Text>
                  </Box>
                ) : submissionsQuery.data?.submissions.length ? (
                  <Stack spacing={4}>
                    {submissionsQuery.data.submissions.map((submission) => (
                      <Card
                        key={submission.id}
                        borderRadius="xl"
                        border="2px solid"
                        borderColor="gray.100"
                        _hover={{
                          borderColor: "accent.400",
                          transform: "translateY(-2px)",
                          boxShadow: "lg",
                        }}
                        transition="all 0.2s"
                      >
                        <CardBody p={5}>
                          <VStack align="stretch" spacing={4}>
                            <Flex justify="space-between" align="start">
                              <HStack spacing={3}>
                                <Box
                                  bg="accent.50"
                                  p={3}
                                  borderRadius="xl"
                                  border="2px solid"
                                  borderColor="accent.100"
                                >
                                  <Icon
                                    as={FiBookOpen}
                                    boxSize={6}
                                    color="accent.500"
                                  />
                                </Box>
                                <VStack align="flex-start" spacing={1}>
                                  <Text
                                    fontWeight="700"
                                    fontSize="lg"
                                    color="gray.800"
                                  >
                                    {submission.course_title}
                                  </Text>
                                  <HStack
                                    spacing={2}
                                    fontSize="sm"
                                    color="gray.500"
                                  >
                                    <Icon as={FiHash} boxSize={3} />
                                    <Text>
                                      Session: {submission.session_id}
                                    </Text>
                                  </HStack>
                                </VStack>
                              </HStack>
                              <Badge
                                colorScheme={
                                  submission.status === "completed"
                                    ? "green"
                                    : "yellow"
                                }
                                fontSize="xs"
                                px={3}
                                py={1}
                                borderRadius="full"
                              >
                                {submission.status}
                              </Badge>
                            </Flex>

                            <Box
                              p={3}
                              bg="gray.50"
                              borderRadius="lg"
                              fontSize="sm"
                              color="gray.700"
                            >
                              <Text
                                fontWeight="600"
                                fontSize="xs"
                                color="gray.500"
                                mb={3}
                                letterSpacing="wide"
                                textTransform="uppercase"
                              >
                                YOUR ANSWERS
                              </Text>
                              
                              {submission.answer_details ? (
                                <VStack align="stretch" spacing={3}>
                                  {Object.values(submission.answer_details).map((detail) => (
                                    <Box key={detail.question_id} p={2} bg="white" borderRadius="md" border="1px solid" borderColor="gray.100">
                                      <Text fontSize="xs" color="gray.500" mb={1}>
                                        {detail.question_text}
                                      </Text>
                                      <Text fontSize="sm" fontWeight="600" color="gray.800">
                                        {detail.selected_option_text}
                                      </Text>
                                    </Box>
                                  ))}
                                </VStack>
                              ) : (
                                <Text fontFamily="mono" fontSize="xs">
                                  {JSON.stringify(submission.answers, null, 2)}
                                </Text>
                              )}
                            </Box>

                            <HStack spacing={2} fontSize="xs" color="gray.500">
                              <Icon as={FiCalendar} boxSize={3} />
                              <Text>
                                Submitted{" "}
                                {new Date(
                                  submission.created_at
                                ).toLocaleString()}
                              </Text>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <VStack spacing={4} py={12}>
                    <Box
                      bg="gray.50"
                      p={6}
                      borderRadius="full"
                      border="2px dashed"
                      borderColor="gray.200"
                    >
                      <Icon as={FiClock} boxSize={12} color="gray.400" />
                    </Box>
                    <VStack spacing={2}>
                      <Text fontSize="lg" fontWeight="600" color="gray.700">
                        No submissions yet
                      </Text>
                      <Text color="gray.500" textAlign="center" maxW="md">
                        Your session submissions will appear here
                      </Text>
                    </VStack>
                  </VStack>
                )}
              </TabPanel>

              {/* Join Tab */}
              <TabPanel p={8}>
                <Stack spacing={6} maxW="2xl" mx="auto">
                  <Box
                    p={4}
                    bg="blue.50"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="blue.100"
                  >
                    <HStack spacing={3} align="start">
                      <Icon
                        as={FiAlertCircle}
                        color="blue.500"
                        boxSize={5}
                        mt={0.5}
                      />
                      <Text fontSize="sm" color="blue.800">
                        <strong>Quick Access:</strong> Get your join token from
                        your teacher or scan the QR code
                      </Text>
                    </HStack>
                  </Box>

                  <Box as="form" onSubmit={handleJoinSubmit}>
                    <Stack spacing={5}>
                      <VStack align="stretch" spacing={3}>
                        <HStack spacing={2}>
                          <Icon as={FiKey} boxSize={5} color="accent.500" />
                          <Text fontWeight="700" fontSize="md">
                            Session Token
                          </Text>
                        </HStack>
                        <Input
                          value={token}
                          onChange={(event) => setToken(event.target.value)}
                          placeholder="Enter token from your teacher"
                          size="lg"
                          borderRadius="xl"
                          border="2px solid"
                          borderColor="gray.200"
                          fontFamily="mono"
                          fontSize="lg"
                          fontWeight="700"
                          textAlign="center"
                          _hover={{ borderColor: "accent.300" }}
                          _focus={{
                            borderColor: "accent.400",
                            boxShadow:
                              "0 0 0 1px var(--chakra-colors-accent-400)",
                          }}
                        />
                      </VStack>

                      {joinError && (
                        <Alert
                          status="error"
                          borderRadius="xl"
                          bg="red.50"
                          border="2px solid"
                          borderColor="red.200"
                        >
                          <AlertIcon color="red.500" />
                          <AlertDescription color="red.700" fontWeight="600">
                            {joinError}
                          </AlertDescription>
                        </Alert>
                      )}

                      <Stack spacing={3}>
                        <Button
                          type="submit"
                          colorScheme="accent"
                          size="lg"
                          borderRadius="xl"
                          fontWeight="700"
                          isDisabled={!token.trim()}
                          isLoading={joinMutation.isPending}
                          loadingText="Joining..."
                        >
                          Join Session
                        </Button>

                        <Button
                          leftIcon={<Icon as={FiCamera} />}
                          variant="outline"
                          size="lg"
                          borderRadius="xl"
                          fontWeight="600"
                          borderWidth="2px"
                          onClick={() => navigate("/scan")}
                        >
                          Scan QR Code Instead
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </Stack>
  );
}
