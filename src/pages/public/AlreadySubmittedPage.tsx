import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { FiCheckCircle, FiHome } from "react-icons/fi";

export function AlreadySubmittedPage() {
  const { token: joinToken } = useParams<{ token: string }>();
  const navigate = useNavigate();

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Card maxW="md" borderRadius="xl" boxShadow="sm">
        <CardBody p={8}>
          <VStack spacing={5}>
            <Box
              w="64px"
              h="64px"
              bg="green.50"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FiCheckCircle} boxSize={8} color="green.500" />
            </Box>

            <VStack spacing={2}>
              <Heading size="md" color="gray.800" textAlign="center">
                Already Submitted
              </Heading>
              <Text color="gray.600" textAlign="center" fontSize="sm">
                You've already completed this check-in session. Each student can
                only submit once per session.
              </Text>
            </VStack>

            <Button
              leftIcon={<Icon as={FiHome} />}
              colorScheme="brand"
              size="lg"
              onClick={() => navigate("/")}
              w="full"
              mt={2}
            >
              Back to Home
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}
