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
  Image,
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
    onClose(); // Close menu first
    // Wait for drawer animation to complete before scrolling
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300); // Match drawer closing animation duration
  };

  return (
    <Box bg="#FAFAFA">
      {/* Hero Section with Integrated Navbar */}
      <Box position="relative" minH="90vh" overflow="hidden" bg="#FAFAFA">
        {/* Navbar - Integrated into Hero */}
        <Container
          maxW="7xl"
          pt={{ base: 4, md: 6 }}
          pb={4}
          px={{ base: 6, md: 8 }}
        >
          <Flex justify="space-between" align="center">
            {/* Left Side: Hamburger + Logo */}
            <HStack spacing={3}>
              {/* Hamburger Menu Button - Shows on mobile/tablet, hides on desktop */}
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

              {/* Logo */}
              <Heading
                size={{ base: "md", md: "lg" }}
                fontWeight="900"
                color="gray.900"
              >
                ClassConnect
              </Heading>
            </HStack>

            {/* Right Side: Navigation Links - Hidden on mobile and tablets, shown on desktop */}
            <HStack spacing={8} display={{ base: "none", lg: "flex" }}>
              <Button
                variant="ghost"
                fontWeight="600"
                color="gray.700"
                onClick={() => handleScrollTo("why-classconnect")}
              >
                About
              </Button>
              <Button
                variant="ghost"
                fontWeight="600"
                color="gray.700"
                onClick={() => handleScrollTo("how-it-works")}
              >
                How It Works
              </Button>
              <Button
                variant="ghost"
                fontWeight="600"
                color="gray.700"
                onClick={() => handleScrollTo("signup-section")}
              >
                Sign up
              </Button>
            </HStack>
          </Flex>
        </Container>

        {/* Mobile Navigation Drawer */}
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
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Hero Content */}
        <Container
          maxW="7xl"
          position="relative"
          zIndex={1}
          px={{ base: 6, md: 8 }}
        >
          <SimpleGrid
            columns={{ base: 1, lg: 2 }}
            spacing={{ base: 8, md: 12 }}
            minH={{ base: "auto", lg: "80vh" }}
            alignItems="center"
            py={{ base: 8, md: 12 }}
          >
            {/* Left Content */}
            <VStack align="flex-start" spacing={{ base: 6, md: 8 }}>
              <VStack align="flex-start" spacing={{ base: 4, md: 6 }}>
                <Heading
                  as="h1"
                  fontSize={{ base: "3xl", sm: "4xl", md: "5xl", lg: "6xl" }}
                  fontWeight="900"
                  color="gray.900"
                  lineHeight="1.2"
                >
                  Every child can
                  <br />
                  <Text as="span" color="gray.900">
                    learn anything while
                    <Text as="span" color="brand.500">
                      {" "}
                      having fun.
                    </Text>
                  </Text>
                </Heading>

                <Text
                  fontSize={{ base: "md", sm: "lg", md: "xl" }}
                  color="gray.600"
                  maxW={{ base: "full", md: "xl" }}
                  lineHeight="1.7"
                >
                  Fun, adaptive activities that follow each child&apos;s mood
                  and learning style — helping every learner, especially those
                  who need a little extra support, feel confident, calm, and
                  excited to grow.
                </Text>
              </VStack>
              {/* ✅ Hero Auth Buttons - Hidden on mobile when drawer is available */}
              <HStack
                spacing={{ base: 3, md: 4 }}
                flexWrap="wrap"
                pt={{ base: 2, md: 2 }}
                display={{ base: "none", sm: "flex" }}
              >
                <Button
                  size={{ base: "md", md: "lg" }}
                  px={{ base: 6, md: 8 }}
                  fontSize={{ base: "sm", md: "md" }}
                  fontWeight="700"
                  bg="gray.900"
                  color="white"
                  _hover={{ bg: "gray.800", transform: "translateY(-1px)" }}
                  onClick={() => navigate("/login/teacher")}
                >
                  Teacher Log in
                </Button>

                <Button
                  size={{ base: "md", md: "lg" }}
                  px={{ base: 6, md: 8 }}
                  fontSize={{ base: "sm", md: "md" }}
                  fontWeight="700"
                  variant="outline"
                  borderWidth="2px"
                  borderColor="gray.900"
                  color="gray.900"
                  _hover={{ bg: "gray.100", transform: "translateY(-1px)" }}
                  onClick={() => navigate("/login/student")}
                >
                  Student Log in
                </Button>
              </HStack>

              {/* Mobile-Only Auth Buttons Below Text */}
              <VStack
                spacing={3}
                w="full"
                display={{ base: "flex", sm: "none" }}
              >
                <Button
                  size="lg"
                  w="full"
                  bg="gray.900"
                  color="white"
                  fontWeight="700"
                  _hover={{ bg: "gray.800" }}
                  onClick={() => navigate("/login/teacher")}
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
                  onClick={() => navigate("/login/student")}
                >
                  Student Log in
                </Button>
              </VStack>

              {/* Stats */}
              <HStack spacing={{ base: 6, md: 8 }} pt={{ base: 2, md: 4 }}>
                <VStack align="flex-start" spacing={0}>
                  <Heading
                    size={{ base: "lg", md: "xl" }}
                    color="#B8D8E8"
                    fontWeight="900"
                  >
                    100+
                  </Heading>
                  <Text color="gray.600" fontSize="sm" fontWeight="600">
                    Teachers
                  </Text>
                </VStack>
                <VStack align="flex-start" spacing={0}>
                  <Heading
                    size={{ base: "lg", md: "xl" }}
                    color="#B8D8E8"
                    fontWeight="900"
                  >
                    1K+
                  </Heading>
                  <Text color="gray.600" fontSize="sm" fontWeight="600">
                    Students
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            {/* Right Side - Hero Image - Responsive for all screen sizes */}
            <Box
              position="relative"
              display="block"
              mt={{ base: 8, lg: 0 }}
            >
              <Box 
                position="relative" 
                h={{ base: "350px", sm: "400px", md: "450px", lg: "600px" }}
                mx={{ base: "auto", lg: 0 }}
                maxW={{ base: "350px", sm: "400px", md: "full" }}
              >
                {/* Large pink circle - smaller on mobile */}
                <Box
                  position="absolute"
                  top={{ base: "5%", md: "10%" }}
                  right={{ base: "50%", md: "0" }}
                  transform={{ base: "translateX(50%)", md: "none" }}
                  w={{ base: "250px", sm: "280px", md: "300px", lg: "450px" }}
                  h={{ base: "250px", sm: "280px", md: "300px", lg: "450px" }}
                  borderRadius="full"
                  bg="rgba(244, 194, 216, 0.2)"
                  zIndex={1}
                />

                {/* Blue circle - hidden on small mobile, show on larger screens */}
                <Box
                  position="absolute"
                  bottom={{ base: "5%", lg: "10%" }}
                  left={{ base: "50%", lg: "10%" }}
                  transform={{ base: "translateX(-50%)", lg: "none" }}
                  w={{ base: "120px", sm: "150px", lg: "200px" }}
                  h={{ base: "120px", sm: "150px", lg: "200px" }}
                  borderRadius="full"
                  bg="rgba(184, 216, 232, 0.4)"
                  zIndex={2}
                  display={{ base: "none", sm: "block" }}
                />

                {/* Yellow small circle - positioning adjusted for mobile */}
                <Box
                  position="absolute"
                  top={{ base: "10%", lg: "20%" }}
                  left={{ base: "5%", sm: "10%", lg: "5%" }}
                  w={{ base: "50px", sm: "60px", lg: "80px" }}
                  h={{ base: "50px", sm: "60px", lg: "80px" }}
                  borderRadius="full"
                  bg="rgba(232, 220, 200, 0.6)"
                  zIndex={2}
                />

                {/* Hero image - centered and proportional on mobile */}
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  zIndex={2}
                  w={{ base: "240px", sm: "280px", md: "340px", lg: "400px", xl: "450px" }}
                  h={{ base: "240px", sm: "280px", md: "340px", lg: "400px", xl: "450px" }}
                  borderRadius="full"
                  overflow="hidden"
                  boxShadow="xl"
                >
                  <Image
                    src="/images/kids.jpg"
                    alt="Kids learning together in ClassConnect"
                    w="full"
                    h="full"
                    objectFit="cover"
                    objectPosition="center"
                    style={{
                      imageRendering: "crisp-edges",
                      WebkitFontSmoothing: "antialiased",
                    }}
                  />
                </Box>

                {/* Optional yellow accent circle - hidden on mobile */}
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%) translate(190px, -190px)"
                  w={{ base: "40px", lg: "60px" }}
                  h={{ base: "40px", lg: "60px" }}
                  bg="rgba(232, 220, 200, 0.2)"
                  borderRadius="full"
                  zIndex={3}
                  display={{ base: "none", md: "block" }}
                />

                {/* Badge - repositioned for mobile */}
                <Box
                  position="absolute"
                  bottom={{ base: "0%", sm: "5%", lg: "8%" }}
                  right={{ base: "50%", sm: "5%", lg: "10%" }}
                  transform={{ base: "translateX(50%)", sm: "none" }}
                  bg="#dcd3e9ff"
                  backdropFilter="blur(10px)"
                  borderRadius="2xl"
                  p={{ base: 3, sm: 4, lg: 6 }}
                  boxShadow="2xl"
                  zIndex={3}
                >
                  <VStack spacing={1}>
                    <Icon
                      as={FiBookOpen}
                      boxSize={{ base: 5, sm: 6, lg: 8 }}
                      color="gray.800"
                    />
                    <Heading
                      size={{ base: "sm", sm: "md", lg: "lg" }}
                      color="gray.900"
                      fontWeight="900"
                    >
                      500+
                    </Heading>
                    <Text
                      color="gray.700"
                      fontSize={{ base: "2xs", sm: "xs", lg: "sm" }}
                      fontWeight="600"
                    >
                      Activities
                    </Text>
                  </VStack>
                </Box>
              </Box>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section (Why ClassConnect) */}
      <Box id="why-classconnect" bg="white" py={{ base: 12, md: 20 }}>
        <Container maxW="7xl" px={{ base: 6, md: 8 }}>
          <VStack spacing={4} mb={{ base: 10, md: 16 }} textAlign="center">
            <Badge
              fontSize="md"
              px={4}
              py={2}
              borderRadius="full"
              bg="#B8D8E8"
              color="gray.800"
              fontWeight="700"
            >
              Why ClassConnect?
            </Badge>
            <Heading size={{ base: "xl", md: "2xl" }} fontWeight="900">
              Learning That Adapts to Every Child
            </Heading>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="gray.600"
              maxW="2xl"
              px={{ base: 4, md: 0 }}
            >
              Our platform uses mood detection and learning style assessments to
              provide personalized activity recommendations for students with
              diverse needs.
            </Text>
          </VStack>

          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={{ base: 6, md: 8 }}
          >
            {/* Feature 1 */}
            <Card
              borderRadius="2xl"
              border="2px solid"
              borderColor="purple.100"
              _hover={{
                transform: "translateY(-8px)",
                boxShadow: "2xl",
                borderColor: "purple.300",
              }}
              transition="all 0.3s"
            >
              <CardBody p={{ base: 6, md: 8 }}>
                <VStack align="flex-start" spacing={4}>
                  <Box
                    bg="purple.50"
                    p={4}
                    borderRadius="2xl"
                    border="2px solid"
                    borderColor="purple.100"
                  >
                    <Icon as={FiHeart} boxSize={8} color="purple.500" />
                  </Box>
                  <Heading size="md" fontWeight="800">
                    Mood-Based Learning
                  </Heading>
                  <Text color="gray.600" lineHeight="tall">
                    Students select their current mood, and our system
                    recommends activities that match their emotional state for
                    optimal engagement.
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            {/* Feature 2 */}
            <Card
              borderRadius="2xl"
              border="2px solid"
              borderColor="blue.100"
              _hover={{
                transform: "translateY(-8px)",
                boxShadow: "2xl",
                borderColor: "blue.300",
              }}
              transition="all 0.3s"
            >
              <CardBody p={{ base: 6, md: 8 }}>
                <VStack align="flex-start" spacing={4}>
                  <Box
                    bg="blue.50"
                    p={4}
                    borderRadius="2xl"
                    border="2px solid"
                    borderColor="blue.100"
                  >
                    <Icon as={FiZap} boxSize={8} color="blue.500" />
                  </Box>
                  <Heading size="md" fontWeight="800">
                    Learning Style Profiles
                  </Heading>
                  <Text color="gray.600" lineHeight="tall">
                    Quick surveys identify whether students are visual,
                    auditory, or kinesthetic learners to personalize their
                    experience.
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            {/* Feature 3 */}
            <Card
              borderRadius="2xl"
              border="2px solid"
              borderColor="orange.100"
              _hover={{
                transform: "translateY(-8px)",
                boxShadow: "2xl",
                borderColor: "orange.300",
              }}
              transition="all 0.3s"
            >
              <CardBody p={{ base: 6, md: 8 }}>
                <VStack align="flex-start" spacing={4}>
                  <Box
                    bg="orange.50"
                    p={4}
                    borderRadius="2xl"
                    border="2px solid"
                    borderColor="orange.100"
                  >
                    <Icon as={FiTrendingUp} boxSize={8} color="orange.500" />
                  </Box>
                  <Heading size="md" fontWeight="800">
                    Real-Time Insights
                  </Heading>
                  <Text color="gray.600" lineHeight="tall">
                    Teachers get live dashboards showing each student's mood,
                    learning style, and recommended activities during sessions.
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            {/* Feature 4 */}
            <Card
              borderRadius="2xl"
              border="2px solid"
              borderColor="green.100"
              _hover={{
                transform: "translateY(-8px)",
                boxShadow: "2xl",
                borderColor: "green.300",
              }}
              transition="all 0.3s"
            >
              <CardBody p={{ base: 6, md: 8 }}>
                <VStack align="flex-start" spacing={4}>
                  <Box
                    bg="green.50"
                    p={4}
                    borderRadius="2xl"
                    border="2px solid"
                    borderColor="green.100"
                  >
                    <Icon as={FiUsers} boxSize={8} color="green.500" />
                  </Box>
                  <Heading size="md" fontWeight="800">
                    QR Code Sessions
                  </Heading>
                  <Text color="gray.600" lineHeight="tall">
                    Launch instant classroom sessions with QR codes. Students
                    scan and join in seconds—no complex logins required.
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            {/* Feature 5 */}
            <Card
              borderRadius="2xl"
              border="2px solid"
              borderColor="pink.100"
              _hover={{
                transform: "translateY(-8px)",
                boxShadow:"2xl",
                borderColor: "pink.300",
              }}
              transition="all 0.3s"
            >
              <CardBody p={{ base: 6, md: 8 }}>
                <VStack align="flex-start" spacing={4}>
                  <Box
                    bg="pink.50"
                    p={4}
                    borderRadius="2xl"
                    border="2px solid"
                    borderColor="pink.100"
                  >
                    <Icon as={FiBookOpen} boxSize={8} color="pink.500" />
                  </Box>
                  <Heading size="md" fontWeight="800">
                    Rich Activity Library
                  </Heading>
                  <Text color="gray.600" lineHeight="tall">
                    500+ curated activities designed for diverse learning needs,
                    from hands-on projects to digital exercises.
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            {/* Feature 6 */}
            <Card
              borderRadius="2xl"
              border="2px solid"
              borderColor="teal.100"
              _hover={{
                transform: "translateY(-8px)",
                boxShadow: "2xl",
                borderColor: "teal.300",
              }}
              transition="all 0.3s"
            >
              <CardBody p={{ base: 6, md: 8 }}>
                <VStack align="flex-start" spacing={4}>
                  <Box
                    bg="teal.50"
                    p={4}
                    borderRadius="2xl"
                    border="2px solid"
                    borderColor="teal.100"
                  >
                    <Icon as={FiAward} boxSize={8} color="teal.500" />
                  </Box>
                  <Heading size="md" fontWeight="800">
                    AI-Powered Matching
                  </Heading>
                  <Text color="gray.600" lineHeight="tall">
                    Our AI automatically maps activities to learning styles and
                    moods, making it easy for teachers to get started.
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box id="how-it-works" bg="#FAFAFA" py={{ base: 12, md: 20 }}>
        <Container maxW="7xl" px={{ base: 6, md: 8 }}>
          <VStack spacing={4} mb={{ base: 10, md: 16 }} textAlign="center">
            <Badge
              fontSize="md"
              px={4}
              py={2}
              borderRadius="full"
              bg="#B8D8E8"
              color="gray.800"
              fontWeight="700"
            >
              Simple Process
            </Badge>
            <Heading size={{ base: "xl", md: "2xl" }} fontWeight="900">
              How ClassConnect Works
            </Heading>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="gray.600"
              maxW="2xl"
              px={{ base: 4, md: 0 }}
            >
              Get started in minutes with our intuitive three-step process
            </Text>
          </VStack>

          <SimpleGrid
            columns={{ base: 1, md: 3 }}
            spacing={{ base: 10, md: 12 }}
          >
            {/* Step 1 */}
            <VStack spacing={6}>
              <Flex
                w={{ base: "70px", md: "80px" }}
                h={{ base: "70px", md: "80px" }}
                borderRadius="full"
                bg="#B8D8E8"
                color="gray.900"
                align="center"
                justify="center"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="900"
                boxShadow="xl"
              >
                1
              </Flex>
              <VStack spacing={3}>
                <Heading
                  size={{ base: "md", md: "lg" }}
                  fontWeight="800"
                  textAlign="center"
                >
                  Create a Session
                </Heading>
                <Text color="gray.600" textAlign="center" lineHeight="tall">
                  Teachers create a session, generate a QR code, and share it
                  with students instantly.
                </Text>
              </VStack>
            </VStack>

            {/* Step 2 */}
            <VStack spacing={6}>
              <Flex
                w={{ base: "70px", md: "80px" }}
                h={{ base: "70px", md: "80px" }}
                borderRadius="full"
                bg="#F4C2D8"
                color="gray.900"
                align="center"
                justify="center"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="900"
                boxShadow="xl"
              >
                2
              </Flex>
              <VStack spacing={3}>
                <Heading
                  size={{ base: "md", md: "lg" }}
                  fontWeight="800"
                  textAlign="center"
                >
                  Students Join &amp; Survey
                </Heading>
                <Text color="gray.600" textAlign="center" lineHeight="tall">
                  Students scan the code, complete a quick mood check and
                  learning style survey.
                </Text>
              </VStack>
            </VStack>

            {/* Step 3 */}
            <VStack spacing={6}>
              <Flex
                w={{ base: "70px", md: "80px" }}
                h={{ base: "70px", md: "80px" }}
                borderRadius="full"
                bg="#C8BADC"
                color="gray.900"
                align="center"
                justify="center"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="900"
                boxShadow="xl"
              >
                3
              </Flex>
              <VStack spacing={3}>
                <Heading
                  size={{ base: "md", md: "lg" }}
                  fontWeight="800"
                  textAlign="center"
                >
                  Get Recommendations
                </Heading>
                <Text color="gray.600" textAlign="center" lineHeight="tall">
                  Our AI instantly matches students with personalized activities
                  based on their responses.
                </Text>
              </VStack>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        id="signup-section"
        bg="#E8DCC8"
        py={{ base: 12, md: 20 }}
        position="relative"
        overflow="hidden"
      >
        <Container
          maxW="5xl"
          position="relative"
          zIndex={1}
          px={{ base: 6, md: 8 }}
        >
          <VStack spacing={{ base: 6, md: 8 }} textAlign="center">
            <Heading
              size={{ base: "xl", md: "2xl" }}
              color="gray.900"
              fontWeight="900"
              maxW="3xl"
              fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
            >
              Ready to Transform Your Classroom?
            </Heading>
            <Text
              fontSize={{ base: "md", md: "xl" }}
              color="gray.700"
              maxW="2xl"
              px={{ base: 4, md: 0 }}
            >
              Join a growing community of teachers and students creating fun,
              personalized learning experiences together.
            </Text>

            <VStack
              spacing={{ base: 3, md: 4 }}
              w={{ base: "full", sm: "auto" }}
              pt={{ base: 2, md: 0 }}
            >
              <HStack
                spacing={{ base: 3, md: 4 }}
                flexWrap="wrap"
                justify="center"
                display={{ base: "none", sm: "flex" }}
              >
                <Button
                  size={{ base: "md", md: "lg" }}
                  h={{ base: "50px", md: "60px" }}
                  px={{ base: 6, md: 10 }}
                  fontSize={{ base: "md", md: "lg" }}
                  fontWeight="700"
                  color="gray.900"
                  bg="brand.400"
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
                  size={{ base: "md", md: "lg" }}
                  h={{ base: "50px", md: "60px" }}
                  px={{ base: 6, md: 10 }}
                  fontSize={{ base: "md", md: "lg" }}
                  fontWeight="700"
                  color="gray.900"
                  bg="white"
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
                  size={{ base: "md", md: "lg" }}
                  h={{ base: "50px", md: "60px" }}
                  px={{ base: 6, md: 10 }}
                  fontSize={{ base: "md", md: "lg" }}
                  fontWeight="700"
                  variant="outline"
                  borderWidth="2px"
                  borderColor="gray.900"
                  color="gray.900"
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

              {/* Mobile Stacked Buttons */}
              <VStack
                spacing={3}
                w="full"
                display={{ base: "flex", sm: "none" }}
              >
                <Button
                  size="lg"
                  w="full"
                  h="60px"
                  fontSize="lg"
                  fontWeight="700"
                  color="gray.900"
                  bg="brand.400"
                  _hover={{
                    bg: "gray.100",
                  }}
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
                  _hover={{
                    bg: "gray.100",
                  }}
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
                  _hover={{
                    bg: "gray.100",
                  }}
                  onClick={() => navigate("/guest/join")}
                >
                  Guest Log in
                </Button>
              </VStack>
            </VStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}