// src/pages/teacher/TeacherSessionDashboardPage.tsx
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
  useToast,
  HStack,
  Select,
  VStack,
  Icon,
  SimpleGrid,
  GridItem,
  Flex,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  ButtonGroup,
} from "@chakra-ui/react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiCopy,
  FiArrowLeft,
  FiActivity,
  FiTrendingUp,
  FiExternalLink,
  FiLink,
  FiPieChart,
  FiBarChart2,
} from "react-icons/fi";
import {
  closeSession,
  getSessionDashboard,
  getSessionSubmissions,
  listCourseSessions,
} from "../../api/sessions";

export function TeacherSessionDashboardPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  const sessionQuery = useQuery({
    queryKey: ["sessionDashboard", sessionId],
    queryFn: () => getSessionDashboard(sessionId ?? ""),
    enabled: Boolean(sessionId),
  });

  const submissionsQuery = useQuery({
    queryKey: ["sessionSubmissions", sessionId],
    queryFn: () => getSessionSubmissions(sessionId ?? ""),
    enabled: Boolean(sessionId),
  });

  const sessionListQuery = useQuery({
    queryKey: ["courseSessions", sessionQuery.data?.course_id],
    queryFn: () => listCourseSessions(sessionQuery.data?.course_id ?? ""),
    enabled: Boolean(sessionQuery.data?.course_id),
  });

  const closeMutation = useMutation({
    mutationFn: () => closeSession(sessionId ?? ""),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["sessionDashboard", sessionId],
      });
      if (sessionQuery.data?.course_id) {
        queryClient.invalidateQueries({
          queryKey: ["courseSessions", sessionQuery.data.course_id],
        });
      }
      toast({
        title: "Session closed",
        description: "No more submissions will be accepted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const sessionMeta = useMemo(() => {
    return sessionListQuery.data?.find((item) => item.session_id === sessionId);
  }, [sessionListQuery.data, sessionId]);

  const isSessionOpen = !sessionMeta?.closed_at;
  const joinUrl = useMemo(() => {
    if (!sessionMeta?.join_token || typeof window === "undefined") return "";
    return `${window.location.origin}/session/run/${sessionMeta.join_token}`;
  }, [sessionMeta?.join_token]);

  // Real-time updates every 3 seconds
  useEffect(() => {
    if (!isSessionOpen) return;
    const interval = setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: ["sessionDashboard", sessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["sessionSubmissions", sessionId],
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isSessionOpen, queryClient, sessionId]);

  const handleCloseSession = () => {
    if (!isSessionOpen) return;
    const confirmed = window.confirm(
      "Closing the session will stop new submissions. Are you sure?",
    );
    if (!confirmed) return;
    closeMutation.mutate();
  };

  const copyToClipboard = async (
    value: string,
    successTitle: string,
    successDescription: string,
  ) => {
    if (!value) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const tempInput = document.createElement("input");
        tempInput.value = value;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
      }
      toast({
        title: successTitle,
        description: successDescription,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description:
          error instanceof Error ? error.message : "Please copy manually",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCopyToken = async () => {
    if (!sessionMeta?.join_token) return;
    await copyToClipboard(
      sessionMeta.join_token,
      "Token copied! 🔑",
      "Share this token with your students",
    );
  };

  const handleCopyJoinLink = async () => {
    if (!joinUrl) return;
    await copyToClipboard(
      joinUrl,
      "Link copied! 🎉",
      "Students can now join the session",
    );
  };

  const handleOpenShareScreen = () => {
    if (!sessionMeta?.join_token) return;
    const shareUrl = `http://localhost:5173/join?s=${sessionMeta.join_token}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const dashboard = sessionQuery.data;
  const participants = dashboard?.participants ?? [];
  const moodEntries = useMemo(
    () => Object.entries(dashboard?.mood_summary ?? {}),
    [dashboard?.mood_summary],
  );
  const totalMoodResponses = useMemo(
    () => moodEntries.reduce((sum, [, count]) => sum + (Number(count) || 0), 0),
    [moodEntries],
  );

  const surveyEntries = useMemo(() => {
    const counts: Record<string, number> = {};
    participants.forEach((participant) => {
      const label = participant.learning_style ?? "Not set";
      counts[label] = (counts[label] ?? 0) + 1;
    });
    return Object.entries(counts);
  }, [participants]);

  const totalSurveyResponses = useMemo(
    () =>
      surveyEntries.reduce((sum, [, count]) => sum + (Number(count) || 0), 0),
    [surveyEntries],
  );

  const moodData = useMemo(() => {
    return moodEntries.map(([name, value]) => ({
      name: name.replace(/_/g, " "),
      value: Number(value) || 0,
    }));
  }, [moodEntries]);

  const surveyData = useMemo(() => {
    return surveyEntries.map(([name, value]) => ({
      name: name.replace(/_/g, " "),
      value: Number(value) || 0,
    }));
  }, [surveyEntries]);

  const MOOD_COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE", "#8884d8"];
  const SURVEY_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE"];

  const [moodFilter, setMoodFilter] = useState<string>("all");
  const [surveyFilter, setSurveyFilter] = useState<string>("all");

  const [moodChartType, setMoodChartType] = useState<"pie" | "bar">("pie");
  const [surveyChartType, setSurveyChartType] = useState<"pie" | "bar">("bar");

  const filteredParticipants = useMemo(() => {
    return participants.filter((participant) => {
      const matchesMood =
        moodFilter === "all" || participant.mood === moodFilter;
      const surveyValue = participant.learning_style ?? "Not set";
      const matchesSurvey =
        surveyFilter === "all" || surveyValue === surveyFilter;
      return matchesMood && matchesSurvey;
    });
  }, [participants, moodFilter, surveyFilter]);

  const moodOptions = useMemo(
    () => moodEntries.map(([mood]) => mood),
    [moodEntries],
  );
  const surveyOptions = useMemo(
    () => surveyEntries.map(([style]) => style),
    [surveyEntries],
  );

  if (sessionQuery.isLoading) {
    return (
      <Box textAlign="center" py={12}>
        <Text color="gray.500" fontSize="lg">
          Loading session dashboard...
        </Text>
      </Box>
    );
  }

  if (sessionQuery.isError || !dashboard) {
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
          Unable to load session dashboard
        </AlertDescription>
      </Alert>
    );
  }

  const totalParticipants = participants.length;

  return (
    <Stack spacing={8}>
      {/* Header */}
      <Box>
        <Button
          leftIcon={<Icon as={FiArrowLeft} />}
          variant="ghost"
          onClick={() => navigate("/teacher/sessions")}
          mb={4}
          fontWeight="600"
        >
          Back to Sessions
        </Button>

        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          gap={4}
        >
          <HStack spacing={4} align="flex-start">
            <Box
              bgGradient={
                isSessionOpen
                  ? "linear(135deg, #10B981, #059669)"
                  : "linear(135deg, gray.400, gray.600)"
              }
              color="white"
              p={4}
              borderRadius="2xl"
              boxShadow="lg"
            >
              <Icon as={FiActivity} boxSize={8} />
            </Box>
            <VStack align="flex-start" spacing={1}>
              <Heading size="lg" fontWeight="800">
                {dashboard.course_title}
              </Heading>
              <HStack spacing={3} fontSize="sm" color="gray.600">
                <Badge
                  colorScheme={isSessionOpen ? "green" : "gray"}
                  fontSize="xs"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontWeight="700"
                >
                  {isSessionOpen ? "🟢 LIVE" : "⚫ CLOSED"}
                </Badge>
                <Text fontWeight="600">
                  Session {sessionId?.slice(0, 8)}...
                </Text>
              </HStack>
            </VStack>
          </HStack>

          {isSessionOpen && (
            <Button
              leftIcon={<Icon as={FiAlertCircle} />}
              colorScheme="white"
              color="red.600"
              onClick={handleCloseSession}
              isLoading={closeMutation.isPending}
              size="lg"
              borderRadius="xl"
              fontWeight="600"
            >
              Close Session
            </Button>
          )}
        </Flex>
      </Box>

      {/* Join Session & Stats Grid */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        {/* Join Session (Left, larger) */}
        <GridItem colSpan={{ base: 1, lg: 2 }}>
          {sessionMeta?.qr_url && (
            <Card
              borderRadius="2xl"
              border="2px solid"
              borderColor="gray.100"
              boxShadow="xl"
              h="full"
            >
              <CardBody p={8}>
                <VStack spacing={6} h="full" justify="center">
                  <VStack spacing={2}>
                    <Icon as={FiTrendingUp} boxSize={8} color="brand.500" />
                    <Heading size="md" fontWeight="700">
                      Join Session
                    </Heading>
                    <Text color="gray.600" textAlign="center">
                      Launch a standalone join screen with the QR code for your
                      students
                    </Text>
                  </VStack>

                  <Button
                    leftIcon={<Icon as={FiExternalLink} />}
                    colorScheme="brand"
                    size="lg"
                    borderRadius="xl"
                    fontWeight="700"
                    onClick={handleOpenShareScreen}
                    w="full"
                    maxW="md"
                  >
                    Open Join Screen
                  </Button>

                  <VStack spacing={4} w="full" maxW="md">
                    <VStack spacing={2} w="full">
                      <HStack w="full" justify="center" spacing={2}>
                        <Badge
                          fontSize="lg"
                          px={4}
                          py={2}
                          borderRadius="xl"
                          colorScheme="brand"
                          fontWeight="800"
                          fontFamily="mono"
                          textTransform="none"
                        >
                          {sessionMeta.join_token}
                        </Badge>
                        <Tooltip label="Copy token">
                          <IconButton
                            aria-label="Copy token"
                            icon={<Icon as={FiCopy} />}
                            onClick={handleCopyToken}
                            colorScheme="brand"
                            variant="ghost"
                            size="lg"
                          />
                        </Tooltip>
                      </HStack>
                      <Text fontSize="sm" color="gray.500">
                        Or share the join token above
                      </Text>
                    </VStack>

                    <Box
                      w="full"
                      p={4}
                      borderRadius="xl"
                      border="2px solid"
                      borderColor="gray.100"
                      bg="gray.50"
                    >
                      <VStack align="stretch" spacing={3}>
                        <Text fontSize="sm" fontWeight="700" color="gray.600">
                          Join Link
                        </Text>
                        <Button
                          leftIcon={<Icon as={FiLink} />}
                          variant="outline"
                          colorScheme="brand"
                          borderRadius="xl"
                          fontWeight="600"
                          onClick={handleCopyJoinLink}
                          isDisabled={!joinUrl}
                        >
                          Copy Join Link
                        </Button>
                      </VStack>
                    </Box>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          )}
        </GridItem>

        {/* Stats (Right, stacked) */}
        <GridItem colSpan={1}>
          <VStack spacing={6} h="full">
            {/* Participants Count */}
            <Card
              borderRadius="xl"
              border="2px solid"
              borderColor="blue.100"
              bg="blue.50"
              w="full"
              flex={1}
            >
              <CardBody p={6} display="flex" alignItems="center">
                <HStack spacing={4}>
                  <Box bg="whiteAlpha.300" p={3} borderRadius="xl">
                    <Icon as={FiUsers} boxSize={6} />
                  </Box>
                  <VStack align="flex-start" spacing={0}>
                    <Text fontSize="sm" fontWeight="600" opacity={0.9}>
                      Participants
                    </Text>
                    <Text fontSize="3xl" fontWeight="800">
                      {totalParticipants}
                    </Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            {/* Session Time */}
            <Card
              borderRadius="xl"
              border="2px solid"
              borderColor="red.100"
              bg="red.50"
              w="full"
              flex={1}
            >
              <CardBody p={6} display="flex" alignItems="center">
                <HStack spacing={4}>
                  <Box bg="whiteAlpha.300" p={3} borderRadius="xl">
                    <Icon as={FiClock} boxSize={6} />
                  </Box>
                  <VStack align="flex-start" spacing={0}>
                    <Text fontSize="sm" fontWeight="600" opacity={0.9}>
                      Started
                    </Text>
                    <Text fontSize="md" fontWeight="700">
                      {sessionMeta
                        ? new Date(sessionMeta.started_at).toLocaleTimeString()
                        : "N/A"}
                    </Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          </VStack>
        </GridItem>
      </SimpleGrid>

      {/* Mood Summary Card */}
      <Card
        borderRadius="2xl"
        border="2px solid"
        borderColor="gray.100"
        boxShadow="xl"
      >
        <CardBody p={{ base: 6, md: 8 }}>
          <VStack align="stretch" spacing={5}>
            <HStack spacing={3}>
              <Icon as={FiTrendingUp} boxSize={6} color="accent.500" />
              <Heading size="md" fontWeight="800">
                Mood & Survey Insights
              </Heading>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
              <Box
                p={5}
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.100"
                bg="blue.50"
              >
                <HStack justify="space-between" mb={4}>
                  <HStack>
                    <Text fontWeight="800" color="gray.800">
                      Mood Distribution
                    </Text>
                    <Badge
                      colorScheme="accent"
                      borderRadius="full"
                      fontWeight="800"
                      bg="accent.100"
                    >
                      {totalMoodResponses} responses
                    </Badge>
                  </HStack>
                  <ButtonGroup size="sm" isAttached variant="outline">
                    <IconButton
                      aria-label="Pie Chart"
                      icon={<Icon as={FiPieChart} />}
                      isActive={moodChartType === "pie"}
                      onClick={() => setMoodChartType("pie")}
                      colorScheme={moodChartType === "pie" ? "accent" : "gray"}
                      variant={moodChartType === "pie" ? "solid" : "outline"}
                    />
                    <IconButton
                      aria-label="Bar Chart"
                      icon={<Icon as={FiBarChart2} />}
                      isActive={moodChartType === "bar"}
                      onClick={() => setMoodChartType("bar")}
                      colorScheme={moodChartType === "bar" ? "accent" : "gray"}
                      variant={moodChartType === "bar" ? "solid" : "outline"}
                    />
                  </ButtonGroup>
                </HStack>

                {moodData.length > 0 ? (
                  <Box h="450px" w="100%">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={moodChartType}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        style={{ width: "100%", height: "100%" }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          {moodChartType === "pie" ? (
                            <PieChart>
                              <Pie
                                data={moodData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {moodData.map((_, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      MOOD_COLORS[index % MOOD_COLORS.length]
                                    }
                                  />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                              <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                          ) : (
                            <BarChart
                              data={moodData}
                              layout="vertical"
                              margin={{
                                top: 5,
                                right: 30,
                                left: 40,
                                bottom: 5,
                              }}
                            >
                              <XAxis type="number" hide />
                              <YAxis
                                dataKey="name"
                                type="category"
                                width={100}
                                tick={{ fontSize: 12 }}
                                interval={0}
                              />
                              <RechartsTooltip />
                              <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                                {moodData.map((_, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      MOOD_COLORS[index % MOOD_COLORS.length]
                                    }
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          )}
                        </ResponsiveContainer>
                      </motion.div>
                    </AnimatePresence>
                  </Box>
                ) : (
                  <VStack py={8} spacing={3}>
                    <Icon as={FiUsers} boxSize={14} color="gray.300" />
                    <Text color="gray.500" fontWeight="600">
                      No mood data yet
                    </Text>
                  </VStack>
                )}
              </Box>

              <Box
                p={5}
                borderRadius="xl"
                border="1px solid"
                borderColor="purple.100"
                bg="purple.50"
              >
                <HStack justify="space-between" mb={4}>
                  <HStack>
                    <Text fontWeight="800" color="purple.800">
                      Survey Results
                    </Text>
                    <Badge
                      colorScheme="purple"
                      borderRadius="full"
                      fontWeight="800"
                      bg="purple.200"
                    >
                      {totalSurveyResponses} responses
                    </Badge>
                  </HStack>
                  <ButtonGroup size="sm" isAttached variant="outline">
                    <IconButton
                      aria-label="Pie Chart"
                      icon={<Icon as={FiPieChart} />}
                      isActive={surveyChartType === "pie"}
                      onClick={() => setSurveyChartType("pie")}
                      colorScheme={
                        surveyChartType === "pie" ? "purple" : "gray"
                      }
                      variant={surveyChartType === "pie" ? "solid" : "outline"}
                    />
                    <IconButton
                      aria-label="Bar Chart"
                      icon={<Icon as={FiBarChart2} />}
                      isActive={surveyChartType === "bar"}
                      onClick={() => setSurveyChartType("bar")}
                      colorScheme={
                        surveyChartType === "bar" ? "purple" : "gray"
                      }
                      variant={surveyChartType === "bar" ? "solid" : "outline"}
                    />
                  </ButtonGroup>
                </HStack>

                {surveyData.length > 0 ? (
                  <Box h="450px" w="100%">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={surveyChartType}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        style={{ width: "100%", height: "100%" }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          {surveyChartType === "bar" ? (
                            <BarChart
                              data={surveyData}
                              layout="vertical"
                              margin={{
                                top: 5,
                                right: 30,
                                left: 40,
                                bottom: 5,
                              }}
                            >
                              <XAxis type="number" hide />
                              <YAxis
                                dataKey="name"
                                type="category"
                                width={100}
                                tick={{ fontSize: 12 }}
                                interval={0}
                              />
                              <RechartsTooltip />
                              <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                                {surveyData.map((_, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      SURVEY_COLORS[
                                        index % SURVEY_COLORS.length
                                      ]
                                    }
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          ) : (
                            <PieChart>
                              <Pie
                                data={surveyData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {surveyData.map((_, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      SURVEY_COLORS[
                                        index % SURVEY_COLORS.length
                                      ]
                                    }
                                  />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                              <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                          )}
                        </ResponsiveContainer>
                      </motion.div>
                    </AnimatePresence>
                  </Box>
                ) : (
                  <VStack py={8} spacing={3}>
                    <Icon as={FiUsers} boxSize={14} color="purple.300" />
                    <Text color="purple.700" fontWeight="600">
                      Survey results will appear here
                    </Text>
                  </VStack>
                )}
              </Box>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

      {/* Participants List */}
      <Card
        borderRadius="2xl"
        border="2px solid"
        borderColor="gray.100"
        boxShadow="xl"
      >
        <CardBody p={6}>
          <Flex
            direction={{ base: "column", lg: "row" }}
            justify="space-between"
            align={{ base: "flex-start", lg: "center" }}
            gap={4}
            mb={6}
          >
            <HStack spacing={3}>
              <Icon as={FiUsers} boxSize={6} color="brand.500" />
              <Heading size="md" fontWeight="700">
                Active Participants ({filteredParticipants.length}/
                {totalParticipants})
              </Heading>
              {isSessionOpen && (
                <Badge
                  colorScheme="green"
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  Live Updates
                </Badge>
              )}
            </HStack>

            <HStack spacing={3} w={{ base: "full", lg: "auto" }}>
              <Select
                value={moodFilter}
                onChange={(event) => setMoodFilter(event.target.value)}
                maxW={{ base: "full", lg: "220px" }}
                borderRadius="xl"
                bg="white"
              >
                <option value="all">All moods</option>
                {moodOptions.map((mood) => (
                  <option key={mood} value={mood}>
                    {mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </option>
                ))}
              </Select>
              <Select
                value={surveyFilter}
                onChange={(event) => setSurveyFilter(event.target.value)}
                maxW={{ base: "full", lg: "240px" }}
                borderRadius="xl"
                bg="white"
              >
                <option value="all">All survey results</option>
                {surveyOptions.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </Select>
            </HStack>
          </Flex>

          {dashboard.participants.length > 0 ? (
            filteredParticipants.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {filteredParticipants.map((participant, idx) => (
                  <Card
                    key={`${participant.mode}-${participant.display_name}-${idx}`}
                    borderRadius="xl"
                    border="2px solid"
                    borderColor="gray.100"
                    _hover={{ borderColor: "brand.200", boxShadow: "md" }}
                    transition="all 0.2s"
                  >
                    <CardBody p={5}>
                      <VStack align="stretch" spacing={3}>
                        <HStack spacing={3}>
                          <Avatar
                            name={participant.display_name}
                            size="md"
                            bg="brand.400"
                            color="white"
                            fontWeight="700"
                          />
                          <VStack align="flex-start" spacing={0} flex={1}>
                            <Heading size="sm" fontWeight="700">
                              {participant.display_name}
                            </Heading>
                            <HStack fontSize="xs" color="gray.500" spacing={2}>
                              <Badge size="sm" colorScheme="purple">
                                {participant.mode}
                              </Badge>
                              <Text>•</Text>
                              <Text textTransform="capitalize">
                                {participant.mood}
                              </Text>
                            </HStack>
                          </VStack>
                        </HStack>

                        <Divider />

                        <VStack align="stretch" spacing={2} fontSize="sm">
                          <HStack justify="space-between">
                            <Text color="gray.600">Learning Style:</Text>
                            <Badge colorScheme="blue">
                              {participant.learning_style ?? "N/A"}
                            </Badge>
                          </HStack>

                          {participant.recommended_activity && (
                            <Box
                              bg="green.50"
                              p={3}
                              borderRadius="lg"
                              border="1px solid"
                              borderColor="green.200"
                            >
                              <VStack align="stretch" spacing={1}>
                                <Text
                                  fontSize="xs"
                                  fontWeight="700"
                                  color="green.700"
                                >
                                  Recommended Activity:
                                </Text>
                                <Text fontWeight="600" color="green.900">
                                  {
                                    participant.recommended_activity.activity
                                      .name
                                  }
                                </Text>
                                <Text fontSize="xs" color="green.700">
                                  {
                                    participant.recommended_activity.activity
                                      .summary
                                  }
                                </Text>
                              </VStack>
                            </Box>
                          )}
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <VStack py={12} spacing={3}>
                <Text fontSize="lg" fontWeight="700" color="gray.700">
                  No students match these filters
                </Text>
                <Text color="gray.500" textAlign="center">
                  Try selecting another mood or survey result to see matching
                  students
                </Text>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMoodFilter("all");
                    setSurveyFilter("all");
                  }}
                  borderRadius="xl"
                >
                  Clear filters
                </Button>
              </VStack>
            )
          ) : (
            <VStack py={12} spacing={4}>
              <Box
                bg="gray.50"
                p={6}
                borderRadius="full"
                border="2px dashed"
                borderColor="gray.200"
              >
                <Icon as={FiUsers} boxSize={12} color="gray.400" />
              </Box>
              <VStack spacing={1}>
                <Text fontSize="lg" fontWeight="600" color="gray.700">
                  Waiting for participants...
                </Text>
                <Text color="gray.500" textAlign="center">
                  Students will appear here once they join the session
                </Text>
              </VStack>
            </VStack>
          )}
        </CardBody>
      </Card>

      {/* Submissions Log */}
      <Card
        borderRadius="2xl"
        border="2px solid"
        borderColor="gray.100"
        boxShadow="xl"
      >
        <CardBody p={6}>
          <HStack spacing={3} mb={6}>
            <Icon as={FiCheckCircle} boxSize={6} color="accent.500" />
            <Heading size="md" fontWeight="700">
              Submission History
            </Heading>
          </HStack>

          {submissionsQuery.isLoading ? (
            <Text color="gray.500">Loading submissions...</Text>
          ) : submissionsQuery.isError ? (
            <Alert
              status="error"
              borderRadius="xl"
              bg="red.50"
              border="2px solid"
              borderColor="red.200"
            >
              <AlertIcon color="red.500" />
              <AlertDescription color="red.700" fontWeight="600">
                Unable to load submissions
              </AlertDescription>
            </Alert>
          ) : submissionsQuery.data?.items.length ? (
            <Stack spacing={3}>
              {submissionsQuery.data.items.map((submission, index) => (
                <Box
                  key={index}
                  borderWidth="2px"
                  borderColor="gray.100"
                  borderRadius="xl"
                  p={4}
                  _hover={{ borderColor: "brand.200", bg: "brand.50" }}
                  transition="all 0.2s"
                >
                  <HStack justify="space-between" align="start">
                    <VStack align="flex-start" spacing={2}>
                      <HStack spacing={2}>
                        <Avatar
                          name={
                            submission.student_full_name ||
                            submission.student_name ||
                            "Guest"
                          }
                          size="sm"
                          bg="accent.400"
                          color="white"
                        />
                        <Text fontWeight="700">
                          {submission.student_full_name ||
                            submission.student_name ||
                            "Guest"}
                        </Text>
                      </HStack>
                      <HStack spacing={2} flexWrap="wrap" fontSize="sm">
                        <Badge colorScheme="purple">{submission.mood}</Badge>
                        <Badge colorScheme="blue">
                          {submission.learning_style ?? "N/A"}
                        </Badge>
                        {submission.is_baseline_update && (
                          <Badge colorScheme="green">Baseline Updated</Badge>
                        )}
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(submission.created_at).toLocaleString()}
                      </Text>
                    </VStack>
                    <Badge colorScheme="brand" fontSize="xs" px={2} py={1}>
                      {submission.status}
                    </Badge>
                  </HStack>
                </Box>
              ))}
            </Stack>
          ) : (
            <VStack py={8} spacing={2}>
              <Icon as={FiCheckCircle} boxSize={12} color="gray.300" />
              <Text color="gray.500">No submissions yet</Text>
            </VStack>
          )}
        </CardBody>
      </Card>
    </Stack>
  );
}
