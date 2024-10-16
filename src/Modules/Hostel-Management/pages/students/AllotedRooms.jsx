import React from 'react';
import { Box, Group } from '@mantine/core';
import StudentInfoCard from '../../components/students/StudentInfoCard';
import StudentInfo from '../all-actors/StudentInfo';

export default function StudentDashboard() {
  return (
    <Box style={{ overflow: 'hidden' }}>
      <Group align="flex-start" style={{ height: '78vh' }}>
        <Box style={{ height: '100%'}}>
          <StudentInfoCard name="Akshay" roomNo="22bec009" hallName="Panini" hallNo="5"/>
        </Box>
        <Box style={{ height: '100%', flex: 1 }}>
          <StudentInfo />
        </Box>
      </Group>
    </Box>
  );
}
