import {
  AspectRatio,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Heading,
  Icon,
  Link,
  List,
  ListIcon,
  ListItem,
  Stack,
  Tag,
  TagLabel,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import {
  FiBookOpen,
  FiCheckSquare,
  FiClock,
  FiExternalLink,
  FiFileText,
  FiFlag,
  FiInfo,
  FiLink,
  FiMusic,
  FiPlayCircle,
  FiRepeat,
  FiUsers,
} from 'react-icons/fi'

type ActivityContent = {
  name: string
  summary?: string
  type: string
  tags?: string[]
  content_json: Record<string, unknown>
}

type ActivityContentDisplayProps = {
  activity: ActivityContent
  showHeader?: boolean
  showTags?: boolean
}

type PausePoint = {
  timestamp_sec?: number
  prompt?: string
}

const accentByType: Record<string, string> = {
  video: 'sky',
  music: 'blush',
  worksheet: 'mint',
  article: 'sunshine',
  'in-class-task': 'brand',
}

const iconByType: Record<string, typeof FiInfo> = {
  video: FiPlayCircle,
  music: FiMusic,
  worksheet: FiFileText,
  article: FiBookOpen,
  'in-class-task': FiCheckSquare,
}

const isString = (value: unknown): value is string => typeof value === 'string'
const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
const asPausePoints = (value: unknown): PausePoint[] =>
  Array.isArray(value)
    ? value.filter((item): item is PausePoint => item && typeof item === 'object')
    : []

const secondsToFriendly = (seconds?: number) => {
  if (typeof seconds !== 'number' || Number.isNaN(seconds)) return null
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  if (mins && secs) return `${mins}m ${secs}s`
  if (mins) return `${mins}m`
  return `${secs}s`
}

const buildYoutubeEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.replace('/', '')
      return `https://www.youtube.com/embed/${videoId}${parsed.search}`
    }
    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v')
      if (videoId) {
        parsed.searchParams.delete('v')
        const trailing = parsed.searchParams.toString()
        return `https://www.youtube.com/embed/${videoId}${trailing ? `?${trailing}` : ''}`
      }
      if (parsed.pathname.includes('/embed/')) {
        return url
      }
    }
  } catch {
    return url
  }
  return url
}

const PdfPreview = ({ fileUrl }: { fileUrl: string }) => {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>(720)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc
  }, [])

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const updateWidth = () => setContainerWidth(node.clientWidth)
    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Stack spacing={3}>
      <TransformWrapper
        minScale={0.8}
        maxScale={3}
        wheel={{ step: 0.15 }}
        pinch={{ step: 0.15 }}
        doubleClick={{ disabled: true }}
        initialScale={1}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <Stack spacing={3}>
            <HStack spacing={3} justify="flex-end">
              <Button onClick={() => zoomOut()} size="sm" colorScheme="mint" variant="outline">
                Zoom out
              </Button>
              <Button onClick={() => zoomIn()} size="sm" colorScheme="mint">
                Zoom in
              </Button>
              <Button
                onClick={() => resetTransform()}
                size="sm"
                colorScheme="mint"
                leftIcon={<Icon as={FiRepeat} />}
              >
                Reset
              </Button>
            </HStack>
            <Box
              ref={containerRef}
              borderRadius="xl"
              overflow="hidden"
              border="2px solid"
              borderColor="mint.200"
              bg="mint.50"
              boxShadow="md"
            >
              <TransformComponent wrapperStyle={{ width: '100%' }}>
                <Box py={4} display="flex" justifyContent="center">
                  <Document
                    file={fileUrl}
                    onLoadSuccess={({ numPages: total }) => {
                      setNumPages(total)
                      setError(null)
                    }}
                    onLoadError={() => setError('We could not load this worksheet.')}
                    loading={
                      <Text color="mint.700" fontWeight="700" textAlign="center">
                        Loading worksheet...
                      </Text>
                    }
                  >
                    {Array.from({ length: numPages ?? 1 }, (_, index) => (
                      <Page
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                        width={Math.max(containerWidth - 48, 280)}
                      />
                    ))}
                  </Document>
                </Box>
              </TransformComponent>
            </Box>
          </Stack>
        )}
      </TransformWrapper>
      {error ? (
        <Text color="red.600" fontWeight="700">
          {error}
        </Text>
      ) : null}
    </Stack>
  )
}

