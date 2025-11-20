// src/layouts/TeacherLayout.tsx
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Stack,
  Text,
  VStack,
  HStack,
  Icon,
  Divider,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useBreakpointValue,
} from '@chakra-ui/react'
import { NavLink, Outlet, useLocation, Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  FiBook,
  FiClipboard,
  FiPlayCircle,
  FiGrid,
  FiPlus,
  FiList,
  FiLayers,
  FiMenu,
  FiLogOut,
} from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTeacherProfile } from '../../api/teachers'

interface SectionLink {
  label: string
  to: string
  icon?: any
  excludePrefixes?: string[]
}

interface Section {
  title: string
  icon: any
  links: SectionLink[]
}

const sections: Section[] = [
  {
    title: 'Courses',
    icon: FiBook,
    links: [
      {
        label: 'Course library',
        to: '/teacher/courses',
        icon: FiList,
        excludePrefixes: ['/teacher/courses/new'],
      },
      { label: 'Create course', to: '/teacher/courses/new', icon: FiPlus },
    ],
  },
  {
    title: 'Sessions',
    icon: FiPlayCircle,
    links: [
      {
        label: 'Session library',
        to: '/teacher/sessions',
        icon: FiList,
        excludePrefixes: ['/teacher/sessions/new'],
      },
      { label: 'Launch session', to: '/teacher/sessions/new', icon: FiPlus },
    ],
  },
  {
    title: 'Surveys',
    icon: FiClipboard,
    links: [
      {
        label: 'Survey library',
        to: '/teacher/surveys',
        icon: FiList,
        excludePrefixes: ['/teacher/surveys/new'],
      },
      { label: 'Create survey', to: '/teacher/surveys/new', icon: FiPlus },
    ],
  },
  {
    title: 'Activities',
    icon: FiGrid,
    links: [
      {
        label: 'Activity library',
        to: '/teacher/activities',
        icon: FiList,
        excludePrefixes: ['/teacher/activities/new'],
      },
      { label: 'Create activity', to: '/teacher/activities/new', icon: FiPlus },
      {
        label: 'Activity types',
        to: '/teacher/activity-types',
        icon: FiLayers,
        excludePrefixes: ['/teacher/activity-types/new'],
      },
    ],
  },
]

// Sidebar Content Component
function SidebarContent({ onClose }: { onClose?: () => void }) {
  const location = useLocation()
  const sidebarBg = useColorModeValue('white', 'gray.800')

  return (
    <Box
      bg={sidebarBg}
      h="full"
      overflowY="auto"
      css={{
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#CBD5E0',
          borderRadius: '24px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#A0AEC0',
        },
      }}
    >
      <Stack spacing={6} p={6}>
        {/* Welcome Message */}
        <Box
          bg="brand.50"
          p={4}
          borderRadius="2xl"
          border="1px solid"
          borderColor="brand.100"
        >
          <Text fontSize="sm" fontWeight="600" color="brand.700">
            👋 Welcome back!
          </Text>
          <Text fontSize="xs" color="gray.600" mt={1}>
            Manage your classroom tools
          </Text>
        </Box>

        {/* Navigation Sections */}
        {sections.map((section, idx) => (
          <Box key={section.title}>
            {idx > 0 && <Divider mb={4} />}
            
            <HStack spacing={2} mb={3}>
              <Icon as={section.icon} color="brand.500" boxSize={4} />
              <Heading
                size="xs"
                textTransform="uppercase"
                color="gray.600"
                letterSpacing="wide"
                fontWeight="700"
              >
                {section.title}
              </Heading>
            </HStack>

            <Stack spacing={1}>
              {section.links.map((link) => {
                const excludes = link.excludePrefixes ?? []
                const isExcluded = excludes.some((prefix) =>
                  location.pathname.startsWith(prefix),
                )
                const isBaseMatch =
                  location.pathname === link.to ||
                  location.pathname.startsWith(`${link.to}/`)
                const isActive = !isExcluded && isBaseMatch

                return (
                  <Button
                    key={link.to}
                    as={NavLink}
                    to={link.to}
                    leftIcon={link.icon ? <Icon as={link.icon} /> : undefined}
                    justifyContent="flex-start"
                    variant={isActive ? 'solid' : 'ghost'}
                    colorScheme={isActive ? 'brand' : undefined}
                    size="sm"
                    w="full"
                    fontWeight={isActive ? '700' : '500'}
                    borderRadius="xl"
                    bg={isActive ? undefined : 'transparent'}
                    _hover={{
                      bg: isActive ? undefined : 'brand.50',
                      transform: 'translateX(4px)',
                    }}
                    transition="all 0.2s"
                    onClick={onClose}
                  >
                    {link.label}
                  </Button>
                )
              })}
            </Stack>
          </Box>
        ))}


      </Stack>
    </Box>
  )
}

