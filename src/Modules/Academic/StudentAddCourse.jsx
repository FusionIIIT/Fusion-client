import React, { useEffect, useState } from 'react';
import {
  Card, Title, Table, Button, Group,
  Modal, Text, Loader, Alert, Select
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import axios from 'axios';

import {
  studentAvailableAddCourseSlotsRoute,
  studentAvailableAddCoursesRoute,
  studentAddCourseRoute,
} from '../../routes/academicRoutes';

export default function StudentAddCourse() {
  const [slots, setSlots]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [preview, setPreview]     = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // fetch available slots and courses for adding
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('No auth token found');
      setLoading(false);
      return;
    }

    Promise.all([
      axios.get(studentAvailableAddCourseSlotsRoute, {
        headers: { Authorization: `Token ${token}` }
      }),
      axios.get(studentAvailableAddCoursesRoute, {
        headers: { Authorization: `Token ${token}` }
      })
    ])
    .then(([slotsRes, coursesRes]) => {
      const slotData = Array.isArray(slotsRes.data) ? slotsRes.data : (slotsRes.data.slots || []);
      const courseData = Array.isArray(coursesRes.data) ? coursesRes.data : (coursesRes.data.courses || []);
      
      const enrichedSlots = slotData.map(slot => ({
        ...slot,
        courses: courseData.filter(c => c.slot === slot.name && c.id && c.code),
        selectedCourse: ''
      }));
      
      setSlots(enrichedSlots);
    })
    .catch(err => setError(err.response?.data?.error || err.message))
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error)   return <Alert color="red">{error}</Alert>;
  if (!slots.length) return <Text>No slots available for adding courses.</Text>;

  const courseOf = (s) =>
    (s.courses || []).find(c => String(c.id) === s.selectedCourse);

  // A course not running in the student's own section needs a running section picked.
  const needsSection = (s) => {
    const c = courseOf(s);
    return !!c && !c.own_section_running && (c.sections || []).length > 0;
  };

  const pickCourse = (idx, val) => {
    setSlots(slots.map((s, i) => {
      if (i !== idx) return s;
      const course = (s.courses || []).find(c => String(c.id) === val);
      // Auto-pick when the course runs in exactly one (other) section.
      let selectedSection = '';
      if (course && !course.own_section_running && (course.sections || []).length === 1) {
        selectedSection = String(course.sections[0].course_instructor_id);
      }
      return { ...s, selectedCourse: val, selectedSection };
    }));
  };

  const pickSection = (idx, val) => {
    setSlots(slots.map((s, i) => (i === idx ? { ...s, selectedSection: val } : s)));
  };

  const toSubmit = slots.filter(s => s.selectedCourse && s.selectedCourse !== '');

  const handleSubmit = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      showNotification({ title: 'Auth Error', message: 'No token', color: 'red' });
      return;
    }
    const selectedSlots = slots.filter(s => s.selectedCourse && s.selectedCourse !== '');

    const missingSection = selectedSlots.find(s => needsSection(s) && !s.selectedSection);
    if (missingSection) {
      const c = courseOf(missingSection);
      showNotification({
        title: 'Section required',
        message: `Select a section for ${c ? c.code : 'the course'} — it isn't running in your section.`,
        color: 'yellow',
      });
      return;
    }

    setSubmitting(true);

    try {
      await Promise.all(
        selectedSlots.map(s =>
          axios.post(studentAddCourseRoute,
            {
              slot_id: s.id,
              course_id: parseInt(s.selectedCourse, 10),
              ...(s.selectedSection
                ? { course_instructor_id: parseInt(s.selectedSection, 10) }
                : {}),
            },
            { headers: { Authorization: `Token ${token}` } }
          )
        )
      );

      showNotification({ 
        title: 'Success', 
        message: 'Course addition requests submitted successfully. Awaiting Academic approval.', 
        color: 'green' 
      });

      setSlots(prevSlots => prevSlots.filter(s => !selectedSlots.find(t => t.id === s.id)));
      setPreview(false);
    } catch (err) {
      showNotification({
        title: 'Submit failed',
        message: err.response?.data?.error || err.message,
        color: 'red'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card withBorder p="md">
      <Title order={3} mb="md">Add Course to Available Slot</Title>
      <Table highlightOnHover>
        <thead>
          <tr>
            <th>Slot</th>
            <th>Academic Year</th>
            <th>Semester</th>
            <th>Select Course</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((s, i) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.academic_year}</td>
              <td>{s.semester_type}</td>
              <td style={{ minWidth: 250 }}>
                <Select
                  placeholder="Select course…"
                  data={(s.courses || [])
                    .filter(c => c.id && c.code)
                    .map(c => ({
                      value: String(c.id),
                      label: `${c.code} - ${c.name}`,
                    }))}
                  value={s.selectedCourse}
                  onChange={val => pickCourse(i, val)}
                  clearable
                />
                {needsSection(s) && (
                  <Select
                    mt="xs"
                    placeholder="Select section…"
                    description="Not running in your section — pick a running one"
                    data={courseOf(s).sections.map(sec => ({
                      value: String(sec.course_instructor_id),
                      label: sec.section
                        ? `Section ${sec.section} — ${sec.instructor}`
                        : sec.instructor,
                    }))}
                    value={s.selectedSection || ''}
                    onChange={val => pickSection(i, val)}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Group position="right" mt="xl">
        <Button
          disabled={toSubmit.length === 0}
          onClick={() => setPreview(true)}
        >
          Review &amp; Submit
        </Button>
      </Group>

      <Modal
        opened={preview}
        onClose={() => setPreview(false)}
        title="Confirm Your Course Additions"
        size="lg"
      >
        {toSubmit.length === 0 ? (
          <Text>No courses selected.</Text>
        ) : (
          <>
            <Table>
              <thead>
                <tr><th>Slot</th><th>Course</th></tr>
              </thead>
              <tbody>
                {toSubmit.map(s => {
                  const course = s.courses.find(c => String(c.id) === s.selectedCourse);
                  return (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{course ? `${course.code} – ${course.name}` : 'Invalid'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Group position="right" mt="md">
              <Button variant="outline" onClick={() => setPreview(false)}>Cancel</Button>
              <Button onClick={handleSubmit} loading={submitting}>Submit</Button>
            </Group>
          </>
        )}
      </Modal>
    </Card>
  );
}
