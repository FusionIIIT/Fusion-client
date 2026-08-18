import {
  Card,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { ArrowRight } from "@phosphor-icons/react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import { usePendingCounts } from "./usePendingCounts";
import classes from "./PendingWork.module.css";

export default function PendingWork({ reachablePaths }) {
  const navigate = useNavigate();
  const { queues, counts, settled } = usePendingCounts(reachablePaths);

  if (!queues.length) return null;

  const done = new Set(settled);
  const shown = queues.filter(
    (queue) => !done.has(queue.key) || queue.key in counts,
  );
  if (!shown.length) return null;

  // Sort only once every count is in, so cards do not reshuffle while loading.
  const ordered =
    done.size === queues.length
      ? [...shown].sort((a, b) => counts[b.key] - counts[a.key])
      : shown;

  return (
    <Stack gap="xs">
      <Text className={classes.heading}>Needs your action</Text>
      <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="sm">
        {ordered.map((queue) => {
          const loading = !done.has(queue.key);
          const count = counts[queue.key] ?? 0;
          return (
            <UnstyledButton
              key={queue.key}
              onClick={() => navigate(queue.to)}
              className={classes.card}
              data-empty={!loading && count === 0 ? "true" : undefined}
            >
              <Card padding="md" radius="md" withBorder h="100%">
                <Group justify="space-between" wrap="nowrap" align="flex-start">
                  <Text className={classes.label}>{queue.label}</Text>
                  <ArrowRight size={14} className={classes.arrow} />
                </Group>
                {loading ? (
                  <Skeleton height={28} width={48} mt={6} radius="sm" />
                ) : (
                  <Text className={classes.count}>{count}</Text>
                )}
              </Card>
            </UnstyledButton>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}

PendingWork.propTypes = {
  reachablePaths: PropTypes.arrayOf(PropTypes.string).isRequired,
};
