import { useState, useRef } from 'react';
import {
    TextInput,
    NumberInput,
    Select,
    Button,
    Stack,
    Text,
    Box,
    Paper,
    Group
} from '@mantine/core';
import React from 'react';

export default function AddHostel() {
    const [formData, setFormData] = useState({
        hallId: '',
        hallName: '',
        maxAccommodation: null,
        assignedBatch: '',
        typeOfSeater: '',
        document: null,
    });

    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, document: e.target.files[0] });
            console.log('File attached:', e.target.files[0].name);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    const handleAttachClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
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
                    Add Hostel
                </Text>

                <Box>
                    <Text component="label" size="lg" fw={500}>
                        Hall Id:
                    </Text>
                    <TextInput
                        placeholder="Hall1"
                        value={formData.hallId}
                        onChange={(e) => setFormData({ ...formData, hallId: e.target.value })}
                        styles={{ root: { marginTop: 5 } }}
                    />
                </Box>

                <Box>
                    <Text component="label" size="lg" fw={500}>
                        Hall Name:
                    </Text>
                    <TextInput
                        placeholder="Vashishtha"
                        value={formData.hallName}
                        onChange={(e) => setFormData({ ...formData, hallName: e.target.value })}
                        styles={{ root: { marginTop: 5 } }}
                    />
                </Box>

                <Box>
                    <Text component="label" size="lg" fw={500}>
                        Max_Accommodation:
                    </Text>
                    <NumberInput
                        placeholder="500"
                        value={formData.maxAccommodation}
                        onChange={(value) => setFormData({ ...formData, maxAccommodation: value || null })}
                        styles={{ root: { marginTop: 5 } }}
                        hideControls={false}
                    />
                </Box>

                <Box>
                    <Text component="label" size="lg" fw={500}>
                        Assigned Batch
                    </Text>
                    <TextInput
                        placeholder="2021"
                        value={formData.assignedBatch}
                        onChange={(e) => setFormData({ ...formData, assignedBatch: e.target.value })}
                        styles={{ root: { marginTop: 5 } }}
                    />
                </Box>

                <Box>
                    <Text component="label" size="lg" fw={500}>
                        Type of Seater
                    </Text>
                    <Select
                        placeholder="single seater"
                        value={formData.typeOfSeater}
                        onChange={(value) => setFormData({ ...formData, typeOfSeater: value || '' })}
                        data={[
                            { value: 'single', label: 'Single Seater' },
                            { value: 'double', label: 'Double Seater' },
                            { value: 'triple', label: 'Triple Seater' }
                        ]}
                        styles={{ root: { marginTop: 5 } }}
                    />
                </Box>

                <Group spacing="xs" align="flex-start">
                    <Text size="md" c="dimmed">
                        Note:
                    </Text>
                    <Text size="md" c="dimmed">
                        To add a new hostel you need to have a permission document attached.
                    </Text>
                </Group>

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />

                <Group position="right" spacing="sm">
                    <Button variant="filled" color="blue" onClick={handleAttachClick}>
                        Attach Document
                    </Button>
                    <Button variant="filled" color="blue" onClick={handleSubmit}>
                        Add
                    </Button>
                </Group>
            </Stack>
        </Paper>
    );
}