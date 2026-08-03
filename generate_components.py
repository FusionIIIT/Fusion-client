import os

components = [
    "CourseListTable", "CourseDashboard", "DocumentsTable", "DocumentUploadForm",
    "AssignmentTable", "AddAssignmentForm", "AssignmentUploadForm", "GradeSubmissionForm",
    "ForumThreadTable", "ForumQuestionForm", "ForumReplyModal", "ForumWorkspace",
    "QuizListTable", "QuizCreateForm", "QuizAttemptView", "QuizWorkspace",
    "AttendanceForm", "AttendanceRecordsTable", "QuestionBankTable", "CreateBankForm",
    "TopicTable", "AddQuestionForm", "GradingSchemeTable", "AddGradingSchemeForm",
    "StudentEvaluationTable", "StudentGradesTable", "ModuleList"
]

base_dir = "/mnt/c/Users/indra/Desktop/Fusion/Fusion-client/src/Modules/online_cms/components/"
os.makedirs(base_dir, exist_ok=True)

for comp in components:
    is_table = "Table" in comp or comp in ["ModuleList"]
    
    code = f"""import React from 'react';
import PropTypes from 'prop-types';
import {{ Box, Button, TextInput, Text, Group, Paper }} from '@mantine/core';
import {{ DatePickerInput }} from '@mantine/dates';
import {{ MantineReactTable }} from 'mantine-react-table';

export default function {comp}({{ data = [], onSubmit }}) {{
"""

    if is_table:
        code += f"""  const columns = React.useMemo(() => [
    {{ accessorKey: 'id', header: 'ID' }},
    {{ accessorKey: 'name', header: 'Name' }},
  ], []);

  return (
    <Box p="md">
      <Text size="xl" mb="md">{comp}</Text>
      <MantineReactTable columns={{columns}} data={{data}} />
    </Box>
  );
}}

{comp}.propTypes = {{
  data: PropTypes.array,
  onSubmit: PropTypes.func,
}};
"""
    else:
        code += f"""  return (
    <Paper p="md" shadow="xs">
      <Text size="xl" mb="md">{comp}</Text>
      <form onSubmit={{(e) => {{ e.preventDefault(); if(onSubmit) onSubmit(); }}}}>
        <TextInput label="Name" placeholder="Enter name" mb="sm" required />
        <TextInput label="Description" placeholder="Enter description" mb="sm" />
        <DatePickerInput label="Date" placeholder="Select date" mb="sm" />
        <Group mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Paper>
  );
}}

{comp}.propTypes = {{
  data: PropTypes.array,
  onSubmit: PropTypes.func,
}};
"""

    with open(os.path.join(base_dir, f"{comp}.jsx"), "w") as f:
        f.write(code)

print("Generated successfully!")
