import { useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Box, Text, Spinner, Center } from '@chakra-ui/react';
import { useDashboardStore } from '@/store/dashboardStore';

export function BlogStatsChart() {
  const {
    blogsPerDay,
    loadingStats,
    errorStats,
    fetchChartStats,
  } = useDashboardStore();

  useEffect(() => {
    fetchChartStats();
  }, []);

  return (
    <Box bg="white" p={4} rounded="lg" shadow="md">
      <Text mb={2} fontWeight="bold">
        Blogs Created per Day
      </Text>

      {loadingStats ? (
        <Center h="300px">
          <Spinner size="xl" />
        </Center>
      ) : errorStats ? (
        <Text color="red.500">Failed to load data</Text>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={blogsPerDay}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
}

export function LoginStatsChart() {
  const {
    loginsPerDay,
    loadingStats,
    errorStats,
    fetchChartStats,
  } = useDashboardStore();

  useEffect(() => {
    fetchChartStats();
  }, []);

  return (
    <Box bg="white" p={4} rounded="lg" shadow="md">
      <Text mb={2} fontWeight="bold">
        User Logins per Day
      </Text>

      {loadingStats ? (
        <Center h="300px">
          <Spinner size="xl" />
        </Center>
      ) : errorStats ? (
        <Text color="red.500">Failed to load data</Text>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={loginsPerDay}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
}
