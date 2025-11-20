// src/pages/LandingPage.tsx
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Stack,
  SimpleGrid,
  VStack,
  Icon,
  Flex,
  useColorModeValue,
  Link,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  FiUsers,
  FiHeart,
  FiPlay,
  FiBookOpen,
  FiHeadphones,
  FiPlayCircle,
  FiImage,
  FiUserPlus,
} from "react-icons/fi";
import { PiGraduationCapBold } from "react-icons/pi";

export function LandingPage() {
  const cardBg = useColorModeValue("white", "white");

  // Responsive sizes/behaviors
  // On md (iPad), no rotation; on lg+, playful rotation

  return (
    <Box bg="surfaces.canvas" minH="100vh">
      {/* Top nav stub (your actual header likely elsewhere) */}
      <Box as="header" bg="transparent">
        <Container maxW="7xl" py={4}>
          <Flex align="center" justify="space-between" />
        </Container>
      </Box>

      {/* Hero */}
      <Box position="relative" overflow="hidden" py={{ base: 12, md: 20 }}>
        {/* gradient + subtle grid */}
        <Box
          position="absolute"
          inset={0}
          bgGradient="linear(135deg, brand.50 0%, mint.50 50%, blush.50 100%)"
        />
        <Box
          position="absolute"
          inset={0}
          style={{
            backgroundImage:
              "linear-gradient(to right, transparent 0, transparent calc(100% - 1px), rgba(0,0,0,0.06) 1px), linear-gradient(to bottom, transparent 0, transparent calc(100% - 1px), rgba(0,0,0,0.06) 1px)",
            backgroundSize: "40px 40px",
          }}
          opacity={0.25}
        />


        <Container
          maxW={{ base: "full", md: "6xl", lg: "7xl" }}
          px={{ base: 4, md: 8, lg: 12 }} // tighter horizontal padding
          position="relative"
          zIndex={1}
        >
          <Stack
            direction={{ base: "column", lg: "row" }}
            spacing={{ base: 8, lg: 10 }} // reduce gap between hero and board
            align="center"
            justify="space-between"
          >
            {/* Left copy */}
            <VStack
              align={{ base: "center", lg: "flex-start" }}
              spacing={6}
              flex={1}
            >
              <Heading
                fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
                lineHeight="1.15"
                textAlign={{ base: "center", lg: "left" }}
                color="ink.700"
              >
                Kids have fun {" "}<br></br>
                <Text as="span" color="blush.600">
                you see learning progress.
                </Text>
              </Heading>

              <Text
                fontSize={{ base: "lg", md: "xl" }}
                color="ink.600"
                textAlign={{ base: "center", lg: "left" }}
                maxW="600px"
              >
                Children experience fun while you observe tangible learning
                outcomes.
              </Text>

              {/* CTAs (soft radius) */}
              <Stack
                direction={{ base: "column", sm: "row" }}
                spacing={3}
                w={{ base: "full", sm: "auto" }}
                flexWrap="wrap"
              >
                <Button
                  as={RouterLink}
                  to="/login/teacher"
                  size="lg"
                  px={6}
                  borderRadius="xl"
                  colorScheme="brand"
                  fontWeight="bold"
                  leftIcon={<Icon as={FiUsers} />}
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                >
                  Teacher Login
                </Button>
                <Button
                  as={RouterLink}
                  to="/login/student"
                  size="lg"
                  px={6}
                  borderRadius="xl"
                  colorScheme="blue"
                  fontWeight="bold"
                  leftIcon={<Icon as={FiPlay} />}
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                >
                  Student Login
                </Button>
                <Button
                  as={RouterLink}
                  to="/guest/join"
                  size="lg"
                  px={6}
                  variant="outline"
                  leftIcon={<Icon as={FiUserPlus} />}
                  colorScheme="gray"
                  borderRadius="xl"
                  fontWeight="bold"
                  borderWidth="2px"
                  _hover={{ transform: 'translateY(-2px)', bg: 'gray.50' }}
                >
                  Guest Join
                </Button>
              </Stack>
            </VStack>

            {/* Right visual board - Floating Icon Cloud */}
            <Box flex={1} display={{ base: "none", md: "block" }} position="relative" h="400px">
               {/* Abstract Background Blob */}
               <Box
                 position="absolute"
                 top="50%"
                 left="50%"
                 transform="translate(-50%, -50%)"
                 w="350px"
                 h="350px"
                 bgGradient="radial(circle, brand.100 0%, transparent 70%)"
                 opacity={0.6}
                 filter="blur(40px)"
                 zIndex={0}
               />
               
               {/* Floating Icons */}
               {[
                 { icon: FiBookOpen, color: "mint.600", bg: "mint.100", top: "15%", left: "15%", delay: "0s", size: "5xl", p: 6 },
                 { icon: FiPlayCircle, color: "blue.600", bg: "blue.100", top: "25%", right: "10%", delay: "1s", size: "5xl", p: 6 },
                 { icon: FiHeadphones, color: "brand.600", bg: "brand.100", bottom: "10%", left: "10%", delay: "2s", size: "5xl", p: 6 },
                 { icon: FiImage, color: "blush.600", bg: "blush.100", bottom: "12%", right: "8%", delay: "1.5s", size: "5xl", p: 6 },
                 { icon: FiUsers, color: "purple.600", bg: "purple.100", top: "40%", left: "40%", delay: "0.5s", size: "8xl", p: 10 },
                 { icon: FiHeart, color: "red.500", bg: "red.50", top: "5%", right: "40%", delay: "2.5s", size: "6xl", p: 8 },
               ].map((item, i) => (
                 <Box
                   key={i}
                   position="absolute"
                   top={item.top}
                   left={item.left}
                   right={item.right}
                   bottom={item.bottom}
                   animation={`float ${6 + i}s infinite ease-in-out ${item.delay}`}
                   cursor="pointer"
                   transition="transform 0.2s"
                   _hover={{ transform: "scale(1.1) rotate(5deg)" }}
                   zIndex={1}
                   boxShadow="xl"
                   bg={item.bg}
                   p={item.p || 4}
                   borderRadius="full"
                   display="flex"
                   alignItems="center"
                   justifyContent="center"
                 >
                   <Icon as={item.icon} boxSize={item.size ? undefined : 8} fontSize={item.size} color={item.color} />
                 </Box>
               ))}
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Audience cards */}
      <Container maxW="7xl" py={{ base: 12, md: 20 }}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 8, md: 12 }}>
          {/* Teachers */}
          <Box
            bg={cardBg}
            borderRadius="xl"
            p={{ base: 6, md: 8 }}
            boxShadow="xl"
            border="1px solid"
            borderColor="blackAlpha.100"
            _hover={{ transform: "translateY(-4px)", boxShadow: "2xl" }}
            transition="all .2s"
          >
            <VStack align="flex-start" spacing={5}>
              <Box bg="mint.50" p={3} borderRadius="lg" display="inline-block">
                <Icon as={FiBookOpen} boxSize={8} color="mint.700" />
              </Box>
              <Heading size="lg" color="ink.700">
                Teachers
              </Heading>
              <Text color="ink.600" fontSize={{ base: "md", md: "lg" }}>
                Plan sessions, configure baseline surveys, and keep
                recommendations aligned with student moods and learning styles.
              </Text>
              <Stack
                direction={{ base: "column", sm: "row" }}
                spacing={3}
                w="full"
                pt={2}
              >
                <Button
                  as={RouterLink}
                  to="/login/teacher"
                  borderRadius="lg"
                  colorScheme="brand"
                  
                >
                  Login
                </Button>
                <Button
                  as={RouterLink}
                  to="/signup/teacher"
                  variant="outline"
                  colorScheme="brand"
                  borderRadius="lg"
                  color="ink.700"
                >
                  Sign up
                </Button>
              </Stack>
            </VStack>
          </Box>

          {/* Students & Guests */}
          <Box
            bg={cardBg}
            borderRadius="xl"
            p={{ base: 6, md: 8 }}
            boxShadow="xl"
            border="1px solid"
            borderColor="blackAlpha.100"
            _hover={{ transform: "translateY(-4px)", boxShadow: "2xl" }}
            transition="all .2s"
          >
            <VStack align="flex-start" spacing={5}>
              <Box bg="mint.50" p={3} borderRadius="lg" display="inline-block">
                <Icon as={FiBookOpen} boxSize={8} color="mint.700" />
              </Box>
              <Heading size="lg" color="ink.700">
                Students & Guests
              </Heading>
              <Text color="ink.600" fontSize={{ base: "md", md: "lg" }}>
                Join from any device, review past submissions, or scan a QR to
                participate—no account required.
              </Text>
              <Stack
                direction={{ base: "column", sm: "row" }}
                spacing={3}
                w="full"
                pt={2}
              >
                <Button
                  as={RouterLink}
                  to="/login/student"
                  colorScheme="brand"
                  borderRadius="lg"
                  color="ink.900"
                >
                  Student Login
                </Button>
                <Button
                  as={RouterLink}
                  to="/signup/student"
                  variant="outline"
                  colorScheme="brand"
                  borderRadius="lg"
                  color="ink.900"
                >
                  Student Signup
                </Button>
              </Stack>
              <Button
                as={RouterLink}
                to="/guest/join"
                variant="ghost"
                colorScheme="mint"
                leftIcon={<Icon as={FiUsers} />}
                borderRadius="lg"
                color="mint.900"
              >
                Join as Guest
              </Button>
            </VStack>
          </Box>
        </SimpleGrid>

        {/* Bottom tagline */}

      </Container>

      {/* animations */}
      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0) }
          50% { transform: translateY(-12px) }
        }
      `}</style>
    </Box>
  );
}
