import React, { useState, useEffect, useCallback, memo } from "react";
import { Card, Text, Button, Alert, Loader, Center } from "@mantine/core";
import axios from "axios";
import {
  preCourseRegistrationRoute,
  preCourseRegistrationSubmitRoute,
} from "../../routes/academicRoutes";

// Memoized CourseRow component
const CourseRow = memo(
  ({
    rowData,
    onPriorityChange,
    priorityValue,
    slotPriorities,
    slotRowSpan,
    readOnly,
  }) => {
    const {
      serial,
      isFirst,
      slotName,
      slotType,
      semester,
      slotId,
      course,
      slotLength,
    } = rowData;

    const options = Array.from({ length: slotLength }, (_, i) => {
      const optionValue = `${i + 1}`;
      let isDisabled = false;
      if (slotPriorities) {
        Object.entries(slotPriorities).forEach(([cId, val]) => {
          if (cId !== course.id.toString() && val === optionValue) {
            isDisabled = true;
          }
        });
      }
      return (
        <option key={optionValue} value={optionValue} disabled={isDisabled}>
          {optionValue}
        </option>
      );
    });

    return (
      <tr>
        {isFirst && (
          <td
            style={{
              border: "1px solid #ccc",
              padding: "8px",
              textAlign: "center",
            }}
            rowSpan={slotRowSpan}
          >
            {slotName} <br />({slotType}, Sem: {semester})
          </td>
        )}
        <td style={{ border: "1px solid #ccc", padding: "8px" }}>
          {course.code}: {course.name} ({course.credits} credits)
        </td>
        <td
          style={{
            border: "1px solid #ccc",
            padding: "8px",
            textAlign: "center",
          }}
        >
          {readOnly ? (
            <Text>{priorityValue || "Not Selected"}</Text>
          ) : (
            <select
              value={priorityValue || ""}
              onChange={(e) =>
                onPriorityChange(slotId, course.id, e.target.value)
              }
              style={{
                width: "120px",
                padding: "4px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                backgroundColor: "#fff",
              }}
            >
              <option value="">Select</option>
              {options}
            </select>
          )}
        </td>
      </tr>
    );
  },
  (prevProps, nextProps) =>
    prevProps.priorityValue === nextProps.priorityValue &&
    prevProps.rowData === nextProps.rowData &&
    JSON.stringify(prevProps.slotPriorities) ===
      JSON.stringify(nextProps.slotPriorities) &&
    prevProps.readOnly === nextProps.readOnly
);

function PreRegistration() {
  const [coursesData, setCoursesData] = useState([]);
  const [priorities, setPriorities] = useState({});
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError(new Error("No token found"));
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(preCourseRegistrationRoute, {
          headers: { Authorization: `Token ${token}` },
        });

        if (response.data.message) {
          setAlreadyRegistered(true);
          setCoursesData(response.data.data);
          const newPriorities = {};
          response.data.data.forEach((slot) => {
            const slotPriority = {};
            slot.course_choices.forEach((course) => {
              if (course.priority) {
                slotPriority[course.id] = course.priority;
              }
            });
            newPriorities[slot.sno] = slotPriority;
          });
          setPriorities(newPriorities);
        } else {
          setCoursesData(response.data);
        }
      } catch (fetchError) {
        setError(fetchError);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handlePriorityChange = useCallback((slotId, courseId, value) => {
    setPriorities((prev) => ({
      ...prev,
      [slotId]: {
        ...(prev[slotId] || {}),
        [courseId]: value,
      },
    }));
  }, []);

  // New logic: form is complete only if every course select has a non-empty value.
  const isFormComplete = () =>
    coursesData.every((slot) => {
      const slotPriorities = priorities[slot.sno] || {};
      return slot.course_choices.every(
        (course) =>
          slotPriorities[course.id] && slotPriorities[course.id] !== ""
      );
    });

  const handleRegister = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError(new Error("No token found"));
      return;
    }

    const registrations = [];
    coursesData.forEach((slot) => {
      const slotPriorities = priorities[slot.sno] || {};
      slot.course_choices.forEach((course) => {
        registrations.push({
          slot_id: slot.sno,
          course_id: course.id,
          priority: slotPriorities[course.id],
        });
      });
    });

    try {
      const response = await axios.post(
        preCourseRegistrationSubmitRoute,
        { registrations },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        }
      );
      if (response.status === 201 || response.status === 200) {
        setAlertVisible(true);
      } else {
        console.error("Registration failed", response);
      }
    } catch (postError) {
      console.error("Error:", postError);
      setError(postError);
    }
  };

  const rows = [];
  let serialNumber = 1;
  coursesData.forEach((slot) => {
    const slotLength = slot.course_choices.length;
    slot.course_choices.forEach((course, index) => {
      rows.push({
        serial: index === 0 ? serialNumber++ : "",
        isFirst: index === 0,
        slotId: slot.sno,
        slotName: slot.slot_name,
        slotType: slot.slot_type,
        semester: slot.semester,
        slotLength: slotLength,
        course: course,
      });
    });
  });

  if (loading)
    return (
      <Center mt="lg">
        <Loader color="blue" size="xl" variant="bars" />
      </Center>
    );

  if (error)
    return (
      <Text color="red" align="center">
        {error.message}
      </Text>
    );

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Text align="center" size="lg" weight={700} mb="md" color="blue">
        Pre-Registration for Next Semester Courses
      </Text>

      {alreadyRegistered && (
        <Alert color="blue" title="Already Registered" mb="lg">
          You have already completed pre-registration. Your courses with assigned
          priorities are shown below.
        </Alert>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Slot Name</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Course</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Priority</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <CourseRow
              key={index}
              rowData={row}
              onPriorityChange={handlePriorityChange}
              priorityValue={
                priorities[row.slotId]
                  ? priorities[row.slotId][row.course.id]
                  : ""
              }
              slotPriorities={priorities[row.slotId] || {}}
              slotRowSpan={row.slotLength}
              readOnly={alreadyRegistered}
            />
          ))}
        </tbody>
      </table>

      {!alreadyRegistered && (
        <Button
          mt="md"
          style={{ backgroundColor: "#3B82F6", color: "#fff" }}
          onClick={handleRegister}
          disabled={!isFormComplete()}
        >
          Register
        </Button>
      )}

      {alertVisible && (
        <Alert
          mt="lg"
          title="Registration Complete"
          color="green"
          withCloseButton
          onClose={() => setAlertVisible(false)}
        >
          Registration preferences have been submitted.
        </Alert>
      )}
    </Card>
  );
}

export default PreRegistration;
