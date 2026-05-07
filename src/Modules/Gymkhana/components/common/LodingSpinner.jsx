import { Loader, Center } from "@mantine/core";

function LoadingSpinner() {
  return (
    <Center style={{ height: "100%", minHeight: "200px" }}>
      <Loader size="lg" />
    </Center>
  );
}

export default LoadingSpinner;
