import React from 'react';
import { Card, Text, Badge, Group, Button, Image } from '@mantine/core';
import { Clock, MapPin } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

function PlacementScheduleCard({
  companyLogo,
  companyName,
  location,
  position,
  jobType,
  postedTime,
  deadline,
  description,
  salary,
}) {

  const navigate = useNavigate();

  const handleApplyClick = () => {
    navigate('/placement-cell/apply');
  };

  return (
    <Card shadow="sm" padding="lg" radius="lg" withBorder style={{ maxWidth: 400, position: 'relative' }}>
      {/* Deadline on top right */}
      <Text size="xs" color="dimmed" align="right" style={{ position: 'absolute', top: '10px', right: '10px' }}>
        Deadline: <br /> {deadline}
      </Text>

      {/* Logo and Company Information */}
      <Group align="flex-start">
        <Image
          src={companyLogo}
          alt={`${companyName} logo`}
          width={40}
          height={40}
          fit="contain"
          withPlaceholder
        />
      </Group>
      <Text weight={700} size="lg" mt={10}>{companyName}</Text>
      <Group spacing={5} mt={5}>
        <MapPin size={16} />
        <Text size="sm" color="dimmed">{location}</Text>
      </Group>

      <Text weight={500} size="md" mt="sm">{position}</Text>

      <Group mt="xs" spacing="xs">
        <Badge color="green">{jobType}</Badge>
        <Group spacing={5}>
          <Clock size={16} />
          <Text size="xs" color="dimmed">{postedTime}</Text>
        </Group>
      </Group>

      <Text size="sm" mt="sm" color="dimmed" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {description}
      </Text>

      <Group position="apart" mt="md">
        <Text size="xl" weight={700} color="blue">
          {salary}
        </Text>
        <Button variant="light" color="blue" size="xs" onClick={()=>{handleApplyClick()}}>Apply Now</Button>
      </Group>
    </Card>
  );
}

export default PlacementScheduleCard;
