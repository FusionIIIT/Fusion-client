import ComplaintManager from "./components/ComplaintManager";

// Thin view that composes micro-components through ComplaintManager.
export default function ComplaintCreate() {
  return <ComplaintManager defaultMode="create" />;
}
