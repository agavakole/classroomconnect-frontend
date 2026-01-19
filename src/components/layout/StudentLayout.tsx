// src/layouts/StudentLayout.tsx
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
  Avatar,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  Outlet,
  useLocation,
  Link as RouterLink,
  useNavigate,
} from "react-router-dom";
import {
  FiHome,
  FiKey,
  FiCamera,
  FiBookOpen,
  FiMenu,
  FiLogOut,
} from "react-icons/fi";
import { PiGraduationCapBold } from "react-icons/pi";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStudentProfile } from "../../api/students";

interface NavItem {
  label: string;
  to: string;
  icon: any;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    to: "/student",
    icon: FiHome,
  },
  {
    label: "Scan QR Code",
    to: "/scan",
    icon: FiCamera,
  },
];

// Desktop Sidebar Component
function DesktopSidebar() {
  const location = useLocation();
  const sidebarBg = useColorModeValue("white", "gray.800");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const profileQuery = useQuery({
    queryKey: ["studentProfile"],
    queryFn: getStudentProfile,
  });

  const studentName = profileQuery.data?.full_name || "Student";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Box
      position="fixed"
      left="0"
      top="0"
      h="100vh"
      w="230px"
      bg={sidebarBg}
      borderRightWidth="1px"
      borderColor="gray.200"
      py={6}
      px={4}
      display={{ base: "none", xl: "flex" }}
      flexDirection="column"
      overflowY="auto"
      css={{
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#CBD5E0",
          borderRadius: "24px",
        },
      }}
    >
      <VStack spacing={6} align="stretch" flex="1">
        {/* Logo */}
        <HStack spacing={3} px={2}>
          <Icon as={PiGraduationCapBold} boxSize={10} color="accent.400" />
          <Text fontSize="xl" fontWeight="900" color="gray.900">
            ClassConnect
          </Text>
        </HStack>

        {/* Navigation Section */}
        <Box>
          <Text
            fontSize="xs"
            fontWeight="700"
            color="gray.500"
            textTransform="uppercase"
            letterSpacing="wide"
            px={2}
            mb={3}
          >
            Student Portal
          </Text>
          <VStack spacing={1} align="stretch">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;

              return (
                <Button
                  key={item.to}
                  as={RouterLink}
                  to={item.to}
                  leftIcon={<Icon as={item.icon} boxSize={5} />}
                  justifyContent="flex-start"
                  variant="ghost"
                  size="sm"
                  w="full"
                  fontWeight={isActive ? "700" : "500"}
                  color="gray.700"
                  bg={isActive ? "accent.50" : "transparent"}
                  borderRadius="xl"
                  px={3}
                  _hover={{
                    bg: isActive ? "accent.100" : "gray.50",
                  }}
                  transition="all 0.2s"
                >
                  {item.label}
                </Button>
              );
            })}
          </VStack>
        </Box>
      </VStack>

      {/* User Profile at Bottom */}
      <VStack
        spacing={3}
        align="stretch"
        pt={4}
        borderTopWidth="1px"
        borderColor="gray.200"
      >
        <HStack spacing={3} px={2}>
          <Avatar size="sm" name={studentName} bg="accent.500" color="white" />
          <VStack align="flex-start" spacing={0} flex="1">
            <Text fontSize="sm" fontWeight="700" color="gray.900" noOfLines={1}>
              {studentName}
            </Text>
            <Text fontSize="xs" color="gray.500">
              Student
            </Text>
          </VStack>
        </HStack>
        <Button
          leftIcon={<Icon as={FiLogOut} />}
          variant="ghost"
          size="sm"
          justifyContent="flex-start"
          color="red.600"
          fontWeight="600"
          borderRadius="xl"
          onClick={handleLogout}
          _hover={{ bg: "red.50" }}
        >
          Logout
        </Button>
      </VStack>
    </Box>
  );
}

// Mobile Sidebar Component
function MobileSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const profileQuery = useQuery({
    queryKey: ["studentProfile"],
    queryFn: getStudentProfile,
  });

  const studentName = profileQuery.data?.full_name || "Student";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          <HStack spacing={3}>
            <Icon as={PiGraduationCapBold} boxSize={9} color="accent.400" />
            <Text fontSize="lg" fontWeight="900">
              ClassConnect
            </Text>
          </HStack>
        </DrawerHeader>
        <DrawerBody p={4} display="flex" flexDirection="column">
          <VStack spacing={5} align="stretch" flex="1">
            <Box>
              <Text
                fontSize="xs"
                fontWeight="700"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wide"
                mb={2}
              >
                Student Portal
              </Text>
              <VStack spacing={1} align="stretch">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to;

                  return (
                    <Button
                      key={item.to}
                      as={RouterLink}
                      to={item.to}
                      leftIcon={<Icon as={item.icon} boxSize={5} />}
                      justifyContent="flex-start"
                      variant="ghost"
                      size="sm"
                      w="full"
                      fontWeight={isActive ? "700" : "500"}
                      color="gray.700"
                      bg={isActive ? "accent.50" : "transparent"}
                      borderRadius="xl"
                      _hover={{
                        bg: isActive ? "accent.100" : "gray.50",
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </VStack>
            </Box>
          </VStack>

          {/* User Profile at Bottom */}
          <VStack
            spacing={3}
            align="stretch"
            pt={4}
            borderTopWidth="1px"
            borderColor="gray.200"
          >
            <HStack spacing={3}>
              <Avatar
                size="sm"
                name={studentName}
                bg="accent.500"
                color="white"
              />
              <VStack align="flex-start" spacing={0} flex="1">
                <Text
                  fontSize="sm"
                  fontWeight="700"
                  color="gray.900"
                  noOfLines={1}
                >
                  {studentName}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Student
                </Text>
              </VStack>
            </HStack>
            <Button
              leftIcon={<Icon as={FiLogOut} />}
              variant="ghost"
              size="sm"
              justifyContent="flex-start"
              color="red.600"
              fontWeight="600"
              borderRadius="xl"
              onClick={handleLogout}
              _hover={{ bg: "red.50" }}
            >
              Logout
            </Button>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export function StudentLayout() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue("#F7F8FA", "gray.900");
  const isDesktop = useBreakpointValue({ base: false, xl: true });

  useEffect(() => {
    if (isDesktop && isOpen) {
      onClose();
    }
  }, [isDesktop, isOpen, onClose]);

  return (
    <Box minH="100vh" bg={bg}>
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isOpen} onClose={onClose} />

      {/* Main Content Area - NO TOP BAR */}
      <Box ml={{ base: 0, xl: "230px" }} minH="100vh">
        {/* Mobile Menu Button - Floating */}
        <IconButton
          aria-label="Open menu"
          icon={<Icon as={FiMenu} boxSize={6} />}
          onClick={onOpen}
          position="fixed"
          top={4}
          left={4}
          zIndex="banner"
          display={{ base: "flex", xl: "none" }}
          colorScheme="accent"
          borderRadius="xl"
          boxShadow="lg"
        />

        {/* Page Content */}
        <Box p={{ base: 4, sm: 5, md: 6, lg: 8 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
