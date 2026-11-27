import React, { useState, useEffect, useCallback, memo } from "react";
import {
  Card,
  Text,
  Button,
  Alert,
  Loader,
  Center,
  Modal,
} from "@mantine/core";
import axios from "axios";
import PropTypes from "prop-types";
import {
  preCourseRegistrationRoute,
  preCourseRegistrationSubmitRoute,
} from "../../routes/academicRoutes";
import { errorMessage } from "../../lib/errors";
import { courseLabel } from "../../lib/course";
import SlotCard from "./components/SlotCard";
import SlotRow from "./components/SlotRow";
import SlotSelect from "./components/SlotSelect";

const slotMeta = (slot) => `${slot.slot_type} · Semester ${slot.semester}`;

// The server lists only what may be repeated, with its grade and whether the
// repeat is a backlog or an improvement.
const prevRegLabel = (reg) =>
  [
    courseLabel(reg.course_id),
    `Semester ${reg.semester_id?.semester_no ?? "—"}`,
    reg.grade && `Grade ${reg.grade} → ${reg.repeat_as}`,
  ]
    .filter(Boolean)
    .join(" · ");

const REPEAT_RULE =
  "Only your latest attempt at a course, once its result is out, can be repeated: grade F, X or CD as a backlog, or C, D+ or D as an improvement.";

const PriorityRow = memo(
  ({
    slotId,
    course,
    slotLength,
    priorityValue,
    slotPriorities,
    onPriorityChange,
    readOnly,
  }) => {
    const takenByOthers = new Set(
      Object.entries(slotPriorities)
        .filter(([courseId]) => courseId !== String(course.id))
        .map(([, value]) => value),
    );

    const options = Array.from({ length: slotLength }, (_, index) => {
      const value = String(index + 1);
      return { value, label: value, disabled: takenByOthers.has(value) };
    });

    return (
      <SlotRow
        primary={courseLabel(course)}
        secondary={`${course.credits} credits`}
        control={
          readOnly ? (
            <Text size="sm" fw={600}>
              {priorityValue || "Not selected"}
            </Text>
          ) : (
            <SlotSelect
              label={`Priority for ${courseLabel(course)}`}
              placeholder="Select priority"
              value={priorityValue}
              onChange={(value) => onPriorityChange(slotId, course.id, value)}
              options={options}
            />
          )
        }
      />
    );
  },
  (prev, next) =>
    prev.priorityValue === next.priorityValue &&
    prev.course === next.course &&
    prev.slotLength === next.slotLength &&
    prev.readOnly === next.readOnly &&
    JSON.stringify(prev.slotPriorities) === JSON.stringify(next.slotPriorities),
);

const courseShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  code: PropTypes.string,
  name: PropTypes.string,
  credits: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
});

PriorityRow.propTypes = {
  slotId: PropTypes.number.isRequired,
  course: courseShape.isRequired,
  slotLength: PropTypes.number.isRequired,
  priorityValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  slotPriorities: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ).isRequired,
  onPriorityChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};

function BacklogCourseRow({
  slot,
  selectedCourseId,
  selectedPrevRegId,
  onSelectCourse,
  onSelectPrevReg,
  usedCourseIds,
  usedPrevRegIds,
  readOnly = false,
}) {
  const selectedCourse = slot.course_choices.find(
    (c) => c.id.toString() === selectedCourseId,
  );
  const selectedPrevReg = slot.prev_registrations.find(
    (r) => r.id.toString() === selectedPrevRegId,
  );

  return (
    <SlotCard name={slot.slot_name}>
      <SlotRow
        primary="Course"
        secondary={readOnly && !selectedCourse ? "Not selected" : null}
        control={
          readOnly ? (
            <Text size="sm">
              {selectedCourse ? courseLabel(selectedCourse) : "—"}
            </Text>
          ) : (
            <SlotSelect
              label={`Backlog course for ${slot.slot_name}`}
              placeholder="Select course"
              value={selectedCourseId}
              onChange={(value) => onSelectCourse(slot.sno, value)}
              options={slot.course_choices.map((course) => ({
                value: String(course.id),
                label: courseLabel(course),
                disabled: usedCourseIds.includes(course.id.toString()),
              }))}
            />
          )
        }
      />
      <SlotRow
        primary="Previous registration"
        control={
          readOnly ? (
            <Text size="sm">
              {selectedPrevReg ? prevRegLabel(selectedPrevReg) : "Not selected"}
            </Text>
          ) : (
            <SlotSelect
              label={`Previous registration for ${slot.slot_name}`}
              placeholder="Select previous registration"
              value={selectedPrevRegId}
              onChange={(value) => onSelectPrevReg(slot.sno, value)}
              options={slot.prev_registrations.map((reg) => ({
                value: String(reg.id),
                label: prevRegLabel(reg),
                disabled: usedPrevRegIds.includes(reg.id.toString()),
              }))}
            />
          )
        }
      />
    </SlotCard>
  );
}

