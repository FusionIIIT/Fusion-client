/* eslint-disable */
import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";

const formatWhen = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString();
  } catch {
    return String(iso);
  }
};

function ForumNode({
  node,
  depth,
  isFaculty,
  currentUserId,
  replyDrafts,
  setReplyDrafts,
  replyOpen,
  setReplyOpen,
  onReply,
  onDelete,
}) {
  const canDelete =
    Boolean(isFaculty) ||
    (node.postedById &&
      String(node.postedById) === String(currentUserId || ""));
  const draft = replyDrafts[node.id] || "";
  const isOpen = Boolean(replyOpen[node.id]);

  return (
    <Box key={node.id} ml={depth ? depth * 16 : 0}>
      <Paper p="sm" withBorder>
        <Group justify="space-between" align="flex-start">
          <Box style={{ flex: 1 }}>
            <Text size="sm" fw={600}>
              {node.message}
            </Text>
            <Text size="xs" c="dimmed">
              Posted by {node.postedBy || "Unknown"}
              {node.createdAt ? ` • ${formatWhen(node.createdAt)}` : ""}
            </Text>
          </Box>

          <Group gap="xs">
            {canDelete && (
              <Button
                size="xs"
                color="red"
                variant="light"
                onClick={() => onDelete?.(node.id)}
              >
                Delete
              </Button>
            )}
            <Button
              size="xs"
              variant="light"
              onClick={() =>
                setReplyOpen((p) => ({ ...p, [node.id]: !Boolean(p[node.id]) }))
              }
            >
              Reply
            </Button>
          </Group>
        </Group>

        {isOpen && (
          <Group align="flex-end" mt="sm">
            <Textarea
              label="Reply"
              placeholder="Write a reply..."
              value={draft}
              onChange={(e) =>
                setReplyDrafts((p) => ({ ...p, [node.id]: e.target.value }))
              }
              autosize
              minRows={1}
              style={{ flex: 1 }}
            />
            <Button
              onClick={() => {
                const msg = String(replyDrafts[node.id] || "").trim();
                if (!msg) return;
                onReply?.({ parent_id: node.id, message: msg });
                setReplyDrafts((p) => ({ ...p, [node.id]: "" }));
                setReplyOpen((p) => ({ ...p, [node.id]: false }));
              }}
            >
              Post
            </Button>
          </Group>
        )}
      </Paper>

      {(node.replies || []).length > 0 && (
        <Stack gap="sm" mt="sm">
          {(node.replies || []).map((child) => (
            <ForumNode
              key={child.id}
              node={child}
              depth={depth + 1}
              isFaculty={isFaculty}
              currentUserId={currentUserId}
              replyDrafts={replyDrafts}
              setReplyDrafts={setReplyDrafts}
              replyOpen={replyOpen}
              setReplyOpen={setReplyOpen}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default function ForumThreadTable({
  courseCode,
  threads = [],
  onReply,
  onDelete,
  isFaculty,
  currentUserId,
}) {
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyOpen, setReplyOpen] = useState({});

  const safeThreads = useMemo(
    () => (Array.isArray(threads) ? threads : []),
    [threads],
  );

  if (!courseCode) {
    return (
      <Box p="md">
        <Text c="dimmed">Select a course to view the forum.</Text>
      </Box>
    );
  }

  return (
    <Box p="md">
      <Text size="xl" mb="md">
        Forum
      </Text>

      <Stack gap="md">
        {safeThreads.map((node) => (
          <ForumNode
            key={node.id}
            node={node}
            depth={0}
            isFaculty={isFaculty}
            currentUserId={currentUserId}
            replyDrafts={replyDrafts}
            setReplyDrafts={setReplyDrafts}
            replyOpen={replyOpen}
            setReplyOpen={setReplyOpen}
            onReply={onReply}
            onDelete={onDelete}
          />
        ))}

        {safeThreads.length === 0 && (
          <Text c="dimmed">No forum posts yet.</Text>
        )}
      </Stack>
    </Box>
  );
}

ForumThreadTable.propTypes = {
  courseCode: PropTypes.string,
  threads: PropTypes.array,
  onReply: PropTypes.func,
  onDelete: PropTypes.func,
  isFaculty: PropTypes.bool,
  currentUserId: PropTypes.string,
};

ForumNode.propTypes = {
  node: PropTypes.object,
  depth: PropTypes.number,
  isFaculty: PropTypes.bool,
  currentUserId: PropTypes.string,
  replyDrafts: PropTypes.object,
  setReplyDrafts: PropTypes.func,
  replyOpen: PropTypes.object,
  setReplyOpen: PropTypes.func,
  onReply: PropTypes.func,
  onDelete: PropTypes.func,
};
