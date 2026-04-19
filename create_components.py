import os
import json

base = r'src\Modules\Scholarship'

# Create directories
os.makedirs(os.path.join(base, 'components', 'forms'), exist_ok=True)
os.makedirs(os.path.join(base, 'services'), exist_ok=True)

# StudentDashboard
code1 = """import { useState, useEffect } from 'react';
import { Card, Tabs, Box, Text, Loader, Center, Container } from '@mantine/core';
import { useSelector } from 'react-redux';
import axios from 'axios';
import ProfileSection from './ProfileSection';
import ActiveScholarships from './ActiveScholarships';
import ApplicationForm from './ApplicationForm';
import MyApplications from './MyApplications';
import EligibilityChecker from './EligibilityChecker';
import MeritListViewer from './MeritListViewer';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('0');
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/scholarships/api/student-profile/');
      setStudentProfile(response.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Center h={400}><Loader /></Center>;

  return (
    <Container size="lg" py="xl">
      <ProfileSection profile={studentProfile} onRefresh={fetchStudentProfile} />
      <Box mt="xl">
        <Tabs value={activeTab} onTabChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value=\"0\">Available Scholarships</Tabs.Tab>
            <Tabs.Tab value=\"1\">Apply</Tabs.Tab>
            <Tabs.Tab value=\"2\">My Applications</Tabs.Tab>
            <Tabs.Tab value=\"3\">Check Eligibility</Tabs.Tab>
            <Tabs.Tab value=\"4\">Merit List</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value=\"0\" pt=\"lg\"><ActiveScholarships /></Tabs.Panel>
          <Tabs.Panel value=\"1\" pt=\"lg\"><ApplicationForm /></Tabs.Panel>
          <Tabs.Panel value=\"2\" pt=\"lg\"><MyApplications /></Tabs.Panel>
          <Tabs.Panel value=\"3\" pt=\"lg\"><EligibilityChecker /></Tabs.Panel>
          <Tabs.Panel value=\"4\" pt=\"lg\"><MeritListViewer /></Tabs.Panel>
        </Tabs>
      </Box>
    </Container>
  );
}"""

with open(os.path.join(base, 'components', 'StudentDashboard.jsx'), 'w') as f:
    f.write(code1)

print('✅ StudentDashboard created')
