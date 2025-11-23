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
  Text,
  HStack,
  VStack,
  Icon,
  SimpleGrid,
  Flex,
  useToast,
  Avatar,
  Divider,
  IconButton,
  useBreakpointValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
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
  FiStar,
  FiLogOut,
  FiHome,
  FiMenu,
  FiX,
  FiArrowLeft,
} from "react-icons/fi";
import { PiGraduationCapBold } from "react-icons/pi";
import { getStudentProfile, getStudentSubmissions } from "../../api/students";
import { getJoinSession } from "../../api/public";
import { ApiError } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";

export function StudentDashboardPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab");
  const currentView = initialTab || "home";
  const [token, setToken] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  const handleNavigate = (view: string) => {
    if (view === "home") {
      setSearchParams({});
    } else {
      setSearchParams({ tab: view });
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "See you later! 👋",
      description: "You've been logged out successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    navigate("/");
  };

  const joinError =
    joinMutation.error instanceof ApiError
      ? joinMutation.error.message
      : joinMutation.isError
      ? "Oops! We couldn't find that session. Check your code and try again!"
      : null;

  const menuItems = [
    { id: "home", label: "Home", icon: FiHome },
    { id: "profile", label: "My Profile", icon: FiUser },
    { id: "history", label: "My History", icon: FiClock },
    { id: "join", label: "Join Session", icon: FiKey },
  ];

  return (
    <Flex h="100vh" bg="gray.50" overflow="hidden">
      {/* Mobile Drawer Navigation */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottom="1px solid" borderColor="gray.100">
            <HStack spacing={3}>
              <Icon as={PiGraduationCapBold} boxSize={10} color="brand.400" />
              <VStack align="flex-start" spacing={0}>
                <Text fontWeight="800" fontSize="lg" color="gray.800">
                  Student Portal
                </Text>
                <Text fontSize="xs" color="gray.500" fontWeight="600">
                  Learning Hub
                </Text>
              </VStack>
            </HStack>
          </DrawerHeader>
          <DrawerBody p={0}>
            <VStack h="full" spacing={0} align="stretch">
              {/* User Profile Card */}
              <Box p={4} borderBottom="1px solid" borderColor="gray.100">
                <HStack
                  spacing={3}
                  p={3}
                  bg="gray.50"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <Avatar
                    name={profileQuery.data?.full_name}
                    size="md"
                    bg="brand.300"
                    color="white"
                  />
                  <VStack align="flex-start" spacing={0} flex="1" minW="0">
                    <Text
                      fontWeight="700"
                      fontSize="sm"
                      color="gray.800"
                      noOfLines={1}
                    >
                      {profileQuery.data?.full_name || "Loading..."}
                    </Text>
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                      {profileQuery.data?.email || ""}
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              {/* Navigation Menu */}
              <VStack flex="1" p={4} spacing={2} align="stretch">
                {menuItems.map((item) => (
                  <Button
                    key={item.id}
                    leftIcon={<Icon as={item.icon} boxSize={5} />}
                    justifyContent="flex-start"
                    variant="ghost"
                    size="lg"
                    fontWeight="600"
                    color={currentView === item.id ? "brand.600" : "gray.600"}
                    bg={currentView === item.id ? "brand.50" : "transparent"}
                    borderRadius="xl"
                    _hover={{
                      bg: currentView === item.id ? "brand.50" : "gray.100",
                    }}
                    onClick={() => {
                      handleNavigate(item.id);
                      onClose();
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </VStack>

              {/* Logout Button */}
              <Box p={4} borderTop="1px solid" borderColor="gray.100">
                <Button
                  leftIcon={<Icon as={FiLogOut} />}
                  w="full"
                  colorScheme="red"
                  variant="ghost"
                  size="lg"
                  fontWeight="600"
                  onClick={handleLogout}
                  borderRadius="xl"
                >
                  Logout
                </Button>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Side Navigation - Desktop Only */}
      <Box
        w={isMobile ? "0" : (isSidebarOpen ? "280px" : "0")}
        bg="white"
        borderRight="1px solid"
        borderColor="gray.200"
        transition="all 0.3s"
        overflow="hidden"
        boxShadow="sm"
        display={{ base: "none", lg: "block" }}
      >
        <VStack h="full" spacing={0} align="stretch">
          {/* Logo/Brand */}
          <Box p={6} borderBottom="1px solid" borderColor="gray.100">
            <Flex justify="space-between" align="center">
              <HStack spacing={3}>
                <Icon as={PiGraduationCapBold} boxSize={10} color="ink.400" />
                <VStack align="flex-start" spacing={0}>
                  <Text fontWeight="800" fontSize="lg" color="gray.800">
                    Student Portal
                  </Text>
                  <Text fontSize="xs" color="gray.500" fontWeight="600">
                    Learning Hub
                  </Text>
                </VStack>
              </HStack>
              <IconButton
                icon={<Icon as={FiX} />}
                variant="ghost"
                size="sm"
                aria-label="Close sidebar"
                onClick={() => setIsSidebarOpen(false)}
                borderRadius="lg"
              />
            </Flex>
          </Box>

          {/* User Profile Card */}
          <Box p={4} borderBottom="1px solid" borderColor="gray.100">
            <HStack
              spacing={3}
              p={3}
              bg="gray.50"
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.200"
            >
              <Avatar
                name={profileQuery.data?.full_name}
                size="md"
                bg="ink.300"
                color="white"
              />
              <VStack align="flex-start" spacing={0} flex="1" minW="0">
                <Text
                  fontWeight="700"
                  fontSize="sm"
                  color="gray.800"
                  noOfLines={1}
                >
                  {profileQuery.data?.full_name || "Loading..."}
                </Text>
                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                  {profileQuery.data?.email || ""}
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* Navigation Menu */}
          <VStack flex="1" p={4} spacing={2} align="stretch">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                leftIcon={<Icon as={item.icon} boxSize={5} />}
                justifyContent="flex-start"
                variant="ghost"
                size="lg"
                fontWeight="600"
                color={currentView === item.id ? "brand.600" : "gray.600"}
                bg={currentView === item.id ? "brand.50" : "transparent"}
                borderRadius="xl"
                _hover={{
                  bg: currentView === item.id ? "brand.50" : "gray.100",
                }}
                onClick={() => handleNavigate(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </VStack>

          {/* Logout Button */}
          <Box p={4} borderTop="1px solid" borderColor="gray.100">
            <Button
              leftIcon={<Icon as={FiLogOut} />}
              w="full"
              colorScheme="red"
              variant="ghost"
              size="lg"
              fontWeight="600"
              onClick={handleLogout}
              borderRadius="xl"
            >
              Logout
            </Button>
          </Box>
        </VStack>
      </Box>

      {/* Main Content Area */}
      <Flex flex="1" direction="column" overflow="hidden">
        {/* Top Bar */}
        <Box
          bg="white"
          borderBottom="1px solid"
          borderColor="gray.200"
          px={{ base: 4, md: 6 }}
          py={4}
          boxShadow="sm"
        >
          <Flex justify="space-between" align="center">
            <HStack spacing={{ base: 2, md: 4 }}>
              {/* Show back button if not on home and sidebar is collapsed OR on mobile */}
              {currentView !== "home" && (isMobile || !isSidebarOpen) ? (
                <IconButton
                  icon={<Icon as={FiArrowLeft} />}
                  variant="ghost"
                  aria-label="Back to home"
                  onClick={() => handleNavigate("home")}
                  borderRadius="lg"
                />
              ) : isMobile ? (
                <IconButton
                  icon={<Icon as={FiMenu} />}
                  variant="ghost"
                  aria-label="Toggle menu"
                  onClick={onOpen}
                  borderRadius="lg"
                />
              ) : !isSidebarOpen && (
                <IconButton
                  icon={<Icon as={FiMenu} />}
                  variant="ghost"
                  aria-label="Open sidebar"
                  onClick={() => setIsSidebarOpen(true)}
                  borderRadius="lg"
                />
              )}
              <VStack align="flex-start" spacing={0}>
                <Text fontWeight="800" fontSize={{ base: "xl", md: "2xl" }} color="gray.800">
                  {menuItems.find((item) => item.id === currentView)?.label ||
                    "Home"}
                </Text>
                <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500" display={{ base: "none", sm: "block" }}>
                  Welcome back,{" "}
                  {profileQuery.data?.full_name?.split(" ")[0] || "Student"}!
                </Text>
              </VStack>
            </HStack>
            <HStack spacing={3}>
              <Badge
                colorScheme="ink"
                px={{ base: 2, md: 3 }}
                py={{ base: 1, md: 2 }}
                borderRadius="lg"
                fontSize={{ base: "xs", md: "sm" }}
                fontWeight="700"
                display={{ base: "none", sm: "flex" }}
              >
                {submissionsQuery.data?.submissions.length || 0} Submissions
              </Badge>
            </HStack>
          </Flex>
        </Box>

        {/* Content Area */}
        <Box flex="1" overflow="auto" p={{ base: 4, md: 6 }}>
          {currentView === "home" && (
            <Stack spacing={6} maxW="1200px" mx="auto">
              {/* Quick Actions */}
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                {/* Profile Card */}
                <Card
                 border="2px solid"
          borderColor="blue.100"
          bg="blue.50"
                  boxShadow="sm"
                  cursor="pointer"
                  onClick={() => handleNavigate("profile")}
                  transition="all 0.2s"
                  _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "lg",
                  }}
                >
                  <CardBody p={6}>
                    <VStack align="stretch" spacing={4}>
                      <Box
                        bg="blue.100"
                        w="48px"
                        h="48px"
                        borderRadius="xl"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiUser} boxSize={6} color="sky.400" />
                      </Box>
                      <VStack align="flex-start" spacing={1}>
                        <Text
                          fontSize="lg"
                          fontWeight="800"
                          color="sky.900"
                        >
                          My Profile
                        </Text>
                        <Text fontSize="sm" color="sky.700">
                          View your information
                        </Text>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Join Session Card */}
                <Card
       border="2px solid"
          borderColor="red.100"
          bg="red.50"
                  boxShadow="sm"
                  cursor="pointer"
                  onClick={() => handleNavigate("join")}
                  transition="all 0.2s"
                  _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "lg",
                  }}
                >
                  <CardBody p={6}>
                    <VStack align="stretch" spacing={4}>
                      <Box
                        bg="red.100"
                        w="48px"
                        h="48px"
                        borderRadius="xl"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiKey} boxSize={6} color="red.500" />
                      </Box>
                      <VStack align="flex-start" spacing={1}>
                        <Text fontSize="lg" fontWeight="800" color="red.900">
                          Join Session
                        </Text>
                        <Text fontSize="sm" color="red.700">
                          Enter your session code
                        </Text>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* History Card */}
                <Card
                    border="2px solid"
          borderColor="purple.200"
          bg="purple.50"
                  boxShadow="sm"
                  cursor="pointer"
                  onClick={() => handleNavigate("history")}
                  transition="all 0.2s"
                  _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "lg",
                  }}
                >
                  <CardBody p={6}>
                    <VStack align="stretch" spacing={4}>
                      <Box
                        bg="purple.100"
                        w="48px"
                        h="48px"
                        borderRadius="xl"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiClock} boxSize={6} color="purple.500" />
                      </Box>
                      <VStack align="flex-start" spacing={1}>
                        <Text
                          fontSize="lg"
                          fontWeight="800"
                          color="purple.900"
                        >
                          My History
                        </Text>
                        <Text fontSize="sm" color="purple.700">
                          {submissionsQuery.data?.submissions.length || 0}{" "}
                          total submissions
                        </Text>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>

              {/* Recent Activity */}
              <Box>
                <Text
                  fontSize="xl"
                  fontWeight="800"
                  color="gray.800"
                  mb={4}
                >
                  Recent Activity
                </Text>
                {submissionsQuery.isLoading ? (
                  <Card borderRadius="2xl" boxShadow="sm">
                    <CardBody p={12}>
                      <VStack spacing={4}>
                        <Spinner size="lg" color="brand.500" />
                        <Text color="gray.500">Loading your activity...</Text>
                      </VStack>
                    </CardBody>
                  </Card>
                ) : submissionsQuery.data?.submissions.length ? (
                  <Stack spacing={4}>
                    {submissionsQuery.data.submissions
                      .slice(0, 3)
                      .map((submission) => (
                        <Card
                          key={submission.id}
                          borderRadius="xl"
                          boxShadow="sm"
                          border="1px solid"
                          borderColor="gray.200"
                          bg="white"
                          transition="all 0.2s"
                          _hover={{
                            boxShadow: "md",
                            borderColor: "brand.300",
                          }}
                        >
                          <CardBody p={5}>
                            <Flex justify="space-between" align="center">
                              <HStack spacing={4}>
                                <Box
                                  bg="brand.50"
                                  p={3}
                                  borderRadius="lg"
                                  border="1px solid"
                                  borderColor="brand.100"
                                >
                                  <Icon
                                    as={FiBookOpen}
                                    boxSize={5}
                                    color="brand.500"
                                  />
                                </Box>
                                <VStack align="flex-start" spacing={1}>
                                  <Text
                                    fontWeight="700"
                                    fontSize="md"
                                    color="gray.800"
                                  >
                                    {submission.course_title}
                                  </Text>
                                  <Text fontSize="sm" color="gray.500">
                                    {new Date(
                                      submission.created_at
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </Text>
                                </VStack>
                              </HStack>
                              <Badge
                                colorScheme={
                                  submission.status === "completed"
                                    ? "green"
                                    : "ink"
                                }
                                px={3}
                                py={1}
                                borderRadius="lg"
                                fontWeight="600"
                              >
                                {submission.status === "completed"
                                  ? "Completed"
                                  : "In Progress"}
                              </Badge>
                            </Flex>
                          </CardBody>
                        </Card>
                      ))}
                    {submissionsQuery.data.submissions.length > 3 && (
                      <Button
                        variant="ghost"
                        colorScheme="brand"
                        onClick={() => handleNavigate("history")}
                        borderRadius="lg"
                      >
                        View all submissions →
                      </Button>
                    )}
                  </Stack>
                ) : (
                  <Card borderRadius="2xl" boxShadow="sm" bg="white">
                    <CardBody p={12}>
                      <VStack spacing={4}>
                        <Box
                          bg="gray.100"
                          w="64px"
                          h="64px"
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Icon as={FiClock} boxSize={8} color="gray.400" />
                        </Box>
                        <VStack spacing={2}>
                          <Text fontWeight="700" fontSize="lg" color="gray.700">
                            No activity yet
                          </Text>
                          <Text color="gray.500" textAlign="center">
                            Join a session to get started!
                          </Text>
                        </VStack>
                        <Button
                          colorScheme="brand"
                          size="lg"
                          borderRadius="lg"
                          onClick={() => handleNavigate("join")}
                        >
                          Join Session
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                )}
              </Box>
            </Stack>
          )}

          {currentView === "profile" && (
            <Stack spacing={6} maxW="800px" mx="auto">
              {profileQuery.isLoading ? (
                <Card borderRadius="2xl" boxShadow="sm">
                  <CardBody p={12}>
                    <VStack spacing={4}>
                      <Spinner size="lg" color="brand.500" />
                      <Text color="gray.500">Loading your profile...</Text>
                    </VStack>
                  </CardBody>
                </Card>
              ) : profileQuery.data ? (
                <>
                  {/* Profile Header */}
                  <Card
                    borderRadius="2xl"
                    bg="blue.50"
                    boxShadow="sm"
                    borderColor="blue.200"
                  >
                    <CardBody p={8}>
                      <HStack spacing={6}>
                        <Avatar
                          name={profileQuery.data.full_name}
                          size="2xl"
                          bg="blue.100"
                          color="blue.500"
                          fontWeight="900"
                        />
                        <VStack align="flex-start" spacing={2}>
                          <Text
                            fontSize="3xl"
                            fontWeight="900"
                            color="blue.500"
                          >
                            {profileQuery.data.full_name}
                          </Text>
                          <Badge
                            bg="whiteAlpha.300"
                            color="blue.400"
                            px={3}
                            py={1}
                            borderRadius="lg"
                            fontWeight="700"
                          >
                            Student
                          </Badge>
                        </VStack>
                      </HStack>
                    </CardBody>
                  </Card>

                  {/* Profile Details */}
                  <Card borderRadius="2xl" boxShadow="sm" bg="white">
                    <CardBody p={6}>
                      <Stack spacing={4}>
                        <Text fontWeight="800" fontSize="lg" color="gray.800">
                          Profile Information
                        </Text>
                        <Divider />
                        <VStack spacing={4} align="stretch">
                          <HStack
                            p={4}
                            bg="gray.50"
                            borderRadius="xl"
                            spacing={4}
                          >
                            <Box
                              bg="brand.100"
                              p={3}
                              borderRadius="lg"
                              border="1px solid"
                              borderColor="brand.200"
                            >
                              <Icon
                                as={FiUser}
                                boxSize={5}
                                color="brand.600"
                              />
                            </Box>
                            <VStack align="flex-start" spacing={0} flex="1">
                              <Text fontSize="xs" color="gray.500" fontWeight="600">
                                Full Name
                              </Text>
                              <Text fontSize="md" color="gray.800" fontWeight="700">
                                {profileQuery.data.full_name}
                              </Text>
                            </VStack>
                          </HStack>

                          <HStack
                            p={4}
                            bg="gray.50"
                            borderRadius="xl"
                            spacing={4}
                          >
                            <Box
                              bg="blue.100"
                              p={3}
                              borderRadius="lg"
                              border="1px solid"
                              borderColor="blue.200"
                            >
                              <Icon
                                as={FiMail}
                                boxSize={5}
                                color="blue.600"
                              />
                            </Box>
                            <VStack align="flex-start" spacing={0} flex="1">
                              <Text fontSize="xs" color="gray.500" fontWeight="600">
                                Email Address
                              </Text>
                              <Text fontSize="md" color="gray.800" fontWeight="700">
                                {profileQuery.data.email}
                              </Text>
                            </VStack>
                          </HStack>

                          <HStack
                            p={4}
                            bg="gray.50"
                            borderRadius="xl"
                            spacing={4}
                          >
                            <Box
                              bg="green.100"
                              p={3}
                              borderRadius="lg"
                              border="1px solid"
                              borderColor="green.200"
                            >
                              <Icon
                                as={FiHash}
                                boxSize={5}
                                color="green.600"
                              />
                            </Box>
                            <VStack align="flex-start" spacing={0} flex="1">
                              <Text fontSize="xs" color="gray.500" fontWeight="600">
                                Student ID
                              </Text>
                              <Text
                                fontSize="md"
                                color="gray.800"
                                fontWeight="700"
                                fontFamily="mono"
                              >
                                {profileQuery.data.id}
                              </Text>
                            </VStack>
                          </HStack>
                        </VStack>
                      </Stack>
                    </CardBody>
                  </Card>
                </>
              ) : (
                <Alert status="error" borderRadius="xl">
                  <AlertIcon />
                  <AlertDescription>
                    Unable to load profile. Please try again.
                  </AlertDescription>
                </Alert>
              )}
            </Stack>
          )}

          {currentView === "history" && (
            <Stack spacing={6} maxW="1000px" mx="auto">
              {submissionsQuery.isLoading ? (
                <Card borderRadius="2xl" boxShadow="sm">
                  <CardBody p={12}>
                    <VStack spacing={4}>
                      <Spinner size="lg" color="brand.500" />
                      <Text color="gray.500">Loading your history...</Text>
                    </VStack>
                  </CardBody>
                </Card>
              ) : submissionsQuery.data?.submissions.length ? (
                <>
                  <HStack justify="space-between" align="center">
                    <Text fontSize="xl" fontWeight="800" color="gray.800">
                      All Submissions ({submissionsQuery.data.submissions.length})
                    </Text>
                  </HStack>
                  <Stack spacing={4}>
                    {submissionsQuery.data.submissions.map((submission) => (
                      <Card
                        key={submission.id}
                        borderRadius="2xl"
                        boxShadow="sm"
                        border="1px solid"
                        borderColor="gray.200"
                        bg="white"
                        transition="all 0.2s"
                        _hover={{
                          boxShadow: "md",
                          borderColor: "brand.300",
                        }}
                      >
                        <CardBody p={6}>
                          <VStack align="stretch" spacing={4}>
                            <Flex justify="space-between" align="start">
                              <HStack spacing={4}>
                                <Box
                                  bg="brand.50"
                                  p={4}
                                  borderRadius="xl"
                                  border="1px solid"
                                  borderColor="brand.100"
                                >
                                  <Icon
                                    as={FiBookOpen}
                                    boxSize={6}
                                    color="brand.500"
                                  />
                                </Box>
                                <VStack align="flex-start" spacing={1}>
                                  <Text
                                    fontWeight="800"
                                    fontSize="lg"
                                    color="gray.800"
                                  >
                                    {submission.course_title}
                                  </Text>
                                  <Text fontSize="sm" color="gray.500">
                                    Session #{submission.session_id}
                                  </Text>
                                </VStack>
                              </HStack>
                              <Badge
                                colorScheme={
                                  submission.status === "completed"
                                    ? "green"
                                    : "orange"
                                }
                                px={4}
                                py={2}
                                borderRadius="lg"
                                fontWeight="700"
                              >
                                {submission.status === "completed"
                                  ? "Completed"
                                  : "In Progress"}
                              </Badge>
                            </Flex>

                            {submission.answer_details && (
                              <Box
                                p={5}
                                bg="gray.50"
                                borderRadius="xl"
                                border="1px solid"
                                borderColor="gray.200"
                              >
                                <Text
                                  fontWeight="700"
                                  fontSize="sm"
                                  color="gray.600"
                                  mb={3}
                                >
                                  Your Answers
                                </Text>
                                <VStack align="stretch" spacing={3}>
                                  {Object.values(submission.answer_details).map(
                                    (detail, idx) => (
                                      <Box
                                        key={detail.question_id}
                                        p={4}
                                        bg="white"
                                        borderRadius="lg"
                                        border="1px solid"
                                        borderColor="gray.200"
                                      >
                                        <HStack spacing={3} align="start">
                                          <Box
                                            bg="brand.500"
                                            color="white"
                                            w="24px"
                                            h="24px"
                                            borderRadius="md"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            fontSize="xs"
                                            fontWeight="700"
                                            flexShrink={0}
                                          >
                                            {idx + 1}
                                          </Box>
                                          <VStack
                                            align="flex-start"
                                            spacing={2}
                                            flex="1"
                                          >
                                            <Text
                                              fontSize="sm"
                                              color="gray.600"
                                              fontWeight="600"
                                            >
                                              {detail.question_text}
                                            </Text>
                                            <Text
                                              fontSize="md"
                                              fontWeight="700"
                                              color="brand.600"
                                            >
                                              {detail.selected_option_text}
                                            </Text>
                                          </VStack>
                                        </HStack>
                                      </Box>
                                    )
                                  )}
                                </VStack>
                              </Box>
                            )}

                            <HStack
                              spacing={2}
                              fontSize="sm"
                              color="gray.500"
                              fontWeight="600"
                            >
                              <Icon as={FiCalendar} boxSize={4} />
                              <Text>
                                {new Date(submission.created_at).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                  }
                                )}
                              </Text>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </Stack>
                </>
              ) : (
                <Card borderRadius="2xl" boxShadow="sm" bg="white">
                  <CardBody p={12}>
                    <VStack spacing={4}>
                      <Box
                        bg="gray.100"
                        w="80px"
                        h="80px"
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={FiClock} boxSize={10} color="gray.400" />
                      </Box>
                      <VStack spacing={2}>
                        <Text fontWeight="800" fontSize="xl" color="gray.700">
                          No submissions yet
                        </Text>
                        <Text color="gray.500" textAlign="center">
                          Your completed sessions will appear here
                        </Text>
                      </VStack>
                      <Button
                        colorScheme="brand"
                        size="lg"
                        borderRadius="lg"
                        onClick={() => handleNavigate("join")}
                      >
                        Join Your First Session
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </Stack>
          )}

          {currentView === "join" && (
            <Stack spacing={6} maxW="600px" mx="auto">
              {/* Info Card */}
              <Card
                borderRadius="2xl"
                bg="linear-gradient(135deg, #a8edea 0%, #d5f4f3 100%)"
                boxShadow="sm"
                border="1px solid"
                borderColor="teal.200"
              >
                <CardBody p={6}>
                  <HStack spacing={4} align="start">
                    <Box
                      bg="white"
                      p={3}
                      borderRadius="lg"
                      flexShrink={0}
                    >
                      <Icon as={FiKey} boxSize={6} color="teal.500" />
                    </Box>
                    <VStack align="flex-start" spacing={1}>
                      <Text fontSize="lg" fontWeight="800" color="teal.900">
                        Ready to join?
                      </Text>
                      <Text fontSize="sm" color="teal.700">
                        Ask your teacher for the session code or scan their QR
                        code to get started!
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>

              {/* Join Form */}
              <Card borderRadius="2xl" boxShadow="sm" bg="white">
                <CardBody p={8}>
                  <Box as="form" onSubmit={handleJoinSubmit}>
                    <Stack spacing={6}>
                      <VStack align="stretch" spacing={4}>
                        <Text fontWeight="800" fontSize="lg" color="gray.800">
                          Enter Session Code
                        </Text>
                        <Input
                          value={token}
                          onChange={(event) => setToken(event.target.value)}
                          placeholder="Type your code here..."
                          size="lg"
                          borderRadius="xl"
                          border="2px solid"
                          borderColor="gray.300"
                          bg="gray.50"
                          fontFamily="mono"
                          fontSize="xl"
                          fontWeight="700"
                          textAlign="center"
                          h="60px"
                          _hover={{ borderColor: "brand.300" }}
                          _focus={{
                            borderColor: "brand.400",
                            bg: "white",
                            boxShadow: "0 0 0 3px rgba(159, 122, 234, 0.1)",
                          }}
                        />
                      </VStack>

                      {joinError && (
                        <Alert
                          status="error"
                          borderRadius="xl"
                          bg="red.50"
                          border="1px solid"
                          borderColor="red.200"
                        >
                          <AlertIcon color="red.500" />
                          <AlertDescription
                            color="red.700"
                            fontWeight="600"
                          >
                            {joinError}
                          </AlertDescription>
                        </Alert>
                      )}

                      <Stack spacing={3}>
                        <Button
                          type="submit"
                          colorScheme="brand"
                          size="lg"
                          h="60px"
                          borderRadius="xl"
                          fontWeight="700"
                          fontSize="lg"
                          isDisabled={!token.trim()}
                          isLoading={joinMutation.isPending}
                          loadingText="Joining..."
                        >
                          Join Session
                        </Button>

                        <Box textAlign="center" py={2}>
                          <Text fontSize="sm" color="gray.500" fontWeight="600">
                            OR
                          </Text>
                        </Box>

                        <Button
                          leftIcon={<Icon as={FiCamera} />}
                          variant="outline"
                          size="lg"
                          h="60px"
                          borderRadius="xl"
                          fontWeight="700"
                          fontSize="lg"
                          borderWidth="2px"
                          borderColor="gray.300"
                          onClick={() => navigate("/scan")}
                          _hover={{
                            bg: "gray.50",
                            borderColor: "brand.300",
                          }}
                        >
                          Scan QR Code
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                </CardBody>
              </Card>
            </Stack>
          )}
        </Box>
      </Flex>
    </Flex>
  );
}