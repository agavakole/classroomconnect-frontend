// src/pages/teacher/TeacherDashboardPage.tsx
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Box,
  Stack,
  Text,
  HStack,
  VStack,
  Icon,
  SimpleGrid,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Avatar,
  Divider,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FiBook,
  FiClipboard,
  FiPlayCircle,
  FiGrid,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiArrowRight,
  FiActivity,
  FiSmile,
  FiUser,
  FiTrendingUp,
} from "react-icons/fi";
import { useState, useMemo } from "react";
import { listCourses } from "../../api/courses";
import { listSurveys } from "../../api/surveys";
import { listActivities } from "../../api/activities";
import { listCourseSessions, getSessionSubmissions } from "../../api/sessions";

export function TeacherDashboardPage() {
  const navigate = useNavigate();
  const teacherName = localStorage.getItem("teacher_name") || "Teacher";

  // Get current date
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    weekday: "long",
  };
  const formattedDate = today.toLocaleDateString("en-US", dateOptions);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthYear = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Fetch real data from API
  const coursesQuery = useQuery({
    queryKey: ["courses"],
    queryFn: listCourses,
  });

  const surveysQuery = useQuery({
    queryKey: ["surveys"],
    queryFn: listSurveys,
  });

  const activitiesQuery = useQuery({
    queryKey: ["activities"],
    queryFn: listActivities,
  });

  // Get all course IDs to fetch their sessions
  const courseIds = useMemo(() => {
    return coursesQuery.data?.map((course) => course.id) || [];
  }, [coursesQuery.data]);

  // Fetch sessions for all courses
  const sessionsQueries = useQuery({
    queryKey: ["allCourseSessions", courseIds],
    queryFn: async () => {
      if (courseIds.length === 0) return [];
      const allSessions = await Promise.all(
        courseIds.map((courseId) =>
          listCourseSessions(courseId).catch(() => []),
        ),
      );
      return allSessions.flat();
    },
    enabled: courseIds.length > 0,
  });

  // Get active session IDs
  const activeSessionIds = useMemo(() => {
    return (
      sessionsQueries.data
        ?.filter((session) => !session.closed_at)
        .map((session) => session.session_id) || []
    );
  }, [sessionsQueries.data]);

  // Fetch submissions for active sessions
  const submissionsQuery = useQuery({
    queryKey: ["allSessionSubmissions", activeSessionIds],
    queryFn: async () => {
      if (activeSessionIds.length === 0) return [];
      const allSubmissions = await Promise.all(
        activeSessionIds.map((sessionId) =>
          getSessionSubmissions(sessionId).catch(() => ({ items: [] })),
        ),
      );
      return allSubmissions.flatMap((response) => response.items || []);
    },
    enabled: activeSessionIds.length > 0,
    refetchInterval: 10000, // Refresh every 10 seconds for live updates
  });

  // Sort submissions by most recent
  const recentSubmissions = useMemo(() => {
    if (!submissionsQuery.data) return [];
    return [...submissionsQuery.data]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 5);
  }, [submissionsQuery.data]);

  // Calculate stats from real data
  const totalCourses = coursesQuery.data?.length || 0;
  const totalSurveys = surveysQuery.data?.length || 0;
  const totalActivities = activitiesQuery.data?.length || 0;

  // Count active sessions
  const activeSessions =
    sessionsQueries.data?.filter((s) => !s.closed_at).length || 0;

  const stats = [
    {
      label: "Total Courses",
      value: totalCourses,
      icon: FiBook,
      bg: "brand.50",
      borderColor: "brand.200",
      iconBg: "brand.100",
      iconColor: "brand.500",
      link: "/teacher/courses",
    },
    {
      label: "Active Sessions",
      value: activeSessions,
      icon: FiActivity,
      bg: "green.50",
      borderColor: "green.200",
      iconBg: "green.100",
      iconColor: "green.500",
      link: "/teacher/sessions",
    },
    {
      label: "Total Surveys",
      value: totalSurveys,
      icon: FiClipboard,
      bg: "blue.50",
      borderColor: "blue.200",
      iconBg: "blue.100",
      iconColor: "blue.500",
      link: "/teacher/surveys",
    },
    {
      label: "Total Activities",
      value: totalActivities,
      icon: FiGrid,
      bg: "purple.50",
      borderColor: "purple.200",
      iconBg: "purple.100",
      iconColor: "purple.500",
      link: "/teacher/activities",
    },
  ];

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];

    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const calendarDays = getDaysInMonth(currentMonth);
  const todayDate = today.getDate();
  const isCurrentMonth =
    currentMonth.getMonth() === today.getMonth() &&
    currentMonth.getFullYear() === today.getFullYear();

  const isLoading =
    coursesQuery.isLoading ||
    surveysQuery.isLoading ||
    activitiesQuery.isLoading;

  // Helper function to get mood color
  const getMoodColor = (mood: string) => {
    const moodLower = mood?.toLowerCase() || "";
    if (
      moodLower.includes("happy") ||
      moodLower.includes("excited") ||
      moodLower.includes("great")
    )
      return "green";
    if (
      moodLower.includes("calm") ||
      moodLower.includes("focused") ||
      moodLower.includes("good")
    )
      return "blue";
    if (moodLower.includes("tired") || moodLower.includes("sleepy"))
      return "orange";
    if (
      moodLower.includes("sad") ||
      moodLower.includes("anxious") ||
      moodLower.includes("stressed")
    )
      return "red";
    return "purple";
  };

  // Helper function to format time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Stack spacing={{ base: 5, md: 6 }}>
      {/* Welcome Header */}
      <Box>
        <Text
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="900"
          color="gray.800"
          lineHeight="1.2"
        >
          Welcome back, {teacherName} 👋
        </Text>
      </Box>

      {/* Main Grid Layout */}
      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={6} alignItems="start">
        {/* Left Column - Main Content */}
        <Box gridColumn={{ xl: "span 2" }}>
          <Stack spacing={6}>
            {/* Overview Stats */}
            <Box>
              <Text fontSize="lg" fontWeight="700" color="gray.500" mb={4}>
                Overview
              </Text>
              <SimpleGrid
                columns={{ base: 2, lg: 4 }}
                spacing={{ base: 3, md: 4 }}
              >
                {stats.map((stat, index) => (
                  <Card
                    key={index}
                    borderRadius="xl"
                    bg={stat.bg}
                    border="1px solid"
                    borderColor={stat.borderColor}
                    boxShadow="sm"
                    cursor="pointer"
                    onClick={() => navigate(stat.link)}
                    transition="all 0.2s"
                    _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                    _active={{ transform: "translateY(0)", boxShadow: "sm" }}
                  >
                    <CardBody p={{ base: 4, md: 6 }}>
                      <VStack align="flex-start" spacing={3}>
                        <Box bg={stat.iconBg} p={2} borderRadius="lg">
                          <Icon
                            as={stat.icon}
                            boxSize={5}
                            color={stat.iconColor}
                          />
                        </Box>
                        <VStack align="flex-start" spacing={0} w="100%">
                          <Text fontSize="xs" fontWeight="600" color="gray.600">
                            {stat.label}
                          </Text>
                          {isLoading ? (
                            <Skeleton height="28px" width="40px" mt={1} />
                          ) : (
                            <Text
                              fontSize="2xl"
                              fontWeight="900"
                              color="gray.800"
                            >
                              {stat.value}
                            </Text>
                          )}
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </Box>

            {/* Recent Student Activity Card */}
            <Card
              borderRadius="2xl"
              boxShadow="sm"
              bg="white"
              overflow="hidden"
              border="none"
            >
              <CardHeader pb={3}>
                <Flex
                  justify="space-between"
                  align="center"
                  direction={{ base: "column", sm: "row" }}
                  gap={3}
                >
                  <HStack spacing={3}>
                    <Text fontSize="lg" fontWeight="700" color="gray.800">
                      Recent Student Activity
                    </Text>
                    {activeSessions > 0 && (
                      <Badge
                        colorScheme="green"
                        fontSize="xs"
                        px={2}
                        py={1}
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        gap={1}
                      >
                        <Box
                          as="span"
                          w="6px"
                          h="6px"
                          borderRadius="full"
                          bg="green.500"
                        />
                        Live
                      </Badge>
                    )}
                  </HStack>
                  <Button
                    variant="ghost"
                    size="sm"
                    colorScheme="brand"
                    fontWeight="600"
                    rightIcon={<Icon as={FiArrowRight} />}
                    onClick={() => navigate("/teacher/sessions")}
                  >
                    View sessions
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody pt={0}>
                {submissionsQuery.isLoading || sessionsQueries.isLoading ? (
                  <VStack spacing={3} align="stretch">
                    {[1, 2, 3].map((i) => (
                      <HStack key={i} p={4} borderRadius="xl" bg="gray.50">
                        <SkeletonCircle size="12" />
                        <VStack align="flex-start" flex="1" spacing={2}>
                          <Skeleton height="16px" width="60%" />
                          <Skeleton height="12px" width="40%" />
                        </VStack>
                      </HStack>
                    ))}
                  </VStack>
                ) : recentSubmissions.length > 0 ? (
                  <VStack spacing={3} align="stretch">
                    {recentSubmissions.map((submission, index) => (
                      <Box
                        key={`${submission.student_name}-${index}`}
                        p={4}
                        borderRadius="xl"
                        bg="gray.50"
                        border="1px solid"
                        borderColor="gray.100"
                        transition="all 0.2s"
                        _hover={{ bg: "gray.100", borderColor: "gray.200" }}
                      >
                        <Flex direction={{ base: "column", sm: "row" }} gap={3}>
                          <HStack spacing={3} flex="1" minW="0">
                            <Avatar
                              name={
                                submission.student_full_name ||
                                submission.student_name ||
                                "Student"
                              }
                              size={{ base: "sm", md: "md" }}
                              bg="brand.400"
                              color="white"
                              fontWeight="700"
                            />
                            <VStack
                              align="flex-start"
                              spacing={1}
                              flex="1"
                              minW="0"
                            >
                              <HStack spacing={2} flexWrap="wrap">
                                <Text
                                  fontWeight="700"
                                  fontSize="sm"
                                  color="gray.800"
                                  noOfLines={1}
                                >
                                  {submission.student_full_name ||
                                    submission.student_name ||
                                    "Guest Student"}
                                </Text>
                                <Text
                                  fontSize="xs"
                                  color="gray.500"
                                  flexShrink={0}
                                >
                                  {getTimeAgo(submission.created_at)}
                                </Text>
                              </HStack>
                              <Wrap spacing={2}>
                                {/* Mood Badge */}
                                {submission.mood && (
                                  <WrapItem>
                                    <Badge
                                      colorScheme={getMoodColor(
                                        submission.mood,
                                      )}
                                      borderRadius="full"
                                      px={2}
                                      py={0.5}
                                      fontSize="2xs"
                                      fontWeight="600"
                                    >
                                      <HStack spacing={1}>
                                        <Icon as={FiSmile} boxSize={2.5} />
                                        <Text textTransform="capitalize">
                                          {submission.mood}
                                        </Text>
                                      </HStack>
                                    </Badge>
                                  </WrapItem>
                                )}
                                {/* Learning Style Badge */}
                                {submission.learning_style && (
                                  <WrapItem>
                                    <Badge
                                      colorScheme="blue"
                                      borderRadius="full"
                                      px={2}
                                      py={0.5}
                                      fontSize="2xs"
                                      fontWeight="600"
                                    >
                                      <HStack spacing={1}>
                                        <Icon as={FiUser} boxSize={2.5} />
                                        <Text>{submission.learning_style}</Text>
                                      </HStack>
                                    </Badge>
                                  </WrapItem>
                                )}
                                {/* Baseline Update Badge */}
                                {submission.is_baseline_update && (
                                  <WrapItem>
                                    <Badge
                                      colorScheme="green"
                                      borderRadius="full"
                                      px={2}
                                      py={0.5}
                                      fontSize="2xs"
                                      fontWeight="600"
                                    >
                                      <HStack spacing={1}>
                                        <Icon
                                          as={FiCheckCircle}
                                          boxSize={2.5}
                                        />
                                        <Text>Survey Done</Text>
                                      </HStack>
                                    </Badge>
                                  </WrapItem>
                                )}
                              </Wrap>
                            </VStack>
                          </HStack>
                          <Badge
                            colorScheme="brand"
                            fontSize="xs"
                            px={3}
                            py={1}
                            borderRadius="full"
                            alignSelf={{ base: "flex-start", sm: "center" }}
                            flexShrink={0}
                          >
                            {submission.status}
                          </Badge>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                ) : activeSessions > 0 ? (
                  <VStack py={8} spacing={3}>
                    <Box
                      bg="green.50"
                      p={4}
                      borderRadius="full"
                      border="2px dashed"
                      borderColor="green.200"
                    >
                      <Icon as={FiUsers} boxSize={8} color="green.400" />
                    </Box>
                    <Text color="gray.600" fontSize="sm" fontWeight="600">
                      Waiting for students to join...
                    </Text>
                    <Text
                      color="gray.500"
                      fontSize="xs"
                      textAlign="center"
                      maxW="300px"
                    >
                      Students will appear here once they complete their
                      check-in
                    </Text>
                  </VStack>
                ) : (
                  <VStack py={8} spacing={3}>
                    <Box
                      bg="gray.50"
                      p={4}
                      borderRadius="full"
                      border="2px dashed"
                      borderColor="gray.200"
                    >
                      <Icon as={FiActivity} boxSize={8} color="gray.400" />
                    </Box>
                    <Text color="gray.600" fontSize="sm" fontWeight="600">
                      No active sessions
                    </Text>
                    <Text
                      color="gray.500"
                      fontSize="xs"
                      textAlign="center"
                      maxW="300px"
                    >
                      Launch a session to see student activity
                    </Text>
                    <Button
                      size="sm"
                      colorScheme="brand"
                      leftIcon={<Icon as={FiPlayCircle} />}
                      onClick={() => navigate("/teacher/sessions/new")}
                      mt={2}
                      borderRadius="full"
                    >
                      Launch Session
                    </Button>
                  </VStack>
                )}
              </CardBody>
            </Card>

            {/* Recent Courses & Surveys Row */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {/* Recent Courses Card */}
              <Card borderRadius="2xl" boxShadow="sm" bg="white" border="none">
                <CardHeader pb={2}>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="lg" fontWeight="700" color="gray.800">
                      Recent Courses
                    </Text>
                    <Button
                      variant="ghost"
                      size="sm"
                      colorScheme="brand"
                      fontWeight="600"
                      rightIcon={<Icon as={FiArrowRight} />}
                      onClick={() => navigate("/teacher/courses")}
                    >
                      View all
                    </Button>
                  </Flex>
                </CardHeader>
                <CardBody pt={0}>
                  {coursesQuery.isLoading ? (
                    <VStack spacing={3} align="stretch">
                      {[1, 2, 3].map((i) => (
                        <HStack key={i} p={3} borderRadius="xl" bg="gray.50">
                          <SkeletonCircle size="10" />
                          <SkeletonText noOfLines={2} flex="1" />
                        </HStack>
                      ))}
                    </VStack>
                  ) : coursesQuery.data?.length ? (
                    <VStack spacing={2} align="stretch">
                      {coursesQuery.data.slice(0, 4).map((course: any) => (
                        <HStack
                          key={course.id}
                          p={3}
                          borderRadius="xl"
                          bg="gray.50"
                          cursor="pointer"
                          transition="all 0.2s"
                          _hover={{ bg: "brand.50", borderColor: "brand.200" }}
                          _active={{ transform: "scale(0.98)" }}
                          onClick={() =>
                            navigate(`/teacher/courses/${course.id}`)
                          }
                          justify="space-between"
                          border="1px solid"
                          borderColor="transparent"
                        >
                          <HStack spacing={3} flex="1" minW="0">
                            <Box
                              bg="brand.100"
                              p={2}
                              borderRadius="lg"
                              flexShrink={0}
                            >
                              <Icon as={FiBook} boxSize={5} color="brand.500" />
                            </Box>
                            <VStack
                              align="flex-start"
                              spacing={0}
                              flex="1"
                              minW="0"
                            >
                              <Text
                                fontWeight="700"
                                fontSize="sm"
                                color="gray.800"
                                noOfLines={1}
                              >
                                {course.title}
                              </Text>
                              <Text
                                fontSize="xs"
                                color="gray.500"
                                noOfLines={1}
                              >
                                {course.baseline_survey_id
                                  ? "Has baseline survey"
                                  : "No survey"}
                              </Text>
                            </VStack>
                          </HStack>
                          <Icon
                            as={FiArrowRight}
                            color="gray.400"
                            flexShrink={0}
                          />
                        </HStack>
                      ))}
                    </VStack>
                  ) : (
                    <VStack py={8} spacing={3}>
                      <Box
                        bg="gray.50"
                        p={4}
                        borderRadius="full"
                        border="2px dashed"
                        borderColor="gray.200"
                      >
                        <Icon as={FiBook} boxSize={8} color="gray.400" />
                      </Box>
                      <Text color="gray.600" fontSize="sm" fontWeight="600">
                        No courses yet
                      </Text>
                      <Button
                        size="sm"
                        colorScheme="brand"
                        leftIcon={<Icon as={FiPlus} />}
                        onClick={() => navigate("/teacher/courses/new")}
                        borderRadius="full"
                      >
                        Create Course
                      </Button>
                    </VStack>
                  )}
                </CardBody>
              </Card>

              {/* Recent Surveys Card */}
              <Card borderRadius="2xl" boxShadow="sm" bg="white" border="none">
                <CardHeader pb={2}>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="lg" fontWeight="700" color="gray.800">
                      Recent Surveys
                    </Text>
                    <Button
                      variant="ghost"
                      size="sm"
                      colorScheme="brand"
                      fontWeight="600"
                      rightIcon={<Icon as={FiArrowRight} />}
                      onClick={() => navigate("/teacher/surveys")}
                    >
                      View all
                    </Button>
                  </Flex>
                </CardHeader>
                <CardBody pt={0}>
                  {surveysQuery.isLoading ? (
                    <VStack spacing={3} align="stretch">
                      {[1, 2, 3].map((i) => (
                        <HStack key={i} p={3} borderRadius="xl" bg="gray.50">
                          <SkeletonCircle size="10" />
                          <SkeletonText noOfLines={2} flex="1" />
                        </HStack>
                      ))}
                    </VStack>
                  ) : surveysQuery.data?.length ? (
                    <VStack spacing={2} align="stretch">
                      {surveysQuery.data.slice(0, 4).map((survey: any) => (
                        <HStack
                          key={survey.id}
                          p={3}
                          borderRadius="xl"
                          bg="gray.50"
                          cursor="pointer"
                          transition="all 0.2s"
                          _hover={{ bg: "blue.50", borderColor: "blue.200" }}
                          _active={{ transform: "scale(0.98)" }}
                          onClick={() =>
                            navigate(`/teacher/surveys/${survey.id}`)
                          }
                          justify="space-between"
                          border="1px solid"
                          borderColor="transparent"
                        >
                          <HStack spacing={3} flex="1" minW="0">
                            <Box
                              bg="blue.100"
                              p={2}
                              borderRadius="lg"
                              flexShrink={0}
                            >
                              <Icon
                                as={FiClipboard}
                                boxSize={5}
                                color="blue.500"
                              />
                            </Box>
                            <VStack
                              align="flex-start"
                              spacing={0}
                              flex="1"
                              minW="0"
                            >
                              <Text
                                fontWeight="700"
                                fontSize="sm"
                                color="gray.800"
                                noOfLines={1}
                              >
                                {survey.title}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {survey.questions?.length || 0} questions
                              </Text>
                            </VStack>
                          </HStack>
                          <Icon
                            as={FiArrowRight}
                            color="gray.400"
                            flexShrink={0}
                          />
                        </HStack>
                      ))}
                    </VStack>
                  ) : (
                    <VStack py={8} spacing={3}>
                      <Box
                        bg="gray.50"
                        p={4}
                        borderRadius="full"
                        border="2px dashed"
                        borderColor="gray.200"
                      >
                        <Icon as={FiClipboard} boxSize={8} color="gray.400" />
                      </Box>
                      <Text color="gray.600" fontSize="sm" fontWeight="600">
                        No surveys yet
                      </Text>
                      <Button
                        size="sm"
                        colorScheme="brand"
                        leftIcon={<Icon as={FiPlus} />}
                        onClick={() => navigate("/teacher/surveys/new")}
                        borderRadius="full"
                      >
                        Create Survey
                      </Button>
                    </VStack>
                  )}
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Activities Table */}
            <Card borderRadius="2xl" boxShadow="sm" bg="white" border="none">
              <CardHeader>
                <Flex
                  justify="space-between"
                  align="center"
                  wrap="wrap"
                  gap={3}
                >
                  <Text fontSize="lg" fontWeight="700" color="gray.800">
                    Recent Activities
                  </Text>
                  <Button
                    variant="ghost"
                    size="sm"
                    colorScheme="brand"
                    fontWeight="600"
                    rightIcon={<Icon as={FiArrowRight} />}
                    onClick={() => navigate("/teacher/activities")}
                  >
                    View all
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody pt={0} overflowX="auto">
                {activitiesQuery.isLoading ? (
                  <VStack spacing={3}>
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton
                        key={i}
                        height="50px"
                        width="100%"
                        borderRadius="lg"
                      />
                    ))}
                  </VStack>
                ) : activitiesQuery.data?.length ? (
                  <>
                    {/* Mobile: Card Layout */}
                    <VStack
                      spacing={2}
                      align="stretch"
                      display={{ base: "flex", md: "none" }}
                    >
                      {activitiesQuery.data.slice(0, 5).map((activity: any) => (
                        <HStack
                          key={activity.id}
                          p={3}
                          borderRadius="xl"
                          bg="gray.50"
                          cursor="pointer"
                          transition="all 0.2s"
                          _hover={{
                            bg: "purple.50",
                            borderColor: "purple.200",
                          }}
                          _active={{ transform: "scale(0.98)" }}
                          onClick={() =>
                            navigate(`/teacher/activities/${activity.id}`)
                          }
                          justify="space-between"
                          border="1px solid"
                          borderColor="transparent"
                        >
                          <HStack spacing={3} flex="1" minW="0">
                            <Box
                              bg="purple.100"
                              p={2}
                              borderRadius="lg"
                              flexShrink={0}
                            >
                              <Icon
                                as={FiGrid}
                                boxSize={5}
                                color="purple.500"
                              />
                            </Box>
                            <VStack
                              align="flex-start"
                              spacing={1}
                              flex="1"
                              minW="0"
                            >
                              <Text
                                fontWeight="700"
                                fontSize="sm"
                                color="gray.800"
                                noOfLines={1}
                              >
                                {activity.name}
                              </Text>
                              <HStack spacing={2} flexWrap="wrap">
                                <Badge
                                  colorScheme="purple"
                                  borderRadius="full"
                                  px={2}
                                  fontSize="2xs"
                                  fontWeight="600"
                                >
                                  {activity.type}
                                </Badge>
                                {activity.tags?.length > 0 && (
                                  <Text fontSize="xs" color="gray.500">
                                    {activity.tags.length} tag
                                    {activity.tags.length !== 1 ? "s" : ""}
                                  </Text>
                                )}
                              </HStack>
                            </VStack>
                          </HStack>
                          <Icon
                            as={FiArrowRight}
                            color="gray.400"
                            flexShrink={0}
                          />
                        </HStack>
                      ))}
                    </VStack>

                    {/* Desktop: Table Layout */}
                    <Box display={{ base: "none", md: "block" }}>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th
                              color="gray.500"
                              fontWeight="600"
                              fontSize="xs"
                              textTransform="uppercase"
                            >
                              #
                            </Th>
                            <Th
                              color="gray.500"
                              fontWeight="600"
                              fontSize="xs"
                              textTransform="uppercase"
                            >
                              Activity
                            </Th>
                            <Th
                              color="gray.500"
                              fontWeight="600"
                              fontSize="xs"
                              textTransform="uppercase"
                            >
                              Type
                            </Th>
                            <Th
                              color="gray.500"
                              fontWeight="600"
                              fontSize="xs"
                              textTransform="uppercase"
                            >
                              Tags
                            </Th>
                            <Th></Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {activitiesQuery.data
                            .slice(0, 5)
                            .map((activity: any, index: number) => (
                              <Tr
                                key={activity.id}
                                _hover={{ bg: "gray.50" }}
                                cursor="pointer"
                                transition="all 0.2s"
                                onClick={() =>
                                  navigate(`/teacher/activities/${activity.id}`)
                                }
                              >
                                <Td fontWeight="600" color="gray.500">
                                  {index + 1}.
                                </Td>
                                <Td>
                                  <HStack spacing={3}>
                                    <Box
                                      bg="purple.100"
                                      p={2}
                                      borderRadius="lg"
                                    >
                                      <Icon
                                        as={FiGrid}
                                        boxSize={4}
                                        color="purple.500"
                                      />
                                    </Box>
                                    <VStack align="flex-start" spacing={0}>
                                      <Text
                                        fontWeight="600"
                                        color="gray.800"
                                        fontSize="sm"
                                      >
                                        {activity.name}
                                      </Text>
                                      <Text
                                        fontSize="xs"
                                        color="gray.500"
                                        noOfLines={1}
                                      >
                                        {activity.summary}
                                      </Text>
                                    </VStack>
                                  </HStack>
                                </Td>
                                <Td>
                                  <Badge
                                    colorScheme="purple"
                                    borderRadius="full"
                                    px={2}
                                    py={1}
                                    fontSize="xs"
                                    fontWeight="600"
                                  >
                                    {activity.type}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Wrap spacing={1}>
                                    {activity.tags
                                      ?.slice(0, 2)
                                      .map((tag: string) => (
                                        <WrapItem key={tag}>
                                          <Badge
                                            colorScheme="gray"
                                            borderRadius="full"
                                            px={2}
                                            fontSize="xs"
                                          >
                                            {tag}
                                          </Badge>
                                        </WrapItem>
                                      ))}
                                    {activity.tags?.length > 2 && (
                                      <WrapItem>
                                        <Badge
                                          colorScheme="gray"
                                          borderRadius="full"
                                          px={2}
                                          fontSize="xs"
                                        >
                                          +{activity.tags.length - 2}
                                        </Badge>
                                      </WrapItem>
                                    )}
                                  </Wrap>
                                </Td>
                                <Td>
                                  <Icon as={FiArrowRight} color="gray.400" />
                                </Td>
                              </Tr>
                            ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </>
                ) : (
                  <VStack py={8} spacing={3}>
                    <Box
                      bg="gray.50"
                      p={4}
                      borderRadius="full"
                      border="2px dashed"
                      borderColor="gray.200"
                    >
                      <Icon as={FiGrid} boxSize={8} color="gray.400" />
                    </Box>
                    <Text color="gray.600" fontSize="sm" fontWeight="600">
                      No activities yet
                    </Text>
                    <Button
                      size="sm"
                      colorScheme="brand"
                      leftIcon={<Icon as={FiPlus} />}
                      onClick={() => navigate("/teacher/activities/new")}
                      borderRadius="full"
                    >
                      Create Activity
                    </Button>
                  </VStack>
                )}
              </CardBody>
            </Card>
          </Stack>
        </Box>

        {/* Right Column - Calendar & Quick Actions */}
        <Box display={{ base: "none", xl: "block" }}>
          <Stack spacing={6}>
            {/* Calendar Card */}
            <Card borderRadius="2xl" boxShadow="sm" bg="white" border="none">
              <CardBody p={5}>
                {/* Calendar Header */}
                <Flex justify="space-between" align="center" mb={4}>
                  <IconButton
                    aria-label="Previous month"
                    icon={<Icon as={FiChevronLeft} />}
                    variant="ghost"
                    size="sm"
                    borderRadius="lg"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.setMonth(currentMonth.getMonth() - 1),
                        ),
                      )
                    }
                  />
                  <Text fontWeight="700" color="gray.800" fontSize="md">
                    {monthYear}
                  </Text>
                  <IconButton
                    aria-label="Next month"
                    icon={<Icon as={FiChevronRight} />}
                    variant="ghost"
                    size="sm"
                    borderRadius="lg"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.setMonth(currentMonth.getMonth() + 1),
                        ),
                      )
                    }
                  />
                </Flex>

                {/* Calendar Grid */}
                <SimpleGrid columns={7} spacing={1}>
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                    <Text
                      key={i}
                      fontSize="xs"
                      fontWeight="700"
                      color="gray.500"
                      textAlign="center"
                      py={2}
                    >
                      {day}
                    </Text>
                  ))}
                  {calendarDays.map((day, i) => (
                    <Flex
                      key={i}
                      justify="center"
                      align="center"
                      h="34px"
                      borderRadius="lg"
                      bg={
                        day === todayDate && isCurrentMonth
                          ? "brand.500"
                          : "transparent"
                      }
                      color={
                        day === todayDate && isCurrentMonth
                          ? "white"
                          : "gray.700"
                      }
                      fontWeight={
                        day === todayDate && isCurrentMonth ? "700" : "500"
                      }
                      fontSize="sm"
                      cursor={day ? "pointer" : "default"}
                      transition="all 0.2s"
                      _hover={
                        day
                          ? {
                              bg:
                                day === todayDate && isCurrentMonth
                                  ? "brand.600"
                                  : "gray.100",
                            }
                          : {}
                      }
                    >
                      {day}
                    </Flex>
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Quick Actions Card */}
            <Card borderRadius="2xl" boxShadow="sm" bg="white" border="none">
              <CardHeader pb={2}>
                <Text fontSize="lg" fontWeight="700" color="gray.800">
                  Quick Actions
                </Text>
              </CardHeader>
              <CardBody pt={0}>
                <VStack spacing={2} align="stretch">
                  <Button
                    leftIcon={<Icon as={FiPlus} />}
                    colorScheme="brand"
                    size="md"
                    borderRadius="xl"
                    justifyContent="flex-start"
                    fontWeight="600"
                    onClick={() => navigate("/teacher/courses/new")}
                  >
                    Create Course
                  </Button>
                  <Button
                    leftIcon={<Icon as={FiClipboard} />}
                    variant="outline"
                    colorScheme="brand"
                    size="md"
                    borderRadius="xl"
                    justifyContent="flex-start"
                    fontWeight="600"
                    onClick={() => navigate("/teacher/surveys/new")}
                  >
                    Create Survey
                  </Button>

                  <Button
                    leftIcon={<Icon as={FiGrid} />}
                    variant="outline"
                    colorScheme="brand"
                    size="md"
                    borderRadius="xl"
                    justifyContent="flex-start"
                    fontWeight="600"
                    onClick={() => navigate("/teacher/activities/new")}
                  >
                    Create Activity
                  </Button>
                  <Button
                    leftIcon={<Icon as={FiPlayCircle} />}
                    variant="outline"
                    colorScheme="brand"
                    size="md"
                    borderRadius="xl"
                    justifyContent="flex-start"
                    fontWeight="600"
                    onClick={() => navigate("/teacher/sessions/new")}
                  >
                    Launch Session
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </Stack>
        </Box>
      </SimpleGrid>

      {/* Mobile: Quick Actions */}
      <Box display={{ base: "block", xl: "none" }}>
        <Card borderRadius="2xl" boxShadow="sm" bg="white" border="none">
          <CardHeader pb={2}>
            <Text fontSize="lg" fontWeight="700" color="gray.800">
              Quick Actions
            </Text>
          </CardHeader>
          <CardBody pt={0}>
            <SimpleGrid columns={2} spacing={3}>
              <Button
                leftIcon={<Icon as={FiPlus} />}
                colorScheme="brand"
                size="md"
                borderRadius="xl"
                fontWeight="600"
                onClick={() => navigate("/teacher/courses/new")}
              >
                New Course
              </Button>
              <Button
                leftIcon={<Icon as={FiClipboard} />}
                variant="outline"
                colorScheme="brand"
                size="md"
                borderRadius="xl"
                fontWeight="600"
                onClick={() => navigate("/teacher/surveys/new")}
              >
                New Survey
              </Button>
              <Button
                leftIcon={<Icon as={FiPlayCircle} />}
                variant="outline"
                colorScheme="brand"
                size="md"
                borderRadius="xl"
                fontWeight="600"
                onClick={() => navigate("/teacher/sessions/new")}
              >
                Launch Session
              </Button>
              <Button
                leftIcon={<Icon as={FiGrid} />}
                variant="outline"
                colorScheme="brand"
                size="md"
                borderRadius="xl"
                fontWeight="600"
                onClick={() => navigate("/teacher/activities/new")}
              >
                New Activity
              </Button>
            </SimpleGrid>
          </CardBody>
        </Card>
      </Box>
    </Stack>
  );
}
