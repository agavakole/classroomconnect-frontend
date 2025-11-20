import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  IconButton,
  Stack,
  Text,
  useDisclosure,
  useBreakpointValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Icon,
  VStack,
  Badge,
} from '@chakra-ui/react'
import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom'
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import { 
  FiHome, 
  FiBookOpen, 
  FiClipboard, 
  FiGrid, 
  FiPlayCircle,
  FiLogOut,
  FiCode,
  FiUserPlus,
} from 'react-icons/fi'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { getStudentProfile } from '../../api/students'

interface NavItem {
  label: string
  to: string
  icon?: any
  badge?: string
}

export function AppLayout() {
  const { role, logout, isTeacher, isStudent, fullName } = useAuth()
  const navigate = useNavigate()
  const studentProfileQuery = useQuery({
    queryKey: ['studentProfile'],
    queryFn: getStudentProfile,
    enabled: isStudent && !fullName,
  })
  const mobileNav = useDisclosure()

  const navItems = useMemo<NavItem[]>(() => {
    if (isTeacher) {
      return [
        { label: 'Courses', to: '/teacher/courses', icon: FiBookOpen },
        { label: 'New Survey', to: '/teacher/surveys/new', icon: FiClipboard },
        { label: 'New Activity', to: '/teacher/activities/new', icon: FiGrid },
        { label: 'New Session', to: '/teacher/sessions/new', icon: FiPlayCircle},
      ]
    }
    if (isStudent) {
      return [
        { label: 'Dashboard', to: '/student', icon: FiHome },
        { label: 'Join Session', to: '/student?tab=join', icon: FiUserPlus },
        { label: 'Scan QR', to: '/scan', icon: FiCode },
      ]
    }
    // Guest navigation - simplified (login buttons are separate)
    return [
      { label: 'Home', to: '/', icon: FiHome },
      { label: 'Guest Join', to: '/guest/join', icon: FiUserPlus },
    ]
  }, [isStudent, isTeacher])

  const showLogout = Boolean(role)
  const navSpacing = useBreakpointValue({ base: 2, md: 4 })
  const studentName = studentProfileQuery.data?.full_name || 'Student'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Get home route based on role
  const homeRoute = isTeacher ? '/teacher/courses' : isStudent ? '/student' : '/'

  return (
    <Box minH="100vh" bg="surfaces.canvas">
      {/* Navigation Bar */}
      <Box
        position="sticky"
        top="0"
        zIndex="sticky"
        bg="white"
        borderBottomWidth="2px"
        borderColor="gray.100"
        backdropFilter="blur(10px)"
        boxShadow="sm"
      >
        <Container maxW="8xl" py={4}>
          <Flex align="center" justify="space-between">
            {/* Logo - Routes to appropriate home based on role */}
            <RouterLink to={homeRoute}>
              <HStack spacing={3} _hover={{ transform: 'scale(1.02)' }} transition="all 0.2s">
                <Box
                  bgGradient="linear(to-r, brand.400, brand.600)"
                  color="white"
                  p={2}
                  borderRadius="xl"
                  fontSize="xl"
                  boxShadow="md"
                >
                  
                </Box>
                <VStack align="flex-start" spacing={0}>
                  <Text fontSize="xl" fontWeight="800" color="gray.800">
                    ClassConnect
                  </Text>
                  {isTeacher && (
                    <Text fontSize="xs" color="brand.600" fontWeight="600">
                      Teacher Portal
                    </Text>
                  )}
                  {isStudent && (
                    <Text fontSize="xs" color="accent.600" fontWeight="600">
                      Student Portal
                    </Text>
                  )}
                </VStack>
              </HStack>
            </RouterLink>

            {/* Desktop Navigation */}
            <HStack spacing={navSpacing} display={{ base: 'none', md: 'flex' }}>
              {navItems.map((item) => (
                <Button
                  key={item.to}
                  as={RouterLink}
                  to={item.to}
                  leftIcon={item.icon ? <Icon as={item.icon} /> : undefined}
                  variant="ghost"
                  size="md"
                  fontWeight="600"
                  borderRadius="xl"
                  position="relative"
                  _hover={{
                    bg: isTeacher ? 'brand.50' : isStudent ? 'accent.50' : 'gray.100',
                    transform: 'translateY(-2px)',
                  }}
                  transition="all 0.2s"
                >
                  {item.label}
                  {item.badge && (
                    <Badge
                      position="absolute"
                      top="-2"
                      right="-2"
                      colorScheme="red"
                      fontSize="xs"
                      borderRadius="full"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}

              {/* User Menu (Authenticated) */}
{/* User Menu (Authenticated) */}
{showLogout && (
  <Menu placement="bottom-end" gutter={8}>
    <MenuButton
      as={Button}
      variant="unstyled"
      display="flex"
      alignItems="center"
      _hover={{ color: isTeacher ? 'brand.600' : 'accent.600' }}
      _active={{ color: isTeacher ? 'brand.600' : 'accent.600' }}
      transition="all 0.2s"
    >
      <HStack spacing={3}>
        <Text fontSize="md" fontWeight="600" color="gray.700">
          {isStudent ? studentName : 'Teacher'}
        </Text>
      </HStack>
    </MenuButton>
    <MenuList
      borderRadius="xl"
      border="2px solid"
      borderColor="gray.100"
      boxShadow="xl"
      py={2}
      w="280px"
      zIndex={1500}
      overflow="visible"
    >
      <Box px={4} py={3} w="full">
        <Text fontSize="sm" fontWeight="700" color="gray.800" noOfLines={1}>
          {isStudent ? studentName : 'Teacher Account'}
        </Text>
        <Text fontSize="xs" color="gray.500" noOfLines={1}>
          {isTeacher ? 'Teacher Portal' : 'Student Portal'}
        </Text>
      </Box>
      <MenuDivider />
      <MenuItem
        icon={<Icon as={FiLogOut} />}
        color="red.600"
        borderRadius="lg"
        mx={2}
        fontSize="sm"
        fontWeight="500"
        onClick={handleLogout}
      >
        Logout
      </MenuItem>
    </MenuList>
  </Menu>
)}

              {/* Guest Actions */}
              {!showLogout && (
                <HStack spacing={2}>
                  <Button
                    as={RouterLink}
                    to="/login/teacher"
                    variant="outline"
                    colorScheme="sunshine"
                    size="md"
                    borderRadius="xl"
                    fontWeight="600"
                  >
                    Teacher Login
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/login/student"
                    colorScheme="sunshine"
                    size="md"
                    borderRadius="xl"
                    fontWeight="600"
                  >
                    Student Login
                  </Button>
                </HStack>
              )}
            </HStack>

            {/* Mobile Menu Toggle */}
            <IconButton
              aria-label="Toggle navigation"
              icon={mobileNav.isOpen ? <CloseIcon /> : <HamburgerIcon />}
              variant="ghost"
              display={{ base: 'inline-flex', md: 'none' }}
              onClick={mobileNav.onToggle}
              borderRadius="xl"
              size="lg"
            />
          </Flex>

          {/* Mobile Navigation Menu */}
          {mobileNav.isOpen && (
            <Stack
              spacing={2}
              mt={4}
              pb={4}
              display={{ md: 'none' }}
              borderTop="1px solid"
              borderColor="gray.100"
              pt={4}
            >
              {navItems.map((item) => (
                <Button
                  key={item.to}
                  as={RouterLink}
                  to={item.to}
                  leftIcon={item.icon ? <Icon as={item.icon} /> : undefined}
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={mobileNav.onClose}
                  size="lg"
                  borderRadius="xl"
                  fontWeight="600"
                  position="relative"
                  _hover={{
                    bg: isTeacher ? 'brand.50' : isStudent ? 'accent.50' : 'gray.100',
                  }}
                >
                  {item.label}
                  {item.badge && (
                    <Badge
                      ml={2}
                      colorScheme="red"
                      fontSize="xs"
                      borderRadius="full"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}

              {/* Mobile Login Buttons for Guests */}
              {!showLogout && (
                <Stack spacing={2} mt={2}>
                  <Button
                    as={RouterLink}
                    to="/login/teacher"
                    variant="outline"
                    colorScheme="brand"
                    size="lg"
                    borderRadius="xl"
                    fontWeight="600"
                    onClick={mobileNav.onClose}
                  >
                    Teacher Login
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/login/student"
                    colorScheme="accent"
                    size="lg"
                    borderRadius="xl"
                    fontWeight="600"
                    onClick={mobileNav.onClose}
                  >
                    Student Login
                  </Button>
                </Stack>
              )}

              {isStudent && studentProfileQuery.data && (
                <Box p={3}>
                  <VStack align="flex-start" spacing={0}>
                    <Text fontSize="sm" fontWeight="700">
                      {studentName}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Student Account
                    </Text>
                  </VStack>
                </Box>
              )}

              {showLogout && (
                <Button
                  leftIcon={<Icon as={FiLogOut} />}
                  variant="outline"
                  colorScheme="red"
                  onClick={handleLogout}
                  size="lg"
                  borderRadius="xl"
                  fontWeight="600"
                >
                  Logout
                </Button>
              )}
            </Stack>
          )}
        </Container>
      </Box>

      {/* Main Content */}
      <Box as="main" py={{ base: 8, md: 12 }}>
        <Container maxW="8xl">
          <Outlet />
        </Container>
      </Box>
    </Box>
  )
}