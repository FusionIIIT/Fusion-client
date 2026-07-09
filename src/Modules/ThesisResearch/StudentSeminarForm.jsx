import React, { useState } from 'react';
import {
  Card, TextInput, Textarea, FileInput, NumberInput,
  Table, Button, Title, Space
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import axios from 'axios';
import { studentSeminarCreateRoute } from '../../routes/academicRoutes';

const CATS = ['Journal', 'Conference', 'Submitted'];

export default function StudentSeminarForm({ thesisId }) {
  const [form, setForm] = useState({
    date: '', time: '', venue: '',
    prev: '', curr: '', future: '',
    publications: CATS.map(c => ({
      category: c, submitted: 0, accepted: 0, published: 0
    })),
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const changePub = (i, field, value) => {
    const pubs = [...form.publications];
    pubs[i][field] = value;
    setForm(prev => ({ ...prev, publications: pubs }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const data = new FormData();
    ['date', 'time', 'venue', 'prev', 'curr', 'future'].forEach(f =>
      data.append(f, form[f] || '')
    );
    if (file) data.append('doc', file);
    data.append('publications', JSON.stringify(form.publications));

    try {
      const token = localStorage.getItem('authToken');
      const config = {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      const res = await axios.post(studentSeminarCreateRoute(thesisId), data, config);

      showNotification({
        title: 'Success',
        message: res.data.message || 'Seminar submitted successfully.',
        color: 'green',
      });

      setSubmitted(true);
    } catch (e) {
      const message = e.response?.data?.error || e.message || 'Submission failed';
      showNotification({
        title: 'Error',
        message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card shadow="sm" padding="lg">
      <Title order={3}>New Seminar</Title>
      <Space h="md" />
      <TextInput label="Date" type="date" value={form.date}
        onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
        disabled={submitted} />
      <TextInput label="Time" type="time" value={form.time}
        onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
        disabled={submitted} />
      <TextInput label="Venue" value={form.venue}
        onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
        disabled={submitted} />
      <Textarea label="Work till prev sem" value={form.prev}
        onChange={e => setForm(f => ({ ...f, prev: e.target.value }))}
        disabled={submitted} />
      <Textarea label="Curr contribution" value={form.curr}
        onChange={e => setForm(f => ({ ...f, curr: e.target.value }))}
        disabled={submitted} />
      <Textarea label="Future plan" value={form.future}
        onChange={e => setForm(f => ({ ...f, future: e.target.value }))}
        disabled={submitted} />
      <FileInput label="Supporting PDF" value={file}
        onChange={setFile} disabled={submitted} />
      <Space h="md" />

      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Category</th>
            <th>Submitted</th>
            <th>Accepted</th>
            <th>Published</th>
          </tr>
        </thead>
        <tbody>
          {form.publications.map((p, i) => (
            <tr key={p.category}>
              <td>{p.category}</td>
              <td>
                <NumberInput
                  min={0}
                  value={p.submitted}
                  onChange={v => changePub(i, 'submitted', v)}
                  disabled={submitted}
                />
              </td>
              <td>
                <NumberInput
                  min={0}
                  value={p.accepted}
                  onChange={v => changePub(i, 'accepted', v)}
                  disabled={submitted}
                />
              </td>
              <td>
                <NumberInput
                  min={0}
                  value={p.published}
                  onChange={v => changePub(i, 'published', v)}
                  disabled={submitted}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Space h="md" />
      <Button fullWidth onClick={handleSubmit} loading={loading} disabled={submitted}>
        Submit Seminar
      </Button>
    </Card>
  );
}
