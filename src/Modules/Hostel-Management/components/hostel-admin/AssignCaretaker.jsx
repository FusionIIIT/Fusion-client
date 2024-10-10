import React, { useRef, useState } from 'react';
import {
    Box,
    Select,
    Text,
    Button,
    Paper,
    Group,
    Stack
} from '@mantine/core';

export default function AssignCaretaker() {
    const [document, setDocument] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setDocument(e.target.files[0]);
            console.log('File attached:', e.target.files[0].name);
        }
    };

    const handleAttachClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Caretaker assigned with document:', document);
    };

    return (
        <Paper
          shadow="md"
          p="md"
          withBorder
          sx={(theme) => ({
            position: 'fixed',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.white,
            border: `1px solid ${theme.colors.gray[3]}`,
            borderRadius: theme.radius.md,
          })}
        >
            <Stack spacing="lg">
                <Text 
                    align="left" 
                    mb="xl" 
                    size="24px" 
                    style={{ color: '#757575', fontWeight: 'bold' }}
                >
                    Assign Caretaker
                </Text>

                <Box>
                    <Text component="label" size="lg" fw={500}>
                        Hall Id:
                    </Text>
                    <Select
                        placeholder="Hall1"
                        data={['Hall1', 'Hall2', 'Hall3']}
                        w="100%"
                        styles={{ root: { marginTop: 5 } }}
                    />
                </Box>

                <Box>
                    <Text component="label" size="lg" fw={500}>
                        Caretaker Username:
                    </Text>
                    <Select
                        placeholder="Caretaker1"
                        data={['Caretaker1', 'Caretaker2', 'Caretaker3']}
                        w="100%"
                        styles={{ root: { marginTop: 5 } }}
                    />
                </Box>

                <Group spacing="xs" align="flex-start">
                    <Text size="md" c="dimmed">
                        Note:
                    </Text>
                    <Text size="md" c="dimmed">
                        To assign a new caretaker to a hostel, you need to have a permission document attached.
                    </Text>
                </Group>

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />

                <Group position="right" spacing="sm">
                    <Button variant="filled" onClick={handleAttachClick}>
                        Attach Document
                    </Button>
                    <Button variant="filled" onClick={handleSubmit}>
                        Assign
                    </Button>
                </Group>
            </Stack>
        </Paper>
    );
}