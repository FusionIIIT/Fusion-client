import { Box, Radio, Stack, Table, Textarea } from "@mantine/core";
import PropTypes from "prop-types";

import { courseLabel } from "../../../lib/course";
import SlotCard from "./SlotCard";
import SlotRow from "./SlotRow";

const label = (course) =>
  course.instructor_name
    ? `${courseLabel(course)} (${course.instructor_name})`
    : courseLabel(course);

export default function FeedbackMatrix({
  question,
  courses,
  answers,
  onOption,
  onText,
}) {
  const scaled = question.options.length > 0;
  const answerFor = (course) => answers[question.id][course.course_id];

  return (
    <>
      <Box visibleFrom="sm">
        <Table striped withColumnBorders mt="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th scope="col">Course / Instructor</Table.Th>
              {scaled ? (
                question.options.map((o) => (
                  <Table.Th key={o.id} scope="col">
                    {o.text}
                  </Table.Th>
                ))
              ) : (
                <Table.Th scope="col">Your Feedback</Table.Th>
              )}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {courses.map((course) => (
              <Table.Tr key={course.course_id}>
                <Table.Th scope="row" fw={400}>
                  {label(course)}
                </Table.Th>
                {scaled ? (
                  question.options.map((o) => (
                    <Table.Td key={o.id}>
                      <Radio
                        name={`q${question.id}-c${course.course_id}`}
                        aria-label={`${o.text} for ${label(course)}`}
                        checked={answerFor(course).option_id === o.id}
                        onChange={() =>
                          onOption(question.id, course.course_id, o.id)
                        }
                      />
                    </Table.Td>
                  ))
                ) : (
                  <Table.Td>
                    <Textarea
                      aria-label={`Feedback for ${label(course)}`}
                      value={answerFor(course).text_answer}
                      onChange={(e) =>
                        onText(
                          question.id,
                          course.course_id,
                          e.currentTarget.value,
                        )
                      }
                      placeholder="Optional feedback…"
                      autosize
                      minRows={2}
                    />
                  </Table.Td>
                )}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>

      <Box hiddenFrom="sm" mt="sm">
        {courses.map((course) => (
          <SlotCard key={course.course_id} name={label(course)}>
            {scaled ? (
              <SlotRow
                primary={
                  <Radio.Group
                    value={
                      answerFor(course).option_id
                        ? String(answerFor(course).option_id)
                        : ""
                    }
                    onChange={(next) =>
                      onOption(question.id, course.course_id, Number(next))
                    }
                  >
                    <Stack gap="xs" mt={4}>
                      {question.options.map((o) => (
                        <Radio key={o.id} value={String(o.id)} label={o.text} />
                      ))}
                    </Stack>
                  </Radio.Group>
                }
              />
            ) : (
              <SlotRow
                primary={
                  <Textarea
                    aria-label={`Feedback for ${label(course)}`}
                    value={answerFor(course).text_answer}
                    onChange={(e) =>
                      onText(
                        question.id,
                        course.course_id,
                        e.currentTarget.value,
                      )
                    }
                    placeholder="Optional feedback…"
                    autosize
                    minRows={2}
                  />
                }
              />
            )}
          </SlotCard>
        ))}
      </Box>
    </>
  );
}

FeedbackMatrix.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        text: PropTypes.string.isRequired,
      }),
    ).isRequired,
  }).isRequired,
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      course_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      code: PropTypes.string,
      name: PropTypes.string,
      instructor_name: PropTypes.string,
    }),
  ).isRequired,
  answers: PropTypes.objectOf(
    PropTypes.objectOf(
      PropTypes.shape({
        option_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        text_answer: PropTypes.string,
      }),
    ),
  ).isRequired,
  onOption: PropTypes.func.isRequired,
  onText: PropTypes.func.isRequired,
};
