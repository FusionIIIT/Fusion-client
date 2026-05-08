// import {
//   Button,
//   FileInput,
//   Group,
//   Modal,
//   Select,
//   Stack,
//   Textarea,
// } from "@mantine/core";
// import PropTypes from "prop-types";

// const actionOptions = [
//   { value: "approve", label: "Approve" },
//   { value: "reject", label: "Reject" },
//   { value: "forward", label: "Forward" }, // ✅ added
// ];

// function AdminApprovalActionModal({
//   opened,
//   onClose,
//   onSubmit,
//   action,
//   setAction,
//   designationOptions,
//   designation,
//   setDesignation,
//   remarks,
//   setRemarks,
//   file = null,
//   setFile,
//   isSaving,
//   isReady,
// }) {
//   return (
//     <Modal opened={opened} onClose={onClose} title="IWD Admin Decision" centered>
//       <form onSubmit={onSubmit}>
//         <Stack>
//           {/* Action */}
//           <Select
//             label="Action"
//             data={actionOptions}
//             value={action}
//             onChange={(value) => {
//               setAction(value || "approve");

//               // Clear designation if not forwarding
//               if (value !== "forward") {
//                 setDesignation("");
//               }
//             }}
//             required
//           />

//           {/* Forward To (only when action = forward) */}
//           {action === "forward" && (
//             <Select
//               label="Forward To"
//               placeholder="Select designation and user"
//               data={designationOptions}
//               value={designation}
//               onChange={(value) => setDesignation(value || "")}
//               searchable
//               required
//             />
//           )}

//           {/* Remarks */}
//           <Textarea
//             label="Remarks"
//             value={remarks}
//             onChange={(event) => setRemarks(event.currentTarget.value)}
//             minRows={3}
//           />

//           {/* Attachment */}
//           <FileInput
//             label="Attachment"
//             value={file}
//             onChange={setFile}
//             clearable
//           />

//           {/* Submit */}
//           <Group justify="flex-end">
//             <Button type="submit" loading={isSaving} disabled={!isReady}>
//               Submit
//             </Button>
//           </Group>
//         </Stack>
//       </form>
//     </Modal>
//   );
// }

// AdminApprovalActionModal.propTypes = {
//   opened: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,
//   onSubmit: PropTypes.func.isRequired,
//   action: PropTypes.string.isRequired,
//   setAction: PropTypes.func.isRequired,
//   designationOptions: PropTypes.arrayOf(
//     PropTypes.shape({
//       label: PropTypes.string.isRequired,
//       value: PropTypes.string.isRequired,
//     })
//   ).isRequired,
//   designation: PropTypes.string.isRequired,
//   setDesignation: PropTypes.func.isRequired,
//   remarks: PropTypes.string.isRequired,
//   setRemarks: PropTypes.func.isRequired,
//   file: PropTypes.oneOfType([
//     PropTypes.instanceOf(File),
//     PropTypes.oneOf([null]),
//   ]),
//   setFile: PropTypes.func.isRequired,
//   isSaving: PropTypes.bool.isRequired,
//   isReady: PropTypes.bool.isRequired,
// };

// export default AdminApprovalActionModal;

import {
  Button,
  FileInput,
  Group,
  Modal,
  Select,
  Stack,
  Textarea,
} from "@mantine/core";
import PropTypes from "prop-types";

const actionOptions = [
  { value: "approve", label: "Approve" },
  { value: "reject", label: "Reject" },
  { value: "forward", label: "Forward" },
];

function AdminApprovalActionModal({
  opened,
  onClose,
  onSubmit,
  action,
  setAction,
  designationOptions,
  designation,
  setDesignation,
  remarks,
  setRemarks,
  file = null,
  setFile,
  isSaving,
  isReady,
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="IWD Admin Decision"
      centered
    >
      <form onSubmit={onSubmit}>
        <Stack>
          <Select
            label="Action"
            data={actionOptions}
            value={action}
            onChange={(value) => setAction(value || "approve")}
            required
          />

          {action === "forward" && (
            <Select
              label="Send To"
              placeholder="Select designation and user"
              data={designationOptions}
              value={designation}
              onChange={(value) => setDesignation(value || "")}
              searchable
              required
            />
          )}

          <Textarea
            label="Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.currentTarget.value)}
            minRows={3}
          />

          <FileInput
            label="Attachment"
            value={file}
            onChange={setFile}
            clearable
          />

          <Group justify="flex-end">
            <Button type="submit" loading={isSaving} disabled={!isReady}>
              Submit
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

AdminApprovalActionModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  action: PropTypes.string.isRequired,
  setAction: PropTypes.func.isRequired,
  designationOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }),
  ).isRequired,
  designation: PropTypes.string.isRequired,
  setDesignation: PropTypes.func.isRequired,
  remarks: PropTypes.string.isRequired,
  setRemarks: PropTypes.func.isRequired,
  file: PropTypes.oneOfType([
    PropTypes.instanceOf(File),
    PropTypes.oneOf([null]),
  ]),
  setFile: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
  isReady: PropTypes.bool.isRequired,
};

export default AdminApprovalActionModal;
