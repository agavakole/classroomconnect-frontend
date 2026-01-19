// src/components/layout/TeacherLayout.tsx
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
  Flex,
  Tooltip,
  Divider,
} from '@chakra-ui/react'
import {
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
  FiLayers,
  FiPlus,
  FiX,
  FiHome,
  FiUser,
} from 'react-icons/fi'
import { PiGraduationCapBold } from 'react-icons/pi'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect, useState, useRef } from 'react'
import { CourseSearch } from '../../components/CourseSearch'

interface NavItem {
  label: string
  to: string
  icon: any
  section?: 'home' | 'surveys' | 'courses' | 'activities' | 'sessions'
  excludePrefixes?: string[]
}

const navItems: NavItem[] = [
  // Home/Dashboard
  {
    label: 'Dashboard',
    to: '/teacher/dashboard',
    icon: FiHome,
    section: 'home',
  },

  // Surveys
  {
    label: 'Survey templates',
    to: '/teacher/surveys',
    icon: FiClipboard,
    section: 'surveys',
    excludePrefixes: ['/teacher/surveys/new'],
  },
  {
    label: 'Create survey',
    to: '/teacher/surveys/new',
    icon: FiPlus,
    section: 'surveys',
  },

  // Courses
  {
    label: 'Courses',
    to: '/teacher/courses',
    icon: FiBook,
    section: 'courses',
    excludePrefixes: ['/teacher/courses/new'],
  },
  {
    label: 'Create course',
    to: '/teacher/courses/new',
    icon: FiPlus,
    section: 'courses',
  },

  // Activities
  {
    label: 'Activity library',
    to: '/teacher/activities',
    icon: FiGrid,
    section: 'activities',
    excludePrefixes: ['/teacher/activities/new'],
  },
  {
    label: 'Create activity',
    to: '/teacher/activities/new',
    icon: FiPlus,
    section: 'activities',
  },
  {
    label: 'Activity types',
    to: '/teacher/activity-types',
    icon: FiLayers,
    section: 'activities',
    excludePrefixes: ['/teacher/activity-types/new'],
  },

  // Sessions
  {
    label: 'Session library',
    to: '/teacher/sessions',
    icon: FiPlayCircle,
    section: 'sessions',
    excludePrefixes: ['/teacher/sessions/new'],
  },
  {
    label: 'Launch session',
    to: '/teacher/sessions/new',
    icon: FiPlus,
    section: 'sessions',
  },
]

// Bottom nav items for mobile - key sections only (reordered)
const bottomNavItems = [
  { label: 'Home', to: '/teacher/dashboard', icon: FiHome },
  { label: 'Surveys', to: '/teacher/surveys', icon: FiClipboard },
  { label: 'Courses', to: '/teacher/courses', icon: FiBook },
  { label: 'Activities', to: '/teacher/activities', icon: FiGrid },
]

