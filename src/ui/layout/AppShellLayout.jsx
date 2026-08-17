import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Burger,
  Button,
  Group,
  Indicator,
  NavLink,
  ScrollArea,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Bell, MagnifyingGlass, SignOut } from "@phosphor-icons/react";

import logoDesktop from "../../assets/iiitdmj_logo.png";
import logoMobile from "../../assets/IIITJ_logo.webp";
import { resolveIcon } from "../icons";
import {
  findActiveGroupCode,
  findActiveLink,
  flattenNavLinks,
} from "../nav/match";
import { BottomNav } from "./BottomNav";
import classes from "./AppShellLayout.module.css";

const BOTTOM_NAV_HEIGHT = 58;

const today = () =>
  new Date()
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();

const HONORIFIC = /^(mr|mrs|ms|dr|prof|shri|smt)\.?$/i;

function initials(name) {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const named = words.filter((w) => !HONORIFIC.test(w));
  return (
    (named.length ? named : words)
      .slice(0, 2)
      .map((w) => w[0] ?? "")
      .join("")
      .toUpperCase() || "?"
  );
}

export function AppShellLayout({
  navGroups,
  activePath,
  onNavigate,
  brandSubtitle,
  user,
  onLogout,
  roles = [],
  role = null,
  onRoleChange = () => {},
  unreadCount = 0,
  onBellClick = () => {},
  bottomNavItems = [],
  children,
}) {
  const [opened, { toggle }] = useDisclosure();
  const [query, setQuery] = useState("");
  const activeGroup = findActiveGroupCode(navGroups, activePath);
  const [openGroup, setOpenGroup] = useState(activeGroup);
  const isNarrow = useMediaQuery("(max-width: 767px)");
  const showBottomNav = Boolean(isNarrow && bottomNavItems.length);

  useEffect(() => {
    if (activeGroup) setOpenGroup(activeGroup);
  }, [activeGroup]);

  const allLinks = useMemo(() => flattenNavLinks(navGroups), [navGroups]);
  const activeTo = useMemo(
    () => findActiveLink(navGroups, activePath)?.to ?? null,
    [navGroups, activePath],
  );

  const results = query.trim()
    ? allLinks.filter((l) =>
        l.label.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : null;

  const go = (to) => {
    onNavigate(to);
    setQuery("");
    if (opened) toggle();
  };

  const renderItem = (item) => {
    const Icon = resolveIcon(item.icon);
    if (item.links) {
      return (
        <NavLink
          key={item.code}
          classNames={{ root: classes.navLink }}
          label={item.label}
          leftSection={<Icon size={16} />}
          opened={openGroup === item.code}
          onClick={() =>
            setOpenGroup((cur) => (cur === item.code ? null : item.code))
          }
          childrenOffset={20}
        >
          {item.links.map((link) => {
            const LinkIcon = resolveIcon(link.icon);
            return (
              <NavLink
                key={link.code}
                classNames={{ root: classes.navLink }}
                label={link.label}
                leftSection={<LinkIcon size={13} />}
                active={activeTo === link.to}
                onClick={() => go(link.to)}
              />
            );
          })}
        </NavLink>
      );
    }
    return (
      <NavLink
        key={item.code}
        classNames={{ root: classes.navLink }}
        label={item.label}
        leftSection={<Icon size={16} />}
        active={activeTo === item.to}
        onClick={() => item.to && go(item.to)}
      />
    );
  };

  return (
    <AppShell
      header={{ height: 66 }}
      navbar={{ width: 280, breakpoint: "sm", collapsed: { mobile: !opened } }}
      footer={{ height: BOTTOM_NAV_HEIGHT, collapsed: !showBottomNav }}
      padding={{ base: "sm", sm: "lg" }}
    >
      <AppShell.Header className={classes.header}>
        <Group
          h="100%"
          justify="space-between"
          wrap="nowrap"
          className={classes.headerInner}
        >
          <Group gap="sm" wrap="nowrap" className={classes.headerLeft}>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Box
              component="img"
              src={logoMobile}
              alt="PDPM IIITDM Jabalpur"
              h={32}
              hiddenFrom="sm"
            />
            <Box
              component="img"
              src={logoDesktop}
              alt="PDPM IIITDM Jabalpur"
              h={40}
              visibleFrom="sm"
            />
            <Box className={classes.brand} visibleFrom="md">
              <Text fw={900} size="sm" lts={1} c="#0b1220">
                PDPM IIITDM <span style={{ color: "#15abff" }}>JABALPUR</span>
              </Text>
              <Text
                size="xs"
                c="dimmed"
                fw={800}
                style={{ fontFamily: "monospace", letterSpacing: 2 }}
              >
                {brandSubtitle}
              </Text>
            </Box>
          </Group>
          <Group gap="sm" wrap="nowrap" className={classes.headerRight}>
            <Text
              size="xs"
              c="dimmed"
              fw={800}
              visibleFrom="lg"
              style={{ fontFamily: "monospace" }}
            >
              {today()}
            </Text>
            <Indicator
              label={unreadCount > 99 ? "99+" : unreadCount}
              size={16}
              color="red"
              disabled={!unreadCount}
            >
              <ActionIcon
                variant="subtle"
                className={classes.bell}
                onClick={onBellClick}
                aria-label="Notifications"
              >
                <Bell size={18} />
              </ActionIcon>
            </Indicator>
            <Button
              variant="light"
              color="red"
              size="xs"
              leftSection={<SignOut size={14} />}
              onClick={onLogout}
              visibleFrom="sm"
            >
              Logout
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className={classes.navbar} p={0}>
        <Box p="md" pb={4}>
          <TextInput
            className={classes.search}
            placeholder="Search"
            size="xs"
            leftSection={<MagnifyingGlass size={13} />}
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
        </Box>

        <ScrollArea className={classes.scroll} type="auto" scrollbarSize={6}>
          {results ? (
            results.length ? (
              results.map((link) => {
                const Icon = resolveIcon(link.icon);
                return (
                  <NavLink
                    key={`${link.parent}-${link.code}`}
                    classNames={{ root: classes.navLink }}
                    label={link.label}
                    description={link.parent}
                    leftSection={<Icon size={13} />}
                    active={activeTo === link.to}
                    onClick={() => go(link.to)}
                  />
                );
              })
            ) : (
              <Text c="dimmed" size="sm" ta="center" mt="lg">
                No matches
              </Text>
            )
          ) : (
            navGroups.map((group) => (
              <Box key={group.section}>
                <Text className={classes.sectionLabel}>{group.section}</Text>
                {group.items.map(renderItem)}
              </Box>
            ))
          )}
        </ScrollArea>

        <Box className={classes.footer}>
          <UnstyledButton
            className={classes.footerAvatar}
            onClick={() => go("/profile")}
            aria-label="Open my profile"
          >
            <Avatar color="blue" radius="md" size={38} variant="filled">
              {initials(user.name)}
            </Avatar>
          </UnstyledButton>
          <div style={{ flex: 1, minWidth: 0 }}>
            <UnstyledButton
              className={classes.footerNameButton}
              onClick={() => go("/profile")}
            >
              <Text className={classes.footerName} truncate>
                {user.name}
              </Text>
            </UnstyledButton>
            {roles.length > 1 ? (
              <select
                className={classes.footerRoleSelect}
                aria-label="Switch role"
                value={role ?? ""}
                onChange={(event) => onRoleChange(event.currentTarget.value)}
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            ) : (
              <Text className={classes.footerRole} truncate>
                {user.roleLabel}
              </Text>
            )}
          </div>
          <Tooltip label="Log out" position="top" withArrow>
            <ActionIcon
              variant="subtle"
              className={classes.footerLogout}
              onClick={onLogout}
              aria-label="Log out"
            >
              <SignOut size={16} />
            </ActionIcon>
          </Tooltip>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main bg="gray.0">{children}</AppShell.Main>

      {showBottomNav && (
        <AppShell.Footer withBorder={false}>
          <BottomNav
            items={bottomNavItems}
            activeTo={activeTo}
            onNavigate={go}
            onMore={toggle}
            moreActive={opened}
          />
        </AppShell.Footer>
      )}
    </AppShell>
  );
}

const linkShape = PropTypes.shape({
  code: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.string,
  to: PropTypes.string.isRequired,
});

AppShellLayout.propTypes = {
  navGroups: PropTypes.arrayOf(
    PropTypes.shape({
      section: PropTypes.string.isRequired,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          code: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          icon: PropTypes.string,
          to: PropTypes.string,
          links: PropTypes.arrayOf(linkShape),
        }),
      ).isRequired,
    }),
  ).isRequired,
  activePath: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  brandSubtitle: PropTypes.string.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    roleLabel: PropTypes.string,
  }).isRequired,
  onLogout: PropTypes.func.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
  role: PropTypes.string,
  onRoleChange: PropTypes.func,
  unreadCount: PropTypes.number,
  onBellClick: PropTypes.func,
  bottomNavItems: PropTypes.arrayOf(linkShape),
  children: PropTypes.node.isRequired,
};
