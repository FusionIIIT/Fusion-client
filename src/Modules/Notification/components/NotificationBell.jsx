/**
 * NotificationBell — UC-NT-04: Global Navbar Notification Tray
 *
 * Persistent bell icon for the top navbar. Shows an unread count badge.
 * Clicking opens a dropdown tray with the latest unread notifications.
 * Each item can be marked as read or followed via its deep link.
 * Polls the unread count every 30 seconds.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  Group,
  Indicator,
  Loader,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
  Transition,
} from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchUnreadNotifications, fetchAllNotifications, fetchUnreadCount, markRead, markAllRead, openNotification } from "../api";

const POLL_INTERVAL_MS = 5_000; // 5 s
const TRAY_LIMIT       = 8;      // max items shown in the dropdown

// ── Bell SVG icon (inline, no extra dep) ─────────────────────────────────────
function BellIcon({ size = 20 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

// ── Single notification row inside the tray ───────────────────────────────────
function TrayItem({ notification, onRead, onNavigate }) {
  const timeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handleClick = async () => {
    // Just mark as read in place — don't redirect to a deep-link route that
    // may not exist on the React side. The user stays on whatever page
    // they're on; the tray will reflect the new read state.
    if (notification.unread) {
      await onRead(notification.id);
    }
  };

  return (
    <Box
      px="md"
      py="xs"
      style={{
        cursor: "pointer",
        background: notification.unread ? "var(--mantine-color-blue-0)" : "transparent",
        borderLeft: notification.unread ? "3px solid var(--mantine-color-blue-5)" : "3px solid transparent",
        transition: "background 0.15s",
      }}
      onClick={handleClick}
    >
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={notification.unread ? 600 : 400} lineClamp={2}>
            {notification.verb}
          </Text>
          <Group gap={6}>
            {notification.module && (
              <Badge size="xs" variant="light" color="gray">
                {notification.module}
              </Badge>
            )}
            <Text size="xs" c="dimmed">
              {timeAgo(notification.timestamp)}
            </Text>
          </Group>
        </Stack>
        {notification.unread && (
          <Tooltip label="Mark as read" withArrow>
            <ActionIcon
              size="xs"
              variant="subtle"
              color="blue"
              onClick={(e) => {
                e.stopPropagation();
                onRead(notification.id);
              }}
            >
              ✓
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    </Box>
  );
}

// ── Main Bell component ───────────────────────────────────────────────────────
export default function NotificationBell() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen]               = useState(false);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [allItems, setAllItems]       = useState([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems]             = useState([]);
  const [loading, setLoading]         = useState(false);
  const trayRef                       = useRef(null);

  // Close tray on route change (user navigated away)
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Poll unread count
  const refreshCount = useCallback(async () => {
    try {
      const count = await fetchUnreadCount();
      setUnreadCount(count);
    } catch {
      // silently ignore polling errors
    }
  }, []);

  useEffect(() => {
    refreshCount();
    const id = setInterval(refreshCount, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refreshCount]);

  // Load tray contents when opened
  const loadTray = useCallback(async () => {
    setLoading(true);
    try {
      const { notifications } = await fetchUnreadNotifications();
      setItems((notifications ?? []).slice(0, TRAY_LIMIT));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadTray();
  }, [open, loadTray]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (trayRef.current && !trayRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleRead = async (id) => {
    await markRead(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleNavigate = async (id) => {
    const url = await openNotification(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    return url;
  };

  const handleViewAll = async () => {
    setOpen(false);
    setDrawerOpen(true);
    setDrawerLoading(true);
    try {
      const data = await fetchAllNotifications();
      setAllItems(Array.isArray(data) ? data : (data?.notifications ?? []));
    } catch { setAllItems([]); }
    finally { setDrawerLoading(false); }
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setAllItems((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
  };

  return (
    <Box style={{ position: "relative" }} ref={trayRef}>
      {/* Bell button — BR-NT-02: fixed on global navbar across all module transitions */}
      <Tooltip label="Notifications — NAM Hub (BR-NT-02)" withArrow position="bottom">
        <Indicator
          inline
          label={unreadCount > 99 ? "99+" : unreadCount}
          size={16}
          disabled={unreadCount === 0}
          color="red"
          offset={4}
        >
          <ActionIcon
            variant="subtle"
            color="orange"
            size={40}
            aria-label="Notifications — NAM Hub"
            onClick={() => setOpen((v) => !v)}
          >
            <BellIcon size={28} />
          </ActionIcon>
        </Indicator>
      </Tooltip>

      {/* Dropdown tray — animated */}
      <Transition mounted={open} transition="pop-top-right" duration={150} timingFunction="ease">
        {(styles) => (
        <Paper
          shadow="md"
          withBorder
          style={{
            ...styles,
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 340,
            zIndex: 9999,
          }}
        >
          {/* Header — BR-NT-01: all notifications routed through this NAM tray */}
          <Group px="md" py="sm" justify="space-between">
            <Group gap={6}>
              <Text fw={600} size="sm">Notifications</Text>
              {/* BR-NT-01 */}
              <Badge size="xs" color="blue" variant="dot">NAM</Badge>
            </Group>
            {unreadCount > 0 && (
              <Badge color="red" size="sm">
                {unreadCount} unread
              </Badge>
            )}
          </Group>
          <Divider />

          {/* Body */}
          {loading ? (
            <Group justify="center" py="lg">
              <Loader size="sm" />
            </Group>
          ) : items.length === 0 ? (
            <Text c="dimmed" size="sm" ta="center" py="lg">
              No unread notifications
            </Text>
          ) : (
            <ScrollArea.Autosize mah={360}>
              <Stack gap={0}>
                {items.map((n) => (
                  <TrayItem
                    key={n.id}
                    notification={n}
                    onRead={handleRead}
                    onNavigate={handleNavigate}
                  />
                ))}
              </Stack>
            </ScrollArea.Autosize>
          )}

          <Divider />
          {/* Footer */}
          <Group justify="center" py="xs">
            <Button size="xs" variant="subtle" onClick={handleViewAll}>
              View all notifications
            </Button>
          </Group>
        </Paper>
        )}
      </Transition>

      {/* All Notifications Drawer — stays on current page */}
      <Drawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={
          <Group justify="space-between" w="100%">
            <Text fw={600}>All Notifications</Text>
            {unreadCount > 0 && (
              <Button size="xs" variant="subtle" color="blue" onClick={handleMarkAllRead}>
                Mark all read
              </Button>
            )}
          </Group>
        }
        position="right"
        size="md"
        padding="md"
      >
        {drawerLoading ? (
          <Group justify="center" py="xl"><Loader size="sm" /></Group>
        ) : allItems.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl" size="sm">No notifications</Text>
        ) : (
          <ScrollArea h="calc(100vh - 100px)">
            <Stack gap={0}>
              {allItems.map((n) => (
                <TrayItem
                  key={n.id}
                  notification={n}
                  onRead={async (id) => {
                    await markRead(id);
                    setAllItems((prev) => prev.map((x) => x.id === id ? { ...x, unread: false } : x));
                    setUnreadCount((c) => Math.max(0, c - 1));
                  }}
                  onNavigate={handleNavigate}
                />
              ))}
            </Stack>
          </ScrollArea>
        )}
      </Drawer>
    </Box>
  );
}
