import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, Group, Modal, Stack, Text } from "@mantine/core";

const ActionConfirmationContext = createContext(null);

export function ActionConfirmationProvider({ children }) {
  const resolverRef = useRef(null);
  const [dialog, setDialog] = useState({
    opened: false,
    title: "Please Confirm",
    message: "",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    confirmColor: "red",
  });

  const closeDialog = useCallback((result) => {
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
    setDialog((prev) => ({ ...prev, opened: false }));
  }, []);

  const confirmAction = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({
        opened: true,
        title: options.title || "Please Confirm",
        message,
        confirmLabel: options.confirmLabel || "Confirm",
        cancelLabel: options.cancelLabel || "Cancel",
        confirmColor: options.confirmColor || "red",
      });
    });
  }, []);

  const value = useMemo(() => ({ confirmAction }), [confirmAction]);

  return (
    <ActionConfirmationContext.Provider value={value}>
      {children}
      <Modal
        opened={dialog.opened}
        onClose={() => closeDialog(false)}
        title={dialog.title}
        centered
        size="sm"
        withCloseButton
        withinPortal
        zIndex={10000}
      >
        <Stack spacing="md">
          <Text>{dialog.message}</Text>
          <Group position="right">
            <Button variant="default" onClick={() => closeDialog(false)}>
              {dialog.cancelLabel}
            </Button>
            <Button color={dialog.confirmColor} onClick={() => closeDialog(true)}>
              {dialog.confirmLabel}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </ActionConfirmationContext.Provider>
  );
}

export function useActionConfirmation() {
  const context = useContext(ActionConfirmationContext);
  if (!context) {
    throw new Error("useActionConfirmation must be used inside ActionConfirmationProvider");
  }
  return context;
}
