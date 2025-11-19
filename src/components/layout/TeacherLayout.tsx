// src/layouts/TeacherLayout.tsx
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useBreakpointValue,
  Badge,
} from '@chakra-ui/react'
import {
  NavLink,
  Outlet,
  useLocation,
  Link as RouterLink,
  useNavigate,
} from 'react-router-dom'
import {
  FiBook,
  FiClipboard,
  FiPlayCircle,
  FiGrid,
  FiMenu,
  FiLogOut,
  FiBell,
  FiLayers,
  FiPlus,
} from 'react-icons/fi'
import { PiGraduationCapBold } from 'react-icons/pi'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect } from 'react'
import { CourseSearch } from '../../components/CourseSearch'

interface NavItem {
  label: string
  to: string
  icon: any
  section?: string
  excludePrefixes?: string[]
}

const navItems: NavItem[] = [
  { label: 'Courses', to: '/teacher/courses', icon: FiBook, section: 'courses' },
  { 
    label: 'Survey templates', 
    to: '/teacher/surveys', 
    icon: FiClipboard, 
    section: 'surveys',
    excludePrefixes: ['/teacher/surveys/new']
  },
  { label: 'Create survey', to: '/teacher/surveys/new', icon: FiPlus, section: 'surveys' },
  { 
    label: 'Session library', 
    to: '/teacher/sessions', 
    icon: FiPlayCircle, 
    section: 'sessions',
    excludePrefixes: ['/teacher/sessions/new']
  },
  { label: 'Launch session', to: '/teacher/sessions/new', icon: FiPlus, section: 'sessions' },
  { 
    label: 'Activity library', 
    to: '/teacher/activities', 
    icon: FiGrid, 
    section: 'activities',
    excludePrefixes: ['/teacher/activities/new']
  },
  { label: 'Create activity', to: '/teacher/activities/new', icon: FiPlus, section: 'activities' },
  { 
    label: 'Activity types', 
    to: '/teacher/activity-types', 
    icon: FiLayers, 
    section: 'activities'
  },
]

// Desktop Sidebar Component
function DesktopSidebar() {
  const location = useLocation()
  const sidebarBg = useColorModeValue('white', 'gray.800')

  // Group navigation items by section
  const sections = {
    courses: navItems.filter(item => item.section === 'courses'),
    surveys: navItems.filter(item => item.section === 'surveys'),
    sessions: navItems.filter(item => item.section === 'sessions'),
    activities: navItems.filter(item => item.section === 'activities'),
  }

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
      display={{ base: 'none', xl: 'block' }}
      overflowY="auto"
      css={{
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#CBD5E0',
          borderRadius: '24px',
        },
      }}
    >
      <VStack spacing={6} align="stretch" h="full">
        {/* Logo */}
        <HStack spacing={3} px={2}>
          <Icon 
            as={PiGraduationCapBold} 
            boxSize={10} 
            color="brand.400"
          />
          <Text fontSize="xl" fontWeight="900" color="gray.900">
            ClassConnect
          </Text>
        </HStack>

        {/* Courses Section */}
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
            Courses
          </Text>
          <VStack spacing={1} align="stretch">
            {sections.courses.map((item) => {
              const excludes = item.excludePrefixes ?? []
              const isExcluded = excludes.some((prefix) =>
                location.pathname.startsWith(prefix)
              )
              const isBaseMatch =
                location.pathname === item.to ||
                location.pathname.startsWith(`${item.to}/`)
              const isActive = !isExcluded && isBaseMatch

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
                  fontWeight={isActive ? '700' : '500'}
                  color={isActive ? 'gray.700' : 'gray.700'}
                  bg={isActive ? 'brand.50' : 'transparent'}
                  borderRadius="xl"
                  px={3}
                  _hover={{
                    bg: isActive ? 'brand.100' : 'gray.50',
                  }}
                  transition="all 0.2s"
                >
                  {item.label}
                </Button>
              )
            })}
          </VStack>
        </Box>

        {/* Surveys Section */}
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
            Surveys
          </Text>
          <VStack spacing={1} align="stretch">
            {sections.surveys.map((item) => {
              const excludes = item.excludePrefixes ?? []
              const isExcluded = excludes.some((prefix) =>
                location.pathname.startsWith(prefix)
              )
              const isBaseMatch =
                location.pathname === item.to ||
                location.pathname.startsWith(`${item.to}/`)
              const isActive = !isExcluded && isBaseMatch

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
                  fontWeight={isActive ? '700' : '500'}
                  color={isActive ? 'gray.700' : 'gray.700'}
                  bg={isActive ? 'brand.50' : 'transparent'}
                  borderRadius="xl"
                  px={3}
                  _hover={{
                    bg: isActive ? 'brand.100' : 'gray.50',
                  }}
                  transition="all 0.2s"
                >
                  {item.label}
                </Button>
              )
            })}
          </VStack>
        </Box>

        {/* Sessions Section */}
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
            Sessions
          </Text>
          <VStack spacing={1} align="stretch">
            {sections.sessions.map((item) => {
              const excludes = item.excludePrefixes ?? []
              const isExcluded = excludes.some((prefix) =>
                location.pathname.startsWith(prefix)
              )
              const isBaseMatch =
                location.pathname === item.to ||
                location.pathname.startsWith(`${item.to}/`)
              const isActive = !isExcluded && isBaseMatch

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
                  fontWeight={isActive ? '700' : '500'}
                  color={isActive ? 'gray.700' : 'gray.700'}
                  bg={isActive ? 'brand.50' : 'transparent'}
                  borderRadius="xl"
                  px={3}
                  _hover={{
                    bg: isActive ? 'brand.100' : 'gray.50',
                  }}
                  transition="all 0.2s"
                >
                  {item.label}
                </Button>
              )
            })}
          </VStack>
        </Box>

        {/* Activities Section */}
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
            Activities
          </Text>
          <VStack spacing={1} align="stretch">
            {sections.activities.map((item) => {
              const excludes = item.excludePrefixes ?? []
              const isExcluded = excludes.some((prefix) =>
                location.pathname.startsWith(prefix)
              )
              const isBaseMatch =
                location.pathname === item.to ||
                location.pathname.startsWith(`${item.to}/`)
              const isActive = !isExcluded && isBaseMatch

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
                  fontWeight={isActive ? '700' : '500'}
                  color={isActive ? 'gray.700' : 'gray.700'}
                  bg={isActive ? 'brand.50' : 'transparent'}
                  borderRadius="xl"
                  px={3}
                  _hover={{
                    bg: isActive ? 'brand.100' : 'gray.50',
                  }}
                  transition="all 0.2s"
                >
                  {item.label}
                </Button>
              )
            })}
          </VStack>
        </Box>
      </VStack>
    </Box>
  )
}

