import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Table, Text, Button, Flex, Divider, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useFormState } from "../utils/formHelpers";
import { updateProfileSection } from "../services/profileService";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ALT_DATE_PATTERN = /^(\d{2})-(\d{2})-(\d{4})$/;

const normalizeDateForApi = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (DATE_PATTERN.test(raw)) return raw;

  const altMatch = raw.match(ALT_DATE_PATTERN);
  if (altMatch) {
    const [, dd, mm, yyyy] = altMatch;
    return `${yyyy}-${mm}-${dd}`;
  }

  return "";
};

const normalizeDateForInput = (value) => normalizeDateForApi(value);

const calculateAgeFromDob = (value) => {
  const normalizedDob = normalizeDateForApi(value);
  if (!normalizedDob) return "-";

  const birthDate = new Date(`${normalizedDob}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return "-";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : "-";
};

const formatApiError = (error) => {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  if (data?.error) return data.error;
  if (data && typeof data === "object") {
    const firstFieldError = Object.values(data).flat()[0];
    if (firstFieldError) return firstFieldError;
  }
  return "Error updating profile";
};

function ProfileComponent({ data, isEditable, externalEditTrigger }) {
  const [isEditing, setIsEditing] = useState(false);
  const lastHandledTriggerRef = useRef(0);
  const { formData: profileData, handleFieldChange } = useFormState({
    about: data.profile?.about_me || "N/A",
    dob: normalizeDateForInput(data.profile?.date_of_birth),
    address: data.profile?.address || "XYZ",
    contactNumber: data.profile?.phone_no || "",
    mailId: data.current[0]?.user.email || "abc@gmail.com",
  });
  const calculatedAge = calculateAgeFromDob(profileData.dob);

  const handleEditClick = async () => {
    if (isEditing) {
      try {
        const normalizedContact = String(profileData.contactNumber || "")
          .replace(/\D/g, "")
          .trim();
        const normalizedDob = normalizeDateForApi(profileData.dob);

        if (!normalizedDob) {
          notifications.show({
            title: "Validation Error",
            message: "Date of Birth must be in YYYY-MM-DD or DD-MM-YYYY format.",
            color: "yellow",
          });
          return;
        }

        if (!normalizedContact) {
          notifications.show({
            title: "Validation Error",
            message: "Contact Number must contain digits.",
            color: "yellow",
          });
          return;
        }

        const payload = {
          profilesubmit: {
            about_me: profileData.about,
            date_of_birth: normalizedDob,
            address: profileData.address,
            phone_no: Number(normalizedContact),
          },
        };

        const response = await updateProfileSection(payload);

        if (response.status === 200) {
          notifications.show({
            title: "Success",
            message: "Profile updated successfully!",
            color: "green",
          });
          setIsEditing(false);
        } else {
          notifications.show({
            title: "Update Failed",
            message: "Failed to update profile",
            color: "red",
          });
        }
      } catch (error) {
        notifications.show({
          title: "Update Failed",
          message: formatApiError(error),
          color: "red",
        });
      }
      return;
    }
    setIsEditing(true);
  };

  useEffect(() => {
    if (!isEditable) return;
    if (externalEditTrigger <= 0) return;
    if (externalEditTrigger === lastHandledTriggerRef.current) return;

    lastHandledTriggerRef.current = externalEditTrigger;
    setIsEditing(true);
  }, [externalEditTrigger, isEditable]);

  return (
    <Flex
      w={{ base: "100%", sm: "60%" }}
      p="md"
      gap="md"
      style={{ border: "1px solid lightgray", borderRadius: "5px" }}
      direction="column"
      justify="space-evenly"
    >
      {/* About Me Section */}
      <Flex
        w="100%"
        p="md"
        direction="column"
        style={{ border: "1px solid lightgray", borderRadius: "5px" }}
      >
        <Text fw={500} size="1.2rem">
          About Me
        </Text>
        <Divider my="sm" />
        <Flex w="100%" justify="space-between" align="center">
          {isEditing ? (
            <TextInput
              value={profileData.about}
              onChange={(e) => handleFieldChange("about", e.target.value)}
              w="80%"
            />
          ) : (
            <Text>{profileData.about}</Text>
          )}
          {isEditable && (
            <Button
              onClick={handleEditClick}
              color={isEditing ? "green" : "red"}
            >
              {isEditing ? "Save" : "Edit"}
            </Button>
          )}
        </Flex>
      </Flex>

      {/* Details Section */}
      <Flex
        w="100%"
        p="md"
        direction="column"
        style={{ border: "1px solid lightgray", borderRadius: "5px" }}
      >
        <Text fw={500} size="1.2rem">
          Details
        </Text>
        <Divider my="sm" />
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td fw={500}>Date of Birth</Table.Td>
              <Table.Td>
                {isEditing ? (
                  <TextInput
                    type="date"
                    value={profileData.dob}
                    onChange={(e) => handleFieldChange("dob", e.target.value)}
                  />
                ) : (
                  profileData.dob
                )}
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={500}>Age</Table.Td>
              <Table.Td>{calculatedAge === "-" ? "-" : `${calculatedAge} years`}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={500}>Address</Table.Td>
              <Table.Td>
                {isEditing ? (
                  <TextInput
                    value={profileData.address}
                    onChange={(e) =>
                      handleFieldChange("address", e.target.value)
                    }
                  />
                ) : (
                  profileData.address
                )}
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Flex>

      {/* Contact Details Section */}
      <Flex
        w="100%"
        p="md"
        direction="column"
        style={{ border: "1px solid lightgray", borderRadius: "5px" }}
      >
        <Text fw={500} size="1.2rem">
          Contact Details
        </Text>
        <Divider my="sm" />
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td fw={500}>Contact Number</Table.Td>
              <Table.Td>
                {isEditing ? (
                  <TextInput
                    type="tel"
                    value={profileData.contactNumber}
                    onChange={(e) =>
                      handleFieldChange("contactNumber", e.target.value)
                    }
                  />
                ) : (
                  profileData.contactNumber
                )}
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={500}>Mail ID</Table.Td>
              <Table.Td>{profileData.mailId}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Flex>
    </Flex>
  );
}

ProfileComponent.propTypes = {
  data: PropTypes.shape({
    profile: PropTypes.shape({
      about_me: PropTypes.string,
      date_of_birth: PropTypes.string,
      address: PropTypes.string,
      phone_no: PropTypes.number,
    }),
    current: PropTypes.arrayOf(
      PropTypes.shape({
        user: PropTypes.shape({
          email: PropTypes.string,
        }),
      }),
    ),
  }),
  isEditable: PropTypes.bool.isRequired, // Added this line
  externalEditTrigger: PropTypes.number,
};

ProfileComponent.defaultProps = {
  externalEditTrigger: 0,
};
export default ProfileComponent;
