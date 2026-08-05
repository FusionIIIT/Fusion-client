import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Select,
  MultiSelect,
  SegmentedControl,
  Input,
  Group,
  Loader,
  Text,
  Alert,
} from "@mantine/core";
import {
  IconX,
  IconWorld,
  IconUserCheck,
  IconSchool,
  IconBuilding,
  IconUsers,
} from "@tabler/icons-react";
import axios from "axios";
import {
  announcementAudienceOptionsRoute,
  announcementSearchUsersRoute,
} from "../routes/dashboardRoutes";
import { listBatchesRoute } from "../routes/academicRoutes";

function AudienceLabel({ icon: Icon, label }) {
  return (
    <Group gap={6} wrap="nowrap" justify="center">
      <Icon size={16} />
      <Text size="sm">{label}</Text>
    </Group>
  );
}

AudienceLabel.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
};

export const AUDIENCE_TYPES = [
  { value: "all", plainLabel: "Everyone", icon: IconWorld },
  { value: "role", plainLabel: "Role", icon: IconUserCheck },
  { value: "batch", plainLabel: "Batch", icon: IconSchool },
  { value: "department", plainLabel: "Department", icon: IconBuilding },
  { value: "individual", plainLabel: "Individuals", icon: IconUsers },
].map((item) => ({
  ...item,
  label: <AudienceLabel icon={item.icon} label={item.plainLabel} />,
}));

export function defaultAudienceValue() {
  return {
    audienceType: "all",
    targetRole: null,
    targetDepartment: null,
    targetBatch: null,
    targetUsers: [],
    summaryLabel: "Everyone",
  };
}

function AudienceSelector({ value, onChange, errors, onClearError }) {
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [roleOptions, setRoleOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const userSearchDebounce = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setInitialLoading(true);
    Promise.all([
      axios.get(announcementAudienceOptionsRoute, {
        headers: { Authorization: `Token ${token}` },
      }),
      axios.get(listBatchesRoute, {
        headers: { Authorization: `Token ${token}` },
      }),
    ])
      .then(([optionsRes, batchesRes]) => {
        setRoleOptions(
          (optionsRes.data.roles || []).map((r) => ({
            value: String(r.id),
            label: r.name,
          })),
        );
        setDepartmentOptions(
          (optionsRes.data.departments || []).map((d) => ({
            value: String(d.id),
            label: d.name,
          })),
        );
        setBatchOptions(
          (batchesRes.data || []).map((b) => ({
            value: String(b.id),
            label: b.label,
          })),
        );
      })
      .catch(() => {
        setFetchError("Could not load audience options. Please try again.");
      })
      .finally(() => setInitialLoading(false));
  }, []);

  useEffect(
    () => () => {
      if (userSearchDebounce.current) clearTimeout(userSearchDebounce.current);
    },
    [],
  );

  const handleUserSearch = (query) => {
    if (userSearchDebounce.current) clearTimeout(userSearchDebounce.current);
    if (!query.trim()) return;
    userSearchDebounce.current = setTimeout(() => {
      setSearchingUsers(true);
      const token = localStorage.getItem("authToken");
      axios
        .get(announcementSearchUsersRoute, {
          params: { q: query },
          headers: { Authorization: `Token ${token}` },
        })
        .then(({ data }) => {
          setUserOptions((prev) => {
            const merged = [...prev];
            data.forEach((u) => {
              const optValue = String(u.id);
              if (!merged.some((m) => m.value === optValue)) {
                merged.push({ value: optValue, label: u.label });
              }
            });
            return merged;
          });
        })
        .catch(() => {})
        .finally(() => setSearchingUsers(false));
    }, 400);
  };

  const summaryFor = (audienceType, v) => {
    switch (audienceType) {
      case "all":
        return "Everyone";
      case "role":
        return roleOptions.find((o) => o.value === v.targetRole)?.label ?? "—";
      case "department":
        return (
          departmentOptions.find((o) => o.value === v.targetDepartment)
            ?.label ?? "—"
        );
      case "batch":
        return (
          batchOptions.find((o) => o.value === v.targetBatch)?.label ?? "—"
        );
      case "individual":
        return v.targetUsers.length
          ? v.targetUsers
              .map((id) => userOptions.find((o) => o.value === id)?.label ?? id)
              .join(", ")
          : "—";
      default:
        return "—";
    }
  };

  const emitChange = (patch) => {
    const next = { ...value, ...patch };
    onChange({ ...next, summaryLabel: summaryFor(next.audienceType, next) });
  };

  if (initialLoading)
    return (
      <Group gap="xs">
        <Loader size="xs" />
        <Text size="sm" c="dimmed">
          Loading audience options...
        </Text>
      </Group>
    );

  if (fetchError)
    return (
      <Alert icon={<IconX size={16} />} color="red">
        {fetchError}
      </Alert>
    );

  return (
    <>
      <Input.Wrapper label="Audience" required>
        <SegmentedControl
          fullWidth
          size="md"
          radius="md"
          color="#15ABFF"
          data={AUDIENCE_TYPES}
          value={value.audienceType}
          onChange={(v) => emitChange({ audienceType: v })}
        />
      </Input.Wrapper>

      {value.audienceType === "role" && (
        <Select
          label="Role"
          placeholder="Select a role"
          data={roleOptions}
          value={value.targetRole}
          onChange={(v) => {
            emitChange({ targetRole: v });
            onClearError?.("targetRole");
          }}
          error={errors.targetRole}
          searchable
          required
        />
      )}

      {value.audienceType === "department" && (
        <Select
          label="Department"
          placeholder="Select a department"
          data={departmentOptions}
          value={value.targetDepartment}
          onChange={(v) => {
            emitChange({ targetDepartment: v });
            onClearError?.("targetDepartment");
          }}
          error={errors.targetDepartment}
          searchable
          required
        />
      )}

      {value.audienceType === "batch" && (
        <Select
          label="Batch"
          placeholder="Select a batch"
          data={batchOptions}
          value={value.targetBatch}
          onChange={(v) => {
            emitChange({ targetBatch: v });
            onClearError?.("targetBatch");
          }}
          error={errors.targetBatch}
          searchable
          required
        />
      )}

      {value.audienceType === "individual" && (
        <MultiSelect
          label="Individuals"
          placeholder="Search by name, username or roll no."
          data={userOptions}
          value={value.targetUsers}
          onChange={(v) => {
            emitChange({ targetUsers: v });
            onClearError?.("targetUsers");
          }}
          onSearchChange={handleUserSearch}
          error={errors.targetUsers}
          searchable
          rightSection={searchingUsers ? <Loader size="xs" /> : null}
          nothingFoundMessage="Type to search for users"
          required
        />
      )}
    </>
  );
}

AudienceSelector.propTypes = {
  value: PropTypes.shape({
    audienceType: PropTypes.string.isRequired,
    targetRole: PropTypes.string,
    targetDepartment: PropTypes.string,
    targetBatch: PropTypes.string,
    targetUsers: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    targetRole: PropTypes.string,
    targetDepartment: PropTypes.string,
    targetBatch: PropTypes.string,
    targetUsers: PropTypes.string,
  }),
  onClearError: PropTypes.func,
};

AudienceSelector.defaultProps = {
  errors: {},
  onClearError: undefined,
};

export default AudienceSelector;
