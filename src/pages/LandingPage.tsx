// src/pages/LandingPage.tsx
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  Badge,
  Flex,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  FiBookOpen,
  FiUsers,
  FiSmile,
  FiZap,
  FiHeart,
  FiTrendingUp,
  FiAward,
  FiPlayCircle,
  FiMenu,
  FiUserPlus,
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";

export function LandingPage() {
  const navigate = useNavigate();
  const { isTeacher, isStudent } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleGetStarted = () => {
    if (isTeacher) {
      navigate("/teacher/courses");
    } else if (isStudent) {
      navigate("/student");
    } else {
      navigate("/signup/teacher");
    }
  };

  const handleScrollTo = (id: string) => {
    onClose();
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);
  };

  return (
    <Box bg="#FAFAFA" minH="100vh">
      {/* Hero Section with Navbar */}
      <Box
        position="relative"
        minH={{ base: "auto", md: "95vh" }}
        overflow="hidden"
        bg="#FAFAFA"
      >
        {/* Navbar */}
        <Box
          position="sticky"
          top={0}
          bg="rgba(250, 250, 250, 0.8)"
          backdropFilter="blur(10px)"
          borderBottom="1px solid"
          borderColor="gray.200"
          zIndex={100}
        >
          <Container maxW="7xl" py={4} px={{ base: 4, md: 8 }}>
            <Flex justify="space-between" align="center">
              {/* Logo & Hamburger */}
              <HStack spacing={3}>
                <IconButton
                  aria-label="Open menu"
                  icon={<FiMenu />}
                  onClick={onOpen}
                  display={{ base: "flex", lg: "none" }}
                  size="lg"
                  variant="ghost"
                  color="gray.900"
                  fontSize="24px"
                />
                <Heading
                  size={{ base: "md", md: "lg" }}
                  fontWeight="900"
                  color="gray.900"
                >
                  ClassConnect
                </Heading>
              </HStack>

              {/* Desktop Nav Links */}
              <HStack spacing={8} display={{ base: "none", lg: "flex" }}>
                <Button
                  variant="ghost"
                  fontWeight="600"
                  color="gray.700"
                  _hover={{ color: "gray.900", bg: "gray.100" }}
                  onClick={() => handleScrollTo("why-classconnect")}
                >
                  About
                </Button>
                <Button
                  variant="ghost"
                  fontWeight="600"
                  color="gray.700"
                  _hover={{ color: "gray.900", bg: "gray.100" }}
                  onClick={() => handleScrollTo("how-it-works")}
                >
                  How It Works
                </Button>
                <Button
                  variant="ghost"
                  fontWeight="600"
                  color="gray.700"
                  _hover={{ color: "gray.900", bg: "gray.100" }}
                  onClick={() => handleScrollTo("signup-section")}
                >
                  Sign up
                </Button>
                <Button
                  leftIcon={<Icon as={FiUserPlus} />}
                  variant="outline"
                  fontWeight="600"
                  color="gray.700"
                  borderColor="gray.300"
                  borderRadius="lg"
                  _hover={{
                    color: "gray.900",
                    bg: "gray.100",
                    borderColor: "gray.400",
                  }}
                  onClick={() => navigate("/guest/join")}
                >
                  Guest Login
                </Button>
              </HStack>
            </Flex>
          </Container>
        </Box>

        {/* Mobile Drawer */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton size="lg" />
            <DrawerHeader fontSize="2xl" fontWeight="900" color="gray.900">
              ClassConnect
            </DrawerHeader>
            <DrawerBody>
              <VStack spacing={4} align="stretch" pt={4}>
                <Button
                  size="lg"
                  variant="ghost"
                  fontWeight="600"
                  color="gray.700"
                  justifyContent="flex-start"
                  onClick={() => handleScrollTo("why-classconnect")}
                >
                  About
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  fontWeight="600"
                  color="gray.700"
                  justifyContent="flex-start"
                  onClick={() => handleScrollTo("how-it-works")}
                >
                  How It Works
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  fontWeight="600"
                  color="gray.700"
                  justifyContent="flex-start"
                  onClick={() => handleScrollTo("signup-section")}
                >
                  Sign up
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  fontWeight="600"
                  color="gray.700"
                  justifyContent="flex-start"
                  leftIcon={<Icon as={FiUserPlus} />}
                  onClick={() => {
                    navigate("/guest/join");
                    onClose();
                  }}
                >
                  Guest Login
                </Button>
                <Box borderTop="2px solid" borderColor="gray.200" my={4} />
                <VStack spacing={3} pt={2}>
                  <Button
                    size="lg"
                    w="full"
                    bg="gray.900"
                    color="white"
                    fontWeight="700"
                    _hover={{ bg: "gray.800" }}
                    onClick={() => {
                      navigate("/login/teacher");
                      onClose();
                    }}
                  >
                    Teacher Log in
                  </Button>
                  <Button
                    size="lg"
                    w="full"
                    variant="outline"
                    borderWidth="2px"
                    borderColor="gray.900"
                    color="gray.900"
                    fontWeight="700"
                    _hover={{ bg: "gray.100" }}
                    onClick={() => {
                      navigate("/login/student");
                      onClose();
                    }}
                  >
                    Student Log in
                  </Button>
                </VStack>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Hero Content */}
        <Container maxW="7xl" px={{ base: 4, md: 8 }}>
          <SimpleGrid
            columns={{ base: 1, lg: 2 }}
            spacing={{ base: 12, md: 16, lg: 20 }}
            minH={{ base: "auto", lg: "85vh" }}
            alignItems="center"
            py={{ base: 12, md: 16, lg: 20 }}
          >
            {/* Left Content */}
            <VStack align="flex-start" spacing={{ base: 8, md: 10 }}>
              <VStack align="flex-start" spacing={{ base: 5, md: 6 }}>
                <Heading
                  as="h1"
                  fontSize={{ base: "4xl", sm: "5xl", md: "6xl", lg: "7xl" }}
                  fontWeight="900"
                  color="gray.900"
                  lineHeight="1.1"
                  letterSpacing="-0.02em"
                >
                  Every child can learn anything while{" "}
                  <Text as="span" color="#F4A261">
                    having fun.
                  </Text>
                </Heading>

                <Text
                  fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                  color="gray.600"
                  maxW={{ base: "full", lg: "xl" }}
                  lineHeight="1.6"
                  fontWeight="500"
                >
                  Personalized activities, happy learners. ClassConnect makes it
                  easy for teachers to engage every student
                </Text>
              </VStack>

              {/* Auth Buttons - Desktop/Tablet */}
              <HStack
                spacing={4}
                flexWrap="wrap"
                pt={2}
                display={{ base: "none", sm: "flex" }}
              >
                <Button
                  size="lg"
                  h="60px"
                  px={8}
                  fontSize="md"
                  fontWeight="700"
                  bg="gray.900"
                  color="brand.500"
                  borderRadius="xl"
                  _hover={{ bg: "gray.800", transform: "translateY(-2px)" }}
                  transition="all 0.2s"
                  onClick={() => navigate("/login/teacher")}
                >
                  Teacher Log in
                </Button>
                <Button
                  size="lg"
                  h="60px"
                  px={8}
                  fontSize="md"
                  fontWeight="700"
                  variant="outline"
                  borderWidth="2px"
                  borderColor="gray.900"
                  color="brand.500"
                  borderRadius="xl"
                  _hover={{ bg: "gray.100", transform: "translateY(-2px)" }}
                  transition="all 0.2s"
                  onClick={() => navigate("/login/student")}
                >
                  Student Log in
                </Button>
              </HStack>

              {/* Auth Buttons - Mobile */}
              <VStack
                spacing={3}
                w="full"
                display={{ base: "flex", sm: "none" }}
              >
                <Button
                  size="lg"
                  w="full"
                  h="56px"
                  bg="gray.900"
                  color="white"
                  fontWeight="700"
                  borderRadius="xl"
                  _hover={{ bg: "gray.800" }}
                  onClick={() => navigate("/login/teacher")}
                >
                  Teacher Log in
                </Button>
                <Button
                  size="lg"
                  w="full"
                  h="56px"
                  variant="outline"
                  borderWidth="2px"
                  borderColor="gray.900"
                  color="gray.900"
                  fontWeight="700"
                  borderRadius="xl"
                  _hover={{ bg: "gray.100" }}
                  onClick={() => navigate("/login/student")}
                >
                  Student Log in
                </Button>
              </VStack>

              {/* Stats */}
              <HStack spacing={{ base: 8, md: 12 }} pt={4}>
                <VStack align="flex-start" spacing={1}>
                
                  <Text color="gray.600" fontSize="sm" fontWeight="600">
                    Teachers
                  </Text>
                </VStack>
                <VStack align="flex-start" spacing={1}>
             
                  <Text color="gray.600" fontSize="sm" fontWeight="600">
                    Students
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            {/* Right Side - Floating Icons */}
            <Box
              display={{ base: "none", lg: "block" }}
              position="relative"
              h="600px"
            >
              {/* Background Glow */}
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                w="400px"
                h="400px"
                bgGradient="radial(circle, brand.100 0%, transparent 70%)"
                opacity={0.5}
                filter="blur(60px)"
                zIndex={0}
              />

              {/* Floating Icons */}
              {[
                {
                  icon: FiBookOpen,
                  color: "mint.600",
                  bg: "mint.100",
                  top: "10%",
                  left: "10%",
                  delay: "0s",
                  size: 60,
                },
                {
                  icon: FiPlayCircle,
                  color: "blue.600",
                  bg: "blue.100",
                  top: "20%",
                  right: "5%",
                  delay: "1s",
                  size: 60,
                },
                {
                  icon: FiSmile,
                  color: "brand.600",
                  bg: "brand.100",
                  bottom: "15%",
                  left: "5%",
                  delay: "2s",
                  size: 60,
                },
                {
                  icon: FiAward,
                  color: "blush.600",
                  bg: "blush.100",
                  bottom: "10%",
                  right: "10%",
                  delay: "1.5s",
                  size: 60,
                },
                {
                  icon: FiUsers,
                  color: "purple.600",
                  bg: "purple.100",
                  top: "45%",
                  left: "50%",
                  delay: "0.5s",
                  size: 90,
                  transform: "translate(-50%, -50%)",
                },
                {
                  icon: FiHeart,
                  color: "red.500",
                  bg: "red.50",
                  top: "5%",
                  left: "50%",
                  delay: "2.5s",
                  size: 70,
                  transform: "translateX(-50%)",
                },
              ].map((item, i) => (
                <Box
                  key={i}
                  position="absolute"
                  top={item.top}
                  left={item.left}
                  right={item.right}
                  bottom={item.bottom}
                  transform={item.transform}
                  animation={`float ${6 + i}s infinite ease-in-out ${
                    item.delay
                  }`}
                  cursor="pointer"
                  transition="transform 0.2s"
                  _hover={{
                    transform: `${
                      item.transform || ""
                    } scale(1.1) rotate(5deg)`,
                  }}
                  zIndex={1}
                  boxShadow="xl"
                  bg={item.bg}
                  w={`${item.size}px`}
                  h={`${item.size}px`}
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon
                    as={item.icon}
                    boxSize={item.size / 2.5}
                    color={item.color}
                  />
                </Box>
              ))}
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="why-classconnect" bg="white" py={{ base: 16, md: 24, lg: 32 }}>
        <Container maxW="7xl" px={{ base: 4, md: 8 }}>
          <VStack
            spacing={6}
            mb={{ base: 12, md: 16, lg: 20 }}
            textAlign="center"
          >
            <Badge
              fontSize="md"
              px={5}
              py={2}
              borderRadius="full"
              bg="#B8D8E8"
              color="gray.800"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              Why ClassConnect?
            </Badge>
            <Heading
              size={{ base: "xl", md: "2xl", lg: "3xl" }}
              fontWeight="900"
              maxW="4xl"
              letterSpacing="-0.01em"
            >
              Learning That Adapts to Every Child
            </Heading>
            <Text
              fontSize={{ base: "md", md: "lg", lg: "xl" }}
              color="gray.600"
              maxW="3xl"
              lineHeight="1.7"
              fontWeight="500"
            >
              Our platform uses mood detection and learning style assessments to
              provide personalized activity recommendations for students with
              diverse needs.
            </Text>
          </VStack>

          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={{ base: 6, md: 8, lg: 10 }}
          >
            {[
              {
                icon: FiHeart,
                color: "purple.500",
                bg: "purple.50",
                borderColor: "purple.200",
                title: "Mood-Based Learning",
                desc: "Students select their current mood, and our system recommends activities that match their emotional state for optimal engagement.",
              },
              {
                icon: FiZap,
                color: "blue.500",
                bg: "blue.50",
                borderColor: "blue.200",
                title: "Learning Style Profiles",
                desc: "Quick surveys identify whether students are visual, auditory, or kinesthetic learners to personalize their experience.",
              },
              {
                icon: FiTrendingUp,
                color: "orange.500",
                bg: "orange.50",
                borderColor: "orange.200",
                title: "Real-Time Insights",
                desc: "Teachers get live dashboards showing each student's mood, learning style, and recommended activities during sessions.",
              },
              {
                icon: FiUsers,
                color: "green.500",
                bg: "green.50",
                borderColor: "green.200",
                title: "QR Code Sessions",
                desc: "Launch instant classroom sessions with QR codes. Students scan and join in seconds—no complex logins required.",
              },
              {
                icon: FiBookOpen,
                color: "pink.500",
                bg: "pink.50",
                borderColor: "pink.200",
                title: "Rich Activity Library",
                desc: "500+ curated activities designed for diverse learning needs, from hands-on projects to digital exercises.",
              },
              {
                icon: FiAward,
                color: "teal.500",
                bg: "teal.50",
                borderColor: "teal.200",
                title: "AI-Powered Matching",
                desc: "Our AI automatically maps activities to learning styles and moods, making it easy for teachers to get started.",
              },
            ].map((feature, i) => (
              <Card
                key={i}
                borderRadius="2xl"
                border="2px solid"
                borderColor={feature.borderColor}
                bg="white"
                _hover={{
                  transform: "translateY(-8px)",
                  boxShadow: "2xl",
                  borderColor: feature.color,
                }}
                transition="all 0.3s"
                overflow="hidden"
              >
                <CardBody p={{ base: 6, md: 8 }}>
                  <VStack align="flex-start" spacing={5}>
                    <Box
                      bg={feature.bg}
                      p={4}
                      borderRadius="2xl"
                      border="2px solid"
                      borderColor={feature.borderColor}
                    >
                      <Icon
                        as={feature.icon}
                        boxSize={8}
                        color={feature.color}
                      />
                    </Box>
                    <VStack align="flex-start" spacing={3}>
                      <Heading size="md" fontWeight="800">
                        {feature.title}
                      </Heading>
                      <Text color="gray.600" lineHeight="tall" fontSize="md">
                        {feature.desc}
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box id="how-it-works" bg="#FAFAFA" py={{ base: 16, md: 24, lg: 32 }}>
        <Container maxW="7xl" px={{ base: 4, md: 8 }}>
          <VStack
            spacing={6}
            mb={{ base: 12, md: 16, lg: 20 }}
            textAlign="center"
          >
            <Badge
              fontSize="md"
              px={5}
              py={2}
              borderRadius="full"
              bg="#B8D8E8"
              color="gray.800"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              Simple Process
            </Badge>
            <Heading
              size={{ base: "xl", md: "2xl", lg: "3xl" }}
              fontWeight="900"
              letterSpacing="-0.01em"
            >
              How ClassConnect Works
            </Heading>
            <Text
              fontSize={{ base: "md", md: "lg", lg: "xl" }}
              color="gray.600"
              maxW="3xl"
              lineHeight="1.7"
              fontWeight="500"
            >
              Get started in minutes with our intuitive three-step process
            </Text>
          </VStack>

          <SimpleGrid
            columns={{ base: 1, md: 3 }}
            spacing={{ base: 12, md: 16 }}
          >
            {[
              {
                num: "1",
                bg: "#B8D8E8",
                title: "Create a Session",
                desc: "Teachers create a session, generate a QR code, and share it with students instantly.",
              },
              {
                num: "2",
                bg: "#F4C2D8",
                title: "Students Join & Survey",
                desc: "Students scan the code, complete a quick mood check and learning style survey.",
              },
              {
                num: "3",
                bg: "#C8BADC",
                title: "Get Recommendations",
                desc: "Our AI instantly matches students with personalized activities based on their responses.",
              },
            ].map((step, i) => (
              <VStack key={i} spacing={6}>
                <Flex
                  w={{ base: "80px", md: "90px" }}
                  h={{ base: "80px", md: "90px" }}
                  borderRadius="full"
                  bg={step.bg}
                  color="gray.900"
                  align="center"
                  justify="center"
                  fontSize={{ base: "3xl", md: "4xl" }}
                  fontWeight="900"
                  boxShadow="xl"
                >
                  {step.num}
                </Flex>
                <VStack spacing={4} maxW="sm">
                  <Heading
                    size={{ base: "md", md: "lg" }}
                    fontWeight="800"
                    textAlign="center"
                  >
                    {step.title}
                  </Heading>
                  <Text
                    color="gray.600"
                    textAlign="center"
                    lineHeight="tall"
                    fontSize={{ base: "md", md: "lg" }}
                  >
                    {step.desc}
                  </Text>
                </VStack>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        id="signup-section"
        bg="#E8DCC8"
        py={{ base: 16, md: 24, lg: 32 }}
        position="relative"
        overflow="hidden"
      >
        <Container
          maxW="6xl"
          position="relative"
          zIndex={1}
          px={{ base: 4, md: 8 }}
        >
          <VStack spacing={{ base: 8, md: 10 }} textAlign="center">
            <Heading
              size={{ base: "xl", md: "2xl", lg: "3xl" }}
              color="gray.900"
              fontWeight="900"
              maxW="4xl"
              letterSpacing="-0.01em"
              lineHeight="1.2"
            >
              Ready to Transform Your Classroom?
            </Heading>
            <Text
              fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
              color="gray.700"
              maxW="3xl"
              lineHeight="1.6"
              fontWeight="500"
            >
              Join a growing community of teachers and students creating fun,
              personalized learning experiences together.
            </Text>

            {/* Desktop/Tablet Buttons */}
            <HStack
              spacing={4}
              flexWrap="wrap"
              justify="center"
              pt={4}
              display={{ base: "none", sm: "flex" }}
            >
              <Button
                size="lg"
                h="64px"
                px={10}
                fontSize="lg"
                fontWeight="700"
                color="gray.900"
                bg="brand.400"
                borderRadius="xl"
                _hover={{
                  bg: "gray.100",
                  transform: "translateY(-2px)",
                }}
                transition="all 0.3s"
                onClick={handleGetStarted}
              >
                Join as Teacher
              </Button>
              <Button
                size="lg"
                h="64px"
                px={10}
                fontSize="lg"
                fontWeight="700"
                color="gray.900"
                bg="white"
                borderRadius="xl"
                _hover={{
                  bg: "gray.100",
                  transform: "translateY(-2px)",
                }}
                transition="all 0.3s"
                onClick={() => navigate("/signup/student")}
              >
                Join as Student
              </Button>
              <Button
                size="lg"
                h="64px"
                px={10}
                fontSize="lg"
                fontWeight="700"
                variant="outline"
                borderWidth="2px"
                borderColor="gray.900"
                color="gray.900"
                borderRadius="xl"
                _hover={{
                  bg: "gray.100",
                  transform: "translateY(-2px)",
                }}
                transition="all 0.3s"
                onClick={() => navigate("/guest/join")}
              >
                Guest Log in
              </Button>
            </HStack>

            {/* Mobile Buttons */}
            <VStack
              spacing={4}
              w="full"
              display={{ base: "flex", sm: "none" }}
              pt={4}
            >
              <Button
                size="lg"
                w="full"
                h="60px"
                fontSize="lg"
                fontWeight="700"
                color="gray.900"
                bg="brand.400"
                borderRadius="xl"
                _hover={{ bg: "gray.100" }}
                onClick={handleGetStarted}
              >
                Join as Teacher
              </Button>
              <Button
                size="lg"
                w="full"
                h="60px"
                fontSize="lg"
                fontWeight="700"
                color="gray.900"
                bg="white"
                borderRadius="xl"
                _hover={{ bg: "gray.100" }}
                onClick={() => navigate("/signup/student")}
              >
                Join as Student
              </Button>
              <Button
                size="lg"
                w="full"
                h="60px"
                fontSize="lg"
                fontWeight="700"
                variant="outline"
                borderWidth="2px"
                borderColor="gray.900"
                color="gray.900"
                borderRadius="xl"
                _hover={{ bg: "gray.100" }}
                onClick={() => navigate("/guest/join")}
              >
                Guest Log in
              </Button>
            </VStack>
          </VStack>
        </Container>
      </Box>

      {/* Floating Animation */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(3deg);
          }
        }
      `}</style>
    </Box>
  );
}