BacklogCourseRow.propTypes = {
  slot: PropTypes.shape({
    sno: PropTypes.number.isRequired,
    slot_name: PropTypes.string.isRequired,
    course_choices: PropTypes.arrayOf(courseShape).isRequired,
    prev_registrations: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        grade: PropTypes.string,
        repeat_as: PropTypes.string,
      }),
    ).isRequired,
  }).isRequired,
  selectedCourseId: PropTypes.string.isRequired,
  selectedPrevRegId: PropTypes.string.isRequired,
  onSelectCourse: PropTypes.func.isRequired,
  onSelectPrevReg: PropTypes.func.isRequired,
  usedCourseIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  usedPrevRegIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  readOnly: PropTypes.bool,
};

function PreRegistration() {
  const [coursesData, setCoursesData] = useState([]);
  const [backlogSlots, setBacklogSlots] = useState([]);
  const [backlogSelections, setBacklogSelections] = useState({});
  const [priorities, setPriorities] = useState({});
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [backlogSlotsReg, setBacklogSlotsReg] = useState([]);

  const fetchCourses = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError(new Error("No token found"));
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(preCourseRegistrationRoute, {
        headers: { Authorization: `Token ${token}` },
      });

      if (response.data.message) {
        setAlreadyRegistered(true);
        setCoursesData(
          response.data.data.filter((slot) => !slot.slot_name.startsWith("BL")),
        );
        setBacklogSlotsReg(response.data.backlog_data);
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
        setCoursesData(
          response.data.filter((slot) => slot.slot_type !== "Backlog"),
        );
        setBacklogSlots(
          response.data.filter((slot) => slot.slot_type === "Backlog"),
        );
      }
    } catch (fetchError) {
      setError(fetchError?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const handleBacklogCourseChange = (slotId, courseId) => {
    setBacklogSelections((prev) => ({
      ...prev,
      [slotId]: {
        ...prev[slotId],
        courseId,
      },
    }));
  };

  const handleBacklogPrevRegChange = (slotId, prevRegistrationId) => {
    setBacklogSelections((prev) => ({
      ...prev,
      [slotId]: {
        ...prev[slotId],
        prevRegistrationId,
      },
    }));
  };

  const isFormComplete = () => {
    const allCoursesValid = coursesData.every((slot) => {
      if (slot.slot_type === "Optional") return true;
      const slotPriorities = priorities[slot.sno] || {};
      return slot.course_choices.every(
        (course) =>
          slotPriorities[course.id] && slotPriorities[course.id] !== "",
      );
    });

    const allBacklogsValid = backlogSlots.every((slot) => {
      const backlog = backlogSelections[slot.sno] || {};
      const courseSelected = !!backlog.courseId;
      const prevSelected = !!backlog.prevRegistrationId;
      return !courseSelected || (courseSelected && prevSelected);
    });

    return allCoursesValid && allBacklogsValid;
  };

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
        const priority = slotPriorities[course.id];
        // Skip optional courses that were not selected
        if (slot.slot_type === "Optional" && (!priority || priority === ""))
          return;
        registrations.push({
          slot_id: slot.sno,
          course_id: course.id,
          priority,
        });
      });
    });

    const backlogRegistrations = Object.entries(backlogSelections)
      .filter(
        ([, { courseId, prevRegistrationId }]) =>
          courseId && prevRegistrationId,
      )
      .map(([slotId, { courseId, prevRegistrationId }]) => ({
        slot_id: parseInt(slotId, 10),
        course_id: parseInt(courseId, 10),
        prev_registration_id: parseInt(prevRegistrationId, 10),
        priority: 1,
      }));

    try {
      const response = await axios.post(
        preCourseRegistrationSubmitRoute,
        {
          registrations,
          backlog_registrations: backlogRegistrations,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        },
      );
      if (response.status === 200 || response.status === 201) {
        fetchCourses();
        setAlertVisible(true);
      }
    } catch (postError) {
      console.error("Error:", postError);
      setError(postError);
    }
  };

  const usedCourseIds = Object.values(backlogSelections)
    .map((s) => s.courseId)
    .filter(Boolean);
  const usedPrevRegIds = Object.values(backlogSelections)
    .map((s) => s.prevRegistrationId)
    .filter(Boolean);
  // Every backlog slot carries the same list of registrations to repeat.
  const nothingToRepeat = backlogSlots.every(
    (slot) => !slot.prev_registrations?.length,
  );

  if (loading)
    return (
      <Center mt="lg">
        <Loader color="blue" size="xl" variant="bars" />
      </Center>
    );

  if (error)
    return (
      <Alert color="yellow" title="Message" mb="lg">
        {errorMessage(error)}
      </Alert>
    );

  return (
    <>
      <Card shadow="sm" p="lg" radius="md" withBorder>
        {alreadyRegistered && (
          <Alert color="blue" title="Already Registered" mb="lg">
            You have already completed pre-registration. Your courses with
            assigned priorities are shown below.
          </Alert>
        )}

        {coursesData.map((slot) => (
          <SlotCard key={slot.sno} name={slot.slot_name} meta={slotMeta(slot)}>
            {slot.course_choices.map((course) => (
              <PriorityRow
                key={course.id}
                slotId={slot.sno}
                course={course}
                slotLength={slot.course_choices.length}
                priorityValue={priorities[slot.sno]?.[course.id] || ""}
                slotPriorities={priorities[slot.sno] || {}}
                onPriorityChange={handlePriorityChange}
                readOnly={alreadyRegistered}
              />
            ))}
          </SlotCard>
        ))}

        {alreadyRegistered && backlogSlotsReg.length > 0 && (
          <>
            <Text fw={700} mt="lg" mb="sm">
              Backlog Registrations
            </Text>
            {backlogSlotsReg.map((slot) => {
              const course = slot.course_choices?.[0];
              const prev = slot.prev_registration;

              return (
                <SlotCard key={`backlog-${slot.sno}`} name={slot.slot_name}>
                  <SlotRow
                    primary={course ? courseLabel(course) : "Not selected"}
                    secondary="Course"
                  />
                  <SlotRow
                    primary={
                      prev?.code
                        ? `${courseLabel(prev)} · Semester ${prev.semester_no}`
                        : "N/A"
                    }
                    secondary="Previous registration"
                  />
                </SlotCard>
              );
            })}
          </>
        )}

        {!alreadyRegistered && backlogSlots.length > 0 && (
          <>
            <Text mt="xl" size="lg" fw={600} c="blue">
              Backlog Course Registration
            </Text>
            <Text size="sm" c="dimmed" mb="sm">
              {nothingToRepeat
                ? `You have no course to repeat. ${REPEAT_RULE}`
                : REPEAT_RULE}
            </Text>
            <div>
              {!nothingToRepeat &&
                backlogSlots.map((slot) => (
                  <BacklogCourseRow
                    key={slot.sno}
                    slot={slot}
                    selectedCourseId={
                      backlogSelections[slot.sno]?.courseId || ""
                    }
                    selectedPrevRegId={
                      backlogSelections[slot.sno]?.prevRegistrationId || ""
                    }
                    onSelectCourse={handleBacklogCourseChange}
                    onSelectPrevReg={handleBacklogPrevRegChange}
                    usedCourseIds={usedCourseIds}
                    usedPrevRegIds={usedPrevRegIds}
                    readOnly={alreadyRegistered}
                  />
                ))}
            </div>
          </>
        )}

        {!alreadyRegistered && (
          <Button
            mt="lg"
            fullWidth
            onClick={() => setConfirmModalOpen(true)}
            disabled={!isFormComplete() || loading}
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

      <Modal
        opened={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Registration"
        size="xl"
      >
        <Text fw={600} mb="sm">
          Please review your selections before confirming:
        </Text>
        {coursesData.map((slot) => (
          <SlotCard key={slot.sno} name={slot.slot_name} meta={slotMeta(slot)}>
            {slot.course_choices.map((course) => (
              <SlotRow
                key={course.id}
                primary={courseLabel(course)}
                control={
                  <Text size="sm" fw={600}>
                    {priorities[slot.sno]?.[course.id] || "Not selected"}
                  </Text>
                }
              />
            ))}
          </SlotCard>
        ))}

        {backlogSlots.length > 0 && (
          <>
            <Text fw={700} mt="lg" mb="sm">
              Backlog Registrations
            </Text>
            {backlogSlots.map((slot) => {
              const selection = backlogSelections[slot.sno];
              const selectedCourse = slot.course_choices.find(
                (c) => c.id.toString() === selection?.courseId,
              );
              const selectedPrev = slot.prev_registrations.find(
                (r) => r.id.toString() === selection?.prevRegistrationId,
              );

              return (
                <SlotCard key={`backlog-${slot.sno}`} name={slot.slot_name}>
                  <SlotRow
                    primary={
                      selectedCourse
                        ? courseLabel(selectedCourse)
                        : "Not selected"
                    }
                    secondary="Course"
                  />
                  <SlotRow
                    primary={
                      selectedPrev ? prevRegLabel(selectedPrev) : "Not selected"
                    }
                    secondary="Previous registration"
                  />
                </SlotCard>
              );
            })}
          </>
        )}

        <Button
          mt="md"
          fullWidth
          onClick={() => {
            setConfirmModalOpen(false);
            handleRegister();
          }}
          color="blue"
        >
          Confirm and Submit
        </Button>
      </Modal>
    </>
  );
}

export default PreRegistration;
