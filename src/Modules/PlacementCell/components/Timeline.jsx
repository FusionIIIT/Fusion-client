import React from 'react';
import { Timeline, Text, Card } from '@mantine/core';
import { Check, X } from '@phosphor-icons/react';

function ApplicationStatusTimeline() {
  return (
    <div style={{ padding: '20px' }}>
      <Card shadow="sm" padding="lg" radius="md" withBorder style={{ width: '500px' }}>
        <Text weight={700} size="xl" mb="md">Application Status</Text>
        
        {/* Wrapped Timeline in Card */}
        <Timeline
          active={2} 
          bulletSize={24}
          lineWidth={2}
          color="green" 
        >
          {/* First Step */}
          <Timeline.Item
            title="Hackerrank Test"
            bullet={<Check size={12} />}
          >
            <Text color="dimmed" size="sm">Completed on Sep 12, 2024</Text>
          </Timeline.Item>

          {/* Second Step */}
          <Timeline.Item
            title="Aptitude Test"
            bullet={<Check size={12} />}
          >
            <Text color="dimmed" size="sm">Completed on Sep 20, 2024</Text>
          </Timeline.Item>

          {/* Third Step (Active Step) */}
          <Timeline.Item
            title="Technical Interview"
            bullet={<Check size={12} />}
          >
            <Text color="dimmed" size="sm">Ongoing</Text>
          </Timeline.Item>

          {/* Fourth Step */}
          <Timeline.Item
            title="Coding Interview"
            bullet={<X size={12} />}
          >
            <Text color="dimmed" size="sm">Scheduled for Oct 10, 2024</Text>
          </Timeline.Item>

          {/* Fifth Step */}
          <Timeline.Item
            title="HR Interview"
            bullet={<X size={12} />}
          >
            <Text color="dimmed" size="sm">Pending</Text>
          </Timeline.Item>

          {/* Final Step */}
          <Timeline.Item
            title="Congrats you got the job!!!"
            bullet={<X size={12} />}
          >
            <Text color="dimmed" size="sm">Pending final confirmation</Text>
          </Timeline.Item>
        </Timeline>
      </Card>
    </div>
  );
}

export default ApplicationStatusTimeline;