export function ActivityContentDisplay({
  activity,
  showHeader = true,
  showTags = true,
}: ActivityContentDisplayProps) {
  const { name, summary, type, content_json, tags } = activity
  const accent = accentByType[type] ?? 'gray'
  const TypeIcon = iconByType[type] ?? FiInfo
  const displayTags = useMemo(
    () => (tags ?? []).filter((tag) => tag !== '__system_default__'),
    [tags]
  )

  const renderVideoOrMusic = () => {
    const url = isString(content_json.url) ? content_json.url : ''
    const embedUrl = url ? buildYoutubeEmbedUrl(url) : ''
    const notes = isString(content_json.notes) ? content_json.notes : ''
    const duration = secondsToFriendly(content_json.duration_sec as number | undefined)
    const pausePoints = asPausePoints(content_json.pause_points)

    if (!url) {
      return <Text color="gray.600">No link provided yet.</Text>
    }

    return (
      <Stack spacing={4}>
        <AspectRatio ratio={16 / 9} borderRadius="xl" overflow="hidden" boxShadow="lg">
          <iframe
            src={embedUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={`${type}-player`}
            style={{ border: '0' }}
          />
        </AspectRatio>
        <HStack spacing={3} flexWrap="wrap">
          <Badge colorScheme={accent}>{type === 'music' ? 'Music' : 'Video'} link</Badge>
          {duration ? <Badge colorScheme="gray">{duration}</Badge> : null}
        </HStack>
        {notes ? (
          <Box p={4} bg={`${accent}.50`} borderRadius="lg" border="1px solid" borderColor={`${accent}.100`}>
            <Text fontWeight="700" color={`${accent}.800`}>
              Teacher/Student Tip
            </Text>
            <Text color="gray.700">{notes}</Text>
          </Box>
        ) : null}
        {pausePoints.length ? (
          <Box>
            <HStack spacing={2} mb={2}>
              <Icon as={FiFlag} color={`${accent}.600`} />
              <Text fontWeight="700">Pause &amp; think moments</Text>
            </HStack>
            <Stack spacing={2}>
              {pausePoints.map((point, index) => (
                <Box
                  key={`${point.timestamp_sec ?? index}-${point.prompt ?? index}`}
                  p={3}
                  borderRadius="md"
                  bg="white"
                  border="1px solid"
                  borderColor={`${accent}.100`}
                >
                  <HStack spacing={3}>
                    <Badge colorScheme={accent}>{secondsToFriendly(point.timestamp_sec) ?? 'Mark'}</Badge>
                    <Text fontWeight="600" color="gray.700">
                      {point.prompt ?? 'Reflect here'}
                    </Text>
                  </HStack>
                </Box>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Stack>
    )
  }

  const renderWorksheet = () => {
    const url = isString(content_json.file_url) ? content_json.file_url : ''
    const instructions = isString(content_json.instructions) ? content_json.instructions : ''
    const estimatedTime = secondsToFriendly(
      typeof content_json.estimated_time_min === 'number'
        ? content_json.estimated_time_min * 60
        : undefined
    )
    const materials = asStringArray(content_json.materials_needed)

    return (
      <Stack spacing={4}>
        {url ? <PdfPreview fileUrl={url} /> : <Text color="gray.600">Add a PDF link to preview it.</Text>}
        <Box p={4} bg="mint.50" borderRadius="lg" border="1px solid" borderColor="mint.100">
          <Stack spacing={3}>
            <HStack spacing={2}>
              <Icon as={FiInfo} color="mint.600" />
              <Text fontWeight="700" color="mint.800">
                How to use
              </Text>
            </HStack>
            {instructions ? (
              <Text whiteSpace="pre-wrap" color="gray.700">
                {instructions}
              </Text>
            ) : (
              <Text color="gray.600">Add step-by-step instructions to guide students.</Text>
            )}
            <HStack spacing={2} flexWrap="wrap">
              {estimatedTime ? (
                <Badge colorScheme="mint" display="inline-flex" alignItems="center" gap={1}>
                  <Icon as={FiClock} />
                  {estimatedTime}
                </Badge>
              ) : null}
              {materials.length ? (
                <Badge colorScheme="mint" display="inline-flex" alignItems="center" gap={1}>
                  <Icon as={FiFileText} />
                  Materials
                </Badge>
              ) : null}
            </HStack>
            {materials.length ? (
              <List spacing={1}>
                {materials.map((item) => (
                  <ListItem key={item} color="gray.700">
                    <ListIcon as={FiCheckSquare} color="mint.500" />
                    {item}
                  </ListItem>
                ))}
              </List>
            ) : null}
          </Stack>
        </Box>
      </Stack>
    )
  }

  const renderArticle = () => {
    const url = isString(content_json.url) ? content_json.url : ''
    const readingTime =
      typeof content_json.reading_time_min === 'number'
        ? `${content_json.reading_time_min} min read`
        : null
    const keyPoints = asStringArray(content_json.key_points)
    const reflectionQuestions = asStringArray(content_json.reflection_questions)

    return (
      <Stack spacing={4}>
        {url ? (
          <Button
            as={Link}
            href={url}
            isExternal
            colorScheme="sunshine"
            leftIcon={<Icon as={FiExternalLink} />}
            w="fit-content"
          >
            Open article
          </Button>
        ) : (
          <Text color="gray.600">Add an article link to show it here.</Text>
        )}
        <HStack spacing={2} flexWrap="wrap">
          <Badge colorScheme="sunshine" display="inline-flex" alignItems="center" gap={1}>
            <Icon as={FiLink} />
            Link included
          </Badge>
          {readingTime ? (
            <Badge colorScheme="gray" display="inline-flex" alignItems="center" gap={1}>
              <Icon as={FiClock} />
              {readingTime}
            </Badge>
          ) : null}
        </HStack>
        {keyPoints.length ? (
          <Box>
            <Heading size="sm" color="ink.700" mb={2}>
              Big ideas
            </Heading>
            <List spacing={2}>
              {keyPoints.map((item) => (
                <ListItem
                  key={item}
                  p={3}
                  borderRadius="md"
                  bg="white"
                  border="1px solid"
                  borderColor="sunshine.100"
                >
                  <ListIcon as={FiBookOpen} color="sunshine.500" />
                  {item}
                </ListItem>
              ))}
            </List>
          </Box>
        ) : null}
        {reflectionQuestions.length ? (
          <Box>
            <Heading size="sm" color="ink.700" mb={2}>
              Think about…
            </Heading>
            <List spacing={2}>
              {reflectionQuestions.map((item) => (
                <ListItem key={item} color="gray.700">
                  <ListIcon as={FiFlag} color="sunshine.500" />
                  {item}
                </ListItem>
              ))}
            </List>
          </Box>
        ) : null}
      </Stack>
    )
  }

  const renderInClassTask = () => {
    const steps = asStringArray(content_json.steps)
    const materials = asStringArray(content_json.materials_needed)
    const groupSize = content_json.group_size
    const timingHint = isString(content_json.timing_hint) ? content_json.timing_hint : null
    const notes = isString(content_json.notes_for_teacher) ? content_json.notes_for_teacher : null

    return (
      <Stack spacing={4}>
        <Box p={4} bg="brand.50" borderRadius="xl" border="1px solid" borderColor="brand.100">
          <HStack spacing={2} mb={3}>
            <Icon as={FiCheckSquare} color="brand.600" />
            <Heading size="sm" color="brand.700">
              Try these steps
            </Heading>
          </HStack>
          {steps.length ? (
            <List spacing={3} pl={1}>
              {steps.map((step, index) => (
                <ListItem
                  key={step}
                  p={3}
                  borderRadius="md"
                  bg="white"
                  border="1px solid"
                  borderColor="brand.100"
                  boxShadow="sm"
                >
                  <HStack align="flex-start" spacing={3}>
                    <Badge colorScheme="brand" borderRadius="full">
                      {index + 1}
                    </Badge>
                    <Text color="gray.700">{step}</Text>
                  </HStack>
                </ListItem>
              ))}
            </List>
          ) : (
            <Text color="gray.600">Add clear steps so students know what to do.</Text>
          )}
        </Box>

        <Flex gap={3} flexWrap="wrap">
          {materials.length ? (
            <Badge colorScheme="brand" display="inline-flex" alignItems="center" gap={1} px={3} py={2}>
              <Icon as={FiFileText} />
              Materials: {materials.join(', ')}
            </Badge>
          ) : null}
          {typeof groupSize === 'number' ? (
            <Badge colorScheme="brand" display="inline-flex" alignItems="center" gap={1} px={3} py={2}>
              <Icon as={FiUsers} />
              Group size: {groupSize}
            </Badge>
          ) : null}
          {timingHint ? (
            <Badge colorScheme="gray" display="inline-flex" alignItems="center" gap={1} px={3} py={2}>
              <Icon as={FiClock} />
              {timingHint}
            </Badge>
          ) : null}
        </Flex>

        {notes ? (
          <Box p={4} bg="white" borderRadius="lg" border="1px dashed" borderColor="brand.200">
            <Text fontWeight="700" color="brand.700" mb={1}>
              Teacher note
            </Text>
            <Text color="gray.700">{notes}</Text>
          </Box>
        ) : null}
      </Stack>
    )
  }

  const renderedContent = useMemo(() => {
    switch (type) {
      case 'video':
      case 'music':
        return renderVideoOrMusic()
      case 'worksheet':
        return renderWorksheet()
      case 'article':
        return renderArticle()
      case 'in-class-task':
        return renderInClassTask()
      default:
        return (
          <Box>
            <Text color="gray.700">This activity type is not formatted yet.</Text>
            <Box
              mt={2}
              p={3}
              bg="gray.50"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
              fontFamily="mono"
              fontSize="sm"
              whiteSpace="pre-wrap"
            >
              {JSON.stringify(content_json, null, 2)}
            </Box>
          </Box>
        )
    }
  }, [type, content_json])

  return (
    <Stack spacing={4}>
      {showHeader ? (
        <>
          <Box
            p={4}
            bg={`${accent}.50`}
            borderRadius="xl"
            border="1px solid"
            borderColor={`${accent}.100`}
            boxShadow="md"
          >
            <HStack align="flex-start" spacing={3} flexWrap="wrap">
              <Box
                bgGradient={`linear(135deg, ${accent}.200, ${accent}.400)`}
                color="white"
                borderRadius="xl"
                p={3}
                boxShadow="lg"
              >
                <Icon as={TypeIcon} boxSize={6} />
              </Box>
              <VStack align="flex-start" spacing={1} flex={1}>
                <Heading size="md" fontWeight="800" color="ink.800">
                  {name}
                </Heading>
                {summary ? (
                  <Text color="gray.700" fontSize="sm">
                    {summary}
                  </Text>
                ) : null}
                <HStack spacing={2} flexWrap="wrap">
                  <Badge colorScheme={accent} borderRadius="full" px={3}>
                    {type}
                  </Badge>
                  {showTags && displayTags.length
                    ? displayTags.map((tag) => (
                        <Tag
                          key={tag}
                          colorScheme={accent}
                          variant="subtle"
                          size="sm"
                          borderRadius="full"
                        >
                          <TagLabel>#{tag}</TagLabel>
                        </Tag>
                      ))
                    : null}
              </HStack>
            </VStack>
          </HStack>
          </Box>
          <Divider />
        </>
      ) : null}
      {renderedContent}
    </Stack>
  )
}