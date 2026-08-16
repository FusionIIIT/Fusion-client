import { createTheme } from "@mantine/core";

const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const WRAPPER_ORDER = ["label", "input", "description", "error"];

const INPUT_COMPONENTS = [
  "TextInput",
  "NumberInput",
  "Select",
  "MultiSelect",
  "Textarea",
  "TagsInput",
  "PasswordInput",
  "DateInput",
  "DateTimePicker",
  "Autocomplete",
];

const INPUT_DEFAULTS = Object.fromEntries(
  INPUT_COMPONENTS.map((name) => [
    name,
    { defaultProps: { inputWrapperOrder: WRAPPER_ORDER, size: "sm" } },
  ]),
);

export const theme = createTheme({
  primaryColor: "blue",
  primaryShade: { light: 6, dark: 5 },
  fontFamily: SANS,
  headings: { fontFamily: SANS, fontWeight: "600" },
  defaultRadius: "md",
  breakpoints: {
    xxs: "300px",
    xs: "375px",
    sm: "768px",
    md: "992px",
    lg: "1200px",
    xl: "1408px",
  },
  components: {
    Card: { defaultProps: { radius: "lg", withBorder: true, shadow: "sm" } },
    Paper: { defaultProps: { radius: "lg" } },
    Button: { defaultProps: { radius: "md" } },
    Table: { defaultProps: { highlightOnHover: true, verticalSpacing: "sm" } },
    Modal: {
      defaultProps: { radius: "lg", centered: true, overlayProps: { blur: 2 } },
    },
    ...INPUT_DEFAULTS,
  },
});

export const BRAND = Object.freeze({
  primary: "#15ABFF",
  dark: "#111111",
  danger: "#FA5252",
  surface: "#FFFFFF",
  surfaceAlt: "#F8F9FA",
  border: "#E9ECEF",
  gridLine: "#DEE2E6",
});