// Mobile Bottom Navigation Component
function MobileBottomNav({ onMenuOpen }: { onMenuOpen: () => void }) {
  const location = useLocation()
  const teacherName = localStorage.getItem('teacher_name') || 'Teacher'

  const isActive = (path: string) => {
    if (path === '/teacher/dashboard') {
      return location.pathname === '/teacher/dashboard'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <Box
      display={{ base: 'flex', md: 'none' }}
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="white"
      borderTop="1px solid"
      borderColor="gray.200"
      px={2}
      py={2}
      zIndex={20}
      boxShadow="0 -2px 10px rgba(0,0,0,0.05)"
    >
      <HStack justify="space-around" w="100%" spacing={0}>
        {bottomNavItems.map((item) => {
          const active = isActive(item.to)
          return (
            <VStack
              key={item.to}
              as={RouterLink}
              to={item.to}
              spacing={0.5}
              flex={1}
              py={1}
              px={2}
              borderRadius="lg"
              bg={active ? 'brand.50' : 'transparent'}
              color={active ? 'brand.600' : 'gray.500'}
              transition="all 0.2s"
              _hover={{ color: 'brand.600' }}
            >
              <Icon as={item.icon} boxSize={5} />
              <Text fontSize="2xs" fontWeight={active ? '700' : '600'}>
                {item.label}
              </Text>
            </VStack>
          )
        })}
        
        {/* More/Menu button */}
        <VStack
          as="button"
          onClick={onMenuOpen}
          spacing={0.5}
          flex={1}
          py={1}
          px={2}
          borderRadius="lg"
          color="gray.500"
          transition="all 0.2s"
          _hover={{ color: 'brand.600' }}
        >
          <Icon as={FiMenu} boxSize={5} />
          <Text fontSize="2xs" fontWeight="600">
            More
          </Text>
        </VStack>
      </HStack>
    </Box>
  )
}

// Mobile Sidebar Component
function MobileSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const location = useLocation()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const teacherName = localStorage.getItem('teacher_name') || 'Teacher'
  const prevPathRef = useRef(location.pathname)

  // Close drawer only when navigating to a DIFFERENT page
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      onClose()
      prevPathRef.current = location.pathname
    }
  }, [location.pathname, onClose])

  const grouped = {
    home: navItems.filter((item) => item.section === 'home'),
    surveys: navItems.filter((item) => item.section === 'surveys'),
    courses: navItems.filter((item) => item.section === 'courses'),
    activities: navItems.filter((item) => item.section === 'activities'),
    sessions: navItems.filter((item) => item.section === 'sessions'),
  }

  const handleLogout = () => {
    onClose()
    logout()
    navigate('/')
  }

  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" borderColor="gray.100">
          <HStack spacing={3}>
            <Icon as={PiGraduationCapBold} boxSize={10} color="ink.400" />
            <VStack align="flex-start" spacing={0}>
              <Text fontSize="lg" fontWeight="900" color="gray.800">
                ClassConnect
              </Text>
              <Text fontSize="xs" color="gray.500" fontWeight="600">
                Teacher Portal
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
                  name={teacherName}
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
                    {teacherName}
                  </Text>
                  <Text fontSize="xs" color="gray.500" noOfLines={1}>
                    Teacher Account
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Navigation Sections */}
            <VStack flex="1" p={4} spacing={5} align="stretch" overflowY="auto">
              {/* Home/Dashboard */}
              <Box>
                <Text
                  fontSize="xs"
                  fontWeight="700"
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb={2}
                  px={2}
                >
                  Home
                </Text>
                <VStack spacing={1} align="stretch">
                  {grouped.home.map((item) => {
                    const isActive = location.pathname === '/teacher/dashboard'

                    return (
                      <Button
                        key={item.to}
                        as={RouterLink}
                        to={item.to}
                        leftIcon={<Icon as={item.icon} boxSize={5} />}
                        justifyContent="flex-start"
                        variant="ghost"
                        size="md"
                        w="full"
                        fontWeight={isActive ? '700' : '600'}
                        color={isActive ? 'brand.600' : 'gray.700'}
                        bg={isActive ? 'brand.50' : 'transparent'}
                        borderRadius="xl"
                        _hover={{
                          bg: isActive ? 'brand.50' : 'gray.100',
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
                  px={2}
                >
                  Surveys
                </Text>
                <VStack spacing={1} align="stretch">
                  {grouped.surveys.map((item) => {
                    const excludes = item.excludePrefixes ?? []
                    const isExcluded = excludes.some((prefix) =>
                      location.pathname.startsWith(prefix),
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
                        size="md"
                        w="full"
                        fontWeight={isActive ? '700' : '600'}
                        color={isActive ? 'brand.600' : 'gray.700'}
                        bg={isActive ? 'brand.50' : 'transparent'}
                        borderRadius="xl"
                        _hover={{
                          bg: isActive ? 'brand.50' : 'gray.100',
                        }}
                      >
                        {item.label}
                      </Button>
                    )
                  })}
                </VStack>
              </Box>

              {/* Courses */}
              <Box>
                <Text
                  fontSize="xs"
                  fontWeight="700"
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb={2}
                  px={2}
                >
                  Courses
                </Text>
                <VStack spacing={1} align="stretch">
                  {grouped.courses.map((item) => {
                    const excludes = item.excludePrefixes ?? []
                    const isExcluded = excludes.some((prefix) =>
                      location.pathname.startsWith(prefix),
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
                        size="md"
                        w="full"
                        fontWeight={isActive ? '700' : '600'}
                        color={isActive ? 'brand.600' : 'gray.700'}
                        bg={isActive ? 'brand.50' : 'transparent'}
                        borderRadius="xl"
                        _hover={{
                          bg: isActive ? 'brand.50' : 'gray.100',
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
                  px={2}
                >
                  Activities
                </Text>
                <VStack spacing={1} align="stretch">
                  {grouped.activities.map((item) => {
                    const excludes = item.excludePrefixes ?? []
                    const isExcluded = excludes.some((prefix) =>
                      location.pathname.startsWith(prefix),
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
                        size="md"
                        w="full"
                        fontWeight={isActive ? '700' : '600'}
                        color={isActive ? 'brand.600' : 'gray.700'}
                        bg={isActive ? 'brand.50' : 'transparent'}
                        borderRadius="xl"
                        _hover={{
                          bg: isActive ? 'brand.50' : 'gray.100',
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
                  px={2}
                >
                  Sessions
                </Text>
                <VStack spacing={1} align="stretch">
                  {grouped.sessions.map((item) => {
                    const excludes = item.excludePrefixes ?? []
                    const isExcluded = excludes.some((prefix) =>
                      location.pathname.startsWith(prefix),
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
                        size="md"
                        w="full"
                        fontWeight={isActive ? '700' : '600'}
                        color={isActive ? 'brand.600' : 'gray.700'}
                        bg={isActive ? 'brand.50' : 'transparent'}
                        borderRadius="xl"
                        _hover={{
                          bg: isActive ? 'brand.50' : 'gray.100',
                        }}
                      >
                        {item.label}
                      </Button>
                    )
                  })}
                </VStack>
              </Box>
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
  )
}

// Tablet Icon-Only Nav Item Component
function TabletNavItem({ item, location }: { item: NavItem; location: ReturnType<typeof useLocation> }) {
  const excludes = item.excludePrefixes ?? []
  const isExcluded = excludes.some((prefix) =>
    location.pathname.startsWith(prefix),
  )
  
  let isActive: boolean
  if (item.to === '/teacher/dashboard') {
    isActive = location.pathname === '/teacher/dashboard'
  } else {
    const isBaseMatch =
      location.pathname === item.to ||
      location.pathname.startsWith(`${item.to}/`)
    isActive = !isExcluded && isBaseMatch
  }

  return (
    <Tooltip label={item.label} placement="right" hasArrow openDelay={200}>
      <IconButton
        as={RouterLink}
        to={item.to}
        aria-label={item.label}
        icon={<Icon as={item.icon} boxSize={5} />}
        variant="ghost"
        size="lg"
        w="44px"
        h="44px"
        borderRadius="xl"
        color={isActive ? 'brand.600' : 'gray.600'}
        bg={isActive ? 'brand.50' : 'transparent'}
        _hover={{
          bg: isActive ? 'brand.50' : 'gray.100',
        }}
      />
    </Tooltip>
  )
}

export function TeacherLayout() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const bg = useColorModeValue('#F7F8FA', 'gray.900')
  const sidebarBg = useColorModeValue('white', 'gray.800')

  const teacherName = localStorage.getItem('teacher_name') || 'Teacher'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const grouped = {
    home: navItems.filter((item) => item.section === 'home'),
    surveys: navItems.filter((item) => item.section === 'surveys'),
    courses: navItems.filter((item) => item.section === 'courses'),
    activities: navItems.filter((item) => item.section === 'activities'),
    sessions: navItems.filter((item) => item.section === 'sessions'),
  }

  return (
    <Flex minH="100vh" bg={bg} overflow="hidden">
      {/* Mobile Sidebar Drawer - Only for mobile (base to md) */}
      <MobileSidebar isOpen={isOpen} onClose={onClose} />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav onMenuOpen={onOpen} />

      {/* Tablet Sidebar - Icons only (md to lg) */}
      <Box
        display={{ base: 'none', md: 'flex', lg: 'none' }}
        position="fixed"
        left="0"
        top="0"
        h="100vh"
        w="72px"
        bg={sidebarBg}
        borderRight="1px solid"
        borderColor="gray.200"
        flexDirection="column"
        py={4}
        zIndex="10"
        boxShadow="sm"
      >
        {/* Logo */}
        <Flex justify="center" mb={4}>
          <Box
            w="44px"
            h="44px"
            borderRadius="xl"
            bg="brand.500"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={PiGraduationCapBold} boxSize={6} color="white" />
          </Box>
        </Flex>

        {/* Navigation Icons */}
        <VStack flex="1" spacing={1} px={3} overflowY="auto" align="center">
          {/* Home */}
          {grouped.home.map((item) => (
            <TabletNavItem key={item.to} item={item} location={location} />
          ))}
          
          <Divider my={2} />
          
          {/* Surveys */}
          {grouped.surveys.map((item) => (
            <TabletNavItem key={item.to} item={item} location={location} />
          ))}
          
          <Divider my={2} />
          
          {/* Courses */}
          {grouped.courses.map((item) => (
            <TabletNavItem key={item.to} item={item} location={location} />
          ))}
          
          <Divider my={2} />
          
          {/* Activities */}
          {grouped.activities.map((item) => (
            <TabletNavItem key={item.to} item={item} location={location} />
          ))}
          
          <Divider my={2} />
          
          {/* Sessions */}
          {grouped.sessions.map((item) => (
            <TabletNavItem key={item.to} item={item} location={location} />
          ))}
        </VStack>

        {/* Bottom: Logout & Avatar */}
        <VStack spacing={2} px={3} mt="auto">
          <Tooltip label="Logout" placement="right" hasArrow>
            <IconButton
              aria-label="Logout"
              icon={<Icon as={FiLogOut} boxSize={5} />}
              variant="ghost"
              size="lg"
              w="44px"
              h="44px"
              borderRadius="xl"
              color="red.600"
              _hover={{ bg: 'red.50', color: 'red.500' }}
              onClick={handleLogout}
            />
          </Tooltip>
          
        </VStack>
      </Box>

      {/* Desktop Sidebar - Full width with text (lg and up) */}
      <Box
        w={isSidebarOpen ? '280px' : '0'}
        h="100vh"
        bg={sidebarBg}
        borderRight="1px solid"
        borderColor="gray.200"
        transition="all 0.3s"
        overflow="hidden"
        boxShadow="sm"
        display={{ base: 'none', lg: 'block' }}
        position="fixed"
        left="0"
        top="0"
        zIndex="10"
      >
        <VStack h="100%" spacing={0} align="stretch">
          {/* Logo/Brand */}
          <Box p={6} borderBottom="1px solid" borderColor="gray.100">
            <Flex justify="space-between" align="center">
              <HStack spacing={3}>
                <Icon as={PiGraduationCapBold} boxSize={10} color="ink.400" />
                <VStack align="flex-start" spacing={0}>
                  <Text fontWeight="900" fontSize="lg" color="gray.900">
                    ClassConnect
                  </Text>
                  <Text fontSize="xs" color="gray.500" fontWeight="600">
                    Teacher Portal
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
                name={teacherName}
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
                  {teacherName}
                </Text>
                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                  Teacher Account
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* Navigation Menu */}
          <VStack
            flex="1"
            p={4}
            spacing={5}
            align="stretch"
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
            {/* Home/Dashboard Section */}
            <Box>
              <Text
                fontSize="xs"
                fontWeight="700"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wide"
                px={2}
                mb={2}
              >
                Home
              </Text>
              <VStack spacing={1} align="stretch">
                {grouped.home.map((item) => {
                  const isActive = location.pathname === '/teacher/dashboard'

                  return (
                    <Button
                      key={item.to}
                      as={RouterLink}
                      to={item.to}
                      leftIcon={<Icon as={item.icon} boxSize={5} />}
                      justifyContent="flex-start"
                      variant="ghost"
                      size="md"
                      w="full"
                      fontWeight={isActive ? '700' : '600'}
                      color={isActive ? 'brand.600' : 'gray.700'}
                      bg={isActive ? 'brand.50' : 'transparent'}
                      borderRadius="xl"
                      px={3}
                      _hover={{
                        bg: isActive ? 'brand.50' : 'gray.100',
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
                mb={2}
              >
                Surveys
              </Text>
              <VStack spacing={1} align="stretch">
                {grouped.surveys.map((item) => {
                  const excludes = item.excludePrefixes ?? []
                  const isExcluded = excludes.some((prefix) =>
                    location.pathname.startsWith(prefix),
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
                      size="md"
                      w="full"
                      fontWeight={isActive ? '700' : '600'}
                      color={isActive ? 'brand.600' : 'gray.700'}
                      bg={isActive ? 'brand.50' : 'transparent'}
                      borderRadius="xl"
                      px={3}
                      _hover={{
                        bg: isActive ? 'brand.50' : 'gray.100',
                      }}
                      transition="all 0.2s"
                    >
                      {item.label}
                    </Button>
                  )
                })}
              </VStack>
            </Box>

            {/* Courses Section */}
            <Box>
              <Text
                fontSize="xs"
                fontWeight="700"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wide"
                px={2}
                mb={2}
              >
                Courses
              </Text>
              <VStack spacing={1} align="stretch">
                {grouped.courses.map((item) => {
                  const excludes = item.excludePrefixes ?? []
                  const isExcluded = excludes.some((prefix) =>
                    location.pathname.startsWith(prefix),
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
                      size="md"
                      w="full"
                      fontWeight={isActive ? '700' : '600'}
                      color={isActive ? 'brand.600' : 'gray.700'}
                      bg={isActive ? 'brand.50' : 'transparent'}
                      borderRadius="xl"
                      px={3}
                      _hover={{
                        bg: isActive ? 'brand.50' : 'gray.100',
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
                mb={2}
              >
                Activities
              </Text>
              <VStack spacing={1} align="stretch">
                {grouped.activities.map((item) => {
                  const excludes = item.excludePrefixes ?? []
                  const isExcluded = excludes.some((prefix) =>
                    location.pathname.startsWith(prefix),
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
                      size="md"
                      w="full"
                      fontWeight={isActive ? '700' : '600'}
                      color={isActive ? 'brand.600' : 'gray.700'}
                      bg={isActive ? 'brand.50' : 'transparent'}
                      borderRadius="xl"
                      px={3}
                      _hover={{
                        bg: isActive ? 'brand.50' : 'gray.100',
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
                mb={2}
              >
                Sessions
              </Text>
              <VStack spacing={1} align="stretch">
                {grouped.sessions.map((item) => {
                  const excludes = item.excludePrefixes ?? []
                  const isExcluded = excludes.some((prefix) =>
                    location.pathname.startsWith(prefix),
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
                      size="md"
                      w="full"
                      fontWeight={isActive ? '700' : '600'}
                      color={isActive ? 'brand.600' : 'gray.700'}
                      bg={isActive ? 'brand.50' : 'transparent'}
                      borderRadius="xl"
                      px={3}
                      _hover={{
                        bg: isActive ? 'brand.50' : 'gray.100',
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
      <Flex
        flex="1"
        direction="column"
        overflow="hidden"
        ml={{ base: 0, md: '72px', lg: isSidebarOpen ? '280px' : 0 }}
        transition="margin-left 0.3s"
      >
        {/* Top Navigation Bar */}
        <Box
          bg="white"
          borderBottom="1px solid"
          borderColor="gray.200"
          px={{ base: 4, md: 6, lg: 8 }}
          py={4}
          boxShadow="sm"
        >
          <HStack spacing={4} justify="space-between">
            {/* Left: Search */}
            <HStack spacing={4} flex="1" maxW={{ base: 'full', md: '600px' }}>
              {/* Desktop menu button - only when sidebar closed */}
              <IconButton
                aria-label="Open sidebar"
                icon={<Icon as={FiMenu} boxSize={6} />}
                onClick={() => setIsSidebarOpen(true)}
                variant="ghost"
                size="lg"
                flexShrink={0}
                borderRadius="lg"
                display={{ base: 'none', lg: isSidebarOpen ? 'none' : 'flex' }}
              />

              {/* Search Bar */}
              <Box flex="1">
                <CourseSearch size="md" placeholder="Search your courses..." />
              </Box>
            </HStack>

            {/* Right: User Menu */}
            <HStack spacing={3}>
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
        </Box>

        {/* Page Content - Add bottom padding for mobile nav */}
        <Box 
          flex="1" 
          overflow="auto" 
          p={{ base: 4, sm: 5, md: 6, lg: 8 }}
          pb={{ base: '80px', md: 6, lg: 8 }}
        >
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  )
}