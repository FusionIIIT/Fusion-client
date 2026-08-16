import { useEffect, useMemo, useState } from "react";
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
import axios from "axios";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import { queuesFor } from "./pendingQueues";
import classes from "./PendingWork.module.css";

export default function PendingWork({ reachablePaths }) {
  const navigate = useNavigate();
  const queues = useMemo(() => queuesFor(reachablePaths), [reachablePaths]);
  const [state, setState] = useState({ loading: true, counts: {} });

  useEffect(() => {
    if (!queues.length) {
      setState({ loading: false, counts: {} });
      return undefined;
    }
    let live = true;
    const token = localStorage.getItem("authToken");
    const headers = { Authorization: `Token ${token}` };

    Promise.allSettled(
      queues.map((queue) =>
        axios
          .get(queue.url, { params: queue.params, headers })
          .then(({ data }) => [queue.key, queue.count(data)]),
      ),
    ).then((results) => {
      if (!live) return;
      // A queue that fails is left out rather than shown as a wrong number.
      const counts = Object.fromEntries(
        results.filter((r) => r.status === "fulfilled").map((r) => r.value),
      );
      setState({ loading: false, counts });
    });

    return () => {
      live = false;
    };
  }, [queues]);

  if (!queues.length) return null;

  const shown = state.loading
    ? queues
    : queues.filter((queue) => queue.key in state.counts);
  if (!shown.length) return null;

  const ordered = [...shown].sort(
    (a, b) => (state.counts[b.key] ?? 0) - (state.counts[a.key] ?? 0),
  );

  return (
    <Stack gap="xs">
      <Text className={classes.heading}>Needs your action</Text>
      <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="sm">
        {ordered.map((queue) => {
          const count = state.counts[queue.key] ?? 0;
          return (
            <UnstyledButton
              key={queue.key}
              onClick={() => navigate(queue.to)}
              className={classes.card}
              data-empty={!state.loading && count === 0 ? "true" : undefined}
            >
              <Card padding="md" radius="md" withBorder h="100%">
                <Group justify="space-between" wrap="nowrap" align="flex-start">
                  <Text className={classes.label}>{queue.label}</Text>
                  <ArrowRight size={14} className={classes.arrow} />
                </Group>
                {state.loading ? (
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
