import { Box, Text, useColorModeValue } from "@chakra-ui/react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useState } from "react";

export function DashboardCalendar() {
  const [value, setValue] = useState(new Date());
  const bg = useColorModeValue("white", "gray.800");

  return (
    <Box bg={bg} rounded="lg" p={4} shadow="md" w="full">
      <Text fontWeight="bold" mb={2}>
        Calendar
      </Text>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="100%"
      >
        <Calendar
          onChange={setValue}
          value={value}
          tileClassName={({ date, view }) => {
            // Highlight today's date
            const isToday = new Date().toDateString() === date.toDateString();
            return isToday ? "react-calendar__tile--active" : null;
          }}
        />
      </Box>
    </Box>
  );
}
