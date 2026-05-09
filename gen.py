import os

base = r'src\Modules\Scholarship\components'
os.makedirs(base, exist_ok=True)

# ProfileSection
content = 'import { Card, Group, Stack, Text, Paper, Button } from "@mantine/core";\nimport { IconRefresh } from "@tabler/icons-react";\n\nexport default function ProfileSection({ profile, onRefresh }) {\n  if (!profile) return <Card><Text>Loading...</Text></Card>;\n  return (\n    <Card withBorder p="lg" radius="md">\n      <Group justify="space-between" mb="md">\n        <Text fw={700} size="lg">Student Profile</Text>\n        <Button variant="light" size="xs" onClick={onRefresh}>Refresh</Button>\n      </Group>\n      <Stack gap="md">\n        <Group grow>\n          <Paper p="xs" withBorder><Text size="sm" c="dimmed">Name</Text><Text fw={600}>{profile.name}</Text></Paper>\n          <Paper p="xs" withBorder><Text size="sm" c="dimmed">Roll</Text><Text fw={600}>{profile.roll_number}</Text></Paper>\n          <Paper p="xs" withBorder><Text size="sm" c="dimmed">Programme</Text><Text fw={600}>{profile.programme}</Text></Paper>\n        </Group>\n      </Stack>\n    </Card>\n  );\n}'
with open(os.path.join(base, 'ProfileSection.jsx'), 'w') as f:
    f.write(content)
print('ProfileSection created')
