import PropTypes from "prop-types";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import clsx from "clsx";
import {
  Badge,
  Card,
  Container,
  Group,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import CustomBreadcrumbs from "../../../components/Breadcrumbs.jsx";
import { setActiveTab_, setCurrentModule } from "../../../redux/moduleslice";
import classes from "../styles/messModule.module.css";

function MessDashboardShell({
  eyebrow,
  title,
  description,
  badges,
  summaryCards,
  tabs,
  activeTab,
  onTabChange,
  children,
}) {
  const dispatch = useDispatch();
  const activeItem = tabs.find((item) => item.key === activeTab);

  useEffect(() => {
    dispatch(setCurrentModule("Mess Management"));
  }, [dispatch]);

  useEffect(() => {
    if (activeItem?.title) {
      dispatch(setActiveTab_(activeItem.title));
    }
  }, [activeItem?.title, dispatch]);

  return (
    <Container fluid px="lg" pb="xl" className={classes.dashboardPage}>
      <CustomBreadcrumbs />

      <Paper radius="xl" p="xl" shadow="xs" className={classes.dashboardHero}>
        <Stack gap="md">
          {eyebrow ? (
            <Text className={classes.heroEyebrow}>{eyebrow}</Text>
          ) : null}
          <div>
            <Title order={1} className={classes.heroTitle}>
              {title}
            </Title>
            <Text mt="sm" className={classes.heroDescription}>
              {description}
            </Text>
          </div>
          {badges.length > 0 ? (
            <Group gap="sm" className={classes.heroBadges}>
              {badges.map((item) => (
                <Badge
                  key={item.label}
                  size="lg"
                  radius="xl"
                  color={item.color || "blue"}
                  variant={item.variant || "light"}
                >
                  {item.label}
                </Badge>
              ))}
            </Group>
          ) : null}
        </Stack>
      </Paper>

      {summaryCards.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" mt="lg">
          {summaryCards.map((item) => (
            <Card
              key={item.label}
              radius="xl"
              p="lg"
              shadow="xs"
              className={classes.summaryCard}
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <div>
                  <Text className={classes.summaryLabel}>{item.label}</Text>
                  <Text mt={6} className={classes.summaryValue}>
                    {item.value}
                  </Text>
                  {item.description ? (
                    <Text mt="xs" size="sm" className={classes.summaryHelp}>
                      {item.description}
                    </Text>
                  ) : null}
                </div>
                {item.icon ? (
                  <div className={classes.summaryIcon}>{item.icon}</div>
                ) : null}
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      ) : null}

      <Paper radius="xl" p="lg" shadow="xs" className={classes.tabPanel}>
        <ScrollArea offsetScrollbars type="never">
          <Tabs value={activeTab} onChange={onTabChange} variant="unstyled">
            <Tabs.List className={classes.dashboardTabs}>
              {tabs.map((item) => (
                <Tabs.Tab
                  key={item.key}
                  value={item.key}
                  leftSection={item.icon}
                  className={clsx(classes.dashboardTab, {
                    [classes.dashboardTabActive]: activeTab === item.key,
                  })}
                >
                  {item.title}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
        </ScrollArea>

        {activeItem ? (
          <div className={classes.sectionHeading}>
            <Title order={3} className={classes.sectionTitle}>
              {activeItem.title}
            </Title>
            {activeItem.description ? (
              <Text mt="xs" size="sm" className={classes.sectionDescription}>
                {activeItem.description}
              </Text>
            ) : null}
          </div>
        ) : null}
      </Paper>

      <div className={classes.sectionBody}>{children}</div>
    </Container>
  );
}

MessDashboardShell.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  badges: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      color: PropTypes.string,
      variant: PropTypes.string,
    }),
  ),
  summaryCards: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      description: PropTypes.string,
      icon: PropTypes.node,
    }),
  ),
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      icon: PropTypes.node,
    }),
  ).isRequired,
  activeTab: PropTypes.string,
  onTabChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

MessDashboardShell.defaultProps = {
  eyebrow: "",
  badges: [],
  summaryCards: [],
  activeTab: null,
};

export default MessDashboardShell;