export function TeacherLayout() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { logout, fullName } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const sidebarBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'gray.700')
  
  // Detect if we're on desktop breakpoint
  const isDesktop = useBreakpointValue({ base: false, lg: true })

  const teacherProfileQuery = useQuery({
    queryKey: ['teacherProfile'],
    queryFn: getTeacherProfile,
    enabled: !fullName, // Only fetch if we don't have the name yet
  })

  const teacherName = fullName || teacherProfileQuery.data?.full_name || 'Teacher'

  // Close drawer on route change
  useEffect(() => {
    onClose()
  }, [location.pathname, onClose])

  // Close drawer when resizing to desktop
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
    <Box minH="100vh" bg="surfaces.canvas">
      {/* Top Navigation Bar - ALWAYS VISIBLE */}
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
            {/* Left: Menu + Logo */}
            <HStack spacing={3}>
              {/* Hamburger - Only on mobile/tablet */}
              <IconButton
                aria-label="Open menu"
                icon={<Icon as={FiMenu} boxSize={6} />}
                onClick={onOpen}
                variant="ghost"
                colorScheme="brand"
                size="lg"
                display={{ base: 'flex', lg: 'none' }}
              />
              
              {/* Logo */}
              <RouterLink to="/teacher/courses">
                <HStack spacing={3} _hover={{ transform: 'scale(1.02)' }} transition="all 0.2s">
                  <Box
                    bgGradient="linear(to-r, brand.400, brand.600)"
                    color="white"
                    p={2}
                    borderRadius="xl"
                    fontSize="xl"
                    boxShadow="md"
                  >
                    📚
                  </Box>
                  <VStack align="flex-start" spacing={0}>
                    <Text fontSize="xl" fontWeight="800" color="gray.800">
                      ClassConnect
                    </Text>
                    <Text fontSize="xs" color="brand.600" fontWeight="600">
                      Teacher Portal
                    </Text>
                  </VStack>
                </HStack>
              </RouterLink>
            </HStack>

            {/* Right: Quick Actions + User Menu */}
            <HStack spacing={3}>
              {/* Quick Action - New Session */}
              <Button
                as={RouterLink}
                to="/teacher/sessions/new"
                leftIcon={<Icon as={FiPlayCircle} />}
                colorScheme="brand"
                size="md"
                borderRadius="xl"
                fontWeight="600"
                display={{ base: 'none', md: 'flex' }}
              >
                New Session
              </Button>

              {/* User Menu */}
              <Menu placement="bottom-end" gutter={8}>
                <MenuButton
                  as={Button}
                  variant="unstyled"
                  display="flex"
                  alignItems="center"
                  _hover={{ color: 'brand.600' }}
                  _active={{ color: 'brand.600' }}
                  transition="all 0.2s"
                >
                  <HStack spacing={3}>
                    <Text fontSize="md" fontWeight="600" color="gray.700">
                      {teacherName}
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
                      {teacherName}
                    </Text>
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                      Teacher Portal
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
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="8xl" py={{ base: 4, md: 8 }}>
        <Flex gap={8} direction={{ base: 'column', lg: 'row' }}>
          {/* Desktop Sidebar - Hidden on mobile */}
          <Box
            flexShrink={0}
            w="280px"
            position="sticky"
            top="88px"
            height="calc(100vh - 120px)"
            display={{ base: 'none', lg: 'block' }}
          >
            <Box
              bg={sidebarBg}
              borderRadius="3xl"
              boxShadow="xl"
              border="2px solid"
              borderColor={borderColor}
              h="full"
              overflowY="auto"
              css={{
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                  marginTop: '24px',
                  marginBottom: '24px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#CBD5E0',
                  borderRadius: '24px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#A0AEC0',
                },
              }}
            >
              <SidebarContent />
            </Box>
          </Box>

          {/* Mobile Drawer - Add key prop to reset state */}
          <Drawer 
            key={location.pathname}
            isOpen={isOpen} 
            placement="left" 
            onClose={onClose} 
            size="xs"
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader borderBottomWidth="1px">
                <VStack align="flex-start" spacing={0}>
                  <Text fontSize="lg" fontWeight="800">
                    Teacher Portal
                  </Text>
                  <Text fontSize="xs" color="gray.500" fontWeight="normal">
                    ClassConnect
                  </Text>
                </VStack>
              </DrawerHeader>
              <DrawerBody p={0}>
                <SidebarContent onClose={onClose} />
              </DrawerBody>
            </DrawerContent>
          </Drawer>

          {/* Main Content Area */}
          <Box flex="1" minW={0}>
            {/* Page Content */}
            <Box
              bg={sidebarBg}
              borderRadius={{ base: '2xl', md: '3xl' }}
              p={{ base: 4, sm: 6, md: 8 }}
              boxShadow="xl"
              border="2px solid"
              borderColor={borderColor}
              minH="500px"
            >
              <Outlet />
            </Box>
          </Box>
        </Flex>
      </Container>
    </Box>
  )
}