// Mobile Sidebar Component
function MobileSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation()

  useEffect(() => {
    onClose()
  }, [location.pathname, onClose])

  // Group navigation items by section
  const sections = {
    courses: navItems.filter(item => item.section === 'courses'),
    surveys: navItems.filter(item => item.section === 'surveys'),
    sessions: navItems.filter(item => item.section === 'sessions'),
    activities: navItems.filter(item => item.section === 'activities'),
  }

  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          <HStack spacing={3}>
            <Icon 
              as={PiGraduationCapBold} 
              boxSize={9} 
              color="brand.400"
            />
            <Text fontSize="lg" fontWeight="900">
              ClassConnect
            </Text>
          </HStack>
        </DrawerHeader>
        <DrawerBody p={4}>
          <VStack spacing={5} align="stretch">
            {/* Courses */}
            <Box>
              <Text
                fontSize="xs"
                fontWeight="700"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wide"
                mb={2}
              >
                Courses
              </Text>
              <VStack spacing={1} align="stretch">
                {sections.courses.map((item) => {
                  const excludes = item.excludePrefixes ?? []
                  const isExcluded = excludes.some((prefix) =>
                    location.pathname.startsWith(prefix)
                  )
                  const isBaseMatch =
                    location.pathname === item.to ||
                    location.pathname.startsWith(`${item.to}/`)
                  const isActive = !isExcluded && isBaseMatch

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
                      fontWeight={isActive ? '700' : '500'}
                      color={isActive ? 'gray.700' : 'gray.700'}
                      bg={isActive ? 'brand.50' : 'transparent'}
                      borderRadius="xl"
                      _hover={{
                        bg: isActive ? 'brand.100' : 'gray.50',
                      }}
                    >
                      {item.label}
                    </Button>
                  )
                })}
              </VStack>
            </Box>

            {/* Surveys */}
            <Box>
              <Text
                fontSize="xs"
                fontWeight="700"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wide"
                mb={2}
              >
                Surveys
              </Text>
              <VStack spacing={1} align="stretch">
                {sections.surveys.map((item) => {
                  const excludes = item.excludePrefixes ?? []
                  const isExcluded = excludes.some((prefix) =>
                    location.pathname.startsWith(prefix)
                  )
                  const isBaseMatch =
                    location.pathname === item.to ||
                    location.pathname.startsWith(`${item.to}/`)
                  const isActive = !isExcluded && isBaseMatch

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
                      fontWeight={isActive ? '700' : '500'}
                      color={isActive ? 'gray.700' : 'gray.700'}
                      bg={isActive ? 'brand.50' : 'transparent'}
                      borderRadius="xl"
                      _hover={{
                        bg: isActive ? 'brand.100' : 'gray.50',
                      }}
                    >
                      {item.label}
                    </Button>
                  )
                })}
              </VStack>
            </Box>

            {/* Sessions */}
            <Box>
              <Text
                fontSize="xs"
                fontWeight="700"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wide"
                mb={2}
              >
                Sessions
              </Text>
              <VStack spacing={1} align="stretch">
                {sections.sessions.map((item) => {
                  const excludes = item.excludePrefixes ?? []
                  const isExcluded = excludes.some((prefix) =>
                    location.pathname.startsWith(prefix)
                  )
                  const isBaseMatch =
                    location.pathname === item.to ||
                    location.pathname.startsWith(`${item.to}/`)
                  const isActive = !isExcluded && isBaseMatch

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
                      fontWeight={isActive ? '700' : '500'}
                      color={isActive ? 'gray.700' : 'gray.700'}
                      bg={isActive ? 'brand.50' : 'transparent'}
                      borderRadius="xl"
                      _hover={{
                        bg: isActive ? 'brand.100' : 'gray.50',
                      }}
                    >
                      {item.label}
                    </Button>
                  )
                })}
              </VStack>
            </Box>

            {/* Activities */}
            <Box>
              <Text
                fontSize="xs"
                fontWeight="700"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wide"
                mb={2}
              >
                Activities
              </Text>
              <VStack spacing={1} align="stretch">
                {sections.activities.map((item) => {
                  const excludes = item.excludePrefixes ?? []
                  const isExcluded = excludes.some((prefix) =>
                    location.pathname.startsWith(prefix)
                  )
                  const isBaseMatch =
                    location.pathname === item.to ||
                    location.pathname.startsWith(`${item.to}/`)
                  const isActive = !isExcluded && isBaseMatch

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
                      fontWeight={isActive ? '700' : '500'}
                      color={isActive ? 'gray.700' : 'gray.700'}
                      bg={isActive ? 'brand.50' : 'transparent'}
                      borderRadius="xl"
                      _hover={{
                        bg: isActive ? 'brand.100' : 'gray.50',
                      }}
                    >
                      {item.label}
                    </Button>
                  )
                })}
              </VStack>
            </Box>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export function TeacherLayout() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const bg = useColorModeValue('#F7F8FA', 'gray.900')

  const teacherName = localStorage.getItem('teacher_name') || 'Teacher'
  const isDesktop = useBreakpointValue({ base: false, xl: true })

  useEffect(() => {
    if (isDesktop && isOpen) {
      onClose()
    }
  }, [isDesktop, isOpen, onClose])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <Box minH="100vh" bg={bg}>
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isOpen} onClose={onClose} />

      {/* Main Content Area */}
      <Box ml={{ base: 0, xl: '230px' }} minH="100vh">
        {/* Top Navigation Bar */}
        <Box
          position="sticky"
          top="0"
          zIndex="sticky"
          bg="white"
          borderBottomWidth="1px"
          borderColor="gray.200"
          px={{ base: 4, md: 6, lg: 8 }}
          py={4}
        >
          <HStack spacing={4} justify="space-between">
            {/* Left: Menu + Search */}
            <HStack spacing={4} flex="1" maxW={{ base: 'full', md: '600px' }}>
              {/* Mobile Menu Button */}
              <IconButton
                aria-label="Open menu"
                icon={<Icon as={FiMenu} boxSize={6} />}
                onClick={onOpen}
                variant="ghost"
                size="lg"
                display={{ base: 'flex', xl: 'none' }}
                flexShrink={0}
              />

              {/* Search Bar */}
              <Box display={{ base: 'none', sm: 'block' }} flex="1">
                <CourseSearch size="md" placeholder="Search your courses..." />
              </Box>
            </HStack>

            {/* Right: Icons + User */}
            <HStack spacing={3}>
              {/* Notifications */}
              <IconButton
                aria-label="Notifications"
                icon={<Icon as={FiBell} boxSize={5} />}
                variant="ghost"
                borderRadius="full"
                size="md"
                position="relative"
              >
                <Box
                  position="absolute"
                  top="2"
                  right="2"
                  w="8px"
                  h="8px"
                  bg="red.500"
                  borderRadius="full"
                  border="2px solid white"
                />
              </IconButton>

              {/* User Menu */}
              <Menu placement="bottom-end">
                <MenuButton
                  as={Button}
                  variant="ghost"
                  borderRadius="full"
                  p={0}
                  h="auto"
                  _hover={{ transform: 'scale(1.05)' }}
                  transition="all 0.2s"
                >
                  <HStack spacing={2}>
                    <Avatar
                      size="sm"
                      name={teacherName}
                      bg="brand.300"
                      color="white"
                    />
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      display={{ base: 'none', md: 'block' }}
                    >
                      {teacherName}
                    </Text>
                  </HStack>
                </MenuButton>
                <MenuList
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="gray.200"
                  boxShadow="xl"
                  py={2}
                  minW="220px"
                >
                  <Box px={4} py={3}>
                    <Text fontSize="sm" fontWeight="700" color="gray.900">
                      {teacherName}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Teacher Account
                    </Text>
                  </Box>
                  <MenuDivider />
                  <MenuItem
                    icon={<Icon as={FiLogOut} />}
                    color="red.600"
                    borderRadius="lg"
                    mx={2}
                    fontSize="sm"
                    fontWeight="600"
                    onClick={handleLogout}
                  >
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </HStack>

          {/* Mobile Search */}
          <Box display={{ base: 'block', sm: 'none' }} mt={3}>
            <CourseSearch size="md" placeholder="Search courses..." />
          </Box>
        </Box>

        {/* Page Content */}
        <Box p={{ base: 4, sm: 5, md: 6, lg: 8 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}